# Test-First Principles

## Rule
**Write tests BEFORE implementation. Tests must FAIL first (red), then you implement to make them PASS (green).**

## RGR (Red-Green-Refactor)
1. **Red**: Write minimal, professional, simple, robust test for feature that doesn't exist yet. Test MUST fail because it TESTS WHAT DOESN'T EXIST YET.
2. **Green**: Write minimal, professional, simple, robust implementation to make test pass.
3. **Refactor**: Check if minimal, professional, simple, robust refactor of the code is needed. If yes - refactor and adapt  refactored code to pass tests.

## AAA (Arrange-Act-Assert)
- **Arrange**: Setup test state
- **Act**: Call function/behavior being tested
- **Assert**: Verify expected outcome

## Critical Principle
Integration tests are written AS IF the component already exists. Never write tests that pass immediately - that's a false positive and provides no verification.

## Example
```typescript
// ✅ CORRECT - Test assumes component exists, will fail until implemented
describe('BasketButton', () => {
  it('displays badge with correct count', () => {
    useBasketStore.setState({ items: [{ productId: 'p1', quantity: 2, ... }] })
    render(<BasketButton />)
    expect(screen.getByTestId('basket-badge')).toHaveTextContent('2')
  })
})

// ❌ WRONG - Test written to pass immediately, no verification
describe('BasketButton', () => {
  it('displays badge with correct count', () => {
    // Note: Badge element will be added when component is implemented
    useBasketStore.setState({ items: [{ productId: 'p1', quantity: 2, ... }] })
    render(<BasketButton />)
    expect(screen.getByTestId('basket-button')).toBeInTheDocument() // Doesn't test badge
  })
})
```

## Why
- Tests failing first proves they actually test new code
- When tests are first written - THEY SHOULD FAIL - because they are intentionally written BEFORE implementation
- Core purpose of a test: specifies WHAT SHOULD BE, creates stable ground to implement upon
- Stable ground to implement upon: ONLY TRUSTWORTHY tests with 0% false positives risk are a stable ground
- Prevents false positives (tests passing without exercising implementation)
- A single false positive can ruin entire codebase, it's the worst disaster and nightmare to avoid at all cost
