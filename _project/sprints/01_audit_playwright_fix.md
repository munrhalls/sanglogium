# Audit: Playwright Configuration Fix

**Date:** 2026-04-01  
**Auditor:** Cascade AI  
**Target:** Prevent resource exhaustion from browser process accumulation  
**Status:** ✅ Fixed — pending verification with clean build

---

## 1. End-State Delineation

### Local Development (without CI env)
```
[Playwright Test Run]
├── workers: 1                    (Sequential, not parallel)
├── maxFailures: 3                (Stop after 3 failures)
├── webServer timeout: 60s        (Fail faster, don't hang)
└── projects: [chromium only]      (1 browser, not 7)
    └── Single Chrome instance
        └── Runs tests sequentially
        └── Terminates cleanly on exit
```

### CI Environment (with CI=true)
```
[Playwright Test Run]
├── workers: 2                    (Limited parallelism)
├── maxFailures: 3                (Same fail-fast)
├── webServer timeout: 60s
└── projects: [all 7 browsers]      (Full cross-browser matrix)
    ├── chromium
    ├── firefox
    ├── webkit
    ├── Microsoft Edge
    ├── Google Chrome
    ├── Mobile Chrome
    └── Mobile Safari
```

---

## 2. Spatial Architecture (Configuration Hierarchy)

```
playwright.config.ts
├── Global Config
│   ├── workers (1 local / 2 CI)
│   ├── maxFailures: 3
│   └── webServer (conditional)
├── Project Matrix (conditional)
│   ├── IF CI: 7 browsers
│   └── ELSE: chromium only
└── Use Defaults
    ├── baseURL
    └── trace: on

playwright-ct.config.ts
├── Global Config
│   ├── workers (1 local / 2 CI)
│   ├── maxFailures: 3
│   └── webServer on port 3001
└── Projects (3 component browsers)
    ├── component-chromium
    ├── component-firefox
    └── component-webkit
```

---

## 3. Gap Analysis (G-XX)

| ID | Component | Current (Before) | Target (After) | Severity |
|----|-----------|------------------|----------------|----------|
| G-01 | workers | Unlimited (default) | `1` local / `2` CI | Critical |
| G-02 | maxFailures | Unlimited retry | `3` max | Critical |
| G-03 | webServer timeout | 120s | 60s | High |
| G-04 | projects (local) | All 7 browsers | Chromium only | Critical |
| G-05 | process cleanup | Zombie accumulation | Proper termination | High |

---

## 4. RWD Strategy (Browser Matrix by Environment)

| Environment | Browsers | Workers | Use Case |
|-------------|----------|---------|----------|
| Local dev | chromium | 1 | Fast feedback during development |
| Local debug | chromium --ui | 1 | Interactive debugging |
| Pre-push | chromium | 1 | Quick smoke test |
| CI pipeline | All 7 | 2 | Full cross-browser validation |
| Nightly | All 7 | 2 | Comprehensive regression |

---

## 5. Files at Risk of Regression

| File | Risk | Mitigation |
|------|------|------------|
| `playwright.config.ts` | Accidental reversion of workers limit | Comment explaining why workers=1 is critical |
| `playwright-ct.config.ts` | Same config drift | Sync changes between configs |
| `.github/workflows/*.yml` | CI may need explicit CI=true | Verify workflows set CI env var |
| `package.json` test scripts | May bypass config | Review all test:* scripts |

---

## 6. Verification Commands

```bash
# Pre-sprint: Verify local runs 1 browser only
npx playwright test --project=chromium tests/e2e/homepage/regression.spec.ts

# Should see: 1 browser instance, not 7

# Verify CI mode (if needed locally)
CI=true npx playwright test tests/e2e/homepage/regression.spec.ts

# Should see: 7 browsers in parallel (max 2 at a time due to workers=2)

# Check no zombie processes after
Get-Process msedgewebview2, chrome | Measure-Object

# Should see: 0 or minimal processes (just your normal browser)
```

---

## 7. Current Blocker

**Issue:** `npm run start` fails with:
```
[TypeError: routesManifest.dataRoutes is not iterable]
```

**Impact:** Cannot verify Playwright fix until build issue resolved  
**Action Required:** Fix Next.js build → re-run verification  
**Severity:** Blocking — but unrelated to Playwright fix

---

## 8. Pre-Flight Checklist

Before running any Playwright tests:

- [ ] `npm run build` completes successfully
- [ ] `test-results/` directory cleared: `Remove-Item -Recurse -Force .\test-results\*`
- [ ] No zombie browsers: `Get-Process msedgewebview2, chrome`
- [ ] Run single test first: `--project=chromium --grep "single test"`
- [ ] Verify process cleanup after: Check Task Manager

---

## 9. Prevention Measures Applied

| Measure | Location | Purpose |
|---------|----------|---------|
| `workers: 1` | playwright.config.ts:8 | Limit parallel browsers locally |
| `maxFailures: 3` | playwright.config.ts:11 | Stop runaway spawning on failures |
| `timeout: 60s` | playwright.config.ts:17 | Fail faster on server issues |
| `projects` conditional | playwright.config.ts:24-60 | 1 browser local, 7 in CI |
| Same settings | playwright-ct.config.ts:7-9 | Consistency across test types |

---

*Audit Complete: 2026-04-01*  
*Next Step: Resolve build issue, then verify Playwright fix*
