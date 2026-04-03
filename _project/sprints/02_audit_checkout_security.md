# Backend Security & Webhook Integrity — Mathematical Test Specification

> **Audit Date:** 2026-04-03
> **Depends On:** `01_audit_checkout_state_machine.md` (immutable)
> **Scope:** Server-side only — webhook integrity, Sanity mutation safety, worst-case data consistency
> **Target Test Framework:** Playwright API testing (code generation deferred)
> **Status:** Constraint contract for security testing sprint

---

## §0 — Source-of-Truth Reference

All gap IDs (G-XX), bus stop IDs (B-XX, C-XX, W-XX), and payload shapes (P-XX) reference `01_audit_checkout_state_machine.md` without modification.

### Files Under Test

| File | Role | Lines of Interest |
|---|---|---|
| [api/checkout/route.ts](file:///c:/webdev/sang-logium/app/api/checkout/route.ts) | Session creation, stock reservation, rate limit | L89-215 (POST handler), L164-168 (reservation), L218-234 (rollback) |
| [api/webhook/route.ts](file:///c:/webdev/sang-logium/app/api/webhook/route.ts) | Stripe event processing, order creation, stock finalization | L10-71 (main handler), L73-168 (completed), L196-227 (release/finalize) |
| [actions/address/address.ts](file:///c:/webdev/sang-logium/app/actions/address/address.ts) | Google Address Validation server action | L91-178 |
| [checkout/layout.tsx](file:///c:/webdev/sang-logium/app/%28store%29/checkout/layout.tsx) | Auth check + address resolution | L8-86 |
| [sanity/lib/orders/addOrder.ts](file:///c:/webdev/sang-logium/sanity/lib/orders/addOrder.ts) | Order validation + Sanity write | L32-81 (validation), L89-169 (create) |
| [lib/utils/cookies.ts](file:///c:/webdev/sang-logium/lib/utils/cookies.ts) | JWT checkout cookie parser | L4-34 |

---

## §1 — Webhook Security & Integrity Matrix

### 1.1 Signature Validation

| Test ID | Scenario | Method | Expected Result |
|---|---|---|---|
| **WH-SIG-01** | Missing `stripe-signature` header | `POST /api/webhook` with valid body, no signature header | `400` + `{ error: "Missing stripe-signature header" }` |
| **WH-SIG-02** | Invalid signature (tampered body) | `POST /api/webhook` with valid header but modified body | `400` + error message contains "Webhook Error" |
| **WH-SIG-03** | Invalid signature (wrong secret) | Construct event with different `STRIPE_WEBHOOK_SECRET` | `400` + signature verification failed |
| **WH-SIG-04** | Valid signature, valid body | Construct with correct secret via `stripe.webhooks.generateTestHeaderString` | `200` + `{ received: true }` |
| **WH-SIG-05** | Empty body with valid signature format | `POST /api/webhook` with `""` body, valid-looking signature | `400` — `constructEvent` throws |

#### Assertions (WH-SIG-01)

```typescript
// Playwright API test shape
const res = await request.post('/api/webhook', {
  data: '{"type":"checkout.session.completed"}',
  headers: { 'Content-Type': 'application/json' }
  // NOTE: NO stripe-signature header
});
expect(res.status()).toBe(400);
const body = await res.json();
expect(body.error).toBe('Missing stripe-signature header');
```

#### Assertions (WH-SIG-02)

```typescript
const validBody = '{"id":"evt_test"}';
const tamperedBody = '{"id":"evt_test","tampered":true}';
const signature = stripe.webhooks.generateTestHeaderString({
  payload: validBody,
  secret: STRIPE_WEBHOOK_SECRET,
});
const res = await request.post('/api/webhook', {
  data: tamperedBody, // body doesn't match signature
  headers: { 'stripe-signature': signature, 'Content-Type': 'application/json' }
});
expect(res.status()).toBe(400);
expect((await res.json()).error).toContain('Webhook Error');
```

### 1.2 Replay Attack Prevention

| Test ID | Scenario | Method | Expected Result |
|---|---|---|---|
| **WH-RPL-01** | Replay of `checkout.session.completed` for already-processed session | Send identical webhook event twice with same `session.id` | 1st call: order created. 2nd call: early return (idempotent), no duplicate order |
| **WH-RPL-02** | Replay with stale timestamp | Stripe signature includes timestamp. Replay with >5min old `t` value. | `400` — `constructEvent` rejects tolerance window by default (300s) |

#### Assertions (WH-RPL-01): Idempotency

```typescript
// After first successful webhook:
const ordersAfterFirst = await sanityClient.fetch(
  `count(*[_type == "order" && payment.stripeCheckoutSessionId == $sid])`,
  { sid: sessionId }
);
expect(ordersAfterFirst).toBe(1);

// Send identical event again:
const res2 = await sendWebhookEvent(completedEvent);
expect(res2.status()).toBe(200); // returns { received: true }, no error

const ordersAfterSecond = await sanityClient.fetch(
  `count(*[_type == "order" && payment.stripeCheckoutSessionId == $sid])`,
  { sid: sessionId }
);
expect(ordersAfterSecond).toBe(1); // Still exactly 1, not 2
```

> [!IMPORTANT]
> Current idempotency guard is at [webhook/route.ts:74-82](file:///c:/webdev/sang-logium/app/api/webhook/route.ts#L74-L82): queries Sanity for existing order by `payment.stripeCheckoutSessionId`. This is application-level idempotency on top of Stripe's built-in tolerance window.

### 1.3 Event Filtering & Unrecognized Events

| Test ID | Scenario | Expected Result |
|---|---|---|
| **WH-EVT-01** | `payment_intent.succeeded` (valid but not permitted) | `200` + `{ received: true }` — acknowledged, not processed |
| **WH-EVT-02** | `checkout.session.completed` (permitted) | `200` + order created in Sanity |
| **WH-EVT-03** | `checkout.session.expired` (permitted) | `200` + reservations released |
| **WH-EVT-04** | `checkout.session.async_payment_failed` (permitted) | `200` + reservations released |
| **WH-EVT-05** | Completely fabricated event type `"malicious.type"` | `200` — passes through permitted check, no processing |

#### Assertions (WH-EVT-01)

```typescript
const res = await sendWebhookEvent({
  type: 'payment_intent.succeeded',
  data: { object: {} }
});
expect(res.status()).toBe(200);
expect((await res.json()).received).toBe(true);
// No order created, no stock changes
```

### 1.4 Out-of-Order Delivery

| Test ID | Scenario | Expected Result |
|---|---|---|
| **WH-OOD-01** | `expired` arrives BEFORE `completed` for same session | Reservations released. Then `completed` arrives → order created, stock finalized (from Stripe's authoritative session data, not from reserved amounts) |
| **WH-OOD-02** | `completed` arrives AFTER `expired` already released reservations | Order created normally. `finalizeStock` will dec stock and reservedStock — but reservedStock may already be 0, potentially going negative |
| **WH-OOD-03** | `async_payment_failed` then `completed` for same session | Same race as OOD-01. Failed releases, then completed finalizes. |

> [!WARNING]
> **OOD-02 is a real vulnerability in current code.** If `expired` fires first and decrements `reservedStock`, then `completed` fires and calls `finalizeStock` which also decrements `reservedStock`, the field goes negative. There is no guard against `reservedStock < 0` in `finalizeStock()` at [webhook/route.ts:214-226](file:///c:/webdev/sang-logium/app/api/webhook/route.ts#L214-L226).

#### Assertions (WH-OOD-02): reservedStock negativity guard

```typescript
// Pre-condition: product.reservedStock = 2 (from checkout session)
// Step 1: expired webhook fires → releaseReservations() → reservedStock = 0
// Step 2: completed webhook fires → finalizeStock() → dec(stock: 2, reservedStock: 2)
const product = await sanityClient.fetch(
  `*[_type == "product" && _id == $id][0]{ stock, reservedStock }`,
  { id: productId }
);
// CURRENT BEHAVIOR (BUG):
expect(product.reservedStock).toBe(-2); // ❌ THIS SHOULD NOT HAPPEN
// TARGET BEHAVIOR:
expect(product.reservedStock).toBeGreaterThanOrEqual(0); // ✅
```

### 1.5 Handler Failure Resilience

| Test ID | Scenario | Expected Result |
|---|---|---|
| **WH-FAIL-01** | `handleCheckoutCompleted` throws during Sanity order creation | `500` + `{ error: "Webhook handler failed" }`. Stripe will retry. |
| **WH-FAIL-02** | `handleCheckoutCompleted` throws during `finalizeStock` | Order created but stock NOT finalized. Inconsistent state. |
| **WH-FAIL-03** | `handleSessionExpired` throws during reservation release | `500`. Stripe retries. Leaked reservations until next attempt or manual cleanup. |
| **WH-FAIL-04** | Sanity is unreachable during any webhook handler | All Sanity operations fail. Handler throws. `500` returned. Stripe retries (up to ~72h). |

> [!CAUTION]
> **WH-FAIL-02 exposes a non-atomic sequence.** At [webhook/route.ts:159-165](file:///c:/webdev/sang-logium/app/api/webhook/route.ts#L159-L165), `createOrder()` and `finalizeStock()` are sequential, not transactional. If `createOrder` succeeds but `finalizeStock` fails, the order exists but stock is not decremented. The idempotency check (L74-82) will see the order exists and skip on Stripe retry, **permanently leaving stock un-decremented**.

#### Assertions (WH-FAIL-02): Non-atomic order+stock

```typescript
// Simulate: createOrder succeeds, finalizeStock throws
// After Stripe retries the webhook:
const order = await sanityClient.fetch(
  `*[_type == "order" && payment.stripeCheckoutSessionId == $sid][0]`,
  { sid: sessionId }
);
expect(order).toBeTruthy(); // Order exists

// Idempotency guard prevents re-processing:
// finalizeStock is NEVER called again
const product = await sanityClient.fetch(
  `*[_type == "product" && _id == $id][0]{ stock, reservedStock }`,
  { id: productId }
);
// CURRENT (BUG): stock and reservedStock remain at pre-finalization values
// TARGET: stock and reservedStock must be decremented
expect(product.stock).toBe(originalStock - purchasedQty); // FAILS currently
```

---

## §2 — Sanity CMS Data Mutation Threats

### 2.1 Stock Reservation Race Conditions

| Test ID | Threat | Vector | Current Defense | Residual Risk |
|---|---|---|---|---|
| **SAN-RC-01** | Two concurrent checkouts for same product, total qty > available stock | Two simultaneous `POST /api/checkout` requests | `ifRevisionId(_rev)` on patch ([checkout/route.ts:167](file:///c:/webdev/sang-logium/app/api/checkout/route.ts#L167)) | Second request's patch fails silently — `ifRevisionId` causes Sanity to reject the stale-rev patch. **But**: current code does not catch this specific failure. The patch `commit()` may throw, caught by outer try/catch, triggering rollback of already-reserved items. |
| **SAN-RC-02** | Same user opens two tabs, both reach payment | Two separate sessions with same basket | Each creates independent reservations. Total reserved > actual stock if both proceed. | Stock goes negative if both sessions complete. |
| **SAN-RC-03** | Stock modified by admin in Sanity Studio while checkout in progress | Admin reduces `stock` field below `reservedStock` | No defense. `availableStock = stock - reservedStock` could become negative before checkout creates session | Session creation succeeds with negative-available-stock line items |

#### Assertions (SAN-RC-01): Concurrent reservation

```typescript
// Setup: product.stock = 3, product.reservedStock = 0
// Request A: quantity = 2 → reads _rev = "abc"
// Request B: quantity = 2 → reads _rev = "abc" (same moment)
// Request A: patches with ifRevisionId("abc") → succeeds → _rev = "def"
// Request B: patches with ifRevisionId("abc") → FAILS (rev mismatch)

// Assert Request B:
expect(resB.status()).toBe(500); // outer catch triggers
// Assert rollback happened for any items Request B reserved before this product:
const product = await sanityClient.fetch(
  `*[_type == "product" && _id == $id][0]{ reservedStock }`,
  { id: productId }
);
expect(product.reservedStock).toBe(2); // Only Request A's reservation
```

### 2.2 reservedStock Consistency Model

| Test ID | Scenario | Expected Math | Current Status |
|---|---|---|---|
| **SAN-RS-01** | Happy path: checkout → payment → completed webhook | `reserve(+N)` → `finalize(-N stock, -N reserved)` | Final: `stock -= N`, `reservedStock = 0` ✅ |
| **SAN-RS-02** | Checkout created → session expires (25min) | `reserve(+N)` → `release(-N reserved)` | Final: `stock unchanged`, `reservedStock = 0` ✅ |
| **SAN-RS-03** | Checkout created → Stripe session fails → rollback | `reserve(+N)` → `rollback(-N reserved)` | Final: `stock unchanged`, `reservedStock = 0` ✅ |
| **SAN-RS-04** | Multiple items in basket, 2nd item fails stock check | Items 1..K reserved, item K+1 fails → outer catch → rollback(1..K) | Final: `reservedStock = 0` for items 1..K ✅ |
| **SAN-RS-05** | expired + completed race (OOD scenario) | `release(-N)` → `finalize(-N stock, -N reserved)` | **BUG**: `reservedStock` = `-N` ❌ |
| **SAN-RS-06** | Rollback fails for one item during multi-item rollback | Items 1..3: rollback succeeds for 1,2 but throws for 3 | Item 3 `reservedStock` leaked permanently. Error logged but not re-thrown. ([checkout/route.ts:227-232](file:///c:/webdev/sang-logium/app/api/checkout/route.ts#L227-L232)) ❌ |

#### reservedStock Invariant (Mathematical Proof Required)

```
∀ product P, ∀ time T:
  P.reservedStock(T) >= 0
  P.stock(T) >= 0
  P.reservedStock(T) <= P.stock(T)
```

**Current code violates all three invariants under race conditions.**

### 2.3 Malicious Payload Injection via /api/checkout

| Test ID | Payload | Expected Defense | Expected Response |
|---|---|---|---|
| **SAN-INJ-01** | `publicBasket: [{ _id: "'; DROP TABLE--", quantity: 1 }]` | `sanitizeId()` strips non-alphanumeric → `DROPTABLEid` truncated to 64 chars. Sanity query uses parameterized `$productIds`. | `400` — product not found in Sanity |
| **SAN-INJ-02** | `publicBasket: [{ _id: "../../../etc/passwd", quantity: 1 }]` | `sanitizeId()` → `etcpasswd`. No path traversal in GROQ. | `400` — product not found |
| **SAN-INJ-03** | `publicBasket: [{ _id: "validId", quantity: 999999 }]` | `sanitizeQuantity()` caps at 99 → returns `null` → `validateBasketItem` fails | `400` — invalid basket data |
| **SAN-INJ-04** | `publicBasket: [{ _id: "validId", quantity: -5 }]` | `sanitizeQuantity()` rejects `< 1` | `400` — invalid basket data |
| **SAN-INJ-05** | `publicBasket: [{ _id: "validId", quantity: 1.5 }]` | `Math.floor(1.5)` → `1`. Accepted. | Valid — but floored to integer |
| **SAN-INJ-06** | `publicBasket: [{ _id: "validId", quantity: "2" }]` | `parseInt("2", 10)` → `2`. Type coercion handled. | Valid — parsed to integer |
| **SAN-INJ-07** | `publicBasket: []` (empty array) | `validateBasket` rejects `length === 0` | `400` — invalid basket data |
| **SAN-INJ-08** | `publicBasket: "not an array"` | `!Array.isArray(basket)` → false | `400` — invalid basket data |
| **SAN-INJ-09** | `publicBasket` with 51 items | `basket.length > 50` → rejected | `400` — invalid basket data |
| **SAN-INJ-10** | Duplicate `_id` values | `idSet.size !== validated.length` | `400` — invalid basket data |
| **SAN-INJ-11** | `publicBasket: [{ _id: "validId", quantity: NaN }]` | `!Number.isFinite(NaN)` → `sanitizeQuantity` returns `null` | `400` — invalid basket data |
| **SAN-INJ-12** | `publicBasket: [{ _id: "validId", quantity: Infinity }]` | `!Number.isFinite(Infinity)` → null | `400` — invalid basket data |
| **SAN-INJ-13** | Request body is not JSON | `req.json()` throws | `500` — outer catch (generic error) |
| **SAN-INJ-14** | Missing `publicBasket` key in body | `validateBasket(undefined)` → `!Array.isArray(undefined)` → null | `400` — invalid basket data |

#### Assertions (SAN-INJ-01)

```typescript
const res = await request.post('/api/checkout', {
  data: { publicBasket: [{ _id: "'; DROP TABLE--", quantity: 1 }] },
  headers: { 'Content-Type': 'application/json' }
});
expect(res.status()).toBe(400);
expect((await res.json()).error).toContain('Product no longer exists');
// Verify: no Sanity documents modified
```

### 2.4 Order Creation Validation Bypass

| Test ID | Scenario | Defense Layer | Current Status |
|---|---|---|---|
| **SAN-ORD-01** | `customerEmail` is empty string | `validateOrderData`: rejects if no `@` in email | ✅ Defended ([addOrder.ts:34](file:///c:/webdev/sang-logium/sanity/lib/orders/addOrder.ts#L34)) |
| **SAN-ORD-02** | `items` array is empty | `validateOrderData`: rejects `length === 0` | ✅ Defended ([addOrder.ts:38](file:///c:/webdev/sang-logium/sanity/lib/orders/addOrder.ts#L38)) |
| **SAN-ORD-03** | Item with `quantity < 1` | `validateOrderData`: rejects | ✅ Defended ([addOrder.ts:47](file:///c:/webdev/sang-logium/sanity/lib/orders/addOrder.ts#L47)) |
| **SAN-ORD-04** | Item with negative `price` | `validateOrderData`: rejects | ✅ Defended ([addOrder.ts:50](file:///c:/webdev/sang-logium/sanity/lib/orders/addOrder.ts#L50)) |
| **SAN-ORD-05** | `subtotal !== price × quantity` | `validateOrderData`: arithmetic check | ✅ Defended ([addOrder.ts:53](file:///c:/webdev/sang-logium/sanity/lib/orders/addOrder.ts#L53)) |
| **SAN-ORD-06** | Missing `shippingAddress.state` field | `validateOrderData`: requires all fields | ⚠️ Currently rejects (L60-69), but state is set to `""` by `toShippingAddress`. **Will fail validation.** |
| **SAN-ORD-07** | `pricing.total < 0` | `validateOrderData`: rejects | ✅ Defended ([addOrder.ts:73](file:///c:/webdev/sang-logium/sanity/lib/orders/addOrder.ts#L73)) |
| **SAN-ORD-08** | Missing `currency` | `validateOrderData`: rejects | ✅ Defended ([addOrder.ts:76](file:///c:/webdev/sang-logium/sanity/lib/orders/addOrder.ts#L76)) |

> [!WARNING]
> **SAN-ORD-06 is a latent bug.** In `toShippingAddress()` ([checkout.types.ts:30](file:///c:/webdev/sang-logium/app/%28store%29/checkout/checkout.types.ts#L30)), `state` is hardcoded to `""`. But `validateOrderData()` requires `addr.state` to be truthy ([addOrder.ts:64](file:///c:/webdev/sang-logium/sanity/lib/orders/addOrder.ts#L64)). In the webhook handler, the shipping address comes from Stripe's `session.shipping_details` or `customer_details`, which may or may not have `state`. If `state` is empty → order validation fails → order creation fails → webhook returns 500 → stock never finalized.

---

## §3 — Worst-Case Scenario E2E Specifications

### WC-01: Payment Succeeds but Webhook Fails (First Attempt)

| Dimension | Specification |
|---|---|
| **Trigger** | Stripe charges card successfully. `checkout.session.completed` webhook fires but `handleCheckoutCompleted` throws (e.g., Sanity down). |
| **Immediate State** | Customer charged. No order in Sanity. Stock reserved but not finalized. Return page polls, finds no order (60s max). |
| **Recovery** | Stripe retries webhook automatically (exponential backoff, up to 72 hours). On successful retry, handler runs again. Idempotency check passes (no existing order). Order created + stock finalized. |
| **Residual Risk** | Customer sees "Order not found" on return page. Must refresh/revisit after webhook succeeds. |

#### Assertions (WC-01)

```typescript
// After first failed webhook attempt:
const orderCount = await sanityClient.fetch(
  `count(*[_type == "order" && payment.stripeCheckoutSessionId == $sid])`,
  { sid: sessionId }
);
expect(orderCount).toBe(0);

// After successful retry:
const orderCountRetry = await sanityClient.fetch(
  `count(*[_type == "order" && payment.stripeCheckoutSessionId == $sid])`,
  { sid: sessionId }
);
expect(orderCountRetry).toBe(1);

const product = await sanityClient.fetch(
  `*[_type == "product" && _id == $id][0]{ stock, reservedStock }`,
  { id: productId }
);
expect(product.stock).toBe(originalStock - qty);
expect(product.reservedStock).toBe(0);
```

### WC-02: Order Created but finalizeStock Fails

| Dimension | Specification |
|---|---|
| **Trigger** | `createOrder()` succeeds at [webhook/route.ts:159](file:///c:/webdev/sang-logium/app/api/webhook/route.ts#L159). `finalizeStock()` throws at [webhook/route.ts:165](file:///c:/webdev/sang-logium/app/api/webhook/route.ts#L165). |
| **Immediate State** | Order exists in Sanity. `stock` and `reservedStock` NOT decremented. Handler throws → `500` → Stripe retries. |
| **Recovery** | On retry, idempotency check at L74-82 finds existing order → **returns early**. `finalizeStock` is **never called again**. |
| **Result** | **PERMANENT DATA INCONSISTENCY.** Order exists, customer charged, but `stock` not decremented. `reservedStock` leaks indefinitely. |

#### Assertions (WC-02): Proves the bug

```typescript
// Order exists:
const order = await sanityClient.fetch(
  `*[_type == "order" && payment.stripeCheckoutSessionId == $sid][0]`,
  { sid: sessionId }
);
expect(order).toBeTruthy();
expect(order.orderNumber).toBeTruthy();

// Stock NOT finalized (BUG):
const product = await sanityClient.fetch(
  `*[_type == "product" && _id == $id][0]{ stock, reservedStock }`,
  { id: productId }
);
expect(product.stock).toBe(originalStock); // Stock unchanged — BUG
expect(product.reservedStock).toBe(reservedQty); // Reservation leaked — BUG

// TARGET after fix:
// expect(product.stock).toBe(originalStock - qty);
// expect(product.reservedStock).toBe(0);
```

### WC-03: Double-Charge Prevention

| Dimension | Specification |
|---|---|
| **Trigger** | User clicks "Pay" button rapidly, or network retry creates two Stripe sessions for the same basket. |
| **Defense** | Rate limiting: 5 req/min per IP ([checkout/route.ts:11-33](file:///c:/webdev/sang-logium/app/api/checkout/route.ts#L11-L33)). Each session creation reserves stock independently. `ifRevisionId` prevents concurrent patches on same product. |
| **State** | If two sessions ARE created: each reserves stock. `availableStock = stock - reservedStock`. Second request may see reduced availability → `409` if insufficient. |
| **On Completion** | If BOTH sessions somehow pay: two `completed` webhooks → two orders created (different session IDs → idempotency doesn't block). **Two charges.** |
| **Residual Risk** | There is NO mechanism to detect duplicate basket purchases by the same user within a short window. |

#### Assertions (WC-03)

```typescript
// Session 1 completes:
const orders = await sanityClient.fetch(
  `count(*[_type == "order" && clerkUserId == $uid])`,
  { uid: userId }
);
// If both sessions paid, this could be 2 — current code has no guard
// TARGET: Detect and prevent duplicate orders for same user within 5-min window
```

### WC-04: Cart Manipulation Between Session Creation and Payment

| Dimension | Specification |
|---|---|
| **Trigger** | User creates checkout session (stock reserved). Then modifies localStorage basket (add more items, change quantities). Then completes payment. |
| **Defense** | Cart contents are **locked at session creation time** via `productsIntent` in Stripe session metadata. Stripe charges based on `line_items` set at creation. Client cannot modify the Stripe session. |
| **State** | Stripe charges the original amounts. Webhook uses `productsIntent` metadata (not client basket). Order reflects session-time data. |
| **After-State** | Client basket may show different items than what was charged. `clearBasket()` on return page clears local state regardless. |

#### Assertions (WC-04): Cart locked at session creation

```typescript
// Session created with items A(qty:2), B(qty:1)
// User modifies localStorage to A(qty:5), C(qty:3)
// Payment completes...

const order = await sanityClient.fetch(
  `*[_type == "order" && payment.stripeCheckoutSessionId == $sid][0]{ items }`,
  { sid: sessionId }
);
expect(order.items).toHaveLength(2); // A and B, not C
expect(order.items[0].quantity).toBe(2); // Not 5
// ✅ Server-side truth prevails
```

### WC-05: Clerk Token Expiry During Mid-Checkout Processing

| Dimension | Specification |
|---|---|
| **Trigger** | User's Clerk session expires between entering checkout and clicking "Proceed to Payment" |
| **Impact on C-LAYOUT** | `currentUser()` returns null on next server render → user treated as guest. Address fallback to guest cookie. |
| **Impact on /api/checkout** | `currentUser()` returns null → `user?.id` = undefined → `metadata.clerkUserId = "guest"`, `customer_email` not set. |
| **Result** | Authenticated user's order created as guest order. Not linked to their account. |

#### Assertions (WC-05)

```typescript
// User was authenticated when starting checkout
// Token expires before POST /api/checkout
const res = await request.post('/api/checkout', {
  data: { publicBasket },
  headers: { 'Content-Type': 'application/json' }
  // Clerk cookie expired → currentUser() returns null
});
expect(res.status()).toBe(200); // Still succeeds
const { client_secret } = await res.json();
expect(client_secret).toBeTruthy();

// After payment + webhook:
const order = await sanityClient.fetch(
  `*[_type == "order" && payment.stripeCheckoutSessionId == $sid][0]`,
  { sid: sessionId }
);
expect(order.isGuest).toBe(true); // ❌ Should be false
expect(order.clerkUserId).toBeUndefined(); // ❌ Should be user's ID
```

### WC-06: Stripe Session Expires with Reserved Stock

| Dimension | Specification |
|---|---|
| **Trigger** | User creates checkout session (25-min TTL), then abandons. Session expires. |
| **Webhook** | `checkout.session.expired` fires → `handleSessionExpired()` → `releaseReservations()` |
| **Expected Math** | `reservedStock -= quantity` for each product |

#### Assertions (WC-06)

```typescript
// Pre: product.stock = 10, product.reservedStock = 3 (from session)
// After expired webhook:
const product = await sanityClient.fetch(
  `*[_type == "product" && _id == $id][0]{ stock, reservedStock }`,
  { id: productId }
);
expect(product.stock).toBe(10); // Unchanged
expect(product.reservedStock).toBe(0); // Released
```

### WC-07: Shippo Rate Drift (Future Integration)

| Dimension | Specification |
|---|---|
| **Context** | G-03 + G-09: Currently hardcoded $15.99 shipping. Target: Shippo API dynamic rates after address validation. |
| **Threat** | Rate quoted at C-1 (shipping step) differs from rate at C-2 (payment/session creation) due to API response variability or cache staleness. |
| **Defense Required** | Selected rate must be locked into Stripe session metadata at session creation time. Webhook must read rate from session, NOT re-query Shippo. |

#### Assertions (WC-07): Rate lock

```typescript
// Step 1: Shippo returns $12.50 at shipping selection
// Step 2: User proceeds to payment → POST /api/checkout includes selectedRate
// Step 3: Stripe session created with shipping line item = $12.50
// Step 4: Shippo rate changes to $15.00 (API volatility)
// Step 5: Webhook fires → reads amount_shipping from Stripe session

const order = await sanityClient.fetch(
  `*[_type == "order" && payment.stripeCheckoutSessionId == $sid][0]{ pricing }`,
  { sid: sessionId }
);
expect(order.pricing.shipping).toBe(12.50); // Locked at session creation, not $15.00
expect(order.pricing.total).toBe(subtotal + 12.50); // Consistent
```

### WC-08: JWT Cookie Forgery for Guest Address Injection

| Dimension | Specification |
|---|---|
| **Trigger** | Attacker crafts a `checkout_context` JWT cookie with forged address data. |
| **Defense** | `jose.jwtVerify()` with `CHECKOUT_JWT_SECRET` at [cookies.ts:25](file:///c:/webdev/sang-logium/lib/utils/cookies.ts#L25). Invalid/forged JWT → verify fails → returns null. |
| **Residual Risk** | If `CHECKOUT_JWT_SECRET` is compromised (noted as "potentially corrupted" in .env), attacker can forge valid JWTs. Fallback `"dev-secret-key"` at [cookies.ts:5](file:///c:/webdev/sang-logium/lib/utils/cookies.ts#L5) is catastrophic in production. |

#### Assertions (WC-08)

```typescript
// Forge JWT with wrong secret:
const forgedToken = await new jose.SignJWT({ address: { line1: 'MALICIOUS' } })
  .setProtectedHeader({ alg: 'HS256' })
  .sign(new TextEncoder().encode('wrong-secret'));

// Set cookie and visit checkout:
// Layout reads cookie → jwtVerify fails → returns null
// initialAddress = null → form starts empty
expect(initialAddress).toBeNull(); // Forged data rejected

// Forge JWT with ACTUAL secret (if compromised):
const validForge = await new jose.SignJWT({ address: { line1: 'INJECTED' } })
  .setProtectedHeader({ alg: 'HS256' })
  .sign(SECRET);
// This WOULD succeed — address pre-filled with attacker data
// Impact: Low — address is for display/form pre-fill only, not for payment
```

---

## §4 — Discovered Security Gaps (SG-XX)

These extend the state machine gaps (G-XX) with security-specific findings.

| ID | Gap | Severity | Source Lines | Depends On |
|---|---|---|---|---|
| **SG-01** | Non-atomic order creation + stock finalization | **Critical** | [webhook/route.ts:159-165](file:///c:/webdev/sang-logium/app/api/webhook/route.ts#L159-L165) | G-01 (WC-02) |
| **SG-02** | `reservedStock` can go negative under out-of-order webhook delivery | **Critical** | [webhook/route.ts:214-226](file:///c:/webdev/sang-logium/app/api/webhook/route.ts#L214-L226) | WH-OOD-02, SAN-RS-05 |
| **SG-03** | JWT fallback to `"dev-secret-key"` when `CHECKOUT_JWT_SECRET` undefined | **Critical** | [cookies.ts:5](file:///c:/webdev/sang-logium/lib/utils/cookies.ts#L5) | G-05, WC-08 |
| **SG-04** | No duplicate order detection for same user/basket within time window | **Major** | [webhook/route.ts:73-82](file:///c:/webdev/sang-logium/app/api/webhook/route.ts#L73-L82) | WC-03 |
| **SG-05** | `ifRevisionId` failure not explicitly caught/handled | **Major** | [checkout/route.ts:164-168](file:///c:/webdev/sang-logium/app/api/checkout/route.ts#L164-L168) | SAN-RC-01 |
| **SG-06** | Rollback failure for individual items silently logged, not propagated | **Major** | [checkout/route.ts:227-232](file:///c:/webdev/sang-logium/app/api/checkout/route.ts#L227-L232) | SAN-RS-06 |
| **SG-07** | `shippingAddress.state` = `""` fails order validation | **Major** | [checkout.types.ts:30](file:///c:/webdev/sang-logium/app/%28store%29/checkout/checkout.types.ts#L30), [addOrder.ts:64](file:///c:/webdev/sang-logium/sanity/lib/orders/addOrder.ts#L64) | SAN-ORD-06 |
| **SG-08** | Rate limit resets on server restart / does not span instances | **Minor** | [checkout/route.ts:11](file:///c:/webdev/sang-logium/app/api/checkout/route.ts#L11) | G-08 |
| **SG-09** | `x-forwarded-for` header spoofable for rate limit bypass | **Minor** | [checkout/route.ts:94-97](file:///c:/webdev/sang-logium/app/api/checkout/route.ts#L94-L97) | G-08 |
| **SG-10** | Clerk auth result not passed through to webhook — re-detection via metadata only | **Minor** | [checkout/route.ts:191](file:///c:/webdev/sang-logium/app/api/checkout/route.ts#L191), [webhook/route.ts:140](file:///c:/webdev/sang-logium/app/api/webhook/route.ts#L140) | WC-05 |
| **SG-11** | `generateOrderNumber` has TOCTOU race (count + 1 not atomic) | **Minor** | [addOrder.ts:7-19](file:///c:/webdev/sang-logium/sanity/lib/orders/addOrder.ts#L7-L19) | — |

---

## §5 — Proof-of-Invulnerability Checklist

When **every** assertion below passes, the backend is mathematically proven correct for the claimed threat model.

### 5.1 Webhook Integrity (8 assertions)

| # | Assertion | Test IDs | Status |
|---|---|---|---|
| **PI-01** | Webhook rejects all requests without valid `stripe-signature` | WH-SIG-01..03, WH-SIG-05 | ◻ |
| **PI-02** | Webhook rejects replayed events with stale timestamps | WH-RPL-02 | ◻ |
| **PI-03** | Duplicate `checkout.session.completed` for same session creates exactly 1 order | WH-RPL-01 | ◻ |
| **PI-04** | Non-permitted event types are acknowledged without processing | WH-EVT-01, WH-EVT-05 | ◻ |
| **PI-05** | `checkout.session.expired` decrements `reservedStock` to exactly 0 (from reservation amount) | WC-06, SAN-RS-02 | ◻ |
| **PI-06** | `checkout.session.async_payment_failed` decrements `reservedStock` to exactly 0 | SAN-RS-02 (variant) | ◻ |
| **PI-07** | After `checkout.session.completed`: `stock` decremented by exact purchase qty AND `reservedStock` decremented by exact purchase qty | SAN-RS-01, WC-01 | ◻ |
| **PI-08** | Handler failure returns `500`, enabling Stripe retry, without partial side effects on retry | WH-FAIL-01..04, WC-02 | ◻ **FAILS** (SG-01) |

### 5.2 Stock Integrity Invariants (6 assertions)

| # | Assertion | Test IDs | Status |
|---|---|---|---|
| **PI-09** | `∀ product: reservedStock >= 0` at all times | SAN-RS-05, WH-OOD-02 | ◻ **FAILS** (SG-02) |
| **PI-10** | `∀ product: stock >= 0` at all times | SAN-RC-02, SAN-RC-03 | ◻ |
| **PI-11** | `∀ product: reservedStock <= stock` at all times | SAN-RC-02 | ◻ |
| **PI-12** | Two concurrent checkouts for qty Q each, where available = Q + 1: exactly one succeeds, one gets `409` | SAN-RC-01 | ◻ |
| **PI-13** | Rollback after Stripe failure restores `reservedStock` to pre-checkout value | SAN-RS-03 | ◻ |
| **PI-14** | Multi-item rollback on partial failure restores all successfully-reserved items | SAN-RS-04, SAN-RS-06 | ◻ **PARTIAL** (SG-06) |

### 5.3 Input Validation (5 assertions)

| # | Assertion | Test IDs | Status |
|---|---|---|---|
| **PI-15** | `POST /api/checkout` rejects: empty array, non-array, >50 items, duplicates | SAN-INJ-07..10 | ◻ |
| **PI-16** | `POST /api/checkout` rejects: negative qty, zero qty, >99 qty, NaN, Infinity, non-numeric | SAN-INJ-03..06, SAN-INJ-11..12 | ◻ |
| **PI-17** | `POST /api/checkout` sanitizes `_id` against injection characters | SAN-INJ-01..02 | ◻ |
| **PI-18** | `POST /api/checkout` returns `429` after 5 requests in 60s from same IP | WC-03 pre-defense | ◻ |
| **PI-19** | `POST /api/checkout` returns generic error message (no stack traces, no internal details) | SAN-INJ-13 | ◻ |

### 5.4 Order Data Correctness (5 assertions)

| # | Assertion | Test IDs | Status |
|---|---|---|---|
| **PI-20** | `order.pricing.total === Σ(item.price × item.quantity) + shipping + tax` | WC-04, SAN-ORD-05 | ◻ |
| **PI-21** | `order.items` matches Stripe `line_items`, NOT client basket at payment time | WC-04 | ◻ |
| **PI-22** | `order.payment.stripeCheckoutSessionId` is unique across all orders | WH-RPL-01 | ◻ |
| **PI-23** | Guest orders have `isGuest: true` and no `clerkUserId`. Auth orders have `isGuest: false` and valid `clerkUserId`. | State machine Part 4 | ◻ |
| **PI-24** | `order.status === "pending_payment"` immediately after creation | [addOrder.ts:139](file:///c:/webdev/sang-logium/sanity/lib/orders/addOrder.ts#L139) | ◻ |

### 5.5 Future: Shipping Integration (3 assertions)

| # | Assertion | Test IDs | Status |
|---|---|---|---|
| **PI-25** | Shipping rate displayed to user === shipping rate charged by Stripe === `order.pricing.shipping` | WC-07, G-03 | ◻ **FAILS** (G-03: hardcoded/absent) |
| **PI-26** | Shippo rate is locked at session creation time, not re-queried at webhook | WC-07 | ◻ N/A (not yet integrated) |
| **PI-27** | If Shippo API is down, checkout falls back to hardcoded rate with user notification | — | ◻ N/A (not yet integrated) |

---

## §6 — Severity-Ordered Fix Priority for Sprint

| Priority | Gap ID | Fix Description | Complexity |
|---|---|---|---|
| **P0** | SG-01 | Make order creation + stock finalization atomic OR restructure idempotency to re-run `finalizeStock` if order exists but stock unfin. | High |
| **P0** | SG-02 | Add `Math.max(0, reservedStock - qty)` guard in `releaseReservations` and `finalizeStock`. Or: use `unset` + conditional patch. | Medium |
| **P0** | SG-03 | Remove `"dev-secret-key"` fallback. Throw on missing `CHECKOUT_JWT_SECRET` in production. | Low |
| **P1** | SG-07 | Make `state` optional in `validateOrderData` OR populate from address validation. | Low |
| **P1** | SG-05 | Wrap `ifRevisionId` patch in explicit try/catch with `409` response to client. | Medium |
| **P1** | SG-06 | Track failed rollbacks and emit to monitoring. Consider retrying. | Medium |
| **P2** | SG-04 | Add user+basket fingerprint dedup within 5-min window. | Medium |
| **P2** | SG-09 | Trust `x-forwarded-for` only from trusted proxy. Use request IP as fallback. | Low |
| **P3** | SG-08 | Acceptable for portfolio. Document limitation. (Redis upgrade path noted.) | N/A |
| **P3** | SG-10 | Acceptable. Metadata-based auth detection is Stripe's recommended pattern. | N/A |
| **P3** | SG-11 | Low risk at current scale. Use `nanoid` or Sanity's auto-ID for uniqueness. | Low |
