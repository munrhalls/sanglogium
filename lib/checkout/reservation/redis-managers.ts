// Guest Checkout Inventory Reservation - Redis Schema Managers
// ReservationTTLManager, CircuitBreakerManager, IdempotencyManager, TokenManager
// Matches redis-schema.test.ts interfaces exactly

import type Redis from 'ioredis'
import type {
  ReservationTTLData,
  CircuitBreakerState,
  IdempotencyCacheData,
  ReservationToken
} from './types'

// ============================================================================
// ReservationTTLManager
// Key pattern: reservation:{token}
// TTL: 600 seconds (10 minutes) per PRD
// ============================================================================

export class ReservationTTLManager {
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

// ============================================================================
// CircuitBreakerManager
// Key pattern: circuit-breaker:{serviceName}
// Key pattern: circuit-breaker:{serviceName}:failures
// No TTL - persists across service restarts
// ============================================================================

export class CircuitBreakerManager {
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

// ============================================================================
// IdempotencyManager
// Key pattern: idempotency:{idempotencyKey}
// TTL: 86400 seconds (24 hours) per PRD
// ============================================================================

export class IdempotencyManager {
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

// ============================================================================
// TokenManager
// Key pattern: token:{token}
// TTL: 600 seconds (10 minutes) per PRD
// ============================================================================

export class TokenManager {
  constructor(private redis: Redis) {}

  async setToken(token: string, reservationToken: ReservationToken): Promise<void> {
    const key = `token:${token}`
    // Set with 10-minute TTL (600 seconds) per PRD
    await this.redis.setex(key, 600, JSON.stringify(reservationToken))
  }

  async getToken(token: string): Promise<ReservationToken | null> {
    const key = `token:${token}`
    const data = await this.redis.get(key)
    return data ? JSON.parse(data) : null
  }

  async updateToken(token: string, reservationToken: ReservationToken): Promise<void> {
    const key = `token:${token}`
    // Update with TTL refresh
    await this.redis.setex(key, 600, JSON.stringify(reservationToken))
  }

  async deleteToken(token: string): Promise<void> {
    const key = `token:${token}`
    await this.redis.del(key)
  }
}

// ============================================================================
// Enhanced IdempotencyManager with 24-hour TTL
// Key pattern: idempotency:{idempotencyKey}
// TTL: 86400 seconds (24 hours) per PRD
// ============================================================================

export class EnhancedIdempotencyManager {
  constructor(private redis: Redis) {}

  async setResponse(idempotencyKey: string, requestFingerprint: string, response: unknown): Promise<void> {
    const key = `idempotency:${idempotencyKey}`
    const data: IdempotencyCacheData = {
      requestFingerprint,
      response,
      createdAt: new Date().toISOString()
    }
    // Set with 24-hour TTL (86400 seconds) per PRD
    await this.redis.setex(key, 86400, JSON.stringify(data))
  }

  async getResponse(idempotencyKey: string): Promise<IdempotencyCacheData | null> {
    const key = `idempotency:${idempotencyKey}`
    const data = await this.redis.get(key)
    return data ? JSON.parse(data) : null
  }

  async deleteResponse(idempotencyKey: string): Promise<void> {
    const key = `idempotency:${idempotencyKey}`
    await this.redis.del(key)
  }
}
