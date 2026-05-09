Goal: capture technical solution design in minimalest possible way
Criteria: 0 unnecessary verbiage, 0 unnecessary characters

# Technical Solution: Checkout Queue

## Pre-requirements
- [x] Upstash Redis configured with REST URL and token
- [x] Sanity CMS with product schema (stock, reservedStock, price_data)
- [x] Sanity CMS with basketReservation schema (basketReservation, expiresAt)
- [x] Redis client singleton implementation
- [x] Runtime type guard for BasketReservation validation

## Data Actors
- API handler → Processor → ProcessResult (status + body)
- Processor → Redis → Queue item (id, enqueuedAt, payload)
- Processor → Sanity → basketReservation doc (with expiresAt)
- Processor → Sanity → Transaction (reservedStock increment)
- Cleanup → Sanity → Expired reservations query
- Cleanup → Sanity → Stock release (reservedStock decrement)
- Cleanup → Sanity → Document deletion

## View actors
- render 202 with BasketReservationResponse
- render 400 on invalid input
- render 500 on timeout or error

## Components
- Queue Processor (lib/queue/processor.ts)
- Type Guards (lib/queue/types.ts)
- Cleanup Infrastructure (lib/queue/cleanup.ts)
- Redis Client (lib/queue/redis.ts)
- Trace Logging (lib/queue/trace.ts)
- Health Checks (lib/queue/health.ts)
- API Endpoint (app/api/checkout-queue/route.ts)

## Entities
- client basket (input from frontend)
- Redis queue (FIFO list)
- Redis lock (SET NX)
- Sanity basketReservation (with expiresAt)
- Sanity product (with reservedStock)
- Trace log (Redis list + console)

## Data flow
1. Client sends POST /api/checkout-queue with BasketReservation
2. Processor validates BasketReservation shape (400 on mismatch)
3. Processor generates requestId (UUID)
4. Processor RPUSHes request to Redis FIFO list
5. Processor enters spin loop:
   - SET NX lock:checkout:processing
   - If lock acquired, LINDEX queue:checkout 0
   - If head.id == requestId, break (proceed)
   - Else DEL lock, sleep 25ms, retry
   - Timeout after 45s (500 error)
6. Processor creates Sanity basketReservation doc with _id = requestId, expiresAt = now + TTL
7. Processor runs Sanity transaction: increment reservedStock for each product
8. Processor fetches updated products (stock, reservedStock, price_data)
9. Processor LPOPs request from queue
10. Processor DELs lock
11. Processor returns 202 with BasketReservationResponse (reservationId, ttl, products)

## Types
```typescript
interface ClientBasketItem {
  _id: string
  quantity: number
  price_data: { currency: string; unit_amount: number }
}

interface CmsBasketReservationItem {
  _id: string
  quantity: number
  verifiedPrice: number
}

interface BasketReservation {
  basketReservation: Array<ClientBasketItem>
  createdAt: string
}

interface BasketReservationResponse {
  ok: true
  reservationId: string
  ttl: number
  products: Array<{
    id: string
    realPrice: number
    reservedStock: number
    stock: number
  }>
  debug?: {
    priceVerification: Array<{
      productId: string
      verifiedPrice: number
    }>
  }
}

interface RedisQueueItem {
  id: string
  enqueuedAt: number
  payload: BasketReservation
}
```

## Why Atomic FIFO is Necessary

Checkout queue uses atomic FIFO processing (Redis SET NX + FIFO head check) because:

1. **Concurrent checkout clicks** - Multiple users can click checkout simultaneously
2. **Race condition risk** - Without serialization, concurrent requests can corrupt reservedStock
3. **Double-reservation** - Concurrent writes could create duplicate reservations
4. **Stock mis-counting** - Non-atomic increments could result in incorrect stock levels
5. **Sanity transaction limitations** - Sanity transactions don't prevent concurrent doc creation

Atomic FIFO ensures:
- Only one request processes at a time (via lock + head check)
- Requests process in order (FIFO queue)
- ReservedStock increments are atomic (Sanity transaction)
- No double-reservations (unique requestId as doc _id)

This is the correct solution for this constraint. Without it, the system would be vulnerable to race conditions under load.
