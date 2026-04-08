#!/usr/bin/env node
/**
 * Quick script to check current reserved stock state
 */

import { createClient } from '@sanity/client';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '.env.local') });

// Initialize Sanity client
const client = createClient({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID,
  dataset: process.env.SANITY_STUDIO_DATASET,
  token: process.env.SANITY_STUDIO_READ_WRITE_CREATE,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  useCdn: false
});

async function checkReservedStock() {
  console.log('=== Checking Reserved Stock State ===\n');
  
  // Check all products with reserved stock
  const query = `*[_type == "product" && reservedStock > 0]{
    _id,
    name,
    stock,
    reservedStock,
    "available": stock - reservedStock
  }`;
  
  const products = await client.fetch(query);
  
  if (products.length === 0) {
    console.log('No products have reserved stock');
    return;
  }
  
  console.log(`Found ${products.length} products with reserved stock:\n`);
  
  products.forEach(product => {
    console.log(`${product.name}:`);
    console.log(`  - Stock: ${product.stock}`);
    console.log(`  - Reserved: ${product.reservedStock}`);
    console.log(`  - Available: ${product.available}\n`);
  });
  
  // Also check test products specifically
  const testProductsQuery = `*[_type == "product" && name match "Test Product"]{
    _id,
    name,
    stock,
    reservedStock,
    "available": stock - reservedStock
  }`;
  
  const testProducts = await client.fetch(testProductsQuery);
  
  console.log('\n=== Test Products Specifically ===\n');
  
  testProducts.forEach(product => {
    console.log(`${product.name}:`);
    console.log(`  - Stock: ${product.stock}`);
    console.log(`  - Reserved: ${product.reservedStock}`);
    console.log(`  - Available: ${product.available}\n`);
  });
}

checkReservedStock().catch(console.error);
