# TIER 3 Escalated Tasks — Intelligence Report & Free-Model Execution Plan

> Source: `filters-sorting-FREEMODEL-HANDOFF.md` (original handoff)
> Status: All TIER 1 + TIER 2 work complete. This document covers the 5 remaining TIER 3 items,
> re-analyzed, broken into free-model-safe sub-tasks, and ordered for zero ambiguity.

---

## ⚠️ BLOCKER — MUST BE DONE FIRST (Phase 0)

**Two working-copy files are truncated.** The free model agent left both files partially written.
Git HEAD has the correct versions. Nothing else can proceed until this is fixed.

### Affected files

| File | Working-copy size | Status |
|---|---|---|
| `app/(store)/products/[...slug]/CategoryPageClient.tsx` | 2414 bytes (truncated at `{countLa`) | ❌ CORRUPT |
| `app/(store)/products/[...slug]/ProductsSection.tsx` | also truncated | ❌ CORRUPT |

### Fix (one command, no mutex needed — pure git restore)

```bash
git checkout HEAD -- \
  "app/(store)/products/[...slug]/CategoryPageClient.tsx" \
  "app/(store)/products/[...slug]/ProductsSection.tsx"
```

### Verify

```bash
python3 -c "
c = open('app/(store)/products/[...slug]/CategoryPageClient.tsx').read()
assert c.strip().endswith('}'), 'STILL TRUNCATED'
print('OK — file ends correctly')
"
python3 -c "
c = open('app/(store)/products/[...slug]/ProductsSection.tsx').read()
assert c.strip().endswith('}'), 'STILL TRUNCATED'
print('OK — file ends correctly')
"
```

Both must print `OK` before continuing.

---

## Architecture Invariants (DO NOT BREAK)

1. Single source of truth for URL state: `lib/catalogue/filterParams.ts`. Client hook (`useFilterNuqs`) and server loader (`searchParams.ts`) both import from it. Never define a new parser for `sort`, `f`, or `page` elsewhere.
2. GROQ order injection blocked by `SORT_OPTIONS` allowlist in `filterParams.ts`. Never interpolate raw URL values into GROQ.
3. GROQ filter safety: all filter clauses go through `FilterBuilder`. No raw URL values reach GROQ strings.
4. `getProductsByVfsKeys` returns `{ products, totalCount }`. Do not revert to a bare array.
5. `page.tsx` creates `productsPromise` and `filtersPromise` in **parallel** — there is intentionally no server-side filter reconciliation before the query fires. Client-side reconciliation (T5.1) is the correct solution.

---

## Per-Task Loop (same as original handoff — follow every time)

1. `node scripts/mutex.cjs claim <path> cascade_pane_1` for every file you will edit or create.
2. Write test first (if the task has one). Confirm it FAILS.
3. Implement the change.
4. Re-run the targeted test. Confirm it PASSES.
5. `node scripts/mutex.cjs release <path> cascade_pane_1`
6. Mark the task done.

**Forbidden:** `npm run build`, `tsc`, `eslint`, full vitest suite. Only `npx vitest run <specific paths>`.

---

## Phase 0 — Restore truncated files (BLOCKER)

**No mutex needed. Run this before every other phase.**

```bash
git checkout HEAD -- \
  "app/(store)/products/[...slug]/CategoryPageClient.tsx" \
  "app/(store)/products/[...slug]/ProductsSection.tsx"
```

---

## Phase 1 — T5.1 (B3): Strip unknown URL filters — PURE HELPER (TIER 1)

**Symptom:** A hand-crafted URL like `?f=foo:bar` is passed to `FilterBuilder` which attempts a generic GROQ query on `overviewFields`/`specifications`. If those fields don't exist, zero results appear with no explanation. Unknown filters should be silently stripped client-side once valid filter groups are known.

**Why client-side:** `page.tsx` fires `productsPromise` and `filtersPromise` in parallel — the valid filter fields are not known until `filtersPromise` resolves. Reconciling on the server would break parallelism. Client-side, after `CategoryPageClient` receives the `filters` prop, it can detect and remove unknown entries from the URL.

**Files in this phase:**
- `lib/catalogue/filterUtils.ts` (NEW)
- `lib/catalogue/__tests__/filterUtils.spec.ts` (NEW)

### Task 1.1 — Create pure helper + test

**Claim:**
```
node scripts/mutex.cjs claim lib/catalogue/filterUtils.ts cascade_pane_1
node scripts/mutex.cjs claim lib/catalogue/__tests__/filterUtils.spec.ts cascade_pane_1
```

**Test first** — create `lib/catalogue/__tests__/filterUtils.spec.ts`:
```ts
import { describe, it, expect } from "vitest";
import { buildValidFilterFields, stripUnknownFilters } from "@/lib/catalogue/filterUtils";

describe("filterUtils (B3 / T5.1)", () => {
  const filterGroups = [
    { field: "brand", label: "Brand", options: [] },
    { field: "type", label: "Type", options: [] },
  ];

  describe("buildValidFilterFields", () => {
    it("always includes built-in fields priceRange and stockMin", () => {
      const valid = buildValidFilterFields([]);
      expect(valid.has("priceRange")).toBe(true);
      expect(valid.has("stockMin")).toBe(true);
    });
    it("includes dynamic fields from filter groups", () => {
      const valid = buildValidFilterFields(filterGroups);
      expect(valid.has("brand")).toBe(true);
      expect(valid.has("type")).toBe(true);
    });
  });

  describe("stripUnknownFilters", () => {
    it("keeps known filter entries unchanged", () => {
      const valid = buildValidFilterFields(filterGroups);
      const entries = ["brand:sennheiser", "priceRange:min:1000", "stockMin:3"];
      expect(stripUnknownFilters(entries, valid)).toEqual(entries);
    });
    it("removes entries with unknown fields", () => {
      const valid = buildValidFilterFields(filterGroups);
      const entries = ["brand:sennheiser", "foo:bar", "unknown:value"];
      expect(stripUnknownFilters(entries, valid)).toEqual(["brand:sennheiser"]);
    });
    it("removes malformed entries with no colon", () => {
      const valid = buildValidFilterFields(filterGroups);
      expect(stripUnknownFilters(["malformed"], valid)).toEqual([]);
    });
  });
});
```

**Confirm FAILS:** `npx vitest run lib/catalogue/__tests__/filterUtils.spec.ts` → module not found.

**Implement** — create `lib/catalogue/filterUtils.ts`:
```ts
// Client-side URL filter reconciliation helpers (B3 / T5.1).
// Pure functions — no React, no nuqs. Safe to unit-test without providers.

/** Built-in filter fields that are always valid regardless of CMS config. */
const BUILT_IN_FILTER_FIELDS = ["priceRange", "stockMin"] as const;

export interface MinimalFilterGroup {
  field: string;
}

/**
 * Build the set of valid filter field names from the current category's filter
 * groups plus the built-in slider fields (priceRange, stockMin).
 */
export function buildValidFilterFields(filterGroups: MinimalFilterGroup[]): Set<string> {
  return new Set([
    ...BUILT_IN_FILTER_FIELDS,
    ...filterGroups.map((g) => g.field),
  ]);
}

/**
 * Remove entries from the `f` URL param array whose field is not in the valid
 * set. Malformed entries (no colon) are also removed.
 */
export function stripUnknownFilters(entries: string[], validFields: Set<string>): string[] {
  return entries.filter((entry) => {
    const i = entry.indexOf(":");
    if (i === -1) return false;
    return validFields.has(entry.slice(0, i));
  });
}
```

**Verify PASSES:** `npx vitest run lib/catalogue/__tests__/filterUtils.spec.ts`

**DoD:** both helpers exported, test green.

**Release:**
```
node scripts/mutex.cjs release lib/catalogue/filterUtils.ts cascade_pane_1
node scripts/mutex.cjs release lib/catalogue/__tests__/filterUtils.spec.ts cascade_pane_1
```

---

## Phase 2 — Wire T5.1 + T5.6 + T6.2 into CategoryPageClient (TIER 2)

**All three tasks touch `CategoryPageClient.tsx`. Claim once, make all changes, release once.**

**Symptoms addressed:**
- **T5.1 wire:** Unknown `f=` params removed from URL once filter groups are known.
- **T5.6 (B13):** Navigating between categories (soft nav) carries stale `f`/`sort`/`page`. Detect slug change via `useParams`, reset all facets.
- **T6.2 scroll:** Sort or page change does not scroll the user to the top of the results. Detect via `useSearchParams`, fire `window.scrollTo`.

**Current state of `CategoryPageClient.tsx` (after Phase 0 restore):**
- Imports: `React, { useState }`, several component imports, `useFilterPending`, `totalPagesFor`.
- Hook calls: `useState` for drawer, `useFilterPending` for isPending.
- No `useEffect`, no `useRef`, no `useSearchParams`, no `useParams`, no `useFilterNuqs`.

**Claim:**
```
node scripts/mutex.cjs claim "app/(store)/products/[...slug]/CategoryPageClient.tsx" cascade_pane_1
```

**READ the full file first.** Confirm it is not truncated (ends with `}`).

### Change 1 — Expand the React import

Find:
```ts
import React, { useState } from 'react';
```
Replace with:
```ts
import React, { useState, useEffect, useRef } from 'react';
```

### Change 2 — Add three new imports after existing imports

Find the line:
```ts
import { useFilterPending } from '@/app/components/features/filters/useFilterNuqs';
```
Replace with:
```ts
import { useFilterPending, useFilterNuqs } from '@/app/components/features/filters/useFilterNuqs';
```

Then add two new import lines directly after the `useFilterPending` import line:
```ts
import { useSearchParams, useParams } from 'next/navigation';
import { buildValidFilterFields, stripUnknownFilters } from '@/lib/catalogue/filterUtils';
```

### Change 3 — Add hooks inside the component body

Find:
```ts
  const isPending = useFilterPending();
```
Replace with:
```ts
  const isPending = useFilterPending();

  // T5.1/T5.6: access URL filter state for reconciliation and slug-change reset
  const {
    filters: activeUrlFilters,
    setFilters,
    clearAllFilters,
    handleSortChange,
  } = useFilterNuqs();

  // T6.2: scroll-to-top when sort or page changes
  const searchParams = useSearchParams();
  const currentSort = searchParams.get('sort');
  const currentPageParam = searchParams.get('page');
  const prevSortRef = useRef(currentSort);
  const prevPageRef = useRef(currentPageParam);

  useEffect(() => {
    const sortChanged = prevSortRef.current !== currentSort;
    const pageChanged = prevPageRef.current !== currentPageParam;
    prevSortRef.current = currentSort;
    prevPageRef.current = currentPageParam;
    if (sortChanged || pageChanged) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [currentSort, currentPageParam]);

  // T5.1 (B3): strip unknown URL filters once filter groups are known
  // `filters` (prop) = FilterGroup[] from server; `activeUrlFilters` = current ?f= entries
  useEffect(() => {
    if (!activeUrlFilters || activeUrlFilters.length === 0) return;
    const validFields = buildValidFilterFields(filters);
    const cleaned = stripUnknownFilters(activeUrlFilters, validFields);
    if (cleaned.length !== activeUrlFilters.length) {
      setFilters(cleaned);
    }
  }, [filters, activeUrlFilters, setFilters]);

  // T5.6 (B13): reset all facets on category (slug) change — prevents stale params
  const params = useParams();
  const slugStr = Array.isArray(params?.slug)
    ? (params.slug as string[]).join('/')
    : String(params?.slug ?? '');
  const prevSlugRef = useRef(slugStr);

  useEffect(() => {
    if (prevSlugRef.current === slugStr) return; // skip initial mount
    prevSlugRef.current = slugStr;
    clearAllFilters();          // clears ?f= and ?page=
    handleSortChange('featured'); // clears ?sort=
  }, [slugStr, clearAllFilters, handleSortChange]);
```

### Change 4 — Pass `isOpen` to `<MobileControlsBar>` (needed for T7.3)

Find:
```tsx
          <MobileControlsBar
            productCount={totalCount}
            onOpenFilters={() => setIsDrawerOpen(true)}
          />
```
Replace with:
```tsx
          <MobileControlsBar
            productCount={totalCount}
            onOpenFilters={() => setIsDrawerOpen(true)}
            isOpen={isDrawerOpen}
          />
```

### Verify

No cheap unit test for these behaviours. Run the matrix spec to confirm no regressions:
```
npx vitest run tests/catalogue/filters-sorting-matrix.spec.ts
```
Should pass (all `it.todo` placeholders, zero failures).

**Manual verification checklist (do NOT block on this — just note it):**
- [ ] Navigate to a category, add `?f=bogus:value` to URL → bogus param disappears after load
- [ ] Navigate from one category to another → `?f=`, `?sort=`, `?page=` all clear
- [ ] Change sort or page → page scrolls to top

**Release:**
```
node scripts/mutex.cjs release "app/(store)/products/[...slug]/CategoryPageClient.tsx" cascade_pane_1
```

---

## Phase 3 — T7.3.A: Focus trap dynamic query (TIER 2)

**Symptom:** `MobileFilterDrawer` captures `focusableElements` once when `isOpen` changes. If a checkbox re-renders or a dynamic element is added/removed, the cached list is stale and Tab can escape the drawer or stop responding.

**Fix:** Move the element query inside `handleTabKey` so it re-runs on every Tab keypress — always fresh.

**File:** `app/components/features/filters/MobileFilterDrawer.tsx`

**Claim:**
```
node scripts/mutex.cjs claim app/components/features/filters/MobileFilterDrawer.tsx cascade_pane_1
```

**READ the file first.** Locate the second `useEffect` (the focus trap one — depends on `[isOpen]`).

Find the entire second `useEffect` block:
```ts
  // Focus trap
  useEffect(() => {
    if (!isOpen) return;

    const drawer = document.querySelector('[data-testid="mobile-filter-drawer"]') as HTMLElement;
    if (!drawer) return;

    const focusableElements = drawer.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    // Focus first element when drawer opens
    firstElement?.focus();
    drawer.addEventListener('keydown', handleTabKey);
    return () => drawer.removeEventListener('keydown', handleTabKey);
  }, [isOpen]);
```

Replace with:
```ts
  // Focus trap — queries focusable nodes on every Tab keypress (dynamic content safe)
  useEffect(() => {
    if (!isOpen) return;

    const drawer = document.querySelector('[data-testid="mobile-filter-drawer"]') as HTMLElement;
    if (!drawer) return;

    const getFocusable = (): HTMLElement[] =>
      Array.from(
        drawer.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      );

    // Focus first element when drawer opens
    getFocusable()[0]?.focus();

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const els = getFocusable();
      const first = els[0];
      const last = els[els.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    drawer.addEventListener('keydown', handleTabKey);
    return () => drawer.removeEventListener('keydown', handleTabKey);
  }, [isOpen]);
```

**Verify:** `npx vitest run tests/catalogue/filters-sorting-matrix.spec.ts` — should still pass.

---

## Phase 4 — T7.3.B: aria-expanded + aria-controls (TIER 2)

**Symptom:** The mobile "Filters" button has no `aria-expanded` or `aria-controls`, so screen readers cannot announce the drawer's open/closed state or navigate to it.

**Files:**
1. `app/components/features/filters/MobileFilterDrawer.tsx` — add `id` to the `<aside>`
2. `app/components/features/filters/MobileControlsBar.tsx` — add `isOpen` prop + aria attributes

Both files must be in Phase 3's **same claim session** if you haven't released yet — or re-claim now.

**Claim (if not already held):**
```
node scripts/mutex.cjs claim app/components/features/filters/MobileFilterDrawer.tsx cascade_pane_1
node scripts/mutex.cjs claim app/components/features/filters/MobileControlsBar.tsx cascade_pane_1
```

### MobileFilterDrawer.tsx — add `id` to `<aside>`

Find:
```tsx
      <aside
        data-testid="mobile-filter-drawer"
```
Replace with:
```tsx
      <aside
        id="mobile-filter-drawer"
        data-testid="mobile-filter-drawer"
```

### MobileControlsBar.tsx — add `isOpen` prop + aria attributes

Find the props interface:
```ts
interface MobileControlsBarProps {
  productCount: number;
  onOpenFilters: () => void;
}
```
Replace with:
```ts
interface MobileControlsBarProps {
  productCount: number;
  onOpenFilters: () => void;
  isOpen: boolean;
}
```

Find the function signature:
```ts
export function MobileControlsBar({
  productCount,
  onOpenFilters,
}: MobileControlsBarProps) {
```
Replace with:
```ts
export function MobileControlsBar({
  productCount,
  onOpenFilters,
  isOpen,
}: MobileControlsBarProps) {
```

Find the Filters button opening tag (the one with `onClick={onOpenFilters}`):
```tsx
      <button
        type="button"
        onClick={onOpenFilters}
        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 btn-secondary"
      >
```
Replace with:
```tsx
      <button
        type="button"
        onClick={onOpenFilters}
        aria-expanded={isOpen}
        aria-controls="mobile-filter-drawer"
        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 btn-secondary"
      >
```

**Verify:** `npx vitest run tests/catalogue/filters-sorting-matrix.spec.ts`

**Release:**
```
node scripts/mutex.cjs release app/components/features/filters/MobileFilterDrawer.tsx cascade_pane_1
node scripts/mutex.cjs release app/components/features/filters/MobileControlsBar.tsx cascade_pane_1
```

---

## Phase 5 — T7.3.C: Descriptive aria-label on filter chips (TIER 2)

**Symptom:** Filter chip remove buttons have `aria-label="Remove filter"` — all identical. Screen readers cannot distinguish which filter is being removed.

**File:** `app/components/features/filters/ActiveFilters.tsx`

**Claim:**
```
node scripts/mutex.cjs claim app/components/features/filters/ActiveFilters.tsx cascade_pane_1
```

Find the `<button>` element inside `parsedFilters?.map(...)`:
```tsx
          <button
            key={filterKey}
            type="button"
            onClick={() => removeFilter(filter.field, filter.value)}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-elevated border border-brand-400 rounded-lg type-caption text-primary hover:border-brand-200 transition-colors cursor-pointer"
          >
            <span>{formatFilterLabel(filter)}</span>
            <span aria-label={`Remove filter`} className="text-caption hover:text-primary transition-colors">×</span>
          </button>
```
Replace with:
```tsx
          <button
            key={filterKey}
            type="button"
            onClick={() => removeFilter(filter.field, filter.value)}
            aria-label={`Remove filter: ${formatFilterLabel(filter)}`}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-elevated border border-brand-400 rounded-lg type-caption text-primary hover:border-brand-200 transition-colors cursor-pointer"
          >
            <span aria-hidden="true">{formatFilterLabel(filter)}</span>
            <span aria-hidden="true" className="text-caption hover:text-primary transition-colors">×</span>
          </button>
```

Changes:
- `aria-label` moved from inner `<span>` to the `<button>`, now includes the filter name.
- Both inner `<span>` elements get `aria-hidden="true"` so screen readers only read the button label once.

**Verify:** `npx vitest run tests/catalogue/filters-sorting-matrix.spec.ts`

**Release:**
```
node scripts/mutex.cjs release app/components/features/filters/ActiveFilters.tsx cascade_pane_1
```

---

## Phase 6 — T7.2.A: Keyboard debounce on PriceRangeSlider (TIER 2)

**Symptom:** Arrow key presses on the price slider trigger `commitRange` on every keypress (because `isDragging.current` is false during keyboard use). Each commit fires `startTransition` → `setFilters` → server re-render. Rapid arrow-keying causes excessive server round trips.

**Fix:** Mirror the existing drag pattern with a `isKeyboardRef`. While arrow keys are held, defer the commit. Fire once on `keyUp`.

**File:** `app/components/features/filters/PriceRangeSlider.tsx`

**Claim:**
```
node scripts/mutex.cjs claim app/components/features/filters/PriceRangeSlider.tsx cascade_pane_1
```

### Change 1 — Add isKeyboardRef

Find:
```ts
  const isDragging = useRef(false);
```
Replace with:
```ts
  const isDragging = useRef(false);
  const isKeyboardRef = useRef(false);
```

### Change 2 — Guard handleMinChange

Find:
```ts
  const handleMinChange = useCallback((newMin: number) => {
    const validMin = Math.min(newMin, localMax - 1);
    setLocalMin(validMin);

    if (!isDragging.current) {
      commitRange(validMin, localMax);
    }
  }, [localMax, commitRange]);
```
Replace with:
```ts
  const handleMinChange = useCallback((newMin: number) => {
    const validMin = Math.min(newMin, localMax - 1);
    setLocalMin(validMin);

    if (!isDragging.current && !isKeyboardRef.current) {
      commitRange(validMin, localMax);
    }
  }, [localMax, commitRange]);
```

### Change 3 — Guard handleMaxChange

Find:
```ts
  const handleMaxChange = useCallback((newMax: number) => {
    const validMax = Math.max(newMax, localMin + 1);
    setLocalMax(validMax);

    if (!isDragging.current) {
      commitRange(localMin, validMax);
    }
  }, [localMin, commitRange]);
```
Replace with:
```ts
  const handleMaxChange = useCallback((newMax: number) => {
    const validMax = Math.max(newMax, localMin + 1);
    setLocalMax(validMax);

    if (!isDragging.current && !isKeyboardRef.current) {
      commitRange(localMin, validMax);
    }
  }, [localMin, commitRange]);
```

### Change 4 — Add keyboard handlers to the MIN input

The min input has `data-testid="price-min-slider"`. It currently ends with:
```tsx
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
            onMouseUp={handleDragEnd}
            onTouchEnd={handleDragEnd}
```
Add two new handlers immediately after `onTouchEnd={handleDragEnd}`:
```tsx
            onKeyDown={(e) => {
              if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) {
                isKeyboardRef.current = true;
              }
            }}
            onKeyUp={() => {
              if (isKeyboardRef.current) {
                isKeyboardRef.current = false;
                commitRange(localMin, localMax);
              }
            }}
```

### Change 5 — Add keyboard handlers to the MAX input

The max input has `data-testid="price-max-slider"`. Same pattern — add after its `onTouchEnd={handleDragEnd}`:
```tsx
            onKeyDown={(e) => {
              if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) {
                isKeyboardRef.current = true;
              }
            }}
            onKeyUp={() => {
              if (isKeyboardRef.current) {
                isKeyboardRef.current = false;
                commitRange(localMin, localMax);
              }
            }}
```

**Verify:** `npx vitest run tests/catalogue/filters-sorting-matrix.spec.ts`

Manual: focus a price slider, hold arrow key → URL updates only once per key-release, not per tick.

**Release:**
```
node scripts/mutex.cjs release app/components/features/filters/PriceRangeSlider.tsx cascade_pane_1
```

---

## Phase 7 — T7.2.B: Keyboard debounce on StockMinimumSlider (TIER 2)

**Symptom:** Same as PriceRangeSlider but for the stock slider.

**File:** `app/components/features/filters/StockMinimumSlider.tsx`

**Claim:**
```
node scripts/mutex.cjs claim app/components/features/filters/StockMinimumSlider.tsx cascade_pane_1
```

### Change 1 — Add isKeyboardRef

Find:
```ts
  const isDragging = useRef(false);
```
Replace with:
```ts
  const isDragging = useRef(false);
  const isKeyboardRef = useRef(false);
```

### Change 2 — Guard handleChange

Find:
```ts
  const handleChange = useCallback((newValue: number) => {
    setLocalValue(newValue);
    if (!isDragging.current) {
      commitValue(newValue);
    }
  }, [commitValue]);
```
Replace with:
```ts
  const handleChange = useCallback((newValue: number) => {
    setLocalValue(newValue);
    if (!isDragging.current && !isKeyboardRef.current) {
      commitValue(newValue);
    }
  }, [commitValue]);
```

### Change 3 — Add keyboard handlers to the stock input

The stock input has `data-testid="stock-minimum-slider"`. Add after its `onTouchEnd={handleDragEnd}`:
```tsx
            onKeyDown={(e) => {
              if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) {
                isKeyboardRef.current = true;
              }
            }}
            onKeyUp={() => {
              if (isKeyboardRef.current) {
                isKeyboardRef.current = false;
                commitValue(localValue);
              }
            }}
```

**Verify:** `npx vitest run tests/catalogue/filters-sorting-matrix.spec.ts`

**Release:**
```
node scripts/mutex.cjs release app/components/features/filters/StockMinimumSlider.tsx cascade_pane_1
```

---

## Summary Table

| Phase | Task | Files | Tier | Test |
|---|---|---|---|---|
| **0** | Restore truncated files | CategoryPageClient, ProductsSection | BLOCKER | `python3 verify` |
| **1** | T5.1 pure helpers | `lib/catalogue/filterUtils.ts` + spec | TIER 1 | `npx vitest run lib/catalogue/__tests__/filterUtils.spec.ts` |
| **2** | T5.1 wire + T5.6 + T6.2 scroll | `CategoryPageClient.tsx` | TIER 2 | matrix spec + manual |
| **3** | T7.3.A focus trap | `MobileFilterDrawer.tsx` | TIER 2 | matrix spec |
| **4** | T7.3.B aria-expanded | `MobileFilterDrawer.tsx`, `MobileControlsBar.tsx` | TIER 2 | matrix spec |
| **5** | T7.3.C aria-label chips | `ActiveFilters.tsx` | TIER 2 | matrix spec |
| **6** | T7.2.A keyboard slider | `PriceRangeSlider.tsx` | TIER 2 | matrix spec + manual |
| **7** | T7.2.B keyboard slider | `StockMinimumSlider.tsx` | TIER 2 | matrix spec + manual |

**Execution order:** Phase 0 → 1 → 2 → 3+4 (same file claim) → 5 → 6 → 7.

Phases 3 and 4 both touch `MobileFilterDrawer.tsx` — claim it once and do both changes before releasing.

---

## Escalation Rule

If at any point the actual file content differs from what this plan shows, **STOP and report the discrepancy** rather than guessing. The plan was written against the git HEAD at commit `84e21558`.
