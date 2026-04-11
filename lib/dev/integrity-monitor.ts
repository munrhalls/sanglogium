// Development-only data integrity monitor for checkout flow
// Runs only in development - zero production interference

import { Redis } from '@upstash/redis';
import { logCheckoutEvent } from './event-logger';

// Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Development check
const isDevelopment = process.env.NODE_ENV === 'development';

export interface IntegrityViolation {
  correlationId: string;
  type: string;
  description: string;
  timestamp: string;
  details: Record<string, unknown>;
}

/**
 * Check Redis hash integrity for stock reservations
 */
export async function checkStockReservationIntegrity(
  correlationId: string,
  reservationId: string,
  expectedItems: Array<{ productId: string; quantity: number }>
): Promise<boolean> {
  if (!isDevelopment) return true;

  try {
    const reservationData = await redis.hget('reservations', reservationId);

    if (!reservationData) {
      await logIntegrityViolation(correlationId, 'MISSING_RESERVATION',
        `Reservation ${reservationId} not found in Redis`, { reservationId });
      return false;
    }

    // Verify JSON format
    let parsedItems: Array<{ productId: string; quantity: number }>;
    try {
      parsedItems = JSON.parse(reservationData as string);
    } catch {
      await logIntegrityViolation(correlationId, 'INVALID_RESERVATION_FORMAT',
        `Reservation data is not valid JSON`, { reservationId, rawData: reservationData });
      return false;
    }

    // Verify item count matches
    if (parsedItems.length !== expectedItems.length) {
      await logIntegrityViolation(correlationId, 'RESERVATION_COUNT_MISMATCH',
        `Expected ${expectedItems.length} items, got ${parsedItems.length}`,
        { reservationId, expected: expectedItems, actual: parsedItems });
      return false;
    }

    // Verify each item
    for (const expected of expectedItems) {
      const actual = parsedItems.find(item => item.productId === expected.productId);
      if (!actual) {
        await logIntegrityViolation(correlationId, 'MISSING_RESERVATION_ITEM',
          `Product ${expected.productId} missing from reservation`,
          { reservationId, productId: expected.productId });
        return false;
      }
      if (actual.quantity !== expected.quantity) {
        await logIntegrityViolation(correlationId, 'RESERVATION_QUANTITY_MISMATCH',
          `Product ${expected.productId}: expected ${expected.quantity}, got ${actual.quantity}`,
          { reservationId, productId: expected.productId, expected: expected.quantity, actual: actual.quantity });
        return false;
      }
    }

    return true;
  } catch (error) {
    await logIntegrityViolation(correlationId, 'STOCK_CHECK_ERROR',
      `Error checking stock integrity: ${error}`, { reservationId, error: String(error) });
    return false;
  }
}

/**
 * Verify Redis stock levels are not negative
 */
export async function checkStockLevels(
  correlationId: string,
  productIds: string[]
): Promise<boolean> {
  if (!isDevelopment) return true;

  try {
    const stockChecks = await Promise.all(
      productIds.map(async (productId) => {
        const stock = await redis.hget('product_stock', productId);
        const stockLevel = parseInt(stock as string || '0');
        return { productId, stockLevel };
      })
    );

    for (const { productId, stockLevel } of stockChecks) {
      if (stockLevel < 0) {
        await logIntegrityViolation(correlationId, 'NEGATIVE_STOCK_LEVEL',
          `Product ${productId} has negative stock: ${stockLevel}`,
          { productId, stockLevel });
        return false;
      }
    }

    return true;
  } catch (error) {
    await logIntegrityViolation(correlationId, 'STOCK_LEVEL_CHECK_ERROR',
      `Error checking stock levels: ${error}`, { productIds, error: String(error) });
    return false;
  }
}

/**
 * Verify PaymentIntent metadata consistency
 */
export function checkPaymentIntentMetadata(
  correlationId: string,
  paymentIntent: {
    id: string;
    amount: number;
    currency: string;
    metadata?: Record<string, string>;
  },
  expectedMetadata: {
    reservationId?: string;
    sessionId?: string;
  }
): boolean {
  if (!isDevelopment) return true;

  try {
    if (!paymentIntent.metadata) {
      logIntegrityViolation(correlationId, 'MISSING_PAYMENT_METADATA',
        `PaymentIntent ${paymentIntent.id} has no metadata`,
        { paymentIntentId: paymentIntent.id });
      return false;
    }

    // Check reservation ID if expected
    if (expectedMetadata.reservationId) {
      const actualReservationId = paymentIntent.metadata.reservationId;
      if (actualReservationId !== expectedMetadata.reservationId) {
        logIntegrityViolation(correlationId, 'PAYMENT_RESERVATION_MISMATCH',
          `Expected reservation ${expectedMetadata.reservationId}, got ${actualReservationId}`,
          { paymentIntentId: paymentIntent.id, expected: expectedMetadata.reservationId, actual: actualReservationId });
        return false;
      }
    }

    // Check session ID if expected
    if (expectedMetadata.sessionId) {
      const actualSessionId = paymentIntent.metadata.sessionId;
      if (actualSessionId !== expectedMetadata.sessionId) {
        logIntegrityViolation(correlationId, 'PAYMENT_SESSION_MISMATCH',
          `Expected session ${expectedMetadata.sessionId}, got ${actualSessionId}`,
          { paymentIntentId: paymentIntent.id, expected: expectedMetadata.sessionId, actual: actualSessionId });
        return false;
      }
    }

    return true;
  } catch (error) {
    logIntegrityViolation(correlationId, 'PAYMENT_METADATA_CHECK_ERROR',
      `Error checking PaymentIntent metadata: ${error}`, { paymentIntentId: paymentIntent.id, error: String(error) });
    return false;
  }
}

/**
 * Log integrity violation to Redis and event logger
 */
async function logIntegrityViolation(
  correlationId: string,
  type: string,
  description: string,
  details: Record<string, unknown>
): Promise<void> {
  const violation: IntegrityViolation = {
    correlationId,
    type,
    description,
    timestamp: new Date().toISOString(),
    details,
  };

  try {
    // Log to violations list
    await redis.lpush(
      'checkout_integrity_violations',
      JSON.stringify(violation)
    );

    // Keep only 50 violations
    await redis.ltrim('checkout_integrity_violations', 0, 49);

    // Also log as checkout event
    await logCheckoutEvent({
      correlationId,
      slice: 'webhook', // Use webhook as default slice for violations
      event: 'INTEGRITY_VIOLATION',
      data: { type, description, details },
      outcome: 'error',
      error: description,
    });

    console.error(`[DEV] Integrity violation: ${type} - ${description} (${correlationId})`);
  } catch (error) {
    console.error('[DEV] Failed to log integrity violation:', error);
  }
}

/**
 * Get all integrity violations
 */
export async function getIntegrityViolations(): Promise<IntegrityViolation[]> {
  if (!isDevelopment) return [];

  try {
    const violations = await redis.lrange('checkout_integrity_violations', 0, -1);

    return violations.map(v => {
      // Handle both string and object returns from Redis
      if (typeof v === 'string') {
        // Check if it's HTML (error page) instead of JSON
        if (v.startsWith('<!DOCTYPE')) {
          console.error('[DEV] Redis returned HTML instead of JSON in integrity monitor. Check Redis configuration.');
          return null;
        }
        try {
          return JSON.parse(v);
        } catch {
          console.error('[DEV] Failed to parse violation JSON:', v);
          return null;
        }
      } else if (typeof v === 'object' && v !== null) {
        // Redis returned an object directly
        return v;
      }
      return null;
    }).filter(Boolean) as IntegrityViolation[];
  } catch (error) {
    console.error('[DEV] Failed to get integrity violations:', error);
    return [];
  }
}

/**
 * Clear integrity violations (for testing)
 */
export async function clearIntegrityViolations(): Promise<void> {
  if (!isDevelopment) return;

  try {
    await redis.del('checkout_integrity_violations');
    console.log('[DEV] Cleared integrity violations');
  } catch (error) {
    console.error('[DEV] Failed to clear integrity violations:', error);
  }
}
