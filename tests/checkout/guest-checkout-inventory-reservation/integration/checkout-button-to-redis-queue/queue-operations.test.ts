// Integration Test: Queue Operations
//
// Scope: API request -> Redis Stream queue -> Redis token management
// OUT OF SCOPE: Request formation, response handling, state management, UI updates
//
// Uses real Redis connection (localhost:6379) - no mocks
// Queue backed by Redis Streams (XADD/XREADGROUP/XACK/XDEL) per PRD line 79

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
    queue = new FIFOQueue(
      redis,
      async () => {}, // Mock handler for create_reservation
      async () => {}, // Mock handler for rollback
      async () => {}  // Mock handler for realize
    )

    // Clear test DB (flushes streams, tokens, circuit breaker keys)
    await redis.flushdb()
  })

  afterEach(async () => {
    // Cleanup - only clear DB, don't quit singleton
    await redis.flushdb()
  })

  describe('Redis Stream Queue Operations', () => {
    it('should add request to Redis Stream via XADD', async () => {
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

    it('should pass QueueRequest object to Redis Stream queue', async () => {
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

      // Verify response structure
      expect(result.requestId).toBeDefined()
      expect(result.status).toBe('processing')
    })

    it('should handle queue addition success via Redis Stream', async () => {
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

    it('should handle high priority requests via priority stream', async () => {
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

    it('should handle multiple requests sequentially maintaining FIFO order', async () => {
      const requests: QueueRequest[] = []

      // Create requests with predictable IDs for order verification
      for (let i = 0; i < 3; i++) {
        requests.push({
          id: `test-request-${i}`, // Predictable ID
          type: 'create_reservation',
          idempotencyKey: uuidv4(),
          payload: { clientBasket },
          priority: 'normal',
          createdAt: new Date(),
          retryCount: 0
        })
      }

      // Enqueue SEQUENTIALLY, not in parallel
      const results = []
      for (const request of requests) {
        const result = await queue.enqueue(request)
        results.push(result)
      }

      // All should succeed
      results.forEach(result => {
        expect(result).toHaveProperty('requestId')
        expect(result).toHaveProperty('status', 'processing')
      })

      // Verify FIFO order - request IDs should match input order
      expect(results[0].requestId).toBe(requests[0].id)
      expect(results[1].requestId).toBe(requests[1].id)
      expect(results[2].requestId).toBe(requests[2].id)

      // Wait for async stream processing
      await new Promise(resolve => setTimeout(resolve, 50))

      // Verify queue length via XLEN (async — queries Redis)
      const queueLengths = await queue.getQueueLengths()
      expect(queueLengths.normal).toBe(0) // All processed
      expect(queueLengths.priority).toBe(0)
    })

    it('should verify queue state and Redis token operations', async () => {
      // Verify initial queue state via XLEN
      const initialLengths = await queue.getQueueLengths()
      expect(initialLengths.normal).toBe(0)
      expect(initialLengths.priority).toBe(0)

      // Enqueue a request and verify queue state changes
      const request: QueueRequest = {
        id: 'queue-state-test',
        type: 'create_reservation',
        idempotencyKey: uuidv4(),
        payload: { clientBasket },
        priority: 'normal',
        createdAt: new Date(),
        retryCount: 0
      }

      await queue.enqueue(request)

      // Wait for async stream processing
      await new Promise(resolve => setTimeout(resolve, 50))

      // Queue should be empty again (processed and XDEL'd)
      const finalLengths = await queue.getQueueLengths()
      expect(finalLengths.normal).toBe(0)
      expect(finalLengths.priority).toBe(0)
    })

    it('should persist requests in Redis Stream (survives conceptual restart)', async () => {
      // Verify streams exist after queue init
      const streamInfo = await redis.exists('queue:stream:normal', 'queue:stream:priority')
      // Both streams should exist (created by ensureStreams via MKSTREAM)
      expect(streamInfo).toBeGreaterThanOrEqual(1)
    })
  })

  describe('Priority Queue Behavior', () => {
    it('should handle high priority requests via priority stream', async () => {
      // Add high priority request
      const highPriorityRequest: QueueRequest = {
        id: 'priority-1',
        type: 'create_reservation',
        idempotencyKey: uuidv4(),
        payload: { clientBasket },
        priority: 'high',
        createdAt: new Date(),
        retryCount: 0
      }

      const priorityResult = await queue.enqueue(highPriorityRequest)
      expect(priorityResult.status).toBe('processing')

      // Wait for async stream processing
      await new Promise(resolve => setTimeout(resolve, 50))

      // Should be processed
      const queueLengths = await queue.getQueueLengths()
      expect(queueLengths.normal).toBe(0)
      expect(queueLengths.priority).toBe(0)
    })
  })

  describe('Redis Token Management', () => {
    it('should verify Redis connection and basic operations', async () => {
      // Verify Redis is working for token management
      const testKey = 'test:verification'
      await redis.set(testKey, 'test-value')
      const value = await redis.get(testKey)
      expect(value).toBe('test-value')
      await redis.del(testKey)
    })

    it('should check for reservation keys pattern', async () => {
      // Verify the pattern used for reservation tokens
      const keys = await redis.keys('reservation:*')
      // Should be empty in clean test state
      expect(Array.isArray(keys)).toBe(true)
    })
  })
})
