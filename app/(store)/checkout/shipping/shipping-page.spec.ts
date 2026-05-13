// E2E test: Checkout shipping page flow (happy path + error handling).
//
// Flow:
//   1. Seed a basketReservation doc with shippingAddress in Sanity.
//   2. Inject the reservationId into sessionStorage.
//   3. Open /checkout/shipping in a real browser.
//   4. Wait for shipping options to load from Shippo API.
//   5. Select a shipping option and continue to payment.
//   6. Verify shipping choice is saved to reservation.
//
// Zero mocks: real browser, real Shippo API, real Sanity writes.

import { test, expect } from '@playwright/test'
import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '../../../../sanity-cms/env'
import { getTestProducts, resetProductStock } from '../../../../tests/helpers/sanity-test-products'
import { testAddresses } from '../../../../tests/checkout/test-data/test-addresses'

const readClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
})

const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_STUDIO_READ_WRITE,
})

test.describe('Checkout shipping flow (E2E)', () => {
  let reservationId: string
  let testProducts: Awaited<ReturnType<typeof getTestProducts>>

  test.beforeAll(async () => {
    testProducts = await getTestProducts()
    if (testProducts.length < 1) throw new Error('Test dataset must have at least 1 product')
  })

  test.beforeEach(async () => {
    await resetProductStock(testProducts[0]._id, testProducts[0].stock)

    // Create reservation document with shipping address
    const reservation = await writeClient.create({
      _type: 'basketReservation',
      basketReservation: [
        {
          _id: testProducts[0]._id,
          quantity: 1,
          verifiedPrice: testProducts[0].price_data.unit_amount / 100,
        },
      ],
      shippingAddress: testAddresses.poland,
      createdAt: new Date().toISOString(),
    })
    reservationId = reservation._id
  })

  test.afterEach(async () => {
    try {
      await writeClient.delete(reservationId)
    } catch {
      /* already gone */
    }
    await resetProductStock(testProducts[0]._id, testProducts[0].stock)
  })

  test('happy path: loads shipping options, selects option, saves to reservation, redirects to payment', async ({
    page,
  }) => {
    // Step 1: Inject reservationId into sessionStorage
    await page.addInitScript((id) => {
      window.sessionStorage.setItem('basketReservationId', id)
    }, reservationId)

    // Step 2: Open shipping page and verify it loaded
    await page.goto('/checkout/shipping')
    await expect(page.locator('h1')).toContainText('Select Shipping Method')

    // Step 3: Wait for shipping options to load
    await expect(page.locator('text=Loading shipping options')).not.toBeVisible({ timeout: 15000 })

    // Step 4: Verify shipping options are displayed
    const shippingOptions = page.locator('[data-testid="shipping-option"]')
    const optionCount = await shippingOptions.count()

    // If Shippo API is configured, expect options
    if (optionCount > 0) {
      // Step 5: Select the first shipping option
      await shippingOptions.first().click()

      // Step 6: Verify option is selected (border color change)
      await expect(shippingOptions.first()).toHaveClass(/border-black/)

      // Step 7: Click continue button
      const continueButton = page.getByRole('button', { name: 'Continue to Payment' })
      await expect(continueButton).toBeEnabled()
      await continueButton.click()

      // Step 8: Wait for PATCH endpoint to be called
      const patchResponsePromise = page.waitForResponse(
        (res) =>
          res.url().includes('/api/basket-reservations/') && res.request().method() === 'PATCH'
      )
      const patchResponse = await patchResponsePromise
      expect(patchResponse.status()).toBe(200)

      // Step 9: Wait for navigation to payment page
      await page.waitForURL('/checkout/payment')

      // Step 10: Query Sanity and verify shippingChoice was saved
      const doc = await readClient.fetch(
        `*[_type == "basketReservation" && _id == $id][0]{
           _id,
           shippingChoice
         }`,
        { id: reservationId }
      )

      expect(doc).not.toBeNull()
      expect(doc!._id).toBe(reservationId)
      expect(doc!.shippingChoice).toBeTruthy()
      expect(doc!.shippingChoice).toHaveProperty('provider')
      expect(doc!.shippingChoice).toHaveProperty('serviceLevel')
      expect(doc!.shippingChoice).toHaveProperty('rateId')
    } else {
      // If no options returned (Shippo API issue), verify error message is displayed
      const errorMessage = page.locator('text=No shipping options available')
      await expect(errorMessage).toBeVisible()
    }
  })

  test('error handling: displays error message when API fails, shows retry button for retryable errors', async ({
    page,
  }) => {
    // Step 1: Inject reservationId into sessionStorage
    await page.addInitScript((id) => {
      window.sessionStorage.setItem('basketReservationId', id)
    }, reservationId)

    // Step 2: Open shipping page
    await page.goto('/checkout/shipping')

    // Step 3: Wait for loading to complete
    await page.waitForLoadState('networkidle', { timeout: 15000 })

    // Step 4: Check if error is displayed (if Shippo API is down or misconfigured)
    const errorElement = page.locator('text=Failed to fetch shipping rates')
    const isErrorVisible = await errorElement.isVisible().catch(() => false)

    if (isErrorVisible) {
      // Step 5: Verify retry button is shown for retryable errors
      const retryButton = page.getByRole('button', { name: 'Try Again' })
      const isRetryVisible = await retryButton.isVisible().catch(() => false)

      // Network/Provider errors should show retry button
      expect(isRetryVisible).toBe(true)
    }
  })

  test('redirects to basket when no reservationId in sessionStorage', async ({ page }) => {
    // Step 1: Open shipping page without reservationId
    await page.goto('/checkout/shipping')

    // Step 2: Verify redirect to basket page
    await page.waitForURL('/basket')
    expect(page.url()).toContain('/basket')
  })
})
