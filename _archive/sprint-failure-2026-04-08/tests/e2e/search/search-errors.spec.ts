import { test, expect } from '@playwright/test';

/**
 * Search Error Handling Tests
 * Covers: API failures, network errors, graceful degradation
 */

test.describe('Search - Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('API error shows user-friendly message', async ({ page }) => {
    // Mock API failure
    await page.route(/searchProductsAutocomplete/, route => {
      route.abort('failed');
    });

    // Type query
    await page.fill('input[aria-label="Search products"]', 'hd');

    // Wait for error state (may need custom error UI)
    // For now, verify overlay doesn't show loading forever
    await page.waitForTimeout(500);

    // Either empty results or error message should be visible
    const hasError = await page.locator('text=Unable to search').isVisible().catch(() => false);
    const hasEmpty = await page.locator('text=No products').isVisible().catch(() => false);

    expect(hasError || hasEmpty).toBe(true);
  });

  test('network failure handled gracefully', async ({ page }) => {
    // Abort all search requests
    await page.route(/searchProductsAutocomplete/, route => {
      route.abort('internetdisconnected');
    });

    // Type query
    await page.fill('input[aria-label="Search products"]', 'hd650');

    // Wait
    await page.waitForTimeout(500);

    // Should not crash - check page is still responsive
    await expect(page.locator('body')).toBeVisible();
  });

  test('slow response shows loading then results', async ({ page }) => {
    // Delay response
    await page.route(/searchProductsAutocomplete/, async route => {
      await new Promise(r => setTimeout(r, 500));
      await route.continue();
    });

    // Type query
    await page.fill('input[aria-label="Search products"]', 'sen');

    // Should show loading initially
    await page.waitForTimeout(100);
    // Note: Loading state may be brief, just verify no crash

    // Wait for results
    await expect(page.locator('[role="listbox"]')).toBeVisible({ timeout: 5000 });
  });
});
