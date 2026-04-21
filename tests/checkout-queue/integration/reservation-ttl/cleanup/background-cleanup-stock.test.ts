// Integration test: Background cleanup job orchestrator
// Tests full cleanup flow: find expired, release stock, delete documents

import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest'
import { backgroundCleanupJob } from '@/lib/queue/cleanup'
import { getTestProducts, resetProductStock } from '@/tests/helpers/test-data'
import { getBackendClient } from '@/sanity/lib/backendClient'

describe('Background Cleanup Job Integration', () => {
  let testProducts: Awaited<ReturnType<typeof getTestProducts>>
  let testReservationId: string

  beforeAll(async () => {
    testProducts = await getTestProducts()
    if (testProducts.length < 1) throw new Error('Test dataset must have at least 1 product')
  })

  beforeEach(async () => {
    await resetProductStock(testProducts[0]._id, testProducts[0].stock)

    // Create an expired reservation with reservedStock
    const sanity = getBackendClient()
    const tx = sanity.transaction()
    tx.patch(testProducts[0]._id, (p) => p.inc({ reservedStock: 2 }))
    await tx.commit()

    testReservationId = `test-cleanup-${Date.now()}`
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

  it('background cleanup job releases stock and deletes expired reservations', async () => {
    const sanity = getBackendClient()

    // Verify initial state: reservedStock = 2, reservation exists
    const beforeProduct = await sanity.fetch(`*[_id == $id][0]{ reservedStock }`, { id: testProducts[0]._id })
    expect(beforeProduct.reservedStock).toBe(2)

    const beforeReservation = await sanity.fetch(`*[_id == $id][0]{ _id }`, { id: testReservationId })
    expect(beforeReservation).toBeTruthy()

    // Run background cleanup job
    const results = await backgroundCleanupJob()

    // Verify results
    expect(results.processed).toBe(1)
    expect(results.stockReleased).toBe(1)
    expect(results.documentsDeleted).toBe(1)
    expect(results.errors).toBe(0)

    // Verify reservedStock was released
    const afterProduct = await sanity.fetch(`*[_id == $id][0]{ reservedStock }`, { id: testProducts[0]._id })
    expect(afterProduct.reservedStock).toBe(0)

    // Verify reservation was deleted
    const afterReservation = await sanity.fetch(`*[_id == $id][0]{ _id }`, { id: testReservationId })
    expect(afterReservation).toBeNull()
  })
})
