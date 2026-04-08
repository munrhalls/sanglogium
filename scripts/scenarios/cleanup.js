#!/usr/bin/env node
/**
 * Scenario Cleanup Script
 * Safely removes test products created by scenario setup
 */

import { createClient } from '@sanity/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '.env.local') });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title) {
  log(`\n${'='.repeat(60)}`, colors.cyan);
  log(`  ${title}`, colors.cyan);
  log(`${'='.repeat(60)}\n`, colors.cyan);
}

// Initialize Sanity client
const client = createClient({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID,
  dataset: process.env.SANITY_STUDIO_DATASET,
  token: process.env.SANITY_STUDIO_READ_WRITE_CREATE,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  useCdn: false
});

// Clean up scenario
async function cleanupScenario(scenarioId) {
  logSection(`Cleaning up scenario: ${scenarioId}`);

  try {
    // Load scenario info
    const infoPath = path.join(__dirname, '..', '..', 'scenarios', `${scenarioId}.json`);

    if (!fs.existsSync(infoPath)) {
      log(`Scenario info file not found: ${infoPath}`, colors.yellow);
      log('Will search for products with scenarioId tag...', colors.yellow);
    }

    let productsToDelete = [];

    if (fs.existsSync(infoPath)) {
      const scenarioInfo = JSON.parse(fs.readFileSync(infoPath, 'utf8'));
      productsToDelete = scenarioInfo.products || [];
      log(`Found ${productsToDelete.length} products in scenario info`, colors.blue);
    } else {
      // Search for products by scenarioId
      const query = `*[_type == "product" && scenarioId == $scenarioId] {_id, name}`;
      const products = await client.fetch(query, { scenarioId });
      productsToDelete = products;
      log(`Found ${products.length} products with scenarioId tag`, colors.blue);
    }

    if (productsToDelete.length === 0) {
      log('No products found to delete', colors.yellow);
      return;
    }

    // Show what will be deleted
    log('Products to delete:', colors.yellow);
    productsToDelete.forEach(p => {
      log(`  - ${p.name} (${p._id})`, colors.red);
    });

    // Confirm deletion
    log('\nDeleting products...', colors.yellow);

    const deletedProducts = [];
    for (const product of productsToDelete) {
      try {
        const deleted = await client.delete(product._id);
        deletedProducts.push(deleted);
        log(`Deleted: ${product.name}`, colors.green);
      } catch (error) {
        log(`Failed to delete ${product.name}: ${error.message}`, colors.red);
      }
    }

    // Clean up browser script
    const scriptPath = path.join(__dirname, '..', '..', 'public', `scenario-${scenarioId.split('-')[1]}.js`);
    if (fs.existsSync(scriptPath)) {
      fs.unlinkSync(scriptPath);
      log(`Deleted browser script: ${scriptPath}`, colors.green);
    }

    // Clean up scenario info
    if (fs.existsSync(infoPath)) {
      fs.unlinkSync(infoPath);
      log(`Deleted scenario info: ${infoPath}`, colors.green);
    }

    logSection('Cleanup Complete!');
    log(`Deleted ${deletedProducts.length} products`, colors.green);
    log(`Scenario ${scenarioId} cleaned up successfully`, colors.cyan);

  } catch (error) {
    log(`Error cleaning up scenario: ${error.message}`, colors.red);
    if (error.response) {
      log(`Sanity API error: ${JSON.stringify(error.response.body, null, 2)}`, colors.red);
    }
  }
}

// Clean up all test scenarios
async function cleanupAll() {
  logSection('Cleaning up ALL test scenarios');

  try {
    // Find all products with scenarioId
    const query = `*[_type == "product" && defined(scenarioId)] {_id, name, scenarioId}`;
    const products = await client.fetch(query);

    if (products.length === 0) {
      log('No test products found', colors.green);
      return;
    }

    // Group by scenario
    const scenarios = {};
    products.forEach(p => {
      const scenarioId = p.scenarioId;
      if (!scenarios[scenarioId]) {
        scenarios[scenarioId] = [];
      }
      scenarios[scenarioId].push(p);
    });

    log(`Found ${Object.keys(scenarios).length} scenarios to clean:`, colors.yellow);

    // Delete all products
    let totalDeleted = 0;
    for (const [scenarioId, scenarioProducts] of Object.entries(scenarios)) {
      log(`\nCleaning scenario: ${scenarioId}`, colors.blue);

      for (const product of scenarioProducts) {
        try {
          await client.delete(product._id);
          log(`  Deleted: ${product.name}`, colors.green);
          totalDeleted++;
        } catch (error) {
          log(`  Failed to delete ${product.name}: ${error.message}`, colors.red);
        }
      }

      // Clean up scenario info file
      const infoPath = path.join(__dirname, '..', '..', 'scenarios', `${scenarioId}.json`);
      if (fs.existsSync(infoPath)) {
        fs.unlinkSync(infoPath);
      }
    }

    // Clean up all browser scripts
    const scriptsDir = path.join(__dirname, '..', '..', 'public');
    const scripts = fs.readdirSync(scriptsDir).filter(f => f.startsWith('scenario-') && f.endsWith('.js'));

    scripts.forEach(script => {
      const scriptPath = path.join(scriptsDir, script);
      fs.unlinkSync(scriptPath);
      log(`Deleted script: ${script}`, colors.green);
    });

    logSection('Cleanup All Complete!');
    log(`Deleted ${totalDeleted} products across ${Object.keys(scenarios).length} scenarios`, colors.green);

  } catch (error) {
    log(`Error cleaning up: ${error.message}`, colors.red);
  }
}

// CLI interface
const args = process.argv.slice(2);
const command = args[0];

// Check environment variables
const requiredEnvVars = [
  'SANITY_STUDIO_PROJECT_ID',
  'SANITY_STUDIO_DATASET',
  'SANITY_STUDIO_READ_WRITE_CREATE'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    log(`Missing environment variable: ${envVar}`, colors.red);
    log('Please set all required environment variables.', colors.red);
    process.exit(1);
  }
}

if (command === 'all') {
  cleanupAll();
} else if (command) {
  cleanupScenario(command);
} else {
  logSection('Scenario Cleanup Script');
  log('Usage: node cleanup.js <scenario-id|all>', colors.yellow);
  log('\nOptions:', colors.yellow);
  log('  <scenario-id> - Clean up specific scenario');
  log('  all - Clean up ALL test scenarios');
  log('\nTo find scenario IDs:', colors.blue);
  log('  ls scripts/../scenarios/*.json', colors.blue);
}
