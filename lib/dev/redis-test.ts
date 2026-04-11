// Development-only Redis connection test
// Runs only in development - zero production interference

import { Redis } from '@upstash/redis';

// Development check
const isDevelopment = process.env.NODE_ENV === 'development';

export async function testRedisConnection(): Promise<{ success: boolean; error?: string }> {
  if (!isDevelopment) {
    return { success: false, error: 'Not in development' };
  }

  try {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });

    // Test simple set/get
    const testKey = 'test_connection_' + Date.now();
    await redis.set(testKey, 'test_value');
    const value = await redis.get(testKey);
    await redis.del(testKey);

    if (value === 'test_value') {
      console.log('[DEV] Redis connection test: SUCCESS');
      return { success: true };
    } else {
      console.error('[DEV] Redis connection test: VALUE MISMATCH', { expected: 'test_value', actual: value });
      return { success: false, error: 'Value mismatch' };
    }
  } catch (error) {
    console.error('[DEV] Redis connection test: ERROR', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
