# Redis Schema Specification

## Overview

Redis is used exclusively for server-side TTL management of reservation tokens. The schema is minimal and focused on the 10-minute automatic rollback requirement from the PRD.

## Key Patterns

### 1. Reservation Token TTL

**Purpose**: Automatic rollback after 10 minutes if reservation is not completed or cancelled.

```typescript
// Key Pattern
const RESERVATION_KEY = `reservation:${reservationToken}`

// Data Structure
interface ReservationTTLData {
  state: 'ACTIVE' | 'EXPIRED'
  token: string
  createdAt: string // ISO timestamp
  expiresAt: string // ISO timestamp
}

// Redis Operations
class ReservationTTLManager {
  private redis: Redis

  async setReservationToken(token: string): Promise<void> {
    const key = `reservation:${token}`
    const data: ReservationTTLData = {
      state: 'ACTIVE',
      token,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString()
    }

    // Set with 10-minute TTL (600 seconds)
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
```

### 2. Circuit Breaker State

**Purpose**: Track circuit breaker state across server restarts.

```typescript
// Key Pattern
const CIRCUIT_BREAKER_KEY = `circuit-breaker:${serviceName}`

// Data Structure
interface CircuitBreakerState {
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN'
  failureCount: number
  lastFailureTime: string | null
  nextAttemptTime: string | null
}

// Redis Operations
class CircuitBreakerManager {
  private redis: Redis

  async getCircuitBreakerState(serviceName: string): Promise<CircuitBreakerState | null> {
    const key = `circuit-breaker:${serviceName}`
    const data = await this.redis.get(key)
    return data ? JSON.parse(data) : null
  }

  async setCircuitBreakerState(
    serviceName: string,
    state: CircuitBreakerState
  ): Promise<void> {
    const key = `circuit-breaker:${serviceName}`
    // Circuit breaker state doesn't expire
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
```

### 3. Idempotency Response Cache

**Purpose**: Cache responses for idempotency keys (24-hour TTL).

```typescript
// Key Pattern
const IDEMPOTENCY_KEY = `idempotency:${idempotencyKey}`

// Data Structure
interface IdempotencyCache {
  requestFingerprint: string
  response: any
  createdAt: string
  expiresAt: string
}

// Redis Operations
class IdempotencyCacheManager {
  private redis: Redis

  async setCachedResponse(
    idempotencyKey: string,
    requestFingerprint: string,
    response: any
  ): Promise<void> {
    const key = `idempotency:${idempotencyKey}`
    const data: IdempotencyCache = {
      requestFingerprint,
      response,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }

    // 24-hour TTL (86400 seconds)
    await this.redis.setex(key, 86400, JSON.stringify(data))
  }

  async getCachedResponse(idempotencyKey: string): Promise<IdempotencyCache | null> {
    const key = `idempotency:${idempotencyKey}`
    const data = await this.redis.get(key)
    return data ? JSON.parse(data) : null
  }

  async deleteCachedResponse(idempotencyKey: string): Promise<void> {
    const key = `idempotency:${idempotencyKey}`
    await this.redis.del(key)
  }
}
```

## Redis Configuration

### Connection Setup

```typescript
// Redis Client Configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: 0,

  // Connection pooling
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
  lazyConnect: true,

  // Key prefixing (optional, for isolation if needed)
  keyPrefix: process.env.GUEST_CHECKOUT_REDIS_KEY_PREFIX,

  // Serialization
  parseJSON: true,
  stringifyJSON: true
}

const redis = new Redis(redisConfig)
```

### Health Check

```typescript
// Redis Health Monitoring
class RedisHealthMonitor {
  private redis: Redis

  async checkHealth(): Promise<{ healthy: boolean; latency: number }> {
    const start = Date.now()

    try {
      await this.redis.ping()
      const latency = Date.now() - start

      return {
        healthy: latency < 1000, // 1 second threshold
        latency
      }
    } catch (error) {
      return {
        healthy: false,
        latency: Date.now() - start
      }
    }
  }

  async getMemoryUsage(): Promise<number> {
    const info = await this.redis.info('memory')
    const match = info.match(/used_memory:(\d+)/)
    return match ? parseInt(match[1]) : 0
  }

  async getKeyCount(): Promise<number> {
    return await this.redis.dbsize()
  }
}
```

## TTL Expiration Handling

### Redis Keyspace Notifications

```typescript
// Setup for TTL expiration events
class RedisExpirationHandler {
  private redis: Redis
  private queue: FIFOQueue

  constructor(redis: Redis, queue: FIFOQueue) {
    this.redis = redis
    this.queue = queue
    this.setupExpirationListener()
  }

  private setupExpirationListener(): void {
    // This requires Redis configuration:
    // notify-keyspace-events Ex

    this.redis.subscribe('__keyevent@0__:expired', (channel, message) => {
      if (message.startsWith('reservation:')) {
        const token = message.replace('reservation:', '')
        this.handleReservationExpiration(token)
      }
    })
  }

  private async handleReservationExpiration(token: string): Promise<void> {
    try {
      // Create rollback request for expired reservation
      const rollbackRequest: QueueRequest = {
        id: generateUUID(),
        type: 'rollback_reservation',
        reservationToken: token,
        idempotencyKey: generateUUID(),
        payload: {},
        priority: 'normal',
        createdAt: new Date(),
        retryCount: 0
      }

      await this.queue.enqueue(rollbackRequest)

      // Log the expiration
      console.log(`Reservation ${token} expired, rollback queued`)
    } catch (error) {
      console.error(`Failed to handle expiration for ${token}:`, error)
    }
  }
}
```

### Manual Cleanup Job (Fallback)

```typescript
// Fallback cleanup if keyspace notifications aren't available
class RedisCleanupJob {
  private redis: Redis
  private queue: FIFOQueue

  constructor(redis: Redis, queue: FIFOQueue) {
    this.redis = redis
    this.queue = queue
  }

  async startCleanupJob(): Promise<void> {
    // Run every 30 seconds
    setInterval(async () => {
      await this.cleanupExpiredReservations()
    }, 30000)
  }

  private async cleanupExpiredReservations(): Promise<void> {
    try {
      // Scan for reservation keys
      const pattern = 'reservation:*'
      const keys = await this.redis.keys(pattern)

      for (const key of keys) {
        const ttl = await this.redis.ttl(key)

        // If TTL is -1 (no expiration) or about to expire, handle it
        if (ttl === -1 || ttl < 10) {
          const token = key.replace('reservation:', '')
          await this.handleExpiredReservation(token)
        }
      }
    } catch (error) {
      console.error('Cleanup job failed:', error)
    }
  }

  private async handleExpiredReservation(token: string): Promise<void> {
    try {
      // Check if token still exists in database
      const tokenExists = await this.checkTokenInDatabase(token)

      if (tokenExists) {
        // Create rollback request
        const rollbackRequest: QueueRequest = {
          id: generateUUID(),
          type: 'rollback_reservation',
          reservationToken: token,
          idempotencyKey: generateUUID(),
          payload: {},
          priority: 'normal',
          createdAt: new Date(),
          retryCount: 0
        }

        await this.queue.enqueue(rollbackRequest)

        // Remove from Redis to prevent duplicate processing
        await this.redis.del(`reservation:${token}`)
      }
    } catch (error) {
      console.error(`Failed to handle expired reservation ${token}:`, error)
    }
  }

  private async checkTokenInDatabase(token: string): Promise<boolean> {
    // This would query your database/Sanity to verify token still exists
    // Implementation depends on your data layer
    return true // Placeholder
  }
}
```

## Monitoring and Metrics

### Redis Metrics Collection

```typescript
class RedisMetrics {
  private redis: Redis

  async getMetrics(): Promise<RedisMetrics> {
    const info = await this.redis.info()

    return {
      memory: this.parseMemoryInfo(info),
      connections: this.parseConnectionInfo(info),
      operations: this.parseOperationInfo(info),
      keyStats: this.parseKeyStats(info),
      performance: await this.getPerformanceMetrics()
    }
  }

  private parseMemoryInfo(info: string): MemoryInfo {
    return {
      used: this.extractValue(info, 'used_memory:'),
      peak: this.extractValue(info, 'used_memory_peak:'),
      rss: this.extractValue(info, 'used_memory_rss:')
    }
  }

  private parseConnectionInfo(info: string): ConnectionInfo {
    return {
      connected: this.extractValue(info, 'connected_clients:'),
      blocked: this.extractValue(info, 'blocked_clients:')
    }
  }

  private parseOperationInfo(info: string): OperationInfo {
    return {
      totalCommands: this.extractValue(info, 'total_commands_processed:'),
      operationsPerSecond: this.extractValue(info, 'instantaneous_ops_per_sec:'),
      keyspaceHits: this.extractValue(info, 'keyspace_hits:'),
      keyspaceMisses: this.extractValue(info, 'keyspace_misses:')
    }
  }

  private parseKeyStats(info: string): KeyStats {
    return {
      totalKeys: this.extractValue(info, 'db0:keys='),
      expires: this.extractValue(info, 'expires:'),
      avgTTL: this.extractValue(info, 'avg_ttl:')
    }
  }

  private async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    const start = Date.now()
    await this.redis.ping()
    const latency = Date.now() - start

    return {
      latency,
      status: latency < 100 ? 'healthy' : 'degraded'
    }
  }

  private extractValue(info: string, prefix: string): number {
    const match = info.match(new RegExp(`${prefix}(\\d+)`))
    return match ? parseInt(match[1]) : 0
  }
}

interface RedisMetrics {
  memory: MemoryInfo
  connections: ConnectionInfo
  operations: OperationInfo
  keyStats: KeyStats
  performance: PerformanceMetrics
}

interface MemoryInfo {
  used: number
  peak: number
  rss: number
}

interface ConnectionInfo {
  connected: number
  blocked: number
}

interface OperationInfo {
  totalCommands: number
  operationsPerSecond: number
  keyspaceHits: number
  keyspaceMisses: number
}

interface KeyStats {
  totalKeys: number
  expires: number
  avgTTL: number
}

interface PerformanceMetrics {
  latency: number
  status: 'healthy' | 'degraded' | 'unhealthy'
}
```

## Error Handling and Resilience

### Redis Connection Management

```typescript
class RedisConnectionManager {
  private redis: Redis
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5

  constructor() {
    this.redis = new Redis(this.getConfig())
    this.setupErrorHandling()
  }

  private getConfig(): RedisOptions {
    return {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,

      // Reconnection strategy
      reconnectOnError: (err) => {
        const targetError = 'READONLY'
        return err.message.includes(targetError)
      },

      // Offline queue
      enableOfflineQueue: true,
      maxRetriesPerRequest: null,

      // Connection timeout
      connectTimeout: 10000,
      commandTimeout: 5000
    }
  }

  private setupErrorHandling(): void {
    this.redis.on('error', (error) => {
      console.error('Redis error:', error)
      this.handleConnectionError(error)
    })

    this.redis.on('connect', () => {
      console.log('Redis connected')
      this.reconnectAttempts = 0
    })

    this.redis.on('reconnecting', (delay) => {
      console.log(`Redis reconnecting in ${delay}ms`)
      this.reconnectAttempts++
    })
  }

  private async handleConnectionError(error: Error): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached, giving up')
      // Implement fallback behavior
      await this.handleRedisUnavailable()
    }
  }

  private async handleRedisUnavailable(): Promise<void> {
    // Fallback behavior when Redis is unavailable:
    // 1. Log the error
    // 2. Continue with degraded functionality
    // 3. Use database fallback for TTL (less reliable)
    console.warn('Redis unavailable, falling back to database TTL')
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.redis.ping()
      return true
    } catch (error) {
      return false
    }
  }
}
```

## Security Considerations

### Redis Security Configuration

```typescript
// Redis Security Setup
const secureRedisConfig = {
  // Use TLS in production
  tls: process.env.NODE_ENV === 'production' ? {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_TLS_PORT || '6380')
  } : undefined,

  // Authentication
  password: process.env.REDIS_PASSWORD,

  // Database isolation via key prefixing (optional)
  db: 0,
  keyPrefix: process.env.GUEST_CHECKOUT_REDIS_KEY_PREFIX,

  // Command restrictions (if using Redis ACL)
  // Only allow specific commands for this application
  allowedCommands: [
    'SET', 'GET', 'DEL', 'SETEX', 'EXPIRE', 'TTL',
    'INCR', 'DECR', 'PING', 'INFO', 'KEYS', 'SCAN'
  ]
}

// Input sanitization for Redis keys
function sanitizeRedisKey(key: string): string {
  // Only allow alphanumeric, hyphens, underscores, and colons
  return key.replace(/[^a-zA-Z0-9:_-]/g, '')
}

// Data validation for Redis values
function validateRedisData(data: any): boolean {
  // Prevent overly large values
  const jsonString = JSON.stringify(data)
  if (jsonString.length > 1024 * 1024) { // 1MB limit
    return false
  }

  // Prevent potential injection attacks
  if (typeof jsonString !== 'string') {
    return false
  }

  return true
}
```
