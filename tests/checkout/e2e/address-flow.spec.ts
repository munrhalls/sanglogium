// E2E test: Checkout address page flow (happy path).
//
// Production architecture:
//   - Address is stored in the iron-session cookie (not Sanity, not sessionStorage).
//   - The form calls saveAddress() server action which validates via Google API,
//     writes to session, and redirects to /checkout/shipping.
//
// Flow:
//   1. Seed basket into iron-session via /test/checkout-seed?scenario=missing-address.
//   2. Navigate to /checkout/address.
//   3. Fill the address form with a real valid Polish address.
//   4. Click "Continue to Shipping" → saveAddress server action calls Google
//      Address Validation API.
//   5. On ACCEPT, session is updated and user is redirected to /checkout/shipping.
//
// Zero mocks: real browser, real Google API.

import { test, expect } from '@playwright/test'
import { testAddresses } from '../test-data/test-addresses'

test.describe('Checkout address flow (E2E)', () => {
  test('submits a valid address and redirects to shipping', async ({ page }) => {
    const seedSecret = process.env.CHECKOUT_SEED_SECRET
    if (!seedSecret) {
      throw new Error('CHECKOUT_SEED_SECRET env var is required')
    }

    const address = testAddresses.poland

    // Step 1: Seed basket into iron-session via test route
    await page.goto(`/test/checkout-seed?secret=${seedSecret}&scenario=missing-address`)
    // Seed route redirects to /checkout/payment; we just need the cookie set.
    await page.waitForURL('/checkout/payment')

    // Step 2: Navigate to address page (basket is now in session)
    await page.goto('/checkout/address')
    await expect(page.locator('h1')).toContainText('Shipping Address')

    // Step 3: Fill form fields
    await page.getByLabel('First Name').fill('Jan')
    await page.getByLabel('Last Name').fill('Kowalski')
    await page.getByLabel('Phone Number').fill('+48 123 456 789')
    await page.getByLabel('Country').selectOption(address.regionCode)

    const postalCodeInput = page.getByLabel('Postal Code')
    await postalCodeInput.fill(address.postalCode)
    await postalCodeInput.blur()
    await expect(postalCodeInput).toHaveValue(address.postalCode)

    const streetInput = page.getByLabel('Street')
    await streetInput.fill(address.street)
    await streetInput.blur()
    await expect(streetInput).toHaveValue(address.street)

    const streetNumberInput = page.getByLabel('Number')
    await streetNumberInput.fill(String(address.streetNumber))
    await streetNumberInput.blur()
    await expect(streetNumberInput).toHaveValue(String(address.streetNumber))

    const cityInput = page.getByLabel('City')
    await cityInput.fill(address.city)
    await cityInput.blur()
    await expect(cityInput).toHaveValue(address.city)

    // Step 4: Verify submit button is enabled
    const submitButton = page.getByRole('button', { name: 'Continue to Shipping' })
    await expect(submitButton).toBeEnabled()

    // Step 5: Submit and assert redirect to shipping
    await submitButton.click()
    await page.waitForURL('/checkout/shipping')
  })
})
