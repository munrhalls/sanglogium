// Build a combined broken/botched-product list from the Sanity-layer scanner
// outputs (.logs/identify-<category>.json) into the shape expected by
// scripts/fetch-replacement-images.mjs:
//   [{ name, slug: "/product/<handle>", ...meta }]
import fs from "node:fs";

const INPUTS = [
  { file: ".logs/identify-audio-electronics.json", category: "audio-electronics" },
  { file: ".logs/identify-accessories.json", category: "accessories" },
];
const OUTPUT = "broken-botched-combined.json";

const entries = [];
for (const { file, category } of INPUTS) {
  if (!fs.existsSync(file)) {
    console.error("SKIP missing input: " + file);
    continue;
  }
  const raw = fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "");
  const data = JSON.parse(raw);
  for (const b of data.botched || []) {
    entries.push({
      name: b.name,
      slug: "/product/" + b.slug,
      category,
      imageAssetRef: b.imageAssetRef,
      originalFilename: b.originalFilename,
      dimensions: b.dimensions,
      reasons: b.reasons,
    });
  }
}

fs.writeFileSync(OUTPUT, JSON.stringify(entries, null, 2), "utf8");
console.log("Wrote " + entries.length + " entries to " + OUTPUT);
const byCat = {};
for (const e of entries) byCat[e.category] = (byCat[e.category] || 0) + 1;
console.log(JSON.stringify(byCat));
