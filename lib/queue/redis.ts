// Singleton Upstash Redis client for the checkout queue.
// Uses REST client via @upstash/redis (same infra as lib/dev/*).

import { Redis } from '@upstash/redis'

let client: Redis | null = null

export function getQueueRedis(): Redis {
  if (client) return client

  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    throw new Error(
      'UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set for queue:checkout'
    )
  }

  client = new Redis({ url, token })

  const g = globalThis as unknown as { __queueRedisLogged?: boolean }
  if (!g.__queueRedisLogged) {
    g.__queueRedisLogged = true
    console.log('TRACE: Upstash connection established', {
      url,
      status: 'initialized',
    })
  }

  return client
}
