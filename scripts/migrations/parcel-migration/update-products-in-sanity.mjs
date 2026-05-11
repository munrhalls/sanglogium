#!/usr/bin/env node

/**
 * Migration script to update products in Sanity CMS with parcel data
 * Usage: node scripts/migrations/parcel-migration/update-products-in-sanity.mjs
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
  token: process.env.SANITY_STUDIO_READ_WRITE,
});

async function main() {
  console.log('🔄 Updating products in Sanity CMS with parcel data...');

  // Read the products JSON file
  const productsPath = path.join(process.cwd(), 'scripts', 'migrations', 'parcel-migration', 'products-to-products-with-parcel-data.json');
  const productsData = JSON.parse(await fs.readFile(productsPath, 'utf-8'));

  console.log(`📋 Loaded ${productsData.products.length} products from JSON file`);

  let successCount = 0;
  let failureCount = 0;
  const failedProducts = [];

  // Process each product
  for (let i = 0; i < productsData.products.length; i++) {
    const product = productsData.products[i];
    const productId = product._id;

    try {
      // Create a patch operation
      const patch = client.patch(productId);

      // Add parcel field if it exists
      if (product.parcel) {
        patch.set({ parcel: product.parcel });
      }

      // Commit the patch
      await patch.commit();

      successCount++;
      
      // Log progress every 10 products
      if ((i + 1) % 10 === 0) {
        console.log(`  Processed ${i + 1}/${productsData.products.length} products...`);
      }
    } catch (error) {
      failureCount++;
      failedProducts.push({ id: productId, error: error.message });
      console.error(`❌ Failed to update product ${productId}: ${error.message}`);
    }
  }

  console.log('\n📊 Migration Summary:');
  console.log(`  Total products processed: ${productsData.products.length}`);
  console.log(`  ✅ Successful updates: ${successCount}`);
  console.log(`  ❌ Failed updates: ${failureCount}`);

  if (failedProducts.length > 0) {
    console.log('\n⚠️  Failed products:');
    failedProducts.forEach(({ id, error }) => {
      console.log(`  - ${id}: ${error}`);
    });
  }

  if (failureCount === 0) {
    console.log('\n✅ All products updated successfully!');
  } else {
    console.log('\n⚠️  Some products failed to update. Please review the errors above.');
    process.exit(1);
  }
}

main().catch(console.error);
