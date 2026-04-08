#!/usr/bin/env node
/**
 * Test script to verify browser cleanup behavior
 * This simulates what happens when a user abandons checkout
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

async function testBrowserCleanup() {
  log('=== Testing Browser Cleanup Simulation ===', colors.blue);

  // Step 1: Reserve some stock (simulate checkout start)
  log('\nStep 1: Simulating checkout start (reserving stock)...', colors.yellow);

  const testProducts = await client.fetch(`*[_type == "product" && defined(scenarioType)][0..1]{_id, name, stock, reservedStock}`);

  if (testProducts.length < 2) {
    log('Need at least 2 test products', colors.red);
    return;
  }

  // Reserve stock for first product
  await client.patch(testProducts[0]._id).inc({ reservedStock: 2 }).commit();
  log(`Reserved 2 units for ${testProducts[0].name}`, colors.green);

  // Check initial state
  const afterReserve = await client.fetch(`*[_type == "product" && _id == $id]{_id, name, stock, reservedStock}`, { id: testProducts[0]._id });
  log(`State after reservation: Stock=${afterReserve.stock}, Reserved=${afterReserve.reservedStock}`, colors.cyan);

  // Step 2: Simulate browser cleanup (like navigating away)
  log('\nStep 2: Simulating browser cleanup (user navigates away)...', colors.yellow);

  try {
    const response = await fetch('http://localhost:3000/api/checkout/cleanup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idempotencyKey: 'test-browser-abandon-' + Date.now() })
    });

    if (response.ok) {
      const result = await response.json();
      log(`Cleanup API response: ${result.message}`, colors.green);
    } else {
      log(`Cleanup API failed: ${response.status}`, colors.red);
    }
  } catch (error) {
    log(`Cleanup API error: ${error.message}`, colors.red);
  }

  // Step 3: Verify stock was released
  log('\nStep 3: Verifying stock was released...', colors.yellow);

  const afterCleanup = await client.fetch(`*[_type == "product" && _id == $id]{_id, name, stock, reservedStock}`, { id: testProducts[0]._id });
  log(`State after cleanup: Stock=${afterCleanup.stock}, Reserved=${afterCleanup.reservedStock}`, colors.cyan);

  if (afterCleanup.reservedStock === 0) {
    log('SUCCESS: Stock was released on browser cleanup!', colors.green);
  } else {
    log('FAILURE: Stock was NOT released', colors.red);
  }

  // Clean up
  await client.patch(testProducts[0]._id).set({ reservedStock: 0 }).commit();
  log('\nTest cleanup completed', colors.blue);
}

testBrowserCleanup().catch(console.error);
