import { NextRequest, NextResponse } from 'next/server'
import { getCheckoutEvents } from '@/lib/dev/event-logger'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ traceId: string }> }
) {
  const { traceId } = await params

  if (!traceId) {
    return NextResponse.json(
      { error: 'traceId is required' },
      { status: 400 }
    )
  }

  try {
    const events = await getCheckoutEvents(traceId)
    
    // Reverse to get chronological order (lpush adds to front)
    const chronologicalEvents = events.reverse()

    return NextResponse.json({
      traceId,
      eventCount: chronologicalEvents.length,
      events: chronologicalEvents,
    })
  } catch (error) {
    console.error('[API] Failed to retrieve checkout logs:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve checkout logs' },
      { status: 500 }
    )
  }
}
