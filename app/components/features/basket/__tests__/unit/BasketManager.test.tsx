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
  // BP-2 [SYNC-NEW-ITEM]: new item added after initial load → SWR refetches with expanded trackedIds
  // BP-3 [SYNC-NO-REFETCH-ON-REMOVE]: item removed → no network call, item disappears from UI
  // BP-4 [SYNC-NO-REFETCH-ON-QUANTITY]: quantity changed → no network call, count updates locally
  // BP-5 [EMPTY]: basket is empty → EmptyBasket rendered
  // BP-6 [ERROR]: fetch fails → error message rendered
  // BP-7 [LOADING]: fetch in progress → skeleton rendered, empty state NOT shown
  // BP-8 [DATA-GAP]: item in basket but missing from CMS → item not rendered, count excludes it
})
