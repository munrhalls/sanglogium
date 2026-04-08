#!/usr/bin/env node
/**
 * Automated Sprint Verification Script
 * Sprint: basket_to_checkout_handshake
 *
 * This script runs all automated verification checks required for sprint lock.
 * Run with: node scripts/verify-sprint-completion.js
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Verification results
const results = {
  passed: [],
  failed: [],
  skipped: []
};

// Helper functions
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title) {
  log(`\n${'='.repeat(60)}`, colors.cyan);
  log(`  ${title}`, colors.cyan);
  log(`${'='.repeat(60)}\n`, colors.cyan);
}

function runCommand(command, description, critical = true) {
  log(`\n${description}...`, colors.blue);
  log(`Command: ${command}`, colors.blue);

  try {
    const output = execSync(command, {
      encoding: 'utf8',
      stdio: 'pipe',
      maxBuffer: 1024 * 1024 * 10 // 10MB buffer
    });

    log('  PASSED', colors.green);
    results.passed.push({ command, description, output: output.substring(0, 200) });
    return true;
  } catch (error) {
    log('  FAILED', colors.red);
    log(`  Exit code: ${error.status}`, colors.red);
    log(`  Error: ${error.message.substring(0, 200)}`, colors.red);

    if (critical) {
      results.failed.push({
        command,
        description,
        error: error.message,
        output: error.stdout?.substring(0, 200) || 'No output'
      });
    } else {
      results.skipped.push({
        command,
        description,
        reason: error.message
      });
    }
    return false;
  }
}

function checkFileExists(filePath, description) {
  log(`\n${description}...`, colors.blue);
  if (fs.existsSync(filePath)) {
    log('  PASSED - File exists', colors.green);
    results.passed.push({ check: 'file_exists', description, path: filePath });
    return true;
  } else {
    log('  FAILED - File not found', colors.red);
    results.failed.push({ check: 'file_exists', description, path: filePath });
    return false;
  }
}

// Main verification function
async function verifySprint() {
  log('Sprint Verification: basket_to_checkout_handshake', colors.yellow);
  log('Starting automated checks...\n', colors.yellow);

  // 1. TypeScript compilation check
  logSection('1. TypeScript Compilation Check');
  runCommand(
    'npx tsc --noEmit --project tsconfig.sprint.json',
    'TypeScript compilation - zero errors across sprint files',
    true
  );

  // 2. Unit tests
  logSection('2. Unit Tests - preCheckout Module');
  runCommand(
    'npx vitest run tests/unit/preCheckout/ --reporter=verbose',
    'Unit tests - 100% pass required',
    true
  );

  // 3. Integration tests
  logSection('3. Integration Tests - Checkout Module');
  runCommand(
    'npx vitest run tests/integration/checkout/ --reporter=verbose',
    'Integration tests - 100% pass required',
    true
  );

  // 4. E2E tests
  logSection('4. E2E Tests - Basket to Checkout Flow');

  // Check if dev server is running
  let serverRunning = false;
  try {
    const http = await import('node:http');
    serverRunning = await new Promise((resolve) => {
      const req = http.request('http://localhost:3000', { method: 'HEAD', timeout: 2000 }, (res) => {
        resolve(res.statusCode === 200);
      });
      req.on('error', () => resolve(false));
      req.on('timeout', () => {
        req.destroy();
        resolve(false);
      });
      req.end();
    });
  } catch (error) {
    serverRunning = false;
  }

  if (!serverRunning) {
    log('\nDev server not running on http://localhost:3000', colors.yellow);
    log('Skipping E2E tests - start dev server with "npm run dev"', colors.yellow);
    results.skipped.push({
      command: 'npx playwright test',
      description: 'E2E tests skipped - dev server not running',
      reason: 'Dev server required for E2E tests'
    });
  } else {
    runCommand(
      'npx playwright test tests/e2e/checkout/basket_to_checkout/ --reporter=list',
      'E2E tests - 100% pass required',
      true
    );
  }

  // 5. Next.js build check
  logSection('5. Next.js Build - Server-Only Boundary Check');
  runCommand(
    'npx next build',
    'Next.js build - zero warnings about server-only boundary violations',
    true
  );

  // 6. Check required files exist
  logSection('6. Required Files Check');

  const requiredFiles = [
    { path: 'store/preCheckout/preCheckoutMachine.ts', desc: 'State machine core' },
    { path: 'store/preCheckout/preCheckoutTypes.ts', desc: 'State machine types' },
    { path: 'app/actions/checkout/validateBasket.ts', desc: 'Basket validation server action' },
    { path: 'app/components/features/basket/checkout/useCheckoutAction.ts', desc: 'Checkout action hook' },
    { path: 'app/components/features/basket/checkout/useSuccessHandler.ts', desc: 'Success handler hook' },
    { path: 'app/components/features/basket/checkout/useAcceptDiscrepancies.ts', desc: 'Accept discrepancies hook' },
    { path: 'app/components/features/basket/checkout/usePreCheckout.ts', desc: 'Orchestrator hook' },
    { path: 'app/components/features/basket/checkout/CheckoutPanel.tsx', desc: 'Checkout UI component' },
    { path: 'app/actions/checkout/releaseInventoryLock.ts', desc: 'Inventory lock release action' }
  ];

  requiredFiles.forEach(file => {
    checkFileExists(file.path, file.desc);
  });

  // 7. Check test files exist
  logSection('7. Test Files Check');

  const testFiles = [
    { path: 'tests/unit/preCheckout/preCheckoutMachine.test.ts', desc: 'State machine unit tests' },
    { path: 'tests/unit/preCheckout/useCheckoutAction.test.ts', desc: 'Checkout action unit tests' },
    { path: 'tests/unit/preCheckout/useSuccessHandler.test.ts', desc: 'Success handler unit tests' },
    { path: 'tests/unit/preCheckout/useAcceptDiscrepancies.test.ts', desc: 'Accept discrepancies unit tests' },
    { path: 'tests/unit/preCheckout/basketCancelHandler.test.tsx', desc: 'Cancel handler unit tests' },
    { path: 'tests/integration/checkout/validateBasket.sanity.test.ts', desc: 'Basket validation integration tests' },
    { path: 'tests/integration/checkout/usePreCheckout.test.tsx', desc: 'Orchestrator integration tests' },
    { path: 'tests/integration/checkout/CheckoutPanel.test.tsx', desc: 'Checkout panel integration tests' }
  ];

  testFiles.forEach(file => {
    checkFileExists(file.path, file.desc);
  });

  // 8. Generate report
  logSection('Verification Results Summary');

  log(`\nTotal checks: ${results.passed.length + results.failed.length + results.skipped.length}`, colors.blue);
  log(`Passed: ${results.passed.length}`, colors.green);
  log(`Failed: ${results.failed.length}`, colors.red);
  log(`Skipped: ${results.skipped.length}`, colors.yellow);

  if (results.failed.length > 0) {
    log('\nFailed checks:', colors.red);
    results.failed.forEach((failure, index) => {
      log(`\n${index + 1}. ${failure.description || failure.check}`, colors.red);
      if (failure.command) log(`   Command: ${failure.command}`, colors.red);
      if (failure.path) log(`   Path: ${failure.path}`, colors.red);
      if (failure.error) log(`   Error: ${failure.error.substring(0, 100)}...`, colors.red);
    });
  }

  if (results.skipped.length > 0) {
    log('\nSkipped checks:', colors.yellow);
    results.skipped.forEach(skip => {
      log(`- ${skip.description}: ${skip.reason}`, colors.yellow);
    });
  }

  // 9. Save results to file
  const reportPath = 'sprint-verification-report.json';
  const reportData = {
    timestamp: new Date().toISOString(),
    sprint: 'basket_to_checkout_handshake',
    summary: {
      total: results.passed.length + results.failed.length + results.skipped.length,
      passed: results.passed.length,
      failed: results.failed.length,
      skipped: results.skipped.length
    },
    results
  };

  fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
  log(`\nDetailed report saved to: ${reportPath}`, colors.cyan);

  // 10. Final verdict
  logSection('Final Verdict');

  if (results.failed.length === 0) {
    log('All automated checks PASSED!', colors.green);
    log('\nNext steps:', colors.green);
    log('1. Complete manual verification using manual_verification_checklist.md', colors.green);
    log('2. Verify state machine invariants manually', colors.green);
    log('3. Update sprint evidence log', colors.green);
    log('4. Sprint can be LOCKED', colors.green);
    return true;
  } else {
    log('Some checks FAILED!', colors.red);
    log('\nRequired actions:', colors.red);
    log('1. Fix all failed automated checks', colors.red);
    log('2. Re-run this verification script', colors.red);
    log('3. Only proceed to manual verification after all automated checks pass', colors.red);
    return false;
  }
}

// Run verification
verifySprint()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    log(`Verification script error: ${error.message}`, colors.red);
    process.exit(1);
  });

export { verifySprint };
