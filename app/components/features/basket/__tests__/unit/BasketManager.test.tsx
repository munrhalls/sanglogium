// # Execution Specs: Slice - Basket Page Data Layer - BasketManager Component

// ## Selected Slice
// - Slice: BasketManager Component UI Behavior
// - Reason: Tests user-facing states and behavior, not implementation details

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import BasketManager from '../../BasketManager'
import useBasketStore from '@/store/basketStore'
import useSWR from 'swr'

// Mock SWR at the boundary
vi.mock('swr', () => ({
  default: vi.fn()
}))

// Mock BasketSummary to isolate BasketManager behavior (CheckoutButton requires Next.js router)
vi.mock('../../BasketSummary', () => ({
  default: () => <div data-testid="basket-summary">Basket Summary</div>
}))

describe('BasketManager', () => {
  beforeEach(() => {
    useBasketStore.getState().clear()
    vi.clearAllMocks()
  })

  describe('when basket has items and data loads successfully', () => {
    it('renders basket items with live data from CMS', () => {
      // ARRANGE - setup test state with basket items and mock SWR data
      const mockBasketItems = [
        { productId: 'product-1', quantity: 2 }
      ]
      useBasketStore.setState({ items: mockBasketItems, _hasHydrated: true })

      const mockData = [
        { _id: 'product-1', name: 'Product 1', price_data: { unit_amount: 1000, currency: 'USD' }, stock: 10, reservedStock: 2, image: null }
      ]
      vi.mocked(useSWR).mockReturnValue({ data: mockData, error: null, isLoading: false, isValidating: false, mutate: vi.fn() })

      // ACT - render BasketManager
      render(<BasketManager />)

      // ASSERT - verify item rendered with live data
      expect(screen.getByText('Product 1')).toBeInTheDocument()
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

  describe('when loading data', () => {
    it('renders loading skeleton', () => {
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

  describe('when data fetch fails', () => {
    it('renders error message', () => {
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
})
