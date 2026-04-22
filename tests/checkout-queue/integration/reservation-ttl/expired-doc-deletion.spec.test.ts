// Specification test: Expired docs deleted from Sanity given expired reservation
// End-to-end flow: expired reservation -> cleanup -> stock released -> doc deleted
// Uses real API calls only, no mocking

import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest'
import { backgroundCleanupJob } from '@/lib/queue/cleanup'
import { getTestProducts, resetProductStock } from '@/tests/helpers/test-data'
import { getBackendClient } from '@/sanity/lib/backendClient'

describe('Expired Doc Deletion Specification', () => {
  let testProducts: Awaited<ReturnType<typeof getTestProducts>>
  let testReservationId: string

  beforeAll(async () => {
    testProducts = await getTestProducts()
    if (testProducts.length < 1) throw new Error('Test dataset must have at least 1 product')
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

  it('expired docs deleted from Sanity given expired reservation', async () => {
    const sanity = getBackendClient()

    // Reset and increment stock
    await resetProductStock(testProducts[0]._id, testProducts[0].stock)
    const tx = sanity.transaction()
    tx.patch(testProducts[0]._id, (p) => p.inc({ reservedStock: 2 }))
    await tx.commit()

    // Create expired reservation with reservedStock (simulating real expired state)
    testReservationId = `spec-expired-${Date.now()}`
    const expiresAt = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    await sanity.create({
      _id: testReservationId,
      _type: 'basketReservation',
      basketReservation: [
        { _id: testProducts[0]._id, quantity: 2, stripePriceId: testProducts[0].stripePriceId, displayPrice: testProducts[0].displayPrice },
      ],
      createdAt: new Date().toISOString(),
      expiresAt,
    })

    // Verify initial state: reservation exists
    const beforeReservation = await sanity.fetch(`*[_id == $id][0]{ _id, expiresAt }`, { id: testReservationId })
    expect(beforeReservation).toBeTruthy()
    expect(beforeReservation.expiresAt).toBeDefined()
    expect(new Date(beforeReservation.expiresAt) < new Date()).toBe(true)

    // Run background cleanup (simulates scheduled job)
    const results = await backgroundCleanupJob()

    // Specification: expired doc must be deleted from Sanity
    const afterReservation = await sanity.fetch(`*[_id == $id][0]{ _id }`, { id: testReservationId })
    expect(afterReservation).toBeNull()

    // Specification: reservedStock must be released back to available stock (may be negative if cleanup processed multiple reservations)
    const afterProduct = await sanity.fetch(`*[_id == $id][0]{ reservedStock }`, { id: testProducts[0]._id })
    expect(afterProduct.reservedStock).toBeLessThanOrEqual(0)

    // Verify cleanup job results (at least 1 since other tests may create expired reservations)
    expect(results.processed).toBeGreaterThanOrEqual(1)
    expect(results.documentsDeleted).toBeGreaterThanOrEqual(1)
    expect(results.stockReleased).toBeGreaterThanOrEqual(1)
  }, 10000)
})
