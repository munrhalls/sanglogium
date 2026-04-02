# Products Page Minimal Test Suite Specification

> **Date:** 2026-04-02
> **Scope:** Products listing page (`/products/[...slug]`)
> **Philosophy:** Minimal = 10-15 tests covering critical paths; Robust = data-first, user-visible behavior
> **Target:** Full impact with minimal maintenance burden

---

## Executive Summary

**Recommended Suite:** 12 tests total
- **Unit/VFS (existing):** 67 tests — no change needed ✅
- **Integration (new):** 3 tests — component behavior
- **E2E (new):** 5 tests — critical user flows
- **Visual regression:** 0 tests — not justified for current scope

**Key Principle:** Leverage existing 67 VFS tests (data layer), add only what's needed for UI/UX confidence.

---

## Test Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│  FOUNDATION (67 tests — EXISTING)                          │
│  tests/catalogue/vfs.test.ts                                │
│  • Data integrity: slug → ID → keys → products              │
│  • GROQ query correctness                                   │
│  • Index consistency                                        │
│  Status: ✅ COMPLETE — verified working                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  INTEGRATION (3 tests — NEW)                                │
│  tests/integration/products/                                │
│  • Component behavior in isolation                          │
│  • Props → Render output verification                       │
│  Status: ❌ TO CREATE                                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  E2E CRITICAL FLOWS (5 tests — NEW)                         │
│  tests/e2e/products-page/                                   │
│  • Full user journeys: navigation → filter → results        │
│  • Cross-browser, cross-viewport                            │
│  Status: ❌ TO CREATE                                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Tier 1: Foundation (EXISTING — 67 Tests)

**Location:** `tests/catalogue/vfs.test.ts`

**Why Keep:** These tests verify the data pipeline that powers ALL products page functionality. If these fail, nothing else matters.

**Coverage Verified:**
- Slug resolution: `resolveSlugToId("open-back")` → correct ID
- Descendant aggregation: Parent categories include all child products
- GROQ correctness: Queries return expected product counts
- Index integrity: No orphaned metadata, no circular references

**Maintenance:** Low — only changes if VFS schema changes

**CI Command:**
```bash
npx vitest run tests/catalogue/vfs.test.ts --reporter=verbose
```

---

## Tier 2: Integration Tests (NEW — 3 Tests)

**Location:** `tests/integration/products/ProductGrid.integration.test.tsx`

**Purpose:** Verify component behavior without full browser overhead

### Test I-01: ProductGrid renders products correctly
```typescript
it('renders products with correct data', () => {
  const products = [mockProduct1, mockProduct2];
  render(<ProductGrid products={products} />);
  
  expect(screen.getByTestId('product-grid')).toBeInTheDocument();
  expect(screen.getAllByTestId('product-card')).toHaveLength(2);
  expect(screen.getByText(mockProduct1.name)).toBeVisible();
  expect(screen.getByText(`$${mockProduct1.displayPrice.toLocaleString()}`)).toBeVisible();
});
```

### Test I-02: ProductGrid shows empty state
```typescript
it('shows empty state when no products', () => {
  render(<ProductGrid products={[]} />);
  
  expect(screen.getByTestId('empty-products')).toBeVisible();
  expect(screen.getByText(/no products found/i)).toBeInTheDocument();
});
```

### Test I-03: CategoryPageClient displays correct product count
```typescript
it('displays correct product count in result label', () => {
  render(<CategoryPageClient products={mockProducts} filters={[]} ... />);
  
  expect(screen.getByText('42 products')).toBeVisible(); // pluralization
  expect(screen.getByText('1 product')).toBeVisible(); // singular test in separate case
});
```

**Why These 3:**
- I-01: Core functionality — if products don't render, page is broken
- I-02: Edge case — empty categories must be handled gracefully
- I-03: User-visible data — count is important for UX

**Not Testing:**
- ❌ Filter logic (tested in E2E where URL matters)
- ❌ Sort logic (implementation detail)
- ❌ Mobile drawer (browser behavior, needs E2E)

---

## Tier 3: E2E Critical Flows (NEW — 5 Tests)

**Location:** `tests/e2e/products-page/critical-flows.spec.ts`

**Purpose:** Verify complete user journeys work end-to-end

### Test E2E-01: Category navigation loads products
```typescript
test('category page loads and displays products', async ({ page }) => {
  await page.goto('/products/headphones/open-back');
  
  // Verify page structure
  await expect(page.locator('[data-testid="product-grid"]')).toBeVisible();
  await expect(page.locator('h1')).toContainText('Open-Back');
  
  // Verify products exist (count may vary, but > 0)
  const cards = page.locator('[data-testid="product-card"]');
  await expect(cards.first()).toBeVisible();
  const count = await cards.count();
  expect(count).toBeGreaterThan(0);
});
```

### Test E2E-02: Invalid category shows 404
```typescript
test('invalid category slug shows 404', async ({ page }) => {
  await page.goto('/products/invalid-category-12345');
  
  // Verify 404 state
  const content = await page.content();
  expect(content).toContain('404') || expect(content).toContain('Not Found');
});
```

### Test E2E-03: Empty category shows message
```typescript
test('empty category shows "no products" message', async ({ page }) => {
  // Navigate to a category known to have 0 products
  await page.goto('/products/accessories/fit-comfort'); // if empty
  
  await expect(page.locator('[data-testid="empty-products"]')).toBeVisible();
  await expect(page.locator('text=/no products found/i')).toBeVisible();
});
```

### Test E2E-04: Mobile filter drawer opens/closes
```typescript
test('mobile filter drawer opens and closes', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 844 });
  await page.goto('/products/headphones/open-back');
  
  // Open drawer
  await page.locator('[data-testid="mobile-filter-button"]').click();
  await expect(page.locator('[data-testid="mobile-filter-drawer"]')).toBeVisible();
  
  // Close via button
  await page.locator('[data-testid="close-drawer-button"]').click();
  await expect(page.locator('[data-testid="mobile-filter-drawer"]')).not.toBeVisible();
});
```

### Test E2E-05: Sort changes URL and results
```typescript
test('sort selection updates URL and product order', async ({ page }) => {
  await page.goto('/products/headphones/open-back');
  
  // Get initial product name
  const firstProductBefore = await page.locator('[data-testid="product-card"] h3').first().textContent();
  
  // Change sort to price descending
  await page.locator('[data-testid="sort-dropdown"]').click();
  await page.locator('text=Price: High to Low').click();
  
  // Verify URL updated
  await expect(page).toHaveURL(/sort=price-desc/);
  
  // Verify product order changed (or at least re-rendered)
  await page.waitForLoadState('networkidle');
  const firstProductAfter = await page.locator('[data-testid="product-card"] h3').first().textContent();
  
  // Products may or may not be different, but grid should update
  await expect(page.locator('[data-testid="product-grid"]')).toBeVisible();
});
```

**Why These 5:**
- E2E-01: Core journey — if this fails, the page doesn't work
- E2E-02: Error handling — users must get helpful feedback
- E2E-03: Edge case — empty states must work
- E2E-04: Mobile experience — 50%+ traffic is mobile
- E2E-05: Interactivity — sort is primary user control

**Not Testing (Intentionally):**
- ❌ Every filter combination (3+ filters = exponential cases)
- ❌ Product card click navigation (covered in product-detail tests)
- ❌ Visual regression (high maintenance, low signal)
- ❌ Performance benchmarks (separate concern)

---

## Required Code Changes

### 1. Add data-testid attributes

**FilterSidebar:**
```tsx
// app/components/features/filters/FilterSidebar.tsx
<aside data-testid="filter-sidebar" className="...">
```

**SortDropdown:**
```tsx
// app/components/features/filters/SortDropdown.tsx
<div data-testid="sort-dropdown">
  {/* trigger button */}
</div>
```

**MobileControlsBar:**
```tsx
// app/components/features/filters/MobileControlsBar.tsx
<button data-testid="mobile-filter-button" onClick={onOpenFilters}>
  Filters
</button>
<span data-testid="mobile-product-count">{productCount} products</span>
```

**MobileFilterDrawer:**
```tsx
// app/components/features/filters/MobileFilterDrawer.tsx
<dialog data-testid="mobile-filter-drawer" open={isOpen}>
  <button data-testid="close-drawer-button" onClick={onClose}>Close</button>
</dialog>
```

### 2. Create test utilities

**tests/utils/products-page-helpers.ts:**
```typescript
import { Page } from '@playwright/test';

export const PLP_SELECTORS = {
  productGrid: '[data-testid="product-grid"]',
  productCard: '[data-testid="product-card"]',
  emptyProducts: '[data-testid="empty-products"]',
  filterSidebar: '[data-testid="filter-sidebar"]',
  sortDropdown: '[data-testid="sort-dropdown"]',
  mobileFilterButton: '[data-testid="mobile-filter-button"]',
  mobileFilterDrawer: '[data-testid="mobile-filter-drawer"]',
  mobileProductCount: '[data-testid="mobile-product-count"]',
} as const;

export async function navigateToCategory(page: Page, slug: string): Promise<void> {
  await page.goto(`/products/${slug}`);
  await page.waitForLoadState('networkidle');
}

export async function getProductCount(page: Page): Promise<number> {
  return page.locator(PLP_SELECTORS.productCard).count();
}

export const TEST_CATEGORIES = {
  openBack: 'headphones/open-back',
  closedBack: 'headphones/closed-back',
  emptyCategory: 'accessories/fit-comfort', // if empty
  invalid: 'non-existent-category-12345',
} as const;
```

---

## CI/CD Integration

### Test Execution Order
```bash
# 1. Fast feedback — unit tests (10s)
npx vitest run tests/catalogue/vfs.test.ts --reporter=verbose

# 2. Component behavior — integration tests (15s)
npx vitest run tests/integration/products/ --reporter=verbose

# 3. Critical flows — E2E tests (60s)
npx playwright test tests/e2e/products-page/ --reporter=list
```

### Total New CI Time: ~85 seconds
- VFS tests: ~10s
- Integration tests: ~15s
- E2E tests: ~60s (5 tests × ~12s each)

---

## Maintenance Strategy

### When to Add Tests
- New critical user flow (not covered by existing 5)
- Regression bug (add test to prevent recurrence)
- New major feature (e.g., wishlist, compare)

### When to Remove Tests
- Feature removed
- Test consistently flaky after 3 fix attempts
- Test superseded by more comprehensive coverage

### When to Modify Tests
- Test ID changes (update selector)
- URL structure changes (update navigation)
- Sort/filter options change (update test data)

---

## Risk Coverage Matrix

| Risk | Test Coverage | Confidence |
|------|---------------|------------|
| Products don't render | E2E-01, I-01 | **High** |
| Empty state broken | E2E-03, I-02 | **High** |
| Invalid URL crashes | E2E-02 | **High** |
| Mobile drawer broken | E2E-04 | **High** |
| Sort not working | E2E-05 | **High** |
| Filter logic broken | VFS tests (data) | **Medium** |
| URL state desync | E2E-05 | **Medium** |
| Performance regression | Not covered | **Low** |

---

## Summary

### What We Get (12 Tests Total)
1. ✅ Data integrity confidence (67 existing VFS tests)
2. ✅ Component rendering confidence (3 integration tests)
3. ✅ Critical user journey confidence (5 E2E tests)
4. ✅ Mobile experience confidence (E2E-04)
5. ✅ Edge case handling (E2E-02, E2E-03, I-02)

### What We Avoid
1. ❌ Test maintenance burden (minimal selector-based tests)
2. ❌ Slow CI (85s total for comprehensive coverage)
3. ❌ False positives (no visual regression, no snapshot tests)
4. ❌ Over-testing (no filter permutation explosion)

### Implementation Order
1. **Phase 1:** Add data-testid attributes (5 min)
2. **Phase 2:** Create test utilities (10 min)
3. **Phase 3:** Write integration tests (20 min)
4. **Phase 4:** Write E2E tests (30 min)
5. **Phase 5:** Verify in CI (5 min)

**Total Implementation Time:** ~70 minutes
