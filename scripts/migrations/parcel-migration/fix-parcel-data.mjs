#!/usr/bin/env node

/**
 * Fix script: Patch products with missing parcel data using existing mapping files
 * Usage: node scripts/migrations/parcel-migration/fix-parcel-data.mjs [--dry-run]
 */

import { createClient } from "@sanity/client";
import fs from 'fs/promises';
import path from 'path';
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const DRY_RUN = process.argv.includes('--dry-run');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2023-01-01",
  useCdn: false,
  token: process.env.SANITY_STUDIO_READ_WRITE,
});

async function loadMappings() {
  const mapPath = path.join(process.cwd(), 'scripts', 'migrations', 'parcel-migration', 'leaf-id-to-path-map.txt');
  const parcelPath = path.join(process.cwd(), 'scripts', 'migrations', 'parcel-migration', 'leaf-slot-to-parcel-data.json');

  const mapText = await fs.readFile(mapPath, 'utf-8');
  const parcelData = JSON.parse(await fs.readFile(parcelPath, 'utf-8'));

  const leafIdToPathMap = {};
  for (const line of mapText.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [id, leafPath] = trimmed.split(':').map(s => s.trim());
      if (id && leafPath) {
        leafIdToPathMap[id] = leafPath;
      }
    }
  }

  const catalogueIdToParcelMap = {};
  for (const [catalogueId, leafPath] of Object.entries(leafIdToPathMap)) {
    if (parcelData[leafPath]) {
      catalogueIdToParcelMap[catalogueId] = parcelData[leafPath];
    }
  }

  return { leafIdToPathMap, catalogueIdToParcelMap };
}

function hasMissingParcel(product) {
  if (!product.parcel) return true;
  const p = product.parcel;
  return (
    p.length == null ||
    p.width == null ||
    p.height == null ||
    p.weight == null ||
    !p.distance_unit ||
    !p.mass_unit
  );
}

function getExpectedParcel(product, catalogueIdToParcelMap) {
  if (!product.catalogueLocationKeys || product.catalogueLocationKeys.length === 0) {
    return null;
  }
  const key = product.catalogueLocationKeys[0];
  return catalogueIdToParcelMap[key] || null;
}

async function main() {
  const modeLabel = DRY_RUN ? 'DRY RUN' : 'LIVE';
  console.log(`🛠️  Fixing missing parcel data [${modeLabel}]...\n`);

  if (DRY_RUN) {
    console.log('⚠️  DRY RUN mode — no changes will be written to Sanity\n');
  }

  const { catalogueIdToParcelMap } = await loadMappings();
  console.log(`📋 Built ${Object.keys(catalogueIdToParcelMap).length} catalogue ID to parcel mappings\n`);

  const query = `*[_type == "product" && defined(catalogueLocationKeys) && count(catalogueLocationKeys) > 0] {
    _id,
    name,
    catalogueLocationKeys,
    parcel
  }`;

  const products = await client.fetch(query);
  console.log(`📦 Found ${products.length} products with non-empty catalogueLocationKeys\n`);

  const toFix = [];

  for (const product of products) {
    const expectedParcel = getExpectedParcel(product, catalogueIdToParcelMap);
    if (!expectedParcel) continue; // skip unmapped keys
    if (hasMissingParcel(product)) {
      toFix.push({
        _id: product._id,
        name: product.name,
        expectedParcel,
      });
    }
  }

  console.log(`🔧 Products needing fix: ${toFix.length}\n`);

  if (toFix.length === 0) {
    console.log('✅ No products need fixing.');
    return;
  }

  let successCount = 0;
  let failureCount = 0;
  const failures = [];

  for (let i = 0; i < toFix.length; i++) {
    const product = toFix[i];
    console.log(`[${i + 1}/${toFix.length}] ${product._id} | ${product.name}`);
    console.log(`    → Setting parcel: ${JSON.stringify(product.expectedParcel)}`);

    if (DRY_RUN) {
      console.log(`    📝 DRY RUN — would patch ${product._id}`);
      successCount++;
      continue;
    }

    try {
      await client
        .patch(product._id)
        .set({ parcel: product.expectedParcel })
        .commit();

      successCount++;
      console.log(`    ✅ Success`);
    } catch (error) {
      failureCount++;
      failures.push({ id: product._id, error: error.message });
      console.error(`    ❌ Failed: ${error.message}`);
    }
  }

  console.log('\n' + '═'.repeat(70));
  console.log('FIX SUMMARY');
  console.log('═'.repeat(70));
  console.log(`  Mode:              ${modeLabel}`);
  console.log(`  Total to fix:      ${toFix.length}`);
  console.log(`  ✅ Successful:      ${successCount}`);
  console.log(`  ❌ Failed:          ${failureCount}`);
  console.log('═'.repeat(70));

  if (failures.length > 0) {
    console.log('\n⚠️  Failed products:');
    for (const f of failures) {
      console.log(`   - ${f.id}: ${f.error}`);
    }
  }

  if (DRY_RUN) {
    console.log('\n⚠️  This was a DRY RUN. Re-run without --dry-run to apply changes.');
  } else if (failureCount === 0) {
    console.log('\n✅ All products patched successfully!');
  } else {
    console.log('\n⚠️  Some products failed. Review errors above.');
    process.exit(1);
  }
}

main().catch(console.error);
