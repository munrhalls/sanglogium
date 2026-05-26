# Performance Strategy — Sang Logium

## Target

All pages pass Core Web Vitals at the 90th percentile (LCP under 2.5s, INP under 200ms, CLS under 0.1, TTFB under 800ms). Lighthouse Performance score at least 90.

---

## 1. Immediate Fixes (Week 1)

Low-risk, high-impact changes to production code.

### 1.1 Remove Production Console Logging

| File | Issue | Fix |
|---|---|---|
| `sanity-cms/lib/client.ts:32-35` | 4 `console.log` on every import | Delete lines 32-35 |
| `app/(store)/product/[slug]/page.tsx:15` | `console.log(product)` on every PDP visit | Delete line 15 |
| `app/(store)/lib/fetchHomepageData.ts:16,22,26` | `console.time/timeEnd` in production | Guard with `NODE_ENV` check |

### 1.2 Deduplicate Product Page Fetch

`getProductBySlug` is called **twice** per PDP request — once in the page component and once in `generateMetadata`. Wrap it with `React.cache()`:

```ts
// sanity-cms/lib/products/getProductBySlug.ts
import { cache } from 'react';

export const getProductBySlug = cache(async (slug: string): Promise<Product | null> => {
  // ... existing implementation
});
```

This eliminates the second GROQ query. Same pattern applies to any data function called in both page + `generateMetadata`.

### 1.3 Add Homepage Loading Skeleton

Create `app/(store)/loading.tsx` with a lightweight skeleton matching the homepage shell. Currently the homepage blocks rendering until all CMS data arrives.

---

## 2. Structural Improvements (Week 2–3)

### 2.1 Image Priority Audit

Identify the LCP element on each page and add `priority={true}`:
- **Homepage**: Hero background image
- **PDP**: Main product image
- **Category**: First product card image

### 2.2 Preconnect Critical Origins

Add to `app/(store)/layout.tsx` `<head>`:
- `https://api.stripe.com` (crossorigin)
- `https://*.clerk.accounts.dev` (if Clerk re-enabled)

### 2.3 Lodash Tree-Shaking

Audit all `lodash` imports. Replace `import _ from 'lodash'` with per-function imports like `import groupBy from 'lodash/groupBy'`. Run `npm run analyze` to verify bundle reduction.

### 2.4 Move `@types/webpack` to devDependencies

Currently in `dependencies` — should be `devDependencies` only.

---

## 3. Caching & CDN (Week 2–3)

### 3.1 Verify Vercel CDN Headers

Vercel automatically sets immutable caching for `/_next/static/*`. Verify in production response headers that:
- `/_next/static/*` returns `Cache-Control: public, max-age=31536000, immutable`
- Images return `Cache-Control: public, max-age=31536000`

### 3.2 ISR Tuning

Current `revalidate = 3600` on homepage. Consider:
- Homepage: 3600s (1 hour) — good for content that changes infrequently
- Category pages: add `revalidate` if not already set
- PDP: add `revalidate` for stock/price freshness (e.g., 60s)

### 3.3 API Route Caching

Basket API (`/api/basket/products`) could benefit from short-term CDN caching with `stale-while-revalidate`. Add appropriate `Cache-Control` header.

---

## 4. Monitoring & Testing

### 4.1 WebVitals RUM ✅ Active

The `WebVitals` component is mounted in `app/(store)/layout.tsx:74` and sends Core Web Vitals to `/api/analytics/vitals` via `navigator.sendBeacon()`. The endpoint logs structured JSON. See `app/api/analytics/vitals/route.ts`.

### 4.2 Lighthouse CI ✅ Active

Runs on every push/PR via `.github/workflows/lighthouse-ci.yml`. Tests homepage, PDP, and category page. Assertions in `lighthouserc.cjs`:
- Performance: warn below 70
- FCP: error above 2000ms
- LCP: error above 3000ms
- TBT: warn above 300ms
- CLS: error above 0.1
- TTFB: error above 600ms
- Total byte weight: warn above 2.5MB

Run locally:
```powershell
npx lhci autorun --config=lighthouserc.cjs
```

### 4.3 Bundle Analysis

Run `npm run analyze` to generate bundle treemap. Target: no single chunk over 200KB uncompressed.

---

## 5. What Is Already Good

The codebase already has strong performance foundations. **Do not regress these:**

- Server Components for all pages (no unnecessary client components)
- `next/font` with Montserrat, `display: 'swap'`, `subsets: ['latin']`
- `next/image` with custom Sanity CDN loader, AVIF/WebP formats
- `minimumCacheTTL: 31536000` for images
- `optimizeCss: true`, `inlineCss: true`
- `optimizePackageImports` for Clerk and Phosphor
- Preconnect to `cdn.sanity.io` in layout `<head>`
- `poweredByHeader: false`, `compress: true`
- Security headers with 5-minute CDN cache
- Vercel immutable caching for static assets
- Bundle analyzer configured (`npm run analyze`)
- Lighthouse CI in GitHub Actions
- Homepage data batched (10 calls → 2 calls)
- Catalogue pre-built at build time (VFS, no runtime CMS calls)
- Streaming with Suspense on category pages
- `loading.tsx` for product and category pages
- `useMemo` and `useShallow` in BasketManager
- Stripe loaded at module scope (not in component)
- `hoverOnlyWhenSupported: true` in Tailwind config
- `sharp` installed for image optimization
- `critters` installed for critical CSS inlining

---

## 6. Execution Order

| Priority | Action | Effort | Impact |
|---|---|---|---|
| P0 | Remove production console logs | 10 min | Cleaner prod, minor TTFB |
| P0 | `React.cache()` on `getProductBySlug` | 5 min | Cuts PDP CMS calls in half |
| P0 | Homepage `loading.tsx` | 30 min | Perceived performance |
| P1 | Image priority audit | 1 hr | LCP improvement |
| P1 | Enable WebVitals RUM | 5 min | Visibility |
| P1 | Lighthouse CI baseline | 30 min | Measurement |
| P2 | Preconnect Stripe origin | 5 min | Minor TTFB |
| P2 | Lodash tree-shaking audit | 1 hr | Bundle size |
| P2 | ISR tuning on PDP/categories | 30 min | TTFB |
| P3 | Playwright perf assertions | 2 hr | Regression prevention |
| P3 | Bundle analysis and splitting | 2 hr | JS parse time |
STATUS: 
[x] P 0,1,2,3 -  DONE
[] REQUIRE SYSTEMATIC VERIFICATION AND CHECKS
