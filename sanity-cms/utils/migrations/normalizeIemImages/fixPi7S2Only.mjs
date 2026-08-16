import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { readClient } from "./getClient.mjs";
import { normalizeImageBufferManual } from "./imageNormalization.mjs";

// Scoped fix for Pi7 S2 only — see diagnosePi7S2.mjs for the trace proving
// this is a genuine geometry limit (true max fitting fill ratio at the
// shared 0.07 buffer is 27%, confirmed not a step-down-loop bug), and
// generateCandidatesV4.mjs's MANUAL_OVERRIDES entry, which these same
// values (65% fill ratio, 0.18 buffer) are also recorded in for future
// full regenerations. This script only touches Pi7 S2's file — the other
// 15 candidate files in public/normalization-main-images/ are untouched.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.resolve(__dirname, "../../../../public/normalization-main-images");

const FILL_RATIO_OVERRIDE = 65;
const TOP_MARGIN_BUFFER_OVERRIDE = 0.18;

const QUERY = `*[_id == "homepageData"][0].iemsGallery[]->{ _id, name, image { asset->{ _id, url } } }`;

function slugifyFilename(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

async function main() {
  const products = await readClient.fetch(QUERY);
  const pi7s2 = products.find((p) => /pi7 s2/i.test(p.name));
  if (!pi7s2) throw new Error("Pi7 S2 not found in iemsGallery");

  const res = await fetch(pi7s2.image.asset.url);
  const buffer = Buffer.from(await res.arrayBuffer());

  const result = await normalizeImageBufferManual(buffer, FILL_RATIO_OVERRIDE, TOP_MARGIN_BUFFER_OVERRIDE);

  const filename = `${slugifyFilename(pi7s2.name)}-${pi7s2.image.asset._id}.png`;
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.writeFile(path.join(OUTPUT_DIR, filename), result.buffer);

  console.log(`✅ Pi7 S2 regenerated: fillRatio=${result.appliedFillRatio}%, topMarginBuffer=${result.topMarginBuffer}, newSize=${result.newWidth}x${result.newHeight}, top=${result.top}, left=${result.left}`);
  console.log(`📁 Written: ${path.join(OUTPUT_DIR, filename)}`);

  const files = await fs.readdir(OUTPUT_DIR);
  const pngCount = files.filter((f) => f.endsWith(".png")).length;
  console.log(`\n16/16 assertion check: ${pngCount} candidate files in ${OUTPUT_DIR}`);
  if (pngCount !== 16) {
    throw new Error(`ASSERTION FAILED: expected 16 candidate files, found ${pngCount}.`);
  }
  console.log("✅ 16/16 confirmed — no other file touched or removed.");
}

main().catch((err) => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});
