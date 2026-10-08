/**
 * Generate unique checkout session ID (Trace ID)
 * Format: chk_<timestamp>_<random>
 */
export function generateCheckoutSessionId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `chk_${timestamp}_${random}`;
}
