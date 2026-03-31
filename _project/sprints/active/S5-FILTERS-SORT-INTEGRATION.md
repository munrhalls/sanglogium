# Sprint: Filters & Sort UI Integration

**Sprint ID:** S5-FILTERS-SORT-INTEGRATION
**Status:** READY
**Estimated Duration:** 3-4 hours
**Dependencies:** None — this is a pure UI integration sprint

---

## Executive Summary

The **data layer is fully implemented**: `useFilterUrl.ts` provides complete URL manipulation, `getProductsByVfsKeys.ts` accepts sort/filter params, and `page.tsx` parses searchParams.

**The gap:** UI components exist but are **not connected to the working data layer**.
- `SortDropdown` renders but doesn't call `setSort`
- `ActiveFilters` is a skeleton with no functionality
- `MobileFilterDrawer` lacks sticky footer, escape key, and focus trap

This sprint connects the existing UI to the working data layer and ensures full design system compliance.

---

## Scope Contract

### Current State vs Target State

| Component | Current State | Gap | Target State |
|-----------|---------------|-----|--------------|
| `SortDropdown.tsx` | UI renders with `input-select` class, has `currentSort` prop | ❌ Not connected to `useFilterUrl` | Calls `setSort()` on change, URL updates |
| `ActiveFilters.tsx` | Skeleton only (`border-2 border-blue-500`) | ❌ No functionality, no styling | Shows active filter pills, removable, clear all |
| `MobileFilterDrawer.tsx` | Renders, backdrop works, toggles filters | ❌ No sticky footer, no escape key, no focus trap | Professional drawer with full a11y |
| `MobileFilterDrawer.tsx` | Uses `text-h4 font-semibold text-headline` | ❌ Design system violation | Uses `type-overline` |

### IN SCOPE

1. **SortDropdown integration** — Add `useFilterUrl()` hook, wire `onChange` to `setSort()`
2. **ActiveFilters full implementation** — Derive from URL, show pills, implement remove/clear all
3. **MobileFilterDrawer polish** — Sticky footer, escape key handler, focus trap, design system compliance
4. **Design system token enforcement** — Replace `text-h4 font-semibold text-headline` with `type-overline`

### OUT OF SCOPE (Explicitly Forbidden)

- ❌ No changes to `useFilterUrl.ts` — it's complete
- ❌ No changes to `getProductsByVfsKeys.ts` — it's complete
- ❌ No changes to `page.tsx` — it's complete
- ❌ No changes to `FilterSidebar.tsx` — already compliant
- ❌ No new URL param formats
- ❌ No changes to filter logic or data structures
- ❌ No animations beyond existing transitions

---

## Regression Risk Analysis

### Files at Risk

| File | Risk Level | Risk Description | Mitigation |
|------|------------|------------------|------------|
| `SortDropdown.tsx` | **MEDIUM** | Adding `useFilterUrl()` import and `onChange` handler | Verify sort still works at 1280px and 375px |
| `ActiveFilters.tsx` | **LOW** | New component — no existing consumers to break | Test empty state, single filter, multiple filters |
| `MobileFilterDrawer.tsx` | **MEDIUM** | Adding escape key handler could interfere with existing keyboard nav | Test Tab cycling, Escape closing, no double triggers |
| `CategoryPageClient.tsx` | **LOW** | Passing `filterGroups` to `ActiveFilters` | Verify prop flow doesn't break |

### Regression Test Requirements

```typescript
// tests/regression/filters-integration.test.ts

describe('S5 Regression: Filter UI Integration', () => {

  // R1: URL params still parsed correctly (data layer untouched)
  it('R1: existing URL format ?s=displayPrice:asc&f=brand:sennheiser works', async () => {
    // Navigate to URL with params, verify products filtered correctly
  });

  // R2: SortDropdown renders without error
  it('R2: SortDropdown renders at all breakpoints', () => {
    // Render at 1280px and 375px, verify no errors
  });

  // R3: ActiveFilters empty state
  it('R3: ActiveFilters shows nothing when no filters active', () => {
    render(<ActiveFilters filterGroups={mockFilters} />);
    expect(screen.queryByTestId('filter-pill')).not.toBeInTheDocument();
  });

  // R4: Mobile drawer doesn't break desktop
  it('R4: MobileFilterDrawer hidden on lg breakpoint', () => {
    // viewport 1280px, verify drawer not in DOM or hidden
  });
});
```

---

## 3-Pass Implementation Architecture

### Pass 1 — Skeleton Pass (No Styling Changes)

**Goal:** Verify all components render with semantic HTML, minimal changes only.

**DoD Pass 1:**
- [ ] `SortDropdown` renders `<select>` with debug border, no styling logic added
- [ ] `ActiveFilters` renders `<div>` with filter pills as `<button>` elements, debug border
- [ ] `MobileFilterDrawer` renders `<aside>` with header/content/footer, debug border
- [ ] All components compose without layout changes

**Files Modified:**
- `app/components/features/filters/SortDropdown.tsx` — Add `useFilterUrl` import only
- `app/components/features/filters/ActiveFilters.tsx` — Basic structure with debug border
- `app/components/features/filters/MobileFilterDrawer.tsx` — Verify existing structure

---

### Pass 2 — Data Pass (Integration Only, No Styling)

**Goal:** UI connects to working data layer. URL updates verified via network tab.

**DoD Pass 2:**
- [ ] `SortDropdown` calls `setSort()` on change, URL updates with `?s=`
- [ ] `ActiveFilters` derives active filters from `useFilterUrl().currentFilters`
- [ ] `ActiveFilters` pill X button calls `removeFilter()`
- [ ] `ActiveFilters` "Clear all" calls `clearAllFilters()`
- [ ] `ActiveFilters` conditionally renders based on `currentFilters.length`
- [ ] `CategoryPageClient` passes `filterGroups` to `ActiveFilters`
- [ ] `MobileFilterDrawer` escape key closes drawer

**Files Modified:**
- `app/components/features/filters/SortDropdown.tsx` — Wire `onChange` to `setSort`
- `app/components/features/filters/ActiveFilters.tsx` — Full logic implementation
- `app/components/features/filters/MobileFilterDrawer.tsx` — Add escape key handler
- `app/(store)/products/[...slug]/CategoryPageClient.tsx` — Pass props to ActiveFilters

---

### Pass 3 — Build Pass (Design System Compliance)

**Build Order:** `SortDropdown` → `ActiveFilters` → `MobileFilterDrawer`

#### Component: SortDropdown

**Layer 1 — Structure:** (Already complete)
- Semantic `<select>` with `<label>` exists
- Options: Featured, Price: Low to High, Price: High to Low, Name: A-Z, Name: Z-A

**Layer 2 — Layout:** (Already complete)
- `w-full sm:w-[200px]` container
- Flex parent positions right-aligned on desktop

**Layer 3 — Surface:** (Already complete)
- Uses `input-select` class correctly

**Layer 4 — Interaction:**
- [ ] `onChange` calls `setSort()` from `useFilterUrl()`
- [ ] `value` synced from `currentSort`
- [ ] Test: Change sort → URL updates → products re-sort

#### Component: ActiveFilters

**Layer 1 — Structure:**
- [ ] `<div data-testid="active-filters">` container
- [ ] Filter pills as `<button type="button" data-testid="filter-pill">` with nested `<span>` for X
- [ ] "Clear all" as `<button type="button" data-testid="clear-all">`
- [ ] Conditional render: only when `currentFilters.length > 0`

**Layer 2 — Layout:**
- [ ] Container: `flex flex-wrap gap-2 mb-6`
- [ ] Pills inline, wrap on overflow
- [ ] Clear all right-aligned or inline at end

**Layer 3 — Surface (Design System Compliance):**
- [ ] Pill: `bg-surface-card border border-secondary-700 rounded-md px-3 py-1`
- [ ] Pill text: `text-body text-brand-200`
- [ ] X icon: `text-secondary-500 hover:text-error-500 ml-2` (destructive action)
- [ ] "Clear all": `text-body text-secondary-400 hover:text-brand-400 underline`

**Layer 4 — Interaction:**
- [ ] Click pill X → calls `removeFilter(field, value)` → URL update
- [ ] Click "Clear all" → calls `clearAllFilters()` → all filter params removed
- [ ] Pills only render when `currentFilters.length > 0`

#### Component: MobileFilterDrawer

**Layer 1 — Structure:** (Already complete)
- `<aside>` with fixed positioning
- Header with title + close button
- Scrollable content area
- Footer with "Show Results" button

**Layer 2 — Layout:**
- [ ] Footer: `sticky bottom-0` (CRITICAL — currently just `p-4 border-t`)
- [ ] Content area: `flex-1 overflow-y-auto` (already correct)

**Layer 3 — Surface (Design System Compliance):**
- [ ] Header title: Replace `text-h4 font-semibold text-headline` with `type-overline`
- [ ] Footer: `border-t border-secondary-700 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]`
- [ ] Backdrop: `bg-surface-page/80 backdrop-blur-sm` (currently `bg-black/50` — verify against design system)

**Layer 4 — Interaction:**
- [ ] `isOpen` prop controls `translate-x-0` vs `-translate-x-full` (already implemented)
- [ ] Backdrop click calls `onClose()` (already implemented)
- [ ] Close button calls `onClose()` (already implemented)
- [ ] **Escape key closes drawer** — NEW: useEffect with keydown listener
- [ ] **Focus trap** — NEW: tab cycles within drawer when open

---

## Design System Compliance Requirements

### Violations to Fix

| Location | Current | Required |
|----------|---------|----------|
| `MobileFilterDrawer.tsx:51` | `text-h4 font-semibold text-headline` | `type-overline` |
| `MobileFilterDrawer.tsx:82` | `text-small font-medium text-secondary` | `type-overline` |

### ActiveFilters Tokens

| Element | Token/Classes |
|---------|---------------|
| Pill container | `bg-surface-card border border-secondary-700 rounded-md px-3 py-1 flex items-center gap-2` |
| Pill text | `text-body text-brand-200` |
| X button | `text-secondary-500 hover:text-error-500 transition-colors` |
| Clear all | `text-body text-secondary-400 hover:text-brand-400 underline ml-auto` |

### MobileFilterDrawer Tokens

| Element | Token/Classes |
|---------|---------------|
| Header title | `type-overline` |
| Footer | `sticky bottom-0 p-4 border-t border-secondary-700 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]` |

---

## File Modifications Summary

### Medium Risk (Logic Changes)

```
app/components/features/filters/SortDropdown.tsx
  - Add: import { useFilterUrl } from './useFilterUrl'
  - Add: const { currentSort, setSort } = useFilterUrl()
  - Modify: <select onChange={(e) => setSort(e.target.value)} value={currentSort}>
```

```
app/components/features/filters/ActiveFilters.tsx
  - Replace entire file: Skeleton → Full implementation
  - Add: import { useFilterUrl } from './useFilterUrl'
  - Add: Logic to map currentFilters to pill UI
  - Add: removeFilter() and clearAllFilters() handlers
```

```
app/components/features/filters/MobileFilterDrawer.tsx
  - Add: useEffect for escape key listener
  - Add: useEffect for focus trap
  - Modify: Footer className for sticky positioning
  - Replace: Header title className → type-overline
```

### Low Risk (Props Flow)

```
app/(store)/products/[...slug]/CategoryPageClient.tsx
  - Modify: <ActiveFilters filterGroups={filters} /> (add prop)
```

---

## Verification Matrix

### Regression Tests (Run First)

| ID | Test | Evidence |
|----|------|----------|
| R1 | URL params `?s=displayPrice:asc&f=brand:sennheiser` still work | Products filtered and sorted correctly |
| R2 | SortDropdown renders at 1280px and 375px | No console errors, visual inspection |
| R3 | ActiveFilters empty state | No pills rendered when no filters |
| R4 | Mobile drawer hidden on desktop | `lg:hidden` class effective at 1024px+ |

### Layer Verification (Per Pass)

| Layer | Component | Verification |
|-------|-----------|--------------|
| L1 | SortDropdown | Debug border visible, semantic HTML |
| L2 | ActiveFilters | Pills wrap with gap-2, don't overflow |
| L2 | MobileDrawer | Footer sticky at bottom without scroll |
| L3 | ActiveFilters | bg-surface-card, border-secondary-700 |
| L3 | MobileDrawer | type-overline on header |
| L4 | SortDropdown | URL updates on change |
| L4 | ActiveFilters | X removes filter, Clear All removes all |
| L4 | MobileDrawer | Escape closes, focus cycles |

### Journey Tests (Final Verification)

| ID | Journey | Expected Result |
|----|---------|-----------------|
| J1 | Load `/products/headphones` | Sort shows "Featured", no active filters |
| J2 | Select "Price: Low to High" | URL: `?s=displayPrice:asc`, products re-sort |
| J3 | Check "Sennheiser" brand | URL: `?f=brand:sennheiser`, count decreases, pill appears |
| J4 | Check "Dynamic" driver + Sennheiser | URL: `?f=brand:sennheiser&f=driverType:dynamic`, both pills |
| J5 | Click X on Sennheiser pill | Sennheiser removed, Dynamic remains |
| J6 | Click "Clear all" | All filters removed, URL clean |
| J7 | Mobile: Tap "Filters" button | Drawer slides in from left |
| J8 | Mobile: Tap overlay | Drawer closes |
| J9 | Mobile: Press Escape | Drawer closes |
| J10 | Copy URL with filters | Paste in new tab, same filters applied |

---

## Implementation Sequence

### Phase 0: Regression Tests (15 min)
1. Run R1-R4 to establish baseline
2. All must pass with existing code

### Phase 1: Pass 1 — Skeleton (15 min)
1. Verify all components render with debug borders
2. No functional changes

### Phase 2: Pass 2 — Data (60 min)
**SortDropdown (15 min)**
- Add `useFilterUrl()` hook
- Wire `onChange` to `setSort()`
- Wire `value` to `currentSort`

**ActiveFilters (30 min)**
- Implement full component with `useFilterUrl()`
- Derive pills from `currentFilters`
- Implement remove and clear all handlers

**MobileFilterDrawer (15 min)**
- Add escape key useEffect
- Add focus trap useEffect

### Phase 3: Pass 3 — Build (90 min)
**SortDropdown (15 min)**
- Verify `input-select` class compliance
- Test URL sync

**ActiveFilters (45 min)**
- Layer 1: Structure (10 min)
- Layer 2: Layout (10 min)
- Layer 3: Surface (15 min) — Apply design system tokens
- Layer 4: Interaction (10 min) — Verify remove/clear all

**MobileFilterDrawer (30 min)**
- Layer 2: Layout (5 min) — Sticky footer
- Layer 3: Surface (15 min) — type-overline, shadows
- Layer 4: Interaction (10 min) — Escape, focus trap

### Phase 4: Verification (30 min)
1. Run regression tests R1-R4
2. Complete Journey Tests J1-J10
3. Verify design system compliance
4. Lock sprint

---

## Success Criteria

- [ ] All regression tests pass (R1-R4)
- [ ] All journey tests pass (J1-J10)
- [ ] SortDropdown updates URL on change
- [ ] ActiveFilters shows pills for each active filter
- [ ] ActiveFilters remove button works
- [ ] ActiveFilters clear all works
- [ ] Mobile drawer has sticky footer with shadow
- [ ] Mobile drawer escape key closes
- [ ] Mobile drawer focus trap works
- [ ] No `text-h4 font-semibold text-headline` violations remain
- [ ] 0 console errors
- [ ] 0 TypeScript errors

---

## Lock Criteria

Sprint is **LOCKED** when:
1. User verifies all regression tests pass
2. User verifies all journey tests pass
3. User comments: `LOCKED [date] — User: [name]`

---

## Next Sprint Trigger

**Sprint 6 UNLOCKED when:**
- S5 reaches LOCKED status
- Filter/sort UI fully functional and shareable via URL

**Sprint 6 Scope:** Product Detail Page — Related products carousel, full specs table

---

*Begin with Phase 0: Regression Tests*
