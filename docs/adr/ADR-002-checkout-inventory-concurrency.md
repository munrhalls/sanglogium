# ADR-002: Tiered Inventory Concurrency Strategy

## Status
Accepted

## Date
2026-05-21

## Context

Sang-logium sells premium audiophile equipment. The catalogue contains two distinct tiers:
- **Standard items**: restockable, quantity ≥ 2 (e.g. Sennheiser HD 660S, Beyerdynamic DT 990)
- **Rare / flagship items**: single-unit or extremely limited stock, price ≥ $3,000 (e.g. ZMF Atrium, Meze Elite, Focal Utopia)

The current checkout system uses a Redis FIFO queue with a Node.js spin loop (25ms retry interval) to serialize inventory reservation requests. This architecture is an anti-pattern that:
- Floods Redis with commands under concurrent load
- Degrades API route performance
- Introduces latency for every checkout
- Does not distinguish between item tiers
- Conflates concurrency control with rate limiting

These tiers have fundamentally different collision probability and UX failure cost profiles, and therefore require different concurrency strategies.

## Decision

Implement a three-pattern tiered approach based on item characteristics:

### Pattern 1 — Standard items (restockable, qty ≥ 2): Pure OCC at payment

- No inventory held, no reservation placed during checkout flow
- Between steps, server performs a fast read-only pulse check against Sanity stock; if zero, user is halted early with a clear message
- At payment finalization: atomic Sanity transaction checks `stock > 0` and decrements in a single operation (OCC). If the check fails (race condition), return the user to cart with a graceful message: "Another customer just purchased the last unit while you were checking out."
- Rationale: cart abandonment rate for luxury/audio gear is ~81% (Baymard/Oberlo 2024). Locking inventory upfront causes starvation — real buyers see "Out of Stock" while 80%+ of reservations expire unused. Collision probability on restockable items at sang-logium's traffic volume is negligible vs starvation risk.

### Pattern 2 — Rare / flagship items ($3k+, qty = 1): Soft Reservation via Redis TTL

- When user proceeds past cart (checkout step 1), place a Redis key: `soft-reserve:{productId}:{sessionId}` with TTL = 10 minutes
- Before setting the key, check for an existing reservation key on that productId. If another session holds a reservation, immediately inform the user: "This item is currently being held by another customer. It will become available again in X minutes if they do not complete their purchase."
- On checkout completion: promote the soft reservation to a hard decrement in Sanity atomically, delete the Redis key
- On expiry (TTL fires, no purchase): Redis auto-deletes key; item becomes available again
- On abandonment / navigation away: delete Redis key explicitly
- Rationale: for a $3,000+ single-unit item, a late-stage "sorry, gone" is an unacceptable UX failure. The soft reservation trades a minor starvation risk (10-min window) for a guarantee that the user investing checkout effort is protected. This mirrors the named industry pattern used by Fluent Commerce, Broadleaf, and Microsoft Dynamics 365 for non-fungible high-value items.

### Pattern 3 — Scarcity signals (both tiers)

- If `stock <= 2`, display "Only X left in stock" badge on product page, cart, and each checkout step
- This sets user expectation proactively and reduces surprise at any failure point

## What is Being Removed

- The Redis FIFO queue and Node.js spin loop are removed entirely
- A queue serializes ALL requests pessimistically — it does not distinguish between item tiers, it introduces latency for every checkout, and it conflates two separate concerns (concurrency control vs. rate limiting)
- OCC is not "implemented via a queue." OCC and queuing are opposite strategies: OCC lets all requests proceed freely and resolves conflicts atomically at write time; a queue blocks all but one request from proceeding at all

## Consequences

### Positive
- Eliminates Redis FIFO queue and spin loop anti-pattern
- Reduces API latency for standard items (no queue wait times)
- Keeps inventory available longer for standard items (no upfront locking)
- Protects high-value checkout experience for rare items (soft reservation)
- Aligns with e-commerce industry standards for tiered inventory
- Better user experience for the common case (no queue delays)
- Acceptable UX for rare collision case on standard items (clear messaging)
- Industry-standard pattern for rare/flagship items (soft reservation)

### Negative
- Soft reservation for rare items introduces minor starvation risk (10-minute TTL window)
- Requires item tier classification logic in product schema
- Requires Redis key management for soft reservations (but no queue/spin loop)
- Late-stage collision on standard items still possible (but statistically rare)

## Alternatives Considered

### Pure OCC everywhere
**Rejected** for rare items because a late-stage collision on a $3k+ single-unit item is an unacceptable UX failure cost.

### Hard upfront lock (pessimistic)
**Rejected** because ~81% cart abandonment in luxury/audio means 81% of locks expire without a sale, starving genuine buyers.

### Redis FIFO queue
**Rejected** because it is pessimistic (blocks all concurrent requests), adds latency universally, and conflates serialization with concurrency control — it solves the wrong problem.

### Soft reservation for all items
**Rejected** because the starvation tradeoff (10-min TTL on normal stock) is unnecessary when collision risk on restockable items is negligible.

## References

- Research document: `_project/research/critical/Checkout-system-fifo-queue-flawed-idea.md`
- Related beads issue: sang-logium-g14
- Related beads issue: sang-logium-01t (Redis spin loop anti-pattern research)
