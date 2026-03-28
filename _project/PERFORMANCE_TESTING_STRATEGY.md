# Comprehensive Performance Testing Strategy
## Sang-Logium E-Commerce Platform

**Date:** March 28, 2026  
**Tech Stack:** Next.js 15.5.9, React 18.3.1, Sanity CMS, Tailwind CSS 3.3.5  
**Target:** Homepage & Critical User Journeys

---

## Executive Summary

This document establishes a **holistic, penetrating, and trustworthy** performance testing framework for the Sang-Logium e-commerce platform. The strategy combines synthetic testing, real user monitoring (RUM), bundle analysis, and runtime diagnostics to deliver composite metrics that accurately reflect true end-user experience across devices and network conditions.

### Key Principles
1. **Trustworthy Data Through Triangulation** — No single metric tells the truth; composite analysis reveals reality
2. **Real-World Conditions** — Test on 3G, 4G, and WiFi; on mid-range mobile devices and desktop
3. **User-Centric Metrics** — Focus on Core Web Vitals and user-perceived performance
4. **Continuous Monitoring** — CI/CD integration with regression detection
5. **Asset Intelligence** — Deep analysis of JavaScript, images, CSS, and third-party scripts

---

## 1. First Principles of Performance Testing

### 1.1 The Performance Testing Pyramid

```
         ┌─────────────────┐
         │   RUM (Real)    │  ← Production: Web Vitals, Analytics
        ┌┴─────────────────┴┐
        │  E2E Integration    │  ← Playwright + Lighthouse CI
       ┌┴─────────────────────┴┐
       │   Component/Budget    │  ← Bundle analysis, Playwright CT
      ┌┴───────────────────────┴┐
      │    Unit/Static Analysis │  ← ESLint rules, import analysis
      └─────────────────────────┘
```

### 1.2 Trustworthy Data Requirements

| Requirement | Implementation |
|-------------|----------------|
| **Statistical Significance** | Minimum 5 runs per test, discard outliers (±2σ) |
| **Environment Isolation** | Dedicated testing profile, no extensions, clean cache |
| **Network Throttling** | Chrome DevTools presets: Fast 4G (4 Mbps), Slow 4G (1.5 Mbps), 3G (750 Kbps) |
| **Device Representation** | Moto G4 (mid-tier mobile), Desktop (high-end), iPhone SE |
| **Cold vs Warm Cache** | Always test cold cache first; warm cache for repeat visits |

### 1.3 Metric Categories

| Category | Metrics | Target |
|----------|---------|--------|
| **Loading** | TTFB, FCP, LCP, Speed Index | LCP < 2.5s, TTFB < 600ms |
| **Interactivity** | TBT, INP, FID | INP < 200ms |
| **Visual Stability** | CLS | CLS < 0.1 |
| **Asset Heaviness** | Total JS, Image weight, CSS, Third-party | JS < 300KB (gzipped) |
| **Runtime** | Main thread work, JS execution time | < 150ms execution |

---

## 2. Core Web Vitals Deep Dive

### 2.1 LCP (Largest Contentful Paint)

**What it measures:** Time until largest visible element (hero image) renders

**For Sang-Logium Homepage:**
- Primary LCP element: Hero background image
- Thresholds: Good < 2.5s, Needs Improvement 2.5-4s, Poor > 4s

**Diagnostic Tools:**
```bash
# Lighthouse CLI with specific LCP focus
npx lighthouse https://sanglogium.com --only-categories=performance --chrome-flags="--headless" --output=json

# Web Vitals Chrome Extension (manual verification)
# Chrome DevTools → Performance → LCP marker
```

### 2.2 INP (Interaction to Next Paint)

**What it measures:** Responsiveness to user interactions (clicks, taps, keyboard)

**Critical for E-commerce:**
- Add to cart button responsiveness
- Product carousel navigation
- Filter/sort interactions

**Measurement Strategy:**
```javascript
// Using web-vitals library
import { onINP } from 'web-vitals';

onINP((metric) => {
  // Send to analytics
  console.log('INP:', metric.value); // in milliseconds
});
```

### 2.3 CLS (Cumulative Layout Shift)

**What it measures:** Visual stability during page load

**E-commerce Critical Elements:**
- Product images loading
- Dynamic content injection (recommendations)
- Ad/sale banners
- Font loading (FOUT/FOIT)

**Prevention Checklist:**
- [ ] Width/height attributes on all images
- [ ] Skeleton screens for dynamic content
- [ ] `font-display: swap` for web fonts
- [ ] Reserved space for above-the-fold content

---

## 3. Testing Tool Stack

### 3.1 Synthetic Testing (Lab Data)

#### A. Lighthouse CI (Primary)

**Purpose:** Automated performance audits in CI/CD

**Installation:**
```bash
npm install --save-dev lighthouse @lhci/cli
```

**Configuration (`lighthouserc.js`):**
```javascript
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000/'],
      numberOfRuns: 5,
      settings: {
        preset: 'desktop',
        throttlingMethod: 'devtools',
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
        },
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'first-contentful-paint': ['error', { maxNumericValue: 1800 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 200 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
```

**GitHub Actions Integration:**
```yaml
name: Lighthouse CI
on: [push]
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
```

#### B. Playwright + Lighthouse Integration

**Purpose:** End-to-end performance testing with user journey simulation

**Installation:**
```bash
npm install --save-dev playwright lighthouse playwright-lighthouse
```

**Test Script (`tests/performance/homepage.spec.ts`):**
```typescript
import { test, expect } from '@playwright/test';
import { playAudit } from 'playwright-lighthouse';

test('homepage performance audit', async ({ page }) => {
  const port = 9222;
  
  // Navigate through critical user path
  await page.goto('http://localhost:3000');
  await page.waitForSelector('[data-testid="hero-loaded"]');
  
  // Scroll to trigger lazy loading
  await page.evaluate(() => window.scrollTo(0, 500));
  await page.waitForTimeout(500);
  
  // Run Lighthouse audit
  await playAudit({
    page,
    port,
    thresholds: {
      performance: 90,
      accessibility: 95,
      'best-practices': 90,
      seo: 95,
    },
    reports: {
      formats: { html: true, json: true },
      name: `homepage-${Date.now()}`,
      directory: './lighthouse-reports',
    },
  });
});
```

#### C. Playwright Performance Budget Tests

**Purpose:** Assert on specific metrics beyond Lighthouse scores

```typescript
// tests/performance/budget.spec.ts
import { test, expect } from '@playwright/test';

test('homepage resource budget', async ({ page }) => {
  const resources: string[] = [];
  
  page.on('response', async (response) => {
    const url = response.url();
    const headers = await response.allHeaders();
    const size = parseInt(headers['content-length'] || '0');
    resources.push(`${url}: ${(size / 1024).toFixed(2)} KB`);
  });
  
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');
  
  // Assert bundle size
  const jsResources = resources.filter(r => r.includes('.js'));
  const totalJsSize = jsResources.reduce((acc, r) => {
    const match = r.match(/: ([\d.]+) KB/);
    return acc + (match ? parseFloat(match[1]) : 0);
  }, 0);
  
  expect(totalJsSize).toBeLessThan(300); // 300KB budget
});
```

### 3.2 Bundle Analysis

#### A. Next.js Bundle Analyzer

**Already installed:** `@next/bundle-analyzer`

**Usage:**
```bash
# Add to package.json scripts
"analyze": "ANALYZE=true npm run build"

# Run analysis
npm run analyze
```

**Interpretation:**
- Look for duplicate dependencies
- Identify large third-party libraries
- Check async chunk sizes
- Monitor shared chunk growth

#### B. Import Cost Analysis

**Tool:** `webpack-bundle-analyzer` + custom scripts

```javascript
// scripts/analyze-imports.mjs
import fs from 'fs';
import path from 'path';

const stats = JSON.parse(fs.readFileSync('./.next/analyze/client.json', 'utf8'));

// Find largest modules
const modules = Object.entries(stats.assetsByChunkName)
  .flatMap(([name, files]) => 
    files.map(f => ({ chunk: name, file: f, size: stats.assets.find(a => a.name === f)?.size || 0 }))
  )
  .sort((a, b) => b.size - a.size);

console.table(modules.slice(0, 20));
```

### 3.3 Runtime Diagnostics

#### A. Chrome DevTools Performance Panel

**Standard Profiling Workflow:**
1. Open DevTools → Performance tab
2. Enable 4x CPU throttling (mobile simulation)
3. Enable network throttling (Fast 3G)
4. Click Record
5. Refresh page
6. Stop recording after page settles

**Key Analysis Points:**
- **Main Thread Blocking:** Long tasks (>50ms) block interaction
- **Layout Thrashing:** Avoid forced synchronous layouts
- **Recalculate Style:** CSS selector complexity
- **JavaScript Execution:** Long function calls

#### B. React DevTools Profiler

**For Client Components:**
1. Install React DevTools browser extension
2. Open Profiler tab
3. Record while interacting
4. Analyze render times and commit durations

#### C. Web Vitals Library (RUM)

**Installation:**
```bash
npm install web-vitals
```

**Implementation (`lib/vitals.ts`):**
```typescript
import { onCLS, onINP, onLCP, onTTFB, onFCP } from 'web-vitals';
import { sendToAnalytics } from './analytics';

export function initWebVitals() {
  onCLS(sendToAnalytics);
  onINP(sendToAnalytics);
  onLCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
  onFCP(sendToAnalytics);
}

function sendToAnalytics(metric) {
  // Send to your analytics platform
  const body = JSON.stringify(metric);
  
  // Use sendBeacon for reliability
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/vitals', body);
  } else {
    fetch('/api/vitals', { body, method: 'POST', keepalive: true });
  }
}
```

### 3.4 Asset-Specific Tools

#### A. Image Optimization Audit

**Tool:** `lighthouse` + custom scripts

```bash
# Run with image-specific audits
npx lighthouse https://sanglogium.com --preset=desktop --only-audits=uses-responsive-images,modern-image-formats,efficiently-encode-images,uses-optimized-images
```

#### B. Third-Party Script Analysis

**Tool:** Chrome DevTools → Network → Initiator column

**Identify:**
- Scripts blocking render
- Heavy analytics/tracking
- Duplicate tracking libraries
- Unused third-party code

#### C. Font Loading Analysis

**Check:**
- `font-display: swap` usage
- Preconnect to font CDN
- Subset fonts for used glyphs only
- Self-host critical fonts

---

## 4. Composite Testing Strategy

### 4.1 Test Matrix

| Test Type | Tool | Frequency | Environment | Metrics |
|-----------|------|-----------|-------------|---------|
| **Unit Bundle** | Bundle Analyzer | Every build | Local/CI | Chunk sizes, duplicates |
| **Component Budget** | Playwright CT | PR merge | CI | Render time, asset count |
| **E2E Synthetic** | Playwright + Lighthouse | Every PR | CI (headless) | LCP, CLS, TBT, INP |
| **RUM** | Web Vitals lib | Continuous | Production | All Core Web Vitals |
| **Manual Audit** | Chrome DevTools | Weekly | Staging/Prod | Deep profiling |

### 4.2 Confidence Scoring

Calculate a **Performance Confidence Score** (0-100) using:

```
Confidence = (Lighthouse_Score × 0.3) + 
             (RUM_P75_LCP × 0.25) + 
             (RUM_P75_INP × 0.25) + 
             (Bundle_Score × 0.2)

Where:
- Lighthouse_Score = 0-100 (performance category)
- RUM_P75_LCP = 100 - (P75_LCP_ms / 40) [capped at 100]
- RUM_P75_INP = 100 - (P75_INP_ms / 2) [capped at 100]
- Bundle_Score = 100 - (total_KB / 5) [capped at 100]
```

**Grade Thresholds:**
- A (90-100): Excellent
- B (80-89): Good
- C (70-79): Needs improvement
- D (60-69): Poor
- F (<60): Critical

### 4.3 Regression Detection

**Alert Thresholds:**
| Metric | Warning | Critical |
|--------|---------|----------|
| LCP | +20% | +40% |
| INP | +15% | +30% |
| CLS | +0.05 | +0.1 |
| JS Bundle | +10% | +25% |
| TTFB | +50% | +100% |

---

## 5. Homepage-Specific Testing Protocol

### 5.1 Critical Elements to Monitor

| Element | Metric Target | Test Method |
|---------|---------------|-------------|
| **Hero Image** | LCP < 2.5s | Lighthouse, Web Vitals |
| **Product Carousels** | INP < 200ms | Playwright interaction test |
| **Navigation Drawer** | INP < 150ms | Playwright click latency |
| **Featured Products** | Render < 100ms | React Profiler |
| **Third-party Scripts** | < 100ms blocking | DevTools Network |

### 5.2 Device-Specific Testing

**Mobile (Moto G4 Profile):**
```bash
npx lighthouse https://sanglogium.com --preset=desktop --emulated-form-factor=mobile --throttling.cpuSlowdownMultiplier=4
```

**Desktop:**
```bash
npx lighthouse https://sanglogium.com --preset=desktop
```

**Tablet (iPad):**
```bash
npx lighthouse https://sanglogium.com --chrome-flags="--window-size=1024,768"
```

### 5.3 Network Condition Testing

| Condition | Download | Upload | Latency | Use Case |
|-----------|----------|--------|---------|----------|
| Fast 4G | 10 Mbps | 2 Mbps | 40ms | Average mobile |
| Slow 4G | 1.5 Mbps | 375 Kbps | 150ms | Rural/weak signal |
| 3G | 750 Kbps | 250 Kbps | 300ms | Emerging markets |

---

## 6. Implementation Roadmap

### Phase 1: Foundation (Week 1)
- [ ] Install Lighthouse CI
- [ ] Configure `lighthouserc.js`
- [ ] Add GitHub Actions workflow
- [ ] Set up bundle analyzer script

### Phase 2: Integration (Week 2)
- [ ] Install `playwright-lighthouse`
- [ ] Create homepage performance test
- [ ] Add performance budgets to Playwright
- [ ] Implement web-vitals RUM

### Phase 3: Monitoring (Week 3)
- [ ] Set up analytics dashboard for Web Vitals
- [ ] Configure regression alerts
- [ ] Document baseline metrics
- [ ] Create performance runbook

### Phase 4: Optimization (Week 4+)
- [ ] Address identified bottlenecks
- [ ] Implement image optimization pipeline
- [ ] Refactor client components
- [ ] Document performance patterns

---

## 7. Tool Installation Summary

### Required Dependencies

```bash
# Core testing framework
npm install --save-dev @lhci/cli lighthouse

# Playwright integration
npm install --save-dev playwright-lighthouse

# Web Vitals for RUM
npm install web-vitals

# Bundle analysis (already have @next/bundle-analyzer)
# No additional install needed

# Optional: Advanced diagnostics
npm install --save-dev 0x clinic  # Flamegraph generation
```

### Scripts to Add (`package.json`)

```json
{
  "scripts": {
    "test:performance": "lhci autorun",
    "test:performance:e2e": "playwright test tests/performance/",
    "analyze": "ANALYZE=true npm run build",
    "profile": "0x -- node scripts/profile-server.js",
    "vitals": "node scripts/report-web-vitals.js"
  }
}
```

---

## 8. Metrics Reference Card

### Core Web Vitals Thresholds

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| **LCP** | ≤ 2.5s | 2.5s - 4s | > 4s |
| **INP** | ≤ 200ms | 200ms - 500ms | > 500ms |
| **CLS** | ≤ 0.1 | 0.1 - 0.25 | > 0.25 |
| **TTFB** | ≤ 800ms | 800ms - 1.8s | > 1.8s |
| **FCP** | ≤ 1.8s | 1.8s - 3s | > 3s |
| **TBT** | ≤ 200ms | 200ms - 600ms | > 600ms |

### Resource Budgets (Recommended)

| Resource | Budget | Compressed |
|----------|--------|------------|
| Total JS | 300 KB | 100 KB |
| Images (above fold) | 200 KB | - |
| CSS | 50 KB | 15 KB |
| Fonts | 100 KB | - |
| Third-party JS | 100 KB | 40 KB |

---

## 9. Troubleshooting Guide

### Common Issues & Solutions

#### Flaky Lighthouse Scores
- **Cause:** Network variability, server load
- **Solution:** Increase `numberOfRuns` to 5+, use dedicated CI runners

#### High INP on Mobile
- **Cause:** Long-running JS on main thread
- **Solution:** Defer non-critical JS, use `scheduler.yield()`

#### Large Bundle Size
- **Cause:** Unused dependencies, no tree-shaking
- **Solution:** Analyze with `@next/bundle-analyzer`, add `sideEffects: false`

#### Slow TTFB
- **Cause:** Server-side data fetching, cold functions
- **Solution:** Use React.cache(), ISR, edge caching

---

## 10. Conclusion

This testing strategy provides **trustworthy, composite performance metrics** through:

1. **Multiple data sources** — Lab (Lighthouse) + Field (RUM) + Build (Bundle)
2. **Statistical rigor** — Multiple runs, outlier rejection, P75 aggregation
3. **Real-world conditions** — Network throttling, device emulation
4. **Continuous monitoring** — CI integration, regression alerts
5. **User-centric focus** — Core Web Vitals, not synthetic scores only

The result is performance data that accurately reflects what your users experience, enabling confident optimization decisions.

---

## Appendix: Quick Start Commands

```bash
# Run full performance audit
npm run test:performance

# Analyze bundle
npm run analyze

# Profile specific page
npx lighthouse http://localhost:3000 --output=html --output-path=./report.html

# Check web vitals in production
npm run vitals
```

---

**Document Owner:** Engineering Team  
**Review Cycle:** Quarterly  
**Last Updated:** March 28, 2026
