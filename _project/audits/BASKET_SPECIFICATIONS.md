# Basket Functionality — End-to-End Specifications

**Date:** 2026-04-02
**Prerequisite:** `BASKET_AUDIT.md` — all bugs and type issues identified there are inputs to this spec.
**Scope:** Structure, data pass, state management, user flow, robustness, minimal full-impact testing.
**Out of scope:** Styling/layout/interactivity polish, payments/checkout internals (except basket→checkout data handoff).

---

## 1. Data Architecture

### 1.1 BasketItem Interface (Target State)

```typescript
// app/(store)/basket/basket.types.ts
export interface BasketItem {
  _id: string;
  name: string;
  slug: string;           // NEW — for product page links
  displayPrice: number;
  stock: number;
  quantity: number;
  image: string;           // Sanity CDN URL (pre-generated via urlFor)
}
```

**Rationale:**
- `slug` added: product links in basket must use slug-based routing (`/product/[slug]`), not `_id`
- `brand` excluded: not needed for basket display or checkout; storing it wastes localStorage space
- `image` is a pre-resolved URL string, not a Sanity image reference — the URL is generated at add-time via `urlFor()` so the basket never needs Sanity client access

### 1.2 BasketState Interface (Target State)

```typescript
// store/store.ts
interface BasketState {
  basket: BasketItem[];
  _hasHydrated: boolean;

  // Mutations
  addItem: (item: BasketItem) => void;
  removeItem: (_id: string) => void;
  updateQuantity: (_id: string, quantity: number) => void;
  clearBasket: () => void;

  // Derived (computed via selectors, not methods)
  // getTotal and isCheckoutEnabled REMOVED as store methods
  // Replaced by exported selector functions (see 1.3)
}
```

### 1.3 Exported Selectors (Target State)

```typescript
// store/store.ts — exported alongside useBasketStore

export const selectBasketTotal = (state: BasketState): number =>
  state.basket.reduce((sum, i) => sum + i.displayPrice * i.quantity, 0);

export const selectBasketCount = (state: BasketState): number =>
  state.basket.reduce((sum, i) => sum + i.quantity, 0);

export const selectIsCheckoutEnabled = (state: BasketState): boolean =>
  state.basket.length > 0 && state.basket.every((i) => i.quantity > 0 && i.stock > 0);

export const selectHasHydrated = (state: BasketState): boolean =>
  state._hasHydrated;
```

**Rationale:** Zustand best practice — derived values as selectors enable referential equality checks and prevent unnecessary re-renders. Methods like `getTotal()` force re-computation on every render.

### 1.4 Persist Configuration (Target State)

```typescript
{
  name: "basket-storage",
  version: 1,                    // NEW — enables migrations
  partialize: (state) => ({ basket: state.basket }),
  onRehydrateStorage: () => {
    return (state) => {
      if (state) {
        // Validate rehydrated data shape
        state.basket = state.basket.filter(
          (item) =>
            typeof item._id === "string" &&
            typeof item.name === "string" &&
            typeof item.displayPrice === "number" &&
            typeof item.stock === "number" &&
            typeof item.quantity === "number" &&
            typeof item.image === "string"
        );
        useBasketStore.setState({ _hasHydrated: true });
      }
    };
  },
  migrate: (persistedState: any, version: number) => {
    if (version === 0) {
      // Migration: price → displayPrice for users with old localStorage
      persistedState.basket = (persistedState.basket || []).map((item: any) => ({
        ...item,
        displayPrice: item.displayPrice ?? item.price ?? 0,
        slug: item.slug ?? "",
      }));
      delete persistedState.basket?.price;
    }
    return persistedState;
  },
}
```

**Rationale:**
- `version` + `migrate` handles schema evolution safely
- `onRehydrateStorage` validates shape and filters corrupted items instead of crashing
- `_hasHydrated` is set to `true` after rehydration completes — required for hydration guard

---

## 2. Store Mutation Specifications

### 2.1 `addItem(item: BasketItem)`

**Behavior:**
1. Validate required fields: `_id`, `name`, `displayPrice` (number), `stock` (number), `image` (string), `slug` (string)
2. If invalid → return silently (no throw)
3. If item with same `_id` already exists in basket:
   - Increment quantity by `item.quantity` (NOT always by 1)
   - Clamp to `Math.min(existing.quantity + item.quantity, existing.stock)`
   - Update `stock` to latest value from caller (stock may have changed since first add)
4. If item does not exist:
   - Clamp quantity: `Math.min(item.quantity, item.stock)`
   - If clamped quantity is 0 → return (out of stock)
   - Add to basket array

**Differs from current:** Current ignores `item.quantity` and always adds 1. Target respects the caller's quantity.

### 2.2 `removeItem(_id: string)`

**Behavior:**
1. Filter basket array to exclude item with matching `_id`
2. No validation needed — filtering a non-existent `_id` is a no-op

**Status:** Current implementation is correct. No changes needed.

### 2.3 `updateQuantity(_id: string, quantity: number)`

**Behavior:**
1. Find item by `_id`
2. Clamp: `Math.max(1, Math.min(quantity, item.stock))`
3. Update item with clamped quantity

**Status:** Current implementation is correct. No changes needed.

### 2.4 `clearBasket()`

**Behavior:** Set basket to `[]`.

**Status:** Current implementation is correct. No changes needed.

---

## 3. Component Architecture

### 3.1 Component Tree

```
BasketPage (Server Component)
├── SegmentTitle
└── Suspense > BasketClientWrapper ("use client")
    ├── [if !hydrated] → loading skeleton (not EmptyBasket)
    ├── [if hydrated && empty] → EmptyBasketContent
    └── [if hydrated && items] → grid layout
        ├── Basket (item list)
        │   └── BasketItem row (×N)
        │       ├── next/image (Sanity CDN loader)
        │       ├── Link to /product/[slug]
        │       ├── Price display
        │       └── BasketControls (quantity ±, remove)
        └── BasketSummary
            ├── Subtotal (via selectBasketTotal)
            ├── Item count (via selectBasketCount)
            ├── Shipping
            ├── Total
            ├── Checkout button (guarded by selectIsCheckoutEnabled)
            └── Continue Shopping link
```

### 3.2 `BasketClientWrapper` — Hydration Guard

```
State machine:
  !_hasHydrated → render loading skeleton
  _hasHydrated && basket.length === 0 → render EmptyBasketContent
  _hasHydrated && basket.length > 0 → render Basket + BasketSummary
```

**Specification:**
- Subscribe to `selectHasHydrated` selector
- While `!hasHydrated`: render a lightweight skeleton (NOT the empty state)
- After hydration: render based on basket contents
- This eliminates the flash of "Your basket is empty" for returning users

### 3.3 `BasketControls` — Unified Add/Quantity Component

**Current problem:** Two divergent add-to-cart patterns exist (`ProductInfo.tsx` for PDP, `BasketControls.tsx` for basket page). They construct different data shapes and have different UX.

**Target specification:**

`BasketControls` is used ONLY on the basket page for quantity adjustment and removal. It does NOT handle initial "add to cart" — that responsibility stays with `ProductInfo.tsx` on the PDP.

**BasketControls props:**
```typescript
interface BasketControlsProps {
  product: BasketItem;  // Full BasketItem from the store
}
```

**Behavior:**
- Reads item from store by `product._id` (current pattern — correct)
- If item not in store: should not render (this component is only used on basket page where items are already in basket)
- Displays: `[-] quantity [+] [×remove]`
- Decrement at quantity 1 → removes item
- Increment disabled when `quantity >= product.stock`
- Remove button always available

**Fixes required:**
- Remove the "add to cart" button path (lines 19-52) — `BasketControls` on the basket page should never encounter a product that's not in the basket
- Remove dead memo comparator (lines 106-108)
- Fix import path to use `@/app/(store)/basket/basket.types`
- Remove `e.preventDefault()` / `e.stopPropagation()` on wrapper div — this blocks event delegation unnecessarily on the basket page (it was needed when this component was inside clickable product cards, but on the basket page it's not inside a card link)

### 3.4 `ProductInfo.tsx` — PDP Add-to-Cart

**Responsibility:** Handles the initial "add item to basket" action from the Product Detail Page.

**Data transformation (Product → BasketItem):**
```typescript
const basketItem: BasketItem = {
  _id: product._id,
  name: product.name,
  slug: product.slug.current,
  displayPrice: product.displayPrice,
  stock: product.stock,
  quantity: quantity,          // from local useState
  image: product.image ? urlFor(product.image).width(200).height(200).url() : '',
};
addItem(basketItem);
```

**Fixes required:**
- Remove `brand` from the object passed to `addItem`
- Add `slug: product.slug.current`
- Ensure `image` is always included

### 3.5 `Basket.tsx` — Item List

**Fixes required:**
- Change `href={/product/${item._id}}` to `href={/product/${item.slug}}`
- Replace raw `<img>` with `next/image` using Sanity CDN loader (or at minimum, `<Image src={item.image} ... unoptimized />` since the URL is already a Sanity CDN URL with dimensions)
- Remove string concatenation in key: `key={item._id}` (not `key={item._id + "Basket page"}`)

### 3.6 `BasketSummary.tsx` — Summary Panel

**Fixes required:**
- Replace `getTotal()` method call with `useBasketStore(selectBasketTotal)` selector
- Replace manual `basket.reduce(...)` for item count with `useBasketStore(selectBasketCount)` selector
- Guard checkout button with `selectIsCheckoutEnabled`:
  ```
  const checkoutEnabled = useBasketStore(selectIsCheckoutEnabled);
  // Checkout link: disabled/aria-disabled when !checkoutEnabled
  ```
- Shipping: keep hardcoded for now (out of scope) but add `// TODO: dynamic shipping calculation` comment

### 3.7 `ActionBar.tsx` — Basket Count Badge

**Specification:**
- Subscribe to `selectBasketCount` selector
- Render count badge on `ShoppingBag` icon when count > 0
- Badge shows total quantity (not unique item count)
- Must handle hydration: don't show badge until `_hasHydrated` is true (prevents server/client mismatch)

---

## 4. Data Flow Specifications

### 4.1 Add to Cart Flow (PDP → Store → localStorage)

```
User clicks "Add to Cart" on PDP
  → ProductInfo.handleAddToCart()
    → Constructs BasketItem from Product data
    → Calls addItem(basketItem)
      → Store validates fields
      → If existing: increment quantity (clamped to stock)
      → If new: add with clamped quantity
      → Zustand persist middleware syncs to localStorage["basket-storage"]
  → ActionBar badge updates (via selectBasketCount subscription)
```

### 4.2 Basket Page Flow (localStorage → Store → UI)

```
User navigates to /basket
  → BasketPage (Server Component) renders shell
  → BasketClientWrapper mounts ("use client")
    → Zustand rehydrates from localStorage
    → _hasHydrated set to true
    → BasketClientWrapper re-renders with real data
      → If empty: EmptyBasketContent
      → If items: Basket + BasketSummary
```

### 4.3 Quantity Update Flow (UI → Store → localStorage)

```
User clicks [+] or [-] on BasketControls
  → handleIncrement/handleDecrement
    → updateQuantity(_id, newQuantity) or removeItem(_id)
      → Store updates basket array (immutable)
      → Persist middleware syncs to localStorage
  → Basket re-renders affected row
  → BasketSummary re-renders totals (via selectors)
  → ActionBar badge updates (via selectBasketCount)
```

### 4.4 Basket → Checkout Handoff Flow

```
User clicks "Checkout" (guarded by isCheckoutEnabled)
  → Navigates to /checkout/payment
  → checkout/payment/page.tsx reads basket from store
    → Maps to BasketCheckoutItem[]: { _id, quantity } only
    → Passes to EmbeddedCheckoutForm
      → POST /api/checkout with { publicBasket }
        → Server re-fetches products from Sanity (price, stock, stripePriceId)
        → Server validates stock availability
        → Server creates Stripe session (when implemented)
        → Returns client_secret
```

**Security principle:** Client NEVER sends prices to the server. Only `_id` + `quantity`. Server fetches authoritative prices from Sanity. This prevents price manipulation.

### 4.5 Order Success → Clear Basket Flow

```
Stripe checkout completes successfully
  → Redirect to /checkout/return
  → OrderSuccessClient mounts
    → clearBasket() called in useEffect
    → localStorage cleared
    → ActionBar badge disappears
```

---

## 5. Robustness Specifications

### 5.1 localStorage Corruption Recovery

**Scenario:** User has stale/corrupted data in `basket-storage`.

**Specification:**
- `onRehydrateStorage` validates each item's field types
- Invalid items are filtered out silently (not thrown)
- `migrate` function handles version 0 → 1 transition (`price` → `displayPrice`)
- If entire basket is invalid → empty basket (no crash)

### 5.2 Stock Staleness

**Scenario:** User adds item with stock=5, keeps tab open overnight, stock drops to 2.

**Specification (client-side):**
- Basket displays the stock value at time of add
- `updateQuantity` clamps to stored stock value
- **No client-side stock refresh** — this is acceptable because server re-validates at checkout
- Server-side stock validation in `/api/checkout` is the authoritative gate

**Future enhancement (out of current scope):** Periodic stock refresh via server action when basket page is visited.

### 5.3 Concurrent Tab Behavior

**Scenario:** User has basket open in two tabs.

**Specification:**
- Zustand persist does NOT sync across tabs by default
- This is acceptable for MVP — each tab operates on its own in-memory state
- Both tabs write to the same localStorage key — last write wins on next page load

**Future enhancement (out of current scope):** Add `storage` event listener for cross-tab sync.

### 5.4 Max Basket Size

**Specification:**
- No hard limit on number of unique items
- Per-item quantity clamped to `item.stock`
- localStorage has a ~5MB limit — with the lean `BasketItem` shape, this supports thousands of items (not a realistic concern)

### 5.5 Empty/Zero States

| Scenario | Expected Behavior |
|----------|-------------------|
| Basket empty, hydrated | EmptyBasketContent with "Browse Products" link |
| Basket empty, not yet hydrated | Loading skeleton (NOT empty state) |
| Item with stock=0 added | `addItem` rejects (quantity clamped to 0 → skipped) |
| Item stock drops to 0 after add | Item stays in basket but checkout is blocked by `isCheckoutEnabled` |
| All items removed | Transition to EmptyBasketContent |

---

## 6. File-by-File Change Specifications

### 6.1 `app/(store)/basket/basket.types.ts`
- Add `slug: string` field to `BasketItem`

### 6.2 `store/store.ts`
- Fix `addItem`: respect `item.quantity` parameter, update existing item's `stock` value
- Fix `_hasHydrated`: set to `true` in `onRehydrateStorage` callback
- Add `version: 1` and `migrate` function to persist config
- Add rehydration validation (filter invalid items)
- Remove `console.log` from rehydration
- Remove `getTotal` and `isCheckoutEnabled` as store methods
- Export `selectBasketTotal`, `selectBasketCount`, `selectIsCheckoutEnabled`, `selectHasHydrated` as selector functions

### 6.3 `app/(store)/basket/BasketClientWrapper.tsx`
- Add hydration guard using `selectHasHydrated`
- Render skeleton while `!hasHydrated` (not EmptyBasketContent)

### 6.4 `app/(store)/basket/Basket.tsx`
- Change product link from `_id` to `slug`
- Replace `<img>` with `next/image`
- Fix React key to `item._id` (remove string concatenation)

### 6.5 `app/(store)/basket/BasketSummary.tsx`
- Use `selectBasketTotal` and `selectBasketCount` selectors
- Add checkout guard with `selectIsCheckoutEnabled`

### 6.6 `app/components/features/basket/BasketControls.tsx`
- Fix import path: `@/app/(store)/basket/basket.types`
- Remove "add to cart" button path (component only used on basket page)
- Remove dead memo comparator (lines 106-108)
- Remove wrapper div `e.preventDefault()`/`e.stopPropagation()` (not needed on basket page)
- Optionally: wrap with `React.memo` with proper comparator if keeping it

### 6.7 `app/components/features/products/ProductInfo.tsx`
- Add `slug: product.slug.current` to basketItem
- Remove `brand` from basketItem
- Ensure `image` is always included

### 6.8 `app/components/layout/navigation/ActionBar.tsx`
- Subscribe to `selectBasketCount` and `selectHasHydrated`
- Render badge on ShoppingBag icon when hydrated and count > 0

### 6.9 `app/hooks/useInitializeCheckoutCart.ts`
- Fix `item.price` → `item.displayPrice`
- Or: evaluate whether this hook is even needed (checkout/payment/page.tsx already maps basket directly)

### 6.10 `app/(store)/basket/EmptyBasketContent.tsx`
- No changes needed

### 6.11 `app/hooks/useClearBasketOnMount.ts`
- Evaluate: is this hook used anywhere other than OrderSuccessClient? If not, consolidate into OrderSuccessClient and remove hook

---

## 7. Test Specifications

### 7.1 Testing Strategy

**Framework:** Vitest (per `vitest.config.mts`)
**Approach:** Store logic unit tests + integration test for data flow. No Playwright for basket internals — use Playwright only for one end-to-end smoke test.

**Test pyramid:**
1. **Unit tests (Vitest):** Store mutations, selectors, rehydration validation
2. **Integration test (Vitest):** ProductInfo data → store → BasketSummary selectors → checkout handoff
3. **E2E smoke test (Playwright):** Add to cart on PDP → navigate to basket → verify item present → click checkout

### 7.2 Store Unit Tests

**File:** `tests/basket/store.unit.test.ts`

```
describe("addItem")
  ✓ adds new item with correct quantity
  ✓ respects caller quantity (not always 1)
  ✓ clamps quantity to stock
  ✓ rejects item with stock=0
  ✓ rejects item with missing _id
  ✓ rejects item with missing name
  ✓ rejects item with non-number displayPrice
  ✓ increments existing item quantity by requested amount
  ✓ clamps existing item to stock ceiling
  ✓ updates existing item stock value from caller

describe("removeItem")
  ✓ removes item by _id
  ✓ no-op for non-existent _id
  ✓ basket becomes empty after removing last item

describe("updateQuantity")
  ✓ updates quantity for existing item
  ✓ clamps to minimum of 1
  ✓ clamps to maximum of stock
  ✓ no-op for non-existent _id

describe("clearBasket")
  ✓ empties basket array

describe("selectBasketTotal")
  ✓ returns 0 for empty basket
  ✓ calculates sum of displayPrice × quantity
  ✓ handles multiple items

describe("selectBasketCount")
  ✓ returns 0 for empty basket
  ✓ sums all item quantities

describe("selectIsCheckoutEnabled")
  ✓ returns false for empty basket
  ✓ returns true for valid basket
  ✓ returns false when any item has stock=0
  ✓ returns false when any item has quantity=0
```

### 7.3 Rehydration Tests

**File:** `tests/basket/rehydration.unit.test.ts`

```
describe("localStorage rehydration")
  ✓ rehydrates valid basket data
  ✓ filters out items with missing _id
  ✓ filters out items with non-number displayPrice
  ✓ filters out items with missing image
  ✓ sets _hasHydrated to true after rehydration
  ✓ migrates version 0 (price → displayPrice)
  ✓ handles completely corrupted localStorage gracefully
  ✓ handles empty localStorage
```

### 7.4 Data Flow Integration Test

**File:** `tests/basket/data-flow.integration.test.ts`

```
describe("PDP → Store → Checkout data flow")
  ✓ Product data maps to BasketItem correctly (all fields present)
  ✓ BasketItem contains slug (not just _id)
  ✓ BasketItem contains pre-resolved image URL
  ✓ BasketItem does NOT contain brand
  ✓ selectBasketTotal computes correctly after addItem
  ✓ Checkout handoff maps to { _id, quantity } only (no price sent)
  ✓ Adding same item twice increments quantity
```

### 7.5 E2E Smoke Test

**File:** `tests/basket/basket-e2e.spec.ts`

```
describe("Basket E2E smoke")
  ✓ Add product from PDP → navigate to /basket → item visible with correct name and price
  ✓ Increment quantity → total updates
  ✓ Remove item → empty basket state shown
  ✓ Refresh page → basket persists (localStorage)
  ✓ ActionBar shows badge count after add
```

### 7.6 Tests NOT Needed (Scoped Out)

- Visual regression tests (styling out of scope)
- Checkout payment flow tests (payments out of scope)
- Cross-browser tests (not at this stage)
- Mobile vs desktop responsive layout tests (layout out of scope)
- Shipping calculation tests (hardcoded value, trivial)

---

## 8. Implementation Sequence

**Recommended order (dependency-aware):**

| Phase | Files | Depends On |
|-------|-------|------------|
| 1. Types | `basket.types.ts` | — |
| 2. Store | `store/store.ts` (mutations, selectors, hydration, migration) | Phase 1 |
| 3. Store tests | `tests/basket/store.unit.test.ts`, `rehydration.unit.test.ts` | Phase 2 |
| 4. Components | `BasketClientWrapper`, `Basket`, `BasketSummary`, `BasketControls`, `ProductInfo`, `ActionBar` | Phase 2 |
| 5. Integration test | `tests/basket/data-flow.integration.test.ts` | Phase 2 + 4 |
| 6. Checkout handoff fix | `useInitializeCheckoutCart.ts` | Phase 1 |
| 7. E2E smoke test | `tests/basket/basket-e2e.spec.ts` | Phase 4 |

---

## 9. Scope Boundaries

### In Scope
- BasketItem data shape and type safety
- Zustand store mutations, selectors, hydration, persistence, migration
- Component data flow (Product → BasketItem → Store → UI → Checkout handoff)
- Hydration guard (prevent flash)
- ActionBar basket count badge (data subscription only)
- Product link correctness (slug routing)
- Image tag correctness (next/image)
- Store unit tests, rehydration tests, data flow integration test, E2E smoke

### Out of Scope
- Basket page layout, styling, responsive design, animations
- Shipping calculation logic
- Stripe integration / payment flow
- Checkout page internals
- Stock refresh / real-time stock sync
- Cross-tab localStorage sync
- Authentication / user-specific baskets
- Order management post-checkout
- Basket item grouping / categorization UI
