import { test, expect } from '@playwright/test';

test.describe('basket regression', () => {
  test.beforeEach(async ({ page }) => {
    // Clear basket before each test
    await page.goto('/basket');
    await page.waitForLoadState('networkidle');
  });

  test('loading skeleton appears during fresh data fetch', async ({ page }) => {
    // Add product to basket first
    await page.goto('/product/test-product');
    await page.waitForLoadState('networkidle');
    
    // Click add to cart
    await page.click('button:has-text("Add to Cart")');
    
    // Navigate to basket
    await page.goto('/basket');
    
    // Verify loading skeleton is present (aria-busy="true")
    const loadingSkeleton = page.locator('[aria-busy="true"][aria-label="Loading basket"]');
    await expect(loadingSkeleton).toBeVisible();
    
    // Wait for loading to complete
    await page.waitForSelector('[aria-busy="true"]', { state: 'hidden', timeout: 10000 });
  });

  test('increment button disabled when quantity equals stock', async ({ page }) => {
    // Navigate to product page with known stock
    await page.goto('/product/test-product');
    await page.waitForLoadState('networkidle');
    
    // Add product to basket
    await page.click('button:has-text("Add to Cart")');
    
    // Navigate to basket
    await page.goto('/basket');
    await page.waitForLoadState('networkidle');
    
    // Wait for fresh data fetch to complete
    await page.waitForSelector('[aria-busy="true"]', { state: 'hidden', timeout: 10000 });
    
    // Get the basket item and increment to stock limit
    const incrementButton = page.locator('[data-testid^="basket-item-"] button').first();
    
    // Increment until stock limit (assuming stock is known from test data)
    // This test assumes test product has stock of 10
    for (let i = 0; i < 9; i++) {
      await incrementButton.click();
    }
    
    // Verify increment button is disabled at stock limit
    await expect(incrementButton).toBeDisabled();
  });

  test('decrement button removes item when quantity is 1', async ({ page }) => {
    // Add product to basket
    await page.goto('/product/test-product');
    await page.waitForLoadState('networkidle');
    await page.click('button:has-text("Add to Cart")');
    
    // Navigate to basket
    await page.goto('/basket');
    await page.waitForLoadState('networkidle');
    
    // Wait for fresh data fetch to complete
    await page.waitForSelector('[aria-busy="true"]', { state: 'hidden', timeout: 10000 });
    
    // Click decrement button
    const decrementButton = page.locator('[data-testid^="basket-item-"] button').first();
    await decrementButton.click();
    
    // Verify item is removed from basket
    const basketItem = page.locator('[data-testid^="basket-item-"]');
    await expect(basketItem).toHaveCount(0);
  });

  test('remove button removes item from basket', async ({ page }) => {
    // Add product to basket
    await page.goto('/product/test-product');
    await page.waitForLoadState('networkidle');
    await page.click('button:has-text("Add to Cart")');
    
    // Navigate to basket
    await page.goto('/basket');
    await page.waitForLoadState('networkidle');
    
    // Wait for fresh data fetch to complete
    await page.waitForSelector('[aria-busy="true"]', { state: 'hidden', timeout: 10000 });
    
    // Click remove button (X icon)
    const removeButton = page.locator('button[aria-label*="Remove"]');
    await removeButton.click();
    
    // Verify item is removed from basket
    const basketItem = page.locator('[data-testid^="basket-item-"]');
    await expect(basketItem).toHaveCount(0);
  });

  test('ActionBar shows correct basket count badge', async ({ page }) => {
    // Add product to basket
    await page.goto('/product/test-product');
    await page.waitForLoadState('networkidle');
    await page.click('button:has-text("Add to Cart")');
    
    // Navigate to basket to trigger fresh fetch
    await page.goto('/basket');
    await page.waitForLoadState('networkidle');
    
    // Wait for fresh data fetch to complete
    await page.waitForSelector('[aria-busy="true"]', { state: 'hidden', timeout: 10000 });
    
    // Navigate to home page to see ActionBar
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Verify ActionBar basket count badge shows 1
    const basketBadge = page.locator('.fixed.bottom-0 span:has-text("1")');
    await expect(basketBadge).toBeVisible();
  });

  test('quantity changes persist after page refresh', async ({ page }) => {
    // Add product to basket
    await page.goto('/product/test-product');
    await page.waitForLoadState('networkidle');
    await page.click('button:has-text("Add to Cart")');
    
    // Navigate to basket
    await page.goto('/basket');
    await page.waitForLoadState('networkidle');
    
    // Wait for fresh data fetch to complete
    await page.waitForSelector('[aria-busy="true"]', { state: 'hidden', timeout: 10000 });
    
    // Increment quantity
    const incrementButton = page.locator('[data-testid^="basket-item-"] button').first();
    await incrementButton.click();
    await incrementButton.click();
    
    // Refresh page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Wait for fresh data fetch to complete
    await page.waitForSelector('[aria-busy="true"]', { state: 'hidden', timeout: 10000 });
    
    // Verify quantity is still 3 (1 initial + 2 increments)
    const quantityDisplay = page.locator('[data-testid^="basket-item-"]').first();
    await expect(quantityDisplay).toContainText('× 3');
  });
});
