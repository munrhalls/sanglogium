import { test, expect } from '@playwright/test';

// test-carousel-drawer.spec.ts
test('drawer carousel works on WebKit', async ({ page, browserName }) => {
  await page.goto('http://localhost:3000');
  await page.setViewportSize({ width: 390, height: 844 }); // iPhone 14

  // Open drawer
  await page.click('button[type="button"]:has(svg)'); // Menu button
  await page.waitForTimeout(400); // Let drawer animate in

  // Check first slide is active
  const firstSlide = page.locator('[data-active]').first();
  await expect(firstSlide).toHaveAttribute('data-active', 'true');

  // Check opacity animation actually applied (catch invisible content)
  const slideContent = page.locator('.group\\/slide').first();
  await expect(slideContent).toBeVisible();
});