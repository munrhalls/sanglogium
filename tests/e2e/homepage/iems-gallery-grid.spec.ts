import { test, expect } from '@playwright/test';

/**
 * E2E Regression Test: IemsGallery Grid Layout
 * 
 * Verifies the grid layout fix from homepage-items-grid-layout-audit.md:
 * - cols={3} renders 3 columns at md breakpoint (768px+)
 * - cols={4} renders 4 columns at lg breakpoint (1024px+)
 * - Container padding prevents edge-clipping
 * - Card padding progression is smooth
 */
test.describe('IemsGallery Grid Layout Regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('mobile viewport (375px) - 1 column with container padding', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 844 });
    await page.waitForTimeout(500); // Allow layout to settle

    // Find IEM gallery grid
    const grid = page.locator('article[class*="bg-brand-900"] .grid').first();
    await expect(grid).toBeVisible();

    // Verify 1 column on mobile
    const gridCols = await grid.evaluate((el) => {
      return window.getComputedStyle(el).gridTemplateColumns;
    });
    expect(gridCols.split(' ').length).toBe(1);

    // Verify container has horizontal padding (not flush against viewport)
    const container = page.locator('article[class*="bg-brand-900"] [class*="max-w-content"]').first();
    const paddingLeft = await container.evaluate((el) => {
      return parseInt(window.getComputedStyle(el).paddingLeft);
    });
    const paddingRight = await container.evaluate((el) => {
      return parseInt(window.getComputedStyle(el).paddingRight);
    });
    expect(paddingLeft).toBeGreaterThanOrEqual(16); // px-4 = 16px
    expect(paddingRight).toBeGreaterThanOrEqual(16);

    // Verify cards have padding (not zero)
    const firstCard = grid.locator('article').first();
    const cardPadding = await firstCard.evaluate((el) => {
      return parseInt(window.getComputedStyle(el).padding);
    });
    expect(cardPadding).toBeGreaterThanOrEqual(16); // p-4 = 16px
  });

  test('tablet viewport (768px) - 3 columns for cols={4}', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);

    const grid = page.locator('article[class*="bg-brand-900"] .grid').first();
    await expect(grid).toBeVisible();

    // Verify 3 columns at tablet (md:grid-cols-3)
    const gridCols = await grid.evaluate((el) => {
      return window.getComputedStyle(el).gridTemplateColumns;
    });
    expect(gridCols.split(' ').length).toBe(3);
  });

  test('desktop viewport (1024px) - 4 columns for cols={4}', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.waitForTimeout(500);

    const grid = page.locator('article[class*="bg-brand-900"] .grid').first();
    await expect(grid).toBeVisible();

    // Verify 4 columns at desktop (lg:grid-cols-4)
    const gridCols = await grid.evaluate((el) => {
      return window.getComputedStyle(el).gridTemplateColumns;
    });
    expect(gridCols.split(' ').length).toBe(4);
  });

  test('large desktop (1440px) - max-width constraint and 4 columns', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(500);

    const container = page.locator('article[class*="bg-brand-900"] [class*="max-w-content"]').first();
    const grid = page.locator('article[class*="bg-brand-900"] .grid').first();

    // Verify container respects max-width
    const containerBox = await container.boundingBox();
    expect(containerBox?.width).toBeLessThanOrEqual(1280); // max-w-content = 1280px

    // Verify 4 columns
    const gridCols = await grid.evaluate((el) => {
      return window.getComputedStyle(el).gridTemplateColumns;
    });
    expect(gridCols.split(' ').length).toBe(4);
  });

  test('grid column count progression across breakpoints', async ({ page }) => {
    const breakpoints = [
      { width: 375, expectedCols: 1, name: 'mobile' },
      { width: 640, expectedCols: 2, name: 'sm' },
      { width: 768, expectedCols: 3, name: 'md' },
      { width: 1024, expectedCols: 4, name: 'lg' },
    ];

    for (const bp of breakpoints) {
      await page.setViewportSize({ width: bp.width, height: 800 });
      await page.waitForTimeout(300);

      const grid = page.locator('article[class*="bg-brand-900"] .grid').first();
      const gridCols = await grid.evaluate((el) => {
        return window.getComputedStyle(el).gridTemplateColumns;
      });

      const actualCols = gridCols.split(' ').length;
      expect(actualCols).toBe(bp.expectedCols);
    }
  });

  test('card padding progression is smooth (no zero padding)', async ({ page }) => {
    const viewports = [375, 475, 768, 1024];

    for (const width of viewports) {
      await page.setViewportSize({ width, height: 800 });
      await page.waitForTimeout(300);

      const grid = page.locator('article[class*="bg-brand-900"] .grid').first();
      const cards = grid.locator('article');
      const cardCount = await cards.count();

      // Check first card has padding
      if (cardCount > 0) {
        const padding = await cards.first().evaluate((el) => {
          return parseInt(window.getComputedStyle(el).padding);
        });
        expect(padding).toBeGreaterThan(0);
      }
    }
  });

  test('no horizontal overflow at any breakpoint', async ({ page }) => {
    const breakpoints = [375, 475, 640, 768, 1024, 1280, 1440];

    for (const width of breakpoints) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(300);

      // Check body doesn't overflow
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = await page.evaluate(() => window.innerWidth);
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1);

      // Check IEM gallery section specifically
      const section = page.locator('article[class*="bg-brand-900"]').first();
      const sectionBox = await section.boundingBox();
      if (sectionBox) {
        expect(sectionBox.width).toBeLessThanOrEqual(width + 1);
        expect(sectionBox.x).toBeGreaterThanOrEqual(-1);
        expect(sectionBox.x + sectionBox.width).toBeLessThanOrEqual(width + 1);
      }
    }
  });
});
