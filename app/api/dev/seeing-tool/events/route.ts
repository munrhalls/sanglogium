// Development-only API for checkout event queries
// Runs only in development - zero production interference

import { NextRequest, NextResponse } from 'next/server';
import { getCheckoutEvents } from '@/lib/dev/event-logger';

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
    const { searchParams } = new URL(request.url);
    const idempotencyKey = searchParams.get('idempotencyKey');
    const slice = searchParams.get('slice');

    if (!idempotencyKey) {
      return NextResponse.json(
        { error: 'idempotencyKey parameter is required' },
        { status: 400 }
      );
    }

    const events = await getCheckoutEvents(idempotencyKey);
    
    // Filter by slice if specified
    const filteredEvents = slice 
      ? events.filter(event => event.slice === slice)
      : events;

    return NextResponse.json({
      correlationId: idempotencyKey,
      events: filteredEvents,
      total: filteredEvents.length
    });
  } catch (error) {
    console.error('[DEV] Failed to get checkout events:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve events' },
      { status: 500 }
    );
  }
}
