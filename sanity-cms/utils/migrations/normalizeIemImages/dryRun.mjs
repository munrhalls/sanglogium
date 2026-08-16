import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import { readClient } from "./getClient.mjs";
import {
  measureImageBuffer,
  normalizeImageBuffer,
  evaluateSelfPass,
  evaluateCrossSetPass,
  median,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  TARGET_FILL_RATIO,
  TOP_MARGIN_BUFFER,
  FILL_RATIO_FLOOR,
  FILL_RATIO_STEP,
} from "./imageNormalization.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CANDIDATES_DIR = path.join(__dirname, "candidates");
const CONTACT_SHEET_PATH = path.join(__dirname, "contact-sheet.png");
const COLS = 4;
const MIN_BUCKET_SAMPLE = 3;

// Read-only: pulls exactly the iemsGallery section as queried in
// sanity-cms/lib/homepage/getHomepageData.ts (HOMEPAGE_DATA_QUERY).
// Filters to the published homepageData doc, not the draft.
// No visibility filter — every product in iemsGallery is normalized
// regardless of IemCard.tsx's isTemporarilyVisible/hidden logic.
const IEMS_GALLERY_QUERY = `*[_id == "homepageData"][0].iemsGallery[]->{
  _id,
  name,
  "slug": slug.current,
  image { asset->{ _id, url } }
}`;

function slugifyFilename(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

async function fetchImageBuffer(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch image: ${res.status} ${url}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

function printPhase0Spec() {
  console.log("=".repeat(90));
  console.log("PHASE 0 — Derived target frame (from app/components/features/homepage/iems-gallery/IemCard.tsx)");
  console.log("=".repeat(90));
  console.log(`
Rendered image slot: the outer container is "aspect-[4/3] w-full ... flex items-center
justify-center". The <Image> inside is sized "h-[70%] w-[70%] ... xs:h-[60%] xs:w-[60%]"
with "object-contain object-center" — height and width always use the SAME percentage
of the container at every breakpoint, so the slot's aspect ratio is always 4:3,
matching the container itself, regardless of breakpoint. object-fit is CONTAIN, not
cover — no cropping happens at render time.

     CANVAS_WIDTH  = ${CANVAS_WIDTH}px
     CANVAS_HEIGHT = ${CANVAS_HEIGHT}px
     aspect ratio  = 4:3 (matches IemCard's slot exactly)

   TARGET_FILL_RATIO = ${TARGET_FILL_RATIO}% of the canvas's matching side (nominal — see
                        per-product capping below)

   Anchor rule is a DERIVED FORMULA, not a fixed number (v2 hardcoded 78%, which is
   mathematically incompatible with an 83%-tall object — this version fixes that class
   of bug, not just this one instance):

       anchor_y_fraction = applied_fill_fraction + TOP_MARGIN_BUFFER
       TOP_MARGIN_BUFFER = ${TOP_MARGIN_BUFFER}  (empirically validated in the v2 dry run:
                                     0.83 + 0.07 = 0.90, ~7% top / ~10% bottom margin,
                                     confirmed not to overflow)

   Per-product safety cap: if the derived anchor would push any edge outside the
   canvas, that product's fill ratio is stepped down by ${FILL_RATIO_STEP}pp at a time
   (recomputing its anchor each step) until it fits, floor ${FILL_RATIO_FLOOR}%. Below the
   floor, the product is flagged failed rather than degraded further.
`);
  console.log("=".repeat(90) + "\n");
}

async function buildContactSheet(portraitEntries, landscapeEntries) {
  const THUMB_W = 300;
  const THUMB_H = Math.round(THUMB_W * (CANVAS_HEIGHT / CANVAS_WIDTH));
  const LABEL_H = 24;
  const HEADER_H = 30;
  const CELL_W = THUMB_W;
  const CELL_H = THUMB_H + LABEL_H;
  const PAD = 8;

  // Pad portrait group to a full row so landscape starts on its own row —
  // that's the "grouped visually by bucket" requirement.
  const paddedPortrait = [...portraitEntries];
  while (paddedPortrait.length % COLS !== 0) paddedPortrait.push(null);

  const groups = [
    { label: `PORTRAIT (n=${portraitEntries.length})`, entries: paddedPortrait },
    { label: `LANDSCAPE (n=${landscapeEntries.length})`, entries: landscapeEntries },
  ].filter((g) => g.entries.length > 0);

  const totalRows = groups.reduce((sum, g) => sum + Math.ceil(g.entries.length / COLS), 0);
  const sheetW = COLS * CELL_W + (COLS + 1) * PAD;
  const sheetH = groups.length * HEADER_H + totalRows * CELL_H + (totalRows + groups.length) * PAD;

  const composites = [];
  let y = PAD;

  for (const group of groups) {
    const headerSvg = Buffer.from(
      `<svg width="${sheetW}" height="${HEADER_H}" xmlns="http://www.w3.org/2000/svg">
        <text x="4" y="20" font-size="18" fill="#EEE" font-family="monospace" font-weight="bold">${group.label}</text>
      </svg>`
    );
    composites.push({ input: headerSvg, left: 0, top: y });
    y += HEADER_H;

    for (let i = 0; i < group.entries.length; i++) {
      const entry = group.entries[i];
      const col = i % COLS;
      if (col === 0 && i !== 0) y += CELL_H + PAD;
      const x = PAD + col * (CELL_W + PAD);

      if (entry) {
        const { buffer, label, pass } = entry;
        const thumb = await sharp(buffer).resize(THUMB_W, THUMB_H, { fit: "fill" }).png().toBuffer();
        composites.push({ input: thumb, left: x, top: y });

        const safeLabel = label.replace(/[<>&]/g, "");
        const labelSvg = Buffer.from(
          `<svg width="${THUMB_W}" height="${LABEL_H}" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="#111"/>
            <text x="4" y="16" font-size="12" fill="${pass ? "#7CFC7C" : "#FF7C7C"}" font-family="monospace">${safeLabel}</text>
          </svg>`
        );
        composites.push({ input: labelSvg, left: x, top: y + THUMB_H });
      }
    }
    y += CELL_H + PAD;
  }

  await sharp({
    create: { width: sheetW, height: Math.max(sheetH, y), channels: 4, background: { r: 30, g: 30, b: 30, alpha: 1 } },
  })
    .composite(composites)
    .png()
    .toFile(CONTACT_SHEET_PATH);
}

async function main() {
  console.log("Phase 1 dry run (v3) — normalize IEM gallery main images (no writes)\n");

  printPhase0Spec();

  await fs.mkdir(CANDIDATES_DIR, { recursive: true });

  const products = await readClient.fetch(IEMS_GALLERY_QUERY);
  console.log(`Found ${products.length} products in iemsGallery.\n`);

  const rows = [];
  const notes = [];

  for (const product of products) {
    const assetUrl = product.image?.asset?.url;
    const assetId = product.image?.asset?._id;

    if (!assetUrl) {
      rows.push({ name: product.name, id: product._id, note: "SKIPPED — no image.asset.url on this product", overallPass: false });
      continue;
    }

    try {
      const sourceBuffer = await fetchImageBuffer(assetUrl);
      const result = await normalizeImageBuffer(sourceBuffer);

      if (result.failed) {
        rows.push({
          name: product.name,
          id: product._id,
          bucket: result.bucket,
          beforeFill: result.before.metrics.fillRatio,
          note: `FAILED — ${result.reason}`,
          overallPass: false,
        });
        notes.push(`${product.name}: ${result.reason}`);
        continue;
      }

      const after = await measureImageBuffer(result.buffer, { anchorYFraction: result.anchorYFraction });
      const selfResult = evaluateSelfPass(after.metrics, result.appliedFillRatio);

      let note = "";
      if (!result.before.hasAlpha) {
        note = result.before.ambiguousBackground
          ? "NO ALPHA CHANNEL — corner colors disagree, background sampling is AMBIGUOUS, treat this measurement as uncertain"
          : "NO ALPHA CHANNEL — background inferred from corner sampling";
        notes.push(`${product.name}: ${note}`);
      }
      if (result.capped) {
        const cappedNote = `FILL RATIO CAPPED: ${TARGET_FILL_RATIO}% -> ${result.appliedFillRatio}% (${result.cappedSteps} step(s)) to keep product region inside the shared canvas`;
        note = note ? `${note}; ${cappedNote}` : cappedNote;
        notes.push(`${product.name}: ${cappedNote}`);
      }

      const outFilename = `${slugifyFilename(product.name)}-${assetId}-normalized.png`;
      const outPath = path.join(CANDIDATES_DIR, outFilename);
      await fs.writeFile(outPath, result.buffer);

      rows.push({
        name: product.name,
        id: product._id,
        bucket: result.bucket,
        appliedFillRatio: result.appliedFillRatio,
        capped: result.capped,
        beforeFill: result.before.metrics.fillRatio,
        afterFill: after.metrics.fillRatio,
        leftMargin: after.metrics.leftMargin,
        rightMargin: after.metrics.rightMargin,
        topMargin: after.metrics.topMargin,
        bottomMargin: after.metrics.bottomMargin,
        centerOffsetX: after.metrics.centerOffsetX,
        baseAnchorOffset: after.metrics.baseAnchorOffset,
        fillPass: selfResult.fillPass,
        marginPass: selfResult.marginPass,
        anchorPass: selfResult.anchorPass,
        candidatePath: outPath,
        candidateBuffer: result.buffer,
        note,
      });
    } catch (err) {
      rows.push({ name: product.name, id: product._id, note: `ERROR — ${err.message}`, overallPass: false });
    }
  }

  // --- Phase 0b bucket sizes ---
  const bucketed = rows.filter((r) => r.bucket);
  const portraitAll = bucketed.filter((r) => r.bucket === "portrait");
  const landscapeAll = bucketed.filter((r) => r.bucket === "landscape");
  console.log("PHASE 0b — Orientation buckets (by original bbox aspect ratio, before scaling):");
  bucketed.forEach((r) => console.log(`   ${r.bucket.padEnd(10)} ${r.name}`));
  console.log(`\nBucket sizes: portrait=${portraitAll.length}, landscape=${landscapeAll.length}`);
  const lowConfidenceBuckets = [];
  if (portraitAll.length > 0 && portraitAll.length < MIN_BUCKET_SAMPLE) lowConfidenceBuckets.push("portrait");
  if (landscapeAll.length > 0 && landscapeAll.length < MIN_BUCKET_SAMPLE) lowConfidenceBuckets.push("landscape");
  if (lowConfidenceBuckets.length > 0) {
    console.log(
      `LOW CONFIDENCE: bucket(s) [${lowConfidenceBuckets.join(", ")}] have fewer than ${MIN_BUCKET_SAMPLE} members — their median is not a reliable reference.`
    );
  }
  console.log("");

  // --- Cross-set margin consistency: medians computed WITHIN each bucket ---
  const successful = rows.filter((r) => r.candidateBuffer);
  function bucketMedians(bucketName) {
    const members = successful.filter((r) => r.bucket === bucketName);
    if (members.length === 0) return null;
    return {
      leftMargin: median(members.map((r) => r.leftMargin)),
      rightMargin: median(members.map((r) => r.rightMargin)),
      topMargin: median(members.map((r) => r.topMargin)),
      bottomMargin: median(members.map((r) => r.bottomMargin)),
    };
  }
  const mediansByBucket = { portrait: bucketMedians("portrait"), landscape: bucketMedians("landscape") };

  for (const row of successful) {
    const medians = mediansByBucket[row.bucket];
    const crossResult = evaluateCrossSetPass(row, medians);
    row.crossSetPass = crossResult.crossSetPass;
    row.overallPass = row.fillPass && row.marginPass && row.anchorPass && row.crossSetPass;
  }

  for (const [bucketName, m] of Object.entries(mediansByBucket)) {
    if (m) {
      console.log(
        `${bucketName} medians (n=${successful.filter((r) => r.bucket === bucketName).length}) — left: ${m.leftMargin.toFixed(1)}%  right: ${m.rightMargin.toFixed(1)}%  top: ${m.topMargin.toFixed(1)}%  bottom: ${m.bottomMargin.toFixed(1)}%`
      );
    }
  }
  console.log("");

  // --- Contact sheet, grouped by bucket ---
  const toEntry = (r) => ({
    buffer: r.candidateBuffer,
    label: `${r.overallPass ? "PASS" : "FAIL"} ${r.name.slice(0, 28)}`,
    pass: r.overallPass,
  });
  await buildContactSheet(
    successful.filter((r) => r.bucket === "portrait").map(toEntry),
    successful.filter((r) => r.bucket === "landscape").map(toEntry)
  );

  console.log("=".repeat(160));
  console.log(
    "Product".padEnd(38) +
      "Bucket".padEnd(11) +
      "Before".padEnd(9) +
      "After".padEnd(14) +
      "Fill".padEnd(7) +
      "SelfMarg".padEnd(10) +
      "CrossSet".padEnd(10) +
      "Anchor".padEnd(8) +
      "Overall".padEnd(9) +
      "Note"
  );
  console.log("=".repeat(160));

  let passCount = 0;
  for (const row of rows) {
    const beforeStr = row.beforeFill != null ? row.beforeFill.toFixed(1) + "%" : "n/a";
    const afterStr = row.afterFill != null ? row.afterFill.toFixed(1) + (row.capped ? "%*" : "%") : "n/a";
    const fillStr = row.candidateBuffer ? (row.fillPass ? "PASS" : "FAIL") : "-";
    const marginStr = row.candidateBuffer ? (row.marginPass ? "PASS" : "FAIL") : "-";
    const crossStr = row.candidateBuffer ? (row.crossSetPass ? "PASS" : "FAIL") : "-";
    const anchorStr = row.candidateBuffer ? (row.anchorPass ? "PASS" : "FAIL") : "-";
    const overallStr = row.overallPass ? "PASS" : "FAIL";
    if (row.overallPass) passCount++;

    console.log(
      row.name.slice(0, 37).padEnd(38) +
        (row.bucket || "-").padEnd(11) +
        beforeStr.padEnd(9) +
        afterStr.padEnd(14) +
        fillStr.padEnd(7) +
        marginStr.padEnd(10) +
        crossStr.padEnd(10) +
        anchorStr.padEnd(8) +
        overallStr.padEnd(9) +
        (row.note || "")
    );
  }
  console.log("=".repeat(160));
  console.log("(* = fill ratio was capped below the 83% nominal target for this product; see notes)\n");
  console.log(`${passCount} of ${rows.length} passed.\n`);

  if (notes.length > 0) {
    console.log("Uncertainty / attention notes:");
    notes.forEach((n) => console.log(`   - ${n}`));
    console.log("");
  }

  const cappedRows = rows.filter((r) => r.capped);
  if (cappedRows.length > 0) {
    console.log("Products that hit the fill-ratio floor cap:");
    cappedRows.forEach((r) => console.log(`   - ${r.name} (${r.id}): ${TARGET_FILL_RATIO}% -> ${r.appliedFillRatio}%`));
    console.log("");
  }

  const failing = rows.filter((r) => !r.overallPass);
  if (failing.length > 0) {
    console.log("Products that did NOT pass all four checks — candidates for a real content decision");
    console.log("(re-crop/re-shoot source photo), not for further tolerance loosening:");
    failing.forEach((r) => {
      if (!r.candidateBuffer) {
        console.log(`   - ${r.name} (${r.id}): ${r.note || "no candidate generated"}`);
        return;
      }
      const parts = [];
      if (!r.fillPass) parts.push(`fill=${r.afterFill.toFixed(1)}% vs applied target ${r.appliedFillRatio}% (need within 2pp)`);
      if (!r.marginPass) parts.push(`self L/R margin diff=${Math.abs(r.leftMargin - r.rightMargin).toFixed(1)}pp (need <=2pp)`);
      if (!r.crossSetPass) {
        const m = mediansByBucket[r.bucket];
        const deltas = [
          ["left", r.leftMargin, m.leftMargin],
          ["right", r.rightMargin, m.rightMargin],
          ["top", r.topMargin, m.topMargin],
          ["bottom", r.bottomMargin, m.bottomMargin],
        ]
          .filter(([, v, med]) => Math.abs(v - med) > 2)
          .map(([side, v, med]) => `${side}=${v.toFixed(1)}% vs ${r.bucket} median ${med.toFixed(1)}% (Δ${Math.abs(v - med).toFixed(1)}pp)`)
          .join(", ");
        parts.push(`in-bucket(${r.bucket}) margin off-median: ${deltas}`);
      }
      if (!r.anchorPass) parts.push(`centerOffsetX=${r.centerOffsetX.toFixed(1)}% baseAnchorOffset=${r.baseAnchorOffset.toFixed(1)}% (need <=2% each)`);
      console.log(`   - ${r.name} (${r.id}): ${parts.join("; ")}${r.note ? ` [${r.note}]` : ""}`);
    });
    console.log("");
  }

  console.log(`Candidates written to: ${CANDIDATES_DIR}`);
  console.log(`Contact sheet (grouped by bucket): ${CONTACT_SHEET_PATH}`);
  console.log("Phase 1 complete. Review this report before running Phase 2 (PRODUCTION_patchPhased.mjs).");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
