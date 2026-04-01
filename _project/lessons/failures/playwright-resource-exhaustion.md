# failures: Playwright Resource Exhaustion via webServer + Multi-Browser Matrix

**Date:** 2026-04-01  
**Source:** Debug session — runaway browser process accumulation  
**Severity:** Critical  
**Frequency:** Recurring (any misconfigured Playwright setup)

---

## The Problem

Playwright spawned 40+ Edge WebView2 and 15+ Chrome processes, appearing as an "infinite loop" of browser windows. System resource exhaustion. Required manual process termination.

**Symptoms:**
- Task Manager showing dozens of `msedgewebview2.exe` and `chrome.exe`
- System slowdown
- Previous test run showed 49 failed tests
- Multiple test-result directories from 7 browser projects

---

## Root Cause

**Configuration Trap:** Default `playwright.config.ts` with `webServer` + 7 browser projects created a resource exhaustion cascade:

```
1. webServer starts `npm run start` (Next.js production server)
2. 7 browser projects (chromium, firefox, webkit, Edge, Chrome, Mobile Chrome, Mobile Safari) start simultaneously
3. Tests fail (or server fails to start)
4. Playwright does NOT have built-in retry — external trigger (IDE, manual, watch mode) repeats
5. Each run spawns 7 more browser instances
6. Zombie processes don't terminate properly
7. Accumulation creates "infinite loop" appearance
```

**Contributing Factors:**
- No `workers` limit (default = CPU cores = many parallel browsers)
- No `maxFailures` limit (unbounded retries)
- Long `timeout: 120s` (hangs before failing)
- Local dev running all 7 browsers (should be CI-only)

---

## The Fix

### Immediate: Kill Runaway Processes

```powershell
# PowerShell (Administrator)
Get-Process msedgewebview2 -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process chrome -ErrorAction SilentlyContinue | Stop-Process -Force
```

### Configuration: playwright.config.ts

```typescript
export default defineConfig({
  // ADD: Limit parallel workers
  workers: process.env.CI ? 2 : 1,  // 1 local, 2 in CI
  
  // ADD: Fail fast
  maxFailures: 3,
  
  webServer: {
    command: "npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 60 * 1000,  // Reduced from 120s
  },
  
  // Local: 1 browser, CI: 7 browsers
  projects: process.env.CI ? [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
    { name: "Microsoft Edge", use: { ...devices["Desktop Edge"], channel: "msedge" } },
    { name: "Google Chrome", use: { ...devices["Desktop Chrome"], channel: "chrome" } },
    { name: "Mobile Chrome", use: { ...devices["Pixel 5"] } },
    { name: "Mobile Safari", use: { ...devices["iPhone 12"] } },
  ] : [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
});
```

---

## Prevention

### Pre-Flight Checklist (Before Running Playwright)

```markdown
- [ ] `npm run build` completes successfully (webServer needs production build)
- [ ] `test-results/` cleared: `Remove-Item -Recurse -Force .\test-results\*`
- [ ] No zombie processes: `Get-Process msedgewebview2, chrome` → should be 0
- [ ] Run single test first: `npx playwright test --project=chromium --grep "single test"`
- [ ] Verify process cleanup after: Check Task Manager
```

### Configuration Rules

| Setting | Local | CI | Rationale |
|---------|-------|-----|-----------|
| workers | 1 | 2 | Prevent parallel browser explosion |
| maxFailures | 3 | 3 | Stop runaway spawning |
| timeout | 60s | 60s | Fail faster, don't hang |
| projects | chromium only | all 7 | Fast local dev, full CI coverage |

### Warning Signs

Watch for these indicators of impending resource exhaustion:
- Test takes >30s to start (webServer struggling)
- Task Manager shows >5 browser processes
- Multiple `test-results/e2e-*` directories created rapidly
- System fan spinning up during test

---

## Applicability

**When to apply this lesson:**
- Setting up Playwright in any new project
- Config has `webServer` block with multiple `projects`
- Running tests on Windows (Edge WebView2 is particularly prone to zombie processes)
- Using IDE extensions with "run on save" or "watch mode"

**Keywords:** ["playwright", "webserver", "resource exhaustion", "zombie processes", "workers", "maxFailures", "browser matrix", "msedgewebview2"]

---

## Related

- `_project/research/PLAYWRIGHT_INFINITE_LOOP_AUDIT.md` — Full incident report
- `_project/sprints/01_audit_playwright_fix.md` — Structured audit output
- `playwright.config.ts` — Fixed configuration
- `playwright-ct.config.ts` — Component test config (same fixes applied)
