# Test Layer Trust

## Rule
**Integration tests trust unit tests. Integration tests never test anything unit tests tested.**

## Layer Responsibilities

### Unit Tests (Data Layer)
- Test functions/state directly
- Test selectors, actions, pure functions
- Test persistence, validation
- **Exclusive domain**: Data layer logic

### Integration Tests (View Layer)
- Test component rendering given state
- Test user interaction dispatches proper events to store
- **Exclusive domain**: UI rendering and user interactions

## Cooperation Principle
Testing layers cooperate as a team with synergy. Unit tests handle data layer exclusively. Integration tests trust unit tests and never re-test what unit tests already tested.

## What Integration Tests Test
1. **Given state renders proper expected elements**
   - Component renders correctly with given store state
   - Badge displays correct count
   - Button shows correct text

2. **Given user interaction dispatches proper events to store**
   - Click dispatches correct action
   - Form submit calls correct function
   - User input triggers correct state update

**CRITICAL:** Test UI state changes, NOT store state. Unit tests verify store actions work. Integration tests verify UI reflects those changes.

```typescript
// ✅ CORRECT - Integration test tests UI state change after interaction
describe('BasketControls', () => {
  it('updates quantity display after increment click', () => {
    useBasketStore.setState({ items: [{ productId: 'p1', quantity: 1, ... }] })
    render(<BasketControls productId="p1" />)
    
    screen.getByTestId('increment-button').click()
    
    // Test UI state change, NOT store state
    expect(screen.getByTestId('quantity-display')).toHaveTextContent('2')
    // Unit test verifies state.items[0].quantity === 2
  })
})

// ❌ WRONG - Integration test testing store state (unit test responsibility)
describe('BasketControls', () => {
  it('updates store quantity after increment click', () => {
    useBasketStore.setState({ items: [{ productId: 'p1', quantity: 1, ... }] })
    render(<BasketControls productId="p1" />)
    
    screen.getByTestId('increment-button').click()
    
    const state = useBasketStore.getState()
    expect(state.items[0].quantity).toBe(2) // Unit test responsibility
  })
})
```

## What Integration Tests Never Test
- Selectors (unit test responsibility)
- Store actions (unit test responsibility)
- State calculations (unit test responsibility)
- Any data layer logic (unit test responsibility)

## Example
```typescript
// ✅ CORRECT - Integration test tests rendering and user interaction
describe('BasketButton', () => {
  it('displays badge with correct count', () => {
    useBasketStore.setState({ items: [{ productId: 'p1', quantity: 2, ... }] })
    render(<BasketButton />)
    expect(screen.getByTestId('basket-badge')).toHaveTextContent('2')
  })

  it('dispatches navigation on click', () => {
    render(<BasketButton />)
    fireEvent.click(screen.getByTestId('basket-button'))
    expect(mockNavigate).toHaveBeenCalledWith('/basket')
  })
})

// ❌ WRONG - Integration test testing selector (unit test responsibility)
describe('BasketButton', () => {
  it('calculates total items correctly', () => {
    const state = useBasketStore.getState()
    const result = selectTotalItemsCount(state) // Unit test responsibility
    expect(result).toBe(5)
  })
})
```

## Why
- Prevents duplication across test layers
- Integration tests stay integration only
- Clear separation of concerns
- Faster test execution (unit tests are faster)
- Single source of truth for each concern
