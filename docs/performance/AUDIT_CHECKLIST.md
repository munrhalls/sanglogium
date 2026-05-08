# Performance Audit Checklist

Run this checklist before every production deployment and after significant changes.

## Pre-Deployment Checks

- [ ] `npm run analyze` — no chunk over 200KB uncompressed
- [ ] `lhci autorun --config=lighthouserc.js` — all assertions pass
- [ ] No `console.log` in production code (grep: `console\.(log|time|timeEnd)`)
- [ ] All images have `sizes` attribute or are fill-mode with proper container
- [ ] LCP image has `priority={true}`
- [ ] No synchronous third-party scripts in `<head>`
- [ ] `loading.tsx` exists for all async page segments

## Per-Page Checks

| Page | LCP Element | Has Priority | Has Skeleton | ISR |
|---|---|---|---|---|
| `/` | Hero image | | | 3600s |
| `/products/[...slug]` | First product card | | | |
| `/product/[slug]` | Main product image | | | |
| `/basket` | Basket items | N/A | | N/A |
| `/checkout` | Form | N/A | | N/A |

## Bundle Health

| Metric | Target | Current |
|---|---|---|
| Total JS (gzipped) | under 200KB | |
| Total CSS (gzipped) | under 50KB | |
| Largest chunk | under 200KB uncompressed | |
| Unused JS | under 150KB | |

## Core Web Vitals Baseline

Record after each audit:

| Date | LCP | INP | CLS | TTFB | FCP | Perf Score |
|---|---|---|---|---|---|---|
| | | | | | | |
