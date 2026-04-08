import { test, expect } from '@playwright/test';
import { viewportMatrix, assertNoHorizontalOverflow, assertTouchTargetsSize, assertNoConsoleErrors } from '../../utils/playwright-helpers';

test.describe('Homepage RWD Matrix', () => {
  viewportMatrix.forEach(({ name, width, height, device }) => {
    test(`${name} (${width}×${height}) - ${device}`, async ({ page }) => {
      // Set viewport
      await page.setViewportSize({ width, height });
      
      // Navigate to homepage
      await page.goto('/');
      
      // Wait for page to load
      await page.waitForLoadState('networkidle');
      
      // Check for console errors
      await assertNoConsoleErrors(page);
      
      // Check no horizontal overflow
      await assertNoHorizontalOverflow(page);
      
      // Check touch targets are adequate size (mobile only)
      if (width <= 768) {
        await assertTouchTargetsSize(page);
      }
      
      // Check content is visible (not clipped)
      await expect(page.locator('body')).toBeVisible();
      
      // Check main sections are present
      await expect(page.locator('main')).toBeVisible();
      
      // Take screenshot for visual verification
      await page.screenshot({ 
        path: `test-results/homepage-rwd-${name}-${width}x${height}.png`,
        fullPage: true 
      });
      
      // Verify viewport-specific layout
      if (width <= 768) {
        // Mobile: Check mobile navigation is present
        await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible();
      } else {
        // Desktop: Check desktop navigation is present
        await expect(page.locator('[data-testid="desktop-nav"]')).toBeVisible();
      }
    });
  });

  test('mobile portrait - touch target verification', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check specific touch targets
    const interactiveElements = page.locator('button, a, [role="button"]');
    const count = await interactiveElements.count();
    
    for (let i = 0; i < count; i++) {
      const element = interactiveElements.nth(i);
      const box = await element.boundingBox();
      
      if (box) {
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  });

  test('desktop - hover states verification', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check hover capability
    const hoverElements = page.locator('.group-hover\\:shadow-cardHover');
    const count = await hoverElements.count();
    
    expect(count).toBeGreaterThan(0);
    
    // Test hover on first element
    if (count > 0) {
      const firstElement = hoverElements.first();
      await firstElement.hover();
      
      // Verify hover styles are applied (check for transform)
      const transform = await firstElement.evaluate((el) => {
        return window.getComputedStyle(el).transform;
      });
      
      expect(transform).not.toBe('none');
    }
  });

  test('tablet portrait - grid layout verification', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check grid layouts are appropriate for tablet
    const grids = page.locator('.grid');
    const count = await grids.count();
    
    expect(count).toBeGreaterThan(0);
    
    // Verify grid is not breaking on tablet
    for (let i = 0; i < count; i++) {
      const grid = grids.nth(i);
      await expect(grid).toBeVisible();
      
      // Check grid items are visible
      const gridItems = grid.locator('[class*="col-"]');
      const itemCount = await gridItems.count();
      
      if (itemCount > 0) {
        await expect(gridItems.first()).toBeVisible();
      }
    }
  });

  test('large desktop - max-width constraints', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check max-width constraints are respected
    const constrainedElements = page.locator('[class*="max-w-"]');
    const count = await constrainedElements.count();
    
    expect(count).toBeGreaterThan(0);
    
    // Verify content doesn't span full viewport on large screens
    const mainContent = page.locator('main');
    const mainBox = await mainContent.boundingBox();
    
    if (mainBox) {
      expect(mainBox.width).toBeLessThan(1440);
    }
  });

  test('all viewports - no content clipping', async ({ page }) => {
    const viewports = [
      { width: 390, height: 844 },
      { width: 768, height: 1024 },
      { width: 1280, height: 720 },
      { width: 1440, height: 900 }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Check that content is not clipped
      const body = page.locator('body');
      const bodyBox = await body.boundingBox();
      
      if (bodyBox) {
        // Body should not be wider than viewport
        expect(bodyBox.width).toBeLessThanOrEqual(viewport.width + 1); // +1 for rounding
      }
      
      // Check important sections are visible
      const sections = page.locator('section, article');
      const sectionCount = await sections.count();
      
      for (let i = 0; i < Math.min(sectionCount, 5); i++) { // Check first 5 sections
        const section = sections.nth(i);
        const sectionBox = await section.boundingBox();
        
        if (sectionBox) {
          // Sections should not extend beyond viewport
          expect(sectionBox.width).toBeLessThanOrEqual(viewport.width + 1);
        }
      }
    }
  });

  test('mobile landscape - layout adaptation', async ({ page }) => {
    await page.setViewportSize({ width: 844, height: 390 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check layout adapts to landscape
    await assertNoHorizontalOverflow(page);
    
    // Check content is still accessible in landscape
    const mainSections = page.locator('main > section, main > article');
    const sectionCount = await mainSections.count();
    
    expect(sectionCount).toBeGreaterThan(0);
    
    // Verify sections are not overlapping
    for (let i = 0; i < sectionCount - 1; i++) {
      const currentSection = mainSections.nth(i);
      const nextSection = mainSections.nth(i + 1);
      
      const currentBox = await currentSection.boundingBox();
      const nextBox = await nextSection.boundingBox();
      
      if (currentBox && nextBox) {
        // Sections should not overlap vertically
        expect(currentBox.y + currentBox.height).toBeLessThanOrEqual(nextBox.y + 1);
      }
    }
  });
});
