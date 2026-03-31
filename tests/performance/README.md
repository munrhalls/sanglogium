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

### 2. Run Performance Tests

```bash
# Run all performance tests
npx playwright test tests/performance/

# Run specific test suites
npx playwright test tests/performance/web-vitals.spec.ts
npx playwright test tests/performance/core-web-vitals.spec.ts
npx playwright test tests/performance/api-efficiency.spec.ts
npx playwright test tests/performance/homepage-budget.spec.ts
npx playwright test tests/performance/regression/

# Run with UI mode for debugging
npx playwright test tests/performance/ --ui
```

### 3. Run Bundle Analysis

```bash
# Build with bundle analyzer
npm run analyze

# Opens browser with interactive bundle visualization
```

## Test Categories

### 1. Web Vitals RUM Tests (`web-vitals.spec.ts`)

Validates the WebVitals component collects all Core Web Vitals:
- LCP, FCP, FID, INP, CLS, TTFB
- Component loads without errors
- Metrics are properly reported

### 2. Core Web Vitals Budget Tests (`core-web-vitals.spec.ts`)

These tests enforce Core Web Vitals thresholds:

| Metric | Budget | Test |
|--------|--------|------|
| TTFB | < 600ms | `TTFB < 600ms` |
| FCP | < 1800ms | `FCP < 1800ms` |
| LCP | < 2500ms | `LCP < 2500ms` |
| CLS | < 0.1 | `CLS < 0.1` |
| TBT | < 200ms | `TBT < 200ms` |
| TTI | < 3800ms | `TTI < 3800ms` |

### 3. API Efficiency Tests (`api-efficiency.spec.ts`)

Verifies minimal Sanity API calls:
- Homepage: ≤ 3 requests (target: 1-2)
- PLP: ≤ 2 requests
- No duplicate queries
- Proper caching headers

### 4. Homepage Budget Tests (`homepage-budget.spec.ts`)

Legacy performance budget tests:
- JavaScript bundle size
- Image optimization
- Total page weight

### 5. Regression Tests (`regression/`)

Infrastructure validation tests:
- Lighthouse config exists and is valid
- WebVitals component exists
- All test files present
- Bundle analyzer configured

### 6. Performance Budgets Documentation (`BUDGETS.md`)

Centralized documentation of all performance budgets:
- Time budgets (TTFB, LCP, FCP, etc.)
- Size budgets (JS, images, total weight)
- Request count budgets
- Score budgets (Lighthouse)

## Performance Budget Reference

See `BUDGETS.md` for complete budget documentation.

### Quick Reference

| Category | Current | Target | Priority |
|----------|---------|--------|----------|
| Lighthouse Performance | ~45 | ≥ 70 | P0 |
| TTFB | ~10.9s | < 600ms | P0 |
| LCP | ~7.7s | < 2500ms | P0 |
| FCP | ~2.1s | < 1800ms | P0 |
| CLS | ~0.05 | < 0.1 | P0 |
| Total JS | ~400KB | < 400KB | P0 |
| Homepage API Calls | ~9 | ≤ 3 | P0 |

## CI/CD Integration

### GitHub Actions Workflow

The `lighthouse-ci.yml` workflow runs on every PR:

```yaml
name: Lighthouse CI
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
```

Jobs:
1. Build application
2. Run Lighthouse CI with assertions
3. Upload reports as artifacts

### Lighthouse CI Configuration

Key thresholds from `lighthouserc.js`:

```javascript
{
  'categories:performance': ['warn', { minScore: 0.7 }],
  'largest-contentful-paint': ['error', { maxNumericValue: 3000 }],
  'server-response-time': ['error', { maxNumericValue: 600 }],
  'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
}
```

## Web Vitals RUM

The `WebVitals` component in `app/components/analytics/WebVitals.tsx` provides:

- Real-time Core Web Vitals collection
- Console logging in development
- Threshold warnings for poor metrics
- Extensible for production analytics

### Disabling

Set environment variable to disable in production:
```bash
NEXT_PUBLIC_DISABLE_WEB_VITALS=true
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

1. Edit `BUDGETS` object in `core-web-vitals.spec.ts`
2. Update `lighthouserc.js` assertions
3. Update `BUDGETS.md` documentation
4. Document changes in sprint notes

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
ANALYZE_PORT=8888 npm run analyze
```

**Web Vitals not showing in console:**
```bash
# Ensure you're in development mode
npm run dev
```

## Resources

- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse CI Documentation](https://github.com/GoogleChrome/lighthouse-ci)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Next.js Performance Optimization](https://nextjs.org/docs/app/building-your-application/optimizing)
- [web-vitals Library](https://github.com/GoogleChrome/web-vitals)

---

**Last Updated:** March 31, 2026
**Sprint:** S8-PERFORMANCE-TESTING-INFRASTRUCTURE
