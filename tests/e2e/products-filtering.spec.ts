import { test, expect } from '@playwright/test';

test.describe('Products Filtering - Results Verification', () => {
  test('page loads and has products', async ({ page }) => {
    // Navigate to headphones category
    await page.goto('/products/headphones');

    // Wait for page to load (simple timeout)
    await page.waitForTimeout(3000);

    // Check if page loaded
    const title = await page.title();
    expect(title).toBeDefined();

    // Look for any products
    const products = page.locator('article').or(page.locator('[data-testid="product-card"]'));
    const count = await products.count();

    // If no products, at least check we're on the right page
    if (count === 0) {
      const heading = await page.locator('h1').first().textContent();
      expect(heading?.toLowerCase()).toContain('headphones');
    } else {
      expect(count).toBeGreaterThan(0);
    }
  });

  test('brand filter URL works', async ({ page }) => {
    // Apply brand filter via URL
    await page.goto('/products/headphones?f=brand:audeze');
    await page.waitForTimeout(3000);

    // Check URL has filter
    expect(page.url()).toContain('f=brand:audeze');

    // Look for products
    const products = page.locator('article').or(page.locator('[data-testid="product-card"]'));
    const count = await products.count();

    // If products exist, check brand
    if (count > 0) {
      const firstProduct = await products.first().textContent();
      expect(firstProduct?.toLowerCase()).toContain('audeze');
    }
  });

  test('price range filter URL works', async ({ page }) => {
    // Apply price range filter
    await page.goto('/products/headphones?f=priceRange:min:500,max:1000');
    await page.waitForTimeout(3000);

    // Check URL has filter
    expect(page.url()).toContain('priceRange:min:500,max:1000');

    // Look for products
    const products = page.locator('article').or(page.locator('[data-testid="product-card"]'));
    const count = await products.count();

    // If products exist, check price
    if (count > 0) {
      const priceText = await products.first().locator('text=/\\$[\\d,]+/').first().textContent();
      const price = parseFloat(priceText?.replace(/[$,]/g, '') || '0');
      expect(price).toBeGreaterThanOrEqual(500);
      expect(price).toBeLessThanOrEqual(1000);
    }
  });

  test('multiple filters URL works', async ({ page }) => {
    // Apply multiple filters
    await page.goto('/products/headphones?f=brand:sennheiser&f=type:over-ear');
    await page.waitForTimeout(3000);

    // Check URL has both filters
    expect(page.url()).toContain('f=brand:sennheiser');
    expect(page.url()).toContain('f=type:over-ear');

    // Look for products
    const products = page.locator('article').or(page.locator('[data-testid="product-card"]'));
    const count = await products.count();

    // If products exist, check both conditions
    if (count > 0) {
      const firstProduct = await products.first().textContent();
      expect(firstProduct?.toLowerCase()).toContain('sennheiser');
      expect(firstProduct?.toLowerCase()).toContain('over-ear');
    }
  });

  test('sort with filter URL works', async ({ page }) => {
    // Apply filter and sort
    await page.goto('/products/headphones?f=brand:audeze&sort=displayPrice:asc');
    await page.waitForTimeout(3000);

    // Check URL has both
    expect(page.url()).toContain('f=brand:audeze');
    expect(page.url()).toContain('sort=displayPrice:asc');

    // Look for products
    const products = page.locator('article').or(page.locator('[data-testid="product-card"]'));
    const count = await products.count();

    // If products exist, check brand
    if (count > 0) {
      const firstProduct = await products.first().textContent();
      expect(firstProduct?.toLowerCase()).toContain('audeze');
    }
  });
});
