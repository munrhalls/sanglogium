# ADR-001: Basket Architecture Decisions

## Context
Basket requires persistence, CMS sync, and error handling. Design focused on questioning requirements and deleting unnecessary complexity.

## Decisions

### 1. CMS-Native Price Data and Stock Calculation
**Questioned:** Use Stripe price IDs and fetch pricing from Stripe API, or store price data in CMS?

**Decision:** Store price_data directly in CMS. Calculate available stock as `stock - reservedStock`.

**Deleted:** Stripe price ID handling, separate Stripe API calls for pricing.

**Rationale:** Eliminates Stripe price ID management complexity. Stock reservation system requires CMS tracking anyway. Single source of truth simplifies architecture.

**Consequences:**
- No Stripe price ID management
- No extra network requests for pricing
- Stock reservation system built into CMS
- Simpler checkout flow
- Price updates handled in CMS

---

### 2. In-Memory Basket Shape
**Questioned:** Should BasketItem include CMS data (displayPrice, availableStock) or only productId and quantity?

**Decision:** BasketItem includes `{productId, quantity, displayPrice, availableStock, metadata}`. CMS data populated by syncFreshness on mount.

**Rationale:** UI must show price/stock discrepancies and unavailable items after CMS sync. Without these fields, complex UI logic needed. With them, metadata captures discrepancies per item.

**Consequences:**
- Cost: Two extra fields in basket item schema
- Benefit: Simple CMS sync flow
- Benefit: Easy UI rendering from single source of truth (basket items + metadata)
- Benefit: Metadata indicates correction status, no extra state needed


---

### 3. Minimal Persistence Schema
**Questioned:** Should I persist displayPrice, availableStock, and other CMS data to localStorage?

**Decision:** No. Only persist `{productId, quantity}`.

**Deleted:** All CMS data (price, stock, titles, assets) from persistence.

**Rationale:** Price/stock only needed on basket page when discrepancies exist. Basket page auto-syncs with CMS on mount, always providing fresh data.

**Consequences:**
- Smaller localStorage footprint
- Always fresh pricing/stock on basket page
- Simpler hydration logic

---

### 4. In-Memory Sync Status
**Questioned:** Should syncStatus persist across sessions?

**Decision:** No. syncStatus is in-memory only.

**Deleted:** syncStatus from localStorage persistence.

**Rationale:** Error state should not persist. Page refresh automatically retries sync. Users get clean retry without manual intervention.

**Consequences:**
- Error state resets on refresh
- Automatic retry on mount
- Simpler state management

---

---

### 5. Debounced Persistence
**Questioned:** Should I write to localStorage on every state change?

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
- Flag for tracking basket status vs CMS - UI uses derived state from metadata
- UI-level edge cases - controls disabled on boundaries, rest within expected user behavior range and sync handling
- CMS-level edge cases - out of scope
- Checkout-level edge cases - outside basket scope
- localStorage cleared while running - acceptable
