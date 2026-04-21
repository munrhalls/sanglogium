// Integration test: deleteExpiredReservation function
// Uses real Sanity client and test dataset

import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import { deleteExpiredReservation } from '@/lib/queue/cleanup'
import { getBackendClient } from '@/sanity/lib/backendClient'

describe('deleteExpiredReservation Integration', () => {
  let testReservationId: string

  beforeAll(async () => {
    const sanity = getBackendClient()
    // Create a test reservation document
    testReservationId = `test-reservation-${Date.now()}`
    await sanity.create({
      _id: testReservationId,
      _type: 'basketReservation',
      basketReservation: [],
      createdAt: new Date().toISOString(),
      expiresAt: new Date().toISOString(),
    })
  })

  beforeEach(async () => {
    // Recreate reservation if it was deleted in previous test
    const sanity = getBackendClient()
    const existing = await sanity.fetch(`*[_id == $id][0]{ _id }`, { id: testReservationId })
    if (!existing) {
      await sanity.create({
        _id: testReservationId,
        _type: 'basketReservation',
        basketReservation: [],
        createdAt: new Date().toISOString(),
        expiresAt: new Date().toISOString(),
      })
    }
  })

  it('deletes expired reservation document from Sanity', async () => {
    const sanity = getBackendClient()

    // Verify reservation exists
    const before = await sanity.fetch(`*[_id == $id][0]{ _id }`, { id: testReservationId })
    expect(before).toBeTruthy()

    // Call deleteExpiredReservation
    const result = await deleteExpiredReservation(testReservationId)
    expect(result).toBe(true)

    // Verify reservation is deleted
    const after = await sanity.fetch(`*[_id == $id][0]{ _id }`, { id: testReservationId })
    expect(after).toBeNull()
  })
})
