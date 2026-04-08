#!/usr/bin/env node
/**
 * Test Data Setup for Manual Verification
 * Sprint: basket_to_checkout_handshake
 *
 * This script creates test scenarios for manual verification of the checkout flow.
 * Run with: node scripts/setup-test-data.js
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes
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

function logSection(title) {
  log(`\n${'='.repeat(60)}`, colors.cyan);
  log(`  ${title}`, colors.cyan);
  log(`${'='.repeat(60)}\n`, colors.cyan);
}

// Test scenarios
const testScenarios = {
  happyPath: {
    name: "Happy Path - All Valid",
    description: "All items have valid prices and sufficient stock",
    setup: [
      "Ensure Product A has price $100 and stock 10",
      "Ensure Product B has price $50 and stock 5",
      "Add 2x Product A to basket",
      "Add 1x Product B to basket",
      "Expected: SUCCESS -> Stripe redirect"
    ]
  },
  priceMismatch: {
    name: "Price Validation Error",
    description: "Basket has outdated prices",
    setup: [
      "Set Product A price to $120 in Sanity",
      "Add Product A to basket (still shows $100)",
      "Attempt checkout",
      "Expected: ERROR_VALIDATION with PRICE discrepancy"
    ]
  },
  inventoryShortage: {
    name: "Inventory Shortage Error",
    description: "Basket quantity exceeds available stock",
    setup: [
      "Set Product B stock to 2 in Sanity",
      "Add 3x Product B to basket",
      "Attempt checkout",
      "Expected: ERROR_VALIDATION with INVENTORY discrepancy"
    ]
  },
  outOfStock: {
    name: "Out of Stock Error",
    description: "Item in basket is completely out of stock",
    setup: [
      "Set Product C stock to 0 in Sanity",
      "Add 1x Product C to basket",
      "Attempt checkout",
      "Expected: ERROR_VALIDATION with INVENTORY (item removed)"
    ]
  },
  stripeConfigError: {
    name: "Stripe Configuration Error",
    description: "Invalid Stripe configuration",
    setup: [
      "Set invalid Stripe API key in env",
      "Add valid items to basket",
      "Attempt checkout",
      "Expected: ERROR_VALIDATION with STRIPE_CONFIG"
    ]
  }
};

// Create test data setup instructions
function createTestDataInstructions() {
  logSection('Test Data Setup Instructions');

  log('\nThis script helps you set up test scenarios for manual verification.', colors.yellow);
  log('\nChoose a scenario to set up:', colors.blue);

  Object.entries(testScenarios).forEach(([key, scenario], index) => {
    log(`\n${index + 1}. ${scenario.name}`, colors.green);
    log(`   ${scenario.description}`, colors.blue);
    scenario.setup.forEach(step => {
      log(`   - ${step}`, colors.reset);
    });
  });

  log('\nManual Setup Steps:', colors.yellow);
  log('1. Open Sanity Studio at http://localhost:3000/studio', colors.blue);
  log('2. Navigate to Products dataset', colors.blue);
  log('3. Update product prices and stock as needed', colors.blue);
  log('4. Open the basket page in your browser', colors.blue);
  log('5. Add items to basket according to scenario', colors.blue);
  log('6. Proceed with checkout verification', colors.blue);

  log('\nQuick Commands:', colors.yellow);
  log('# Start dev server (if not running):', colors.blue);
  log('npm run dev', colors.cyan);
  log('\n# Open Sanity Studio:', colors.blue);
  log('http://localhost:3000/studio', colors.cyan);
  log('\n# Open basket page:', colors.blue);
  log('http://localhost:3000/basket', colors.cyan);

  log('\nBrowser DevTools Setup:', colors.yellow);
  log('1. Open Chrome DevTools (F12)', colors.blue);
  log('2. Go to Console tab', colors.blue);
  log('3. Go to Network tab', colors.blue);
  log('4. Filter by "validateBasket" and "releaseInventoryLock"', colors.blue);
  log('5. Preserve log during navigation', colors.blue);
}

// Create a helper script to inject test data
function createTestDataInjector() {
  const injectorScript = `
// Test Data Injector for Manual Verification
// Paste this script in the browser console during manual testing

window.testCheckout = {
  // Get current checkout state (if exposed)
  getState: function() {
    return window.checkoutState || 'State not exposed';
  },

  // Simulate network failure
  simulateNetworkFailure: function() {
    // Override fetch to simulate network error
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      if (args[0].includes('validateBasket')) {
        return Promise.reject(new Error('Network error simulated'));
      }
      return originalFetch.apply(this, args);
    };
    console.log('Network failure simulation enabled');
  },

  // Restore normal fetch
  restoreNetwork: function() {
    // This would need to be implemented based on how you override it
    console.log('Network restored (refresh page to reset)');
  },

  // Add console logging for state transitions
  enableStateLogging: function() {
    // This would need to be implemented in the actual component
    console.log('State logging enabled (requires component implementation)');
  },

  // Get current basket contents
  getBasketContents: function() {
    // This would need to be implemented based on your basket store
    console.log('Basket contents (requires basket store access)');
  },

  // Test scenarios
  scenarios: {
    happyPath: 'All items valid, should succeed',
    priceMismatch: 'Price changed in Sanity, should show PRICE error',
    inventoryShortage: 'Not enough stock, should show INVENTORY error',
    outOfStock: 'Zero stock, should remove item',
    networkError: 'Network failure, should show NETWORK error'
  }
};

console.log('Test checkout helper loaded. Use window.testCheckout');
  `;

  fs.writeFileSync(
    path.join(__dirname, '..', 'public', 'test-checkout-helper.js'),
    injectorScript
  );

  log('\nTest helper script created:', colors.green);
  log('public/test-checkout-helper.js', colors.cyan);
  log('\nLoad it in browser console during testing:', colors.blue);
  log("Copy-paste the content or load as script", colors.blue);
}

// Create verification checklist template
function createChecklistTemplate() {
  const template = `# Manual Verification Evidence
# Date: ${new Date().toISOString()}
# Sprint: basket_to_checkout_handshake

## Environment
- Dev server URL: http://localhost:3000
- Sanity Studio: http://localhost:3000/studio
- Browser: Chrome [version]
- User: [logged in/out]

## Test Scenarios Completed

### 1. Happy Path (IDLE -> SUCCESS)
- [ ] Basket loads in IDLE state
- [ ] Checkout button enabled
- [ ] Click checkout -> PROCESSING
- [ ] Processing state shows spinner
- [ ] SUCCESS state reached
- [ ] Redirect to Stripe initiated
- [ ] Network tab: validateBasket called with idempotency key
- Evidence: [screenshot/console logs]

### 2. Network Error (PROCESSING -> ERROR_NETWORK)
- [ ] Network failure simulated
- [ ] 10s timeout triggered
- [ ] ERROR_NETWORK state shown
- [ ] Retry button present
- [ ] Retry generates new idempotency key
- Evidence: [screenshot/console logs]

### 3. Price Validation Error
- [ ] Price mismatch in Sanity vs basket
- [ ] ERROR_VALIDATION state reached
- [ ] PRICE discrepancy banner shown
- [ ] Old vs new prices displayed
- [ ] Accept & Continue button present
- [ ] Accept updates basket prices
- [ ] Re-processing with new prices succeeds
- Evidence: [screenshot/console logs]

### 4. Inventory Shortage Error
- [ ] Stock insufficient in Sanity
- [ ] ERROR_VALIDATION state reached
- [ ] INVENTORY discrepancy banner shown
- [ ] Available quantities displayed
- [ ] Accept & Continue updates quantities
- [ ] Re-processing with updated quantities succeeds
- Evidence: [screenshot/console logs]

### 5. Out of Stock Error
- [ ] Zero stock in Sanity
- [ ] Item removed from basket
- [ ] ERROR_VALIDATION state reached
- [ ] Out of stock message shown
- Evidence: [screenshot/console logs]

### 6. Stripe Configuration Error
- [ ] Invalid Stripe config
- [ ] ERROR_VALIDATION with STRIPE_CONFIG
- [ ] No Accept & Continue button
- [ ] Contact support message shown
- Evidence: [screenshot/console logs]

### 7. Cancel URL Handler
- [ ] Navigate to /basket?checkout=cancelled
- [ ] RESET event fired
- [ ] Lock release API called
- [ ] URL cleaned
- [ ] State returns to IDLE
- Evidence: [screenshot/console logs]

### 8. Component Unmount During Processing
- [ ] Start checkout (PROCESSING state)
- [ ] Navigate away/close tab
- [ ] AbortController triggers
- [ ] No orphaned locks
- Evidence: [console logs]

## State Machine Invariants Verified
- [ ] IDLE -> only START_VALIDATION exits
- [ ] PROCESSING -> always has 10s timer + idempotency key
- [ ] SUCCESS -> always has 5s watchdog + stripeUrl
- [ ] ERROR_NETWORK -> idempotencyKey is null
- [ ] ERROR_VALIDATION -> discrepancy is not null
- [ ] All transitions follow spec

## Final Sign-off
All automated tests: [PASSED/FAILED]
Manual verification: [COMPLETED/PENDING]
State machine invariants: [VERIFIED/PENDING]
No orphaned locks: [VERIFIED/PENDING]

Sprint can be locked: [YES/NO]

Notes:
[Additional observations or issues found]
`;

  fs.writeFileSync(
    path.join(__dirname, '..', '_project', 'sprints', 'active', 'manual-verification-evidence.md'),
    template
  );

  log('\nManual verification evidence template created:', colors.green);
  log('_project/sprints/active/manual-verification-evidence.md', colors.cyan);
}

// Main execution
function main() {
  log('Test Data Setup for Manual Verification', colors.yellow);
  log('Sprint: basket_to_checkout_handshake\n', colors.yellow);

  createTestDataInstructions();
  createTestDataInjector();
  createChecklistTemplate();

  logSection('Next Steps');
  log('\n1. Follow the test data setup instructions above', colors.green);
  log('2. Use the manual verification checklist: manual_verification_checklist.md', colors.green);
  log('3. Fill in the evidence template as you verify each scenario', colors.green);
  log('4. Run the automated verification script when ready:', colors.green);
  log('   node scripts/verify-sprint-completion.js', colors.cyan);
  log('\n5. Complete all verification before locking the sprint.', colors.yellow);
}

main();

export { testScenarios };
