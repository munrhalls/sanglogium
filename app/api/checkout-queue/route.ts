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

// POST /api/checkout-queue — unified FIFO basket reservation endpoint.
// Atomic: one request at a time via Redis SET NX + FIFO list head check.
// Returns 202 with BasketReservationResponse on success.

import { NextRequest, NextResponse } from 'next/server'
import { processInline } from '@/lib/queue/processor'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    raw = null
  }
  const result = await processInline(raw)
  return NextResponse.json(result.body, { status: result.status })
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 })
}
