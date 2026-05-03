# Research: Zustand Selector Stability Patterns

**Date:** 2026-05-03  
**Topic:** Can inline selector stability be solved with arrow function wrapper?

---

## Research Scope Contract
- **Topic:** Zustand selector reference stability patterns
- **First Principles:** Function reference equality in JavaScript, React re-render triggers
- **Fundamentals:** How Zustand detects selector changes
- **Scope Boundary:** Selector stability patterns only
- **Target Audience:** Developers implementing Zustand stores
- **Decay Risk:** Low - JavaScript fundamentals are stable

---

## Code Fundamentals Verification

### Fundamental: Arrow Function Wrapper Pattern
**Claim:** `() => (state) => state.items` provides stable selector reference

**Verification:**
- ❌ Located in codebase: Not used (exported selector pattern used instead)
- ❌ Test created: Need to verify behavior

**Actual Behavior:**
```typescript
// Component re-renders every time props change
const Component = ({ productId }) => {
  // This creates a NEW function reference on every render
  const selector = () => (state) => state.items; // Outer function recreated
  const items = useBasketStore(selector); // Selector reference changes
  // Zustand sees new selector reference, re-subscribes
}
```

**Root Cause:**
The outer arrow function `() => (state) => state.items` is recreated on every render because it's defined inside the component. Even though it returns the same inner function pattern, the reference to the outer function changes, causing Zustand to re-subscribe.

**Edge Cases:**
- If defined outside component: `const selector = () => (state) => state.items` - outer function is stable reference
- If defined inside component: outer function recreated on every render - reference changes

---

## First Principles Analysis

### Core Problem Being Solved
Zustand needs to detect when selector functions change to decide whether to re-subscribe to store state.

### Underlying Constraints
1. **Function reference equality:** In JavaScript, `() => {} !== () => {}` - different references
2. **Component render cycle:** Functions defined inside components are recreated on every render
3. **Zustand subscription:** Uses `Object.is()` for selector reference comparison

### Inherent Tradeoffs
| Approach | Wins | Loses | When to Use |
|----------|------|-------|-------------|
| Exported selector from store | Stable reference | Requires store modification | Always - idiomatic pattern |
| Selector defined outside component | Stable reference | Requires file-level definition | When store modification not possible |
| Arrow function wrapper inside component | None | Still creates new reference | Never - doesn't solve problem |

---

## Synthesis: Actionable Takeaways

### For Our Project
| Decision | Rationale | Implementation |
|----------|-----------|----------------|
| Use exported selector from store | Stable reference, idiomatic pattern | Current implementation is correct |
| Avoid arrow function wrapper | Still creates new reference on render | Not a valid solution |

### Immediate Actions
1. Keep current exported selector pattern
2. Do not attempt arrow function wrapper approach

### Verdict
**No**, `() => (state) => state.items` does NOT solve the stability problem when defined inside a component. The outer arrow function is still recreated on every render, causing a new reference. The exported selector pattern is the correct solution.
