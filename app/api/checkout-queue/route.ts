// POST /api/checkout-queue — unified FIFO basket reservation endpoint.
// Atomic: one request at a time via Redis SET NX + FIFO list head check.
// Returns 202 with BasketReservationResponse on success.

import { NextRequest, NextResponse } from 'next/server'
import { processInline } from '@/lib/queue/processor'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

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
