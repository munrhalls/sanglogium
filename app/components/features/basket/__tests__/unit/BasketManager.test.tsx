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
})
