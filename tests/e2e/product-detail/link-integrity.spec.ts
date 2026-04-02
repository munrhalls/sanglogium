import { test, expect } from '@playwright/test';
import { TEST_PRODUCT, selectors, navigateToProduct } from '../../utils/product-detail-helpers';

/**
 * Link Integrity Test
 *
 * Validates that all related product links return HTTP 200 (not 404).
 *
 * CRITICAL: This test catches the issue where related products display
 * but clicking them leads to 404 pages (slug mismatch, cache issues, etc.)
 *
 * Test Flow:
 * 1. Navigate to product page
 * 2. Extract all related product links
 * 3. Click each link and verify:
 *    - HTTP response status is 200
 *    - Product page loads (h1 visible)
 *    - No 404 error message
 * 4. Navigate back and test next link
 */
test.describe('Product Detail Page - Link Integrity', () => {

  test('all related product links return HTTP 200', async ({ page }) => {
    // Navigate to product with related products
    await navigateToProduct(page, TEST_PRODUCT.slug);

    // Wait for related products to load
    const relatedSection = page.locator(selectors.relatedProducts);
    await expect(relatedSection).toBeVisible();

    // Get all related product links
    const relatedLinks = page.locator(selectors.relatedProductLink);
    const linkCount = await relatedLinks.count();

    // If no related products, skip test
    if (linkCount === 0) {
      test.skip();
      return;
    }

    expect(linkCount).toBeGreaterThan(0);
    console.log(`Testing ${linkCount} related product links...`);

    // Test each related product link
    for (let i = 0; i < linkCount; i++) {
      const link = relatedLinks.nth(i);
      const href = await link.getAttribute('href');
      const productName = await link.locator('h3').textContent();

      console.log(`  [${i + 1}/${linkCount}] Testing: ${productName} -> ${href}`);

      // Capture HTTP response when clicking
      const [response] = await Promise.all([
        page.waitForResponse(
          resp => resp.url().includes(href!) && resp.request().method() === 'GET',
          { timeout: 10000 }
        ),
        link.click()
      ]);

      // CRITICAL: Verify HTTP status is 200 (not 404)
      expect(
        response.status(),
        `Related product "${productName}" at ${href} returned ${response.status()} (expected 200)`
      ).toBe(200);

      // Verify product page loaded (no 404 message)
      const pageContent = await page.content();
      const has404Message =
        pageContent.includes('This page could not be found') ||
        pageContent.includes('404') && pageContent.includes('Not Found');

      expect(
        has404Message,
        `Product page for "${productName}" shows 404 message`
      ).toBeFalsy();

      // Verify product name is displayed on new page
      const h1 = page.locator('h1');
      await expect(h1).toBeVisible({ timeout: 5000 });

      // Navigate back for next test
      await page.goBack();
      await page.waitForLoadState('networkidle');

      // Verify we're back on original product page
      await expect(page.locator(selectors.productName)).toContainText(TEST_PRODUCT.name);
    }

    console.log(`✅ All ${linkCount} related product links passed!`);
  });

  test('breadcrumb Products link returns HTTP 200', async ({ page }) => {
    await navigateToProduct(page, TEST_PRODUCT.slug);

    // Click Products breadcrumb and verify it doesn't 404
    const productsLink = page.locator('a[href="/products/headphones/dynamic"]:has-text("Products")');
    await expect(productsLink).toBeVisible();

    const [response] = await Promise.all([
      page.waitForResponse(
        resp => resp.url().includes('/products/'),
        { timeout: 10000 }
      ),
      productsLink.click()
    ]);

    // CRITICAL: Verify HTTP status is 200 (not 404)
    expect(
      response.status(),
      `Breadcrumb "Products" link returned ${response.status()} (expected 200)`
    ).toBe(200);
  });

  test('direct navigation to related product URL returns 200', async ({ page }) => {
    // First get related product URLs from the page
    await navigateToProduct(page, TEST_PRODUCT.slug);

    const relatedLinks = page.locator(selectors.relatedProductLink);
    const linkCount = await relatedLinks.count();

    if (linkCount === 0) {
      test.skip();
      return;
    }

    // Get first related product URL
    const firstHref = await relatedLinks.first().getAttribute('href');
    expect(firstHref).toBeTruthy();

    // Navigate directly (simulating bookmark/direct URL access)
    const response = await page.goto(`http://localhost:3000${firstHref}`);

    expect(
      response?.status(),
      `Direct navigation to ${firstHref} returned ${response?.status()}`
    ).toBe(200);

    // Verify product content loaded
    await expect(page.locator('h1')).toBeVisible();
  });

});
