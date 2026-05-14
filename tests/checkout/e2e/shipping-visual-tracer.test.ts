// Tracer bullet E2E test: basket → address → shipping flow
// Focus: Verify shipping page displays real carrier rates after Packlink PRO integration
// Minimal end-to-end, critical path only

import 'dotenv/config'
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

test.describe('Shipping visual tracer (E2E)', () => {
  let reservationId: string
  let testProducts: Awaited<ReturnType<typeof getTestProducts>>

  test.beforeAll(async () => {
    testProducts = await getTestProducts()
    if (testProducts.length < 1) throw new Error('Test dataset must have at least 1 product')
  })

  test.beforeEach(async () => {
    await resetProductStock(testProducts[0]._id, testProducts[0].stock)

    // Create reservation
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

  test('tracer: basket → address → shipping, verify carrier rates display', async ({ page }) => {
    const address = testAddresses.poland

    // Inject reservationId into sessionStorage
    await page.addInitScript((id) => {
      window.sessionStorage.setItem('basketReservationId', id)
    }, reservationId)

    // Navigate to address page
    await page.goto('/checkout/address')
    console.log('[TRACER] Current URL:', page.url())
    
    // Verify we're on the address page
    await expect(page).toHaveURL('/checkout/address')
    
    // Wait for page to load and verify heading
    const heading = page.locator('h1').filter({ hasText: 'Shipping Address' })
    await expect(heading).toBeVisible()

    // Fill address form (minimal, critical fields only)
    await page.getByLabel('Country').selectOption(address.regionCode)
    await page.getByLabel('Postal Code').fill(address.postalCode)
    await page.getByLabel('Street').fill(address.street)
    await page.getByLabel('Number').fill(String(address.streetNumber))
    await page.getByLabel('City').fill(address.city)

    // Submit and wait for shipping page
    await page.getByRole('button', { name: 'Continue to Shipping' }).click()
    await page.waitForURL('/checkout/shipping')
    console.log('[TRACER] After submit, current URL:', page.url())

    // CRITICAL: Verify shipping options are displayed
    await expect(page.locator('h1').filter({ hasText: 'Shipping Options' })).toBeVisible()
    
    // Verify at least one carrier option is shown
    const carrierCards = page.locator('[data-testid^="shipping-option-"]')
    const count = await carrierCards.count()
    console.log('[TRACER] Carrier options found:', count)
    await expect(count).toBeGreaterThan(0)

    // Capture carrier info for diagnostics
    const firstCarrier = carrierCards.first()
    const carrierName = await firstCarrier.textContent()
    console.log('[TRACER] First carrier option:', carrierName)

    // Verify price is displayed
    const priceElement = firstCarrier.locator('[data-testid="shipping-price"]')
    await expect(priceElement).toBeVisible()
  })
})
