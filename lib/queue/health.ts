// Health check + 60s recurring probe for the checkout queue Redis connection.

import { getQueueRedis } from './redis'

export interface HealthResult {
  connected: boolean
  latency: number
  error?: string
}

export async function healthCheck(): Promise<HealthResult> {
  const start = Date.now()
  try {
    const redis = getQueueRedis()
    const pong = await redis.ping()
    const latency = Date.now() - start
    const connected = pong === 'PONG'
    const result: HealthResult = { connected, latency }
    console.log('TRACE: Queue health check', result)
    return result
  } catch (err) {
    const latency = Date.now() - start
    const result: HealthResult = {
      connected: false,
      latency,
      error: err instanceof Error ? err.message : String(err),
    }
    console.log('TRACE: Queue health check', result)
    return result
  }
}

// Lazy-start a 60s health probe. Guarded via globalThis so HMR in dev does not
// spawn duplicate intervals.
export function startHealthInterval(): void {
  const g = globalThis as unknown as { __queueHealthStarted?: boolean }
  if (g.__queueHealthStarted) return
  g.__queueHealthStarted = true
  // Fire once immediately, then every 60s.
  void healthCheck()
  setInterval(() => {
    void healthCheck()
  }, 60_000).unref?.()
}

// Start health interval on module load to ensure queue monitoring runs on server startup
startHealthInterval()
