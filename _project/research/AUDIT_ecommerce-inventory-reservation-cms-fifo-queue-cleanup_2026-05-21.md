# Audit: Ecommerce Inventory Reservation Research

**Audit Date:** 2026-05-21
**Auditor:** Self-audit of `_project/research/ecommerce-inventory-reservation-cms-fifo-queue-cleanup_2026-05-21.md`
**Scope:** Identify gaps, false assumptions, missed verifications, and red flags in the research artifact

---

## 1. Critical Gaps Missed by the Research

### G-01: No Stock Availability Check Before Reservation
**Severity:** CRITICAL
**Research Claim:** "Prevents oversells" (Pattern 4, Soft Reservation)
**Actual Code (`lib/queue/processor.ts:119-137`):**
```typescript
// 5. Create reservation doc
const doc = await sanity.create({ ... })

// 6. Increment reservedStock atomically
const tx = sanity.transaction()
for (const item of request.basketReservation) {
  tx.patch(item._id, (p) => p.inc({ reservedStock: item.quantity }))
}
await tx.commit()
```

**Gap:** The processor creates a reservation document AND increments `reservedStock` WITHOUT ever verifying that `stock - reservedStock >= requestedQuantity`. The FIFO queue prevents concurrent write corruption, but it does NOT prevent a single request from reserving more stock than exists.

**Why This Matters:**
- A customer could request 10 units when only 3 are available
- The system would happily increment `reservedStock` by 10
- `availableStock = stock - reservedStock` would become negative
- The frontend (`BasketManager.tsx:97`) calculates this and would display negative available stock

**What the Research Should Have Done:**
- Verified that the processor fetches current stock levels BEFORE creating the reservation
- Verified that the type guard (`isBasketReservation`) or processor checks availability
- Verified that tests exist for "insufficient stock" rejection

**Test Evidence:**
- `tests/checkout-queue/integration/happy-path/sequential-fifo.test.ts` - Tests FIFO ordering only (9 requests, all with quantity=1 on products with presumably high stock)
- `tests/checkout-queue/integration/happy-path/basket-reservation-flow-happy-path.test.ts` - Tests doc creation and stock increment only
- ZERO tests verify "request rejected when stock insufficient"

---

### G-02: `reservedStock` Can Go Negative — And Tests Expect It
**Severity:** HIGH
**Research Claim:** "Ensures 0 reservedStock and stock mix ups" (user's original question)
**Actual Code (`tests/checkout-queue/integration/reservation-ttl/cleanup/background-cleanup-stock.test.ts:64-65`):**
```typescript
// Verify reservedStock was released (may be negative if cleanup processed multiple reservations)
const afterProduct = await sanity.fetch(`*[_id == $id][0]{ reservedStock }`, { id: testProducts[0]._id })
expect(afterProduct.reservedStock).toBeLessThanOrEqual(0)
```

**Gap:** The test explicitly allows `reservedStock <= 0`, meaning **negative values are expected and accepted**. This directly contradicts the schema validation (`productType.ts:119: validation: (Rule) => Rule.min(0)`), which only applies in Sanity Studio, not via API transactions.

**Why This Matters:**
- `availableStock = stock - reservedStock` becomes `stock - (-5) = stock + 5` — falsely inflating available inventory
- A negative `reservedStock` means "we think we have MORE stock than physically on hand"
- This is exactly the "stock mix up" the user was trying to prevent

**Root Causes of Negative reservedStock:**
1. Cleanup job releases stock from a reservation where stock was NEVER incremented (processor crash between doc create and stock increment)
2. Cleanup job runs twice on the same reservation (non-idempotent release)
3. No availability check means initial reservation could already exceed stock

**What the Research Should Have Done:**
- Inspected the test assertions and flagged `toBeLessThanOrEqual(0)` as a red flag
- Investigated why negative reservedStock is tolerated
- Verified whether the cleanup job is idempotent

---

### G-03: Cleanup Job is NOT Idempotent — Causes Double-Release
**Severity:** HIGH
**Research Claim:** "Standard practice; necessary for TTL expiry"
**Actual Code (`lib/queue/cleanup.ts:69-102`):**
```typescript
for (const item of reservation.basketReservation) {
  const released = await releaseReservedStock(item._id, item.quantity)
  // ... then delete doc
}
```

`releaseReservedStock` blindly decrements `reservedStock` by `quantity` with no check for whether this reservation's stock was already released.

**Gap:** If `deleteExpiredReservation` fails but `releaseReservedStock` succeeds, the next cleanup run will:
1. Find the SAME expired reservation (still exists because delete failed)
2. Decrement `reservedStock` AGAIN by the same quantity
3. Result: `reservedStock` goes negative by exactly the reservation quantity

**Why This Matters:**
- This is the exact mechanism that produces the negative reservedStock the tests expect
- Under partial failure, inventory accuracy degrades silently
- No alerting or monitoring on "orphaned reservations with already-released stock"

**What the Research Should Have Done:**
- Analyzed cleanup job idempotency
- Flagged the missing "already released?" check
- Recommended adding a `releasedStock` flag to the reservation document or using a single atomic transaction for both stock release + doc deletion

---

### G-04: Sanity Transaction Atomicity Never Verified
**Severity:** HIGH
**Research Claim:** "Sanity transaction for atomic reservedStock increments" (MAJOR ADR.md line 20)
**Research Statement:** "CMS transactions are weaker than ACID databases" (First Principles, constraint 4)

**Gap:** The research NEVER verified what Sanity's `transaction().commit()` actually guarantees.
- Is it optimistic locking (fails if document changed since read)?
- Is it serializable within Sanity's backend?
- What happens if two concurrent transactions `inc({ reservedStock: 1 })` on the same product?
- Does Sanity support conditional patches ("only if reservedStock + quantity <= stock")?

**Why This Matters:**
- If Sanity transactions are NOT truly atomic across documents, the FIFO queue is the ONLY thing preventing corruption
- If Sanity transactions ARE atomic, the FIFO queue may be unnecessary complexity
- The research justified the FIFO queue as compensation for "weak CMS transactions" but never proved the transactions are weak

**What the Research Should Have Done:**
- Checked Sanity documentation for transaction semantics
- Checked next-sanity / @sanity/client docs for `transaction()` behavior
- Checked whether Sanity supports conditional operations (like DynamoDB ConditionExpression)
- If transactions are strong, questioned whether FIFO queue is needed at all

---

### G-05: No Verification That Client `price_data` is Actually Verified
**Severity:** MEDIUM
**Research Claim:** "Stripe price verification (getVerifiedPrice)" (checkout-button-to-queue-flow-research.md line 103)
**Actual Code (`lib/queue/processor.ts:100-116`):**
```typescript
const cmsBasketReservation = await Promise.all(
  request.basketReservation.map(async (p, i) => {
    const verifiedPrice = p.price_data.unit_amount  // ← Copies client value, no verification
    priceVerificationData.push({ productId: p._id, verifiedPrice })
    return { _id: p._id, quantity: p.quantity, verifiedPrice, parcel: p.parcel }
  })
)
```

**Gap:** The processor does NOT fetch product prices from Sanity to verify against the client's submitted `price_data`. It blindly copies `p.price_data.unit_amount` from the untrusted client request and labels it `verifiedPrice`. A malicious client could send any price.

**Why This Matters:**
- "Price verification" is a false claim in the codebase comments
- The response includes a `debug.priceVerification` field that provides false confidence
- Payment amount could be manipulated client-side before Stripe integration

**What the Research Should Have Done:**
- Verified whether `verifiedPrice` is actually verified against CMS data
- Checked if there's any server-side price lookup
- Flagged this as a security/integrity gap

---

### G-06: Zero Production Examples Using Sanity for Inventory Reservation
**Severity:** MEDIUM
**Research Claim:** "Document stores are used for reservation records in production" (citing MongoDB official example)
**Gap:** The research found ZERO production examples of **Sanity CMS specifically** being used for inventory reservation. MongoDB is a general-purpose document database with ACID transactions (since v4.0). Sanity is a **headless CMS optimized for content**, not a general-purpose database.

**Why This Matters:**
- MongoDB's reservation pattern tutorial does NOT imply Sanity can handle the same workload
- Sanity has different API rate limits, latency characteristics, and transaction guarantees than MongoDB
- The research conflated "document store" (MongoDB) with "headless CMS" (Sanity)

**What the Research Should Have Done:**
- Searched specifically for "Sanity ecommerce inventory" or "Sanity stock management"
- Verified Sanity's documented use cases (content, not transactional inventory)
- Checked Sanity's API rate limits for write operations
- Acknowledged that this is likely an uncommon pattern with Sanity specifically

---

### G-07: No Analysis of Crash Recovery for Each Processor Step
**Severity:** MEDIUM
**Research Claim:** Discussed "lock TTL expires" and "queue timeout" edge cases
**Gap:** The research did NOT map out what happens if the Node process crashes at each step of `processInline`:

| Step | Crash Point | Consequence | Recovery |
|------|-------------|-------------|----------|
| After RPUSH | After enqueue, before lock | Queue item exists, no lock, no processing | Item stays in queue forever — no reaper |
| After SET NX | Lock held, before doc creation | Lock expires in 30s, queue item remains at head | Next requester might get stale head |
| After `sanity.create` | Doc exists, before stock increment | Doc exists, reservedStock NOT incremented | Cleanup will try to decrement stock that was never incremented → negative |
| After `tx.commit` | Stock incremented, before LPOP | Reservation valid, queue item still at head | Next requester sees itself at head, processes, but stock already reserved |
| After LPOP, before DEL | Queue item popped, lock still held | Lock expires in 30s | Normal — lock TTL handles it |

**Why This Matters:**
- The system has multiple failure modes that can lead to stuck queue items or negative reservedStock
- No recovery mechanism for "doc exists but stock not incremented" state

**What the Research Should Have Done:**
- Created a step-by-step crash analysis table
- Identified that the "doc exists but stock not incremented" state is unrecoverable without manual intervention
- Recommended idempotency or two-phase commit pattern

---

### G-08: No Investigation of Sanity API Rate Limits
**Severity:** MEDIUM
**Research Claim:** "Valid for low-to-medium concurrency"
**Gap:** The research estimated "~10 concurrent checkouts/minute" as the threshold but NEVER verified Sanity's actual API rate limits.

**Why This Matters:**
- Sanity's API has documented rate limits (typically burst + sustained limits)
- A checkout flow that creates a doc + runs a multi-document transaction per request could hit limits quickly
- Rate limiting during checkout = failed checkouts = lost revenue

**What the Research Should Have Done:**
- Checked Sanity's API documentation for rate limits on the dataset plan being used
- Estimated requests per checkout (create doc + transaction + fetch + cleanup queries)
- Provided actual numbers, not "~10/minute" guess

---

### G-09: No Analysis of Why TTL Documents vs. Append-Only Compensation
**Severity:** LOW-MEDIUM
**Research Claim:** "Conceptually identical append-only record pattern" (comparing to Magento/Adobe)
**Gap:** The research acknowledged Magento uses "append-only reservation records" with compensating entries (sum to zero), but never analyzed why the project chose **TTL documents that are deleted** instead.

**Why This Matters:**
- Append-only (event log) provides an audit trail of every reservation/release
- TTL documents provide no history after deletion
- If a bug corrupts `reservedStock`, append-only logs allow reconstruction; TTL docs do not
- The research said "conceptually identical" but they are architecturally different

**What the Research Should Have Done:**
- Analyzed the tradeoff between TTL documents (simpler, no history) vs. append-only event log (auditable, recoverable)
- Recommended whether the project should add an audit trail

---

### G-10: PII in Reservation Documents Not Addressed
**Severity:** LOW
**Research Claim:** Not mentioned
**Gap:** The `basketReservation` schema (`sanity-cms/schemaTypes/basketReservationType.ts:88-156`) includes `shippingAddress` and `shippingChoice` fields. If populated, these contain customer PII.

**Why This Matters:**
- Cleanup deletes expired reservations (good for GDPR)
- But what about successfully completed orders? Are reservation docs preserved?
- If preserved, they contain PII indefinitely without a data retention policy
- If deleted, order history loses its shipping reference

**What the Research Should Have Done:**
- Noted the PII fields in the schema
- Questioned whether reservation docs should contain shipping data or reference an order doc
- Considered GDPR/data retention implications

---

## 2. False Assumptions in the Research

### FA-01: "The FIFO queue prevents overselling"
**Reality:** The FIFO queue prevents concurrent write corruption (race conditions on `reservedStock`). It does NOT prevent a single request from over-reserving because there is no availability check.

### FA-02: "Sanity transactions are weaker than ACID databases"
**Reality:** The research stated this as fact but never verified it. Sanity's transactions might be perfectly adequate. Or they might be weaker. The research didn't check.

### FA-03: "Price verification works" (from prior research, carried forward)
**Reality:** The code copies `price_data.unit_amount` from the client without server-side verification. The `verifiedPrice` field name is misleading.

### FA-04: "Tests validate overselling prevention"
**Reality:** No test checks for insufficient stock rejection. All tests use happy-path scenarios with quantity=1 on well-stocked products.

### FA-05: "Document store pattern = Sanity can do what MongoDB does"
**Reality:** MongoDB is a general-purpose document database. Sanity is a headless CMS. Different systems, different guarantees, different rate limits, different use cases.

---

## 3. Red Flags in the Current Implementation (Not Flagged by Research)

| Red Flag | Location | Why Serious |
|----------|----------|-------------|
| No stock availability pre-check | `processor.ts:119-137` | Can over-reserve, leading to negative available stock |
| `reservedStock` can go negative | `cleanup.ts:12-22`, tests | Schema says `min(0)` but API allows negative; breaks inventory math |
| Cleanup job not idempotent | `cleanup.ts:69-102` | Double-release on partial failure |
| `verifiedPrice` not verified | `processor.ts:104` | Security gap; client can submit arbitrary prices |
| Queue item has no reaper | `processor.ts:61` | Hard crash leaves stale item in Redis queue |
| No reservation extension mechanism | `processor.ts:120-128` | If checkout takes >15 min (e.g., slow payment), reservation expires mid-checkout |
| `expiresAt` uses server `Date.now()`, not client `createdAt` | `processor.ts:121` | Minor inconsistency; `createdAt` from client could be stale/different timezone |
| `Promise.all` for non-async map | `processor.ts:102-117` | `map` callback is async but does no I/O; unnecessary `Promise.all` |

---

## 4. What the Research Got Right

| Item | Assessment |
|------|------------|
| Checkout-level reservation (not cart-level) | ✅ Correctly identified as industry norm |
| Expiration with auto-release | ✅ Correctly identified as Pattern 4 |
| Background cleanup job as standard practice | ✅ Correctly identified |
| Separation of `stock` and `reservedStock` | ✅ Correctly identified as best practice |
| Spin lock limitations (CPU, timeout) | ✅ Correctly identified |
| Magento/Adobe reservation pattern | ✅ Accurately described |
| Redis tutorial as authoritative | ✅ Correctly cited |

---

## 5. Corrected Verdict

**Original Verdict:** "VALID AND PROVEN, WITH CAVEATS"

**Corrected Verdict:** "VALID PATTERN, BUT CURRENT IMPLEMENTATION HAS CRITICAL INVENTORY ACCURACY GAPS"

The architectural pattern (soft reservation + TTL + cleanup) is indeed valid and proven. However, the **current implementation** has fundamental gaps that undermine its core purpose:

1. **It does not actually prevent overselling** (no availability check)
2. **It tolerates negative `reservedStock`** (cleanup non-idempotency + no guardrails)
3. **It has unrecoverable failure states** (crash between doc create and stock increment)

These are not "caveats" — they are **bugs that directly contradict the stated goal** of "ensuring 0 reservedStock and stock mix ups."

---

## 6. Recommendations for Follow-Up Research

1. **Investigate Sanity transaction semantics** — What does `transaction().commit()` actually guarantee? Can it do conditional updates?
2. **Find actual Sanity ecommerce projects** — Are there any documented production uses of Sanity for inventory? Or is this uncharted territory?
3. **Verify Sanity API rate limits** — Exact numbers for the project's plan
4. **Research two-phase commit / idempotent cleanup patterns** — How do production systems ensure cleanup doesn't double-release?
5. **Research "available stock" pre-check patterns** — How do Magento, Vendure, etc. verify stock before reserving?
6. **Research reservation extension / heartbeat patterns** — How do systems handle checkout that exceeds the TTL window?

---

## 7. Immediate Action Items for the Project

| Priority | Action | File |
|----------|--------|------|
| P0 | Add stock availability check BEFORE creating reservation | `lib/queue/processor.ts` |
| P0 | Make cleanup job idempotent (mark reservation as `released` before decrementing) | `lib/queue/cleanup.ts` |
| P1 | Add test for "insufficient stock" rejection | `tests/checkout-queue/integration/` |
| P1 | Guard `releaseReservedStock` against negative values | `lib/queue/cleanup.ts` |
| P1 | Add server-side price verification against Sanity | `lib/queue/processor.ts` |
| P2 | Add Redis queue reaper / health check for stale items | `lib/queue/` |
| P2 | Add reservation extension endpoint (heartbeat) | `app/api/checkout-queue/` |
