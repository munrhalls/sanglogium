# Sprint: PLP-TEST-FIX-2026-04-02 — Test Suite Gap Remediation

> **Sprint Name:** PLP-TEST-FIX-2026-04-02
> **Target State:** Fix critical gaps in products page test suite
> **Scope Lock Date:** 2026-04-02
> **Estimated Duration:** 30-45 minutes
> **Sprint Type:** Test Coverage Remediation

---

## Sprint Metadata

### Scope Lock Rules (MANDATORY — Do Not Violate)
- **NO** modifications to globals.css — testing only
- **NO** modifications to production component logic
- **NO** changes to VFS data layer
- **NO** homepage or other page scope creep
- **YES** add missing E2E tests for critical user journeys
- **YES** improve test utilities as needed
- **YES** fix infrastructure issues (playwright config)

### Baseline State (Pre-Sprint)
- 67 VFS tests passing (unchanged)
- 3 integration tests passing (2 ProductGrid, 1 CategoryPageClient)
- 6 E2E tests exist but need 3 additions
- Build passing

### Gaps to Address (From Audit)
| Gap ID | Issue | Severity | Test ID |
|--------|-------|----------|---------|
| G-02 | Missing Product → PDP navigation | **HIGH** | E2E-07 |
| G-01 | Missing filter application | Medium | E2E-08 |
| G-04 | Empty category test conditional | Medium | Fix E2E-03 |

---

## Scope Contracts (SC)

### SC1: Product → PDP Navigation Test — G-02 Coverage (HIGH)

**Gap Coverage:** G-02 — No test for primary user goal (viewing product details)

**Target State:**
New E2E test verifies clicking product card navigates to product detail page.

**DoD (Sequenced):**
- [ ] **Pass 1:** Add E2E-07 skeleton to `critical-flows.spec.ts`
- [ ] **Pass 2:** Implement test: click first product card → capture href → verify navigation
- [ ] **Pass 3:** Add test data selector to helpers if needed
- [ ] **Pass 3:** Verify test passes with dev server running

**Implementation Details:**
```typescript
// E2E-07: Click product navigates to PDP
test('clicking product card navigates to product detail page', async ({ page }) => {
  await navigateToCategory(page, TEST_CATEGORIES.openBack);
  
  // Get first product link
  const firstProduct = page.locator(`${PLP_SELECTORS.productCard} a`).first();
  const href = await firstProduct.getAttribute('href');
  
  // Click and verify navigation
  await firstProduct.click();
  await page.waitForLoadState('networkidle');
  
  // Verify URL changed to product detail
  expect(page.url()).toContain('/product/');
  expect(page.url()).toContain(href);
  
  // Verify PDP content loaded
  await expect(page.locator('h1')).toBeVisible();
});
```

**Build Gate:**
```bash
npx playwright test tests/e2e/products-page/critical-flows.spec.ts --grep "navigates to product" --reporter=list
# Expected: 1 test passing
```

**Delegation:**
- **Execution:** `/implement "Add E2E-07 test to critical-flows.spec.ts: click first product card, capture href, click, verify navigation to /product/ URL, verify h1 visible"`
- **Verify:** `/test --grep "navigates to product"`

---

### SC2: Filter Application Test — G-01 Coverage (Medium)

**Gap Coverage:** G-01 — E2E-04 opens drawer but doesn't verify filters actually work

**Target State:**
New E2E test applies a filter and verifies product count changes.

**DoD (Sequenced):**
- [ ] **Pass 1:** Add E2E-08 skeleton
- [ ] **Pass 2:** Implement test: get initial count → apply brand filter → verify count < initial
- [ ] **Pass 2:** Add filter checkbox selector to helpers
- [ ] **Pass 3:** Verify test passes

**Implementation Details:**
```typescript
// Add to helpers
checkboxFilter: (field: string, value: string) => `input[name="${field}"][value="${value}"]`,

// E2E-08: Apply filter reduces results
test('applying filter reduces product count', async ({ page }) => {
  await navigateToCategory(page, TEST_CATEGORIES.openBack);
  
  // Get initial count
  const initialCount = await getProductCount(page);
  expect(initialCount).toBeGreaterThan(0);
  
  // Apply a brand filter (select first available brand)
  const firstBrandCheckbox = page.locator('input[type="checkbox"]').first();
  await firstBrandCheckbox.check();
  
  // Wait for URL update (filter param added)
  await page.waitForURL(/f=/);
  
  // Verify count reduced
  const filteredCount = await getProductCount(page);
  expect(filteredCount).toBeLessThan(initialCount);
  
  console.log(`[E2E-08] Filter applied: ${initialCount} → ${filteredCount} products`);
});
```

**Build Gate:**
```bash
npx playwright test tests/e2e/products-page/critical-flows.spec.ts --grep "applying filter" --reporter=list
```

**Delegation:**
- **Execution:** `/implement "Add E2E-08 test: get initial product count, check first brand filter checkbox, wait for URL with f= param, verify product count is less than initial"`
- **Verify:** `/test --grep "applying filter"`

---

### SC3: Fix Empty Category Test — G-04 Coverage (Medium)

**Gap Coverage:** G-04 — E2E-03 passes whether empty state OR products load (conditional)

**Target State:**
Refactored test forces empty state using route interception or known-empty category.

**DoD (Sequenced):**
- [ ] **Pass 1:** Identify approach: route interception vs. test category
- [ ] **Pass 2:** Implement forced empty state
- [ ] **Pass 2:** Verify empty state UI elements (heading, message, CTA)
- [ ] **Pass 3:** Test passes reliably

**Implementation Options:**
```typescript
// Option A: Route interception (preferred)
test('empty category shows no products message', async ({ page }) => {
  // Intercept API call and return empty
  await page.route('**/api/products**', async (route) => {
    await route.fulfill({ json: { products: [] } });
  });
  
  await navigateToCategory(page, TEST_CATEGORIES.openBack);
  
  // Verify empty state
  await expect(page.locator(PLP_SELECTORS.emptyProducts)).toBeVisible();
  await expect(page.locator('text=/no products found/i')).toBeVisible();
});

// Option B: Use known-empty category
const TEST_CATEGORIES = {
  ...existing,
  emptyTest: 'accessories/test-empty-category', // Must be truly empty
};
```

**Build Gate:**
```bash
npx playwright test tests/e2e/products-page/critical-flows.spec.ts --grep "empty category" --reporter=list
```

**Delegation:**
- **Execution:** `/implement "Refactor E2E-03 to use route interception: add page.route to return empty products, navigate to category, verify empty-products testid visible, verify 'no products found' text present"`
- **Verify:** `/test --grep "empty category"`

---

## RWD Strategy

All new tests use **desktop viewport** (1280×720) except:
- E2E-04 (mobile drawer) — already exists, mobile-only
- No mobile-specific additions needed for gaps

---

## Files at Risk of Regression

| File | Risk | Mitigation |
|------|------|------------|
| `tests/e2e/products-page/critical-flows.spec.ts` | Adding tests | Verify existing 6 tests still pass |
| `tests/utils/products-page-helpers.ts` | May add selectors | Ensure no breaking changes to exports |
| `playwright.config.ts` | No changes planned | Verify reuseExistingServer works |

---

## Regression Containment Plan

### Pre-Sprint Baseline
```bash
# Capture current E2E test state
npx playwright test tests/e2e/products-page/critical-flows.spec.ts --reporter=list
# Expected: 6 tests passing
```

### During Sprint
| After SC | Command | Expected |
|----------|---------|----------|
| SC1 | Run all E2E tests | 7 tests passing (6+1 new) |
| SC2 | Run all E2E tests | 8 tests passing (6+2 new) |
| SC3 | Run all E2E tests | 8 tests passing (E2E-03 fixed) |

### Final Verification
```bash
# Full test suite
npx vitest run tests/integration/products/
npx playwright test tests/e2e/products-page/

# Expected totals:
# - Integration: 3 tests (unchanged)
# - E2E: 8 tests (was 6, +2 new, 1 fixed)
```

---

## Execution Order (MANDATORY)

```
PHASE 1: High Priority (SC1)
├── /implement "Add E2E-07 Product → PDP navigation test"
├── /test --grep "navigates to product"
└── Build gate: 7 tests passing

PHASE 2: Medium Priority (SC2)
├── /implement "Add E2E-08 Filter application test"
├── /test --grep "applying filter"
└── Build gate: 8 tests passing

PHASE 3: Medium Priority (SC3)
├── /implement "Fix E2E-03 with route interception"
├── /test --grep "empty category"
└── Build gate: 8 tests passing, E2E-03 no longer conditional

PHASE 4: Lock
├── /test -- Full E2E suite (8 tests)
├── npm run build
└── Sprint complete
```

---

## Delegation Commands

```bash
# SC1: Product → PDP (HIGH priority)
/implement "Add E2E-07 test to critical-flows.spec.ts: click first product card link, get href attribute, click, verify navigation to URL containing /product/, verify h1 element visible on PDP"

# SC2: Filter application (Medium priority)
/implement "Add E2E-08 test: get initial product count with getProductCount, click first brand checkbox in filter sidebar, wait for URL with f= param, verify filtered product count is less than initial count, log the count change"

# SC3: Fix empty category test (Medium priority)
/implement "Refactor E2E-03 empty category test: add page.route interceptor before navigation to return empty products array, navigate to category, verify empty-products data-testid is visible, verify 'no products found' text is present, remove the conditional if/else logic"

# Verify each
/test --grep "navigates to product"
/test --grep "applying filter"
/test --grep "empty category"

# Final verification
/test --suite e2e/products-page
```

---

## Anti-Patterns to Avoid

- ❌ Don't add tests for edge cases before critical path (PDP navigation is P0)
- ❌ Don't modify existing working tests unnecessarily
- ❌ Don't add visual regression tests — out of scope
- ❌ Don't test implementation details — test user-visible behavior

---

## Sprint Completion Criteria

- [ ] SC1: E2E-07 Product → PDP test passing
- [ ] SC2: E2E-08 Filter application test passing
- [ ] SC3: E2E-03 Empty category test no longer conditional
- [ ] All 8 E2E tests passing (6 original + 2 new)
- [ ] 3 Integration tests still passing (no regression)
- [ ] 67 VFS tests still passing (no regression)
- [ ] `npm run build` succeeds

---

## Quick Reference: Test Count Progression

| Phase | Integration | E2E | Total |
|-------|-------------|-----|-------|
| Baseline | 3 | 6 | 9 |
| After SC1 | 3 | 7 | 10 |
| After SC2 | 3 | 8 | 11 |
| After SC3 | 3 | 8 | 11 |
