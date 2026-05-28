// Lightweight event logger — console-only, no persistent storage
// Gated by LOG_LEVEL env var. No Redis, no disk writes.

type LogLevel = 'log' | 'warn' | 'error';
const LEVELS: Record<LogLevel, number> = { log: 0, warn: 1, error: 2 };
const currentLevel = (process.env.LOG_LEVEL as LogLevel) || 'warn';

function shouldEmit(level: LogLevel): boolean {
  return LEVELS[level] >= LEVELS[currentLevel];
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
 * Generic event logger — console-only, gated by LOG_LEVEL.
 */
export async function logEvent(event: Omit<LogEvent, 'timestamp'>): Promise<void> {
  const level: LogLevel = event.outcome === 'error' ? 'error' : 'log';
  if (!shouldEmit(level)) return;

  const fullEvent: LogEvent = {
    ...event,
    timestamp: new Date().toISOString(),
  };

  const msg = `[LOG] ${fullEvent.slice}:${fullEvent.event} (${fullEvent.correlationId}) ${JSON.stringify(fullEvent.data)}`;
  if (level === 'error') {
    console.error(msg);
  } else {
    console.log(msg);
  }
}

/**
 * Legacy checkout-specific wrapper — delegates to generic logEvent.
 */
export async function logCheckoutEvent(event: Omit<CheckoutEvent, 'timestamp'>): Promise<void> {
  return logEvent(event as Omit<LogEvent, 'timestamp'>);
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
