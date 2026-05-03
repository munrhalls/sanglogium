// # Execution Specs: Slice 2 - Component Layer

// ## Selected Slice
// - Slice: Slice 2 - Component Layer - BasketControls
// - Reason: Basket controls for product pages (isBasketPage={false} determines context)

import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import useBasketStore from '../../../../../store/basketStore'
import { BasketControls } from '../../../../../components/features/basket/BasketControls'

describe('basketControls', () => {
  beforeEach(() => {
    useBasketStore.setState({ items: [] })
  })

  describe('on product page (isBasketPage={false}) when product not in basket', () => {
    it('renders add button only', () => {
      // ARRANGE - setup test state with product not in basket
      const productId = 'product-1'
      const displayPriceAtAdd = 100
      const availableStockAtAdd = 10

      // ACT - render BasketControls component with isBasketPage={false}
      render(
        <BasketControls
          productId={productId}
          displayPriceAtAdd={displayPriceAtAdd}
          availableStockAtAdd={availableStockAtAdd}
          isBasketPage={false}
        />
      )

      // ASSERT - verify add button renders
      expect(screen.getByTestId('add-button')).toBeInTheDocument()
      // ASSERT - verify increment/decrement/remove buttons do NOT render (product page context)
      expect(screen.queryByTestId('increment-button')).not.toBeInTheDocument()
      expect(screen.queryByTestId('decrement-button')).not.toBeInTheDocument()
      expect(screen.queryByTestId('remove-button')).not.toBeInTheDocument()
    })
  })

  describe('on product page (isBasketPage={false}) when product in basket', () => {
    it('renders increment and decrement buttons (no remove button)', () => {
      // ARRANGE - setup test state with product in basket
      const productId = 'product-1'
      const displayPriceAtAdd = 100
      const availableStockAtAdd = 10
      act(() => {
        useBasketStore.getState().addProduct(productId, displayPriceAtAdd, availableStockAtAdd)
      })

      // ACT - render BasketControls component with isBasketPage={false}
      render(
        <BasketControls
          productId={productId}
          displayPriceAtAdd={displayPriceAtAdd}
          availableStockAtAdd={availableStockAtAdd}
          isBasketPage={false}
        />
      )

      // ASSERT - verify increment/decrement buttons render
      expect(screen.getByTestId('increment-button')).toBeInTheDocument()
      expect(screen.getByTestId('decrement-button')).toBeInTheDocument()
      // ASSERT - verify add/remove buttons do NOT render (product page context)
      expect(screen.queryByTestId('add-button')).not.toBeInTheDocument()
      expect(screen.queryByTestId('remove-button')).not.toBeInTheDocument()
    })
  })

  describe('when user clicks add button (product page)', () => {
    it('hides add button and renders increment/decrement buttons', () => {
      // ARRANGE - setup test state with rendered BasketControls, product not in basket
      const productId = 'product-1'
      const displayPriceAtAdd = 100
      const availableStockAtAdd = 10

      render(
        <BasketControls
          productId={productId}
          displayPriceAtAdd={displayPriceAtAdd}
          availableStockAtAdd={availableStockAtAdd}
          isBasketPage={false}
        />
      )

      // ACT - trigger user click on add button
      act(() => {
        screen.getByTestId('add-button').click()
      })

      // ASSERT - verify add button no longer renders
      expect(screen.queryByTestId('add-button')).not.toBeInTheDocument()
      // ASSERT - verify increment/decrement buttons render
      expect(screen.getByTestId('increment-button')).toBeInTheDocument()
      expect(screen.getByTestId('decrement-button')).toBeInTheDocument()
    })
  })

  describe('when user clicks decrement button to zero (product page)', () => {
    it('removes product from basket and shows add button', () => {
      // ARRANGE - setup test state with rendered BasketControls, product in basket with quantity 1
      const productId = 'product-1'
      const displayPriceAtAdd = 100
      const availableStockAtAdd = 10
      act(() => {
        useBasketStore.getState().addProduct(productId, displayPriceAtAdd, availableStockAtAdd)
      })

      render(
        <BasketControls
          productId={productId}
          displayPriceAtAdd={displayPriceAtAdd}
          availableStockAtAdd={availableStockAtAdd}
          isBasketPage={false}
        />
      )

      // ACT - trigger user click on decrement button
      act(() => {
        screen.getByTestId('decrement-button').click()
      })

      // ASSERT - verify add button renders again
      expect(screen.getByTestId('add-button')).toBeInTheDocument()
      // ASSERT - verify increment/decrement buttons no longer render
      expect(screen.queryByTestId('increment-button')).not.toBeInTheDocument()
      expect(screen.queryByTestId('decrement-button')).not.toBeInTheDocument()
    })
  })

  describe('when user clicks increment button', () => {
    it('updates quantity display', () => {
      // ARRANGE - setup test state with rendered BasketControls, product in basket
      const productId = 'product-1'
      const displayPriceAtAdd = 100
      const availableStockAtAdd = 10
      act(() => {
        useBasketStore.getState().addProduct(productId, displayPriceAtAdd, availableStockAtAdd)
      })

      render(
        <BasketControls
          productId={productId}
          displayPriceAtAdd={displayPriceAtAdd}
          availableStockAtAdd={availableStockAtAdd}
          isBasketPage={false}
        />
      )

      // ACT - trigger user click on increment button
      act(() => {
        screen.getByTestId('increment-button').click()
      })

      // ASSERT - verify quantity display updated (UI state change, not store state)
      expect(screen.getByTestId('quantity-display')).toHaveTextContent('2')
    })
  })

  describe('when user clicks decrement button (quantity > 1)', () => {
    it('updates quantity display', () => {
      // ARRANGE - setup test state with rendered BasketControls, product in basket with quantity > 1
      const productId = 'product-1'
      const displayPriceAtAdd = 100
      const availableStockAtAdd = 10
      act(() => {
        useBasketStore.getState().addProduct(productId, displayPriceAtAdd, availableStockAtAdd)
        useBasketStore.getState().addProduct(productId, displayPriceAtAdd, availableStockAtAdd)
      })

      render(
        <BasketControls
          productId={productId}
          displayPriceAtAdd={displayPriceAtAdd}
          availableStockAtAdd={availableStockAtAdd}
          isBasketPage={false}
        />
      )

      // ACT - trigger user click on decrement button
      act(() => {
        screen.getByTestId('decrement-button').click()
      })

      // ASSERT - verify quantity display updated (UI state change, not store state)
      expect(screen.getByTestId('quantity-display')).toHaveTextContent('1')
    })
  })
})
