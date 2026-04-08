#!/usr/bin/env node
/**
 * Check for duplicate test products
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

async function checkDuplicates() {
  log('=== Checking for Duplicate Test Products ===', colors.blue);
  
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
  
  // Group by name to find duplicates
  const byName = {};
  products.forEach(p => {
    if (!byName[p.name]) {
      byName[p.name] = [];
    }
    byName[p.name].push(p);
  });
  
  // Find duplicates
  const duplicates = {};
  Object.entries(byName).forEach(([name, items]) => {
    if (items.length > 1) {
      duplicates[name] = items;
    }
  });
  
  if (Object.keys(duplicates).length === 0) {
    log('No duplicate test products found', colors.green);
    return;
  }
  
  log(`\nFound ${Object.keys(duplicates).length} products with duplicates:`, colors.yellow);
  
  Object.entries(duplicates).forEach(([name, items]) => {
    log(`\n${name}:`, colors.red);
    items.forEach((item, i) => {
      log(`  [${i + 1}] ID: ${item._id}`, colors.cyan);
      log(`      Scenario: ${item.scenarioType}`, colors.cyan);
      log(`      Stripe ID: ${item.stripePriceId}`, colors.cyan);
      log(`      Price: $${item.displayPrice}, Stock: ${item.stock}`, colors.cyan);
    });
  });
  
  // Ask if user wants to delete duplicates
  log('\n=== Delete Duplicates? ===', colors.yellow);
  log('Would you like to delete the duplicates? (Keep the first one of each)', colors.yellow);
  log('Run with --delete to automatically delete duplicates', colors.yellow);
  
  if (process.argv.includes('--delete')) {
    log('\nDeleting duplicates...', colors.yellow);
    let deleted = 0;
    
    Object.entries(duplicates).forEach(([name, items]) => {
      // Keep the first one, delete the rest
      for (let i = 1; i < items.length; i++) {
        try {
          client.delete(items[i]._id);
          log(`Deleted: ${name} (${items[i]._id})`, colors.green);
          deleted++;
        } catch (error) {
          log(`Failed to delete ${items[i]._id}: ${error.message}`, colors.red);
        }
      }
    });
    
    log(`\nDeleted ${deleted} duplicate products`, colors.green);
  }
}

checkDuplicates().catch(console.error);
