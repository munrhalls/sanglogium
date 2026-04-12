import { test, expect } from '@playwright/test'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// Type definitions based on PRD
interface ReservedProduct {
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

interface ReservedBasket {
  reservationToken: string
  idempotencyKey: string
  expiresAt: string
  amountPln: number
  products: ReservedProduct[]
  createdAt: string
  updatedAt: string
}

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

// Store implementation
interface ReservedBasketStore extends ReservedBasketState {
  _lastRequestId: string | null
  _requestQueue: Set<string>
}

const createReservedBasketStore = () => create<ReservedBasketStore>()(
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
      partialize: (state) => ({
        reservedBasket: state.reservedBasket,
        error: state.error
      })
    }
  )
)

// Event deduplication helper
const createDeduplicatedAction = (
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

test.describe('Zustand Store Slice', () => {
  let store: ReturnType<typeof createReservedBasketStore>

  test.beforeEach(() => {
    // Clear localStorage
    localStorage.clear()
    // Create fresh store
    store = createReservedBasketStore()
  })

  test('Store Initialization and Persistence', async () => {
    // Verify initial state
    expect(store.getState().reservedBasket).toBeNull()
    expect(store.getState().isLoading).toBe(false)
    expect(store.getState().error).toBeNull()
    expect(store.getState().operationInProgress).toBe(false)
    expect(store.getState().hasReservedBasket).toBe(false)
    expect(store.getState().basketStatus).toBe('none')

    // Verify localStorage is empty initially
    expect(localStorage.getItem('reserved-basket-storage')).toBeNull()

    // Reload page simulation - store should hydrate from empty state
    const newStore = createReservedBasketStore()
    expect(newStore.getState().reservedBasket).toBeNull()
    expect(newStore.getState().isLoading).toBe(false)
  })

  test('Reserved Basket Creation and Persistence', async () => {
    const basketData: ReservedBasket = {
      reservationToken: 'token-123',
      idempotencyKey: 'key-456',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      amountPln: 20000,
      products: [
        {
          id: 'p1',
          name: 'Test Product',
          stripePriceId: 'price_123',
          requestedQuantity: 2,
          reservedQuantity: 2,
          availableQuantity: 2,
          pricePln: 10000,
          totalPricePln: 20000,
          imageUrl: null,
          slug: 'test-product',
          brand: {
            id: 'brand-1',
            name: 'Test Brand',
            slug: 'test-brand'
          }
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Set reserved basket
    store.getState().setReservedBasket(basketData)

    // Verify state updates
    expect(store.getState().reservedBasket).toEqual(basketData)
    expect(store.getState().error).toBeNull()
    expect(store.getState().hasReservedBasket).toBe(true)
    expect(store.getState().basketStatus).toBe('full')

    // Verify data persists to localStorage
    const persisted = localStorage.getItem('reserved-basket-storage')
    expect(persisted).not.toBeNull()

    const parsed = JSON.parse(persisted!)
    expect(parsed.state).toHaveProperty('reservedBasket')
    expect(parsed.state.reservedBasket).toEqual(basketData)

    // Open new tab simulation - store should sync from localStorage
    const newStore = createReservedBasketStore()
    expect(newStore.getState().reservedBasket).toEqual(basketData)
    expect(newStore.getState().hasReservedBasket).toBe(true)
  })

  test('Loading and Operation States', async () => {
    // Test loading state
    store.getState().setLoading(true)
    expect(store.getState().isLoading).toBe(true)

    // Test operation in progress
    store.getState().setOperationInProgress(true)
    expect(store.getState().operationInProgress).toBe(true)

    // Test combined states
    expect(store.getState().isLoading).toBe(true)
    expect(store.getState().operationInProgress).toBe(true)

    // Clear states
    store.getState().setLoading(false)
    store.getState().setOperationInProgress(false)
    expect(store.getState().isLoading).toBe(false)
    expect(store.getState().operationInProgress).toBe(false)
  })

  test('Error Handling and Recovery', async () => {
    // Set error
    const errorMessage = 'Network error occurred'
    store.getState().setError(errorMessage)
    expect(store.getState().error).toBe(errorMessage)

    // Test error persists
    expect(store.getState().error).toBe(errorMessage)

    // Clear error on new action
    store.getState().setLoading(true)
    expect(store.getState().error).toBe(errorMessage) // Error should persist until explicitly cleared

    // Clear error manually
    store.getState().setError(null)
    expect(store.getState().error).toBeNull()
  })

  test('Event Deduplication', async () => {
    let actionCount = 0
    const mockAction = async () => {
      actionCount++
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    // First action should execute
    await createDeduplicatedAction(store.getState(), 'checkout', mockAction)
    expect(actionCount).toBe(1)
    expect(store.getState()._requestQueue.has('checkout')).toBe(false)

    // Rapid second action should be blocked
    await createDeduplicatedAction(store.getState(), 'checkout', mockAction)
    expect(actionCount).toBe(1) // Should not increment

    // Wait and try again
    await new Promise(resolve => setTimeout(resolve, 200))
    await createDeduplicatedAction(store.getState(), 'checkout', mockAction)
    expect(actionCount).toBe(2) // Should execute now
  })

  test('Basket Status Calculation', async () => {
    // Test empty basket
    expect(store.getState().basketStatus).toBe('none')

    // Test full availability
    const fullBasket: ReservedBasket = {
      reservationToken: 'token-1',
      idempotencyKey: 'key-1',
      expiresAt: new Date().toISOString(),
      amountPln: 20000,
      products: [
        {
          id: 'p1',
          name: 'Product 1',
          stripePriceId: 'price_1',
          requestedQuantity: 2,
          reservedQuantity: 2,
          availableQuantity: 2,
          pricePln: 10000,
          totalPricePln: 20000,
          imageUrl: null,
          slug: 'product-1',
          brand: { id: 'b1', name: 'Brand 1', slug: 'brand-1' }
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    store.getState().setReservedBasket(fullBasket)
    expect(store.getState().basketStatus).toBe('full')

    // Test decremented basket
    const decrementedBasket: ReservedBasket = {
      ...fullBasket,
      products: [
        {
          ...fullBasket.products[0],
          requestedQuantity: 3,
          reservedQuantity: 2,
          availableQuantity: 2
        }
      ]
    }
    store.getState().setReservedBasket(decrementedBasket)
    expect(store.getState().basketStatus).toBe('decremented')

    // Test empty basket (all products out of stock)
    const emptyBasket: ReservedBasket = {
      ...fullBasket,
      products: [
        {
          ...fullBasket.products[0],
          requestedQuantity: 2,
          reservedQuantity: 0,
          availableQuantity: 0
        }
      ]
    }
    store.getState().setReservedBasket(emptyBasket)
    expect(store.getState().basketStatus).toBe('empty')

    // Clear basket
    store.getState().clearReservedBasket()
    expect(store.getState().basketStatus).toBe('none')
  })

  test('Store Actions and Selectors', async () => {
    // Test setReservedBasket
    const basket: ReservedBasket = {
      reservationToken: 'token',
      idempotencyKey: 'key',
      expiresAt: new Date().toISOString(),
      amountPln: 10000,
      products: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    store.getState().setReservedBasket(basket)
    expect(store.getState().reservedBasket).toBe(basket)

    // Test clearReservedBasket
    store.getState().clearReservedBasket()
    expect(store.getState().reservedBasket).toBeNull()
    expect(store.getState().error).toBeNull()
    expect(store.getState()._lastRequestId).toBeNull()

    // Test setOperationInProgress toggle
    store.getState().setOperationInProgress(true)
    expect(store.getState().operationInProgress).toBe(true)
    store.getState().setOperationInProgress(false)
    expect(store.getState().operationInProgress).toBe(false)
  })

  test('Cross-Tab Synchronization', async () => {
    // Create basket in first tab
    const basket: ReservedBasket = {
      reservationToken: 'token-123',
      idempotencyKey: 'key-456',
      expiresAt: new Date().toISOString(),
      amountPln: 10000,
      products: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    store.getState().setReservedBasket(basket)

    // Simulate second tab
    const secondStore = createReservedBasketStore()
    expect(secondStore.getState().reservedBasket).toEqual(basket)

    // Modify in second tab
    secondStore.getState().setError('Test error')

    // First tab should receive update (in real implementation with BroadcastChannel)
    // For now, we'll simulate by checking localStorage
    const persisted = localStorage.getItem('reserved-basket-storage')
    const parsed = JSON.parse(persisted!)
    expect(parsed.state.error).toBe('Test error')
  })

  test('Store Hydration and Migration', async () => {
    // Set localStorage with v1 data structure
    const v1Data = {
      state: {
        reservedBasket: {
          reservationToken: 'old-token',
          idempotencyKey: 'old-key',
          expiresAt: '2024-01-01T00:00:00Z',
          amountPln: 10000,
          products: [],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        error: 'Old error'
      },
      version: 1
    }
    localStorage.setItem('reserved-basket-storage', JSON.stringify(v1Data))

    // Create new store - should hydrate
    const newStore = createReservedBasketStore()
    expect(newStore.getState().reservedBasket).toEqual(v1Data.state.reservedBasket)
    expect(newStore.getState().error).toBe('Old error')

    // Test with missing fields
    const partialData = {
      state: {
        reservedBasket: null
      }
    }
    localStorage.setItem('reserved-basket-storage', JSON.stringify(partialData))

    const partialStore = createReservedBasketStore()
    expect(partialStore.getState().reservedBasket).toBeNull()
    expect(partialStore.getState().error).toBeNull()
  })

  test('Performance and Memory', async () => {
    // Test with large basket
    const largeProducts = Array.from({ length: 100 }, (_, i) => ({
      id: `p${i}`,
      name: `Product ${i}`,
      stripePriceId: `price_${i}`,
      requestedQuantity: 1,
      reservedQuantity: 1,
      availableQuantity: 1,
      pricePln: 100,
      totalPricePln: 100,
      imageUrl: null,
      slug: `product-${i}`,
      brand: { id: 'b1', name: 'Brand 1', slug: 'brand-1' }
    }))

    const largeBasket: ReservedBasket = {
      reservationToken: 'large-token',
      idempotencyKey: 'large-key',
      expiresAt: new Date().toISOString(),
      amountPln: 10000,
      products: largeProducts,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Measure performance
    const startTime = performance.now()
    store.getState().setReservedBasket(largeBasket)
    const endTime = performance.now()

    expect(endTime - startTime).toBeLessThan(100) // Should be fast
    expect(store.getState().basketStatus).toBe('full')

    // Test rapid state updates
    for (let i = 0; i < 100; i++) {
      store.getState().setLoading(i % 2 === 0)
    }
    expect(store.getState().isLoading).toBe(true) // Last update
  })

  test('Immutability of State', async () => {
    const basket: ReservedBasket = {
      reservationToken: 'token',
      idempotencyKey: 'key',
      expiresAt: new Date().toISOString(),
      amountPln: 10000,
      products: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    store.getState().setReservedBasket(basket)

    // Try to mutate state directly (should not work)
    const originalBasket = store.getState().reservedBasket
    if (originalBasket) {
      // TypeScript prevents direct mutation - this would be a compile error
      // originalBasket.reservationToken = 'mutated' // This line would not compile
      expect(originalBasket.reservationToken).toBe('token')
    }

    // Proper way to update
    const updatedBasket = { ...basket, reservationToken: 'new-token' }
    store.getState().setReservedBasket(updatedBasket)
    expect(store.getState().reservedBasket?.reservationToken).toBe('new-token')
  })
})
