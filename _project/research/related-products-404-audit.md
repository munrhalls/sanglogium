# Research & Audit: Missing Tests for Related Product 404

**Date:** 2026-04-02  
**Issue:** Clicking related products leads to 404  
**Root Cause Identified:** Dev server caching/ISR issues, not slug mismatch  
**Gap:** Missing live link validation test

---

## Research Scope Contract

- **Topic:** Why related product links 404 despite correct slugs
- **First Principles:** 
  1. Slugs in DB must match URLs in UI
  2. Static generation requires cache invalidation
  3. E2E tests must verify actual HTTP responses, not just element presence
- **Fundamentals:** Link integrity verification, HTTP status validation
- **Scope Boundary:** Focus on test gaps, not dev server infrastructure
- **Target Audience:** Sprint planning for critical missing test coverage
- **Decay Risk:** Low — link integrity is foundational

---

## First Principles Analysis

### Core Problem Being Solved
Related product cards display correctly but clicking them leads to 404. Product exists in Sanity with correct slug, but the page route returns `notFound()`.

### Underlying Constraints
1. **Next.js Static Generation:** Product pages statically generated at build time
2. **ISR Cache:** Incremental Static Regeneration may have stale cache
3. **Dev Server State:** `npm run dev` showed `ENOENT` errors — dev server in bad state
4. **Console.log Debug:** Line 15 in page.tsx shows `console.log(product)` — debugging in progress

### Failure Modes
1. **Silent 404:** UI shows product cards → click → 404 with no error message
2. **Cache Desync:** Slug exists in DB but page was generated before product added
3. **Test Gap:** No test validates that related product URLs actually return 200

---

## Code Fundamentals Verification

### Current State Analysis

| Component | Behavior | Test Coverage |
|-----------|----------|---------------|
| `getRelatedProducts.ts` | Returns products with `slug.current` | ✅ Integration test validates slug format |
| `RelatedProducts.tsx` | Renders links with `/products/${slug.current}` | ✅ Component renders |
| `product/[slug]/page.tsx` | Calls `notFound()` if product null | ⚠️ No live link test |
| Link Click | Navigate to `/products/{slug}` | ❌ No HTTP status verification |

### Gap Identified

**Missing Test Type:** Live Link Validation (HTTP 200 check)

Current tests verify:
- ✅ Slug format is valid regex
- ✅ Product data structure is correct
- ✅ Component renders with correct href

**NOT tested:**
- ❌ Does the URL actually return HTTP 200?
- ❌ Does the related product page load without 404?
- ❌ After navigation, is the product name displayed?

---

## Missing Test Specification

### Test: `related-products-link-integrity.spec.ts`

**Purpose:** Verify every related product link returns 200 and renders product

**Test Flow:**
1. Navigate to known product with related products
2. Extract all related product hrefs
3. For each href:
   - Click link
   - Verify HTTP status (not 404)
   - Verify new page loads (product name visible)
   - Navigate back

**Critical Assertion:**
```typescript
// Current test (insufficient):
await relatedLink.click();
await expect(page.locator('text=404')).not.toBeVisible();

// Required test (complete):
const [response] = await Promise.all([
  page.waitForResponse(resp => resp.url().includes('/products/')),
  relatedLink.click()
]);
expect(response.status()).toBe(200);
await expect(page.locator('h1')).toBeVisible(); // Product loaded
```

---

## Audit Report: Test Coverage Matrix

| Test Type | Exists | Validates 404 Prevention | Notes |
|-----------|--------|-------------------------|-------|
| **Slug Format** | ✅ `product-api.spec.ts` | ❌ No | Only checks regex pattern |
| **Link Click** | ✅ `golden-path.spec.ts` | ⚠️ Partial | Clicks 1 related product |
| **HTTP Status** | ❌ **MISSING** | ❌ No | **CRITICAL GAP** |
| **Link Integrity (All Links)** | ❌ **MISSING** | ❌ No | **CRITICAL GAP** |
| **Cache/ISR** | ❌ **MISSING** | ❌ No | Build-time issue |

### Critical Missing Tests

1. **Live Link HTTP Validation**
   - File: `tests/e2e/product-detail/link-integrity.spec.ts`
   - Coverage: All related product links return 200
   - Priority: CRITICAL

2. **Full Related Product Matrix**
   - File: `tests/e2e/product-detail/related-products-full.spec.ts`
   - Coverage: Every related product card clickable → 200 response
   - Priority: CRITICAL

3. **Slug-to-Route Validation**
   - File: `tests/integration/slug-route-matching.spec.ts`
   - Coverage: Every slug in DB has working route
   - Priority: HIGH

---

## Synthesis: Actionable Takeaways

### Immediate Actions

1. **Add Missing Test** `tests/e2e/product-detail/link-integrity.spec.ts`
   - Validate every related product link returns HTTP 200
   - Use `page.waitForResponse()` to capture actual HTTP status
   - Test all 6 related products, not just first one

2. **Fix Dev Server Issue** (if local testing)
   - Clear `.next` cache: `rm -rf .next`
   - Restart dev server
   - Or use `npm run build && npm start` for production-like testing

3. **Add Build Verification**
   - After build, validate all product slugs have generated pages
   - Use `next build` output to verify route generation

### Implementation Priority

| Priority | Test | Impact |
|----------|------|--------|
| P0 | Link HTTP status validation | Prevents 404s in production |
| P1 | Full related product matrix | Ensures all links work |
| P2 | Slug-to-route matching | Prevents build-time gaps |

---

## Verification Commands

```bash
# Run new link integrity test
npx playwright test tests/e2e/product-detail/link-integrity.spec.ts

# Validate all product routes return 200
node scripts/verify-all-product-routes.mjs

# Production build test
npm run build && npm start
```

---

## Root Cause Summary

**Why 404 happened:**
1. Dev server in bad state (`ENOENT` errors)
2. OR: ISR cache stale (product added after page generation)
3. NOT: Slug mismatch (verified slug is correct in DB)

**Why tests didn't catch it:**
1. `golden-path.spec.ts` only clicks ONE related product
2. No HTTP status code verification
3. No test validates all 6 related products are clickable

**Fix:** Add comprehensive link integrity test with HTTP status validation.
