# Guest Checkout Inventory Reservation - Core Idea Diagram

## Invariant Relationships

```mermaid
graph LR
    %% Core Components
    CB[Client Basket<br/>Mutable] --> |1. Create Request| FIFO[FIFO CMS Queue<br/>Create/Delete Operations]
    FIFO --> |2. Process Request| CMS[Reserved Basket<br/>CMS Stock & Stripe Prices]
    CMS --> |3. Return Response| UI[UI State<br/>Immutable Client State]

    %% Invariant Arrows
    CB -.->|100% Separate| CMS
    FIFO -.->|Sequential Processing| CMS
    CMS -.->|Latest CMS Data Only| UI

    %% Styling
    classDef basket fill:#e3f2fd
    classDef queue fill:#e8f5e8
    classDef reserved fill:#fff3e0
    classDef ui fill:#f3e5f5

    class CB basket
    class FIFO queue
    class CMS reserved
    class UI ui
```

## Core Flow

```mermaid
graph TD
    %% Step 1: Client Basket to Queue
    ClientBasket[Client Basket<br/>User's Current Selection] --> |Click Checkout| CreateRequest[Create Request<br/>Client Basket Payload]
    CreateRequest --> |FIFO Queue| Queue[First In, First Out<br/>Processing Order]

    %% Step 2: Queue to Reserved Basket
    Queue --> |Process First Request| CMS[CMS Reserved Basket<br/>Real Stock Check<br/>Stripe Price Validation]
    CMS --> |Atomic Operation| StockUpdate[Update Reserved Stock<br/>Maintain Integrity]

    %% Step 3: Reserved Basket to UI
    CMS --> |Return Immutable State| ReservedBasket[Reserved Basket<br/>Client Side<br/>Reflects CMS Truth]
    ReservedBasket --> |Display State| UI[UI Updates<br/>Based on Reserved Basket]

    %% Step 4: Rollback Path
    UI --> |Cancel/Timeout| RollbackRequest[Rollback Request<br/>Same Reservation Token]
    RollbackRequest --> |FIFO Queue| Queue
    Queue --> |Process Rollback| Rollback[Restore Stock<br/>Delete Reserved Basket]

    %% Invariant Relationships
    ClientBasket -.->|Never Influences| CMS
    CMS -.->|Always Reflects| StockCheck[Latest CMS Stock<br/>Latest Stripe Prices]
    ReservedBasket -.->|Immutable Copy| CMS

    %% Styling
    classDef client fill:#e3f2fd
    classDef queue fill:#e8f5e8
    classDef cms fill:#fff3e0
    classDef state fill:#f3e5f5

    class ClientBasket,CreateRequest client
    class Queue,StockUpdate queue
    class CMS,Rollback,StockCheck cms
    class ReservedBasket,UI state
```

## Key Invariant Rules

### 1. Client Basket Separation
- **Rule**: Client basket NEVER influences reserved basket
- **Flow**: Client basket is input only, never referenced again
- **Purpose**: Prevents stale data from affecting reservations

### 2. CMS Data Authority
- **Rule**: Reserved basket ALWAYS reflects latest CMS data
- **Flow**: Fresh stock check and price validation on each reservation
- **Purpose**: Ensures inventory accuracy and pricing consistency

### 3. FIFO Queue Processing
- **Rule**: Requests processed sequentially, never concurrently
- **Flow**: First request completes before second starts
- **Purpose**: Maintains data integrity and prevents race conditions

### 4. Immutable Client State
- **Rule**: Reserved basket state is immutable on client
- **Flow**: Only replaced by new CMS response, never modified
- **Purpose**: Prevents client-side corruption of reservation data

## State Transformations

```mermaid
stateDiagram-v2
    [*] --> ClientBasket: User Selection
    ClientBasket --> InQueue: Click Checkout
    InQueue --> Processing: FIFO Processing
    Processing --> Reserved: CMS Response
    Processing --> Failed: Error

    Reserved --> UI_State: Display to User
    UI_State --> Rollback: Cancel/Timeout
    Rollback --> ClientBasket: Restore

    Reserved --> Complete: Payment Success
    Complete --> [*]

    Failed --> ClientBasket: Retry
    Rollback --> [*]
```

## Data Flow Invariants

| Component | Input | Output | Invariant |
|-----------|-------|--------|-----------|
| Client Basket | User Selection | Request Payload | Mutable, user-controlled |
| FIFO Queue | Request Payload | Processing Order | Sequential, first-in-first-out |
| Reserved Basket | CMS Data | Immutable State | Latest stock & prices only |
| UI State | Reserved Basket | User Display | Immutable copy of CMS data |
