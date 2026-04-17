# FIFO Queue Functionality Specification

## Queue Architecture Overview

```typescript
// Queue Request Types
type QueueRequestType = 'create_reservation' | 'rollback_reservation' | 'realize_reservation'

interface QueueRequest {
  id: string // UUID
  type: QueueRequestType
  reservationToken?: string // For rollback/realize
  idempotencyKey: string
  payload: {
    clientBasket?: ClientBasket // For create
    metadata?: Record<string, any> // For payment realize
  }
  priority: 'normal' | 'high'
  createdAt: Date
  retryCount: number
  lastRetryAt?: Date
}

interface QueueResponse {
  requestId: string
  status: 'success' | 'error' | 'retry'
  data?: any
  error?: string
  retryAfter?: number // milliseconds
}

// Token State Management
type TokenState = 'FREE' | 'RESERVING' | 'ACTIVE' | 'CANCELLING' | 'REALIZING'

interface ReservationToken {
  token: string
  state: TokenState
  createdAt: Date
  updatedAt: Date
  expiresAt: Date
  idempotencyKey: string
  requestFingerprint: string // Hash of request parameters
  data?: ReservedBasket
}
```

## FIFO Queue Implementation

```typescript
class FIFOQueue {
  private normalQueue: QueueRequest[] = []
  private priorityQueue: QueueRequest[] = []
  private processing = false
  private circuitBreaker: CircuitBreaker

  constructor(
    private database: Database,
    private redis: RedisClient,
    private idempotencyStore: IdempotencyStore
  ) {
    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: 5,
      recoveryTimeout: 30000,
      monitoring: new QueueMonitoring()
    })
  }

  async enqueue(request: QueueRequest): Promise<QueueResponse> {
    // 1. Check circuit breaker
    if (this.circuitBreaker.isOpen()) {
      return {
        requestId: request.id,
        status: 'error',
        error: 'service_temporarily_unavailable'
      }
    }

    // 2. Validate idempotency
    const existing = await this.idempotencyStore.get(request.idempotencyKey)
    if (existing) {
      // Parameter fingerprint validation
      const currentFingerprint = this.generateFingerprint(request)
      if (existing.requestFingerprint !== currentFingerprint) {
        return {
          requestId: request.id,
          status: 'error',
          error: 'idempotency_key_parameter_mismatch'
        }
      }

      // Return cached response
      return {
        requestId: request.id,
        status: 'success',
        data: existing.response
      }
    }

    // 3. Add to appropriate queue
    if (request.priority === 'high') {
      this.priorityQueue.push(request)
    } else {
      this.normalQueue.push(request)
    }

    // 4. Start processing if not already running
    if (!this.processing) {
      this.processQueue()
    }

    return { requestId: request.id, status: 'retry' }
  }

  private async processQueue(): Promise<void> {
    this.processing = true

    try {
      while (this.priorityQueue.length > 0 || this.normalQueue.length > 0) {
        // Process priority queue first
        const request = this.priorityQueue.shift() || this.normalQueue.shift()
        if (!request) break

        await this.processRequest(request)
      }
    } finally {
      this.processing = false
    }
  }

  private async processRequest(request: QueueRequest): Promise<void> {
    const startTime = Date.now()

    try {
      // Circuit breaker execution
      const result = await this.circuitBreaker.execute(async () => {
        return await this.executeRequest(request)
      })

      // Success
      this.circuitBreaker.recordSuccess()
      await this.idempotencyStore.set(request.idempotencyKey, {
        requestFingerprint: this.generateFingerprint(request),
        response: result,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      })

    } catch (error) {
      this.circuitBreaker.recordFailure()

      // Retry logic
      if (this.shouldRetry(request, error)) {
        await this.scheduleRetry(request)
      } else {
        // Final failure
        await this.handleFinalFailure(request, error)
      }
    }

    // Record processing time for monitoring
    const processingTime = Date.now() - startTime
    this.recordMetrics(request.type, processingTime, true)
  }

  private async executeRequest(request: QueueRequest): Promise<any> {
    return await this.database.transaction(async (trx) => {
      switch (request.type) {
        case 'create_reservation':
          return await this.handleCreateReservation(request, trx)
        case 'rollback_reservation':
          return await this.handleRollbackReservation(request, trx)
        case 'realize_reservation':
          return await this.handleRealizeReservation(request, trx)
        default:
          throw new Error(`Unknown request type: ${request.type}`)
      }
    })
  }
}
```

## Request Handlers

```typescript
// Create Reservation Handler
private async handleCreateReservation(
  request: QueueRequest,
  trx: Transaction
): Promise<ReservedBasket> {
  // 1. Check token state (multi-tab protection)
  const existingToken = await trx('reservation_tokens')
    .where('token', request.reservationToken)
    .first()

  if (existingToken && existingToken.state !== 'FREE') {
    throw new Error('operation_in_progress')
  }

  // 2. Set token to RESERVING state
  const reservationToken = generateUUID()
  await trx('reservation_tokens').insert({
    token: reservationToken,
    state: 'RESERVING',
    created_at: new Date(),
    expires_at: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    idempotency_key: request.idempotencyKey,
    request_fingerprint: this.generateFingerprint(request)
  })

  // 3. Check stock availability and create reserved basket
  const reservedBasket = await this.createReservedBasket(
    request.payload.clientBasket,
    trx
  )

  // 4. Update reserved stock
  await this.updateReservedStock(reservedBasket.products, trx)

  // 5. Set token to ACTIVE state
  await trx('reservation_tokens')
    .where('token', reservationToken)
    .update({
      state: 'ACTIVE',
      updated_at: new Date(),
      data: JSON.stringify(reservedBasket)
    })

  // 6. Set Redis TTL for automatic cleanup
  await this.redis.setex(
    `reservation:${reservationToken}`,
    600, // 10 minutes
    JSON.stringify({ state: 'ACTIVE', token: reservationToken })
  )

  return {
    ...reservedBasket,
    reservationToken
  }
}

// Rollback Reservation Handler
private async handleRollbackReservation(
  request: QueueRequest,
  trx: Transaction
): Promise<void> {
  const { reservationToken } = request

  // 1. Get token and lock it
  const token = await trx('reservation_tokens')
    .where('token', reservationToken)
    .forUpdate() // DB-level lock
    .first()

  if (!token) {
    throw new Error('reservation_token_not_found')
  }

  if (token.state === 'CANCELLING') {
    throw new Error('operation_in_progress')
  }

  // 2. Set to CANCELLING state
  await trx('reservation_tokens')
    .where('token', reservationToken)
    .update({
      state: 'CANCELLING',
      updated_at: new Date()
    })

  // 3. Restore stock
  const reservedBasket = JSON.parse(token.data || '{}')
  if (reservedBasket.products) {
    await this.restoreReservedStock(reservedBasket.products, trx)
  }

  // 4. Delete token
  await trx('reservation_tokens')
    .where('token', reservationToken)
    .del()

  // 5. Remove from Redis
  await this.redis.del(`reservation:${reservationToken}`)
}

// Realize Reservation Handler (Payment Success)
private async handleRealizeReservation(
  request: QueueRequest,
  trx: Transaction
): Promise<void> {
  const { reservationToken } = request

  // 1. Get and lock token
  const token = await trx('reservation_tokens')
    .where('token', reservationToken)
    .forUpdate()
    .first()

  if (!token || token.state !== 'ACTIVE') {
    throw new Error('invalid_reservation_token')
  }

  // 2. Set to REALIZING state
  await trx('reservation_tokens')
    .where('token', reservationToken)
    .update({
      state: 'REALIZING',
      updated_at: new Date()
    })

  // 3. Convert reserved stock to sold stock
  const reservedBasket = JSON.parse(token.data || '{}')
  if (reservedBasket.products) {
    await this.convertReservedToSold(reservedBasket.products, trx)
  }

  // 4. Delete token
  await trx('reservation_tokens')
    .where('token', reservationToken)
    .del()

  // 5. Remove from Redis
  await this.redis.del(`reservation:${reservationToken}`)
}
```

## Retry Logic with Exponential Backoff

```typescript
class RetryHandler {
  private static readonly BASE_DELAY = 1000 // 1 second
  private static readonly MAX_DELAY = 30000 // 30 seconds
  private static readonly JITTER_FACTOR = 0.25 // ±25%

  static shouldRetry(request: QueueRequest, error: Error): boolean {
    // Don't retry non-transient errors
    if (this.isNonTransientError(error)) {
      return false
    }

    // Different retry limits for different operations
    const maxRetries = request.type === 'rollback_reservation' ? 10 : 3
    return request.retryCount < maxRetries
  }

  static calculateDelay(retryCount: number): number {
    // Exponential backoff with jitter
    const exponentialDelay = this.BASE_DELAY * Math.pow(2, retryCount)
    const cappedDelay = Math.min(exponentialDelay, this.MAX_DELAY)

    // Add jitter (±25%)
    const jitter = cappedDelay * this.JITTER_FACTOR * (Math.random() * 2 - 1)
    return Math.max(0, cappedDelay + jitter)
  }

  private static isNonTransientError(error: Error): boolean {
    const nonTransientErrors = [
      'operation_in_progress',
      'reservation_token_not_found',
      'invalid_reservation_token',
      'idempotency_key_parameter_mismatch'
    ]

    return nonTransientErrors.some(pattern =>
      error.message.includes(pattern)
    )
  }
}
```

## Circuit Breaker Implementation

```typescript
class CircuitBreaker {
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED'
  private failureCount = 0
  private lastFailureTime?: Date
  private nextAttempt?: Date

  constructor(
    private options: {
      failureThreshold: number
      recoveryTimeout: number
      monitoring: QueueMonitoring
    }
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.isOpen()) {
      throw new Error('service_temporarily_unavailable')
    }

    try {
      const result = await operation()
      this.recordSuccess()
      return result
    } catch (error) {
      this.recordFailure()
      throw error
    }
  }

  isOpen(): boolean {
    if (this.state === 'OPEN') {
      if (Date.now() >= this.nextAttempt!.getTime()) {
        this.state = 'HALF_OPEN'
        return false
      }
      return true
    }
    return false
  }

  recordSuccess(): void {
    this.failureCount = 0
    this.state = 'CLOSED'
    this.options.monitoring.recordCircuitBreakerEvent('CLOSED')
  }

  recordFailure(): void {
    this.failureCount++
    this.lastFailureTime = new Date()

    if (this.failureCount >= this.options.failureThreshold) {
      this.state = 'OPEN'
      this.nextAttempt = new Date(
        Date.now() + this.options.recoveryTimeout
      )
      this.options.monitoring.recordCircuitBreakerEvent('OPEN')
    }
  }
}
```

## TTL Cleanup System

```typescript
class TTLManager {
  constructor(
    private redis: RedisClient,
    private database: Database,
    private queue: FIFOQueue
  ) {}

  async startCleanup(): Promise<void> {
    // Run cleanup every minute
    setInterval(async () => {
      await this.cleanupExpiredReservations()
    }, 60000)
  }

  private async cleanupExpiredReservations(): Promise<void> {
    // Find expired tokens
    const expiredTokens = await this.database('reservation_tokens')
      .where('expires_at', '<', new Date())
      .where('state', 'ACTIVE')
      .select('token', 'data')

    for (const tokenRecord of expiredTokens) {
      // Create rollback request
      const rollbackRequest: QueueRequest = {
        id: generateUUID(),
        type: 'rollback_reservation',
        reservationToken: tokenRecord.token,
        idempotencyKey: generateUUID(),
        payload: {},
        priority: 'normal',
        createdAt: new Date(),
        retryCount: 0
      }

      await this.queue.enqueue(rollbackRequest)
    }
  }
}
```

## Monitoring and Metrics

```typescript
class QueueMonitoring {
  private metrics = new Map<string, QueueMetrics>()

  recordProcessingTime(
    requestType: QueueRequestType,
    processingTime: number,
    success: boolean
  ): void {
    const key = `${requestType}_${success ? 'success' : 'failure'}`
    const existing = this.metrics.get(key) || {
      count: 0,
      totalTime: 0,
      avgTime: 0,
      maxTime: 0,
      minTime: Infinity
    }

    existing.count++
    existing.totalTime += processingTime
    existing.avgTime = existing.totalTime / existing.count
    existing.maxTime = Math.max(existing.maxTime, processingTime)
    existing.minTime = Math.min(existing.minTime, processingTime)

    this.metrics.set(key, existing)
  }

  recordCircuitBreakerEvent(state: 'OPEN' | 'CLOSED'): void {
    console.log(`Circuit breaker ${state} at ${new Date().toISOString()}`)
  }

  getMetrics(): Record<string, QueueMetrics> {
    return Object.fromEntries(this.metrics)
  }
}

interface QueueMetrics {
  count: number
  totalTime: number
  avgTime: number
  maxTime: number
  minTime: number
}
```

## DoD Compliance Matrix

| DoD Requirement | Implementation | Status |
|----------------|----------------|--------|
| Sequential FIFO processing | `processQueue()` with priority queue first | **Implemented** |
| Atomic operations | Database transactions with `trx()` | **Implemented** |
| Token state tracking | `TokenState` enum with DB locks | **Implemented** |
| Server-side TTL | Redis TTL + cleanup job | **Implemented** |
| Idempotency with parameter validation | Request fingerprinting | **Implemented** |
| Exponential backoff | `RetryHandler` with jitter | **Implemented** |
| Circuit breaker | `CircuitBreaker` class | **Implemented** |
| Priority queue for payments | Separate `priorityQueue` array | **Implemented** |
| Multi-tab protection | Token state + DB locks | **Implemented** |
| Error classification | `isNonTransientError()` method | **Implemented** |

## API Endpoints

```typescript
// Queue API Routes
app.post('/api/checkout/reserve', async (req, res) => {
  const request: QueueRequest = {
    id: generateUUID(),
    type: 'create_reservation',
    idempotencyKey: req.headers['x-idempotency-key'] as string,
    payload: { clientBasket: req.body },
    priority: 'normal',
    createdAt: new Date(),
    retryCount: 0
  }

  const response = await queue.enqueue(request)
  res.json(response)
})

app.post('/api/checkout/rollback', async (req, res) => {
  const request: QueueRequest = {
    id: generateUUID(),
    type: 'rollback_reservation',
    reservationToken: req.body.reservationToken,
    idempotencyKey: req.headers['x-idempotency-key'] as string,
    payload: {},
    priority: 'normal',
    createdAt: new Date(),
    retryCount: 0
  }

  const response = await queue.enqueue(request)
  res.json(response)
})

app.post('/api/checkout/realize', async (req, res) => {
  // Webhook endpoint for payment success
  const request: QueueRequest = {
    id: generateUUID(),
    type: 'realize_reservation',
    reservationToken: req.body.metadata.reservation_token,
    idempotencyKey: generateUUID(),
    payload: { metadata: req.body.metadata },
    priority: 'high',
    createdAt: new Date(),
    retryCount: 0
  }

  const response = await queue.enqueue(request)
  res.json(response)
})
```
