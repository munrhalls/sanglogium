// # Execution Specs: Slice 2 - Component Layer

// ## Selected Slice
// - Slice: Slice 2 - Component Layer - BasketControls
// - Reason: Basket controls for basket page (isBasketPage={true} determines context)

import { describe, it, expect } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { BasketControls } from '../../../components/features/basket/BasketControls'

describe('basketControlsBasketPage', () => {

  describe('on basket page (isBasketPage={true}) when product in basket', () => {
    it('renders increment, decrement, and remove buttons', () => {
      // ARRANGE - setup test state with product in basket
      // NOTE: Basket page context assumes product is already in basket.
      // Cannot add product through BasketControls UI on basket page (no add button).
      // This test requires pre-existing state which is a limitation of black-box testing
      // for components that assume external state. Consider integration with parent component
      // or page-level test for full user flow.
      const productId = 'product-1'
      const displayPriceAtAdd = 100
      const availableStockAtAdd = 10

      // ACT - render BasketControls component with isBasketPage={true}
      render(
        <BasketControls
          productId={productId}
          displayPriceAtAdd={displayPriceAtAdd}
          availableStockAtAdd={availableStockAtAdd}
          isBasketPage={true}
        />
      )

      // ASSERT - verify increment/decrement/remove buttons render when product in basket
      // (This assertion will fail without pre-existing basket state)
      expect(screen.getByTestId('increment-product-1')).toBeInTheDocument()
      expect(screen.getByTestId('decrement-product-1')).toBeInTheDocument()
      expect(screen.getByTestId('remove-product-1')).toBeInTheDocument()
      // ASSERT - verify add button does NOT render (basket page context)
      expect(screen.queryByTestId('add-to-basket-product-1')).not.toBeInTheDocument()
    })
  })

  describe('when user clicks remove button (basket page)', () => {
    it('removes product from basket and hides controls', () => {
      // ARRANGE - setup test state with rendered BasketControls, product in basket
      // NOTE: Requires pre-existing basket state (see first test note)
      const productId = 'product-1'
      const displayPriceAtAdd = 100
      const availableStockAtAdd = 10

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
        screen.getByTestId('remove-product-1').click()
      })

      // ASSERT - verify increment/decrement/remove buttons no longer render
      expect(screen.queryByTestId('increment-product-1')).not.toBeInTheDocument()
      expect(screen.queryByTestId('decrement-product-1')).not.toBeInTheDocument()
      expect(screen.queryByTestId('remove-product-1')).not.toBeInTheDocument()
    })
  })

  describe('when quantity is 1 (basket page)', () => {
    it('disables decrement button', () => {
      // ARRANGE - setup test state with rendered BasketControls, product in basket with quantity 1
      // NOTE: Requires pre-existing basket state (see first test note)
      const productId = 'product-1'
      const displayPriceAtAdd = 100
      const availableStockAtAdd = 10

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
      expect(screen.getByTestId('decrement-product-1')).toBeDisabled()
      // ASSERT - verify remove button is still enabled (only way to remove on basket page)
      expect(screen.getByTestId('remove-product-1')).not.toBeDisabled()
    })
  })
})
