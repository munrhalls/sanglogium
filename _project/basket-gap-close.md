# Basket Slice — Gap-Close Report

## Executive Summary

| # | Gap | Severity | Files | Effort |
|---|---|---|---|---|
| 1 | EmptyBasket CTA is a dead button | **High** | `EmptyBasket.tsx` | 1 line |
| 2 | Stock adjustment mutates persistent store | **High** | `BasketManager.tsx`, `BasketControls.tsx`, `BasketItem.tsx` | ~15 lines |
| 3 | Items without parcel data excluded from shipping calc | **Medium** | `BasketManager.tsx` | ~3 lines |
| 4 | Currency displayed as USD instead of PLN | **High** | `BasketItem.tsx`, `BasketSummary.tsx`, `Price.tsx` | ~8 lines |
| 5 | Checkout enabled when all items out-of-stock | **Medium** | `BasketManager.tsx`, `BasketSummary.tsx`, `CheckoutButton.tsx` | ~5 lines |
| 6 | Shipping label not marked as estimate | **Low** | `BasketSummary.tsx` | 1 word |

---

## Gap 1 — EmptyBasket CTA Is a Dead Button

### Should-Be
> "The empty state CTA must be a navigable link — not a non-functional button."

### Actual
`EmptyBasket.tsx` line 13-19 renders a `<button type="button">` with **no `onClick`, no `href`, and no router navigation**. Clicking it does nothing.

### Gap-Close
Replace `<button>` with `next/link` to `/` (the product catalogue root). `Link` is already imported elsewhere in the basket slice (`BasketSummary.tsx`), so no new dependencies.

```tsx
import Link from "next/link";
// ...
<Link href="/" className="btn-primary flex items-center gap-2 py-3 px-6">
  <ArrowLeftIcon size={16} />
  Browse Headphones
</Link>
```

**Coherence:** Link works without JS (progressive enhancement), matches existing patterns, and correctly navigates to the catalogue.

---

## Gap 2 — Stock Adjustment Mutates the Persistent Store

### Should-Be
> "Stock adjustment is in-memory only. The store retains the original quantity. If the user refreshes, enrichment re-runs and re-applies adjustment if still needed."

### Actual
`BasketManager.tsx` lines 151-161: a `useEffect` calls `setQuantity(item.productId, item.availableStock)` on the Zustand store. This writes to `localStorage`, mutating persistent state.

Consequences:
- User adds 5 of item X to basket.
- Stock drops to 2. Page loads, useEffect fires, store quantity silently becomes 2.
- User refreshes. Store now has 2 (not 5). The original intent is lost.
- If stock later recovers, the user never gets their original quantity back.

### Gap-Close
**Three coordinated changes:**

**A. `BasketManager.tsx`** — cap quantity during enrichment, remove the store-mutating useEffect.

In the `enrichedItems` useMemo (lines 93-119):
```ts
// Add originalQuantity before capping
return {
  productId: item.productId,
  quantity: Math.min(item.quantity, availableStock),  // <-- cap here
  originalQuantity: item.quantity,                     // <-- preserve original
  name: product.name,
  // ... rest
};
```

Remove the entire `useEffect` at lines 151-161.

**B. `BasketControls.tsx`** — accept an optional `quantity` prop that overrides the store read when on the basket page.

Add `quantity?: number` to props. When provided, use it instead of `basketItem?.quantity`.

**C. `BasketItem.tsx`** — pass the already-capped `quantity` prop to `BasketControls`.

```tsx
<BasketControls
  productId={productId}
  name={name}
  isBasketPage={true}
  maxQuantity={availableStock}
  quantity={quantity}  // <-- capped quantity from enrichment
/>
```

**Coherence:**
- `itemCount` and `subtotal` already derive from `enrichedItems`, so totals automatically reflect capped quantities.
- `originalQuantity` strikethrough display (already implemented) continues to work — it now comes from the enrichment layer instead of the `stockAdjustments` Map.
- The `stockAdjustments` Map state in BasketManager can be removed (it existed only to support the now-removed useEffect).
- On product pages, `BasketControls` has no `quantity` prop, so it continues reading from the store normally.

---

## Gap 3 — Items Without Parcel Data Are Excluded from Shipping Calculation

### Should-Be
> "Items with no parcel data use a default parcel (500g, 20×15×25 cm)."

### Actual
`BasketManager.tsx` line 136: `.filter((item) => item.parcel)` strips items without parcel data. These items contribute zero weight and zero volume to shipping estimation, making the estimate too low.

### Gap-Close
In the `parcelData` computation (lines 135-140), replace the filter with a fallback:

```ts
const parcel = item.parcel ?? {
  weight: 500,
  length: 20,
  width: 15,
  height: 25,
  distance_unit: 'cm',
  mass_unit: 'g',
};
return Array(item.quantity).fill(parcel);
```

**Coherence:** The shipping API (`/api/basket/shipping-rates`) expects weight in grams and dimensions in cm, then converts weight to kg internally (`/1000`). The default values (500g, 20×15×25cm) align with this convention. The `flatMap` already duplicates parcels by quantity, so default parcels are correctly multiplied.

---

## Gap 4 — Currency Displayed as USD Instead of PLN

### Should-Be
> "Currency: PLN throughout. Display: formatted via `Intl.NumberFormat('en-US', { style: 'currency', currency: 'PLN' })`."

### Actual
`Price.tsx` defaults to `currency = 'USD'`. All basket `Price` calls omit the `currency` prop:
- `BasketItem.tsx` (unit price, line total) — 2 calls
- `BasketSummary.tsx` (subtotal, shipping, tax, total) — 4 calls

Result: every price displays as `$` instead of `zł`.

### Gap-Close
**Option A (scoped, preferred):** Pass `currency="PLN"` explicitly in all basket `Price` calls.

**Option B (global):** Change `Price.tsx` default to `'PLN'`. Risk: affects non-basket pages if the store is not exclusively PLN. Since the spec says "PLN throughout" for the basket slice, and the basket is PL-only, Option A is safer and more explicit.

Files to change:
- `BasketItem.tsx` — add `currency="PLN"` to both `<Price />` calls
- `BasketSummary.tsx` — add `currency="PLN"` to all four `<Price />` calls

**Coherence:** PLN is the only currency supported for the Polish B2C flow per spec. Explicit props make the intent visible at call sites. No risk to non-basket pages.

---

## Gap 5 — Checkout Button Enabled When All Items Are Out-of-Stock

### Should-Be
> "Checkout button must be disabled if: basket is empty OR enrichment data has not yet loaded OR all items are out-of-stock (availableStock === 0 for every item)."

### Actual
`CheckoutButton.tsx` line 33:
```ts
const disabled = !basketData || basketData.length === 0 || isProcessing;
```

No check for stock availability. A basket where every item has `availableStock === 0` still shows an enabled "Checkout" button.

### Gap-Close
**Two coordinated changes:**

**A. `BasketManager.tsx`** — include `availableStock` in `checkoutData`:
```ts
const checkoutItems = enrichedItems.map((item) => ({
  productId: item.productId,
  quantity: item.quantity,
  price_data: item.price_data,
  parcel: item.parcel,
  availableStock: item.availableStock,  // <-- add
}));
```

**B. `CheckoutButton.tsx`** — add the out-of-stock guard:
```ts
const allOutOfStock = basketData?.every(item => item.availableStock === 0) ?? false;
const disabled = !basketData || basketData.length === 0 || allOutOfStock || isProcessing;
```

**Coherence:**
- Mixed baskets (some in-stock, some out-of-stock) remain checkoutable — only `allOutOfStock` blocks.
- The guard runs client-side, so it reacts immediately when SWR returns updated stock data.
- No server-side changes needed; the payment page re-verifies stock independently per spec.

---

## Gap 6 — Shipping Label Not Marked as Estimate

### Should-Be
> "The basket page displays it as an estimate only — clearly marked as estimate."

### Actual
`BasketSummary.tsx` line 31 shows a plain label: **"Shipping"**

### Gap-Close
Change the label to **"Shipping (estimated)"** or **"Estimated shipping"**.

```tsx
<div className="type-section-caption text-text-secondary">Shipping (estimated)</div>
```

**Coherence:** Simple string change. Aligns with the spec principle that the committed shipping rate is selected later on the shipping page.

---

## /checks — Coherence Verification

### 1. Cross-Gap Interference
- **Gap 2 + Gap 5:** Gap 2 changes how quantity is passed to BasketControls; Gap 5 adds `availableStock` to checkoutData. These are independent — Gap 5's `availableStock` comes from enrichment regardless of whether the store is mutated.
- **Gap 2 + Gap 3:** Default parcels are applied to enriched items. If Gap 2 caps quantities, the capped quantity determines how many default parcel copies are created in `flatMap`. Correct.
- **Gap 4 + all others:** Currency is display-only. No logic dependencies.
- **No circular or conflicting fixes identified.**

### 2. System Alignment
- **4-Layer Architecture:** All changes stay within Layer 2 (Presentation/Capture). No server actions, no API routes, no session mutations. Correct.
- **iron-session contract:** `initCheckoutSession` still receives only `{ productId, quantity }[]`. No change. The `availableStock` added to `checkoutData` is consumed client-side only (CheckoutButton disabled state). Correct.
- **SWR key stability:** `trackedIds` logic untouched. Correct.
- **Zustand store contract:** Actions (`addProduct`, `removeProduct`, etc.) untouched. Only the store-mutation useEffect is removed. Correct.

### 3. Edge Cases
- **Empty basket:** Gap 1 fix ensures CTA works. Empty state renders before any enrichment, so Gaps 2-5 don't apply.
- **Single item, out-of-stock:** Gap 2 caps display qty to 0. Gap 5 disables checkout. User sees item with 0 qty and strikethrough, cannot checkout. Correct.
- **All items removed during session:** `basket.length === 0` triggers EmptyBasket. Correct.
- **Shipping API returns `null`:** `shippingCost` stays `null`, "Calculating..." persists. No change. Matches spec.

### 4. Backward Compatibility
- `BasketControls` optional `quantity` prop: product pages omit it → no behavior change.
- `Price` explicit `currency` prop: no behavior change for callers that already pass it.
- `CheckoutButton` `availableStock` field: optional in the prop type, or add it to the interface. Existing callers that don't pass it will have `undefined` → `allOutOfStock` evaluates to `false` → button remains enabled. Safe default.

### 5. Spec Fidelity
All 5 primary gaps map directly to spec clauses. No invented requirements. No scope creep.

---

## Implementation Order (Recommended)

1. **Gap 1** (EmptyBasket) — trivial, no dependencies
2. **Gap 4** (Currency PLN) — trivial, no dependencies, affects every price display
3. **Gap 6** (Shipping label) — trivial, no dependencies
4. **Gap 3** (Default parcel) — small, isolated to BasketManager
5. **Gap 2** (Stock adjustment in-memory) — medium, touches 3 files but changes are clean
6. **Gap 5** (Checkout out-of-stock guard) — medium, builds on Gap 2's enrichment data

Gaps 1, 4, 6 can be done in any order or parallel. Gaps 2 and 5 should be sequential (2 before 5 is cleaner, though not strictly required).
