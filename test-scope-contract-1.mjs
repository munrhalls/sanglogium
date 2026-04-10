// Manual verification for Scope Contract 1 - Basket to Checkout Handshake
// This script will guide through manual verification steps

import { chromium } from 'playwright';

async function manualVerificationGuide() {
  console.log('=== SCOPE CONTRACT 1: MANUAL VERIFICATION GUIDE ===');
  console.log('Foundation: Idempotency + Guest Session');
  console.log('');
  console.log('This script will open a browser and guide you through the verification steps.');
  console.log('Please follow the instructions and verify each step manually.');
  console.log('');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 // Slow down for better observation
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Open console for observation
  page.on('console', msg => {
    console.log(`CONSOLE: ${msg.text()}`);
  });
  
  try {
    console.log('\n=== STEP 1: Add Product to Basket ===');
    console.log('Navigate to products page and add an item to basket');
    
    // Try different product URLs
    const productUrls = [
      'http://localhost:3001/products/headphones',
      'http://localhost:3001/products/accessories',
      'http://localhost:3001/products/audio-electronics'
    ];
    
    let hasProducts = false;
    for (const url of productUrls) {
      await page.goto(url);
      console.log(`\nChecking: ${url}`);
      
      // Wait a moment for page to load
      await page.waitForTimeout(2000);
      
      // Check if there are any products
      const hasAddButtons = await page.locator('.btn-primary').count() > 0;
      
      if (hasAddButtons) {
        console.log('Found products! Clicking first "Add to Basket" button...');
        await page.click('.btn-primary:first-child');
        hasProducts = true;
        break;
      } else {
        console.log('No products found on this page');
      }
    }
    
    if (!hasProducts) {
      console.log('\n=== ISSUE: No products found ===');
      console.log('Please manually add a product to the basket by:');
      console.log('1. Finding a product page with items');
      console.log('2. Clicking "Add to Basket"');
      console.log('3. Then press Enter to continue...');
      await new Promise(resolve => process.stdin.once('data', resolve));
    }
    
    console.log('\n=== STEP 2: Navigate to Basket ===');
    await page.goto('http://localhost:3001/basket');
    console.log('Basket page loaded');
    
    // Wait for basket to load
    await page.waitForTimeout(2000);
    
    // Check if basket has items
    const basketHasItems = await page.locator('.card-base').count() > 0;
    
    if (!basketHasItems) {
      console.log('\n=== ISSUE: Basket is empty ===');
      console.log('The basket appears to be empty.');
      console.log('Please add items manually and press Enter to continue...');
      await new Promise(resolve => process.stdin.once('data', resolve));
    }
    
    console.log('\n=== STEP 3: Verify Initial State ===');
    console.log('Check the following:');
    console.log('1. Checkout button is enabled (not showing "Basket Issues")');
    console.log('2. No error messages visible');
    console.log('3. Console should be clean (no errors)');
    
    // Look for checkout button
    const checkoutButton = page.locator('.btn-primary').first();
    const isDisabled = await checkoutButton.isDisabled();
    const buttonText = await checkoutButton.textContent();
    
    console.log(`\nCheckout button state:`);
    console.log(`- Text: "${buttonText}"`);
    console.log(`- Disabled: ${isDisabled}`);
    
    if (isDisabled || buttonText?.includes('Basket Issues')) {
      console.log('\n=== ISSUE: Checkout button disabled ===');
      console.log('The checkout button is disabled. Check for basket validation errors.');
      await new Promise(resolve => process.stdin.once('data', resolve));
    }
    
    console.log('\n=== STEP 4: Click Checkout Button ===');
    console.log('Watch for the following:');
    console.log('1. Button should disable immediately');
    console.log('2. Console should log "Checkout button clicked"');
    console.log('3. Console should log "Idempotency key: checkout_..."');
    console.log('4. Page should navigate to /checkout/address');
    
    console.log('\nPress Enter to click the checkout button...');
    await new Promise(resolve => process.stdin.once('data', resolve));
    
    // Click checkout button
    await checkoutButton.click();
    
    // Wait for navigation
    try {
      await page.waitForURL('**/checkout/address', { timeout: 5000 });
      console.log('\n=== SUCCESS: Navigated to address page ===');
    } catch (e) {
      console.log('\n=== ISSUE: Navigation failed ===');
      console.log('Did not navigate to address page. Check console for errors.');
    }
    
    console.log('\n=== STEP 5: Verify Address Page ===');
    console.log('Check the following:');
    console.log('1. URL is /checkout/address');
    console.log('2. Address form is visible');
    console.log('3. No console errors');
    
    const currentUrl = page.url();
    console.log(`\nCurrent URL: ${currentUrl}`);
    
    if (currentUrl.includes('/checkout/address')) {
      console.log('=== VERIFICATION PASSED ===');
      console.log('Scope Contract 1 is working correctly!');
    } else {
      console.log('=== VERIFICATION FAILED ===');
      console.log('Navigation to address page failed');
    }
    
    console.log('\n=== FINAL CHECKLIST ===');
    console.log('Please confirm each item:');
    console.log('[ ] Checkout button generates idempotency key');
    console.log('[ ] Button disables during processing');
    console.log('[ ] Navigation to address page successful');
    console.log('[ ] FSM state transitions correctly');
    console.log('[ ] No console errors');
    
    console.log('\nPress Enter to close browser...');
    await new Promise(resolve => process.stdin.once('data', resolve));
    
  } catch (error) {
    console.error('\n=== ERROR ===');
    console.error(error);
    console.log('\nPress Enter to close browser...');
    await new Promise(resolve => process.stdin.once('data', resolve));
  } finally {
    await browser.close();
  }
}

// Run the verification
manualVerificationGuide().catch(console.error);
