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

import { NextResponse } from 'next/server'
import { getQueueRedis } from '@/lib/queue/redis'
import { TRACE_LIST_KEY, QUEUE_LIST_KEY } from '@/lib/queue/constants'

export async function POST() {
  const redis = getQueueRedis()
  await redis.del(TRACE_LIST_KEY)
  await redis.del(QUEUE_LIST_KEY)
  await redis.del('lock:checkout:processing')
  return NextResponse.json({ ok: true })
}
