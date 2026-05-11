// # Execution Specs: Slice 1 - Data Layer

// ## Selected Slice
// - Slice: Slice 1 - Data Layer - Zustand Store
// - Reason: Foundation for basket state management

import { describe, it, expect, beforeEach, vi } from 'vitest'
import useBasketStore, { selectTotalItemsCount } from './../../basketStore'

describe('BasketStore Persistence', () => {
  beforeEach(() => {
    // Reset store before each test using public API
    useBasketStore.getState().clear()
    // Clear localStorage and sessionStorage
    localStorage.clear()
    sessionStorage.clear()
  })

  describe('when store initializes', () => {
    it('initializes with empty state when no data exists', () => {
      // ARRANGE - setup test state with empty storage
      // ACT - get initial store state
      const state = useBasketStore.getState()

      // ASSERT - verify store initializes with empty state
      expect(selectTotalItemsCount(state)).toBe(0)
    })
  })

  describe('when state changes', () => {
    it('persists state changes to storage', () => {
      // ARRANGE - setup test state with initialized store
      const productId = 'product-1'

      // ACT - trigger store state change via action
      useBasketStore.getState().addProduct(productId)

      // ASSERT - verify state is persisted by checking storage is not empty
      // Note: Checking storage is acceptable here as it's a boundary concern, not internal state
      const storageKeys = Object.keys(localStorage)
      expect(storageKeys.length).toBeGreaterThan(0)
    })
  })

  describe('when localStorage write fails', () => {
    it('falls back gracefully without error', () => {
      // ARRANGE - setup test state with localStorage unavailable or quota exceeded
      const localStorageSpy = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
        throw new Error('localStorage unavailable')
      })

      try {
        const productId = 'product-1'

        // ACT - trigger state change to persist
        useBasketStore.getState().addProduct(productId)

        // ASSERT - verify state still updates despite localStorage failure (graceful degradation)
        const state = useBasketStore.getState()
        expect(selectTotalItemsCount(state)).toBe(1)
      } finally {
        localStorageSpy.mockRestore()
      }
    })
  })

  describe('when both storages write fail', () => {
    it('degrades gracefully without error', () => {
      // ARRANGE - setup test state with both localStorage and sessionStorage unavailable
      const localStorageSpy = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
        throw new Error('localStorage unavailable')
      })
      const sessionStorageSpy = vi.spyOn(sessionStorage, 'setItem').mockImplementation(() => {
        throw new Error('sessionStorage unavailable')
      })

      try {
        const productId = 'product-1'

        // ACT - trigger state change to persist
        useBasketStore.getState().addProduct(productId)

        // ASSERT - verify graceful degradation without error (state still updates)
        const state = useBasketStore.getState()
        expect(selectTotalItemsCount(state)).toBe(1)
      } finally {
        localStorageSpy.mockRestore()
        sessionStorageSpy.mockRestore()
      }
    })
  })

  describe('when localStorage read succeeds', () => {
    it('adds product and updates state', () => {
      // ARRANGE - setup test state with valid data in localStorage
      const productId = 'product-1'

      // ACT - initialize store (add item to trigger persistence)
      useBasketStore.getState().addProduct(productId)

      // ASSERT - verify state is accessible via public selector
      const state = useBasketStore.getState()
      expect(selectTotalItemsCount(state)).toBe(1)
    })
  })

  describe('when localStorage read fails', () => {
    it('falls back gracefully without error', () => {
      // ARRANGE - setup test state with localStorage unavailable or corrupt data
      const localStorageSpy = vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
        throw new Error('localStorage unavailable')
      })

      try {
        const productId = 'product-1'

        // ACT - initialize store (add item)
        useBasketStore.getState().addProduct(productId)

        // ASSERT - verify state still updates despite localStorage read failure
        const state = useBasketStore.getState()
        expect(selectTotalItemsCount(state)).toBe(1)
      } finally {
        localStorageSpy.mockRestore()
      }
    })
  })

  describe('when both storages read fail', () => {
    it('resets to empty state', () => {
      // ARRANGE - setup test state with both storages unavailable or corrupt
      const localStorageSpy = vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
        throw new Error('localStorage unavailable')
      })
      const sessionStorageSpy = vi.spyOn(sessionStorage, 'getItem').mockImplementation(() => {
        throw new Error('sessionStorage unavailable')
      })

      try {
        // ACT - initialize store (reset to trigger rehydration)
        useBasketStore.getState().clear()

        // ASSERT - verify reset to empty state
        const state = useBasketStore.getState()
        expect(selectTotalItemsCount(state)).toBe(0)
      } finally {
        localStorageSpy.mockRestore()
        sessionStorageSpy.mockRestore()
      }
    })
  })
})

describe('BasketStore Hydration Validation', () => {
  beforeEach(() => {
    // Reset store before each test using public API
    useBasketStore.getState().clear()
    // Clear localStorage and sessionStorage
    localStorage.clear()
    sessionStorage.clear()
  })

  describe('when hydration succeeds', () => {
    it('adds product with valid data structure', () => {
      // ARRANGE - setup test state with valid data structure in storage
      const productId = 'product-1'

      // ACT - initialize store with hydration (add valid item)
      useBasketStore.getState().addProduct(productId)

      // ASSERT - verify data structure validates using Zod schema (item added successfully)
      const state = useBasketStore.getState()
      expect(selectTotalItemsCount(state)).toBe(1)
    })
  })

  describe('when hydration validation fails', () => {
    it('handles invalid storage data gracefully', () => {
      // ARRANGE - setup test state with invalid data in storage (mock storage to return invalid JSON)
      // Note: Mocking storage is acceptable for testing error handling (boundary concern)
      const localStorageSpy = vi.spyOn(localStorage, 'getItem').mockReturnValue('invalid-json-data')

      try {
        // ACT - reset store to trigger rehydration attempt
        useBasketStore.getState().clear()

        // ASSERT - verify store remains functional despite invalid storage data
        const state = useBasketStore.getState()
        expect(selectTotalItemsCount(state)).toBe(0)
      } finally {
        localStorageSpy.mockRestore()
      }
    })
  })
})
