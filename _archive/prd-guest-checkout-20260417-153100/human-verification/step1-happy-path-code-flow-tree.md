# Step 1: Happy Path Code Flow Tree

## Happy Path Definition
User clicks checkout → basket has items → reservation created successfully → all items available (full state) → user proceeds to next step

## Visual Overview Tree

```
USER ACTION
└─ Click Checkout Button
   └─ components/checkout/reservation/CheckoutButton.tsx
      ├─ useCheckoutHandler (from EventDeduplicator)
      │  └─ components/checkout/reservation/EventDeduplicator.tsx
      │     └─ eventDeduplicator.canExecute('checkout')
      │        └─ 1-second debounce check
      ├─ Generate UUIDv4 idempotency key
      ├─ Build request payload (clientBasket)
      │  └─ useBasketStore (basket state)
      ├─ POST /api/checkout/reserve
      │  ├─ Headers: Content-Type, Idempotency-Key
      │  └─ Body: { clientBasket: { products, totalAmount, currency } }
      └─ Handle response
         └─ setReservedBasket (Zustand store)

API LAYER
└─ app/api/checkout/reserve/route.ts
   ├─ Validate Content-Type
   ├─ Validate Idempotency-Key header
   ├─ Parse body → clientBasket
   ├─ Initialize FIFOQueue
   │  └─ lib/checkout/reservation/fifo-queue.ts
   │     ├─ getRedisClient()
   │     │  └─ lib/checkout/reservation/redis-client.ts
   │     │     └─ Redis connection (ioredis)
   │     ├─ TokenManager
   │     │  └─ lib/checkout/reservation/redis-managers.ts
   │     ├─ EnhancedIdempotencyManager
   │     │  └─ lib/checkout/reservation/redis-managers.ts
   │     └─ CircuitBreakerManager
   │        └─ lib/checkout/reservation/redis-managers.ts
   ├─ Enqueue request
   │  └─ queue.enqueue(queueRequest)
   │     ├─ Check circuit breaker state
   │     ├─ Check idempotency (existing response?)
   │     ├─ Store idempotency key with empty response
   │     ├─ Add job to BullMQ queue (normal or priority)
   │     └─ Return 202 (processing)
   └─ Return response to client

QUEUE PROCESSING
└─ BullMQ Worker (FIFOQueue)
   └─ processJob(job)
      ├─ Call processRequest(request)
      │  └─ Switch on request.type
      │     └─ 'create_reservation'
      │        └─ onCreateReservation(request)
      │           └─ handleReservationCreation(clientBasket)
      │              └─ lib/checkout/reservation/atomic-reservation-manager.ts
      │                 └─ reserveStock(clientBasket)
      │                    ├─ Phase 1: Atomic Stock Check (Redis WATCH/MULTI)
      │                    │  ├─ Fetch products from Sanity
      │                    │  │  └─ client (sanity/lib/client)
      │                    │  ├─ Calculate available stock
      │                    │  │  └─ available = stock - reservedStock
      │                    │  ├─ Build reserved products
      │                    │  ├─ Redis WATCH on stock_lock keys
      │                    │  ├─ Check for conflicts
      │                    │  └─ Redis MULTI transaction
      │                    │     ├─ Set stock_lock:{productId} (5-min TTL)
      │                    │     └─ Set reservation:{reservationId} (10-min TTL)
      │                    ├─ Phase 2: Update Sanity
      │                    │  ├─ writeClient.transaction()
      │                    │  │  └─ sanity/lib/client (writeClient)
      │                    │  ├─ Increment reservedStock for each product
      │                    │  └─ Commit transaction
      │                    └─ Phase 3: Commit Redis locks
      │                       └─ Update reservation status to 'active'
      ├─ Update idempotency cache with success response
      ├─ Reset circuit breaker
      └─ Log success metrics

STATE MANAGEMENT
└─ store/checkout/reservedBasketSlice.ts
   ├─ Zustand store with persist middleware
   ├─ setReservedBasket(reservedBasket)
   │  └─ Persists to localStorage
   ├─ Computed: hasReservedBasket
   └─ Computed: basketStatus
      ├─ 'none' (no reservation)
      ├─ 'full' (all items reserved at requested quantity)
      ├─ 'decremented' (some items reduced)
      └─ 'empty' (all items out of stock)

UI RENDER
└─ components/checkout/reservation/ReservedBasketView.tsx
   ├─ Read from useReservedBasketStore
   │  ├─ reservedBasket
   │  ├─ basketStatus
   │  ├─ isLoading
   │  └─ error
   └─ Render based on basketStatus
      ├─ 'none' → Show CheckoutButton
      ├─ 'error' → Show error message + RetryButton + CancelButton
      ├─ 'loading' → Show spinner
      ├─ 'empty' → Show out of stock message + CancelButton
      ├─ 'decremented' → Show revised basket + ApproveButton + CancelButton
      └─ 'full' (HAPPY PATH) → Show reserved basket + Proceed button + CancelButton
         ├─ ProductList (all products with full quantities)
         ├─ Total price
         └─ ExpiryTimer (10-minute countdown)

SUPPORTING FILES
├─ lib/checkout/reservation/types.ts
│  ├─ All type definitions (QueueRequest, QueueResponse, ReservedBasket, etc.)
│  └─ TokenState enum (FREE/RESERVING/ACTIVE/CANCELLING/REALIZING)
├─ lib/checkout/reservation/queue-utils.ts
│  ├─ generateFingerprint() - For idempotency
│  ├─ getMaxRetries() - 3 for create, 10 for rollback
│  └─ calculateRetryDelay() - Exponential backoff with jitter
├─ lib/checkout/reservation/state-machine.ts
│  ├─ isValidTransition() - Validate state changes
│  ├─ getValidNextStates() - Get allowed next states
│  └─ canPerformOperation() - Check if operation allowed in state
├─ lib/checkout/reservation/stock-utils.ts
│  ├─ calculateStockReservation() - Pure stock calculation
│  └─ calculateBasketReservation() - Basket-level calculation
├─ lib/checkout/reservation/logging.ts
│  ├─ StructuredLogger - Log levels and formatting
│  ├─ RequestContextLogger - Request-scoped logging
│  └─ MetricsCollector - Counter, gauge, histogram metrics
└─ lib/checkout/reservation/config.ts
   ├─ Zod schema for environment variables
   ├─ loadConfig() - Validate and load env vars
   └─ Config getters (Redis, TTL, circuit breaker)
```

## File Call Relationships (Happy Path Only)

### Entry Point
`components/checkout/reservation/CheckoutButton.tsx`
→ Calls: `EventDeduplicator.useCheckoutHandler`
→ Calls: `fetch('/api/checkout/reserve')`
→ Calls: `useReservedBasketStore.setReservedBasket`

### Event Deduplication
`components/checkout/reservation/EventDeduplicator.tsx`
→ Uses: `eventDeduplicator.canExecute()` (1-second debounce)
→ Calls: AbortController for request cancellation

### API Route
`app/api/checkout/reserve/route.ts`
→ Imports: `getRedisClient()` from `redis-client.ts`
→ Imports: `FIFOQueue` from `fifo-queue.ts`
→ Imports: `getLogger()` from `logging.ts`
→ Imports: `AtomicReservationManager` from `atomic-reservation-manager.ts`
→ Calls: `queue.enqueue(queueRequest)`
→ Returns: NextResponse with 202 status

### FIFO Queue
`lib/checkout/reservation/fifo-queue.ts`
→ Uses: `TokenManager` from `redis-managers.ts`
→ Uses: `EnhancedIdempotencyManager` from `redis-managers.ts`
→ Uses: `CircuitBreakerManager` from `redis-managers.ts`
→ Uses: `generateFingerprint()` from `queue-utils.ts`
→ Uses: `getMaxRetries()` from `queue-utils.ts`
→ Uses: `calculateRetryDelay()` from `queue-utils.ts`
→ Calls: `processRequest()` (delegates to handler)
→ Uses: BullMQ Queue and Worker

### Atomic Reservation Manager
`lib/checkout/reservation/atomic-reservation-manager.ts`
→ Imports: `getLogger()` from `logging.ts`
→ Imports: `client` from `sanity/lib/client`
→ Imports: `writeClient` from `sanity/lib/client`
→ Calls: `redis.watch()` / `redis.multi()` (WATCH/MULTI pattern)
→ Calls: `client.fetch()` (read from Sanity)
→ Calls: `writeClient.transaction().commit()` (write to Sanity)

### Redis Managers
`lib/checkout/reservation/redis-managers.ts`
→ `ReservationTTLManager` - 10-minute TTL on reservation tokens
→ `CircuitBreakerManager` - Failure tracking and state
→ `IdempotencyManager` - 24-hour TTL on idempotency cache
→ `TokenManager` - Token state management

### State Management
`store/checkout/reservedBasketSlice.ts`
→ Uses: Zustand with persist middleware
→ Persists: `reservedBasket` and `error` to localStorage
→ Computed: `hasReservedBasket`, `basketStatus`

### UI Component
`components/checkout/reservation/ReservedBasketView.tsx`
→ Reads: `useReservedBasketStore` (all state)
→ Renders: Based on `basketStatus`
→ Happy path: basketStatus === 'full' → Show Proceed button

## Happy Path Summary

**User Action:** Click checkout button
**Preconditions:** Basket has items, all items in stock
**Flow:**
1. Event deduplication (1-second debounce)
2. Generate idempotency key (UUIDv4)
3. POST to /api/checkout/reserve
4. API validates and enqueues to FIFO queue
5. BullMQ worker processes job
6. AtomicReservationManager reserves stock (Redis WATCH/MULTI + Sanity transaction)
7. Response with reservation token
8. Zustand store saves reserved basket
9. UI renders "full" state with Proceed button
10. User proceeds to next step

**Files Involved (Happy Path Only):**
- 2 UI components (CheckoutButton, ReservedBasketView, EventDeduplicator)
- 1 API route (reserve/route.ts)
- 4 Queue/reservation files (fifo-queue, atomic-reservation-manager, redis-client, redis-managers)
- 1 State management file (reservedBasketSlice.ts)
- 5 Supporting files (types, queue-utils, state-machine, stock-utils, logging, config)
- 2 Sanity clients (read and write)

Total: 15 files in happy path flow
