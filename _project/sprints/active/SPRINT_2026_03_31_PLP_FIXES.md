# Sprint: PLP Critical Bug Fixes — SPRINT_2026_03_31_PLP_FIXES

> **Target:** Fix 5 critical bugs on Product Listing Page (PLP) and Product Detail Page (PDP)  
> **Scope:** Data fetching, filtering logic, sorting, image rendering, PDP routing  
> **Design System:** Strict adherence to `tailwind.config.ts` — NO new tokens  
> **Created:** 2026-03-31  
> **Status:** READY FOR EXECUTION

---

## Pre-Sprint Regression Containment

### Files at Risk of Regression

| File | Risk Level | Current Role | Protection Strategy |
|------|------------|--------------|---------------------|
| `app/(store)/products/[...slug]/page.tsx` | HIGH | PLP server component | Read-only until SC5 |
| `app/components/features/products/ProductCard.tsx` | MEDIUM | Shared UI component | Verify homepage unchanged |
| `app/components/features/filters/FilterSidebar.tsx` | HIGH | Filter logic | Test existing filters pre-change |
| `app/components/features/filters/SortDropdown.tsx` | MEDIUM | Sort UI | Verify uncontrolled → controlled transition |
| `sanity/lib/products/getProductsByVfsKeys.ts` | HIGH | Data fetching | All changes upstream in this file |
| `app/(store)/product/[slug]/page.tsx` | HIGH | PDP server component | Isolate from PLP changes |
| `tailwind.config.ts` | CRITICAL | Design system | READ-ONLY — NO TOKEN ADDITIONS |

### Scope Lock Rules (VIOLATION = SPRINT FAILURE)

1. **NO** modifications to `globals.css`
2. **NO** new Tailwind config tokens — use existing only
3. **NO** homepage component changes
4. **NO** PDP changes during PLP scope contracts (SC1-4)
5. **NO** arbitrary Tailwind values (`w-[280px]` → use `w-72`)
6. **ALL** data structure changes via Sanity schema first, then code

---

## Scope Contracts

### SC1: Product Images Not Rendering — B-01

**Gap:** Product cards show placeholder/empty instead of Sanity images  
**Root Cause Hypothesis:** Image URLs null from `getProductsByVfsKeys.ts` query  

#### Target State
Product cards render actual product images from Sanity CDN at desktop (1280px) and mobile (375px).

#### DoD (Definition of Done)

**Pass 1 — Skeleton:**
- [ ] ProductCard renders `img` tag with `src` attribute (debug border only)
- [ ] ProductImage component exists with semantic structure

**Pass 2 — Data:**
- [ ] Sanity GROQ query returns `image.asset._ref` for all products
- [ ] `urlFor()` helper generates valid image URLs
- [ ] Console shows image URLs (not null/undefined)

**Pass 3 — Build:**

*Desktop (1280px):*
- [ ] **Layer 1 (Structure):** `article > div[image] > img` semantic nesting
- [ ] **Layer 2 (Layout):** `aspect-[4/3]` container, `object-cover` on image
- [ ] **Layer 3 (Surface):** `bg-surface-productImage` on container, image visible
- [ ] **Layer 4 (Interaction):** Hover state on card (lift + shadow)
- [ ] **Lock:** Desktop images render correctly

*Mobile (375px):*
- [ ] **Layer 2:** Same layout adapted to mobile card width
- [ ] **Layer 3:** Image quality/size appropriate for mobile
- [ ] **Layer 4:** Touch-friendly (no hover dependency)
- [ ] **Lock:** Mobile images render correctly

**Verification:**
```bash
npm run build
# Visual check: /products/headphones/open-back shows 6 product images
```

---

### SC2: Filter Lag (5-10s) — B-02

**Gap:** Clicking filter checkbox takes 5-10 seconds to apply  
**Root Cause Hypothesis:** `useFilters` hook re-renders entire ProductGrid on every state change  

#### Target State
Filter applies within 100ms of checkbox click, with visual feedback (loading state optional, <100ms ideal).

#### DoD (Definition of Done)

**Pass 1 — Skeleton:**
- [ ] Filter state isolated from render cycle (debug logging confirms)

**Pass 2 — Data:**
- [ ] Filter state updates without triggering full product refetch
- [ ] Filtered product list computed client-side from cached data

**Pass 3 — Build:**

*Desktop (1280px):*
- [ ] **Layer 1:** Filter inputs have proper `name` attributes
- [ ] **Layer 2:** FilterSidebar layout unchanged (w-60, shrink-0)
- [ ] **Layer 3:** Active filter chips show immediately on click
- [ ] **Layer 4:** Checkbox has `:checked` visual state, transition <150ms
- [ ] **Lock:** Click-to-filter time <100ms measured via Performance API

*Mobile (375px):*
- [ ] **Layer 2:** Mobile filter drawer opens without lag
- [ ] **Layer 3:** Filter chips render in mobile constraints
- [ ] **Layer 4:** Touch checkbox has immediate feedback
- [ ] **Lock:** Mobile filter applies <100ms

**Verification:**
```bash
npm run build
# DevTools Performance: filter click → render <100ms
```

---

### SC3: Filter Returns 0 Products — B-03

**Gap:** Any filter selection returns "0 products found"  
**Root Cause Hypothesis:** Filter logic comparing incompatible data types (string vs array) or empty `catalogueLocationKeys`  

#### Target State
Filters correctly match products to their tags/brands; selecting "Sennheiser" shows only Sennheiser products.

#### DoD (Definition of Done)

**Pass 1 — Skeleton:**
- [ ] Filter logic outputs debug log of match count

**Pass 2 — Data:**
- [ ] Product `tags` field populated in Sanity data
- [ ] Filter values match product tag format (case-sensitive check)
- [ ] Match logic returns expected counts (verified with console logs)

**Pass 3 — Build:**

*Desktop (1280px):*
- [ ] **Layer 1:** Filter checkboxes have `value` matching product tags
- [ ] **Layer 2:** ProductGrid updates without layout shift
- [ ] **Layer 3:** "0 products" state has friendly empty message
- [ ] **Layer 4:** No specific interaction required
- [ ] **Lock:** "Open-Back + Sennheiser" filter shows 2+ products (if data exists)

*Mobile (375px):*
- [ ] **Layer 2:** Filtered grid adapts to mobile
- [ ] **Lock:** Mobile filtering works identically to desktop

**Verification:**
```bash
npm run build
# Test: /products/headphones/open-back → Filter by Sennheiser → Shows Sennheiser products only
```

---

### SC4: Sorting Non-Functional — B-04

**Gap:** Sort dropdown doesn't change product order  
**Root Cause Hypothesis:** Sort state not passed to `getProductsByVfsKeys` or sort logic compares strings as strings (not prices as numbers)  

#### Target State
Sort dropdown (Name A-Z, Price Low-High, Price High-Low) correctly reorders products.

#### DoD (Definition of Done)

**Pass 1 — Skeleton:**
- [ ] Sort select has `onChange` handler wired

**Pass 2 — Data:**
- [ ] Sort value passed to data fetching logic
- [ ] `displayPrice` parsed as number for numeric sort
- [ ] Sort function tested with mock data

**Pass 3 — Build:**

*Desktop (1280px):*
- [ ] **Layer 1:** Select has proper label association
- [ ] **Layer 2:** SortDropdown positioned in ControlsBar
- [ ] **Layer 3:** Selected sort shown in dropdown, `input-select` class applied
- [ ] **Layer 4:** No animation (immediate reorder)
- [ ] **Lock:** "Price Low-High" sorts $179 before $4,999

*Mobile (375px):*
- [ ] **Layer 2:** SortDropdown in mobile controls row
- [ ] **Lock:** Mobile sorting identical to desktop

**Verification:**
```bash
npm run build
# Test: Sort by Price Low-High → Products ordered $179, $599, $799, etc.
```

---

### SC5: PDP "Something Went Wrong" — B-05

**Gap:** PDP shows error, uses slug URL instead of ID  
**Root Cause Hypothesis:** PDP page fetching by slug but Sanity query expects `_id`, or product not found by slug  

#### Target State
PDP at `/product/[slug]` loads product details correctly using slug-based lookup.

#### DoD (Definition of Done)

**Pass 1 — Skeleton:**
- [ ] PDP page renders skeleton (product name placeholder)

**Pass 2 — Data:**
- [ ] `getProductBySlug` query uses `slug.current` field
- [ ] Sanity returns product for valid slug
- [ ] Error state handled for invalid slug (404, not 500)

**Pass 3 — Build:**

*Desktop (1280px):*
- [ ] **Layer 1:** PDP layout semantic (header, image, info, CTA)
- [ ] **Layer 2:** Product image + info side-by-side
- [ ] **Layer 3:** Product renders with real data, styling applied
- [ ] **Layer 4:** "Add to Cart" button interactive
- [ ] **Lock:** `/product/sennheiser-hd-560s` shows product details

*Mobile (375px):*
- [ ] **Layer 2:** Image + info stacked vertically
- [ ] **Lock:** Mobile PDP renders correctly

**Verification:**
```bash
npm run build
# Click product from PLP → PDP loads with details
# Test: /product/invalid-slug → 404 page (not error)
```

---

## Sprint Sequencing (Dependency Order)

Based on diagnostic: **B-03 (filter logic) → B-01 (images symptom)**, **B-02 (performance) independent**, **B-04 (sorting) independent**, **B-05 (PDP) independent**

**Execution Order:**
1. **SC3** (B-03) — Fix filter logic → may fix B-01 automatically
2. **SC1** (B-01) — Verify images after data fix
3. **SC2** (B-02) — Performance optimization (won't affect SC1/SC3)
4. **SC4** (B-04) — Sorting (independent)
5. **SC5** (B-05) — PDP (isolated, no PLP dependency)

---

## Build Execution Commands

Per scope contract, invoke `/build` for Pass 3 DoDs:

```bash
# SC3 Example Sequence:
/build FilterSidebar 3 2 1280px
/build FilterSidebar 3 3 1280px
/build FilterSidebar 3 2 375px
/build FilterSidebar 3 3 375px

# SC1 Example Sequence:
/build ProductCard 3 2 1280px
/build ProductCard 3 3 1280px
/build ProductCard 3 4 1280px
/build ProductCard 3 2 375px
/build ProductCard 3 3 375px
/build ProductCard 3 4 375px
```

---

## /Test Integration Points

### Pre-Sprint Baseline

```bash
/test scope:"PLP current state" baseline:true
```

**Expected:** Tests capture current broken state (images fail, filter lag, etc.) as baseline.

### Per Scope Contract

```bash
# After SC3 complete:
/test scope:"SC3 Filter Logic" dod:"Pass 1-3 DoDs"

# After SC1 complete:
/test scope:"SC1 Product Images" dod:"Pass 1-3 DoDs"
```

### Post-Sprint Final

```bash
/test scope:"Full PLP functionality" final:true
npm run build
```

---

## Test Evidence Log

### Pre-Sprint Baseline
| Date | /test Invocation | Tests | Pass Rate | Verdict |
|------|------------------|-------|-----------|---------|
| | | | | |

### Per Scope Contract
| Scope Contract | /test Date | DoD Tests | Pass Rate | Verdict |
|----------------|------------|-----------|-----------|---------|
| SC3: Filter Logic | | | | |
| SC1: Product Images | | | | |
| SC2: Filter Performance | | | | |
| SC4: Sorting | | | | |
| SC5: PDP | | | | |

### Post-Sprint Final
| Date | /test Invocation | Total Tests | Pass Rate | Sprint Verdict |
|------|------------------|-------------|-----------|----------------|
| | | | | |

---

## Critical Implementation Notes

1. **B-03 First:** If filter logic fix (SC3) makes images work (B-01), SC1 becomes verification-only.

2. **Data Flow Verification:** At each SC Pass 2, add temporary `console.log()` to verify data structure matches assumptions.

3. **No Preemptive Optimization:** Fix bugs first. Performance optimization (memoization, etc.) only after functionality correct.

4. **Homepage Isolation:** Any shared components (ProductCard) must be verified against homepage after changes.

5. **Sanity Data Reality:** If products lack `image.asset._ref` or `tags`, this is a DATA issue, not CODE issue. Document and halt for data fix.

---

## Sprint Lock Criteria

✅ **SPRINT COMPLETE WHEN:**
- All 5 scope contracts have 100% DoD pass rate
- `/test` evidence dashboard shows 100% specification tests
- `npm run build` passes
- Visual verification: PLP → filter → sort → click → PDP flows correctly

❌ **BLOCKING CONDITIONS:**
- Any DoD item incomplete
- Any test failing
- Build error
- Homepage regression detected

---

## Output Location

**Save completed sprint to:** `_project/sprints/active/SPRINT_2026_03_31_PLP_FIXES.md`

**Archive completed work to:** `_project/sprints/done/` after sprint lock.

---

**Ready for execution. Begin with SC3 (Filter Logic) — it may resolve SC1 automatically.**
