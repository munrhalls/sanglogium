// Development-only event logger for checkout flow
// Runs only in development - zero production interference

import { Redis } from '@upstash/redis';

// Lazy Redis client initialization to prevent build-time failures
let redis: Redis | null = null;

function getRedis(): Redis {
  if (redis) return redis;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    throw new Error(
      'UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set for event logging'
    );
  }

  redis = new Redis({ url, token });
  return redis;
}

// Development check
const isDevelopment = process.env.NODE_ENV === 'development';

export interface CheckoutEvent {
  timestamp: string;
  correlationId: string;
  slice: "basket-address" | "address-submit" | "payment-init" | "payment-submit" | "webhook";
  event: string;
  data: Record<string, unknown>;
  outcome: "success" | "error";
  error?: Record<string, unknown> | string;
}

/**
 * Log checkout event to Redis list (development only)
 * Uses idempotencyKey as correlationId for flow tracing
 */
export async function logCheckoutEvent(event: Omit<CheckoutEvent, 'timestamp'>): Promise<void> {
  if (!isDevelopment) {
    return; // Silently skip in production
  }

  const fullEvent: CheckoutEvent = {
    ...event,
    timestamp: new Date().toISOString(),
  };

  try {
    // Append to Redis list for this correlation
    await getRedis().lpush(
      `checkout_events:${fullEvent.correlationId}`,
      JSON.stringify(fullEvent)
    );

    // Set TTL to prevent memory leaks (24 hours)
    await getRedis().expire(`checkout_events:${fullEvent.correlationId}`, 86400);

    // Also add to global list for recent events view
    const recentEvent = {
      correlationId: fullEvent.correlationId,
      timestamp: fullEvent.timestamp,
      slice: fullEvent.slice,
      event: fullEvent.event,
      outcome: fullEvent.outcome,
    };
    await getRedis().lpush(
      'checkout_events:recent',
      JSON.stringify(recentEvent)
    );

    // Keep only 100 recent events
    await getRedis().ltrim('checkout_events:recent', 0, 99);

    console.log(`[DEV] Checkout event logged: ${fullEvent.slice}:${fullEvent.event} (${fullEvent.correlationId})`);
  } catch (error) {
    console.error('[DEV] Failed to log checkout event:', error);
  }
}

/**
 * Get all events for a specific correlation ID
 */
export async function getCheckoutEvents(correlationId: string): Promise<CheckoutEvent[]> {
  if (!isDevelopment) {
    return [];
  }

  try {
    const events = await getRedis().lrange(`checkout_events:${correlationId}`, 0, -1);

    return events.map(event => {
      // Handle both string and object returns from Redis
      if (typeof event === 'string') {
        // Check if it's HTML (error page) instead of JSON
        if (event.startsWith('<!DOCTYPE')) {
          console.error('[DEV] Redis returned HTML instead of JSON. Check Redis configuration.');
          return null;
        }
        try {
          return JSON.parse(event);
        } catch {
          console.error('[DEV] Failed to parse event JSON:', event);
          return null;
        }
      } else if (typeof event === 'object' && event !== null) {
        // Redis returned an object directly
        return event;
      }
      return null;
    }).filter(Boolean) as CheckoutEvent[];
  } catch (error) {
    console.error('[DEV] Failed to get checkout events:', error);
    return [];
  }
}

/**
 * Get recent checkout events across all flows
 */
export async function getRecentCheckoutEvents(): Promise<Array<{
  correlationId: string;
  timestamp: string;
  slice: string;
  event: string;
  outcome: string;
}>> {
  if (!isDevelopment) {
    return [];
  }

  try {
    const events = await getRedis().lrange('checkout_events:recent', 0, -1);

    return events.map(event => {
      // Handle both string and object returns from Redis
      if (typeof event === 'string') {
        // Check if it's HTML (error page) instead of JSON
        if (event.startsWith('<!DOCTYPE')) {
          console.error('[DEV] Redis returned HTML instead of JSON in recent events. Check Redis configuration.');
          return null;
        }
        try {
          return JSON.parse(event);
        } catch {
          console.error('[DEV] Failed to parse recent event JSON:', event);
          return null;
        }
      } else if (typeof event === 'object' && event !== null) {
        // Redis returned an object directly
        return event;
      }
      return null;
    }).filter(Boolean);
  } catch (error) {
    console.error('[DEV] Failed to get recent checkout events:', error);
    return [];
  }
}

/**
 * Clear events for a specific correlation ID (for testing)
 */
export async function clearCheckoutEvents(correlationId: string): Promise<void> {
  if (!isDevelopment) {
    return;
  }

  try {
    await getRedis().del(`checkout_events:${correlationId}`);
    console.log(`[DEV] Cleared events for: ${correlationId}`);
  } catch (error) {
    console.error('[DEV] Failed to clear checkout events:', error);
  }
}
