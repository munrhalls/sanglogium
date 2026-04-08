import { Page, expect } from '@playwright/test';

export async function assertNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > window.innerWidth;
  });
  expect(overflow).toBe(false);
}

export async function assertTouchTargetsSize(page: Page, minSize = 44) {
  const smallTargets = await page.evaluate((min) => {
    const interactive = document.querySelectorAll('button, a, [role="button"]');
    return Array.from(interactive).filter(el => {
      const rect = el.getBoundingClientRect();
      return rect.width < min || rect.height < min;
    }).length;
  }, minSize);
  expect(smallTargets).toBe(0);
}

export async function assertNoConsoleErrors(page: Page) {
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  // Wait a bit for any delayed console errors
  await page.waitForTimeout(1000);

  expect(errors).toHaveLength(0);
}

export const viewportMatrix = [
  { name: 'mobile-portrait', width: 390, height: 844, device: 'iPhone 14' },
  { name: 'mobile-landscape', width: 844, height: 390, device: 'iPhone 14' },
  { name: 'tablet-portrait', width: 768, height: 1024, device: 'iPad Mini' },
  { name: 'tablet-landscape', width: 1024, height: 768, device: 'iPad Mini' },
  { name: 'desktop', width: 1280, height: 720, device: 'Desktop' },
  { name: 'large-desktop', width: 1440, height: 900, device: 'Desktop' }
];
