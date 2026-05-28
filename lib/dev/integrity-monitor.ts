// Development-only data integrity monitor for checkout flow
// Runs only in development - zero production interference
// Console-only logging, no persistent storage.

const isDevelopment = process.env.NODE_ENV === 'development';

export interface IntegrityViolation {
  correlationId: string;
  type: string;
  description: string;
  timestamp: string;
  details: Record<string, unknown>;
}

/**
 * Check Redis hash integrity for stock reservations.
 * Stubbed — Redis removed. Logs warning in dev, always returns true.
 */
export async function checkStockReservationIntegrity(
  correlationId: string,
  reservationId: string,
  expectedItems: Array<{ productId: string; quantity: number }>
): Promise<boolean> {
  if (!isDevelopment) return true;
  console.warn('[DEV] checkStockReservationIntegrity requires Redis (removed) — skipping');
  return true;
}

/**
 * Verify Redis stock levels are not negative.
 * Stubbed — Redis removed. Logs warning in dev, always returns true.
 */
export async function checkStockLevels(
  correlationId: string,
  productIds: string[]
): Promise<boolean> {
  if (!isDevelopment) return true;
  console.warn('[DEV] checkStockLevels requires Redis (removed) — skipping');
  return true;
}

/**
 * Verify PaymentIntent metadata consistency.
 * This does NOT require Redis — it checks metadata directly.
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
      console.error(`[DEV] Integrity: MISSING_PAYMENT_METADATA — PaymentIntent ${paymentIntent.id} has no metadata (${correlationId})`);
      return false;
    }

    if (expectedMetadata.reservationId) {
      const actual = paymentIntent.metadata.reservationId;
      if (actual !== expectedMetadata.reservationId) {
        console.error(`[DEV] Integrity: PAYMENT_RESERVATION_MISMATCH — Expected ${expectedMetadata.reservationId}, got ${actual} (${correlationId})`);
        return false;
      }
    }

    if (expectedMetadata.sessionId) {
      const actual = paymentIntent.metadata.sessionId;
      if (actual !== expectedMetadata.sessionId) {
        console.error(`[DEV] Integrity: PAYMENT_SESSION_MISMATCH — Expected ${expectedMetadata.sessionId}, got ${actual} (${correlationId})`);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error(`[DEV] Integrity: PAYMENT_METADATA_CHECK_ERROR — ${error} (${correlationId})`);
    return false;
  }
}

/**
 * Stubbed — no persistent storage for violations.
 */
export async function getIntegrityViolations(): Promise<IntegrityViolation[]> {
  if (!isDevelopment) return [];
  return [];
}

/**
 * Stubbed — no persistent storage for violations.
 */
export async function clearIntegrityViolations(): Promise<void> {
  if (!isDevelopment) return;
}
