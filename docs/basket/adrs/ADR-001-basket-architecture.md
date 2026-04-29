# ADR-001: Basket Architecture Decisions

## Status
Accepted

## Context
The basket feature requires persistence, CMS sync, and error handling. The design process focused on questioning requirements and eliminating unnecessary complexity.

## Decisions

### 1. CMS-Native Price Data and Stock Calculation
**Questioned:** Should we use Stripe price IDs and fetch pricing from Stripe API, or store price data directly in CMS?

**Decision:** Store price_data directly in CMS product. Calculate available stock as `stock - reservedStock`.

**Deleted:** Stripe price ID handling, separate Stripe API calls for pricing, network requests to fetch prices.

**Rationale:** No stripe based PIM needed for this store. Eliminates complexity of Stripe price ID management. No separate API calls needed. Stock reservation system (checkout queue) requires stock tracking in CMS anyway. Single source of truth simplifies architecture. Simple and robust.

**Consequences:**
- No Stripe price ID management
- No network requests to fetch pricing
- Stock reservation system built into CMS
- Simpler checkout flow
- Price updates handled in CMS, not Stripe

---

### 2. Minimal Persistence Schema
**Questioned:** Should we persist displayPrice, availableStock, and other CMS data to localStorage?

**Decision:** No. Only persist `{productId, quantity}`.

**Deleted:** All CMS data (price, stock, titles, assets) from persistence.

**Rationale:** CMS data changes frequently. Persisting it risks stale data. Sync on mount provides fresh data. Persisting only user intent (what they want to buy) is sufficient.

**Consequences:**
- Smaller localStorage footprint
- Always fresh pricing/stock on basket page
- Simpler hydration logic

---

### 3. In-Memory Sync Status
**Questioned:** Should syncStatus persist across sessions?

**Decision:** No. syncStatus is in-memory only.

**Deleted:** syncStatus from localStorage persistence.

**Rationale:** Error state should not persist. Page refresh automatically retries sync. Users get clean retry without manual intervention.

**Consequences:**
- Error state resets on refresh
- Automatic retry on mount
- Simpler state management

---

### 4. Basket Metadata for Change Detection
**Questioned:** How do we detect if CMS data changed since last sync?

**Decision:** Use `metadata` field on BasketItem. Attach `{old_price, old_availableStock}` if CMS differs from client.

**Deleted:** Separate "change log" or diff engine.

**Rationale:** Simple boolean flag insufficient—need to show what changed. Metadata enables strikethrough pricing without complex diff logic.

**Consequences:**
- Self-contained change detection
- UI renders strikethrough old prices
- No external change tracking system

---

### 5. Debounced Persistence
**Questioned:** Should we write to localStorage on every state change?

**Decision:** No. Debounce rapid writes.

**Deleted:** Immediate writes on every action.

**Rationale:** Prevents race conditions and excessive re-renders from rapid user actions.

**Consequences:**
- Reduced localStorage write operations
- Smoother UI performance

---

### 6. Graceful Storage Degradation
**Questioned:** What happens if localStorage fails?

**Decision:** Try/catch → fallback to session storage → if fails, do nothing.

**Deleted:** Blocking error messages, storage requirement enforcement.

**Rationale:** App should function even without persistence. Graceful degradation > blocking errors.

**Consequences:**
- App works without storage
- No error blocking user flow
- User loses basket on refresh (acceptable if storage disabled)

---

## Eliminated Complexity
**Questioned and removed:**
- flag for tracking basket status vs cms payload basket - unnecessary, ui can use derived state based on presence of metadata / unavailable items after sync 
- UI-level edge cases (stock limit changes during interaction, component unmounts, rapid clicks) - handled by sync mechanism or irrelevant
- CMS-level edge cases (malformed data, timeout, navigate away, rapid sync calls) - scope creep
- Checkout-level edge cases (server-side failure, reservation expiry, payment timeout) - outside basket scope
- localStorage cleared while running - acceptable edge case, no handling needed
