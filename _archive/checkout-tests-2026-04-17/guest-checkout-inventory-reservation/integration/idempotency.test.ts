// Integration Test: Idempotency Verification
// Tests idempotency key caching and parameter validation

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import {
  createTestProducts,
  cleanupTestProducts,
  clearRedisTestDb,
  getIdempotencyCache,
  createReservationViaApi,
} from './test-helpers'
import { resetTestEnvironment } from '../config'

describe('Idempotency', () => {
  beforeAll(async () => {
    await createTestProducts()
  }, 30000)

  afterAll(async () => {
    await cleanupTestProducts()
    await resetTestEnvironment()
  }, 30000)

  beforeEach(async () => {
    await clearRedisTestDb()
  })

  it('same idempotency key returns cached response', async () => {
    const key = `idempotent-${Date.now()}`
    const basket = [{
      _id: 'test-product-1',
      name: 'Test Product 1',
      quantity: 2,
      displayPrice: 100,
      stripePriceId: 'price_test_1',
      image: '/test1.jpg',
      slug: 'test-product-1',
    }]

    // First request
    const res1 = await createReservationViaApi(basket, key)
    const data1 = await res1.json()

    // Second request with same key
    const res2 = await createReservationViaApi(basket, key)
    const data2 = await res2.json()

    // Should get same reservation token (cached response)
    expect(data2.data?.reservationToken).toBe(data1.data?.reservationToken)

    // Verify cache exists
    const cached = await getIdempotencyCache(key)
    expect(cached).toBeTruthy()
    expect(cached?.requestFingerprint).toBeTruthy()
  })

  it('different payload with same key returns parameter mismatch', async () => {
    const key = `mismatch-${Date.now()}`

    // First request with product-1
    const res1 = await createReservationViaApi(
      [{
        _id: 'test-product-1',
        name: 'Test Product 1',
        quantity: 2,
        displayPrice: 100,
        stripePriceId: 'price_test_1',
        image: '/test1.jpg',
        slug: 'test-product-1',
      }],
      key
    )
    expect(res1.status).toBe(202)

    // Second request with different payload (different quantity)
    const res2 = await createReservationViaApi(
      [{
        _id: 'test-product-1',
        name: 'Test Product 1',
        quantity: 3, // Different quantity
        displayPrice: 100,
        stripePriceId: 'price_test_1',
        image: '/test1.jpg',
        slug: 'test-product-1',
      }],
      key
    )

    const data2 = await res2.json()
    expect(data2.error).toBe('idempotency_key_parameter_mismatch')
  })
})
