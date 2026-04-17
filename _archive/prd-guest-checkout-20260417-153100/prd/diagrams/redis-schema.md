# Redis Schema Diagram

## Redis Key Structure

```mermaid
graph TD
    subgraph "Key Patterns"
        A[reservation:{token}] --> B[Reservation TTL]
        C[circuit-breaker:{service}] --> D[Circuit Breaker State]
        E[idempotency:{key}] --> F[Response Cache]
        G[circuit-breaker:{service}:failures] --> H[Failure Counter]
    end
    
    subgraph "TTL Values"
        B --> I[600 seconds / 10 minutes]
        F --> J[86400 seconds / 24 hours]
        D --> K[No expiry]
        H --> L[No expiry]
    end
```

## Reservation TTL Flow

```mermaid
sequenceDiagram
    participant Client as Client
    participant API as API
    participant Redis as Redis
    participant Queue as Queue
    participant Cleanup as Cleanup Job
    
    Client->>API: Create Reservation
    API->>Redis: SETEX reservation:token 600 data
    Redis->>API: Success
    API->>Client: Reservation Created
    
    Note over Redis: 10 minute countdown
    
    Redis->>Cleanup: Key Expired Event
    Cleanup->>Queue: Enqueue Rollback
    Queue->>Redis: DEL reservation:token
```

## Data Structures

```mermaid
graph TD
    subgraph "Reservation TTL Data"
        A[state: 'ACTIVE']
        B[token: UUID]
        C[createdAt: ISO String]
        D[expiresAt: ISO String]
    end
    
    subgraph "Circuit Breaker Data"
        E[state: 'CLOSED' | 'OPEN' | 'HALF_OPEN']
        F[failureCount: number]
        G[lastFailureTime: ISO String]
        H[nextAttemptTime: ISO String]
    end
    
    subgraph "Idempotency Cache Data"
        I[requestFingerprint: string]
        J[response: JSON]
        K[createdAt: ISO String]
        L[expiresAt: ISO String]
    end
```

## Redis Operations Flow

```mermaid
graph TD
    subgraph "Set Reservation"
        A[Create Reservation] --> B[Generate Key]
        B --> C[SETEX with 600s TTL]
        C --> D[Store JSON Data]
        D --> E[Return Success]
    end
    
    subgraph "Check Reservation"
        F[Check Token] --> G[GET Key]
        G --> H{Key Exists?}
        H -->|Yes| I[Parse JSON]
        H -->|No| J[Return null]
        I --> K[Return Data]
    end
    
    subgraph "Remove Reservation"
        L[Cancel/Complete] --> M[DEL Key]
        M --> N[Key Removed]
        N --> O[TTL Cancelled]
    end
```

## Circuit Breaker Operations

```mermaid
graph TD
    subgraph "Circuit Breaker States"
        A[CLOSED] --> B[Request Success]
        B --> A
        A --> C[Failure Detected]
        C --> D[Increment Failures]
        D --> E{>= 5 Failures?}
        E -->|Yes| F[OPEN State]
        E -->|No| A
        
        F --> G[30s Cooldown]
        G --> H[HALF_OPEN State]
        H --> I[Test Request]
        I --> J{Success?}
        J -->|Yes| A
        J -->|No| F
    end
    
    subgraph "Redis Storage"
        K[SET circuit-breaker:service state] --> L[Store JSON]
        M[INCR circuit-breaker:service:failures] --> N[Increment Counter]
        O[DEL circuit-breaker:service:failures] --> P[Reset Counter]
    end
```

## Idempotency Cache Flow

```mermaid
sequenceDiagram
    participant Client as Client
    participant API as API
    participant Redis as Redis
    
    Client->>API: Request with Idempotency Key
    API->>Redis: GET idempotency:key
    alt Key Exists
        Redis->>API: Cached Response
        API->>Client: Return Cached
    else Key Not Found
        API->>API: Process Request
        API->>Redis: SETEX idempotency:key 86400 response
        API->>Client: Return Response
    end
```

## Expiration Handling

```mermaid
graph TD
    subgraph "Keyspace Notifications"
        A[Redis Config] --> B[notify-keyspace-events Ex]
        B --> C[Subscribe to __keyevent@0__:expired]
        C --> D[Listen for Expiration]
        D --> E[Parse Message]
        E --> F{reservation:*?}
        F -->|Yes| G[Extract Token]
        F -->|No| H[Ignore]
        G --> I[Queue Rollback]
    end
    
    subgraph "Fallback Cleanup"
        J[Scan Keys] --> K[Check TTL]
        K --> L{TTL < 10s?}
        L -->|Yes| M[Handle Expiration]
        L -->|No| N[Skip]
        M --> O[Queue Rollback]
        O --> P[DEL Key]
    end
```

## Connection Management

```mermaid
graph TD
    subgraph "Redis Connection"
        A[Application Start] --> B[Connect to Redis]
        B --> C{Connection Success?}
        C -->|Yes| D[Setup Error Handlers]
        C -->|No| E[Fallback Mode]
        
        D --> F[Monitor Health]
        F --> G{Connection Lost?}
        G -->|Yes| H[Attempt Reconnect]
        G -->|No| I[Normal Operation]
        
        H --> J{Max Attempts?}
        J -->|Yes| K[Database Fallback]
        J -->|No| L[Retry Connection]
        L --> F
    end
```

## Performance Monitoring

```mermaid
graph LR
    subgraph "Redis Metrics"
        A[Memory Usage] --> B[used_memory]
        C[Operations] --> D[total_commands]
        E[Latency] --> F[ping_time]
        G[Hit Rate] --> H[keyspace_hits / keyspace_misses]
    end
    
    subgraph "Health Checks"
        I[PING] --> J[Response Time]
        K[INFO memory] --> L[Memory Stats]
        M[DBSIZE] --> N[Key Count]
    end
```

## Security Configuration

```mermaid
graph TD
    subgraph "Authentication"
        A[Password Auth] --> B[REDIS_PASSWORD]
        C[TLS/SSL] --> D[Production Only]
        E[Database Isolation] --> F[DB Number 0-15]
    end
    
    subgraph "Command Restrictions"
        G[Allowed Commands] --> H[SET, GET, DEL, SETEX]
        G --> I[EXPIRE, TTL, INCR, PING]
        G --> J[INFO, KEYS, SCAN]
    end
    
    subgraph "Input Validation"
        K[Key Sanitization] --> L[Alphanumeric Only]
        M[Data Validation] --> N[< 1MB Limit]
        O[Injection Prevention] --> P[JSON String Check]
    end
```
