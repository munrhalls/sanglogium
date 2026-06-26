# Devin Task: Carousel Dots & Arrows Fixes (Homepage Spotlights Only)

## Context

Repo: sang-logium (Next.js 15 / React 19 / Tailwind).
Touch **only** these 3 files:
- `app/components/features/homepage/product-spotlight-1/ProductSpotlight1.tsx`
- `app/components/features/homepage/product-spotlight-2/ProductSpotlight2.tsx`
- `app/components/features/homepage/product-spotlight-3/ProductSpotlight3.tsx`

Do **not** touch `CarouselControls.tsx`, `CarouselRoot.tsx`, `CarouselContext.tsx`, or any other shared component.

---

## Phase 1 — Layout fix: arrows must not occupy the same flex row as dots

### Problem
Each file has this controls div:
```jsx
<div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-3">
  <CarouselPrevious iconStyle="chevron" className="..." />
  <div className="lg:hidden"><CarouselDots variant="dark" /></div>
  <div className="hidden lg:block"><CarouselDots /></div>
  <CarouselNext iconStyle="chevron" className="..." />
</div>
```
The prev/next buttons are inline in the flex row. With many dots they compete for space.

### Fix
Remove `gap-3` from the wrapper. Add `absolute left-2` to `CarouselPrevious` className and `absolute right-2` to `CarouselNext` className. Dots remain centered; arrows float to the sides absolutely.

In all 3 files, replace:
```
className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-3"
```
with:
```
className="absolute bottom-4 left-0 right-0 flex items-center justify-center"
```

---

## Phase 2 — Color fix: desktop arrow icons are invisible on the carousel background

### Problem
`CarouselPrevious` / `CarouselNext` default to `text-brand-100` (`#FDF9F7`, near-white).
The carousel image box background is `bg-surface-productImage` which resolves to `brand-200` (`#FAEEE6`, cream).
Near-white icon on cream background = invisible.

### Fix
In all 3 files, update the `className` prop on **both** `CarouselPrevious` and `CarouselNext`.

Current className value (same in all 3 files):
```
"max-lg:h-9 max-lg:w-9 max-lg:border-0 max-lg:rounded-none max-lg:bg-transparent max-lg:hover:bg-transparent max-lg:text-brand-800 max-lg:focus-visible:ring-brand-800/50"
```

New className value (add `absolute left-2` / `absolute right-2` per Phase 1, and add `lg:text-brand-700` for contrast):

For `CarouselPrevious`:
```
"absolute left-2 lg:text-brand-700 max-lg:h-9 max-lg:w-9 max-lg:border-0 max-lg:rounded-none max-lg:bg-transparent max-lg:hover:bg-transparent max-lg:text-brand-800 max-lg:focus-visible:ring-brand-800/50"
```

For `CarouselNext`:
```
"absolute right-2 lg:text-brand-700 max-lg:h-9 max-lg:w-9 max-lg:border-0 max-lg:rounded-none max-lg:bg-transparent max-lg:hover:bg-transparent max-lg:text-brand-800 max-lg:focus-visible:ring-brand-800/50"
```

`brand-700` = `#151B1B` (dark, high contrast on cream).

---

## Phase 3 — Mobile cap: max 9 carousel items on homepage

### Problem
No limit on how many images a product can have. On mobile many dots overflow the bar.

### Fix
In all 3 files, make two changes inside the `<Carousel ...>` block:

1. Change `itemsCount` prop:
```
FROM: itemsCount={product.images?.length || 1}
TO:   itemsCount={Math.min(product.images?.length || 1, 9)}
```

2. Change the `.map(` call inside `<CarouselTrack>`:
```
FROM: product.images?.map((image, idx) => (
TO:   product.images?.slice(0, 9).map((image, idx) => (
```

---

## Verification checklist

- [ ] All 3 spotlight files have `gap-3` removed from the controls wrapper div
- [ ] `CarouselPrevious` has `absolute left-2` in className in all 3 files
- [ ] `CarouselNext` has `absolute right-2` in className in all 3 files
- [ ] Both arrow buttons have `lg:text-brand-700` in className in all 3 files
- [ ] `itemsCount` uses `Math.min(..., 9)` in all 3 files
- [ ] `.slice(0, 9)` applied before `.map(` in all 3 files
- [ ] No changes to any file outside the 3 spotlight components
- [ ] `npm run build` passes with no TypeScript errors
