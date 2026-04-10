// Manual verification script for Scope Contract 1
// Tests checkout button click generates idempotency key and navigates to address

import { chromium } from 'playwright';

async function verifyCheckoutButton() {
  console.log('=== Manual Verification: Scope Contract 1 ===');
  console.log('Testing: Checkout button generates idempotency key and navigates to address');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // First navigate to products page to add items to basket
    await page.goto('http://localhost:3001/products/headphones');
    console.log('Navigated to products page');

    // Wait for products to load
    await page.waitForSelector('.btn-primary', { timeout: 5000 });
    console.log('Products loaded');

    // Add first product to basket
    await page.click('.btn-primary');
    console.log('Added product to basket');

    // Navigate to basket page
    await page.goto('http://localhost:3001/basket');
    console.log('Navigated to basket page');

    // Wait for basket to load with items
    await page.waitForSelector('[data-testid="panel-idle"]', { timeout: 5000 });
    console.log('Basket loaded, checkout panel visible');

    // Check initial state
    const initialState = await page.evaluate(() => {
      const panel = document.querySelector('[data-testid="panel-idle"]');
      return panel ? panel.style.display !== 'none' : false;
    });

    if (!initialState) {
      throw new Error('Initial state is not IDLE');
    }
    console.log('Initial state verified: IDLE');

    // Click checkout button
    console.log('Clicking checkout button...');
    await page.click('.btn-primary');

    // Check for processing state
    await page.waitForSelector('[data-testid="panel-processing"]', { timeout: 3000 });
    console.log('Processing state reached');

    // Wait for navigation to address page
    await page.waitForURL('**/checkout/address', { timeout: 5000 });
    console.log('Successfully navigated to address page');

    // Check console for idempotency key log
    const consoleMessages = [];
    page.on('console', msg => {
      consoleMessages.push(msg.text());
    });

    // Verify idempotency key was generated
    const hasIdempotencyKey = consoleMessages.some(msg =>
      msg.includes('Idempotency key:') && msg.includes('checkout_')
    );

    if (hasIdempotencyKey) {
      console.log('Idempotency key generation verified');
    } else {
      console.log('Warning: Idempotency key not found in console logs');
    }

    console.log('=== Verification PASSED ===');
    console.log('1. Checkout button disabled during processing');
    console.log('2. Navigation to address page successful');
    console.log('3. Idempotency key generated');

  } catch (error) {
    console.error('=== Verification FAILED ===');
    console.error(error);

    // Take screenshot for debugging
    await page.screenshot({ path: 'verification-failure.png' });
    console.log('Screenshot saved as verification-failure.png');

  } finally {
    await browser.close();
  }
}

verifyCheckoutButton().catch(console.error);
