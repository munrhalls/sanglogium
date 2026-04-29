# ADR-001: Basket Architecture Decisions

## Context
The basket feature requires persistence, CMS sync, and error handling. The design process focused on questioning requirements and deleting anything unnecessary.

## Decisions

### 1. CMS-Native Price Data and Stock Calculation
**Questioned:** Should I use Stripe price IDs and fetch pricing from Stripe API, or store price data directly in CMS?

**Decision:** Store price_data directly in CMS product. Calculate available stock as `stock - reservedStock`.

**Deleted:** Stripe price ID handling, separate Stripe API calls for pricing, network requests to fetch prices.

**Rationale:** No stripe based PIM needed for this store. Eliminates complexity of Stripe price ID management. No separate API calls needed. Stock reservation system (checkout queue) requires stock tracking in CMS anyway. Single source of truth simplifies architecture. Simple and robust.

**Consequences:**
- No Stripe price ID management
- No extra network requests to fetch pricing
- Stock reservation system built into CMS (designed that its via basket reservation CMS document, going through redis queue for concurrency control)
- Simpler checkout flow
- Price updates handled in CMS, not Stripe

---

### 2. In-Memory Basket Shape
**Questioned:** Should the in-memory BasketItem include CMS data (displayPrice, availableStock) or only product id and quantity?

**Decision:** BasketItem includes `{productId, quantity, displayPrice, availableStock, metadata}`. CMS data populated by syncFreshness on mount.

**Rationale:** User Experience Intent is that after latest basket check vs CMS:
- UI shows price / stock disprepancies between client items and latest CMS data after sync
- UI shows no longer available items 

Not having those extra fields in basket store schema -> would have to design complex logic and flows for how the ui can handle the above. With those fields: can use metadata to capture only disprepancies per item, and also unavailable items.  

**Consequences:**
- COST: Two extra fields in basket item schema: `displayPrice` and `availableStock` 
- TRADE-OFF/BENEFIT: a simple, robust one-time CMS sync vs latest data flow 
- TRADE-OFF/BENEFIT: disprepancies/unavailable items - easy for Ui to render based on one source of truth (basket items, metadata) - 0 complex workarounds
- TRADE-OFF/BENEFIT: PLUS - also, metadata is source of truth for whether basket has been corrected or not - all else is derived, no extra state, no flags  


---

### 3. Minimal Persistence Schema
**Questioned:** Should I persist displayPrice, availableStock, and other CMS data to localStorage?

// Not to be confused with basket shape !!! 

**Decision:** No. Only persist `{productId, quantity}`.

**Deleted:** All CMS data (price, stock, titles, assets) from persistence.

**Rationale:** There is ZERO need for local storage to store anything else because price / stock are only needed on basket page *when* there are disprepancies after check vs latest CMS data - and basket page triggers sync check vs latest CMS data automatically. 

So basket page always gets the freshest CMS-checked data (1st soft sync) anyway.

**Consequences:**
- Smaller localStorage footprint
- Always fresh pricing/stock on basket page due to auto sync on open basket page
- Simpler hydration logic

// Not to be confused with basket shape !!! 

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
- flag for tracking basket status vs cms payload basket - unnecessary, ui can use derived state based on presence of metadata / unavailable items after sync 
- UI-level edge cases (stock limit changes during interaction, component unmounts, rapid clicks) - controls disabled on boundaries, rest is client-level sync operations, no factor, latest stock limit only relevant on basket page and handled by one simple sync vs CMS flow
- CMS-level edge cases (malformed data, timeout, navigate away, rapid sync calls) - scope creep
- Checkout-level edge cases (server-side failure, reservation expiry, payment timeout) - OUTSIDE BASKET SCOPE
- localStorage cleared while running - no factor, acceptable edge case
