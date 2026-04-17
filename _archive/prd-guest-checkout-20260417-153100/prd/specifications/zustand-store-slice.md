# Zustand Store Slice Specification

## Reserved Basket Store Slice

```typescript
interface ReservedBasketState {
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
  basketStatus: 'none' | 'full' | 'decremented' | 'empty'
}

interface ReservedBasket {
  reservationToken: string
  idempotencyKey: string
  expiresAt: string // ISO timestamp
  amountPln: number

  products: ReservedProduct[]
  createdAt: string
  updatedAt: string
}

interface ReservedProduct {
  id: string
  name: string
  stripePriceId: string

  // Stock information
  requestedQuantity: number
  reservedQuantity: number
  availableQuantity: number

  // Pricing
  pricePln: number
  totalPricePln: number

  // Product details
  imageUrl: string | null
  slug: string
  brand: {
    id: string
    name: string
    slug: string
  }
}
```

## Store Implementation

```typescript
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface ReservedBasketStore extends ReservedBasketState {
  // Internal state for deduplication
  _lastRequestId: string | null
  _requestQueue: Set<string>
}

export const useReservedBasketStore = create<ReservedBasketStore>()(
  persist(
    (set, get) => ({
      // Initial state
      reservedBasket: null,
      isLoading: false,
      error: null,
      operationInProgress: false,
      _lastRequestId: null,
      _requestQueue: new Set(),

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

      get basketStatus() {
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
      // Only persist these fields
      partialize: (state) => ({
        reservedBasket: state.reservedBasket,
        error: state.error
      })
    }
  )
)
```

## Event Deduplication Helpers

```typescript
// Helper functions for preventing duplicate requests
export const createDeduplicatedAction = (
  store: ReservedBasketStore,
  actionKey: string,
  action: () => Promise<void>
) => {
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

// Usage example for checkout button
export const handleCheckout = () => {
  const store = useReservedBasketStore.getState()

  return createDeduplicatedAction(store, 'checkout', async () => {
    store.setLoading(true)
    store.setError(null)

    try {
      // Make API call...
      // Update store with response
    } catch (error) {
      store.setError(error.message)
    } finally {
      store.setLoading(false)
    }
  })
}
```

## Store Selectors

```typescript
// Selectors for efficient component usage
export const useReservedBasket = () => useReservedBasketStore(state => state.reservedBasket)
export const useBasketStatus = () => useReservedBasketStore(state => state.basketStatus)
export const useIsLoading = () => useReservedBasketStore(state => state.isLoading)
export const useBasketError = () => useReservedBasketStore(state => state.error)
export const useOperationInProgress = () => useReservedBasketStore(state => state.operationInProgress)
export const useHasReservedBasket = () => useReservedBasketStore(state => state.hasReservedBasket)

// Computed selectors
export const useBasketTotals = () => useReservedBasketStore(state => {
  if (!state.reservedBasket) return { items: 0, total: 0 }

  return {
    items: state.reservedBasket.products.reduce((sum, p) => sum + p.reservedQuantity, 0),
    total: state.reservedBasket.amountPln
  }
})

export const useBasketProducts = () => useReservedBasketStore(state =>
  state.reservedBasket?.products || []
)
```

## Integration with PRD Requirements

### 1. **Persistence** (Requirement #1)
- Uses Zustand persist middleware with localStorage
- Only persists essential data (reservedBasket, error)
- Automatic hydration on app load

### 2. **Immutable State** (Core Invariant)
- `reservedBasket` can only be replaced, never modified
- All mutations go through defined actions
- No direct state mutations allowed

### 3. **Operation Tracking** (Multi-tab Prevention)
- `operationInProgress` flag for UI locking
- `_requestQueue` for deduplication
- `_lastRequestId` for request tracking

### 4. **Error Handling** (UI States)
- Separate error state for display
- Clear error on new operations
- Automatic cleanup on success

### 5. **Event Deduplication** (Double Request Prevention)
- Request queue system prevents duplicate actions
- Automatic cleanup on completion
- Warning logs for duplicate attempts

## Usage Examples

```typescript
// In a React component
function CheckoutButton() {
  const { reservedBasket, isLoading, operationInProgress } = useReservedBasketStore()
  const handleCheckout = useCheckoutAction()

  const isDisabled = isLoading || operationInProgress

  return (
    <button
      onClick={handleCheckout}
      disabled={isDisabled}
    >
      {isLoading ? 'Processing...' : 'Checkout'}
    </button>
  )
}
```

```typescript
// In API service layer
async function createReservation(clientBasket: ClientBasket) {
  const store = useReservedBasketStore.getState()

  return createDeduplicatedAction(store, 'create-reservation', async () => {
    const response = await api.post('/checkout/reserve', {
      basket: clientBasket,
      idempotencyKey: generateUUID()
    })

    store.setReservedBasket(response.data)
    return response.data
  })
}
```
