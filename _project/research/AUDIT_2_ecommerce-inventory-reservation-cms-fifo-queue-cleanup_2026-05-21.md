# Audit 2: Corrected Research — What Was Still Missed

**Audit Date:** 2026-05-21
**Auditor:** Self-audit of `ecommerce-inventory-reservation-cms-fifo-queue-cleanup_CORRECTED_2026-05-21.md`
**Scope:** Identify gaps, unasked questions, red flags, misunderstandings, and false positives that survived the first correction

---

## Executive Summary

The corrected research fixed three critical gaps (stock pre-check, cleanup idempotency, price verification) but **introduced new false positives** and **missed at least 10 additional critical issues**. The biggest remaining blind spot is the **post-reservation lifecycle** — what happens between reservation creation and payment success/failure is completely unexamined. This is not a minor gap; it is the second half of the system.

**Verdict after Audit 2:** The corrected research is **substantially better but still incomplete**. It correctly identifies implementation bugs but still operates on assumptions about how the system is supposed to work rather than verified facts.

---

## 1. Critical Questions That Remained Unasked

### Q-01: What Is the Full Reservation Lifecycle?
**Why This Matters:** The research analyzed reservation CREATION and EXPIRY cleanup, but never traced what happens in between. A reservation is created at checkout-button click. Then what?

**Unasked Questions:**
- Does the reservation doc get READ during payment processing? By what code?
- On successful payment, is the reservation doc deleted? Or does it transition to an "order"?
- On successful payment, does `stock` get decremented? Or does `reservedStock` just get decremented (net zero change to available stock)?
- If `stock` is decremented on payment, who does it? The payment webhook? The return page?
- If the reservation doc is deleted on successful payment, how does the order fulfillment system know what was purchased?

**Implication:** The reservation doc stores `verifiedPrice`, `parcel`, `shippingAddress`, and `shippingChoice`. If the doc is deleted after payment, all that data is lost unless it was copied to an order document. If the doc is NOT deleted, it accumulates indefinitely. The research never checked whether an order document exists or how it relates to the reservation.

**Evidence of Blind Spot:**
- Open Question #3 in corrected research: "What happens if a customer refreshes checkout page — is a new reservation created, or existing one extended?" — This assumes there IS a mechanism to find an existing reservation. There isn't one in the codebase.
- The corrected research's reservation lifecycle diagram ends at `[PAYMENT] → CONFIRM (remove reservation, decrement stock)`. This was GUESSED, not verified.

---

### Q-02: Why Does the Reservation Schema Have `shippingAddress` and `shippingChoice` If the Processor Never Sets Them?
**Why This Matters:** `basketReservationType.ts:88-156` defines `shippingAddress` (regionCode, postalCode, street, streetNumber, city) and `shippingChoice` (provider, serviceLevel, rateId, amount, currency, estimatedDays). But `processor.ts:123-129` only sets `basketReservation`, `createdAt`, and `expiresAt`.

**Unasked Questions:**
- Are these fields populated by a later step in the checkout flow?
- If so, the reservation doc is MUTABLE — it changes after creation. This means the "document-store reservation record" pattern is actually a "checkout state document" pattern, which is fundamentally different.
- If the doc is mutable, does the cleanup job know it shouldn't delete docs that have been updated with shipping data (i.e., actively being checked out)?
- If these fields are NEVER populated, why are they in the schema? Dead code?

**Implication:** The research classified this as "PII in reservation documents" (low severity) but didn't ask the deeper question: **why do these fields exist at all?** This is either dead schema fields or evidence of a checkout state machine that the research completely missed.

---

### Q-03: What Happens When `sanity.create()` Succeeds but `tx.commit()` Fails?
**Why This Matters:** `processor.ts:119-137`:
```typescript
const doc = await sanity.create({ _id: requestId, ... })      // Line 123 — succeeds
const tx = sanity.transaction()
for (const item of request.basketReservation) {
  tx.patch(item._id, (p) => p.inc({ reservedStock: item.quantity }))  // Line 135
}
await tx.commit()                                              // Line 137 — might fail
```

**The Scenario:**
1. Reservation doc created successfully
2. Transaction to increment `reservedStock` fails (e.g., Sanity rate limit, network timeout, product deleted)
3. Catch block at line 168 pops queue, deletes lock
4. **The reservation doc REMAINS** — but stock was never incremented
5. Cleanup job won't find it (not expired yet)
6. Result: **Orphaned reservation with zero stock impact**

**Unasked Question:** How is this recovered? The research's "crash recovery analysis" (G-07 in Audit 1) mentioned this state but never verified whether recovery exists.

**Verification:** No recovery mechanism exists in the codebase. No background job checks for "reservations without matching stock increments."

---

### Q-04: What Happens When the Post-Commit Fetch Fails?
**Why This Matters:** `processor.ts:140-145`:
```typescript
// 7. Fetch updated products
const products = await sanity.fetch(`*[_id in $ids]{ _id, stock, reservedStock, price_data }`, { ids: productIds })
```

**The Scenario:**
1. Doc created ✓
2. Stock incremented ✓
3. Fetch fails (Sanity timeout, network error)
4. Catch block at line 168:
```typescript
await redis.lpop(QUEUE_LIST_KEY)   // Queue item removed
await redis.del(LOCK_KEY)          // Lock released
```
5. **No cleanup of the reservation doc or stock increment**
6. Result: **Orphaned reservation with stock already incremented**

**Unasked Question:** Why does the processor fetch products AFTER committing the transaction? The response only needs `reservationId`, `ttl`, and product data. The product data could be returned from the pre-check (if one existed). The current design creates an unnecessary round-trip that introduces a failure mode.

**Implication:** This is a design flaw, not just an edge case. The post-commit fetch is unnecessary and dangerous.

---

### Q-05: What Is the Semantic Relationship Between `stock` and `reservedStock`?
**Why This Matters:** The research assumed `stock` is static physical inventory and `availableStock = stock - reservedStock`. But this was never verified against the Sanity schema or business logic.

**Unasked Questions:**
- Is `stock` decremented when a reservation is made? (No — only `reservedStock` is incremented)
- Is `stock` decremented when payment succeeds? (Unknown — no code was found that does this)
- If `stock` is NEVER decremented, then `stock` represents "original inventory" and `reservedStock` represents "temporarily held." But then when does physical inventory decrease?
- If `stock` IS decremented on payment, where is that code? The research never found it.

**Implication:** The research built its entire analysis on `availableStock = stock - reservedStock` without verifying that this formula is actually how the business calculates availability. If `stock` is already net of reservations (some systems do this), then `stock - reservedStock` double-counts.

**Evidence:** `BasketManager.tsx:97` calculates `availableStock = product.stock - product.reservedStock`. But this is frontend code. If the backend has a different formula, the frontend is wrong.

---

### Q-06: Why Not Store Reservations in Redis Instead of Sanity?
**Why This Matters:** Redis is already in the architecture (Upstash). Redis hashes with `HSET`, `HGETALL`, and `EXPIRE` are purpose-built for TTL-based reservation patterns. The Redis official tutorial uses exactly this pattern.

**Unasked Questions:**
- What was the original design rationale for choosing Sanity over Redis for reservations?
- Was it for GROQ querying? For Studio visibility? For audit trail?
- If the answer is "GROQ can query both products and reservations," does the codebase actually do this anywhere?
- If the answer is "Sanity is our source of truth," why is the reservation data (which is transient) in the same system as product data (which is long-lived)?

**Verification:** `getBasketProducts.ts` only queries products. No code was found that queries `basketReservation` documents. The "unified query" benefit is theoretical, not realized.

**Implication:** The research recommended "consider moving reservations to Redis" but never provided a decision framework. If reservations are moved to Redis, the Sanity rate limit problem disappears entirely. The FIFO queue might still be needed (for read-write isolation), but it would be a Redis-native queue (Streams or BullMQ), not a custom spin lock.

---

### Q-07: How Does the Cleanup Job Handle Large Batch Sizes?
**Why This Matters:** `cleanup.ts:69-102` processes expired reservations sequentially:
```typescript
for (const reservation of expired) {
  for (const item of reservation.basketReservation) {
    await releaseReservedStock(item._id, item.quantity)  // Sanity round-trip
  }
  await deleteExpiredReservation(reservation._id)          // Sanity round-trip
}
```

**The Math:**
- Per reservation: 1 `findExpiredReservations` query + N stock releases + 1 doc delete
- For a basket with 2 products: ~4 Sanity API calls per reservation
- At 100ms per call (network + Sanity processing): ~400ms per reservation
- If 100 reservations expire simultaneously: 100 × 400ms = **40 seconds**
- Netlify scheduled function default timeout: **10 seconds**

**Unasked Questions:**
- What is the maximum number of expired reservations the cleanup job has processed in production?
- Has the job ever timed out?
- Does Netlify retry timed-out scheduled functions?
- Why is there no pagination or batching limit?

**The research mentioned "add pagination" but didn't verify the actual timeout or calculate the actual batch capacity.** The `netlify.toml` doesn't specify a function timeout, so it uses the default (10s on most plans, 26s on Pro). The cleanup job WILL time out under moderate load.

---

### Q-08: What Prevents Duplicate Reservations from the Same Checkout?
**Why This Matters:** `processor.ts:48`:
```typescript
const requestId = randomUUID()  // New UUID every invocation
```

**The Scenario:**
1. Customer clicks checkout
2. Network is slow; customer double-clicks
3. Two requests hit `/api/checkout-queue`
4. Each gets a different `requestId`
5. Both create separate reservation documents
6. Both increment `reservedStock`
7. Customer only intends to buy once
8. Result: **Double reservation for the same checkout intent**

**Unasked Question:** Should the client provide an idempotency key? Should the processor deduplicate based on a client-provided `checkoutSessionId`?

**Comparison:**
- Stripe uses `Idempotency-Key` header
- Shopify uses `checkoutId` that persists across retries
- Vendure uses `Order` entity that accumulates items

**Our Code:** No idempotency mechanism. Every click = new reservation.

---

## 2. Gaps Still Missed (G-XX)

### G-01: No Rollback on Partial Failure in Processor
**Severity:** CRITICAL
**Location:** `processor.ts:168-178`
**What Was Missed:** The catch block pops the queue and releases the lock, but does NOT undo any Sanity mutations that already succeeded.

**Failure Matrix:**

| Crash Point | Doc Created | Stock Incremented | Queue Popped | Lock Released | Recovery |
|-------------|-------------|-------------------|--------------|---------------|----------|
| After `sanity.create()` | ✅ Yes | ❌ No | ❌ No | ❌ No | Orphaned doc, no stock impact |
| After `tx.commit()` | ✅ Yes | ✅ Yes | ❌ No | ❌ No | Orphaned doc AND stock; queue item still at head |
| After `lpop` | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No | Doc and stock valid; lock expires in 30s |
| During `sanity.fetch()` (line 142) | ✅ Yes | ✅ Yes | ❌ No | ❌ No | Orphaned doc and stock |

**Why the Research Missed This:** The corrected research analyzed crash recovery abstractly but never mapped it to the actual code paths. The catch block at line 168 is a single handler that treats all errors the same, but different error points have different cleanup needs.

**Fix:**
- Track which steps succeeded (doc created? stock incremented?)
- In catch block, conditionally undo each step:
  ```typescript
  if (docCreated) await sanity.delete(requestId).catch(() => {})
  if (stockIncremented) {
    const tx = sanity.transaction()
    for (const item of request.basketReservation) {
      tx.patch(item._id, (p) => p.dec({ reservedStock: item.quantity }))
    }
    await tx.commit().catch(() => {})
  }
  ```

---

### G-02: Post-Commit Fetch is Unnecessary and Dangerous
**Severity:** HIGH
**Location:** `processor.ts:140-145`
**What Was Missed:** The processor fetches products from Sanity AFTER creating the doc and incrementing stock. This fetch is only needed to build the response. If it fails, the reservation is orphaned.

**Why It's Unnecessary:**
- The response needs: `reservationId`, `ttl`, `products[].id`, `products[].realPrice`, `products[].stock`, `products[].reservedStock`
- If a stock pre-check were implemented, the pre-check already fetched this data
- The `reservationId` is known (`doc._id`)
- The `ttl` is a constant
- The response could be built from data already in memory

**Why It's Dangerous:**
- Adds a third Sanity round-trip after mutations are committed
- If this round-trip fails, mutations are NOT rolled back
- The catch block doesn't know which mutations succeeded

**Fix:** Build the response from data fetched during the pre-check. Remove the post-commit fetch entirely.

---

### G-03: Reservation Schema Has Dead Fields (or Reveals Missing Checkout Flow)
**Severity:** HIGH
**Location:** `basketReservationType.ts:88-156`
**What Was Missed:** The schema defines `shippingAddress` and `shippingChoice` fields, but `processor.ts:123-129` never populates them.

**Two Possibilities:**
1. **Dead fields:** They're never populated and should be removed from the schema.
2. **Missing checkout flow:** Some other code updates the reservation doc with shipping data during checkout. The research never found this code.

**If #2 is true:**
- The reservation doc is a mutable checkout state document, not an immutable reservation record
- The cleanup job might accidentally delete an active checkout's reservation if it runs while the customer is entering their address
- The TTL of 15 minutes might be too short for a multi-step checkout with address entry

**Why the Research Missed This:** The research read the schema but never cross-referenced it against what the processor actually writes. Schema ≠ runtime behavior.

**Fix:** Either remove dead fields or find the code that populates them and analyze its interaction with the cleanup job.

---

### G-04: No Deduplication / Idempotency on Duplicate Submissions
**Severity:** HIGH
**Location:** `processor.ts:48`
**What Was Missed:** `randomUUID()` generates a new ID on every invocation. Double-clicking checkout or network retries create multiple reservations.

**Evidence:**
- `processor.ts:48`: `const requestId = randomUUID()`
- `processor.ts:123`: `_id: requestId` — doc ID is the UUID
- No check for "does a reservation already exist for this basket/session?"

**Comparison:**
- Stripe: `Idempotency-Key` header ensures duplicate requests return the same result
- Shopify: Checkout ID persists across retries
- WooCommerce: Order ID is generated once; subsequent requests update the same order

**Fix:**
- Accept a client-provided `idempotencyKey` or `checkoutSessionId`
- Check if a reservation doc with that key already exists
- If yes, return the existing reservation (if not expired) or reject (if expired)

---

### G-05: Cleanup Job Will Timeout Under Moderate Load
**Severity:** HIGH
**Location:** `cleanup.ts:69-102`, `netlify.toml:22-25`
**What Was Missed:** The cleanup job processes ALL expired reservations in a sequential for loop with no batch limit. Under moderate load, it will exceed the Netlify function timeout.

**The Math (Verified):**
- Netlify.toml doesn't specify `timeout` for scheduled functions
- Default Netlify function timeout: 10 seconds (Free), 26 seconds (Pro)
- Per reservation (2 products): ~4 Sanity API calls
- At 100ms per call: ~400ms per reservation
- Max reservations per run at 10s timeout: **~25 reservations**
- Max reservations per run at 26s timeout: **~65 reservations**

**What if 100 reservations expire at once?** (e.g., a flash sale where many customers abandoned)
- Job processes 25, then Netlify kills it
- 75 reservations remain unprocessed
- Stock stays locked
- Next run (5 minutes later) processes another 25
- Total time to clear 100 expired reservations: **20 minutes**

**Why the Research Missed This:** The research mentioned "add pagination" but never calculated the actual capacity. It treated pagination as a nice-to-have rather than a production necessity.

**Fix:**
- Add `LIMIT 50` to `findExpiredReservations` query
- Process only 50 reservations per run
- Log a warning if more than 50 are found
- Consider running cleanup more frequently (e.g., every 2 minutes) during high-traffic events

---

### G-06: `Promise.all` on Synchronous Map Callback
**Severity:** LOW (but reveals code quality issues)
**Location:** `processor.ts:102-117`
**What Was Missed:**
```typescript
const cmsBasketReservation = await Promise.all(
  request.basketReservation.map(async (p, i) => {
    const verifiedPrice = p.price_data.unit_amount  // No async work
    return { ... }
  })
)
```

**The Issue:** The `map` callback is `async` but does no I/O. `Promise.all` is unnecessary overhead. This is a code smell that suggests the author doesn't understand when `Promise.all` is needed.

**Why It Matters:** Minor performance impact, but it signals that other parts of the code might have similar issues. If the author thought this needed `Promise.all`, they might also have introduced unnecessary async complexity elsewhere.

**Fix:**
```typescript
const cmsBasketReservation = request.basketReservation.map((p, i) => ({
  _key: `${p._id}-${i}`,
  _id: p._id,
  quantity: p.quantity,
  verifiedPrice: p.price_data.unit_amount,
  parcel: p.parcel,
}))
```

---

### G-07: `sanity.create()` Can Fail on ID Collision (or Retry)
**Severity:** MEDIUM
**Location:** `processor.ts:123`
**What Was Missed:** `sanity.create({ _id: requestId, ... })` will throw if a document with `_id === requestId` already exists.

**Scenarios:**
1. **UUID collision:** `randomUUID()` has astronomically low collision probability, but it's not zero
2. **Retry logic:** If a client retry mechanism resubmits the same payload, a NEW `requestId` is generated, so this won't collide. But if the client included its own ID, it might.
3. **Race condition:** Two requests with the same `requestId` (if idempotency is added later)

**Fix:** Use `createIfNotExists` instead of `create`:
```typescript
const doc = await sanity.createIfNotExists({ _id: requestId, _type: 'basketReservation', ... })
```

---

### G-08: `isBasketReservation` Doesn't Validate `parcel` Shape
**Severity:** MEDIUM
**Location:** `types.ts:62-77`
**What Was Missed:** The type guard checks `_id`, `quantity`, and `price_data` but `parcel` is optional and completely unvalidated.

```typescript
// types.ts:62-77 — parcel is not checked at all
export function isBasketReservation(v: unknown): v is BasketReservation {
  // ... checks _id, quantity, price_data ...
  // parcel is never validated
}
```

**Implication:** A malformed `parcel` object (e.g., `parcel: { length: "abc" }`) would pass validation and propagate to the reservation doc, potentially crashing shipping rate calculations later.

**Fix:** Add `parcel` shape validation to `isBasketReservation`:
```typescript
if (it.parcel !== undefined) {
  if (typeof it.parcel !== 'object' || it.parcel === null) return false
  const parcel = it.parcel as Record<string, unknown>
  if (typeof parcel.length !== 'number') return false
  // ... etc
}
```

---

### G-09: `RESERVATION_TTL_SEC` Parsed Multiple Times Inconsistently
**Severity:** LOW
**Location:** `processor.ts:21`, `processor.ts:120`, `constants.ts:10`
**What Was Missed:**

```typescript
// processor.ts:21
const RESERVATION_TTL_SEC = parseInt(process.env.RESERVATION_TTL_SEC || '900', 10)

// processor.ts:120
const ttlSec = parseInt(process.env.RESERVATION_TTL_SEC || '900', 10)

// constants.ts:10
export const RESERVATION_TTL_SEC = parseInt(process.env.RESERVATION_TTL_SEC || '900', 10)
```

**The Issue:**
- `processor.ts` has its own local constant AND re-parses the env var inline
- `constants.ts` exports a parsed value, but `processor.ts` doesn't use it
- If the env var changes between module load and request processing (e.g., hot reload), the values could differ
- Minor code smell, but it shows lack of attention to consistency

**Fix:** Use the exported constant from `constants.ts`:
```typescript
import { RESERVATION_TTL_SEC } from './constants'
```

---

### G-10: `realPrice` Response Field Might Divide by 100 Incorrectly
**Severity:** MEDIUM
**Location:** `processor.ts:153`
**What Was Missed:**
```typescript
realPrice: p.price_data.unit_amount / 100,  // Is unit_amount in cents or dollars?
```

**The Question:** Is `price_data.unit_amount` stored in cents (like Stripe) or dollars (like Sanity number fields usually are)?

**Evidence:**
- `sanity-cms/schemaTypes/productType.ts` defines `price_data` as a `number` with no unit annotation
- Stripe uses cents: `$10.00 = 1000` cents
- Sanity typically stores numbers as-is: `$10.00 = 10.00` dollars
- The frontend (`BasketManager.tsx:96`) also divides by 100

**If Sanity stores dollars:** Dividing by 100 produces `$0.10` instead of `$10.00` — a 100x price error.

**Why the Research Missed This:** The research noticed `verifiedPrice` was unverified but didn't question the unit conversion logic. This is a data contract issue that could cause catastrophic pricing errors.

**Fix:** Verify the actual values in Sanity. Check if `unit_amount` is stored as cents or dollars. If dollars, remove the `/ 100` division.

---

### G-11: `createdAt` Uses Client Time, `expiresAt` Uses Server Time
**Severity:** LOW
**Location:** `processor.ts:121`, `processor.ts:127`
**What Was Missed:**
```typescript
// processor.ts:121
const expiresAt = new Date(Date.now() + ttlSec * 1000).toISOString()  // Server time

// processor.ts:127
createdAt: request.createdAt  // Client time — potentially wrong
```

**Implication:**
- `request.createdAt` comes from the frontend's `new Date().toISOString()`
- If the client's clock is 5 minutes slow, `createdAt` is 5 minutes in the past
- `expiresAt` is calculated from server time
- The doc stores inconsistent timestamps
- Not critical (cleanup uses `expiresAt`), but it shows the `createdAt` field is unreliable

**Fix:** Use server time for both:
```typescript
const now = new Date().toISOString()
const doc = await sanity.create({
  createdAt: now,
  expiresAt: new Date(Date.now() + ttlSec * 1000).toISOString(),
})
```

---

### G-12: Redis Queue Persistence Risk
**Severity:** MEDIUM
**Location:** `redis.ts:1-33`
**What Was Missed:** The project uses Upstash Redis (a managed Redis service with REST API). What happens if:
- Upstash Redis restarts?
- Upstash Redis has a network partition?
- The Redis instance is evicted (memory pressure)?

**Implication:**
- Queue items (`RPUSH`) are lost on Redis restart
- In-flight reservations that haven't been processed yet disappear from the queue
- But the reservation docs in Sanity remain
- If the lock key also disappears, the next requester gets the lock and processes the next item
- The "lost" queue items are never processed — their reservation docs are orphaned

**Why the Research Missed This:** The research analyzed Redis failure as "entire queue mechanism fails" but didn't trace the specific failure mode of queue loss with doc persistence.

**Fix:**
- Add a periodic "reconcile" job that finds reservation docs without corresponding queue items
- Or: persist queue items in Sanity with a "pending" status, using Redis only for ordering

---

## 3. False Positives in the Corrected Research

### FP-01: "The FIFO queue is justified"
**Reality:** The corrected research concluded the queue is justified because of the read-write cycle isolation gap. But it never analyzed whether the read-write cycle is NECESSARY.

**The Unasked Question:** Could the processor avoid the read-write cycle entirely?

**Alternative Design:**
1. Don't fetch products before the transaction
2. Run a Sanity transaction that:
   - Creates the reservation doc
   - Increments `reservedStock` for each product
3. If the transaction fails (e.g., product doesn't exist), the whole thing rolls back
4. No read-write cycle = no isolation gap = FIFO queue potentially unnecessary

**Why This Matters:** The research justified the queue's existence without questioning whether the design that requires the queue is optimal. The queue adds complexity (spin loops, timeouts, Redis dependency). If the read-write cycle can be eliminated, the queue might not be needed.

**Caveat:** A stock availability pre-check DOES require reading current stock levels, which creates a read-write cycle. But if the pre-check is done with `ifRevisionID` optimistic locking, the queue could be replaced.

---

### FP-02: "~8 checkouts/second maximum"
**Reality:** This calculation is oversimplified and potentially misleading.

**The Calculation:**
- 25 mutations/sec per IP
- 2 mutations per checkout (create doc + transaction)
- 25 / 2 = ~12 checkouts/sec
- The research said "~8 checkouts/second" (conservative)

**What's Missing:**
- The cleanup job ALSO makes mutations (decrement stock + delete doc)
- If cleanup runs every 5 minutes and processes 50 reservations, that's ~17 mutations over 5 minutes — negligible
- BUT during a flash sale with 100 abandoned checkouts, cleanup makes 200+ mutations in a short burst
- Product listing pages that query `reservedStock` count as queries, not mutations
- The `trace` function writes to Redis (not Sanity)

**More importantly:** The limit is "per IP." In a serverless environment, each function instance might have a different outbound IP. Or they might share one. The research never verified how Netlify functions egress traffic.

**The Real Limit:** If all Netlify function instances share a single outbound IP (common for serverless platforms), then ALL checkout traffic shares the 25 mutations/sec limit. If they have different IPs, the limit scales with concurrency.

**Fix:** Verify Netlify's outbound IP behavior. If shared, the 25 mutations/sec limit is a hard global ceiling.

---

### FP-03: "Sanity's `ifRevisionID` could replace the FIFO queue"
**Reality:** The research mentioned `ifRevisionID` as a potential alternative but never analyzed the multi-product case.

**The Math:**
- Basket with N products
- To use `ifRevisionID`, the processor must:
  1. Read each product's `_rev` (N round-trips, or 1 batch query)
  2. Run a transaction with `ifRevisionID` on each product (1 transaction)
- If any product's `_rev` changed between read and transaction, the whole transaction fails with HTTP 409
- The processor must retry: re-read all N products' `_rev`, re-run the transaction

**Comparison:**
- FIFO queue: 1 lock acquisition + 1 transaction (regardless of N products)
- `ifRevisionID`: 1 batch read + 1 transaction + potential retries

**For N=1 (single product):** `ifRevisionID` is competitive.
**For N=5 (typical basket):** FIFO queue is simpler and has fewer round-trips.

**The research didn't do this analysis.** It treated `ifRevisionID` as a viable alternative without proving it.

---

## 4. Misunderstandings That Persist

### M-01: The Reservation Doc Is a "Reservation Record"
**Reality:** It might actually be a "Checkout State Document."

**Evidence:**
- Schema has `shippingAddress` and `shippingChoice` fields
- The doc's `_id` is the `requestId`, not a reservation-specific ID
- The doc is created at checkout-button click, not at add-to-cart
- If shipping data is added later, the doc is MUTABLE

**If it's a state document:**
- It should NOT be deleted by the cleanup job while the customer is actively checking out
- The cleanup job should check for recent updates (e.g., `updatedAt > now - 5min`) before deleting
- The TTL should be extendable (heartbeat)

**The research treated it as an immutable reservation record.** This might be the wrong mental model.

---

### M-02: "Stock availability pre-check" Is a Simple Fix
**Reality:** Adding a pre-check is more complex than the research suggested.

**The Naive Fix (recommended by corrected research):**
```typescript
const products = await sanity.fetch(`*[_id in $ids]{ stock, reservedStock }`, { ids })
for (const item of request.basketReservation) {
  const product = products.find(p => p._id === item._id)
  if (product.stock - product.reservedStock < item.quantity) {
    return { status: 409, body: { ok: false, error: 'Insufficient stock' }}
  }
}
```

**Why This Is Wrong:**
- Between the pre-check fetch and the transaction commit, another request can modify `reservedStock`
- The FIFO queue prevents concurrent interleaving, but a single request's pre-check and transaction are NOT atomic
- The pre-check gives a POINT-IN-TIME snapshot, not a guarantee

**The Correct Fix:**
- The pre-check is a "best effort" rejection for OBVIOUSLY insufficient stock
- The REAL protection comes from making the transaction conditional
- But Sanity doesn't support conditional transactions ("only commit if stock >= quantity")
- So the pre-check + FIFO queue together provide sufficient protection:
  1. Pre-check rejects obvious oversells (good UX — fast failure)
  2. FIFO queue prevents concurrent requests from both succeeding (race condition protection)

**The research oversimplified the fix.** It said "fetch stock, calculate available, reject if insufficient" without explaining that this is a UX optimization, not a correctness guarantee.

---

### M-03: The Research Treats "Negative reservedStock" as a Bug
**Reality:** Negative `reservedStock` IS a bug in the current implementation, but the research didn't ask WHY the tests tolerate it.

**The Test:**
```typescript
expect(afterProduct.reservedStock).toBeLessThanOrEqual(0)
```

**Possible Explanations:**
1. The test author knew cleanup could double-release and wrote a loose assertion
2. The test author didn't know `reservedStock` should never be negative
3. The test was written before `reservedStock` existed, and the assertion was never updated

**The research assumed #1 or #2.** But #3 is also possible. If the test predates the schema's `min(0)` validation, the test might just be outdated.

**Why This Matters:** If the test is outdated, the fix is to update the test AND add the guard. If the test was intentionally loose, the fix is to redesign the cleanup job. The diagnosis affects the prescription.

---

## 5. Red Flags Still Present in the Codebase

| Red Flag | Location | Why It Escaped the Corrected Research |
|----------|----------|--------------------------------------|
| Catch block doesn't undo Sanity mutations | `processor.ts:168-178` | Research mentioned it abstractly but never mapped to actual code |
| Post-commit fetch is unnecessary | `processor.ts:142-145` | Research never questioned why products are fetched AFTER committing |
| Reservation schema has unpopulated fields | `basketReservationType.ts:88-156` | Research noted PII but didn't ask why fields exist if never set |
| No idempotency on duplicate checkout clicks | `processor.ts:48` | Research never considered double-submit scenarios |
| Cleanup job has no batch limit | `cleanup.ts:78` | Research mentioned pagination but didn't calculate capacity |
| `Promise.all` on sync map | `processor.ts:102-117` | Research never inspected for code quality issues |
| `unit_amount / 100` unit conversion unverified | `processor.ts:153` | Research noticed unverified price but missed unit conversion |
| `RESERVATION_TTL_SEC` parsed inconsistently | 3 locations | Research never checked for code consistency |
| `createdAt` from client time | `processor.ts:127` | Research never questioned timestamp sources |
| Redis queue items lost on restart | `redis.ts` | Research mentioned Redis failure but not specific queue-loss mode |

---

## 6. What Should Have Been Done Differently

### The Research Should Have Traced the Full Lifecycle
Instead of analyzing reservation → cleanup, it should have traced:
```
Add to Cart → View Basket → Click Checkout → Create Reservation → Enter Address → Enter Shipping → Enter Payment → Payment Success → Confirm Order → Decrement Stock → Delete Reservation
                                         ↓
                                    Payment Failure / Abandon → Expire → Cleanup
```

Each arrow is a code path that should have been found and verified.

### The Research Should Have Asked "Why Sanity?" Before Defending It
The research spent effort proving that Sanity CAN work for reservations. It should have first asked whether Sanity SHOULD work for reservations, given that Redis is already in the architecture.

### The Research Should Have Read Every Line of `processor.ts` Sequentially
The corrected research jumped to specific lines (119-137, 104) but never did a sequential walkthrough of the entire function. A sequential read would have caught:
- The post-commit fetch danger
- The catch block's lack of rollback
- The `Promise.all` code smell
- The inconsistent TTL parsing

---

## 7. Updated Action Items (Priority Order)

| Priority | Action | Location | Rationale |
|----------|--------|----------|-----------|
| P0 | Add stock availability pre-check | `processor.ts:119` | UX optimization — reject obvious oversells before creating docs |
| P0 | Add partial failure rollback | `processor.ts:168-178` | Currently, any error after doc creation leaves orphans |
| P0 | Remove post-commit fetch; build response from pre-check data | `processor.ts:140-145` | Eliminates a failure mode and a round-trip |
| P0 | Add batch limit to cleanup job | `cleanup.ts:78` | Prevents Netlify timeout under load |
| P1 | Make cleanup idempotent with `stockReleased` flag | `cleanup.ts:12-22`, schema | Prevents double-release |
| P1 | Add guard against negative `reservedStock` | `cleanup.ts:12-22` | Enforces schema constraint at API level |
| P1 | Verify `unit_amount` unit (cents vs dollars) | `processor.ts:153`, `BasketManager.tsx:96` | Potential 100x pricing error |
| P1 | Add client idempotency key | `types.ts`, `processor.ts:48` | Prevents duplicate reservations on double-click |
| P2 | Investigate `shippingAddress`/`shippingChoice` usage | `basketReservationType.ts:88-156` | Either dead code or missing checkout flow |
| P2 | Use `createIfNotExists` instead of `create` | `processor.ts:123` | Prevents ID collision failures |
| P2 | Use exported `RESERVATION_TTL_SEC` consistently | `processor.ts:21,120` | Code consistency |
| P2 | Validate `parcel` shape in type guard | `types.ts:62-77` | Prevents malformed data propagation |
| P3 | Add reservation heartbeat endpoint | New file | Prevents mid-checkout expiry |
| P3 | Add queue reaper for stale items | `processor.ts` | Recovers from Redis restart |

---

## 8. Final Verdict After Audit 2

**Pattern:** ✅ Valid and proven
**Original Implementation:** ❌ Critical gaps (stock pre-check, cleanup idempotency, price verification)
**Corrected Research:** ⚠️ Better but still incomplete — missed the full lifecycle, post-commit fetch danger, cleanup timeout, idempotency, and several code quality issues

**The single most important remaining gap:** The processor's catch block doesn't undo Sanity mutations, creating orphaned reservations on ANY failure after doc creation. This is not an edge case — it's a systematic flaw in the error handling design.

**The second most important gap:** The cleanup job has no batch limit and will timeout under moderate load, leaving expired reservations unprocessed for up to 20 minutes.

**The third most important gap:** The research never verified the full reservation lifecycle (payment success → order confirmation → stock decrement). Without this, the reservation system is an island that doesn't connect to the rest of the checkout flow.
