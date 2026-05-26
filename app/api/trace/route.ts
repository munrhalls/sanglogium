import { NextRequest, NextResponse } from 'next/server';
import { logCheckoutEvent } from '@/lib/dev/event-logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { traceId, step, data } = body;

    if (!traceId) {
      return NextResponse.json({ error: 'traceId is required' }, { status: 400 });
    }

    if (!step) {
      return NextResponse.json({ error: 'step is required' }, { status: 400 });
    }

    await logCheckoutEvent({
      correlationId: traceId,
      slice: 'payment-submit',
      event: step,
      data: data || {},
      outcome: 'success',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[TRACE API] Error:', error);
    return NextResponse.json({ error: 'Failed to log event' }, { status: 500 });
  }
}
