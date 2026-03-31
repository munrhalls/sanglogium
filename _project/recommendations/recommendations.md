# Performance Optimization Recommendations

**Date:** March 31, 2026  
**Source:** S8-S12 Performance Analysis & Research Intelligence  
**Priority:** P0 — Critical Production Impact  

---

## Executive Summary

Based on comprehensive analysis of sang-logium's performance profile (TTFB: 10.9s, LCP: 7.7s, Lighthouse: 57/100), these recommendations provide a prioritized, actionable roadmap to achieve production-ready performance metrics.

**Target State:**
- TTFB: <600ms (from 10.9s)
- LCP: <2.5s (from 7.7s)
- Lighthouse: >75 (from 57)
- Bundle: <300KB (from 400KB)

---

## Priority 1: Data Fetching Architecture (Days 1-2)

### Recommendation 1.1: Implement Unified Data Layer
**Impact:** Critical (fixes 10.9s TTFB)  
**Effort:** Medium

Replace 9 sequential Sanity API calls with a single batched GROQ query:

```typescript
// app/lib/data/homepageBatch.ts
export async function fetchHomepageBatch() {
  return sanityFetch({
    query: groq`*[_type == "homepage"][0] {
      hero { ..., image { asset-> } },
      featuredProducts[]-> { ... },
      categories[]-> { ... },
      // All sections in ONE query
    }`
  });
}
```

**Why:** Connection overhead and request waterfall are primary TTFB culprits. A single query eliminates both.

**Expected Result:** TTFB 10.9s → 1.5s

---

### Recommendation 1.2: Add Request Deduplication
**Impact:** High  
**Effort:** Low

Wrap data fetchers with React's `cache()`:

```typescript
import { cache } from 'react';

export const getProductsByCategory = cache(async (categoryId: string) => {
  // Same request within render cycle returns cached result
});
```

**Why:** Prevents duplicate queries when multiple components request same data.

**Expected Result:** API calls reduced 30-50% on complex pages

---

### Recommendation 1.3: Implement Edge Caching
**Impact:** High  
**Effort:** Medium

Add to `app/(store)/page.tsx`:

```typescript
export const revalidate = 60; // ISR with 60s stale-while-revalidate
```

Configure Vercel Edge:
```json
{
  "headers": [{
    "source": "/",
    "headers": [{
      "key": "Cache-Control",
      "value": "public, s-maxage=60, stale-while-revalidate=300"
    }]
  }]
}
```

**Why:** 95% of requests served from edge cache, origin TTFB becomes irrelevant.

**Expected Result:** Perceived TTFB <200ms for cached requests

---

## Priority 2: Asset Loading Optimization (Day 3)

### Recommendation 2.1: Add Resource Hints Component
**Impact:** Critical (fixes 7.7s LCP)  
**Effort:** Low

Create `app/components/performance/ResourceHints.tsx`:

```typescript
export function ResourceHints() {
  return (
    <>
      <link rel="preconnect" href="https://cdn.sanity.io" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="https://cdn.sanity.io" />
      <link rel="preload" as="image" href={heroImageUrl} fetchPriority="high" />
    </>
  );
}
```

Add to `app/(store)/layout.tsx` `<head>`.

**Why:** Preconnect saves 100-300ms connection setup. Preload ensures hero image starts loading immediately.

**Expected Result:** LCP 7.7s → 2.5s

---

### Recommendation 2.2: Optimize Hero Image Loading
**Impact:** High  
**Effort:** Low

Update Hero component:

```tsx
<Image
  src={heroImage}
  alt="..."
  priority  // Above-fold priority
  fetchPriority="high"
  sizes="100vw"
  // Ensure width/height to prevent CLS
  width={1920}
  height={1080}
/>
```

**Why:** Hero image is the LCP element. Priority loading is essential.

**Expected Result:** LCP improvement 500ms-1s

---

## Priority 3: Bundle Optimization (Days 4-5)

### Recommendation 3.1: Conditional Clerk Loading
**Impact:** Critical (removes 2.17s redirect + 180KB bundle)  
**Effort:** Medium

Create `app/components/auth/ConditionalClerk.tsx`:

```typescript
'use client';

import { usePathname } from 'next/navigation';
import { ClerkProvider } from '@clerk/nextjs';

const publicPaths = ['/', '/products', '/brand', '/headphones'];

export function ConditionalClerk({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublic = publicPaths.some(p => pathname?.startsWith(p));
  
  if (isPublic) {
    return <>{children}</>; // No Clerk wrapper on public pages
  }
  
  return <ClerkProvider>{children}</ClerkProvider>;
}
```

Update `middleware.ts` matcher:

```typescript
export const config = {
  matcher: [
    '/account/:path*',
    '/checkout/:path*',
    '/admin/:path*',
    // Remove: '/((?!api|_next|.*\\..*).*)'
  ],
};
```

**Why:** Clerk adds 180KB JS and 2.17s redirect chain to every page. Route-based loading eliminates both.

**Expected Result:**
- Bundle: -180KB unused JS
- Redirects: 2.17s → 0ms

---

### Recommendation 3.2: Tree-Shake Icon Imports
**Impact:** Medium (removes ~100KB)  
**Effort:** Low

Audit and replace icon imports:

```typescript
// Before (loads entire library):
import { IconName } from '@phosphor-icons/react';

// After (only used icons):
import { ShoppingCart, User, MagnifyingGlass } from '@phosphor-icons/react';
```

Add to `next.config.ts`:

```typescript
experimental: {
  optimizePackageImports: ['@phosphor-icons/react', '@clerk/nextjs'],
}
```

**Why:** Phosphor icons library is ~120KB, but apps typically use <20 icons.

**Expected Result:** Bundle reduction 80-120KB

---

## Priority 4: Monitoring & Prevention (Ongoing)

### Recommendation 4.1: CI/CD Performance Gates
**Impact:** High (prevents regression)  
**Effort:** Low

Add to `.github/workflows/lighthouse-ci.yml`:

```yaml
- name: Performance Budget Check
  run: |
    npx playwright test tests/performance/core-web-vitals.spec.ts
    # Fails if TTFB > 1s, LCP > 2.5s, etc.
```

Configure `lighthouserc.js`:

```javascript
assert: {
  assertions: {
    'categories:performance': ['error', { minScore: 0.75 }],
    'server-response-time': ['error', { maxNumericValue: 1000 }],
    'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
  }
}
```

**Why:** Automated gates prevent performance regression before merge.

---

### Recommendation 4.2: Real User Monitoring (RUM)
**Impact:** Medium (production insight)  
**Effort:** Low

Deploy S8 WebVitals component to production:

```typescript
// Already implemented in S8
import { WebVitals } from '@/app/components/analytics/WebVitals';

// Add to production analytics endpoint:
function sendToAnalytics(metric, name) {
  // Send to Vercel Analytics, Datadog, etc.
}
```

**Why:** Lab tests (Lighthouse) differ from real user experience. RUM captures actual Core Web Vitals.

---

## Implementation Sequence

```
Week 1: Critical Path
├── Day 1-2: Unified Data Layer (TTFB fix)
│   └── Create batched GROQ query
│   └── Add React.cache() deduplication
│   └── Verify TTFB < 1.5s
│
├── Day 3: Asset Optimization (LCP fix)
│   └── Add ResourceHints component
│   └── Optimize hero image priority
│   └── Verify LCP < 2.5s
│
└── Day 4-5: Bundle Optimization
    └── Conditional Clerk loading
    └── Icon tree-shaking
    └── Verify bundle < 300KB

Week 2: Monitoring & Polish
├── Deploy S8 WebVitals RUM
├── Configure CI performance gates
└── Advanced: ISR, streaming SSR
```

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Batch query too complex | Medium | High | Start with 2-3 sections, expand incrementally |
| Clerk removal breaks auth | Low | Critical | Test all protected routes before deploy |
| Cache stale data | Medium | Medium | Implement revalidate tags, manual invalidation UI |
| Image preload causes CLS | Low | Medium | Use next/image with explicit dimensions |

---

## Success Metrics

| Metric | Before | After | Verification |
|--------|--------|-------|--------------|
| TTFB | 10.9s | <1.0s | Playwright + RUM |
| LCP | 7.7s | <2.5s | Lighthouse CI |
| FCP | 2.1s | <1.5s | Lighthouse CI |
| Unused JS | 265KB | <100KB | Lighthouse |
| Redirects | 2.17s | 0ms | Lighthouse |
| API Calls | 9 | 1 | api-efficiency.spec.ts |
| Lighthouse Score | 57 | >75 | Lighthouse CI |

---

## Immediate Next Steps

1. **Verify baseline:** Run `npm run build` and document current metrics
2. **Create branch:** `git checkout -b performance/phase-1-data-layer`
3. **Implement:** Follow Implementation Sequence above
4. **Test:** Use S8 infrastructure (`npx playwright test tests/performance/`)
5. **Deploy:** Merge to main after all metrics pass

---

## References

- Performance Research Intelligence: `_project/sprints/in-preparation/PERFORMANCE-OPTIMIZATION-RESEARCH-INTELLIGENCE.md`
- S8 Testing Infrastructure: `tests/performance/`
- VFS Product Architecture: `audit-reports/FRONTEND_VFS_CONSUMPTION_AUDIT.md`
- Core Web Vitals: https://web.dev/vitals/
- Next.js Performance: https://nextjs.org/docs/app/building-your-application/optimizing

---

**Status:** Ready for Implementation  
**Dependencies:** S8 Complete ✓  
**Estimated Effort:** 5 days (critical path), 10 days (full optimization)
