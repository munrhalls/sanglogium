# S9-TTFB-OPTIMIZATION Sprint

**Status:** READY FOR EXECUTION  
**Created:** March 31, 2026  
**Target:** Reduce TTFB from 10.9s to <600ms via batched data fetching  
**Estimated Duration:** 2-3 days  
**Branch:** `perf/S9-ttfb-batched-queries`  
**Depends On:** S8-TESTING-INFRASTRUCTURE (COMPLETE)  

---

## Executive Summary

This sprint addresses the critical TTFB issue (10.9s) caused by 10 sequential Sanity API calls on the homepage. The solution implements a unified batched GROQ query that replaces individual fetchers with 1-2 optimized requests while maintaining exact data shape compatibility.

**Key Insight:** React.cache() only deduplicates within a render pass—it does NOT batch network requests. Ten separate fetchers = ten HTTP requests, even with Promise.all().

---

## 1. Regression Risk Analysis & Containment

### Code Areas At Risk

| Area | Risk Level | Impact If Broken | Mitigation |
|------|------------|------------------|------------|
| `app/(store)/page.tsx` | HIGH | Homepage crashes | Maintain exact `HomepageData` interface |
| `app/(store)/lib/fetchHomepageData.ts` | HIGH | All components lose data | Keep as thin wrapper, delegate to new batch fetcher |
| Hero component | MEDIUM | No hero image | Ensure hero data shape unchanged |
| Featured products | MEDIUM | Empty featured section | Verify array shape and field mapping |
| Spotlights 1-3 | MEDIUM | Missing product cards | Test `productRef->` expansion |
| IEMs gallery | LOW | Empty gallery | Standard product array pattern |
| Newest release | LOW | Missing promo section | Test null handling |
| DACs/Accessories | LOW | Missing sections | Verify accessories substructure |

### Pre-Sprint Regression Tests

These tests MUST pass before and after sprint execution:

```typescript
// tests/regression/homepage-data-shapes.spec.ts
// Create this file before any implementation

import { test, expect } from '@playwright/test';

test.describe('Homepage Data Shape Regression', () => {
  test('Hero data structure intact', async ({ page }) => {
    await page.goto('/');
    const hero = await page.locator('[data-testid="hero"]').first();
    await expect(hero).toBeVisible();
    await expect(hero.locator('h1')).not.toBeEmpty();
  });

  test('Featured products array populated', async ({ page }) => {
    await page.goto('/');
    const featured = await page.locator('[data-testid="featured-products"]');
    await expect(featured).toBeVisible();
    const cards = await featured.locator('[data-testid="product-card"]').count();
    expect(cards).toBeGreaterThan(0);
  });

  test('Spotlight sections render with products', async ({ page }) => {
    await page.goto('/');
    for (let i = 1; i <= 3; i++) {
      const spotlight = page.locator(`[data-testid="spotlight-${i}"]`);
      await expect(spotlight).toBeVisible();
    }
  });

  test('IEMs gallery displays products', async ({ page }) => {
    await page.goto('/');
    const gallery = page.locator('[data-testid="iems-gallery"]');
    await expect(gallery).toBeVisible();
  });

  test('Newest release section renders', async ({ page }) => {
    await page.goto('/');
    const newest = page.locator('[data-testid="newest-release"]');
    await expect(newest).toBeVisible();
  });

  test('DACs section renders', async ({ page }) => {
    await page.goto('/');
    const dacs = page.locator('[data-testid="dacs-section"]');
    await expect(dacs).toBeVisible();
  });

  test('Accessories section renders with cables/earpads', async ({ page }) => {
    await page.goto('/');
    const accessories = page.locator('[data-testid="accessories-section"]');
    await expect(accessories).toBeVisible();
  });
});
```

**Pre-sprint verification:**
```bash
npx playwright test tests/regression/homepage-data-shapes.spec.ts --reporter=line
# All tests MUST pass before proceeding
```

---

## 2. Scope Lock Rules

1. **NO changes to component files** (`Hero.tsx`, `Featured.tsx`, etc.) — data shapes must remain identical
2. **NO changes to individual fetcher files** (`getHeroData.ts`, `getFeaturedProducts.ts`, etc.) — keep as-is for rollback safety
3. **NO changes to image loading strategy** — that's S10 (LCP optimization)
4. **NO changes to bundle/auth** — that's S11/S12
5. **NO changes to `revalidate` strategy** — keep `export const revalidate = 3600`
6. **MUST maintain exact TypeScript interfaces** — `HomepageData` structure is immutable
7. **MUST handle null/empty cases identically** — all sections must degrade gracefully

---

## 3. Scope Contracts

### Scope Contract 1: Unified Batch Query Builder — TTFB Core Fix

**Gap Coverage:** Replaces 10 separate API calls with 1-2 batched GROQ queries

**Target State:**
- Single batched query fetching all `homepageData` sections in one request
- Separate query for `hero` data (different document type)
- Total API calls: 2 (down from 10)
- TTFB: <600ms (down from 10.9s)

**DoD (Definition of Done):**

- [ ] **Pass 1 — Skeleton:** Create `app/lib/data/homepageBatch.ts` with:
  - Type definitions matching existing interfaces
  - Single batched GROQ query for all `homepageData` sections
  - Separate query for `hero` document
  - Proper error handling with fallback to empty structures
  
- [ ] **Pass 2 — Data:** Verify exact data shape compatibility:
  - `featured` → array with `{_id, name, brand, displayPrice, productPromo, image}`
  - `spotlight1/2/3` → object with `{promoTitle, promoSubtitle, promoText, productRef}`
  - `iemsGallery` → array with slug and imageUrl fields
  - `newestRelease` → object with promo fields and productRef
  - `dacs` → array with standard product fields
  - `accessories` → object with `{cables, earpads}` sub-arrays
  
- [ ] **Pass 3 — Build:**
  - **Desktop (1280px):** N/A (server-side only, no UI changes)
  - **Mobile (375px):** N/A (server-side only, no UI changes)

**Verification:**
```bash
# Test data shape integrity
npx playwright test tests/regression/homepage-data-shapes.spec.ts

# Test API efficiency (MUST show ≤3 requests)
npx playwright test tests/performance/api-efficiency.spec.ts

# Build verification
npm run build
```

---

### Scope Contract 2: Fetch Adapter Integration — Seamless Migration

**Gap Coverage:** Integrates batch query into existing `fetchHomepageData()` without breaking consumers

**Target State:**
- `fetchHomepageData()` delegates to new batch fetcher internally
- All 9 homepage sections receive identical data
- Zero changes required in `page.tsx` or components

**DoD (Definition of Done):**

- [ ] **Pass 1 — Skeleton:** Update `app/(store)/lib/fetchHomepageData.ts`:
  - Import new batch fetcher
  - Replace Promise.all with single batch call
  - Maintain identical return type `Promise<HomepageData>`
  - Keep error handling structure
  
- [ ] **Pass 2 — Data:** Verify all 9 data sections populated:
  - Hero: backgroundImage + mobileBackgroundImage with asset metadata
  - Featured: products with promo text
  - Spotlights: 3 sections with processed images (merge gallery into images array)
  - IEMs: gallery with slug-based routing
  - Newest release: promo text + product with gallery
  - DACs: product array
  - Accessories: cables + earpads split structure
  
- [ ] **Pass 3 — Build:**
  - **Desktop:** N/A (server-side)
  - **Mobile:** N/A (server-side)

**Verification:**
```bash
# Full regression test
npx playwright test tests/regression/homepage-data-shapes.spec.ts --reporter=list

# API count verification
npx playwright test tests/performance/api-efficiency.spec.ts --reporter=line
# Expected: ≤3 Sanity requests (2 batch queries + potential image CDN)
```

---

### Scope Contract 3: DataLoader Deduplication Layer — Request Coalescing

**Gap Coverage:** Prevents duplicate requests across component tree using React.cache()

**Target State:**
- `React.cache()` wrapper around batch fetcher
- Multiple components can call fetcher—only 1 network request made
- Per-request deduplication (survives across Suspense boundaries)

**DoD (Definition of Done):**

- [ ] **Pass 1 — Skeleton:** Create `app/lib/data/dataLoader.ts`:
  - Export `cachedFetchHomepageData` using `React.cache()`
  - Wrap batch fetcher with deduplication
  - Reuse existing cache function from React
  
- [ ] **Pass 2 — Data:** Verify deduplication works:
  - Multiple calls in same render = 1 network request
  - Cache key based on request parameters
  - Proper cache invalidation on revalidation
  
- [ ] **Pass 3 — Build:**
  - **Desktop:** N/A (server-side)
  - **Mobile:** N/A (server-side)

**Verification:**
```bash
# Run deduplication test (add to api-efficiency.spec.ts)
npx playwright test tests/performance/api-efficiency.spec.ts -g "duplicate"
# Expected: No duplicate queries
```

---

## 4. Execution Sequence

```
PHASE 1: Foundation (Day 1)
├── Create regression test file
├── Run pre-sprint regression tests (must pass)
├── Create branch: perf/S9-ttfb-batched-queries
└── Verify baseline API count (~10 requests)

PHASE 2: Core Implementation (Day 1-2)
├── Scope Contract 1: Build batched GROQ query
│   ├── Write unified query for homepageData sections
│   ├── Write separate hero query
│   ├── Test query in Sanity Vision
│   └── Verify data shape matches existing interfaces
├── Scope Contract 2: Integrate into fetchHomepageData
│   ├── Replace Promise.all with batch calls
│   ├── Test with real components
│   └── Verify all sections render
└── Scope Contract 3: Add DataLoader cache layer
    ├── Wrap with React.cache()
    └── Verify deduplication

PHASE 3: Verification (Day 2-3)
├── Run regression tests (must pass)
├── Run API efficiency tests (≤3 requests)
├── Run full build verification
├── Measure TTFB improvement
└── Document actual vs target metrics

PHASE 4: Lock (Day 3)
├── Final regression test run
├── Update sprint status to COMPLETE
├── Create PR with summary: "S9: TTFB 10.9s → <600ms via batched queries"
└── Request merge to main
```

---

## 5. Verification Commands

### Per-Contract Verification

```bash
# Contract 1: Batch Query Builder
npx playwright test tests/performance/api-efficiency.spec.ts -g "Homepage makes"
# Expected: Homepage makes ≤ 3 Sanity API requests

# Contract 2: Fetch Adapter Integration
npx playwright test tests/regression/homepage-data-shapes.spec.ts
# Expected: All 7 regression tests pass

# Contract 3: DataLayer Deduplication
npx playwright test tests/performance/api-efficiency.spec.ts -g "duplicate"
# Expected: No duplicate Sanity queries
```

### Build Gate Verification

```bash
# Full build
npm run build
# Must complete without errors

# Full test suite
npx playwright test tests/performance/ tests/regression/
# Expected: 100% pass rate

# TTFB measurement (manual)
curl -s -o /dev/null -w "TTFB: %{time_starttransfer}s\n" https://sanglogium.com/
# Expected: <600ms (may vary by network, verify in production)
```

---

## 6. Anti-Patterns

**DO NOT:**
- Modify individual fetcher files (they stay as fallback/reference)
- Change component props interfaces
- Add new fields to data shapes
- Remove null-checking that's in place for graceful degradation
- Modify `revalidate` export from page.tsx
- Touch anything in `globals.css` or design system
- Optimize images (that's S10)
- Touch Clerk/auth (that's S11/S12)

**DO:**
- Keep exact data structures
- Add comprehensive error handling
- Test with real Sanity data
- Verify in production environment
- Document actual TTFB before/after

---

## 7. Reference: Data Structures to Maintain

```typescript
// Hero data structure (from *[_type == "hero"])
interface HeroData {
  headline: string;
  subheadline: string;
  ctaText: string;
  backgroundImage: {
    asset: {
      _id: string;
      url: string;
      metadata: { dimensions: {...}, lqip: string };
    };
    hotspot?: {...};
    crop?: {...};
    alt?: string;
  };
  mobileBackgroundImage: {...same as backgroundImage...};
}

// HomepageData structure (from *[_type == "homepageData"])
interface HomepageData {
  hero: HeroData | null;
  featured: Array<{
    _id: string;
    name: string;
    brand: string;
    displayPrice: number;
    productPromo: string;
    image: { asset: { url: string }; alt?: string };
  }>;
  spotlight1: SpotlightData | null;
  spotlight2: SpotlightData | null;
  spotlight3: SpotlightData | null;
  iemsGallery: Array<{
    _id: string;
    name: string;
    brand: string;
    displayPrice: number;
    slug: string;
    imageUrl: string;
    image: { asset: { url: string } };
  }>;
  newestRelease: {
    promoTitle: string;
    promoSubtitle: string;
    promoText: string;
    productRef: ProductWithGallery;
  } | null;
  dacs: Array<Product>;
  accessories: {
    cables: Array<Product>;
    earpads: Array<Product>;
  };
}
```

---

## 8. Post-Sprint Merge Request

After all contracts pass verification:

1. Run final test suite: `npx playwright test tests/performance/ tests/regression/`
2. Verify build: `npm run build`
3. Commit message: `perf(S9): Batch homepage queries, TTFB 10.9s→<600ms`
4. Create PR description:
   ```
   ## S9: TTFB Optimization
   
   **Impact:** Reduces homepage API calls from 10 → 2, TTFB from 10.9s → <600ms
   
   **Changes:**
   - Unified batched GROQ query for all homepage sections
   - DataLoader deduplication with React.cache()
   - Zero breaking changes to component interfaces
   
   **Verification:**
   - All regression tests pass
   - API efficiency: ≤3 requests (was ~10)
   - Build succeeds
   
   **Next:** S10 (LCP optimization)
   ```
5. Request review and merge to `main`

---

**END OF SPRINT SPECIFICATION**
