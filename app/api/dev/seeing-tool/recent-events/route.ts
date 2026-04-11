// Development-only API for recent checkout events
// Runs only in development - zero production interference

import { NextRequest, NextResponse } from 'next/server';
import { getRecentCheckoutEvents } from '@/lib/dev/event-logger';

// Development check
const isDevelopment = process.env.NODE_ENV === 'development';

export async function GET(request: NextRequest) {
  // Block access in production
  if (!isDevelopment) {
    return NextResponse.json(
      { error: 'Available in development only' },
      { status: 403 }
    );
  }

  try {
    const events = await getRecentCheckoutEvents();
    
    return NextResponse.json({
      events,
      total: events.length
    });
  } catch (error) {
    console.error('[DEV] Failed to get recent events:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve events' },
      { status: 500 }
    );
  }
}
