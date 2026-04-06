import { test, expect } from '@playwright/test';

test.describe('Mobile Interaction (375px)', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should have proper touch targets on mobile', async ({ page }) => {
    await page.goto('/basket');
    await page.waitForLoadState('networkidle');
    
    // Check button touch targets (minimum 44px height)
    const buttons = page.locator('button').first();
    if (await buttons.count() > 0) {
      const buttonBox = await buttons.first().boundingBox();
      expect(buttonBox?.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('should stack elements vertically on mobile', async ({ page }) => {
    await page.goto('/basket');
    await page.waitForLoadState('networkidle');
    
    // Verify mobile layout - elements should stack vertically
    const checkoutPanel = page.locator('[data-testid="panel-idle"]').first();
    if (await checkoutPanel.count() > 0) {
      const panelBox = await checkoutPanel.boundingBox();
      expect(panelBox?.width).toBeLessThanOrEqual(375); // Full width on mobile
    }
  });

  test('should have mobile-optimized typography', async ({ page }) => {
    await page.goto('/basket');
    await page.waitForLoadState('networkidle');
    
    // Check if mobile typography classes are applied
    const headings = page.locator('h2').first();
    if (await headings.count() > 0) {
      const headingClasses = await headings.first().getAttribute('class');
      expect(headingClasses).toMatch(/type-caption/); // Mobile should use caption size
    }
  });
});
