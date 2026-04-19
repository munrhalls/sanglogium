// Test: UI basket reservation request → queue → CMS creates reservation → CMS returns response
// Uses real Redis and Sanity, no mocks

import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest'
import { fetch } from 'undici'
import type { BasketReservation, BasketReservationResponse } from '@/lib/queue/types'
import { TEST_PRODUCTS, resetProductStock } from '@/tests/helpers/test-data'
import { client } from '@/sanity/lib/client'

const BASE = process.env.QUEUE_TEST_BASE_URL || 'http://localhost:3000'

describe('Basket reservation flow', () => {
  beforeAll(async () => {
    // Pre-flight: dev server reachable
    const res = await fetch(`${BASE}/api/atomic-basket-reservation`, { method: 'OPTIONS' }).catch(() => null)
    if (!res) throw new Error(`Dev server not running at ${BASE}. Run 'npm run dev' first.`)
  })

  beforeEach(async () => {
    // Reset product stock to original values before each test
    await resetProductStock(TEST_PRODUCTS[0]._id, TEST_PRODUCTS[0].stock)
    await resetProductStock(TEST_PRODUCTS[1]._id, TEST_PRODUCTS[1].stock)
  })

  it('sends UI basket reservation request → queue → CMS creates proper reservation → CMS returns proper response', async () => {
    // Step 1: Create valid BasketReservation request with existing test product IDs
    const request: BasketReservation = {
      publicBasket: [
        { _id: TEST_PRODUCTS[0]._id, quantity: 1, stripePriceId: TEST_PRODUCTS[0].stripePriceId },
        { _id: TEST_PRODUCTS[1]._id, quantity: 2, stripePriceId: TEST_PRODUCTS[1].stripePriceId }
      ],
      createdAt: new Date().toISOString()
    }

    // Step 2: Send to checkout-queue API endpoint
    const response = await fetch(`${BASE}/api/atomic-basket-reservation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    })

    // Step 3: Verify checkout-queue accepts request (202 accepted)
    expect(response.status).toBe(202)

    // Step 4: Verify response matches BasketReservationResponse type
    const data = await response.json() as BasketReservationResponse
    expect(data.ok).toBe(true)
    expect(data.reservationId).toBeDefined()
    expect(data.products).toBeDefined()
    expect(Array.isArray(data.products)).toBe(true)

    // Step 5: Verify CMS created basket reservation document
    const reservationDoc = await client.fetch(
      `*[_type == "basketReservation" && _id == $reservationId][0]`,
      { reservationId: data.reservationId }
    )
    expect(reservationDoc).toBeDefined()
    expect(reservationDoc._type).toBe('basketReservation')
    expect(reservationDoc.publicBasket).toBeDefined()
    expect(Array.isArray(reservationDoc.publicBasket)).toBe(true)

    // Step 6: Verify trace endpoint confirms complete flow
    const traceRes = await fetch(`${BASE}/api/atomic-basket-reservation/trace`)
    const trace = await traceRes.json()
    expect(Array.isArray(trace)).toBe(true)

    // Verify trace contains entry for this specific request
    const requestTrace = trace.find((t: { requestId?: string }) => t.requestId === data.reservationId)
    expect(requestTrace).toBeDefined()

    // Verify products match between original request and reservation doc
    expect(reservationDoc.publicBasket.length).toBe(request.publicBasket.length)
    reservationDoc.publicBasket.forEach((item: { _id: string; quantity: number; stripePriceId: string }) => {
      const originalItem = request.publicBasket.find(p => p._id === item._id)
      expect(originalItem).toBeDefined()
      expect(item.quantity).toBe(originalItem?.quantity)
      expect(item.stripePriceId).toBe(originalItem?.stripePriceId)
    })
  }, 60_000)

  it('verifies proper reservationStock changes in CMS', async () => {
    const request: BasketReservation = {
      publicBasket: [
        { _id: TEST_PRODUCTS[0]._id, quantity: 1, stripePriceId: TEST_PRODUCTS[0].stripePriceId },
        { _id: TEST_PRODUCTS[1]._id, quantity: 2, stripePriceId: TEST_PRODUCTS[1].stripePriceId }
      ],
      createdAt: new Date().toISOString()
    }

    const response = await fetch(`${BASE}/api/atomic-basket-reservation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    })

    const data = await response.json() as BasketReservationResponse

    // Query products directly from CMS and verify reservationStock increased
    const product1 = await client.fetch(`*[_id == $productId][0]{ stock, reservedStock }`, { productId: TEST_PRODUCTS[0]._id })
    const product2 = await client.fetch(`*[_id == $productId][0]{ stock, reservedStock }`, { productId: TEST_PRODUCTS[1]._id })

    expect(product1.reservedStock).toBe(TEST_PRODUCTS[0].reservedStock + 1)
    expect(product2.reservedStock).toBe(TEST_PRODUCTS[1].reservedStock + 2)
  }, 60_000)

  it('directly queries products to verify reservation stock from CMS', async () => {
    const request: BasketReservation = {
      publicBasket: [
        { _id: TEST_PRODUCTS[0]._id, quantity: 1, stripePriceId: TEST_PRODUCTS[0].stripePriceId }
      ],
      createdAt: new Date().toISOString()
    }

    const response = await fetch(`${BASE}/api/atomic-basket-reservation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    })

    const data = await response.json() as BasketReservationResponse

    // Verify response products match CMS product data
    const cmsProduct = await client.fetch(`*[_id == $productId][0]{ _id, stock, reservedStock, displayPrice }`, { productId: TEST_PRODUCTS[0]._id })
    const responseProduct = data.products.find((p: { id: string }) => p.id === TEST_PRODUCTS[0]._id)

    expect(responseProduct).toBeDefined()
    expect(responseProduct.reservedStock).toBe(cmsProduct.reservedStock)
    expect(responseProduct.stock).toBe(cmsProduct.stock)
  }, 60_000)
})
