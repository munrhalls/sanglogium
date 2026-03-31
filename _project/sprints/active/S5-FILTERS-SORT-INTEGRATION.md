# Sprint: Filters & Sorting URL Integration + Design System Compliance

**Sprint ID:** S5-FILTERS-SORT-INTEGRATION  
**Status:** READY  
**Estimated Duration:** 4-6 hours  
**Dependencies:** S4-FILTERS-SORT structure exists (components scaffolded, design system locked)

---

## Executive Summary

Current filters/sorting UI exists but is **non-functional** - components render visually but lack URL state integration. Sort dropdown displays options but doesn't update URL. Active filters show hardcoded mock data. Product queries don't accept sort/filter parameters.

This sprint makes the existing UI **fully functional** while bringing it into **strict design system compliance**.

---

## Scope Contract

### DELIVERABLE STATE

**Desktop (1280px):**
- Sort dropdown (top-right) updates URL `?sort=displayPrice:asc` and re-fetches products
- Active filter pills show real URL state, removable via X button
- Filter sidebar checkboxes update URL `?brand=sennheiser` and re-fetch
- Product count updates to reflect filtered results
- All styling uses `tailwind.config.ts` tokens (no inline styles)

**Mobile (375px):**
- Slide-in filter drawer with sticky "Show Results" footer
- Sort dropdown above product grid
- All interactions identical to desktop

### IN SCOPE

| Component | Current State | Target State |
|-----------|---------------|--------------|
| `SortDropdown.tsx` | Visual only, no URL logic | URL sync + sort re-fetch |
| `ActiveFilters.tsx` | Hardcoded mock filters | Real URL-derived state |
| `CategoryPageClient.tsx` | Static props | URL searchParams integration |
| `getProductsByVfsKeys.ts` | Keys only | Keys + sort + filter params |
| `page.tsx` | No searchParams | Accept + parse searchParams |
| `MobileFilterDrawer.tsx` | Static footer | Sticky footer with shadow |
| Design System | Partial compliance (mix of custom styles) | Full token compliance |

### OUT OF SCOPE (Explicitly Forbidden)

- ❌ Price range slider (deferred to L7)
- ❌ Multi-select beyond simple checkboxes
- ❌ Filter search/autocomplete
- ❌ Sort animations/transitions
- ❌ Filter persistence (localStorage)
- ❌ Complex AND/OR filter logic
- ❌ Any changes to ProductCard component
- ❌ Any changes to category navigation structure

---

## Regression Risk Analysis

### Files at Risk of Regression

| File | Risk Level | Risk Description | Mitigation Test |
|------|------------|------------------|-----------------|
| `getProductsByVfsKeys.ts` | **HIGH** | Signature change: adding `sort` and `filters` params | Test: Verify unfiltered query still returns all products |
| `page.tsx` | **HIGH** | Adding `searchParams` prop changes Next.js page signature | Test: Verify page renders without URL params |
| `CategoryPageClient.tsx` | **MEDIUM** | Props interface change (filters from URL, not hardcoded) | Test: Verify client component receives correct filter array |
| `ProductGrid.tsx` | **LOW** | Product count display (filtered vs unfiltered) | Test: Verify grid renders with empty array |
| `ShopLayout.tsx` | **LOW** | Sidebar layout class changes | Test: Verify layout doesn't break at 1024px breakpoint |

### Regression Test Requirements

```typescript
// tests/regression/filters-sort.integration.test.ts

describe('S5 Regression: Filters & Sort Integration', () => {
  
  // R1: getProductsByVfsKeys backwards compatibility
  it('R1: unfiltered query returns same products as before', async () => {
    const keys = ['o7c6baiuobsr7ni2y2vf22sh'];
    const products = await getProductsByVfsKeys(keys); // no sort/filter params
    expect(products.length).toBeGreaterThan(0);
    expect(products[0]).toHaveProperty('_id');
    expect(products[0]).toHaveProperty('name');
  });

  // R2: Category page renders without searchParams
  it('R2: category page renders with empty searchParams', async () => {
    const params = { slug: ['headphones', 'open-back'] };
    const searchParams = {}; // empty
    // Should not throw, should render
  });

  // R3: ProductGrid handles empty products
  it('R3: ProductGrid shows empty state when no products', () => {
    render(<ProductGrid products={[]} />);
    expect(screen.getByTestId('empty-products')).toBeInTheDocument();
  });

  // R4: URL params don't break existing links
  it('R4: existing category URLs still work', () => {
    const urls = [
      '/products/headphones',
      '/products/headphones/open-back',
    ];
    urls.forEach(url => {
      // Should resolve to valid page
    });
  });
});
```

---

## 3-Pass Implementation Architecture

### Pass 1 — Skeleton Pass (All Components, No Styling)

**Goal:** Components render with semantic HTML, debug borders only, zero styling logic.

**DoD Pass 1:**
- [ ] `SortDropdown` renders `<select>` with options, border-2 border-red-500
- [ ] `ActiveFilters` renders filter pills as `<button>` elements, border-2 border-blue-500
- [ ] `CategoryPageClient` accepts `searchParams` prop, passes to children, border-2 border-green-500
- [ ] `MobileFilterDrawer` renders aside with header/content/footer, border-2 border-purple-500
- [ ] `page.tsx` accepts `searchParams` in interface, passes to components
- [ ] All components compose without layout classes (stack vertically)

**Files Modified in Pass 1:**
- `app/(store)/products/[...slug]/page.tsx` - Add searchParams to interface
- `app/(store)/products/[...slug]/CategoryPageClient.tsx` - Accept searchParams
- `app/components/features/filters/SortDropdown.tsx` - Skeleton only
- `app/components/features/filters/ActiveFilters.tsx` - Skeleton only
- `app/components/features/filters/MobileFilterDrawer.tsx` - Skeleton only

---

### Pass 2 — Data Pass (All Components, Real Data, No Styling)

**Goal:** URL state flows through components, filters/sort update URL, products re-fetch.

**DoD Pass 2:**
- [ ] `page.tsx` parses `searchParams` into `{ sort, filters }`
- [ ] `getProductsByVfsKeys` accepts optional `sort` and `filters` params
- [ ] `SortDropdown` calls `router.push()` on change, URL updates with `?sort=value`
- [ ] `ActiveFilters` derives active filters from `searchParams`, not props
- [ ] `ActiveFilters` remove button deletes URL param, calls `router.push()`
- [ ] `ActiveFilters` "Clear all" removes all filter params
- [ ] `CategoryPageClient` passes URL-derived filters to `ActiveFilters`
- [ ] Product count updates when filters applied (verified via props flow)

**Files Modified in Pass 2:**
- `app/(store)/products/[...slug]/page.tsx` - Parse searchParams, pass to query
- `sanity/lib/products/getProductsByVfsKeys.ts` - Add sort/filter params to query
- `app/components/features/filters/SortDropdown.tsx` - Add URL change handler
- `app/components/features/filters/ActiveFilters.tsx` - Read from URL, handle removal
- `lib/filters/urlParams.ts` - NEW: Parse/build filter params (extract from Filters.tsx)

---

### Pass 3 — Build Pass (Per Component, Full Scope)

Build order: `SortDropdown` → `ActiveFilters` → `MobileFilterDrawer`

**Per-Component 4-Layer Sequence:**

#### Component: SortDropdown

**Layer 1 — Structure:**
- [ ] Semantic `<select>` with `<label>` (sr-only)
- [ ] Options: Featured, Price: Low to High, Price: High to Low, Name: A-Z, Name: Z-A

**Layer 2 — Layout:**
- [ ] `w-full sm:w-[200px]` container
- [ ] Flex parent positions right-aligned on desktop

**Layer 3 — Surface (Design System Compliance):**
- [ ] Replace inline styles with `input-select` component class
- [ ] Remove custom SVG background, use design system chevron
- [ ] `text-body text-brand-200` for text color

**Layer 4 — Interaction:**
- [ ] `onChange` updates URL via `router.push()`
- [ ] `value` synced from `searchParams.get('sort')`
- [ ] Disabled state while products loading (optional)

#### Component: ActiveFilters

**Layer 1 — Structure:**
- [ ] `<div>` with flex-wrap
- [ ] Filter pills as `<button>` with nested `<span>` for X
- [ ] "Clear all" as text `<button>`

**Layer 2 — Layout:**
- [ ] `flex flex-wrap gap-2 mb-6`
- [ ] Pills inline with gap, wrap on overflow

**Layer 3 — Surface (Design System Compliance):**
- [ ] Pill: `bg-surface-card border border-secondary-700`
- [ ] Pill text: `text-body text-brand-200`
- [ ] X icon: `text-secondary-500 hover:text-error-500` (destructive action)
- [ ] "Clear all": `text-body text-secondary-400 hover:text-brand-400 underline`

**Layer 4 — Interaction:**
- [ ] Click pill X → calls `removeFilter(field, value)` → URL update
- [ ] Click "Clear all" → calls `clearAll()` → removes all filter params
- [ ] Pills only render when `filters.length > 0`

#### Component: MobileFilterDrawer

**Layer 1 — Structure:**
- [ ] `<aside>` with fixed positioning
- [ ] Header with title + close button
- [ ] Scrollable content area
- [ ] Footer with "Show Results" button

**Layer 2 — Layout:**
- [ ] `fixed inset-y-0 left-0 z-50 w-[300px]`
- [ ] Header: `flex items-center justify-between p-4`
- [ ] Content: `flex-1 overflow-y-auto p-4`
- [ ] Footer: `sticky bottom-0 p-4` (CRITICAL: must be sticky)

**Layer 3 — Surface (Design System Compliance):**
- [ ] Drawer: `bg-surface-card`
- [ ] Backdrop: `bg-surface-page/80 backdrop-blur-sm`
- [ ] Title: `type-overline text-secondary-400`
- [ ] Footer: `border-t border-secondary-700 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]`
- [ ] Button: `w-full input-select` (reuse design system)

**Layer 4 — Interaction:**
- [ ] `isOpen` prop controls `translate-x-0` vs `-translate-x-full`
- [ ] Backdrop click calls `onClose()`
- [ ] Close button calls `onClose()`
- [ ] **Escape key closes drawer** (useEffect with keydown listener)
- [ ] **Focus trap** (tab cycles within drawer when open)
- [ ] `onClose` triggers product grid refresh if filters changed

---

## Design System Compliance Requirements

### Tokens That MUST Replace Inline Styles

| Current Violation | Location | Required Token |
|-------------------|----------|----------------|
| `style={{ backgroundImage: 'url(...)' }}` | SortDropdown.tsx | `input-select` class |
| `text-h4 font-semibold text-headline` | FilterSidebar.tsx | `type-overline` |
| `text-h4 font-semibold text-headline` | MobileFilterDrawer.tsx | `type-overline` |
| `bg-surface-elevated` on filter pills | ActiveFilters.tsx | `bg-surface-card` |
| `text-secondary-400 hover:text-brand-400` for X | ActiveFilters.tsx | `text-secondary-500 hover:text-error-500` |
| `accent-accent-500` (browser default) | FilterSidebar.tsx | custom styled checkbox |

### Custom Checkbox Styling (Required)

```tsx
<input
  type="checkbox"
  className="w-4 h-4 rounded border-secondary-600 bg-surface-elevated text-accent-500 focus-visible:ring-2 focus-visible:ring-brand-400 cursor-pointer"
/>
```

---

## File Modifications Summary

### High Risk (Signature Changes)

```
app/(store)/products/[...slug]/page.tsx
  - Add: searchParams: Promise<{ [key: string]: string | string[] | undefined }>
  - Modify: getProductsByVfsKeys call to include sort/filters

sanity/lib/products/getProductsByVfsKeys.ts
  - Add: sort?: string param
  - Add: filters?: Array<{ field: string; value: string }> param
  - Modify: GROQ query to include order and filter clauses
```

### Medium Risk (Props Interface Changes)

```
app/(store)/products/[...slug]/CategoryPageClient.tsx
  - Add: searchParams prop
  - Modify: Derive active filters from searchParams, not hardcoded

app/components/features/filters/ActiveFilters.tsx
  - Remove: filters prop (now reads from URL)
  - Add: URL removal logic
```

### Low Risk (Styling/Interaction Only)

```
app/components/features/filters/SortDropdown.tsx
  - Replace inline styles with input-select class
  - Add URL change handler

app/components/features/filters/MobileFilterDrawer.tsx
  - Make footer sticky
  - Add Escape key handler
  - Replace hardcoded filters with props

app/components/features/filters/FilterSidebar.tsx
  - Apply type-overline to heading
  - Update checkbox styling
```

### New Files (No Risk)

```
lib/filters/urlParams.ts (extract from existing Filters.tsx)
  - parseFilterParams(searchParams)
  - buildFilterUrl(pathname, currentParams, changes)
```

---

## Verification Matrix

### Regression Tests (Run First)

| ID | Test | Evidence |
|----|------|----------|
| R1 | Unfiltered product query returns all | `getProductsByVfsKeys(keys)` returns same count as before |
| R2 | Page renders without searchParams | `/products/headphones` loads without error |
| R3 | ProductGrid empty state works | Empty array shows "No products" message |
| R4 | Existing URLs work | Direct navigation to category pages works |

### Layer Verification (Per Pass)

| Layer | Component | Verification |
|-------|-----------|--------------|
| L1 | All | Debug borders visible, semantic HTML in DevTools |
| L2 | All | Layout matches screenshots at 1280px and 375px |
| L2 | SortDropdown | Positioned top-right on desktop, full-width mobile |
| L2 | ActiveFilters | Wraps with gap-2, doesn't overflow container |
| L2 | MobileDrawer | Slides in/out, overlay covers full viewport |
| L3 | All | No inline styles, only Tailwind classes |
| L3 | Checkboxes | Custom styled, not browser default |
| L4 | SortDropdown | URL updates on change, products re-sort |
| L4 | ActiveFilters | X removes filter, Clear All removes all |
| L4 | MobileDrawer | Escape closes, sticky footer visible without scroll |

### Journey Tests (Final Verification)

| ID | Journey | Expected Result |
|----|---------|-----------------|
| J1 | Load `/products/headphones` | Sort shows "Featured", no active filters |
| J2 | Select "Price: Low to High" | URL: `?sort=displayPrice:asc`, products reordered |
| J3 | Check "Sennheiser" brand | URL: `?brand=sennheiser`, count decreases, pill appears |
| J4 | Check "Dynamic" driver + Sennheiser | URL: `?brand=sennheiser&driverType=dynamic`, both pills show |
| J5 | Click X on Sennheiser pill | Sennheiser filter removed, Dynamic remains |
| J6 | Click "Clear all" | All filters removed, URL clean |
| J7 | Mobile: Tap "Filters" button | Drawer slides in from left |
| J8 | Mobile: Tap overlay | Drawer closes |
| J9 | Mobile: Press Escape | Drawer closes |
| J10 | Copy URL with filters | Paste in new tab, same filters applied |

---

## Implementation Sequence

### Phase 0: Regression Tests (30 min)
1. Write regression tests for R1-R4
2. Run tests, verify all pass (baseline)

### Phase 1: Pass 1 — Skeleton (45 min)
1. Modify `page.tsx` to accept searchParams
2. Modify `CategoryPageClient.tsx` to accept searchParams
3. Strip all styling from components, add debug borders
4. Verify all components render with borders

### Phase 2: Pass 2 — Data (90 min)
1. Create `lib/filters/urlParams.ts` with parse/build functions
2. Modify `getProductsByVfsKeys.ts` to accept sort/filter params
3. Add URL change handler to `SortDropdown.tsx`
4. Add URL read/remove logic to `ActiveFilters.tsx`
5. Verify URL updates work (console.log or network tab)

### Phase 3: Pass 3 — Build (180 min)
**Component: SortDropdown (45 min)**
- Layer 1: Structure (10 min)
- Layer 2: Layout (10 min)
- Layer 3: Surface (15 min) - Replace inline styles with input-select
- Layer 4: Interaction (10 min) - Verify URL sync

**Component: ActiveFilters (45 min)**
- Layer 1: Structure (10 min)
- Layer 2: Layout (10 min)
- Layer 3: Surface (15 min) - Apply design system tokens
- Layer 4: Interaction (10 min) - Verify remove/clear all work

**Component: MobileFilterDrawer (60 min)**
- Layer 1: Structure (10 min)
- Layer 2: Layout (15 min) - **Critical: sticky footer**
- Layer 3: Surface (20 min) - Backdrop blur, shadows, tokens
- Layer 4: Interaction (15 min) - Escape key, focus trap, backdrop click

**Component: FilterSidebar (30 min)**
- Layer 3: Surface only (update heading + checkboxes)

### Phase 4: Verification (45 min)
1. Run regression tests R1-R4 (must still pass)
2. Complete Journey Tests J1-J10
3. Verify design system compliance (no inline styles)
4. Lock sprint

---

## Success Criteria

- [ ] All regression tests pass (R1-R4)
- [ ] All journey tests pass (J1-J10)
- [ ] No inline styles in filter components
- [ ] All components use Tailwind design system tokens
- [ ] Mobile drawer has sticky footer with shadow
- [ ] Escape key closes mobile drawer
- [ ] URL shareability verified (copy/paste preserves filters)
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
- Product discovery fully functional (filters + sort + URL shareable)

**Sprint 6 Scope:** Product Detail Page — Related products carousel, full specs table

---

*Begin with Phase 0: Regression Tests*
