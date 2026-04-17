// E2E Test: Stock Decrement Dialog
// Request more than available → see approval dialog

import { test, expect } from '@playwright/test'

test.describe('Stock Decrement Flow', () => {
  test('shows approval dialog when stock is limited', async ({ page }) => {
    // Navigate to basket
    await page.goto('/basket')

    // Checkout button should be visible
    const checkoutButton = page.getByTestId('checkout-button')
    await expect(checkoutButton).toBeVisible()

    // Click checkout
    await checkoutButton.click()

    // Wait for processing
    await expect(page.getByTestId('loading-spinner')).toBeHidden({ timeout: 10000 })

    // If stock was decremented, we should see the approval dialog
    // Check for the specific message
    const dialogMessage = page.getByText(/we've had to revise your basket/i)
    await expect(dialogMessage).toBeVisible()

    // Verify both action buttons are present
    await expect(page.getByRole('button', { name: /approve.*proceed/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /cancel/i })).toBeVisible()
  })
})
