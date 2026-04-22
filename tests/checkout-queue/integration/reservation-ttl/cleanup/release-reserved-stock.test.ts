// Integration test: releaseReservedStock function
// Uses real Sanity client and test dataset

import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import { releaseReservedStock } from '@/lib/queue/cleanup'
import { getTestProducts, resetProductStock } from '@/tests/helpers/test-data'
import { getBackendClient } from '@/sanity/lib/backendClient'

describe('releaseReservedStock Integration', () => {
  let testProducts: Awaited<ReturnType<typeof getTestProducts>>

  beforeAll(async () => {
    testProducts = await getTestProducts()
    if (testProducts.length < 2) throw new Error('Test dataset must have at least 2 products')
  })

  it('releases reservedStock back to available stock', async () => {
    const backendClient = getBackendClient()
    const productId = testProducts[1]._id
    const quantity = 2

    // Reset product stock to baseline
    await resetProductStock(productId, testProducts[1].stock)

    // First, increment reservedStock to simulate a reservation
    const tx1 = backendClient.transaction()
    tx1.patch(productId, (p) => p.inc({ reservedStock: quantity }))
    await tx1.commit()

    // Verify reservedStock was incremented
    const before = await backendClient.fetch(`*[_id == $id][0]{ reservedStock }`, { id: productId })
    expect(before.reservedStock).toBe(quantity)

    // Call releaseReservedStock
    const result = await releaseReservedStock(productId, quantity)
    expect(result).toBe(true)

    // Verify reservedStock was released
    const after = await backendClient.fetch(`*[_id == $id][0]{ reservedStock }`, { id: productId })
    expect(after.reservedStock).toBe(0)
  }, 10000)
})
