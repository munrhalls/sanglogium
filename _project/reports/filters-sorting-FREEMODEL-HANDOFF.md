# Filters & Sorting — Handoff + Free-Model Execution Plan

> Purpose: hand off the filters/sorting gap-closure work so a **free / smaller model**
> can finish the remaining phases **mechanically, reliably, and system-aligned**, without
> needing the architectural context the previous (larger) model had.
>
> Source plan: `filters-sorting-gap-closure-plan.md` (phases/tasks/DoD).
> Gap report: `filters-sorting-gaps-intelligence.md`.

---

## PART A — State of the World (what is DONE)

Phases 0–4 are **complete and verified** (tests green).

| Phase | Status | Key files |
|---|---|---|
| 0 Test harness reset | DONE | `tests/catalogue/filters-sorting-matrix.spec.ts` (living todo matrix) |
| 1 Param & sort contract | DONE | `lib/catalogue/filterParams.ts`, `lib/catalogue/searchParams.ts`, `app/components/features/filters/useFilterNuqs.ts`, `SortDropdown.tsx`, `MobileControlsBar.tsx` |
| 2 Query resilience & perf | DONE | `sanity-cms/lib/products/getProductsByVfsKeys.ts`, `sanity-cms/lib/products/filter/getFiltersForCategoryPath.ts` |
| 3 Pagination & count | DONE | `getProductsByVfsKeys.ts` (window slice + count), `lib/catalogue/pagination.ts`, `app/components/features/products/Pagination.tsx`, `CategoryPageClient.tsx` |
| 4 Deterministic featured order | DONE | `sanity-cms/schemaTypes/productType.ts` (`displayPriority`), `lib/catalogue/filterParams.ts` (`FEATURED_ORDER`), `scripts/migrations/display-priority-migration/` (backfill, NOT run) |

### Architecture invariants you MUST NOT break

1. **Single source of truth for URL state** is `lib/catalogue/filterParams.ts`. The client hook
   (`useFilterNuqs.ts`) and server loader (`searchParams.ts`) both import from it. Never add a
   second parser or parse `sort`/`f`/`page` ad-hoc anywhere else.
2. **GROQ order safety**: the order clause is ALWAYS built by `buildOrderClause()` from the
   allow-listed `SORT_OPTIONS`. Never interpolate a raw URL value into a GROQ `order(...)`.
3. **Featured order** = `coalesce(displayPriority, 0) desc, _createdAt desc` (constant
   `FEATURED_ORDER`). It is deterministic; do not change it.
4. **GROQ filter safety**: filters become GROQ via `FilterBuilder` (`sanity-cms/lib/products/FilterBuilder.ts`),
   which sanitizes strings and validates numerics. Keep all new conditions inside that class.
5. **Pagination shape**: `getProductsByVfsKeys` returns `{ products, totalCount }`. Do not revert
   to returning a bare array.

---

## PART B — Operating Manual (READ BEFORE EVERY TASK)

You are in a **parallel multi-agent environment**. Follow this loop for EVERY task, no exceptions.

### The per-task loop

1. **Claim every file you will edit** (and any NEW file you will create):
   ```
   node scripts/mutex.cjs claim <relativepath> cascade_pane_1
   ```
   If it prints `[ERROR]` / exits non-zero, STOP — someone else holds it. Pick another task.
2. **Write the test FIRST** (test-first). Use the exact spec given in the task.
3. **Run ONLY the targeted test** (never the full suite, never a build):
   ```
   npx vitest run <spec-path-1> <spec-path-2>
   ```
   Confirm it FAILS for the right reason.
4. **Implement** the exact change given in the task.
5. **Re-run the same targeted test.** Confirm it PASSES.
6. **Release every file you claimed:**
   ```
   node scripts/mutex.cjs release <relativepath> cascade_pane_1
   ```
7. **Mark the task done** (update the todo list / beads). Report the result with file citations.

### Hard rules (CPU + correctness safety)

- **DO NOT** run `npm run build`, `next build`, `tsc`, `eslint`, or the full `vitest` suite. They are
  CPU-heavy and forbidden here. Run only targeted `vitest run <paths>`.
- **DO NOT** edit a file you have not claimed. **DO NOT** edit more than the files a task lists.
- **DO NOT** add or remove comments/docs unless the task says so.
- **DO NOT** widen scope. One task = one change set. If a task feels ambiguous, STOP and escalate
  (see Part D). Do not improvise.
- **Editor "Cannot find module '@/...'" warnings in `*.spec.ts` are EXPECTED** (TS-server alias quirk).
  Vitest resolves them via `vite-tsconfig-paths`. Ignore those specific warnings.
- Test files use `@/...` absolute imports (alias = repo root). Match the existing specs.

### How to verify a test path is picked up

`vitest.config.mts` includes `**/*.spec.ts` anywhere in the repo, alias `@` → repo root. So a spec
can live next to its target in a `__tests__/` folder.

---

## PART C — The Plan (remaining Phases 5–8)

Each task is tagged with a **TIER**:

- **TIER 1 — FREE-MODEL SAFE**: pure-function or one-line change, exact code provided, unit-testable.
  Do these.
- **TIER 2 — DO WITH CARE**: small, mostly mechanical, but touches a component/file you must re-read
  first. Follow instructions exactly; if reality differs from the snippet, STOP and escalate.
- **TIER 3 — ESCALATE (NOT free-model safe)**: needs architectural judgment, streaming tradeoffs,
  or DOM/a11y work that resists cheap tests. **Do NOT attempt as a free model.** Leave for a stronger
  model or the user (see Part D).

**Recommended order: do all TIER 1 first, then TIER 2, then hand TIER 3 back.**

---

### ✅ T5.4 (B7) — Stock filter matches `availableStock` — TIER 1

**Goal:** stock-minimum filter must match `stock - reservedStock`, consistent with the displayed
`availableStock` field.

**Claim:**
```
node scripts/mutex.cjs claim sanity-cms/lib/products/FilterBuilder.ts cascade_pane_1
node scripts/mutex.cjs claim sanity-cms/lib/products/__tests__/FilterBuilder.spec.ts cascade_pane_1
```

**Test first** — create `sanity-cms/lib/products/__tests__/FilterBuilder.spec.ts` (if it does not
already exist; if it exists, ADD these `describe`s):
```ts
import { describe, it, expect } from "vitest";
import { FilterBuilder } from "@/sanity-cms/lib/products/FilterBuilder";

describe("FilterBuilder stock (B7 / T5.4)", () => {
  it("matches availableStock (stock - reservedStock)", () => {
    expect(FilterBuilder.buildClause(["stockMin:5"])).toContain("(stock - reservedStock) >= 5");
  });
  it("ignores a non-integer stock value", () => {
    expect(FilterBuilder.buildClause(["stockMin:abc"])).not.toContain("stock - reservedStock");
  });
});
```

**Implement** — in `FilterBuilder.ts`, method `buildStockFilter`, change the single return line:
```ts
// FROM:
return `stock >= ${num}`;
// TO:
return `(stock - reservedStock) >= ${num}`;
```

**Verify:** `npx vitest run sanity-cms/lib/products/__tests__/FilterBuilder.spec.ts`

**DoD:** clause uses `(stock - reservedStock) >= N`. **Release** both files.

---

### ✅ T5.2 (B5) — Inverted price range (min > max) — TIER 1

**Goal:** a hand-edited URL with `min > max` must NOT emit a contradictory clause that silently
returns zero results — ignore the range instead.

**Claim:** `FilterBuilder.ts` + its spec (same as T5.4; if already held by you, reuse).

**Test first** (add to `FilterBuilder.spec.ts`):
```ts
describe("FilterBuilder priceRange (B5 / T5.2)", () => {
  it("builds a normal range clause", () => {
    const c = FilterBuilder.buildClause(["priceRange:min:1000", "priceRange:max:5000"]);
    expect(c).toContain("price_data.unit_amount >= 1000");
    expect(c).toContain("price_data.unit_amount <= 5000");
  });
  it("ignores an inverted range (min > max) instead of a contradiction", () => {
    const c = FilterBuilder.buildClause(["priceRange:min:5000", "priceRange:max:1000"]);
    expect(c).not.toContain("price_data.unit_amount");
  });
});
```

**Implement** — replace the whole `buildPriceRangeFilter` method body with:
```ts
private static buildPriceRangeFilter(values: string[]): string {
  let min: number | null = null;
  let max: number | null = null;
  for (const value of values) {
    if (value.startsWith('min:')) {
      const n = this.validateNumeric(value.slice(4));
      if (n !== null) min = n;
    } else if (value.startsWith('max:')) {
      const n = this.validateNumeric(value.slice(4));
      if (n !== null) max = n;
    }
  }
  // B5: an inverted range (min > max) is incoherent — ignore it rather than
  // emitting a contradictory clause that silently returns zero results.
  if (min !== null && max !== null && min > max) {
    return '';
  }
  const conditions: string[] = [];
  if (min !== null) conditions.push(`price_data.unit_amount >= ${min}`);
  if (max !== null) conditions.push(`price_data.unit_amount <= ${max}`);
  if (conditions.length === 0) return '';
  return `&& (${conditions.join(' && ')})`;
}
```

**Verify / DoD / Release:** same pattern.

> NOTE: the plan also mentions "signal an invalid-range state" in the UI. That UI signal is **TIER 3**
> (escalate). The TIER-1 core DoD ("inverted range no longer returns a confusing empty grid") is met
> by ignoring the range here.

---

### ✅ T5.3 (B6) — Slider bounds from real data (remove hardcoded 10000 + 0-falsy bug) — TIER 1 (logic) + TIER 2 (wiring)

**Goal:** slider max = true category max; a legitimate `0` bound is honored. Remove the hardcoded
`10000` ceiling and the `priceRangeData?.minPrice ? ... : 0` falsy bug.

**Claim:**
```
node scripts/mutex.cjs claim lib/catalogue/priceBounds.ts cascade_pane_1
node scripts/mutex.cjs claim lib/catalogue/__tests__/priceBounds.spec.ts cascade_pane_1
node scripts/mutex.cjs claim app/components/features/filters/FilterSidebar.tsx cascade_pane_1
node scripts/mutex.cjs claim app/components/features/filters/MobileFilterDrawer.tsx cascade_pane_1
```

**Test first** — `lib/catalogue/__tests__/priceBounds.spec.ts`:
```ts
import { describe, it, expect } from "vitest";
import { resolvePriceBounds, DEFAULT_PRICE_CEILING } from "@/lib/catalogue/priceBounds";

describe("resolvePriceBounds (B6 / T5.3)", () => {
  it("derives max from real category data", () => {
    expect(resolvePriceBounds({ minPrice: 0, maxPrice: 250000 }).max).toBe(2500);
  });
  it("honors a 0 minimum bound (no falsy bug)", () => {
    expect(resolvePriceBounds({ minPrice: 0, maxPrice: 100000 }).min).toBe(0);
  });
  it("falls back to the default ceiling when max is null", () => {
    expect(resolvePriceBounds({ minPrice: null, maxPrice: null }).max).toBe(DEFAULT_PRICE_CEILING);
  });
});
```

**Implement (TIER 1)** — create `lib/catalogue/priceBounds.ts`:
```ts
import { centsToDisplay } from "@/lib/utils/price";

/** Fallback display ceiling (dollars) when a category has no derivable max price. */
export const DEFAULT_PRICE_CEILING = 1000;

export interface PriceRangeData {
  minPrice: number | null; // cents
  maxPrice: number | null; // cents
}

/**
 * Resolve slider display bounds (dollars) from category price data. Uses
 * `!= null` checks so a legitimate 0 bound is honored (B6), and derives the
 * max from real data instead of a hardcoded ceiling.
 */
export function resolvePriceBounds(data?: PriceRangeData): { min: number; max: number } {
  const min = data?.minPrice != null ? centsToDisplay(data.minPrice) : 0;
  const max = data?.maxPrice != null ? centsToDisplay(data.maxPrice) : DEFAULT_PRICE_CEILING;
  return { min, max };
}
```

**Verify the helper:** `npx vitest run lib/catalogue/__tests__/priceBounds.spec.ts` → PASS.

**Wire it in (TIER 2)** — in BOTH `FilterSidebar.tsx` and `MobileFilterDrawer.tsx`:
- Add import at the TOP with the other imports:
  ```ts
  import { resolvePriceBounds } from '@/lib/catalogue/priceBounds';
  ```
- Replace these two lines:
  ```ts
  const minPriceDollars = priceRangeData?.minPrice ? centsToDisplay(priceRangeData.minPrice) : 0;
  const maxPriceDollars = priceRangeData?.maxPrice ? centsToDisplay(priceRangeData.maxPrice) : 10000;
  ```
  with:
  ```ts
  const { min: minPriceDollars, max: maxPriceDollars } = resolvePriceBounds(priceRangeData);
  ```
- If `centsToDisplay` is now unused in that file, also remove its now-dead import (check first).

**DoD:** no hardcoded `10000`; bounds come from `resolvePriceBounds`. **Release all four files.**

---

### ⚠️ T5.5 (B9) — Brand option casing — TIER 2

**Goal:** brand filter options in `getFiltersForCategoryPath` intersect case-insensitively, matching
`FilterBuilder.buildBrandFilter` (which already uses `lower(...) == lower(...)`).

**Claim:** `sanity-cms/lib/products/filter/getFiltersForCategoryPath.ts` + a spec for it
(`sanity-cms/lib/products/filter/__tests__/getFiltersForCategoryPath.spec.ts` already exists — add to it).

**Steps:**
1. **READ** `getFiltersForCategoryPath.ts` fully first. Locate where CMS-configured brand options
   are intersected with the distinct brands actually present in the category.
2. The bug: that intersection compares brand strings with exact case. Make BOTH sides `.toLowerCase()`
   when comparing (keep the original-cased label for display).
3. **Test first**: add a case where a CMS brand option is `"sennheiser"` but the product brand is
   `"Sennheiser"` (or vice-versa) and assert the option still appears in the returned brand group.

> This is TIER 2 because the exact code depends on the current shape of that function. If after
> reading it the intersection point is NOT obvious, STOP and escalate (Part D). Do not guess.

**DoD:** a CMS brand option with differing casing still appears and filters correctly. Release.

---

### 🛑 T5.1 (B3) — Reconcile/strip unknown URL filters — TIER 3 (ESCALATE)

**Why escalate:** doing this "before querying" cleanly conflicts with the parallel-streaming design
(`page.tsx` creates the products promise BEFORE the filter groups are known). Resolving that without
hurting performance, plus deciding chip-vs-server reconciliation, needs judgment. **Do not attempt as
a free model.** See Part D for the framing to hand back.

---

### 🛑 T5.6 (B13) — Clear stale `f`/`sort`/`page` on category change — TIER 3 (ESCALATE)

**Why escalate:** requires detecting category (slug) changes and reconciling nuqs state during
navigation — easy to introduce render loops or wrong-time resets. Needs judgment + careful testing.

---

### ✅ T6.1 (A4) — Empty-results state + reset CTA — TIER 2

**Goal:** when `totalCount === 0`, show a clear message + a one-click reset wired to `clearAllFilters`.

**Claim:**
```
node scripts/mutex.cjs claim app/components/features/products/EmptyResults.tsx cascade_pane_1
node scripts/mutex.cjs claim app/(store)/products/[...slug]/CategoryPageClient.tsx cascade_pane_1
```

**Implement** — create `app/components/features/products/EmptyResults.tsx`:
```tsx
"use client";

import React from 'react';
import { useFilterNuqs } from '@/app/components/features/filters/useFilterNuqs';

export function EmptyResults() {
  const { clearAllFilters, hasActiveFilters } = useFilterNuqs();
  return (
    <div data-testid="empty-results" className="py-16 text-center space-y-4">
      <p className="type-body text-secondary">
        No products match your current filters.
      </p>
      {hasActiveFilters && (
        <button
          type="button"
          onClick={clearAllFilters}
          data-testid="reset-filters"
          className="btn-secondary"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}
```

In `CategoryPageClient.tsx`:
- Add import at top: `import { EmptyResults } from '@/app/components/features/products/EmptyResults';`
- Replace `<ProductGrid products={products} />` with:
  ```tsx
  {totalCount === 0 ? <EmptyResults /> : <ProductGrid products={products} />}
  ```

**Verify:** no cheap unit test (needs nuqs provider) — verification is manual: navigate to a filter
combo with zero results; confirm message + working "Clear all filters". Keep changes minimal so the
existing suite stays green: `npx vitest run tests/catalogue/filters-sorting-matrix.spec.ts` (should
still pass / be todos). **Release both.**

> TIER 2 (not TIER 1) because there is no cheap automated assertion; rely on the exact JSX above +
> manual check. Do not invent brittle render tests.

---

### ⚠️ T6.2 (A7) — Pending UI + scroll handling — TIER 2 (pending) / TIER 3 (scroll)

**Pending dim (TIER 2):** the grid already has access to `isPending` (`useFilterPending()`).
In `CategoryPageClient.tsx`, wrap the grid container so it dims while pending, e.g.:
```tsx
<div className={isPending ? 'opacity-60 transition-opacity pointer-events-none' : 'transition-opacity'}>
  {totalCount === 0 ? <EmptyResults /> : <ProductGrid products={products} />}
</div>
```
DoD (pending): re-filtering shows a visible loading state beyond the text "(Loading...)".

**Scroll-to-top on page/sort change (TIER 3 — ESCALATE):** deliberate scroll management interacts
with streaming + nuqs timing and is easy to get wrong. Escalate this half.

---

### 🛑 Phase 7 (T7.2, T7.3) — TIER 3 (ESCALATE), except T7.1

#### ✅ T7.1 (B8) — Debounce stock slider URL updates — TIER 1/2

**Goal:** throttle stock-minimum URL/server updates like the price slider's `debounce(500)`.

**Claim:** `app/components/features/filters/useFilterNuqs.ts`.

**Implement** — in `useFilterNuqs.ts`:
- Near the existing `const PRICE_RANGE_URL_LIMITER = debounce(500);` add:
  ```ts
  const STOCK_RANGE_URL_LIMITER = debounce(500);
  ```
- In `setStockMinimum`, add the limiter as the 2nd arg of `setFilters` (mirror price):
  ```ts
  return [...withoutStock, `stockMin:${value}`];
  }, { limitUrlUpdates: STOCK_RANGE_URL_LIMITER });
  ```
  (and for the `value <= 0` early branch, return `withoutStock` from the SAME updater so the limiter
  still applies — keep the single `setFilters(updater, { limitUrlUpdates: STOCK_RANGE_URL_LIMITER })`).
- In `clearStockMinimum`, add `{ limitUrlUpdates: STOCK_RANGE_URL_LIMITER }` as the 2nd arg to
  `setFilters` (mirror `clearPriceRange`).

**Verify:** no cheap unit test for timing. Manual: drag the stock slider; URL updates should
throttle, not spam. Keep the diff tiny. **Release.**

#### 🛑 T7.2 (B10) keyboard-step debounced, 🛑 T7.3 (B11) focus trap + ARIA — TIER 3 (ESCALATE)
DOM focus-trap re-evaluation and per-keypress commit behavior need careful, judgment-heavy work and
resist cheap tests. Escalate.

---

### ✅ T8.1 (A9) — Canonical + robots for facet URLs — TIER 1 (logic) + TIER 2 (wiring)

**Goal:** filtered/sorted/paged URLs canonicalize to the base category and carry `robots: noindex`
so crawlers don't index unbounded facet permutations.

**Claim:**
```
node scripts/mutex.cjs claim lib/catalogue/seo.ts cascade_pane_1
node scripts/mutex.cjs claim lib/catalogue/__tests__/seo.spec.ts cascade_pane_1
node scripts/mutex.cjs claim app/(store)/products/[...slug]/page.tsx cascade_pane_1
```

**Test first** — `lib/catalogue/__tests__/seo.spec.ts`:
```ts
import { describe, it, expect } from "vitest";
import { isFacetedQuery, canonicalCategoryPath } from "@/lib/catalogue/seo";

describe("catalogue SEO helpers (A9 / T8.1)", () => {
  it("treats f / sort / page>1 as faceted (non-indexable)", () => {
    expect(isFacetedQuery({ f: "brand:Focal" })).toBe(true);
    expect(isFacetedQuery({ sort: "name:asc" })).toBe(true);
    expect(isFacetedQuery({ page: "2" })).toBe(true);
  });
  it("treats the bare base category (and page=1) as indexable", () => {
    expect(isFacetedQuery({})).toBe(false);
    expect(isFacetedQuery({ page: "1" })).toBe(false);
  });
  it("builds the canonical path from the slug segments", () => {
    expect(canonicalCategoryPath(["audio-electronics", "headphones"]))
      .toBe("/products/audio-electronics/headphones");
  });
});
```

**Implement (TIER 1)** — create `lib/catalogue/seo.ts`:
```ts
type RawQuery = { [key: string]: string | string[] | undefined };

/**
 * A "faceted" listing (any filter, non-default sort, or page > 1) must not be
 * indexed — only the canonical base category is indexable (A9).
 */
export function isFacetedQuery(query: RawQuery): boolean {
  if (query.f) return true;
  if (query.sort) return true;
  const page = Array.isArray(query.page) ? query.page[0] : query.page;
  if (page && page !== "1") return true;
  return false;
}

/** Canonical path for a category, ignoring all query facets. */
export function canonicalCategoryPath(slug: string[]): string {
  return `/products/${slug.join("/")}`;
}
```

**Verify the helper:** `npx vitest run lib/catalogue/__tests__/seo.spec.ts` → PASS.

**Wire it in (TIER 2)** — in `app/(store)/products/[...slug]/page.tsx`, update `generateMetadata`:
- Add imports at top: `import { isFacetedQuery, canonicalCategoryPath } from '@/lib/catalogue/seo';`
- The function currently destructures only `{ params }`. Change to also read `searchParams` (the
  prop type `CategoryPageProps` already includes it):
  ```ts
  export async function generateMetadata({ params, searchParams }: CategoryPageProps) {
    const { slug } = await params;
    const query = await searchParams;
    // ...existing nodeId + metadata lookup unchanged...
    return {
      title: `${metadata.name} — Sang Logium`,
      description: `Browse ${metadata.name} headphones and audio equipment`,
      alternates: { canonical: canonicalCategoryPath(slug) },
      robots: isFacetedQuery(query) ? { index: false, follow: true } : undefined,
    };
  }
  ```
  Keep the two early `return { title: 'Category Not Found' }` branches as-is.

**DoD:** base category emits a canonical link; faceted URLs emit `robots noindex,follow`.
**Release all three.**

---

### ✅ T8.2 (A9) — Confirm stable order — TIER 1 (verification only)

Already satisfied by Phase 4 (`FEATURED_ORDER` is deterministic). No code change. Confirm by running
`npx vitest run lib/catalogue/__tests__/filterParams.spec.ts` and checking the
"builds the deterministic featured order" test passes. Mark done.

---

## PART D — What to hand back (TIER 3 / escalation)

These need a stronger model or the user. When handing back, frame them as **symptom + file + question**,
never as a pre-formed fix (per the project's orchestration rule — do not pre-diagnose):

- **T5.1 (B3)** — "Hand-edited unknown filters (e.g. `?f=foo:bar`) are not reconciled against the
  category's real filter groups. Where should reconciliation happen given products and filter-groups
  are fetched as parallel promises in `page.tsx`?"
- **T5.6 (B13)** — "Navigating between categories can carry stale `f`/`sort`/`page`. Need a safe place
  to reset nuqs state on slug change without render loops."
- **T6.2 scroll half** — "Deliberate scroll-to-top on page/sort change."
- **T7.2 (B10)** — "Slider keyboard arrow-steps should commit via the debounced path, not per-keypress."
- **T7.3 (B11)** — "Mobile drawer focus trap must re-evaluate focusable nodes on dynamic content;
  Filters button needs `aria-expanded`/`aria-controls`; `ActiveFilters` chips need descriptive
  `aria-label`."

---

## PART E — Quick reference card

```
# claim / release
node scripts/mutex.cjs claim <path> cascade_pane_1
node scripts/mutex.cjs release <path> cascade_pane_1

# targeted test (ONLY this — never full build/suite)
npx vitest run <spec-path> [<spec-path> ...]
```

Free-model order: **T5.4 → T5.2 → T5.3 → T8.1 → T8.2 → T7.1 → T6.1 → (T6.2 pending) → T5.5**.
Then hand back all TIER 3 items (Part D).
