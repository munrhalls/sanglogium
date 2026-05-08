# Task: Refactor BasketManager - Remove Over-Engineered Cache Manipulation

> **Generated:** 2026-05-08
> **Problem:** BasketManager.tsx has over-engineered manual cache manipulation that fights SWR's built-in cache management
> **Priority:** Medium

## Problem Statement

- **Observable Behavior:** BasketManager.tsx implements complex manual cache manipulation using refs and useEffect hooks to prevent SWR re-fetch on basket item deletion
- **Location:** `app/components/features/basket/BasketManager.tsx` (lines 18-72)
- **Impact:** Unnecessary complexity (~55% of component), violates SWR best practices, introduces potential undefined behaviors, requires complex test scenarios without measured performance justification
- **Reproduction:** Review component implementation - manual cache manipulation is always active

## System Context

- **Affected Components:** BasketManager (132 lines), BasketManager.test.tsx (257 lines)
- **State Management:** Zustand basketStore with useShallow selector
- **Related Patterns:** 
  - basketStore: Well-structured with Zod validation, fallback storage, cross-tab sync (191 lines)
  - parseBasketItems: Simple 20-line transformation
  - availabilityHandler: Simple 18-line separation logic
  - API route: Simple 22-line GET endpoint
- **Dependencies:** SWR (data fetching), Zustand (state management), Sanity CMS (product data)

## Root Cause Analysis

**Hypothesis 1:** Manual cache manipulation was added to prevent re-fetch on delete operation
- **Evidence needed:** Review git history or comments explaining the original implementation
- **Confirmation:** Lines 55-72 explicitly detect delete operations and manually mutate cache

**Hypothesis 2:** The complexity is premature optimization without measured performance data
- **Evidence needed:** Performance measurements showing re-fetch is actually a bottleneck
- **Confirmation:** No performance measurements found in codebase or documentation

**Hypothesis 3:** SWR's built-in cache management is sufficient for this use case
- **Evidence needed:** SWR documentation and current configuration
- **Confirmation:** 
  - SWR docs explicitly warn: "In most cases, you shouldn't directly write to the cache, which might cause undefined behaviors of SWR"
  - Current config already has `revalidateIfStale: false, revalidateOnFocus: false, dedupingInterval: 5000`
  - API route is fast (simple GET from Sanity)

## Best Practices Research

- **Framework Conventions:** 
  - SWR is designed to handle caching intelligently with built-in deduping
  - SWR docs explicitly warn against manual cache manipulation
  - Let SWR handle cache revalidation naturally
- **Accessibility:** N/A (data fetching logic, not UI)
- **Performance:** 
  - Measure before optimize (no measurements exist)
  - SWR's dedupingInterval (5000ms) already prevents rapid re-fetches
  - API route is fast (simple Sanity query)
- **Security:** N/A (read-only data fetching)
- **Common Patterns:** 
  - Use SWR's built-in cache management
  - Only use manual `mutate` for optimistic updates after server mutations
  - Prefer framework conventions over custom solutions

## Project Convention Alignment

- **Test Requirements:** 
  - Black-box tests following AAA pattern
  - Current tests (257 lines, 1.95:1 ratio) are well-structured
  - After refactoring, tests should verify simpler behavior without cache manipulation complexity
- **Code Style:** 
  - Follow existing patterns (Zustand useShallow, SWR configuration)
  - Remove manual refs and complex useEffect hooks
- **Architecture Fit:** 
  - Aligns with architecture principle: "Component archaeology - understand before solving"
  - Simpler implementation follows "specifications first" workflow
- **Documentation Updates:** 
  - Update test comments to reflect simplified behavior
  - Remove any documentation referencing manual cache manipulation

## Solution Design

- **Approach:** Remove manual cache manipulation (lines 18-72), let SWR handle caching naturally
- **Code Changes:**
  1. Remove `previousProductIds` ref (line 19)
  2. Remove `cachedData` ref (line 20)
  3. Remove useEffect for caching data (lines 48-52)
  4. Remove useEffect for delete detection (lines 55-72)
  5. Keep SWR configuration (already appropriate)
  6. Simplify to ~60-70 lines (from 132 lines)
- **Test Strategy:**
  1. Update or remove tests that verify cache manipulation behavior (lines 194-225)
  2. Keep tests for basic functionality (loading, error, empty basket, rendering items)
  3. Add test to verify SWR handles re-fetch naturally on basket changes
  4. Maintain black-box, AAA pattern
- **Verification:**
  1. Run unit tests: `npx vitest run app/components/features/basket/__tests__/unit/BasketManager.test.tsx`
  2. Manual testing: Add items, delete items, verify no loading state flash
  3. Performance testing: Measure re-fetch timing if concerns arise
- **Rollback:** 
  - Git revert if performance issues arise
  - Re-introduce cache manipulation only if measured performance data shows it's necessary

## Deliverables

1. Root cause diagnosis with evidence (over-engineering without measured justification)
2. Solution implementation (remove manual cache manipulation)
3. Test coverage update (remove cache manipulation tests, verify SWR behavior)
4. Verification confirmation (tests pass, manual testing confirms no UX regression)

## Constraints & Guidelines

- Follow project test conventions (black-box, AAA, "when" context)
- No implementation detail testing
- Maintain accessibility standards (N/A for this change)
- Ensure consistency with existing patterns
- Measure before optimize - only re-add complexity if performance data justifies it

## Success Criteria

- Component reduced to ~60-70 lines (from 132 lines)
- All tests pass after refactoring
- Manual testing confirms no UX regression (no loading state flash on delete)
- Code follows SWR best practices (no manual cache manipulation)
- Test-to-production ratio remains healthy (target: >1.5:1)

## Execution Commands

```bash
# Run relevant tests
npx vitest run app/components/features/basket/__tests__/unit/BasketManager.test.tsx

# Type-check
npx tsc --noEmit

# Lint
npx eslint app/components/features/basket/BasketManager.tsx
```

## Additional Notes

**Why This Is Over-Engineered:**
1. Manual cache manipulation violates SWR documentation warnings
2. ~55% of component (55 lines) is complex cache logic
3. No measured performance data justifying the complexity
4. SWR already has appropriate configuration (revalidateIfStale: false, revalidateOnFocus: false, dedupingInterval: 5000)
5. API route is fast (simple Sanity query)
6. Only component in codebase using SWR - no pattern to follow
7. Tests require complex scenarios to verify cache manipulation behavior

**Expected Outcome:**
Simpler, more maintainable code that follows SWR best practices. If performance becomes an issue, it can be measured and addressed with SWR's built-in options or with data-backed justification for custom cache logic.
