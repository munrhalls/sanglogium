import { logEvent } from '@/platform/utils/eventLogger';

export interface CheckoutEvent {
  timestamp: string;
  correlationId: string;
  slice: "basket-address" | "address-submit" | "payment-init" | "payment-submit" | "webhook" | "order-create" | "success-page";
  event: string;
  data: Record<string, unknown>;
  outcome: "success" | "error";
  error?: Record<string, unknown> | string;
}

export async function logCheckoutEvent(event: Omit<CheckoutEvent, 'timestamp'>): Promise<void> {
  return logEvent(event);
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
