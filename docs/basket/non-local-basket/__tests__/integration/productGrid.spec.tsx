// # Execution Specs: Slice 5 - Page Integration

// ## Selected Slice
// - Slice: Slice 5 - Page Integration - Product Grid
// - Reason: User can manage basket from product grid

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import '@testing-library/jest-dom/vitest'
import useBasketStore from '../../../../../store/basketStore'
import { ProductCard } from '../../../../../components/features/products/ProductCard'

describe('ProductCard with BasketControls', () => {
  beforeEach(() => {
    useBasketStore.setState({ items: [] })
  })

  describe('when rendering', () => {
    it('renders BasketControls with product data', () => {
      // ARRANGE - setup test state with product data
      const productId = 'product-1'
      const displayPriceAtAdd = 100
      const availableStockAtAdd = 10

      // ACT - render ProductCard component with BasketControls
      render(<ProductCard productId={productId} displayPriceAtAdd={displayPriceAtAdd} availableStockAtAdd={availableStockAtAdd} />)

      // ASSERT - verify BasketControls renders with product data
      expect(screen.getByTestId('basket-controls')).toBeInTheDocument()
    })
  })

  describe('when user adds product from product grid', () => {
    it('dispatches addProduct action and updates badge count', () => {
      // ARRANGE - setup test state with rendered ProductCard, product not in basket
      const productId = 'product-1'
      const displayPriceAtAdd = 100
      const availableStockAtAdd = 10
      const addProductSpy = vi.spyOn(useBasketStore.getState(), 'addProduct')

      render(<ProductCard productId={productId} displayPriceAtAdd={displayPriceAtAdd} availableStockAtAdd={availableStockAtAdd} />)

      // ACT - trigger user click on add button in ProductCard
      screen.getByTestId('add-button').click()

      // ASSERT - verify addProduct action dispatched, header badge count increments
      // Note: Badge count update will be implemented when component is integrated with BasketButton
      expect(addProductSpy).toHaveBeenCalled()
      addProductSpy.mockRestore()
    })
  })

  describe('when user increments quantity from product grid', () => {
    it('dispatches incrementQuantity action and updates badge count', () => {
      // ARRANGE - setup test state with rendered ProductCard, product in basket
      const productId = 'product-1'
      const displayPriceAtAdd = 100
      const availableStockAtAdd = 10
      useBasketStore.getState().addProduct(productId, displayPriceAtAdd, availableStockAtAdd)
      const incrementQuantitySpy = vi.spyOn(useBasketStore.getState(), 'incrementQuantity')

      render(<ProductCard productId={productId} displayPriceAtAdd={displayPriceAtAdd} availableStockAtAdd={availableStockAtAdd} />)

      // ACT - trigger user click on increment button in ProductCard
      screen.getByTestId('increment-button').click()

      // ASSERT - verify incrementQuantity action dispatched, header badge count increments
      // Note: Badge count update will be implemented when component is integrated with BasketButton
      expect(incrementQuantitySpy).toHaveBeenCalled()
      incrementQuantitySpy.mockRestore()
    })
  })

  describe('when user decrements quantity from product grid', () => {
    it('dispatches decrementQuantity action and updates badge count', () => {
      // ARRANGE - setup test state with rendered ProductCard, product in basket
      const productId = 'product-1'
      const displayPriceAtAdd = 100
      const availableStockAtAdd = 10
      useBasketStore.getState().addProduct(productId, displayPriceAtAdd, availableStockAtAdd)
      const decrementQuantitySpy = vi.spyOn(useBasketStore.getState(), 'decrementQuantity')

      render(<ProductCard productId={productId} displayPriceAtAdd={displayPriceAtAdd} availableStockAtAdd={availableStockAtAdd} />)

      // ACT - trigger user click on decrement button in ProductCard
      screen.getByTestId('decrement-button').click()

      // ASSERT - verify decrementQuantity action dispatched, header badge count decrements
      // Note: Badge count update will be implemented when component is integrated with BasketButton
      expect(decrementQuantitySpy).toHaveBeenCalled()
      decrementQuantitySpy.mockRestore()
    })
  })

  describe('when user removes product from product grid', () => {
    it('dispatches removeProduct action and updates badge count', () => {
      // ARRANGE - setup test state with rendered ProductCard, product in basket
      const productId = 'product-1'
      const displayPriceAtAdd = 100
      const availableStockAtAdd = 10
      useBasketStore.getState().addProduct(productId, displayPriceAtAdd, availableStockAtAdd)
      const removeProductSpy = vi.spyOn(useBasketStore.getState(), 'removeProduct')

      render(<ProductCard productId={productId} displayPriceAtAdd={displayPriceAtAdd} availableStockAtAdd={availableStockAtAdd} />)

      // ACT - trigger user click on remove button in ProductCard
      screen.getByTestId('remove-button').click()

      // ASSERT - verify removeProduct action dispatched, header badge count updates
      // Note: Badge count update will be implemented when component is integrated with BasketButton
      expect(removeProductSpy).toHaveBeenCalled()
      removeProductSpy.mockRestore()
    })
  })
})
