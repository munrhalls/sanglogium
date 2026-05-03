// Integration test: Background cleanup job orchestrator
// Tests full cleanup flow: find expired, release stock, delete documents

import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest'
import { backgroundCleanupJob } from '@/lib/queue/cleanup'
import { getTestProducts, resetProductStock } from '@/tests/helpers/sanity-test-products'
import { getBackendClient } from '@/sanity-config/lib/backendClient'

describe('Background Cleanup Job Integration', () => {
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

  it('background cleanup job releases stock and deletes expired reservations', async () => {
    const sanity = getBackendClient()

    // Reset and increment stock
    await resetProductStock(testProducts[0]._id, testProducts[0].stock)
    const tx = sanity.transaction()
    tx.patch(testProducts[0]._id, (p) => p.inc({ reservedStock: 2 }))
    await tx.commit()

    // Create expired reservation
    testReservationId = `test-cleanup-${Date.now()}`
    const expiresAt = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    await sanity.create({
      _id: testReservationId,
      _type: 'basketReservation',
      basketReservation: [
        { _id: testProducts[0]._id, quantity: 2, stripePriceId: testProducts[0].stripePriceId, price_data: testProducts[0].price_data },
      ],
      createdAt: new Date().toISOString(),
      expiresAt,
    })

    // Verify initial state: reservation exists
    const beforeReservation = await sanity.fetch(`*[_id == $id][0]{ _id }`, { id: testReservationId })
    expect(beforeReservation).toBeTruthy()

    // Run background cleanup job
    const results = await backgroundCleanupJob()

    // Verify results (at least 1 since other tests may create expired reservations)
    expect(results.processed).toBeGreaterThanOrEqual(1)
    expect(results.stockReleased).toBeGreaterThanOrEqual(1)
    expect(results.documentsDeleted).toBeGreaterThanOrEqual(1)
    expect(results.errors).toBe(0)

    // Verify reservedStock was released (may be negative if cleanup processed multiple reservations)
    const afterProduct = await sanity.fetch(`*[_id == $id][0]{ reservedStock }`, { id: testProducts[0]._id })
    expect(afterProduct.reservedStock).toBeLessThanOrEqual(0)

    // Verify reservation was deleted
    const afterReservation = await sanity.fetch(`*[_id == $id][0]{ _id }`, { id: testReservationId })
    expect(afterReservation).toBeNull()
  }, 10000)
})
