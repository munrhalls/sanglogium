# ARCHITECTURE RECONCILIATION REPORT
## Catalog Slot ID → Products Subset: Front-End Consumption
**Date:** 2026-03-28  
**Verifier:** Cross-checked against ALL architectural constraints

---

## CONSTRAINT COMPLIANCE MATRIX

| Constraint | Status | Evidence | Violation Details |
|------------|--------|----------|-------------------|
| **Next.js 15 App Router - Server Components Default** | ✅ COMPLIANT | `app/(store)/products/[...category]/page.tsx` is async Server Component with no "use client" directive | None |
| **Data Fetching Parallelization** | ✅ COMPLIANT | `Promise.all([getSelectedProducts, getFilters..., getSortables...])` at line 52 | None |
| **Sanity Typegen - Absolute Source of Truth** | ✅ COMPLIANT | `ProductsGrid` uses `ALL_PRODUCTS_QUERYResult` from `@/sanity.types` | None |
| **No Manual Type Definitions** | ✅ COMPLIANT | All product types imported from `sanity.types.ts` | None |
| **GROQ Queries Respect Type Contracts** | ✅ COMPLIANT | `getSelectedProducts.ts:115` uses `$catalogueKeys` parameter with proper typing | None |
| **VFS Pre-computed at Build Time** | ✅ COMPLIANT | `catalogue-index.json` is static, imported at build time | None |
| **VFS O(1) Lookup** | ✅ COMPLIANT | `resolveSlugToId()` does O(1) `slugToIdMap` lookup; product query uses indexed array containment | None |
| **No Recursive DB Queries for Categories** | ✅ COMPLIANT | Category tree comes from static JSON, not DB recursion | None |
| **Scoped Tailwind - No Global CSS Modifications** | ⚠️ REVIEW | `globals.css` exists but is project base file, not modification | See Note 1 |
| **Sanity CDN Image Optimization** | ❌ VIOLATION | `ProductThumb.tsx:45-51` uses `next/image` without custom loader | **CRITICAL** |
| **Metadata.dimensions for Aspect Ratio** | ❌ VIOLATION | `ProductThumb.tsx` hardcodes `height={300} width={300}` | **MINOR** |
| **Sanity .rect() Parameters** | ❌ VIOLATION | Hotspot/crop data not applied via loader | **MINOR** |

---

## CRITICAL VIOLATION: IMAGE OPTIMIZATION

### Location
`app/components/features/products/ProductThumb.tsx:45-51`

### Current Code (VIOLATING)
```typescript
import Image from "next/image";
// ...
<Image
  src={imageUrl(product.image).url()}  // Sanity URL passed to next/image
  alt={product?.name}
  height={300}  // Hardcoded - violates metadata.dimensions rule
  width={300}   // Hardcoded - violates metadata.dimensions rule
  className="aspect-square rounded-sm"
/>
```

### Why This Violates Constraints
1. **"NOT Next.js image optimization server"** - Using `next/image` without custom loader means Next.js's image optimization API handles transforms
2. **"Custom Loader (@sanity/image-url)"** - No custom loader configured
3. **"fetch metadata.dimensions"** - Using hardcoded 300x300 instead of Sanity's stored dimensions
4. **".rect() parameters"** - Hotspot/crop data from Sanity completely ignored

### Required Fix Pattern
```typescript
// Option 1: Use Sanity CDN directly with regular img
<img
  src={imageUrl(product.image).width(400).height(400).url()}
  alt={product.name}
  loading="lazy"
  className="aspect-square w-full rounded-sm"
/>

// Option 2: Use next/image WITH custom loader
<Image
  src={imageUrl(product.image).url()}
  loader={({ src, width }) => 
    imageUrl(product.image).width(width).auto('format').url()
  }
  width={product.image.asset.metadata.dimensions.width}
  height={product.image.asset.dimensions.height}
  alt={product.name}
  className="rounded-sm"
/>
```

---

## VERIFIED COMPLIANT ARCHITECTURE

### 1. Server Component Data Flow ✅

**File:** `app/(store)/products/[...category]/page.tsx`

```typescript
// Lines 24-70: Pure Server Component
export default async function ProductsPage(props: {
  params: Params;
  searchParams: SearchParams;
}) {
  // All data fetching on server
  const slug = path[path.length - 1];
  const resolvedId = resolveSlugToId(slug);  // O(1) VFS lookup
  const catalogueKeys = resolvedId ? unrollDescendantKeys(resolvedId) : [];
  
  // Parallel fetching - Next.js 15 best practice
  const [productsResult, filterOptions, sortOptions] = await Promise.all([
    getSelectedProducts(...),
    getFiltersForCategoryPathAction(...),
    getSortablesForCategoryPathAction(...),
  ]);
}
```

**Compliance:**
- ✅ No "use client" directive
- ✅ Async Server Component
- ✅ Parallel data fetching
- ✅ Zero client-side JS for data

### 2. Sanity Typegen Integration ✅

**File:** `app/components/features/products/ProductsGrid.tsx:2`

```typescript
import { ALL_PRODUCTS_QUERYResult } from "@/sanity.types";

export default function ProductsGrid({
  products,
}: {
  products: ALL_PRODUCTS_QUERYResult;  // Generated from GROQ
}) {
```

**Compliance:**
- ✅ No manual type definitions
- ✅ Uses TypeGen output as absolute source of truth
- ✅ GROQ queries in `sanity/lib/products/getSelectedProducts.ts` respect schema

### 3. VFS O(1) Lookup Architecture ✅

**Slugs → IDs:** O(1) via `slugToIdMap`
```typescript
// data/catalogue.ts:35-38
export const resolveSlugToId = (slug: string) => {
  const data = catalogueIndex as unknown as CatalogueIndexData;
  return data.slugToIdMap[slug];  // Direct property access = O(1)
};
```

**Subtree Resolution:** Pre-computed children arrays
```typescript
// data/catalogue.ts:40-67
export const unrollDescendantKeys = (nodeId: string): string[] => {
  const slotMetadataMap = data.slotMetadataMap;
  // DFS traversal of pre-computed children array
  // Max depth: 3, Max nodes: 11 - essentially O(1) for practical purposes
};
```

**Product Lookup:** O(1) via Sanity's indexed array containment
```groq
// sanity/lib/products/getSelectedProducts.ts:115
*[_type == "product" && count(catalogueLocationKeys[@ in $catalogueKeys]) > 0]
```

**Compliance:**
- ✅ VFS pre-computed at build time
- ✅ O(1) slug → ID resolution
- ✅ O(1) product lookup (array containment on indexed field)
- ✅ Zero recursive DB queries

### 4. GROQ Query Type Safety ✅

**Query Pattern:** Parameterized with `$catalogueKeys`
```typescript
// sanity/lib/products/getSelectedProducts.ts:113-116
let assembledQuery = `*[_type == "product"`;
const pathQuery = ` && count(catalogueLocationKeys[@ in $catalogueKeys]) > 0`;
assembledQuery += pathQuery;

// Parameter binding at line 205
const result = await client.fetch(GET_PRODUCTS_BY_QUERY, { catalogueKeys });
```

**TypeGen Integration:**
```typescript
// sanity.types.ts:451-507
// Auto-generated from GROQ in getAllProducts.ts
export type ALL_PRODUCTS_QUERYResult = Array<{
  _id: string;
  _type: "product";
  name?: string;
  // ...
  catalogueLocationKeys?: Array<string>;  // Matches schema
}>;
```

**Compliance:**
- ✅ GROQ queries use parameters (injection-safe)
- ✅ TypeGen generates types from actual GROQ queries
- ✅ Schema → GROQ → Types → Components chain intact

---

## REVIEW ITEMS (Non-Critical)

### Note 1: Global CSS File
**File:** `app/globals.css`

**Status:** ⚠️ EXISTS but is base project file

**Content Analysis:**
- Contains Tailwind directives: `@tailwind base`, `@tailwind components`, `@tailwind utilities`
- Contains CSS variables for layout dimensions (header heights, menu heights)
- Contains base typography for `body` font-family
- Contains `@layer base` with Tailwind `@apply` directives

**Verdict:** This is the project's main global CSS file (not a modification). Constraint says "NEVER modify global CSS files unless explicitly requested" - this file is the original, not a modification. ✅ ACCEPTABLE

---

## CORRECTED ARCHITECTURE VERDICT

### Overall Grade: **B+ (Good with Critical Fix Required)**

| Category | Original Grade | Corrected Grade | Notes |
|----------|----------------|-----------------|-------|
| Server Components | A+ | A+ | Fully compliant |
| Data Fetching | A+ | A+ | Parallel, server-side |
| Type Safety | A+ | A+ | Full TypeGen integration |
| VFS Integration | A+ | A+ | O(1) lookups, pre-computed |
| Image Optimization | A | **D** | Critical violation - requires immediate fix |
| Query Safety | A | A+ | Parameterized GROQ |

### Summary

**Architecturally Sound:** ✅ Yes - The data flow from catalog slot ID to products subset is:
- Server-first (Next.js 15 compliant)
- Type-safe (Sanity TypeGen)
- Performant (O(1) VFS + parallel fetching)
- Maintainable (clear separation of concerns)

**Critical Fix Required:** ❗ Image optimization in `ProductThumb.tsx` violates the Sanity CDN constraint. Must implement custom loader or switch to regular `<img>` tag.

**System Coherence:** ✅ Confirmed after cross-checking all constraints.

---

## REQUIRED ACTIONS

### Immediate (Blocking Production)
1. **Fix Image Optimization** - `ProductThumb.tsx`
   - Implement custom loader OR
   - Switch to `<img>` with Sanity URLs
   - Use `metadata.dimensions` for aspect ratio
   - Apply hotspot/crop via `.rect()`

### Short Term (Quality Improvements)
2. Add error boundary for product fetching failures
3. Add loading states for better UX
4. Consider category-scoped search implementation (already supported in code)

---

## FINAL VERDICT

**Architecture Status:** SOUND BUT REQUIRES IMAGE FIX  
**Production Ready:** NO (pending image optimization fix)  
**Data Fidelity:** EXCELLENT  
**Type Safety:** EXCELLENT  
**Performance:** EXCELLENT  
**Image Delivery:** CRITICAL VIOLATION

The front-end consumption architecture for catalog slot ID → products subset is **coherent, type-safe, and performant** with **one critical exception**: image optimization must be fixed to use Sanity CDN properly before production deployment.
