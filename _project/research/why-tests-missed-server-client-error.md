# Research: Why Tests Missed Server/Client Component Error

**Date:** 2026-04-02  
**Topic:** Next.js 15 Server/Client Component Runtime Error Detection Gap

---

## Research Scope Contract

- **Topic:** Why E2E tests failed to catch "Event handlers cannot be passed to Client Component props" error
- **First Principles:** 
  1. E2E tests verify user-facing behavior, not implementation boundaries
  2. Next.js Server Component errors manifest at render-time, not build-time
  3. Test coverage gaps exist between component-level and page-level validation
- **Fundamentals:** Server/Client Component boundary rules in Next.js 15
- **Scope Boundary:** Focus on test gaps, NOT fixing the underlying component architecture
- **Target Audience:** Test suite designers, QA engineers
- **Decay Risk:** Medium (Next.js 15+ specific)

---

## First Principles Analysis

### Core Problem Being Solved
Next.js 15 introduced Server Components as the default. When a Server Component tries to pass event handlers (functions) to a Client Component child, serialization fails at runtime. This is a **compile-time undetectable** error that only surfaces during SSR/CSR hydration.

### Why Tests Missed It

| Factor | Explanation |
|--------|-------------|
| **Error Type** | Runtime serialization error during React render |
| **Build Status** | `npm run build` passes - error not caught at build time |
| **Test Type** | E2E tests were failing on selector issues FIRST, masking this error |
| **Error Visibility** | Error appears in server console and browser devtools, but page may still partially render |
| **Test Assertion** | Tests check for `product-card` visibility, not console errors or full page integrity |

### The Sequence of Failures

1. **ProductCard.tsx** lacked `"use client"` but had `onClick` handler (lines 48-59)
2. **SearchResults.tsx** (Server Component) imports ProductGrid → ProductCard
3. **Build passes** - Next.js doesn't validate Server/Client boundaries at build time for this case
4. **Tests fail on selectors** - `[aria-label="Search products"]` was ambiguous
5. **Fix selectors** - Tests now pass selector validation
6. **Runtime error surfaces** - When page actually renders, Server Component tries to pass function prop
7. **Error visible in browser** - User sees it, tests don't (they weren't running yet)

---

## Code Fundamentals Verification

### Fundamental: Server/Client Component Boundary Rules

**Claim:** Next.js 15 requires `"use client"` directive for any component using browser APIs or event handlers

**Verification:**
- [x] Located in our codebase: `ProductCard.tsx` had `onClick` but no `"use client"`
- [x] Framework docs verified: [Next.js docs](https://nextjs.org/docs/app/building-your-application/rendering/client-components)
- [x] Error message confirms: "Event handlers cannot be passed to Client Component props"

**Actual Behavior:**
The error only appears at runtime when:
1. Server Component renders during SSR
2. Tries to serialize props for Client Component
3. Finds non-serializable function (onClick)
4. Throws serialization error

**Edge Cases:**
1. Error may not appear if component never renders (conditional rendering)
2. Error may be swallowed by error boundaries
3. Error appears in server logs but tests may not capture them

---

## Best Practices (Verified)

### Practice: Server/Client Component Testing
**Consensus:** Low - Limited community consensus on testing strategies

**Supporting Evidence:**
- Next.js docs recommend manual testing for boundary issues
- No built-in Next.js test utilities for Server/Client validation
- Community relies on runtime error monitoring (Sentry, etc.)

**Counter-Evidence:**
- Some advocate for strict TypeScript rules to catch these
- Others use custom ESLint plugins for "use client" validation

**Verdict:** ⚠️ Context-Dependent

### Practice: Console Error Monitoring in E2E Tests
**Consensus:** Medium - Widely recommended but rarely implemented

**Supporting Evidence:**
- Playwright supports `page.on('console', ...)` event listeners
- React Testing Library recommends checking for console errors
- Production monitoring always catches these errors

**Implementation:**
```typescript
// Add to test setup
test.beforeEach(async ({ page }) => {
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('Browser console error:', msg.text());
    }
  });
  page.on('pageerror', error => {
    console.log('Page error:', error.message);
  });
});
```

---

## Common Solutions Landscape

### Solution: Console Error Assertions in E2E Tests
**Prevalence:** Common among mature testing setups  
**Type:** Idiomatic

**Pros:**
- Catches runtime errors tests would otherwise miss
- Validates actual user experience (broken console = broken UX)
- Simple to implement

**Cons:**
- May catch "acceptable" warnings (React dev mode warnings)
- Requires filtering of known/non-critical errors
- Slightly slower test execution

**Implementation Pattern:**
```typescript
test('page loads without console errors', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  
  await page.goto('/search?q=test');
  await page.waitForLoadState('networkidle');
  
  expect(consoleErrors).toHaveLength(0);
});
```

### Solution: Static Analysis for "use client" Requirements
**Prevalence:** Niche  
**Type:** Workaround

**Pros:**
- Catches errors before runtime
- No test execution needed

**Cons:**
- Complex to implement correctly
- May have false positives
- Not widely adopted

---

## Verification & Falsification Log

### Claims Verified
| Claim | Evidence | Method |
|-------|----------|--------|
| Tests missed error | Test file review | Code inspection |
| Build doesn't catch this | `npm run build` passed | Manual verification |
| Error is runtime-only | Next.js documentation | Docs |
| Console monitoring would catch | Playwright docs | API verification |

### Falsification Attempts
| Claim | Counter-Evidence | Verdict |
|-------|------------------|---------|
| "Tests should catch all errors" | Build-time vs runtime distinction | Modified - tests catch behavioral, not structural |
| "Build should catch this" | Next.js 15 design decision | Survived - intentional runtime validation |

### Knowledge Decay Assessment
| Section | Risk | Review Date |
|---------|------|-------------|
| Next.js 15 behavior | Low | N/A - stable release |
| Testing patterns | Medium | 2026-07-02 |

---

## Synthesis: Actionable Takeaways

### Root Cause
The tests missed the error because:
1. They were failing on selector issues first (blocking further validation)
2. They don't monitor console/page errors
3. The error is runtime-only, not build-time

### Immediate Actions
1. **Add console error monitoring** to all E2E tests
2. **Add specific test** for search page loading without console errors
3. **Audit other components** for missing "use client" directives

### For Our Project
| Decision | Rationale | Implementation |
|----------|-----------|----------------|
| Add console error assertions | Catches runtime Next.js errors | Global test setup or per-suite |
| Audit all components for onClick | Prevention | Code review checklist |
| Add smoke test for each page | Catches rendering errors | New test file: `smoke.spec.ts` |

---

## Open Questions

1. Should we implement custom ESLint rule for "use client" detection?
2. Should console error monitoring be global or per-test?
3. Are there other components with similar issues?

---

## Research Complete

**Key Finding:** E2E tests don't catch Server/Client Component boundary errors by default. Console error monitoring is required.
