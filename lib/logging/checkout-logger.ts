/**
 * Unified Checkout Logger with Trace ID Pattern
 * 
 * Provides structured JSON logging across the checkout flow with unified checkoutSessionId (Trace ID).
 * - Production: Uses pino for stdout/stderr + file-based trace storage
 * - Development: Uses pino + file-based trace storage
 * 
 * Usage:
 *   import { getCheckoutLogger } from '@/lib/logging/checkout-logger'
 *   const logger = getCheckoutLogger(checkoutSessionId)
 *   logger.info('checkout_init', { items: basket })
 */

import pino from 'pino';
import { resetTrace, appendTraceEvent } from './trace-logger';

// Pino instance for production logging
// Note: pino-pretty transport not used in Next.js 15 server components to avoid worker thread issues
// Logs output as JSON in all environments - use external tooling for pretty printing if needed
const pinoLogger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

export interface CheckoutLogContext {
  traceId: string;
  step: string;
  data?: Record<string, unknown>;
  error?: Error | unknown;
}

/**
 * Checkout logger instance with bound trace ID
 */
export class CheckoutLogger {
  private initialized = false;

  constructor(private traceId: string) {}

  /**
   * Ensure trace file is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      try {
        await resetTrace();
        this.initialized = true;
      } catch (err) {
        console.error('[TRACE] Failed to initialize trace:', err);
      }
    }
  }

  /**
   * Log info event
   */
  async info(step: string, data?: Record<string, unknown>): Promise<void> {
    await this.ensureInitialized();
    
    const context: CheckoutLogContext = { traceId: this.traceId, step, data };
    
    // Production: pino structured log
    pinoLogger.info(context, `[${this.traceId}] ${step}`);
    
    // File-based trace storage
    try {
      await appendTraceEvent(step, data);
    } catch (err) {
      console.error('[TRACE] Failed to append event:', err);
    }
  }

  /**
   * Log error event
   */
  async error(step: string, error: Error | unknown, data?: Record<string, unknown>): Promise<void> {
    await this.ensureInitialized();
    
    const errorObj: Record<string, unknown> = error instanceof Error ? {
      message: error.message,
      stack: error.stack,
      name: error.name,
    } : { error };

    const context: CheckoutLogContext = { 
      traceId: this.traceId, 
      step, 
      data,
      error: errorObj,
    };
    
    // Production: pino structured error log
    pinoLogger.error(context, `[${this.traceId}] ${step} - ERROR`);
    
    // File-based trace storage
    try {
      await appendTraceEvent(step, data, error);
    } catch (err) {
      console.error('[TRACE] Failed to append error event:', err);
    }
  }

  /**
   * Log warning event
   */
  async warn(step: string, data?: Record<string, unknown>): Promise<void> {
    await this.ensureInitialized();
    
    const context: CheckoutLogContext = { traceId: this.traceId, step, data };
    
    pinoLogger.warn(context, `[${this.traceId}] ${step} - WARNING`);
    
    // File-based trace storage
    try {
      await appendTraceEvent(step, data);
    } catch (err) {
      console.error('[TRACE] Failed to append warning event:', err);
    }
  }
}

/**
 * Get or create checkout logger with trace ID
 * If no traceId provided, generates a new one (use only at checkout start)
 * Trace file is initialized lazily on first log call
 */
export function getCheckoutLogger(traceId?: string): CheckoutLogger {
  const id = traceId || generateCheckoutSessionId();
  return new CheckoutLogger(id);
}

/**
 * Generate unique checkout session ID (Trace ID)
 * Format: chk_<timestamp>_<random>
 */
export function generateCheckoutSessionId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `chk_${timestamp}_${random}`;
}
