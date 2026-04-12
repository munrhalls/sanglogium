// Guest Checkout Inventory Reservation - FIFO Queue with Priority
// Matches fifo-queue-functionality.test.ts interfaces exactly
// Implements: FIFO order, priority queue, idempotency, circuit breaker, retry with exponential backoff

import { v4 as uuidv4 } from 'uuid'
import type Redis from 'ioredis'
import type {
  QueueRequest,
  QueueResponse,
  TokenState,
  ReservationToken,
} from './types'
import { getLogger, getMetrics } from './logging'
import { LogCategory } from './types'

// ============================================================================
// FIFOQueue Class
// ============================================================================

export class FIFOQueue {
  private normalQueue: QueueRequest[] = []
  private priorityQueue: QueueRequest[] = []
  private processing = false
  private circuitBreakerOpen = false
  private circuitBreakerFailures = 0
  private circuitBreakerLastFailure: Date | null = null
  private idempotencyStore = new Map<string, { requestFingerprint: string; response: unknown }>()
  private tokenStore = new Map<string, ReservationToken>()

  private logger = getLogger()
  private metrics = getMetrics()

  constructor(
    private redis: Redis,
    private onCreateReservation?: (request: QueueRequest) => Promise<void>,
    private onRollbackReservation?: (request: QueueRequest) => Promise<void>,
    private onRealizeReservation?: (request: QueueRequest) => Promise<void>,
  ) {}

  // ============================================================================
  // Enqueue
  // ============================================================================

  async enqueue(request: QueueRequest): Promise<QueueResponse> {
    this.metrics.increment('queue.requests.total')

    // Check circuit breaker
    if (this.circuitBreakerOpen) {
      this.logger.warn('Circuit breaker is OPEN, rejecting request', {
        component: 'FIFOQueue',
        category: LogCategory.QUEUE,
        metadata: { requestId: request.id, type: request.type }
      })
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
        this.logger.warn('Idempotency key parameter mismatch', {
          component: 'FIFOQueue',
          category: LogCategory.QUEUE,
          metadata: { idempotencyKey: request.idempotencyKey }
        })
        return {
          requestId: request.id,
          status: 'error',
          error: 'idempotency_key_parameter_mismatch'
        }
      }
      this.logger.info('Returning cached idempotent response', {
        component: 'FIFOQueue',
        category: LogCategory.QUEUE,
        metadata: { idempotencyKey: request.idempotencyKey }
      })
      return {
        requestId: request.id,
        status: 'success',
        data: existing.response
      }
    }

    // Add to appropriate queue
    if (request.priority === 'high') {
      this.priorityQueue.push(request)
      this.metrics.increment('queue.priority.enqueued')
    } else {
      this.normalQueue.push(request)
      this.metrics.increment('queue.normal.enqueued')
    }

    this.metrics.gauge('queue.length.normal', this.normalQueue.length)
    this.metrics.gauge('queue.length.priority', this.priorityQueue.length)

    // Process queue (non-blocking)
    this.processQueue()

    return {
      requestId: request.id,
      status: 'processing'
    }
  }

  // ============================================================================
  // Process Queue
  // ============================================================================

  private async processQueue(): Promise<void> {
    if (this.processing) return
    this.processing = true

    try {
      // Process priority queue first
      while (this.priorityQueue.length > 0) {
        const request = this.priorityQueue.shift()!
        await this.processRequest(request)
      }

      // Then process normal queue (FIFO order)
      while (this.normalQueue.length > 0) {
        const request = this.normalQueue.shift()!
        await this.processRequest(request)
      }
    } finally {
      this.processing = false
      this.metrics.gauge('queue.length.normal', this.normalQueue.length)
      this.metrics.gauge('queue.length.priority', this.priorityQueue.length)
    }
  }

  // ============================================================================
  // Process Single Request
  // ============================================================================

  private async processRequest(request: QueueRequest): Promise<void> {
    const startTime = Date.now()

    try {
      // Check for concurrent operation on token
      if (request.reservationToken) {
        const token = this.tokenStore.get(request.reservationToken)
        if (token && token.state !== 'FREE' && token.state !== 'ACTIVE') {
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

      this.metrics.increment('queue.requests.success')
      this.metrics.histogram('queue.processing.duration', Date.now() - startTime)

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error))

      this.logger.error(`Queue processing failed: ${err.message}`, {
        component: 'FIFOQueue',
        category: LogCategory.QUEUE,
        error: { name: err.name, message: err.message, stack: err.stack },
        metadata: { requestId: request.id, type: request.type, retryCount: request.retryCount }
      })

      // Handle circuit breaker
      this.circuitBreakerFailures++
      if (this.circuitBreakerFailures >= 5) {
        this.circuitBreakerOpen = true
        this.circuitBreakerLastFailure = new Date()
        this.logger.error('Circuit breaker OPENED after 5 failures', {
          component: 'FIFOQueue',
          category: LogCategory.QUEUE
        })
      }

      this.metrics.increment('queue.requests.failed')

      // Retry logic for transient errors
      if (this.isTransientError(err)) {
        request.retryCount++
        if (request.retryCount < this.getMaxRetries(request.type)) {
          request.lastRetryAt = new Date()
          const delay = this.calculateRetryDelay(request.retryCount)

          this.logger.info(`Scheduling retry ${request.retryCount} in ${delay}ms`, {
            component: 'FIFOQueue',
            category: LogCategory.QUEUE,
            metadata: { requestId: request.id, delay }
          })

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

  // ============================================================================
  // Request Handlers
  // ============================================================================

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
    this.tokenStore.set(token, reservationToken)

    // Set Redis TTL key
    await this.redis.setex(`reservation:${token}`, 600, JSON.stringify({
      state: 'ACTIVE',
      token,
      createdAt: reservationToken.createdAt.toISOString(),
      expiresAt: reservationToken.expiresAt.toISOString()
    }))

    // Update token state to ACTIVE
    reservationToken.state = 'ACTIVE'
    reservationToken.updatedAt = new Date()
    this.tokenStore.set(token, reservationToken)

    // Store idempotency response
    this.idempotencyStore.set(request.idempotencyKey, {
      requestFingerprint: reservationToken.requestFingerprint,
      response: { reservationToken: token, success: true }
    })

    // Execute external handler (Sanity stock decrement, etc.)
    if (this.onCreateReservation) {
      await this.onCreateReservation(request)
    }

    this.logger.info(`Reservation created: ${token}`, {
      component: 'FIFOQueue',
      category: LogCategory.RESERVATION,
      reservationToken: token,
      metadata: { idempotencyKey: request.idempotencyKey }
    })
  }

  private async processRollbackReservation(request: QueueRequest): Promise<void> {
    if (!request.reservationToken) throw new Error('Missing reservation token')

    const token = this.tokenStore.get(request.reservationToken)
    if (!token) throw new Error('Token not found')

    // Update token state to CANCELLING
    token.state = 'CANCELLING'
    token.updatedAt = new Date()
    this.tokenStore.set(request.reservationToken, token)

    // Remove from Redis
    await this.redis.del(`reservation:${request.reservationToken}`)

    // Update token state to FREE
    token.state = 'FREE'
    token.updatedAt = new Date()
    this.tokenStore.set(request.reservationToken, token)

    // Execute external handler (Sanity stock restore, etc.)
    if (this.onRollbackReservation) {
      await this.onRollbackReservation(request)
    }

    this.logger.info(`Reservation rolled back: ${request.reservationToken}`, {
      component: 'FIFOQueue',
      category: LogCategory.RESERVATION,
      reservationToken: request.reservationToken
    })
  }

  private async processRealizeReservation(request: QueueRequest): Promise<void> {
    if (!request.reservationToken) throw new Error('Missing reservation token')

    const token = this.tokenStore.get(request.reservationToken)
    if (!token) throw new Error('Token not found')

    // Update token state to REALIZING
    token.state = 'REALIZING'
    token.updatedAt = new Date()
    this.tokenStore.set(request.reservationToken, token)

    // Remove from Redis
    await this.redis.del(`reservation:${request.reservationToken}`)

    // Update token state to FREE
    token.state = 'FREE'
    token.updatedAt = new Date()
    this.tokenStore.set(request.reservationToken, token)

    // Execute external handler (finalize order, etc.)
    if (this.onRealizeReservation) {
      await this.onRealizeReservation(request)
    }

    this.logger.info(`Reservation realized: ${request.reservationToken}`, {
      component: 'FIFOQueue',
      category: LogCategory.RESERVATION,
      reservationToken: request.reservationToken
    })
  }

  // ============================================================================
  // Fingerprint Generation
  // ============================================================================

  private generateFingerprint(request: QueueRequest): string {
    return JSON.stringify({
      type: request.type,
      payload: request.payload
    })
  }

  // ============================================================================
  // Retry Logic
  // ============================================================================

  private isTransientError(error: Error): boolean {
    const transientErrors = ['network', 'timeout', 'ECONNREFUSED', 'ETIMEDOUT']
    return transientErrors.some(err => error.message.toLowerCase().includes(err.toLowerCase()))
  }

  private getMaxRetries(type: QueueRequest['type']): number {
    switch (type) {
      case 'create_reservation':
        return 3
      case 'rollback_reservation':
        return 10 // Higher retry count for rollbacks per PRD
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

  // ============================================================================
  // Test Helpers / Observability
  // ============================================================================

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
