# Pattern: Suspense Streaming Components

**Date:** 2026-04-01  
**Source:** PDDA-SPRINT-1  
**Severity:** Medium  
**Frequency:** Recurring  
**Status:** Active

---

## The Problem

Traditional data fetching in Server Components blocks rendering:
```typescript
// ❌ Blocks until both promises resolve
const [products, filters] = await Promise.all([
  getProducts(...),      // 500ms
  getFilters(...)        // 300ms
]);
```

Total blocking time: 500ms (slowest query)

---

## The Fix

**Streaming with Suspense:**

```typescript
// page.tsx - Create promises but don't await
const productsPromise = getProductsByVfsKeys({ keys, sort, filters });
const filtersPromise = getFiltersForCategoryPath(keys);

// Render immediately with Suspense boundaries
<ShopLayout 
  sidebar={
    <Suspense fallback={<FilterSidebarSkeleton />}>
      <FilterSection filtersPromise={filtersPromise} />
    </Suspense>
  }
>
  <Suspense fallback={<ProductGridSkeleton />}>
    <ProductsSection productsPromise={productsPromise} />
  </Suspense>
</ShopLayout>
```

```typescript
// ProductsSection.tsx - Async component awaits internally
export async function ProductsSection({ productsPromise, ... }) {
  const [products, filters] = await Promise.all([productsPromise, filtersPromise]);
  return <CategoryPageClient filters={filters} products={products} />;
}
```

**Result:** Header renders immediately, sidebar and content stream in as data resolves.

---

## Prevention

**Rule:** For independent data fetches, use streaming pattern:
1. Create promises in parent (don't await)
2. Pass promises to async child components
3. Wrap in Suspense with appropriate skeletons
4. Child components await internally

**Skeleton requirements:**
- Match layout dimensions (prevent layout shift)
- Use `animate-pulse` for loading indication
- Match visual hierarchy of content

---

## Applicability

**When to apply:**
- Multiple independent data fetches
- Heavy queries that can load progressively
- Complex pages with distinct sections
- Any page where time-to-first-byte matters

**Keywords:**
- "suspense streaming"
- "react suspense"
- "server components"
- "async components"
- "loading states"
- "skeletons"

**Related lessons:**
- `patterns/server-first-fetching` — Server component architecture
- `sops/pagination-safety` — Loading large datasets

---

## Codification Log

**Integrated into:**
- [x] Memory system — Keywords for auto-retrieval
- [ ] Test suite — Visual regression for skeletons (pending)

**Date integrated:** 2026-04-01
