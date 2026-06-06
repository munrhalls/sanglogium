# Shipping Slice — Gap-Close Report

**Date:** 2026-06-06  
**Base:** Should-Be Spec (provided intelligence) vs. Actual Code (100% traced)  
**Scope:** Data layer + functionality layer, happy path, PL only

---

## Gaps Found

| # | Gap | File(s) | Severity | Recommendation |
|---|-----|---------|----------|----------------|
| 1 | `amount` in data layer is zloty (float), not cents (integer) | `lib/shipping/allekurier-rates.ts:226`, `app/checkout/shipping/ShippingPageClient.tsx:62` | Medium | **Update spec** to match working code. Conversion to cents happens at action boundary. |
| 2 | Funnel guard order: address checked before basket | `app/checkout/shipping/page.tsx:13-19` | Low | **No action.** Functionally identical; both redirect correctly. Optional reorder for spec alignment. |
| 3 | Basket page excludes items without parcel data (no default fallback) | `app/components/features/basket/BasketManager.tsx:135-140` | **High** | **Fix basket page.** Use `DEFAULT_PARCEL` for items missing parcel data, matching shipping page. |
| 4 | Single-parcel `width` set to `maxLength` instead of `maxWidth` | `app/api/basket/shipping-rates/route.ts:86` | **High** | **Fix code.** `width: maxWidth`. |
| 5 | Test file covers orphaned API route (dead code) | `app/checkout/shipping/shipping-rates.test.ts` | Low | **Remove or relocate.** Tests `/api/shipping/rates` which is not in active flow. |

---

## Gap 1 — `amount` Units (zloty vs. cents)

**Spec says:** `amount: integer` — "Gross cost in PLN cents (`Order.gross * 100`)"

**Actual:** `transformAlleKurierToShippingOption` returns `amount: order.gross` (e.g., `12.76`). `ShippingPageClient.tsx` multiplies by 100 before calling `saveShippingAction`:

```ts
// ShippingPageClient.tsx:62
await saveShippingAction(
  selectedOption.rateId,
  Math.round(selectedOption.amount * 100),  // conversion happens HERE
  ...
);
```

**End-to-end outcome is correct:** `shippingCost` in session is cents. The discrepancy is WHERE the conversion happens.

**Close decision:** Update spec. The `ShippingOption` interface uses zloty for display purposes (`formatPolishPrice` expects zloty). Converting at the action boundary is architecturally sound — the client holds display units, the action validates and stores canonical units. Refactoring to cents in the data layer would require touching `allekurier-rates.ts`, `ShippingPageClient.tsx`, `formatPolishPrice` call sites, and tests. Risk outweighs benefit.

**Spec correction:**

```
amount: number    // Gross cost in PLN zloty (decimal, e.g. 12.76)
// Conversion to cents happens in ShippingPageClient before saveShippingAction
```

---

## Gap 2 — Funnel Guard Order

**Spec says:** Basket check first, then address check.

**Actual:** Address check first (line 13), basket check second (line 19).

**Trace:**
```ts
// page.tsx
if (!session.address) redirect("/checkout/address");      // line 13
if (!session.basket || session.basket.length === 0)       // line 19
  redirect("/basket");
```

**Impact:** None. Both redirect to the correct recovery page. The only difference is which missing guard a user with neither basket nor address hits first. In practice, the address page also guards for basket, and the basket page is the funnel entry point anyway.

**Close decision:** No code change. Optional spec update to reflect actual order, or optional code reorder for strict alignment. Either is acceptable.

---

## Gap 3 — Basket Page Missing Parcel Default (HIGH)

**Spec coherence rule 4:** "Parcel data defaults must be consistent between basket estimate and shipping page. Both use the same default (500 g, 20 × 15 × 25 cm)."

**Actual basket page** (`BasketManager.tsx:135-140`):
```ts
const parcels = enrichedItems
  .filter((item) => item.parcel)           // EXCLUDES items without parcel data
  .flatMap((item) => Array(item.quantity).fill(item.parcel!));
```

**Actual shipping page** (`parcel-calculator.ts:73`):
```ts
const parcel = product?.parcel ?? DEFAULT_PARCEL;  // INCLUDES default for missing data
```

**Impact:** Basket shipping estimate is calculated on fewer/lighter packages than the shipping page. If a basket contains items without parcel data, the basket shows a lower shipping cost than what the user will actually pay. This is a user-facing bug.

**Close decision:** Fix basket page. In `BasketManager.tsx`, replace the `.filter((item) => item.parcel)` with logic that injects `DEFAULT_PARCEL` for items missing parcel data.

**Required change:**
```ts
// Before (excludes missing parcels):
const parcels = enrichedItems
  .filter((item) => item.parcel)
  .flatMap((item) => Array(item.quantity).fill(item.parcel!));

// After (includes default parcels):
const DEFAULT_PARCEL = { weight: 500, width: 20, height: 15, length: 25 };
const parcels = enrichedItems
  .flatMap((item) => {
    const parcel = item.parcel ?? DEFAULT_PARCEL;
    return Array(item.quantity).fill(parcel);
  });
```

**Note:** `DEFAULT_PARCEL` is currently defined only in `lib/shipping/parcel-calculator.ts`. The basket page needs access to the same constant. Extract to a shared location (`lib/shipping/constants.ts` or similar) and import in both places.

---

## Gap 4 — Single-Parcel Width Bug in Basket API (HIGH)

**Actual** (`app/api/basket/shipping-rates/route.ts:84-90`):
```ts
const packages = numParcels === 1
  ? [{
      width: maxLength,    // BUG: should be maxWidth
      height: maxHeight,
      length: maxLength,
      weight: totalWeight / 1000,
    }]
```

**Impact:** For single-parcel baskets, the width dimension sent to AlleKurier is incorrect (set to length). This may produce inaccurate shipping rates for the basket estimate.

**Close decision:** Fix code. `width: maxWidth`.

**Required change (one character):**
```ts
width: maxWidth,  // was: maxLength
```

---

## Gap 5 — Test File for Orphaned Route

**Actual:** `app/checkout/shipping/shipping-rates.test.ts` calls `http://localhost:3000/api/shipping/rates`.

**Verified:** Zero imports of `/api/shipping/rates` in `app/checkout/**/*`. The shipping page calls `fetchAlleKurierRates` directly from the Server Component.

**Impact:** Test maintenance burden. Tests may fail or pass based on dead code.

**Close decision:** Remove the test file or move it to a `/tests/dead-code/` archive if retention is desired. The active flow has no test coverage for shipping rate fetching (this is a separate concern, not a gap against this spec).

---

## /checks — System Coherence Verification

| Rule | Status | Evidence |
|------|--------|----------|
| `shippingCost` is authoritative | PASS | `saveShippingAction` writes it; payment page reads from session. |
| Rates fetched fresh on every load | PASS | `page.tsx` calls `fetchAlleKurierRates` on every render. No caching. |
| Orphaned route not in active flow | PASS | Zero call sites in `app/checkout/**/*`. Confirmed in code trace. |
| Parcel defaults consistent | **FAIL** | Basket page excludes items without parcel data. Shipping page uses default. |
| `priceInCents` validated as positive integer | PASS | `saveShippingAction` checks `Number.isInteger(priceInCents) && priceInCents >= 1`. |
| Cascade invalidation in address slice | PASS | `saveAddress` clears all 5 shipping fields. |
| AlleKurier rate IDs are opaque | PASS | `rateId` is `${carrier.code}_${service.code}`. Stored as `shippingCode`. |

**Overall coherence:** 5/7 rules pass. 2 failures trace to the same root cause: the basket page's parcel handling diverges from the shipping page.

---

## Recommended Execution Order

1. **Fix Gap 4** (single-line change: `maxLength` → `maxWidth` in basket API)
2. **Fix Gap 3** (extract `DEFAULT_PARCEL` to shared constants, update basket page to use it)
3. **Fix Gap 5** (delete or archive `shipping-rates.test.ts`)
4. **Update spec** for Gap 1 (`amount` field definition)
5. **Optional:** Reorder funnel guards in `page.tsx` for strict spec alignment
