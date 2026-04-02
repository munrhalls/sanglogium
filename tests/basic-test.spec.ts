import { test, expect } from '@playwright/test';

test('basic test - page loads', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await expect(page.locator('h1')).toBeVisible();
});
