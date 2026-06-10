import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { mutate } from 'swr'
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
    mutate(() => true, undefined, { revalidate: false })
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

  // BP-5 [EMPTY]: basket is empty → EmptyBasket rendered
  it('renders empty state when basket has no items', () => {
    render(<BasketManager />)

    expect(screen.getByText('Your basket is empty')).toBeInTheDocument()
    expect(screen.queryByTestId('basket-summary')).not.toBeInTheDocument()
  })

  // BP-6 [ERROR]: fetch fails → error message rendered
  it('renders error message when fetch fails', async () => {
    useBasketStore.setState({
      _hasHydrated: true,
      items: [{ productId: 'prod-1', quantity: 1 }],
    })

    mockFetchResponse({ error: 'Network failure' }, false)

    render(<BasketManager />)

    await waitFor(() => {
      expect(screen.getByText('Network failure')).toBeInTheDocument()
    })
  })

  // BP-7 [LOADING]: fetch in progress → skeleton rendered, empty state NOT shown
  it('renders skeleton during fetch, not empty state', () => {
    useBasketStore.setState({
      _hasHydrated: true,
      items: [{ productId: 'prod-1', quantity: 1 }],
    })

    let resolveFetch: (value: unknown) => void
    global.fetch = vi.fn().mockImplementation(
      () => new Promise((resolve) => { resolveFetch = resolve })
    )

    render(<BasketManager />)

    expect(screen.getByLabelText('Loading basket')).toBeInTheDocument()
    expect(screen.queryByText('Your basket is empty')).not.toBeInTheDocument()

    resolveFetch!({ ok: true, json: () => Promise.resolve({ success: true, data: [] }) })
  })

  // BP-8 [DATA-GAP]: item in basket but missing from CMS → item not rendered, count excludes it
  it('excludes items missing from CMS data and adjusts count', async () => {
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
      ],
    })

    render(<BasketManager />)

    await waitFor(() => {
      expect(screen.getByText('Wireless Headphones')).toBeInTheDocument()
    })

    expect(screen.queryByText('USB-C Hub')).not.toBeInTheDocument()
    expect(screen.getByTestId('basket-summary')).toHaveTextContent('2 items, $39.98')
  })

  // --- REGRESSION: RangeError Invalid array length (BP-CRASH-1..3) ---

  // BP-CRASH-1 [MISSING-STOCK]: CMS returns product with no stock/reservedStock → no crash
  it('renders gracefully when product lacks stock and reservedStock fields', async () => {
    useBasketStore.setState({
      _hasHydrated: true,
      items: [{ productId: 'prod-bad', quantity: 2 }],
    })

    mockFetchResponse({
      success: true,
      data: [
        {
          _id: 'prod-bad',
          name: 'Bad Stock Product',
          image: null,
          // stock and reservedStock intentionally omitted
          price_data: { unit_amount: 999, currency: 'usd' },
        },
      ],
    })

    render(<BasketManager />)

    await waitFor(() => {
      expect(screen.queryByLabelText('Loading basket')).not.toBeInTheDocument()
    })

    // Component must not crash → no error boundary message
    expect(screen.queryByText(/Unable to load products/i)).not.toBeInTheDocument()
    expect(document.body.textContent).not.toMatch(/Invalid array length/i)
  })

  // BP-CRASH-2 [RESERVED-EXCEEDS-STOCK]: reservedStock > stock → no crash, quantity capped safe
  it('renders gracefully when reservedStock exceeds stock', async () => {
    useBasketStore.setState({
      _hasHydrated: true,
      items: [{ productId: 'prod-over', quantity: 3 }],
    })

    mockFetchResponse({
      success: true,
      data: [
        {
          _id: 'prod-over',
          name: 'Over-Reserved Product',
          image: null,
          stock: 5,
          reservedStock: 10,
          price_data: { unit_amount: 999, currency: 'usd' },
        },
      ],
    })

    render(<BasketManager />)

    await waitFor(() => {
      expect(screen.queryByLabelText('Loading basket')).not.toBeInTheDocument()
    })

    expect(screen.queryByText(/Unable to load products/i)).not.toBeInTheDocument()
    expect(document.body.textContent).not.toMatch(/Invalid array length/i)
  })

  // BP-CRASH-3 [NEGATIVE-STOCK]: stock is negative → no crash
  it('renders gracefully when stock is negative', async () => {
    useBasketStore.setState({
      _hasHydrated: true,
      items: [{ productId: 'prod-neg', quantity: 1 }],
    })

    mockFetchResponse({
      success: true,
      data: [
        {
          _id: 'prod-neg',
          name: 'Negative Stock Product',
          image: null,
          stock: -3,
          reservedStock: 0,
          price_data: { unit_amount: 999, currency: 'usd' },
        },
      ],
    })

    render(<BasketManager />)

    await waitFor(() => {
      expect(screen.queryByLabelText('Loading basket')).not.toBeInTheDocument()
    })

    expect(screen.queryByText(/Unable to load products/i)).not.toBeInTheDocument()
    expect(document.body.textContent).not.toMatch(/Invalid array length/i)
  })
})
