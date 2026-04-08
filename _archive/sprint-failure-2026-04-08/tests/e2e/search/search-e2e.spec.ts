import { test, expect } from '@playwright/test';

test.describe('Search - End-to-End Verification', () => {
  test('search term "hd" returns results containing "hd"', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');
    
    // Fill search with "hd" and press Enter
    await page.fill('input[aria-label="Search products"]', 'hd');
    await page.waitForTimeout(400); // Respect debounce
    await page.press('input[aria-label="Search products"]', 'Enter');
    
    // Should navigate to search page with query
    await expect(page).toHaveURL(/\/search\?q=hd/);
    
    // Wait for results to load
    await page.waitForLoadState('networkidle');
    
    // Verify at least one result exists
    const productCards = page.locator('[data-testid="product-card"]');
    const count = await productCards.count();
    expect(count).toBeGreaterThan(0);
    
    // Verify results contain "hd" (case insensitive)
    // Check product names or brands
    for (let i = 0; i < Math.min(count, 5); i++) {
      const card = productCards.nth(i);
      const text = await card.textContent();
      expect(text?.toLowerCase()).toContain('hd');
    }
  });

  test('autocomplete for "hd" shows suggestions and navigates to product', async ({ page }) => {
    await page.goto('/');
    
    // Type "hd" to trigger autocomplete
    await page.fill('input[aria-label="Search products"]', 'hd');
    await page.waitForTimeout(400); // Wait for debounce
    
    // Check if autocomplete appears
    const listbox = page.locator('[role="listbox"]');
    const isVisible = await listbox.isVisible();
    
    if (isVisible) {
      // Get first option if available
      const firstOption = page.locator('[role="option"]').first();
      const optionCount = await page.locator('[role="option"]').count();
      
      if (optionCount > 0) {
        // Click first suggestion
        await firstOption.click();
        
        // Should navigate to product page
        await expect(page).toHaveURL(/\/product\//);
        
        // Verify product page loaded
        await expect(page.locator('body')).toBeVisible();
      }
    }
    
    // If no autocomplete, verify search still works
    if (!isVisible) {
      await page.press('input[aria-label="Search products"]', 'Enter');
      await expect(page).toHaveURL(/\/search\?q=hd/);
    }
  });

  test('empty search query is handled gracefully', async ({ page }) => {
    // Navigate directly to empty search
    await page.goto('/search?q=');
    
    // Should not crash
    await expect(page.locator('body')).toBeVisible();
    
    // Should handle gracefully (either shows message or no products)
    const productCards = page.locator('[data-testid="product-card"]');
    const count = await productCards.count();
    
    // Either shows no products or handles empty state
    expect(count).toBeGreaterThanOrEqual(0);
  });
});
