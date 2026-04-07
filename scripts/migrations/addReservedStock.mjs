#!/usr/bin/env node

/**
 * Migration script to add reservedStock field to products
 * Usage: node scripts/migrations/addReservedStock.mjs [--dry-run]
 */

import { createClient } from "@sanity/client";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2023-01-01",
  useCdn: false,
  token: process.env.SANITY_STUDIO_READ_WRITE || process.env.SANITY_API_TOKEN,
});

const DRY_RUN = process.argv.includes('--dry-run');
const BATCH_SIZE = 50; // Sanity transaction limit

async function main() {
  console.log(`🚀 Reserved Stock Migration ${DRY_RUN ? '(DRY RUN)' : ''}`);

  // Step 1: Find all products without reservedStock
  console.log('\n📊 Finding products without reservedStock field...');
  const query = `*[_type == "product" && !defined(reservedStock)] {_id, _rev, name, stock}`;
  const productsWithoutField = await client.fetch(query);

  console.log(`Found ${productsWithoutField.length} products without reservedStock`);

  if (DRY_RUN) {
    console.log('\n🔍 DRY RUN - Would add reservedStock: 0 to:');
    productsWithoutField.forEach(p => {
      console.log(`  - ${p.name} (${p._id})`);
    });
    return;
  }

  // Step 2: Process in batches
  console.log(`\n📦 Processing ${productsWithoutField.length} products in batches of ${BATCH_SIZE}`);

  let processed = 0;
  let errors = [];

  for (let i = 0; i < productsWithoutField.length; i += BATCH_SIZE) {
    const batch = productsWithoutField.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(productsWithoutField.length / BATCH_SIZE);

    console.log(`\n📝 Batch ${batchNum}/${totalBatches} - Processing ${batch.length} products`);

    try {
      // Process each product individually to avoid transaction permission issues
      for (const product of batch) {
        await client.patch(product._id)
          .set({ reservedStock: 0 })
          .commit();
      }

      processed += batch.length;
      console.log(`✅ Batch ${batchNum} completed - ${processed}/${productsWithoutField.length} processed`);

    } catch (error) {
      console.error(`❌ Batch ${batchNum} failed:`, error.message);
      errors.push({
        batch: batchNum,
        error: error.message,
        products: batch.map(p => p._id)
      });
    }
  }

  // Step 3: Summary
  console.log('\n📋 Migration Summary:');
  console.log(`  ✅ Successfully processed: ${processed}`);
  console.log(`  ❌ Failed batches: ${errors.length}`);

  if (errors.length > 0) {
    console.log('\n❌ Errors:');
    errors.forEach(err => {
      console.log(`  Batch ${err.batch}: ${err.error}`);
    });
  }

  if (!DRY_RUN && processed === productsWithoutField.length) {
    console.log('\n🎉 Migration completed successfully!');
  } else if (!DRY_RUN) {
    console.log('\n⚠️ Migration completed with errors - check failed batches');
  }
}

main().catch(console.error);
