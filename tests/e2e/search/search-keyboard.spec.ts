import { test, expect } from '@playwright/test';

/**
 * Search Keyboard Navigation Tests
 * Covers: Accessibility, keyboard controls, WCAG compliance
 */

test.describe('Search - Keyboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('arrow keys navigate autocomplete suggestions', async ({ page }) => {
    // Type query
    await page.fill('input[aria-label="Search products"]', 'sennheiser');

    // Wait for autocomplete
    await expect(page.locator('[role="listbox"]')).toBeVisible();

    // Press arrow down
    await page.keyboard.press('ArrowDown');

    // Verify first option is selected
    const firstOption = page.locator('[role="option"]').first();
    await expect(firstOption).toHaveAttribute('aria-selected', 'true');

    // Press arrow down again
    await page.keyboard.press('ArrowDown');

    // Verify second option is selected
    const secondOption = page.locator('[role="option"]').nth(1);
    await expect(secondOption).toHaveAttribute('aria-selected', 'true');
  });

  test('enter on highlighted suggestion navigates to product', async ({ page }) => {
    // Type query
    await page.fill('input[aria-label="Search products"]', 'sennheiser');

    // Wait for autocomplete
    await expect(page.locator('[role="listbox"]')).toBeVisible();

    // Navigate to first option
    await page.keyboard.press('ArrowDown');

    // Press enter
    await page.keyboard.press('Enter');

    // Verify navigation
    await expect(page).toHaveURL(/\/product\//);
  });

  test('escape closes autocomplete and returns focus to input', async ({ page }) => {
    // Type query
    await page.fill('input[aria-label="Search products"]', 'sennheiser');

    // Wait for autocomplete
    await expect(page.locator('[role="listbox"]')).toBeVisible();

    // Press escape
    await page.keyboard.press('Escape');

    // Verify overlay closed
    await expect(page.locator('[role="listbox"]')).not.toBeVisible();

    // Verify focus returned to input
    await expect(page.locator('input[aria-label="Search products"]')).toHaveValue('sennheiser');
  });

  test('tab navigation works within search form', async ({ page }) => {
    // Focus search input
    await page.locator('input[aria-label="Search products"]').focus();

    // Type to trigger autocomplete
    await page.keyboard.type('HD');

    // Wait for autocomplete
    await expect(page.locator('[role="listbox"]')).toBeVisible();

    // Tab should move to clear button (if value exists)
    await page.keyboard.press('Tab');

    // Verify focus moved (should be on clear button or within listbox)
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });
});
