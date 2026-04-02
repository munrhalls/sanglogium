# Audit: Search Test Coverage Gaps

**Date:** 2026-04-02  
**Scope:** Search E2E Test Suite — Gap Analysis  
**Auditor:** AI Agent  
**Severity:** HIGH — Runtime errors escaping test coverage

---

## Executive Summary

The search test suite has **critical coverage gaps** that allowed a Next.js 15 Server/Client Component runtime error to escape detection. The error (`Event handlers cannot be passed to Client Component props`) was only discovered through manual testing, not automated tests.

### Key Finding
| Gap | Impact | Severity |
|-----|--------|----------|
| No console error monitoring | Runtime errors invisible to tests | **CRITICAL** |
| No page-level smoke tests | Rendering errors not validated | **HIGH** |
| Component boundary not tested | Server/Client mismatch undetected | **HIGH** |
| Tests blocked by selector issues | Cascade failure masked other errors | **MEDIUM** |

---

## Gap Analysis

### Gap 1: No Console Error Monitoring

**Current State:**
- Tests verify DOM elements (`product-card` visibility)
- Tests do NOT monitor `console.error` or `pageerror` events
- Next.js runtime errors go undetected

**Evidence:**
```typescript
// Current test - only checks visibility
test('URL param parsing renders products', async ({ page }) => {
  await page.goto('/search?q=Sennheiser');
  await expect(page.locator('[data-testid="product-card"]')).toHaveCount.greaterThan(0);
  // ❌ No console error check
});
```

**Missing Coverage:**
- Browser console errors
- Page JavaScript errors  
- React hydration errors
- Next.js runtime warnings

**Recommendation:**
Add global console error monitoring to all E2E tests:
```typescript
test.beforeEach(async ({ page }) => {
  page.on('console', msg => {
    if (msg.type() === 'error') {
      throw new Error(`Console error: ${msg.text()}`);
    }
  });
});
```

---

### Gap 2: No Page-Level Smoke Tests

**Current State:**
- Individual feature tests exist (search field, results, etc.)
- No holistic "page loads without errors" test

**Missing Coverage:**
- Full page render cycle
- Component tree integration
- Server Component → Client Component handoff

**Evidence:**
The error only manifests when the full page renders with ProductCard inside SearchResults (Server Component → ProductGrid → ProductCard).

**Recommendation:**
Add smoke tests for each major page:
```typescript
test.describe('Search Page Smoke Test', () => {
  test('loads without console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => msg.type() === 'error' && errors.push(msg.text()));
    page.on('pageerror', err => errors.push(err.message));
    
    await page.goto('/search?q=test');
    await page.waitForLoadState('networkidle');
    
    expect(errors).toHaveLength(0);
  });
});
```

---

### Gap 3: Component Boundary Not Tested

**Current State:**
- Tests focus on user interactions
- Component architecture (Server vs Client) not validated
- No test renders ProductCard in isolation

**Root Cause:**
`ProductCard.tsx` had an `onClick` handler but was used inside a Server Component chain:
```
SearchPage (Server)
  → SearchResults (Server) 
    → ProductGrid (Server)
      → ProductCard (missing "use client") ← ERROR
```

**Missing Coverage:**
- Component-level "use client" validation
- Prop serialization testing
- Server/Client boundary assertions

**Recommendation:**
1. Add component smoke tests:
```typescript
// Component smoke test
test('ProductCard renders without errors', async ({ page }) => {
  // Render component in isolation via test page
  await page.goto('/test/product-card');
  await expect(page.locator('[data-testid="product-card"]')).toBeVisible();
});
```

2. Add audit checklist for new components:
   - [ ] Does component use browser APIs? → Add "use client"
   - [ ] Does component have event handlers? → Add "use client"
   - [ ] Is component used in Server Component chain? → Verify directive

---

### Gap 4: Selector Issues Blocked Error Discovery

**Current State:**
- All 24 search tests had corrupted/ambiguous selectors
- Tests failed on selector errors before reaching component render validation

**Evidence:**
```
Error: page.fill: Unknown engine "-label" while parsing selector
```

**Impact:**
- Tests never reached the actual page content validation
- Runtime error in ProductCard was never exercised by tests
- Fix for selectors revealed the hidden runtime error

**Recommendation:**
1. Fix selector strategy (already done - changed to `input[aria-label="..."]`)
2. Add selector validation test:
```typescript
test('search field selector works', async ({ page }) => {
  await page.goto('/search');
  // Verify selector targets correct element
  await expect(page.locator('input[aria-label="Search products"]')).toBeVisible();
  // Verify it accepts input
  await page.fill('input[aria-label="Search products"]', 'test');
});
```

---

## Test Suite Coverage Matrix

| Test Category | Tests | Coverage | Gap |
|---------------|-------|----------|-----|
| Search Field Core | 4 | User interactions | ❌ No console monitoring |
| Mobile Search | 4 | Mobile viewport | ❌ No console monitoring |
| Keyboard Nav | 5 | Accessibility | ❌ No console monitoring |
| Results Page | 5 | Content validation | ❌ No error assertions |
| Error Handling | 3 | API failures | ✅ Has some error checks |
| Cross-Page | 3 | Navigation | ❌ No console monitoring |
| **Smoke Test** | **0** | **Page integrity** | **❌ MISSING** |
| **Console Errors** | **0** | **Runtime errors** | **❌ MISSING** |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation Priority |
|------|------------|--------|---------------------|
| Similar errors in other components | HIGH | HIGH | **P0** |
| Future Server/Client boundary issues | MEDIUM | HIGH | **P1** |
| Silent runtime failures in production | MEDIUM | CRITICAL | **P0** |
| Test suite giving false confidence | HIGH | MEDIUM | **P1** |

---

## Immediate Actions Required

### P0 — Critical (Do Today)
1. **Add global console error monitoring** to all E2E tests
2. **Audit all components** for missing "use client" directives
3. **Create smoke test** for search page

### P1 — High (This Sprint)
1. **Add console error assertions** to existing search tests
2. **Create component boundary test pattern**
3. **Document "use client" requirements** in dev handbook

### P2 — Medium (Next Sprint)
1. **Extend smoke tests** to all pages
2. **Add ESLint rule** for "use client" detection
3. **Review test suite architecture** for other gap patterns

---

## Files Requiring Attention

| File | Issue | Fix |
|------|-------|-----|
| `tests/e2e/search/search-results.spec.ts` | No console error check | Add error monitoring |
| `tests/e2e/search/*.spec.ts` (all) | No page-level validation | Add smoke tests |
| `app/components/features/products/ProductCard.tsx` | Missing "use client" | ✅ Fixed |
| `playwright.config.ts` | No global error handling | Add setupFiles |

---

## Audit Summary

| Metric | Value |
|--------|-------|
| Total Search Tests | 24 |
| Tests with Error Monitoring | 0 (0%) |
| Tests with Smoke Validation | 0 (0%) |
| Runtime Errors Caught | 0 (before manual discovery) |
| Coverage Gap | **CRITICAL** |

### Verdict
**The search test suite has critical gaps in runtime error detection.** The Server/Client Component error escaped detection because:
1. Tests don't monitor console errors
2. Tests were failing on selector issues first
3. No holistic page-level smoke tests exist

**Recommendation:** Immediately implement console error monitoring and add smoke tests before proceeding with further test development.

---

**Audit Complete** ✅  
**Next Action:** Create regression test for console error monitoring
