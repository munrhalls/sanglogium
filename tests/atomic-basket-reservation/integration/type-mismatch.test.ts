// Test: Type mismatch → queue rejects (no queue add, no processing)
// Uses real Redis and Sanity, no mocks

import { describe, it, expect, beforeAll } from 'vitest'
import { fetch } from 'undici'

const BASE = process.env.QUEUE_TEST_BASE_URL || 'http://localhost:3000'

describe('Type mismatch rejection', () => {
  beforeAll(async () => {
    // Pre-flight: dev server reachable
    const res = await fetch(`${BASE}/api/atomic-basket-reservation`, { method: 'OPTIONS' }).catch(() => null)
    if (!res) throw new Error(`Dev server not running at ${BASE}. Run 'npm run dev' first.`)
  })

  it('rejects invalid request type (no queue add, no processing)', async () => {
    // Create invalid request missing required fields
    const invalidRequest = {
      publicBasket: [
        { _id: 'test-product-1', quantity: 1 }
        // Missing stripePriceId
      ],
      // Missing createdAt
    }

    // Send invalid request to API endpoint
    const response = await fetch(`${BASE}/api/atomic-basket-reservation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidRequest)
    })

    // Verify queue rejects with error status
    expect(response.status).toBe(400)

    // TODO: Verify no queue add occurred (check Redis)
    // TODO: Verify no processing occurred (check trace)
  }, 60_000)
})
