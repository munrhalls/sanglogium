import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import useBasketStore from '../../../../../store/basketStore'
import { ProductCard } from '../../../../../components/features/products/ProductCard'

describe('ProductCard with BasketControls', () => {
  beforeEach(() => {
    useBasketStore.setState({ items: [] })
  })

  describe('when product not in basket', () => {
    it('renders add button only', () => {
      // ARRANGE
      const productId = 'product-1'
      const displayPriceAtAdd = 100
      const availableStockAtAdd = 10

      // ACT
      render(<ProductCard productId={productId} displayPriceAtAdd={displayPriceAtAdd} availableStockAtAdd={availableStockAtAdd} />)

      // ASSERT
      expect(screen.getByTestId('add-button')).toBeInTheDocument()
      expect(screen.queryByTestId('increment-button')).not.toBeInTheDocument()
      expect(screen.queryByTestId('decrement-button')).not.toBeInTheDocument()
      expect(screen.queryByTestId('remove-button')).not.toBeInTheDocument()
    })

    it('adds product to basket when add button clicked', () => {
      // ARRANGE
      const productId = 'product-1'
      const displayPriceAtAdd = 100
      const availableStockAtAdd = 10
      render(<ProductCard productId={productId} displayPriceAtAdd={displayPriceAtAdd} availableStockAtAdd={availableStockAtAdd} />)

      // ACT
      act(() => {
        screen.getByTestId('add-button').click()
      })

      // ASSERT
      const items = useBasketStore.getState().items
      expect(items).toHaveLength(1)
      expect(items[0].productId).toBe(productId)
      expect(items[0].quantity).toBe(1)
    })
  })

  describe('when product in basket', () => {
    beforeEach(() => {
      const productId = 'product-1'
      const displayPriceAtAdd = 100
      const availableStockAtAdd = 10
      act(() => {
        useBasketStore.getState().addProduct(productId, displayPriceAtAdd, availableStockAtAdd)
      })
    })

    it('renders increment/decrement buttons', () => {
      // ARRANGE
      const productId = 'product-1'
      const displayPriceAtAdd = 100
      const availableStockAtAdd = 10

      // ACT
      render(<ProductCard productId={productId} displayPriceAtAdd={displayPriceAtAdd} availableStockAtAdd={availableStockAtAdd} />)

      // ASSERT
      expect(screen.getByTestId('increment-button')).toBeInTheDocument()
      expect(screen.getByTestId('decrement-button')).toBeInTheDocument()
      expect(screen.queryByTestId('add-button')).not.toBeInTheDocument()
      expect(screen.queryByTestId('remove-button')).not.toBeInTheDocument()
    })

    it('updates quantity display when increment button clicked', () => {
      // ARRANGE
      const productId = 'product-1'
      const displayPriceAtAdd = 100
      const availableStockAtAdd = 10
      render(<ProductCard productId={productId} displayPriceAtAdd={displayPriceAtAdd} availableStockAtAdd={availableStockAtAdd} />)

      // ACT
      act(() => {
        screen.getByTestId('increment-button').click()
      })

      // ASSERT
      expect(screen.getByTestId('quantity-display')).toHaveTextContent('2')
      const items = useBasketStore.getState().items
      expect(items[0].quantity).toBe(2)
    })

    it('updates quantity display when decrement button clicked', () => {
      // ARRANGE
      const productId = 'product-1'
      const displayPriceAtAdd = 100
      const availableStockAtAdd = 10
      act(() => {
        useBasketStore.getState().addProduct(productId, displayPriceAtAdd, availableStockAtAdd)
      })
      render(<ProductCard productId={productId} displayPriceAtAdd={displayPriceAtAdd} availableStockAtAdd={availableStockAtAdd} />)

      // ACT
      act(() => {
        screen.getByTestId('decrement-button').click()
      })

      // ASSERT
      expect(screen.getByTestId('quantity-display')).toHaveTextContent('1')
      const items = useBasketStore.getState().items
      expect(items[0].quantity).toBe(1)
    })

    it('removes product from basket when decremented to zero', () => {
      // ARRANGE
      const productId = 'product-1'
      const displayPriceAtAdd = 100
      const availableStockAtAdd = 10
      render(<ProductCard productId={productId} displayPriceAtAdd={displayPriceAtAdd} availableStockAtAdd={availableStockAtAdd} />)

      // ACT
      act(() => {
        screen.getByTestId('decrement-button').click()
      })

      // ASSERT
      expect(screen.getByTestId('add-button')).toBeInTheDocument()
      expect(screen.queryByTestId('increment-button')).not.toBeInTheDocument()
      expect(screen.queryByTestId('decrement-button')).not.toBeInTheDocument()
      const items = useBasketStore.getState().items
      expect(items).toHaveLength(0)
    })
  })
})
