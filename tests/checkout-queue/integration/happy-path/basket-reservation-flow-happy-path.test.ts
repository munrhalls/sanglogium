// Integration test: UI basket reservation request
//   → /api/checkout-queue (queued, one-at-a-time)
//   → Sanity basketReservation doc created
//   → reservedStock incremented atomically
//   → BasketReservationResponse returned to UI
//
// Zero mocks: hits real Redis and real Sanity via the running dev server.

import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import { fetch } from 'undici'
import type { BasketReservation, BasketReservationResponse } from '@/lib/queue/types'
import { getTestProducts, resetProductStock } from '@/tests/helpers/sanity-test-products'
import { createClient } from 'next-sanity'
import { apiVersion, projectId, dataset } from '@/sanity/env'

const BASE = process.env.QUEUE_TEST_BASE_URL || 'http://localhost:3000'

// Read client for querying test dataset
const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
})

describe('Checkout button click -> Checkout queue — atomic CMS operation - basket reservation flow', () => {
  let testProducts: Awaited<ReturnType<typeof getTestProducts>>

  beforeAll(async () => {
    // Check if queue is active and available for tests
    const res = await fetch(`${BASE}/api/checkout-queue`, { method: 'OPTIONS' }).catch(() => null)
    if (!res) throw new Error(`Dev server not running at ${BASE}. Run 'npm run dev' first.`)

    // Fetch products from test dataset
    testProducts = await getTestProducts()
    if (testProducts.length < 2) throw new Error('Test dataset must have at least 2 products')
  })

  beforeEach(async () => {
    await fetch(`${BASE}/api/checkout-queue/clear-trace`, { method: 'POST' })
    await resetProductStock(testProducts[0]._id, testProducts[0].stock)
    await resetProductStock(testProducts[1]._id, testProducts[1].stock)
  })

  it('queues request → creates reservation doc in Sanity → returns BasketReservationResponse', async () => {
    const request: BasketReservation = {
      basketReservation: [
        { _id: testProducts[0]._id, quantity: 1, stripePriceId: testProducts[0].stripePriceId, displayPrice: testProducts[0].displayPrice },
        { _id: testProducts[1]._id, quantity: 2, stripePriceId: testProducts[1].stripePriceId, displayPrice: testProducts[1].displayPrice },
      ],
      createdAt: new Date().toISOString(),
    }

    const response = await fetch(`${BASE}/api/checkout-queue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    })

    expect(response.status).toBe(202)

    const data = (await response.json()) as BasketReservationResponse
    expect(data.ok).toBe(true)
    expect(typeof data.reservationId).toBe('string')
    expect(Array.isArray(data.products)).toBe(true)
    expect(data.products.length).toBe(2)

    // Reservation doc exists in Sanity with matching basketReservation items.
    const doc = await client.fetch(
      `*[_type == "basketReservation" && _id == $id][0]`,
      { id: data.reservationId }
    )
    expect(doc).toBeDefined()
    expect(doc._type).toBe('basketReservation')
    expect(Array.isArray(doc.basketReservation)).toBe(true)
    expect(doc.basketReservation.length).toBe(request.basketReservation.length)

    for (const item of doc.basketReservation) {
      const original = request.basketReservation.find((p) => p._id === item._id)
      expect(original).toBeDefined()
      expect(item.quantity).toBe(original?.quantity)
      expect(item.verifiedPrice).toBeGreaterThan(0)
      expect(item.stripePriceId).toBeUndefined()
    }
  }, 60_000)

  it('increments reservedStock on each product by the requested quantity', async () => {
    const request: BasketReservation = {
      basketReservation: [
        { _id: testProducts[0]._id, quantity: 1, stripePriceId: testProducts[0].stripePriceId, displayPrice: testProducts[0].displayPrice },
        { _id: testProducts[1]._id, quantity: 2, stripePriceId: testProducts[1].stripePriceId, displayPrice: testProducts[1].displayPrice },
      ],
      createdAt: new Date().toISOString(),
    }

    const response = await fetch(`${BASE}/api/checkout-queue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    })
    expect(response.status).toBe(202)
    await response.json()

    const p1 = await client.fetch(`*[_id == $id][0]{ reservedStock }`, {
      id: testProducts[0]._id,
    })
    const p2 = await client.fetch(`*[_id == $id][0]{ reservedStock }`, {
      id: testProducts[1]._id,
    })
    expect(p1.reservedStock).toBe(1) // beforeEach resets to 0, then +1
    expect(p2.reservedStock).toBe(2) // beforeEach resets to 0, then +2
  }, 60_000)

  it('response product snapshot matches the freshly-updated Sanity product doc', async () => {
    const request: BasketReservation = {
      basketReservation: [
        { _id: testProducts[0]._id, quantity: 1, stripePriceId: testProducts[0].stripePriceId, displayPrice: testProducts[0].displayPrice },
      ],
      createdAt: new Date().toISOString(),
    }

    const response = await fetch(`${BASE}/api/checkout-queue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    })
    const data = (await response.json()) as BasketReservationResponse

    const cms = await client.fetch(
      `*[_id == $id][0]{ stock, reservedStock, displayPrice }`,
      { id: testProducts[0]._id }
    )
    const respProd = data.products.find((p) => p.id === testProducts[0]._id)

    expect(respProd).toBeDefined()
    expect(respProd?.stock).toBe(cms.stock)
    expect(respProd?.reservedStock).toBe(cms.reservedStock)
    expect(respProd?.realPrice).toBe(cms.displayPrice)
  }, 60_000)
})
