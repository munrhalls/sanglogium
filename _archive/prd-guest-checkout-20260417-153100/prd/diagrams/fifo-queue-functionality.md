# FIFO Queue Functionality Diagram

## Queue Architecture Overview

```mermaid
graph TD
    subgraph "Queue System"
        A[Client Request] --> B[Request Validator]
        B --> C[Idempotency Check]
        C --> D[Priority Router]
        D --> E[FIFO Queue]
        D --> F[Priority Queue]
        E --> G[Queue Processor]
        F --> G
        G --> H[Database/Sanity]
        G --> I[Redis TTL]
    end

    subgraph "Retry System"
        J[Retry Handler] --> K[Exponential Backoff]
        K --> L[Circuit Breaker]
        L --> M[Retry Queue]
        M --> E
    end
```

## Request Flow Types

```mermaid
graph LR
    subgraph "Request Types"
        A[create_reservation] --> B[Normal Priority]
        C[rollback_reservation] --> B
        D[realize_reservation] --> E[High Priority]
    end

    subgraph "Queue Placement"
        B --> F[FIFO Queue]
        E --> G[Priority Queue]
        F --> H[Processor]
        G --> H
    end
```

## Queue Request Structure

```mermaid
graph TD
    subgraph "QueueRequest"
        A[id: UUID]
        B[type: QueueRequestType]
        C[reservationToken?: string]
        D[idempotencyKey: string]
        E[payload: ClientBasket | metadata]
        F[priority: 'normal' | 'high']
        G[createdAt: Date]
        H[retryCount: number]
        I[lastRetryAt?: Date]
    end

    subgraph "QueueRequestType"
        B --> J[create_reservation]
        B --> K[rollback_reservation]
        B --> L[realize_reservation]
    end
```

## Token State Machine

```mermaid
stateDiagram-v2
    [*] --> FREE: Initial State

    FREE --> RESERVING: Create Request
    RESERVING --> ACTIVE: Success
    RESERVING --> FREE: Failure

    ACTIVE --> CANCELLING: Cancel Request
    ACTIVE --> REALIZING: Payment Success

    CANCELLING --> FREE: Rollback Complete
    REALIZING --> FREE: Realize Complete

    note right of ACTIVE
        10-minute TTL auto-rollback
    end note

    note right of RESERVING
        One operation per token
        Atomic transition
    end note
```

## Queue Processing Flow

```mermaid
sequenceDiagram
    participant Client as Client
    participant Queue as FIFO Queue
    participant Processor as Queue Processor
    participant DB as Database
    participant Redis as Redis TTL
    participant Sanity as Sanity CMS

    Client->>Queue: enqueue(request)
    Queue->>Processor: processNext()

    Processor->>DB: begin transaction
    Processor->>DB: check token state
    alt token state valid
        Processor->>Sanity: update stock
        Processor->>Redis: set TTL
        Processor->>DB: commit transaction
        Processor->>Client: success response
    else token state invalid
        Processor->>DB: rollback transaction
        Processor->>Client: error response
    end
```

## Retry Logic Flow

```mermaid
graph TD
    A[Request Failed] --> B{Transient Error?}
    B -->|Yes| C[Increment Retry Count]
    B -->|No| D[Return Error]

    C --> E{Retry Count < Max?}
    E -->|Yes| F[Calculate Backoff]
    E -->|No| G[Log as Stuck-Reservation]

    F --> H[Apply Jitter ±25%]
    H --> I{Circuit Breaker Open?}
    I -->|No| J[Schedule Retry]
    I -->|Yes| K[Fail Fast]

    J --> L[Wait Backoff Time]
    L --> M[Retry Request]
```

## Circuit Breaker States

```mermaid
stateDiagram-v2
    [*] --> CLOSED: Initial State

    CLOSED --> OPEN: 5+ failures
    OPEN --> HALF_OPEN: 30s cooldown
    HALF_OPEN --> CLOSED: Success
    HALF_OPEN --> OPEN: Failure

    note right of CLOSED
        Normal operation
        Pass all requests
    end note

    note right of OPEN
        Fail fast
        No requests processed
    end note

    note right of HALF_OPEN
        Test requests
        Limited throughput
    end note
```

## Priority Queue Processing

```mermaid
graph TD
    subgraph "Priority Processing"
        A[Payment Webhook] --> B[realize_reservation]
        B --> C[Priority Queue]
        C --> D[High Priority Processor]
        D --> E[Immediate Processing]
    end

    subgraph "Normal Processing"
        F[Client Request] --> G[create/rollback]
        G --> H[FIFO Queue]
        H --> I[Normal Processor]
        I --> J[Sequential Processing]
    end

    E --> K[Database]
    J --> K
```

## Atomic Operations

```mermaid
graph TD
    subgraph "Database Transaction"
        A[BEGIN] --> B[Lock Token]
        B --> C[Check State]
        C --> D[Update Stock]
        D --> E[Update Token State]
        E --> F[Set Redis TTL]
        F --> G[COMMIT]

        C --> H[State Invalid]
        H --> I[ROLLBACK]
    end

    subgraph "Rollback Actions"
        I --> J[Restore Stock]
        J --> K[Reset Token State]
        K --> L[Clear Redis]
    end
```

## Multi-tab Protection

```mermaid
graph TD
    subgraph "Concurrent Request Handling"
        A[Tab 1 Request] --> B[Check Token State]
        C[Tab 2 Request] --> B

        B --> D{State = FREE?}
        D -->|Yes| E[Set RESERVING]
        D -->|No| F[Return Error]

        E --> G[Process Request]
        G --> H[Set ACTIVE]

        F --> I[Operation in Progress Error]
    end

    subgraph "State Transitions"
        H --> J[Tab 1 Complete]
        J --> K[Set FREE]
        K --> L[Tab 2 Can Proceed]
    end
```

## Monitoring and Health

```mermaid
graph LR
    subgraph "Queue Metrics"
        A[Queue Size] --> B[Pending Count]
        C[Processing Time] --> D[Average Latency]
        E[Success Rate] --> F[Error Percentage]
    end

    subgraph "Health Checks"
        G[Queue Health] --> H[Processor Status]
        I[Redis Health] --> J[TTL Management]
        K[Database Health] --> L[Transaction Success]
    end
```
