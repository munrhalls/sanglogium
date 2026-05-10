import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import BasketManager from '../../BasketManager'
import useBasketStore from './../../../../../../store/basketStore'

vi.mock('../../BasketSummary', () => ({
  default: ({ itemCount, subtotal }: { itemCount: number; subtotal: number }) => (
    <div data-testid="basket-summary">
      {itemCount} items, ${subtotal}
    </div>
  ),
}))

function mockFetchResponse(data: unknown, ok = true) {
  global.fetch = vi.fn().mockResolvedValue({
    ok,
    json: () => Promise.resolve(data),
  })
}

describe('BasketManager', () => {
  beforeEach(() => {
    useBasketStore.setState({ items: [], _hasHydrated: true })
    vi.clearAllMocks()
    mockFetchResponse({ success: true, data: [] })
  })

  // --- CORE BREAKING POINTS (morsel by morsel) ---

  // BP-1 [SYNC-HAPPY]: basket has items + CMS returns data → user sees product names, prices, summary
  it('renders product names and summary when basket has items and CMS returns data', async () => {
    useBasketStore.setState({
      _hasHydrated: true,
      items: [
        { productId: 'prod-1', quantity: 2 },
        { productId: 'prod-2', quantity: 1 },
      ],
    })

    mockFetchResponse({
      success: true,
      data: [
        {
          _id: 'prod-1',
          name: 'Wireless Headphones',
          image: null,
          stock: 10,
          reservedStock: 0,
          price_data: { unit_amount: 1999, currency: 'usd' },
        },
        {
          _id: 'prod-2',
          name: 'USB-C Hub',
          image: null,
          stock: 5,
          reservedStock: 0,
          price_data: { unit_amount: 2999, currency: 'usd' },
        },
      ],
    })

    render(<BasketManager />)

    await waitFor(() => {
      expect(screen.getByText('Wireless Headphones')).toBeInTheDocument()
    })

    expect(screen.getByText('USB-C Hub')).toBeInTheDocument()
    expect(screen.getByTestId('basket-summary')).toHaveTextContent('3 items, $69.97')
  })

  // BP-2 [SYNC-NEW-ITEM]: new item added after initial load → SWR refetches with expanded trackedIds
  // BP-3 [SYNC-NO-REFETCH-ON-REMOVE]: item removed → no network call, item disappears from UI
  // BP-4 [SYNC-NO-REFETCH-ON-QUANTITY]: quantity changed → no network call, count updates locally
  // BP-5 [EMPTY]: basket is empty → EmptyBasket rendered
  // BP-6 [ERROR]: fetch fails → error message rendered
  // BP-7 [LOADING]: fetch in progress → skeleton rendered, empty state NOT shown
  // BP-8 [DATA-GAP]: item in basket but missing from CMS → item not rendered, count excludes it
})
