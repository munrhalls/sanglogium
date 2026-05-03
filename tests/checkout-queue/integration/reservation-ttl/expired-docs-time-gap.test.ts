// Integration test: Expired docs remain detectable over time
// Tests that expired docs don't slip through based on time gaps

import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest'
import { findExpiredReservations } from '@/lib/queue/cleanup'
import { getBackendClient } from '@/sanity-config/lib/backendClient'

describe('Expired Docs Time Gap Integration', () => {
  let testReservationId: string

  beforeAll(async () => {
    const sanity = getBackendClient()
    // Create a test reservation with expired timestamp (1 hour ago)
    testReservationId = `test-time-gap-${Date.now()}`
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

  it('expired docs remain detectable over time, no slip-through based on time', async () => {
    // Wait a short delay to simulate time passing
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Verify expired reservation is still detected after time passes
    const expired = await findExpiredReservations()
    expect(Array.isArray(expired)).toBe(true)

    // Verify our test reservation is found
    const found = expired.find((r: any) => r._id === testReservationId)
    expect(found).toBeTruthy()
    expect(found.expiresAt).toBeDefined()
  }, 10000)
})
