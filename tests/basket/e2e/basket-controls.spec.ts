import { test, expect } from '@playwright/test';

// on basket page
test.beforeEach(async ({ page }) => {
  // Arrange: Add item to basket via UI
  await page.goto('/product/test-meze-audio-99-series-2-5mm-or-4-4mm-replacement-cable');
  await page.click('button:has-text("Add to Cart")');
  await page.goto('/basket');
  await expect(page.locator('[data-testid^="basket-item-"]')).toBeVisible();
});

test('on increment should increase quantity from 1 to 2', async ({ page }) => {
  // Act: Click increment once
  await page.click('[data-testid="increment"]');

  // Assert: Quantity is 2
  await expect(page.getByRole('status')).toHaveText('2');
});

test('on decrement should decrease quantity from 2 to 1', async ({ page }) => {
  // Arrange: Increment to 2
  await page.click('[data-testid="increment"]');
  await expect(page.getByRole('status')).toHaveText('2');

  // Act: Click decrement once
  await page.getByLabel('Decrease quantity').click();

  // Assert: Quantity is 1
  await expect(page.getByRole('status')).toHaveText('1');
});

test('on X button click should remove item', async ({ page }) => {
  // Act: Click X button to remove item
  await page.getByTestId('remove-from-basket').click();

  // Wait for removal animation (500ms timeout in Basket.tsx)
  await page.waitForTimeout(600);

  // Assert: Item removed
  await expect(page.locator('[data-testid^="basket-item-"]')).toHaveCount(0);
});

test('increment should block at stock limit', async ({ page }) => {
  // Arrange: Increment multiple times to reach stock limit
  // Assuming test product has stock limit, verify it blocks
  for (let i = 0; i < 10; i++) {
    await page.click('[data-testid="increment"]');
  }

  // Assert: Quantity should not exceed stock limit
  const quantity = await page.getByRole('status').textContent();
  expect(parseInt(quantity || '0')).toBeLessThanOrEqual(10);
});
