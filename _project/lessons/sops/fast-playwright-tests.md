# Fast Playwright Tests SOP

**Purpose:** Ensure all Playwright tests run fast while maintaining trustworthiness

## Mandatory Configuration

All Playwright tests MUST use this configuration:

```typescript
// playwright.config.ts
export default defineConfig({
  workers: process.env.CI ? 2 : 4, // Parallel execution
  fullyParallel: true,
  use: {
    headless: true, // Always headless for speed
    trace: "retain-on-failure", // Only trace on failure
    screenshot: "only-on-failure", // Only screenshot on failure
  },
  projects: [
    { name: "chromium" } // Single browser only
  ],
});
```

## Test Writing Rules

### ✅ DO
- Use `page.waitForLoadState('networkidle')` for page loads
- Use specific element waits: `await expect(element).toBeVisible()`
- Use parallel test execution
- Test user behavior, not implementation

### ❌ NEVER
- Use `waitForTimeout(ms)` - EVER
- Use multiple browsers/projects unless needed
- Test CSS classes or visual details
- Write slow tests

## Test Template

```typescript
import { test, expect } from '@playwright/test';

test('fast test template', async ({ page }) => {
  // BEFORE-STATE: Navigate and wait
  await page.goto('http://localhost:3000/path');
  await page.waitForLoadState('networkidle');
  
  // TARGET ELEMENT: Locate specifically
  const element = page.locator('[data-testid="specific-element"]');
  await expect(element).toBeVisible();
  
  // USER ACTION: Perform action
  await element.click();
  
  // AFTER-STATE: Verify outcome
  expect(page.url()).toContain('expected-fragment');
});
```

## Performance Checklist

Before committing tests:
- [ ] No `waitForTimeout` anywhere
- [ ] Using `workers: 4` (or CI: 2)
- [ ] Headless mode enabled
- [ ] Single browser project
- [ ] Tests run under 5 seconds each

## Enforcement

These rules are enforced via:
- `.windsurfrules` universal constraints
- Pre-flight test validation
- Code review requirements

**Result:** Fast, trustworthy tests that don't slow development
