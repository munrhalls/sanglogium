# Audit: Search Functionality & Tests

**Date:** 2026-04-02  
**Scope:** Search Field, Autocomplete, Search Results Page  
**Status:** NO TESTS EXIST — Creating from scratch

---

## 1. End-State Delineation

### Target: Full Test Coverage
```
[SEARCH E2E TESTS — CURRENT: 0, TARGET: 23]
├── search-field.spec.ts          # 4 tests — Core autocomplete behavior
├── search-mobile.spec.ts         # 4 tests — Mobile overlay interactions  
├── search-keyboard.spec.ts       # 5 tests — Accessibility & keyboard nav
├── search-results.spec.ts        # 5 tests — Results page & data integration
├── search-errors.spec.ts         # 3 tests — API error handling
└── search-cross-page.spec.ts     # 3 tests — Search from any page
```

---

## 2. Spatial Architecture

### Search Component Hierarchy
```
Header (all pages)
├── SearchField (Client Component)
│   ├── Desktop: Inline input with autocomplete overlay
│   └── Mobile: Icon trigger → Full-screen overlay
│       └── AutocompleteOverlay (absolute/fixed positioned)
│           ├── Listbox with role="listbox"
│           ├── Options with role="option"
│           └── "View all results" link
│
Search Page (/search?q=)
├── SearchHeader
├── SortDropdown
└── ProductGrid
    └── ProductCard[]
        └── Price with data-testid="product-price"
```

---

## 3. Gap Analysis (G-XX)

| ID | Component | Current State | Target State | Severity |
|----|-----------|---------------|--------------|----------|
| G-01 | Search Tests | **NO TESTS EXIST** | 23 E2E tests across 6 files | **CRITICAL** |
| G-02 | Search Field | Implemented, untested | Tests verify autocomplete, navigation | **Critical** |
| G-03 | Mobile Search | Implemented, untested | Tests verify overlay, focus, dismissal | **Critical** |
| G-04 | Keyboard Nav | ARIA attributes present, untested | Tests verify WCAG 2.1 AA compliance | **High** |
| G-05 | Error States | No error UI implemented | Graceful error handling with user message | **High** |
| G-06 | Cross-Page | Header global, untested | Tests verify search from PDP/PLP | **Medium** |

---

## 4. RWD Strategy

| Component | Desktop (1280px) | Mobile (375px) | Test Approach |
|-----------|------------------|----------------|---------------|
| Search Input | Inline visible | Icon-only → expand | Separate mobile test file |
| Autocomplete | Below input, 6 results | Full viewport, no thumbnails | Viewport-specific assertions |
| Mobile Overlay | Hidden | Fixed z-[60] overlay | `setViewportSize(375, 667)` |

---

## 5. Files at Risk of Regression

| File | Risk | Mitigation |
|------|------|------------|
| `SearchField.tsx` | Adding error states | Keep existing logic, add error UI only |
| `AutocompleteOverlay.tsx` | Error message display | Add optional error prop |
| `searchProducts.ts` | Error handling | Wrap fetch in try/catch |

---

## 6. Verification Commands

```bash
# Create tests directory
mkdir -p tests/e2e/search

# Run search tests
npx playwright test tests/e2e/search/ --reporter=list

# Run specific file
npx playwright test tests/e2e/search/search-field.spec.ts --ui

# Build verification
npm run build
```

---

## Critical Finding

**ZERO search tests exist.** The search functionality is fully implemented but completely untested. This is a high-risk gap for a primary conversion path.

**Implementation Order:**
1. Create test files (23 tests total)
2. Run tests to identify failures
3. Fix functionality to make tests pass
4. Verify build succeeds
