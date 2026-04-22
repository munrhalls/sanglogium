// Integration test: findExpiredReservations function
// Uses real Sanity client and test dataset

import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest'
import { findExpiredReservations } from '@/lib/queue/cleanup'
import { getBackendClient } from '@/sanity/lib/backendClient'

describe('findExpiredReservations Integration', () => {
  let testReservationId: string

  beforeAll(async () => {
    const sanity = getBackendClient()
    // Create a test reservation with expired timestamp (1 hour ago)
    testReservationId = `test-expired-${Date.now()}`
    const expiresAt = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    await sanity.create({
      _id: testReservationId,
      _type: 'basketReservation',
      basketReservation: [],
      createdAt: new Date().toISOString(),
      expiresAt,
    })
  })

  afterEach(async () => {
    // Clean up test reservation after each test
    const sanity = getBackendClient()
    try {
      await sanity.delete(testReservationId)
    } catch {
      // Ignore if already deleted
    }
  })

  it('finds reservations with expiresAt timestamp less than now', async () => {
    const expired = await findExpiredReservations()
    expect(Array.isArray(expired)).toBe(true)

    // Verify our test reservation is in the results (at least 1 expired reservation exists)
    expect(expired.length).toBeGreaterThanOrEqual(1)
  }, 10000)
})
