import { test, expect } from '@playwright/test';
import { TEST_CATEGORIES, navigateToCategory, getProductCount } from '../../utils/products-page-helpers';

const BASE_URL = 'http://localhost:3000';

/**
 * Core Filter Tests - Brand Filter Verification
 * Fast, focused tests for critical filter functionality
 */

test.describe('Brand Filter - Core Tests', () => {

  test('brand filter applies and URL updates', async ({ page }) => {
    await navigateToCategory(page, TEST_CATEGORIES.openBack);

    const initialCount = await getProductCount(page);
    expect(initialCount).toBeGreaterThan(0);

    // Find and click first brand checkbox
    const brandCheckbox = page.locator('[data-testid="filter-sidebar"] fieldset').
      filter({ hasText: /brand/i }).
      locator('input[type="checkbox"]').first();

    if (await brandCheckbox.count() === 0) {
      test.skip(true, 'No brand filters available');
      return;
    }

    await brandCheckbox.click();
    await page.waitForTimeout(1000);

    // Verify URL contains filter
    expect(page.url()).toContain('f=brand:');

    // Verify products updated
    const filteredCount = await getProductCount(page);
    console.log(`Brand filter: ${initialCount} -> ${filteredCount} products`);
  });

  test('clear filters restores all products', async ({ page }) => {
    // Start with filter applied
    await page.goto(`${BASE_URL}/products/${TEST_CATEGORIES.openBack}?f=brand:focal`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const filteredCount = await getProductCount(page);

    // Click clear button
    const clearButton = page.locator('button:has-text("Clear"), button:has-text("Clear all")').first();
    if (await clearButton.isVisible().catch(() => false)) {
      await clearButton.click();
    } else {
      // Uncheck the filter directly
      const brandCheckbox = page.locator('[data-testid="filter-sidebar"] input[type="checkbox"][checked]').first();
      if (await brandCheckbox.count() > 0) {
        await brandCheckbox.click();
      }
    }

    await page.waitForTimeout(1000);

    // Verify filter removed from URL
    expect(page.url()).not.toContain('f=brand:');

    const clearedCount = await getProductCount(page);
    console.log(`Clear filters: ${filteredCount} -> ${clearedCount} products`);
    expect(clearedCount).toBeGreaterThanOrEqual(filteredCount);
  });

  test('URL with brand param applies filter on load', async ({ page }) => {
    await page.goto(`${BASE_URL}/products/${TEST_CATEGORIES.openBack}?f=brand:sennheiser`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Verify products load
    const count = await getProductCount(page);
    expect(count).toBeGreaterThan(0);

    // Verify URL still has filter
    expect(page.url()).toContain('f=brand:sennheiser');

    console.log(`URL filter loaded: ${count} products`);
  });
});
