# Performance Monitoring — Implementation

## Strategy: Three Pillars

End-user performance is measured through three complementary approaches:

| Pillar | Data Type | Tool | Frequency | Purpose |
|---|---|---|---|---|
| **RUM** | Field (real users) | `web-vitals` → `/api/analytics/vitals` | Every page load | Truth — what users actually experience |
| **Synthetic** | Lab (simulated) | Lighthouse CI | Every push/PR | Regression prevention |
| **Regression** | Lab (e2e) | Playwright + Performance API | On demand / CI | Guard critical paths |

**Key principle:** Google ranks on field data (RUM) at the **75th percentile (p75)**, not lab data. Lighthouse is for catching regressions before they ship; RUM is the source of truth.

---

## 1. Real User Monitoring (RUM)

### Architecture

```
Browser (WebVitals component)
  │ onLCP / onINP / onCLS / onTTFB / onFCP
  │ navigator.sendBeacon()
  ▼
POST /api/analytics/vitals
  │ Structured JSON log
  │ In-memory p75 aggregation (rolling window)
  ▼
Log aggregator (Netlify logs, Datadog, Grafana, etc.)
```

### Files

- **Component:** `app/components/analytics/WebVitals.tsx` — collects all 5 Core Web Vitals via `web-vitals` library
- **Endpoint:** `app/api/analytics/vitals/route.ts` — receives beacons, logs structured JSON, maintains p75 aggregates
- **Mount point:** `app/(store)/layout.tsx:74` — inside `<Suspense>`

### Configuration

| Env Variable | Default | Purpose |
|---|---|---|
| `NEXT_PUBLIC_DISABLE_WEB_VITALS` | unset (enabled) | Set to `"true"` to disable all RUM collection |
| `NEXT_PUBLIC_WEB_VITALS_SAMPLE_RATE` | `1` (100%) | Fraction of users to collect from (0–1) |

### Viewing Data

**Development:** Metrics logged to browser console with color-coded ratings (green/orange/red).

**Production:** Structured JSON logged to server console. Every 100 beacons, a summary with p75 values is emitted:
```json
{"event":"web_vitals_summary","LCP":{"count":100,"p75":1847.32},"INP":{"count":100,"p75":96},"CLS":{"count":100,"p75":0.03},"TTFB":{"count":100,"p75":312.5},"FCP":{"count":100,"p75":1201.18}}
```

Pipe these logs to any monitoring service for dashboards and alerting.

---

## 2. Synthetic Monitoring (Lighthouse CI)

### Architecture

```
Git push → GitHub Actions
  │ npm ci → npm run build
  │ lhci autorun --config=lighthouserc.js
  ▼
Assertions checked → Report uploaded as artifact
```

### Files

- **Config:** `lighthouserc.js` — thresholds for all Core Web Vitals + resource budgets
- **Workflow:** `.github/workflows/lighthouse-ci.yml` — runs on push to main/develop and PRs to main

### Thresholds

| Metric | Assertion | Threshold |
|---|---|---|
| Performance score | warn | below 70 |
| FCP | error | above 2000ms |
| LCP | error | above 3000ms |
| TBT | warn | above 300ms |
| CLS | error | above 0.1 |
| TTFB | error | above 600ms |
| Total byte weight | warn | above 2.5MB |

### Running Locally

```powershell
npx lhci autorun --config=lighthouserc.js
```

---

## 3. Regression Tests (Playwright)

### Files

- **Helper:** `tests/helpers/performance.ts` — reusable `measureWebVitals()` function
- **Tests:** `tests/e2e/performance/critical-pages.spec.ts` — homepage, PDP, category page

### Running

```powershell
# All performance tests
npx playwright test tests/e2e/performance/ --project=desktop-chromium

# Single page
npx playwright test tests/e2e/performance/critical-pages.spec.ts -g "homepage"
```

### Thresholds

| Metric | Good | Needs Improvement | Poor |
|---|---|---|---|
| LCP | ≤ 2500ms | ≤ 4000ms | > 4000ms |
| FCP | ≤ 1800ms | ≤ 3000ms | > 3000ms |
| TTFB | ≤ 800ms | ≤ 1800ms | > 1800ms |
| CLS | ≤ 0.1 | ≤ 0.25 | > 0.25 |
| INP | ≤ 200ms | ≤ 500ms | > 500ms |

---

## 4. Pre-Deployment Checklist

Run before every production deployment:

```powershell
# 1. Bundle health
npm run analyze

# 2. Lighthouse audit
npx lhci autorun --config=lighthouserc.js

# 3. No production console logs
rg "console\.(log|time|timeEnd)" app/ --type ts --type tsx

# 4. Performance regression tests
npx playwright test tests/e2e/performance/ --project=desktop-chromium
```

---

## 5. What NOT to Add (Anti-Patterns)

- **No third-party RUM service** unless traffic volume justifies the cost. The custom beacon endpoint is zero-cost and fully controlled.
- **No server-side timing middleware** for every request — adds latency. Instrument specific slow routes only when data shows a problem.
- **No real-time dashboards** until p75 data shows a degradation trend. Log-based monitoring is sufficient for current scale.
- **No performance budgets in webpack/next.config** beyond what Lighthouse CI already enforces. Duplicate enforcement creates maintenance burden.
