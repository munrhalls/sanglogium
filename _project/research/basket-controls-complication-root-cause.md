# Research: Basket Controls Implementation Complications

**Date:** 2026-05-03  
**Topic:** Root cause of basket controls implementation complications and simpler design alternatives

---

## Research Scope Contract
- **Topic:** Basket controls component design complexity and simplification opportunities
- **First Principles:** Component composition, prop-driven behavior, single responsibility
- **Fundamentals:** React component patterns, Zustand reactivity, test complexity
- **Scope Boundary:** Basket controls component design only (not store implementation)
- **Target Audience:** Developers implementing basket controls
- **Decay Risk:** Low - React component patterns are stable

---

## First Principles Analysis

### Core Problem Being Solved
Users need to add/remove/increment basket items from different pages (product page vs basket page) with slightly different UI behaviors.

### Underlying Constraints
1. **React reactivity:** Components must re-render when store state changes
2. **Context differences:** Product page and basket page have different button requirements
3. **Test complexity:** Multiple components increase test surface area

### Inherent Tradeoffs
| Approach | Wins | Loses | When to Use |
|----------|------|-------|-------------|
| Separate components per page | Clear separation | Code duplication, test duplication | When behaviors are fundamentally different |
| Single component with props | DRY, simpler tests | Conditional logic complexity | When behaviors are similar with minor variations |

### Failure Modes
1. **Over-separation:** Creating separate components for minor UI differences (current design)
2. **Under-separation:** Single component with too many responsibilities
3. **Reactivity complexity:** Over-engineering store subscription patterns

---

## Code Fundamentals Verification

### Fundamental: Current Component Architecture
**Claim:** Three separate components needed (ProductPageBasketControls, BasketPageBasketControls, BasketButton)

**Verification:**
- ✅ Located in codebase: `components/features/basket/`
- ✅ Tests created: Integration tests for each component
- ❌ Source inspected: No external source justifies this separation

**Actual Behavior:**
- ProductPageBasketControls: add/increment/decrement (no remove button)
- BasketPageBasketControls: increment/decrement/remove button
- BasketButton: header badge count

**Edge Cases:**
1. Both ProductPage and BasketPage components render increment/decrement buttons (duplicate code)
2. Only difference: remove button presence and decrement behavior (capped at 1 vs goes to 0)

---

## Best Practices (Verified)

### Practice: Component Composition over Inheritance
**Consensus:** High - React community standard

**Supporting Evidence:**
- React official docs: favor composition
- Testing conventions: simpler components = simpler tests

**Counter-Evidence (Falsification Attempts):**
- None found - separation should be based on behavior, not page location

**Verdict:** ✅ Recommended - but current separation is based on page location, not behavior differences

**When to Use:** When components have fundamentally different responsibilities
**When to Skip:** When components differ only by minor UI variations (current case)

---

## Common Solutions Landscape

### Solution: Current Design (3 Separate Components)
**Prevalence:** Current implementation
**Type:** Over-separation

**Pros:**
- Clear file structure
- Separate test files

**Cons:**
- Code duplication (increment/decrement logic duplicated)
- Test duplication (similar tests in multiple files)
- Increased complexity (3 components to maintain vs 1)
- Zustand reactivity complexity (multiple subscription patterns tried)

**Real-World Pain Points:**
- Component not re-rendering when store changes
- Had to use shallow comparison workaround
- Tests failing due to React state update warnings

**Recommendation:** ❌ Avoid - over-engineered for the actual requirement

---

### Solution: Single Component with Context Prop
**Prevalence:** Common React pattern
**Type:** Idiomatic

**Pros:**
- DRY principle (single source of truth)
- Simpler tests (single test file)
- Easier to maintain (one component to update)
- Simpler Zustand subscription (single pattern)
- Clear behavior via props

**Cons:**
- Conditional logic in render (minor)
- Single test file (but this is a pro)

**Real-World Pain Points:**
- None identified

**Recommendation:** ✅ Recommended - simpler, more maintainable

---

## Verification & Falsification Log

### Claims Verified
| Claim | Evidence | Method |
|-------|----------|--------|
| Current design has 3 components | Codebase inspection | Direct observation |
| Components share increment/decrement logic | Code inspection | Direct comparison |
| Only difference is remove button and decrement behavior | HTML Structure docs | Documentation analysis |

### Falsification Attempts
| Claim | Counter-Evidence | Verdict |
|-------|------------------|---------|
| Separate components needed for product vs basket page | Behaviors 90% identical, only remove button differs | Abandoned - over-separation |
| Complex Zustand subscription needed | BasketButton.tsx uses simple selector pattern | Survived - but current implementation over-complicated |

### Knowledge Decay Assessment
| Section | Risk | Review Date |
|---------|------|-------------|
| Component design patterns | Low - React patterns stable | 2027-05-03 |
| Zustand reactivity | Low - Zustand patterns stable | 2027-05-03 |

---

## Synthesis: Actionable Takeaways

### Root Cause of Complications
**Over-separation:** The design creates 3 separate components for what is essentially 1 component with minor behavioral variations (remove button presence and decrement cap).

**Evidence:**
- ProductPageBasketControls and BasketPageBasketControls both render increment/decrement buttons (duplicate code)
- Only difference: remove button and decrement behavior (capped at 1 vs goes to 0)
- BasketButton is fundamentally different (badge count, navigation) - this should remain separate

### Simpler Design Recommendation

**Single BasketControls Component with Props:**
```typescript
interface BasketControlsProps {
  productId: string;
  displayPriceAtAdd: number;
  availableStockAtAdd: number;
  isBasketPage?: boolean; // Determines remove button and decrement behavior
}
```

**Behavior:**
- `isBasketPage={false}` (product page): add/increment/decrement, decrement to 0 removes item
- `isBasketPage={true}` (basket page): increment/decrement/remove, decrement capped at 1

**Benefits:**
- 1 component instead of 2 (BasketButton remains separate)
- Single test file instead of 2
- DRY principle (no duplicate increment/decrement logic)
- Simpler Zustand subscription (single pattern to debug)
- Clear behavior via props (explicit context)

### Immediate Actions
1. Refactor to single BasketControls component with `isBasketPage` prop
2. Merge integration tests into single test file
3. Update folder structure to reflect simpler design
4. Remove duplicate code

### Open Questions
None - simpler design is clear and addresses the complication root cause.
