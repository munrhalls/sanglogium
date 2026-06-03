# Test Separation Guide

## Rule
**Unit tests test functions/state directly. Integration tests test component rendering and user interactions.**

## Violation Pattern
```typescript
// ❌ WRONG - function/state test in integration file
describe('functionName', () => {
  it('returns expected value', () => {
    const result = functionName(state)
    expect(result).toBe(expected)
  })
})
```

## Correct Placement
```typescript
// ✅ CORRECT - function/state test in unit file
// __tests__/unit/feature.spec.ts
describe('functionName', () => {
  it('returns expected value', () => {
    const result = functionName(state)
    expect(result).toBe(expected)
  })
})

// ✅ CORRECT - component test in integration file
// __tests__/integration/Component.spec.tsx
describe('Component', () => {
  it('displays correct UI', () => {
    render(<Component />)
    expect(screen.getByTestId('element')).toBeInTheDocument()
  })
})
```

## Decision Tree
- Test calls function/state directly? → Unit test
- Test renders component and checks DOM? → Integration test
- Test imports function/action and calls it? → Unit test
- Test uses render/screen/click? → Integration test
