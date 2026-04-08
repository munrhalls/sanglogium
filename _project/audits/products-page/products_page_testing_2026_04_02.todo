# Audit: Products Page (PLP) Testing Coverage

> **Audit Date:** 2026-04-02
> **Scope:** `/app/(store)/products/[...slug]/` route and related components
> **Auditor:** AI/Human collaboration
> **Status:** Critical gaps identified; foundation exists

---

## 1. End-State Delineation

### Target Test Coverage (Full)
```
[VFS DATA LAYER — Unit Tests — ✅ COMPLETE]
  ├── catalogue-index.json structure (8 tests)
  ├── VFS function unit tests (10 tests)
  ├── Node → Leaf resolution (6 tests)
  ├── Leaf → Product resolution (14 tests)
  ├── Parent → Products aggregation (11 tests)
  ├── Index consistency (8 tests)
  └── E2E URL → Products pipeline (6 tests)
  TOTAL: 67 tests — EXISTING

[SERVER COMPONENTS — Integration Tests — ❌ GAPS]
  ├── CategoryPage data fetching
  ├── Suspense streaming behavior
  ├── Error boundary handling
  └── URL param parsing

[CLIENT COMPONENTS — Integration Tests — ❌ GAPS]
  ├── CategoryPageClient filter state
  ├── Mobile drawer behavior
  ├── Sort dropdown functionality
  └── Active filters display

[E2E CRITICAL FLOWS — ❌ MISSING]
  ├── Category navigation (slug resolution)
  ├── Filter application/removal
  ├── Sort order changes
  ├── Mobile drawer open/close
  ├── Empty category state
  └── Loading skeleton visibility
```

### Current State
```
[TEST INFRASTRUCTURE — PARTIAL]
├── Vitest configured ✅
├── Playwright configured ✅
├── Test utilities exist (product-detail-helpers.ts) ✅
└── Products-page-specific helpers ❌ MISSING

[EXISTING TESTS]
├── tests/catalogue/vfs.test.ts (67 tests) ✅
├── tests/e2e/vfs-visual-verification.spec.ts (13 categories) ✅
├── tests/e2e/product-detail/*.spec.ts (3 files) ✅
└── tests/e2e/products-page/ ❌ DIRECTORY DOES NOT EXIST

[DATA-TESTID COVERAGE]
├── ProductGrid: data-testid="product-grid" ✅
├── ProductGrid: data-testid="empty-products" ✅
├── ProductCard: data-testid="product-card" ✅
├── FilterSidebar: ❌ NO TEST IDs
├── SortDropdown: ❌ NO TEST IDs
├── MobileControlsBar: ❌ NO TEST IDs
├── CategoryPageClient: ❌ NO TEST IDs
└── ShopHeader: ❌ NO TEST IDs
```

---

## 2. Spatial Architecture

### User Flow Groups
| Group | Entry | Actions | Exit | Test Priority |
|-------|-------|---------|------|---------------|
| Category Browse | Any `/products/{slug}` | View products, click product | PDP | **P0 — Critical** |
| Filter & Sort | Category page | Apply filters, change sort | Refined results | **P0 — Critical** |
| Mobile Navigation | Category page on mobile | Open drawer, select filters | Filtered results | **P1 — High** |
| Empty Category | Category with no products | See "No products" message | Navigate elsewhere | **P1 — High** |

### Component Hierarchy (Testing Perspective)
```
CategoryPage (Server — async)
├── Breadcrumbs (sync render)
├── ShopHeader (sync render — needs testid)
├── Suspense #1
│   └── FilterSection (async)
│       └── FilterSidebar (Client — needs testid)
│           ├── Filter groups
│           ├── Price range
│           └── Stock minimum
└── Suspense #2
    └── ProductsSection (async)
        └── CategoryPageClient (Client)
            ├── MobileControlsBar (needs testid)
            ├── MobileFilterDrawer
            ├── SortDropdown (needs testid)
            ├── ActiveFilters
            └── ProductGrid
                └── ProductCard[] (has testid ✅)
```

---

## 3. Gap Analysis (G-XX)

| ID | Component | Current State | Target State | Severity |
|----|-----------|---------------|--------------|----------|
| G-01 | Products Page E2E Tests | No dedicated E2E tests | 5 critical flow tests | **Critical** |
| G-02 | Test ID: FilterSidebar | ✅ data-testid="filter-sidebar" exists | Add data-testid="filter-sidebar" | **Resolved** |
| G-03 | Test ID: SortDropdown | ✅ data-testid="sort-dropdown" exists | Add data-testid="sort-dropdown" | **Resolved** |
| G-04 | Test ID: MobileControlsBar | ✅ data-testid="mobile-controls-bar" exists | Add data-testid="mobile-controls" | **Resolved** |
| G-04b | Test ID: MobileFilterDrawer | ✅ data-testid="mobile-filter-drawer" exists | Add data-testid="mobile-filter-drawer" | **Resolved** |
| G-05 | Test Utilities | product-detail-helpers.ts only | products-page-helpers.ts | **High** |
| G-06 | Filter State Tests | No integration tests | Filter application/removal tests | **Medium** |
| G-07 | Loading State Tests | No explicit tests | Skeleton visibility tests | **Medium** |
| G-08 | Error State Tests | error.tsx exists but untested | Error boundary E2E test | **Medium** |
| G-09 | Mobile Drawer Tests | No mobile-specific tests | Drawer open/close flow | **Medium** |
| G-10 | Empty State Tests | No E2E verification | Empty category E2E test | **Medium** |

---

## 4. RWD Strategy (Test Viewports)

| Component | Desktop (1280px) | Tablet (768px) | Mobile (375px) | Implementation |
|-----------|------------------|----------------|------------------|----------------|
| FilterSidebar | Visible, sticky | Visible, sticky | Hidden (drawer) | `lg-desktop:block` |
| ProductGrid | 3 columns | 2 columns | 1 column | `grid-cols-1 lg-desktop:grid-cols-3` |
| MobileControlsBar | Hidden | Hidden | Visible | `lg:hidden` |
| SortDropdown | Inline visible | Inline visible | In drawer | Context-dependent |

---

## 5. Files at Risk of Regression

| File | Risk | Mitigation |
|------|------|------------|
| `FilterSidebar.tsx` | Changes affect filter functionality | Add integration tests before refactor |
| `CategoryPageClient.tsx` | Client state changes break URL sync | Test URL param round-trip |
| `ProductGrid.tsx` | Grid changes affect mobile layout | RWD E2E tests |
| `ProductCard.tsx` | Shared with homepage | Verify homepage unaffected |
| `page.tsx` | Data fetching changes break streaming | Suspense boundary tests |

---

## 6. Existing Test Coverage (Detailed)

### VFS Tests: 67 Tests (✅ COMPREHENSIVE)
**Location:** `tests/catalogue/vfs.test.ts`

| Suite | Count | Coverage |
|-------|-------|----------|
| catalogue-index.json Structure | 8 | Schema, slug bijection, metadata coverage |
| VFS Function Unit | 10 | resolveSlugToId, unrollDescendantKeys |
| Node → Leaf Resolution | 6 | All category levels |
| Leaf → Product Resolution | 14 | CMS-dependent product counts |
| Parent → Product Aggregation | 11 | Multi-category aggregation |
| Index Consistency | 8 | Cross-reference validation |
| E2E URL → Products Pipeline | 6 | Full data flow |

### VFS Visual Verification: 13 Tests (✅ GOOD)
**Location:** `tests/e2e/vfs-visual-verification.spec.ts`

- Tests 12 categories for page load + screenshot
- Tests homepage navigation to category
- Console log capture for manual verification

### Product Detail Tests: 9 Tests (✅ REFERENCE)
**Location:** `tests/e2e/product-detail/*.spec.ts`

| File | Count | Coverage |
|------|-------|----------|
| rwd.spec.ts | 7 | 5 viewport breakpoints + touch targets + zoom |
| edge-cases.spec.ts | 5 | 404, no images, out of stock, keyboard nav, cart persistence |
| link-integrity.spec.ts | 4 | Breadcrumb links, product links, navigation |

---

## 7. Verification Commands

```bash
# Pre-sprint regression
npm run build

# Run existing VFS tests
npx vitest run tests/catalogue/vfs.test.ts --reporter=verbose

# Run existing E2E tests
npx playwright test tests/e2e/vfs-visual-verification.spec.ts --reporter=list

# Check test coverage
npm run test:coverage
```

---

## 8. Summary

### Strengths
1. **VFS data layer thoroughly tested** — 67 unit tests provide confidence in slug→product resolution
2. **Test infrastructure in place** — Vitest + Playwright configured and running
3. **Some data-testids present** — ProductGrid and ProductCard have selectors
4. **Existing patterns to follow** — product-detail-helpers.ts is a good template

### Critical Gaps
1. **No dedicated products page E2E tests** — Critical user flows untested
2. **Missing test IDs on interactive elements** — Filters, sort, mobile controls untargetable
3. **No integration tests for client components** — CategoryPageClient logic untested
4. **No mobile-specific test coverage** — Drawer behavior unverified

### Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Filter regression | Medium | High | Add filter E2E tests |
| Mobile layout breakage | Medium | Medium | Add RWD E2E tests |
| Empty state not rendering | Low | Medium | Add empty state E2E test |
| URL state desync | Low | High | Add URL round-trip test |

### Recommended Test Suite Size
- **Unit (VFS):** 67 tests — KEEP AS-IS ✅
- **Integration:** 5-8 new tests — ADD
- **E2E:** 5-7 new tests — ADD
- **Total new tests:** 10-15 tests for comprehensive PLP coverage

---

## Audit: Testing Gaps → Sprint Input

### Priority P0 (Must Have)
1. G-01: 5 critical E2E flow tests
2. G-02: Add data-testid="filter-sidebar"
3. G-03: Add data-testid="sort-dropdown"
4. G-05: Create products-page-helpers.ts

### Priority P1 (Should Have)
5. G-04: Add data-testid="mobile-controls"
6. G-06: Filter state integration tests
7. G-07: Loading state tests
8. G-09: Mobile drawer flow tests

### Priority P2 (Nice to Have)
9. G-08: Error boundary E2E test
10. G-10: Empty category E2E test
