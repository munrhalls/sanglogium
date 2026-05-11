# Technical Diagrams: Checkout Queue

## Happy Path Flow

```mermaid
flowchart LR
    UI[UI] --> Queue[Queue<br/>one at a time]
    Queue --> Atomic[Atomic<br/>processing]
    Atomic --> CMS[Sanity CMS]
    CMS --> Pop[Queue<br/>pop]
    Pop --> Response[UI response]
    Response --> Session[Session<br/>save basket reservation ID]
    Session --> Navigate[Navigate<br/>to checkout address]
```

## Atomic FIFO Processing

```mermaid
sequenceDiagram
    participant Client as Client
    participant API as /api/checkout-queue
    participant Processor as Processor
    participant Redis as Redis
    participant CMS as Sanity CMS
    participant Trace as Trace Log

    Client->>API: POST BasketReservation
    API->>Processor: processInline(raw)
    Processor->>Processor: isBasketReservation(raw)
    alt Invalid input
        Processor-->>API: 400 error
        API-->>Client: 400 error
    else Valid input
        Processor->>Trace: trace('request received')
        Processor->>Redis: RPUSH queue:checkout
        Processor->>Trace: trace('queued')
        
        Note over Processor,Redis: Spin loop: SET NX lock + LINDEX head check<br/>Retry every 25ms until at head (45s timeout)
        
        Processor->>Trace: trace('processing')
        Processor->>CMS: create basketReservation doc
        Processor->>Trace: trace('reservation document created')
        Processor->>CMS: transaction inc reservedStock
        Processor->>Trace: trace('reservedStock incremented')
        Processor->>CMS: fetch updated products
        Processor->>Redis: LPOP queue:checkout
        Processor->>Redis: DEL lock:checkout:processing
        Processor->>Trace: trace('complete')
        Processor-->>API: 202 + BasketReservationResponse
        API-->>Client: 202 + reservationId
    end
```

## TTL Expiration Flow

```mermaid
flowchart LR
    Request[Reservation Request] --> TTL[API Response<br/>includes TTL]
    TTL --> Sanity[Sanity Doc<br/>with expiresAt]
    Sanity --> Redis[Redis Queue<br/>for processing]
    Redis --> Cleanup[Background Cleanup]
    Cleanup --> Stock[Release<br/>reservedStock]
    Cleanup --> Delete[Delete<br/>expired doc]
```

## Cleanup Infrastructure

```mermaid
sequenceDiagram
    participant Job as Background Job
    participant CMS as Sanity CMS
    participant Stock as Stock Release
    participant Delete as Doc Deletion

    Job->>CMS: findExpiredReservations()
    CMS-->>Job: [expired reservations]
    
    loop For each expired reservation
        Job->>Stock: releaseReservedStock(productId, quantity)
        Stock->>CMS: transaction dec reservedStock
        CMS-->>Stock: success/failure
        Stock-->>Job: result
        
        Job->>Delete: deleteExpiredReservation(reservationId)
        Delete->>CMS: delete document
        CMS-->>Delete: success/failure
        Delete-->>Job: result
    end
    
    Job-->>Job: Cleanup summary
```

## Concurrent Request Serialization

```mermaid
sequenceDiagram
    participant R1 as Request 1
    participant R2 as Request 2
    participant R3 as Request 3
    participant Queue as Redis Queue
    participant Lock as Redis Lock
    participant CMS as Sanity CMS

    R1->>Queue: RPUSH (enqueues at index 0)
    R2->>Queue: RPUSH (enqueues at index 1)
    R3->>Queue: RPUSH (enqueues at index 2)
    
    R1->>Lock: SET NX (acquires lock)
    R1->>Queue: LINDEX 0 (is at head)
    R1->>CMS: Process reservation
    R1->>Queue: LPOP (removes from head)
    R1->>Lock: DEL (releases lock)
    
    R2->>Lock: SET NX (acquires lock)
    R2->>Queue: LINDEX 0 (now at head)
    R2->>CMS: Process reservation
    R2->>Queue: LPOP (removes from head)
    R2->>Lock: DEL (releases lock)
    
    R3->>Lock: SET NX (acquires lock)
    R3->>Queue: LINDEX 0 (now at head)
    R3->>CMS: Process reservation
    R3->>Queue: LPOP (removes from head)
    R3->>Lock: DEL (releases lock)
```

Note: This diagram shows the ideal sequential processing. In reality, requests retry every 25ms until they reach the head, ensuring only one request processes at a time.
