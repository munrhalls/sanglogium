#!/usr/bin/env node
/**
 * Release reserved stock for test products
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

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function releaseReservedStock() {
  log('=== Releasing Reserved Stock ===', colors.blue);
  
  // Find all test products with reserved stock
  const query = `*[_type == "product" && defined(scenarioType) && reservedStock > 0]{
    _id,
    name,
    stock,
    reservedStock,
    scenarioType
  }`;
  
  const products = await client.fetch(query);
  
  if (products.length === 0) {
    log('No products with reserved stock found', colors.green);
    return;
  }
  
  log(`Found ${products.length} products with reserved stock:`, colors.yellow);
  
  let released = 0;
  for (const product of products) {
    log(`\n${product.name}:`, colors.cyan);
    log(`  Current reserved: ${product.reservedStock}`, colors.yellow);
    
    try {
      // Reset reserved stock to 0
      await client.patch(product._id).set({ reservedStock: 0 }).commit();
      log(`  Released: ${product.reservedStock} units`, colors.green);
      released++;
    } catch (error) {
      log(`  Failed to release: ${error.message}`, colors.red);
    }
  }
  
  log(`\n=== Summary ===`, colors.blue);
  log(`Released stock from ${released} products`, colors.green);
  
  // Show final state
  log('\nFinal stock status:', colors.blue);
  const finalQuery = `*[_type == "product" && defined(scenarioType)]{
    _id,
    name,
    stock,
    reservedStock
  }`;
  
  const finalProducts = await client.fetch(finalQuery);
  finalProducts.forEach(p => {
    log(`  ${p.name}: Stock=${p.stock}, Reserved=${p.reservedStock || 0}, Available=${p.stock - (p.reservedStock || 0)}`, colors.cyan);
  });
}

releaseReservedStock().catch(console.error);
