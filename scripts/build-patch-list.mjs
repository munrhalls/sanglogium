// Build the patch list (28 products with replacement images) from the two
// fetch result JSONs into the shape the patch script expects.
import fs from "node:fs";

const SOURCES = [
  "scripts/replacement-images-combined-result.json",
  "scripts/replacement-images-mapped-result.json",
];
const OUTPUT = "broken-botched-patch-list.json";

const entries = [];
for (const f of SOURCES) {
  if (!fs.existsSync(f)) continue;
  const list = JSON.parse(fs.readFileSync(f, "utf8"));
  for (const e of list) {
    if (e.status === "OK") {
      entries.push({ name: e.name, slug: e.slug, sourceUrl: e.sourceUrl, localPath: e.localPath });
    }
  }
}

fs.writeFileSync(OUTPUT, JSON.stringify(entries, null, 2), "utf8");
console.log("Wrote " + entries.length + " entries to " + OUTPUT);
