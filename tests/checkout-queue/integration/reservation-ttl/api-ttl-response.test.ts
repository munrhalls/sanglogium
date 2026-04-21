// Specification test: API response includes TTL field
// Pure input/output - no implementation logic

import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import { fetch } from 'undici'
import type { BasketReservation } from '@/lib/queue/types'
import { getTestProducts, resetProductStock } from '@/tests/helpers/test-data'

const BASE = process.env.QUEUE_TEST_BASE_URL || 'http://localhost:3000'

describe('API Response TTL Field', () => {
  let testProducts: Awaited<ReturnType<typeof getTestProducts>>

  beforeAll(async () => {
    const res = await fetch(`${BASE}/api/checkout-queue`, { method: 'OPTIONS' }).catch(() => null)
    if (!res) throw new Error(`Dev server not running at ${BASE}. Run 'npm run dev' first.`)

    testProducts = await getTestProducts()
    if (testProducts.length < 1) throw new Error('Test dataset must have at least 1 product')
  })

  beforeEach(async () => {
    await fetch(`${BASE}/api/checkout-queue/clear-trace`, { method: 'POST' })
    await resetProductStock(testProducts[0]._id, testProducts[0].stock)
  })

  it('API response includes TTL field given reservation request', async () => {
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
    expect(response.status).toBe(202)
    const data = await response.json()

    // Specification: response must include ttl field
    expect(data.ttl).toBeDefined()
    expect(typeof data.ttl).toBe('number')
    expect(data.ttl).toBeGreaterThan(0)
  })
})
