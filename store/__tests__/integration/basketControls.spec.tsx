// # Execution Specs: Slice 2 - Component Layer

// ## Selected Slice
// - Slice: Slice 2 - Component Layer - BasketControls
// - Reason: Basket controls for product pages (isBasketPage={false} determines context)

import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, act, cleanup, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { BasketControls } from '../../../app/components/features/basket/BasketControls'
import useBasketStore from '../../../store/basketStore'

describe('basketControls', () => {

  afterEach(() => {
    cleanup()
    useBasketStore.getState().clear()
  })

  describe('on a product page (isBasketPage={false}) when product not in basket', () => {
    it('renders add button only', () => {
      // ARRANGE - setup test state with product not in basket
      const productId = 'product-1'

      // ACT - render BasketControls component with isBasketPage={false}
      render(
        <BasketControls
          productId={productId}
          isBasketPage={false}
        />
      )

      // ASSERT - verify add button renders
      expect(screen.getByTestId('add-to-basket-product-1')).toBeInTheDocument()
      // ASSERT - verify increment/decrement/remove buttons do NOT render (product page context)
      expect(screen.queryByTestId('increment-product-1')).not.toBeInTheDocument()
      expect(screen.queryByTestId('decrement-product-1')).not.toBeInTheDocument()
      expect(screen.queryByTestId('remove-product-1')).not.toBeInTheDocument()
    })
  })

  describe('on a product page (isBasketPage={false}) when product in basket', () => {
    it('renders increment and decrement buttons (no remove button)', () => {
      // ARRANGE - setup test state with product in basket
      const productId = 'product-1'

      render(
        <BasketControls
          productId={productId}
          isBasketPage={false}
        />
      )

      // ACT - add product to basket via user action (click)
      act(() => {
        screen.getByTestId('add-to-basket-product-1').click()
      })

      // ASSERT - verify increment/decrement buttons render
      expect(screen.getByTestId('increment-product-1')).toBeInTheDocument()
      expect(screen.getByTestId('decrement-product-1')).toBeInTheDocument()
      // ASSERT - verify add/remove buttons do NOT render (product page context)
      expect(screen.queryByTestId('add-to-basket-product-1')).not.toBeInTheDocument()
      expect(screen.queryByTestId('remove-product-1')).not.toBeInTheDocument()
    })
  })

  describe('when user clicks add button (product page)', () => {
    it('hides add button and renders increment/decrement buttons', () => {
      // ARRANGE - setup test state with rendered BasketControls, product not in basket
      const productId = 'product-1'

      render(
        <BasketControls
          productId={productId}
          isBasketPage={false}
        />
      )

      // ACT - trigger user click on add button
      act(() => {
        screen.getByTestId('add-to-basket-product-1').click()
      })

      // ASSERT - verify add button no longer renders
      expect(screen.queryByTestId('add-to-basket-product-1')).not.toBeInTheDocument()
      // ASSERT - verify increment/decrement buttons render
      expect(screen.getByTestId('increment-product-1')).toBeInTheDocument()
      expect(screen.getByTestId('decrement-product-1')).toBeInTheDocument()
    })
  })

  describe('when user clicks decrement button to zero (product page)', () => {
    it('removes product from basket and shows add button', () => {
      // ARRANGE - setup test state with rendered BasketControls, product in basket with quantity 1
      const productId = 'product-1'

      render(
        <BasketControls
          productId={productId}
          isBasketPage={false}
        />
      )

      // ACT - add product to basket via user action, then decrement to zero
      act(() => {
        screen.getByTestId('add-to-basket-product-1').click()
      })
      act(() => {
        screen.getByTestId('decrement-product-1').click()
      })

      // ASSERT - verify add button renders again
      expect(screen.getByTestId('add-to-basket-product-1')).toBeInTheDocument()
      // ASSERT - verify increment/decrement buttons no longer render
      expect(screen.queryByTestId('increment-product-1')).not.toBeInTheDocument()
      expect(screen.queryByTestId('decrement-product-1')).not.toBeInTheDocument()
    })
  })

  describe('when user clicks increment button', () => {
    it('updates quantity display', () => {
      // ARRANGE - setup test state with rendered BasketControls, product in basket
      const productId = 'product-1'

      render(
        <BasketControls
          productId={productId}
          isBasketPage={false}
        />
      )

      // ACT - add product to basket via user action, then increment
      act(() => {
        screen.getByTestId('add-to-basket-product-1').click()
      })
      act(() => {
        screen.getByTestId('increment-product-1').click()
      })

      // ASSERT - verify quantity display updated (UI state change, not store state)
      expect(screen.getByTestId('quantity-display')).toHaveTextContent('2')
    })
  })

  describe('when user clicks decrement button (quantity > 1)', () => {
    it('updates quantity display', () => {
      // ARRANGE - setup test state with rendered BasketControls, product in basket with quantity > 1
      const productId = 'product-1'

      render(
        <BasketControls
          productId={productId}
          isBasketPage={false}
        />
      )

      // ACT - add product twice via user action (quantity = 2), then decrement
      act(() => {
        screen.getByTestId('add-to-basket-product-1').click()
      })
      act(() => {
        screen.getByTestId('increment-product-1').click()
      })
      act(() => {
        screen.getByTestId('decrement-product-1').click()
      })

      // ASSERT - verify quantity display updated (UI state change, not store state)
      expect(screen.getByTestId('quantity-display')).toHaveTextContent('1')
    })
  })

  describe('when incrementing quantity', () => {
    it('increments without limit', async () => {
      // ARRANGE - setup test state with rendered BasketControls, product in basket
      const productId = 'product-1'

      render(
        <BasketControls
          productId={productId}
          isBasketPage={false}
        />
      )

      // ACT - add product
      act(() => {
        screen.getByTestId('add-to-basket-product-1').click()
      })

      // Wait for increment button to appear
      await waitFor(() => {
        expect(screen.getByTestId('increment-product-1')).toBeInTheDocument()
      })

      // Increment many times
      act(() => {
        for (let i = 0; i < 10; i++) {
          screen.getByTestId('increment-product-1').click()
        }
      })

      // ASSERT - verify increment button is still enabled (no stock limit)
      expect(screen.getByTestId('increment-product-1')).not.toBeDisabled()
      expect(screen.getByTestId('quantity-display')).toHaveTextContent('11')
    })
  })
})
