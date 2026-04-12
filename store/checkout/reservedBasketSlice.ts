// Guest Checkout Inventory Reservation - Zustand Store Slice
// Matches zustand-store-slice.test.ts interfaces exactly
// Persistence via localStorage, event deduplication helpers, computed getters

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// ============================================================================
// Type Definitions (inline to match test file exactly)
// ============================================================================

export interface ReservedProduct {
  id: string
  name: string
  stripePriceId: string
  requestedQuantity: number
  reservedQuantity: number
  availableQuantity: number
  pricePln: number
  totalPricePln: number
  imageUrl: string | null
  slug: string
  brand: {
    id: string
    name: string
    slug: string
  }
}

export interface ReservedBasket {
  reservationToken: string
  idempotencyKey: string
  expiresAt: string
  amountPln: number
  products: ReservedProduct[]
  createdAt: string
  updatedAt: string
}

export type BasketStatus = 'none' | 'full' | 'decremented' | 'empty'

export interface ReservedBasketState {
  // State
  reservedBasket: ReservedBasket | null
  isLoading: boolean
  error: string | null
  operationInProgress: boolean

  // Actions
  setReservedBasket: (basket: ReservedBasket | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setOperationInProgress: (inProgress: boolean) => void
  clearReservedBasket: () => void

  // Computed
  hasReservedBasket: boolean
  basketStatus: BasketStatus
}

export interface ReservedBasketStore extends ReservedBasketState {
  _lastRequestId: string | null
  _requestQueue: Set<string>
}

// ============================================================================
// Store Factory (matches test's createReservedBasketStore exactly)
// ============================================================================

export const createReservedBasketStore = () => create<ReservedBasketStore>()(
  persist(
    (set, get) => ({
      // Initial state
      reservedBasket: null,
      isLoading: false,
      error: null,
      operationInProgress: false,
      _lastRequestId: null,
      _requestQueue: new Set<string>(),

      // Actions
      setReservedBasket: (basket) => set({ reservedBasket: basket }),

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      setOperationInProgress: (inProgress) => set({ operationInProgress: inProgress }),

      clearReservedBasket: () => set({
        reservedBasket: null,
        error: null,
        _lastRequestId: null
      }),

      // Computed getters
      get hasReservedBasket() {
        return !!get().reservedBasket
      },

      get basketStatus(): BasketStatus {
        const basket = get().reservedBasket
        if (!basket) return 'none'

        const hasEmptyProducts = basket.products.some(p => p.reservedQuantity === 0)
        const hasDecrements = basket.products.some(p => p.reservedQuantity < p.requestedQuantity)

        if (hasEmptyProducts) return 'empty'
        if (hasDecrements) return 'decremented'
        return 'full'
      }
    }),
    {
      name: 'reserved-basket-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        reservedBasket: state.reservedBasket,
        error: state.error
      })
    }
  )
)

// ============================================================================
// Default Singleton Store
// ============================================================================

export const useReservedBasketStore = createReservedBasketStore()

// ============================================================================
// Event Deduplication Helper
// ============================================================================

export const createDeduplicatedAction = (
  store: ReservedBasketStore,
  actionKey: string,
  action: () => Promise<void>
): Promise<void> => {
  const requestId = `${actionKey}-${Date.now()}`

  // Check if already in progress
  if (store._requestQueue.has(actionKey)) {
    console.warn(`Action ${actionKey} already in progress`)
    return Promise.resolve()
  }

  // Add to queue
  store._requestQueue.add(actionKey)
  store._lastRequestId = requestId

  return action()
    .finally(() => {
      // Remove from queue
      store._requestQueue.delete(actionKey)
    })
}

// ============================================================================
// Selectors
// ============================================================================

export const selectReservedBasket = (state: ReservedBasketStore) => state.reservedBasket
export const selectIsLoading = (state: ReservedBasketStore) => state.isLoading
export const selectError = (state: ReservedBasketStore) => state.error
export const selectOperationInProgress = (state: ReservedBasketStore) => state.operationInProgress
export const selectHasReservedBasket = (state: ReservedBasketStore) => state.hasReservedBasket
export const selectBasketStatus = (state: ReservedBasketStore) => state.basketStatus
