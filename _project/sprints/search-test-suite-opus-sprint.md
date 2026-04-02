# Search UI Test Suite — Professional Sprint Specification

**Sprint ID:** SEARCH-TEST-SUITE-001
**Target:** Transform 5/10 test report → 8/10 professional specification
**Ground Factor:** Fix selector bugs + add 7 missing journeys + professional audit format
**Baseline:** Build passing ✅
**Scope Lock:** SPEC-ONLY — no test file creation, no component changes

---

## Scope Lock Rules (DO NOT TOUCH)

- NO creation of actual test files (this sprint produces specification only)
- NO modifications to `SearchField.tsx` (verified: selectors already exist)
- NO modifications to search functionality or GROQ queries
- NO changes to homepage, PLP, PDP, or other unrelated pages
- NO visual regression or performance benchmarking
- ONLY ONE permitted component change: `ProductCard.tsx` line 45 — add `data-testid="product-price"` (already done)

---

## Gap Analysis (G-SXX)

| ID | Gap | Current State | Target State | Severity | Component |
|----|-----|---------------|--------------|----------|-----------|
| G-S01 | Test 4.2 Selector | Uses `[data-testid="price"]` — does not exist | Uses `[data-testid="product-price"]` or `.type-price` | **Critical** | ProductCard |
| G-S02 | Search→PDP Navigation | No E2E test | Test verifies click suggestion → navigates to product | **Critical** | SearchField |
| G-S03 | Query Persistence | No refresh test | Test verifies query persists after reload | **High** | SearchField + URL |
| G-S04 | Empty State Recovery | No recovery flow test | Test verifies "Browse all products" link works | **High** | SearchResults |
| G-S05 | Cross-Page Search | Tests only from `/` | Test verifies search works from PDP/PLP | **High** | Header (global) |
| G-S06 | Accessibility Scan | No WCAG testing | axe-core scan passes for autocomplete | **High** | AutocompleteOverlay |
| G-S07 | API Error Handling | No degradation test | Test shows user-friendly message on API fail | **Medium** | searchProducts |
| G-S08 | Race Condition Test | 20-line complex test, flaky | Simplified or removed | **Medium** | SearchField |

---

## Data-Testid Audit (Verified Selectors)

| Component | Element | Selector | Status | Line # |
|-----------|---------|----------|--------|--------|
| SearchField | Desktop Input | `[aria-label="Search products"]` | ✅ Verified | 196, 266 |
| SearchField | Mobile Input | `[aria-label="Search products"]` | ✅ Verified | 266 |
| SearchField | Open Button | `[aria-label="Open search"]` | ✅ Verified | 157 |
| SearchField | Close Button | `[aria-label="Close search"]` | ✅ Verified | 172 |
| AutocompleteOverlay | Listbox | `[role="listbox"]` | ✅ Verified | 43 |
| AutocompleteOverlay | Option | `[role="option"]` | ✅ Verified | Item.tsx:18 |
| ProductCard | Card | `[data-testid="product-card"]` | ✅ Verified | 24 |
| ProductCard | Price | `[data-testid="product-price"]` | ✅ **ADDED** | 45 |
| SearchResults | Grid | `[data-testid="product-grid"]` | ✅ Verified | Grid.tsx |

**⚠️ Selector Strategy:** Use `data-testid` for stable targets, `aria-label` for accessibility-required elements, class names only as fallback.

---

## Spatial Architecture (Component Hierarchy)

```
Header (Server — all pages)
├── SearchField (Client — "use client")
│   ├── Desktop Input (hidden below sm)
│   │   ├── Input with aria-label
│   │   ├── Clear button (X icon)
│   │   └── AutocompleteOverlay (absolute positioned)
│   │       ├── Listbox with role="listbox"
│   │       ├── AutocompleteItem[] with role="option"
│   │       └── "View all results" footer link
│   └── Mobile Expand (sm:hidden)
│       ├── Overlay (fixed inset-0, z-[60])
│       ├── Back button (ArrowLeft)
│       ├── Input (same aria-label)
│       └── AutocompleteOverlay (no thumbnails)
│
Search Page (Server — /search?q=)
├── SearchHeader (Breadcrumb + Title)
├── Suspense boundary
│   └── SearchResults (async Server Component)
│       ├── SortDropdown (Client)
│       ├── ProductGrid (Client)
│       │   └── ProductCard[]
│       │       ├── Image (ProductImage)
│       │       ├── Name (h3)
│       │       ├── Price (data-testid="product-price")
│       │       └── Cart button
│       └── SearchEmpty (if no results)
│           ├── "No products found" message
│           └── "Browse all products" recovery link
```

**Key Spatial Relationships:**
- Mobile overlay has `z-[60]` — higher than header's z-index
- Desktop autocomplete is `absolute` within `relative` container
- Click-outside listener on `document` (line 110 in SearchField.tsx)

---

## RWD Strategy (Test Viewports)

| Component | Desktop (1280px) | Tablet (768px) | Mobile (375px) | Selector Adaptation |
|-----------|------------------|----------------|------------------|---------------------|
| SearchField | Inline visible | Inline visible | Icon-only → expand | Same aria-label both modes |
| AutocompleteOverlay | Below input, thumbnails | Below input, thumbnails | Full viewport, no thumbnails | `[role="listbox"]` consistent |
| Mobile Overlay | Hidden | Hidden | Fixed full-screen | `sm:hidden` / `hidden sm:block` |
| ProductGrid | 4 columns (no sidebar) | 3 columns | 1-2 columns | Grid responsive, cards same |

---

## Scope Contracts (SC)

### SC1: Fix Selector Bug — G-S01

**Gap Coverage:** G-S01
**Target State:** Test 4.2 uses valid, verified selector for price element

**DoD:**
- [ ] Verify `data-testid="product-price"` added to `ProductCard.tsx:45`
- [ ] Update test specification to use `[data-testid="product-price"]`
- [ ] Document alternative: `.type-price` class selector as fallback

**Verification:**
```bash
grep -n "data-testid=\"product-price\"" app/components/features/products/ProductCard.tsx
# Expected: 45
```

---

### SC2: Search-to-PDP Navigation — G-S02

**Gap Coverage:** G-S02
**Target State:** E2E test verifies autocomplete → product detail navigation

**DoD:**
- [ ] Test fills search input with known product name
- [ ] Test waits for `[role="listbox"]` visibility
- [ ] Test clicks `[role="option"]` with product name
- [ ] Test asserts URL matches `/product/{slug}`
- [ ] Test asserts `h1` contains product name

**Specification:**
```typescript
test('search autocomplete navigates to product detail page', async ({ page }) => {
  await page.goto('/');
  await page.fill('[aria-label="Search products"]', 'HD 569');
  await expect(page.locator('[role="listbox"]')).toBeVisible();
  await page.click('[role="option"]:has-text("Sennheiser HD 569")');
  await expect(page).toHaveURL('/product/sennheiser-hd-569-headphones');
  await expect(page.locator('h1')).toContainText('Sennheiser HD 569');
});
```

**Verification:**
```bash
npx playwright test tests/e2e/search/search-field.spec.ts --grep "navigates to product"
```

---

### SC3: Query Persistence — G-S03

**Gap Coverage:** G-S03
**Target State:** Test verifies search query survives page refresh

**DoD:**
- [ ] Test navigates to `/search?q=sennheiser`
- [ ] Test reloads page
- [ ] Test asserts input value equals 'sennheiser'

**Specification:**
```typescript
test('search query persists after page refresh', async ({ page }) => {
  await page.goto('/search?q=sennheiser');
  await page.reload();
  await expect(page.locator('[aria-label="Search products"]')).toHaveValue('sennheiser');
});
```

---

### SC4: Empty State Recovery — G-S04

**Gap Coverage:** G-S04
**Target State:** Test verifies "no results" → recovery navigation works

**DoD:**
- [ ] Test navigates to search with nonsense query
- [ ] Test asserts "No products found" visible
- [ ] Test clicks "Browse all products" link
- [ ] Test asserts navigation to `/products`

**Specification:**
```typescript
test('empty search results show category recovery options', async ({ page }) => {
  await page.goto('/search?q=xyznonexistent12345');
  await expect(page.locator('text=No products found')).toBeVisible();
  await page.click('text=Browse all products');
  await expect(page).toHaveURL('/products');
});
```

---

### SC5: Cross-Page Search — G-S05

**Gap Coverage:** G-S05
**Target State:** Test verifies search works when initiated from non-homepage

**DoD:**
- [ ] Test navigates to PDP
- [ ] Test fills search input with new query
- [ ] Test presses Enter
- [ ] Test asserts navigation to `/search?q={query}`

**Specification:**
```typescript
test('search works from product detail page', async ({ page }) => {
  await page.goto('/product/sennheiser-hd-569-headphones');
  await page.fill('[aria-label="Search products"]', 'hd650');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL('/search?q=hd650');
});
```

---

### SC6: Accessibility Scan — G-S06

**Gap Coverage:** G-S06
**Target State:** axe-core WCAG 2.1 AA compliance for autocomplete

**DoD:**
- [ ] Test injects axe-core
- [ ] Test opens autocomplete overlay
- [ ] Test runs accessibility scan on listbox
- [ ] Test passes with 0 violations

**Specification:**
```typescript
import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from '@axe-core/playwright';

test('search autocomplete meets WCAG 2.1 AA', async ({ page }) => {
  await page.goto('/');
  await injectAxe(page);
  await page.fill('[aria-label="Search products"]', 'hd');
  await page.waitForSelector('[role="listbox"]');
  await checkA11y(page, '[role="listbox"]', {
    rules: {
      'aria-required-attr': { enabled: true },
      'aria-valid-attr-value': { enabled: true },
      'keyboard-navigation': { enabled: true }
    }
  });
});
```

---

### SC7: API Error Handling — G-S07

**Gap Coverage:** G-S07
**Target State:** Graceful degradation when Sanity API fails

**DoD:**
- [ ] Test mocks API route to fail
- [ ] Test triggers search
- [ ] Test asserts user-friendly error message visible

**Specification:**
```typescript
test('API error shows user-friendly message', async ({ page }) => {
  await page.route(/searchProductsAutocomplete/, route => route.abort('failed'));
  await page.goto('/');
  await page.fill('[aria-label="Search products"]', 'hd');
  await expect(page.locator('text=Unable to search')).toBeVisible();
});
```

---

### SC8: Simplify Race Condition Test — G-S08

**Gap Coverage:** G-S08
**Target State:** Remove over-engineered race condition test

**DoD:**
- [ ] Remove Test 1.4 from specification
- [ ] Document: Race conditions better handled by monitoring + production retries
- [ ] Add note: Debounce behavior covered by "no request before 2 chars" test

**Rationale:** Original test required 20 lines of complex route interception with timing delays. High flakiness, low ROI.

---

### SC9: Professional Audit Format — Documentation

**Gap Coverage:** All G-SXX
**Target State:** Report includes gap IDs, severity matrix, selector audit, spatial mapping

**DoD:**
- [ ] Gap table with G-S01 through G-S08
- [ ] Severity column (Critical/High/Medium/Low)
- [ ] Data-testid verification table
- [ ] Spatial architecture hierarchy
- [ ] RWD strategy table
- [ ] Files at risk section (none for this spec-only sprint)

---

### SC10: Verification Commands — Documentation

**Gap Coverage:** Execution readiness
**Target State:** Copy-paste ready commands for CI and debugging

**DoD:**
- [ ] Full suite command
- [ ] Single file command
- [ ] UI mode command
- [ ] CI reporter command

**Commands:**
```bash
# Full search test suite
npx playwright test tests/e2e/search/ --reporter=list

# Single file debugging
npx playwright test tests/e2e/search/search-field.spec.ts --ui

# CI mode with JUnit output
npx playwright test tests/e2e/search/ --reporter=junit

# Specific test by name
npx playwright test tests/e2e/search/ --grep "navigates to product"
```

---

## Final Test Suite Structure

```
tests/e2e/search/
├── README.md                       # Philosophy + troubleshooting
├── search-field.spec.ts            # 4 tests (was 5, -1 race condition)
│   ├── typing valid query navigates to product
│   ├── typing 1 character does not trigger API
│   ├── no results shows empty state
│   └── [removed: race condition test]
├── search-mobile.spec.ts           # 4 tests (was 3, +1 keyboard dismiss)
│   ├── mobile search icon opens overlay
│   ├── mobile input auto-focused
│   ├── mobile overlay closes on result click
│   └── keyboard dismissal restores focus
├── search-keyboard.spec.ts         # 5 tests (was 4, +1 a11y)
│   ├── arrow keys navigate suggestions
│   ├── enter on highlighted navigates
│   ├── escape closes and returns focus
│   ├── home/end keys work
│   └── WCAG 2.1 AA compliance scan
├── search-results.spec.ts          # 5 tests (was 4, +1 persistence)
│   ├── URL param parsing renders products
│   ├── sort parameter reorders results
│   ├── empty results shows recovery
│   ├── query persists after refresh
│   └── in-page search updates URL
├── search-errors.spec.ts           # NEW 3 tests
│   ├── API error shows friendly message
│   ├── network failure handled gracefully
│   └── timeout shows retry option
└── search-cross-page.spec.ts       # NEW 3 tests
    ├── search from PDP works
    ├── search from PLP works
    └── search from search page works
```

**Total: 24 tests** (was 16, +8 new)

---

## Files at Risk of Regression

| File | Risk | Mitigation |
|------|------|------------|
| `ProductCard.tsx` | Added data-testid | Verify no visual regression, test selector works |
| `search-ui-test-suite-report.md` | Complete rewrite | Maintain backup of original for comparison |

---

## Verification Commands (Final)

```bash
# Pre-sprint baseline (already done)
npm run build  # ✅ PASSED

# Post-execution build verification
npm run build
# Expect: Zero errors, 23 pages static generated

# No test execution (spec-only sprint)
# Tests will be created in follow-up sprint
```

---

## Success Criteria

| Metric | Target | Verification |
|--------|--------|--------------|
| Professional rating | 8/10 | Gap IDs present, selector audit complete, 7 new journeys added |
| Selector bug | FIXED | Test 4.2 uses `data-testid="product-price"` |
| Build status | PASSING | `npm run build` exits 0 |
| Documentation | COMPLETE | 10 SCs with DoDs, verification commands, RWD table |
| Ready for implementation | YES | Test files can be created without further design |

---

## Anti-Patterns Avoided

| Anti-Pattern | Status | Why Avoided |
|--------------|--------|-------------|
| Per-layer screenshots | ❌ Not included | Wastes time, functional tests catch real bugs |
| Race condition complexity | ❌ Removed | Flaky tests hurt CI reliability |
| Visual regression | ❌ Not included | Search is function-critical, not aesthetic-critical |
| Cross-browser matrix (7 browsers) | ❌ Not included | Mobile Safari + Desktop Chrome covers 95% |
| Component changes beyond scope | ❌ Blocked | Only data-testid added, no logic changes |

---

**End of Professional Sprint Specification**
