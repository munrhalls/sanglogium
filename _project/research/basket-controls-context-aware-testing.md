# Research: BasketControls Context-Aware Testing Strategy

## Research Scope Contract
- **Topic:** Integration testing strategy for context-aware BasketControls component
- **First Principles:** Integration tests trust unit tests, test UI rendering given state, test user interactions
- **Fundamentals:** Context-aware components render differently based on props/context, test isolation
- **Scope Boundary:** Does not cover unit tests (already exist), does not cover E2E tests
- **Target Audience:** Implementation team building BasketControls component
- **Decay Risk:** Low - testing principles are stable

---

## Context Analysis from Documentation

### HTML Structure.md Reveals Context-Dependent Rendering

**Product Pages (not basket page):**
- Product NOT in basket: Only "add" button
- Product IN basket: decrement, quantity, increment (NO remove button)

**Basket Page:**
- Product IN basket: decrement, quantity, increment, remove button
- Decrement capped at 1 (disabled), delete happens via remove button

### PRD.md Confirms Behavior
- DoD [4]: When decrement to zero, item removes (product pages)
- No explicit remove button on product pages in PRD
- Remove button only mentioned in context of basket page (inferred from HTML Structure)

### Current Test Problem
The current basketControls.spec.tsx test assumes:
- All 4 buttons (add, increment, decrement, remove) render together
- This is context-ignorant and contradicts HTML Structure
- Test fails to account for page context (product page vs basket page)

---

## First Principles Analysis

### Core Problem Being Solved
Integration test for a component that renders differently based on context (page type, basket state).

### Underlying Constraints
1. Integration tests must trust unit tests for data layer logic
2. Integration tests must test UI rendering given state
3. Integration tests must test user interactions
4. Context-aware components need different test scenarios for each context

### Inherent Tradeoffs
| Approach | Wins | Loses | When to Use |
|----------|------|-------|-------------|
| Single component with context prop | Reusability, DRY | Complex conditional rendering | When contexts share 80%+ logic |
| Separate components per context | Simpler rendering logic | Code duplication | When contexts diverge significantly |
| Wrapper component pattern | Clear separation, testability | Extra abstraction layer | When contexts need different data access |

### Failure Modes
1. **Context Ignorance:** Testing one context and assuming it applies to all (current test failure)
2. **Over-Testing:** Testing both unit and integration concerns in integration tests
3. **Under-Testing:** Missing critical context scenarios (basket page remove button)

---

## Code Fundamentals

### Fundamental: Context-Aware Component Testing
**Claim:** Context-aware components need separate test scenarios for each rendering context.

**Verification:**
- [x] Located in codebase: Current test is context-ignorant
- [ ] Test created: Need to create context-aware tests
- [x] Source inspected: HTML Structure.md defines contexts

**Actual Behavior:**
Current test assumes single rendering mode with all buttons, which contradicts documentation.

**Edge Cases:**
1. Basket page: remove button only renders here
2. Product page: decrement can go to 0 (removes item)
3. Basket page: decrement capped at 1 (disabled), remove button handles delete

---

## Best Practices (Verified)

### Practice: Test Each Rendering Context Separately
**Consensus:** High - standard practice for context-aware components

**Supporting Evidence:**
- Testing Library documentation: test components in different states
- React Testing Patterns (Kent C. Dodds): test conditional rendering based on props

**Counter-Evidence (Falsification Attempts):**
- Some argue for "happy path only" testing - but this misses critical edge cases
- Some argue for "single test with props variation" - but this obscures context-specific behavior

**Verdict:** ✅ Recommended

**When to Use:** When component renders differently based on context/props
**When to Skip:** When component has single rendering mode

### Practice: Use Props to Control Context in Tests
**Consensus:** High - props are the standard way to control component behavior in tests

**Supporting Evidence:**
- React component testing best practices
- Testing Library patterns

**Counter-Evidence (Falsification Attempts):**
- Some use context providers for complex scenarios - but props are simpler

**Verdict:** ✅ Recommended

**When to Use:** When context can be passed as props
**When to Skip:** When context is complex and requires context providers

---

## Common Solutions Landscape

### Solution: Single Component with Context Prop
**Prevalence:** Common
**Type:** Idiomatic

**Pros:**
- Single component to maintain
- Reusable across contexts
- DRY principle

**Cons:**
- Complex conditional rendering logic
- Tests need to cover multiple contexts
- Props interface grows with context options

**Real-World Pain Points:**
- Hard to reason about rendering logic
- Test files become large
- Context coupling in component

**Recommendation:** Use when contexts share 80%+ logic, otherwise consider separate components

### Solution: Separate Components per Context
**Prevalence:** Common
**Type:** Idiomatic

**Pros:**
- Simpler rendering logic per component
- Smaller, focused test files
- Clear separation of concerns

**Cons:**
- Code duplication
- Multiple components to maintain
- Harder to share logic

**Real-World Pain Points:**
- Duplication maintenance burden
- Inconsistent behavior across contexts

**Recommendation:** Use when contexts diverge significantly

---

## Research Findings

### Critical Discovery
The current basketControls.spec.tsx test is fundamentally flawed because it assumes a single rendering mode. According to HTML Structure.md:

1. **Product pages** have two states:
   - Product NOT in basket: Only add button
   - Product IN basket: decrement, quantity, increment (NO remove button)

2. **Basket page** has one state:
   - Product IN basket: decrement, quantity, increment, remove button
   - Decrement capped at 1 (disabled), remove button handles delete

### Architectural Decision Required
Before writing tests, must decide:
- Option A: Single BasketControls with `isBasketPage` prop
- Option B: Separate ProductPageBasketControls and BasketPageBasketControls
- Option C: Wrapper component pattern

### Recommended Approach
Based on HTML Structure analysis:
- Product pages and basket page have significantly different rendering logic
- Product page: decrement to 0 removes item
- Basket page: decrement capped at 1, remove button handles delete
- These are different behaviors, not just different UI

**Recommendation:** Separate components per context (Option B)
- ProductPageBasketControls: add OR decrement/increment
- BasketPageBasketControls: decrement/increment/remove with capped decrement

This aligns with Single Responsibility Principle and makes testing simpler and more focused.

---

## Proposed Test Strategy

### ProductPageBasketControls Integration Tests
1. When product not in basket: renders add button only
2. When product in basket: renders decrement, quantity, increment (no remove)
3. When user clicks add: hides add, shows increment/decrement
4. When user clicks decrement to 0: removes item, shows add button
5. When user clicks increment: quantity increases (unit test verifies state)

### BasketPageBasketControls Integration Tests
1. When product in basket: renders decrement, quantity, increment, remove
2. When user clicks decrement to 1: decrement disabled (unit test verifies state)
3. When user clicks remove: removes item (unit test verifies state)
4. When user clicks increment: quantity increases (unit test verifies state)

### Integration Test Principles Applied
- Trust unit tests for store actions/state
- Test UI rendering given state
- Test user interactions dispatch events
- Never test store state directly

---

## Verification Status

### Sources Verified
- [x] HTML Structure.md - defines context-dependent rendering
- [x] PRD.md - confirms behavior expectations
- [x] Technical Solution Design.md - defines data layer (unit test responsibility)
- [x] Tests Plan.md - generic, needs context-specific refinement
- [x] Testing principles - TEST_LAYER_TRUST, TEST_FIRST_PRINCIPLES

### Gaps Identified
- Current test is context-ignorant
- No architectural decision on component structure
- Test plan needs context-specific scenarios

### Next Steps
1. Decide on component architecture (single vs separate components)
2. Rewrite basketControls.spec.tsx to test specific contexts
3. Update Tests Plan.md to reflect context-aware strategy
