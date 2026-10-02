# Performance Budget

These thresholds are enforced by both `lighthouserc.cjs` and `lighthouserc.mobile.cjs` in Lighthouse CI and are the project's performance SLA.

## Thresholds

| Metric | Budget | Level | Rationale |
| --- | --- | --- | --- |
| `categories:performance` | Score ≥ 0.70 | warn | Performance category must stay above 70%. |
| `categories:accessibility` | Score ≥ 0.90 | error | Accessibility is a hard requirement. |
| `categories:best-practices` | Score ≥ 0.80 | warn | Baseline for best-practice compliance. |
| `categories:seo` | Score ≥ 0.90 | warn | Baseline for SEO compliance. |
| `first-contentful-paint` | ≤ 2000 ms | error | FCP must be under 2 seconds. |
| `largest-contentful-paint` | ≤ 3000 ms | error | LCP must be under 3 seconds. |
| `total-blocking-time` | ≤ 300 ms | warn | TBT should stay under 300 ms. |
| `cumulative-layout-shift` | ≤ 0.1 | error | CLS must be below 0.1. |
| `speed-index` | ≤ 4300 ms | warn | Speed Index should stay under 4.3 seconds. |
| `server-response-time` | ≤ 600 ms | error | TTFB must be under 600 ms. |
| `total-byte-weight` | ≤ 2.5 MB | error | Total page weight must be under 2.5 MB. |
| `uses-long-cache-ttl` | Score ≥ 0.80 | warn | Static assets should use long cache TTLs. |
| `uses-responsive-images` | Score ≥ 0.80 | warn | Images should be sized correctly for the viewport. |
| `unused-javascript` | ≤ 150 KB | error | Unused JavaScript must be under 150 KB. |

## Performance SLA

These budgets represent the maximum acceptable values for the production storefront on both desktop and mobile. A failing `error` assertion blocks the PR; a failing `warn` assertion is a signal that must be triaged before release. The numbers are intentionally conservative for an e-commerce application and align with the Core Web Vitals "good" thresholds, ensuring pages load fast, stay stable, and remain responsive for users.
