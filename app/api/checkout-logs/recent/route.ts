import { NextResponse } from 'next/server'
import { getRecentCheckoutEvents } from '@/lib/dev/event-logger'

export async function GET() {
  try {
    const events = await getRecentCheckoutEvents()
    
    return NextResponse.json({
      count: events.length,
      events,
    })
  } catch (error) {
    console.error('[API] Failed to retrieve recent checkout logs:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve recent checkout logs' },
      { status: 500 }
    )
  }
}
