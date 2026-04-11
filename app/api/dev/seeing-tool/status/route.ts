// Development-only API for Redis status check
// Runs only in development - zero production interference

import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

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
    // Test Redis connection server-side
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });

    // Simple ping test
    await redis.ping();
    
    return NextResponse.json({
      success: true,
      message: 'Redis connection successful'
    });
  } catch (error) {
    console.error('[DEV] Redis connection test failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
