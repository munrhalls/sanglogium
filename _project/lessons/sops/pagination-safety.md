# SOP: Pagination Safety with MAX_LIMIT

**Date:** 2026-04-01  
**Source:** PDDA-SPRINT-1  
**Severity:** Critical  
**Frequency:** Every list query  
**Status:** Active

---

## Purpose

Prevent unbounded queries that can crash the database or timeout requests.

---

## The Standard

Every function that queries a list of items must:
1. Define a `MAX_*_LIMIT` constant
2. Accept an optional `limit` parameter (capped at MAX)
3. Apply limit to the query
4. Document the limit in function JSDoc

---

## Implementation Template

```typescript
// Constant at module level
const MAX_PRODUCTS_LIMIT = 100;

// Options interface includes limit
interface GetProductsOptions {
  keys: string[];
  sort?: string;
  filters?: string[];
  limit?: number; // Optional, capped at MAX_PRODUCTS_LIMIT
}

// Function enforces limit
async function getProducts({
  keys,
  limit = MAX_PRODUCTS_LIMIT
}: GetProductsOptions): Promise<Product[]> {
  // Cap at maximum
  const effectiveLimit = Math.min(limit, MAX_PRODUCTS_LIMIT);
  
  // Apply to query
  return sanityFetch({
    query: groq`*[_type == "product"][0...${effectiveLimit}] { ... }`,
    params: { keys }
  });
}
```

---

## Checklist

When creating any list query function:

- [ ] Define `MAX_*_LIMIT` constant (naming: `MAX_{ENTITY}_LIMIT`)
- [ ] Add `limit?: number` to options interface
- [ ] Default parameter: `limit = MAX_*_LIMIT`
- [ ] Enforce cap: `const effectiveLimit = Math.min(limit, MAX_*_LIMIT)`
- [ ] Apply limit in query: `[0...${effectiveLimit}]` for GROQ
- [ ] Add JSDoc: `@param limit - Maximum items to return (capped at MAX_*_LIMIT)`

---

## Examples

**GROQ slice syntax:**
```typescript
// Correct
query: groq`*[_type == "product"][0...${effectiveLimit}] { ... }`

// Incorrect (unbounded)
query: groq`*[_type == "product"] { ... }`
```

**With filters:**
```typescript
query: groq`*[_type == "product" && brand == $brand][0...${effectiveLimit}] { ... }`
```

**With order:**
```typescript
query: groq`*[_type == "product"] | order(name asc)[0...${effectiveLimit}] { ... }`
```

---

## Why This Matters

- **Database protection:** Prevents `SELECT * FROM large_table` scenarios
- **Performance:** Limits payload size and serialization time
- **UX:** Fast response times vs. loading thousands of items
- **Resource management:** Memory and bandwidth limits

---

## Applicability

**Apply to:**
- All Sanity GROQ list queries
- All database list queries
- All API endpoints returning lists
- Any function with `fetchAll` or `getAll` semantics

**Keywords:**
- "pagination safety"
- "max limit"
- "unbounded query"
- "groq limit"
- "query safety"

**Related lessons:**
- `patterns/server-first-fetching` — Data layer architecture
- `failures/groq-schema-assumption` — GROQ best practices

---

## Codification Log

**Integrated into:**
- [x] `.windsurfrules` — "All list queries require MAX_LIMIT constant"
- [x] Memory system — Keywords for auto-retrieval

**Date integrated:** 2026-04-01
