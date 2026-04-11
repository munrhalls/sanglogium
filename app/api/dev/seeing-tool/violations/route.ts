// Development-only API for integrity violations
// Runs only in development - zero production interference

import { NextRequest, NextResponse } from 'next/server';
import { getIntegrityViolations, clearIntegrityViolations } from '@/lib/dev/integrity-monitor';

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
    const violations = await getIntegrityViolations();
    
    return NextResponse.json({
      violations,
      total: violations.length
    });
  } catch (error) {
    console.error('[DEV] Failed to get integrity violations:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve violations' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  // Block access in production
  if (!isDevelopment) {
    return NextResponse.json(
      { error: 'Available in development only' },
      { status: 403 }
    );
  }

  try {
    await clearIntegrityViolations();
    
    return NextResponse.json({
      message: 'Integrity violations cleared'
    });
  } catch (error) {
    console.error('[DEV] Failed to clear integrity violations:', error);
    return NextResponse.json(
      { error: 'Failed to clear violations' },
      { status: 500 }
    );
  }
}
