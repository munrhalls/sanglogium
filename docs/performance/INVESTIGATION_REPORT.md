# Performance Monitoring Investigation Report

## Executive Summary

**Finding:** The performance monitoring implementation has **basic setup issues** that prevent 2 of 3 pillars from working. The documentation incorrectly marks broken components as "✅ Active/Implemented".

## What Actually Works

| Component | Status | Evidence |
|---|---|---|
| WebVitals RUM component | ✅ WORKS | `web-vitals` installed, mounted in layout.tsx:17, build succeeded |
| `/api/analytics/vitals` endpoint | ✅ WORKS | Route included in build output, valid Next.js App Router structure |

## What Does NOT Work (Basic Setup Issues)

| Component | Issue | Evidence |
|---|---|---|
| Playwright performance tests | WRONG DIRECTORY | Test file in `tests/e2e/performance/` but playwright.config.ts has `testDir: './app/components/features/basket/__tests__/e2e'`. Error: "No tests found." |
| Playwright performance tests | WRONG PROJECT NAME | Docs say `--project=desktop-chromium` but config only has `chromium`. Error: "Project 'desktop-chromium' not found." |
| Lighthouse CI | MODULE TYPE MISMATCH | `lighthouserc.js` uses CommonJS (`module.exports`) but package.json has `"type": "module"`. Error: "require is not defined in ES module scope." |

## Overcomplications vs Minimal Viable Solution

**Current Implementation (Overcomplicated):**
- Custom API endpoint with in-memory p75 aggregation (resets on server restart, ephemeral)
- Custom Playwright performance helper with complex observer logic
- Documentation claims "three pillars" but only 1 pillar actually works
- Misleading "✅" checkmarks in README for broken components

**Minimal Viable Solution (What's Actually Needed):**
For end-user performance monitoring (CLS, LCP, INP, TTFB, FCP), the simplest robust solution is:

1. **RUM (field data)**: Use existing `web-vitals` library with a simple beacon to log aggregators (already works)
2. **Synthetic (lab data)**: Fix Lighthouse CI by renaming `lighthouserc.js` → `lighthouserc.cjs` (1 line change)
3. **Regression tests**: Either fix Playwright config OR remove Playwright perf tests entirely and rely on Lighthouse CI for regression detection

**Recommendation:** 
- Fix Lighthouse CI (rename file)
- Delete the custom Playwright performance tests (overcomplicated, wrong directory, Lighthouse CI already covers this use case)
- Delete the in-memory aggregation in the API endpoint (unnatural complexity, log aggregators handle p75)
- Update documentation to reflect actual state

## Root Cause

The implementation was built on assumptions without verification:
- Assumed Playwright config would work with new test directory (wrong)
- Assumed Lighthouse CI would work with CommonJS file in ES module project (wrong)
- Assumed documentation accuracy without running commands (wrong)

## Conclusion

The monitoring setup is **overcomplicated** due to adding custom infrastructure (API endpoint aggregation, Playwright tests) that doesn't work and duplicates existing functionality. The minimal viable solution is simpler: fix the one-line Lighthouse CI issue, delete the broken Playwright tests, and rely on the working WebVitals RUM + Lighthouse CI combination.
