// POST /api/atomic-basket-reservation — atomic basket reservation FIFO endpoint.
// Validates BasketReservation, enqueues in Redis, creates Sanity doc, increments
// product reservedStock atomically. Returns 202 BasketReservationResponse.

import { NextRequest, NextResponse } from 'next/server'
import { processBasketReservation } from '@/lib/queue/basket-reservation-processor'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    raw = null
  }
  const result = await processBasketReservation(raw)
  return NextResponse.json(result.body, { status: result.status })
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 })
}
