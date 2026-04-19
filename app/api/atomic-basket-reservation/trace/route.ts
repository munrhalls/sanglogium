// GET /api/atomic-basket-reservation/trace — chronological trace entries for
// the atomic basket reservation flow. Each entry has requestId matching the
// reservationId returned from POST /api/atomic-basket-reservation.

import { NextResponse } from 'next/server'
import { getBasketReservationTrace } from '@/lib/queue/basket-reservation-processor'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const entries = await getBasketReservationTrace()
  return NextResponse.json(entries)
}
