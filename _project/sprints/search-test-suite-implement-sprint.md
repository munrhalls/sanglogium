# /implement — Search Test Suite Sprint: Production-Ready Preparation

**Sprint Date:** 2026-04-02  
**Scope:** Fix search-ui-test-suite-report.md to achieve 8/10 professional rating  
**Reference:** search-test-suite-self-critique.md

---

## PHASE 1: Plan and Contain

### DoD 0: Pre-Sprint Baseline ✅
- [x] Branch check: `main` branch, clean working directory (unrelated changes documented)
- [x] Baseline build: `npm run build` ✅ PASSED
- [x] Scope lock: No other sprint in progress

---

### Explicit Refined Scope

Transform the 5/10-rated search test suite report into a **professional 8/10 specification** that is safe for immediate implementation.

**IN SCOPE:**
1. Fix selector bug: Test 4.2 uses non-existent `data-testid="price"` → add proper selector or data-testid
2. Add 7 missing critical test journeys (from self-critique Part 6)
3. Add accessibility integration test (axe-core scan)
4. Add API error handling test
5. Create professional audit format with gap ID system (G-S01, G-S02, etc.)
6. Remove/simplify race condition test (Test 1.4)
7. Add data-testid verification section
8. Add exact verification commands

**OUT OF SCOPE (Scope Lock):**
- NO actual test file creation (this sprint is SPEC only)
- NO modification to SearchField.tsx, ProductCard.tsx (read-only for verification)
- NO visual regression tests
- NO performance benchmarking
- NO changes to search functionality itself
- NO homepage, PLP, or PDP changes

---

### Explicit Refined DoDs

#### DoD 1: Fix Critical Selector Bug
**Target:** Test 4.2 (sort persistence) uses working selector  
**Verification:** Verify `ProductCard.tsx` price element has accessible selector  
**Action:**
- Read ProductCard.tsx lines 40-50
- If no data-testid on price, recommend adding `data-testid="product-price"`
- Update test specification to use valid selector

#### DoD 2: Add Missing Critical Journey — Search-to-PDP
**Target:** Test verifies search → product detail navigation  
**Specification:**
```typescript
test('search autocomplete navigates to product detail page', async ({ page }) => {
  await page.goto('/');
  await page.fill('[aria-label="Search products"]', 'HD 569');
  await page.click('[role="option"]:has-text("Sennheiser HD 569")');
  await expect(page).toHaveURL('/product/sennheiser-hd-569-headphones');
  await expect(page.locator('h1')).toContainText('Sennheiser HD 569');
});
```

#### DoD 3: Add Missing Critical Journey — Search Query Persistence
**Target:** Test verifies query persists after page refresh  
**Specification:**
```typescript
test('search query persists after page refresh', async ({ page }) => {
  await page.goto('/search?q=sennheiser');
  await page.reload();
  await expect(page.locator('[aria-label="Search products"]')).toHaveValue('sennheiser');
});
```

#### DoD 4: Add Missing Critical Journey — Empty State Recovery
**Target:** Test verifies "no results" → category suggestion works  
**Specification:**
```typescript
test('empty search results show category recovery options', async ({ page }) => {
  await page.goto('/search?q=xyznonexistent');
  await expect(page.locator('text=No products found')).toBeVisible();
  await page.click('text=Browse all products');
  await expect(page).toHaveURL('/products');
});
```

#### DoD 5: Add Missing Critical Journey — Cross-Page Search
**Target:** Test verifies search works from non-homepage pages  
**Specification:**
```typescript
test('search works from product detail page', async ({ page }) => {
  await page.goto('/product/sennheiser-hd-569-headphones');
  await page.fill('[aria-label="Search products"]', 'hd650');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL('/search?q=hd650');
});
```

#### DoD 6: Add Accessibility Integration Test
**Target:** WCAG 2.1 AA compliance for search components  
**Specification:**
```typescript
test('search autocomplete meets WCAG 2.1 AA', async ({ page }) => {
  const { injectAxe, checkA11y } = require('@axe-core/playwright');
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

#### DoD 7: Add API Error Handling Test
**Target:** Graceful degradation when Sanity API fails  
**Specification:**
```typescript
test('API error shows user-friendly message', async ({ page }) => {
  await page.route(/searchProductsAutocomplete/, route => route.abort('failed'));
  await page.fill('[aria-label="Search products"]', 'hd');
  await expect(page.locator('text=Unable to search')).toBeVisible();
});
```

#### DoD 8: Simplify Race Condition Test
**Target:** Remove complex/flaky Test 1.4  
**Action:** Replace with simpler version or remove entirely  
**Rationale:** Race condition testing adds 20% complexity for edge case; monitoring + retries in production more reliable

#### DoD 9: Add Data-Testid Verification Section
**Target:** Professional audit includes selector audit  
**Format:**
```markdown
### Data-Testid Audit
| Component | Element | Selector | Status |
|-----------|---------|----------|--------|
| SearchField | Input | `[aria-label="Search products"]` | ✅ Verified |
| ProductCard | Price | `.type-price` | ⚠️ Add data-testid |
```

#### DoD 10: Create Gap ID System
**Target:** Professional audit format with traceable gaps  
**Format:**
```markdown
| ID | Component | Current State | Target State | Severity |
|----|-----------|---------------|--------------|----------|
| G-S01 | Test 4.2 Selector | Non-existent data-testid | Working selector | Critical |
| G-S02 | Search-to-PDP | No test | E2E test exists | Critical |
```

#### DoD 11: Add Exact Verification Commands
**Target:** Copy-paste ready commands for CI  
**Format:**
```bash
# Run search test suite
npx playwright test tests/e2e/search/ --reporter=list

# Run with UI for debugging
npx playwright test tests/e2e/search/search-field.spec.ts --ui

# CI mode
npx playwright test tests/e2e/search/ --reporter=junit
```

---

### Read-Only Context Paths

**FOR VERIFICATION ONLY — DO NOT MODIFY:**
- `app/components/layout/header/SearchField.tsx` — Verify aria-labels, selectors
- `app/components/features/products/ProductCard.tsx` — Verify price element selector
- `app/components/features/search/AutocompleteOverlay.tsx` — Verify role="listbox"
- `app/(store)/search/page.tsx` — Verify URL structure
- `sanity/lib/products/searchProducts.ts` — Verify API endpoints for route mocking

### Allowed Write Scope Paths

**ONLY FILES TO MODIFY:**
- `_project/research/search-ui-test-suite-report.md` — Update with professional format
- `app/components/features/products/ProductCard.tsx` — ADD data-testid="product-price" (if missing)

---

### Verification Command

```bash
# Post-execution verification
npm run build
```

**Pass Criteria:**
- Build succeeds with no errors
- No TypeScript errors
- No new lint errors

---

## PHASE 2: Execution Sequence

### Execution Order

| Order | DoD | Estimated Time | Dependencies |
|-------|-----|----------------|--------------|
| 1 | DoD 1: Fix selector bug | 10 min | Read ProductCard.tsx |
| 2 | DoD 9: Data-testid audit | 10 min | DoD 1 complete |
| 3 | DoD 2-5: Missing journeys | 20 min | None |
| 4 | DoD 6-7: A11y + error tests | 15 min | None |
| 5 | DoD 8: Simplify race test | 5 min | None |
| 6 | DoD 10: Gap ID system | 15 min | All above |
| 7 | DoD 11: Verification commands | 5 min | DoD 10 |
| **TOTAL** | | **~80 min** | |

### /test Integration Per DoD

**DoD 1 Test:**
```typescript
// Verify ProductCard price element exists
const priceElement = page.locator('.type-price').first();
await expect(priceElement).toBeVisible();
const testId = await priceElement.getAttribute('data-testid');
expect(testId).toBe('product-price'); // After fix
```

**DoD 2-7 Tests:**
- Each test specification will include single assertion
- Max 5 second runtime per test
- Blocking: Must pass before proceeding

---

## Success Criteria

**Final Output: Professional Test Suite Specification**
- Rating: 8/10 (up from 5/10)
- Selector bugs: FIXED
- Missing journeys: ADDED (7 new)
- Accessibility: COVERED
- Professional format: APPLIED (gap IDs, audit table, verification commands)
- Build: PASSING

**Ready for Implementation:**
Test files can be created from specification with zero additional design work.
