# Test-First Principles

## Rule
**Write tests BEFORE implementation. Tests must FAIL first (red) and they are meant to specify what correct implementation behaves like.**

## RGR (Red-Green-Refactor)
1. **Red**: Write minimal, professional, simple, robust test for feature that doesn't exist yet. Test MUST fail because it TESTS WHAT DOESN'T EXIST YET.
2. **Green**: Write minimal, professional, simple, robust implementation to make test pass.
3. **Refactor**: Check if minimal, professional, simple, robust refactor of the code is needed. If yes - refactor and adapt  refactored code to pass tests.

## AAA (Arrange-Act-Assert)
- **Arrange**: Setup test state
- **Act**: Call function/behavior being tested
- **Assert**: Verify expected outcome

## Critical Principle - 1
Integration tests are written AS IF the component/implementation already exists. Never write tests that pass immediately - that's a false positive and provides no verification.

## Critical Principle - 2
Description and it block must follow test naming convention [@/TestsNamingConvention.md] - AND be accurate and one to one specific with what the test does.

## Critical Principle - 3
Tests specify behavior, never implement inside tests. No implementation inside tests - tests verify behavioral contract based on their layer (data layer = data contract, view layer = ui contract), components implement. 

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

// ❌ WRONG - Test claims to test badge count but tests button existence
describe('BasketButton', () => {
  it('displays badge with correct count', () => {
    useBasketStore.setState({ items: [{ productId: 'p1', quantity: 2, ... }] })
    render(<BasketButton />)
    expect(screen.getByTestId('basket-button')).toBeInTheDocument() // Tests button, not badge
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

## Common Failure Mode: Removing Tests for Non-Existent Implementation

**Symptom:** You see tests failing because component doesn't exist, so you remove them.

**Correct Action:** KEEP the failing tests. They are specifications. When you implement the component, tests will pass.

**Why:** Tests failing first is the "Red" in RGR. Removing them skips the Red phase entirely.
