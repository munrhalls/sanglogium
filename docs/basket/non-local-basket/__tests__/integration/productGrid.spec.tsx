// # Execution Specs: Slice 5 - Page Integration

// ## Selected Slice
// - Slice: Slice 5 - Page Integration - Product Grid
// - Reason: User can manage basket from product grid

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, act, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import useBasketStore from '../../../../../store/basketStore'
import { ProductCard } from '../../../../../app/components/features/products/ProductCard'

describe('ProductCard with BasketControls', () => {
  beforeEach(() => {
    useBasketStore.setState({ items: [] })
  })

  afterEach(() => {
    cleanup()
  })

  describe('on product page (isBasketPage={false}) when product not in basket', () => {
    it('renders BasketControls with add button only', () => {
      // ARRANGE - setup test state with product data
      const productId = 'product-1'

      // ACT - render ProductCard component with BasketControls
      render(<ProductCard product={{ _id: productId, name: 'Test Product', price_data: { unit_amount: 10000, currency: 'USD' }, stock: 10, slug: { current: 'test-product' } } as any} />)

      // ASSERT - verify BasketControls renders with add button only
      expect(screen.getByTestId(`add-to-basket-${productId}`)).toBeInTheDocument()
    })
  })

  describe('when user adds product from product grid', () => {
    it('hides add button and renders increment/decrement buttons', () => {
      // ARRANGE - setup test state with rendered ProductCard
      const productId = 'product-1'
      useBasketStore.setState({ items: [] }) // Ensure basket is empty

      render(<ProductCard product={{ _id: productId, name: 'Test Product', price_data: { unit_amount: 10000, currency: 'USD' }, stock: 10, slug: { current: 'test-product' } } as any} />)

      // ACT - trigger user click on add button
      act(() => {
        screen.getByTestId(`add-to-basket-${productId}`).click()
      })

      // ASSERT - verify UI state change - add button gone, increment/decrement shown
      expect(screen.queryByTestId(`add-to-basket-${productId}`)).not.toBeInTheDocument()
      expect(screen.getByTestId(`increment-${productId}`)).toBeInTheDocument()
      expect(screen.getByTestId(`decrement-${productId}`)).toBeInTheDocument()
    })
  })

  describe('basket controls interaction', () => {
    it('should not redirect to product detail page when add button is clicked', () => {
      // ARRANGE - setup test state with rendered ProductCard
      const productId = 'product-1'
      useBasketStore.setState({ items: [] })

      render(<ProductCard product={{ _id: productId, name: 'Test Product', price_data: { unit_amount: 10000, currency: 'USD' }, stock: 10, slug: { current: 'test-product' } } as any} />)

      // ACT - click add button
      act(() => {
        const addButton = screen.getByTestId(`add-to-basket-${productId}`)
        addButton.click()
      })

      // ASSERT - product card should still be in document (no navigation occurred)
      expect(screen.getByTestId('product-card')).toBeInTheDocument()
    })

    it('should not redirect to product detail page when increment button is clicked', () => {
      // ARRANGE - setup test state with product in basket
      const productId = 'product-1'
      useBasketStore.setState({ items: [{ productId, quantity: 1, displayPriceAtAdd: 100, availableStockAtAdd: 10 }] })

      render(<ProductCard product={{ _id: productId, name: 'Test Product', price_data: { unit_amount: 10000, currency: 'USD' }, stock: 10, slug: { current: 'test-product' } } as any} />)

      // ACT - click increment button
      act(() => {
        const incrementButton = screen.getByTestId(`increment-${productId}`)
        incrementButton.click()
      })

      // ASSERT - product card should still be in document (no navigation occurred)
      expect(screen.getByTestId('product-card')).toBeInTheDocument()
    })

    it('should not redirect to product detail page when decrement button is clicked', () => {
      // ARRANGE - setup test state with product in basket
      const productId = 'product-1'
      useBasketStore.setState({ items: [{ productId, quantity: 2, displayPriceAtAdd: 100, availableStockAtAdd: 10 }] })

      render(<ProductCard product={{ _id: productId, name: 'Test Product', price_data: { unit_amount: 10000, currency: 'USD' }, stock: 10, slug: { current: 'test-product' } } as any} />)

      // ACT - click decrement button
      act(() => {
        const decrementButton = screen.getByTestId(`decrement-${productId}`)
        decrementButton.click()
      })

      // ASSERT - product card should still be in document (no navigation occurred)
      expect(screen.getByTestId('product-card')).toBeInTheDocument()
    })
  })
})