# Layer 1 Examination: React 18 Server/Client Architecture

## Pre-Examination Attestation
**Date:** ___________  **Time:** ___________  **Duration:** 90 minutes

**Prerequisites:**
- [ ] JavaScript closures and scope
- [ ] Event loop and async execution
- [ ] DOM fundamentals

**I attest I understand JavaScript execution model:** _________________

---

## Section A: First Principles Foundation (20 minutes)

### A1: The Reconciliation Problem

**Question 1: From first principles, why was React invented?**

*Not "to build UIs" - what specific problem does the virtual DOM solve that direct DOM manipulation doesn't?*

Your explanation (reference imperative vs declarative, and consistency theory):
```
[Write 150+ words - why is direct DOM manipulation problematic at scale?]















```

**Gap Detection:** What am I missing about the "reconciliation" algorithm's complexity?
```









```

### A2: Server Components: The Fundamental Shift

**Question 2: React 18 introduced Server Components. What is the paradigm shift from traditional React?**

Create a before/after comparison:

```
Traditional React mental model:
1. Server sends HTML
2. React hydrates
3. All rendering happens client-side
4. _________________________________

React 18 Server Components mental model:
1. Server renders components
2. Server sends RSC payload (not HTML)
3. Client React reconciles RSC with client tree
4. _________________________________
5. _________________________________
```

**The critical insight:** Server Components never produce ________, they produce ________.

---

## Section B: Closed-Book Hook Implementation (25 minutes)

**Implement these WITHOUT documentation.**

### B1: useState with Lazy Initialization

```tsx
// Implement a counter with:
// 1. Lazy initialization (expensive initial state)
// 2. Functional update form
// 3. Proper cleanup for side effects

function Counter() {
  // Your implementation:
























  return null; // replace
}
```

**When is lazy initialization actually necessary?** _________________________

### B2: useEffect with Proper Dependencies

**Scenario:** You need to sync a prop with state and call an API when it changes.

```tsx
function ProductEditor({ productId }: { productId: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  
  // Your implementation (must handle:
  // 1. Fetch on productId change
  // 2. Cleanup pending requests
  // 3. Prevent race conditions)
























  return null; // replace
}
```

**Dependency array rules I must follow:**
1. ___________________________________________
2. ___________________________________________
3. ___________________________________________

### B3: useCallback vs useMemo

**Question:** When is `useCallback` preferable to inline function? When is it NOT?

```
useCallback is beneficial when:
1. ___________________________________________
2. ___________________________________________

useCallback is harmful when:
1. ___________________________________________
2. ___________________________________________
```

**The measurable cost of getting this wrong:** _________________________________

### B4: Custom Hook with Refs

Create a `usePrevious` hook that tracks the previous value of a prop.

```typescript
function usePrevious<T>(value: T): T | undefined {
  // Your implementation (must use refs correctly):












  return undefined; // replace
}
```

**Why useRef and not useState?** ___________________________________________

---

## Section C: The Rules of React (15 minutes)

React has non-negotiable rules. Violating them causes undefined behavior.

### C1: The Rules of Hooks

List ALL rules and explain WHY each exists:

| Rule | Violation Example | Why It Exists |
|------|-------------------|---------------|
| Only call hooks at top level | | |
| Only call hooks from React functions | | |
| (Your codebase may have more) | | |

### C2: The Closure/Staleness Problem

**Scenario:** This code doesn't work as expected. Why?

```tsx
function Timer() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCount(count + 1); // Always increments to 1, then stops
    }, 1000);
    return () => clearInterval(interval);
  }, []); // Empty dependency array
  
  return <div>{count}</div>;
}
```

**Root cause (closure capture analysis):**
```









```

**Fixes (provide 2):**
1. ___________________________________________
2. ___________________________________________

### C3: The React 18 Concurrent Features

**Automatic Batching:** What changed in React 18?

```
Before 18 (synchronous):
setA(1); // React re-renders
setB(2); // React re-renders again

After 18 (batched):
setA(1); // Queued
setB(2); // Queued, then single re-render

Exceptions where batching doesn't occur:
1. ___________________________________________
2. ___________________________________________
```

---

## Section D: Your Codebase Analysis (20 minutes)

### D1: Zustand Store Patterns

Examine `store/store.ts`:

**Pattern identification:** How does Zustand differ from Redux/Context?

```
Key differences:
1. ___________________________________________
2. ___________________________________________
3. ___________________________________________
```

**The persist middleware pattern:**
```typescript
// Explain how hydration is handled:










```

### D2: Client Component Boundaries in Your App

Review `app/(store)/` structure:

**Find 3 actual Client Components** and explain why each MUST be client:

1. `_________________` - must be client because: _________________________
2. `_________________` - must be client because: _________________________
3. `_________________` - must be client because: _________________________

---

## Section E: Open-Book Verification (10 minutes)

### E1: React 19 (if released) or 18.3+ Features

What's coming that affects your codebase?

```
Feature: ___________________________________________
Impact: ___________________________________________
```

### E2: Corrections from closed-book

| Hook | My Implementation | Correct Pattern | Gap |
|------|-------------------|-----------------|-----|
| useState lazy | | | |
| useEffect deps | | | |
| useCallback | | | |
| usePrevious | | | |

---

## Final Attestation

**I can now:**
- [ ] Explain React's purpose from first principles
- [ ] Implement hooks correctly without documentation
- [ ] Identify closure/staleness bugs
- [ ] Explain React 18 batching changes
- [ ] Navigate Server/Client boundaries

**My commitment on hooks:** I will never disable the exhaustive-deps rule without a documented reason. ___ (initial)

**Signed:** _________________ **Date:** ___________

---

## Cross-Reference

**Prerequisites:** JavaScript closures, event loop, DOM basics

**Dependents:**
- Next.js App Router (Layer 2)
- Form State Management (Layer 2)
- Performance Optimization (Layer 2)

**Conflicts/Alternatives:**
- SolidJS (fine-grained reactivity vs VDOM)
- Vue (template-based vs JSX)
- Svelte (compiler-based approach)

**Authoritative Sources:**
1. https://react.dev/learn (new docs, NOT legacy reactjs.org)
2. https://react.dev/reference/react
3. https://github.com/reactwg/server-components/discussions

---

*Examination Version: 1.0*
*Methodology: Ericsson Deliberate Practice + Feynman Technique*
