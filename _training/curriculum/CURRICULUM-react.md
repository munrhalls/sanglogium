# Curriculum: React 18 + Server Components Mastery

## Course Overview
**Duration:** 10 days
**Examination:** L1-03-react-18.md
**Prerequisites:** JavaScript closures, event loop

---

## Module 1: React Fundamentals (Days 1-3)

### Day 1: Why React Exists
**Core:** Virtual DOM, reconciliation, declarative UI

**Study:**
- Read: react.dev/learn/thinking-in-react
- Read: Reconciliation algorithm docs

**Practice:**
- Explain VDOM without using "virtual" buzzword
- Trace reconciliation for state change
- Compare imperative vs declarative

### Day 2: Hooks In Depth
**Topics:** useState, useEffect, useRef, rules

**Practice:**
- Implement useState clone
- Fix stale closure bugs
- Understand dependency arrays

**Code Challenges:**
```tsx
// Fix the stale closure:
function Timer() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setCount(count + 1); // Bug here
    }, 1000);
    return () => clearInterval(interval);
  }, []);
}

// Fix: _______
```

### Day 3: Hook Optimization
**Topics:** useCallback, useMemo, useReducer

**Practice:**
- Determine when memoization helps
- Implement useMemo from scratch
- Use useReducer for complex state

**Code Challenges:**
```tsx
// Optimize this component:
function ProductList({ products, filter }) {
  // Expensive filtering happening on every render
  const filtered = products.filter(p => matches(p, filter));
  
  // Also: sort is recalculated
  const sorted = filtered.sort((a, b) => b.price - a.price);
  
  return <List items={sorted} />;
}
```

---

## Module 2: React 18 Concurrent Features (Days 4-6)

### Day 4: Automatic Batching
**Topics:** setState batching, flushSync, transitions

**Practice:**
- Demonstrate batching behavior
- Use startTransition for non-urgent updates
- Implement deferred value pattern

### Day 5: Suspense & Error Boundaries
**Topics:** Suspense, ErrorBoundary, fallback UI

**Practice:**
- Create ErrorBoundary class component
- Implement Suspense with lazy loading
- Handle loading/error/empty states

**Code Challenge:**
```tsx
// Build robust data fetching:
function ProductPage({ id }) {
  // Must handle:
  // - Loading state
  // - Error with retry
  // - Not found
  // - Success
}
```

### Day 6: New Hooks in React 18
**Topics:** useId, useDeferredValue, useTransition, useSyncExternalStore

**Practice:**
- Use useId for accessibility
- Implement useDeferredValue for search
- Create external store subscription

---

## Module 3: Server Components (Days 7-9)

### Day 7: Server vs Client
**Topics:** RSC architecture, serialization, boundaries

**Study:**
- Read: react.dev/reference/react/server-components
- Read: Next.js App Router docs

**Practice:**
- Identify server/client boundaries
- Understand serialization constraints
- Debug "window is not defined" errors

### Day 8: Data Fetching Patterns
**Topics:** Async components, streaming, waterfalls

**Practice:**
- Fetch in Server Component
- Implement parallel data fetching
- Use Suspense boundaries

**Code Challenge:**
```tsx
// Optimize sequential fetching:
async function Page() {
  // Currently sequential (bad):
  const user = await getUser();
  const orders = await getOrders(user.id);
  const products = await getProducts(orders);
  
  // Make parallel where possible:
}
```

### Day 9: Integration Patterns
**Topics:** Composition, props, context limitations

**Practice:**
- Pass server data to client components
- Handle callbacks across boundary
- Use context appropriately

---

## Module 4: State Management (Day 10)

### Day 10: Zustand + React 18
**Topics:** Zustand patterns, persistence, selectors

**Practice:**
- Create typed store
- Implement persist middleware
- Use selectors for performance

**Code Challenge:**
Build basket store:
- Add/remove items
- Quantity management
- Total calculation
- Persistence
- Hydration handling

---

## Assessment

| Day | Checkpoint |
|-----|------------|
| 3 | Fix any stale closure bug |
| 6 | Implement Suspense boundary |
| 9 | Debug Server Component issue |
| 10 | Build complete store |

---

## Resources

- react.dev/learn (new docs)
- react.dev/reference/react
- github.com/pmndrs/zustand
- beta.reactjs.org/learn/thinking-in-react

---

*Curriculum Version: 1.0*
