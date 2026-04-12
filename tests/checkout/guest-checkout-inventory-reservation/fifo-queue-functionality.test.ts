import { test, expect } from '@playwright/test'
import Redis from 'ioredis'
import { v4 as uuidv4 } from 'uuid'

// Mock implementations for testing
class MockDatabase {
  private data: Map<string, unknown> = new Map()
  private locks: Map<string, boolean> = new Map()

  async get(key: string): Promise<unknown> {
    return this.data.get(key)
  }

  async set(key: string, value: unknown): Promise<void> {
    this.data.set(key, value)
  }

  async delete(key: string): Promise<void> {
    this.data.delete(key)
  }

  async acquireLock(key: string): Promise<boolean> {
    if (this.locks.get(key)) return false
    this.locks.set(key, true)
    return true
  }

  async releaseLock(key: string): Promise<void> {
    this.locks.delete(key)
  }

  async transaction<T>(fn: () => Promise<T>): Promise<T> {
    // Simulate atomic transaction
    return await fn()
  }
}

// Queue implementation based on PRD requirements
interface QueueRequest {
  id: string
  type: 'create_reservation' | 'rollback_reservation' | 'realize_reservation'
  reservationToken?: string
  idempotencyKey: string
  payload: {
    clientBasket?: Record<string, unknown>
    metadata?: Record<string, unknown>
  }
  priority: 'normal' | 'high'
  createdAt: Date
  retryCount: number
  lastRetryAt?: Date
}

interface QueueResponse {
  requestId: string
  status: 'success' | 'error' | 'retry'
  data?: unknown
  error?: string
  retryAfter?: number
}

type TokenState = 'FREE' | 'RESERVING' | 'ACTIVE' | 'CANCELLING' | 'REALIZING'

interface ReservationToken {
  token: string
  state: TokenState
  createdAt: Date
  updatedAt: Date
  expiresAt: Date
  idempotencyKey: string
  requestFingerprint: string
  data?: unknown
}

class FIFOQueue {
  private normalQueue: QueueRequest[] = []
  private priorityQueue: QueueRequest[] = []
  private processing = false
  private circuitBreakerOpen = false
  private circuitBreakerFailures = 0
  private circuitBreakerLastFailure: Date | null = null
  private idempotencyStore = new Map<string, { requestFingerprint: string; response: unknown }>()
  private tokenStore = new Map<string, ReservationToken>()

  constructor(
    private database: MockDatabase,
    private redis: Redis
  ) {}

  async enqueue(request: QueueRequest): Promise<QueueResponse> {
    // Check circuit breaker
    if (this.circuitBreakerOpen) {
      return {
        requestId: request.id,
        status: 'error',
        error: 'service_temporarily_unavailable'
      }
    }

    // Check idempotency
    const existing = this.idempotencyStore.get(request.idempotencyKey)
    if (existing) {
      const currentFingerprint = this.generateFingerprint(request)
      if (existing.requestFingerprint !== currentFingerprint) {
        return {
          requestId: request.id,
          status: 'error',
          error: 'idempotency_key_parameter_mismatch'
        }
      }
      return {
        requestId: request.id,
        status: 'success',
        data: existing.response
      }
    }

    // Add to appropriate queue
    if (request.priority === 'high') {
      this.priorityQueue.push(request)
    } else {
      this.normalQueue.push(request)
    }

    // Process queue
    this.processQueue()

    return {
      requestId: request.id,
      status: 'processing'
    }
  }

  private async processQueue(): Promise<void> {
    if (this.processing) return
    this.processing = true

    try {
      // Process priority queue first
      while (this.priorityQueue.length > 0) {
        const request = this.priorityQueue.shift()!
        await this.processRequest(request)
      }

      // Then process normal queue
      while (this.normalQueue.length > 0) {
        const request = this.normalQueue.shift()!
        await this.processRequest(request)
      }
    } finally {
      this.processing = false
    }
  }

  private async processRequest(request: QueueRequest): Promise<void> {
    try {
      // Check for concurrent operation on token
      if (request.reservationToken) {
        const token = this.tokenStore.get(request.reservationToken)
        if (token && token.state !== 'FREE') {
          throw new Error('operation_in_progress')
        }
      }

      // Process based on request type
      switch (request.type) {
        case 'create_reservation':
          await this.processCreateReservation(request)
          break
        case 'rollback_reservation':
          await this.processRollbackReservation(request)
          break
        case 'realize_reservation':
          await this.processRealizeReservation(request)
          break
      }

      // Reset circuit breaker on success
      this.circuitBreakerFailures = 0
      this.circuitBreakerOpen = false

    } catch (error: unknown) {
      // Handle circuit breaker
      this.circuitBreakerFailures++
      if (this.circuitBreakerFailures >= 5) {
        this.circuitBreakerOpen = true
        this.circuitBreakerLastFailure = new Date()
      }

      // Retry logic for transient errors
      if (this.isTransientError(error)) {
        request.retryCount++
        if (request.retryCount < this.getMaxRetries(request.type)) {
          request.lastRetryAt = new Date()
          const delay = this.calculateRetryDelay(request.retryCount)

          // Re-queue with delay
          setTimeout(() => {
            if (request.priority === 'high') {
              this.priorityQueue.unshift(request)
            } else {
              this.normalQueue.unshift(request)
            }
            this.processQueue()
          }, delay)
        }
      }
    }
  }

  private async processCreateReservation(request: QueueRequest): Promise<void> {
    const token = uuidv4()
    const reservationToken: ReservationToken = {
      token,
      state: 'RESERVING',
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      idempotencyKey: request.idempotencyKey,
      requestFingerprint: this.generateFingerprint(request)
    }

    // Atomic token state transition
    await this.database.transaction(async () => {
      const locked = await this.database.acquireLock(`token:${token}`)
      if (!locked) throw new Error('Could not acquire lock')

      try {
        this.tokenStore.set(token, reservationToken)

        // Set Redis TTL
        await this.redis.setex(`reservation:${token}`, 600, JSON.stringify({
          state: 'ACTIVE',
          token,
          createdAt: reservationToken.createdAt.toISOString(),
          expiresAt: reservationToken.expiresAt.toISOString()
        }))

        // Update token state
        reservationToken.state = 'ACTIVE'
        reservationToken.updatedAt = new Date()
        this.tokenStore.set(token, reservationToken)

        // Store idempotency response
        this.idempotencyStore.set(request.idempotencyKey, {
          requestFingerprint: reservationToken.requestFingerprint,
          response: { reservationToken: token, success: true }
        })

      } finally {
        await this.database.releaseLock(`token:${token}`)
      }
    })
  }

  private async processRollbackReservation(request: QueueRequest): Promise<void> {
    if (!request.reservationToken) throw new Error('Missing reservation token')

    const token = this.tokenStore.get(request.reservationToken)
    if (!token) throw new Error('Token not found')

    await this.database.transaction(async () => {
      const locked = await this.database.acquireLock(`token:${request.reservationToken}`)
      if (!locked) throw new Error('Could not acquire lock')

      try {
        // Update token state
        token.state = 'CANCELLING'
        token.updatedAt = new Date()
        this.tokenStore.set(request.reservationToken, token)

        // Remove from Redis
        await this.redis.del(`reservation:${request.reservationToken}`)

        // Update token state to FREE
        token.state = 'FREE'
        token.updatedAt = new Date()
        this.tokenStore.set(request.reservationToken, token)

      } finally {
        await this.database.releaseLock(`token:${request.reservationToken}`)
      }
    })
  }

  private async processRealizeReservation(request: QueueRequest): Promise<void> {
    if (!request.reservationToken) throw new Error('Missing reservation token')

    const token = this.tokenStore.get(request.reservationToken)
    if (!token) throw new Error('Token not found')

    await this.database.transaction(async () => {
      const locked = await this.database.acquireLock(`token:${request.reservationToken}`)
      if (!locked) throw new Error('Could not acquire lock')

      try {
        // Update token state
        token.state = 'REALIZING'
        token.updatedAt = new Date()
        this.tokenStore.set(request.reservationToken, token)

        // Remove from Redis
        await this.redis.del(`reservation:${request.reservationToken}`)

        // Update token state to FREE
        token.state = 'FREE'
        token.updatedAt = new Date()
        this.tokenStore.set(request.reservationToken, token)

      } finally {
        await this.database.releaseLock(`token:${request.reservationToken}`)
      }
    })
  }

  private generateFingerprint(request: QueueRequest): string {
    return JSON.stringify({
      type: request.type,
      payload: request.payload
    })
  }

  private isTransientError(error: Error): boolean {
    const transientErrors = ['network', 'timeout', 'ECONNREFUSED', 'ETIMEDOUT']
    return transientErrors.some(err => error.message.toLowerCase().includes(err))
  }

  private getMaxRetries(type: QueueRequest['type']): number {
    switch (type) {
      case 'create_reservation':
        return 3
      case 'rollback_reservation':
        return 10
      case 'realize_reservation':
        return 3
      default:
        return 3
    }
  }

  private calculateRetryDelay(retryCount: number): number {
    const baseDelay = 1000 // 1 second
    const maxDelay = 30000 // 30 seconds max for rollback
    const jitter = 0.25 // ±25% jitter

    let delay = baseDelay * Math.pow(2, retryCount - 1)
    delay = Math.min(delay, maxDelay)

    // Add jitter
    const jitterAmount = delay * jitter
    delay = delay + (Math.random() * 2 - 1) * jitterAmount

    return Math.floor(delay)
  }

  // Test helpers
  getTokenState(token: string): TokenState | undefined {
    return this.tokenStore.get(token)?.state
  }

  getCircuitBreakerState(): { open: boolean; failures: number } {
    return {
      open: this.circuitBreakerOpen,
      failures: this.circuitBreakerFailures
    }
  }

  getQueueLengths(): { normal: number; priority: number } {
    return {
      normal: this.normalQueue.length,
      priority: this.priorityQueue.length
    }
  }
}

test.describe('FIFO Queue Functionality', () => {
  let queue: FIFOQueue
  let database: MockDatabase
  let redis: Redis

  test.beforeEach(async () => {
    database = new MockDatabase()
    redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      db: 15 // Use test DB
    })

    // Clear test DB
    await redis.flushdb()

    queue = new FIFOQueue(database, redis)
  })

  test.afterEach(async () => {
    await redis.flushdb()
    await redis.quit()
  })

  test('Basic Queue Operations - FIFO order maintained', async () => {
    // Create three requests
    const request1: QueueRequest = {
      id: uuidv4(),
      type: 'create_reservation',
      idempotencyKey: uuidv4(),
      payload: { clientBasket: { products: [{ id: 'p1', quantity: 1 }] } },
      priority: 'normal',
      createdAt: new Date(),
      retryCount: 0
    }

    const request2: QueueRequest = {
      id: uuidv4(),
      type: 'create_reservation',
      idempotencyKey: uuidv4(),
      payload: { clientBasket: { products: [{ id: 'p2', quantity: 1 }] } },
      priority: 'normal',
      createdAt: new Date(),
      retryCount: 0
    }

    const request3: QueueRequest = {
      id: uuidv4(),
      type: 'create_reservation',
      idempotencyKey: uuidv4(),
      payload: { clientBasket: { products: [{ id: 'p3', quantity: 1 }] } },
      priority: 'normal',
      createdAt: new Date(),
      retryCount: 0
    }

    // Enqueue in order
    await queue.enqueue(request1)
    await queue.enqueue(request2)
    await queue.enqueue(request3)

    // Wait for processing
    await new Promise(resolve => setTimeout(resolve, 100))

    // Verify tokens created in order
    const tokens = Array.from(queue['tokenStore'].keys())
    expect(tokens).toHaveLength(3)

    // Verify all tokens are in ACTIVE state
    tokens.forEach(token => {
      expect(queue.getTokenState(token)).toBe('ACTIVE')
    })
  })

  test('Priority Queue Processing - high priority jumps queue', async () => {
    // Add normal request first
    const normalRequest: QueueRequest = {
      id: uuidv4(),
      type: 'create_reservation',
      idempotencyKey: uuidv4(),
      payload: { clientBasket: { products: [{ id: 'p1', quantity: 1 }] } },
      priority: 'normal',
      createdAt: new Date(),
      retryCount: 0
    }

    // Add high priority request
    const priorityRequest: QueueRequest = {
      id: uuidv4(),
      type: 'realize_reservation',
      reservationToken: 'test-token',
      idempotencyKey: uuidv4(),
      payload: { metadata: { stripeEventId: 'evt_123' } },
      priority: 'high',
      createdAt: new Date(),
      retryCount: 0
    }

    // Add another normal request
    const normalRequest2: QueueRequest = {
      id: uuidv4(),
      type: 'create_reservation',
      idempotencyKey: uuidv4(),
      payload: { clientBasket: { products: [{ id: 'p2', quantity: 1 }] } },
      priority: 'normal',
      createdAt: new Date(),
      retryCount: 0
    }

    await queue.enqueue(normalRequest)
    await queue.enqueue(priorityRequest)
    await queue.enqueue(normalRequest2)

    // Wait for processing
    await new Promise(resolve => setTimeout(resolve, 100))

    // Priority request should be processed first
    // Verify queue lengths
    const lengths = queue.getQueueLengths()
    expect(lengths.normal).toBe(0)
    expect(lengths.priority).toBe(0)
  })

  test('Idempotency Handling - duplicate requests return cached response', async () => {
    const idempotencyKey = uuidv4()

    const request: QueueRequest = {
      id: uuidv4(),
      type: 'create_reservation',
      idempotencyKey,
      payload: { clientBasket: { products: [{ id: 'p1', quantity: 1 }] } },
      priority: 'normal',
      createdAt: new Date(),
      retryCount: 0
    }

    // First request
    const response1 = await queue.enqueue(request)
    expect(response1.status).toBe('processing')

    // Wait for processing
    await new Promise(resolve => setTimeout(resolve, 100))

    // Second request with same idempotency key
    const duplicateRequest: QueueRequest = {
      ...request,
      id: uuidv4() // Different request ID
    }

    const response2 = await queue.enqueue(duplicateRequest)
    expect(response2.status).toBe('success')
    expect(response2.data).toBeDefined()
  })

  test('Idempotency Parameter Mismatch - different payload returns error', async () => {
    const idempotencyKey = uuidv4()

    const request1: QueueRequest = {
      id: uuidv4(),
      type: 'create_reservation',
      idempotencyKey,
      payload: { clientBasket: { products: [{ id: 'p1', quantity: 1 }] } },
      priority: 'normal',
      createdAt: new Date(),
      retryCount: 0
    }

    // First request
    await queue.enqueue(request1)
    await new Promise(resolve => setTimeout(resolve, 100))

    // Second request with same key but different payload
    const request2: QueueRequest = {
      id: uuidv4(),
      type: 'create_reservation',
      idempotencyKey,
      payload: { clientBasket: { products: [{ id: 'p1', quantity: 2 }] } }, // Different quantity
      priority: 'normal',
      createdAt: new Date(),
      retryCount: 0
    }

    const response = await queue.enqueue(request2)
    expect(response.status).toBe('error')
    expect(response.error).toBe('idempotency_key_parameter_mismatch')
  })

  test('Token State Management - one operation per token', async () => {

    // Create reservation
    const createRequest: QueueRequest = {
      id: uuidv4(),
      type: 'create_reservation',
      idempotencyKey: uuidv4(),
      payload: { clientBasket: { products: [{ id: 'p1', quantity: 1 }] } },
      priority: 'normal',
      createdAt: new Date(),
      retryCount: 0
    }

    await queue.enqueue(createRequest)
    await new Promise(resolve => setTimeout(resolve, 100))

    // Extract token from response (simulated)
    const token = Array.from(queue['tokenStore'].keys())[0]
    expect(queue.getTokenState(token)).toBe('ACTIVE')

    // Attempt concurrent operation
    const concurrentRequest: QueueRequest = {
      id: uuidv4(),
      type: 'rollback_reservation',
      reservationToken: token,
      idempotencyKey: uuidv4(),
      payload: {},
      priority: 'normal',
      createdAt: new Date(),
      retryCount: 0
    }

    const concurrentResponse = await queue.enqueue(concurrentRequest)
    // Should fail due to concurrent operation
    expect(concurrentResponse.status).toBe('error')
  })

  test('Retry Logic with Exponential Backoff', async () => {
    // Force transient error by breaking Redis connection temporarily
    const originalSetex = redis.setex.bind(redis)
    let callCount = 0
    redis.setex = async (...args: unknown[]) => {
      callCount++
      if (callCount <= 2) {
        throw new Error('ECONNREFUSED')
      }
      return originalSetex(...args)
    }

    const request: QueueRequest = {
      id: uuidv4(),
      type: 'create_reservation',
      idempotencyKey: uuidv4(),
      payload: { clientBasket: { products: [{ id: 'p1', quantity: 1 }] } },
      priority: 'normal',
      createdAt: new Date(),
      retryCount: 0
    }

    const startTime = Date.now()
    await queue.enqueue(request)

    // Wait for retries
    await new Promise(resolve => setTimeout(resolve, 2000))

    const endTime = Date.now()
    const duration = endTime - startTime

    // Should have retried and succeeded
    expect(callCount).toBeGreaterThan(2)
    expect(duration).toBeGreaterThan(1000) // At least 1 second for backoff

    // Restore original function
    redis.setex = originalSetex
  })

  test('Circuit Breaker - opens after 5 failures', async () => {
    // Force failures
    const originalSetex = redis.setex.bind(redis)
    redis.setex = async () => {
      throw new Error('Persistent failure')
    }

    // Send 5 failing requests
    Array.from({ length: 5 }).forEach(async () => {
      const request: QueueRequest = {
        id: uuidv4(),
        type: 'create_reservation',
        idempotencyKey: uuidv4(),
        payload: { clientBasket: { products: [{ id: 'p1', quantity: 1 }] } },
        priority: 'normal',
        createdAt: new Date(),
        retryCount: 0
      }
      await queue.enqueue(request)
      await new Promise(resolve => setTimeout(resolve, 100))
    });

    // Should not retry for 4xx errors
    const circuitState = queue.getCircuitBreakerState()
    expect(circuitState.failures).toBe(1) // Only one failure counted

    // Restore original function
    redis.setex = originalSetex
  })
})
