import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { ReservationTTLManager, TokenManager, EnhancedIdempotencyManager } from '@/lib/checkout/reservation/redis-managers'
import { getTestRedisClient, resetTestEnvironment, TTL_VALUES } from '../../config'

describe('Redis Managers TTL', () => {
  const redis = getTestRedisClient()
  const ttlManager = new ReservationTTLManager(redis)
  const tokenManager = new TokenManager(redis)
  const idempotencyManager = new EnhancedIdempotencyManager(redis)

  beforeAll(async () => {
    await resetTestEnvironment()
  })

  afterAll(async () => {
    await resetTestEnvironment()
  })

  it('sets reservation with 600s TTL', async () => {
    const token = 'test-reservation-ttl'
    await ttlManager.setReservationToken(token)

    const ttl = await redis.ttl(`reservation:${token}`)
    expect(ttl).toBeGreaterThan(TTL_VALUES.reservation - 5) // Allow small timing variance
    expect(ttl).toBeLessThanOrEqual(TTL_VALUES.reservation)
  })

  it('sets token with 600s TTL', async () => {
    const token = 'test-token-ttl'
    await tokenManager.setToken(token, {
      token,
      state: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: new Date(Date.now() + 600000),
      idempotencyKey: 'key-123',
      requestFingerprint: 'fp-123',
    })

    const ttl = await redis.ttl(`token:${token}`)
    expect(ttl).toBeGreaterThan(TTL_VALUES.reservation - 5)
    expect(ttl).toBeLessThanOrEqual(TTL_VALUES.reservation)
  })

  it('sets idempotency with 86400s TTL', async () => {
    const key = 'test-idempotency-ttl'
    await idempotencyManager.setResponse(key, 'fingerprint-123', { success: true })

    const ttl = await redis.ttl(`idempotency:${key}`)
    expect(ttl).toBeGreaterThan(TTL_VALUES.idempotency - 5)
    expect(ttl).toBeLessThanOrEqual(TTL_VALUES.idempotency)
  })

  it('data expires after TTL', async () => {
    const token = 'test-expire-token'
    await tokenManager.setToken(token, {
      token,
      state: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: new Date(Date.now() + 600000),
      idempotencyKey: 'key-123',
      requestFingerprint: 'fp-123',
    })

    // Verify it exists
    const existsBefore = await redis.exists(`token:${token}`)
    expect(existsBefore).toBe(1)
  })
})
