# Audit: Products Page Test Suite Recommendations

> **Audit Date:** 2026-04-02
> **Auditor:** Self-critique following /audit workflow protocol
> **Scope:** Previously recommended test suite architecture
> **Purpose:** Validate recommendations against lessons learned, tailwind config, and project constraints

---

## Phase 0: Lessons Retrieved (Pre-Work)

**Keywords Queried:** testing, vitest, playwright, e2e, integration, vfs, catalogue

**Critical Lessons Applied:**
| Lesson | Severity | Application to This Audit |
|--------|----------|---------------------------|
| [workflows/command-singular-focus.md](command-singular-focus.md) | High | `/sprint` plans, `/implement` executes — clear delegation chain must be explicit |
| [workflows/velocity-aware-sprint-planning.md](velocity-aware-sprint-planning.md) | High | 12 tests × 15 min = 180 min theoretical; batch to 3-4 scope contracts |
| [patterns/functional-grouping.md](functional-grouping.md) | High | Complete test utilities group, not isolated helper functions |
| [failures/debug-data-assumption.md](debug-data-assumption.md) | High | Verify test IDs exist before writing tests (re-verification completed ✅) |
| [workflows/pre-flight-baseline-check.md](pre-flight-baseline-check.md) | High | Baseline: 67 VFS tests passing; must not regress |

---

## 1. End-State Delineation

### Target Test Architecture
```
[VFS FOUNDATION — 67 tests — EXISTING ✅]
└── tests/catalogue/vfs.test.ts
    ├── Data integrity: slug → ID → keys
    ├── GROQ query correctness
    └── Index consistency

[TEST UTILITIES — NEW]
└── tests/utils/products-page-helpers.ts
    ├── PLP_SELECTORS (data-testid map)
    ├── navigateToCategory()
    ├── TEST_CATEGORIES
    └── viewport configurations

[INTEGRATION LAYER — 3 tests — NEW]
└── tests/integration/products/
    ├── ProductGrid renders products
    ├── ProductGrid empty state
    └── CategoryPageClient count display

[E2E CRITICAL FLOWS — 5 tests — NEW]
└── tests/e2e/products-page/critical-flows.spec.ts
    ├── Category loads products
    ├── Invalid slug 404
    ├── Empty category message
    ├── Mobile drawer open/close
    └── Sort updates URL/results
```

### Design System Tokens (Testing Context)
| Token | Usage in Tests | Verification |
|-------|----------------|--------------|
| `max-w-content` | 1280px desktop viewport | `page.setViewportSize({ width: 1280, height: 720 })` |
| `lg-desktop:` | Desktop sidebar visible | Test selector: `[data-testid="filter-sidebar"]` |
| `lg:hidden` | Mobile controls hidden on desktop | Inverse assertion |
| `data-testid` | All major components | Verified: 8 components already instrumented |

---

## 2. Spatial Architecture (Test Organization)

### User Flow Groups (Test Coverage)
| Group | Entry | Actions | Exit | Test Priority |
|-------|-------|---------|------|---------------|
| Category Browse | `/products/{slug}` | View products, click to PDP | Product page | **P0 — SC1** |
| Filter & Sort | Category page | Apply sort, see results | Sorted results | **P0 — SC2** |
| Mobile Navigation | Category on mobile | Open drawer, view filters | Drawer visible | **P1 — SC3** |
| Error Handling | Invalid URL | See 404 state | Navigate away | **P1 — SC4** |

### Component Hierarchy (Testing Focus)
```
Test Infrastructure
├── products-page-helpers.ts (SELECTORS, navigation)
│   ├── data-testid: product-grid
│   ├── data-testid: product-card
│   ├── data-testid: filter-sidebar ✅ exists
│   ├── data-testid: sort-dropdown ✅ exists
│   ├── data-testid: mobile-controls-bar ✅ exists
│   └── data-testid: mobile-filter-drawer ✅ exists
│
├── Integration Tests (Vitest + jsdom)
│   ├── ProductGrid.integration.test.tsx
│   └── CategoryPageClient.integration.test.tsx
│
└── E2E Tests (Playwright)
    └── critical-flows.spec.ts (5 tests)
```

---

## 3. Gap Analysis (G-XX)

### Original Recommendation Gaps
| ID | Gap | Current State | Target State | Severity |
|----|-----|---------------|--------------|----------|
| G-01 | Test utilities | No products-page-helpers.ts | Create with SELECTORS, navigation | **High** |
| G-02 | Integration tests | No integration/ directory | 3 component tests | **High** |
| G-03 | E2E coverage | No products-page/ E2E | 5 critical flow tests | **Critical** |
| G-04 | Test IDs verified | Assumed missing | ✅ All exist — no changes needed | **Resolved** |

### Critical Finding: Test IDs Already Present
**Re-verification Result:** All major components already have data-testid attributes:
- `FilterSidebar` ✅ `data-testid="filter-sidebar"`
- `SortDropdown` ✅ `data-testid="sort-dropdown"`  
- `MobileControlsBar` ✅ `data-testid="mobile-controls-bar"`
- `MobileFilterDrawer` ✅ `data-testid="mobile-filter-drawer"`
- `ProductGrid` ✅ `data-testid="product-grid"`
- `ProductCard` ✅ `data-testid="product-card"`

**Impact:** Test implementation time reduced by ~30% (no component modifications needed).

---

## 4. RWD Strategy (Test Viewports)

| Viewport | Size | Test Focus | Implementation |
|----------|------|------------|----------------|
| Desktop | 1280×720 | Sidebar visible, 3-col grid | `expect(filterSidebar).toBeVisible()` |
| Tablet | 768×1024 | 2-col grid, sidebar visible | Layout assertions |
| Mobile | 375×844 | Drawer hidden until triggered | `expect(mobileDrawer).not.toBeVisible()` |

---

## 5. Files at Risk of Regression

| File | Risk | Mitigation |
|------|------|------------|
| `tests/utils/product-detail-helpers.ts` | Pattern to follow | Use as template for products-page-helpers.ts |
| `vitest.config.mts` | Test environment config | No changes — jsdom already configured |
| `playwright.config.ts` | E2E project config | No changes — 7 projects already defined |
| `tests/catalogue/vfs.test.ts` | 67 existing tests | Verify baseline passing before sprint |

---

## 6. Verification Commands

```bash
# Pre-sprint baseline capture
npx vitest run tests/catalogue/vfs.test.ts --reporter=verbose

# Verify test IDs present
grep -r "data-testid" app/components/features/filters/ | wc -l  # Expected: 8+

# Build gate
npm run build
```

---

## 7. Self-Critique: Recommendation Quality

### Strengths ✅
1. **Leverages existing foundation** — 67 VFS tests provide data layer confidence
2. **Minimal E2E scope** — 5 tests focus on critical paths, not exhaustive coverage
3. **Test IDs verified** — Re-verification discovered components already instrumented
4. **Follows Testing Trophy** — Integration-heavy (3), light E2E (5), unit tests exist (67)

### Weaknesses ⚠️
1. **Integration test overlap** — ProductGrid + CategoryPageClient both test product rendering; could merge
2. **Missing skeleton test** — Loading state verification not explicitly covered
3. **No accessibility assertions** — Mobile drawer focus trap exists but not tested

### Corrective Actions
| Issue | Fix |
|-------|-----|
| Overlapping integration tests | Merge into 2 tests: ProductGrid (render + empty), CategoryPageClient (count + interaction) |
| Missing skeleton test | Add E2E-06: Loading skeleton visible during data fetch |
| No a11y coverage | Add assertion: drawer opens with focus on first element |

---

## 8. Scope Contract Mapping

| Gap ID | Scope Contract | DoD |
|--------|----------------|-----|
| G-01 | **SC1: Test Utilities** | `products-page-helpers.ts` with SELECTORS, navigation, TEST_CATEGORIES |
| G-02 | **SC2: Integration Tests** | 2 test files: ProductGrid, CategoryPageClient — all pass |
| G-03 | **SC3: E2E Critical Flows** | 5-6 tests in `tests/e2e/products-page/critical-flows.spec.ts` |

---

## Audit Summary

**Verdict:** Recommendations are sound with minor adjustments.

**Required Adjustments:**
1. Reduce integration tests from 3 → 2 (remove overlap)
2. Add E2E-06 for skeleton loading state
3. Add focus trap assertion to mobile drawer test

**Total Adjusted Scope:**
- Test utilities: 1 file
- Integration tests: 2 tests (was 3)
- E2E tests: 6 tests (was 5)
- **Total: 8 new tests + utilities**

**Estimated Effort:** 60-75 minutes (was 65; IDs already present saves ~15 min)
