import { NextRequest, NextResponse } from 'next/server'
import { sweepPaidPayments } from '@/features/checkout/server'

// Vercel Cron calls this once a day with Authorization: Bearer <CRON_SECRET>.
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const result = await sweepPaidPayments({
    authorization: request.headers.get('authorization'),
    now: Math.floor(Date.now() / 1000),
  })
  return NextResponse.json(result.body, { status: result.status })
}
