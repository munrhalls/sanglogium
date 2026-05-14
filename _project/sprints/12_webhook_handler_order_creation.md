# Sprint: Webhook Handler & Order Creation (Chunk 3)

## PHASE 0: Pre-Work Lessons Retrieval

**Status:** No `_project/lessons/INDEX.md` exists. No pre-work lessons to load.

**Verified System Understanding:**

| Source | Finding |
|--------|---------|
| `lib/stripe.ts` | Stripe singleton — `new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2025-10-29.clover' })` |
| `app/api/checkout/payment-intent/route.ts` | Chunk 1 — creates PaymentIntent with `metadata: { basketReservationId }` |
| `lib/queue/processor.ts` | Creates reservation doc, increments `reservedStock` via transaction. Uses `getBackendClient()`. |
| `lib/queue/cleanup.ts` | Releases `reservedStock` (dec), deletes expired reservations. Uses `getBackendClient()`. |
| `sanity-cms/schemaTypes/basketReservationType.ts` | Reservation: `basketReservation[]` (`_id`, `quantity`, `verifiedPrice`), `shippingAddress`, `shippingChoice`, `createdAt`, `expiresAt` |
| `sanity-cms/schemaTypes/orderType.ts` | Full order schema: `orderNumber`, `orderId`, `items[]` (productRef, productId, name, slug, imageUrl, price, quantity, subtotal), `shippingAddress`, `shippingMethod`, `pricing`, `status`, `dates`, `payment` (stripePaymentIntentId) |
| `sanity-cms/lib/backendClient.ts` | `getBackendClient()` uses `SANITY_STUDIO_READ_WRITE` — verified create/read/write/delete |

**Critical Constraints:**
- Webhook needs **raw body** (not parsed JSON) for `stripe.webhooks.constructEvent()`.
- Stock finalization ≠ cleanup: webhook deducts `stock` AND zeros `reservedStock`; cleanup only releases `reservedStock`.
- Idempotency: query orders by `payment.stripePaymentIntentId` before creating.
- Return `200` immediately — no async post-processing that delays response.

---

## PHASE 1: UX Flows First

### Target State

1. Stripe sends `payment_intent.succeeded` → handler receives it
2. Handler verifies signature via `STRIPE_WEBHOOK_SECRET`
3. Handler extracts `basketReservationId` from PaymentIntent metadata
4. Idempotency check: if order exists for this payment intent → return `200` (no duplicate)
5. Handler fetches reservation from Sanity
6. Handler creates order document (snapshot of items, prices, shipping, address, payment intent ID, timestamp)
7. Handler finalizes stock: `stock -= reservedStock`, `reservedStock = 0`
8. Handler deletes reservation document
9. Returns `200`

### End-State Overview

A single webhook endpoint receives `payment_intent.succeeded` events, verifies authenticity, and completes the purchase: creating an immutable order record, permanently deducting stock, and cleaning up the reservation. Idempotent — duplicate deliveries produce exactly one order. Testable in isolation via Stripe CLI.

---

## PHASE 2: Architecture Contract

### Event-State Flow

```
WEBHOOK_RECEIVED { rawBody, signature }
  → verify signature → SIGNATURE_VERIFIED | SIGNATURE_INVALID (400)

SIGNATURE_VERIFIED
  → filter event.type → PAYMENT_SUCCEEDED | UNHANDLED_EVENT (200, skip)

PAYMENT_SUCCEEDED { paymentIntent }
  → query orders by stripePaymentIntentId → NO_EXISTING_ORDER | DUPLICATE (200)

NO_EXISTING_ORDER
  → fetch reservation → RESERVATION_FETCHED | RESERVATION_NOT_FOUND (200, log error)

RESERVATION_FETCHED
  → create order + finalize stock + delete reservation → ORDER_CREATED (200)
```

### Events + Payloads

```ts
type WebhookEvent =
  | { type: 'WEBHOOK_RECEIVED'; payload: { rawBody: string; signature: string } }
  | { type: 'SIGNATURE_VERIFIED'; payload: Stripe.Event }
  | { type: 'PAYMENT_SUCCEEDED'; payload: Stripe.PaymentIntent }
  | { type: 'NO_EXISTING_ORDER'; payload: { basketReservationId: string } }
  | { type: 'RESERVATION_FETCHED'; payload: ReservationData }
  | { type: 'ORDER_CREATED'; payload: { orderId: string } }
```

### Transition Table

```
idle        → WEBHOOK_RECEIVED      → verifying
verifying   → SIGNATURE_VERIFIED    → filtering
verifying   → SIGNATURE_INVALID     → error (400)
filtering   → PAYMENT_SUCCEEDED     → checking_idempotency
filtering   → UNHANDLED_EVENT       → done (200)
checking    → NO_EXISTING_ORDER     → fetching_reservation
checking    → DUPLICATE             → done (200)
fetching    → RESERVATION_FETCHED   → creating_order
fetching    → RESERVATION_NOT_FOUND → done (200, logged)
creating    → ORDER_CREATED         → done (200)
```

### Simplicity Guardrail

Single `POST` handler. No classes, no services, no state machine library. Sequential async steps with early returns. Raw body parsing via `request.text()`. Stripe client from existing `lib/stripe.ts`. Sanity client from existing `getBackendClient()`.

---

## PHASE 3: Tiny Scope Contracts

---

### Scope Contract 1: Create Webhook Endpoint

**UX Slice**
- No direct user-facing change (server-side endpoint)
- Enables order creation after successful payment
- Developer tests: `stripe trigger payment_intent.succeeded` → order appears in Sanity

**Architecture Slice**
- New file: `app/api/checkout/webhook/route.ts`
- `POST` handler — sequential steps:

```
1. Read raw body: const rawBody = await request.text()
   Get signature: request.headers.get('stripe-signature')

2. Verify: stripe.webhooks.constructEvent(rawBody, signature, STRIPE_WEBHOOK_SECRET)
   → 400 if invalid

3. Filter: if event.type !== 'payment_intent.succeeded' → return 200 (ack, skip)

4. Extract: paymentIntent = event.data.object
   basketReservationId = paymentIntent.metadata.basketReservationId

5. Idempotency: query Sanity for order where payment.stripePaymentIntentId == paymentIntent.id
   → if found, return 200 (already processed)

6. Fetch reservation: *[_type == "basketReservation" && _id == $id][0]
   → if not found, log error, return 200 (Stripe will retry, idempotency safe)

7. Build order document:
   - orderNumber: "ORD-" + Date.now()
   - orderId: randomUUID()
   - items[]: map reservation.basketReservation → snapshot product data (fetch product name, slug, image)
   - shippingAddress: map reservation.shippingAddress → order schema format
   - shippingMethod: map reservation.shippingChoice → { name, price, estimatedDays, carrier }
   - pricing: { subtotal, shipping, tax: 0, total, currency }
   - status: "processing"
   - dates: { orderedAt: now, paidAt: now }
   - payment: { stripePaymentIntentId: paymentIntent.id }
   - metadata: { source: "web" }

8. Create order: sanity.create(orderDoc)

9. Finalize stock (transaction):
   For each item in reservation.basketReservation:
     patch product: dec({ stock: item.quantity }), set({ reservedStock: 0 })

10. Delete reservation: sanity.delete(basketReservationId)

11. Return 200 { received: true }
```

- Runtime: `nodejs` (required for Stripe SDK)
- Disable body parsing: `export const config = { api: { bodyParser: false } }` — NOT needed in App Router (use `request.text()`)
- Uses `stripe` from `lib/stripe.ts`
- Uses `getBackendClient()` from `sanity-cms/lib/backendClient`

**Human Verification Checklist (<5 minutes)**
- [ ] Start Stripe CLI: `stripe listen --forward-to localhost:3000/api/checkout/webhook`
- [ ] Trigger test event: `stripe trigger payment_intent.succeeded`
- [ ] Check Sanity Studio → new order document created
- [ ] Verify order has correct items, prices, shipping, address
- [ ] Verify product stock decremented, reservedStock zeroed
- [ ] Verify reservation document deleted
- [ ] Trigger same event again → no duplicate order (idempotency)
- [ ] Send non-payment_intent event → 200, no order created

**Minimal Tests**
- Test: valid payment_intent.succeeded → order created, stock finalized, reservation deleted
- Test: duplicate event → no duplicate order (idempotency)
- Test: invalid signature → 400
- Test: non-payment_intent event → 200, skipped
- Test: reservation not found → 200, error logged

---

### Scope Contract 2: Integration Test

**UX Slice**
- No user-facing change
- Provides specification and regression safety

**Architecture Slice**
- New file: `tests/checkout/integration/webhook-order-creation.test.ts`
- Uses real Stripe (test mode), real Sanity
- Happy path:
  1. Create test reservation with items, shippingChoice, shippingAddress
  2. Create a PaymentIntent with the reservation's ID in metadata
  3. Simulate webhook call (or use Stripe CLI trigger)
  4. Assert order created in Sanity with correct data
  5. Assert stock decremented, reservedStock zeroed
  6. Assert reservation deleted
  7. Cleanup: delete test order if still exists
- Edge cases:
  1. Duplicate webhook → no duplicate order
  2. Missing reservation → 200, no order
  3. Invalid signature → 400

**Human Verification Checklist (<5 minutes)**
- [ ] Run: `npx vitest run tests/checkout/integration/webhook-order-creation.test.ts`
- [ ] All tests pass
- [ ] No test data left in Sanity

---

## PHASE 4: Continuous Verification

### Per Scope Contract Workflow
1. Implement scope contract
2. Run human verification checklist IMMEDIATELY
3. Run minimal tests
4. Confirm: "Is this the simplest possible way?"
5. Only then: move to next scope contract

### Verification Order
Scope 1 (endpoint) → Scope 2 (integration test)

---

## PHASE 5: Final Human Check

- [ ] Stripe CLI: `stripe trigger payment_intent.succeeded` → order created in Sanity
- [ ] Order document has all required fields (items, pricing, shipping, address, payment, dates)
- [ ] Stock correctly finalized: `stock` decremented, `reservedStock` = 0
- [ ] Reservation document deleted
- [ ] Duplicate event → no duplicate order
- [ ] Invalid signature → 400
- [ ] Integration tests pass
- [ ] Build succeeds: `npx tsc --noEmit`

---

## PHASE 6: Simplicity Guardrails

- **No new abstractions** — single `POST` handler, no classes, no services
- **No new dependencies** — uses existing `stripe` package, existing `getBackendClient()`
- **No body parser config needed** — App Router uses `request.text()` for raw body
- **Single endpoint, single responsibility** — receives webhook, creates order, finalizes stock
- **Idempotency via query** — check before create, not via Stripe's Idempotency-Key header
- **Always return 200 on processed events** — Stripe retries non-200 responses; idempotency handles duplicates

---

## PHASE 7: Scope Lock Rules

- **NO** changes outside scope contracts
- **NO** adding complexity without necessity
- **NO** skipping human verification
- **NO** tests that don't serve human confidence
- **NO** frontend work (that's Chunk 4)
- **NO** touching existing reservation, payment-intent, or cleanup code
- **NO** async post-processing that delays 200 response

---

## PHASE 8: Post-Sprint /learn

**Trigger:** After final human check

**Action:** Execute `/learn` protocol
- Did the single-handler approach keep things simple?
- Did idempotency via order query work correctly?
- Was stock finalization distinct from cleanup logic?
- Did Stripe CLI testing provide sufficient confidence?
- Were simplicity guardrails effective?

---

## Appendix: Files Affected

| Action | File | Reason |
|--------|------|--------|
| CREATE | `app/api/checkout/webhook/route.ts` | Webhook handler endpoint |
| CREATE | `tests/checkout/integration/webhook-order-creation.test.ts` | Integration test |

## Appendix: Downstream Dependencies (Chunk 4)

Chunk 4 (Return Page) depends on this webhook completing the order lifecycle:
1. User completes payment → redirected to `/checkout/return`
2. Return page shows static success (does NOT fetch order — webhook may not have fired yet)
3. Webhook creates order asynchronously
4. No synchronous dependency between return page and webhook
