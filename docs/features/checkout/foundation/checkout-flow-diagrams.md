# Checkout Flow Diagrams per UX Slice

## Overview
Visual representation of the checkout flow broken down into UX slices with Mermaid diagrams.

---

## 1. Basket to Address Slice

```mermaid
sequenceDiagram
    participant User
    participant Client
    participant FSM as State Machine
    participant Server
    participant Redis
    participant Stripe

    User->>Client: Click Checkout
    Client->>FSM: status: 'processing'
    Client->>Client: Generate idempotency key (UUIDv4)
    Client->>Client: Check/create JWT
    Client->>Client: Create/verify guest session
    Client->>Client: Disable button, show loading
    Client->>FSM: Store idempotencyKey

    Client->>Client: Validate basket locally
    Note over Client: Quick checks: required fields, quantities, prices

    Client->>Client: Navigate to address page
    Client->>FSM: status: 'idle' (reset for address slice)
```

---

## 2. Address Form Submission Slice

```mermaid
sequenceDiagram
    participant User
    participant Client
    participant FSM as State Machine
    participant Server
    participant Redis
    participant Stripe

    User->>Client: Submit address form
    Client->>FSM: status: 'processing'

    Client->>Server: POST with:
    Note over Client,Server: idempotencyKey, guestJwt, sessionId, addressData, basketData

    Server->>Redis: Check cache by idempotencyKey
    alt Cache HIT
        Redis-->>Server: Return cached result
        Note over Server: Skip to step 12
    else Cache MISS
        Server->>Redis: Lua script - reserve stock
        Note over Server,Redis: Atomic check AND reserve
        alt Insufficient stock
            Redis-->>Server: Error: insufficient
            Server-->>Client: Error: OUT_OF_STOCK
        else Stock reserved
            Redis-->>Server: Reservation ID
            Server->>Stripe: Create PaymentIntent
            Note over Server,Stripe: amount, metadata, idempotencyKey
            alt Stripe error
                Stripe-->>Server: Error
                Server->>Redis: COMPENSATION: release reservation
                Server-->>Client: Error: PAYMENT_SETUP_FAILED
            else PaymentIntent created
                Stripe-->>Server: clientSecret, paymentIntentId
                Server->>Redis: Set TTL (15 min)
            end
        end
    end

    Server->>Server: Validate basket (Sanity + Stripe)
    Server->>Server: Store in guest session
    Note over Server: paymentIntentId, reservationId, expiresAt

    Server->>Redis: Cache result by idempotencyKey

    Server-->>Client: Return clientSecret, reservationId, expiresAt
    Client->>FSM: Update context with payment data
    Client->>FSM: status: 'idle'
    Client->>Client: Navigate to payment page
```

---

## 3. Payment Page Initialization Slice

```mermaid
sequenceDiagram
    participant Client
    participant FSM as State Machine
    participant Stripe
    participant User

    Client->>Client: Payment page mounts
    Client->>FSM: Get expiresAt from context

    alt Expired
        Client->>Client: Redirect to basket with error
    else Valid
        Client->>Client: Show countdown timer (optional)

        Note over Client: Initialize Stripe Elements (React 18 safe)
        Client->>Stripe: loadStripe (module scope)
        Client->>Client: useMemo options [clientSecret]

        alt clientSecret exists
            Client->>Client: Render Elements with PaymentForm
        else No clientSecret
            Client->>Client: Show Spinner
        end
    end
```

---

## 4. Payment Submission Slice

```mermaid
sequenceDiagram
    participant User
    participant Client
    participant FSM as State Machine
    participant Stripe
    participant Server

    User->>Client: Submit payment form
    Client->>FSM: status: 'processing'

    Client->>Stripe: elements.submit()
    alt Submit error
        Stripe-->>Client: error
        Client->>FSM: status: 'idle', errorMessage
    else Submit success
        Client->>Stripe: confirmPayment
        Note over Client,Stripe: elements, clientSecret, return_url, redirect: 'if_required'

        alt Immediate error
            Stripe-->>Client: error
            Client->>FSM: status: 'idle', errorMessage
        else Success (succeeded/processing)
            Stripe-->>Client: paymentIntent
            Client->>FSM: status: 'complete'
            Client->>Client: Navigate to /checkout/success
        else Redirect required
            Note over Stripe: 3D Secure - auto-redirect
            Stripe->>Server: POST /checkout/success (webhook)
        end
    end
```

---

## 5. Webhook Handlers Slice

```mermaid
sequenceDiagram
    participant Stripe
    participant Server
    participant Redis
    participant DB
    participant Email

    Note over Stripe,Server: Verify Stripe-Signature
    Note over Stripe,Server: Process idempotently (check event.id)

    alt payment_intent.succeeded
        Stripe->>Server: Webhook event
        Server->>DB: Commit reservation (permanent)
        Server->>DB: Create order record
        Server->>Email: Send confirmation
        Server->>Redis: Release idempotency cache (optional)
    else payment_intent.payment_failed
        Stripe->>Server: Webhook event
        Server->>Redis: Release stock reservation
        Server->>Server: Clear paymentIntentId from session
    else payment_intent.canceled
        Stripe->>Server: Webhook event
        Server->>Redis: Release stock reservation
    end

    Note over Redis: TTL auto-releases after 15 minutes (safety net)
```

---

## 6. Complete End-to-End Flow

```mermaid
graph TD
    A[User clicks Checkout] --> B[Generate idempotency key]
    B --> C[Validate basket locally]
    C --> D[Navigate to Address page]

    D --> E[User submits address]
    E --> F{Cache hit?}
    F -->|Yes| G[Return cached result]
    F -->|No| H[Reserve stock in Redis]
    H --> I{Stock sufficient?}
    I -->|No| J[Return error]
    I -->|Yes| K[Create PaymentIntent]
    K --> L{Stripe success?}
    L -->|No| M[Release reservation]
    L -->|Yes| N[Validate basket]
    N --> O[Store in session]
    O --> P[Cache result]
    P --> Q[Return clientSecret]

    G --> R[Navigate to Payment]
    Q --> R

    R --> S[Check expiration]
    S -->|Expired| T[Redirect to basket]
    S -->|Valid| U[Initialize Stripe Elements]
    U --> V[User submits payment]
    V --> W[elements.submit]
    W --> X{Submit success?}
    X -->|No| Y[Show error]
    X -->|Yes| Z[confirmPayment]
    Z --> AA{Payment success?}
    AA -->|No| AB[Show error]
    AA -->|Success| AC[Navigate to success]
    AA -->|Redirect| AD[3D Secure flow]

    AD --> AE[Webhook: payment_intent.succeeded]
    AC --> AE
    AE --> AF[Commit reservation]
    AF --> AG[Create order]
    AG --> AH[Send confirmation]

    style A fill:#e1f5fe
    style AE fill:#e8f5e9
    style AC fill:#e8f5e9
    style J fill:#ffebee
    style M fill:#ffebee
    style Y fill:#ffebee
    style AB fill:#ffebee
    style T fill:#fff3e0
```

---

## FSM State Transitions

```mermaid
stateDiagram-v2
    [*] --> Idle

    Idle --> Processing: checkout click
    Processing --> Idle: address navigation

    Idle --> Processing: address submit
    Processing --> Idle: address error
    Processing --> Idle: payment ready

    Idle --> Processing: payment submit
    Processing --> Complete: payment success
    Processing --> Idle: payment error

    Complete --> [*]

    note right of Processing
        errorMessage = null
        Loading states shown
    end note

    note right of Idle
        Can have errorMessage
        Ready for next action
    end note
```

---

## Data Flow Architecture

```mermaid
graph LR
    subgraph Client Side
        A[FSM Context]
        B[Local Validation]
        C[Stripe Elements]
        D[Guest Session]
    end

    subgraph Server Side
        E[Idempotency Cache]
        F[Stock Reservation]
        G[PaymentIntent Creation]
        H[Basket Validation]
    end

    subgraph External Services
        I[Redis]
        J[Stripe API]
        K[Sanity CMS]
    end

    A --> E
    B --> H
    C --> J
    D --> E

    E --> I
    F --> I
    G --> J
    H --> K

    style Client Side fill:#e3f2fd
    style Server Side fill:#f3e5f5
    style External Services fill:#e8f5e9
```

---

## Error Handling Flow

```mermaid
graph TD
    A[Operation starts] --> B{Error occurred?}
    B -->|No| C[Continue flow]
    B -->|Yes| D{Error type?}

    D -->|Stock insufficient| E[Return OUT_OF_STOCK]
    D -->|Stripe error| F[Release reservation]
    F --> G[Return PAYMENT_SETUP_FAILED]
    D -->|Validation error| H[Return VALIDATION_ERROR]
    D -->|Payment submit error| I[Show payment error]
    D -->|Network error| J[Retry or timeout]

    E --> K[FSM: idle + error]
    G --> K
    H --> K
    I --> K
    J --> K

    K --> L[User sees error message]
    L --> M[Can retry from current step]

    style A fill:#e1f5fe
    style C fill:#e8f5e9
    style K fill:#ffebee
    style L fill:#fff3e0
```
