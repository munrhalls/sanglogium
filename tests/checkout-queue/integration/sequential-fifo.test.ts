// Integration test: 9 concurrent basket-reservation requests must be processed
// atomically (one at a time) by /api/checkout-queue.
//
// Atomicity proof: for each request, the trace must contain "processing" then
// "complete" with no other request's "processing" event between them.

import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import { fetch } from 'undici'
import type { BasketReservation, BasketReservationResponse } from '@/lib/queue/types'
import { TEST_PRODUCTS, resetProductStock } from '@/tests/helpers/test-data'

const BASE = process.env.QUEUE_TEST_BASE_URL || 'http://localhost:3000'

interface TraceEntry {
  event: string
  requestId: string
  ts: number
  payload?: Record<string, unknown>
}

async function readTrace(): Promise<TraceEntry[]> {
  const res = await fetch(`${BASE}/api/checkout-queue/trace`)
  return (await res.json()) as TraceEntry[]
}

async function clearState() {
  await fetch(`${BASE}/api/checkout-queue/clear-trace`, { method: 'POST' })
}

describe('Checkout queue — sequential FIFO processing', () => {
  beforeAll(async () => {
    const res = await fetch(`${BASE}/api/checkout-queue`, { method: 'OPTIONS' }).catch(() => null)
    if (!res) throw new Error(`Dev server not running at ${BASE}. Run 'npm run dev' first.`)
  })

  beforeEach(async () => {
    await clearState()
    await resetProductStock(TEST_PRODUCTS[0]._id, TEST_PRODUCTS[0].stock)
    await resetProductStock(TEST_PRODUCTS[1]._id, TEST_PRODUCTS[1].stock)
  })

  it('processes 9 concurrent requests one at a time (no interleaving)', async () => {
    const createdAt = new Date().toISOString()
    const payloads: BasketReservation[] = Array.from({ length: 9 }, (_, i) => {
      const product = TEST_PRODUCTS[i % TEST_PRODUCTS.length]
      return {
        publicBasket: [{ _id: product._id, quantity: 1, stripePriceId: product.stripePriceId }],
        createdAt,
      }
    })

    const responses = await Promise.all(
      payloads.map((p) =>
        fetch(`${BASE}/api/checkout-queue`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(p),
        }).then(async (r) => ({ status: r.status, body: (await r.json()) as BasketReservationResponse }))
      )
    )

    expect(responses.length).toBe(9)
    for (const r of responses) {
      expect(r.status).toBe(202)
      expect(r.body.ok).toBe(true)
    }

    const trace = await readTrace()
    const processing = trace.filter((t) => t.event === 'processing')
    const complete = trace.filter((t) => t.event === 'complete')
    expect(processing.length).toBe(9)
    expect(complete.length).toBe(9)

    // Atomicity: processing/complete events must strictly alternate in pairs
    // for the same requestId (no other processing event between a pair).
    const boundary = trace.filter((t) => t.event === 'processing' || t.event === 'complete')
    for (let i = 0; i < boundary.length; i += 2) {
      expect(boundary[i].event).toBe('processing')
      expect(boundary[i + 1].event).toBe('complete')
      expect(boundary[i + 1].requestId).toBe(boundary[i].requestId)
    }
  }, 120_000)
})
