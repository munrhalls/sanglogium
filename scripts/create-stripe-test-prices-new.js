#!/usr/bin/env node
/**
 * Create Stripe Test Products and Prices
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

// Test products to create
const testProducts = [
  {
    key: 'price_test_happy_path_a',
    name: 'Test Product A - Happy Path',
    amount: 10000, // $100.00 in cents
    currency: 'usd'
  },
  {
    key: 'price_test_happy_path_b',
    name: 'Test Product B - Happy Path',
    amount: 5000, // $50.00 in cents
    currency: 'usd'
  },
  {
    key: 'price_test_price_mismatch',
    name: 'Test Product Price Mismatch',
    amount: 10000, // $100.00 in cents
    currency: 'usd'
  },
  {
    key: 'price_test_inventory_shortage',
    name: 'Test Product Inventory Shortage',
    amount: 7500, // $75.00 in cents
    currency: 'usd'
  },
  {
    key: 'price_test_out_of_stock',
    name: 'Test Product Out of Stock',
    amount: 8000, // $80.00 in cents
    currency: 'usd'
  },
  {
    key: 'price_test_network_error',
    name: 'Test Product Network Error',
    amount: 12000, // $120.00 in cents
    currency: 'usd'
  }
];

// Store the mapping from keys to actual price IDs
const priceMapping = {};

async function createProductAndPrice(product) {
  try {
    // Create the product first
    const { stdout: productStdout, stderr: productStderr } = await execAsync(`stripe products create \
      --name "${product.name}" \
      --description "Test product for manual verification"`);

    if (productStderr) {
      throw new Error(`Product creation failed: ${productStderr}`);
    }

    const createdProduct = JSON.parse(productStdout);
    log(`Created product: ${createdProduct.id} - ${product.name}`, colors.green);
    
    // Now create the price for this product
    const { stdout: priceStdout, stderr: priceStderr } = await execAsync(`stripe prices create \
      --currency ${product.currency} \
      --unit-amount ${product.amount} \
      --product ${createdProduct.id}`);

    if (priceStderr) {
      throw new Error(`Price creation failed: ${priceStderr}`);
    }

    const createdPrice = JSON.parse(priceStdout);
    log(`Created price: ${createdPrice.id} - $${product.amount / 100}`, colors.green);
    
    // Store the mapping
    priceMapping[product.key] = createdPrice.id;
    
    return true;
  } catch (error) {
    log(`Failed to create product/price for ${product.key}: ${error.message}`, colors.red);
    return false;
  }
}

async function listTestPrices() {
  log('\nExisting test prices:', colors.blue);
  try {
    const { stdout } = await execAsync('stripe prices list --limit 100');
    const prices = JSON.parse(stdout);
    
    const testPrices = prices.data.filter(p => p.nickname && p.nickname.includes('Test Product'));
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
  log('=== Stripe Test Products & Prices Setup ===', colors.cyan);
  
  // List existing test prices
  await listTestPrices();
  
  log('\nCreating test products and prices...', colors.yellow);
  
  let created = 0;
  let failed = 0;
  
  for (const product of testProducts) {
    const success = await createProductAndPrice(product);
    if (success) {
      created++;
    } else {
      failed++;
    }
  }
  
  log(`\n=== Setup Complete ===`, colors.cyan);
  log(`Created: ${created} products/prices`, colors.green);
  if (failed > 0) {
    log(`Failed: ${failed} products/prices`, colors.red);
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
