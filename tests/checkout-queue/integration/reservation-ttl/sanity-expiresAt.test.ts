// Specification test: Sanity doc includes expiresAt timestamp
// Pure input/output - no implementation logic

import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import { fetch } from 'undici'
import type { BasketReservation } from '@/lib/queue/types'
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

describe('Sanity Doc expiresAt Timestamp', () => {
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

  it('Sanity doc includes expiresAt timestamp given reservation creation', async () => {
    const request: BasketReservation = {
      basketReservation: [
        { _id: testProducts[0]._id, quantity: 1, stripePriceId: testProducts[0].stripePriceId, price_data: testProducts[0].price_data },
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

    // Specification: Sanity doc must include expiresAt field
    const doc = await client.fetch(
      `*[_type == "basketReservation" && _id == $id][0]{ expiresAt }`,
      { id: data.reservationId }
    )
    expect(doc).toBeDefined()
    expect(doc.expiresAt).toBeDefined()
  }, 10000)
})
