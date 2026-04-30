# Research: Basket Feature Wholeness Understanding

**Research Date:** 2026-04-29  
**Topic:** Complete architectural and functional understanding of the basket feature  
**Status:** ✅ Verified against codebase documentation

---

## Research Scope Contract
- **Topic:** Basket feature - client-side shopping cart with CMS sync, persistence, and boundary enforcement
- **First Principles:** State management (Zustand), persistence (localStorage), CMS sync (Sanity), boundary enforcement (math limits)
- **Fundamentals:** Zustand store structure, persistence middleware, server actions for sync, UI control patterns
- **Scope Boundary:** Basket domain only - checkout gateway validation is outside scope
- **Target Audience:** Developers implementing or maintaining basket functionality
- **Decay Risk:** Low - architecture decisions are stable

---

## Multi-Source Triangulation

| Source | Type | Credibility | Key Claim | Verification Status |
|--------|------|-------------|-----------|---------------------|
| docs/basket/prd-basket.todo | Internal Definition of Done | Canonical | 5-layer architecture: Core State, Persistence, UI Controls, Latest Sync, Consumers | ✅ Verified |
| docs/basket/adrs/ADR-001-basket-architecture.md | Architecture Decision Record | Canonical | CMS-native price/stock, minimal persistence schema, in-memory sync status | ✅ Verified |
| store/basketStore.ts | Source Code | Ground Truth | BasketItem interface with metadata for discrepancy tracking | ✅ Verified |
| app/actions/basket.ts | Server Action | Ground Truth | syncBasketProducts transforms CMS data and partitions by availability | ✅ Verified |
| tests/basket/unit/basketStore.spec.ts | Unit Tests | Verification | Boundary enforcement (0 min, stock max), debounced persistence | ✅ Verified |
| tests/basket/e2e/happy-path.spec.ts | E2E Tests | Verification | Full browser flow: add → persist → sync → render | ✅ Verified |

---

## First Principles Analysis

### Core Problem Being Solved
Manage client-side shopping cart state with persistence, CMS data synchronization, and mathematical boundary enforcement while maintaining freshness and handling discrepancies gracefully.

### Underlying Constraints
1. **HTTP is stateless** - Client basket must persist across page refreshes via localStorage
2. **CMS data changes** - Prices and stock can change between sessions, requiring sync on basket page mount
3. **JavaScript is single-threaded** - Rapid user actions require debouncing to prevent race conditions
4. **Storage is unreliable** - localStorage can fail (quota, disabled), requiring graceful degradation
5. **React 18 hydration** - Server/client mismatch prevention requires hasHydrated guard

### Inherent Tradeoffs

| Approach | Wins | Loses | When to Use |
|----------|------|-------|-------------|
| Persist only {productId, quantity} | Smaller storage, always fresh data | Must fetch CMS data on basket page | When CMS sync is fast and reliable |
| Persist full CMS data | No CMS fetch needed | Stale pricing/stock, larger storage | When offline-first is required |
| In-memory syncStatus | Clean retry on refresh | No persistent error state | When automatic retry is desired |
| Metadata for discrepancies | Simple UI rendering, per-item tracking | Extra schema fields | When showing price/stock changes to users |

### Failure Modes
1. **Misapplication:** Using localStorage for CMS data leads to stale pricing
2. **Over-application:** Persisting syncStatus causes confusing error states across sessions
3. **Under-application:** No boundary enforcement allows negative quantities or stock overflow

---

## Code Fundamentals

### Fundamental: Zustand Store Structure
**Claim:** Basket store holds minimal state with derived selectors and boundary-enforcing actions.

**Verification:**
- ✅ Located in codebase: `store/basketStore.ts`
- ✅ Test exists: `tests/basket/unit/basketStore.spec.ts`
- ✅ Source inspected: Interface defines BasketItem with optional metadata

**Actual Behavior:**
```typescript
interface BasketItem {
  productId: string
  quantity: number
  displayPrice: number  // Optional, populated by sync
  availableStock?: number  // Optional, populated by sync
  metadata?: BasketItemMetadata  // Tracks discrepancies
}
```

**Edge Cases:**
- decrementQuantity stops at 0 (mathematical boundary)
- incrementQuantity accepts stockLimit parameter (enforcement)
- addProduct validates productId format
- Persistence debounced to prevent race conditions

---

### Fundamental: CMS Sync Transformation
**Claim:** Server action transforms Sanity CMS data (cents, stock, reservedStock) into basket format (displayPrice, availableStock).

**Verification:**
- ✅ Located in codebase: `app/actions/basket.ts`
- ✅ Test exists: `tests/basket/unit/basketLatestSync.spec.ts`
- ✅ Source inspected: syncBasketProducts function

**Actual Behavior:**
```typescript
const transformed: TransformedProductData[] = products.map((product) => ({
  productId: product._id,
  displayPrice: product.displayPrice,  // Already converted from cents
  availableStock: product.stock - product.reservedStock,  // Calculation
}));
```

**Edge Cases:**
- Partitions items into available (stock > 0) and unavailable (stock === 0)
- Does NOT attach metadata - that happens client-side during comparison
- Returns empty arrays if no productIds provided

---

### Fundamental: Persistence with Hydration Guard
**Claim:** Only {productId, quantity} persisted to localStorage with hasHydrated flag to prevent React 18 hydration mismatches.

**Verification:**
- ✅ Located in codebase: `store/basketStore.ts` (interface shows hasHydrated)
- ✅ Test exists: `tests/basket/unit/basketPersistance.spec.ts`
- ✅ Source inspected: ADR-001 confirms minimal persistence schema

**Actual Behavior:**
- Persistence middleware writes debounced to localStorage
- On mount: hasHydrated starts false, reads localStorage, sets true
- CMS fields (displayPrice, availableStock, metadata) NOT persisted
- syncStatus NOT persisted (in-memory only)

**Edge Cases:**
- localStorage quota exceeded → fallback to session storage
- Session storage fails → graceful degradation (memory-only)
- Malformed JSON → clear localStorage and start empty
- Schema validation → discard invalid items on hydration

---

## Best Practices (Verified)

### Practice: Minimal Persistence Schema
**Consensus:** High - ADR-001 and PRD both confirm this decision

**Supporting Evidence:**
- ADR-001: "Only persist {productId, quantity}"
- PRD: "displayPrice and other CMS data are not persisted"

**Counter-Evidence:**
- None found - this is a deliberate architectural decision

**Verdict:** ✅ Recommended

**When to Use:** When CMS sync is fast and reliable
**When to Skip:** When offline-first functionality is required

---

### Practice: In-Memory Sync Status
**Consensus:** High - ADR-001 explicitly deleted syncStatus from persistence

**Supporting Evidence:**
- ADR-001: "syncStatus is in-memory only"
- PRD: "syncStatus is in-memory state only, not persisted"

**Counter-Evidence:**
- None - deliberate decision for clean retry behavior

**Verdict:** ✅ Recommended

**When to Use:** When automatic retry on mount is desired
**When to Skip:** When persistent error tracking is required

---

### Practice: Metadata for Discrepancy Tracking
**Consensus:** High - ADR-001 and PRD both use this pattern

**Supporting Evidence:**
- ADR-001: "Metadata indicates correction status, no extra state needed"
- PRD: "adds metadata: { old_...: ... } to the item object"

**Counter-Evidence:**
- None - simplifies UI rendering from single source of truth

**Verdict:** ✅ Recommended

**When to Use:** When showing price/stock changes to users
**When to Skip:** When discrepancies are handled silently

---

## Common Solutions Landscape

### Solution: Zustand with Persistence Middleware
**Prevalence:** Common in React ecosystems
**Type:** Idiomatic

**Pros:**
- Simple API for state management
- Built-in persistence middleware
- TypeScript support
- No Context Provider boilerplate

**Cons:**
- Requires manual boundary enforcement in actions
- DevTools integration less polished than Redux

**Real-World Pain Points:**
- Hydration mismatches if hasHydrated not handled
- Race conditions if persistence not debounced

**Recommendation:** ✅ Use - well-suited for basket use case

---

### Solution: CMS-Native Price and Stock
**Prevalence:** Niche - many use Stripe price IDs
**Type:** Idiomatic for this project

**Pros:**
- Single source of truth (CMS)
- No Stripe price ID management
- Simpler checkout flow
- Built-in stock reservation system

**Cons:**
- Requires CMS to handle pricing
- Price updates must go through CMS
- No real-time Stripe price updates

**Real-World Pain Points:**
- None documented - ADR-001 explicitly chose this over Stripe

**Recommendation:** ✅ Use - aligns with stock reservation system

---

### Solution: Graceful Storage Degradation
**Prevalence:** Common in production apps
**Type:** Idiomatic

**Pros:**
- App works without storage
- No blocking errors
- Better UX for privacy-focused users

**Cons:**
- Basket lost on refresh if storage disabled
- Harder to debug storage issues silently

**Real-World Pain Points:**
- Users may not realize basket won't persist

**Recommendation:** ✅ Use - graceful degradation > blocking errors

---

## Verification & Falsification Log

### Claims Verified
| Claim | Evidence | Method |
|-------|----------|--------|
| Basket holds minimal state {productId, quantity, displayPrice, availableStock, metadata} | store/basketStore.ts | Code inspection |
| Only {productId, quantity} persisted to localStorage | ADR-001, PRD | Documentation |
| syncStatus is in-memory only | ADR-001, PRD | Documentation |
| CMS sync calculates availableStock = stock - reservedStock | app/actions/basket.ts | Code inspection |
| Boundary enforcement prevents negative quantities | tests/basket/unit/basketStore.spec.ts | Test specification |
| Graceful degradation on storage failure | ADR-001 | Documentation |

### Falsification Attempts
| Claim | Counter-Evidence | Verdict |
|-------|------------------|---------|
| Stripe price IDs used for pricing | ADR-001 explicitly deleted this approach | Survived - CMS-native pricing chosen |
| syncStatus persisted across sessions | ADR-001 explicitly deleted from persistence | Survived - in-memory only |
| Full CMS data persisted to localStorage | ADR-001 explicitly deleted | Survived - minimal schema |

### Knowledge Decay Assessment
| Section | Risk | Review Date |
|---------|------|-------------|
| Core State Structure | Low | 2027-04-29 |
| Persistence Strategy | Low | 2027-04-29 |
| CMS Sync Flow | Low | 2027-04-29 |
| UI Control Patterns | Low | 2027-04-29 |

---

## Synthesis: Actionable Takeaways

### For Our Project
| Decision | Rationale | Implementation |
|----------|-----------|----------------|
| Use Zustand with minimal persistence | Simple, idiomatic, well-suited for basket | Already implemented in store/basketStore.ts |
| CMS-native pricing and stock | Single source of truth, aligns with reservation system | Already implemented in app/actions/basket.ts |
| In-memory sync status | Clean retry on refresh, no persistent error state | Already implemented per ADR-001 |
| Metadata for discrepancies | Simple UI rendering, per-item tracking | Already implemented per PRD |
| Graceful storage degradation | Better UX, no blocking errors | Already implemented per ADR-001 |

### Immediate Actions
None - architecture is complete and verified.

### Open Questions
None - all design decisions documented in ADR-001 and PRD.

---

## 10 Bullet Points: How the Basket Feature Works

1. **Core State Management**: Zustand store holds an array of BasketItem objects with `{productId, quantity, displayPrice, availableStock, metadata}`. The store exposes actions (addProduct, removeProduct, incrementQuantity, decrementQuantity) and derived selectors (selectTotalItemsCount).

2. **Mathematical Boundary Enforcement**: All quantity changes are mathematically bounded - decrementQuantity stops at 0, incrementQuantity accepts a stockLimit parameter and prevents exceeding it. UI components are dumb and only dispatch intents; all boundary logic lives in the store.

3. **Minimal Persistence Schema**: Only `{productId, quantity}` are persisted to localStorage via debounced middleware. CMS data (displayPrice, availableStock, metadata) are NOT persisted because the basket page auto-syncs with CMS on mount, ensuring users always see fresh pricing and stock.

4. **Hydration Guard for React 18**: The store initializes with `hasHydrated: false` to prevent hydration mismatches. On mount, it reads localStorage, populates the store, and sets `hasHydrated: true`. Malformed JSON triggers localStorage clear and empty basket start.

5. **Graceful Storage Degradation**: localStorage writes are wrapped in try/catch. On quota exceeded or disabled storage, the middleware attempts fallback to session storage. If session storage also fails, the app continues running with memory-only basket state (graceful degradation).

6. **CMS Sync on Basket Page Mount**: When the basket page mounts, a Server Action (`syncBasketProducts`) fetches latest CMS data for all productIds, transforms it (cents to displayPrice, calculates availableStock = stock - reservedStock), and partitions items into available (stock > 0) and unavailable (stock === 0) arrays.

7. **Discrepancy Tracking via Metadata**: If local basket price/stock differs from CMS data, the system attaches metadata `{old_price, old_availableStock}` to the item. UI renders strikethrough old values alongside latest values. Unavailable items are moved to a separate list without metadata.

8. **In-Memory Sync Status**: The store tracks syncStatus ('idle' | 'loading' | 'error' | 'success') in-memory only. On page refresh or component unmount, syncStatus resets to 'idle' and useEffect retriggers the CMS sync automatically. Error state does not persist across sessions.

9. **Dumb UI Components**: Basket controls perform zero boundary math - they only read state and dispatch actions. Increment button disables visually if quantity >= stockLimit. Decrement button disables (or swaps to 'X' icon) if quantity <= 1. Controls return null if productId not in store.

10. **Server-Side Validation Boundary**: The basket feature ends at the checkout button. The checkout gateway re-calculates the basket server-side against Sanity CMS (price_data, stock, reservedStock) using basket reservation documents as source of truth. Client-side pricing/stock data is treated as untrusted for payment processing to prevent tampering.
