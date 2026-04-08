import { test, expect } from '@playwright/test';

/**
 * Search Mobile Tests
 * Covers: Mobile overlay, focus management, touch interactions
 */

test.describe('Search - Mobile Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('mobile search icon opens full-screen overlay', async ({ page }) => {
    // Click search icon
    await page.click('[aria-label="Open search"]');

    // Verify mobile overlay opened
    await expect(page.locator('[aria-label="Close search"]')).toBeVisible();
    await expect(page.locator('input[aria-label="Search products"]')).toBeVisible();
  });

  test('mobile input is auto-focused on expand', async ({ page }) => {
    // Click search icon
    await page.click('[aria-label="Open search"]');

    // Verify input is focused
    await expect(page.locator('input[aria-label="Search products"]')).toBeFocused();
  });

  test('mobile overlay closes on result click', async ({ page }) => {
    // Open search
    await page.click('[aria-label="Open search"]');

    // Type query
    await page.fill('input[aria-label="Search products"]', 'HD 569');

    // Wait for suggestions
    await expect(page.locator('[role="listbox"]')).toBeVisible();

    // Click first suggestion
    await page.click('[role="option"]:first-child');

    // Verify navigation to product
    await expect(page).toHaveURL(/\/product\//);
  });

  test('mobile back button closes overlay', async ({ page }) => {
    // Open search
    await page.click('[aria-label="Open search"]');

    // Verify overlay is open
    await expect(page.locator('[aria-label="Close search"]')).toBeVisible();

    // Click back button
    await page.click('[aria-label="Close search"]');

    // Verify overlay closed
    await expect(page.locator('[aria-label="Open search"]')).toBeVisible();
  });
});
