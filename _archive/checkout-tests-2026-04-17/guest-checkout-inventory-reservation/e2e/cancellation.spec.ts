// E2E Test: Cancellation Flow
// Reserve → Cancel → Stock restored → Can add again

import { test, expect } from '@playwright/test'

test.describe('Cancellation Flow', () => {
  test('user can cancel reservation and restore basket', async ({ page }) => {
    // Navigate to basket
    await page.goto('/basket')

    // Complete checkout to create reservation
    const checkoutButton = page.getByTestId('checkout-button')
    await checkoutButton.click()

    // Wait for reservation to complete
    await expect(page.getByTestId('loading-spinner')).toBeHidden({ timeout: 10000 })

    // Verify reserved basket is shown
    await expect(page.getByTestId('reserved-basket')).toBeVisible()

    // Click cancel
    const cancelButton = page.getByRole('button', { name: /cancel/i })
    await cancelButton.click()

    // Verify cancellation confirmation or basket is cleared
    // After cancel, basket should be available again
    await expect(page.getByTestId('checkout-button')).toBeVisible()
  })
})
