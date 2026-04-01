# Playwright Infinite Loop — Research & Audit Report

**Date:** 2026-04-01  
**Status:** CRITICAL — Immediate action required  
**Impact:** System resource exhaustion from runaway browser processes

---

## Problem Statement

Continuous spawning of Playwright browser windows causing system instability.

**Observed Symptoms:**
- 40+ `msedgewebview2.exe` processes (Edge WebView2)
- 15+ `chrome.exe` processes
- Multiple `node.exe` processes
- Test failures accumulating (49 failed in last run)

---

## Root Cause Analysis

### Primary Cause: webServer Configuration + Multiple Browser Projects

**Configuration Issues Found:**

1. **`playwright.config.ts` webServer block (lines 6-11):**
   ```typescript
   webServer: {
     command: "npm run start",  // Starts Next.js production server
     url: "http://localhost:3000",
     reuseExistingServer: !process.env.CI,
     timeout: 120 * 1000,
   }
   ```

2. **Seven (7) browser projects defined (lines 17-49):**
   - chromium
   - firefox  
   - webkit (Safari)
   - Microsoft Edge
   - Google Chrome
   - Mobile Chrome (Pixel 5)
   - Mobile Safari (iPhone 12)

### Failure Mechanism

```
1. Playwright test starts
   ↓
2. webServer tries to run "npm run start" (Next.js production server)
   ↓
3. Server fails to start OR tests fail
   ↓
4. Playwright retries (with 7 browser projects = 7× browser spawn)
   ↓
5. Browsers accumulate, don't terminate properly
   ↓
6. REPEAT → "Infinite loop" appearance
```

### Contributing Factors

| Factor | Impact |
|--------|--------|
| `reuseExistingServer: !process.env.CI` | In local dev, tries to reuse but may conflict with dev server |
| No `maxFailures` or `workers` limit | Unbounded parallel browser spawning |
| 120s timeout with 7 browsers | Resource exhaustion before timeout |
| Test failures not terminating browsers | Zombie processes accumulate |

---

## Evidence

### Process Count (tasklist output)
```
msedgewebview2.exe  × 23 instances (Edge WebView2)
chrome.exe           × 15 instances  
node.exe             × 4 instances
```

### Test Results
- File: `test-results/.last-run.json`
- Status: **failed**
- Failed tests: **49**
- Browser directories in test-results: **7 projects × 6-7 test variations**

### Configuration Files Verified
- ✅ `playwright.config.ts` — contains webServer + 7 projects
- ✅ `playwright-ct.config.ts` — separate webServer on port 3001
- ✅ `package.json` — npm scripts reference playwright
- ✅ `.vscode/launch.json` — debug configs present (not active)

---

## Research Findings

### Playwright webServer Behavior

Per Playwright documentation:
- `webServer` starts before tests run
- If the server exits or URL is unreachable, Playwright considers it a failure
- **No automatic retry mechanism** — the "loop" is external

### Likely External Trigger

The infinite spawning is likely caused by:
1. **IDE extension** with "run on save" or "watch mode"
2. **Manual repeated test runs** without process cleanup
3. **Concurrent test commands** (e2e + component tests simultaneously)
4. **CI/CD workflow** running with misconfigured concurrency

---

## Immediate Fix Commands

### 1. Kill All Runaway Processes

**PowerShell (Administrator):**
```powershell
# Kill all Edge WebView2 processes
Get-Process msedgewebview2 -ErrorAction SilentlyContinue | Stop-Process -Force

# Kill all Chrome processes spawned by Playwright
Get-Process chrome -ErrorAction SilentlyContinue | Where-Object { 
    $_.Parent.ProcessName -eq 'node' -or $_.Path -like '* playwright*'
} | Stop-Process -Force

# Kill Node processes running playwright
Get-Process node -ErrorAction SilentlyContinue | Where-Object {
    (Get-WmiObject Win32_Process -Filter "ProcessId=$($_.Id)").CommandLine -like '*playwright*'
} | Stop-Process -Force
```

**Alternative — Task Manager:**
1. Open Task Manager → Details tab
2. Sort by Process Name
3. Select all `msedgewebview2.exe` → End Task
4. Select all `chrome.exe` (with low memory) → End Task
5. Select `node.exe` processes → End Task

### 2. Clear Test Artifacts

```powershell
# Remove test results (optional — frees disk space)
Remove-Item -Recurse -Force .\test-results\*

# Clear Playwright browser cache (if needed)
npx playwright clear-cache
```

---

## Prevention Configuration

### playwright.config.ts — Recommended Changes

```typescript
export default defineConfig({
  // ... existing config ...
  
  // ADD: Limit parallel workers
  workers: process.env.CI ? 2 : 1,
  
  // ADD: Fail fast — don't keep spawning on failures
  maxFailures: 3,
  
  // MODIFY: webServer with better defaults
  webServer: {
    command: "npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 60 * 1000,  // Reduced from 120s
    // ADD: Graceful shutdown
    gracefulShutdown: {
      signal: 'SIGTERM',
      timeout: 5000,
    },
  },
  
  // ADD: Projects reduced for local dev
  projects: process.env.CI ? [
    // All 7 projects for CI
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
    { name: "Microsoft Edge", use: { ...devices["Desktop Edge"], channel: "msedge" } },
    { name: "Google Chrome", use: { ...devices["Desktop Chrome"], channel: "chrome" } },
    { name: "Mobile Chrome", use: { ...devices["Pixel 5"] } },
    { name: "Mobile Safari", use: { ...devices["iPhone 12"] } },
  ] : [
    // Local dev: just chromium (fastest, most reliable)
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
});
```

### npm scripts — Add explicit cleanup

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ci": "playwright test --workers=2",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    // ADD: Cleanup command
    "test:cleanup": "npx playwright clear-cache && Remove-Item -Recurse -Force .\\test-results\\* 2>$null || true"
  }
}
```

---

## Verification Checklist

- [ ] All `msedgewebview2.exe` processes terminated
- [ ] All `chrome.exe` (Playwright-spawned) terminated
- [ ] `node.exe` processes running playwright terminated
- [ ] `npm run build` succeeds locally
- [ ] `npx playwright test --project=chromium` runs 1 browser only
- [ ] Tests complete without spawning extra windows
- [ ] `test-results/` directory contains only current run artifacts

---

## Long-Term Recommendations

1. **Switch to `webServer: false`** for local dev — run `npm run dev` separately
2. **Use `npx playwright test --ui`** for debugging (opens controlled UI)
3. **Add pre-commit hook** to prevent running tests with 7 browsers locally
4. **Document** that full cross-browser testing is CI-only
5. **Monitor** for zombie processes in nightly research loop

---

*Generated by /research and /audit workflows*  
*Sources: Process inspection, Playwright docs, Configuration analysis*
