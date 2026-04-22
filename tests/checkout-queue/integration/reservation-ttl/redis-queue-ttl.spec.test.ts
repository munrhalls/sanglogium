// Specification test: Redis queue items have TTL set given queue enqueue
// End-to-end flow: enqueue request -> verify Redis queue item has TTL
// Uses real API calls only, no mocking

import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest'
import { fetch } from 'undici'
import type { BasketReservation } from '@/lib/queue/types'
import { getTestProducts } from '@/tests/helpers/test-data'
import { getQueueRedis } from '@/lib/queue/redis'
import { QUEUE_LIST_KEY } from '@/lib/queue/constants'

const BASE = process.env.QUEUE_TEST_BASE_URL || 'http://localhost:3000'

describe('Redis Queue TTL Specification', () => {
  let testProducts: Awaited<ReturnType<typeof getTestProducts>>

  beforeAll(async () => {
    const res = await fetch(`${BASE}/api/checkout-queue`, { method: 'OPTIONS' }).catch(() => null)
    if (!res) throw new Error(`Dev server not running at ${BASE}. Run 'npm run dev' first.`)

    testProducts = await getTestProducts()
    if (testProducts.length < 1) throw new Error('Test dataset must have at least 1 product')
  })

  beforeEach(async () => {
    // Clear queue before each test
    const redis = getQueueRedis()
    await redis.del(QUEUE_LIST_KEY)
  })

  afterEach(async () => {
    // Clean up queue after each test
    const redis = getQueueRedis()
    await redis.del(QUEUE_LIST_KEY)
  })

  it('Redis queue items have TTL set given queue enqueue', async () => {
    const request: BasketReservation = {
      basketReservation: [
        { _id: testProducts[0]._id, quantity: 1, stripePriceId: testProducts[0].stripePriceId, displayPrice: testProducts[0].displayPrice },
      ],
      createdAt: new Date().toISOString(),
    }

    // Enqueue request
    const response = await fetch(`${BASE}/api/checkout-queue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    })
    expect(response.status).toBe(202)

    // Verify queue item was enqueued
    const redis = getQueueRedis()
    const queueLength = await redis.llen(QUEUE_LIST_KEY)
    expect(queueLength).toBeGreaterThan(0)

    // Specification: Redis queue item must have TTL set
    // Check TTL of the first item in queue
    const queueKey = QUEUE_LIST_KEY
    const ttl = await redis.ttl(queueKey)

    // TTL should be greater than 0 (not -1 for no TTL, not -2 for key doesn't exist)
    expect(ttl).toBeGreaterThan(0)
  })
})
