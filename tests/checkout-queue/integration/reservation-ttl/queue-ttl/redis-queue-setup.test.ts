// Pre-flight test: Verify environment is ready for TTL tests
// Checks: server availability, test products exist in dataset

import { describe, it, expect } from 'vitest'
import { fetch } from 'undici'
import { getTestProducts } from '@/tests/helpers/test-data'

const BASE = process.env.QUEUE_TEST_BASE_URL || 'http://localhost:3000'

describe('Redis Queue TTL - Pre-flight Setup', () => {
  it('server responds and test products exist', async () => {
    // Check server availability
    const res = await fetch(`${BASE}/api/checkout-queue`, { method: 'OPTIONS' }).catch(() => null)
    expect(res).toBeTruthy()
    expect(res?.status).toBe(204)

    // Check test products exist
    const testProducts = await getTestProducts()
    expect(testProducts.length).toBeGreaterThanOrEqual(2)
  })
})
