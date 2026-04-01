# Anti-Pattern: Sequential Data Fetching Waterfall

**Date:** 2026-03-31  
**Severity:** High  
**Frequency:** Systemic  
**Source:** Research/Audit - Next.js 15 Data Fetching

## The Anti-Pattern

Sequential `await` calls in Server Components create waterfalls where each fetch waits for the previous to complete, unnecessarily increasing TTFB (Time To First Byte).

## The Problem

```typescript
// ANTI-PATTERN: Sequential waterfall
export default async function Page() {
  const products = await getProducts()      // 300ms
  const metadata = await getMetadata()      // 200ms (waits for products)
  const filters = await getFilters()        // 100ms (waits for metadata)
  // Total: 600ms (sum of all latencies)
  return <Component products={products} metadata={metadata} filters={filters} />
}
```

**Why this happens:**
- Default async/await behavior is sequential
- Easy to write, requires intentional effort to parallelize
- Often introduced during rapid development
- No compiler/linter warnings for this pattern

## The Cost

| Scenario | Sequential | Parallel | Waste |
|----------|-----------|----------|-------|
| 2 independent fetches (300ms each) | 600ms | 300ms | 300ms (50%) |
| 3 independent fetches (200ms each) | 600ms | 200ms | 400ms (67%) |
| 4 independent fetches (150ms each) | 600ms | 150ms | 450ms (75%) |

## Detection

**Code Review Check:**
```typescript
// Look for this pattern:
const a = await fetchA()
const b = await fetchB()  // ← Sequential if b doesn't depend on a
const c = await fetchC()  // ← Sequential if c doesn't depend on a or b
```

**Grep Pattern:**
```bash
# Find sequential awaits in page.tsx files
grep -n "await.*get\|await.*fetch" app/**/page.tsx
```

## The Fix

```typescript
// PATTERN: Parallel fetching with Promise.all
export default async function Page() {
  const [products, metadata, filters] = await Promise.all([
    getProducts(),  // all start simultaneously
    getMetadata(),
    getFilters()
  ])
  // Total: 300ms (max latency)
  return <Component products={products} metadata={metadata} filters={filters} />
}
```

## Prevention Rule

**Golden Rule:** If data fetches are independent, they must be parallel.

```typescript
// Check: Does fetch B need anything from fetch A?
const a = await fetchA()
const b = await fetchB(a.id)  // Sequential REQUIRED (dependency)

const [a, b] = await Promise.all([fetchA(), fetchB()])  // Parallel (no dependency)
```

## Real-World Impact

**Sang Logium PLP Category Page:**
- Before: Products fetched, then metadata fetched sequentially
- After: Products and metadata fetched in parallel
- Impact: ~200-400ms TTFB improvement per category page load

## Prevention Checklist

- [ ] Audit all `page.tsx` files for sequential awaits
- [ ] Identify data dependencies (what needs what)
- [ ] Group independent fetches in `Promise.all()`
- [ ] Add E2E test to detect waterfalls (measure fetch timing)
- [ ] Document data dependencies in code comments

## Keywords
`waterfall`, `sequential-fetching`, `anti-pattern`, `ttfb`, `performance`, `promise.all`

## Related Anti-Patterns
- `over-caching` - Caching data without invalidation strategy
- `client-fetching` - Fetching data in Client Components that could be Server Components
