// Lightweight event logger: console-only, gated by LOG_LEVEL. Slices wrap it with their own event types.

type LogLevel = 'log' | 'warn' | 'error';
const LEVELS: Record<LogLevel, number> = { log: 0, warn: 1, error: 2 };
const currentLevel = (process.env.LOG_LEVEL as LogLevel) || 'warn';

function shouldEmit(level: LogLevel): boolean {
  return LEVELS[level] >= LEVELS[currentLevel];
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
