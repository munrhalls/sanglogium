# Anti-Pattern: Client-Side Filtering

**Date:** 2026-04-01  
**Source:** PDDA-SPRINT-1  
**Severity:** High  
**Frequency:** Systemic  
**Status:** Active

---

## The Anti-Pattern

Filtering data client-side after server fetch:

```typescript
// ❌ DON'T DO THIS
const [products, setProducts] = useState([]);

// Fetch all products
useEffect(() => {
  fetchProducts().then(setProducts);
}, []);

// Filter client-side
const filteredProducts = useMemo(() => {
  return products.filter(p => 
    filters.every(f => p.brand === f.value)
  );
}, [products, filters]);
```

---

## Why It's Harmful

1. **Double work** — Server fetches N items, client filters to M
2. **State mismatch** — URL says "brand:Sony" but count shows different number
3. **SEO issues** — Filtered state not in server-rendered HTML
4. **Pagination breaks** — Can't paginate when client filters subset
5. **Wasted bandwidth** — Transferring data that gets filtered out
6. **Hydration complexity** — SSR vs client state mismatch

---

## The Correct Pattern

Server-driven filtering via URL params:

```typescript
// ✅ DO THIS
// page.tsx (Server Component)
const filters = Array.isArray(query.f) ? query.f : query.f ? [query.f] : [];

const products = await getProductsByVfsKeys({
  keys,
  sort,
  filters  // Server handles filtering
});
```

```typescript
// GROQ query applies filters
`*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0 ${filterClause}]`
```

```typescript
// Client component receives already-filtered data
<ProductGrid products={products} />
```

---

## When (If Ever) To Use Client-Side Filtering

**Acceptable cases:**
- Fuzzy text search on already-loaded small dataset (< 50 items)
- Real-time filter toggle without URL updates (rare)
- Temporary visual filtering that doesn't affect URL/pagination

**Never use for:**
- Brand filters
- Category filters
- Price range filters
- Any filter that should be shareable via URL
- Any filter with pagination

---

## Detection

**Code smells:**
- `useMemo` with filter logic
- `.filter()` on fetched data
- Filter state separate from URL params
- Product count mismatch between server/client

---

## Prevention

**Rule:** If a filter affects what products are displayed, it must be server-side via GROQ.

**Lint rule (conceptual):**
```
no-client-filter: Disallow .filter() on server-fetched data in PLP components
```

---

## Applicability

**When to check for this:**
- Any product listing page
- Category pages
- Search results
- Filtered admin views

**Keywords:**
- "client-side filtering"
- "useMemo filter"
- "double filtering"
- "server-driven"

**Related lessons:**
- `patterns/server-driven-filtering` — Correct implementation
- `patterns/server-first-fetching` — Architecture pattern

---

## Codification Log

**Integrated into:**
- [x] `.windsurfrules` — "Never filter server-fetched data client-side"
- [x] Memory system — Keywords for auto-retrieval

**Date integrated:** 2026-04-01
