// POST /api/checkout-queue — inline-processed FIFO queue skeleton.
// Atomic: one request at a time via Redis SET NX + FIFO list peek.

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
