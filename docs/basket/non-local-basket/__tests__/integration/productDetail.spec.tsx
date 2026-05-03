// # Execution Specs: Slice 4 - Page Integration

// ## Selected Slice
// - Slice: Slice 4 - Page Integration - Product Detail
// - Reason: User can manage basket on product detail page

import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import useBasketStore from '../../../../../store/basketStore'
import { ProductInfo } from '../../../../../components/features/products/ProductInfo'

describe('ProductInfo with BasketControls', () => {
  beforeEach(() => {
    useBasketStore.setState({ items: [] })
  })

  describe('on product page (isBasketPage={false}) when product not in basket', () => {
    it('renders BasketControls with add button only', () => {
      // ARRANGE - setup test state with product data
      const productId = 'product-1'
      const displayPriceAtAdd = 100
      const availableStockAtAdd = 10

      // ACT - render ProductInfo component with BasketControls
      render(<ProductInfo productId={productId} displayPriceAtAdd={displayPriceAtAdd} availableStockAtAdd={availableStockAtAdd} />)

      // ASSERT - verify BasketControls renders with add button only
      expect(screen.getByTestId('basket-controls')).toBeInTheDocument()
      expect(screen.getByTestId('add-button')).toBeInTheDocument()
      expect(screen.queryByTestId('increment-button')).not.toBeInTheDocument()
      expect(screen.queryByTestId('decrement-button')).not.toBeInTheDocument()
      expect(screen.queryByTestId('remove-button')).not.toBeInTheDocument()
    })
  })

  describe('on product page (isBasketPage={false}) when product in basket', () => {
    it('renders BasketControls with increment/decrement buttons', () => {
      // ARRANGE - setup test state with product in basket
      const productId = 'product-1'
      const displayPriceAtAdd = 100
      const availableStockAtAdd = 10
      act(() => {
        useBasketStore.getState().addProduct(productId, displayPriceAtAdd, availableStockAtAdd)
      })

      // ACT - render ProductInfo component with BasketControls
      render(<ProductInfo productId={productId} displayPriceAtAdd={displayPriceAtAdd} availableStockAtAdd={availableStockAtAdd} />)

      // ASSERT - verify BasketControls renders with increment/decrement buttons (no remove button on product page)
      expect(screen.getByTestId('basket-controls')).toBeInTheDocument()
      expect(screen.getByTestId('increment-button')).toBeInTheDocument()
      expect(screen.getByTestId('decrement-button')).toBeInTheDocument()
      expect(screen.queryByTestId('add-button')).not.toBeInTheDocument()
      expect(screen.queryByTestId('remove-button')).not.toBeInTheDocument()
    })
  })

  describe('when user adds product from product detail', () => {
    it('hides add button and renders increment/decrement buttons', () => {
      // ARRANGE - setup test state with rendered ProductInfo, product not in basket
      const productId = 'product-1'
      const displayPriceAtAdd = 100
      const availableStockAtAdd = 10

      render(<ProductInfo productId={productId} displayPriceAtAdd={displayPriceAtAdd} availableStockAtAdd={availableStockAtAdd} />)

      // ACT - trigger user click on add button
      act(() => {
        screen.getByTestId('add-button').click()
      })

      // ASSERT - verify UI state change (add button hidden, increment/decrement shown)
      expect(screen.queryByTestId('add-button')).not.toBeInTheDocument()
      expect(screen.getByTestId('increment-button')).toBeInTheDocument()
      expect(screen.getByTestId('decrement-button')).toBeInTheDocument()
    })
  })

  describe('when user increments quantity from product detail', () => {
    it('updates quantity display', () => {
      // ARRANGE - setup test state with rendered ProductInfo, product in basket
      const productId = 'product-1'
      const displayPriceAtAdd = 100
      const availableStockAtAdd = 10
      act(() => {
        useBasketStore.getState().addProduct(productId, displayPriceAtAdd, availableStockAtAdd)
      })

      render(<ProductInfo productId={productId} displayPriceAtAdd={displayPriceAtAdd} availableStockAtAdd={availableStockAtAdd} />)

      // ACT - trigger user click on increment button
      act(() => {
        screen.getByTestId('increment-button').click()
      })

      // ASSERT - verify UI state change (quantity display updated)
      expect(screen.getByTestId('quantity-display')).toHaveTextContent('2')
    })
  })

  describe('when user decrements quantity from product detail', () => {
    it('updates quantity display', () => {
      // ARRANGE - setup test state with rendered ProductInfo, product in basket
      const productId = 'product-1'
      const displayPriceAtAdd = 100
      const availableStockAtAdd = 10
      act(() => {
        useBasketStore.getState().addProduct(productId, displayPriceAtAdd, availableStockAtAdd)
        useBasketStore.getState().addProduct(productId, displayPriceAtAdd, availableStockAtAdd)
      })

      render(<ProductInfo productId={productId} displayPriceAtAdd={displayPriceAtAdd} availableStockAtAdd={availableStockAtAdd} />)

      // ACT - trigger user click on decrement button
      act(() => {
        screen.getByTestId('decrement-button').click()
      })

      // ASSERT - verify UI state change (quantity display updated)
      expect(screen.getByTestId('quantity-display')).toHaveTextContent('1')
    })
  })

  describe('when user decrements to zero from product detail', () => {
    it('shows add button and hides increment/decrement buttons', () => {
      // ARRANGE - setup test state with rendered ProductInfo, product in basket with quantity 1
      const productId = 'product-1'
      const displayPriceAtAdd = 100
      const availableStockAtAdd = 10
      act(() => {
        useBasketStore.getState().addProduct(productId, displayPriceAtAdd, availableStockAtAdd)
      })

      render(<ProductInfo productId={productId} displayPriceAtAdd={displayPriceAtAdd} availableStockAtAdd={availableStockAtAdd} />)

      // ACT - trigger user click on decrement button
      act(() => {
        screen.getByTestId('decrement-button').click()
      })

      // ASSERT - verify UI state change (add button shown, increment/decrement hidden)
      expect(screen.getByTestId('add-button')).toBeInTheDocument()
      expect(screen.queryByTestId('increment-button')).not.toBeInTheDocument()
      expect(screen.queryByTestId('decrement-button')).not.toBeInTheDocument()
    })
  })
})
