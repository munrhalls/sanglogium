// DoD-1: Upstash connection + health check
// Real infra, zero mocks. Imports from source (test-import-discipline).

import { describe, it, expect, beforeAll } from 'vitest'
import { getQueueRedis } from '@/lib/queue/redis'
import { healthCheck } from '@/lib/queue/health'

describe('Upstash connection', () => {
  beforeAll(() => {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      throw new Error('UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN required')
    }
  })

  it('connects to Upstash via @upstash/redis', async () => {
    const redis = getQueueRedis()
    const pong = await redis.ping()
    expect(pong).toBe('PONG')
  })

  it('healthCheck returns connected=true with latency number', async () => {
    const result = await healthCheck()
    expect(result.connected).toBe(true)
    expect(typeof result.latency).toBe('number')
    expect(result.latency).toBeGreaterThanOrEqual(0)
  })
})
