// E2E test: Checkout address page flow (happy path).
//
// Flow:
//   1. Seed a basketReservation doc in the Sanity test dataset.
//   2. Inject the reservationId into sessionStorage (as the basket page
//      would after POST /api/checkout-queue).
//   3. Open /checkout/address in a real browser.
//   4. Fill the address form with a real valid Polish address.
//   5. Click "Continue to Shipping" → the UI calls submitShippingAction (server action)
//      which hits the real Google Address Validation API.
//   6. On ACCEPT, UI calls PATCH /api/basket-reservations/[id] to save address.
//   7. Wait for navigation to /checkout/shipping.
//   8. Query Sanity and assert that `shippingAddress` has been persisted
//      on the reservation document.
//
// Zero mocks: real browser, real Google API, real Sanity writes.
//
// Data shape references:
//   - Address page form:     app/(store)/checkout/address/page.tsx
//   - Checkout context:      app/(store)/checkout/layout.tsx
//   - Server action:         app/actions/address/address.ts
//   - PATCH endpoint:        app/api/basket-reservations/[id]/route.ts
//   - Sanity schema:         sanity/schemaTypes/basketReservationType.ts
//   - Test addresses:        tests/checkout/test-data/test-addresses.ts
//   - Test products:         tests/helpers/test-data.ts

import { test, expect } from '@playwright/test'
import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '../../../sanity-cms/env'
import { getTestProducts, resetProductStock } from '../../helpers/sanity-test-products'
import { testAddresses } from '../test-data/test-addresses'

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
  token: process.env.SANITY_STUDIO_READ_WRITE || process.env.SANITY_STUDIO_READ_WRITE_CREATE,
})

test.describe('Checkout address flow (E2E)', () => {
  let reservationId: string
  let testProducts: Awaited<ReturnType<typeof getTestProducts>>

  test.beforeAll(async () => {
    testProducts = await getTestProducts()
    if (testProducts.length < 1) throw new Error('Test dataset must have at least 1 product')
  })

  test.beforeEach(async () => {
    await resetProductStock(testProducts[0]._id, testProducts[0].stock)

    // Create reservation document
    const reservation = await writeClient.create({
      _type: 'basketReservation',
      basketReservation: [
        {
          _id: testProducts[0]._id,
          quantity: 1,
          verifiedPrice: testProducts[0].price_data.unit_amount / 100,
        },
      ],
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

  test('submits a valid address, Google validates it, Sanity doc receives shippingAddress', async ({
    page,
  }) => {
    const address = testAddresses.poland

    // Step 1: Inject reservationId into sessionStorage
    await page.addInitScript((id) => {
      window.sessionStorage.setItem('basketReservationId', id)
    }, reservationId)

    // Step 2: Open address page and verify it loaded
    await page.goto('/checkout/address')
    await expect(page.locator('h1')).toContainText('Shipping Address')

    // Step 3: Verify form fields are visible
    await expect(page.getByLabel('Country')).toBeVisible()
    await expect(page.getByLabel('Postal Code')).toBeVisible()
    await expect(page.getByLabel('Street')).toBeVisible()
    await expect(page.getByLabel('Number')).toBeVisible()
    await expect(page.getByLabel('City')).toBeVisible()

    // Step 4: Fill form field by field with verification
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

    // Step 5: Verify submit button is enabled
    const submitButton = page.getByRole('button', { name: 'Continue to Shipping' })
    await expect(submitButton).toBeEnabled()

    // Step 6: Click button and wait for PATCH endpoint to be called
    const patchResponsePromise = page.waitForResponse(
      (res) =>
        res.url().includes('/api/basket-reservations/') && res.request().method() === 'PATCH'
    )
    await submitButton.click()
    const patchResponse = await patchResponsePromise

    // Step 7: Verify PATCH response status
    expect(patchResponse.status()).toBe(200)

    // Step 8: Wait for navigation to shipping options page
    await page.waitForURL('/checkout/shipping')

    // Step 9: Query Sanity and verify doc exists with shippingAddress
    let doc: {
      _id: string
      shippingAddress?: {
        regionCode?: string
        postalCode?: string
        street?: string
        streetNumber?: string
        city?: string
      }
    } | null = null

    for (let attempt = 0; attempt < 10; attempt++) {
      doc = await readClient.fetch(
        `*[_type == "basketReservation" && _id == $id][0]{
           _id,
           shippingAddress
         }`,
        { id: reservationId }
      )
      if (doc && doc.shippingAddress) break
      await new Promise((r) => setTimeout(r, 500))
    }

    expect(doc).not.toBeNull()
    expect(doc!._id).toBe(reservationId)

    // Step 10: Verify shippingAddress exists on doc
    expect(doc!.shippingAddress).toBeTruthy()

    // Step 11: Verify shippingAddress data matches submitted address
    const saved = doc!.shippingAddress!
    expect(saved.regionCode).toBe(address.regionCode)
    expect(saved.postalCode).toBe(address.postalCode)
    expect(saved.street).toBe(address.street)
    expect(String(saved.streetNumber)).toBe(String(address.streetNumber))
    expect(saved.city).toBe(address.city)
  })
})
