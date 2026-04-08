# Research: Product Discovery Data Architecture

**Research Scope Contract**
- **Topic:** Data format, VFS (Virtual File System), and data pass layer for product discovery UI in Next.js 15 + Sanity v3 e-commerce
- **First Principles:**
  1. Server-first data fetching minimizes client bundle size and TTI
  2. Parallel data fetching prevents waterfall requests
  3. Pre-computed indices enable O(1) category lookups
- **Fundamentals:**
  - Next.js 15 Server Components + parallel Promise.all fetching
  - Sanity GROQ performance optimization (stacked filters, no reference joins)
  - React.cache for request-level deduplication
  - Virtual File System for category tree resolution
- **Scope Boundary:** OUT: Client state management patterns, payment flow, checkout architecture
- **Target Audience:** Sprint planning for product discovery improvements
- **Decay Risk:** Medium (Next.js 15 stable, Sanity v3 stable, patterns evolving slowly)

**Date:** 2026-04-01
**Sources Verified:** Next.js docs (canonical), Sanity docs (canonical), NextFaster GitHub (reference implementation)

---

## First Principles Analysis

### Core Problem Being Solved
Product discovery requires efficiently mapping URL slugs → category hierarchies → product sets with filtering/sorting, while maintaining SEO-friendly URLs and fast page loads.

### Underlying Constraints
1. **HTTP is stateless** — Each request must resolve category context independently
2. **Network latency is unavoidable** — Minimize round trips via parallel fetching
3. **JavaScript bundle size matters** — Keep data transformation logic server-side
4. **CMS query performance varies** — GROQ queries must be optimized for production datasets

### Inherent Tradeoffs

| Approach | Wins | Loses | When to Use |
|----------|------|-------|-------------|
| Server-side filtering | SEO-friendly URLs, smaller client bundles | Page reload on filter change | E-commerce (current implementation) |
| Client-side filtering | Instant UX, no page reload | Larger initial payload, hydration cost | Small datasets (<100 items) |
| Hybrid (current) | Balance of both | Complexity of two code paths | Medium datasets (100-1000 items) |
| Cursor pagination | Consistent results under load | No direct "page 5" links | Large datasets (>1000 items) |
| Offset pagination | Simple page links | Skipping is slow at scale | Small/medium datasets |

### Failure Modes
1. **Sequential data fetching** — Page blocked waiting for multiple serial requests
2. **Unoptimized GROQ** — Reference joins in filters, over-fetching asset metadata
3. **Missing deduplication** — Same data fetched multiple times in single request
4. **Client-side filtering of large sets** — Browser freeze on 500+ items

---

## Code Fundamentals

### Fundamental: Parallel Data Fetching with Promise.all

**Claim:** Next.js 15 Server Components should initiate parallel requests to prevent waterfalls.

**Verification:**
- ✅ Confirmed in Next.js docs: "Start multiple requests by calling fetch, then await them with Promise.all"
- ✅ Located in our codebase: `@/app/(store)/products/[...slug]/page.tsx:35-42`

```typescript
// Correct implementation in codebase
const [products, metadata] = await Promise.all([
  getProductsByVfsKeys({ keys: descendantKeys, sort, filters }),
  getCategoryMetadata(nodeId)
]);
```

**Actual Behavior:** Requests begin immediately when functions are called (not when awaited). Promise.all only blocks until all complete.

**Edge Cases:**
- One failure fails all (use Promise.allSettled for graceful degradation)
- Memory pressure from concurrent large result sets

### Fundamental: React.cache for Request Deduplication

**Claim:** React.cache deduplicates identical data requests within a single render pass.

**Verification:**
- ✅ Confirmed in Next.js docs: "React.cache is scoped to the current request only"
- ✅ Located in our codebase: `@/sanity/lib/products/getProductsByVfsKeys.ts:7-13`

```typescript
// Implementation with cache fallback for test environments
const withCache = <T extends (...args: any[]) => any>(fn: T): T => {
  try {
    return cache(fn);
  } catch {
    return fn;
  }
};
```

**Actual Behavior:** Multiple calls to `getProductsByVfsKeys` with same arguments return cached result.

**Edge Cases:**
- Test environments may not have React cache (handled by try/catch)
- Each request gets independent cache scope

### Fundamental: VFS (Virtual File System) for Category Resolution

**Claim:** Pre-computed category index enables O(1) slug→ID and O(n) subtree resolution.

**Verification:**
- ✅ Confirmed in codebase: `@/data/catalogue.ts:35-67`
- ✅ Build script generates index: `@/scripts/build-catalogue-index.mjs`

**VFS Structure:**
```typescript
{
  slugToIdMap: { "open-back": "o7c6baiuobsr7ni2y2vf22sh", ... },  // O(1) lookup
  slotMetadataMap: {                                               // O(1) metadata
    "o7c6baiuobsr7ni2y2vf22sh": {
      title: "Open-Back",
      children: [],
      breadcrumbs: [...],
      ...
    }
  },
  tree: [...] // For navigation rendering
}
```

**Unroll Algorithm (DFS):**
```typescript
export const unrollDescendantKeys = (nodeId: string): string[] => {
  const result = new Set<string>();
  const stack = [nodeId];

  while (stack.length > 0) {
    const currentId = stack.pop()!;
    if (result.has(currentId)) continue;
    result.add(currentId);
    const children = slotMetadataMap[currentId]?.children || [];
    stack.push(...children);
  }

  return Array.from(result);  // All descendant IDs + self
};
```

**Actual Behavior:**
- Slug resolution: O(1) via direct map lookup
- Subtree unrolling: O(n) where n = nodes in subtree
- GROQ query uses `@ in $keys` for O(1) per product check

### Fundamental: GROQ Performance Optimization

**Claim:** Stacked filters, no reference joins, minimal projections = fast queries.

**Verification:**
- ✅ Confirmed in Sanity docs: "Reduce search space by 'stacking' filters"
- ✅ Confirmed: "Avoid joins in filters" — expensive operation
- ✅ Current codebase: `@/sanity/lib/products/getProductsByVfsKeys.ts:64-84`

**Current GROQ Pattern:**
```groq
*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0 && brand == "value"]
| order(displayPrice desc) {
  _id,
  name,
  brand { _id, name },  // ⚠️ Reference resolution (acceptable here)
  displayPrice,
  image { asset { _ref } },  // ✅ Only _ref, not full asset resolution
  slug { current },
  catalogueLocationKeys
}
```

**Performance Characteristics:**
- `_type == "product"` — Fast indexed filter
- `catalogueLocationKeys[@ in $keys]` — Array containment check
- No slicing `[0..20]` — Returns all matches (client handles display)
- Image asset returns only `_ref` — URL constructed client-side via `@sanity/image-url`

---

## Best Practices (Verified)

### Practice: Server-First Data Fetching
**Consensus:** High — Next.js team, Vercel, Sanity all recommend

**Supporting Evidence:**
- Next.js docs: "Fetching data on the server... reduces client bundle size"
- NextFaster: "All mutations done via Server Actions" + PPR for shells

**Verdict:** ✅ Recommended — Current codebase follows this correctly.

**When to Use:** Always for e-commerce product listings.
**When to Skip:** Never for primary product data.

### Practice: React.cache for Data Functions
**Consensus:** High — React 18+ canonical pattern

**Supporting Evidence:**
- Next.js docs: "Since getUser is wrapped with React.cache, multiple calls... return same memoized result"
- React docs: cache() prevents "request waterfalls within a single render pass"

**Verdict:** ✅ Recommended — Current codebase implements correctly with test fallback.

**When to Use:** All data fetching functions that may be called multiple times.
**When to Skip:** Functions with side effects or time-sensitive data.

### Practice: Pre-Computed Category Index (VFS)
**Consensus:** Medium — Pattern emerging in headless commerce

**Supporting Evidence:**
- Shopify Hydrogen: "Collections pre-computed at build time"
- Current codebase build script: `@/scripts/build-catalogue-index.mjs`

**Verdict:** ✅ Recommended for this use case — Sanity categories change infrequently.

**Benefits:**
- O(1) slug resolution at runtime
- No CMS round-trip for category tree
- Breadcrumbs pre-computed
- Works offline/edge-cached

**When to Use:** Category trees that change < daily, need fast resolution.
**When to Skip:** Highly dynamic categories (user-generated).

### Practice: String Array for Category Placement (catalogueLocationKeys)
**Consensus:** Context-dependent

**Supporting Evidence:**
- Sanity docs: "Denormalizing a data model is often considered a negative, but... can significantly improve query performance"
- Current schema: `@/sanity/schemaTypes/productType.ts:102-110`

**Tradeoff Analysis:**
- ✅ Fast GROQ query: `count(catalogueLocationKeys[@ in $keys]) > 0`
- ✅ Simple mental model
- ❌ No referential integrity (orphaned keys possible)
- ❌ No automatic cleanup on category delete

**Verdict:** ⚠️ Context-Dependent — Good for read-heavy e-commerce, requires build-time validation.

### Practice: Brand as String (Not Reference)
**Consensus:** Low — Anti-pattern per schema comments

**Counter-Evidence:**
- Schema TODO: "If you type 'Sony' on one product and 'Sony Inc.' on another, your filtering breaks"
- Professional standard: Use reference documents for filterable attributes

**Verdict:** ❌ Avoid — Current implementation has known data consistency risk.

**Fix:** Create `brand` document type, reference from product.

### Practice: Hybrid Client/Server Filtering
**Consensus:** Medium — Pragmatic for medium datasets

**Supporting Evidence:**
- Reddit r/nextjs consensus: "Use URL state for filters in RSC" (thread: 1iumha6)
- Current implementation: Server GROQ + client refinement

**Current Architecture:**
```
Server: Initial filter via GROQ (brand, complex specs)
Client: Secondary filter (brand name match), sort, pagination display
```

**Verdict:** ⚠️ Context-Dependent — Works for <1000 products per category.

**Scaling Limit:** When categories exceed ~500 products, full server-side with cursor pagination is needed.

### Practice: Asset _ref Only (Not Resolved URL)
**Consensus:** High — Sanity best practice

**Supporting Evidence:**
- Sanity docs: "The _id assigned to an image... contains a lot of data... You can dynamically create a URL"
- Current codebase: Returns `image { asset { _ref } }` — correct

**Verdict:** ✅ Recommended — Current implementation follows best practice.

---

## Common Solutions Landscape

### Solution: VFS (Virtual File System) Pattern
**Prevalence:** Niche — Emerging in Sanity e-commerce community

**Pros:**
- O(1) category resolution
- No runtime CMS dependency for navigation
- Pre-computed breadcrumbs
- Build-time validation possible

**Cons:**
- Requires rebuild on category change
- Additional build script complexity
- Static data can grow large

**Real-World Pain Points:**
- Build script bugs (historical issue in this codebase: missing IDs in slotMetadataMap)
- Category moves require full rebuild
- Orphaned product keys if not validated

**Recommendation:** Use for stable category hierarchies with < daily changes.

### Solution: Cursor-Based Pagination
**Prevalence:** Common in large-scale e-commerce

**Pros:**
- Consistent results under concurrent modifications
- Efficient (no skipping)
- Works with real-time updates

**Cons:**
- No direct "page 5" links
- Requires unique sort field
- More complex UI state

**Sanity Implementation:**
```groq
*[_type == "product" && _id > $lastId] | order(_id)[0..20]
```

**Current Codebase:** Uses unbounded queries with client display slicing — acceptable for current dataset size (~50-100 products per category).

**Recommendation:** Migrate to cursor pagination when categories exceed 200+ products.

### Solution: Promise.all Parallel Fetching
**Prevalence:** Ubiquitous in Next.js 15

**Pros:**
- Reduces TTFB
- Simple to implement
- Framework-supported

**Cons:**
- All-or-nothing failure (without allSettled)
- Memory pressure with large concurrent requests

**Current Codebase:** ✅ Correctly implemented at `@/app/(store)/products/[...slug]/page.tsx:35-42`

### Solution: Server Actions for Mutations
**Prevalence:** Standard in Next.js 15 (NextFaster pattern)

**Current Codebase:** Uses for filter/sortable fetching (`@/app/actions/categories.ts`), but not for cart/checkout.

**Verdict:** ✅ Pattern correctly applied where used.

---

## Verification & Falsification Log

### Claims Verified
| Claim | Evidence | Method |
|-------|----------|--------|
| Parallel fetching reduces TTFB | Next.js docs, section 41 | Official documentation |
| React.cache deduplicates requests | Next.js docs, section 42 | Official documentation |
| GROQ stacked filters improve performance | Sanity docs, section 9 | Official documentation |
| Asset _ref sufficient for image URLs | Sanity docs, section 10 | Official documentation |
| VFS O(1) lookup works | Code test: `@/tests/integration/catalogue/vfs.test.ts:82-102` | Test verification |
| unrollDescendantKeys returns all subtree IDs | Code test: `@/tests/integration/catalogue/vfs.test.ts:104-115` | Test verification |

### Falsification Attempts
| Claim | Counter-Evidence | Verdict |
|-------|------------------|---------|
| String brand field is acceptable | Schema comment: "If you type 'Sony' and 'Sony Inc.' filtering breaks" | ❌ Abandoned — Should be reference |
| Client-side filtering scales | Reddit threads report browser freeze at 500+ items | ⚠️ Modified — Add server-side limits |
| Pre-computed VFS always current | Historical bug: missing IDs in slotMetadataMap | ✅ Survived — Added validation |

### Knowledge Decay Assessment
| Section | Risk | Review Date |
|---------|------|-------------|
| React.cache API | Low (stable since React 18) | 2027-04 |
| Next.js Server Components | Low (core architecture) | 2027-04 |
| Sanity GROQ patterns | Low (stable query language) | 2027-04 |
| VFS pattern | Medium (emerging) | 2026-07 |

---

## Synthesis: Actionable Takeaways

### For Our Project

| Decision | Rationale | Implementation |
|----------|-----------|----------------|
| Keep VFS pattern | O(1) lookup, pre-computed breadcrumbs, build-time validation | Maintain `@/scripts/build-catalogue-index.mjs` |
| Add brand reference type | Data consistency, filtering reliability | Create `@/sanity/schemaTypes/brandType.ts`, migrate products |
| Add cursor pagination | Scale preparation, consistent results | Add `_id > $cursor` to GROQ, implement Load More |
| Keep hybrid filtering | Current dataset size appropriate | Add server-side limit (max 200) as guardrail |
| Maintain parallel fetching | Proven TTFB reduction | Continue `Promise.all([products, metadata])` pattern |

### Immediate Actions

1. **Fix Brand Schema** — Convert from string to reference type
   - Create brand document type
   - Migration script for existing products
   - Update GROQ to resolve brand reference

2. **Add Pagination Guardrails** — Prevent unbounded queries
   - Add `limit(200)` to GROQ as safety
   - Implement cursor-based for large categories
   - Monitor query performance in Sanity logs

3. **VFS Validation** — Ensure data integrity
   - Build script validates all product keys exist
   - Add orphaned key detection
   - Fail build on validation errors

### Open Questions

1. **Filter Source of Truth** — Should filters come from:
   - CMS (current: hardcoded mock)
   - Product data (dynamically extracted)
   - Config file (middle ground)

2. **Real-time Updates** — How to handle:
   - New products (ISR revalidation?)
   - Stock changes (live query?)
   - Price updates (cache invalidation?)

3. **Scaling Thresholds** — At what size:
   - Switch to cursor pagination?
   - Add search index (Algolia/Typesense)?
   - Implement facet counting?

---

## Appendix: Data Flow Diagram

```
URL: /shop/headphones/open-back
  │
  ▼
┌─────────────────────────────────────┐
│ Server Component: CategoryPage      │
│ @/app/(store)/products/[...slug]/   │
│ page.tsx                            │
└─────────────────────────────────────┘
  │
  ├──► resolveSlugToId("open-back")   ──► O(1) lookup in slugToIdMap
  │                                          returns: "o7c6bai..."
  │
  ├──► unrollDescendantKeys(id)       ──► DFS traversal of slotMetadataMap
  │                                          returns: ["o7c6bai..."] (leaf)
  │
  ├──► Promise.all([
  │      getProductsByVfsKeys(keys),   ──► GROQ query with @ in $keys
  │      getCategoryMetadata(id)      ──► Category name/description
  │    ])
  │
  ▼
┌─────────────────────────────────────┐
│ Props passed to CategoryPageClient  │
│ - products[] (filtered by server) │
│ - filters[] (mock config)           │
│ - categoryName                      │
└─────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────┐
│ Client Component: CategoryPageClient│
│ @/app/(store)/products/[...slug]/   │
│ CategoryPageClient.tsx              │
└─────────────────────────────────────┘
  │
  ├──► URL param parsing (searchParams)
  │
  ├──► Client-side filter refinement
  │
  ├──► Client-side sorting
  │
  ▼
┌─────────────────────────────────────┐
│ Render: ProductGrid, SortDropdown, │
│ FilterSidebar, ActiveFilters      │
└─────────────────────────────────────┘
```

## Appendix: GROQ Query Performance Checklist

| Check | Current Status | Priority |
|-------|---------------|----------|
| Stack _type filter first | ✅ `_type == "product"` | Critical |
| Avoid reference joins in WHERE | ✅ Brand is string (though should be ref) | Critical |
| Return minimal fields | ✅ No `...`, explicit fields | High |
| Asset _ref only | ✅ `image { asset { _ref } }` | High |
| No slicing in query | ⚠️ Unbounded (needs limit) | Medium |
| Use params not interpolation | ✅ `$keys` param | Critical |
| Order on indexed field | ⚠️ `displayPrice` not indexed | Low |

---

**End of Research Document**
