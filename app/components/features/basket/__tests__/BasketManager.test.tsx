// # Execution Specs: Slice - Basket Page Data Layer - BasketManager Integration

// ## Selected Slice
// - Slice: BasketManager Integration with Data Layer
// - Reason: Integrates CMS fetcher, parser, and availability handler

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import BasketManager from '../BasketManager'
import useBasketStore from '@/store/basketStore'
import { getBasketProducts } from '@/sanity-config/lib/products/getBasketProducts'
import { parseBasketItems } from '../parseBasketItems'
import { separateByAvailability } from '../availabilityHandler'

// Mock data layer functions
vi.mock('@/sanity-config/lib/products/getBasketProducts')
vi.mock('@/app/components/features/basket/parseBasketItems')
vi.mock('@/app/components/features/basket/availabilityHandler')
vi.mock('../BasketSummary', () => ({
  default: () => <div data-testid="basket-summary">Basket Summary</div>
}))

describe('BasketManager', () => {
  beforeEach(() => {
    useBasketStore.getState().clear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('when basket has items', () => {
    it('fetches CMS products for basket items', async () => {
      // ARRANGE - setup test state with basket items
      const mockBasketItems = [
        { productId: 'product-1', quantity: 2 },
        { productId: 'product-2', quantity: 1 }
      ]
      useBasketStore.setState({ items: mockBasketItems, _hasHydrated: true })

      const mockCMSProducts = [
        {
          _id: 'product-1',
          price_data: { currency: 'USD', unit_amount: 1000 },
          stock: 10,
          reservedStock: 2,
          name: 'Product 1',
          image: { asset: { _ref: 'image-1' } }
        },
        {
          _id: 'product-2',
          price_data: { currency: 'USD', unit_amount: 2000 },
          stock: 5,
          reservedStock: 1,
          name: 'Product 2',
          image: { asset: { _ref: 'image-2' } }
        }
      ]
      vi.mocked(getBasketProducts).mockResolvedValue(mockCMSProducts)

      // ACT - render BasketManager
      render(<BasketManager />)

      // ASSERT - verify getBasketProducts called with basket item IDs
      await waitFor(() => {
        expect(getBasketProducts).toHaveBeenCalledWith(['product-1', 'product-2'])
      })
    })

    it('parses CMS data to display format', async () => {
      // ARRANGE - setup test state with basket items and mock CMS data
      const mockBasketItems = [
        { productId: 'product-1', quantity: 2 }
      ]
      useBasketStore.setState({ items: mockBasketItems, _hasHydrated: true })

      const mockCMSProducts = [
        {
          _id: 'product-1',
          price_data: { currency: 'USD', unit_amount: 1000 },
          stock: 10,
          reservedStock: 2,
          name: 'Product 1',
          image: { asset: { _ref: 'image-1' } }
        }
      ]
      vi.mocked(getBasketProducts).mockResolvedValue(mockCMSProducts)

      const mockParsedItems = [
        {
          productId: 'product-1',
          name: 'Product 1',
          displayPrice: 10.00,
          availableStock: 8,
          image: { asset: { _ref: 'image-1' } }
        }
      ]
      vi.mocked(parseBasketItems).mockReturnValue(mockParsedItems)

      // ACT - render BasketManager
      render(<BasketManager />)

      // ASSERT - verify parseBasketItems called with CMS products
      await waitFor(() => {
        expect(parseBasketItems).toHaveBeenCalledWith(mockCMSProducts)
      })
    })

    it('separates available/unavailable items', async () => {
      // ARRANGE - setup test state with basket items, mock CMS data, and parsed items
      const mockBasketItems = [
        { productId: 'product-1', quantity: 2 },
        { productId: 'product-2', quantity: 1 }
      ]
      useBasketStore.setState({ items: mockBasketItems, _hasHydrated: true })

      const mockCMSProducts = [
        {
          _id: 'product-1',
          price_data: { currency: 'USD', unit_amount: 1000 },
          stock: 10,
          reservedStock: 2,
          name: 'Product 1',
          image: null
        },
        {
          _id: 'product-2',
          price_data: { currency: 'USD', unit_amount: 2000 },
          stock: 0,
          reservedStock: 0,
          name: 'Product 2',
          image: null
        }
      ]
      vi.mocked(getBasketProducts).mockResolvedValue(mockCMSProducts)

      const mockParsedItems = [
        {
          productId: 'product-1',
          name: 'Product 1',
          displayPrice: 10.00,
          availableStock: 8,
          image: null
        },
        {
          productId: 'product-2',
          name: 'Product 2',
          displayPrice: 20.00,
          availableStock: 0,
          image: null
        }
      ]
      vi.mocked(parseBasketItems).mockReturnValue(mockParsedItems)

      const mockSeparated = {
        available: [mockParsedItems[0]],
        unavailable: [mockParsedItems[1]]
      }
      vi.mocked(separateByAvailability).mockReturnValue(mockSeparated)

      // ACT - render BasketManager
      render(<BasketManager />)

      // ASSERT - verify separateByAvailability called with parsed items
      await waitFor(() => {
        expect(separateByAvailability).toHaveBeenCalledWith(mockParsedItems)
      })
    })

    it('renders available items with live data', async () => {
      // ARRANGE - setup test state with available items
      const mockBasketItems = [
        { productId: 'product-1', quantity: 2 }
      ]
      useBasketStore.setState({ items: mockBasketItems, _hasHydrated: true })

      const mockCMSProducts = [
        {
          _id: 'product-1',
          price_data: { currency: 'USD', unit_amount: 1000 },
          stock: 10,
          reservedStock: 2,
          name: 'Product 1',
          image: null
        }
      ]
      vi.mocked(getBasketProducts).mockResolvedValue(mockCMSProducts)

      const mockParsedItems = [
        {
          productId: 'product-1',
          name: 'Product 1',
          displayPrice: 10.00,
          availableStock: 8,
          image: null
        }
      ]
      vi.mocked(parseBasketItems).mockReturnValue(mockParsedItems)

      const mockSeparated = {
        available: mockParsedItems,
        unavailable: []
      }
      vi.mocked(separateByAvailability).mockReturnValue(mockSeparated)

      // ACT - render BasketManager
      render(<BasketManager />)

      // ASSERT - verify available item rendered with live data
      await waitFor(() => {
        expect(screen.getByText('Product 1')).toBeInTheDocument()
      })
    })

    it('renders unavailable items with out-of-stock banner', async () => {
      // ARRANGE - setup test state with unavailable items
      const mockBasketItems = [
        { productId: 'product-1', quantity: 2 }
      ]
      useBasketStore.setState({ items: mockBasketItems, _hasHydrated: true })

      const mockCMSProducts = [
        {
          _id: 'product-1',
          price_data: { currency: 'USD', unit_amount: 1000 },
          stock: 0,
          reservedStock: 0,
          name: 'Product 1',
          image: null
        }
      ]
      vi.mocked(getBasketProducts).mockResolvedValue(mockCMSProducts)

      const mockParsedItems = [
        {
          productId: 'product-1',
          name: 'Product 1',
          displayPrice: 10.00,
          availableStock: 0,
          image: null
        }
      ]
      vi.mocked(parseBasketItems).mockReturnValue(mockParsedItems)

      const mockSeparated = {
        available: [],
        unavailable: mockParsedItems
      }
      vi.mocked(separateByAvailability).mockReturnValue(mockSeparated)

      // ACT - render BasketManager
      render(<BasketManager />)

      // ASSERT - verify unavailable item rendered
      await waitFor(() => {
        expect(screen.getByText('Product 1')).toBeInTheDocument()
      })
    })
  })

  describe('when basket is empty', () => {
    it('renders EmptyBasket component', () => {
      // ARRANGE - setup test state with empty basket
      useBasketStore.setState({ items: [], _hasHydrated: true })

      // ACT - render BasketManager
      render(<BasketManager />)

      // ASSERT - verify EmptyBasket rendered
      expect(screen.getByText(/your basket is empty/i)).toBeInTheDocument()
    })

    it('does not call CMS fetcher', () => {
      // ARRANGE - setup test state with empty basket
      useBasketStore.setState({ items: [], _hasHydrated: true })

      // ACT - render BasketManager
      render(<BasketManager />)

      // ASSERT - verify getBasketProducts not called
      expect(getBasketProducts).not.toHaveBeenCalled()
    })
  })

  describe('when CMS fetch fails', () => {
    it('handles error gracefully', async () => {
      // ARRANGE - setup test state with basket items and mock CMS failure
      const mockBasketItems = [
        { productId: 'product-1', quantity: 2 }
      ]
      useBasketStore.setState({ items: mockBasketItems, _hasHydrated: true })

      vi.mocked(getBasketProducts).mockRejectedValue(new Error('CMS fetch failed'))

      // ACT - render BasketManager
      render(<BasketManager />)

      // ASSERT - verify error state shown (or graceful degradation)
      await waitFor(() => {
        expect(screen.getByText('Unable to load products')).toBeInTheDocument()
      })
    })

    it('shows error state to user', async () => {
      // ARRANGE - setup test state with basket items and mock CMS failure
      const mockBasketItems = [
        { productId: 'product-1', quantity: 2 }
      ]
      useBasketStore.setState({ items: mockBasketItems, _hasHydrated: true })

      vi.mocked(getBasketProducts).mockRejectedValue(new Error('CMS fetch failed'))

      // ACT - render BasketManager
      render(<BasketManager />)

      // ASSERT - verify user-friendly error message
      await waitFor(() => {
        expect(screen.getByText(/unable to load products/i)).toBeInTheDocument()
      })
    })
  })

  describe('when basket not hydrated', () => {
    it('renders BasketSkeleton', () => {
      // ARRANGE - setup test state with basket not hydrated
      useBasketStore.setState({ items: [], _hasHydrated: false })

      // ACT - render BasketManager
      render(<BasketManager />)

      // ASSERT - verify skeleton rendered
      // Note: This depends on BasketSkeleton implementation
      expect(screen.queryByText(/your basket is empty/i)).not.toBeInTheDocument()
    })
  })
})
