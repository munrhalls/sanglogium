// # Execution Specs: Slice 2 - Component Layer

// ## Selected Slice
// - Slice: Slice 2 - Component Layer - BasketControls
// - Reason: Basket controls for basket page (isBasketPage={true} determines context)

import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import useBasketStore from '../../../../../store/basketStore'
import { BasketControls } from '../../../../../components/features/basket/BasketControls'

describe('basketControlsBasketPage', () => {
  beforeEach(() => {
    useBasketStore.setState({ items: [] })
  })

  describe('on basket page (isBasketPage={true}) when product in basket', () => {
    it('renders increment, decrement, and remove buttons', () => {
      // ARRANGE - setup test state with product in basket
      const productId = 'product-1'
      const displayPriceAtAdd = 100
      const availableStockAtAdd = 10
      act(() => {
        useBasketStore.getState().addProduct(productId, displayPriceAtAdd, availableStockAtAdd)
      })

      // ACT - render BasketControls component with isBasketPage={true}
      render(
        <BasketControls
          productId={productId}
          displayPriceAtAdd={displayPriceAtAdd}
          availableStockAtAdd={availableStockAtAdd}
          isBasketPage={true}
        />
      )

      // ASSERT - verify increment/decrement/remove buttons render
      expect(screen.getByTestId('increment-button')).toBeInTheDocument()
      expect(screen.getByTestId('decrement-button')).toBeInTheDocument()
      expect(screen.getByTestId('remove-button')).toBeInTheDocument()
      // ASSERT - verify add button does NOT render (basket page context)
      expect(screen.queryByTestId('add-button')).not.toBeInTheDocument()
    })
  })

  describe('when user clicks remove button (basket page)', () => {
    it('removes product from basket and hides controls', () => {
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
          isBasketPage={true}
        />
      )

      // ACT - trigger user click on remove button
      act(() => {
        screen.getByTestId('remove-button').click()
      })

      // ASSERT - verify increment/decrement/remove buttons no longer render
      expect(screen.queryByTestId('increment-button')).not.toBeInTheDocument()
      expect(screen.queryByTestId('decrement-button')).not.toBeInTheDocument()
      expect(screen.queryByTestId('remove-button')).not.toBeInTheDocument()
    })
  })

  describe('when quantity is 1 (basket page)', () => {
    it('disables decrement button', () => {
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
          isBasketPage={true}
        />
      )

      // ACT - no action needed, just check disabled state

      // ASSERT - verify decrement button is disabled (basket page behavior - capped at 1)
      expect(screen.getByTestId('decrement-button')).toBeDisabled()
      // ASSERT - verify remove button is still enabled (only way to remove on basket page)
      expect(screen.getByTestId('remove-button')).not.toBeDisabled()
    })
  })
})
