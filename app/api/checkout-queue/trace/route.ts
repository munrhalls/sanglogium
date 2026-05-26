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
import { TRACE_LIST_KEY } from '@/lib/queue/constants'

export async function GET() {
  const redis = getQueueRedis()
  const raw = await redis.lrange(TRACE_LIST_KEY, 0, -1)
  const entries = raw
    .map((r) => (typeof r === 'string' ? JSON.parse(r) : r))
    .reverse() // LPUSH means newest-first; reverse to chronological
  return NextResponse.json(entries)
}
