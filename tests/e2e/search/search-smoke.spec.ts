import { test, expect } from '@playwright/test';

/**
 * Search Page Smoke Tests
 * Covers: Page-level integrity, console errors, runtime validation
 * 
 * These tests catch errors that component-level tests miss:
 * - Server/Client Component boundary errors
 * - React hydration errors
 * - JavaScript runtime errors
 * - Console errors and warnings
 */

test.describe('Search Page - Smoke Tests', () => {
  test('search page loads without console errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];

    // Capture console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
        console.log('Console error captured:', msg.text());
      }
    });

    // Capture page JavaScript errors
    page.on('pageerror', (error) => {
      pageErrors.push(error.message);
      console.log('Page error captured:', error.message);
    });

    // Navigate to search page
    await page.goto('/search?q=sennheiser');
    await page.waitForLoadState('networkidle');

    // Give time for any async errors to surface
    await page.waitForTimeout(500);

    // Assert no console errors
    expect(consoleErrors).toHaveLength(0);
    
    // Assert no page errors
    expect(pageErrors).toHaveLength(0);

    // Also verify the page actually rendered content
    await expect(page.locator('[data-testid="product-card"]')).toHaveCount.greaterThan(0);
  });

  test('search page loads without hydration errors', async ({ page }) => {
    const hydrationErrors: string[] = [];

    // Capture hydration-specific errors
    page.on('console', (msg) => {
      const text = msg.text();
      if (text.includes('hydrat') || text.includes('server') || text.includes('client')) {
        hydrationErrors.push(text);
        console.log('Hydration-related console message:', text);
      }
    });

    page.on('pageerror', (error) => {
      const msg = error.message;
      if (msg.includes('hydrat') || msg.includes('server') || msg.includes('client')) {
        hydrationErrors.push(msg);
      }
    });

    await page.goto('/search?q=headphones');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Filter out expected warnings (React dev mode, etc.)
    const criticalErrors = hydrationErrors.filter(err => 
      !err.includes('Download the React DevTools') &&
      !err.includes('strict mode') &&
      !err.includes('[HMR]')
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test('search with empty results loads without errors', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    await page.goto('/search?q=xyznonexistent12345');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    expect(errors).toHaveLength(0);

    // Verify empty state rendered correctly
    await expect(page.locator('text=No products found')).toBeVisible();
  });

  test('search with sort parameter loads without errors', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    await page.goto('/search?q=headphones&sort=displayPrice:desc');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    expect(errors).toHaveLength(0);
  });
});
