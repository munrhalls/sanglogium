// Guest Checkout Inventory Reservation - BullMQ FIFO Queue
// Compatible with Redis 3.0+ (unlike Redis Streams which require 5.0+)

import { Queue, Worker, JobsOptions, Job } from 'bullmq'
import type Redis from 'ioredis'
import type {
  QueueRequest,
  QueueResponse,
  TokenState,
} from './types'
import { getLogger, getMetrics } from './logging'
import { LogCategory } from './types'
import { TokenManager, EnhancedIdempotencyManager, CircuitBreakerManager } from './redis-managers'

// ============================================================================
// BullMQ Queue Names & Configuration
// ============================================================================

const PRIORITY_QUEUE_NAME = 'queue:priority'
const NORMAL_QUEUE_NAME = 'queue:reservations'
const CB_SERVICE = 'queue'

// ============================================================================
// FIFOQueue Class - BullMQ backed
// ============================================================================

export class FIFOQueue {
  private normalQueue: Queue
  private priorityQueue: Queue
  private worker: Worker
  private processing = false
  private tokenManager: TokenManager
  private idempotencyManager: EnhancedIdempotencyManager
  private cbManager: CircuitBreakerManager

  private logger = getLogger()
  private metrics = getMetrics()

  constructor(
    private redis: Redis,
    private onCreateReservation?: (request: QueueRequest) => Promise<void>,
    private onRollbackReservation?: (request: QueueRequest) => Promise<void>,
    private onRealizeReservation?: (request: QueueRequest) => Promise<void>,
  ) {
    // Initialize BullMQ queues with Redis connection
    this.normalQueue = new Queue(NORMAL_QUEUE_NAME, {
      connection: redis,
      defaultJobOptions: {
        removeOnComplete: 100, // Keep last 100 completed jobs
        removeOnFail: 50,       // Keep last 50 failed jobs
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    })

    this.priorityQueue = new Queue(PRIORITY_QUEUE_NAME, {
      connection: redis,
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    })

    // Initialize worker to process both queues
    this.worker = new Worker(
      [NORMAL_QUEUE_NAME, PRIORITY_QUEUE_NAME],
      this.processJob.bind(this),
      {
        connection: redis,
        concurrency: 1, // Process one job at a time for FIFO
      }
    )

    this.tokenManager = new TokenManager(redis)
    this.idempotencyManager = new IdempotencyManager(redis)
    this.cbManager = new CircuitBreakerManager(redis)

    // Handle worker errors
    this.worker.on('failed', this.handleJobFailure.bind(this))
    this.worker.on('completed', this.handleJobCompletion.bind(this))
  }

  // ============================================================================
  // Enqueue - Add job to appropriate BullMQ queue
  // ============================================================================

  async enqueue(request: QueueRequest): Promise<QueueResponse> {
    this.metrics.increment('queue.requests.total')

    // Check circuit breaker (Redis-persisted)
    const cbState = await this.cbManager.getCircuitBreakerState(CB_SERVICE)
    if (cbState?.state === 'OPEN') {
      if (cbState.nextAttemptTime && new Date(cbState.nextAttemptTime) > new Date()) {
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
      // Cooldown expired -> HALF_OPEN, allow one probe request through
      await this.cbManager.setCircuitBreakerState(CB_SERVICE, {
        ...cbState,
        state: 'HALF_OPEN',
      })
    }

    // Check idempotency (Redis-persisted)
    const existing = await this.idempotencyManager.getResponse(request.idempotencyKey)
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

    // Store idempotency key with empty response (will be updated on completion)
    await this.idempotencyManager.setResponse(request.idempotencyKey, {
      requestFingerprint: this.generateFingerprint(request),
      response: null,
      timestamp: new Date().toISOString()
    })

    // Add job to appropriate queue
    const queue = request.priority === 'high' ? this.priorityQueue : this.normalQueue
    const jobOptions: JobsOptions = {
      priority: request.priority === 'high' ? 10 : 0,
      delay: 0,
      removeOnComplete: 100,
      removeOnFail: 50,
      attempts: this.getMaxRetries(request.type),
      backoff: {
        type: 'exponential',
        delay: this.calculateRetryDelay(1),
      },
    }

    const job = await queue.add('reservation', request, jobOptions)

    if (request.priority === 'high') {
      this.metrics.increment('queue.priority.enqueued')
    } else {
      this.metrics.increment('queue.normal.enqueued')
    }

    this.logger.info('Job enqueued successfully', {
      component: 'FIFOQueue',
      category: LogCategory.QUEUE,
      metadata: {
        jobId: job.id,
        requestId: request.id,
        queue: queue.name,
        priority: request.priority
      }
    })

    return {
      requestId: request.id,
      status: 'processing'
    }
  }

  // ============================================================================
  // Process BullMQ Job
  // ============================================================================

  private async processJob(job: Job<QueueRequest>): Promise<void> {
    const request: QueueRequest = job.data
    const startTime = Date.now()

    this.logger.info('Processing job', {
      component: 'FIFOQueue',
      category: LogCategory.QUEUE,
      metadata: {
        jobId: job.id,
        requestId: request.id,
        type: request.type,
        queueName: job.queue.name
      }
    })

    try {
      await this.processRequest(request)

      // Update idempotency with success response
      await this.idempotencyManager.setResponse(request.idempotencyKey, {
        requestFingerprint: this.generateFingerprint(request),
        response: { requestId: request.id, status: 'success' },
        timestamp: new Date().toISOString()
      })

      // Reset circuit breaker on success
      await this.cbManager.resetFailureCount(CB_SERVICE)
      await this.cbManager.setCircuitBreakerState(CB_SERVICE, {
        state: 'CLOSED',
        failureCount: 0,
        lastFailureTime: null,
        nextAttemptTime: null,
      })

      this.metrics.increment('queue.requests.success')
      this.metrics.histogram('queue.processing.duration', Date.now() - startTime)

      this.logger.info('Job processed successfully', {
        component: 'FIFOQueue',
        category: LogCategory.QUEUE,
        metadata: {
          jobId: job.id,
          requestId: request.id,
          duration: Date.now() - startTime
        }
      })

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error))

      // Update idempotency with error response
      await this.idempotencyManager.setResponse(request.idempotencyKey, {
        requestFingerprint: this.generateFingerprint(request),
        response: {
          requestId: request.id,
          status: 'error',
          error: err.message
        },
        timestamp: new Date().toISOString()
      })

      this.logger.error(`Job processing failed: ${err.message}`, {
        component: 'FIFOQueue',
        category: LogCategory.QUEUE,
        error: { name: err.name, message: err.message, stack: err.stack },
        metadata: {
          jobId: job.id,
          requestId: request.id,
          type: request.type,
          retryCount: request.retryCount
        }
      })

      // Handle circuit breaker
      await this.cbManager.incrementFailureCount(CB_SERVICE)
      const failureCount = await this.cbManager.getFailureCount(CB_SERVICE)

      if (failureCount >= 5) {
        await this.cbManager.setCircuitBreakerState(CB_SERVICE, {
          state: 'OPEN',
          failureCount,
          lastFailureTime: new Date().toISOString(),
          nextAttemptTime: new Date(Date.now() + 30000).toISOString(), // 30s cooldown
        })
        this.logger.error('Circuit breaker opened', {
          component: 'FIFOQueue',
          category: LogCategory.QUEUE,
          metadata: { failureCount }
        })
      }

      throw error // Let BullMQ handle retry logic
    }
  }

  // ============================================================================
  // Process Individual Request (same as before)
  // ============================================================================

  private async processRequest(request: QueueRequest): Promise<void> {
    switch (request.type) {
      case 'create_reservation':
        if (!this.onCreateReservation) {
          throw new Error('No handler for create_reservation')
        }
        await this.onCreateReservation(request)
        break

      case 'rollback_reservation':
        if (!this.onRollbackReservation) {
          throw new Error('No handler for rollback_reservation')
        }
        await this.onRollbackReservation(request)
        break

      case 'realize_reservation':
        if (!this.onRealizeReservation) {
          throw new Error('No handler for realize_reservation')
        }
        await this.onRealizeReservation(request)
        break

      default:
        const _exhaustive: never = request
        throw new Error(`Unknown request type: ${_exhaustive.type}`)
    }
  }

  // ============================================================================
  // Event Handlers
  // ============================================================================

  private handleJobFailure(job: Job<QueueRequest>, error: Error): void {
    this.logger.error('Job failed', {
      component: 'FIFOQueue',
      category: LogCategory.QUEUE,
      metadata: {
        jobId: job.id,
        requestId: job.data?.id,
        failedReason: error.message
      }
    })
  }

  private handleJobCompletion(job: Job<QueueRequest>): void {
    this.logger.info('Job completed', {
      component: 'FIFOQueue',
      category: LogCategory.QUEUE,
      metadata: {
        jobId: job.id,
        requestId: job.data?.id
      }
    })
  }

  // ============================================================================
  // Utility Methods (same as before)
  // ============================================================================

  private generateFingerprint(request: QueueRequest): string {
    // Create a fingerprint of the request parameters for idempotency
    const fingerprint = {
      type: request.type,
      payload: request.payload,
      priority: request.priority,
    }
    return JSON.stringify(fingerprint)
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

    // Add jitter before applying max delay cap
    const jitterAmount = delay * jitter
    delay = delay + (Math.random() * 2 - 1) * jitterAmount

    // Apply max delay cap after jitter (ensures 30s includes jitter)
    delay = Math.min(delay, maxDelay)

    return Math.floor(delay)
  }

  // ============================================================================
  // Observability (async - queries BullMQ)
  // ============================================================================

  async getTokenState(token: string): Promise<TokenState | undefined> {
    const tokenData = await this.tokenManager.getToken(token)
    return tokenData?.state
  }

  async getCircuitBreakerState(): Promise<{ open: boolean; failures: number }> {
    const state = await this.cbManager.getCircuitBreakerState(CB_SERVICE)
    return {
      open: state?.state === 'OPEN',
      failures: state?.failureCount ?? 0,
    }
  }

  async getQueueLengths(): Promise<{ normal: number; priority: number }> {
    const [normal, priority] = await Promise.all([
      this.normalQueue.getWaiting(),
      this.priorityQueue.getWaiting(),
    ])
    return {
      normal: normal.length,
      priority: priority.length
    }
  }

  // ============================================================================
  // Cleanup
  // ============================================================================

  async close(): Promise<void> {
    await this.worker.close()
    await this.normalQueue.close()
    await this.priorityQueue.close()
  }
}
