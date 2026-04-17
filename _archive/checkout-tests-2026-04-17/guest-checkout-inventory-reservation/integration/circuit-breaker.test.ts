// Integration Test: Circuit Breaker
// Tests failure threshold, state transitions, and cooldown

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import {
  createTestProducts,
  cleanupTestProducts,
  clearRedisTestDb,
  createReservationViaApi,
} from './test-helpers'
import { getTestRedisClient, resetTestEnvironment, CIRCUIT_BREAKER } from '../config'
import { CircuitBreakerManager } from '@/lib/checkout/reservation/redis-managers'

describe('Circuit Breaker', () => {
  const redis = getTestRedisClient()
  const cbManager = new CircuitBreakerManager(redis)

  beforeAll(async () => {
    await createTestProducts()
  }, 30000)

  afterAll(async () => {
    await cleanupTestProducts()
    await resetTestEnvironment()
  }, 30000)

  beforeEach(async () => {
    await clearRedisTestDb()
    await cbManager.setCircuitBreakerState('queue', {
      state: 'CLOSED',
      failureCount: 0,
      lastFailureTime: null,
      nextAttemptTime: null,
    })
  })

  it('5 failures opens circuit breaker', async () => {
    // Trigger 5 failures with invalid product IDs
    for (let i = 0; i < 5; i++) {
      const key = `cb-fail-${i}-${Date.now()}`
      await createReservationViaApi(
        [{
          _id: 'nonexistent-product',
          name: 'Invalid',
          quantity: 1,
          displayPrice: 100,
          stripePriceId: 'price_invalid',
          image: '/invalid.jpg',
          slug: 'invalid',
        }],
        key
      )
    }

    // Verify CB is open
    const state = await cbManager.getCircuitBreakerState('queue')
    expect(state?.state).toBe('OPEN')
    expect(state?.failureCount).toBeGreaterThanOrEqual(5)
  })

  it('successful request resets failure count', async () => {
    // Trigger 3 failures
    for (let i = 0; i < 3; i++) {
      const key = `cb-partial-${i}-${Date.now()}`
      await createReservationViaApi(
        [{
          _id: 'nonexistent-product',
          name: 'Invalid',
          quantity: 1,
          displayPrice: 100,
          stripePriceId: 'price_invalid',
          image: '/invalid.jpg',
          slug: 'invalid',
        }],
        key
      )
    }

    // One success
    const successKey = `cb-success-${Date.now()}`
    await createReservationViaApi(
      [{
        _id: 'test-product-1',
        name: 'Test Product 1',
        quantity: 1,
        displayPrice: 100,
        stripePriceId: 'price_test_1',
        image: '/test1.jpg',
        slug: 'test-product-1',
      }],
      successKey
    )

    // Failure count should be reset
    const count = await cbManager.getFailureCount('queue')
    expect(count).toBe(0)
  })

  it('stores correct failure threshold config', () => {
    expect(CIRCUIT_BREAKER.failureThreshold).toBe(5)
    expect(CIRCUIT_BREAKER.cooldownMs).toBe(30000)
  })
})
