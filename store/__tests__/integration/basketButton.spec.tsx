// # Execution Specs: Slice 3 - Component Layer

// ## Selected Slice
// - Slice: Slice 3 - Component Layer - BasketButton
// - Reason: Header basket button with badge count

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, act, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import useBasketStore from '../../basketStore'
import { BasketButton } from '../../../components/features/basket/BasketButton'
import { BasketControls } from '../../../components/features/basket/BasketControls'

// Mock next/link at top level. 
// // Mock justification - involving next router would be 3x more work than all tests combined.
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}))

describe('BasketButton', () => {
  beforeEach(() => {
    useBasketStore.getState().clear()
  })

  describe('when rendering', () => {
    it('renders basket button with badge', async () => {
      // ARRANGE - render BasketControls to add product via user interaction
      render(
        <BasketControls
          productId='product-1'
          displayPriceAtAdd={100}
          availableStockAtAdd={10}
          isBasketPage={false}
        />
      )

      // ACT - add product twice via user clicks (black box interaction)
      act(() => {
        screen.getByTestId('add-to-basket-product-1').click()
      })
      // Wait for increment button to appear after state update
      await waitFor(() => {
        expect(screen.getByTestId('increment-product-1')).toBeInTheDocument()
      })
      act(() => {
        screen.getByTestId('increment-product-1').click()
      })

      // ACT - render BasketButton component
      render(<BasketButton />)

      // ASSERT - verify basket button and badge render
      expect(screen.getByTestId('basket-button')).toBeInTheDocument()
      expect(screen.getByTestId('basket-badge')).toBeInTheDocument()
    })
  })

  describe('when displaying badge count', () => {
    it('displays correct total items count', async () => {
      // ARRANGE - render BasketControls for both products
      render(
        <>
          <BasketControls
            productId='product-1'
            displayPriceAtAdd={100}
            availableStockAtAdd={10}
            isBasketPage={false}
          />
          <BasketControls
            productId='product-2'
            displayPriceAtAdd={200}
            availableStockAtAdd={20}
            isBasketPage={false}
          />
        </>
      )

      // ACT - add products via user clicks (black box interaction)
      act(() => {
        screen.getByTestId('add-to-basket-product-1').click()
      })
      await waitFor(() => {
        expect(screen.getByTestId('increment-product-1')).toBeInTheDocument()
      })
      act(() => {
        screen.getByTestId('increment-product-1').click()
      })
      act(() => {
        screen.getByTestId('add-to-basket-product-2').click()
      })
      await waitFor(() => {
        expect(screen.getByTestId('increment-product-2')).toBeInTheDocument()
      })
      act(() => {
        screen.getByTestId('increment-product-2').click()
        screen.getByTestId('increment-product-2').click()
      })

      // ACT - render BasketButton component
      render(<BasketButton />)

      // ASSERT - verify badge displays correct total count
      expect(screen.getByTestId('basket-badge')).toHaveTextContent('5')
    })
  })

  describe('when rendering', () => {
    it('has link to basket page', () => {
      // ARRANGE - render BasketButton component
      render(<BasketButton />)

      // ACT - find basket button link
      const button = screen.getByTestId('basket-button')

      // ASSERT - verify link points to /basket page
      expect(button).toHaveAttribute('href', '/basket')
    })
  })
})
