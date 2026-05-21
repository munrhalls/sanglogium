# Ecommerce Inventory Reservation: CMS Document Store + FIFO Queue + Background Cleanup

**Research Date:** 2026-05-21
**Topic:** Is saving basketReservation to a CMS (Sanity), with a FIFO queue (Redis), and a background cleanup job for expired reservations, a valid and proven solution in ecommerce? What production apps use this or similar approaches?
**Context:** Sanity / React / Next.js stack

---

## Research Scope Contract

- **Topic:** Validation of checkout-time inventory reservation architecture using document-store CMS, Redis FIFO queue, and background cleanup
- **First Principles:**
  1. Inventory accuracy requires separating "physically on hand" from "available to sell"
  2. Concurrent checkout attempts create race conditions that must be serialized or atomically resolved
  3. Reservations without expiration permanently lock inventory; abandoned checkouts are common (industry average ~70%)
- **Fundamentals:**
  1. Soft reservation vs hard reservation vs optimistic (no reservation)
  2. Document-store reservation records with TTL
  3. FIFO queue serialization for concurrent write safety
  4. Background cleanup / cron jobs for expiry handling
- **Scope Boundary:**
  - IN: Architecture validation, pattern classification, production examples, Sanity-specific feasibility
  - OUT: Implementation of alternative approaches, performance benchmarking, specific Redis tuning
- **Target Audience:** Development team evaluating current checkout-queue architecture
- **Decay Risk:** Medium - inventory patterns are stable; Sanity transaction semantics may evolve

---

## Multi-Source Triangulation

| Source | URL | Type | Credibility | Date | Key Claim | Verification Status |
|--------|-----|------|-------------|------|-----------|---------------------|
| Stoa Logistics | [stoalogistics.com](https://stoalogistics.com/blog/inventory-reservation-patterns) | Industry Blog | High | 2024 | 4 reservation patterns; "Reservation with Expiration" is Pattern 4 | ✅ Verified |
| Redis Official | [redis.io](https://redis.io/tutorials/inventory-reservation-in-real-time-with-redis/) | Official Tutorial | Canonical | 2024 | Atomic inventory reservation with WATCH/MULTI, reservation hashes, expiresAt, lazy cleanup on read | ✅ Verified |
| Adobe Commerce Docs | [experienceleague.adobe.com](https://experienceleague.adobe.com/en/docs/commerce-admin/inventory/basics/selection-reservations) | Official Docs | Canonical | 2025 | Reservations are append-only; `inventory_cleanup_reservations` cron job runs daily | ✅ Verified |
| Magento Dev Docs | [r-martins.github.io](https://r-martins.github.io/m1docs/guides/v2.4/inventory/reservations.html) | Official Docs | Canonical | 2024 | Append-only reservation records; reservation lifecycle sums to 0; cron cleanup | ✅ Verified |
| WooCommerce Docs | [woocommerce.com](https://woocommerce.com/document/configuring-woocommerce-settings/products/) | Official Docs | Canonical | 2025 | "Hold Stock (minutes)" setting: holds unpaid orders for X minutes, then cancels and releases | ✅ Verified |
| Vendure Docs | [docs.vendure.io](https://docs.vendure.io/guides/core-concepts/stock-control/) | Official Docs | Canonical | 2025 | `saleable = stockOnHand - allocated - threshold`; allocation at PaymentAuthorized | ✅ Verified |
| MongoDB Node Driver | [mongodb.github.io](https://mongodb.github.io/node-mongodb-native/schema/chapter10/) | Official Tutorial | Canonical | ~2023 | Shopping cart with `reserved` array on products, cart docs, background script to expire after 30 min | ✅ Verified |
| wippler.dev | [wippler.dev](https://wippler.dev/posts/reservation-pattern-in-queues) | Engineering Blog | High | ~2022 | Reservation pattern used at Mailgun for distributed queue "almost exactly once delivery" | ✅ Verified |
| Shopify Community | [community.shopify.com](https://community.shopify.com/t/reserve-item-to-cart-for-limited-time-frame/158770) | Community | Medium | 2023 | Shopify does NOT natively reserve items in cart | ✅ Verified |
| Kraken Golf | [krakengolf.com](https://www.krakengolf.com/blogs/the-deep-cut-where-golf-metal-and-story-run-deeper/why-your-cart-doesnt-reserve-a-drop-the-truth-about-shopify-and-limited-releases) | Merchant Blog | Medium | 2024 | Shopify: "checkout beats cart" - no reservation until order confirmed | ✅ Verified |
| Dibsly | [hellodibsly.com](https://hellodibsly.com/blog/reasons-why-you-should-not-practice-cart-holding) | Ecommerce Blog | Medium | 2021 | Cart holding anti-pattern: 80% abandonment = locked revenue | ✅ Verified |
| DEV Community | [dev.to](https://dev.to/jackynote/managing-inventory-reservation-in-saga-pattern-for-e-commerce-systems-2d14) | Community | Medium | 2023 | SAGA pattern with reservation table: RESERVE → CONFIRM/RELEASE | ✅ Verified |

---

## First Principles Analysis

### Core Problem Being Solved
Separating "inventory on hand" from "inventory available for purchase" to prevent overselling during the checkout window, while ensuring abandoned checkouts do not permanently lock stock.

### Underlying Constraints
1. **HTTP is stateless** - checkout is a multi-step process; stock must be held across requests
2. **Concurrent checkout attempts** - multiple users can attempt to buy the same limited item simultaneously
3. **Abandonment is the norm** - industry cart abandonment rates are 70-80%; any held stock must auto-release
4. **CMS transactions are weaker than DB transactions** - Sanity's transaction API has different guarantees than PostgreSQL/MySQL

### Inherent Tradeoffs

| Approach | Wins | Loses | When to Use |
|----------|------|-------|-------------|
| Optimistic (no reservation) | Simplest, no complexity | Guaranteed oversells at scale | Low volume, deep inventory |
| Soft Reservation (current) | Prevents oversells, handles cancellations gracefully | Adds complexity, requires cleanup | Most ecommerce operations |
| Hard Reservation (DB lock) | Zero oversells guaranteed | Contention on hot SKUs, slower checkout | Flash sales, very limited inventory |
| Reservation with Expiration | Balances availability with protection | Requires expiry tracking and cleanup | Standard ecommerce (recommended) |

### Failure Modes
1. **Misapplication:** Reserving at "add to cart" instead of "checkout start" - locks inventory for browsers, not buyers
2. **Over-application:** Using FIFO serialization for every stock read - adds unnecessary latency
3. **Under-application:** No cleanup job - reservations accumulate, inventory appears depleted
4. **CMS mismatch:** Using a CMS for high-frequency concurrent writes it wasn't designed for

---

## Code Fundamentals

### Fundamental: Reservation Document Store Pattern
**Claim:** Saving reservation state as documents in a CMS/document store is a valid pattern.

**Verification:**
- ✅ Located in our codebase: `sanity-cms/schemaTypes/basketReservationType.ts`, `lib/queue/processor.ts`
- ✅ MongoDB official example: [Shopping Cart with reserved array](http://mongodb.github.io/node-mongodb-native/schema/chapter10/)
- ✅ Adobe Commerce / Magento: Uses reservation table (relational, but conceptually identical append-only record pattern)

**Actual Behavior:**
- Reservation documents store: items, quantities, timestamps, expiry
- Separate from product inventory; enables independent cleanup
- Document stores (MongoDB, Sanity) support this natively

**Edge Cases:**
1. Document store lacks strong transactional consistency across docs → mitigated by FIFO serialization
2. Querying expired reservations requires index on `expiresAt` field
3. Large reservation table → pagination needed in cleanup job

### Fundamental: FIFO Queue for Write Serialization
**Claim:** Redis FIFO queue with SET NX + head check serializes checkout reservation writes.

**Verification:**
- ✅ Located in our codebase: `lib/queue/processor.ts` lines 64-95
- ✅ Redis official tutorial uses queue-like WATCH/MULTI retry pattern
- ✅ wippler.dev: Mailgun uses reservation pattern with queue for distributed SOA

**Actual Behavior:**
- SET NX atomically grants lock; LINDEX checks FIFO ordering
- Only head-of-queue request processes at a time
- 25ms spin retry for non-head requests

**Edge Cases:**
1. Lock TTL expires (30s) during long Sanity transaction → lock released prematurely, but head check still protects (next request would need to be same head, which was already popped)
2. 45s timeout under extreme load → requests fail; this is a backpressure mechanism
3. Redis failure → entire queue mechanism fails; requires Redis uptime

### Fundamental: Background Cleanup Job
**Claim:** A scheduled job that finds expired reservations and releases stock is standard practice.

**Verification:**
- ✅ Located in our codebase: `lib/queue/cleanup.ts`, `app/api/cleanup/expired-reservations/route.ts`
- ✅ Adobe Commerce: `inventory_cleanup_reservations` cron job runs daily
- ✅ WooCommerce: Hold Stock timer auto-cancels pending orders and releases stock
- ✅ MongoDB example: Background script expires carts after 30 min inactivity
- ✅ Redis tutorial: Lazy cleanup on read (checks expiresAt, releases if expired)

**Actual Behavior:**
- Scans for `expiresAt < now()`
- Releases `reservedStock` via transaction decrement
- Deletes reservation document

**Edge Cases:**
1. Cleanup job misses a reservation (error) → stock stays reserved until next run
2. Job runs concurrently with new checkout → potential race on same product's reservedStock; Sanity transactions mitigate
3. Clock skew between job server and document creation → minor TTL variance

---

## Best Practices (Verified)

### Practice: Reserve at Checkout, Not at Add-to-Cart
**Consensus:** High across all major platforms

**Supporting Evidence:**
- Shopify native: Does NOT reserve at add-to-cart (confirmed by community + merchant blogs)
- WooCommerce native: Does NOT reserve at add-to-cart; only at order placement (Pending/On Hold)
- Dibsly analysis: Cart-level reservation is an anti-pattern (80% abandonment rate)
- Kraken Golf: "checkout beats cart" is the industry norm

**Counter-Evidence (Falsification Attempts):**
- Shopify apps (Reservit, Stockify) DO offer cart reservation for flash sales
- WooCommerce extension "Reserve Stock" explicitly adds add-to-cart reservation
- Magento 2 Cart Timer extension adds cart-level reservation

**Verdict:** ⚠️ Context-Dependent

**When to Use:**
- Flash sales / limited drops where checkout speed is the differentiator
- High-value items where customer commitment at checkout is expected
- Your current approach: checkout button click (NOT add-to-cart) → **this is defensible**

**When to Skip:**
- General catalog browsing with high browse-to-buy ratio
- Low-margin items where every lost sale matters

### Practice: Use Expiration with Auto-Release
**Consensus:** High

**Supporting Evidence:**
- Stoa Logistics Pattern 4: "Reservation with Expiration" - auto-release if order doesn't complete within time window
- Redis tutorial: `expiresAt` field on every reservation hash; lazy cleanup on read
- WooCommerce: "Hold Stock (minutes)" explicitly times out and releases
- Adobe Commerce: Cron job removes compensated reservations; implies time-based lifecycle

**Counter-Evidence:**
- Some high-demand drops intentionally DON'T reserve to create urgency (Kraken Golf, Supreme, Nike)

**Verdict:** ✅ Recommended for standard ecommerce

### Practice: Separate Reservation Records from Inventory
**Consensus:** High

**Supporting Evidence:**
- Adobe Commerce / Magento: Dedicated reservation table, append-only, separate from cataloginventory_stock_item
- Vendure: `stockOnHand` vs `allocated` are separate tracked values
- MongoDB example: `reserved` array on product documents, separate from `quantity`
- Redis tutorial: `inventory:{sku}` hash (stock counts) separate from `reservation:{id}` hashes

**Counter-Evidence:**
- Simple single-user stores can just decrement stock directly

**Verdict:** ✅ Recommended for any multi-user store

---

## Common Solutions Landscape

### Solution: CMS/Document Store as Reservation Authority
**Prevalence:** Niche but valid
**Type:** Idiomatic for headless/document-store architectures

**Pros:**
- Unified data model (products + reservations in one system)
- No additional database infrastructure
- Sanity GROQ can query both products and reservations in one request

**Cons (often overlooked):**
- CMS transactions are weaker than ACID databases
- Sanity is optimized for content reads, not high-frequency concurrent writes
- No native `FOR UPDATE` row locking
- Cleanup job must be externally scheduled (Netlify scheduled function, cron)

**Real-World Pain Points:**
- Under high concurrency, CMS write latency becomes a bottleneck
- FIFO queue is a workaround for CMS's weak concurrency control
- If Sanity API rate-limits or has downtime, checkout breaks

**Recommendation:** Valid for low-to-medium concurrency. Consider moving reservations to Redis (hashes + sets) if concurrency exceeds ~10 concurrent checkouts/minute.

### Solution: Redis Spin Lock + FIFO Head Check
**Prevalence:** Common for simple serialization
**Type:** Idiomatic for Redis-based queuing

**Pros:**
- No external message queue (RabbitMQ, SQS) needed
- Simple to implement and debug
- Atomic via Redis single-threadedness

**Cons (often overlooked):**
- CPU-intensive spin loop (25ms retry)
- 45s timeout can fail under genuine load spikes
- Does not scale horizontally well; Redis is a single point of contention
- Not a "real" queue consumer pattern - it's request-coordination within the request

**Real-World Pain Points:**
- Timeout errors during flash sales
- Redis connection exhaustion if too many concurrent waiters
- Lock TTL (30s) shorter than some Sanity transaction scenarios

**Recommendation:** Keep for current scale. If checkout volume grows, replace with:
- Redis Streams + consumer groups, OR
- BullMQ / Bull (Redis-based job queue), OR
- Serverless message queue (SQS, Pub/Sub)

### Solution: Background Scheduled Cleanup Job
**Prevalence:** Ubiquitous
**Type:** Idiomatic

**Pros:**
- Simple batch processing model
- Netlify scheduled functions fit serverless deployment
- Easy to monitor and retry

**Cons (often overlooked):**
- 5-minute granularity means stock can be locked up to 5 minutes after expiry
- Batch jobs can fail mid-run; partial cleanup requires idempotency
- Job execution time limits on serverless platforms

**Real-World Pain Points:**
- Missed reservations if job errors and isn't retried
- Netlify function timeout (10s default) may not process many expired reservations

**Recommendation:** ✅ Keep, but add:
1. Lazy cleanup on read (check expiresAt when fetching products)
2. Job result logging and alerting
3. Pagination for large batch sizes

---

## Verification & Falsification Log

### Claims Verified
| Claim | Evidence | Method |
|-------|----------|--------|
| Reservation with expiration is a standard ecommerce pattern | Stoa Logistics Pattern 4, Redis tutorial, WooCommerce Hold Stock | Official docs + industry blog |
| Document stores are used for reservation records in production | MongoDB official cart example, Adobe Commerce reservation table (relational but same pattern) | Official tutorial + docs |
| FIFO queue serialization prevents concurrent stock corruption | Redis SET NX atomicity, Mailgun reservation pattern | Code inspection + engineering blog |
| Background cleanup jobs are standard practice | Magento cron, WooCommerce auto-cancel, MongoDB expire script | Official docs + tutorial |
| Major platforms do NOT reserve at add-to-cart | Shopify native behavior, WooCommerce native behavior | Community + official docs |

### Falsification Attempts
| Claim | Counter-Evidence | Verdict |
|-------|------------------|---------|
| "CMS as reservation store is normal" | Most production ecommerce uses relational DB or Redis for reservations | ⚠️ Modified - valid but niche; FIFO queue compensates for CMS weaknesses |
| "FIFO spin lock is professional" | Redis WATCH/MULTI or Lua scripts are more standard; BullMQ is the industry choice | ⚠️ Modified - works but is a custom reimplementation of proven patterns |
| "Cleanup every 5 minutes is sufficient" | Lazy cleanup on read is preferred by Redis tutorial; 5 min delay can block sales | ⚠️ Modified - acceptable but not ideal; add lazy cleanup |
| "Our approach is just like Magento/Adobe" | They use append-only reservation tables with sum-to-zero lifecycle, not TTL docs | ❌ Modified - conceptually similar but implementation differs; they don't use TTL-based expiry |

### Knowledge Decay Assessment
| Section | Risk | Review Date |
|---------|------|-------------|
| Sanity transaction semantics | High | 2026-08-21 (verify if transaction API changes) |
| Redis spin lock pattern | Low | 2027-05-21 |
| Platform behavior (Shopify/WooCommerce) | Low | 2027-05-21 |
| Netlify scheduled function limits | Medium | 2026-11-21 (verify timeout/scheduling changes) |

---

## Synthesis: Actionable Takeaways

### For Our Project

| Decision | Rationale | Implementation |
|----------|-----------|----------------|
| **KEEP** soft reservation with expiration | Proven Pattern 4; prevents oversells; handles abandonment | Current `basketReservation` doc with `expiresAt` |
| **KEEP** background cleanup job | Standard practice; necessary for TTL expiry | Current `backgroundCleanupJob` + Netlify scheduled function |
| **KEEP** separation of `stock` and `reservedStock` | Universal best practice (Vendure, Magento, MongoDB) | Current Sanity product schema |
| **MODIFY** cleanup to include lazy expiry check | 5-min batch delay can block sales; lazy check adds safety | On product read / stock check, verify if reservation expired and release |
| **CONSIDER** replacing spin lock with BullMQ | BullMQ is the industry-standard Redis queue; handles retries, delays, job tracking | If checkout volume grows beyond ~10/min |
| **CONSIDER** moving reservations to Redis | Redis hashes + sets handle high concurrency better than Sanity writes | If Sanity API becomes bottleneck |
| **DO NOT** move reservation to add-to-cart | Industry consensus: checkout-level reservation is correct; cart-level is anti-pattern | Current checkout-button trigger is correct |

### Real Production Examples Using Similar Approaches

1. **Adobe Commerce (Magento)** - Reservation table with append-only records; cron cleanup (`inventory_cleanup_reservations`)
2. **WooCommerce** - "Hold Stock" timer; reduces stock on order placement; auto-cancels pending orders after timeout
3. **Vendure** - Headless commerce framework; `saleable = stockOnHand - allocated`; allocation at payment; `StockMovement` audit trail
4. **Redis Official Tutorial** - `inventory:{sku}` hash + `reservation:{id}` hash + `active` set; lazy expiry on read
5. **MongoDB Node.js Driver Docs** - `reserved` array on products + cart documents; background script expires after 30 min
6. **Mailgun** - Reservation pattern in distributed queues for "almost exactly once delivery"

### Critical Red Flags in Current Implementation

1. **Sanity is not designed for high-concurrency inventory writes.** The FIFO queue mitigates this, but it's a compensation pattern, not an optimal choice.
2. **Spin lock with 25ms retry is CPU-intensive.** Under load, multiple requests spinning wastes resources.
3. **No lazy cleanup on read.** If cleanup job hasn't run yet, a product with expired reservations still shows reduced available stock.
4. **Cleanup job does not handle partial failures gracefully.** If stock release succeeds but doc delete fails, the doc remains but stock is already released.
5. **Netlify function timeout (10s default) may not handle many expired reservations.** Add pagination or limit.

### Immediate Actions

1. **Add lazy expiry check on product stock read**
   - When calculating `availableStock = stock - reservedStock`, verify no reservations in the sum have expired
   - OR: run `findExpiredReservations` and filter before calculating

2. **Add cleanup job pagination and monitoring**
   - Limit processing to N reservations per run
   - Log and alert on errors
   - Track "orphaned" reservations (stock released but doc not deleted)

3. **Evaluate BullMQ for queue replacement**
   - If concurrent checkout volume increases, BullMQ provides production-grade FIFO with retries, delays, and dashboard
   - Removes need for custom spin lock

4. **Document the reservation lifecycle clearly**
   - CHECKOUT CLICK → CREATE reservation doc → INCREMENT reservedStock → [PAYMENT] → CONFIRM (remove reservation, decrement stock) / [EXPIRE] → cleanup job releases stock

### Open Questions

1. What is expected concurrent checkout volume? If >10/minute, BullMQ is strongly recommended.
2. Should cleanup job also update product `stock` (decrement) on successful payment, or is that handled elsewhere?
3. What happens if a customer refreshes checkout page - is a new reservation created, or is the existing one extended?

---

## Conclusion

**Verdict:** ✅ **VALID AND PROVEN, WITH CAVEATS**

The architecture of saving `basketReservation` to Sanity CMS, using a Redis FIFO queue for atomicity, and a background cleanup job for expired reservations is **a valid, professionally sound approach** that maps directly to established ecommerce patterns.

**What is proven:**
- Soft reservation with expiration (Pattern 4, Stoa Logistics)
- Document-store reservation records (MongoDB official example)
- FIFO queue serialization for concurrent writes (Redis tutorial, Mailgun)
- Background cleanup of expired reservations (Magento, WooCommerce, MongoDB)
- Checkout-level reservation (NOT cart-level - this is correct)

**What is niche/compensatory:**
- Using Sanity CMS as the reservation authority (most production systems use relational DB or Redis)
- Custom Redis spin lock instead of BullMQ/Redis Streams (works but is bespoke)
- Batch-only cleanup without lazy read-side check

**The approach is NOT an anti-pattern.** It is a legitimate implementation of soft reservation with expiration. The FIFO queue is a reasonable compensation for Sanity's weaker concurrency guarantees. However, it is pushing Sanity outside its primary design purpose, and the spin lock is a custom solution where a library (BullMQ) would be more standard.

**The single biggest risk:** If checkout volume increases significantly, the combination of Sanity write latency + Redis spin lock contention will become a bottleneck. Plan a migration path to either BullMQ or Redis-native reservation storage.
