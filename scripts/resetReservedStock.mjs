#!/usr/bin/env node

/**
 * Migration: Reset reservedStock to 0 on all product documents.
 *
 * Uses targeted Sanity patch mutations to ensure zero side-effects.
 * Only touches documents where reservedStock is not already 0.
 *
 * Usage:
 *   node scripts/resetReservedStock.mjs
 *   node scripts/resetReservedStock.mjs --dry-run
 */

import { createClient } from "@sanity/client";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

// ─── Configuration ──────────────────────────────────────────────────────────

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const API_VERSION = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-11-14";
const TOKEN = process.env.SANITY_STUDIO_READ_WRITE || process.env.SANITY_API_TOKEN;

const BATCH_SIZE = 50; // Sanity mutation transaction limit
const DRY_RUN = process.argv.includes("--dry-run");

if (!PROJECT_ID || !TOKEN) {
  console.error("Missing required environment variables:");
  if (!PROJECT_ID) console.error("  - NEXT_PUBLIC_SANITY_PROJECT_ID");
  if (!TOKEN) console.error("  - SANITY_STUDIO_READ_WRITE (or SANITY_API_TOKEN)");
  process.exit(1);
}

// ─── Client ─────────────────────────────────────────────────────────────────

const client = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  apiVersion: API_VERSION,
  useCdn: false,
  token: TOKEN,
});

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`🚀 Reset reservedStock → 0  ${DRY_RUN ? "[DRY RUN]" : ""}`);
  console.log(`   Project: ${PROJECT_ID}`);
  console.log(`   Dataset: ${DATASET}`);

  // 1. Fetch all products that have a non-zero reservedStock
  console.log("\n📊 Querying products with reservedStock ≠ 0…");
  const query = `*[_type == "product" && reservedStock != 0] { _id, _rev, name, reservedStock }`;
  const products = await client.fetch(query);

  console.log(`   Found ${products.length} product(s) to reset`);

  if (products.length === 0) {
    console.log("\n✅ Nothing to do — all products already have reservedStock = 0");
    return;
  }

  if (DRY_RUN) {
    console.log("\n🔍 DRY RUN — would patch the following products:");
    products.forEach((p) => {
      console.log(`   • ${p.name} (${p._id}) — current: ${p.reservedStock}`);
    });
    return;
  }

  // 2. Build & execute patch mutations in batches
  let patched = 0;
  let failures = [];

  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(products.length / BATCH_SIZE);

    console.log(`\n📝 Batch ${batchNum}/${totalBatches} — ${batch.length} document(s)`);

    const mutations = batch.map((product) => ({
      patch: {
        id: product._id,
        set: { reservedStock: 0 },
      },
    }));

    try {
      await client.mutate(mutations);
      patched += batch.length;
      console.log(`   ✅ Patched ${batch.length} document(s)`);
    } catch (error) {
      console.error(`   ❌ Batch ${batchNum} failed:`, error.message);
      failures.push({ batch: batchNum, error: error.message, ids: batch.map((p) => p._id) });
    }
  }

  // 3. Summary
  console.log("\n📋 Summary");
  console.log(`   ✅ Successfully patched: ${patched}/${products.length}`);
  if (failures.length > 0) {
    console.log(`   ❌ Failed batches:      ${failures.length}`);
    failures.forEach((f) => {
      console.log(`      Batch ${f.batch}: ${f.error}`);
      console.log(`      IDs: ${f.ids.join(", ")}`);
    });
    process.exit(1);
  } else {
    console.log("\n🎉 Migration completed successfully");
  }
}

main().catch((err) => {
  console.error("\n💥 Unhandled error:", err);
  process.exit(1);
});
