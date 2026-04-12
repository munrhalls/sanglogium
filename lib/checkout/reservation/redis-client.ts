// Guest Checkout Inventory Reservation - Redis Client Setup
// Connection management with reconnection strategies and fallbacks

import Redis from 'ioredis'
import { getLogger } from './logging'
import { LogCategory } from './types'

// ============================================================================
// Redis Client Singleton
// ============================================================================

let redisInstance: Redis | null = null

export function getRedisClient(): Redis {
  if (redisInstance) return redisInstance

  const logger = getLogger()

  const host = process.env.GUEST_CHECKOUT_REDIS_HOST || 'localhost'
  const port = parseInt(process.env.GUEST_CHECKOUT_REDIS_PORT || '6379')
  const password = process.env.GUEST_CHECKOUT_REDIS_PASSWORD || undefined
  const db = parseInt(process.env.GUEST_CHECKOUT_REDIS_DB || '0')
  const useTls = process.env.GUEST_CHECKOUT_REDIS_USE_TLS === 'true'

  redisInstance = new Redis({
    host,
    port,
    password,
    db,
    tls: useTls ? {} : undefined,
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      const delay = Math.min(times * 200, 2000)
      logger.warn(`Redis reconnect attempt ${times}, delay: ${delay}ms`, {
        component: 'RedisClient',
        category: LogCategory.REDIS,
        metadata: { attempt: times, delay }
      })
      return delay
    },
    reconnectOnError(err) {
      const targetErrors = ['READONLY', 'ECONNRESET', 'EPIPE']
      return targetErrors.some(e => err.message.includes(e))
    },
    lazyConnect: false,
    enableReadyCheck: true,
    connectTimeout: 10000,
  })

  redisInstance.on('connect', () => {
    logger.info('Redis connected', {
      component: 'RedisClient',
      category: LogCategory.REDIS,
      metadata: { host, port, db }
    })
  })

  redisInstance.on('error', (err) => {
    logger.error('Redis connection error', {
      component: 'RedisClient',
      category: LogCategory.REDIS,
      error: {
        name: err.name,
        message: err.message,
        stack: err.stack
      }
    })
  })

  redisInstance.on('close', () => {
    logger.warn('Redis connection closed', {
      component: 'RedisClient',
      category: LogCategory.REDIS
    })
  })

  return redisInstance
}

export async function closeRedisClient(): Promise<void> {
  if (redisInstance) {
    await redisInstance.quit()
    redisInstance = null
  }
}

// ============================================================================
// Health Check
// ============================================================================

export async function checkRedisHealth(): Promise<{ healthy: boolean; latencyMs: number }> {
  try {
    const redis = getRedisClient()
    const start = Date.now()
    await redis.ping()
    const latencyMs = Date.now() - start

    return { healthy: true, latencyMs }
  } catch {
    return { healthy: false, latencyMs: -1 }
  }
}
