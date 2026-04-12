// Guest Checkout Inventory Reservation - Structured Logging & Metrics
// Matches StructuredLogger, RequestContextLogger, MetricsCollector from monitoring-logging tests

import { createWriteStream } from 'fs'
import { LogLevel, LogCategory, type LogEntry } from './types'

// ============================================================================
// StructuredLogger
// ============================================================================

export interface LoggerConfig {
  level: LogLevel
  format: 'json' | 'text'
  filePath?: string
  maxSize?: number
  maxFiles?: number
}

export class StructuredLogger {
  private config: LoggerConfig
  private logFile?: NodeJS.WritableStream
  private metrics = new Map<string, number>()
  private bytesWritten = 0

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: LogLevel.INFO,
      format: 'json',
      ...config
    }

    if (this.config.filePath) {
      this.logFile = createWriteStream(this.config.filePath, { flags: 'a' })
    }
  }

  log(entry: Omit<LogEntry, 'timestamp'>): void {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      ...entry
    }

    // Filter by level
    if (logEntry.level > this.config.level) {
      return
    }

    // Format based on configuration
    const formatted = this.config.format === 'json'
      ? JSON.stringify(logEntry)
      : this.formatAsText(logEntry)

    // Handle rotation
    if (this.config.maxSize && this.bytesWritten + formatted.length > this.config.maxSize) {
      this.rotate()
    }

    // Output
    if (this.logFile) {
      this.logFile.write(formatted + '\n')
      this.bytesWritten += formatted.length + 1
    } else {
      console.log(formatted)
    }

    // Update metrics
    const key = `${logEntry.category}:${logEntry.level}`
    this.metrics.set(key, (this.metrics.get(key) || 0) + 1)
  }

  private formatAsText(entry: LogEntry): string {
    const timestamp = entry.timestamp
    const level = LogLevel[entry.level].padEnd(5)
    const category = entry.category.padEnd(12)
    const component = entry.component.padEnd(20)
    const message = entry.message

    let formatted = `${timestamp} ${level} ${category} [${component}] ${message}`

    if (entry.requestId) {
      formatted += ` (req: ${entry.requestId})`
    }

    if (entry.duration) {
      formatted += ` (${entry.duration}ms)`
    }

    if (entry.error) {
      formatted += ` ERROR: ${entry.error.name}: ${entry.error.message}`
    }

    return formatted
  }

  private rotate(): void {
    // Close current file and reset counter
    if (this.logFile) {
      this.logFile.end()
      if (this.config.filePath) {
        this.logFile = createWriteStream(this.config.filePath, { flags: 'w' })
      }
      this.bytesWritten = 0
    }
  }

  error(message: string, context?: Partial<LogEntry>): void {
    this.log({ level: LogLevel.ERROR, message, component: 'unknown', category: LogCategory.SYSTEM, ...context })
  }

  warn(message: string, context?: Partial<LogEntry>): void {
    this.log({ level: LogLevel.WARN, message, component: 'unknown', category: LogCategory.SYSTEM, ...context })
  }

  info(message: string, context?: Partial<LogEntry>): void {
    this.log({ level: LogLevel.INFO, message, component: 'unknown', category: LogCategory.SYSTEM, ...context })
  }

  debug(message: string, context?: Partial<LogEntry>): void {
    if (this.config.level >= LogLevel.DEBUG) {
      this.log({ level: LogLevel.DEBUG, message, component: 'unknown', category: LogCategory.SYSTEM, ...context })
    }
  }

  getMetrics(): Map<string, number> {
    return this.metrics
  }

  close(): void {
    if (this.logFile) {
      this.logFile.end()
    }
  }
}

// ============================================================================
// RequestContextLogger
// ============================================================================

export class RequestContextLogger {
  private logger: StructuredLogger
  private requestId: string
  private component: string

  constructor(logger: StructuredLogger, requestId: string, component: string) {
    this.logger = logger
    this.requestId = requestId
    this.component = component
  }

  info(message: string, context?: Partial<Omit<LogEntry, 'timestamp' | 'requestId' | 'component'>>): void {
    this.logger.info(message, { requestId: this.requestId, component: this.component, ...context })
  }

  error(message: string, context?: Partial<Omit<LogEntry, 'timestamp' | 'requestId' | 'component'>>): void {
    this.logger.error(message, { requestId: this.requestId, component: this.component, ...context })
  }

  warn(message: string, context?: Partial<Omit<LogEntry, 'timestamp' | 'requestId' | 'component'>>): void {
    this.logger.warn(message, { requestId: this.requestId, component: this.component, ...context })
  }

  debug(message: string, context?: Partial<Omit<LogEntry, 'timestamp' | 'requestId' | 'component'>>): void {
    this.logger.debug(message, { requestId: this.requestId, component: this.component, ...context })
  }
}

// ============================================================================
// MetricsCollector
// ============================================================================

export class MetricsCollector {
  private counters = new Map<string, number>()
  private gauges = new Map<string, number>()
  private histograms = new Map<string, number[]>()

  increment(metric: string, value: number = 1): void {
    this.counters.set(metric, (this.counters.get(metric) || 0) + value)
  }

  gauge(metric: string, value: number): void {
    this.gauges.set(metric, value)
  }

  histogram(metric: string, value: number): void {
    if (!this.histograms.has(metric)) {
      this.histograms.set(metric, [])
    }
    this.histograms.get(metric)!.push(value)
  }

  getMetrics(): Record<string, unknown> {
    const result: Record<string, unknown> = {}

    // Counters
    result.counters = Object.fromEntries(this.counters)

    // Gauges
    result.gauges = Object.fromEntries(this.gauges)

    // Histograms (with percentiles)
    const histograms: Record<string, { count: number; min: number; max: number; avg: number }> = {}
    for (const [name, values] of this.histograms) {
      const count = values.length
      const min = Math.min(...values)
      const max = Math.max(...values)
      const avg = values.reduce((a, b) => a + b, 0) / count
      histograms[name] = { count, min, max, avg }
    }
    result.histograms = histograms

    return result
  }

  reset(): void {
    this.counters.clear()
    this.gauges.clear()
    this.histograms.clear()
  }
}

// ============================================================================
// Singleton Instances
// ============================================================================

let loggerInstance: StructuredLogger | null = null
let metricsInstance: MetricsCollector | null = null

export function getLogger(): StructuredLogger {
  if (!loggerInstance) {
    const level = process.env.GUEST_CHECKOUT_LOG_LEVEL === 'debug' ? LogLevel.DEBUG
      : process.env.GUEST_CHECKOUT_LOG_LEVEL === 'warn' ? LogLevel.WARN
      : process.env.GUEST_CHECKOUT_LOG_LEVEL === 'error' ? LogLevel.ERROR
      : LogLevel.INFO
    const format = (process.env.GUEST_CHECKOUT_LOG_FORMAT as 'json' | 'text') || 'json'

    loggerInstance = new StructuredLogger({ level, format })
  }
  return loggerInstance
}

export function getMetrics(): MetricsCollector {
  if (!metricsInstance) {
    metricsInstance = new MetricsCollector()
  }
  return metricsInstance
}
