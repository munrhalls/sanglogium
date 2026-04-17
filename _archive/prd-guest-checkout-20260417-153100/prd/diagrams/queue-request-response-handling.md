# Queue Request/Response Handling Diagram

## Request Flow Overview

```mermaid
graph TD
    subgraph "Client Request"
        A[User Action] --> B[HTTP Request]
        B --> C[Request Validator]
        C --> D[Idempotency Check]
        D --> E[Queue Enqueue]
        E --> F[Response Generator]
        F --> G[HTTP Response]
    end
    
    subgraph "Queue Processing"
        E --> H[Queue Processor]
        H --> I[Business Logic]
        I --> J[Database Update]
        J --> K[Cache Update]
        K --> L[Response Store]
    end
```

## Request Structures

```mermaid
graph TD
    subgraph "Create Reservation Request"
        A1[Headers]
        A1 --> A11[Content-Type: application/json]
        A1 --> A12[Idempotency-Key: UUIDv4]
        A1 --> A13[X-Request-ID: Optional]
        
        B1[Body]
        B1 --> B11[clientBasket: ClientBasket]
    end
    
    subgraph "Rollback Reservation Request"
        A2[Headers]
        A2 --> A21[Content-Type: application/json]
        A2 --> A22[Idempotency-Key: UUIDv4]
        A2 --> A23[X-Request-ID: Optional]
        
        B2[Body]
        B2 --> B21[reservationToken: string]
    end
    
    subgraph "Realize Reservation Request"
        A3[Headers]
        A3 --> A31[stripe-signature: string]
        A3 --> A32[Content-Type: application/json]
        
        B3[Body]
        B3 --> B31[type: string]
        B3 --> B32[data: StripeWebhookData]
    end
```

## Response Structures

```mermaid
graph TD
    subgraph "Success Response"
        A[success: true]
        B[requestId: string]
        C[status: 'completed' | 'processing']
        D[data: ReservedBasket]
        E[timestamp: string]
    end
    
    subgraph "Error Response"
        F[success: false]
        G[requestId: string]
        H[status: 'failed']
        I[error: ErrorObject]
        J[timestamp: string]
    end
    
    subgraph "Error Object"
        I --> I1[code: ErrorCode]
        I --> I2[message: string]
        I --> I3[details?: object]
        I --> I4[retryable?: boolean]
        I --> I5[retryAfter?: number]
    end
```

## HTTP Status Code Mapping

```mermaid
graph LR
    subgraph "Success Codes"
        A[200] --> B[completed]
        C[202] --> D[processing]
    end
    
    subgraph "Client Error Codes"
        E[400] --> F[failed]
        G[401] --> F
        H[409] --> F
        I[422] --> F
        J[429] --> F
    end
    
    subgraph "Server Error Codes"
        K[500] --> F
        L[503] --> F
    end
```

## Request Processing Flow

```mermaid
sequenceDiagram
    participant Client as Client
    participant API as API Gateway
    participant Validator as Request Validator
    participant Idempotency as Idempotency Store
    participant Queue as FIFO Queue
    participant Response as Response Generator
    
    Client->>API: HTTP Request
    API->>Validator: Validate Request
    Validator->>Validator: Check Format
    Validator->>Idempotency: Check Key
    alt Key Exists
        Idempotency->>Validator: Return Cached Response
        Validator->>Client: Cached Response
    else Key New
        Validator->>Queue: Enqueue Request
        Queue->>Response: Generate Initial Response
        Response->>Client: 202 Accepted
    end
```

## Idempotency Flow

```mermaid
graph TD
    A[Request with Idempotency Key] --> B{Key Exists?}
    B -->|No| C[Process Request]
    B -->|Yes| D[Verify Fingerprint]
    
    D --> E{Fingerprint Match?}
    E -->|Yes| F[Return Cached Response]
    E -->|No| G[Return Error]
    
    C --> H[Generate Fingerprint]
    H --> I[Store Request]
    I --> J[Process Business Logic]
    J --> K[Store Response]
    K --> L[Return Response]
    
    G --> M[Error: IDEMPOTENCY_KEY_MISMATCH]
```

## Error Handling Flow

```mermaid
graph TD
    A[Error Occurred] --> B{Error Type}
    
    B -->|Validation| C[400 Bad Request]
    B -->|Auth| D[401 Unauthorized]
    B -->|Conflict| E[409 Conflict]
    B -->|Rate Limit| F[429 Too Many Requests]
    B -->|Database| G[500 Internal Error]
    B -->|Service Unavailable| H[503 Service Unavailable]
    
    C --> I[Return Error Response]
    D --> I
    E --> I
    F --> I
    G --> I
    H --> I
    
    I --> J{Retryable?}
    J -->|Yes| K[Include retryAfter]
    J -->|No| L[No Retry]
```

## Request Validation

```mermaid
graph TD
    subgraph "Validation Layers"
        A[HTTP Headers] --> B[Content-Type Check]
        A --> C[Idempotency Key Check]
        A --> D[Request ID Check]
        
        E[Request Body] --> F[Schema Validation]
        F --> G[Field Type Check]
        G --> H[Required Field Check]
        H --> I[Business Rule Check]
    end
    
    subgraph "Validation Results"
        J[All Valid] --> K[Process Request]
        L[Invalid] --> M[Error Response]
    end
```

## Response Generation

```mermaid
graph TD
    A[Process Result] --> B{Success?}
    
    B -->|Yes| C[Generate Success Response]
    B -->|No| D[Generate Error Response]
    
    C --> E[Set success: true]
    C --> F[Set status: completed]
    C --> G[Include data]
    
    D --> H[Set success: false]
    D --> I[Set status: failed]
    D --> J[Include error details]
    
    E --> K[Add timestamp]
    F --> K
    G --> K
    H --> K
    I --> K
    J --> K
    
    K --> L[Format JSON]
    L --> M[Set HTTP Headers]
    M --> N[Send Response]
```

## Webhook Processing

```mermaid
sequenceDiagram
    participant Stripe as Stripe
    participant Webhook as Webhook Handler
    participant Validator as Signature Validator
    participant Queue as Priority Queue
    participant DB as Database
    
    Stripe->>Webhook: Webhook Event
    Webhook->>Validator: Verify Signature
    Validator->>Webhook: Signature Valid
    Webhook->>Queue: Enqueue High Priority
    Queue->>DB: Process Payment Realize
    DB->>Queue: Update Stock
    Queue->>Webhook: Success
    Webhook->>Stripe: 200 OK
```

## Request Trace Flow

```mermaid
graph LR
    subgraph "Request Trace"
        A[X-Request-ID] --> B[Request ID]
        C[Idempotency Key] --> D[Request Fingerprint]
        E[Reservation Token] --> F[Operation Tracking]
    end
    
    subgraph "Response Trace"
        G[requestId] --> H[Link to Request]
        I[timestamp] --> J[Timing Analysis]
        K[status] --> L[State Tracking]
    end
    
    subgraph "Logging Context"
        M[Request ID] --> N[Correlation Logs]
        O[Token] --> P[Operation Logs]
        Q[Component] --> R[Service Logs]
    end
```
