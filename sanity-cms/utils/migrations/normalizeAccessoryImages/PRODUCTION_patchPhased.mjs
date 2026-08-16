import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { readClient, writeClient } from "../normalizeIemImages/getClient.mjs";
import { measureImageBuffer, evaluatePass } from "../normalizeIemImages/imageNormalization.mjs";
import catalogueIndex from "../../../../data/catalogue-index.json" with { type: "json" };

// ⚠️ WRITES TO PRODUCTION SANITY DATASET. Only run after the Phase 1
// dry-run report (dryRun.mjs) has been reviewed and confirmed.
// Runs non-interactively: no backup step, no confirmation prompt.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CANDIDATES_DIR = path.join(__dirname, "candidates");
const OUTPUT_DIR = path.resolve(__dirname, "../../../backups");

const CATEGORY_SLOTS = [
  { paramKey: "cablesId", slug: "headphone-cables" },
  { paramKey: "interconnectsId", slug: "interconnects" },
  { paramKey: "adaptersId", slug: "adapters" },
  { paramKey: "earpadsId", slug: "earpads" },
  { paramKey: "eartipsId", slug: "eartips" },
  { paramKey: "careCleaningId", slug: "care-cleaning" },
  { paramKey: "storageStandsId", slug: "headphone-stands" },
  { paramKey: "carryingCasesId", slug: "carrying-cases" },
];

function resolveSlugToId(slug) {
  return catalogueIndex.slugToIdMap[slug];
}

function slugifyFilename(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

async function main() {
  console.log("🚀 Phase 2 — Patch normalized Accessories main images into Sanity (WRITES)\n");

  const slotIds = {};
  for (const slot of CATEGORY_SLOTS) {
    const id = resolveSlugToId(slot.slug);
    if (!id) throw new Error(`resolveSlugToId returned undefined for "${slot.slug}"`);
    slotIds[slot.paramKey] = id;
  }

  const query = `{
    "cables": *[_type == "product" && $cablesId in catalogueLocationKeys] { _id, name, image { asset->{ _id, url } } },
    "interconnects": *[_type == "product" && $interconnectsId in catalogueLocationKeys] { _id, name, image { asset->{ _id, url } } },
    "adapters": *[_type == "product" && $adaptersId in catalogueLocationKeys] { _id, name, image { asset->{ _id, url } } },
    "earpads": *[_type == "product" && $earpadsId in catalogueLocationKeys] { _id, name, image { asset->{ _id, url } } },
    "eartips": *[_type == "product" && $eartipsId in catalogueLocationKeys] { _id, name, image { asset->{ _id, url } } },
    "careCleaning": *[_type == "product" && $careCleaningId in catalogueLocationKeys] { _id, name, image { asset->{ _id, url } } },
    "storage": *[_type == "product" && ($storageStandsId in catalogueLocationKeys || $carryingCasesId in catalogueLocationKeys)] { _id, name, image { asset->{ _id, url } } }
  }`;

  const result = await readClient.fetch(query, slotIds);

  const byId = new Map();
  for (const items of Object.values(result)) {
    for (const item of items) {
      if (!byId.has(item._id)) byId.set(item._id, item);
    }
  }
  const products = Array.from(byId.values());

  console.log(`📦 Found ${products.length} unique products across 7 accessory categories.\n`);

  const queue = [];
  const skipped = [];

  for (const product of products) {
    const assetId = product.image?.asset?._id;
    if (!assetId) {
      skipped.push({ id: product._id, name: product.name, reason: "no image.asset on document" });
      continue;
    }

    const candidateFilename = `${slugifyFilename(product.name)}-${assetId}-normalized.png`;
    const candidatePath = path.join(CANDIDATES_DIR, candidateFilename);

    let candidateBuffer;
    try {
      candidateBuffer = await fs.readFile(candidatePath);
    } catch {
      skipped.push({
        id: product._id,
        name: product.name,
        reason: `candidate file not found (run dryRun.mjs first): ${candidatePath}`,
      });
      continue;
    }

    const after = await measureImageBuffer(candidateBuffer);
    const passResult = evaluatePass(after.metrics);

    if (!passResult.overallPass) {
      skipped.push({
        id: product._id,
        name: product.name,
        reason: `candidate did not pass (fill=${after.metrics.fillRatio.toFixed(1)}%, marginH=${after.metrics.marginEvennessH.toFixed(1)}pp, marginV=${after.metrics.marginEvennessV.toFixed(1)}pp, centerX=${after.metrics.centerOffsetX.toFixed(1)}%, centerY=${after.metrics.centerOffsetY.toFixed(1)}%)`,
      });
      continue;
    }

    queue.push({
      id: product._id,
      name: product.name,
      oldAssetId: assetId,
      candidatePath,
      candidateBuffer,
      candidateFilename,
    });
  }

  console.log(`✅ Ready to patch: ${queue.length}`);
  console.log(`⚪ Skipped: ${skipped.length}`);
  if (skipped.length > 0) {
    skipped.forEach((s) => console.log(`   - ${s.name} (${s.id}): ${s.reason}`));
  }
  console.log("");

  if (queue.length === 0) {
    console.log("Nothing to patch. Exiting.");
    return;
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

  console.log(`📝 Patching ${queue.length} products (no backup step, no confirmation prompt — running straight through)...\n`);

  const mapping = [];
  let count = 0;

  for (const item of queue) {
    count++;
    console.log(`⬆️  [${count}/${queue.length}] Uploading normalized asset for "${item.name}"...`);
    const asset = await writeClient.assets.upload("image", item.candidateBuffer, {
      filename: item.candidateFilename,
    });

    await writeClient
      .patch(item.id)
      .set({
        "image.asset._ref": asset._id,
        "image.asset._type": "reference",
      })
      .commit();

    mapping.push({
      productId: item.id,
      name: item.name,
      oldAssetId: item.oldAssetId,
      newAssetId: asset._id,
    });
  }

  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  const mappingPath = path.join(OUTPUT_DIR, `asset_mapping_accessories_${timestamp}.json`);
  await fs.writeFile(mappingPath, JSON.stringify(mapping, null, 2));
  console.log(`\n🗺️  Old->new asset mapping saved: ${mappingPath}`);

  console.log("\n🕵️  Verifying patched documents...\n");

  let allConfirmed = true;
  let confirmedCount = 0;
  for (const item of mapping) {
    const live = await readClient.fetch(`*[_id == $id][0]{ "assetId": image.asset._ref }`, {
      id: item.productId,
    });
    const matches = live?.assetId === item.newAssetId;
    allConfirmed = allConfirmed && matches;
    if (matches) confirmedCount++;
    if (!matches) {
      console.log(`❌ MISMATCH: ${item.name} (${item.productId}) — expected ${item.newAssetId}, got ${live?.assetId || "MISSING"}`);
    }
  }

  console.log(`\n${confirmedCount} of ${mapping.length} confirmed.`);
  console.log(allConfirmed ? "✅ All patched documents confirmed." : "❌ Some documents did not confirm — see above.");
}

main().catch((err) => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});
