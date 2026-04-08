import { test, expect } from '@playwright/test';

/**
 * Search Field Core Tests
 * Covers: Autocomplete behavior, navigation, debounce, empty states
 */

test.describe('Search Field - Core Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('typing valid query shows suggestions and navigates on click', async ({ page }) => {
    // Type a known product query
    await page.fill('input[aria-label="Search products"]', 'HD 569');

    // Wait for autocomplete overlay
    await expect(page.locator('[role="listbox"]')).toBeVisible();

    // Click first suggestion
    await page.click('[role="option"]:has-text("Sennheiser HD 569")');

    // Verify navigation to product page
    await expect(page).toHaveURL('/product/sennheiser-hd-569-headphones');

    // Verify product name displayed
    await expect(page.locator('h1')).toContainText('Sennheiser HD 569');
  });

  test('typing 1 character does not trigger API call', async ({ page }) => {
    // Track API requests
    let requestCount = 0;
    await page.route(/searchProductsAutocomplete/, () => {
      requestCount++;
    });

    // Type single character
    await page.fill('input[aria-label="Search products"]', 'h');

    // Wait longer than debounce period
    await page.waitForTimeout(400);

    // Verify no API calls made
    expect(requestCount).toBe(0);
  });

  test('no results shows empty state with recovery', async ({ page }) => {
    // Type nonsense query
    await page.fill('input[aria-label="Search products"]', 'xyznonexistent12345');

    // Wait for autocomplete
    await expect(page.locator('[role="listbox"]')).toBeVisible();

    // Verify empty state message
    await expect(page.locator('text=No products match')).toBeVisible();

    // Verify recovery link exists
    const viewAllLink = page.locator('text=View all results');
    await expect(viewAllLink).toBeVisible();
  });

  test('search icon submits to results page', async ({ page }) => {
    // Fill search input
    await page.fill('input[aria-label="Search products"]', 'sennheiser');

    // Submit form (Enter key)
    await page.keyboard.press('Enter');

    // Verify navigation to search results
    await expect(page).toHaveURL('/search?q=sennheiser');

    // Verify results page loaded
    await expect(page.locator('h1')).toContainText('SENNHEISER');
  });
});
