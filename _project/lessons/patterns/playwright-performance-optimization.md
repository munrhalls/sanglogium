# Playwright Performance Optimization Pattern

**Date:** 2026-04-02
**Source:** Test suite performance investigation
**Severity:** High
**Frequency:** Systemic (applies to all E2E tests)

## The Problem
Playwright tests running at snail pace (19.4s for 3 tests), destroying development velocity

## Root Cause
- Default single worker execution
- Unnecessary fixed delays
- No browser context reuse
- Running full browser when not needed

## The Fix
```typescript
// playwright.config.ts
export default defineConfig({
  workers: process.env.CI ? 2 : 4, // Parallel execution
  fullyParallel: true,
  use: {
    headless: true, // Always headless for speed
  },
});

// Tests: Remove ALL waitForTimeout calls
await page.waitForLoadState('networkidle'); // ✅ Good
await page.waitForTimeout(1000); // ❌ NEVER
```

## Prevention
**MANDATORY rules for all Playwright tests:**

1. **Parallel Workers:** Always use `workers: process.env.CI ? 2 : 4`
2. **No Fixed Waits:** Never use `waitForTimeout` - use `waitForLoadState` or specific element waits
3. **Headless Always:** Use `headless: true` except for manual debugging
4. **Single Browser:** Use single project configuration to avoid browser explosion
5. **Reuse Server:** Set `reuseExistingServer: !process.env.CI`

## Applicability
**When to apply:**
- All new Playwright tests
- Existing test suite optimization
- CI/CD pipeline configuration

**Keywords:** ["playwright", "performance", "test-speed", "parallel-execution", "headless"]
