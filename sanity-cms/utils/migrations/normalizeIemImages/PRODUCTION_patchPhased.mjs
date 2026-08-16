import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { readClient, writeClient } from "./getClient.mjs";
import {
  measureImageBuffer,
  evaluateSelfPass,
  evaluateCrossSetPass,
  computeBucket,
  median,
  TOP_MARGIN_BUFFER,
} from "./imageNormalization.mjs";

// ⚠️ WRITES TO PRODUCTION SANITY DATASET. Only run after the Phase 1
// dry-run report (dryRun.mjs) has been reviewed and confirmed.
// Backs up current image field per product before patching. Runs
// non-interactively otherwise: no confirmation prompt.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CANDIDATES_DIR = path.join(__dirname, "candidates");
const OUTPUT_DIR = path.resolve(__dirname, "../../../backups");

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

async function main() {
  console.log("🚀 Phase 2 — Patch normalized IEM main images into Sanity (WRITES)\n");

  const products = await readClient.fetch(IEMS_GALLERY_QUERY);
  console.log(`📦 Found ${products.length} products in iemsGallery.\n`);

  // Re-measure each product's current live image and its candidate file
  // (must already exist from dryRun.mjs) to decide pass/fail before writing.
  // Cross-set margin consistency needs medians across the whole batch of
  // successfully-read candidates, so this happens in two passes: first read
  // + self-measure everything, then evaluate cross-set against the batch.
  const skipped = [];
  const candidates = [];

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

    // v3 API: a candidate's own measured fill ratio IS the applied target
    // (that's what Phase 1 baked into the composite) — derive anchorYFraction
    // from it the same way normalizeImageBuffer did, then re-measure with that
    // anchor to get a meaningful baseAnchorOffset. Bucket is recovered from the
    // candidate's own bbox aspect ratio, which uniform scaling preserves exactly
    // from the original crop, so no re-fetch of the source image is needed.
    const firstPass = await measureImageBuffer(candidateBuffer);
    const appliedFillRatio = firstPass.metrics.fillRatio;
    const anchorYFraction = appliedFillRatio / 100 + TOP_MARGIN_BUFFER;
    const after = await measureImageBuffer(candidateBuffer, { anchorYFraction });
    const bucket = computeBucket(after.metrics.bboxWidth, after.metrics.bboxHeight);
    const selfResult = evaluateSelfPass(after.metrics, appliedFillRatio);

    candidates.push({
      id: product._id,
      name: product.name,
      oldAssetId: assetId,
      oldImage: product.image,
      candidatePath,
      candidateBuffer,
      candidateFilename,
      bucket,
      metrics: after.metrics,
      selfResult,
    });
  }

  // Cross-set margin consistency is scoped to each orientation bucket
  // (portrait vs. landscape), matching dryRun.mjs — comparing a case-only
  // shot's margins to a buds-only shot's median is comparing apples to oranges.
  function bucketMedians(bucketName) {
    const members = candidates.filter((c) => c.bucket === bucketName);
    if (members.length === 0) return null;
    return {
      leftMargin: median(members.map((c) => c.metrics.leftMargin)),
      rightMargin: median(members.map((c) => c.metrics.rightMargin)),
      topMargin: median(members.map((c) => c.metrics.topMargin)),
      bottomMargin: median(members.map((c) => c.metrics.bottomMargin)),
    };
  }
  const mediansByBucket = { portrait: bucketMedians("portrait"), landscape: bucketMedians("landscape") };

  const queue = [];
  for (const c of candidates) {
    const medians = mediansByBucket[c.bucket];
    const crossResult = evaluateCrossSetPass(c.metrics, medians);
    const overallPass = c.selfResult.selfPass && crossResult.crossSetPass;

    if (!overallPass) {
      skipped.push({
        id: c.id,
        name: c.name,
        reason: `candidate did not pass (fill=${c.metrics.fillRatio.toFixed(1)}%, selfMarginH=${c.metrics.marginEvennessH.toFixed(1)}pp, bucket=${c.bucket}, crossSetPass=${crossResult.crossSetPass}, centerX=${c.metrics.centerOffsetX.toFixed(1)}%, baseAnchorOffset=${c.metrics.baseAnchorOffset.toFixed(1)}%)`,
      });
      continue;
    }

    queue.push({
      id: c.id,
      name: c.name,
      oldAssetId: c.oldAssetId,
      oldImage: c.oldImage,
      candidatePath: c.candidatePath,
      candidateBuffer: c.candidateBuffer,
      candidateFilename: c.candidateFilename,
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

  console.log("📝 Products to patch (no confirmation prompt — running straight through):");
  queue.forEach((item) => console.log(`   - ${item.name} (${item.id})`));
  console.log("");

  // --- 1. Backup current image field for every product about to be patched ---
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  const backup = queue.map((item) => ({ _id: item.id, name: item.name, image: item.oldImage }));
  const backupPath = path.join(OUTPUT_DIR, `backup_iemsGallery_${timestamp}.json`);
  await fs.writeFile(backupPath, JSON.stringify(backup, null, 2));
  console.log(`💾 Backup of current image fields saved: ${backupPath}\n`);

  // --- 2-3. Upload assets, patch documents, log old->new asset mapping ---
  const mapping = [];

  for (const item of queue) {
    console.log(`\n⬆️  Uploading normalized asset for "${item.name}"...`);
    const asset = await writeClient.assets.upload("image", item.candidateBuffer, {
      filename: item.candidateFilename,
    });

    console.log(`   New asset: ${asset._id}`);
    console.log(`   Patching document ${item.id} ...`);

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
  const mappingPath = path.join(OUTPUT_DIR, `asset_mapping_iemsGallery_${timestamp}.json`);
  await fs.writeFile(mappingPath, JSON.stringify(mapping, null, 2));
  console.log(`\n🗺️  Old->new asset mapping saved: ${mappingPath}`);

  // --- 5. Re-fetch and confirm ---
  console.log("\n🕵️  Verifying patched documents...\n");
  console.log("=".repeat(90));
  console.log("Product".padEnd(45) + "New asset matches?".padEnd(20) + "Asset ID");
  console.log("=".repeat(90));

  let allConfirmed = true;
  for (const item of mapping) {
    const live = await readClient.fetch(`*[_id == $id][0]{ "assetId": image.asset._ref }`, {
      id: item.productId,
    });
    const matches = live?.assetId === item.newAssetId;
    allConfirmed = allConfirmed && matches;
    console.log(
      item.name.slice(0, 44).padEnd(45) + (matches ? "✅ YES" : "❌ NO").padEnd(20) + (live?.assetId || "MISSING")
    );
  }
  console.log("=".repeat(90));
  console.log(allConfirmed ? "\n✅ All patched documents confirmed." : "\n❌ Some documents did not confirm — check above.");
}

main().catch((err) => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});
