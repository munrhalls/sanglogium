// Specification test: Redis queue TTL behavior via API endpoint
// End-to-end flow: POST reservation -> wait for expiration -> verify cleanup
// Uses real API calls only, no mocking, no direct Redis calls

import { describe, it, expect, beforeAll, afterEach } from 'vitest'
import { fetch } from 'undici'
import type { BasketReservation } from '@/lib/queue/types'
import { getTestProducts } from '@/tests/helpers/test-data'
import { getBackendClient } from '@/sanity/lib/backendClient'
import { backgroundCleanupJob } from '@/lib/queue/cleanup'

const BASE = process.env.QUEUE_TEST_BASE_URL || 'http://localhost:3000'
const RESERVATION_TTL_SEC = parseInt(process.env.RESERVATION_TTL_SEC || '5', 10)

describe('Redis Queue TTL Specification', () => {
  let testProducts: Awaited<ReturnType<typeof getTestProducts>>
  let testReservationId: string

  beforeAll(async () => {
    testProducts = await getTestProducts()
  })

  afterEach(async () => {
    // Clean up test reservation if it still exists
    const sanity = getBackendClient()
    try {
      await sanity.delete(testReservationId)
    } catch {
      // Ignore if already deleted
    }
  })

  it('expired reservation is deleted after TTL expiration', async () => {
    const request: BasketReservation = {
      basketReservation: [
        { _id: testProducts[0]._id, quantity: 1, stripePriceId: testProducts[0].stripePriceId, displayPrice: testProducts[0].displayPrice },
      ],
      createdAt: new Date().toISOString(),
    }

    // POST reservation request
    const response = await fetch(`${BASE}/api/checkout-queue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    })
    expect(response.status).toBe(202)
    const data = await response.json()
    testReservationId = data.reservationId

    // Verify reservation exists in Sanity
    const sanity = getBackendClient()
    const beforeReservation = await sanity.fetch(`*[_id == $id][0]{ _id, expiresAt }`, { id: testReservationId })
    expect(beforeReservation).toBeTruthy()
    expect(beforeReservation.expiresAt).toBeDefined()

    // Wait for TTL expiration (RESERVATION_TTL_SEC + buffer)
    await new Promise(resolve => setTimeout(resolve, (RESERVATION_TTL_SEC + 2) * 1000))

    // Run background cleanup job
    const results = await backgroundCleanupJob()
    expect(results.processed).toBeGreaterThanOrEqual(1)

    // Verify reservation was deleted
    const afterReservation = await sanity.fetch(`*[_id == $id][0]{ _id }`, { id: testReservationId })
    expect(afterReservation).toBeNull()
  }, 30000)

  it('non-expired reservation processes normally and is not deleted', async () => {
    const request: BasketReservation = {
      basketReservation: [
        { _id: testProducts[1]._id, quantity: 1, stripePriceId: testProducts[1].stripePriceId, displayPrice: testProducts[1].displayPrice },
      ],
      createdAt: new Date().toISOString(),
    }

    // POST reservation request
    const response = await fetch(`${BASE}/api/checkout-queue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    })
    expect(response.status).toBe(202)
    const data = await response.json()
    testReservationId = data.reservationId

    // Verify reservation exists in Sanity
    const sanity = getBackendClient()
    const beforeReservation = await sanity.fetch(`*[_id == $id][0]{ _id }`, { id: testReservationId })
    expect(beforeReservation).toBeTruthy()

    // Run background cleanup job immediately (reservation not expired)
    const results = await backgroundCleanupJob()

    // Verify reservation was NOT deleted (not in processed results)
    const afterReservation = await sanity.fetch(`*[_id == $id][0]{ _id }`, { id: testReservationId })
    expect(afterReservation).toBeTruthy()
  }, 10000)
})
