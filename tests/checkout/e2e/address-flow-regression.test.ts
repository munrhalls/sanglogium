import { test, expect } from '@playwright/test'
import { testAddresses } from '../test-data/test-addresses'

const seedSecret = process.env.CHECKOUT_SEED_SECRET || 'dev-secret'

const invalidAddress = {
  regionCode: 'PL',
  postalCode: '00-000',
  street: 'Nieistniejąca',
  streetNumber: '1',
  city: 'Warszawa',
}

const fillAddress = async (page: any, address: typeof invalidAddress) => {
  await page.locator('input[name="firstName"]').fill('Jan')
  await page.locator('input[name="lastName"]').fill('Kowalski')
  await page.locator('input[name="phone"]').fill('+48 123 456 789')
  await page.locator('select[name="regionCode"]').selectOption(address.regionCode)
  await page.locator('input[name="postalCode"]').fill(address.postalCode)
  await page.locator('input[name="street"]').fill(address.street)
  await page.locator('input[name="streetNumber"]').fill(String(address.streetNumber))
  await page.locator('input[name="city"]').fill(address.city)
}

test.describe('Checkout address regression (E2E)', () => {
  test('shows FIX error, keeps form editable, and re-enables submit after a failed validation', async ({ page }) => {
    // Seed basket
    await page.goto(`/test/checkout-seed?secret=${seedSecret}&scenario=missing-address`)
    await page.waitForURL('/checkout/payment')

    // Navigate to address form
    await page.goto('/checkout/address')
    await expect(page.locator('h1')).toContainText('Shipping Address')

    // Submit an invalid address
    await fillAddress(page, invalidAddress)
    const submitButton = page.getByRole('button', { name: 'Continue to Shipping' })
    await submitButton.click()

    // Assert error is visible and the form stays usable
    const errorBanner = page.locator('.text-error-500')
    await expect(errorBanner).toBeVisible()
    await expect(page.locator('input[name="firstName"]')).toBeEditable()
    await expect(submitButton).toBeEnabled()
    await expect(page).toHaveURL('/checkout/address')
  })

  test('allows correcting an invalid address and navigating to shipping in the same session', async ({ page }) => {
    // Seed basket
    await page.goto(`/test/checkout-seed?secret=${seedSecret}&scenario=missing-address`)
    await page.waitForURL('/checkout/payment')

    // Navigate to address form
    await page.goto('/checkout/address')
    await expect(page.locator('h1')).toContainText('Shipping Address')

    // Submit an invalid address
    await fillAddress(page, invalidAddress)
    const submitButton = page.getByRole('button', { name: 'Continue to Shipping' })
    await submitButton.click()

    // Wait for error state
    await expect(page.locator('.text-error-500')).toBeVisible()
    await expect(submitButton).toBeEnabled()

    // Correct the address with a valid one
    const validAddress = testAddresses.poland
    await fillAddress(page, validAddress)
    await submitButton.click()

    // Should redirect to shipping
    await page.waitForURL('/checkout/shipping')
    await expect(page).toHaveURL('/checkout/shipping')
  })
})
