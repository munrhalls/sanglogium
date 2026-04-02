/**
 * Product Detail Page Test Helpers
 * Shared utilities for PDP E2E tests
 */

import { Page, Locator } from '@playwright/test';

/**
 * Standard viewport sizes for RWD testing
 */
export const viewports = {
  mobilePortrait: { width: 390, height: 844, name: 'mobile-portrait' },
  mobileLandscape: { width: 844, height: 390, name: 'mobile-landscape' },
  tablet: { width: 768, height: 1024, name: 'tablet' },
  desktop: { width: 1280, height: 720, name: 'desktop' },
  largeDesktop: { width: 1440, height: 900, name: 'large-desktop' },
} as const;

/**
 * Test product slug for consistent test data
 * Using a product with related products (verified from screenshot)
 */
export const TEST_PRODUCT = {
  slug: 'sennheiser-hd-569-headphones',
  name: 'Sennheiser HD 569 Headphones',
  brand: 'Sennheiser',
} as const;

/**
 * Data-testid selectors for component targeting
 */
export const selectors = {
  // Product Info
  productInfo: '[data-testid="product-info"]',
  productName: 'h1',
  productPrice: '[data-testid="price"]',
  productBrand: '[data-testid="product-brand"]',
  productSku: '[data-testid="product-sku"]',
  productStock: '[data-testid="product-stock"]',

  // Quantity Selector
  quantityDecrease: '[aria-label="Decrease quantity"]',
  quantityIncrease: '[aria-label="Increase quantity"]',
  quantityValue: '[data-testid="quantity"]',

  // Add to Cart
  addToCartButton: 'button:has-text("Add to Cart")',
  outOfStockButton: 'button:has-text("Out of Stock")',
  cartCount: '[data-testid="cart-count"]',

  // Image Gallery
  imageGallery: '[data-testid="image-gallery"]',
  mainImage: '[data-testid="main-image"]',
  imageGalleryPlaceholder: '[data-testid="image-gallery-placeholder"]',
  thumbnailButton: (index: number) => `[aria-label="View image ${index}"]`,
  zoomModal: '[role="dialog"]',
  zoomCloseButton: '[aria-label="Close zoom view"]',

  // Related Products
  relatedProducts: '[data-testid="related-products"]',
  relatedProductCard: '[data-testid="related-products"] article',
  relatedProductLink: '[data-testid="related-products"] a',

  // Breadcrumbs
  breadcrumbHome: 'a[href="/"]',
  breadcrumbProducts: 'a[href="/products/headphones"]',

  // Specifications
  specificationsSection: '[data-testid="specifications"]',
} as const;

/**
 * Navigate to a product page and wait for load
 */
export async function navigateToProduct(page: Page, slug: string = TEST_PRODUCT.slug): Promise<void> {
  await page.goto(`/product/${slug}`);
  await page.waitForLoadState('networkidle');
}

/**
 * Check for horizontal overflow (content wider than viewport)
 */
export async function assertNoHorizontalOverflow(page: Page, viewportWidth: number): Promise<void> {
  const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
  if (bodyWidth > viewportWidth + 1) {
    throw new Error(`Horizontal overflow detected: body width ${bodyWidth}px > viewport ${viewportWidth}px`);
  }
}

/**
 * Verify all interactive elements meet minimum touch target size (44x44px)
 */
export async function assertTouchTargetsSize(page: Page, minSize: number = 44): Promise<void> {
  const interactiveElements = page.locator('button, a, [role="button"], input, select, textarea');
  const count = await interactiveElements.count();

  const violations: string[] = [];

  for (let i = 0; i < count; i++) {
    const element = interactiveElements.nth(i);
    const box = await element.boundingBox();

    if (box && box.width > 0 && box.height > 0) {
      if (box.width < minSize || box.height < minSize) {
        const tagName = await element.evaluate(el => el.tagName);
        violations.push(`${tagName} element at (${box.x}, ${box.y}): ${box.width}x${box.height}px`);
      }
    }
  }

  if (violations.length > 0) {
    throw new Error(`Touch target violations (${violations.length}):\n${violations.join('\n')}`);
  }
}

/**
 * Get element Y position for layout verification
 */
export async function getElementYPosition(locator: Locator): Promise<number> {
  const box = await locator.boundingBox();
  if (!box) {
    throw new Error(`Element not found or not visible`);
  }
  return box.y;
}

/**
 * Check if two elements are side-by-side (Y positions within tolerance)
 */
export async function assertSideBySideLayout(
  page: Page,
  selector1: string,
  selector2: string,
  tolerance: number = 100
): Promise<void> {
  const y1 = await getElementYPosition(page.locator(selector1).first());
  const y2 = await getElementYPosition(page.locator(selector2).first());
  const diff = Math.abs(y1 - y2);

  if (diff > tolerance) {
    throw new Error(`Elements not side-by-side: Y diff = ${diff}px (tolerance: ${tolerance}px)`);
  }
}

/**
 * Check if elements are stacked (first Y < second Y)
 */
export async function assertStackedLayout(
  page: Page,
  topSelector: string,
  bottomSelector: string
): Promise<void> {
  const topY = await getElementYPosition(page.locator(topSelector).first());
  const bottomY = await getElementYPosition(page.locator(bottomSelector).first());

  if (topY >= bottomY) {
    throw new Error(`Elements not stacked: ${topSelector} Y=${topY} >= ${bottomSelector} Y=${bottomY}`);
  }
}

/**
 * Retry an assertion with exponential backoff
 */
export async function retryAssertion<T>(
  assertion: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 500
): Promise<T> {
  let lastError: Error | undefined;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await assertion();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }

  throw lastError;
}

/**
 * Console error collector for test diagnostics
 */
export function createConsoleErrorCollector(page: Page): { errors: string[]; start: () => void; stop: () => void } {
  const errors: string[] = [];

  const handler = (msg: { type: () => string; text: () => string }) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  };

  return {
    errors,
    start: () => page.on('console', handler),
    stop: () => page.off('console', handler),
  };
}
