import { NextResponse } from 'next/server'
import { getRedis } from '@/lib/dev/event-logger'

export async function GET() {
  try {
    const redis = getRedis()

    // Get all checkout_events:* keys
    const keys = await redis.keys('checkout_events:*')

    // Fetch all traces
    const traces = await Promise.all(
      keys.map(async (key: string) => {
        const events = await redis.lrange(key, 0, -1)
        const correlationId = key.replace('checkout_events:', '')

        const parsedEvents = events.map((event: unknown) => {
          if (typeof event === 'string') {
            if (event.startsWith('<!DOCTYPE')) {
              return null
            }
            try {
              return JSON.parse(event)
            } catch {
              return null
            }
          } else if (typeof event === 'object' && event !== null) {
            return event
          }
          return null
        }).filter(Boolean)

        return {
          traceId: correlationId,
          eventCount: parsedEvents.length,
          events: parsedEvents.reverse(), // Chronological order
        }
      })
    )

    const allTracesData = {
      totalTraces: traces.length,
      totalEvents: traces.reduce((sum: number, trace: { eventCount: number }) => sum + trace.eventCount, 0),
      traces,
      exportedAt: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      traces: allTracesData
    })
  } catch (error) {
    console.error('[API] Failed to get all traces:', error)
    return NextResponse.json(
      { error: 'Failed to get all traces' },
      { status: 500 }
    )
  }
}
