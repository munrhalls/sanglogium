// # Execution Specs: Slice 4 - Page Integration

// ## Selected Slice
// - Slice: Slice 4 - Page Integration - Product Detail
// - Reason: User can manage basket on product detail page

import { describe, it, expect } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { ProductInfo } from '../../../app/components/features/products/ProductInfo'

describe('ProductInfo with BasketControls', () => {

  describe('on product page (isBasketPage={false}) when product not in basket', () => {
    it('renders BasketControls with add button only', () => {
      // ARRANGE - setup test state with product data
      const productId = 'product-1'

      // ACT - render ProductInfo component with BasketControls
      render(<ProductInfo product={{ _id: productId, name: 'Test Product', price_data: { unit_amount: 10000, currency: 'USD' }, stock: 10, slug: { current: 'test-product' } } as any} />)

      // ASSERT - verify BasketControls renders with add button only
      expect(screen.getByTestId(`add-to-basket-${productId}`)).toBeInTheDocument()
    })
  })

  describe('on product page (isBasketPage={false}) when product in basket', () => {
    it('renders increment and decrement buttons (no remove button), does not render add button', () => {
      // ARRANGE - setup test state with rendered ProductInfo
      const productId = 'product-1'

      render(<ProductInfo product={{ _id: productId, name: 'Test Product', price_data: { unit_amount: 10000, currency: 'USD' }, stock: 10, slug: { current: 'test-product' } } as any} />)

      // ACT - add product to basket via user action (click add button twice for quantity 2)
      act(() => {
        screen.getByTestId(`add-to-basket-${productId}`).click()
        screen.getByTestId(`increment-${productId}`).click()
      })

      // ASSERT - verify BasketControls renders with increment/decrement buttons
      expect(screen.getByTestId(`increment-${productId}`)).toBeInTheDocument()
      expect(screen.getByTestId(`decrement-${productId}`)).toBeInTheDocument()
      expect(screen.queryByTestId(`remove-${productId}`)).not.toBeInTheDocument()
      expect(screen.queryByTestId(`add-to-basket-${productId}`)).not.toBeInTheDocument()
    })
  })

  describe('when user clicks add product from product detail', () => {
    it('hides add button and renders increment/decrement buttons', () => {
      // ARRANGE - setup test state with rendered ProductInfo
      const productId = 'product-1'

      render(<ProductInfo product={{ _id: productId, name: 'Test Product', price_data: { unit_amount: 10000, currency: 'USD' }, stock: 10, slug: { current: 'test-product' } } as any} />)

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
})
