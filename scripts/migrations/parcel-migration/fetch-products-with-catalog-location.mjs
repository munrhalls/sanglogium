#!/usr/bin/env node

/**
 * Fetch products that have non-empty catalogueLocationKeys
 * Usage: node scripts/migrations/fetch-products-with-catalog-location.mjs
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

async function main() {
  console.log('🔍 Fetching products with non-empty catalogueLocationKeys...');
  
  // Fetch all products
  const query = `*[_type == "product"]`;
  const allProducts = await client.fetch(query);
  
  console.log(`Found ${allProducts.length} total products`);
  
  // Filter products with non-empty catalogueLocationKeys
  const productsWithLocation = allProducts.filter(product => {
    return product.catalogueLocationKeys && 
           Array.isArray(product.catalogueLocationKeys) && 
           product.catalogueLocationKeys.length > 0;
  });
  
  console.log(`Found ${productsWithLocation.length} products with non-empty catalogueLocationKeys`);
  
  // Create migrations directory if it doesn't exist
  const migrationsDir = path.join(process.cwd(), 'scripts', 'migrations');
  try {
    await fs.mkdir(migrationsDir, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
  
  // Generate filename with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputFile = path.join(migrationsDir, `products-with-catalog-location_${timestamp}.json`);
  
  // Save filtered products
  const outputData = {
    timestamp: new Date().toISOString(),
    totalProducts: allProducts.length,
    filteredCount: productsWithLocation.length,
    products: productsWithLocation
  };
  
  await fs.writeFile(outputFile, JSON.stringify(outputData, null, 2));
  
  console.log(`✅ Saved to: ${outputFile}`);
  console.log(`  File size: ${(await fs.stat(outputFile)).size} bytes`);
  
  console.log('\n📊 Summary:');
  console.log(`  Total products: ${allProducts.length}`);
  console.log(`  Products with catalogueLocationKeys: ${productsWithLocation.length}`);
  console.log(`  Products without catalogueLocationKeys: ${allProducts.length - productsWithLocation.length}`);
}

main().catch(console.error);
