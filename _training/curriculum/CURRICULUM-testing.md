# Curriculum: Testing Strategy (Vitest + Playwright)

## Overview
**Duration:** 7 days
**Examination:** L1-06-testing.md
**Prerequisites:** JavaScript, React basics

---

## Module 1: Testing Fundamentals (Days 1-2)

### Day 1: Why Test?
**Core:** Confidence, regression prevention, documentation

**Study:**
- Read: vitest.dev/guide/why
- Read: testingjavascript.com principles

**Practice:**
- Explain testing pyramid
- Calculate cost of bugs vs tests
- Identify what to test/not test

**Analysis:**
```
Your codebase test distribution:
- Unit tests: _______
- Integration: _______
- E2E: _______

Coverage gaps:
- _______
- _______
```

### Day 2: Vitest Basics
**Topics:** Assertions, matchers, async, mocks

**Practice:**
- Write first unit test
- Test async functions
- Mock dependencies

**Challenge:**
```typescript
// Test utility functions:
describe('formatPrice', () => {
  // Test: formats USD correctly
  // Test: handles zero
  // Test: handles decimals
  // Test: different currency
});
```

---

## Module 2: React Testing (Days 3-4)

### Day 3: Component Testing
**Topics:** RTL, queries, user events, cleanup

**Practice:**
- Test component rendering
- Fire user events
- Assert on DOM

**Challenge:**
```tsx
// Test Counter component:
// - Renders initial value
  // - Increments on click
  // - Decrements on click
  // - Respects min/max bounds
```

### Day 4: Hooks & Integration
**Topics:** renderHook, contexts, providers

**Practice:**
- Test custom hooks
- Wrap with providers
- Test hook cleanup

**Challenge:**
```tsx
// Test useBasket hook:
// - Adds items
// - Removes items
// - Updates quantities
// - Calculates totals
// - Persists to storage
```

---

## Module 3: E2E Testing (Days 5-6)

### Day 5: Playwright Basics
**Topics:** Page objects, locators, actions

**Practice:**
- Write first E2E test
- Use locators properly
- Handle async navigation

**Challenge:**
```typescript
// Test: Add to basket flow
test('user can add product to basket', async ({ page }) => {
  // Navigate to product
  // Click add to basket
  // Verify basket updated
  // Verify persistence
});
```

### Day 6: Advanced E2E
**Topics:** Auth, fixtures, parallel execution, a11y

**Practice:**
- Test authenticated flows
- Create test fixtures
- Add axe accessibility checks

**Challenge:**
```typescript
// Test complete checkout:
// - Login
// - Add products
// - Fill address
// - Complete payment
// - Verify order created
// - Check accessibility throughout
```

---

## Module 4: Test Strategy (Day 7)

### Day 7: Integration & CI
**Topics:** CI/CD, coverage, flaky tests

**Practice:**
- Configure CI pipeline
- Set coverage thresholds
- Debug flaky tests

**Final Challenge:**
Design test strategy for feature:
- Unit tests for logic
- Component tests for UI
- E2E for critical path
- Accessibility included

---

## Assessment

| Day | Checkpoint |
|-----|------------|
| 2 | Write unit test without docs |
| 4 | Test complex hook |
| 6 | Complete E2E flow |
| 7 | Design test strategy |

---

## Resources
- vitest.dev
- playwright.dev
- testing-library.com
- Your vitest.config.mts, playwright.config.ts

*Version: 1.0*
