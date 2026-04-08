#!/usr/bin/env node
/**
 * Create Stripe Test Prices
 * Sets up test prices for manual verification scenarios
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFileSync } from 'fs';

const execAsync = promisify(exec);

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

// Test prices to create
const testPrices = [
  {
    key: 'price_test_happy_path_a',
    amount: 10000, // $100.00 in cents
    currency: 'usd',
    nickname: 'Test Product A - Happy Path'
  },
  {
    key: 'price_test_happy_path_b',
    amount: 5000, // $50.00 in cents
    currency: 'usd',
    nickname: 'Test Product B - Happy Path'
  },
  {
    key: 'price_test_price_mismatch',
    amount: 10000, // $100.00 in cents
    currency: 'usd',
    nickname: 'Test Product Price Mismatch'
  },
  {
    key: 'price_test_inventory_shortage',
    amount: 7500, // $75.00 in cents
    currency: 'usd',
    nickname: 'Test Product Inventory Shortage'
  },
  {
    key: 'price_test_out_of_stock',
    amount: 8000, // $80.00 in cents
    currency: 'usd',
    nickname: 'Test Product Out of Stock'
  },
  {
    key: 'price_test_network_error',
    amount: 12000, // $120.00 in cents
    currency: 'usd',
    nickname: 'Test Product Network Error'
  }
];

// Store the mapping from keys to actual price IDs
const priceMapping = {};

async function createTestPrice(price) {
  try {
    // Create the price with product data
    const { stdout, stderr } = await execAsync(`stripe prices create \
      --currency ${price.currency} \
      --unit-amount ${price.amount} \
      --nickname "${price.nickname}" \
      --product-data name="${price.nickname}",description="Test product for manual verification"`);

    if (stderr && !stderr.includes('price_')) {
      throw new Error(stderr);
    }

    const createdPrice = JSON.parse(stdout);
    log(`Created price: ${createdPrice.id} - ${price.nickname}`, colors.green);

    // Store the mapping
    priceMapping[price.key] = createdPrice.id;

    return true;
  } catch (error) {
    log(`Failed to create price for ${price.key}: ${error.message}`, colors.red);
    return false;
  }
}

async function listTestPrices() {
  log('\nExisting test prices:', colors.blue);
  try {
    const { stdout } = await execAsync('stripe prices list --limit 100');
    const prices = JSON.parse(stdout);

    const testPrices = prices.data.filter(p => p.id.startsWith('price_test_'));
    if (testPrices.length === 0) {
      log('No test prices found', colors.yellow);
    } else {
      testPrices.forEach(p => {
        log(`  ${p.id} - $${(p.unit_amount / 100).toFixed(2)} - ${p.nickname}`, colors.cyan);
      });
    }
  } catch (error) {
    log(`Failed to list prices: ${error.message}`, colors.red);
  }
}

async function main() {
  log('=== Stripe Test Prices Setup ===', colors.cyan);

  // List existing test prices
  await listTestPrices();

  log('\nCreating test prices...', colors.yellow);

  let created = 0;
  let failed = 0;

  for (const price of testPrices) {
    const success = await createTestPrice(price);
    if (success) {
      created++;
    } else {
      failed++;
    }
  }

  log(`\n=== Setup Complete ===`, colors.cyan);
  log(`Created: ${created} prices`, colors.green);
  if (failed > 0) {
    log(`Failed: ${failed} prices`, colors.red);
  }

  // Save the price mapping
  if (Object.keys(priceMapping).length > 0) {
    writeFileSync('stripe-test-prices.json', JSON.stringify(priceMapping, null, 2));
    log('\nPrice mapping saved to: stripe-test-prices.json', colors.green);

    log('\nPrice ID mappings:', colors.blue);
    Object.entries(priceMapping).forEach(([key, id]) => {
      log(`  ${key} -> ${id}`, colors.cyan);
    });
  }

  log('\nNext steps:', colors.yellow);
  log('1. Update test products in Sanity with these price IDs');
  log('2. Run manual verification scenarios');
}

// Check if we should just list prices
if (process.argv.includes('--list')) {
  await listTestPrices();
} else {
  main().catch(console.error);
}
