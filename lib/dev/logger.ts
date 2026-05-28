// Unified frontend logger — lightweight, e2e-trace aware, LOG_LEVEL gated
// Replaces scattered console.log with a single import.
// When a traceId is set, logs are correlated with backend events.

let activeTraceId: string | null = null;

/** Set the active trace ID for e2e correlation */
export function setTraceId(traceId: string): void {
  activeTraceId = traceId;
}

/** Get the current active trace ID */
export function getTraceId(): string | null {
  return activeTraceId;
}

/** Clear the active trace ID */
export function clearTraceId(): void {
  activeTraceId = null;
}

type LogLevel = 'log' | 'warn' | 'error';
const LEVELS: Record<LogLevel, number> = { log: 0, warn: 1, error: 2 };
const currentLevel = (process.env.LOG_LEVEL as LogLevel) || 'warn';

function shouldEmit(level: LogLevel): boolean {
  return LEVELS[level] >= LEVELS[currentLevel];
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  slice: string;
  event: string;
  message?: string;
  data?: Record<string, unknown>;
  traceId?: string | null;
}

function buildEntry(
  level: LogLevel,
  slice: string,
  event: string,
  message?: string,
  data?: Record<string, unknown>
): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    level,
    slice,
    event,
    message,
    data,
    traceId: activeTraceId,
  };
}

function emit(entry: LogEntry): void {
  if (!shouldEmit(entry.level)) return;

  const prefix = `[${entry.slice}:${entry.event}]`;
  const trace = entry.traceId ? ` (${entry.traceId})` : '';

  switch (entry.level) {
    case 'warn':
      console.warn(`${prefix}${trace}`, entry.message ?? '', entry.data ?? '');
      break;
    case 'error':
      console.error(`${prefix}${trace}`, entry.message ?? '', entry.data ?? '');
      break;
    default:
      console.log(`${prefix}${trace}`, entry.message ?? '', entry.data ?? '');
  }
}

/** Log an informational event */
export function log(slice: string, event: string, message?: string, data?: Record<string, unknown>): void {
  emit(buildEntry('log', slice, event, message, data));
}

/** Log a warning */
export function warn(slice: string, event: string, message?: string, data?: Record<string, unknown>): void {
  emit(buildEntry('warn', slice, event, message, data));
}

/** Log an error */
export function error(slice: string, event: string, message?: string, data?: Record<string, unknown>): void {
  emit(buildEntry('error', slice, event, message, data));
}
