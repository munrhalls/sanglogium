# Monitoring and Logging Diagram

## Logging Architecture

```mermaid
graph TD
    subgraph "Application Layer"
        A[StructuredLogger] --> B[Log Entry]
        B --> C[Log Categories]
        C --> D[Request Context]
    end
    
    subgraph "Log Processing"
        B --> E[JSON Formatter]
        E --> F[File Writer]
        E --> G[Console Output]
        E --> H[External Service]
    end
    
    subgraph "Log Aggregation"
        F --> I[Log Rotation]
        I --> J[ELK Stack]
        H --> K[Cloud Logging]
        J --> L[Kibana Dashboard]
        K --> L
    end
```

## Log Entry Structure

```mermaid
graph TD
    subgraph "LogEntry"
        A[timestamp: ISO 8601]
        B[level: LogLevel]
        C[category: LogCategory]
        D[message: string]
        E[requestId?: string]
        F[reservationToken?: string]
        G[userId?: string]
        H[component: string]
        I[duration?: number]
        J[error?: ErrorObject]
        K[metadata?: Record]
        L[tags?: string[]]
    end
    
    subgraph "ErrorObject"
        J --> M[name: string]
        J --> N[message: string]
        J --> O[stack?: string]
        J --> P[code?: string]
    end
```

## Log Levels and Categories

```mermaid
graph LR
    subgraph "Log Levels"
        A[ERROR: 0] --> B[CRITICAL: 1]
        B --> C[WARN: 2]
        C --> D[INFO: 3]
        D --> E[DEBUG: 4]
    end
    
    subgraph "Categories"
        F[system] --> G[Startup/Config]
        H[queue] --> I[Processing/Retries]
        J[reservation] --> K[Lifecycle Events]
        L[api] --> M[HTTP Requests]
        N[redis] --> O[TTL Operations]
        P[stripe] --> Q[Webhooks]
        R[performance] --> S[Metrics]
        T[security] --> U[Auth Events]
    end
```

## Request Context Logging

```mermaid
sequenceDiagram
    participant Client as Client
    participant Logger as RequestContextLogger
    participant System as System
    participant Output as Log Output
    
    Client->>Logger: Create Request Context
    Logger->>Logger: Set requestId, component
    Logger->>System: Process Request
    System->>Logger: info("Processing started")
    Logger->>Output: Log with context
    
    System->>Logger: error("Request failed")
    Logger->>Output: Log with error + context
    
    System->>Logger: info("Request completed")
    Logger->>Output: Log with duration + context
```

## Metrics Collection Architecture

```mermaid
graph TD
    subgraph "Metrics Types"
        A[Counters] --> B[Increment/Decrement]
        C[Gauges] --> D[Set Value]
        E[Histograms] --> F[Record Distribution]
        G[Timers] --> H[Measure Duration]
    end
    
    subgraph "Collection Points"
        I[HTTP Requests] --> J[Response Time]
        I --> K[Status Codes]
        L[Queue Operations] --> M[Queue Size]
        L --> N[Processing Time]
        O[Database] --> P[Query Time]
        O --> Q[Connection Pool]
    end
    
    subgraph "Export Formats"
        R[Prometheus] --> S[Text Format]
        T[StatsD] --> U[UDP Protocol]
        V[Custom] --> W[JSON API]
    end
```

## Application Metrics

```mermaid
graph TD
    subgraph "Request Metrics"
        A[total_requests] --> B[success + error]
        C[response_time] --> D[p95, p99]
        E[error_rate] --> F[errors / total]
    end
    
    subgraph "Reservation Metrics"
        G[created_total] --> H[Counter]
        I[completed_total] --> H
        J[cancelled_total] --> H
        K[expired_total] --> H
        L[active_count] --> M[Gauge]
        N[lifetime] --> O[Histogram]
    end
    
    subgraph "Queue Metrics"
        P[pending_items] --> Q[Gauge]
        R[processing_items] --> Q
        S[throughput] --> T[Rate]
        U[wait_time] --> V[Histogram]
    end
```

## Health Check System

```mermaid
graph TD
    subgraph "Health Checks"
        A[Database Health] --> B[Connection Test]
        C[Redis Health] --> D[Ping Test]
        E[Queue Health] --> F[Queue Size]
        G[Stripe Health] --> H[API Test]
    end
    
    subgraph "Health Status"
        I[healthy] --> J[200 OK]
        K[degraded] --> L[200 OK]
        M[unhealthy] --> N[503 Service Unavailable]
    end
    
    subgraph "Health Endpoint"
        O[GET /health] --> P[Run All Checks]
        P --> Q[Aggregate Status]
        Q --> R[JSON Response]
    end
```

## Alerting System

```mermaid
graph TD
    subgraph "Alert Conditions"
        A[error_rate > 5%] --> B[High Severity]
        C[p95_response_time > 5s] --> D[Medium Severity]
        E[queue_pending > 100] --> D
        F[memory_usage > 80%] --> B
        G[redis_unhealthy] --> H[Critical Severity]
    end
    
    subgraph "Alert Flow"
        I[Metrics Check] --> J{Threshold Exceeded?}
        J -->|Yes| K[Create Alert]
        J -->|No| L[Continue Monitoring]
        K --> M[Send Notification]
        M --> N[Alert Manager]
        N --> O[Resolve Alert]
    end
```

## Dashboard Configuration

```mermaid
graph TD
    subgraph "Grafana Panels"
        A[Request Rate] --> B[rate(http_requests_total)]
        C[Response Time] --> D[histogram_quantile(0.95)]
        E[Active Reservations] --> F[active_reservations]
        G[Queue Status] --> H[queue_pending + queue_processing]
        I[Error Rate] --> J[rate(http_errors_total)]
        K[Reservation Lifecycle] --> L[rate(reservations_*_total)]
    end
    
    subgraph "Dashboard Layout"
        M[Row 1: Traffic] --> N[Request Rate + Response Time]
        O[Row 2: Business] --> P[Reservations + Conversions]
        Q[Row 3: System] --> R[Queue + Errors]
        S[Row 4: Infrastructure] --> T[Memory + CPU]
    end
```

## Log Aggregation Pipeline

```mermaid
graph LR
    subgraph "Collection"
        A[Filebeat] --> B[Read Log Files]
        C[Application] --> D[Direct Logging]
    end
    
    subgraph "Processing"
        B --> E[Logstash]
        D --> E
        E --> F[Parse JSON]
        F --> G[Add Fields]
        G --> H[Filter by Level]
    end
    
    subgraph "Storage & Visualization"
        H --> I[Elasticsearch]
        I --> J[Kibana]
        J --> K[Dashboards]
        J --> L[Search]
    end
```

## APM Integration

```mermaid
graph TD
    subgraph "Tracing"
        A[APM Tracer] --> B[Trace Request]
        B --> C[Create Span]
        C --> D[Add Tags]
        D --> E[Log Events]
        E --> F[Finish Span]
    end
    
    subgraph "Trace Context"
        G[trace_id] --> H[Request Correlation]
        I[span_id] --> J[Operation Tracking]
        K[parent_span] --> L[Nested Operations]
    end
    
    subgraph "Performance Data"
        M[duration] --> N[Response Time]
        O[error] --> P[Error Tracking]
        Q[tags] --> R[Context Metadata]
    end
```

## Error Tracking Flow

```mermaid
sequenceDiagram
    participant App as Application
    participant Logger as Logger
    participant APM as APM Service
    participant Alert as Alert Manager
    
    App->>Logger: error("Operation failed")
    Logger->>Logger: Create Error Log
    Logger->>APM: Send Error Event
    APM->>APM: Group Similar Errors
    APM->>Alert: Trigger Alert
    Alert->>Alert: Check Thresholds
    Alert->>App: Notification (if configured)
```

## Performance Monitoring

```mermaid
graph TD
    subgraph "System Metrics"
        A[CPU Usage] --> B[process.cpu]
        C[Memory Usage] --> D[process.memory]
        E[Disk I/O] --> F[process.disk]
        G[Network I/O] --> H[process.network]
    end
    
    subgraph "Application Metrics"
        I[Event Loop] --> J[node.event_loop_delay]
        K[Garbage Collection] --> L[node.gc_duration]
        M[HTTP Connections] --> N[node.active_connections]
    end
    
    subgraph "Business Metrics"
        O[Conversion Rate] --> P[reservations / requests]
        Q[Processing Time] --> R[queue processing duration]
        S[Success Rate] --> T[successful operations]
    end
```
