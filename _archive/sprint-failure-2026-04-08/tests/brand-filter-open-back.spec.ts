import { test, expect } from '@playwright/test';

test('brand filter shows only brand products from subcategory', async ({ page }) => {
  // BEFORE-STATE: Open Back subcategory page
  await page.goto('http://localhost:3000/products/headphones/open-back');

  // Wait for page to load
  await page.waitForLoadState('networkidle');

  // TARGET ELEMENT: Audeze brand filter in sidebar
  const brandFilter = page.locator('[data-testid="filter-sidebar"] label').filter({ hasText: 'Audeze' }).first();

  // USER ACTION: Click Audeze brand filter
  await brandFilter.click();

  // AFTER-STATE: Verify URL contains filter parameter
  expect(page.url()).toContain('f=brand:Audeze');
});
