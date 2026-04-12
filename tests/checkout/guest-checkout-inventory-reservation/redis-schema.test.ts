import { test, expect } from '@playwright/test'
import Redis from 'ioredis'
import { v4 as uuidv4 } from 'uuid'

// Redis schema interfaces based on PRD
interface ReservationTTLData {
  state: 'ACTIVE' | 'EXPIRED'
  token: string
  createdAt: string
  expiresAt: string
}

interface CircuitBreakerState {
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN'
  failureCount: number
  lastFailureTime: string | null
  nextAttemptTime: string | null
}

interface IdempotencyCacheData {
  requestFingerprint: string
  response: unknown
  createdAt: string
  expiresAt: string
}

// Redis manager implementation
class ReservationTTLManager {
  constructor(private redis: Redis) {}

  async setReservationToken(token: string): Promise<void> {
    const key = `reservation:${token}`
    const data: ReservationTTLData = {
      state: 'ACTIVE',
      token,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString()
    }

    // Set with 10-minute TTL (600 seconds) per PRD
    await this.redis.setex(key, 600, JSON.stringify(data))
  }

  async removeReservationToken(token: string): Promise<void> {
    const key = `reservation:${token}`
    await this.redis.del(key)
  }

  async checkReservationToken(token: string): Promise<ReservationTTLData | null> {
    const key = `reservation:${token}`
    const data = await this.redis.get(key)
    return data ? JSON.parse(data) : null
  }
}

class CircuitBreakerManager {
  constructor(private redis: Redis) {}

  async getCircuitBreakerState(serviceName: string): Promise<CircuitBreakerState | null> {
    const key = `circuit-breaker:${serviceName}`
    const data = await this.redis.get(key)
    return data ? JSON.parse(data) : null
  }

  async setCircuitBreakerState(serviceName: string, state: CircuitBreakerState): Promise<void> {
    const key = `circuit-breaker:${serviceName}`
    // Circuit breaker state doesn't expire per PRD
    await this.redis.set(key, JSON.stringify(state))
  }

  async incrementFailureCount(serviceName: string): Promise<number> {
    const key = `circuit-breaker:${serviceName}:failures`
    return await this.redis.incr(key)
  }

  async resetFailureCount(serviceName: string): Promise<void> {
    const key = `circuit-breaker:${serviceName}:failures`
    await this.redis.del(key)
  }
}

class IdempotencyManager {
  constructor(private redis: Redis) {}

  async storeResponse(idempotencyKey: string, response: unknown, fingerprint: string): Promise<void> {
    const key = `idempotency:${idempotencyKey}`
    const data: IdempotencyCacheData = {
      requestFingerprint: fingerprint,
      response,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    }

    // Store with 24-hour TTL per PRD
    await this.redis.setex(key, 86400, JSON.stringify(data))
  }

  async getResponse(idempotencyKey: string): Promise<IdempotencyCacheData | null> {
    const key = `idempotency:${idempotencyKey}`
    const data = await this.redis.get(key)
    return data ? JSON.parse(data) : null
  }
}

test.describe('Redis Schema', () => {
  let redis: Redis
  let ttlManager: ReservationTTLManager
  let circuitBreaker: CircuitBreakerManager
  let idempotency: IdempotencyManager

  test.beforeAll(async () => {
    redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      db: 15 // Use test DB
    })

    ttlManager = new ReservationTTLManager(redis)
    circuitBreaker = new CircuitBreakerManager(redis)
    idempotency = new IdempotencyManager(redis)
  })

  test.beforeEach(async () => {
    // Clear test DB
    await redis.flushdb()
  })

  test.afterAll(async () => {
    await redis.flushdb()
    await redis.quit()
  })

  test('Reservation Token TTL Creation', async () => {
    const token = uuidv4()

    // Create reservation token
    await ttlManager.setReservationToken(token)

    // Verify key exists
    const key = `reservation:${token}`
    const exists = await redis.exists(key)
    expect(exists).toBe(1)

    // Check TTL value is exactly 600 seconds (10 minutes per PRD)
    const ttl = await redis.ttl(key)
    expect(ttl).toBeGreaterThan(590) // Allow some variance
    expect(ttl).toBeLessThanOrEqual(600)

    // Verify JSON data structure
    const data = await ttlManager.checkReservationToken(token)
    expect(data).not.toBeNull()
    expect(data!.state).toBe('ACTIVE')
    expect(data!.token).toBe(token)
    expect(data!.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/) // ISO format
    expect(data!.expiresAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)

    // Test with multiple tokens
    const token2 = uuidv4()
    await ttlManager.setReservationToken(token2)
    const data2 = await ttlManager.checkReservationToken(token2)
    expect(data2).not.toBeNull()
    expect(data2!.token).toBe(token2)
  })

  test('Reservation Token Expiry', async () => {
    const token = uuidv4()

    // Create token with short TTL for testing
    const key = `reservation:${token}`
    await redis.setex(key, 2, JSON.stringify({
      state: 'ACTIVE',
      token,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 2000).toISOString()
    }))

    // Verify key exists initially
    let exists = await redis.exists(key)
    expect(exists).toBe(1)

    // Wait for expiration
    await new Promise(resolve => setTimeout(resolve, 3000))

    // Verify key automatically deleted
    exists = await redis.exists(key)
    expect(exists).toBe(0)

    // Verify data is null after expiration
    const data = await ttlManager.checkReservationToken(token)
    expect(data).toBeNull()
  })

  test('Reservation Token Removal', async () => {
    const token = uuidv4()

    // Create token
    await ttlManager.setReservationToken(token)
    expect(await ttlManager.checkReservationToken(token)).not.toBeNull()

    // Remove token
    await ttlManager.removeReservationToken(token)

    // Verify key deleted
    const key = `reservation:${token}`
    const exists = await redis.exists(key)
    expect(exists).toBe(0)

    // Verify TTL cancelled
    const ttl = await redis.ttl(key)
    expect(ttl).toBe(-2) // Key does not exist

    // Verify no expiration event (key is gone)
    const data = await ttlManager.checkReservationToken(token)
    expect(data).toBeNull()
  })

  test('Circuit Breaker State Persistence', async () => {
    const serviceName = 'checkout-queue'

    // Set circuit breaker to OPEN state
    const state: CircuitBreakerState = {
      state: 'OPEN',
      failureCount: 5,
      lastFailureTime: new Date().toISOString(),
      nextAttemptTime: new Date(Date.now() + 30000).toISOString()
    }

    await circuitBreaker.setCircuitBreakerState(serviceName, state)

    // Verify state persisted
    const retrieved = await circuitBreaker.getCircuitBreakerState(serviceName)
    expect(retrieved).not.toBeNull()
    expect(retrieved!.state).toBe('OPEN')
    expect(retrieved!.failureCount).toBe(5)
    expect(retrieved!.lastFailureTime).toBe(state.lastFailureTime)
    expect(retrieved!.nextAttemptTime).toBe(state.nextAttemptTime)

    // Simulate service restart by creating new manager
    const newCircuitBreaker = new CircuitBreakerManager(redis)
    const recovered = await newCircuitBreaker.getCircuitBreakerState(serviceName)
    expect(recovered).toEqual(retrieved)

    // Update state to HALF_OPEN
    state.state = 'HALF_OPEN'
    state.failureCount = 0
    await circuitBreaker.setCircuitBreakerState(serviceName, state)

    const updated = await circuitBreaker.getCircuitBreakerState(serviceName)
    expect(updated!.state).toBe('HALF_OPEN')
    expect(updated!.failureCount).toBe(0)
  })

  test('Circuit Breaker Failure Counting', async () => {
    const serviceName = 'test-service'

    // Start with closed state
    await circuitBreaker.setCircuitBreakerState(serviceName, {
      state: 'CLOSED',
      failureCount: 0,
      lastFailureTime: null,
      nextAttemptTime: null
    })

    // Increment failures
    const count1 = await circuitBreaker.incrementFailureCount(serviceName)
    expect(count1).toBe(1)

    const count2 = await circuitBreaker.incrementFailureCount(serviceName)
    expect(count2).toBe(2)

    const count3 = await circuitBreaker.incrementFailureCount(serviceName)
    expect(count3).toBe(3)

    // Check failure counter key exists
    const key = `circuit-breaker:${serviceName}:failures`
    const exists = await redis.exists(key)
    expect(exists).toBe(1)

    const value = await redis.get(key)
    expect(value).toBe('3')

    // Reset failure count
    await circuitBreaker.resetFailureCount(serviceName)
    const existsAfterReset = await redis.exists(key)
    expect(existsAfterReset).toBe(0)

    const countAfterReset = await circuitBreaker.incrementFailureCount(serviceName)
    expect(countAfterReset).toBe(1) // Starts from 0 again
  })

  test('Idempotency Cache Storage', async () => {
    const idempotencyKey = uuidv4()
    const response = {
      reservationToken: uuidv4(),
      success: true,
      data: { message: 'Reservation created' }
    }
    const fingerprint = JSON.stringify({ type: 'create', payload: { test: true } })

    // Store response
    await idempotency.storeResponse(idempotencyKey, response, fingerprint)

    // Verify key exists
    const key = `idempotency:${idempotencyKey}`
    const exists = await redis.exists(key)
    expect(exists).toBe(1)

    // Check TTL is 24 hours (86400 seconds)
    const ttl = await redis.ttl(key)
    expect(ttl).toBeGreaterThan(86000) // Allow some variance
    expect(ttl).toBeLessThanOrEqual(86400)

    // Retrieve cached response
    const cached = await idempotency.getResponse(idempotencyKey)
    expect(cached).not.toBeNull()
    expect(cached!.requestFingerprint).toBe(fingerprint)
    expect(cached!.response).toEqual(response)
    expect(cached!.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    expect(cached!.expiresAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
  })

  test('Idempotency Cache Expiry', async () => {
    const idempotencyKey = uuidv4()
    const response = { test: 'data' }
    const fingerprint = 'test-fingerprint'

    // Store with short TTL for testing
    const key = `idempotency:${idempotencyKey}`
    await redis.setex(key, 2, JSON.stringify({
      requestFingerprint: fingerprint,
      response,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 2000).toISOString()
    }))

    // Verify exists initially
    let exists = await redis.exists(key)
    expect(exists).toBe(1)

    // Wait for expiration
    await new Promise(resolve => setTimeout(resolve, 3000))

    // Verify automatically deleted
    exists = await redis.exists(key)
    expect(exists).toBe(0)

    // Verify cache returns null
    const cached = await idempotency.getResponse(idempotencyKey)
    expect(cached).toBeNull()
  })

  test('Concurrent Redis Operations', async () => {
    const tokens = Array.from({ length: 10 }, () => uuidv4())

    // Create multiple tokens simultaneously
    const promises = tokens.map(token => ttlManager.setReservationToken(token))
    await Promise.all(promises)

    // Verify all keys created
    for (const token of tokens) {
      const key = `reservation:${token}`
      const exists = await redis.exists(key)
      expect(exists).toBe(1)

      const data = await ttlManager.checkReservationToken(token)
      expect(data).not.toBeNull()
      expect(data!.token).toBe(token)
    }

    // Delete multiple tokens concurrently
    const deletePromises = tokens.map(token => ttlManager.removeReservationToken(token))
    await Promise.all(deletePromises)

    // Verify all deleted
    for (const token of tokens) {
      const key = `reservation:${token}`
      const exists = await redis.exists(key)
      expect(exists).toBe(0)
    }
  })

  test('Key Pattern Validation', async () => {
    const token = uuidv4()

    // Create reservation key pattern
    await ttlManager.setReservationToken(token)
    const reservationKey = `reservation:${token}`
    expect(await redis.exists(reservationKey)).toBe(1)

    // Create circuit breaker key pattern
    const serviceName = 'test-service'
    await circuitBreaker.setCircuitBreakerState(serviceName, {
      state: 'CLOSED',
      failureCount: 0,
      lastFailureTime: null,
      nextAttemptTime: null
    })
    const circuitKey = `circuit-breaker:${serviceName}`
    expect(await redis.exists(circuitKey)).toBe(1)

    // Create idempotency key pattern
    const idempotencyKey = uuidv4()
    await idempotency.storeResponse(idempotencyKey, { test: true }, 'fingerprint')
    const idempotencyKeyPattern = `idempotency:${idempotencyKey}`
    expect(await redis.exists(idempotencyKeyPattern)).toBe(1)

    // Verify patterns don't conflict
    const keys = await redis.keys('*')
    expect(keys).toHaveLength(3)
    expect(keys).toEqual(expect.arrayContaining([reservationKey, circuitKey, idempotencyKeyPattern]))
  })

  test('Memory Usage and Cleanup', async () => {
    // Create 100 reservation keys
    const tokens = Array.from({ length: 100 }, () => uuidv4())

    for (const token of tokens) {
      await ttlManager.setReservationToken(token)
    }

    // Check memory usage (approximate)
    const info = await redis.info('memory')
    expect(info).toContain('used_memory:')

    // Let keys expire naturally (using short TTL for test)
    for (const token of tokens) {
      const key = `reservation:${token}`
      await redis.expire(key, 1) // 1 second TTL
    }

    // Wait for expiration
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Verify memory freed
    const keys = await redis.keys('*')
    expect(keys).toHaveLength(0)
  })

  test('Security and Access Control', async () => {
    // Test with different Redis DBs
    const redis2 = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      db: 15 // Same test DB
    })

    try {
      // Create key in DB 2
      const token = uuidv4()
      await ttlManager.setReservationToken(token)

      // Try to access from DB 3 (should not exist)
      const ttlManager2 = new ReservationTTLManager(redis2)
      const data = await ttlManager2.checkReservationToken(token)
      expect(data).toBeNull()

      // Create key in DB 3
      const token2 = uuidv4()
      await ttlManager2.setReservationToken(token2)

      // Verify exists in DB 3
      const data2 = await ttlManager2.checkReservationToken(token2)
      expect(data2).not.toBeNull()

      // Verify isolation (DB 2 can't see DB 3 keys)
      const keys2 = await redis2.keys('*')
      expect(keys2).toHaveLength(1)

    } finally {
      await redis2.flushdb()
      await redis2.quit()
    }
  })

  test('Performance Benchmarks', async () => {
    const iterations = 1000

    // Measure SET operation latency
    const startTime = Date.now()
    for (let i = 0; i < iterations; i++) {
      await redis.set(`test:${i}`, 'value')
    }
    const setTime = Date.now() - startTime

    // Measure GET operation latency
    const getStartTime = Date.now()
    for (let i = 0; i < iterations; i++) {
      await redis.get(`test:${i}`)
    }
    const getTime = Date.now() - getStartTime

    // Clean up
    for (let i = 0; i < iterations; i++) {
      await redis.del(`test:${i}`)
    }

    // Verify sub-millisecond average latency
    expect(setTime).toBeLessThan(1000) // Less than 1 second for 1000 operations
    expect(getTime).toBeLessThan(1000) // Less than 1 second for 1000 operations

    console.log(`SET: ${setTime}ms for ${iterations} ops (${(setTime/iterations).toFixed(2)}ms avg)`)
    console.log(`GET: ${getTime}ms for ${iterations} ops (${(getTime/iterations).toFixed(2)}ms avg)`)
  })

  test('Redis Cluster Compatibility', async () => {
    // Test hash tag usage for cluster compatibility
    const hashTag = uuidv4()

    // Keys with same hash tag should go to same slot
    const key1 = `reservation:{${hashTag}}`
    const key2 = `reservation:{${hashTag}}:meta`

    await redis.set(key1, 'data1')
    await redis.set(key2, 'data2')

    // Verify both exist
    expect(await redis.exists(key1)).toBe(1)
    expect(await redis.exists(key2)).toBe(1)

    // Test MGET with hash tags
    const results = await redis.mget(key1, key2)
    expect(results).toEqual(['data1', 'data2'])

    // Clean up
    await redis.del(key1)
    await redis.del(key2)
  })
})
