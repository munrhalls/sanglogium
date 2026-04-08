#!/usr/bin/env node
/**
 * Scenario Setup Script
 * Creates mock products in Sanity for testing scenarios
 */

import { createClient } from '@sanity/client';
import { nanoid } from 'nanoid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local
config({ path: path.join(__dirname, '..', '..', '.env.local') });

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

// Mock product templates
const productTemplates = {
  happyPath: [
    {
      _type: 'product',
      name: 'Test Product A - Happy Path',
      slug: { _type: 'slug', current: 'test-product-a-happy' },
      displayPrice: 100,
      stock: 10,
      catalogueLocationKeys: ['yq3p9s798zszjkzm5btnebjh'], // closed-back category
      status: 'active',
      images: []
    },
    {
      _type: 'product',
      name: 'Test Product B - Happy Path',
      slug: { _type: 'slug', current: 'test-product-b-happy' },
      displayPrice: 50,
      stock: 5,
      catalogueLocationKeys: ['yq3p9s798zszjkzm5btnebjh'],
      status: 'active',
      images: []
    }
  ],
  priceMismatch: [
    {
      _type: 'product',
      name: 'Test Product - Price Mismatch',
      slug: { _type: 'slug', current: 'test-product-price-mismatch' },
      displayPrice: 100,
      stock: 10,
      catalogueLocationKeys: ['yq3p9s798zszjkzm5btnebjh'],
      status: 'active',
      images: []
    }
  ],
  inventoryShortage: [
    {
      _type: 'product',
      name: 'Test Product - Inventory Shortage',
      slug: { _type: 'slug', current: 'test-product-inventory' },
      displayPrice: 75,
      stock: 5, // Will be reduced to 2 in mock
      catalogueLocationKeys: ['yq3p9s798zszjkzm5btnebjh'],
      status: 'active',
      images: []
    }
  ],
  outOfStock: [
    {
      _type: 'product',
      name: 'Test Product - Out of Stock',
      slug: { _type: 'slug', current: 'test-product-out-of-stock' },
      displayPrice: 80,
      stock: 0,
      catalogueLocationKeys: ['yq3p9s798zszjkzm5btnebjh'],
      status: 'active',
      images: []
    }
  ]
};

// Generate browser script for scenario
function generateBrowserScript(scenarioId, products) {
  const script = `
// Auto-generated browser script for scenario: ${scenarioId}
// Generated at: ${new Date().toISOString()}

window.scenarioProducts = ${JSON.stringify(products, null, 2)};

window.scenarioHelpers = {
  // Add products to basket
  addProductsToBasket: async () => {
    console.log('Adding products to basket...');

    // Navigate to products page
    window.location.href = '/products/headphones/closed-back';

    // Wait for page load
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Find and click add to basket buttons
    // This is a simplified approach - you may need to adjust selectors
    const addButtons = document.querySelectorAll('button[aria-label*="Add"], .add-to-basket');

    window.scenarioProducts.forEach((product, index) => {
      if (addButtons[index]) {
        addButtons[index].click();
        console.log(\`Added \${product.name} to basket\`);
      }
    });

    console.log('Products added. Navigate to /basket to continue.');
  },

  // Show scenario info
  showInfo: () => {
    console.log('=== Scenario Info ===');
    console.log('Scenario ID:', '${scenarioId}');
    console.log('Products:', window.scenarioProducts.map(p => p.name));
    console.log('Total products:', window.scenarioProducts.length);
  }
};

console.log('Scenario helpers loaded. Commands:');
console.log('  scenarioHelpers.showInfo() - Show scenario info');
console.log('  scenarioHelpers.addProductsToBasket() - Add products to basket');
`;

  return script;
}

// Main setup function
async function setupScenario(scenarioName) {
  logSection(`Setting up scenario: ${scenarioName}`);

  // Map kebab-case to camelCase
  const scenarioMap = {
    'happy-path': 'happyPath',
    'price-mismatch': 'priceMismatch',
    'inventory-shortage': 'inventoryShortage',
    'out-of-stock': 'outOfStock',
    'network-error': 'networkError'
  };

  const actualScenarioName = scenarioMap[scenarioName] || scenarioName;

  if (!productTemplates[actualScenarioName]) {
    log(`Unknown scenario: ${scenarioName}`, colors.red);
    log('Available scenarios:', colors.yellow);
    Object.keys(productTemplates).forEach(key => log(`  - ${key}`, colors.blue));
    return;
  }

  // Generate unique scenario ID
  const scenarioId = `test-${actualScenarioName}-${Date.now()}`;

  try {
    // Create products in Sanity
    const createdProducts = [];

    for (const productTemplate of productTemplates[actualScenarioName]) {
      const product = {
        ...productTemplate,
        _id: scenarioId + '-' + nanoid(5),
        scenarioId // Tag for cleanup
      };

      const created = await client.create(product);
      createdProducts.push(created);
      log(`Created product: ${created.name} (${created._id})`, colors.green);
    }

    // Generate browser script
    const browserScript = generateBrowserScript(scenarioId, createdProducts);
    const scriptPath = path.join(__dirname, '..', '..', 'public', `scenario-${actualScenarioName}.js`);
    fs.writeFileSync(scriptPath, browserScript);

    logSection('Setup Complete!');
    log(`Scenario ID: ${scenarioId}`, colors.cyan);
    log(`Products created: ${createdProducts.length}`, colors.green);
    log(`Browser script: /scenario-${actualScenarioName}.js`, colors.blue);

    log('\nNext steps:', colors.yellow);
    log(`1. Open browser: http://localhost:3000/basket`);
    log(`2. Open DevTools (F12)`);
    log(`3. In console run:`, colors.cyan);
    log(`   fetch('/scenario-${actualScenarioName}.js').then(r=>r.text()).then(eval)`);
    log(`4. Then run:`, colors.cyan);
    log(`   scenarioHelpers.addProductsToBasket()`);
    log(`5. Go to /basket and test checkout`);

    // Save scenario info for cleanup
    const scenarioInfo = {
      scenarioId,
      scenarioName,
      products: createdProducts.map(p => ({ _id: p._id, name: p.name })),
      createdAt: new Date().toISOString()
    };

    const infoPath = path.join(__dirname, '..', '..', 'scenarios', `${scenarioId}.json`);
    fs.writeFileSync(infoPath, JSON.stringify(scenarioInfo, null, 2));

    log(`\nScenario info saved: ${infoPath}`, colors.magenta);
    log(`To cleanup: node scripts/scenarios/cleanup.js ${scenarioId}`, colors.yellow);

  } catch (error) {
    log(`Error setting up scenario: ${error.message}`, colors.red);
    if (error.response) {
      log(`Sanity API error: ${JSON.stringify(error.response.body, null, 2)}`, colors.red);
    }
  }
}

// CLI interface
const scenarioName = process.argv[2];

if (!scenarioName) {
  logSection('Scenario Setup Script');
  log('Usage: node setup.js <scenario-name>', colors.yellow);
  log('\nAvailable scenarios:', colors.yellow);
  Object.keys(productTemplates).forEach(key => {
    log(`  ${key}`, colors.blue);
  });
  process.exit(1);
}

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

// Run setup
setupScenario(scenarioName);
