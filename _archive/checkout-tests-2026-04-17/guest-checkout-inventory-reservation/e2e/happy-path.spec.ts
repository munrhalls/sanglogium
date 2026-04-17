// E2E Test: Happy Path Checkout Flow
// User clicks checkout → processing → reserved basket → proceed

import { test, expect } from '@playwright/test'

test.describe('Happy Path Checkout', () => {
  test('user can complete checkout flow', async ({ page }) => {
    // Navigate to basket page
    await page.goto('/basket')

    // Add product to basket (if not already)
    const checkoutButton = page.getByTestId('checkout-button')

    // Verify button is enabled when basket has items
    await expect(checkoutButton).toBeEnabled()

    // Click checkout
    await checkoutButton.click()

    // Verify processing state (spinner visible)
    await expect(page.getByTestId('loading-spinner')).toBeVisible()

    // Wait for processing to complete
    await expect(page.getByTestId('loading-spinner')).toBeHidden({ timeout: 10000 })

    // Verify reserved basket is displayed
    await expect(page.getByTestId('reserved-basket')).toBeVisible()

    // Verify proceed button is visible
    await expect(page.getByRole('button', { name: /proceed/i })).toBeVisible()
  })
})
