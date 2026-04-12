import { test, expect } from '@playwright/test'
import { createWriteStream, readFileSync, unlinkSync, existsSync } from 'fs'
import { join } from 'path'

// Log levels and categories based on PRD
enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

enum LogCategory {
  SYSTEM = 'system',
  QUEUE = 'queue',
  RESERVATION = 'reservation',
  API = 'api',
  REDIS = 'redis',
  STRIPE = 'stripe',
  PERFORMANCE = 'performance',
  SECURITY = 'security'
}

interface LogEntry {
  timestamp: string
  level: LogLevel
  category: LogCategory
  message: string
  requestId?: string
  reservationToken?: string
  userId?: string
  component: string
  duration?: number
  error?: {
    name: string
    message: string
    stack?: string
    code?: string
  }
  metadata?: Record<string, unknown>
  tags?: string[]
}

// Structured logger implementation
class StructuredLogger {
  private config: {
    level: LogLevel
    format: 'json' | 'text'
    filePath?: string
    maxSize?: number
    maxFiles?: number
  }
  private logFile?: NodeJS.WritableStream
  private metrics = new Map<string, number>()

  constructor(config: Partial<StructuredLogger['config']> = {}) {
    this.config = {
      level: LogLevel.INFO,
      format: 'json',
      ...config
    }

    if (this.config.filePath) {
      this.logFile = createWriteStream(this.config.filePath, { flags: 'a' })
    }
  }

  private log(entry: Omit<LogEntry, 'timestamp'>): void {
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

    // Output
    if (this.logFile) {
      this.logFile.write(formatted + '\n')
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

  error(message: string, context?: Partial<LogEntry>): void {
    this.log({ level: LogLevel.ERROR, message, ...context })
  }

  warn(message: string, context?: Partial<LogEntry>): void {
    this.log({ level: LogLevel.WARN, message, ...context })
  }

  info(message: string, context?: Partial<LogEntry>): void {
    this.log({ level: LogLevel.INFO, message, ...context })
  }

  debug(message: string, context?: Partial<LogEntry>): void {
    if (this.config.level >= LogLevel.DEBUG) {
      this.log({ level: LogLevel.DEBUG, message, ...context })
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

// Request context logger
class RequestContextLogger {
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

// Metrics collector
class MetricsCollector {
  private metrics = new Map<string, number>()
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
}

test.describe('Monitoring and Logging', () => {
  let logger: StructuredLogger
  let metrics: MetricsCollector
  let logFilePath: string

  test.beforeEach(() => {
    logFilePath = join(process.cwd(), 'test.log')
    logger = new StructuredLogger({
      level: LogLevel.DEBUG,
      format: 'json',
      filePath: logFilePath
    })
    metrics = new MetricsCollector()
  })

  test.afterEach(() => {
    logger.close()
    if (existsSync(logFilePath)) {
      unlinkSync(logFilePath)
    }
  })

  test('Log Level Filtering', async () => {
    // Create logger with INFO level
    const infoLogger = new StructuredLogger({
      level: LogLevel.INFO,
      format: 'json',
      filePath: logFilePath
    })

    // Log at different levels
    infoLogger.error('Error message', { category: LogCategory.SYSTEM, component: 'test' })
    infoLogger.warn('Warning message', { category: LogCategory.SYSTEM, component: 'test' })
    infoLogger.info('Info message', { category: LogCategory.SYSTEM, component: 'test' })
    infoLogger.debug('Debug message', { category: LogCategory.SYSTEM, component: 'test' })

    infoLogger.close()

    // Verify log file contents
    const logContent = readFileSync(logFilePath, 'utf8')
    const lines = logContent.trim().split('\n')

    expect(lines).toHaveLength(3) // ERROR, WARN, INFO (not DEBUG)

    const entries = lines.map(line => JSON.parse(line))
    expect(entries[0].level).toBe(0) // ERROR
    expect(entries[1].level).toBe(1) // WARN
    expect(entries[2].level).toBe(2) // INFO
  })

  test('Structured Log Format', async () => {
    const testEntry: Omit<LogEntry, 'timestamp'> = {
      level: LogLevel.INFO,
      category: LogCategory.RESERVATION,
      message: 'Reservation created',
      requestId: 'req-123',
      reservationToken: 'token-456',
      component: 'ReservationService',
      duration: 150,
      metadata: { productId: 'p1', quantity: 2 },
      tags: ['reservation', 'success']
    }

    logger.log(testEntry)
    logger.close()

    const logContent = readFileSync(logFilePath, 'utf8')
    const entry = JSON.parse(logContent.trim())

    // Verify all fields present
    expect(entry).toHaveProperty('timestamp')
    expect(entry.level).toBe(2)
    expect(entry.category).toBe('reservation')
    expect(entry.message).toBe('Reservation created')
    expect(entry.requestId).toBe('req-123')
    expect(entry.reservationToken).toBe('token-456')
    expect(entry.component).toBe('ReservationService')
    expect(entry.duration).toBe(150)
    expect(entry.metadata).toEqual({ productId: 'p1', quantity: 2 })
    expect(entry.tags).toEqual(['reservation', 'success'])
  })

  test('Request Context Logging', async () => {
    const requestId = 'req-789'
    const component = 'CheckoutService'
    const contextLogger = new RequestContextLogger(logger, requestId, component)

    // Log multiple messages with context
    contextLogger.info('Processing started')
    contextLogger.debug('Validating basket')
    contextLogger.info('Basket validated')
    contextLogger.info('Creating reservation', { duration: 200 })
    contextLogger.info('Reservation created', { reservationToken: 'token-xyz' })

    logger.close()

    const logContent = readFileSync(logFilePath, 'utf8')
    const lines = logContent.trim().split('\n')
    const entries = lines.map(line => JSON.parse(line))

    // Verify context preserved
    entries.forEach(entry => {
      expect(entry.requestId).toBe(requestId)
      expect(entry.component).toBe(component)
      expect(entry.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    })

    // Verify specific entries
    expect(entries[0].message).toBe('Processing started')
    expect(entries[3].duration).toBe(200)
    expect(entries[4].reservationToken).toBe('token-xyz')
  })

  test('Error Logging and Stack Traces', async () => {
    const error = new Error('Database connection failed')
    error.name = 'DatabaseError'
    ;(error as Record<string, unknown>).code = 'ECONNREFUSED'

    logger.error('Failed to connect to database', {
      category: LogCategory.SYSTEM,
      component: 'DatabaseService',
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: (error as Record<string, unknown>).code as string
      },
      metadata: { host: 'localhost', port: 5432 }
    })

    logger.close()

    const logContent = readFileSync(logFilePath, 'utf8')
    const entry = JSON.parse(logContent.trim())

    expect(entry.level).toBe(0) // ERROR
    expect(entry.category).toBe('system')
    expect(entry.message).toBe('Failed to connect to database')
    expect(entry.error.name).toBe('DatabaseError')
    expect(entry.error.message).toBe('Database connection failed')
    expect(entry.error.stack).toBeDefined()
    expect(entry.error.code).toBe('ECONNREFUSED')
    expect(entry.metadata.host).toBe('localhost')
  })

  test('Performance Metrics Logging', async () => {
    // Log performance events
    logger.info('API request completed', {
      category: LogCategory.PERFORMANCE,
      component: 'APIService',
      duration: 150,
      metadata: { endpoint: '/api/checkout/reserve', method: 'POST' }
    })

    logger.info('Database query executed', {
      category: LogCategory.PERFORMANCE,
      component: 'DatabaseService',
      duration: 25,
      metadata: { query: 'SELECT * FROM products', table: 'products' }
    })

    logger.info('Redis operation completed', {
      category: LogCategory.PERFORMANCE,
      component: 'RedisService',
      duration: 5,
      metadata: { operation: 'SET', key: 'reservation:token123' }
    })

    logger.close()

    const logContent = readFileSync(logFilePath, 'utf8')
    const lines = logContent.trim().split('\n')
    const entries = lines.map(line => JSON.parse(line))

    // Verify performance entries
    expect(entries).toHaveLength(3)
    expect(entries[0].duration).toBe(150)
    expect(entries[1].duration).toBe(25)
    expect(entries[2].duration).toBe(5)
    expect(entries.every(e => e.category === 'performance')).toBe(true)
  })

  test('Category-Based Logging', async () => {
    // Log different categories
    logger.info('System started', { category: LogCategory.SYSTEM, component: 'App' })
    logger.info('Queue processing', { category: LogCategory.QUEUE, component: 'QueueService' })
    logger.info('Reservation created', { category: LogCategory.RESERVATION, component: 'ReservationService' })
    logger.info('API request', { category: LogCategory.API, component: 'APIService' })
    logger.info('Redis operation', { category: LogCategory.REDIS, component: 'RedisService' })
    logger.info('Stripe webhook', { category: LogCategory.STRIPE, component: 'WebhookService' })
    logger.info('Performance metric', { category: LogCategory.PERFORMANCE, component: 'MetricsService' })
    logger.info('Security event', { category: LogCategory.SECURITY, component: 'AuthService' })

    logger.close()

    const logContent = readFileSync(logFilePath, 'utf8')
    const lines = logContent.trim().split('\n')
    const entries = lines.map(line => JSON.parse(line))

    // Verify categories
    expect(entries.map(e => e.category)).toEqual([
      'system',
      'queue',
      'reservation',
      'api',
      'redis',
      'stripe',
      'performance',
      'security'
    ])
  })

  test('Text Format Logging', async () => {
    const textLogger = new StructuredLogger({
      level: LogLevel.INFO,
      format: 'text',
      filePath: logFilePath
    })

    textLogger.info('Test message', {
      category: LogCategory.SYSTEM,
      component: 'TestComponent',
      requestId: 'req-123',
      duration: 100
    })

    textLogger.close()

    const logContent = readFileSync(logFilePath, 'utf8')
    const line = logContent.trim()

    // Verify text format
    expect(line).toContain('INFO')
    expect(line).toContain('system')
    expect(line).toContain('[TestComponent]')
    expect(line).toContain('Test message')
    expect(line).toContain('(req: req-123)')
    expect(line).toContain('(100ms)')
  })

  test('Metrics Collection', async () => {
    // Increment counters
    metrics.increment('api.requests', 1)
    metrics.increment('api.requests', 1)
    metrics.increment('api.requests', 1)
    metrics.increment('reservations.created', 1)
    metrics.increment('reservations.created', 1)

    // Set gauges
    metrics.gauge('active.reservations', 5)
    metrics.gauge('queue.length', 12)

    // Record histograms
    metrics.histogram('api.latency', 100)
    metrics.histogram('api.latency', 150)
    metrics.histogram('api.latency', 200)
    metrics.histogram('db.query.time', 25)
    metrics.histogram('db.query.time', 30)

    const collectedMetrics = metrics.getMetrics()

    // Verify counters
    expect(collectedMetrics.counters['api.requests']).toBe(3)
    expect(collectedMetrics.counters['reservations.created']).toBe(2)

    // Verify gauges
    expect(collectedMetrics.gauges['active.reservations']).toBe(5)
    expect(collectedMetrics.gauges['queue.length']).toBe(12)

    // Verify histograms
    const latencyHist = collectedMetrics.histograms['api.latency']
    expect(latencyHist.count).toBe(3)
    expect(latencyHist.min).toBe(100)
    expect(latencyHist.max).toBe(200)
    expect(latencyHist.avg).toBe(150)

    const queryHist = collectedMetrics.histograms['db.query.time']
    expect(queryHist.count).toBe(2)
    expect(queryHist.avg).toBe(27.5)
  })

  test('Log Rotation and File Management', async () => {
    // Create logger with small max size
    const rotationLogger = new StructuredLogger({
      level: LogLevel.INFO,
      format: 'json',
      filePath: logFilePath,
      maxSize: 100, // Very small for testing
      maxFiles: 3
    })

    // Generate many logs to trigger rotation
    for (let i = 0; i < 50; i++) {
      rotationLogger.info(`Log message ${i}`, {
        category: LogCategory.SYSTEM,
        component: 'Test'
      })
    }

    rotationLogger.close()

    // Verify files exist
    expect(existsSync(logFilePath)).toBe(true)

    // Read current file
    const currentContent = readFileSync(logFilePath, 'utf8')
    const currentLines = currentContent.trim().split('\n')

    // Should have fewer logs due to rotation
    expect(currentLines.length).toBeLessThan(50)
  })

  test('Security Event Logging', async () => {
    // Log security events
    logger.warn('Failed authentication attempt', {
      category: LogCategory.SECURITY,
      component: 'AuthService',
      metadata: {
        ip: '192.168.1.100',
        userAgent: 'Mozilla/5.0...',
        attemptCount: 3
      },
      tags: ['auth', 'security', 'failed']
    })

    logger.error('SQL injection attempt detected', {
      category: LogCategory.SECURITY,
      component: 'APIService',
      error: {
        name: 'SecurityError',
        message: 'Potential SQL injection detected',
        code: 'SEC001'
      },
      metadata: {
        ip: '192.168.1.101',
        query: "SELECT * FROM users WHERE id = '1' OR '1'='1",
        userAgent: 'curl/7.68.0'
      },
      tags: ['security', 'injection', 'blocked']
    })

    logger.close()

    const logContent = readFileSync(logFilePath, 'utf8')
    const lines = logContent.trim().split('\n')
    const entries = lines.map(line => JSON.parse(line))

    // Verify security entries
    expect(entries).toHaveLength(2)
    expect(entries.every(e => e.category === 'security')).toBe(true)
    expect(entries[0].level).toBe(1) // WARN
    expect(entries[1].level).toBe(0) // ERROR
    expect(entries[1].error.code).toBe('SEC001')
    expect(entries[1].tags).toContain('blocked')
  })

  test('Health Check Logging', async () => {
    const healthLogger = new StructuredLogger({
      level: LogLevel.INFO,
      format: 'json',
      filePath: logFilePath
    })

    // Simulate health checks
    const checkHealth = async (service: string) => {
      const startTime = Date.now()

      try {
        // Simulate health check
        await new Promise(resolve => setTimeout(resolve, 10))

        healthLogger.info(`Health check passed for ${service}`, {
          category: LogCategory.SYSTEM,
          component: 'HealthCheckService',
          duration: Date.now() - startTime,
          metadata: { service, status: 'healthy' }
        })
      } catch {
        healthLogger.error(`Health check failed for ${service}`, {
          category: LogCategory.SYSTEM,
          component: 'HealthCheckService',
          duration: Date.now() - startTime,
          error: {
            name: 'HealthCheckError',
            message: `Service ${service} is unhealthy`
          },
          metadata: { service, status: 'unhealthy' }
        })
      }
    }

    // Run health checks
    await checkHealth('database')
    await checkHealth('redis')
    await checkHealth('stripe')

    healthLogger.close()

    const logContent = readFileSync(logFilePath, 'utf8')
    const lines = logContent.trim().split('\n')
    const entries = lines.map(line => JSON.parse(line))

    expect(entries).toHaveLength(3)
    expect(entries.every(e => e.message.includes('Health check'))).toBe(true)
    expect(entries.every(e => e.duration !== undefined)).toBe(true)
  })

  test('Alert Threshold Configuration', async () => {
    const alertLogger = new StructuredLogger({
      level: LogLevel.WARN, // Only WARN and ERROR
      format: 'json',
      filePath: logFilePath
    })

    // Simulate errors that should trigger alerts
    for (let i = 0; i < 5; i++) {
      alertLogger.error(`Database error ${i}`, {
        category: LogCategory.SYSTEM,
        component: 'DatabaseService',
        error: {
          name: 'DatabaseError',
          message: 'Connection timeout'
        }
      })
    }

    alertLogger.close()

    const logContent = readFileSync(logFilePath, 'utf8')
    const lines = logContent.trim().split('\n')
    const entries = lines.map(line => JSON.parse(line))

    // Verify all errors logged
    expect(entries).toHaveLength(5)
    expect(entries.every(e => e.level === 0)).toBe(true) // All ERROR level

    // Check metrics for alert triggering
    const loggerMetrics = alertLogger.getMetrics()
    const errorCount = loggerMetrics.get('system:0') || 0
    expect(errorCount).toBe(5)
  })

  test('Performance Benchmarks', async () => {
    // Benchmark logging performance
    const iterations = 1000
    const startTime = Date.now()

    for (let i = 0; i < iterations; i++) {
      logger.info(`Performance test message ${i}`, {
        category: LogCategory.PERFORMANCE,
        component: 'BenchmarkService',
        metadata: { iteration: i }
      })
    }

    const endTime = Date.now()
    const duration = endTime - startTime

    logger.close()

    // Should handle 1000 logs quickly
    expect(duration).toBeLessThan(1000) // Less than 1 second
    expect(duration / iterations).toBeLessThan(1) // Less than 1ms per log

    // Verify all logs were written
    const logContent = readFileSync(logFilePath, 'utf8')
    const lines = logContent.trim().split('\n')
    expect(lines).toHaveLength(iterations)
  })
})
