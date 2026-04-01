# Workflow: Automated Verification Over Manual

**Date:** 2026-04-01  
**Source:** /implement verification phase  
**Severity:** High  
**Frequency:** Recurring  

## The Problem

After implementing grid layout fixes, requested **manual visual verification** from human instead of creating **automated Playwright E2E test**.

User rules state:
> **Prefer available automated verification (e.g., Playwright, unit tests) to confirm work**

## Root Cause

Defaulted to lowest-effort verification ("please check visually") instead of investing 5 minutes to write robust E2E test that:
- Runs at multiple breakpoints (375px, 768px, 1024px, 1440px)
- Measures actual computed `grid-template-columns`
- Verifies container padding values
- Catches regressions automatically

## The Fix

Created `tests/e2e/homepage/iems-gallery-grid.spec.ts` with:
- Column count assertions per breakpoint
- Container padding verification
- Card padding progression checks
- No-overflow validation

## Prevention

**Rule for Verification Phase:**
```
After ANY layout/UI change:
1. Check if Playwright tests exist for this component
2. If yes: Run existing tests, ensure they pass
3. If no: Create focused E2E test file
4. Only request human visual verification AFTER automated tests pass
```

**Verification Priority:**
1. Existing automated tests (run first)
2. New automated tests (create if gap)
3. Human visual verification (final confirm only)

## Test Pattern Template

```typescript
// Layout regression test template
const breakpoints = [
  { width: 375, expectedCols: 1 },
  { width: 768, expectedCols: 3 },
  { width: 1024, expectedCols: 4 },
];

for (const bp of breakpoints) {
  await page.setViewportSize({ width: bp.width, height: 800 });
  const gridCols = await grid.evaluate((el) => 
    window.getComputedStyle(el).gridTemplateColumns
  );
  expect(gridCols.split(' ').length).toBe(bp.expectedCols);
}
```

## Applicability

**When to Apply:**
- Grid layout changes
- Responsive breakpoint modifications
- Padding/margin adjustments
- Component spacing changes

**Keywords:** ["grid", "layout", "responsive", "breakpoints", "verification", "testing"]
