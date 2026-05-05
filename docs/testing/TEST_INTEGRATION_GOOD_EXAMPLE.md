# Execution Specs: Slice 3 - Component Layer

## Selected Slice
- Slice: Slice 3 - Component Layer - BasketButton
- Reason: Header basket button with badge count

## WHY THIS IS A GOOD INTEGRATION TEST
Follows all testing principles from docs/testing/:
- TEST_LAYER_TRUST: Tests UI rendering only, never tests store state directly (unit test responsibility)
- TEST_FIRST_PRINCIPLES: Follows AAA pattern, assumes component exists (will fail until implemented)
- TEST_SEPARATION_GUIDE: Uses render/screen (integration) not direct function calls (unit)
- Professional: Test isolation, minimal mocks, pragmatic choices, clear structure

GOOD PRACTICE: Imports only what's needed for integration testing (render, screen, store)
No direct imports of store actions/selectors - trusts unit tests to handle data layer
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import useBasketStore from '../../../../../store/basketStore'
import { BasketButton } from '../../../../../components/features/basket/BasketButton'

GOOD PRACTICE: Mock at top level (not inside describe) - Vitest hoists automatically
GOOD PRACTICE: Simple mock that avoids complex router setup - pragmatic choice
Mock justification - involving next router would be 3x more work than all tests combined.
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}))
```

```typescript
describe('BasketButton', () => {
  GOOD PRACTICE: beforeEach resets store state - ensures test isolation
  Prevents state leakage between tests - critical for reliable test suite
  beforeEach(() => {
    useBasketStore.setState({ items: [] })
  })

  describe('when rendering', () => {
    it('renders basket button with badge', () => {
      ARRANGE - setup test state with basket items
      GOOD PRACTICE: Sets state directly via store - unit test already verified addProduct works
      Integration test trusts unit test for data layer logic
      useBasketStore.setState({
        items: [
          { productId: 'product-1', quantity: 2, displayPriceAtAdd: 100, availableStockAtAdd: 10 },
        ],
      })

      ACT - render BasketButton component
      GOOD PRACTICE: Render is the ACT step - simple, clear action
      render(<BasketButton />)

      ASSERT - verify basket button and badge render
      GOOD PRACTICE: Tests UI rendering only (TEST_LAYER_TRUST principle)
      Does NOT verify store state - unit tests handle that
      expect(screen.getByTestId('basket-button')).toBeInTheDocument()
    })
  })

  describe('when displaying badge count', () => {
    it('displays correct total items count', () => {
      ARRANGE - setup test state with basket containing items with quantities
      GOOD PRACTICE: Direct state manipulation - unit test verified selector logic
      Integration test only cares that UI displays what selector returns
      useBasketStore.setState({
        items: [
          { productId: 'product-1', quantity: 2, displayPriceAtAdd: 100, availableStockAtAdd: 10 },
          { productId: 'product-2', quantity: 3, displayPriceAtAdd: 200, availableStockAtAdd: 20 },
        ],
      })

      ACT - render BasketButton component
      render(<BasketButton />)

      ASSERT - verify badge displays correct total count
      GOOD PRACTICE: Tests UI displays correct value from state (TEST_LAYER_TRUST)
      Does NOT calculate total itself - trusts selectTotalItemsCount selector (unit test)
      expect(screen.getByTestId('basket-badge')).toHaveTextContent('5')
    })
  })

  describe('when user clicks basket button', () => {
    it('navigates to basket page', () => {
      ARRANGE - setup test state with rendered BasketButton
      GOOD PRACTICE: Minimal arrange - no store setup needed for this test
      render(<BasketButton />)

      ACT - find basket button link
      GOOD PRACTICE: Finding element is part of ACT, not separate step
      const button = screen.getByTestId('basket-button')

      ASSERT - verify link points to /basket page
      GOOD PRACTICE: Tests user interaction result (navigation) without mocking router
      Verifies href attribute - pragmatic choice vs complex router mock
      expect(button).toHaveAttribute('href', '/basket')
    })
  })
})
```
