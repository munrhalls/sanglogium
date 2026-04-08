#!/usr/bin/env node
/**
 * Manual Test Scenarios Runner
 * Sprint: basket_to_checkout_handshake
 *
 * This script sets up test scenarios for manual verification without requiring Sanity Studio.
 * Each scenario can be run individually with clear logging.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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

// Mock product data for testing
const mockProducts = {
  productA: {
    _id: 'test-product-a',
    name: 'Test Product A',
    displayPrice: 100,
    stock: 10,
    slug: 'test-product-a'
  },
  productB: {
    _id: 'test-product-b',
    name: 'Test Product B',
    displayPrice: 50,
    stock: 5,
    slug: 'test-product-b'
  },
  productC: {
    _id: 'test-product-c',
    name: 'Test Product C',
    displayPrice: 75,
    stock: 0, // Out of stock
    slug: 'test-product-c'
  }
};

// Test scenarios
const scenarios = {
  happyPath: {
    name: "Happy Path - All Valid",
    description: "All items have valid prices and sufficient stock",
    setup: () => {
      // Mock validateBasket to return success
      const mockScript = `
// Mock for happy path
window.mockValidateBasket = async (payload, key) => {
  console.log('MOCK: validateBasket called with key:', key);
  return { outcome: "PASS", stripeUrl: "https://checkout.stripe.com/pay/test-success" };
};
`;
      writeMockScript(mockScript);
    },
    instructions: [
      "1. Open http://localhost:3000/basket",
      "2. Add 2x 'Test Product A' ($100 each)",
      "3. Add 1x 'Test Product B' ($50)",
      "4. Total: $250",
      "5. Click Checkout",
      "Expected: SUCCESS -> Redirect to Stripe"
    ],
    expectedStates: ["IDLE", "PROCESSING", "SUCCESS"],
    keyChecks: [
      "Checkout button enabled initially",
      "Processing state shows spinner",
      "SUCCESS shows 'Redirecting...'",
      "Network tab: validateBasket called with idempotency key"
    ]
  },

  priceMismatch: {
    name: "Price Validation Error",
    description: "Basket has outdated prices compared to server",
    setup: () => {
      const mockScript = `
// Mock for price mismatch
window.mockValidateBasket = async (payload, key) => {
  console.log('MOCK: validateBasket called with key:', key);
  return {
    outcome: "FAIL_VALIDATION",
    discrepancy: {
      type: "PRICE",
      items: [{
        id: "test-product-a",
        productName: "Test Product A",
        expected: 100,
        actual: 120
      }]
    }
  };
};
`;
      writeMockScript(mockScript);
    },
    instructions: [
      "1. Open http://localhost:3000/basket",
      "2. Add 1x 'Test Product A' (shows $100)",
      "3. Click Checkout",
      "4. Mock returns price $120",
      "5. Expected: ERROR_VALIDATION with PRICE discrepancy"
    ],
    expectedStates: ["IDLE", "PROCESSING", "ERROR_VALIDATION"],
    keyChecks: [
      "Error banner shows price difference",
      "Old price: $100, New price: $120",
      "Accept & Continue button visible",
      "Update basket button visible"
    ]
  },

  inventoryShortage: {
    name: "Inventory Shortage Error",
    description: "Requested quantity exceeds available stock",
    setup: () => {
      const mockScript = `
// Mock for inventory shortage
window.mockValidateBasket = async (payload, key) => {
  console.log('MOCK: validateBasket called with key:', key);
  return {
    outcome: "FAIL_VALIDATION",
    discrepancy: {
      type: "INVENTORY",
      items: [{
        id: "test-product-b",
        productName: "Test Product B",
        available: 2,
        requested: 3
      }]
    }
  };
};
`;
      writeMockScript(mockScript);
    },
    instructions: [
      "1. Open http://localhost:3000/basket",
      "2. Add 3x 'Test Product B'",
      "3. Mock returns only 2 available",
      "4. Click Checkout",
      "5. Expected: ERROR_VALIDATION with INVENTORY"
    ],
    expectedStates: ["IDLE", "PROCESSING", "ERROR_VALIDATION"],
    keyChecks: [
      "Error banner shows stock shortage",
      "Available: 2, Requested: 3",
      "Accept & Continue adjusts quantity to 2"
    ]
  },

  networkError: {
    name: "Network Error",
    description: "Simulate network failure during validation",
    setup: () => {
      const mockScript = `
// Mock for network error
window.mockValidateBasket = async (payload, key) => {
  console.log('MOCK: validateBasket called with key:', key);
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 11000));
  throw new Error("Network error");
};
`;
      writeMockScript(mockScript);
    },
    instructions: [
      "1. Open http://localhost:3000/basket",
      "2. Add any product to basket",
      "3. Click Checkout",
      "4. Wait 10+ seconds",
      "5. Expected: ERROR_NETWORK after timeout"
    ],
    expectedStates: ["IDLE", "PROCESSING", "ERROR_NETWORK"],
    keyChecks: [
      "10 second timeout triggers",
      "Connection failed message",
      "Retry button appears",
      "Fresh idempotency key on retry"
    ]
  },

  outOfStock: {
    name: "Out of Stock Error",
    description: "Product has zero stock available",
    setup: () => {
      const mockScript = `
// Mock for out of stock
window.mockValidateBasket = async (payload, key) => {
  console.log('MOCK: validateBasket called with key:', key);
  return {
    outcome: "FAIL_VALIDATION",
    discrepancy: {
      type: "INVENTORY",
      items: [{
        id: "test-product-c",
        productName: "Test Product C",
        available: 0,
        requested: 1
      }]
    }
  };
};
`;
      writeMockScript(mockScript);
    },
    instructions: [
      "1. Open http://localhost:3000/basket",
      "2. Add 1x 'Test Product C'",
      "3. Click Checkout",
      "4. Mock returns 0 available",
      "5. Expected: ERROR_VALIDATION, item removed"
    ],
    expectedStates: ["IDLE", "PROCESSING", "ERROR_VALIDATION"],
    keyChecks: [
      "Out of stock message",
      "Item removed from basket",
      "Accept & Continue not needed for 0 stock"
    ]
  },

  cancelUrl: {
    name: "Cancel URL Handler",
    description: "Test ?checkout=cancelled URL handling",
    setup: () => {
      const mockScript = `
// Mock for cancel URL test
window.mockValidateBasket = async (payload, key) => {
  console.log('MOCK: validateBasket called with key:', key);
  return { outcome: "PASS", stripeUrl: "https://checkout.stripe.com/pay/test" };
};
`;
      writeMockScript(mockScript);
    },
    instructions: [
      "1. Complete a happy path checkout first",
      "2. Before redirect, navigate to: http://localhost:3000/basket?checkout=cancelled",
      "3. Expected: RESET fired, URL cleaned, lock release"
    ],
    expectedStates: ["SUCCESS", "IDLE"],
    keyChecks: [
      "URL cleaned (no ?checkout=cancelled)",
      "Lock release API called",
      "State returns to IDLE"
    ]
  }
};

function writeMockScript(script) {
  const mockFile = path.join(__dirname, '..', 'public', 'test-mock.js');
  fs.writeFileSync(mockFile, script);
}

function clearLogs() {
  // Clear console logs
  console.clear();
  log('Logs cleared', colors.yellow);
}

function showInstructions(scenarioKey) {
  const scenario = scenarios[scenarioKey];

  logSection(`Scenario: ${scenario.name}`);
  log(scenario.description, colors.blue);

  log('\nSetup Instructions:', colors.yellow);
  log('1. Ensure dev server is running: npm run dev', colors.blue);
  log('2. Open browser with DevTools (F12)', colors.blue);
  log('3. Go to Console tab', colors.blue);
  log('4. Paste these commands to load test helpers:', colors.blue);
  log(`   fetch('/test-basket-store.js').then(r=>r.text()).then(eval)`, colors.cyan);
  log(`   fetch('/test-mock.js').then(r=>r.text()).then(eval)`, colors.cyan);

  log('\nQuick Setup:', colors.magenta);
  if (scenarioKey === 'happyPath') {
    log('  testHelpers.setupHappyPath()', colors.cyan);
  } else if (scenarioKey === 'priceMismatch') {
    log('  testHelpers.setupPriceMismatch()', colors.cyan);
  } else if (scenarioKey === 'inventoryShortage') {
    log('  testHelpers.setupInventoryShortage()', colors.cyan);
  } else if (scenarioKey === 'outOfStock') {
    log('  testHelpers.setupOutOfStock()', colors.cyan);
  }

  log('\nTest Steps:', colors.yellow);
  scenario.instructions.forEach((step, i) => {
    log(`${step}`, colors.reset);
  });

  log('\nExpected State Flow:', colors.green);
  log(scenario.expectedStates.join(' -> '), colors.green);

  log('\nKey Checks:', colors.magenta);
  scenario.keyChecks.forEach(check => {
    log(`  [ ] ${check}`, colors.reset);
  });

  log('\nConsole Logs to Watch:', colors.cyan);
  log('  - State transitions: IDLE -> PROCESSING -> ...');
  log('  - validateBasket calls with idempotency keys');
  log('  - Error messages and discrepancies');
  log('  - Lock release calls');
}

function runScenario(scenarioKey) {
  if (!scenarios[scenarioKey]) {
    log(`Unknown scenario: ${scenarioKey}`, colors.red);
    log('Available scenarios:', colors.yellow);
    Object.keys(scenarios).forEach(key => {
      log(`  ${key} - ${scenarios[key].name}`, colors.blue);
    });
    return;
  }

  clearLogs();

  // Setup mock
  scenarios[scenarioKey].setup();

  // Show instructions
  showInstructions(scenarioKey);

  log('\n' + '='.repeat(60), colors.cyan);
  log('Ready to test! Follow the instructions above.', colors.green);
  log('Press Ctrl+C to exit, or run another scenario.', colors.yellow);
}

// CLI interface
const args = process.argv.slice(2);
const command = args[0];

// Map kebab-case to camelCase
const scenarioAliases = {
  'happy-path': 'happyPath',
  'price-mismatch': 'priceMismatch',
  'inventory-shortage': 'inventoryShortage',
  'network-error': 'networkError',
  'out-of-stock': 'outOfStock',
  'cancel-url': 'cancelUrl'
};

const scenarioKey = scenarioAliases[command] || command;

switch (scenarioKey) {
  case 'happyPath':
  case 'priceMismatch':
  case 'inventoryShortage':
  case 'networkError':
  case 'outOfStock':
  case 'cancelUrl':
    runScenario(scenarioKey);
    break;

  case 'list':
    logSection('Available Test Scenarios');
    Object.entries(scenarios).forEach(([key, scenario]) => {
      log(`${key}:`, colors.yellow);
      log(`  ${scenario.name}`, colors.blue);
      log(`  ${scenario.description}`, colors.reset);
      log('');
    });
    break;

  case 'clear':
    clearLogs();
    break;

  default:
    logSection('Manual Test Scenarios Runner');
    log('Usage:', colors.yellow);
    log('  node scripts/manual-test-scenarios.js <scenario>', colors.blue);
    log('');
    log('Available scenarios:', colors.yellow);
    Object.keys(scenarios).forEach(key => {
      log(`  ${key} - ${scenarios[key].name}`, colors.blue);
    });
    log('');
    log('Commands:', colors.yellow);
    log('  list - Show all scenarios', colors.blue);
    log('  clear - Clear console', colors.blue);
    break;
}
