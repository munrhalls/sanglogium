# Monitoring and Logging Specification

## Overview

Comprehensive monitoring and logging strategy for the guest checkout inventory reservation system. Focuses on observability, error tracking, and performance metrics.

## Logging Strategy

### Log Levels and Categories

```typescript
// Log Levels (in order of severity)
enum LogLevel {
  ERROR = 0,    // System errors, exceptions
  WARN = 1,     // Warning conditions, degraded functionality
  INFO = 2,     // Important business events
  DEBUG = 3     // Detailed debugging information
}

// Log Categories
enum LogCategory {
  SYSTEM = 'system',           // System startup, configuration
  QUEUE = 'queue',             // Queue processing, retries
  RESERVATION = 'reservation', // Reservation lifecycle
  API = 'api',                // HTTP requests/responses
  REDIS = 'redis',             // Redis operations
  STRIPE = 'stripe',           // Stripe/webhook events
  PERFORMANCE = 'performance', // Performance metrics
  SECURITY = 'security'         // Security events
}
```

### Structured Logging Format

```typescript
interface LogEntry {
  timestamp: string          // ISO 8601 format
  level: LogLevel            // Log level
  category: LogCategory      // Log category
  message: string           // Human-readable message
  requestId?: string        // Request tracking ID
  reservationToken?: string // Reservation token for context
  userId?: string           // User ID (if available)
  component: string         // Component/module name
  duration?: number         // Operation duration in ms
  error?: {                 // Error details
    name: string
    message: string
    stack?: string
    code?: string
  }
  metadata?: Record<string, any> // Additional context
  tags?: string[]           // Searchable tags
}

// Logger Implementation
class StructuredLogger {
  private config: LoggingConfig
  
  constructor(config: LoggingConfig) {
    this.config = config
  }
  
  private log(entry: Omit<LogEntry, 'timestamp'>): void {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      ...entry
    }
    
    // Format based on configuration
    const formatted = this.config.format === 'json' 
      ? JSON.stringify(logEntry)
      : this.formatAsText(logEntry)
    
    // Output to appropriate destination
    this.writeLog(formatted, entry.level)
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
  
  private formatAsText(entry: LogEntry): string {
    const timestamp = entry.timestamp
    const level = LogLevel[entry.level].padEnd(5)
    const category = entry.category.padEnd(12)
    const component = entry.component.padEnd(20)
    
    let message = `[${timestamp}] ${level} ${category} ${component} ${entry.message}`
    
    if (entry.requestId) {
      message += ` [req:${entry.requestId}]`
    }
    
    if (entry.reservationToken) {
      message += ` [token:${entry.reservationToken}]`
    }
    
    if (entry.duration) {
      message += ` (${entry.duration}ms)`
    }
    
    if (entry.error) {
      message += `\nError: ${entry.error.name}: ${entry.error.message}`
      if (entry.error.stack) {
        message += `\nStack: ${entry.error.stack}`
      }
    }
    
    return message
  }
  
  private writeLog(formatted: string, level: LogLevel): void {
    if (level <= LogLevel.WARN) {
      console.error(formatted)
    } else if (level === LogLevel.INFO) {
      console.info(formatted)
    } else {
      console.debug(formatted)
    }
    
    // Also write to file if configured
    if (this.config.file) {
      this.writeToFile(formatted)
    }
  }
  
  private writeToFile(formatted: string): void {
    // Implement file writing with rotation
    // This would use a library like winston or pino
  }
}
```

### Request Context Logger

```typescript
// Request-scoped logger with automatic context
class RequestContextLogger {
  private logger: StructuredLogger
  private context: Partial<LogEntry>
  
  constructor(logger: StructuredLogger, context: Partial<LogEntry>) {
    this.logger = logger
    this.context = context
  }
  
  error(message: string, additionalContext?: Partial<LogEntry>): void {
    this.logger.error(message, { ...this.context, ...additionalContext })
  }
  
  warn(message: string, additionalContext?: Partial<LogEntry>): void {
    this.logger.warn(message, { ...this.context, ...additionalContext })
  }
  
  info(message: string, additionalContext?: Partial<LogEntry>): void {
    this.logger.info(message, { ...this.context, ...additionalContext })
  }
  
  debug(message: string, additionalContext?: Partial<LogEntry>): void {
    this.logger.debug(message, { ...this.context, ...additionalContext })
  }
  
  withContext(additionalContext: Partial<LogEntry>): RequestContextLogger {
    return new RequestContextLogger(this.logger, { ...this.context, ...additionalContext })
  }
  
  withDuration<T>(operation: () => T, message: string): T {
    const start = Date.now()
    try {
      const result = operation()
      const duration = Date.now() - start
      this.debug(message, { duration })
      return result
    } catch (error) {
      const duration = Date.now() - start
      this.error(`${message} failed`, { 
        duration, 
        error: {
          name: error.constructor.name,
          message: error.message,
          stack: error.stack
        }
      })
      throw error
    }
  }
}

// Usage
const baseLogger = new StructuredLogger(config)

// In request handler
const requestLogger = new RequestContextLogger(baseLogger, {
  requestId: 'req_123',
  component: 'CheckoutAPI'
})

requestLogger.info('Processing checkout request')
const result = requestLogger.withDuration(() => processCheckout(), 'Checkout processing')
```

## Monitoring Metrics

### Metrics Collection

```typescript
// Metrics Categories
interface SystemMetrics {
  uptime: number
  memory: MemoryMetrics
  cpu: CPUMetrics
  disk: DiskMetrics
}

interface MemoryMetrics {
  used: number
  total: number
  percentage: number
  heapUsed: number
  heapTotal: number
}

interface CPUMetrics {
  usage: number
  loadAverage: number[]
}

interface DiskMetrics {
  used: number
  total: number
  percentage: number
}

interface ApplicationMetrics {
  requests: RequestMetrics
  reservations: ReservationMetrics
  queue: QueueMetrics
  errors: ErrorMetrics
  performance: PerformanceMetrics
}

interface RequestMetrics {
  total: number
  success: number
  error: number
  averageResponseTime: number
  p95ResponseTime: number
  p99ResponseTime: number
}

interface ReservationMetrics {
  created: number
  completed: number
  cancelled: number
  expired: number
  averageLifetime: number
}

interface QueueMetrics {
  pending: number
  processing: number
  completed: number
  failed: number
  averageWaitTime: number
  throughput: number
}

interface ErrorMetrics {
  total: number
  byType: Record<string, number>
  byComponent: Record<string, number>
  critical: number
}

interface PerformanceMetrics {
  database: DatabaseMetrics
  redis: RedisMetrics
  stripe: StripeMetrics
}

interface DatabaseMetrics {
  queryTime: number
  connectionPool: ConnectionPoolMetrics
}

interface RedisMetrics {
  operations: number
  hitRate: number
  memory: number
  latency: number
}

interface StripeMetrics {
  webhooks: number
  payments: number
  errors: number
}
```

### Metrics Collector

```typescript
class MetricsCollector {
  private metrics: Map<string, any> = new Map()
  private timers: Map<string, number> = new Map()
  private counters: Map<string, number> = new Map()
  private histograms: Map<string, number[]> = new Map()
  
  // Counter operations
  increment(metric: string, value: number = 1, tags?: Record<string, string>): void {
    const key = this.buildKey(metric, tags)
    this.counters.set(key, (this.counters.get(key) || 0) + value)
  }
  
  decrement(metric: string, value: number = 1, tags?: Record<string, string>): void {
    this.increment(metric, -value, tags)
  }
  
  // Gauge operations
  set(metric: string, value: number, tags?: Record<string, string>): void {
    const key = this.buildKey(metric, tags)
    this.metrics.set(key, value)
  }
  
  get(metric: string, tags?: Record<string, string>): number {
    const key = this.buildKey(metric, tags)
    return this.metrics.get(key) || 0
  }
  
  // Histogram operations
  record(metric: string, value: number, tags?: Record<string, string>): void {
    const key = this.buildKey(metric, tags)
    const values = this.histograms.get(key) || []
    values.push(value)
    this.histograms.set(key, values)
    
    // Keep only last 1000 values
    if (values.length > 1000) {
      values.shift()
    }
  }
  
  // Timer operations
  startTimer(metric: string, tags?: Record<string, string>): string {
    const timerId = `${metric}_${Date.now()}_${Math.random()}`
    this.timers.set(timerId, Date.now())
    return timerId
  }
  
  endTimer(timerId: string, tags?: Record<string, string>): number {
    const startTime = this.timers.get(timerId)
    if (!startTime) return 0
    
    const duration = Date.now() - startTime
    this.timers.delete(timerId)
    
    const metric = timerId.split('_')[0]
    this.record(metric, duration, tags)
    
    return duration
  }
  
  // Statistics
  getHistogramStats(metric: string, tags?: Record<string, string>): HistogramStats {
    const key = this.buildKey(metric, tags)
    const values = this.histograms.get(key) || []
    
    if (values.length === 0) {
      return { count: 0, min: 0, max: 0, mean: 0, p50: 0, p95: 0, p99: 0 }
    }
    
    const sorted = [...values].sort((a, b) => a - b)
    const count = sorted.length
    const sum = sorted.reduce((a, b) => a + b, 0)
    
    return {
      count,
      min: sorted[0],
      max: sorted[count - 1],
      mean: sum / count,
      p50: sorted[Math.floor(count * 0.5)],
      p95: sorted[Math.floor(count * 0.95)],
      p99: sorted[Math.floor(count * 0.99)]
    }
  }
  
  private buildKey(metric: string, tags?: Record<string, string>): string {
    if (!tags) return metric
    
    const tagString = Object.entries(tags)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join(',')
    
    return `${metric}{${tagString}}`
  }
  
  // Export metrics for monitoring systems
  exportPrometheusFormat(): string {
    const lines: string[] = []
    
    // Export counters
    for (const [key, value] of this.counters) {
      lines.push(`${key} ${value}`)
    }
    
    // Export gauges
    for (const [key, value] of this.metrics) {
      lines.push(`${key} ${value}`)
    }
    
    // Export histograms
    for (const [key, values] of this.histograms) {
      const stats = this.getHistogramStats(key.replace('{', '').replace('}', ''))
      lines.push(`${key}_count ${stats.count}`)
      lines.push(`${key}_sum ${stats.mean * stats.count}`)
      lines.push(`${key}_bucket{le="0.5"} ${stats.p50}`)
      lines.push(`${key}_bucket{le="0.95"} ${stats.p95}`)
      lines.push(`${key}_bucket{le="0.99"} ${stats.p99}`)
    }
    
    return lines.join('\n')
  }
}

interface HistogramStats {
  count: number
  min: number
  max: number
  mean: number
  p50: number
  p95: number
  p99: number
}
```

### Application Metrics Integration

```typescript
// Metrics collection throughout the application
class ApplicationMetrics {
  private collector: MetricsCollector
  private logger: RequestContextLogger
  
  constructor(logger: RequestContextLogger) {
    this.collector = new MetricsCollector()
    this.logger = logger
  }
  
  // Request metrics
  recordRequest(duration: number, status: number, endpoint: string): void {
    this.collector.record('http_request_duration', duration, { endpoint })
    this.collector.increment('http_requests_total', 1, { 
      endpoint, 
      status: status.toString() 
    })
    
    if (status >= 400) {
      this.collector.increment('http_errors_total', 1, { 
        endpoint, 
        status: status.toString() 
      })
    }
  }
  
  // Reservation metrics
  recordReservationCreated(token: string): void {
    this.collector.increment('reservations_created_total')
    this.collector.set('active_reservations', this.getActiveReservationCount())
    
    this.logger.info('Reservation created', {
      category: LogCategory.RESERVATION,
      reservationToken: token,
      tags: ['reservation', 'created']
    })
  }
  
  recordReservationCompleted(token: string, lifetime: number): void {
    this.collector.increment('reservations_completed_total')
    this.collector.record('reservation_lifetime', lifetime)
    this.collector.set('active_reservations', this.getActiveReservationCount())
    
    this.logger.info('Reservation completed', {
      category: LogCategory.RESERVATION,
      reservationToken: token,
      duration: lifetime,
      tags: ['reservation', 'completed']
    })
  }
  
  recordReservationCancelled(token: string): void {
    this.collector.increment('reservations_cancelled_total')
    this.collector.set('active_reservations', this.getActiveReservationCount())
    
    this.logger.info('Reservation cancelled', {
      category: LogCategory.RESERVATION,
      reservationToken: token,
      tags: ['reservation', 'cancelled']
    })
  }
  
  recordReservationExpired(token: string): void {
    this.collector.increment('reservations_expired_total')
    this.collector.set('active_reservations', this.getActiveReservationCount())
    
    this.logger.warn('Reservation expired', {
      category: LogCategory.RESERVATION,
      reservationToken: token,
      tags: ['reservation', 'expired']
    })
  }
  
  // Queue metrics
  recordQueueProcessing(type: string, duration: number, success: boolean): void {
    this.collector.record('queue_processing_duration', duration, { type })
    this.collector.increment('queue_processed_total', 1, { type, result: success ? 'success' : 'failure' })
    
    this.logger.debug('Queue item processed', {
      category: LogCategory.QUEUE,
      duration,
      tags: ['queue', 'processed', type]
    })
  }
  
  recordQueueSize(pending: number, processing: number): void {
    this.collector.set('queue_pending_items', pending)
    this.collector.set('queue_processing_items', processing)
  }
  
  // Error metrics
  recordError(error: Error, component: string, context?: Record<string, any>): void {
    this.collector.increment('errors_total', 1, { 
      type: error.constructor.name, 
      component 
    })
    
    this.logger.error('Application error', {
      category: LogCategory.SYSTEM,
      component,
      error: {
        name: error.constructor.name,
        message: error.message,
        stack: error.stack
      },
      metadata: context,
      tags: ['error', component]
    })
  }
  
  // Performance metrics
  recordDatabaseQuery(query: string, duration: number): void {
    this.collector.record('database_query_duration', duration, { query })
  }
  
  recordRedisOperation(operation: string, duration: number): void {
    this.collector.record('redis_operation_duration', duration, { operation })
  }
  
  recordStripeWebhook(event: string, processingTime: number): void {
    this.collector.increment('stripe_webhooks_total', 1, { event })
    this.collector.record('stripe_webhook_duration', processingTime, { event })
  }
  
  private getActiveReservationCount(): number {
    // This would query the database or Redis for active reservations
    return 0 // Placeholder
  }
}
```

## Health Checks

### Health Check Endpoints

```typescript
// Health check interface
interface HealthCheck {
  name: string
  status: 'healthy' | 'degraded' | 'unhealthy'
  duration: number
  message?: string
  details?: Record<string, any>
}

// Health check registry
class HealthCheckRegistry {
  private checks: Map<string, () => Promise<HealthCheck>> = new Map()
  
  register(name: string, check: () => Promise<HealthCheck>): void {
    this.checks.set(name, check)
  }
  
  async runAllChecks(): Promise<HealthCheck[]> {
    const results: HealthCheck[] = []
    
    for (const [name, check] of this.checks) {
      try {
        const start = Date.now()
        const result = await check()
        result.duration = Date.now() - start
        results.push(result)
      } catch (error) {
        results.push({
          name,
          status: 'unhealthy',
          duration: 0,
          message: error.message
        })
      }
    }
    
    return results
  }
  
  async runCheck(name: string): Promise<HealthCheck> {
    const check = this.checks.get(name)
    if (!check) {
      throw new Error(`Health check not found: ${name}`)
    }
    
    const start = Date.now()
    const result = await check()
    result.duration = Date.now() - start
    return result
  }
}

// Individual health checks
class DatabaseHealthCheck {
  constructor(private database: Database) {}
  
  async check(): Promise<HealthCheck> {
    const start = Date.now()
    
    try {
      await this.database.raw('SELECT 1')
      const latency = Date.now() - start
      
      return {
        name: 'database',
        status: latency < 1000 ? 'healthy' : 'degraded',
        duration: latency,
        message: `Database query took ${latency}ms`,
        details: { latency }
      }
    } catch (error) {
      return {
        name: 'database',
        status: 'unhealthy',
        duration: Date.now() - start,
        message: error.message,
        details: { error: error.message }
      }
    }
  }
}

class RedisHealthCheck {
  constructor(private redis: Redis) {}
  
  async check(): Promise<HealthCheck> {
    const start = Date.now()
    
    try {
      await this.redis.ping()
      const latency = Date.now() - start
      
      const memory = await this.redis.info('memory')
      const usedMemory = this.extractMemoryUsage(memory)
      
      return {
        name: 'redis',
        status: latency < 500 ? 'healthy' : 'degraded',
        duration: latency,
        message: `Redis ping took ${latency}ms`,
        details: { latency, memory: usedMemory }
      }
    } catch (error) {
      return {
        name: 'redis',
        status: 'unhealthy',
        duration: Date.now() - start,
        message: error.message,
        details: { error: error.message }
      }
    }
  }
  
  private extractMemoryUsage(info: string): number {
    const match = info.match(/used_memory:(\d+)/)
    return match ? parseInt(match[1]) : 0
  }
}

class QueueHealthCheck {
  constructor(private queue: FIFOQueue) {}
  
  async check(): Promise<HealthCheck> {
    const start = Date.now()
    
    try {
      const metrics = await this.queue.getMetrics()
      
      return {
        name: 'queue',
        status: metrics.averageWaitTime < 5000 ? 'healthy' : 'degraded',
        duration: Date.now() - start,
        message: `Queue wait time: ${metrics.averageWaitTime}ms`,
        details: metrics
      }
    } catch (error) {
      return {
        name: 'queue',
        status: 'unhealthy',
        duration: Date.now() - start,
        message: error.message,
        details: { error: error.message }
      }
    }
  }
}

// Health check endpoint
app.get('/health', async (req, res) => {
  const registry = new HealthCheckRegistry()
  
  // Register checks
  registry.register('database', new DatabaseHealthCheck(database).check)
  registry.register('redis', new RedisHealthCheck(redis).check)
  registry.register('queue', new QueueHealthCheck(queue).check)
  
  const results = await registry.runAllChecks()
  const overallStatus = results.reduce((status, check) => {
    if (check.status === 'unhealthy') return 'unhealthy'
    if (check.status === 'degraded' && status === 'healthy') return 'degraded'
    return status
  }, 'healthy')
  
  const statusCode = overallStatus === 'healthy' ? 200 : 
                      overallStatus === 'degraded' ? 200 : 503
  
  res.status(statusCode).json({
    status: overallStatus,
    timestamp: new Date().toISOString(),
    checks: results
  })
})
```

## Alerting

### Alert Conditions

```typescript
interface Alert {
  severity: 'low' | 'medium' | 'high' | 'critical'
  type: string
  message: string
  condition: string
  threshold: number
  currentValue: number
  timestamp: string
  tags: string[]
}

class AlertManager {
  private alerts: Alert[] = []
  private thresholds: Map<string, AlertThreshold> = new Map()
  
  constructor() {
    this.setupDefaultThresholds()
  }
  
  private setupDefaultThresholds(): void {
    // Error rate alerts
    this.thresholds.set('error_rate', {
      condition: 'error_rate > 0.05', // 5%
      severity: 'high',
      duration: 300000 // 5 minutes
    })
    
    // Response time alerts
    this.thresholds.set('response_time_p95', {
      condition: 'p95_response_time > 5000', // 5 seconds
      severity: 'medium',
      duration: 300000
    })
    
    // Queue size alerts
    this.thresholds.set('queue_size', {
      condition: 'queue_pending > 100',
      severity: 'medium',
      duration: 60000 // 1 minute
    })
    
    // Memory usage alerts
    this.thresholds.set('memory_usage', {
      condition: 'memory_percentage > 80',
      severity: 'high',
      duration: 300000
    })
    
    // Redis connection alerts
    this.thresholds.set('redis_connection', {
      condition: 'redis_status != "healthy"',
      severity: 'critical',
      duration: 0 // Immediate
    })
  }
  
  checkMetrics(metrics: ApplicationMetrics): Alert[] {
    const newAlerts: Alert[] = []
    
    // Check error rate
    const errorRate = metrics.requests.total > 0 
      ? metrics.requests.error / metrics.requests.total 
      : 0
    
    if (errorRate > 0.05) {
      newAlerts.push({
        severity: 'high',
        type: 'error_rate',
        message: `Error rate is ${(errorRate * 100).toFixed(2)}%`,
        condition: 'error_rate > 0.05',
        threshold: 0.05,
        currentValue: errorRate,
        timestamp: new Date().toISOString(),
        tags: ['alert', 'error_rate', 'high']
      })
    }
    
    // Check response times
    if (metrics.requests.p95ResponseTime > 5000) {
      newAlerts.push({
        severity: 'medium',
        type: 'response_time',
        message: `P95 response time is ${metrics.requests.p95ResponseTime}ms`,
        condition: 'p95_response_time > 5000',
        threshold: 5000,
        currentValue: metrics.requests.p95ResponseTime,
        timestamp: new Date().toISOString(),
        tags: ['alert', 'response_time', 'medium']
      })
    }
    
    // Check queue size
    if (metrics.queue.pending > 100) {
      newAlerts.push({
        severity: 'medium',
        type: 'queue_size',
        message: `Queue has ${metrics.queue.pending} pending items`,
        condition: 'queue_pending > 100',
        threshold: 100,
        currentValue: metrics.queue.pending,
        timestamp: new Date().toISOString(),
        tags: ['alert', 'queue', 'medium']
      })
    }
    
    this.alerts.push(...newAlerts)
    return newAlerts
  }
  
  getActiveAlerts(): Alert[] {
    // Filter out old alerts (older than 24 hours)
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000)
    
    return this.alerts.filter(alert => 
      new Date(alert.timestamp) > cutoff
    )
  }
  
  resolveAlert(type: string): void {
    this.alerts = this.alerts.filter(alert => alert.type !== type)
  }
}

interface AlertThreshold {
  condition: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  duration: number
}
```

## Dashboard Configuration

### Grafana Dashboard Metrics

```json
{
  "dashboard": {
    "title": "Guest Checkout Reservation System",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{endpoint}}"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_bucket[5m]))",
            "legendFormat": "P95"
          },
          {
            "expr": "histogram_quantile(0.99, rate(http_request_duration_bucket[5m]))",
            "legendFormat": "P99"
          }
        ]
      },
      {
        "title": "Active Reservations",
        "type": "stat",
        "targets": [
          {
            "expr": "active_reservations"
          }
        ]
      },
      {
        "title": "Queue Status",
        "type": "graph",
        "targets": [
          {
            "expr": "queue_pending_items",
            "legendFormat": "Pending"
          },
          {
            "expr": "queue_processing_items",
            "legendFormat": "Processing"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_errors_total[5m]) / rate(http_requests_total[5m])",
            "legendFormat": "Error Rate"
          }
        ]
      },
      {
        "title": "Reservation Lifecycle",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(reservations_created_total[5m])",
            "legendFormat": "Created"
          },
          {
            "expr": "rate(reservations_completed_total[5m])",
            "legendFormat": "Completed"
          },
          {
            "expr": "rate(reservations_cancelled_total[5m])",
            "legendFormat": "Cancelled"
          },
          {
            "expr": "rate(reservations_expired_total[5m])",
            "legendFormat": "Expired"
          }
        ]
      }
    ]
  }
}
```

## Log Aggregation

### ELK Stack Configuration

```yaml
# Filebeat configuration for log collection
filebeat.inputs:
- type: log
  enabled: true
  paths:
    - /var/log/guest-checkout/*.log
  json.keys_under_root: true
  json.add_error_key: true
  fields:
    service: guest-checkout
    environment: production

output.elasticsearch:
  hosts: ["elasticsearch:9200"]
  index: "guest-checkout-logs-%{+yyyy.MM.dd}"

processors:
  - timestamp:
      field: timestamp
      layouts:
        - '2006-01-02T15:04:05.999999999Z'
      test:
        - '2023-03-22T14:33:22.476Z'
  - drop_fields:
      fields: ["message", "agent", "ecs", "input", "log"]
```

### Logstash Configuration

```ruby
# Logstash configuration for log processing
input {
  beats {
    port => 5044
  }
}

filter {
  # Parse JSON logs
  json {
    source => "message"
  }
  
  # Add environment tag
  if [fields][environment] {
    mutate {
      add_tag => [ "%{[fields][environment]}" ]
    }
  }
  
  # Parse log level
  if [level] {
    mutate {
      add_field => { "log_level" => "%{level}" }
    }
  }
  
  # Extract metrics from logs
  if [duration] {
    mutate {
      convert => { "duration" => "integer" }
    }
  }
  
  # Handle error logs
  if [level] == "ERROR" {
    mutate {
      add_tag => [ "error" ]
    }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "guest-checkout-logs-%{+yyyy.MM.dd}"
  }
}
```

## Performance Monitoring

### APM Integration

```typescript
// Application Performance Monitoring
class APMTracer {
  private tracer: any // APM tracer (e.g., New Relic, DataDog)
  
  constructor() {
    // Initialize APM tracer
    this.tracer = this.initializeTracer()
  }
  
  traceRequest(operationName: string, handler: () => Promise<any>): Promise<any> {
    return this.tracer.trace(operationName, async (span) => {
      span.setTag('component', 'guest-checkout')
      
      try {
        const result = await handler()
        span.setTag('success', true)
        return result
      } catch (error) {
        span.setTag('success', false)
        span.setTag('error', error.message)
        span.logError(error)
        throw error
      }
    })
  }
  
  traceReservation(operation: string, token: string, handler: () => Promise<any>): Promise<any> {
    return this.tracer.trace(operation, async (span) => {
      span.setTag('reservation.token', token)
      span.setTag('component', 'reservation')
      
      return this.traceRequest(operation, handler)
    })
  }
  
  traceQueueOperation(operation: string, type: string, handler: () => Promise<any>): Promise<any> {
    return this.tracer.trace(operation, async (span) => {
      span.setTag('queue.type', type)
      span.setTag('component', 'queue')
      
      return this.traceRequest(operation, handler)
    })
  }
  
  private initializeTracer(): any {
    // Initialize based on environment
    if (process.env.NEW_RELIC_LICENSE_KEY) {
      return require('newrelic')
    } else if (process.env.DD_API_KEY) {
      return require('dd-trace')
    } else {
      // Fallback to console tracing
      return {
        trace: (name: string, handler: (span: any) => Promise<any>) => {
          const span = {
            setTag: () => {},
            logError: () => {}
          }
          return handler(span)
        }
      }
    }
  }
}
```
