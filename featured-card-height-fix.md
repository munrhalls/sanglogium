# Featured Carousel — Card Height Equalization
## Task Brief for Devin IDE Agent

---

## Context & Scope

**Symptom:** In the Featured carousel on the homepage, cards in the same row are not all the same height. One card appears shorter than its siblings.

**Scope:** Single-line class change in one file. No architectural changes. No changes to carousel infrastructure. No changes to other homepage sections.

---

## Files Involved (read-only reference)

| File | Role |
|---|---|
| `app/components/features/homepage/featured/Featured.tsx` | ✅ **Only file to edit** — contains `FeaturedCard` |
| `app/components/layout/carousel/CarouselTrack.tsx` | Read-only — belt with `items-stretch` |
| `app/components/layout/carousel/CarouselSlide.tsx` | Read-only — individual slide wrapper |
| `app/components/layout/carousel/CarouselContext.tsx` | Read-only — `--visible-count` CSS variable |
| `tailwind.config.ts` | Read-only — `card-product-dark` adds `p-6` to article |

---

## Root Cause

The height chain from belt → slide → article is:

```
CarouselTrack belt  →  flex row, items-stretch
  CarouselSlide     →  flex h-full flex-col px-3   (className injected by Featured.tsx)
    FeaturedCard    →  card-product-dark flex h-full flex-col gap-4
```

`FeaturedCard`'s `<article>` uses **`h-full`** (CSS `height: 100%`) to fill the slide.
`h-full` requires the **parent to have an explicit `height` declaration** to resolve.
The slide's height is established by the belt's `align-items: stretch` — **not** an explicit `height` property — so `h-full` on the article is unreliable and can fall back to intrinsic content height.

When `h-full` falls back to content-sized:
- Products with 2-line names (via `line-clamp-2` on `h3.type-body`) → taller article
- Products with 1-line names → shorter article
- The slides ARE equalized by `items-stretch`, but the visual card borders are not

**Why BasketControls state is a red herring:** The `- qty +` vs `Add` height difference is minor (~6px) and not the primary cause. The name-length variation creates a much larger difference (~24px per extra line).

---

## Phase 1 — Verify Root Cause

**Task 1.1 — Audit height chain**

Open these three files and confirm the chain described above:
- `CarouselTrack.tsx`: belt inner div has `className="flex h-full w-full items-stretch ..."`
- `CarouselSlide.tsx`: slide root div has `className={cn("min-w-0 shrink-0 grow-0", className)}` — the `className` prop from `Featured.tsx` injects `"flex h-full flex-col px-3"`
- `Featured.tsx` line 38: `<article className="card-product-dark flex h-full flex-col gap-4">`

Confirm: the article's `h-full` parent (the slide) has its height determined by `align-items: stretch`, not an explicit `height:` declaration.

**Task 1.2 — Confirm name-length variation at 3-column breakpoint**

In `Featured.tsx`, find the `FeaturedCard` component. The product name renders as:
```jsx
<h3 className="type-body line-clamp-2 font-medium">{product.name}</h3>
```

`line-clamp-2` caps at 2 lines but shorter names occupy only 1 line. At ≥1280px (3-column view), confirm that at least one product name is 1 line while others are 2 lines — this produces the visible height gap.

---

## Phase 2 — Fix

**Task 2.1 — Single class change in `Featured.tsx`**

File: `app/components/features/homepage/featured/Featured.tsx`

Find line 38 (inside the `FeaturedCard` function):
```jsx
<article className="card-product-dark flex h-full flex-col gap-4">
```

Change **`h-full`** to **`flex-1`**:
```jsx
<article className="card-product-dark flex flex-1 flex-col gap-4">
```

**Why `flex-1` fixes it:**
- `flex-1` = `flex: 1 1 0%` — makes the article grow to fill available space in its flex-column parent (the slide)
- `flex-grow` works purely within the flexbox sizing model and does NOT require the parent to have an explicit `height` property
- Since the slide is `flex flex-col` and the article is its only child, `flex-1` guarantees the article fills the slide's full height regardless of how that height was established (explicit, stretch, or otherwise)

**Constraints for this task:**
- Change ONLY this one class on this one element
- Do NOT modify any other element in `FeaturedCard`
- Do NOT modify `CarouselTrack.tsx`, `CarouselSlide.tsx`, `CarouselContext.tsx`, `CarouselRoot.tsx`
- Do NOT modify `tailwind.config.ts`
- Do NOT modify `BasketControls.tsx`
- Do NOT modify any other homepage section card components (`DacCard`, `AccessoryCard`, `IemCard`, `ProductCard`)

---

## Phase 3 — Verify Fix

**Task 3.1 — 3-column layout (≥1280px viewport)**

Run `npm run dev`. Load `localhost:3000`. Set browser viewport to ≥1280px.
Scroll to the Featured section.
Confirm: all visible cards in the same carousel row have their bottom borders at the same y-coordinate.
Specifically check that the Sennheiser HD 800S card (or whichever card has the shortest product name) matches the height of the cards with longer names.

**Task 3.2 — 2-column layout (768px–1279px viewport)**

Resize viewport to ~900px.
Confirm: cards shown in pairs have equal heights.

**Task 3.3 — 1-column layout (<640px viewport)**

Resize to ~375px. Only 1 card visible at a time — no equalization needed.
Confirm: no visual regressions (card renders normally, no extra white space).

**Task 3.4 — BasketControls state variation**

Add one featured product to cart so its card shows `- qty +` controls.
Confirm that card's height matches adjacent cards showing the "Add" button.

**Task 3.5 — No regressions in other carousel sections**

Scroll through the full homepage. Confirm DAC, Accessory, IEM, and other sections are visually unchanged. These components are separate files untouched by this fix.

---

## Summary

| | |
|---|---|
| **Files changed** | 1 (`Featured.tsx`) |
| **Lines changed** | 1 (line 38) |
| **Class removed** | `h-full` |
| **Class added** | `flex-1` |
| **Root cause** | `h-full` cannot resolve against a flexbox-stretch-defined parent height; `flex-1` has no such dependency |
| **Scope** | Featured carousel cards only |
