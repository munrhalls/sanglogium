#!/usr/bin/env node
/**
 * Scenario Runner
 * Easy command to run test scenarios
 */

import { spawn } from 'child_process';
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

// Available scenarios
const scenarios = {
  'happy-path': {
    name: 'Happy Path',
    description: 'All items valid, successful checkout',
    steps: [
      'Products added to basket',
      'Click Checkout',
      'Verify: IDLE -> PROCESSING -> SUCCESS',
      'Verify: Stripe redirect'
    ]
  },
  'price-mismatch': {
    name: 'Price Mismatch',
    description: 'Basket prices differ from server prices',
    steps: [
      'Product added with old price',
      'Click Checkout',
      'Verify: ERROR_VALIDATION with PRICE',
      'Verify: Accept & Continue button'
    ]
  },
  'inventory-shortage': {
    name: 'Inventory Shortage',
    description: 'Requested quantity exceeds stock',
    steps: [
      'Add more items than in stock',
      'Click Checkout',
      'Verify: ERROR_VALIDATION with INVENTORY',
      'Verify: Available quantities shown'
    ]
  },
  'out-of-stock': {
    name: 'Out of Stock',
    description: 'Product has zero stock',
    steps: [
      'Add out-of-stock product',
      'Click Checkout',
      'Verify: ERROR_VALIDATION with INVENTORY',
      'Verify: Item removed from basket'
    ]
  },
  'network-error': {
    name: 'Network Error',
    description: 'Simulate network failure',
    steps: [
      'Add any product',
      'Click Checkout',
      'Wait 10+ seconds',
      'Verify: ERROR_NETWORK after timeout'
    ]
  }
};

// Run setup
async function runSetup(scenarioKey) {
  const scenario = scenarios[scenarioKey];
  if (!scenario) {
    log(`Unknown scenario: ${scenarioKey}`, colors.red);
    return;
  }
  
  logSection(`Setting up: ${scenario.name}`);
  log(scenario.description, colors.blue);
  
  log('\nExpected steps:', colors.yellow);
  scenario.steps.forEach((step, i) => {
    log(`  ${i + 1}. ${step}`, colors.reset);
  });
  
  log('\nRunning setup...', colors.cyan);
  
  const setup = spawn('node', [
    path.join(__dirname, 'setup.js'),
    scenarioKey
  ], {
    stdio: 'inherit',
    env: process.env
  });
  
  setup.on('close', (code) => {
    if (code === 0) {
      log('\nSetup complete!', colors.green);
      log('\nNext steps:', colors.yellow);
      log('1. Open browser: http://localhost:3000/basket');
      log('2. Open DevTools (F12)');
      log('3. In console, run the fetch command shown above');
      log('4. Follow the scenario steps');
      log('\nTo cleanup when done:', colors.magenta);
      log(`  node scripts/scenarios/cleanup.js <scenario-id>`);
    } else {
      log('\nSetup failed!', colors.red);
    }
  });
}

// Run cleanup
async function runCleanup(scenarioId) {
  logSection(`Cleaning up scenario: ${scenarioId}`);
  
  const cleanup = spawn('node', [
    path.join(__dirname, 'cleanup.js'),
    scenarioId
  ], {
    stdio: 'inherit',
    env: process.env
  });
  
  cleanup.on('close', (code) => {
    if (code === 0) {
      log('\nCleanup complete!', colors.green);
    } else {
      log('\nCleanup failed!', colors.red);
    }
  });
}

// List scenarios
function listScenarios() {
  logSection('Available Test Scenarios');
  
  Object.entries(scenarios).forEach(([key, scenario]) => {
    log(`${key}:`, colors.yellow);
    log(`  ${scenario.name}`, colors.blue);
    log(`  ${scenario.description}`, colors.reset);
    log('');
  });
  
  log('Usage:', colors.cyan);
  log('  node scripts/scenarios/run.js <scenario>', colors.blue);
  log('  node scripts/scenarios/run.js cleanup <scenario-id>', colors.blue);
  log('  node scripts/scenarios/run.js list', colors.blue);
  log('  node scripts/scenarios/run.js cleanup-all', colors.blue);
}

// CLI interface
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'happy-path':
  case 'price-mismatch':
  case 'inventory-shortage':
  case 'out-of-stock':
  case 'network-error':
    runSetup(command);
    break;
    
  case 'cleanup':
    if (!args[1]) {
      log('Please provide scenario ID', colors.red);
      process.exit(1);
    }
    runCleanup(args[1]);
    break;
    
  case 'cleanup-all':
    logSection('Cleaning up ALL scenarios');
    const cleanupAll = spawn('node', [
      path.join(__dirname, 'cleanup.js'),
      'all'
    ], {
      stdio: 'inherit',
      env: process.env
    });
    break;
    
  case 'list':
    listScenarios();
    break;
    
  default:
    logSection('Scenario Runner');
    log('Usage: node run.js <command>', colors.yellow);
    log('\nCommands:', colors.yellow);
    log('  happy-path - Run happy path scenario', colors.blue);
    log('  price-mismatch - Run price mismatch scenario', colors.blue);
    log('  inventory-shortage - Run inventory shortage scenario', colors.blue);
    log('  out-of-stock - Run out of stock scenario', colors.blue);
    log('  network-error - Run network error scenario', colors.blue);
    log('  cleanup <id> - Clean up scenario', colors.blue);
    log('  cleanup-all - Clean up all scenarios', colors.blue);
    log('  list - List all scenarios', colors.blue);
    break;
}
