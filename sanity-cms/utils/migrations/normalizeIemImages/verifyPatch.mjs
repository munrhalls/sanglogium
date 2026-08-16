import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { readClient } from "./getClient.mjs";

// Standalone re-verification: given an asset_mapping_iemsGallery_*.json file
// produced by PRODUCTION_patchPhased.mjs, re-fetch each product from Sanity
// and confirm image.asset._ref still matches the recorded new asset.
//
// Usage: node verifyPatch.mjs asset_mapping_iemsGallery_<timestamp>.json

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BACKUPS_DIR = path.resolve(__dirname, "../../../backups");

async function main() {
  const mappingArg = process.argv[2];
  if (!mappingArg) {
    console.error("Usage: node verifyPatch.mjs <asset_mapping_iemsGallery_TIMESTAMP.json>");
    process.exit(1);
  }

  const mappingPath = path.isAbsolute(mappingArg) ? mappingArg : path.join(BACKUPS_DIR, mappingArg);
  const mapping = JSON.parse(await fs.readFile(mappingPath, "utf-8"));

  console.log(`🕵️  Verifying ${mapping.length} patched product(s) against: ${mappingPath}\n`);
  console.log("=".repeat(90));
  console.log("Product".padEnd(45) + "Status".padEnd(15) + "Live Asset ID");
  console.log("=".repeat(90));

  let passed = 0;
  for (const item of mapping) {
    const live = await readClient.fetch(`*[_id == $id][0]{ "assetId": image.asset._ref }`, {
      id: item.productId,
    });
    const matches = live?.assetId === item.newAssetId;
    if (matches) passed++;
    console.log(
      item.name.slice(0, 44).padEnd(45) +
        (matches ? "✅ MATCH" : "❌ MISMATCH").padEnd(15) +
        (live?.assetId || "MISSING")
    );
  }
  console.log("=".repeat(90));
  console.log(`\n${passed} of ${mapping.length} confirmed.`);
}

main().catch((err) => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});
