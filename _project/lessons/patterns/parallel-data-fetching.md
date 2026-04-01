# Pattern: Parallel Data Fetching in Server Components

**Date:** 2026-03-31  
**Severity:** High  
**Frequency:** Recurring  
**Source:** Research/Audit - Next.js 15 Data Fetching

## The Pattern

In Next.js 15 App Router Server Components, multiple sequential `await` calls create waterfalls that block rendering. The solution is to parallelize independent fetches using `Promise.all`.

## Implementation

### Anti-Pattern (Sequential - AVOID)
```typescript
export default async function Page({ params }) {
  const data1 = await fetchData1()  // 300ms
  const data2 = await fetchData2()  // 300ms (waits)
  const data3 = await fetchData3()  // 300ms (waits)
  // Total: 900ms
  return <Component data1={data1} data2={data2} data3={data3} />
}
```

### Pattern (Parallel - USE)
```typescript
export default async function Page({ params }) {
  const [data1, data2, data3] = await Promise.all([
    fetchData1(),  // starts immediately
    fetchData2(),  // starts immediately
    fetchData3()   // starts immediately
  ])
  // Total: 300ms (max latency)
  return <Component data1={data1} data2={data2} data3={data3} />
}
```

## Key Insight

**Start requests, then await them all:**
```typescript
// WRONG: await blocks execution
const data1 = await fetchData1()  // blocks here
const data2 = await fetchData2()

// RIGHT: initiate all, then await
const promise1 = fetchData1()  // returns promise immediately
const promise2 = fetchData2()  // returns promise immediately
const [data1, data2] = await Promise.all([promise1, promise2])
```

## When to Apply

**Always use Promise.all when:**
- Data fetches are independent (no dependencies between them)
- Multiple async operations in same Server Component
- Reducing TTFB (Time To First Byte) is priority

**Exception - Sequential required:**
```typescript
// User ID needed to fetch user's orders
const user = await getUser()
const orders = await getOrders(user.id)  // depends on user
// Sequential is correct here
```

## Real-World Example

```typescript
// Before: PLP Category Page (waterfall)
const products = await getProductsByVfsKeys({ keys, sort, filters })
const metadata = await getCategoryMetadata(nodeId)  // waits for products

// After: Parallel fetch (200-400ms faster)
const [products, metadata] = await Promise.all([
  getProductsByVfsKeys({ keys, sort, filters }),
  getCategoryMetadata(nodeId)
])
```

## Prevention Checklist

- [ ] Audit all `page.tsx` files for sequential awaits
- [ ] Identify independent data fetches
- [ ] Wrap in `Promise.all()` 
- [ ] Consider `Promise.allSettled()` if partial failure acceptable

## Keywords
`parallel-fetching`, `Promise.all`, `server-components`, `ttfb`, `performance`, `data-fetching`

## Related Patterns
- `batched-queries` - For Sanity GROQ batching
- `react-cache` - For request-level deduplication
- `unstable-cache` - For cross-request caching
