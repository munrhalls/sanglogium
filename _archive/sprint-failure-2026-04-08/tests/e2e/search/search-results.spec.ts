import { test, expect } from '@playwright/test';

/**
 * Search Results Page Tests
 * Covers: URL params, sorting, empty states, persistence
 */

test.describe('Search Results Page', () => {
  test('URL param parsing renders products', async ({ page }) => {
    // Navigate to search with query
    await page.goto('/search?q=Sennheiser');
    await page.waitForLoadState('networkidle');

    // Verify products displayed
    await expect(page.locator('[data-testid="product-card"]')).toHaveCount.greaterThan(0);

    // Verify heading contains query
    await expect(page.locator('h1')).toContainText('SENNHEISER');
  });

  test('sort parameter reorders results', async ({ page }) => {
    // Navigate with sort param
    await page.goto('/search?q=headphones&sort=displayPrice:desc');
    await page.waitForLoadState('networkidle');

    // Get all prices
    const priceElements = page.locator('[data-testid="product-price"]');
    const count = await priceElements.count();

    // Skip if no products
    if (count === 0) {
      test.skip();
      return;
    }

    // Parse prices
    const prices: number[] = [];
    for (let i = 0; i < count; i++) {
      const text = await priceElements.nth(i).textContent();
      const price = parseFloat(text?.replace('$', '').replace(',', '') || '0');
      prices.push(price);
    }

    // Verify descending order
    for (let i = 0; i < prices.length - 1; i++) {
      expect(prices[i]).toBeGreaterThanOrEqual(prices[i + 1]);
    }
  });

  test('empty results shows recovery options', async ({ page }) => {
    // Navigate with nonsense query
    await page.goto('/search?q=xyznonexistent12345');
    await page.waitForLoadState('networkidle');

    // Verify empty state message
    await expect(page.locator('text=No products found')).toBeVisible();

    // Verify recovery link
    const recoveryLink = page.locator('text=Browse all products');
    await expect(recoveryLink).toBeVisible();

    // Click recovery link
    await recoveryLink.click();

    // Verify navigation
    await expect(page).toHaveURL('/products');
  });

  test('query persists after page refresh', async ({ page }) => {
    // Navigate to search
    await page.goto('/search?q=sennheiser');
    await page.waitForLoadState('networkidle');

    // Verify input has value
    await expect(page.locator('input[aria-label="Search products"]')).toHaveValue('sennheiser');

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify input still has value
    await expect(page.locator('input[aria-label="Search products"]')).toHaveValue('sennheiser');
  });

  test('in-page search updates URL', async ({ page }) => {
    // Navigate to search
    await page.goto('/search?q=headphones');
    await page.waitForLoadState('networkidle');

    // Clear and type new query
    await page.fill('input[aria-label="Search products"]', 'sennheiser');

    // Submit
    await page.keyboard.press('Enter');

    // Verify URL updated
    await expect(page).toHaveURL('/search?q=sennheiser');
  });
});
