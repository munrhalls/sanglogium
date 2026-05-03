// # Execution Specs: Slice 3 - Component Layer

// ## Selected Slice
// - Slice: Slice 3 - Component Layer - BasketButton
// - Reason: Header basket button with badge count

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import useBasketStore from '../../../../../store/basketStore'
import { BasketButton } from '../../../../../components/features/basket/BasketButton'

// Mock next/link at top level. 
// // Mock justification - involving next router would be 3x more work than all tests combined.
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}))

describe('BasketButton', () => {
  beforeEach(() => {
    useBasketStore.setState({ items: [] })
  })

  describe('when rendering', () => {
    it('renders basket button with badge', () => {
      // ARRANGE - setup test state with basket items
      useBasketStore.setState({
        items: [
          { productId: 'product-1', quantity: 2, displayPriceAtAdd: 100, availableStockAtAdd: 10 },
        ],
      })

      // ACT - render BasketButton component
      render(<BasketButton />)

      // ASSERT - verify basket button and badge render
      expect(screen.getByTestId('basket-button')).toBeInTheDocument()
    })
  })

  describe('when displaying badge count', () => {
    it('displays correct total items count', () => {
      // ARRANGE - setup test state with basket containing items with quantities
      useBasketStore.setState({
        items: [
          { productId: 'product-1', quantity: 2, displayPriceAtAdd: 100, availableStockAtAdd: 10 },
          { productId: 'product-2', quantity: 3, displayPriceAtAdd: 200, availableStockAtAdd: 20 },
        ],
      })

      // ACT - render BasketButton component
      render(<BasketButton />)

      // ASSERT - verify badge displays correct total count
      expect(screen.getByTestId('basket-badge')).toHaveTextContent('5')
    })
  })

  describe('when user clicks basket button', () => {
    it('navigates to basket page', () => {
      // ARRANGE - setup test state with rendered BasketButton
      render(<BasketButton />)

      // ACT - find basket button link
      const button = screen.getByTestId('basket-button')

      // ASSERT - verify link points to /basket page
      expect(button).toHaveAttribute('href', '/basket')
    })
  })
})
