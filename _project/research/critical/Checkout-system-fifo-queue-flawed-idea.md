# Redis FIFO Queue Architecture - Flawed Idea

## Problem Statement

The current checkout system uses a Redis FIFO queue with a Node.js spin loop (25ms retry interval) to serialize inventory reservation requests. This architecture is an anti-pattern that causes:
- Redis command flooding under concurrent load
- Degraded API route performance
- Unnecessary complexity for the use case

## Proposed Solution (REVISED)

**Implement Tiered Inventory Concurrency Strategy:** Remove the Redis FIFO queue and Node.js spin loop entirely. Replace with a three-pattern tiered approach based on item characteristics:

**Pattern 1 — Standard items (restockable, qty ≥ 2): Pure OCC at payment**
- No inventory held, no reservation during checkout flow
- Fast read-only pulse checks between steps against Sanity stock
- Atomic Sanity transaction at payment: checks `stock > 0` and decrements (OCC)
- Graceful fail on collision: "Another customer just purchased the last unit while you were checking out"
- Rationale: ~81% cart abandonment in luxury/audio gear means upfront locking causes starvation

**Pattern 2 — Rare/flagship items ($3k+, qty = 1): Soft Reservation via Redis TTL**
- Redis key `soft-reserve:{productId}:{sessionId}` with TTL = 10 minutes on checkout start
- Check for existing reservation before setting; inform user if held
- On checkout completion: promote to hard Sanity decrement, delete Redis key
- On expiry/abandonment: Redis auto-deletes key or explicit deletion
- Rationale: Late-stage collision on $3k+ single-unit item is unacceptable UX failure

**Pattern 3 — Scarcity signals (both tiers)**
- If `stock <= 2`, display "Only X left in stock" badge on product page, cart, and each checkout step

## Industry Standard Analysis

### Is this e-commerce standard?

Yes, it absolutely is the standard. The instinct that letting users fill out forms only to hit a wall sounds like terrible UX is correct. However, the e-commerce industry accepts this specific UX risk because the alternative—locking inventory upfront—causes a much more expensive problem: **Inventory Starvation**.

### The Problem with Upfront Locking

The average cart abandonment rate across e-commerce is roughly 70%. People start checkouts constantly just to see total costs, or they get distracted, or their card declines.

If you lock inventory at step one, 70% of your reservations will expire without a sale. While that stock is locked in an abandoned session, a real buyer with money ready will see "Out of Stock" and leave. Upfront locking prioritizes the hypothetical buyer who might finish checkout over the guaranteed buyer who is trying to buy right now.

### Applying This to Premium Audio Gear

Sang-logium sells premium audiophile equipment with two distinct tiers:
- **Standard items**: restockable, quantity ≥ 2 (e.g. Sennheiser HD 660S, Beyerdynamic DT 990)
- **Rare / flagship items**: single-unit or extremely limited stock, price ≥ $3,000 (e.g. ZMF Atrium, Meze Elite, Focal Utopia)

These tiers have fundamentally different collision probability and UX failure cost profiles, requiring different concurrency strategies.

**For Standard Items:**
- Collision risk: Statistically very low (restockable, multiple units)
- Abandonment risk: ~81% for luxury/audio gear (Baymard/Oberlo 2024)
- Strategy: Pure OCC at payment - prioritize availability over collision protection

**For Rare/Flagship Items:**
- Collision risk: Higher due to single-unit availability
- UX failure cost: Very high ($3k+ purchase, user invests significant checkout effort)
- Strategy: Soft reservation via Redis TTL - protect user investment, accept minor starvation risk

### How the Industry Mitigates the UX Risk

To prevent users from doing unnecessary work without using a rigid queue, modern platforms use frictionless strategies:

**1. Soft Checks Between Steps**
When the user clicks "Continue to Shipping" and "Continue to Payment," the server does a lightning-fast read of the current Sanity stock. If it's out of stock, you halt them at step 2 instead of step 4. No locks are placed; it's just a pulse check.

**2. Scarcity Badges**
If stock is ≤ 2, display "Only X left in stock!" on the basket and checkout pages. This sets the psychological expectation that the item might vanish if they are slow.

**3. The "Graceful Fail" at Payment**
If that rare collision does happen, the system catches it during the OCC transaction right before generating the Stripe PaymentIntent. You return them to the basket with a clear, polite message: "We're sorry, another customer just purchased the last available unit of [Item] while you were checking out."

## What is Being REMOVED

- The Redis FIFO queue and Node.js spin loop are removed entirely
- A queue serializes ALL requests pessimistically — it does not distinguish between item tiers
- It introduces latency for every checkout
- It conflates two separate concerns (concurrency control vs. rate limiting)
- OCC is not "implemented via a queue." OCC and queuing are opposite strategies: OCC lets all requests proceed freely and resolves conflicts atomically at write time; a queue blocks all but one request from proceeding at all

## Recommended Architecture (Tiered Strategy)

### Pattern 1 — Standard items (restockable, qty ≥ 2): Pure OCC at payment
- No inventory held, no reservation during checkout flow
- Fast read-only pulse checks between steps against Sanity stock
- Atomic Sanity transaction at payment: checks `stock > 0` and decrements (OCC)
- Graceful fail on collision: "Another customer just purchased the last unit while you were checking out"
- Rationale: ~81% cart abandonment in luxury/audio gear means upfront locking causes starvation

### Pattern 2 — Rare/flagship items ($3k+, qty = 1): Soft Reservation via Redis TTL
- Redis key `soft-reserve:{productId}:{sessionId}` with TTL = 10 minutes on checkout start
- Check for existing reservation before setting; inform user if held
- On checkout completion: promote to hard Sanity decrement, delete Redis key
- On expiry/abandonment: Redis auto-deletes key or explicit deletion
- Rationale: Late-stage collision on $3k+ single-unit item is unacceptable UX failure
- Mirrors industry pattern used by Fluent Commerce, Broadleaf, Microsoft Dynamics 365 for non-fungible high-value items

### Pattern 3 — Scarcity signals (both tiers)
- If `stock <= 2`, display "Only X left in stock" badge on product page, cart, and each checkout step
- Sets user expectation proactively and reduces surprise at any failure point

## Benefits

- Eliminates Redis FIFO queue and spin loop anti-pattern
- Reduces API latency for standard items (no queue wait times)
- Keeps inventory available longer for standard items (no upfront locking)
- Protects high-value checkout experience for rare items (soft reservation)
- Aligns with e-commerce industry standards for tiered inventory
- Better user experience for the common case (no queue delays)
- Acceptable UX for rare collision case on standard items (clear messaging)
- Industry-standard pattern for rare/flagship items (soft reservation)

## Related Issues

- sang-logium-01t: Research Redis spin loop anti-pattern
- sang-logium-g14: Update checkout system ADR to document this change
