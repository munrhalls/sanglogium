# Anti-Pattern: Test-Triggered Rebuilds

**Date:** 2026-04-02
**Source:** Playwright test implementation disaster
**Severity:** Critical
**Frequency:** Systemic

## The Problem
Running tests triggers full Next.js rebuilds (91+ seconds) for every test file change, destroying workflow efficiency

## Root Cause
Playwright webServer uses `npm run start` which rebuilds on any file change in development mode

## The Fix
```typescript
// playwright.config.ts - BAD
webServer: {
  command: "npm run start",  // Rebuilds on every change
  url: "http://localhost:3000",
}

// playwright.config.ts - GOOD
webServer: {
  command: "npm run start",  // Use pre-built .next
  url: "http://localhost:3000",
  reuseExistingServer: !process.env.CI,
}

// OR use production build:
webServer: {
  command: "npm run build && npm run start",
  url: "http://localhost:3000",
}
```

## Prevention - CRITICAL WORKFLOW RULES

### 1. NEVER AUTO-REBUILD DURING WORK
**BUILD ONLY:**
- After entire sprint is complete
- After major chunk of work is finished
- NEVER during normal workflow
- NOT every 2-3 seconds

### 2. Pre-Build Before Testing
```bash
# ONLY build when explicitly needed
npm run build
npx playwright test
```

### 3. Use Production Mode for Tests
```typescript
// playwright.config.ts
export default defineConfig({
  webServer: {
    command: "npm run start",  // Assumes .next already built
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
  // ... rest of config
});
```

### 4. Add Test SOP to `.windsurfrules`
```
# Testing Workflow - CRITICAL
- NEVER rebuild during normal work
- BUILD ONLY after sprint or major chunk
- ALWAYS use pre-built .next for tests
- NEVER edit tests while server is running
- Use single browser: `--project=chromium`
- Tests must run in <3 minutes, not 15
- RESPECT DEVELOPER TIME
```

### 5. Create Test Script
```json
// package.json
{
  "scripts": {
    "test:e2e": "npm run build && npx playwright test --project=chromium",
    "test:e2e:dev": "npx playwright test --project=chromium"  // For debugging only
  }
}
```

### 6. WORKFLOW PRESERVATION
- **Time is valuable** - Don't waste it on unnecessary rebuilds
- **Flow state** - Rebuilds destroy concentration
- **Parallel work** - Rebuilds block other agents
- **Productivity** - 15 minutes vs 2-3 minutes is unacceptable

## Applicability
**When to apply:**
- Running any Playwright tests
- Editing test files
- CI/CD pipeline configuration
- ANY development workflow

**Keywords:** ["playwright", "rebuild", "testing", "workflow", "efficiency", "anti-pattern", "time-waste"]
