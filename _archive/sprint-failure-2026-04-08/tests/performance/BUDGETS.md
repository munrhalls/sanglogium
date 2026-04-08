# Performance Budgets

This document defines all performance budgets for the sang-logium application.
Budgets are enforced through automated testing and CI/CD gates.

## Budget Categories

### Time Budgets

| Metric | Current | Target | Priority | Test File |
|--------|---------|--------|----------|-----------|
| TTFB | ~10.9s | < 600ms | P0 | core-web-vitals.spec.ts |
| LCP | ~7.7s | < 2500ms | P0 | core-web-vitals.spec.ts |
| FCP | ~2.1s | < 1800ms | P0 | core-web-vitals.spec.ts |
| CLS | ~0.05 | < 0.1 | P0 | core-web-vitals.spec.ts |
| TBT | ~150ms | < 200ms | P1 | core-web-vitals.spec.ts |
| TTI | ~4.2s | < 3800ms | P1 | core-web-vitals.spec.ts |
| Speed Index | ~4.3s | < 4300ms | P1 | core-web-vitals.spec.ts |

### Size Budgets

| Resource | Current | Target | Priority | Test File |
|----------|---------|--------|----------|-----------|
| Total JS | ~400KB | < 400KB | P0 | bundle-analyzer |
| First Load JS | ~265KB | < 250KB | P0 | bundle-analyzer |
| Largest Chunk | ~120KB | < 150KB | P1 | bundle-analyzer |
| Total Page Weight | ~2.1MB | < 2.5MB | P1 | lighthouse |
| Unused JavaScript | ~265KB | < 150KB | P2 | lighthouse |

### Request Count Budgets

| Page | Current | Target | Priority | Test File |
|------|---------|--------|----------|-----------|
| Homepage API Calls | ~9 | ≤ 3 | P0 | api-efficiency.spec.ts |
| PLP API Calls | ~5 | ≤ 2 | P0 | api-efficiency.spec.ts |
| PDP API Calls | ~3 | ≤ 2 | P1 | api-efficiency.spec.ts |

### Score Budgets

| Category | Current | Target | Priority | Test File |
|----------|---------|--------|----------|-----------|
| Lighthouse Performance | ~45 | ≥ 70 | P0 | lighthouse-ci.yml |
| Lighthouse Accessibility | ~85 | ≥ 90 | P1 | lighthouse-ci.yml |
| Lighthouse Best Practices | ~78 | ≥ 80 | P2 | lighthouse-ci.yml |
| Lighthouse SEO | ~92 | ≥ 90 | P1 | lighthouse-ci.yml |

---

## Legend

- **P0 (Critical)**: Must be fixed immediately, blocks releases
- **P1 (High)**: Should be fixed in current sprint
- **P2 (Medium)**: Fix in next optimization sprint

## Test Commands

```bash
# Run all performance tests
npx playwright test tests/performance/

# Run specific test suites
npx playwright test tests/performance/core-web-vitals.spec.ts
npx playwright test tests/performance/api-efficiency.spec.ts
npx playwright test tests/performance/web-vitals.spec.ts

# Run Lighthouse CI locally
npm install -g @lhci/cli
lhci autorun --config=lighthouserc.js

# Run bundle analysis
ANALYZE=true npm run build
```
