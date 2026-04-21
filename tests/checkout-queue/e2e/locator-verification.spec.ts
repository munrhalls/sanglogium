import { test, expect } from '@playwright/test'

test.describe('Locator Verification', () => {
  test('verify all required data-testid attributes exist', async ({ page }) => {
    await page.goto('/basket')

    // Verify basket page container
    const basketPage = page.getByTestId('basket-page')
    await expect(basketPage).toBeVisible()

    // Verify checkout button exists
    const checkoutButton = page.getByTestId('checkout-button')
    await expect(checkoutButton).toBeVisible()

    // Verify loading spinner exists (hidden by default)
    const loadingSpinner = page.getByTestId('loading-spinner')
    await expect(loadingSpinner).toBeAttached()
  })
})
