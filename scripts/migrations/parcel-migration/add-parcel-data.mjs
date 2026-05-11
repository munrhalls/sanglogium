#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';

async function main() {
  console.log('📦 Adding parcel data to products...');

  // Read input files
  const productsPath = path.join(process.cwd(), 'scripts', 'migrations', 'parcel-migration', 'products-with-catalog-location_2026-05-11T14-04-36-915Z.json');
  const leafIdToPathPath = path.join(process.cwd(), 'scripts', 'migrations', 'parcel-migration', 'leaf-id-to-path-map.txt');
  const leafSlotToParcelPath = path.join(process.cwd(), 'scripts', 'migrations', 'parcel-migration', 'leaf-slot-to-parcel-data.json');

  const productsData = JSON.parse(await fs.readFile(productsPath, 'utf-8'));
  const leafIdToPathText = await fs.readFile(leafIdToPathPath, 'utf-8');
  const leafSlotToParcelData = JSON.parse(await fs.readFile(leafSlotToParcelPath, 'utf-8'));

  // Parse leaf ID to path map (skip comment lines)
  const leafIdToPathMap = {};
  for (const line of leafIdToPathText.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [id, path] = trimmed.split(':').map(s => s.trim());
      if (id && path) {
        leafIdToPathMap[id] = path;
      }
    }
  }

  console.log(`📋 Loaded ${Object.keys(leafIdToPathMap).length} leaf ID mappings`);
  console.log(`📋 Loaded ${Object.keys(leafSlotToParcelData).length} parcel data entries`);
  console.log(`📋 Processing ${productsData.products.length} products`);

  // Build catalogue ID to parcel data map
  const catalogueIdToParcelMap = {};
  for (const [catalogueId, slotPath] of Object.entries(leafIdToPathMap)) {
    if (leafSlotToParcelData[slotPath]) {
      catalogueIdToParcelMap[catalogueId] = leafSlotToParcelData[slotPath];
    }
  }

  console.log(`📋 Built ${Object.keys(catalogueIdToParcelMap).length} catalogue ID to parcel mappings`);

  // Add parcel data to each product
  let processedCount = 0;
  let skippedCount = 0;

  for (const product of productsData.products) {
    if (!product.catalogueLocationKeys || product.catalogueLocationKeys.length === 0) {
      console.log(`⚠️  Product ${product._id} has no catalogueLocationKeys, skipping`);
      skippedCount++;
      continue;
    }

    // Get the first catalogueLocationKey (assuming products have only one location)
    const catalogueKey = product.catalogueLocationKeys[0];
    const parcelData = catalogueIdToParcelMap[catalogueKey];

    if (!parcelData) {
      console.log(`⚠️  No parcel data found for catalogue key ${catalogueKey}, product ${product._id}`);
      skippedCount++;
      continue;
    }

    // Add parcel data to product (Shippo API format)
    product.parcel = { ...parcelData };
    processedCount++;
  }

  console.log(`✅ Processed ${processedCount} products with parcel data`);
  console.log(`⚠️  Skipped ${skippedCount} products`);

  // Write output
  const outputPath = path.join(process.cwd(), 'scripts', 'migrations', 'parcel-migration', 'products-to-products-with-parcel-data.json');
  await fs.writeFile(outputPath, JSON.stringify(productsData, null, 2));

  console.log(`📂 Saved to: ${outputPath}`);
}

main().catch(console.error);
