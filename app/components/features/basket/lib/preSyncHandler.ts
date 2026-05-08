// Types matching basket store
export type BasketItem = {
  productId: string
  quantity: number
}

export type PreSyncResult =
  | { type: 'empty' }
  | { type: 'pre-sync'; items: BasketItem[] }

export interface PreSyncState {
  hasHydrated: boolean
  items: BasketItem[]
}

/**
 * Pre-sync basket handler determines the pre-sync state for the basket page.
 * Returns empty state if basket has not hydrated or has no items.
 * Returns pre-sync state with items if basket has hydrated and has items.
 */
export function preSyncBasketHandler(state: PreSyncState): PreSyncResult {
  const { hasHydrated, items } = state

  if (!hasHydrated) {
    return { type: 'empty' }
  }

  if (items.length === 0) {
    return { type: 'empty' }
  }

  return { type: 'pre-sync', items }
}
