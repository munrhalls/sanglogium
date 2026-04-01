# Pattern: Server-Driven Filtering Architecture

**Date:** 2026-04-01  
**Source:** PDDA-SPRINT-1  
**Severity:** High  
**Frequency:** Systemic  
**Status:** Active

---

## The Problem

Mixed client/server filtering causes:
- Double filtering logic (GROQ + JavaScript)
- Filter count mismatch (server returns N, client shows M)
- State synchronization issues between URL and displayed products
- Unnecessary JavaScript bundle size

---

## Root Cause

Legacy pattern: Server fetches all products, client filters with useMemo based on URL params. This made sense when filters were simple, but becomes problematic when:
- Filters involve complex queries (brand, specifications, price ranges)
- Pagination is needed (client can't paginate filtered subset correctly)
- SEO matters (filtered state should be server-rendered)

---

## The Fix

**Server-only filtering:**

```typescript
// Server component
const products = await getProductsByVfsKeys({
  keys: descendantKeys,
  sort,
  filters  // Passed to GROQ
});
```

```typescript
// GROQ query with server-side filter
const filterClause = filters.map(f => {
  const [field, value] = f.split(':');
  if (field === 'brand') {
    return `&& brand == "${value}"`;
  }
  return `&& (count(overviewFields[@.title == "${field}" && @.value == "${value}"]) > 0)`;
}).join(' ');

`*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0 ${filterClause}]`
```

**Client component (display only):**
```typescript
// CategoryPageClient.tsx - NO filtering logic
<ProductGrid products={products} />  // Already filtered server-side
```

---

## Prevention

**Rule:** All filtering happens server-side via GROQ. Client components receive already-filtered data.

**Architecture:**
```
URL params → Server Component → GROQ query → Client Component (display only)
```

---

## Applicability

**When to apply:**
- Any list view with filtering requirements
- SEO-sensitive filtered pages
- Complex filter combinations
- Pagination required

**When NOT to apply:**
- Simple client-side search (fuzzy text search on already-loaded data)
- Real-time filter updates without URL changes
- Small datasets (< 20 items) where full hydration is acceptable

**Keywords:**
- "server-side filtering"
- "groq filters"
- "url state filtering"
- "server-driven"

**Related lessons:**
- `patterns/server-first-fetching` — Server component patterns
- `anti-patterns/client-side-filtering` — When to avoid client filtering

---

## Codification Log

**Integrated into:**
- [x] `.windsurfrules` — "All filtering server-side via GROQ"
- [x] Memory system — Keywords for auto-retrieval

**Date integrated:** 2026-04-01
