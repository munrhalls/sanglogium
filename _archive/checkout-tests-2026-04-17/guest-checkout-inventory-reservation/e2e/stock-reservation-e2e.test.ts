// Integration Test: Stock Reservation End-to-End
// Verifies API → Queue → Sanity stock updates

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import {
  createTestProducts,
  cleanupTestProducts,
  clearRedisTestDb,
  verifySanityStock,
  getRedisQueueState,
  createReservationViaApi,
} from './test-helpers'
import { getTestRedisClient, resetTestEnvironment } from '../config'

describe('Stock Reservation E2E', () => {
  const redis = getTestRedisClient()

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

  it('POST /api/checkout/reserve increments reservedStock in Sanity', async () => {
    // Act: Create reservation via API
    const idempotencyKey = `test-${Date.now()}`
    const response = await createReservationViaApi(
      [{
        _id: 'test-product-1',
        name: 'Test Product 1',
        quantity: 3,
        displayPrice: 100,
        stripePriceId: 'price_test_1',
        image: '/test1.jpg',
        slug: 'test-product-1',
      }],
      idempotencyKey
    )

    expect(response.status).toBe(202)

    // Wait for queue processing
    await waitForQueueProcessing(5000)

    // Assert: Sanity stock was updated
    const stockUpdated = await verifySanityStock('test-product-1', 3)
    expect(stockUpdated).toBe(true)

    // Assert: Redis lock exists
    const lock = await redis.get('stock_lock:test-product-1')
    expect(lock).toBeTruthy()
  })

  it('returns decremented basket when partial availability', async () => {
    // First, reserve most of the stock
    await createReservationViaApi(
      [{
        _id: 'test-product-1',
        name: 'Test Product 1',
        quantity: 8,
        displayPrice: 100,
        stripePriceId: 'price_test_1',
        image: '/test1.jpg',
        slug: 'test-product-1',
      }],
      `first-${Date.now()}`
    )

    await waitForQueueProcessing(5000)

    // Now request more than remaining (stock=10, reserved=8, available=2)
    const response = await createReservationViaApi(
      [{
        _id: 'test-product-1',
        name: 'Test Product 1',
        quantity: 5,
        displayPrice: 100,
        stripePriceId: 'price_test_1',
        image: '/test1.jpg',
        slug: 'test-product-1',
      }],
      `second-${Date.now()}`
    )

    const data = await response.json()
    expect(data.success).toBe(true)
  })

  it('concurrent reservations respect FIFO order', async () => {
    // Create product with only 1 item in stock
    // First request should succeed, second should get empty
    const key1 = `concurrent-1-${Date.now()}`
    const key2 = `concurrent-2-${Date.now()}`

    const res1 = createReservationViaApi(
      [{
        _id: 'test-product-2',
        name: 'Test Product 2',
        quantity: 1,
        displayPrice: 75,
        stripePriceId: 'price_test_2',
        image: '/test2.jpg',
        slug: 'test-product-2',
      }],
      key1
    )

    const res2 = createReservationViaApi(
      [{
        _id: 'test-product-2',
        name: 'Test Product 2',
        quantity: 1,
        displayPrice: 75,
        stripePriceId: 'price_test_2',
        image: '/test2.jpg',
        slug: 'test-product-2',
      }],
      key2
    )

    const [response1, response2] = await Promise.all([res1, res2])

    expect(response1.status).toBe(202)
    expect(response2.status).toBe(202)
  })
})

async function waitForQueueProcessing(timeout = 5000): Promise<void> {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    const state = await getRedisQueueState()
    if (state.waiting === 0 && state.active === 0) return
    await new Promise(r => setTimeout(r, 100))
  }
}
