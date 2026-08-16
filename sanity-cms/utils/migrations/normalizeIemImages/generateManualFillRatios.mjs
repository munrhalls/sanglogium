import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import { readClient } from "./getClient.mjs";
import { measureImageBuffer, CANVAS_WIDTH, CANVAS_HEIGHT } from "./imageNormalization.mjs";

// v8 — replaces the entire v4-v6 density/calibration/anchor-formula chain
// with a flat, human-picked fill ratio per product and plain centering
// (bbox center = canvas center, on both axes). No density measurement, no
// calibration group, no quadratic solve, no ceiling/floor clamp, no
// step-down search — none of that runs here. Centering by construction
// cannot overflow the canvas for any fill ratio <= 100%, so the whole class
// of bug that produced Pi7 S2's 27% capped-low result cannot occur.
//
// v9 — closed two gaps left by v8's visual review, still by-eye, still no
// new detection logic:
//   - JBL Tour Pro 2 / Sony Linkbuds Fit read undersized next to the B&W
//     cluster -> raised fill ratio.
//   - Moondrop Alice / Sennheiser Momentum Sport / Sony WF-1000XM5 /
//     Sony WF-G700N are case+separate-part shots where visual weight isn't
//     even across the bbox, so a geometrically-centered bbox doesn't read
//     as centered -> added `offset` (percent of canvas width, +right/-left),
//     applied as a plain post-scale translation, set by eye. 0 for every
//     product that already looked centered.
//   - Final Audio ZE8000 is an accepted exception: a three-quarter-angle
//     photo, structurally different composition from the rest of the set.
//     No fill-ratio or offset value makes it match; not chased further.
//
// This table is the entire tuning surface. Edit a number, rerun, refresh
// http://localhost:3000/normalization, repeat until it looks right.
const PRODUCTS = {
  "bose-quietcomfort-ultra-wireless-noise-cancelling-earbuds-20": { fillRatio: 87, offset: 0 },
  "bowers-wilkins-pi5-true-wireless-earbuds": { fillRatio: 90, offset: 0 },
  "bowers-wilkins-pi6-in-ear-bluetooth-wireless-earbuds-cloud-g": { fillRatio: 80, offset: 0 },
  "bowers-wilkins-pi7-s2-wireless-in-ear-headphones": { fillRatio: 67, offset: 0 },
  "bowers-wilkins-pi7-true-wireless-noise-cancelling-in-ear-hea": { fillRatio: 90, offset: 0 },
  "bowers-wilkins-pi8-in-ear-bluetooth-true-wireless-earbuds-do": { fillRatio: 80, offset: 0 },
  "bowers-wilkins-pi8-in-ear-bluetooth-true-wireless-earbuds-ja": { fillRatio: 80, offset: 0 },
  "final-audio-ze8000-true-wireless-in-ear-headphones": { fillRatio: 100, offset: 0 }, // accepted exception — sparse/multi-part shape, final value, do not iterate further.
  "jbl-tour-pro-2-true-wireless-in-ear-headphones": { fillRatio: 96, offset: 0 },
  "moondrop-alice-true-wireless-in-ear-headphones": { fillRatio: 90, offset: -2 },
  "noble-audio-fokus-rex5-true-wireless-in-ear-headphones": { fillRatio: 85, offset: 0 },
  "sennheiser-momentum-sport-true-wireless-earbuds-with-adaptiv": { fillRatio: 80, offset: 4 },
  "sony-linkbuds-fit-truly-wireless-noise-cancelling-earbuds-bl": { fillRatio: 100, offset: 0 },
  "sony-wf-1000xm5-wireless-noise-cancelling-in-ear-headphone-b": { fillRatio: 100, offset: 2 }, // accepted exception — sparse/multi-part shape, final value, do not iterate further.
  "sony-wf-g700n-inzone-buds-truly-wireless-noise-cancelling-ea": { fillRatio: 100, offset: 2 },
  "sony-wfl910-linkbuds-truly-wireless-earbuds-black": { fillRatio: 100, offset: 0 },
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.resolve(__dirname, "../../../../public/normalization-main-images");

const IEMS_GALLERY_QUERY = `*[_id == "homepageData"][0].iemsGallery[]->{
  _id,
  name,
  image { asset->{ _id, url } }
}`;

function slugifyFilename(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

// Crop to the foreground bbox, scale so the bbox's longer side hits
// fillRatioPercent of the matching canvas side, center on both axes, then
// nudge horizontally by offsetPercent (percent of canvas width, +right/
// -left) — a plain translation applied after centering, nothing derived.
// Reuses the existing bbox/foreground-detection code via measureImageBuffer
// — that part is unchanged. Everything after it is new and much shorter.
async function compositeCentered(buffer, fillRatioPercent, offsetPercent = 0) {
  const before = await measureImageBuffer(buffer);
  const { bbox, hasAlpha, background } = before;

  const cropWidth = bbox.maxX - bbox.minX + 1;
  const cropHeight = bbox.maxY - bbox.minY + 1;

  const f = fillRatioPercent / 100;
  const scale =
    cropWidth >= cropHeight ? (f * CANVAS_WIDTH) / cropWidth : (f * CANVAS_HEIGHT) / cropHeight;
  const newWidth = Math.max(1, Math.round(cropWidth * scale));
  const newHeight = Math.max(1, Math.round(cropHeight * scale));

  let resizedProductBuffer = await sharp(buffer)
    .ensureAlpha()
    .extract({ left: bbox.minX, top: bbox.minY, width: cropWidth, height: cropHeight })
    .resize(newWidth, newHeight, { kernel: sharp.kernel.lanczos3, fit: "fill" })
    .png()
    .toBuffer();

  // sharp refuses to composite a layer larger than the canvas at all, so at
  // high fill ratios on non-4:3 bboxes the scaled product can overflow one
  // axis. Allow that: crop the overflow off symmetrically (centered) before
  // compositing, rather than avoiding those fill ratios entirely. No-op for
  // every product that doesn't overflow.
  let placedWidth = newWidth;
  let placedHeight = newHeight;
  if (newWidth > CANVAS_WIDTH || newHeight > CANVAS_HEIGHT) {
    placedWidth = Math.min(newWidth, CANVAS_WIDTH);
    placedHeight = Math.min(newHeight, CANVAS_HEIGHT);
    const cropLeft = Math.round((newWidth - placedWidth) / 2);
    const cropTop = Math.round((newHeight - placedHeight) / 2);
    resizedProductBuffer = await sharp(resizedProductBuffer)
      .extract({ left: cropLeft, top: cropTop, width: placedWidth, height: placedHeight })
      .png()
      .toBuffer();
  }

  const left = Math.round((CANVAS_WIDTH - placedWidth) / 2 + (offsetPercent / 100) * CANVAS_WIDTH);
  const top = Math.round((CANVAS_HEIGHT - placedHeight) / 2);

  const canvasBackground = hasAlpha
    ? { r: 0, g: 0, b: 0, alpha: 0 }
    : { r: background.r, g: background.g, b: background.b, alpha: 1 };

  const outBuffer = await sharp({
    create: { width: CANVAS_WIDTH, height: CANVAS_HEIGHT, channels: 4, background: canvasBackground },
  })
    .composite([{ input: resizedProductBuffer, left, top }])
    .png()
    .toBuffer();

  return { buffer: outBuffer, newWidth, newHeight, left, top };
}

// Optional CLI args restrict which products get regenerated (by slug), e.g.
// `node generateManualFillRatios.mjs jbl-tour-pro-2-true-wireless-in-ear-headphones`.
// No args = regenerate all 16 (still cheap, per the original spec).
const onlySlugs = process.argv.slice(2);

async function main() {
  console.log("🎯 v9 Generate — flat manual fill ratios + plain centering + per-product offset (read-only against Sanity, no writes)\n");
  if (onlySlugs.length > 0) {
    console.log(`   Restricting this run to: ${onlySlugs.join(", ")}\n`);
  }

  const products = await readClient.fetch(IEMS_GALLERY_QUERY);
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const rows = [];
  for (const product of products) {
    const assetId = product.image?.asset?._id;
    const url = product.image?.asset?.url;
    if (!assetId || !url) {
      console.log(`⚪ Skipping "${product.name}" — no main image asset on document.`);
      continue;
    }

    const slug = slugifyFilename(product.name);
    const entry = PRODUCTS[slug];
    if (entry == null) {
      throw new Error(`No entry for "${product.name}" (slug "${slug}") in PRODUCTS — add one.`);
    }
    const { fillRatio, offset } = entry;
    if (fillRatio < 40 || fillRatio > 100) {
      throw new Error(`Fill ratio for "${product.name}" is ${fillRatio}% — out of the 40-100% range.`);
    }

    if (onlySlugs.length > 0 && !onlySlugs.includes(slug)) {
      rows.push({ name: product.name, slug, fillRatio, offset, filename: `${slug}-${assetId}.png`, skipped: true });
      continue;
    }

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch "${product.name}": ${res.status} ${res.statusText}`);
    const buffer = Buffer.from(await res.arrayBuffer());

    const result = await compositeCentered(buffer, fillRatio, offset);
    const filename = `${slug}-${assetId}.png`;
    await fs.writeFile(path.join(OUTPUT_DIR, filename), result.buffer);

    rows.push({ name: product.name, slug, fillRatio, offset, filename });
  }

  console.log("\n========== FILL RATIO + OFFSET TABLE (complete record of every visual decision) ==========");
  console.log("Fill%".padEnd(7) + "Offset".padEnd(9) + "Product slug");
  for (const r of rows) {
    console.log(
      `${r.fillRatio}%`.padEnd(7) + `${r.offset > 0 ? "+" : ""}${r.offset}%`.padEnd(9) + r.slug
    );
  }
  console.log("-".repeat(70));

  if (rows.length !== 16) {
    throw new Error(`ASSERTION FAILED: expected 16 candidates accounted for, got ${rows.length}.`);
  }
  const written = rows.filter((r) => !r.skipped).length;
  console.log(`\n✅ ${written}/16 candidates regenerated this run (${rows.length - written} left untouched, not in scope for this run).`);
  console.log("👀 Refresh http://localhost:3000/normalization and review the live grid.");
  console.log("🛑 No Sanity writes performed.");
}

main().catch((err) => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});
