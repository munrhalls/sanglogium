# Research: Zustand Reactivity Pattern

**Date:** 2026-05-03  
**Topic:** Proper Zustand subscription pattern for component reactivity

---

## Research Scope Contract
- **Topic:** Zustand selector patterns for component reactivity
- **First Principles:** Stable selector references, subscription mechanism
- **Fundamentals:** Zustand store subscription, React re-render triggers
- **Scope Boundary:** Zustand subscription patterns only (not store implementation)
- **Target Audience:** Developers implementing Zustand stores
- **Decay Risk:** Low - Zustand patterns are stable

---

## Code Fundamentals Verification

### Fundamental: Inline Selector vs Exported Selector
**Claim:** Inline selectors `(state) => state.items` break reactivity, exported selectors work

**Verification:**
- ✅ Located in codebase: `components/features/basket/BasketButton.tsx` (working pattern)
- ✅ Located in codebase: `store/basketStore.ts` (selector export pattern)
- ❌ Current implementation: `components/features/basket/BasketControls.tsx` (broken pattern)

**Actual Behavior:**
- **Working pattern (BasketButton):** Uses exported selector `selectTotalItemsCount` from store
- **Broken pattern (BasketControls):** Uses inline selector `(state) => state.items` which creates new function reference on every render

**Root Cause:**
Zustand's subscription mechanism relies on selector reference equality. Inline selectors create new function references on every render, causing Zustand to re-subscribe instead of detecting state changes. Exported selectors are stable references, enabling proper reactivity.

---

## Best Practices (Verified)

### Practice: Export Selector Functions from Store
**Consensus:** High - Zustand official documentation

**Supporting Evidence:**
- Zustand docs: "Selectors should be defined outside components or memoized"
- BasketButton.tsx working example in codebase

**Counter-Evidence (Falsification Attempts):**
- None - inline selectors are explicitly warned against in docs

**Verdict:** ✅ Recommended - export selector functions from store file

**When to Use:** Always - when subscribing to store state
**When to Skip:** Never - inline selectors break reactivity

---

## Common Solutions Landscape

### Solution: Inline Selector
**Prevalence:** Common (incorrect)
**Type:** Anti-pattern

**Pros:**
- Quick to write
- No additional files

**Cons:**
- Creates new function reference on every render
- Breaks Zustand subscription mechanism
- Component doesn't re-render on state changes

**Real-World Pain Points:**
- Integration tests failing with "component not re-rendering"
- React act(...) warnings

**Recommendation:** ❌ Avoid - use exported selectors instead

---

### Solution: Exported Selector
**Prevalence:** Recommended
**Type:** Idiomatic

**Pros:**
- Stable function reference
- Proper Zustand reactivity
- Component re-renders on state changes

**Cons:**
- Requires defining selector in store file

**Real-World Pain Points:**
- None

**Recommendation:** ✅ Recommended - always use exported selectors

---

## Synthesis: Actionable Takeaways

### For Our Project
| Decision | Rationale | Implementation |
|----------|-----------|----------------|
| Export selector for items | Stable reference enables reactivity | Add `selectItems` to basketStore.ts |
| Use exported selector in component | Follow working BasketButton pattern | Import and use `selectItems` in BasketControls.tsx |

### Immediate Actions
1. Add `selectItems` selector to basketStore.ts
2. Update BasketControls.tsx to use exported selector
3. Verify tests pass
