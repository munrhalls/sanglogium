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
import { TEST_PRODUCTS, resetProductStock } from '@/tests/helpers/test-data'
import { client } from '@/sanity/lib/client'

const BASE = process.env.QUEUE_TEST_BASE_URL || 'http://localhost:3000'

describe('Checkout queue — basket reservation flow', () => {
  beforeAll(async () => {
    const res = await fetch(`${BASE}/api/checkout-queue`, { method: 'OPTIONS' }).catch(() => null)
    if (!res) throw new Error(`Dev server not running at ${BASE}. Run 'npm run dev' first.`)
  })

  beforeEach(async () => {
    await resetProductStock(TEST_PRODUCTS[0]._id, TEST_PRODUCTS[0].stock)
    await resetProductStock(TEST_PRODUCTS[1]._id, TEST_PRODUCTS[1].stock)
  })

  it('queues request → creates reservation doc in Sanity → returns BasketReservationResponse', async () => {
    const request: BasketReservation = {
      publicBasket: [
        { _id: TEST_PRODUCTS[0]._id, quantity: 1, stripePriceId: TEST_PRODUCTS[0].stripePriceId },
        { _id: TEST_PRODUCTS[1]._id, quantity: 2, stripePriceId: TEST_PRODUCTS[1].stripePriceId },
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

    // Reservation doc exists in Sanity with matching publicBasket items.
    const doc = await client.fetch(
      `*[_type == "basketReservation" && _id == $id][0]`,
      { id: data.reservationId }
    )
    expect(doc).toBeDefined()
    expect(doc._type).toBe('basketReservation')
    expect(Array.isArray(doc.publicBasket)).toBe(true)
    expect(doc.publicBasket.length).toBe(request.publicBasket.length)

    for (const item of doc.publicBasket) {
      const original = request.publicBasket.find((p) => p._id === item._id)
      expect(original).toBeDefined()
      expect(item.quantity).toBe(original?.quantity)
      expect(item.stripePriceId).toBe(original?.stripePriceId)
    }
  }, 60_000)

  it('increments reservedStock on each product by the requested quantity', async () => {
    const request: BasketReservation = {
      publicBasket: [
        { _id: TEST_PRODUCTS[0]._id, quantity: 1, stripePriceId: TEST_PRODUCTS[0].stripePriceId },
        { _id: TEST_PRODUCTS[1]._id, quantity: 2, stripePriceId: TEST_PRODUCTS[1].stripePriceId },
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
      id: TEST_PRODUCTS[0]._id,
    })
    const p2 = await client.fetch(`*[_id == $id][0]{ reservedStock }`, {
      id: TEST_PRODUCTS[1]._id,
    })
    expect(p1.reservedStock).toBe(TEST_PRODUCTS[0].reservedStock + 1)
    expect(p2.reservedStock).toBe(TEST_PRODUCTS[1].reservedStock + 2)
  }, 60_000)

  it('response product snapshot matches the freshly-updated Sanity product doc', async () => {
    const request: BasketReservation = {
      publicBasket: [
        { _id: TEST_PRODUCTS[0]._id, quantity: 1, stripePriceId: TEST_PRODUCTS[0].stripePriceId },
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
      { id: TEST_PRODUCTS[0]._id }
    )
    const respProd = data.products.find((p) => p.id === TEST_PRODUCTS[0]._id)

    expect(respProd).toBeDefined()
    expect(respProd?.stock).toBe(cms.stock)
    expect(respProd?.reservedStock).toBe(cms.reservedStock)
    expect(respProd?.realPrice).toBe(cms.displayPrice)
  }, 60_000)
})
