// # Execution Specs: Slice 2 - Component Layer

// ## Selected Slice
// - Slice: Slice 2 - Component Layer - BasketControls
// - Reason: Basket controls for basket page (isBasketPage={true} determines context)

import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, act, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { BasketControls } from '../../../app/components/features/basket/BasketControls'
import useBasketStore from '../../../store/basketStore'

describe('basketControlsBasketPage', () => {

  afterEach(() => {
    cleanup()
    useBasketStore.getState().clear()
  })

  describe('on basket page (isBasketPage={true}) when product in basket', () => {
    it('renders increment, decrement, and remove buttons', () => {
      // ARRANGE - setup test state with product in basket
      const productId = 'product-1'
      useBasketStore.getState().addProduct(productId)

      // ACT - render BasketControls component with isBasketPage={true}
      render(
        <BasketControls
          productId={productId}
          isBasketPage={true}
        />
      )

      // ASSERT - verify increment/decrement/remove buttons render when product in basket
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
      const productId = 'product-1'
      useBasketStore.getState().addProduct(productId)

      render(
        <BasketControls
          productId={productId}
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
      const productId = 'product-1'
      useBasketStore.getState().addProduct(productId)

      render(
        <BasketControls
          productId={productId}
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
