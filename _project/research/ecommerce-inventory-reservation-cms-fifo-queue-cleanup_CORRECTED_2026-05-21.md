# Ecommerce Inventory Reservation: CMS Document Store + FIFO Queue + Background Cleanup

**Research Date:** 2026-05-21 (Corrected)
**Topic:** Is saving basketReservation to a CMS (Sanity), with a FIFO queue (Redis), and a background cleanup job for expired reservations, a valid and proven solution in ecommerce?
**Context:** Sanity / React / Next.js stack
**Previous Version:** `ecommerce-inventory-reservation-cms-fifo-queue-cleanup_2026-05-21.md`
**Audit:** `AUDIT_ecommerce-inventory-reservation-cms-fifo-queue-cleanup_2026-05-21.md`

---

## Research Scope Contract

- **Topic:** Validation of checkout-time inventory reservation architecture using document-store CMS, Redis FIFO queue, and background cleanup
- **First Principles:**
  1. Inventory accuracy requires separating "physically on hand" from "available to sell"
  2. Concurrent checkout attempts create race conditions that must be serialized or atomically resolved
  3. Reservations without expiration permanently lock inventory; abandoned checkouts are common (~70%)
  4. **A reservation without a stock availability check is not a reservation — it's a blind increment**
- **Fundamentals:**
  1. Soft reservation vs hard reservation vs optimistic (no reservation)
  2. Document-store reservation records with TTL
  3. FIFO queue serialization for concurrent write safety
  4. **Stock availability pre-check before reservation** (previously missed)
  5. **Idempotent cleanup** (previously missed)
  6. Background cleanup / cron jobs for expiry handling
- **Scope Boundary:**
  - IN: Architecture validation, pattern classification, production examples, Sanity-specific feasibility, **code-level verification**
  - OUT: Implementation of alternative approaches, performance benchmarking, specific Redis tuning
- **Target Audience:** Development team evaluating current checkout-queue architecture
- **Decay Risk:** Medium - inventory patterns are stable; Sanity transaction semantics verified

---

## Multi-Source Triangulation (Corrected)

| Source | URL | Type | Credibility | Date | Key Claim | Verification Status |
|--------|-----|------|-------------|------|-----------|---------------------|
| Sanity Docs — Transactions | [sanity.io](https://www.sanity.io/docs/content-lake/transactions) | Official Docs | Canonical | 2025 | ACID-compliant with exclusive locks; repeatable read isolation | ✅ **VERIFIED — transactions are ACID** |
| Sanity Docs — Rate Limits | [sanity.io](https://www.sanity.io/docs/content-lake/technical-limits) | Official Docs | Canonical | 2025 | 25 req/s mutation per IP; 100 concurrent mutations per dataset | ✅ **VERIFIED** |
| Sanity Docs — Client Transactions | [sanity.io](https://www.sanity.io/docs/apis-and-sdks/js-client-transactions) | Official Docs | Canonical | 2025 | `ifRevisionID` for optimistic locking; all-or-nothing `commit()` | ✅ **VERIFIED** |
| Vendure Docs | [docs.vendure.io](https://docs.vendure.io/guides/core-concepts/stock-control/) | Official Docs | Canonical | 2025 | `saleable = stockOnHand - allocated - threshold`; `InsufficientStockError` thrown when insufficient | ✅ **VERIFIED** |
| Vendure Source — OrderModifier | [github](https://raw.githubusercontent.com/vendure-ecommerce/vendure/master/packages/core/src/service/helpers/order-modifier/order-modifier.ts) | Source Code | Ground Truth | 2025 | Stock availability checked before `addItemToOrder`; `InsufficientStockError` at line 1 import | ✅ **VERIFIED** |
| Magento MSI Wiki | [github](https://github-wiki-see.page/m/magento/inventory/wiki/Salable-Quantity-Calculation-and-Mechanism-of-Reservations) | Official Wiki | Canonical | 2025 | Salable quantity = StockItem qty + reservations; checked BEFORE order placement | ✅ **VERIFIED** |
| Redis Official | [redis.io](https://redis.io/tutorials/inventory-reservation-in-real-time-with-redis/) | Official Tutorial | Canonical | 2024 | Atomic inventory reservation; reservation hashes; `expiresAt`; lazy cleanup on read | ✅ Verified |
| Adobe Commerce | [experienceleague](https://experienceleague.adobe.com/en/docs/commerce-admin/inventory/basics/selection-reservations) | Official Docs | Canonical | 2025 | Append-only reservations; `inventory_cleanup_reservations` cron; sum-to-zero lifecycle | ✅ Verified |
| WooCommerce | [woocommerce.com](https://woocommerce.com/document/configuring-woocommerce-settings/products/) | Official Docs | Canonical | 2025 | "Hold Stock" timer auto-cancels pending orders | ✅ Verified |
| Shopify Community | [community.shopify.com](https://community.shopify.com/t/reserve-item-to-cart-for-limited-time-frame/158770) | Community | Medium | 2023 | Shopify does NOT natively reserve at add-to-cart | ✅ Verified |

---

## First Principles Analysis (Corrected)

### Core Problem Being Solved
Separating "inventory on hand" from "inventory available for purchase" to prevent overselling during the checkout window, while ensuring abandoned checkouts do not permanently lock stock.

### Underlying Constraints (Corrected)
1. **HTTP is stateless** — checkout is a multi-step process; stock must be held across requests
2. **Concurrent checkout attempts** — multiple users can attempt to buy the same limited item simultaneously
3. **Abandonment is the norm** — industry cart abandonment rates are 70-80%; any held stock must auto-release
4. **CMS transactions ARE ACID** — Sanity's `transaction().commit()` is atomic with exclusive locks (verified against docs), BUT **read-write cycles (GROQ query → transaction) lack isolation guarantees**
5. **Sanity has hard rate limits** — 25 mutations/sec per IP, 100 concurrent mutations per dataset

### Inherent Tradeoffs

| Approach | Wins | Loses | When to Use |
|----------|------|-------|-------------|
| Optimistic (no reservation) | Simplest | Guaranteed oversells at scale | Low volume, deep inventory |
| Soft Reservation (current) | Prevents oversells, handles cancellations | Adds complexity, requires cleanup | Most ecommerce operations |
| Hard Reservation (DB lock) | Zero oversells guaranteed | Contention on hot SKUs | Flash sales, very limited inventory |
| Reservation with Expiration | Balances availability with protection | Requires expiry tracking and cleanup | Standard ecommerce (recommended) |

### Failure Modes (Corrected)
1. **Misapplication:** Reserving at "add to cart" instead of "checkout start" — locks inventory for browsers
2. **Over-application:** Using FIFO serialization for every stock read — adds unnecessary latency
3. **Under-application:** No cleanup job — reservations accumulate
4. **Critical Gap:** **No stock availability check before reservation** — a single request can over-reserve (verified in `processor.ts:119-137`)
5. **Critical Gap:** **Cleanup job not idempotent** — double-release on partial failure (verified in `cleanup.ts:12-22`)

---

## Code Fundamentals (Corrected — All Claims Verified Against Source)

### Fundamental: Sanity Transaction Atomicity
**Previous Claim:** "CMS transactions are weaker than ACID databases" (unverified)
**Verified Claim:** Sanity transactions ARE ACID-compliant with exclusive locks.

**Evidence:**
- ✅ Source: `https://www.sanity.io/docs/content-lake/transactions` (canonical docs)
- **Atomicity:** "the transaction constitutes a single unit, such that either all of its mutations succeed or they all fail"
- **Isolation:** "transactions have repeatable read isolation via exclusive locks. When a document is first accessed by a transaction it is locked, blocking concurrent transactions from both reading and writing the document until the initial transaction completes."
- **Rate Limits:** 25 mutations/sec per IP, 100 concurrent mutations per dataset
- **Max execution time:** 3 minutes

**BUT — Critical Caveat:**
- "Clients often use read-write cycles that run a GROQ query and then submit transactions based on the results. This pattern does not have the same isolation guarantees as transactions."
- "If a different client writes a value after our client has read a document but before our client writes its new value, then the value that the other client wrote may be lost (an anomaly known as a lost update)."

**Implication for Our Code:**
`processor.ts:142-145` fetches products via GROQ, then `processor.ts:133-137` runs a transaction. Between the fetch and the transaction, another request could modify `reservedStock`. The FIFO queue IS needed to serialize these read-write cycles. **However**, the FIFO queue only prevents concurrent requests from interleaving — it does NOT prevent a single request from over-reserving because there is no availability check.

**Sanity's Built-in Solution:**
- `patch` mutations support `ifRevisionID` parameter for optimistic locking. If the document was modified since read, the mutation is rejected with HTTP 409. This could replace the FIFO queue for some use cases.

---

### Fundamental: Stock Availability Pre-Check (CRITICAL GAP — Previously Missed)
**Claim:** Production ecommerce systems verify stock availability BEFORE creating a reservation.

**Verification:**
- ✅ **Vendure:** `saleable = stockOnHand - allocated - threshold`. If `saleable <= 0`, `InsufficientStockError` is thrown BEFORE allocation.
- ✅ **Magento MSI:** "Magento needs to decide whether we can sell (do we have enough products to sell in stock)... 55 - 0 > 30, so we can proceed to checkout." — StockItem qty + reservations checked BEFORE reservation creation.
- ✅ **Redis Official Tutorial:** Checks `availableStock = inventory:sku - sum(reservations)` before creating reservation.
- ❌ **Our Code (`processor.ts:119-137`):**
```typescript
// 5. Create reservation doc
const doc = await sanity.create({ _id: requestId, ... })
// 6. Increment reservedStock atomically
const tx = sanity.transaction()
for (const item of request.basketReservation) {
  tx.patch(item._id, (p) => p.inc({ reservedStock: item.quantity }))  // NO AVAILABILITY CHECK
}
await tx.commit()
```

**Actual Behavior:**
- A single request can request 10 units when only 3 are in stock
- `reservedStock` is incremented by 10 without verification
- `availableStock = stock - reservedStock` becomes negative
- Frontend (`BasketManager.tsx:97`) calculates this and displays negative available stock

**Test Evidence:**
- `tests/checkout-queue/integration/happy-path/sequential-fifo.test.ts` — Tests FIFO ordering with 9 requests, all quantity=1, on well-stocked products. NO test for insufficient stock.
- `tests/checkout-queue/integration/happy-path/basket-reservation-flow-happy-path.test.ts` — Tests doc creation and stock increment. NO test for insufficient stock rejection.
- **ZERO tests verify "request rejected when stock insufficient"**

---

### Fundamental: Cleanup Job Idempotency (CRITICAL GAP — Previously Missed)
**Claim:** A cleanup job that finds expired reservations and releases stock is standard practice.

**Verification:**
- ✅ **Adobe Commerce:** `inventory_cleanup_reservations` cron runs daily; uses SQL queries to find "complete reservation sequences in which the sum is zero"
- ✅ **WooCommerce:** Hold Stock timer auto-cancels; built-in idempotency via order state machine
- ❌ **Our Code (`cleanup.ts:12-22`):**
```typescript
export async function releaseReservedStock(productId: string, quantity: number): Promise<boolean> {
  const tx = sanity.transaction()
  tx.patch(productId, (p) => p.dec({ reservedStock: quantity }))  // Blind decrement — NO idempotency guard
  await tx.commit()
  return true
}
```

**Actual Behavior:**
- If `deleteExpiredReservation` fails but `releaseReservedStock` succeeds, the reservation doc remains
- Next cleanup run finds the SAME expired reservation
- `releaseReservedStock` decrements `reservedStock` AGAIN by the same quantity
- Result: `reservedStock` goes negative by exactly the reservation quantity

**Test Evidence:**
- `tests/checkout-queue/integration/reservation-ttl/cleanup/background-cleanup-stock.test.ts:64-65`:
```typescript
// Verify reservedStock was released (may be negative if cleanup processed multiple reservations)
expect(afterProduct.reservedStock).toBeLessThanOrEqual(0)
```
- **The test EXPECTS and ACCEPTS negative values.** This is a red flag, not a tolerance.

---

### Fundamental: Price Verification (GAP — Previously Missed)
**Claim:** "Verified price" is passed to the reservation document.

**Verification:**
- ❌ **Our Code (`processor.ts:100-116`):**
```typescript
const cmsBasketReservation = await Promise.all(
  request.basketReservation.map(async (p, i) => {
    const verifiedPrice = p.price_data.unit_amount  // ← Copies client value. NO server-side verification.
    return { _id: p._id, quantity: p.quantity, verifiedPrice, parcel: p.parcel }
  })
)
```

**Actual Behavior:**
- The processor does NOT fetch product prices from Sanity
- `verifiedPrice` is literally `p.price_data.unit_amount` from the untrusted client request
- A malicious client can submit any price
- The `debug.priceVerification` field in the response provides false confidence

---

### Fundamental: FIFO Queue for Write Serialization
**Claim:** Redis FIFO queue with SET NX + head check serializes checkout reservation writes.

**Verification:**
- ✅ Located in our codebase: `lib/queue/processor.ts:64-95`
- ✅ Redis official tutorial uses WATCH/MULTI retry pattern
- ✅ Sanity docs confirm read-write cycles lack isolation (justifying the queue's existence)

**Actual Behavior:**
- SET NX atomically grants lock; LINDEX checks FIFO ordering
- Only head-of-queue request processes at a time
- 25ms spin retry for non-head requests

**Why the Queue IS Needed (Corrected Understanding):**
- NOT because "Sanity transactions are weak" (they're ACID)
- BUT because the processor uses a **read-write cycle** (fetch products → decide → transaction) which Sanity docs explicitly say "does not have the same isolation guarantees as transactions"
- Two concurrent requests could both read `stock=5, reservedStock=0`, both decide "I can reserve 5", then both succeed in their transactions
- The FIFO queue prevents this lost-update anomaly

**Future Alternative:**
- Sanity's `ifRevisionID` optimistic locking could potentially replace the FIFO queue for some operations
- But it would require reading the document revision BEFORE the transaction, which adds a round-trip

---

## Best Practices (Verified)

### Practice: Reserve at Checkout, Not at Add-to-Cart
**Consensus:** High across all major platforms
**Verdict:** ✅ Recommended — Current implementation is correct

### Practice: Use Expiration with Auto-Release
**Consensus:** High
**Verdict:** ✅ Recommended

### Practice: Separate Reservation Records from Inventory
**Consensus:** High
**Verdict:** ✅ Recommended

### Practice: Stock Availability Pre-Check BEFORE Reservation
**Consensus:** UNIVERSAL across all production ecommerce systems

**Supporting Evidence:**
- Vendure: `saleable = stockOnHand - allocated - threshold` checked before allocation
- Magento MSI: Salable quantity = StockItem qty + reservations checked before order placement
- Redis Official Tutorial: `availableStock = inventory:sku - sum(reservations)` checked before creating reservation hash
- WooCommerce: Stock checked before reducing stock on order placement

**Our Implementation:** ❌ MISSING

**Counter-Evidence (Falsification Attempts):**
- None found. Every production system verifies stock before reserving.

**Verdict:** ❌ **CRITICAL GAP**

### Practice: Idempotent Cleanup Job
**Consensus:** High

**Supporting Evidence:**
- Adobe Commerce: Cron job finds "complete reservation sequences in which the sum is zero" — uses sum-to-zero math, not blind decrements
- Vendure: Allocation/Sale/Cancellation/Release are separate movement types with audit trail; no blind decrements
- MongoDB example: Background script checks `reserved` array and only removes matching entries

**Our Implementation:** ❌ NOT IDEMPOTENT — blind `dec({ reservedStock: quantity })`

**Verdict:** ❌ **CRITICAL GAP**

---

## Common Solutions Landscape (Corrected)

### Solution: CMS/Document Store as Reservation Authority
**Prevalence:** Niche but valid
**Type:** Idiomatic for headless/document-store architectures

**Pros:**
- Unified data model (products + reservations in one system)
- No additional database infrastructure
- Sanity GROQ can query both products and reservations in one request

**Cons (verified):**
- **Rate limits:** 25 mutations/sec per IP, 100 concurrent mutations per dataset
- **Read-write cycle isolation gap:** GROQ fetch + transaction is not isolated
- **No conditional transactions:** Cannot say "only commit if stock >= quantity"
- **Cleanup job must be externally scheduled**

**Real-World Pain Points:**
- Under high concurrency, mutation rate limits become a bottleneck
- FIFO queue is a compensation for read-write cycle isolation gap
- If Sanity API rate-limits, checkout breaks

**Recommendation:** Valid for low-to-medium concurrency. **Hard ceiling: 25 checkout reservations/second per IP** (Sanity mutation rate limit). If this is exceeded, move reservations to Redis.

---

### Solution: Redis Spin Lock + FIFO Head Check
**Prevalence:** Common for simple serialization
**Type:** Idiomatic for Redis-based queuing

**Corrected Understanding:**
- The queue is NOT compensating for "weak CMS transactions"
- The queue IS compensating for the read-write cycle isolation gap (a well-documented Sanity limitation)
- Sanity transactions themselves are ACID with exclusive locks

**Recommendation:** Keep for current scale. If checkout volume approaches 25/minute (Sanity mutation limit), consider optimistic locking with `ifRevisionID` as alternative.

---

### Solution: Background Scheduled Cleanup Job
**Prevalence:** Ubiquitous
**Type:** Idiomatic

**Corrected Understanding:**
- Standard practice, BUT must be idempotent
- Our implementation is NOT idempotent (blind decrement)
- Adobe Commerce uses sum-to-zero math, not blind decrements
- Vendure uses typed stock movements (Allocation, Sale, Release, Cancellation) with audit trail

**Recommendation:** Keep, but make idempotent by:
1. Adding a `stockReleased` boolean flag to reservation documents
2. Only decrementing if `stockReleased === false`
3. Setting `stockReleased = true` atomically with the decrement

---

## Verification & Falsification Log (Corrected)

### Claims Verified
| Claim | Evidence | Method |
|-------|----------|--------|
| Sanity transactions are ACID with exclusive locks | Sanity official docs | Doc inspection |
| Sanity mutation rate limit is 25 req/s per IP | Sanity technical limits docs | Doc inspection |
| Sanity read-write cycles lack isolation | Sanity transaction docs | Doc inspection |
| Vendure checks `saleable` before allocation | Vendure stock-control docs + source | Doc + source inspection |
| Magento checks salable qty before order placement | Magento MSI wiki | Wiki inspection |
| Our processor has NO stock availability check | `processor.ts:119-137` | Source code inspection |
| Our cleanup job is NOT idempotent | `cleanup.ts:12-22` | Source code inspection |
| `verifiedPrice` is NOT actually verified | `processor.ts:104` | Source code inspection |
| Tests expect negative reservedStock | `background-cleanup-stock.test.ts:65` | Test inspection |

### Falsification Attempts
| Claim | Counter-Evidence | Verdict |
|-------|------------------|---------|
| "Sanity transactions are weaker than ACID" (original research) | Sanity docs: ACID with exclusive locks | ❌ **FALSIFIED** — Transactions ARE ACID |
| "FIFO queue compensates for weak CMS transactions" (original research) | Sanity docs: transactions are ACID; queue compensates for read-write isolation gap | ⚠️ **MODIFIED** — Queue is needed, but for a different reason |
| "Cleanup every 5 minutes is sufficient" | Lazy cleanup on read is preferred; 5 min delay blocks sales | ⚠️ Modified |
| "Our approach prevents overselling" | `processor.ts` has NO stock availability check | ❌ **FALSIFIED** — Does NOT prevent overselling |
| "verifiedPrice is verified" | Code copies client value without server-side check | ❌ **FALSIFIED** |
| "Cleanup job safely releases stock" | Blind decrement without idempotency guard | ❌ **FALSIFIED** |

### Knowledge Decay Assessment
| Section | Risk | Review Date |
|---------|------|-------------|
| Sanity transaction API | Low | 2027-05-21 (ACID is fundamental, unlikely to change) |
| Sanity rate limits | Medium | 2026-11-21 (plan-specific, may change) |
| Redis spin lock pattern | Low | 2027-05-21 |
| Platform behavior (Shopify/WooCommerce) | Low | 2027-05-21 |
| Netlify scheduled function limits | Medium | 2026-11-21 |

---

## Synthesis: Actionable Takeaways (Corrected)

### Corrected Verdict

**Pattern:** ✅ **VALID AND PROVEN** — Soft reservation with expiration is an industry-standard pattern (Pattern 4, used by Magento, WooCommerce, Vendure, Redis, MongoDB).

**Implementation:** ❌ **HAS CRITICAL GAPS** — The current code does NOT actually prevent overselling because it lacks stock availability checks, and the cleanup job can corrupt inventory through non-idempotent operations.

### Critical Gaps and Fixes

| Gap | Severity | Location | Fix |
|-----|----------|----------|-----|
| **No stock availability pre-check** | CRITICAL | `processor.ts:119-137` | Before creating reservation, fetch current `stock` and `reservedStock`, calculate `available = stock - reservedStock`. If `available < requestedQuantity`, reject with 409. |
| **Cleanup not idempotent** | CRITICAL | `cleanup.ts:12-22` | Add `stockReleased` boolean to `basketReservation` schema. In `releaseReservedStock`, only decrement if `stockReleased === false`. Set `stockReleased = true` in same transaction. |
| **No actual price verification** | HIGH | `processor.ts:104` | Fetch product `price_data` from Sanity and compare against client's submitted `price_data.unit_amount`. Reject if mismatch. |
| **Negative reservedStock accepted** | HIGH | Tests + cleanup | Add guard in `releaseReservedStock`: `if (currentReservedStock < quantity) { quantity = currentReservedStock }`. Never decrement below zero. |
| **No lazy cleanup on read** | MEDIUM | `getBasketProducts.ts` | When calculating available stock, exclude expired reservations from `reservedStock` sum. |
| **No reservation heartbeat** | MEDIUM | `processor.ts` | Add API endpoint to extend reservation TTL (e.g., customer active on checkout page). Prevents mid-checkout expiry. |
| **Redis queue has no reaper** | LOW | `processor.ts:61` | Add health check that detects queue items older than X minutes and either processes or removes them. |

### For Our Project — Corrected Decisions

| Decision | Rationale | Implementation |
|----------|-----------|----------------|
| **KEEP** soft reservation with expiration | Proven Pattern 4; prevents oversells IF stock is checked first | Add stock pre-check before `sanity.create()` |
| **KEEP** background cleanup job | Standard practice; necessary for TTL expiry | Make idempotent with `stockReleased` flag |
| **KEEP** separation of `stock` and `reservedStock` | Universal best practice | Current schema is correct |
| **KEEP** FIFO queue | Compensates for read-write cycle isolation gap (verified Sanity limitation) | Current implementation is justified |
| **MODIFY** processor to check stock availability | UNIVERSAL requirement in production ecommerce; our code lacks it | Fetch stock, calculate available, reject if insufficient |
| **MODIFY** cleanup to be idempotent | Non-idempotent cleanup corrupts inventory (proven by test allowing negative values) | Add `stockReleased` flag to reservation doc |
| **ADD** server-side price verification | `verifiedPrice` field is misleading; copies untrusted client value | Fetch CMS price and validate match |
| **ADD** lazy expiry check on product stock read | 5-min batch delay can block sales | On product read, filter expired reservations from `reservedStock` sum |
| **CONSIDER** optimistic locking with `ifRevisionID` | Sanity supports this natively; could reduce FIFO queue dependency | If queue becomes bottleneck, test `ifRevisionID` as alternative |
| **DO NOT** move reservation to add-to-cart | Industry consensus: checkout-level reservation is correct | Current checkout-button trigger is correct |

### Real Production Examples Using Similar Approaches

1. **Adobe Commerce (Magento)** — Reservation table with append-only records; cron cleanup; **stock checked BEFORE order placement via salable quantity**
2. **WooCommerce** — "Hold Stock" timer; reduces stock on order placement; **stock checked before order placement**
3. **Vendure** — `saleable = stockOnHand - allocated - threshold`; **stock checked BEFORE allocation**; `InsufficientStockError` thrown if insufficient
4. **Redis Official Tutorial** — `availableStock = inventory:sku - sum(reservations)` checked **before** creating reservation hash
5. **MongoDB Node.js Driver Docs** — Background script expires after 30 min
6. **Mailgun** — Reservation pattern in distributed queues

**Key Difference:** ALL production examples verify stock availability BEFORE creating the reservation. Our implementation does not.

### Sanity Rate Limits — Concrete Numbers

| Limit | Value | Impact on Our Architecture |
|-------|-------|---------------------------|
| Max mutation rate | 25 req/s per IP | **Hard ceiling: 25 checkout reservations/second** |
| Max concurrent mutations | 100 per dataset | Up to 100 simultaneous Sanity transactions |
| Max mutation execution time | 3 minutes | Transaction must complete within 3 min |
| Max query execution time | 1 minute | GROQ fetch must complete within 1 min |

**Per checkout request, we make:**
1. `sanity.create()` — 1 mutation
2. `sanity.transaction().patch().commit()` — 1 transaction (contains N patches for N products)
3. `sanity.fetch()` — 1 query

**Total: ~3 Sanity API calls per checkout.** At 25 mutations/sec, that's roughly **8 checkouts/second** maximum (assuming 2 mutations per checkout). With 100 concurrent mutations, we can handle ~50 concurrent checkouts (each with 2 products).

### Open Questions (Corrected)

1. What is expected checkout volume? If >5 checkouts/second, Sanity rate limits will be a hard constraint.
2. Should we use Sanity's `ifRevisionID` optimistic locking as an alternative to the FIFO queue?
3. What happens if a customer refreshes checkout page — is a new reservation created, or existing one extended?
4. Should the reservation doc contain shipping data (PII), or should it reference an order doc?

---

## Conclusion (Corrected)

**Verdict:** ⚠️ **VALID PATTERN, FLAWED IMPLEMENTATION**

The architectural pattern (soft reservation + TTL + cleanup) is **valid, professionally sound, and proven in production** by Magento, WooCommerce, Vendure, Redis, and MongoDB.

**However, the current implementation has three critical gaps that must be fixed before it can claim to "prevent overselling":**

1. **NO stock availability check before reservation** — A single request can over-reserve, making `availableStock` negative. This is NOT an edge case; it is the primary purpose of the system.
2. **Cleanup job is NOT idempotent** — Partial failures cause double-release, leading to negative `reservedStock`. The tests explicitly tolerate this.
3. **No actual price verification** — The `verifiedPrice` field copies untrusted client data.

**The FIFO queue is justified** — not because Sanity transactions are weak (they're ACID), but because Sanity's read-write cycles lack isolation guarantees, and the processor uses a fetch-then-transact pattern.

**The single biggest risk:** If these gaps are not fixed, the system will fail its primary purpose: preventing overselling and maintaining accurate inventory.

**Immediate priority:** Add stock availability pre-check and make cleanup idempotent. These are single-digit-line changes with massive impact.
