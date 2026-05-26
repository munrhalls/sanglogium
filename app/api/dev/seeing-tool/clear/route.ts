import { NextResponse } from 'next/server'
import { clearAllCheckoutEvents } from '@/lib/dev/event-logger'

export async function POST() {
  try {
    await clearAllCheckoutEvents()
    
    return NextResponse.json({
      success: true,
      message: 'All checkout events cleared'
    })
  } catch (error) {
    console.error('[API] Failed to clear checkout events:', error)
    return NextResponse.json(
      { error: 'Failed to clear checkout events' },
      { status: 500 }
    )
  }
}
