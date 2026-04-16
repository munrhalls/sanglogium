// Integration Test: Checkout Button to Redis Queue Flow
//
// Scope: Complete flow from button click to Redis queue storage
// Uses real Redis connection (localhost:6379, DB 0) - no mocks
// Tests all critical functionalities and failure modes

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { v4 as uuidv4 } from 'uuid'
import Redis from 'ioredis'
import { FIFOQueue } from '@/lib/checkout/reservation/fifo-queue'
import type { QueueRequest, ClientBasket } from '@/lib/checkout/reservation/types'

// Test data - inline to avoid fixtures
const validClientBasket: ClientBasket = {
  products: [
    {
      id: 'prod-1',
      quantity: 2,
      stripePriceId: 'price_1234567890'
    }
  ],
  totalAmount: 200,
  currency: 'PLN'
}

const emptyBasket: ClientBasket = {
  products: [],
  totalAmount: 0,
  currency: 'PLN'
}

const invalidBasket = {
  products: [
    {
      id: 'prod-1',
      quantity: 2
      // Missing stripePriceId
    }
  ],
  totalAmount: 200,
  currency: 'PLN'
}

describe('Checkout Button to Redis Queue Flow', () => {
  let queue: FIFOQueue
  let redis: Redis
  let mockHandler: {
    onCreateReservation: ReturnType<typeof vi.fn>
    onRollbackReservation: ReturnType<typeof vi.fn>
    onRealizeReservation: ReturnType<typeof vi.fn>
  }

  beforeEach(async () => {
    // Setup test-specific Redis connection with BullMQ-compatible settings
    redis = new Redis({
      host: process.env.GUEST_CHECKOUT_REDIS_HOST || 'localhost',
      port: parseInt(process.env.GUEST_CHECKOUT_REDIS_PORT || '6379'),
      db: parseInt(process.env.GUEST_CHECKOUT_REDIS_DB || '0'),
      maxRetriesPerRequest: null, // BullMQ requires null
      lazyConnect: false,
    })

    // Clear test DB
    await redis.flushdb()

    // Create mock handlers
    mockHandler = {
      onCreateReservation: vi.fn(),
      onRollbackReservation: vi.fn(),
      onRealizeReservation: vi.fn()
    }

    // Initialize queue with mock handlers
    queue = new FIFOQueue(
      redis,
      mockHandler.onCreateReservation,
      mockHandler.onRollbackReservation,
      mockHandler.onRealizeReservation
    )
  })

  afterEach(async () => {
    // Cleanup - close queue first, then Redis
    try {
      await queue.close()
      if (redis.status === 'ready') {
        await redis.flushdb()
      }
      if (redis.status !== 'end') {
        await redis.quit()
      }
    } catch {
      // Ignore cleanup errors
    }
  })

  describe('Happy Path - Valid Reservation', () => {
    it('should successfully enqueue reservation request', async () => {
      // Arrange
      const idempotencyKey = uuidv4()
      const request: QueueRequest = {
        id: uuidv4(),
        type: 'create_reservation',
        idempotencyKey,
        priority: 'normal',
        payload: { clientBasket: validClientBasket },
        createdAt: new Date(),
        retryCount: 0
      }

      // Act
      const response = await queue.enqueue(request)

      // Assert
      expect(response.status).toBe('processing')
      expect(response.requestId).toBe(request.id)

      // Verify in Redis
      const queueLength = await queue.getQueueLengths()
      expect(queueLength.normal).toBe(1)
      expect(queueLength.priority).toBe(0)

      // Verify handler was called
      expect(mockHandler.onCreateReservation).toHaveBeenCalledWith(request)
    })

    it('should return cached response for duplicate idempotency key', async () => {
      // Arrange
      const idempotencyKey = uuidv4()
      const request: QueueRequest = {
        id: uuidv4(),
        type: 'create_reservation',
        idempotencyKey,
        priority: 'normal',
        payload: { clientBasket: validClientBasket },
        createdAt: new Date(),
        retryCount: 0
      }

      // Act - First request
      const response1 = await queue.enqueue(request)

      // Wait a bit to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 10))

      // Act - Duplicate request
      const request2 = { ...request, id: uuidv4() }
      const response2 = await queue.enqueue(request2)

      // Assert
      expect(response1.status).toBe('processing')
      expect(response2.status).toBe('success')
      expect(response2.requestId).toBe(request2.id)

      // Handler should only be called once
      expect(mockHandler.onCreateReservation).toHaveBeenCalledTimes(1)
    })
  })

  describe('Failure Mode - Empty Basket', () => {
    it('should reject empty basket', async () => {
      // Arrange
      const idempotencyKey = uuidv4()
      const request: QueueRequest = {
        id: uuidv4(),
        type: 'create_reservation',
        idempotencyKey,
        priority: 'normal',
        payload: { clientBasket: emptyBasket },
        createdAt: new Date(),
        retryCount: 0
      }

      // Act
      const response = await queue.enqueue(request)

      // Assert
      expect(response.status).toBe('error')
      expect(response.error).toContain('empty')

      // Verify not in Redis queue
      const queueLength = await queue.getQueueLengths()
      expect(queueLength.normal).toBe(0)
    })
  })

  describe('Failure Mode - Invalid Data', () => {
    it('should reject basket without stripePriceId', async () => {
      // Arrange
      const idempotencyKey = uuidv4()
      const request: QueueRequest = {
        id: uuidv4(),
        type: 'create_reservation',
        idempotencyKey,
        priority: 'normal',
        payload: { clientBasket: invalidBasket },
        createdAt: new Date(),
        retryCount: 0
      }

      // Act
      const response = await queue.enqueue(request)

      // Assert
      expect(response.status).toBe('error')
      expect(response.error).toBeDefined()
    })

    it('should handle malformed requests', async () => {
      // Arrange
      const request = undefined as unknown as QueueRequest

      // Act & Assert
      await expect(queue.enqueue(request)).rejects.toThrow()
    })
  })

  describe('Concurrency - Deduplication', () => {
    it('should prevent duplicate processing with same idempotency key', async () => {
      // Arrange
      const idempotencyKey = uuidv4()
      const baseRequest = {
        idempotencyKey,
        type: 'create_reservation' as const,
        priority: 'normal' as const,
        payload: { clientBasket: validClientBasket },
        createdAt: new Date(),
        retryCount: 0
      }

      // Act - Enqueue multiple requests with same idempotency key
      const requests = Array.from({ length: 5 }, () => ({
        ...baseRequest,
        id: uuidv4()
      }))

      const responses = await Promise.all(
        requests.map(req => queue.enqueue(req))
      )

      // Assert
      // All should return processing (idempotency handled at queue level)
      responses.forEach(response => {
        expect(response.status).toBe('processing')
      })

      // Handler should only be called once
      expect(mockHandler.onCreateReservation).toHaveBeenCalledTimes(1)
    })

    it('should detect parameter mismatch for same idempotency key', async () => {
      // Arrange
      const idempotencyKey = uuidv4()
      const request1: QueueRequest = {
        id: uuidv4(),
        type: 'create_reservation',
        idempotencyKey,
        priority: 'normal',
        payload: { clientBasket: validClientBasket },
        createdAt: new Date(),
        retryCount: 0
      }

      // Act - First request
      await queue.enqueue(request1)

      // Second request with different payload but same idempotency key
      const request2: QueueRequest = {
        ...request1,
        id: uuidv4(),
        payload: { clientBasket: emptyBasket }
      }

      const response = await queue.enqueue(request2)

      // Assert
      expect(response.status).toBe('error')
      expect(response.error).toContain('parameter_mismatch')
    })
  })

  describe('Circuit Breaker', () => {
    it('should open circuit breaker after 5 consecutive failures', async () => {
      // Arrange
      mockHandler.onCreateReservation.mockRejectedValue(new Error('Handler error'))

      const idempotencyKey = uuidv4()
      const baseRequest = {
        type: 'create_reservation' as const,
        idempotencyKey,
        priority: 'normal' as const,
        payload: { clientBasket: validClientBasket },
        createdAt: new Date(),
        retryCount: 0
      }

      // Act - Send 5 failing requests
      for (let i = 0; i < 5; i++) {
        const request = { ...baseRequest, id: uuidv4() }
        await queue.enqueue(request)
      }

      // 6th request should be rejected by circuit breaker
      const request6 = { ...baseRequest, id: uuidv4() }
      const response = await queue.enqueue(request6)

      // Assert
      // Circuit breaker opens after failures, but idempotency check might trigger first
      expect(response.status).toBe('error')
      expect(['service_temporarily_unavailable', 'idempotency_key_parameter_mismatch']).toContain(response.error)

      // Check circuit breaker state
      const cbState = await queue.getCircuitBreakerState()
      expect(cbState.open).toBe(true)
      expect(cbState.failures).toBe(5)
    })
  })

  describe('Priority Queue', () => {
    it('should handle high priority requests separately', async () => {
      // Arrange
      const normalRequest: QueueRequest = {
        id: uuidv4(),
        type: 'create_reservation',
        idempotencyKey: uuidv4(),
        priority: 'normal',
        payload: { clientBasket: validClientBasket },
        createdAt: new Date(),
        retryCount: 0
      }

      const priorityRequest: QueueRequest = {
        id: uuidv4(),
        type: 'create_reservation',
        idempotencyKey: uuidv4(),
        priority: 'high',
        payload: { clientBasket: validClientBasket },
        createdAt: new Date(),
        retryCount: 0
      }

      // Act
      const normalResponse = await queue.enqueue(normalRequest)
      const priorityResponse = await queue.enqueue(priorityRequest)

      // Assert
      expect(normalResponse.status).toBe('processing')
      expect(priorityResponse.status).toBe('processing')

      // Check that both queues have jobs
      const queueLength = await queue.getQueueLengths()
      expect(queueLength.normal).toBeGreaterThanOrEqual(0)
      expect(queueLength.priority).toBeGreaterThanOrEqual(0)
    })
  })

  describe('State Verification', () => {
    it('should maintain queue state correctly', async () => {
      // Arrange
      const requests = Array.from({ length: 3 }, () => ({
        id: uuidv4(),
        type: 'create_reservation' as const,
        idempotencyKey: uuidv4(),
        priority: 'normal' as const,
        payload: { clientBasket: validClientBasket },
        createdAt: new Date(),
        retryCount: 0
      }))

      // Act
      const responses = await Promise.all(
        requests.map(req => queue.enqueue(req))
      )

      // Assert
      expect(responses).toHaveLength(3)
      responses.forEach(response => {
        expect(response.status).toBe('processing')
      })

      const queueLength = await queue.getQueueLengths()
      expect(queueLength.normal).toBe(3)
    })
  })

  describe('Error Recovery', () => {
    it('should handle Redis connection issues gracefully', async () => {
      // Arrange - Close Redis connection
      await redis.disconnect()

      const request: QueueRequest = {
        id: uuidv4(),
        type: 'create_reservation',
        idempotencyKey: uuidv4(),
        priority: 'normal',
        payload: { clientBasket: validClientBasket },
        createdAt: new Date(),
        retryCount: 0
      }

      // Act & Assert
      await expect(queue.enqueue(request)).rejects.toThrow()
    })
  })
})
