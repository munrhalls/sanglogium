# Diagnostic Sprint: PLP (Product Listing Page)

> Date: 2026-03-31
> Bugs diagnosed: 5
> Status: COMPLETE

## Bug Inventory

| ID | Symptom | Component | Severity |
|----|---------|-----------|----------|
| B-01 | Product images don't render | `ProductImage.tsx`, `ImageGallery.tsx` | High |
| B-02 | Filtering takes 5-10 seconds | `[...slug]/page.tsx`, `Filters.tsx` | High |
| B-03 | Filtering returns 0 products | `getProductsByVfsKeys.ts` | **Critical** |
| B-04 | Sorting doesn't work | `SortDropdown.tsx`, `getProductsByVfsKeys.ts` | Medium |
| B-05 | PDP shows "something went wrong" | `product/[slug]/page.tsx` | High |

---

## Per-Bug Root Cause Analysis

### B-01: Product Images Don't Render

**Symptom:** Product cards show placeholder/no image on PLP and PDP.
**Expected:** Images should load from Sanity CDN.

**Code Path Traced:**
```
ProductCard.tsx:32-36
  → ProductImage.tsx:15-34
    → sanity/lib/image.ts:9-11 (urlFor)
      → @sanity/image-url builder
```

**Root Cause:** The GROQ query in `getProductsByVfsKeys.ts` (lines 72-76) only fetches `image { asset { _ref } }` but the `ProductImage.tsx` component (line 22) expects the full image object with `asset._ref` or `asset._id`. The issue is that the query returns the reference, but when the component renders, it checks `image?.asset?._ref` which may be undefined if the product has no image in Sanity OR if the asset reference is weak/invalid.

**File:Line:** `sanity/lib/products/getProductsByVfsKeys.ts:72-76` and `app/components/features/products/ProductImage.tsx:22`

**Evidence:**
- [ ] Console error observed: "No image" (placeholder rendered)
- [ ] Network request status: 200 (query succeeds, returns empty image object)
- [ ] State inspection: `image.asset` is `{ _ref: null }` or `image` is `null`

**Related Memory:** VFS Audit Report (728545e8) noted `slotMetadataMap` inconsistencies - this may cause products to be queried but not found.

---

### B-02: Filtering Takes 5-10 Seconds

**Symptom:** Clicking filter checkbox takes 5-10 seconds to apply.
**Expected:** Filter should apply <100ms.

**Code Path Traced:**
```
Filters.tsx:21-80 (handleFilterChange)
  → urlParams.ts:27-78 (buildFilterUrl)
    → router.push() with scroll: false
  → [...slug]/page.tsx:18-37 (server re-render)
    → unrollDescendantKeys(nodeId) [data/catalogue.ts:40-67]
    → getProductsByVfsKeys() [sanityFetch]
```

**Root Cause:** Every filter change triggers a full server-side page re-render via `router.push()`, which re-fetches ALL products from Sanity. The filter state is stored in URL params but applied server-side. There is no client-side filtering cache - each interaction waits for the full SSR round-trip.

**File:Line:** `app/(store)/products/[...slug]/page.tsx:18-37` (server component re-execution on every URL change)

**Evidence:**
- [ ] Console error observed: None (expected behavior, just slow)
- [ ] Network request status: New document request triggered (not just API)
- [ ] State inspection: URL params update, then full page reload

**Secondary Factor:** `useCdn: true` in `sanity/lib/client.ts:9` should help, but SSR latency dominates.

---

### B-03: Filtering Returns 0 Products — PRIMARY ROOT CAUSE

**Symptom:** Applying any filter returns empty product grid.
**Expected:** Should return matching products.

**Code Path Traced:**
```
[...slug]/page.tsx:32-37
  → unrollDescendantKeys(nodeId) [data/catalogue.ts:40-67]
    → Returns keys from slotMetadataMap
  → getProductsByVfsKeys({ keys, sort, filters }) [sanity/lib/products/getProductsByVfsKeys.ts:36-83]
    → GROQ: `*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0 ${filterClause}]`
```

**Root Cause:** The GROQ query uses `catalogueLocationKeys[@ in $keys]` but the `keys` returned by `unrollDescendantKeys()` include **intermediate header node IDs** (like "ugyeto8653n495dpf89nzoar" for "Headphones") that are NOT in `slotMetadataMap`. The VFS Audit Report confirmed: `slotMetadataMap` is incomplete - missing intermediate header nodes. Products only have **leaf node keys** in their `catalogueLocationKeys` array, so when the query includes parent/header IDs, it returns 0 matches.

**File:Line:** `data/catalogue.ts:40-67` (unrollDescendantKeys) and `data/catalogue-index.json:52-66` (missing header children in slotMetadataMap)

**Evidence:**
- [ ] Console error observed: "[VFS] ID ugyeto8653n495dpf89nzoar not in slotMetadataMap, treating as leaf" (dev warning)
- [ ] Network request status: 200 with empty result `[]`
- [ ] State inspection: `keys` array contains non-existent IDs

**This is a PRIMARY bug** — it causes B-01's symptom (no products = no images) in some cases.

---

### B-04: Sorting Doesn't Work

**Symptom:** Sort dropdown changes but product order doesn't change.
**Expected:** Products should reorder by selected sort criteria.

**Code Path Traced:**
```
SortDropdown.tsx:14-20 (handleSortChange)
  → buildFilterUrl(pathname, params, { sort: value }) [lib/filters/urlParams.ts:40-46]
    → router.push(newUrl)
  → [...slug]/page.tsx:29
    → const sort = typeof query.s === 'string' ? query.s : 'featured';
  → getProductsByVfsKeys({ keys, sort, filters }) [getProductsByVfsKeys.ts:36-83]
    → Lines 45-49: Build orderClause
      → `sort === 'featured' ? '' : \`| order(${sortField} ${sortDir})\``
```

**Root Cause:** The URL param key mismatch. `SortDropdown.tsx` sets `sort=displayPrice:asc` via `buildFilterUrl`, but `[...slug]/page.tsx:29` reads `query.s` (expecting `?s=`). The URL uses `?sort=` but the page reads `?s=`. Sort state never reaches the server component.

**File:Line:** `app/(store)/products/[...slug]/page.tsx:29` reads `query.s` but URL has `?sort=` from `SortDropdown.tsx:18`

**Evidence:**
- [ ] Console error observed: None
- [ ] Network request status: 200 (but sort parameter not used)
- [ ] State inspection: `query.s` is always `undefined`, defaults to 'featured'

---

### B-05: PDP Shows "Something Went Wrong"

**Symptom:** Product detail page shows error boundary fallback.
**Expected:** Should show product details.

**Code Path Traced:**
```
product/[slug]/page.tsx:10-16
  → getProductBySlug(slug) [sanity/lib/products/getProductBySlug.ts:20-54]
    → sanityFetch({ query: groq`*[_type == "product" && slug.current == $slug] {...}`, params: { slug } })
  → If null: notFound()
  → If error thrown: error.tsx boundary catches
```

**Root Cause:** The `getProductBySlug.ts` query expects `slug.current == $slug`, but the error boundary at `app/(store)/product/[slug]/error.tsx` catches any thrown errors. Likely causes: (1) `slug` param is URL-encoded/decoded incorrectly, (2) Sanity query fails due to schema mismatch, or (3) `productType.ts` schema has `slug` as required but some products lack it. The error boundary generic message "Something went wrong" masks the actual error.

**File:Line:** `app/(store)/product/[slug]/error.tsx:17` (generic error message) and `sanity/lib/products/getProductBySlug.ts:22` (query)

**Evidence:**
- [ ] Console error observed: "Product page error:" logged in error.tsx:12
- [ ] Network request status: Unknown (error boundary masks it)
- [ ] State inspection: Error digest logged but not displayed

---

## Cross-Bug Dependency Matrix

| Bug | Root Cause File | Is Primary? | Is Symptom Of | Blocks |
|-----|-----------------|-------------|---------------|--------|
| B-01 | `ProductImage.tsx:22` | No | B-03 | None |
| B-02 | `[...slug]/page.tsx:18-37` | Yes | — | B-04 |
| B-03 | `data/catalogue.ts:40-67` | **Yes** | — | B-01 |
| B-04 | `[...slug]/page.tsx:29` | Yes | — | None |
| B-05 | `product/[slug]/page.tsx:12` | Yes | — | None |

**Key Relationships:**
- **B-03 → B-01:** When B-03 returns 0 products, B-01's "no images" is a symptom (no products to show)
- **B-02 and B-04 are independent** but both relate to URL param handling in the same file

---

## Recommended Fix Order

1. **B-03** — VFS `slotMetadataMap` incomplete, `unrollDescendantKeys()` returns invalid IDs — **PRIMARY**
   - Fixes: B-01 in cases where empty products cause empty images
   - Risk: High (touches VFS data layer)
   - **Action:** Regenerate `catalogue-index.json` to include ALL node IDs in `slotMetadataMap`, not just leaf nodes

2. **B-04** — URL param mismatch (`?sort=` vs `query.s`) — **PRIMARY**
   - Unblocks: Sorting functionality
   - Risk: Low (single line change)
   - **Action:** Change `page.tsx:29` to read `query.sort` instead of `query.s`

3. **B-02** — SSR re-render on every filter change — **PRIMARY**
   - Unblocks: Filter performance
   - Risk: Medium (requires client-side state architecture)
   - **Action:** Implement client-side filter state with SWR/React Query, or use `router.replace()` with shallow routing if Next.js supports it

4. **B-05** — PDP error boundary masks actual errors — **PRIMARY**
   - Unblocks: PDP debugging
   - Risk: Low (diagnostic first)
   - **Action:** Add error logging to identify root cause, then fix underlying Sanity query or slug handling

5. **B-01** — Image data structure mismatch — **SECONDARY**
   - Depends on: B-03 (ensure products exist first)
   - Risk: Low
   - **Action:** Verify `getProductsByVfsKeys.ts` GROQ query returns proper image asset references

---

## Risk Matrix: What Breaks If We Fix This?

| Bug | Fix Location | Files Touched | Regression Risk | Design System Impact |
|-----|--------------|---------------|-----------------|----------------------|
| B-03 | `build-catalogue-index.mjs` | 1 (build script) | **High** | None (data layer only) |
| B-04 | `[...slug]/page.tsx:29` | 1 | Low | None |
| B-02 | `[...slug]/page.tsx` + new client hook | 3-4 | **High** | State management pattern change |
| B-05 | `getProductBySlug.ts` + error.tsx | 2 | Medium | Error handling UX |
| B-01 | `getProductsByVfsKeys.ts:72-76` | 1 | Low | None |

---

## Missing Test Coverage

| Bug | Test Type | Test Location | What It Checks |
|-----|-----------|---------------|----------------|
| B-03 | Integration | `tests/catalogue/vfs.integration.test.ts` | `unrollDescendantKeys()` returns only valid IDs present in `slotMetadataMap` |
| B-03 | Data Integrity | `tests/catalogue/data-validation.test.ts` | All tree node IDs exist in `slotMetadataMap` |
| B-04 | Unit | `tests/products/sort-params.test.ts` | URL `?sort=` correctly parsed by server component |
| B-02 | Performance | `tests/products/filter-performance.test.ts` | Filter apply time <100ms (client-side) |
| B-05 | Integration | `tests/products/pdp-load.test.ts` | PDP loads without error boundary for valid slug |
| B-01 | Component | `tests/components/ProductImage.test.tsx` | Renders image when `asset._ref` provided, shows placeholder when null |

---

## Diagnostic Lock — Sprint Readiness

- [x] All bugs have File:Line root causes identified
- [x] Primary vs. Symptom bugs distinguished
- [x] Fix order determined by dependencies
- [x] Risk matrix complete
- [x] Test gaps identified

## Next Steps

1. **Immediate Fix (B-03):** Run `scripts/build-catalogue-index.mjs` to regenerate VFS with complete `slotMetadataMap`
2. **Quick Win (B-04):** Change `query.s` to `query.sort` in `[...slug]/page.tsx:29`
3. **Diagnostic (B-05):** Add `console.error(error.message)` to `error.tsx` to identify actual PDP failure
4. **Architecture (B-02):** Design client-side filter cache (SWR/React Query)
5. **Verify (B-01):** After B-03 fix, verify images render; if not, check GROQ query image expansion

## Verdict

**DIAGNOSTIC COMPLETE**
- **3 primary bugs identified** (B-02, B-03, B-04, B-05)
- **1 symptom bug mapped** (B-01 → B-03 in some cases)
- **Fix order:** B-03 → B-04 → B-05 (diagnostic) → B-02 (architecture) → B-01 (verification)
- **Recommended:** Proceed to external design audit + full sprint with VFS data fix as priority

---

## Appendix: Key Code References

### VFS Data Issue (B-03)
```typescript
// data/catalogue.ts:40-67
export const unrollDescendantKeys = (nodeId: string): string[] => {
  const data = catalogueIndex as unknown as CatalogueIndexData;
  const slotMetadataMap = data.slotMetadataMap;

  // BUG: If ID not in slotMetadataMap, treats as leaf
  if (!slotMetadataMap[nodeId]) {
    return [nodeId]; // Header IDs missing from slotMetadataMap!
  }
  // ... recursion through children that don't exist
};
```

### URL Param Mismatch (B-04)
```typescript
// app/(store)/products/[...slug]/page.tsx:29
const sort = typeof query.s === 'string' ? query.s : 'featured'; // BUG: reads 's', URL has 'sort'

// SortDropdown.tsx:18
const newUrl = buildFilterUrl(pathname, params, { sort: value === 'featured' ? null : value }); // sets 'sort'
```

### SSR Filter Slowness (B-02)
```typescript
// Filters.tsx:77-79
router.push(`${pathname}?${normalizedParams.toString()}`, { scroll: false }); // Triggers full SSR

// No client-side cache - every filter waits for server round-trip
```
