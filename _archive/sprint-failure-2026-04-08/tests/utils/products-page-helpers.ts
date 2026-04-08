/**
 * Products Page Test Helpers
 * Shared utilities for PLP E2E and integration tests
 */

import { Page, Locator } from '@playwright/test';

/**
 * Data-testid selectors for PLP component targeting
 */
export const PLP_SELECTORS = {
  // Product Grid
  productGrid: '[data-testid="product-grid"]',
  productCard: '[data-testid="product-card"]',
  emptyProducts: '[data-testid="empty-products"]',

  // Filters & Sorting
  filterSidebar: '[data-testid="filter-sidebar"]',
  sortDropdown: '[data-testid="sort-dropdown"]',
  mobileFilterButton: 'button:has-text("Filters")',
  mobileFilterDrawer: '[data-testid="mobile-filter-drawer"]',

  // Product Info
  productName: 'h1',
  productPrice: '[data-testid="price"]',
} as const;

/**
 * Standard viewport sizes for RWD testing
 */
export const viewports = {
  desktop: { width: 1280, height: 720, name: 'desktop' },
  mobile: { width: 375, height: 844, name: 'mobile' },
  tablet: { width: 768, height: 1024, name: 'tablet' },
} as const;

/**
 * Test category slugs for consistent test data
 */
export const TEST_CATEGORIES = {
  openBack: 'headphones/open-back',
  closedBack: 'headphones/closed-back',
  desktopAmps: 'audio-electronics/desktop-amps',
  invalid: 'non-existent-category-12345',
} as const;

/**
 * Navigate to a products category page and wait for load
 */
export async function navigateToCategory(
  page: Page,
  slug: string = TEST_CATEGORIES.openBack
): Promise<void> {
  await page.goto(`/products/${slug}`);
  await page.waitForLoadState('networkidle');
}

/**
 * Get the count of product cards on the page
 */
export async function getProductCount(page: Page): Promise<number> {
  // Try testid first, fallback to article elements in product grid
  const testIdCount = await page.locator(PLP_SELECTORS.productCard).count();
  if (testIdCount > 0) return testIdCount;

  // Fallback: article elements within product grid area
  return page.locator('[data-testid="product-grid"] article, .product-grid article, [class*="grid"] > article').count();
}

/**
 * Check if a product grid is visible (has products or empty state)
 */
export async function isProductGridVisible(page: Page): Promise<boolean> {
  const grid = page.locator(PLP_SELECTORS.productGrid);
  const empty = page.locator(PLP_SELECTORS.emptyProducts);
  return (await grid.isVisible().catch(() => false)) ||
         (await empty.isVisible().catch(() => false));
}

/**
 * Console error collector for test diagnostics
 */
export function createConsoleErrorCollector(page: Page): {
  errors: string[];
  start: () => void;
  stop: () => void;
} {
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
