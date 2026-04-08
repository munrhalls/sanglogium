#!/usr/bin/env node
/**
 * Delete specific test products by ID
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

async function deleteSpecificProducts() {
  log('=== Deleting Specific Test Products ===', colors.blue);
  
  const productIds = [
    'test-happyPath-1775540822382-vKtps',
    'test-happyPath-1775540822382-dsRqb'
  ];
  
  let deleted = 0;
  let failed = 0;
  
  for (const id of productIds) {
    try {
      // First check if product exists
      const product = await client.fetch(`*[_id == $id]{_id, name, displayPrice}`, { id });
      
      if (product.length > 0) {
        log(`Found: ${product[0].name} (${product[0].displayPrice})`, colors.cyan);
        
        // Delete the product
        await client.delete(id);
        log(`  Deleted: ${id}`, colors.green);
        deleted++;
      } else {
        log(`Not found: ${id}`, colors.yellow);
      }
    } catch (error) {
      log(`Failed to delete ${id}: ${error.message}`, colors.red);
      failed++;
    }
  }
  
  log(`\n=== Summary ===`, colors.blue);
  log(`Deleted: ${deleted}`, colors.green);
  if (failed > 0) {
    log(`Failed: ${failed}`, colors.red);
  }
}

deleteSpecificProducts().catch(console.error);
