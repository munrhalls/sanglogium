# Technical Diagrams: Checkout Feature

## Phase 1: Basket Page

```mermaid
sequenceDiagram
    participant User as User
    participant Client as Client (Zustand)
    participant Sanity as Sanity CMS
    participant Matrix as Static Matrix (config)

    User->>Client: View basket
    Client->>Sanity: Fetch prices, stock, parcel data
    Sanity-->>Client: Return product data
    Client->>Client: Calculate shipping estimate (static matrix)
    Client->>User: Display basket + shipping estimate
```

## Phase 2: Initiate Checkout

```mermaid
sequenceDiagram
    participant User as User
    participant Server as Next.js Server
    participant Session as iron-session (Encrypted Cookie)

    User->>Server: Click checkout
    Server->>Session: Create encrypted session [{id, qty}]
    Session-->>Server: Session created
    Server->>User: Redirect to /checkout/address
```

## Phase 3: Address Page

```mermaid
sequenceDiagram
    participant User as User
    participant Server as Next.js Server
    participant Google as Google Address API
    participant Session as iron-session (Encrypted Cookie)

    User->>Server: Submit address form
    Server->>Google: Validate address
    Google-->>Server: Address validated
    Server->>Session: Append address
    Session-->>Server: Session updated
    Server->>User: Redirect to /checkout/shipping
```

## Phase 4: Shipping Page

```mermaid
sequenceDiagram
    participant User as User
    participant Server as Next.js Server
    participant Session as iron-session (Encrypted Cookie)
    participant Sanity as Sanity CMS
    participant Shipping as Shipping API (Allekurier/Packlink)

    Server->>Session: Read address & basket IDs
    Session-->>Server: Return address, basket
    Server->>Sanity: Fetch parcel data
    Sanity-->>Server: Return parcel data
    Server->>Shipping: Get shipping options
    Shipping-->>Server: Return options (serviceCode, price)
    Server->>User: Display shipping options
    User->>Server: Select shipping option
    Server->>Session: Save shippingCode & shippingCost
    Session-->>Server: Session updated
    Server->>User: Redirect to /checkout/payment
```

## Phase 5: Payment Page (Security Checkpoint)

```mermaid
sequenceDiagram
    participant Server as Next.js Server
    participant Session as iron-session (Encrypted Cookie)
    participant Sanity as Sanity CMS
    participant Stripe as Stripe API
    participant User as User

    Server->>Session: Read session (basket, address, shippingCode, shippingCost)
    Session-->>Server: Return session data
    Server->>Sanity: Re-fetch real-time prices & stock
    Sanity-->>Server: Return current prices
    Server->>Server: Calculate total (products + shippingCost)
    Server->>Stripe: Create Payment Intent
    Stripe-->>Server: Return client_secret
    Server->>User: Render Stripe Elements
```

## Phase 6: Client Payment

```mermaid
sequenceDiagram
    participant User as User
    participant Stripe as Stripe API

    User->>Stripe: Submit payment via Elements
    Stripe->>Stripe: Process payment
    Stripe-->>User: Payment result
```

## Phase 7: Webhook (Async)

```mermaid
sequenceDiagram
    participant Stripe as Stripe API
    participant Webhook as Stripe Webhook
    participant Sanity as Sanity CMS
    participant Session as iron-session (Encrypted Cookie)

    Stripe->>Webhook: payment_intent.succeeded
    Webhook->>Webhook: Verify signature
    Webhook->>Sanity: Create Order document
    Webhook->>Sanity: Decrement stock
    Webhook->>Session: Destroy session
    Webhook-->>Stripe: 200 OK
```

## Session Data Flow

```mermaid
sequenceDiagram
    participant SA as Server Action
    participant Session as iron-session
    participant Cookie as HTTP-Only Cookie

    Note over SA, Cookie: Session Structure (Encrypted, < 1KB)
    
    SA->>Session: Create { basket: [{id, qty}] }
    Session->>Cookie: Encrypt & save
    Note right of Cookie: Max 4KB limit<br/>AES-GCM encryption
    
    SA->>Session: Append address
    Session->>Cookie: Encrypt & update
    
    SA->>Session: Append shippingCode & shippingCost
    Session->>Cookie: Encrypt & update
    
    SA->>Session: Read session
    Cookie->>Session: Decrypt & return
    Session-->>SA: Return session data
    
    Webhook->>Session: Destroy
    Session->>Cookie: Delete cookie
```

## Shipping Cost Calculation Flow

```mermaid
sequenceDiagram
    participant Server as Next.js Server
    participant Sanity as Sanity CMS
    participant Matrix as Static Matrix (config)
    participant Shipping as Shipping API

    Note over Server, Matrix: Basket Page (Estimate)
    Server->>Sanity: Fetch parcel data
    Sanity-->>Server: Return weight, dimensions
    Server->>Server: Calculate total weight & volumetric class
    Server->>Matrix: Lookup base rate by country/weight
    Matrix-->>Server: Return base rate
    Server->>Server: Display "from X PLN" (DE/GB) or exact rate (PL)

    Note over Server, Shipping: Shipping Page (Exact Rate)
    Server->>Sanity: Fetch parcel data
    Sanity-->>Server: Return weight, dimensions
    Server->>Shipping: Get options with address
    Shipping-->>Server: Return serviceCode + price
    Server->>Server: Save shippingCode & shippingCost to session
```

## High-Ticket Item Reservation Flow (Optional)

```mermaid
sequenceDiagram
    participant User as User
    participant Server as Next.js Server
    participant Sanity as Sanity CMS
    participant Redis as Upstash Redis
    participant Stripe as Stripe API

    Note over User, Redis: For items > $3000 (Pessimistic Locking)
    
    User->>Server: Click checkout (high-ticket item)
    Server->>Sanity: Check stock
    Sanity-->>Server: Stock = 1
    Server->>Redis: Create lock (TTL: 15 min)
    Redis-->>Server: Lock created
    Server->>User: Proceed to checkout
    
    Note over User, Redis: If User B tries checkout
    User->>Server: Click checkout (same item)
    Server->>Redis: Check lock
    Redis-->>Server: Lock exists
    Server->>User: "Item in someone else's basket"
    
    Note over Stripe, Redis: Resolution
    alt User A pays
        Stripe->>Server: payment_intent.succeeded
        Server->>Sanity: Decrement stock to 0
        Server->>Redis: Delete lock
    else User A abandons
        Redis->>Redis: Auto-expire after 15 min
        Note right of Redis: Lock deleted<br/>User B can now buy
    end
```
