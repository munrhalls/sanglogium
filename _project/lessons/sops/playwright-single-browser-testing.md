# SOP: Playwright Single Browser Testing

**Date:** 2026-04-02
**Source:** Playwright test execution investigation
**Severity:** High
**Frequency:** Systemic

## The Problem
Playwright default configuration runs tests on multiple browsers (Chrome, Firefox, Safari, Edge, mobile), causing:
- 5-10x slower test execution
- Multiple windows popping up
- Test failure explosion
- Developer frustration

## Root Cause
Playwright config includes multiple browser projects by default

## The Fix
Always run Playwright tests with single browser project:

```bash
# Correct - Single browser
npx playwright test tests/e2e/example.spec.ts --project=chromium

# Incorrect - All browsers (disaster)
npx playwright test tests/e2e/example.spec.ts
```

## Prevention
### 1. Playwright Config Already Fixed ✅
The playwright.config.ts is correctly configured with only chromium project.

### 2. Add Test SOP to `.windsurfrules`
```
# Playwright Testing
- Always use --project=chromium for e2e tests (even though config is single-browser)
- Never run npx playwright test without project specification
- Use --headed=false for CI/automated runs
```

### 3. Create Test Verification
```bash
# Verify single browser configuration
npx playwright test --list | grep "chromium" | wc -l
# Should return 1, not 5+
```

### 4. Add Pre-Test Check
Before running e2e tests, verify:
```bash
# Check current projects
npx playwright test --list
# Should show only "chromium" project
```

## Applicability
**When to apply:**
- Running any Playwright e2e tests
- Setting up new test suites
- CI/CD pipeline configuration

**Keywords:** ["playwright", "e2e", "testing", "browser", "chromium", "single-browser"]
