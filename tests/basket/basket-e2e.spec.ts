import { test, expect } from '@playwright/test';

test.describe('Basket E2E Smoke Tests', () => {
  test('Add product from PDP → navigate to basket → item visible', async ({ page }) => {
    // Navigate to a product page
    await page.goto('/products/headphones/open-back/hifiman-sundara');
    
    // Wait for product info to load
    await page.waitForSelector('[data-testid="product-info"]', { timeout: 10000 });
    
    // Get product name
    const productName = await page.locator('h1').textContent();
    expect(productName).toBeTruthy();
    
    // Click add to cart
    await page.click('button:has-text("Add to Cart")');
    
    // Navigate to basket
    await page.goto('/basket');
    
    // Verify item is visible with correct name
    await page.waitForSelector('text=' + productName!, { timeout: 5000 });
    expect(await page.isVisible('text=' + productName!)).toBe(true);
  });

  test('Increment quantity on basket page → total updates', async ({ page }) => {
    // First add an item
    await page.goto('/products/headphones/open-back/hifiman-sundara');
    await page.waitForSelector('[data-testid="product-info"]', { timeout: 10000 });
    await page.click('button:has-text("Add to Cart")');
    
    // Go to basket
    await page.goto('/basket');
    await page.waitForSelector('text=Purchase quantity:', { timeout: 5000 });
    
    // Get initial subtotal
    const initialSubtotal = await page.locator('text=/Subtotal.*\\$\\d+\\.\\d+/').textContent();
    
    // Click increase quantity (+ button)
    await page.click('button[aria-label="Increase quantity"]');
    
    // Wait a moment for update
    await page.waitForTimeout(500);
    
    // Verify subtotal updated (should be different)
    const newSubtotal = await page.locator('text=/Subtotal.*\\$\\d+\\.\\d+/').textContent();
    expect(newSubtotal).not.toBe(initialSubtotal);
  });

  test('Remove item → empty basket state shown', async ({ page }) => {
    // First add an item
    await page.goto('/products/headphones/open-back/hifiman-sundara');
    await page.waitForSelector('[data-testid="product-info"]', { timeout: 10000 });
    await page.click('button:has-text("Add to Cart")');
    
    // Go to basket
    await page.goto('/basket');
    await page.waitForSelector('text=Purchase quantity:', { timeout: 5000 });
    
    // Click remove button (X)
    await page.click('button[aria-label="Remove from basket"]');
    
    // Verify empty basket state
    await page.waitForSelector('text=Your basket is empty', { timeout: 5000 });
    expect(await page.isVisible('text=Your basket is empty')).toBe(true);
  });

  test('Refresh page → basket persists', async ({ page }) => {
    // First add an item
    await page.goto('/products/headphones/open-back/hifiman-sundara');
    await page.waitForSelector('[data-testid="product-info"]', { timeout: 10000 });
    const productName = await page.locator('h1').textContent();
    await page.click('button:has-text("Add to Cart")');
    
    // Go to basket
    await page.goto('/basket');
    await page.waitForSelector('text=Purchase quantity:', { timeout: 5000 });
    
    // Refresh page
    await page.reload();
    
    // Verify item still present after reload
    await page.waitForSelector('text=' + productName!, { timeout: 5000 });
    expect(await page.isVisible('text=' + productName!)).toBe(true);
  });
});
