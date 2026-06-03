#!/usr/bin/env node

/**
 * Audit script: Find products with non-empty catalogueLocationKeys but missing/empty parcel data
 * Usage: node scripts/migrations/parcel-migration/audit-parcel-data.mjs
 */

import { createClient } from "@sanity/client";
import fs from 'fs/promises';
import path from 'path';
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2023-01-01",
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
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
  console.log('🔍 Auditing products for missing parcel data...\n');

  const { leafIdToPathMap, catalogueIdToParcelMap } = await loadMappings();
  console.log(`📋 Loaded ${Object.keys(leafIdToPathMap).length} leaf ID mappings`);
  console.log(`📋 Built ${Object.keys(catalogueIdToParcelMap).length} catalogue ID to parcel mappings\n`);

  const query = `*[_type == "product" && defined(catalogueLocationKeys) && count(catalogueLocationKeys) > 0] {
    _id,
    name,
    catalogueLocationKeys,
    parcel
  }`;

  const products = await client.fetch(query);
  console.log(`📦 Found ${products.length} products with non-empty catalogueLocationKeys\n`);

  const missingParcel = [];
  const unmappedKey = [];
  const alreadyCorrect = [];

  for (const product of products) {
    const expectedParcel = getExpectedParcel(product, catalogueIdToParcelMap);

    if (!expectedParcel) {
      unmappedKey.push({
        _id: product._id,
        name: product.name,
        catalogueLocationKeys: product.catalogueLocationKeys,
      });
      continue;
    }

    if (hasMissingParcel(product)) {
      missingParcel.push({
        _id: product._id,
        name: product.name,
        catalogueLocationKeys: product.catalogueLocationKeys,
        expectedParcel,
        currentParcel: product.parcel || null,
      });
    } else {
      alreadyCorrect.push({
        _id: product._id,
        name: product.name,
      });
    }
  }

  console.log('═'.repeat(70));
  console.log('AUDIT RESULTS');
  console.log('═'.repeat(70));

  console.log(`\n✅ Already correct: ${alreadyCorrect.length} products`);

  if (missingParcel.length > 0) {
    console.log(`\n❌ Missing parcel data: ${missingParcel.length} products`);
    for (const p of missingParcel) {
      console.log(`   - ${p._id} | ${p.name}`);
      console.log(`     catalogueLocationKeys: ${JSON.stringify(p.catalogueLocationKeys)}`);
      console.log(`     expectedParcel: ${JSON.stringify(p.expectedParcel)}`);
      console.log(`     currentParcel: ${JSON.stringify(p.currentParcel)}`);
    }
  } else {
    console.log(`\n✅ Missing parcel data: 0 products`);
  }

  if (unmappedKey.length > 0) {
    console.log(`\n⚠️  Unmapped catalogueLocationKeys: ${unmappedKey.length} products`);
    for (const p of unmappedKey) {
      console.log(`   - ${p._id} | ${p.name}`);
      console.log(`     catalogueLocationKeys: ${JSON.stringify(p.catalogueLocationKeys)}`);
    }
  } else {
    console.log(`\n✅ Unmapped catalogueLocationKeys: 0 products`);
  }

  console.log('\n' + '═'.repeat(70));
  console.log('SUMMARY');
  console.log('═'.repeat(70));
  console.log(`  Total products checked:        ${products.length}`);
  console.log(`  Already have correct parcel:   ${alreadyCorrect.length}`);
  console.log(`  Missing parcel data:           ${missingParcel.length}`);
  console.log(`  Unmapped catalogue keys:       ${unmappedKey.length}`);
  console.log('═'.repeat(70));

  // Write report to file
  const reportPath = path.join(process.cwd(), 'scripts', 'migrations', 'parcel-migration', `audit-report_${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  const report = {
    timestamp: new Date().toISOString(),
    totalProducts: products.length,
    alreadyCorrect: alreadyCorrect.length,
    missingParcel: {
      count: missingParcel.length,
      products: missingParcel,
    },
    unmappedKey: {
      count: unmappedKey.length,
      products: unmappedKey,
    },
  };
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Report saved to: ${reportPath}`);

  if (missingParcel.length > 0) {
    console.log(`\n⚠️  ${missingParcel.length} product(s) need parcel data fix.`);
    process.exit(1);
  } else {
    console.log('\n✅ All products with catalogueLocationKeys have correct parcel data.');
    process.exit(0);
  }
}

main().catch(console.error);
