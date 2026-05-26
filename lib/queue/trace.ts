// ============================================================================
// ⚠️  LEGACY - DEPRECATED - NO LONGER USED IN ACTIVE CHECKOUT FLOW ⚠️
// ============================================================================
// This checkout-queue system is LEGACY and NOT part of the current checkout implementation.
// 
// Current checkout flow uses:
//   - iron-session for state management (no queue)
//   - Direct Sanity API calls (no Redis queue)
//   - See: app/actions/checkout/index.ts
//
// DO NOT use this code for new features. It exists only for:
//   - Historical reference
//   - Legacy test compatibility
//   - Potential future audit needs
//
// To delete safely: Remove all files in lib/queue/, app/api/checkout-queue/, tests/checkout-queue/
// ============================================================================

// TRACE sink: console.log for humans + Redis list for programmatic test reads.

import { getQueueRedis } from './redis'
import { TRACE_LIST_KEY, TRACE_MAX } from './constants'

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
