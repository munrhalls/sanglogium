// POST /api/checkout-queue — inline-processed FIFO queue skeleton.
// Atomic: one request at a time via Redis SET NX + FIFO list peek.

import { NextRequest, NextResponse } from 'next/server'
import { processInline } from '@/lib/queue/processor'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  console.log('TRACE Bus Stop 4: API route received POST request', { timestamp: Date.now() })
  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    raw = null
  }
  const result = await processInline(raw)
  console.log('TRACE Bus Stop 12: API returning response', { status: result.status, body: result.body, timestamp: Date.now() })
  return NextResponse.json(result.body, { status: result.status })
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 })
}
