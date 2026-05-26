// ============================================================================
// ⚠️  LEGACY - DEPRECATED - NO LONGER USED IN ACTIVE CHECKOUT FLOW ⚠️
// ============================================================================
// This checkout-queue system is LEGACY and NOT part of the current checkout implementation.
// 
// Current checkout flow uses:
//   - iron-session for state management (no queue)
//   - Direct Sanity API calls (no Redis queue)
//   - See: app/actions/checkout/index.ts
//
// DO NOT use this code for new features. It exists only for:
//   - Historical reference
//   - Legacy test compatibility
//   - Potential future audit needs
//
// To delete safely: Remove all files in lib/queue/, app/api/checkout-queue/, tests/checkout-queue/
// ============================================================================

// Integration test: Reservation TTL expiration
//   → Creates reservation
//   → Verifies TTL field exists in response
//   → Waits for TTL to expire
//   → Verifies reservedStock released
//   → Verifies basket reservation doc deleted
//
// Zero mocks: hits real Redis and real Sanity via the running dev server.
// Serves as specification for automatic TTL feature.

import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import { fetch } from 'undici'
import type { BasketReservation, BasketReservationResponse } from '@/lib/queue/types'
import { getTestProducts, resetProductStock } from '@/tests/helpers/sanity-test-products'
import { createClient } from 'next-sanity'
import { apiVersion, projectId, dataset } from '@/sanity-cms/env'

const BASE = process.env.QUEUE_TEST_BASE_URL || 'http://localhost:3000'

// Read client for querying test dataset
const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
})

describe('Reservation TTL expiration', () => {
  let testProducts: Awaited<ReturnType<typeof getTestProducts>>

  beforeAll(async () => {
    // Check if queue is active and available for tests
    const res = await fetch(`${BASE}/api/checkout-queue`, { method: 'OPTIONS' }).catch(() => null)
    if (!res) throw new Error(`Dev server not running at ${BASE}. Run 'npm run dev' first.`)

    // Fetch products from test dataset
    testProducts = await getTestProducts()
    if (testProducts.length < 1) throw new Error('Test dataset must have at least 1 product')
  })

  beforeEach(async () => {
    await fetch(`${BASE}/api/checkout-queue/clear-trace`, { method: 'POST' })
    await resetProductStock(testProducts[0]._id, testProducts[0].stock)
  })

  it('reservation includes TTL field and expires after TTL, releasing reservedStock and deleting doc', async () => {
    const request: BasketReservation = {
      basketReservation: [
        { _id: testProducts[0]._id, quantity: 1, price_data: testProducts[0].price_data },
      ],
      createdAt: new Date().toISOString(),
    }

    // Create reservation
    const response = await fetch(`${BASE}/api/checkout-queue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    })
    expect(response.status).toBe(202)
    const data = (await response.json()) as BasketReservationResponse

    // Check if TTL field exists in response (specification for automatic TTL)
    if (!data.ttl) {
      throw new Error('TTL field missing from response - automatic TTL not implemented')
    }
    expect(data.ttl).toBeDefined()
    expect(typeof data.ttl).toBe('number')
    expect(data.ttl).toBeGreaterThan(0)

    // Verify reservedStock incremented initially
    const productBefore = await client.fetch(`*[_id == $id][0]{ reservedStock, stock }`, {
      id: testProducts[0]._id,
    })
    expect(productBefore).toBeDefined()
    expect(productBefore.reservedStock).toBe(1)

    // Wait for TTL to expire (using short TTL for testing)
    // Note: This assumes TTL is in seconds and can be configured for testing
    await new Promise(resolve => setTimeout(resolve, data.ttl * 1000 + 1000)) // TTL + 1 second buffer

    // Verify reservedStock released back to original value
    const productAfter = await client.fetch(`*[_id == $id][0]{ reservedStock, stock }`, {
      id: testProducts[0]._id,
    })
    expect(productAfter).toBeDefined()
    expect(productAfter.reservedStock).toBe(0) // Released back to available stock

    // Verify basket reservation doc deleted from Sanity
    const reservationDoc = await client.fetch(
      `*[_type == "basketReservation" && _id == $id][0]`,
      { id: data.reservationId }
    )
    expect(reservationDoc).toBeNull() // Doc should be deleted after TTL
  }, 60_000)
})
