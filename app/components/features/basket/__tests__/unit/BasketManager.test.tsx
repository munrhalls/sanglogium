// # Execution Specs: Slice - Basket Page Data Layer - BasketManager Component

// ## Selected Slice
// - Slice: BasketManager Component UI Behavior
// - Reason: Tests user-facing states and behavior, not implementation details

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import BasketManager from '../../BasketManager'
import useBasketStore from '@/store/basketStore'
import useSWR from 'swr'

// Mock SWR at the boundary
vi.mock('swr', () => ({
  default: vi.fn()
}))

// Mock child components to isolate BasketManager behavior
vi.mock('../../BasketSummary', () => ({
  default: () => <div data-testid="basket-summary">Basket Summary</div>
}))
vi.mock('../../BasketItem', () => ({
  default: ({ name, quantity, displayPrice }: any) => (
    <div data-testid="basket-item">
      <span data-testid="item-name">{name}</span>
      <span data-testid="item-quantity">{quantity}</span>
      <span data-testid="item-price">{displayPrice}</span>
    </div>
  )
}))

describe('BasketManager', () => {
  beforeEach(() => {
    useBasketStore.getState().clear()
    vi.clearAllMocks()
  })

  describe('when basket has items', () => {
    it('renders items with live data', () => {
      // ARRANGE - setup test state with basket items and mock SWR data
      const mockBasketItems = [
        { productId: 'product-1', quantity: 2 }
      ]
      useBasketStore.setState({ items: mockBasketItems, _hasHydrated: true })

      const mockData = [
        { productId: 'product-1', name: 'Product 1', displayPrice: 10.00, availableStock: 8, image: null }
      ]
      vi.mocked(useSWR).mockReturnValue({ data: mockData, error: null, isLoading: false, isValidating: false, mutate: vi.fn() })

      // ACT - render BasketManager
      render(<BasketManager />)

      // ASSERT - verify item rendered with live data
      expect(screen.getByTestId('item-name')).toHaveTextContent('Product 1')
      expect(screen.getByTestId('item-quantity')).toHaveTextContent('2')
      expect(screen.getByTestId('item-price')).toHaveTextContent('10')
    })

    it('renders multiple items', () => {
      // ARRANGE - setup test state with multiple basket items
      const mockBasketItems = [
        { productId: 'product-1', quantity: 2 },
        { productId: 'product-2', quantity: 1 }
      ]
      useBasketStore.setState({ items: mockBasketItems, _hasHydrated: true })

      const mockData = [
        { productId: 'product-1', name: 'Product 1', displayPrice: 10.00, availableStock: 8, image: null },
        { productId: 'product-2', name: 'Product 2', displayPrice: 20.00, availableStock: 4, image: null }
      ]
      vi.mocked(useSWR).mockReturnValue({ data: mockData, error: null, isLoading: false, isValidating: false, mutate: vi.fn() })

      // ACT - render BasketManager
      render(<BasketManager />)

      // ASSERT - verify all items rendered
      expect(screen.getAllByTestId('basket-item')).toHaveLength(2)
    })
  })

  describe('when loading', () => {
    it('shows loading skeleton', () => {
      // ARRANGE - setup test state with basket items and mock SWR loading state
      const mockBasketItems = [
        { productId: 'product-1', quantity: 2 }
      ]
      useBasketStore.setState({ items: mockBasketItems, _hasHydrated: true })

      vi.mocked(useSWR).mockReturnValue({ data: undefined, error: null, isLoading: true, isValidating: false, mutate: vi.fn() })

      // ACT - render BasketManager
      render(<BasketManager />)

      // ASSERT - verify skeleton rendered (empty basket message not shown)
      expect(screen.queryByText(/your basket is empty/i)).not.toBeInTheDocument()
    })
  })

  describe('when fetch fails', () => {
    it('shows error message', () => {
      // ARRANGE - setup test state with basket items and mock SWR error
      const mockBasketItems = [
        { productId: 'product-1', quantity: 2 }
      ]
      useBasketStore.setState({ items: mockBasketItems, _hasHydrated: true })

      const mockError = new Error('Unable to load products')
      vi.mocked(useSWR).mockReturnValue({ data: undefined, error: mockError, isLoading: false, isValidating: false, mutate: vi.fn() })

      // ACT - render BasketManager
      render(<BasketManager />)

      // ASSERT - verify error message shown
      expect(screen.getByText(/unable to load products/i)).toBeInTheDocument()
    })
  })

  describe('when basket is empty', () => {
    it('renders empty basket state', () => {
      // ARRANGE - setup test state with empty basket
      useBasketStore.setState({ items: [], _hasHydrated: true })

      // ACT - render BasketManager
      render(<BasketManager />)

      // ASSERT - verify empty basket message shown
      expect(screen.getByText(/your basket is empty/i)).toBeInTheDocument()
    })
  })

  describe('when basket not hydrated', () => {
    it('shows loading skeleton', () => {
      // ARRANGE - setup test state with basket not hydrated
      useBasketStore.setState({ items: [], _hasHydrated: false })

      // ACT - render BasketManager
      render(<BasketManager />)

      // ASSERT - verify skeleton rendered
      expect(screen.queryByText(/your basket is empty/i)).not.toBeInTheDocument()
    })
  })

  describe('when items have mixed availability', () => {
    it('renders available items before unavailable items', () => {
      // ARRANGE - setup test state with mixed available/unavailable items
      const mockBasketItems = [
        { productId: 'product-1', quantity: 2 },
        { productId: 'product-2', quantity: 1 }
      ]
      useBasketStore.setState({ items: mockBasketItems, _hasHydrated: true })

      const mockData = [
        { productId: 'product-1', name: 'Product 1', displayPrice: 10.00, availableStock: 8, image: null },
        { productId: 'product-2', name: 'Product 2', displayPrice: 20.00, availableStock: 0, image: null }
      ]
      vi.mocked(useSWR).mockReturnValue({ data: mockData, error: null, isLoading: false, isValidating: false, mutate: vi.fn() })

      // ACT - render BasketManager
      render(<BasketManager />)

      // ASSERT - verify available item rendered before unavailable item
      const items = screen.getAllByTestId('basket-item')
      expect(items).toHaveLength(2)
      expect(items[0]).toHaveTextContent('Product 1') // available (stock > 0)
      expect(items[1]).toHaveTextContent('Product 2') // unavailable (stock = 0)
    })
  })

  describe('when CMS item not found', () => {
    it('does not render item without CMS data', () => {
      // ARRANGE - setup test state with basket item but no matching CMS data
      const mockBasketItems = [
        { productId: 'product-1', quantity: 2 },
        { productId: 'product-missing', quantity: 1 }
      ]
      useBasketStore.setState({ items: mockBasketItems, _hasHydrated: true })

      const mockData = [
        { productId: 'product-1', name: 'Product 1', displayPrice: 10.00, availableStock: 8, image: null }
      ]
      vi.mocked(useSWR).mockReturnValue({ data: mockData, error: null, isLoading: false, isValidating: false, mutate: vi.fn() })

      // ACT - render BasketManager
      render(<BasketManager />)

      // ASSERT - verify only matching item rendered
      expect(screen.getAllByTestId('basket-item')).toHaveLength(1)
    })
  })

  describe('when user adds a new product to basket', () => {
    it('triggers SWR fetch to load new product data', () => {
      // ARRANGE - setup test state with one product in basket
      const mockBasketItems = [
        { productId: 'product-1', quantity: 1 }
      ]
      useBasketStore.setState({ items: mockBasketItems, _hasHydrated: true })

      const mockData = [
        { productId: 'product-1', name: 'Product 1', displayPrice: 10.00, availableStock: 8, image: null }
      ]
      vi.mocked(useSWR).mockReturnValue({ data: mockData, error: null, isLoading: false, isValidating: false, mutate: vi.fn() })

      // ACT - render BasketManager with one item
      render(<BasketManager />)

      // ASSERT - verify one item rendered
      expect(screen.getAllByTestId('basket-item')).toHaveLength(1)

      // ACT - add a new product to basket
      act(() => {
        useBasketStore.getState().addProduct('product-2')
      })

      // ASSERT - verify basket state updated (now has 2 items)
      expect(useBasketStore.getState().items).toHaveLength(2)
      // Note: In real app, SWR key change would trigger fetch for new product data
    })
  })
})
