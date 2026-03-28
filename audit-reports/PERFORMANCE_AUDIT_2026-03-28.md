# PERFORMANCE AUDIT REPORT
## Sang-Logium Homepage & System-Level Analysis
**Date:** March 28, 2026  
**Scope:** Homepage only + System-level concerns  
**Auditor:** AI Performance Engineer

---

## EXECUTIVE SUMMARY

The Sang-Logium homepage has **critical performance issues** that severely impact user experience, particularly on mobile devices. The production Lighthouse report reveals a **Performance Score of 0.57** with catastrophic Time-to-First-Byte (TTFB) at 10.9 seconds. While CLS is well-controlled (0.001), the LCP at 7.7s and Speed Index of 22.5s indicate fundamental server-side and critical rendering path problems.

**Overall Grade: D- (Critical Action Required)**

---

## 1. CRITICAL FINDINGS (P0 - Immediate Action)

### 1.1 Server Response Time: 10.9s (Target: <200ms) - SCORE: 0/100
**Severity: CRITICAL**

The root document takes **10,904ms** to respond. This is the single biggest performance killer.

**Root Causes Identified:**
- **Sequential Data Fetching Pattern**: While `fetchHomepageData.ts` uses `Promise.all()`, each individual query (9 separate Sanity fetches) is unoptimized
- **No Data Deduplication/Caching**: Each homepage section fetches independently without shared cache
- **Missing ISR Optimization**: `revalidate = 3600` is set but the **server response indicates SSR** is happening synchronously
- **Potential Cold-Start Issues**: Netlify serverless functions may have cold-start latency

**Evidence:**
```
server-response-time: 10,904ms (score: 0)
document-latency-insight: 14,020ms estimated savings
```

### 1.2 Largest Contentful Paint: 7.7s (Target: <2.5s) - SCORE: 3/100
**Severity: CRITICAL**

The LCP element is likely the hero background image, which loads too late in the waterfall.

**Root Causes:**
- **Hero Image Loading Strategy**: Uses `next/image` with `priority` but lacks **fetchpriority="high"** attribute
- **No Preload Hint**: The hero image (largest content) isn't preloaded in `<head>`
- **Multiple Redirects**: 2,170ms estimated savings from redirects
- **Image Size**: `sizes="100vw"` without responsive breakpoints causes oversized downloads

**Code Issue:** `@/app/(store)/page.tsx`
```tsx
<Image
  src={urlFor(mobileBackgroundImage).width(828)...}
  priority  // ✓ Good
  sizes="100vw"  // ✗ Too broad - should be specific
  // ✗ Missing fetchpriority="high"
/>
```

### 1.3 Speed Index: 22.5s (Target: <3.4s) - SCORE: 0/100
**Severity: CRITICAL**

Visual content appears extremely slowly. Screenshot thumbnails show blank/white content until ~15s.

**Root Causes:**
- **Render-Blocking Data Fetch**: Page waits for all 9 data queries before rendering
- **No Streaming**: Next.js 15 supports streaming but isn't utilized
- **Client-Side Hydration Delay**: Heavy client components block interactivity

---

## 2. HIGH-PRIORITY FINDINGS (P1)

### 2.1 Unused JavaScript: 265 KiB (Target: <50 KiB) - SCORE: 0/100
**Severity: HIGH**

Significant JavaScript bloat from third-party packages.

**Sources Identified:**
- **@phosphor-icons/react**: Imports entire icon library instead of individual icons
- **@clerk/nextjs**: Auth package loaded on every page (may not need full SDK on homepage)
- **@radix-ui components**: Multiple dialog/popover primitives
- **nuqs**: URL state management (questionable need on static homepage)

**Code Issues:**
```tsx
// @/app/(store)/layout.tsx
import { NuqsAdapter } from "nuqs/adapters/next/app";  // ✗ Overhead for static page
import { ClerkProvider } from "@clerk/nextjs";  // ✗ Full auth on homepage
import { ShoppingCart } from "@phosphor-icons/react/dist/ssr";  // ✗ Imports all icons
```

### 2.2 Main Thread Work: 2.5s (Target: <1s) - SCORE: 0/100
**Severity: HIGH**

Excessive JavaScript execution blocking user interactions.

**Root Causes:**
- **Carousel Client Components**: Every homepage carousel runs full React state management
- **Resize Event Listeners**: `@/app/components/layout/carousel/CarouselContext.tsx` adds window resize listeners that fire continuously
- **Forced Reflow**: Animations trigger layout recalculations

### 2.3 Multiple Redirects: 2,170ms penalty
**Severity: HIGH**

Redirect chain detected in production.

**Likely Causes:**
- HTTP → HTTPS redirect
- Non-www → www redirect (or vice versa)
- Trailing slash normalization
- Missing canonical URL configuration in `next.config.ts`

---

## 3. MEDIUM-PRIORITY FINDINGS (P2)

### 3.1 Time to Interactive: 9.8s (Target: <3.8s) - SCORE: 28/100
**Severity: MEDIUM**

Page becomes interactive very late due to hydration overhead.

**Contributing Factors:**
- 3 client carousels on homepage, each with complex React state
- No code-splitting for below-fold components
- No `React.lazy()` or dynamic imports

### 3.2 First Contentful Paint: 2.7s (Target: <1.8s) - SCORE: 58/100
**Severity: MEDIUM**

Initial paint is acceptable but improvable.

**Quick Wins:**
- Add `dns-prefetch` and `preconnect` for `cdn.sanity.io`
- Inline critical CSS (experimental.optimizeCss is enabled but verify it works)

### 3.3 Image Optimization Gaps
**Severity: MEDIUM**

**Issues Found:**
1. **No Blur Placeholder**: Hero image lacks `placeholder="blur"` with `blurDataURL`
2. **Fractal Ring Background**: 184KB WebP sprite used repeatedly without optimization
3. **Sanity Images**: No LQIP (Low Quality Image Placeholder) implementation
4. **Quality Settings Inconsistent**: Hero uses quality=90, products use 75, no AVIF for hero

**Code Issue:** `@/app/components/features/homepage/hero/Hero.tsx`
```tsx
<Image
  src={urlFor(mobileBackgroundImage).width(828).auto('format').quality(85).url()}
  priority
  // ✗ Missing: placeholder="blur" 
  // ✗ Missing: blurDataURL={generateBlurDataURL(mobileBackgroundImage)}
/>
```

---

## 4. POSITIVE FINDINGS

### 4.1 Cumulative Layout Shift: 0.001 (Target: <0.1) - SCORE: 100/100
**Excellent** - Layout is stable during load.

**Why:**
- Fixed aspect ratios on images (`aspect-[4/3]`)
- CSS containment on cards
- No late-loading fonts causing reflow (Montserrat preloaded)

### 4.2 Total Blocking Time: 230ms (Target: <200ms) - SCORE: 86/100
**Good** - Main thread isn't heavily blocked.

### 4.3 Modern Image Formats
**Good:** WebP/AVIF configured in `next.config.ts`

### 4.4 Server Components Architecture
**Good:** Homepage uses React Server Components (no "use client" at page level)

---

## 5. SYSTEM-LEVEL AUDIT

### 5.1 Next.js Configuration Analysis

**File:** `@/next.config.ts`

**Strengths:**
```ts
// ✓ Experimental optimizations enabled
experimental: {
  optimizeCss: true,
  inlineCss: true,
  optimizePackageImports: ["@clerk/nextjs", "@phosphor-icons/react"],
},

// ✓ Image optimization configured
images: {
  formats: ["image/avif", "image/webp"],
  deviceSizes: [640, 750, 1080, 1200, 1920, 2048],
  minimumCacheTTL: 31536000,
}

// ✓ Cache headers set
Cache-Control: "public, max-age=300, s-maxage=300, stale-while-revalidate=600"
```

**Gaps:**
```ts
// ✗ Missing: trailingSlash configuration (causes redirects)
// ✗ Missing: assetPrefix for CDN distribution
// ✗ Missing: compiler.removeConsole in production
// ✗ Missing: pageExtensions for route optimization
```

### 5.2 Data Fetching Architecture

**File:** `@/app/(store)/lib/fetchHomepageData.ts`

**Current Pattern:**
```ts
// 9 parallel fetches - GOOD
const [hero, featured, ...] = await Promise.all([
  getHeroData(),      // → Sanity fetch
  getFeaturedProducts(), // → Sanity fetch
  // ... 7 more
]);
```

**Problems:**
1. **No Request Deduplication**: Each `sanityFetch` creates new HTTP request
2. **No Response Caching**: Data not cached between requests
3. **No Stale-While-Revalidate**: ISR doesn't help on first visit
4. **Over-Fetching**: Each section queries entire document when only fields needed

### 5.3 Bundle Analysis Required

**Unknowns:**
- Total JavaScript bundle size
- Third-party script breakdown
- Duplicate module inclusion

**Action Needed:** Run `npm run analyze` (ANALYZE=true) to generate bundle report

### 5.4 Middleware Impact

**File:** `@/middleware.ts`

**Current:**
```ts
export default clerkMiddleware(async (auth, request) => {
  const response = NextResponse.next();
  // ... minimal logic
  return response;
});
```

**Assessment:** Minimal impact - runs only on matched routes, excludes static files.

---

## 6. HOMEPAGE-SPECIFIC FINDINGS

### 6.1 Component Breakdown

| Component | Type | Data Source | Issue |
|-----------|------|-------------|-------|
| Hero | Server | Sanity | LCP element, needs preload |
| Featured | Server | Sanity | Carousel client component overhead |
| ProductSpotlight1-3 | Server | Sanity | 3 separate fetches |
| IemsGallery | Server | Sanity | Grid layout OK |
| NewestRelease | Server | Sanity | Single product OK |
| Dacs | Server | Sanity | Carousel client component |
| Accessories | Server | Sanity | 2 category fetches |

### 6.2 Client Component Inventory

**All "use client" on homepage:**
1. `@/app/components/layout/carousel/CarouselRoot.tsx`
2. `@/app/components/layout/carousel/CarouselContext.tsx`
3. `@/app/components/layout/carousel/CarouselTrack.tsx`
4. `@/app/components/layout/carousel/CarouselControls.tsx`

**Impact:** Every carousel adds ~15KB+ JS and hydration overhead.

**Recommendation:** Evaluate if carousels need full React state or can use CSS scroll-snap.

### 6.3 Image Inventory (Homepage)

| Image | Location | Size | Priority | Issue |
|-------|----------|------|----------|-------|
| Hero Background | Hero.tsx | ~200KB | Critical | No preload, sizes too broad |
| Product Images | Featured.tsx | ~50KB each | High | Lazy loaded OK |
| Fractal Ring | CSS bg (7 sections) | 184KB total | Medium | Repeated decorative asset |

---

## 7. TESTING GAPS

### 7.1 Missing Performance Tests

**Current Tests:** `@/tests/e2e/homepage/`
- `sections.spec.ts` - Functional section tests
- `accessibility.spec.ts` - A11y checks
- `regression.spec.ts` - Visual regression
- `rwd-matrix.spec.ts` - Responsive layout

**Missing:**
- ❌ Web Vitals assertions (LCP < 2.5s, CLS < 0.1, TTFB < 600ms)
- ❌ Performance budget tests (JS < 200KB, Images < 1MB)
- ❌ Lighthouse CI integration
- ❌ Core Web Vitals field data collection

### 7.2 No Local Performance Profiling

**Missing Tools:**
- ❌ Lighthouse CI configuration
- ❌ Web Vitals library integration
- ❌ Chrome DevTools Performance workflow
- ❌ Bundle analyzer automation

---

## 8. PERFORMANCE GAPS SUMMARY

| Metric | Current | Target | Gap | Priority |
|--------|---------|--------|-----|----------|
| TTFB | 10.9s | 0.2s | 10.7s | P0 |
| LCP | 7.7s | 2.5s | 5.2s | P0 |
| Speed Index | 22.5s | 3.4s | 19.1s | P0 |
| TTI | 9.8s | 3.8s | 6.0s | P1 |
| FCP | 2.7s | 1.8s | 0.9s | P2 |
| CLS | 0.001 | 0.1 | ✓ Pass | - |
| TBT | 230ms | 200ms | 30ms | P3 |

---

## 9. ROOT CAUSE ANALYSIS

### The Performance Crisis Chain:

```
1. Cold Serverless Start / Inefficient Data Layer
   ↓
2. TTFB: 10.9s (Document delayed)
   ↓
3. Critical Resources Discovery Delayed
   ↓
4. Hero Image (LCP) Starts Loading Late
   ↓
5. LCP: 7.7s (Cumulative delay)
   ↓
6. JavaScript Hydration Blocks Interactivity
   ↓
7. TTI: 9.8s, Speed Index: 22.5s
```

### Primary Root Causes:

1. **Server Response Architecture**: Data fetching is the bottleneck
2. **Critical Resource Prioritization**: LCP element not prioritized
3. **JavaScript Overhead**: Too many client components for static content
4. **Redirect Chain**: Adding 2+ seconds to initial request

---

## 10. RECOMMENDED SOLUTIONS ARCHITECTURE

### Phase 1: Emergency Fixes (P0 - This Week)

1. **Fix Data Layer**
   - Implement DataLoader pattern for batching Sanity requests
   - Add Redis/Memcached caching layer
   - Optimize GROQ queries to fetch only needed fields

2. **Fix LCP**
   - Add `<link rel="preload">` for hero image
   - Implement blur placeholder
   - Add `fetchpriority="high"` to hero image

3. **Fix Redirects**
   - Configure canonical URLs in Next.js
   - Ensure HTTPS/www consistency

### Phase 2: Architecture Improvements (P1 - Next 2 Weeks)

1. **Bundle Optimization**
   - Code-split carousels with `dynamic()`
   - Tree-shake Phosphor icons (use individual imports)
   - Lazy-load Clerk on non-auth pages

2. **Streaming Architecture**
   - Implement React 18 Suspense boundaries
   - Stream above-fold content first
   - Defer below-fold data fetching

### Phase 3: Advanced Optimizations (P2 - Month 2)

1. **Edge Caching**
   - Configure Netlify Edge Functions
   - Implement stale-while-revalidate at edge

2. **Monitoring**
   - Add Web Vitals reporting
   - Setup Real User Monitoring (RUM)
   - Configure Lighthouse CI

---

## APPENDIX A: CODE REFERENCES

### A.1 Critical Files for Optimization

| File | Lines of Concern | Issue |
|------|------------------|-------|
| `@/app/(store)/lib/fetchHomepageData.ts` | 23-48 | Parallel but unoptimized fetches |
| `@/app/components/features/homepage/hero/Hero.tsx` | 36-44 | Hero image loading strategy |
| `@/app/(store)/layout.tsx` | 38-67 | Client component providers |
| `@/app/components/layout/carousel/CarouselContext.tsx` | 46-58 | Resize listener overhead |
| `@/next.config.ts` | 1-68 | Missing optimizations |

### A.2 Data Queries to Optimize

All queries in `@/app/components/features/homepage/*/get*Data.ts`:
- Fetch only required fields
- Use `@sanity/preview-kit` for live previews if needed
- Implement request coalescing

---

## APPENDIX B: TARGET METRICS

Based on industry standards for e-commerce:

| Metric | Good | Poor | Sang-Logium |
|--------|------|------|-------------|
| TTFB | < 600ms | > 1s | 10.9s ❌ |
| FCP | < 1.8s | > 3s | 2.7s ⚠️ |
| LCP | < 2.5s | > 4s | 7.7s ❌ |
| TTI | < 3.8s | > 7.3s | 9.8s ❌ |
| CLS | < 0.1 | > 0.25 | 0.001 ✓ |
| Speed Index | < 3.4s | > 5.8s | 22.5s ❌ |

---

**END OF AUDIT REPORT**

Next: See `PERFORMANCE_SPRINT.todo` for actionable sprint plan.
