# Devin Task Plan — IEM Homepage Section UX Gaps
**Scope:** `app/components/features/homepage/iems-gallery/`  
**Design system reference:** `tailwind.config.ts`  
**Gold-standard component pattern:** `app/components/features/products/ProductCard.tsx`

---

## Pre-flight: What the codebase audit confirmed

The screenshot used for UX analysis showed an older deployed state (cream-card cards, brand only, no price/name/CTA). The current codebase (`IemCard.tsx`) already has product name, price text, and `<BasketControls>`. The tasks below close the **remaining real gaps** between the current code and correct design system implementation + UX standards.

**Do NOT re-add product name, price text, or basket controls — they already exist.**

---

## Gap inventory (verified against actual files)

| # | Gap | File(s) | Status |
|---|-----|---------|--------|
| G1 | `<Price>` component not used; inline `$` string instead | `IemCard.tsx` line 39–41 | Fix required |
| G2 | Price rendered inside `<Link>` — wrong layout pattern | `IemCard.tsx` lines 36–43 | Fix required |
| G3 | `product.stock` fetched but never rendered | `IemCard.tsx`, `getIemProducts.ts` | Fix required |
| G4 | `types.ts` exports stale dead-code `IemProduct` interface | `types.ts` | Delete file |
| G5 | `iem as any` cast bypasses TypeScript in gallery | `IemsGallery.tsx` line 29 | Fix required |
| G6 | Ratings/trust signals | Sanity `productType` schema | **Out of scope — schema has no ratings field; requires separate feature sprint** |

---

## Phase 1 — Verify before touching anything

**Task 1.1 — Confirm `types.ts` has zero imports**

Run:
```bash
grep -r "iems-gallery/types" app/ --include="*.ts" --include="*.tsx"
```

Expected result: no output (zero matches). If any file imports from `types.ts`, stop and report before proceeding.

**Task 1.2 — Confirm `IemProduct` is exported from `getIemProducts.ts`, not `types.ts`**

Verify that `IemCard.tsx` imports `IemProduct` from `./getIemProducts`, not `./types`. Current line 4:
```tsx
import { IemProduct } from "./getIemProducts";
```
This is correct. Proceed.

**Task 1.3 — Confirm `<Price>` component path and signature**

File: `app/components/ui/Price.tsx`

Confirmed signature:
```tsx
function Price({ value, currency?, variant?, className? }: PriceProps)
// value: number (dollars, not cents — e.g. 19.99 not 1999)
// currency: string, defaults to 'USD'
// className: defaults to "type-price tabular-nums"
```

`centsToDisplay(cents: number): number` returns `cents / 100` (dollars). So `<Price value={centsToDisplay(product.price_data.unit_amount)} />` is the correct call.

---

## Phase 2 — Fix IemCard.tsx

**File:** `app/components/features/homepage/iems-gallery/IemCard.tsx`

### Task 2.1 — Add `<Price>` import

Add to imports at top of file:
```tsx
import { Price } from "@/app/components/ui/Price";
```

### Task 2.2 — Restructure card: move price outside `<Link>`, put price + CTA on same bottom row

**Current structure (lines 18–57):**
```tsx
<article className="card-product-dark flex h-full flex-col gap-4 p-0 xs:p-6">
  <Link href={`/product/${product.slug}`} className="block">
    {/* image container */}
    <div className="flex flex-col px-4 xs:gap-1">
      <p className="type-overline mb-1">In-Ear Monitors</p>
      <h3 className="type-body line-clamp-2 font-medium">{product.name}</h3>
      <p className="type-price mt-2">
        ${centsToDisplay(product.price_data.unit_amount)}   {/* ← WRONG: inside Link, raw $, not <Price> */}
      </p>
    </div>
  </Link>
  <div className="px-4 pb-4">
    <BasketControls ... addClassName="btn-cart w-full justify-center" ... />
  </div>
</article>
```

**Target structure — matches ProductCard.tsx pattern exactly:**
```tsx
<article className="card-product-dark flex h-full flex-col gap-4 p-0 xs:p-6">
  <Link href={`/product/${product.slug}`} className="block">
    {/* image container — unchanged */}
    <div className="flex flex-col px-4 pt-2 xs:gap-1">
      <p className="type-overline mb-1">In-Ear Monitors</p>
      <h3 className="type-body line-clamp-2 font-medium">{product.name}</h3>
      {/* price removed from here */}
    </div>
  </Link>

  {/* Price + CTA on same row, outside <Link> — matches ProductCard pattern */}
  <div className="flex items-center justify-between px-4 pb-4">
    <Price value={centsToDisplay(product.price_data.unit_amount)} currency={product.price_data.currency} />
    <BasketControls
      productId={product._id}
      isBasketPage={false}
      addClassName="btn-cart"
      wrapperClassName="flex items-center gap-1"
      decrementClassName="btn-secondary w-8 h-8 flex items-center justify-center"
      incrementClassName="btn-secondary w-8 h-8 flex items-center justify-center disabled:opacity-50"
      quantityClassName="w-7 text-center type-body text-primary tabular-nums"
    />
  </div>
</article>
```

**What changed:**
- Removed inline `<p className="type-price mt-2">${centsToDisplay(...)}</p>` from inside `<Link>`
- Added `<Price>` + `<BasketControls>` in a shared `flex items-center justify-between` row **outside** `<Link>`
- Removed `w-full justify-center` from `addClassName` (was filling full width solo; now it shares row with price)

### Task 2.3 — Add low-stock badge

Inside the image container `<div>`, after the existing brand `<div>` block (which is `absolute left-2 top-2 xs:top-4`), add:

```tsx
{product.stock > 0 && product.stock <= 5 && (
  <div className="absolute right-2 top-2 xs:top-4">
    <span className="rounded-sm bg-warning-500/20 px-1.5 py-0.5 text-[7px] font-medium uppercase tracking-editorial text-warning-500 xs:text-small">
      Only {product.stock} left
    </span>
  </div>
)}
```

**Design system alignment:**
- `text-warning-500` = `#F59E0B` (from `tailwind.config.ts` warning scale)
- `bg-warning-500/20` = semi-transparent amber background
- Typography mirrors the brand tag pattern already in the card (`text-[7px] xs:text-small`, `uppercase tracking-editorial`)
- Position `absolute right-2 top-2` mirrors brand tag at `absolute left-2 top-2` — symmetric positioning

**Threshold:** `<= 5` units = "low stock". This is a standard e-commerce convention; do not hardcode differently.

---

## Phase 3 — Remove dead code

### Task 3.1 — Delete `types.ts`

File to delete: `app/components/features/homepage/iems-gallery/types.ts`

This file exports an `IemProduct` interface that:
- Has `brand: string` (WRONG — actual type from `getIemProducts.ts` has `brand: { _id, name, slug }`)
- Is imported by ZERO files (confirmed by grep in Task 1.1)

Delete the file. No import updates required.

---

## Phase 4 — Fix type safety in IemsGallery.tsx

**File:** `app/components/features/homepage/iems-gallery/IemsGallery.tsx`

### Task 4.1 — Remove `as any` cast

**Current (line 29):**
```tsx
<IemCard key={iem._id} product={iem as any} idx={idx} />
```

**Target:**
```tsx
<IemCard key={iem._id} product={iem} idx={idx} />
```

This is safe because:
- `iemsData` is typed as `IemProduct[]` from `getIemProducts.ts`
- `IemCard` expects `product: IemProduct` from the same `getIemProducts.ts` import
- After Tasks 2.1–2.3, both types are aligned

If TypeScript reports an error here after removing `as any`, stop and report the exact error before proceeding.

---

## Phase 5 — Verification

### Task 5.1 — TypeScript clean compile
```bash
npx tsc --noEmit
```
Expected: zero errors.

### Task 5.2 — Build passes
```bash
npm run build
```
Expected: successful build with no type errors. 

### Task 5.3 — Visual check (dev server)

Start dev server and inspect the IEM section:

| Check | Expected |
|-------|----------|
| Price format | `$1,299` (Intl.NumberFormat via `<Price>`) not `$12.99` or `$1299` |
| Price + CTA layout | Same horizontal row at card bottom, price left, Add button right |
| Clicking price area | Does NOT navigate (price is outside `<Link>`) |
| Low-stock badge | Amber badge `"Only N left"` appears top-right of image when stock ≤ 5 |
| No regression | Product name, overline, brand tag, image all still present and correct |

---

## Out of scope — do NOT implement in this task

### Ratings / Review Count
- The Sanity `productType` schema (`sanity-cms/schemaTypes/productType.ts`) has **no `rating` or `reviews` field**
- No review collection or aggregation mechanism exists anywhere in the codebase
- Adding ratings requires: (1) Sanity schema field addition, (2) review data collection system or third-party integration, (3) new display component
- This is a separate feature sprint. **Do not add a star rating UI with mock/hardcoded data.**

---

## Files touched in this task

| File | Action |
|------|--------|
| `app/components/features/homepage/iems-gallery/IemCard.tsx` | Modify — Price component, layout restructure, stock badge |
| `app/components/features/homepage/iems-gallery/IemsGallery.tsx` | Modify — remove `as any` cast |
| `app/components/features/homepage/iems-gallery/types.ts` | **Delete** |

**Files NOT touched:**
- `getIemProducts.ts` — correct as-is
- `IemsGalleryHeader.tsx` — correct as-is
- `tailwind.config.ts` — no changes
- `app/components/ui/Price.tsx` — no changes
- `app/components/features/basket/BasketControls.tsx` — no changes
