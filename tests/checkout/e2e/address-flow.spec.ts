// E2E test: Checkout address page flow (happy path).
//
// Flow:
//   1. Seed a basketReservation doc in the Sanity test dataset.
//   2. Inject the reservationId into sessionStorage (as the basket page
//      would after POST /api/checkout-queue).
//   3. Open /checkout/shipping in a real browser.
//   4. Fill the address form with a real valid Polish address.
//   5. Click "Submit Address" → the UI calls /api/shipping which hits the
//      real Google Address Validation API and patches the reservation doc.
//   6. Wait for navigation to /checkout/shipping/confirmation.
//   7. Query Sanity and assert that `shippingAddress` has been persisted
//      on the reservation document.
//
// Zero mocks: real browser, real Google API, real Sanity writes.
//
// Expected to fail until the client includes `reservationId` in the
// shipping request body so that /api/shipping can patch the doc.
//
// Data shape references:
//   - Shipping page form:  app/(store)/checkout/shipping/page.tsx
//   - Checkout context:    app/(store)/checkout/layout.tsx
//   - Shipping API route:  app/api/shipping/route.ts
//   - Sanity schema:       sanity/schemaTypes/basketReservationType.ts
//   - Test addresses:      tests/checkout/test-data/test-addresses.ts
//   - Test products:       tests/helpers/test-data.ts

import { test, expect } from '@playwright/test'
import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '@/sanity/env'
import { getTestProducts, resetProductStock } from '@/tests/helpers/test-data'
import { testAddresses } from '@/tests/checkout/test-data/test-addresses'

const readClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
})

const writeToken = process.env.SANITY_STUDIO_READ_WRITE || process.env.SANITY_STUDIO_READ_WRITE_CREATE;
console.log('TEST ENVIRONMENT: writeToken loaded:', writeToken ? 'YES' : 'NO');
console.log('TEST ENVIRONMENT: writeToken length:', writeToken?.length);
console.log('TEST ENVIRONMENT: writeToken first 10 chars:', writeToken?.substring(0, 10));

const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: writeToken,
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

    // Step 1: Create reservation document
    const reservation = await writeClient.create({
      _type: 'basketReservation',
      basketReservation: [
        {
          _id: testProducts[0]._id,
          quantity: 1,
          verifiedPrice: testProducts[0].displayPrice,
        },
      ],
      createdAt: new Date().toISOString(),
    })
    reservationId = reservation._id

    // Step 2: Verify reservation document was created successfully
    expect(reservationId).toBeDefined()
    expect(reservationId).toBeTruthy()

    // Step 3: Verify reservation document can be read back
    const readBack = await readClient.fetch(
      `*[_type == "basketReservation" && _id == $id][0]{_id, basketReservation}`,
      { id: reservationId }
    )
    expect(readBack).not.toBeNull()
    expect(readBack!._id).toBe(reservationId)

    // Step 4: Verify write client can authenticate (test with a simple read operation)
    const authTest = await writeClient.fetch(
      `*[_type == "basketReservation" && _id == $id][0]{_id}`,
      { id: reservationId }
    )
    expect(authTest).not.toBeNull()

    // Step 5: Verify write client can commit changes (test with a simple patch)
    try {
      await writeClient
        .patch(reservationId)
        .set({ testField: 'test' })
        .commit()
      // Clean up the test field
      await writeClient
        .patch(reservationId)
        .unset(['testField'])
        .commit()
    } catch (error) {
      throw new Error(`Write client cannot commit: ${error}`)
    }
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
      window.sessionStorage.setItem('reservationId', id)
    }, reservationId)

    // Step 2: Open address page and verify it loaded
    await page.goto('/checkout/shipping')
    await expect(page.locator('h2')).toContainText('Enter Shipping Address')

    // Step 3: Verify form fields are visible
    await expect(page.getByPlaceholder('Postal Code')).toBeVisible()
    await expect(page.getByPlaceholder('Street')).toBeVisible()
    await expect(page.getByPlaceholder('City')).toBeVisible()

    // Step 4: Fill form field by field with verification
    await page.selectOption('select', address.regionCode)
    const postalCodeInput = page.getByPlaceholder('Postal Code')
    await postalCodeInput.fill(address.postalCode)
    await postalCodeInput.blur()
    await expect(postalCodeInput).toHaveValue(address.postalCode)

    const streetInput = page.getByPlaceholder('Street')
    await streetInput.fill(address.street)
    await streetInput.blur()
    await expect(streetInput).toHaveValue(address.street)

    const streetNumberInput = page.locator('input[name="streetNumber"]')
    await streetNumberInput.fill(String(address.streetNumber))
    await streetNumberInput.blur()
    await expect(streetNumberInput).toHaveValue(String(address.streetNumber))

    const cityInput = page.getByPlaceholder('City')
    await cityInput.fill(address.city)
    await cityInput.blur()
    await expect(cityInput).toHaveValue(address.city)

    // Step 5: Verify submit button is enabled
    const submitButton = page.getByRole('button', { name: 'Submit Address' })
    await expect(submitButton).toBeEnabled()

    // Step 6: Click button and wait for API response
    const shippingResponsePromise = page.waitForResponse(
      (res) =>
        res.url().includes('/api/shipping') && res.request().method() === 'POST'
    )
    await submitButton.click()
    const shippingResponse = await shippingResponsePromise

    // Step 7: Verify API response status
    expect(shippingResponse.status()).toBe(200)

    // Step 8: Parse and verify API response body structure
    const shippingBody = (await shippingResponse.json()) as {
      status: 'CONFIRMED' | 'PARTIAL' | 'FIX'
      correctedAddress: {
        street: string
        streetNumber: string
        city: string
        postalCode: string
        regionCode: string
      } | null
    }
    expect(shippingBody).toHaveProperty('status')
    expect(shippingBody).toHaveProperty('correctedAddress')

    // Step 9: Verify API response status field
    expect(shippingBody.status).toBe('CONFIRMED')

    // Step 10: Verify corrected address exists
    expect(shippingBody.correctedAddress).not.toBeNull()
    const corrected = shippingBody.correctedAddress!

    // Step 11: Query Sanity and verify doc exists
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
      if (doc) break
      await new Promise((r) => setTimeout(r, 500))
    }

    expect(doc).not.toBeNull()
    expect(doc!._id).toBe(reservationId)

    // Step 14: Verify shippingAddress exists on doc
    expect(doc!.shippingAddress).toBeTruthy()

    // Step 15: Verify shippingAddress data matches API response
    const saved = doc!.shippingAddress!
    expect(saved.regionCode).toBe(corrected.regionCode)
    expect(saved.postalCode).toBe(corrected.postalCode)
    expect(saved.street).toBe(corrected.street)
    expect(String(saved.streetNumber)).toBe(String(corrected.streetNumber))
    expect(saved.city).toBe(corrected.city)
  })
})
