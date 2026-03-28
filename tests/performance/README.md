# Performance Testing Setup

This directory contains performance testing tools and configurations for the Sang-Logium homepage.

## Quick Start

### 1. Run Lighthouse CI Locally

```bash
# Install Lighthouse CI globally
npm install -g @lhci/cli

# Run audit against local dev server
lhci autorun --config=lighthouserc.js

# Or run against production
lhci autorun --config=lighthouserc.js --collect.url=https://sanglogium.com
```

### 2. Run Performance Budget Tests

```bash
# Run all performance tests
npx playwright test tests/performance/

# Run specific test file
npx playwright test tests/performance/homepage-budget.spec.ts

# Run with UI mode for debugging
npx playwright test tests/performance/ --ui
```

### 3. Run Bundle Analysis

```bash
# Build with bundle analyzer
ANALYZE=true npm run build

# Opens browser with interactive bundle visualization
```

## Test Categories

### 1. Homepage Budget Tests (`homepage-budget.spec.ts`)

These tests enforce performance budgets:

| Metric | Budget | Test |
|--------|--------|------|
| TTFB | < 600ms | `TTFB should be under budget` |
| FCP | < 2000ms | `FCP should be under budget` |
| LCP | < 2500ms | `LCP should be under budget` |
| Total JS | < 400KB | `JavaScript bundle should be under budget` |
| Total Images | < 1MB | `Total page weight should be under budget` |
| CLS | < 0.1 | `CLS should be under budget` |

### 2. Sanity API Efficiency Tests

Verifies homepage makes minimal API calls:
- Target: 1-2 batched requests
- Fail: >3 individual requests

### 3. Image Optimization Tests

Checks for:
- Modern image formats (WebP/AVIF)
- Proper loading attributes (lazy/priority)
- Image sizing strategy

### 4. Lighthouse CI Configuration (`lighthouserc.js`)

Automated Lighthouse testing with assertions:

```javascript
// Key thresholds
{
  'categories:performance': ['warn', { minScore: 0.7 }],
  'largest-contentful-paint': ['error', { maxNumericValue: 3000 }],
  'server-response-time': ['error', { maxNumericValue: 600 }],
  'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
}
```

## Production Audit Results (March 28, 2026)

### Current State

| Metric | Production | Target | Status |
|--------|------------|--------|--------|
| Lighthouse Performance | 57/100 | >75 | ❌ FAIL |
| TTFB | 10.9s | <600ms | ❌ CRITICAL |
| LCP | 7.7s | <2.5s | ❌ CRITICAL |
| Speed Index | 22.5s | <4s | ❌ CRITICAL |
| CLS | 0.001 | <0.1 | ✅ PASS |

### Critical Issues

1. **TTFB: 10.9s** - Server response time is catastrophic
2. **LCP: 7.7s** - Hero image loading too late
3. **Speed Index: 22.5s** - Visual content appears extremely slowly
4. **Unused JavaScript: 265 KiB** - Significant bundle waste
5. **Redirect penalty: 2.17s** - Multiple unnecessary redirects

## CI/CD Integration

### GitHub Actions Workflow

Add to `.github/workflows/performance.yml`:

```yaml
name: Performance Tests
on: [push, pull_request]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - run: npm install -g @lhci/cli
      - run: lhci autorun
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}

  playwright-perf:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install
      - run: npm run build
      - run: npx playwright test tests/performance/
```

## Manual Testing Commands

```bash
# Test specific metric
curl -s -o /dev/null -w "TTFB: %{time_starttransfer}ms\n" https://sanglogium.com/

# Run Lighthouse from CLI
npx lighthouse https://sanglogium.com/ --output=html --output-path=./lighthouse-report.html

# Profile with Chrome DevTools
# 1. Open Chrome DevTools → Performance tab
# 2. Click record
# 3. Reload page
# 4. Analyze results
```

## Performance Budget Enforcement

Tests will **FAIL** if budgets are exceeded. To update budgets:

1. Edit `BUDGETS` object in `homepage-budget.spec.ts`
2. Update `lighthouserc.js` assertions
3. Document budget changes in sprint notes

## Troubleshooting

### Common Issues

**Lighthouse CI fails with timeout:**
```bash
# Increase server startup timeout
lhci autorun --collect.startServerCommandTimeout=60000
```

**Playwright tests flaky:**
```bash
# Run with retries
npx playwright test --retries=3
```

**Bundle analyzer won't open:**
```bash
# Check for port conflicts
ANALYZE_PORT=8888 ANALYZE=true npm run build
```

## Resources

- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse CI Documentation](https://github.com/GoogleChrome/lighthouse-ci)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Next.js Performance Optimization](https://nextjs.org/docs/app/building-your-application/optimizing)

---

**Last Updated:** March 28, 2026  
**Next Review:** After Phase 1 completion
