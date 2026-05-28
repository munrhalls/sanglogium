// Checkout event logger for composite log retrieval
// Stores logs in Redis keyed by traceId for complete journey retrieval
// Works in both development and production

import { Redis } from '@upstash/redis';

// Lazy Redis client initialization to prevent build-time failures
let redis: Redis | null = null;
let redisUnavailable = false;

export function getRedis(): Redis {
  if (redis) return redis;
  if (redisUnavailable) {
    throw new Error('Redis is unavailable (previously failed to connect)');
  }

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    redisUnavailable = true;
    throw new Error(
      'UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set for event logging'
    );
  }

  redis = new Redis({ url, token });
  return redis;
}

/** Return true if Redis is configured and available */
export function isRedisAvailable(): boolean {
  return !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN && !redisUnavailable;
}

export interface CheckoutEvent {
  timestamp: string;
  correlationId: string;
  slice: "basket-address" | "address-submit" | "payment-init" | "payment-submit" | "webhook";
  event: string;
  data: Record<string, unknown>;
  outcome: "success" | "error";
  error?: Record<string, unknown> | string;
}

export interface LogEvent {
  timestamp: string;
  correlationId: string;
  slice: string;
  event: string;
  data: Record<string, unknown>;
  outcome: "success" | "error";
  error?: Record<string, unknown> | string;
}

/**
 * Generic event logger — works for any slice/feature.
 * Gracefully falls back to console when Redis is unavailable.
 */
export async function logEvent(event: Omit<LogEvent, 'timestamp'>): Promise<void> {
  const fullEvent: LogEvent = {
    ...event,
    timestamp: new Date().toISOString(),
  };

  if (!isRedisAvailable()) {
    console.log(`[LOG][fallback] ${fullEvent.slice}:${fullEvent.event} (${fullEvent.correlationId})`, JSON.stringify(fullEvent.data));
    return;
  }

  try {
    await getRedis().lpush(
      `checkout_events:${fullEvent.correlationId}`,
      JSON.stringify(fullEvent)
    );
    await getRedis().expire(`checkout_events:${fullEvent.correlationId}`, 86400);

    const recentEvent = {
      correlationId: fullEvent.correlationId,
      timestamp: fullEvent.timestamp,
      slice: fullEvent.slice,
      event: fullEvent.event,
      outcome: fullEvent.outcome,
    };
    await getRedis().lpush('checkout_events:recent', JSON.stringify(recentEvent));
    await getRedis().ltrim('checkout_events:recent', 0, 99);

    console.log(`[LOG] ${fullEvent.slice}:${fullEvent.event} (${fullEvent.correlationId})`);
  } catch (error) {
    console.error('[LOG] Failed to log event:', error);
  }
}

/**
 * Legacy checkout-specific wrapper — delegates to generic logEvent.
 * Kept for backward compatibility with existing checkout code.
 */
export async function logCheckoutEvent(event: Omit<CheckoutEvent, 'timestamp'>): Promise<void> {
  return logEvent(event as Omit<LogEvent, 'timestamp'>);
}

/**
 * Get all events for a specific correlation ID (traceId)
 * Returns array of events in chronological order
 */
export async function getCheckoutEvents(correlationId: string): Promise<CheckoutEvent[]> {
  try {
    const events = await getRedis().lrange(`checkout_events:${correlationId}`, 0, -1);

    return events.map(event => {
      // Handle both string and object returns from Redis
      if (typeof event === 'string') {
        // Check if it's HTML (error page) instead of JSON
        if (event.startsWith('<!DOCTYPE')) {
          console.error('[LOG] Redis returned HTML instead of JSON. Check Redis configuration.');
          return null;
        }
        try {
          return JSON.parse(event);
        } catch {
          console.error('[LOG] Failed to parse event JSON:', event);
          return null;
        }
      } else if (typeof event === 'object' && event !== null) {
        // Redis returned an object directly
        return event;
      }
      return null;
    }).filter(Boolean) as CheckoutEvent[];
  } catch (error) {
    console.error('[LOG] Failed to get checkout events:', error);
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
  try {
    const events = await getRedis().lrange('checkout_events:recent', 0, -1);

    return events.map(event => {
      // Handle both string and object returns from Redis
      if (typeof event === 'string') {
        // Check if it's HTML (error page) instead of JSON
        if (event.startsWith('<!DOCTYPE')) {
          console.error('[LOG] Redis returned HTML instead of JSON in recent events. Check Redis configuration.');
          return null;
        }
        try {
          return JSON.parse(event);
        } catch {
          console.error('[LOG] Failed to parse recent event JSON:', event);
          return null;
        }
      } else if (typeof event === 'object' && event !== null) {
        // Redis returned an object directly
        return event;
      }
      return null;
    }).filter(Boolean);
  } catch (error) {
    console.error('[LOG] Failed to get recent checkout events:', error);
    return [];
  }
}

/**
 * Clear events for a specific correlation ID (for testing)
 */
export async function clearCheckoutEvents(correlationId: string): Promise<void> {
  try {
    await getRedis().del(`checkout_events:${correlationId}`);
    console.log(`[LOG] Cleared events for: ${correlationId}`);
  } catch (error) {
    console.error('[LOG] Failed to clear checkout events:', error);
  }
}

/**
 * Generate generic trace ID for any journey/feature
 * Format: tr_<timestamp>_<random>
 */
export function generateTraceId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `tr_${timestamp}_${random}`;
}

/**
 * Generate unique checkout session ID (Trace ID)
 * Format: chk_<timestamp>_<random>
 * Kept for backward compatibility.
 */
export function generateCheckoutSessionId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `chk_${timestamp}_${random}`;
}

/**
 * Clear all checkout events from Redis (development only)
 * Clears both individual trace lists and the recent events list
 */
export async function clearAllCheckoutEvents(): Promise<void> {
  try {
    // Clear the recent events list
    await getRedis().del('checkout_events:recent');

    // Find all checkout_events:* keys and delete them
    const keys = await getRedis().keys('checkout_events:*');
    if (keys.length > 0) {
      await getRedis().del(...keys);
    }

    console.log(`[LOG] Cleared all checkout events (${keys.length} traces)`);
  } catch (error) {
    console.error('[LOG] Failed to clear all checkout events:', error);
  }
}
