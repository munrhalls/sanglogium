# Research: Test Props Mismatch Patterns

**Date:** 2026-05-04  
**Topic:** Professional patterns for handling component props mismatch in integration tests

---

## Research Scope Contract
- **Topic:** Integration test patterns when component props don't match test data structure
- **First Principles:** Component interface contracts, test data factories, mock objects
- **Fundamentals:** Component props interfaces, test data builders, partial mocking
- **Scope Boundary:** Integration test setup patterns only (not component refactoring)
- **Target Audience:** Developers writing integration tests
- **Decay Risk:** Low - testing patterns are stable

---

## Code Fundamentals Verification

### Fundamental: Component Props Interface
**Claim:** Components define explicit props interfaces that must be satisfied

**Verification:**
- ✅ Located in codebase: `app/components/features/products/ProductInfo.tsx` (line 13)
- ✅ Located in codebase: `app/components/features/products/ProductCard.tsx` (line 23-24)

**Actual Behavior:**
```typescript
// ProductInfo expects full Product object
export function ProductInfo({ product }: { product: Product }) { ... }

// ProductCard expects full Product object  
interface ProductCardProps {
  product: Product;
}
```

**Edge Cases:**
- Component may extract only needed fields from complex object
- Component may have optional props with defaults
- Component may accept variant props for different contexts

---

### Fundamental: Test Data Builders Pattern
**Claim:** Professional tests use builder functions/factories to create test data that matches component interfaces

**Verification:**
- ❌ Located in our codebase: No test data builders found
- ✅ Industry standard: Kent C. Dodds, Testing Library best practices

**Actual Behavior:**
```typescript
// Professional pattern - test data builder
const buildProduct = (overrides = {}) => ({
  _id: 'product-1',
  name: 'Test Product',
  brand: { _id: 'brand-1', name: 'Test Brand' },
  price_data: { currency: 'USD', unit_amount: 10000 },
  stock: 10,
  image: null,
  slug: { current: 'test-product' },
  stripePriceId: 'price_123',
  ...overrides,
})

// Usage in test
render(<ProductInfo product={buildProduct()} />)
```

**Edge Cases:**
- Builders should have sensible defaults
- Builders should accept partial overrides
- Builders should be composable for complex scenarios

---

### Fundamental: Partial Mocking/Shallow Rendering
**Claim:** Tests can mock child components to avoid props drilling

**Verification:**
- ✅ Industry standard: React Testing Library discourages this
- ✅ Testing Library philosophy: "The more your tests resemble the way your software is used, the more confidence they can give you"

**Actual Behavior:**
```typescript
// Anti-pattern - mocking component to avoid props
vi.mock('@/components/features/products/ProductInfo', () => ({
  ProductInfo: ({ productId, displayPriceAtAdd, availableStockAtAdd }) => (
    <BasketControls productId={productId} displayPriceAtAdd={displayPriceAtAdd} availableStockAtAdd={availableStockAtAdd} />
  ),
}))

// Why this is bad: Tests don't verify actual component behavior
```

**Edge Cases:**
- Mocking hides real integration issues
- Tests become brittle when component implementation changes
- Violates testing philosophy of testing real user behavior

---

## Best Practices (Verified)

### Practice: Test Data Builders / Factories
**Consensus:** High - Industry standard pattern

**Supporting Evidence:**
- Kent C. Dodds: "Test Data Builders" pattern for creating test objects
- Testing Library docs: Use realistic data, not minimal mocks
- Martin Fowler: "Object Mother" / "Test Data Builder" patterns

**Counter-Evidence (Falsification Attempts):**
- None - this is the accepted professional pattern

**Verdict:** ✅ Recommended - always use test data builders for complex props

**When to Use:** When component props are complex objects with many required fields
**When to Skip:** When component props are simple primitives (string, number, boolean)

---

### Practice: Test at Right Layer
**Consensus:** High - Testing Library core philosophy

**Supporting Evidence:**
- Testing Library docs: "The more your tests resemble the way your software is used, the more confidence they can give you"
- Kent C. Dodds: "Test behavior, not implementation details"

**Counter-Evidence (Falsification Attempts):**
- Some teams mock heavily for speed - but this sacrifices confidence

**Verdict:** ✅ Recommended - test the component that actually renders the UI you're testing

**When to Use:** Always - test the actual component users interact with
**When to Skip:** Never - unless testing pure unit functions

---

### Practice: Component Refactoring for Testability
**Consensus:** Medium - Depends on context

**Supporting Evidence:**
- Clean Code principles: Components should have single responsibility
- Composition pattern: Extract basket controls as separate component

**Counter-Evidence (Falsification Attempts):**
- Over-refactoring for tests can lead to unnecessary complexity
- Production code should not be driven solely by test convenience

**Verdict:** ⚠️ Context-Dependent - refactor if it improves design, not just for tests

**When to Use:** When component has multiple responsibilities that can be cleanly separated
**When to Skip:** When refactoring would add unnecessary abstraction layers

---

## Common Solutions Landscape

### Solution: Test Data Builder
**Prevalence:** Common (idiomatic)
**Type:** Professional pattern

**Pros:**
- Matches component interface exactly
- Reusable across multiple tests
- Easy to extend with overrides
- Type-safe with TypeScript

**Cons:**
- Requires initial setup effort
- Need to maintain builder as component changes

**Real-World Pain Points:**
- None when done correctly

**Recommendation:** ✅ Recommended - standard professional approach

---

### Solution: Mock Component Props
**Prevalence:** Common (often anti-pattern)
**Type:** Workaround

**Pros:**
- Quick to implement
- No need to create complex test objects

**Cons:**
- Tests don't verify actual component behavior
- Brittle when component implementation changes
- Violates testing philosophy
- Hides integration issues

**Real-World Pain Points:**
- Tests pass but production code fails
- False confidence in test suite
- Maintenance burden when components change

**Recommendation:** ❌ Avoid - use test data builders instead

---

### Solution: Test Child Component Directly
**Prevalence:** Common (idiomatic)
**Type:** Professional pattern

**Pros:**
- Tests the actual component with basket controls
- No props mismatch issues
- Clear test intent
- Aligns with testing philosophy

**Cons:**
- May miss integration with parent component
- Need to ensure child component exists

**Real-World Pain Points:**
- None when done correctly

**Recommendation:** ✅ Recommended - test the component that actually has the basket controls

---

## Synthesis: Actionable Takeaways

### For Our Project
| Decision | Rationale | Implementation |
|----------|-----------|----------------|
| Test AddToCartButton directly | Component already receives individual props, no mismatch | Update tests to test AddToCartButton instead of ProductCard/ProductInfo |
| Create test data builder for Product | If testing ProductCard/ProductInfo is necessary | Create `buildProduct()` helper in test helpers file |
| Avoid mocking components | Violates testing philosophy, hides real issues | Don't mock ProductCard/ProductInfo to avoid props mismatch |

### Immediate Actions
1. Update productDetail.spec.tsx to test AddToCartButton directly (already has correct props)
2. Update productGrid.spec.tsx to test AddToCartButton directly (already has correct props)
3. If parent component testing is needed, create test data builder for Product object

### Verdict
**Professional solution:** Test the component that actually has the basket controls (AddToCartButton), not the parent component that requires a full Product object. This avoids props mismatch and aligns with testing philosophy of testing the actual UI users interact with.

**Why:** AddToCartButton already receives the individual props the tests are trying to pass (`productId`, `displayPrice`, `stock`, etc.). Testing the parent component (ProductCard/ProductInfo) would require either:
1. Creating complex Product object builders (unnecessary overhead)
2. Mocking the parent component (anti-pattern, violates testing philosophy)

Testing AddToCartButton directly is the professional approach that matches the actual user interaction pattern.
