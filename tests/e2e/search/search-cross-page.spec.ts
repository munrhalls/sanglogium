import { test, expect } from '@playwright/test';

/**
 * Search Cross-Page Tests
 * Covers: Search functionality from different page types
 */

test.describe('Search - Cross Page Functionality', () => {
  test('search works from product detail page', async ({ page }) => {
    // Navigate to PDP
    await page.goto('/product/sennheiser-hd-569-headphones');
    await page.waitForLoadState('networkidle');

    // Search from PDP
    await page.fill('input[aria-label="Search products"]', 'hd650');
    await page.keyboard.press('Enter');

    // Verify navigation to search results
    await expect(page).toHaveURL('/search?q=hd650');
  });

  test('search works from products listing page', async ({ page }) => {
    // Navigate to PLP
    await page.goto('/products/headphones');
    await page.waitForLoadState('networkidle');

    // Search from PLP
    await page.fill('input[aria-label="Search products"]', 'sennheiser');
    await page.keyboard.press('Enter');

    // Verify navigation
    await expect(page).toHaveURL('/search?q=sennheiser');
  });

  test('search works from search results page', async ({ page }) => {
    // Navigate to search
    await page.goto('/search?q=headphones');
    await page.waitForLoadState('networkidle');

    // Modify search
    await page.fill('[aria-label="Search products"]', 'iem');
    await page.keyboard.press('Enter');

    // Verify URL updated
    await expect(page).toHaveURL('/search?q=iem');
  });
});
