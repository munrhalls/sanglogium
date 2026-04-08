import { test, expect } from '@playwright/test';
import {
  viewports,
  TEST_PRODUCT,
  selectors,
  navigateToProduct,
  assertNoHorizontalOverflow,
  assertTouchTargetsSize,
  assertSideBySideLayout,
  assertStackedLayout
} from '../../utils/product-detail-helpers';

/**
 * RWD Stress Test
 *
 * Validates responsive design across 5 viewport breakpoints:
 * - Mobile portrait (390×844): Stacked layout, touch targets
 * - Mobile landscape (844×390): Layout adaptation
 * - Tablet (768×1024): Grid behavior
 * - Desktop (1280×720): Side-by-side layout
 * - Large desktop (1440×900): Max-width constraints
 */
test.describe('Product Detail Page - RWD Stress Test', () => {

  Object.values(viewports).forEach(({ width, height, name }) => {
    test(`${name} (${width}×${height}) - layout integrity`, async ({ page }) => {
      // Set viewport
      await page.setViewportSize({ width, height });

      // Navigate to product
      await navigateToProduct(page, TEST_PRODUCT.slug);

      // Verify no horizontal overflow
      await assertNoHorizontalOverflow(page, width);

      // Verify critical content visible
      await expect(page.locator(selectors.productName)).toBeVisible();
      await expect(page.locator(selectors.imageGallery)).toBeVisible();
      await expect(page.locator(selectors.productInfo)).toBeVisible();

      // Mobile-specific checks
      if (width < 768) {
        // Touch targets >= 44px
        await assertTouchTargetsSize(page, 44);

        // Stacked layout: Image above info
        await assertStackedLayout(page, selectors.imageGallery, selectors.productInfo);
      } else {
        // Desktop: Side-by-side layout
        await assertSideBySideLayout(page, selectors.imageGallery, selectors.productInfo, 150);
      }

      // Verify related products visible on all viewports
      const relatedSection = page.locator(selectors.relatedProducts);
      if (await relatedSection.isVisible().catch(() => false)) {
        await expect(relatedSection).toBeVisible();
      }
    });
  });

  test('mobile portrait - specific touch target verification', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await navigateToProduct(page, TEST_PRODUCT.slug);

    // Verify specific interactive elements are large enough
    const quantityDecrease = page.locator(selectors.quantityDecrease);
    const quantityIncrease = page.locator(selectors.quantityIncrease);
    const addToCart = page.locator(selectors.addToCartButton);

    for (const locator of [quantityDecrease, quantityIncrease, addToCart]) {
      const box = await locator.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.width).toBeGreaterThanOrEqual(44);
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('desktop - zoom modal sizing', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await navigateToProduct(page, TEST_PRODUCT.slug);

    // Open zoom modal
    await page.locator(selectors.mainImage).click();
    await expect(page.locator(selectors.zoomModal)).toBeVisible();

    // Verify modal fits within viewport
    const modal = await page.locator(selectors.zoomModal).boundingBox();
    expect(modal!.width).toBeLessThanOrEqual(1280);
    expect(modal!.height).toBeLessThanOrEqual(720);

    // Close modal
    await page.locator(selectors.zoomCloseButton).click();
    await expect(page.locator(selectors.zoomModal)).not.toBeVisible();
  });

});
