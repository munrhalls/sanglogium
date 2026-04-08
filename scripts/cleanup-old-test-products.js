#!/usr/bin/env node
/**
 * Find and clean up old test products
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

async function findAndCleanOldProducts() {
  log('=== Finding Old Test Products ===', colors.blue);

  // Find all products with scenarioType
  const query = `*[_type == "product" && defined(scenarioType)]{
    _id,
    name,
    scenarioType,
    stripePriceId,
    displayPrice,
    stock
  }`;

  const products = await client.fetch(query);

  if (products.length === 0) {
    log('No test products found', colors.green);
    return;
  }

  log(`Found ${products.length} test products:`, colors.yellow);

  // Group by scenario
  const grouped = {};
  products.forEach(p => {
    if (!grouped[p.scenarioType]) {
      grouped[p.scenarioType] = [];
    }
    grouped[p.scenarioType].push(p);
  });

  // Show products grouped by scenario
  Object.entries(grouped).forEach(([scenario, items]) => {
    log(`\n${scenario}:`, colors.blue);
    items.forEach(item => {
      // Check if it has old price ID pattern
      const isOldPriceId = item.stripePriceId && item.stripePriceId.startsWith('price_test_');
      const status = isOldPriceId ? colors.red : colors.green;
      log(`  - ${item.name} (${item._id})`, status);
      log(`    Stripe ID: ${item.stripePriceId || 'MISSING'}`, isOldPriceId ? colors.red : colors.cyan);
      log(`    Price: $${item.displayPrice}, Stock: ${item.stock}`, colors.cyan);
    });
  });

  // Find products with old price IDs
  const oldProducts = products.filter(p => p.stripePriceId && p.stripePriceId.startsWith('price_test_'));

  if (oldProducts.length === 0) {
    log('\nNo products with old price IDs found', colors.green);
    return;
  }

  log(`\n=== Cleaning Up ${oldProducts.length} Old Products ===`, colors.yellow);

  let deleted = 0;
  for (const product of oldProducts) {
    try {
      await client.delete(product._id);
      log(`Deleted: ${product.name}`, colors.green);
      deleted++;
    } catch (error) {
      log(`Failed to delete ${product.name}: ${error.message}`, colors.red);
    }
  }

  log(`\n=== Cleanup Complete ===`, colors.blue);
  log(`Deleted: ${deleted}/${oldProducts.length} old products`, colors.green);
}

findAndCleanOldProducts().catch(console.error);
