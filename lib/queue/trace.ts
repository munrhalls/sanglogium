// TRACE sink: console.log for humans + Redis list for programmatic test reads.

import { getQueueRedis } from './redis'
import { TRACE_LIST_KEY, TRACE_MAX, SANITY_TRACE_LIST_KEY, SANITY_TRACE_MAX } from './constants'

export interface TraceEntry {
  event: string
  requestId: string
  ts: number
  payload?: Record<string, unknown>
}

export async function trace(
  event: string,
  requestId: string,
  payload?: Record<string, unknown>
): Promise<void> {
  const entry: TraceEntry = {
    event,
    requestId,
    ts: Date.now(),
    ...(payload ? { payload } : {}),
  }
  console.log(`TRACE: ${event}`, { requestId, ...(payload || {}) })
  try {
    const redis = getQueueRedis()
    await redis.lpush(TRACE_LIST_KEY, JSON.stringify(entry))
    await redis.ltrim(TRACE_LIST_KEY, 0, TRACE_MAX - 1)
  } catch (err) {
    console.error('TRACE sink write failed', err)
  }
}

export async function traceSanity(
  event: string,
  requestId: string,
  payload?: Record<string, unknown>
): Promise<void> {
  const entry: TraceEntry = {
    event,
    requestId,
    ts: Date.now(),
    ...(payload ? { payload } : {}),
  }
  console.log(`SANITY_TRACE: ${event}`, { requestId, ...(payload || {}) })
  try {
    const redis = getQueueRedis()
    await redis.lpush(SANITY_TRACE_LIST_KEY, JSON.stringify(entry))
    await redis.ltrim(SANITY_TRACE_LIST_KEY, 0, SANITY_TRACE_MAX - 1)
  } catch (err) {
    console.error('SANITY_TRACE sink write failed', err)
  }
}
