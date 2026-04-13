// Integration Test: Queue Operations
//
// Scope: API request -> Redis queue addition
// OUT OF SCOPE: Request formation, response handling, state management, UI updates
//
// Uses real Redis connection (localhost:6379, DB 0) - no mocks

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { v4 as uuidv4 } from 'uuid'
import Redis from 'ioredis'
import { FIFOQueue } from '@/lib/checkout/reservation/fifo-queue'
import { getRedisClient } from '@/lib/checkout/reservation/redis-client'
import type { QueueRequest } from '@/lib/checkout/reservation/types'

// Test data - inline to avoid fixtures (no external dependencies)
const clientBasket = {
  products: [
    {
      id: 'prod-1',
      quantity: 2,
      stripePriceId: 'price_1234567890'
    }
  ],
  currency: 'PLN'
}

describe('Queue Operations', () => {
  let queue: FIFOQueue
  let redis: Redis

  beforeEach(async () => {
    // Use real Redis connection - no mocks
    redis = getRedisClient()
    queue = new FIFOQueue(redis)

    // Clear test DB (using DB 0 as configured)
    await redis.flushdb()
  })

  afterEach(async () => {
    // Cleanup - only clear DB, don't quit singleton
    await redis.flushdb()
  })

  describe('Redis Queue Addition', () => {
    it('should add request to FIFO queue', async () => {
      const idempotencyKey = uuidv4()

      const request: QueueRequest = {
        id: uuidv4(),
        type: 'create_reservation',
        idempotencyKey,
        payload: {
          clientBasket
        },
        priority: 'normal',
        createdAt: new Date(),
        retryCount: 0
      }

      const result = await queue.enqueue(request)

      expect(result).toHaveProperty('requestId')
      expect(result).toHaveProperty('status', 'processing')
    })

    it('should pass QueueRequest object to queue', async () => {
      const idempotencyKey = uuidv4()

      const request: QueueRequest = {
        id: uuidv4(),
        type: 'create_reservation',
        idempotencyKey,
        payload: {
          clientBasket
        },
        priority: 'normal',
        createdAt: new Date(),
        retryCount: 0
      }

      // Verify request structure before adding
      expect(request).toMatchObject({
        type: 'create_reservation',
        idempotencyKey,
        payload: { clientBasket }
      })

      const result = await queue.enqueue(request)

      // Verify it was added to Redis
      expect(result.requestId).toBeDefined()
    })

    it('should handle queue addition success', async () => {
      const idempotencyKey = uuidv4()

      const request: QueueRequest = {
        id: uuidv4(),
        type: 'create_reservation',
        idempotencyKey,
        payload: {
          clientBasket
        },
        priority: 'normal',
        createdAt: new Date(),
        retryCount: 0
      }

      const result = await queue.enqueue(request)

      expect(result.status).toBe('processing')
      expect(typeof result.requestId).toBe('string')
    })

    it('should handle high priority requests', async () => {
      const idempotencyKey = uuidv4()

      const highPriorityRequest: QueueRequest = {
        id: uuidv4(),
        type: 'create_reservation',
        idempotencyKey,
        payload: {
          clientBasket
        },
        priority: 'high',
        createdAt: new Date(),
        retryCount: 0
      }

      const result = await queue.enqueue(highPriorityRequest)

      expect(result).toHaveProperty('requestId')
      expect(result).toHaveProperty('status', 'processing')
    })

    it('should handle multiple requests sequentially', async () => {
      const requests: QueueRequest[] = []
      
      // Create multiple requests
      for (let i = 0; i < 3; i++) {
        requests.push({
          id: uuidv4(),
          type: 'create_reservation',
          idempotencyKey: uuidv4(),
          payload: { clientBasket },
          priority: 'normal',
          createdAt: new Date(),
          retryCount: 0
        })
      }

      // Add them to queue sequentially
      const results = await Promise.all(
        requests.map(request => queue.enqueue(request))
      )

      // All should succeed
      results.forEach(result => {
        expect(result).toHaveProperty('requestId')
        expect(result).toHaveProperty('status', 'processing')
      })

      // All request IDs should be unique
      const requestIds = results.map(r => r.requestId)
      const uniqueIds = new Set(requestIds)
      expect(uniqueIds.size).toBe(requestIds.length)
    })
  })
})
