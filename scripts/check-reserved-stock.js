#!/usr/bin/env node
/**
 * Check reserved stock for test products
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

async function checkReservedStock() {
  log('=== Checking Reserved Stock ===', colors.blue);
  
  const query = `*[_type == "product" && defined(scenarioType)]{
    _id,
    name,
    stock,
    reservedStock,
    scenarioType
  }`;
  
  const products = await client.fetch(query);
  
  products.forEach(p => {
    log(`\n${p.name}:`, colors.cyan);
    log(`  Stock: ${p.stock}`, colors.blue);
    log(`  Reserved: ${p.reservedStock || 0}`, colors.yellow);
    log(`  Available: ${p.stock - (p.reservedStock || 0)}`, colors.green);
  });
}

checkReservedStock().catch(console.error);
