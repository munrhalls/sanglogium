# Trace Results: Checkout Button -> Redis Queue -> CMS Flow

## Flow Overview
**Complete Flow:** Button click -> Event deduplication -> API request -> Redis queue -> Atomic reservation -> CMS update -> Response

## Visual Flow Diagram

```
User Click
     ↓
[EventDeduplicator.tsx]
     ↓ (useCheckoutHandler)
[CheckoutButton.tsx]
     ↓ (fetch POST)
[route.ts]
     ↓ (new FIFOQueue)
[fifo-queue.ts]
     ↓ (processJob)
[atomic-reservation-manager.ts]
     ↓ (client.fetch)
[Sanity CMS]
     ↓ (response)
[CheckoutButton.tsx] (UI update)
```

## File Connection Summary

1. **EventDeduplicator.tsx** → **CheckoutButton.tsx**
   - Exports: `useCheckoutHandler`
   - Used at: CheckoutButton line 91

2. **CheckoutButton.tsx** → **route.ts**
   - API call: `fetch('/api/checkout/reserve')`
   - Method: POST with Idempotency-Key header

3. **route.ts** → **fifo-queue.ts**
   - Import: `import { FIFOQueue } from '@/lib/checkout/reservation/fifo-queue'`
   - Usage: `new FIFOQueue(redis, onCreateReservation, ...)`

4. **fifo-queue.ts** → **atomic-reservation-manager.ts**
   - Import: `import { AtomicReservationManager } from '@/lib/checkout/reservation/atomic-reservation-manager'`
   - Usage: `new AtomicReservationManager(redis)`

5. **atomic-reservation-manager.ts** → **Sanity CMS**
   - Import: `import { client, writeClient } from '@/sanity/lib/client'`
   - Usage: `client.fetch()` and `writeClient.transaction()`

## Code Files in Trace Order

### 1. Event Deduplicator
**File:** `components/checkout/reservation/EventDeduplicator.tsx`
**Role:** First line of defense - prevents double-clicks with 1-second debounce
**Key Functions:**
- `useCheckoutHandler()` - Wraps checkout action with deduplication
- `EventDeduplicatorSingleton.canExecute()` - Checks if action can proceed
- `EventDeduplicatorSingleton.markStart()` - Marks action as in-progress

**Flow Entry Point:** Line 98 - `handleCheckout()` called from CheckoutButton

---

### 2. Checkout Button Component
**File:** `components/checkout/reservation/CheckoutButton.tsx`
**Role:** UI component - captures user click and forms API request
**Key Functions:**
- `handleCheckoutAction()` - Lines 23-89, main checkout logic
- Creates idempotency key (line 40)
- Forms request payload (lines 42-52)
- Makes API call (lines 54-61)
- Maps response to ReservedBasket (lines 70-82)

**Flow Connection:** Uses `useCheckoutHandler` from EventDeduplicator

---

### 3. API Route Handler
**File:** `app/api/checkout/reserve/route.ts`
**Role:** Server endpoint - validates, processes, and enqueues requests
**Key Functions:**
- `POST()` - Lines 134-276, main API handler
- `handleReservationCreation()` - Lines 24-62, queue handler
- Validates headers (lines 144-169)
- Parses body (lines 172-183)
- Creates FIFOQueue (lines 188-202)
- Enqueues request (lines 219)
- Returns 202 response (lines 247-255)

**Flow Connection:** Receives POST from CheckoutButton

---

### 4. FIFO Queue Implementation
**File:** `lib/checkout/reservation/fifo-queue.ts`
**Role:** Redis-backed queue using BullMQ - manages job processing
**Key Functions:**
- `FIFOQueue.enqueue()` - Lines 95-192, adds job to queue
- `processJob()` - Lines 198-291, processes queued jobs
- `processRequest()` - Lines 297-324, routes to handlers
- `generateFingerprint()` - Lines 357-365, for idempotency

**Flow Connection:** Instantiated in API route, calls AtomicReservationManager

---

### 5. Atomic Reservation Manager
**File:** `lib/checkout/reservation/atomic-reservation-manager.ts`
**Role:** Core reservation logic - atomic stock checks and CMS updates
**Key Functions:**
- `reserveStock()` - Lines 52-146, main reservation orchestrator
- `performAtomicStockCheck()` - Lines 151-276, Phase 1: Redis operations
- `updateSanityStock()` - Lines 281-321, Phase 2: CMS updates
- `commitRedisLocks()` - Lines 326-337, finalizes reservation
- `rollbackReservation()` - Lines 379-419, cleanup on failure

**Flow Connection:** Called by FIFOQueue worker, updates Sanity CMS

## Bus Stop Analysis

### Bus Stop 1: Button Click (Deduplication)
**Location:** `EventDeduplicator.tsx` line 98
**Expected:**
- Click passes 1-second debounce check
- Action marked as in-progress
- Console log: "Checkout action started"

**Actual Code:**
```typescript
const handleCheckout = useCallback(async () => {
  await execute(onCheckout)
}, [execute, onCheckout])
```

### Bus Stop 2: Request Formation
**Location:** `CheckoutButton.tsx` lines 40-52
**Expected:**
- UUID v4 generated for idempotencyKey
- clientBasket structured with products array
- Each product has id, stripePriceId, quantity

**Actual Code:**
```typescript
const idempotencyKey = uuidv4()
const requestPayload = {
  clientBasket: {
    products: basket.map((item) => ({
      id: item._id,
      stripePriceId: item.stripePriceId || '',
      quantity: item.quantity,
    })),
    totalAmount: basket.reduce((sum, item) => sum + item.displayPrice * item.quantity, 0),
    currency: 'PLN',
  },
};
```

### Bus Stop 3: API Call Initiation
**Location:** `CheckoutButton.tsx` lines 54-61
**Expected:**
- POST to `/api/checkout/reserve`
- Headers: Content-Type + Idempotency-Key
- Body: JSON string of requestPayload

**Actual Code:**
```typescript
const response = await fetch('/api/checkout/reserve', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Idempotency-Key': idempotencyKey,
  },
  body: JSON.stringify(requestPayload),
})
```

### Bus Stop 4: Server Receives Request
**Location:** `app/api/checkout/reserve/route.ts` line 134
**Expected:**
- Request parsed successfully
- Headers validated (Content-Type, Idempotency-Key)
- Body contains clientBasket

**Actual Code (with existing trace):**
```typescript
export async function POST(request: NextRequest): Promise<NextResponse<APIResponse>> {
  // Bus Stop 4: Server receives request
  console.log('TRACE: Request received - OK');
```

### Bus Stop 5: Redis Connection
**Location:** `app/api/checkout/reserve/route.ts` line 186
**Expected:**
- Redis client connected (localhost:6379)
- FIFOQueue instantiated with handlers
- Connection ready for operations

**Actual Code (with existing trace):**
```typescript
const redis = getRedisClient()
console.log('TRACE: Redis connected - OK');
const queue = new FIFOQueue(redis, ...)
```

### Bus Stop 6: Queue Enqueue
**Location:** `app/api/checkout/reserve/route.ts` lines 204-219
**Expected:**
- QueueRequest created with UUID
- Type: 'create_reservation'
- Added to BullMQ queue

**Actual Code (with existing trace):**
```typescript
const queueRequest: QueueRequest = {
  id: uuidv4(),
  type: 'create_reservation',
  idempotencyKey,
  priority: 'normal',
  payload: { clientBasket: body.clientBasket },
  retryCount: 0
}
console.log('TRACE: Request enqueued - OK');
const queueResponse = await queue.enqueue(queueRequest)
```

### Bus Stop 7: Job Processing Start
**Location:** `fifo-queue.ts` line 198
**Expected:**
- BullMQ worker picks up job
- Job data contains QueueRequest
- Processing begins

**Actual Code:**
```typescript
private async processJob(job: Job<QueueRequest>): Promise<void> {
  const request: QueueRequest = job.data
  const startTime = Date.now()
  // ... logging and processing
}
```

### Bus Stop 8: Atomic Stock Check
**Location:** `atomic-reservation-manager.ts` line 151
**Expected:**
- Products fetched from Sanity
- Stock availability checked
- Redis WATCH/MULTI transaction executed

**Actual Code:**
```typescript
private async performAtomicStockCheck(products: any[], reservationId: string) {
  // Fetch from Sanity
  const sanityProducts = await client.fetch(/* ... */)

  // Atomic Redis operation
  await this.redis.watch(...watchKeys)
  const multi = this.redis.multi()
  // ... set locks with TTL
  const results = await multi.exec()
}
```

### Bus Stop 9: CMS Stock Update
**Location:** `atomic-reservation-manager.ts` line 281
**Expected:**
- Sanity transaction created
- reservedStock incremented for each product
- Transaction committed successfully

**Actual Code:**
```typescript
private async updateSanityStock(products: any[], reservationId: string) {
  const sanityTransaction = writeClient.transaction()

  for (const product of products) {
    if (product.reservedQuantity > 0) {
      sanityTransaction.patch(product.id)
        .inc({ reservedStock: product.reservedQuantity })
    }
  }

  await sanityTransaction.commit()
}
```

### Bus Stop 10: Response Formation
**Location:** `app/api/checkout/reserve/route.ts` lines 241-255
**Expected:**
- Response with status 202 (Accepted)
- Contains requestId and 'processing' status
- JSON formatted

**Actual Code (with existing trace):**
```typescript
console.log('TRACE: Response formed - OK');
console.log('TRACE: Response sent - OK');

return NextResponse.json({
  success: true,
  requestId,
  status: 'processing',
  data: {
    reservationId: queueResponse.requestId,
    message: 'Reservation is being processed'
  }
} as APIResponse, { status: 202 })
```

### Bus Stop 11: Client Receives Response
**Location:** `CheckoutButton.tsx` lines 63-68
**Expected:**
- Response parsed as JSON
- Success status verified
- ReservedBasket state updated

**Actual Code:**
```typescript
const result = await response.json()

if (!result.success) {
  setError(result.error?.message || 'Failed to create reservation')
  return
}

// Map API response to ReservedBasket
const data = result.data
const reserved: ReservedBasket = {
  reservationToken: data.reservationToken,
  // ... other fields
}
setReservedBasket(reserved)
```

### Bus Stop 12: UI State Update
**Location:** `CheckoutButton.tsx` lines 82-88
**Expected:**
- Processing state set to false
- Loading state cleared
- Button enabled/disabled based on state

**Actual Code:**
```typescript
} finally {
  setIsProcessing(false)
  setLoading(false)
}
```

## Complete Trace Commands

### Add These Console Logs for Full Trace

```typescript
// 1. In EventDeduplicator.tsx, line 66
console.log('TRACE: Checkout action deduplicated', {
  actionKey,
  canExecute: eventDeduplicator.canExecute(actionKey),
  timestamp: Date.now()
});

// 2. In CheckoutButton.tsx, line 40
console.log('TRACE: Checkout button clicked', {
  basketSize: basket.length,
  hasExistingReservation: !!reservedBasket,
  timestamp: Date.now()
});

// 3. In CheckoutButton.tsx, line 53
console.log('TRACE: Request payload formed', {
  idempotencyKey,
  productCount: requestPayload.clientBasket.products.length,
  totalAmount: requestPayload.clientBasket.totalAmount,
  timestamp: Date.now()
});

// 4. In CheckoutButton.tsx, line 54
console.log('TRACE: API call initiated', {
  url: '/api/checkout/reserve',
  method: 'POST',
  hasIdempotencyKey: !!idempotencyKey,
  bodySize: JSON.stringify(requestPayload).length
});

// 5. In fifo-queue.ts, line 198
console.log('TRACE: Job processing started', {
  jobId: job.id,
  requestId: request.id,
  type: request.type,
  timestamp: Date.now()
});

// 6. In atomic-reservation-manager.ts, line 65
console.log('TRACE: Atomic stock check started', {
  reservationId,
  productCount: clientBasket.products.length,
  timestamp: Date.now()
});

// 7. In atomic-reservation-manager.ts, line 175
console.log('TRACE: Sanity products fetched', {
  count: sanityProducts.length,
  productIds: sanityProducts.map(p => p._id),
  timestamp: Date.now()
});

// 8. In atomic-reservation-manager.ts, line 232
console.log('TRACE: Redis WATCH transaction started', {
  watchKeys,
  reservationId,
  timestamp: Date.now()
});

// 9. In atomic-reservation-manager.ts, line 265
console.log('TRACE: Redis locks created', {
  lockCount: redisLocks.length,
  reservationId,
  transactionSuccess: !!results,
  timestamp: Date.now()
});

// 10. In atomic-reservation-manager.ts, line 286
console.log('TRACE: Sanity transaction started', {
  reservationId,
  patches: products.filter(p => p.reservedQuantity > 0).length,
  timestamp: Date.now()
});

// 11. In atomic-reservation-manager.ts, line 297
console.log('TRACE: Sanity transaction committed', {
  reservationId,
  success: true,
  timestamp: Date.now()
});

// 12. In CheckoutButton.tsx, line 71
console.log('TRACE: Mapping API response to ReservedBasket', {
  reservationToken: data.reservationToken,
  productCount: data.reservedBasket?.products?.length,
  timestamp: Date.now()
});
```

## Verification Commands

### Redis Commands
```bash
# Check Redis connection
redis-cli ping

# Check queue contents
redis-cli LRANGE queue:reservations 0 -1

# Check stock locks
redis-cli KEYS "stock_lock:*"

# Check reservation metadata
redis-cli GET "reservation:{reservationId}"

# Check TTLs
redis-cli TTL queue:reservations
redis-cli TTL "stock_lock:{productId}"
```

### Sanity Queries
```javascript
// Check product stock levels
*[_type == "product" && _id in $ids]{
  _id, name, stock, reservedStock, pricePln
}

// Verify reservedStock increments
*[_type == "product" && reservedStock > 0]{
  _id, name, stock, reservedStock
}
```

## Root Cause Analysis

### First Failure Point Identification
If any bus stop fails:
1. **Stop 1-3 Fail:** Frontend issue - check component connections
2. **Stop 4-6 Fail:** API issue - check server logs and Redis connection
3. **Stop 7-9 Fail:** Queue issue - check BullMQ worker status
4. **Stop 10-11 Fail:** CMS issue - check Sanity client and permissions
5. **Stop 12 Fail:** State management issue - check Zustand store

### Common Issues
- **Redis not running:** Start Redis server
- **Sanity write permissions missing:** Check SANITY_API_TOKEN
- **Missing stripePriceId:** Ensure products have valid Stripe prices
- **Queue worker not processing:** Check BullMQ worker logs

## Success Criteria
All 12 bus stops complete successfully with:
- Console logs showing progression
- Redis queue contains reservation
- Sanity reservedStock incremented
- UI shows success state
- No errors in any component
