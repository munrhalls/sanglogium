# Basket Functionality — Professional Audit

**Date:** 2026-04-02
**Scope:** Structure, data pass, state management, user flow, robustness
**Out of scope:** Styling/layout, interactivity polish, payments/checkout internals

---

## 1. Executive Summary

The basket is **architecturally sound in skeleton** (Zustand + persist + partialize is the right pattern) but **critically broken in implementation**. There are 7 bugs that would cause runtime failures or silent data loss, 4 type safety violations, and several disconnections from the current codebase's data contracts.

**Verdict:** Not production-ready. Requires targeted fixes before any checkout flow can function.

---

## 2. Files Audited

| File | Role | Status |
|------|------|--------|
| `store/store.ts` | Zustand store | ⚠️ Bugs + missing hydration |
| `app/(store)/basket/basket.types.ts` | BasketItem interface | ❌ Incomplete |
| `app/(store)/basket/page.tsx` | Server Component page | ✅ Correct pattern |
| `app/(store)/basket/Basket.tsx` | Item list rendering | ⚠️ Wrong link pattern, raw img |
| `app/(store)/basket/BasketSummary.tsx` | Summary/totals | ⚠️ Hardcoded shipping, no checkout guard |
| `app/(store)/basket/BasketClientWrapper.tsx` | Hydration wrapper | ❌ Hydration flash bug |
| `app/(store)/basket/EmptyBasketContent.tsx` | Empty state | ✅ Clean |
| `app/components/features/basket/BasketControls.tsx` | Add/remove controls | ❌ Dead code, missing image, wrong import |
| `app/hooks/useInitializeCheckoutCart.ts` | Checkout bridge | ❌ References non-existent field |
| `app/hooks/useClearBasketOnMount.ts` | Post-order clear | ✅ Functional |
| `app/components/features/products/ProductInfo.tsx` | PDP add-to-cart | ⚠️ Passes extra fields, quantity ignored |
| `app/components/layout/navigation/ActionBar.tsx` | Mobile nav basket link | ⚠️ No item count badge |
| `app/api/checkout/route.ts` | Checkout API | ❌ No return on success, Stripe commented out |
| `app/(store)/checkout/payment/page.tsx` | Checkout page | ✅ Correct basket→checkout mapping |

---

## 3. Critical Bugs

### BUG-1: `addItem` ignores user-selected quantity
**File:** `store/store.ts:43`
**Severity:** Critical

```typescript
// CURRENT: Always sets quantity to 1, ignoring item.quantity
const initialQuantity = Math.min(1, item.stock);
```

`ProductInfo.tsx` has a quantity selector (`useState(1)`) that the user can increment. The selected quantity is passed to `addItem({ ...item, quantity: quantity })`. But the store **discards it** and always sets `quantity: 1`. When the item already exists, it increments by 1 instead of by the requested amount.

**Impact:** User selects "Add 3 to cart" → only 1 gets added.

---

### BUG-2: `useInitializeCheckoutCart` references `item.price` — field doesn't exist
**File:** `app/hooks/useInitializeCheckoutCart.ts:12`
**Severity:** Critical

```typescript
price: item.price, // ❌ BasketItem has `displayPrice`, not `price`
```

The `BasketItem` interface defines `displayPrice`. This maps `undefined` to checkout cart items. The checkout flow receives items with no price.

**Impact:** Checkout receives `price: undefined` for every item.

---

### BUG-3: Dead code — orphaned memo comparator
**File:** `app/components/features/basket/BasketControls.tsx:106-108`
**Severity:** Medium (code smell, no runtime crash)

```typescript
(prevProps, nextProps) => {
  return prevProps.product._id === nextProps.product._id;
};
```

This arrow function is a floating expression — it was intended as a `React.memo` comparator but is not attached to `React.memo()`. It executes on module load and the return value is discarded. The component re-renders on every basket state change without memoization.

---

### BUG-4: `BasketControls` omits `image` field when adding to basket
**File:** `app/components/features/basket/BasketControls.tsx:20-26`
**Severity:** High

```typescript
const basketItem = {
  _id: product._id,
  stock: product.stock,
  name: product.name,
  displayPrice: product.displayPrice,
  quantity: 1,
  // ❌ `image` is missing — BasketItem requires it
};
```

When `BasketControls` adds an item (the "not yet in basket" path), `image` is omitted. The `Basket.tsx` component renders `<img src={item.image}>` which will be `undefined`, producing a broken image.

---

### BUG-5: `_hasHydrated` is never set to `true`
**File:** `store/store.ts:20, 88-92`
**Severity:** High

```typescript
_hasHydrated: false, // initialized

onRehydrateStorage: () => {
  return () => {
    console.log("✅ Rehydration complete!");
    // ❌ Never calls set({ _hasHydrated: true })
  };
},
```

Any component that checks `_hasHydrated` will always see `false`. Currently no component uses it, but the `BasketClientWrapper` **should** use it to prevent the hydration flash (BUG-6).

---

### BUG-6: Hydration flash — empty basket shown before rehydration
**File:** `app/(store)/basket/BasketClientWrapper.tsx:10`
**Severity:** High

```typescript
if (basket?.length === 0) {
  return <EmptyBasketContent />;
}
```

On server render and initial client render, `basket` is `[]` (Zustand default). The persist middleware rehydrates from localStorage **after** the first render. Users with items in their basket see "Your basket is empty" flash before the real items appear.

**Root cause:** No hydration guard. `_hasHydrated` exists but is never set (BUG-5).

---

### BUG-7: Checkout API route has no success return
**File:** `app/api/checkout/route.ts:123-152`
**Severity:** Critical (checkout non-functional)

```typescript
await sanityTransaction.commit();
// Lines 125-141: Stripe session creation is ENTIRELY COMMENTED OUT
// No return statement after transaction commit
// Falls through to catch block or returns undefined
```

The API endpoint decrements stock in Sanity but never creates a Stripe session and never returns a `client_secret`. The `EmbeddedCheckoutForm.tsx` calls `fetchClientSecret()` which will get `undefined`, crashing the Stripe embedded checkout.

**Note:** This is partially out of scope (checkout internals) but the basket's data handoff to checkout is in scope, and the handoff target is broken.

---

## 4. Type Safety Violations

### TYPE-1: `BasketItem` missing `slug` field
`Basket.tsx:35` links to `/product/${item._id}`. Product routes in Next.js App Router typically use slug-based routing. The `BasketItem` interface has no `slug` field, forcing the use of `_id` in URLs.

### TYPE-2: `ProductInfo.tsx` passes `brand` to `addItem` — not in `BasketItem`
```typescript
brand: product.brand ? { _id: product.brand._id, name: product.brand.name } : null,
```
`BasketItem` doesn't declare `brand`. The object spread in the store will persist `brand` to localStorage (wasteful), and TypeScript should flag this with strict checking.

### TYPE-3: `BasketControls` wrong import path
```typescript
import { BasketItem } from "../basket/basket.types";
```
Resolves to `app/components/features/basket/basket.types.ts` — this file likely doesn't exist. The real file is `app/(store)/basket/basket.types.ts`. Should use `@/app/(store)/basket/basket.types`.

### TYPE-4: No runtime validation on localStorage rehydration
Zustand persist deserializes whatever is in `basket-storage`. If the stored shape doesn't match `BasketItem[]` (e.g., after a schema migration where `price` became `displayPrice`), the app will crash when rendering `item.displayPrice.toFixed(2)`.

---

## 5. Structural & Architectural Issues

### ARCH-1: Two divergent "add to cart" patterns
- **`ProductInfo.tsx`** (PDP): Has quantity selector, passes full product data with image URL generation via `urlFor()`, passes `brand` object
- **`BasketControls.tsx`** (basket page + cards): Has increment/decrement/remove, constructs a partial `basketItem` without `image`

These two components have completely different data shapes and behaviors for the same action. There is no shared "add to cart" data transformation function.

### ARCH-2: `isCheckoutEnabled()` is never called
The store exposes `isCheckoutEnabled()` which validates all items have `quantity > 0 && stock > 0`. But `BasketSummary.tsx` renders the "Checkout" link unconditionally — no disabled state, no guard.

### ARCH-3: No basket count in navigation
`ActionBar.tsx` renders a static `ShoppingBag` icon with no badge/count. The user has no visual feedback that items were added without navigating to `/basket`.

### ARCH-4: Product link uses `_id` instead of `slug`
`Basket.tsx:35`: `href={/product/${item._id}}` — this likely 404s because product pages are routed by slug, not by Sanity document ID.

### ARCH-5: Raw `<img>` instead of `next/image`
`Basket.tsx:29-32` uses a raw `<img>` tag. Per codebase constraints, images should use `next/image` with Sanity CDN loader.

### ARCH-6: Console.log in production
`store/store.ts:90`: `console.log("✅ Rehydration complete!")` ships to production.

### ARCH-7: Hardcoded shipping
`BasketSummary.tsx:11`: `const shipping = 15.99;` — not configurable, not fetched from any source.

### ARCH-8: Duplicate clear-basket pattern
`useClearBasketOnMount.ts` and `OrderSuccessClient.tsx` are functionally identical — both call `clearBasket()` on mount via `useEffect`. One is a hook, the other a component wrapper. Only one pattern is needed.

---

## 6. Archived Tests Assessment

**File:** `app/(store)/basket/__tests__/archived_BasketPage.tsx` (698 lines, entirely commented out)

### Key observations:
- Tests use **Jest + React Testing Library** — but the codebase uses **Vitest** (per `vitest.config.mts`)
- Tests reference `price` field instead of `displayPrice` — stale after field rename
- Tests mock `useBasketStore` at module level — correct Zustand testing pattern
- Tests cover: empty state, populated state, quantity interactions, removal, totals, navigation, persistence, error handling, accessibility
- **Coverage was comprehensive** but is now 100% dead code
- Tests render `<BasketPage />` directly — but `BasketPage` is a Server Component that renders `<BasketClientWrapper />`, which is the actual client boundary

---

## 7. Integration Point Analysis

### Product Detail Page → Basket (via `ProductInfo.tsx`)
| Aspect | Status |
|--------|--------|
| Data mapping (Product → BasketItem) | ⚠️ Passes `brand` (extra), passes `quantity` (ignored by store) |
| Image URL generation | ✅ Uses `urlFor()` correctly |
| Stock validation | ✅ Checks `product.stock > 0` before add |
| User feedback on add | ❌ No visual confirmation (toast, animation, count update) |

### Navigation → Basket (via `ActionBar.tsx`)
| Aspect | Status |
|--------|--------|
| Link to basket page | ✅ `/basket` |
| Item count badge | ❌ Missing |
| Desktop navigation | ❓ Not audited (only mobile ActionBar found) |

### Basket → Checkout (via `checkout/payment/page.tsx`)
| Aspect | Status |
|--------|--------|
| Data minimization (only _id + quantity sent) | ✅ Correct security pattern |
| Price field mapping | ❌ `useInitializeCheckoutCart` maps `item.price` (undefined) |
| Server-side stock re-validation | ✅ `route.ts` re-fetches from Sanity |
| Stripe session creation | ❌ Commented out — checkout is non-functional |

### Basket → Order Success (via `OrderSuccessClient.tsx`)
| Aspect | Status |
|--------|--------|
| Clear basket after successful order | ✅ Functional |
| Guard against premature clearing | ❌ No verification that payment actually succeeded before clearing |

---

## 8. Zustand Store Best Practices Audit

| Best Practice | Status | Notes |
|---------------|--------|-------|
| Selective subscriptions via selectors | ✅ | All consumers use `(s) => s.field` |
| Persist middleware for localStorage | ✅ | Correctly configured |
| Partialize to exclude transient state | ✅ | Excludes `_hasHydrated` |
| Hydration state tracking | ❌ | `_hasHydrated` never set to `true` |
| Input validation on mutations | ⚠️ | `addItem` validates, `removeItem`/`updateQuantity` don't |
| Immutable updates | ✅ | Uses spread + map/filter |
| Derived state as getters | ⚠️ | `getTotal()`/`isCheckoutEnabled()` are methods, not selectors — causes re-renders |
| Type safety on rehydration | ❌ | No migration/validation on deserialized data |
| No side effects in store | ✅ | Pure state management |
| Store modularity | ✅ | Single-purpose basket store |

---

## 9. Priority Matrix

| # | Issue | Severity | Effort | Fix |
|---|-------|----------|--------|-----|
| BUG-1 | `addItem` ignores quantity | Critical | Low | Respect `item.quantity` parameter |
| BUG-2 | `item.price` → `item.displayPrice` | Critical | Trivial | One-line rename |
| BUG-5+6 | Hydration flash | High | Low | Set `_hasHydrated`, add guard |
| BUG-4 | Missing `image` in BasketControls | High | Low | Include `image` in basketItem |
| TYPE-1 | Missing `slug` in BasketItem | High | Low | Add field, fix link |
| TYPE-3 | Wrong import path | Medium | Trivial | Fix to alias path |
| BUG-3 | Dead memo comparator | Medium | Trivial | Attach to React.memo or remove |
| BUG-7 | Checkout API broken | Critical | Out of scope | Stripe integration needed |
| ARCH-3 | No basket count badge | High | Medium | Subscribe to store in ActionBar |
| ARCH-2 | Checkout guard unused | Medium | Low | Wire `isCheckoutEnabled` |
| TYPE-4 | No rehydration validation | Medium | Medium | Add migration/validation |
| ARCH-4 | Wrong product link | High | Low | Use slug instead of _id |
| ARCH-5 | Raw img tag | Medium | Low | Use next/image + Sanity loader |

---

## 10. Conclusion

The basket has a correct architectural skeleton (Zustand + persist, Server Component page wrapping client boundary, separate store from components). However, the implementation has drifted significantly from the current codebase state — field renames (`price` → `displayPrice`), reference migrations (`brand` string → object), and routing changes (`_id` → `slug`) were not propagated to the basket.

The most dangerous bugs are silent: quantity ignoring, undefined price handoff, and hydration flash. These won't crash visibly but will corrupt the user experience and checkout data.

**Recommendation:** Fix bugs in priority order above, then proceed to specification implementation. Do not attempt checkout integration until basket data integrity is verified end-to-end.
