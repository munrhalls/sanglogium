// # Execution Specs: Slice 1 - Data Layer

// ## Selected Slice
// - Slice: Slice 1 - Data Layer - Zustand Store
// - Reason: Foundation for basket state management

import { describe, it, expect, beforeEach } from 'vitest'
import useBasketStore, { selectTotalItemsCount, selectHasItem, selectItemQuantity } from './../../basketStore'

describe('BasketStore Actions', () => {
  beforeEach(() => {
    // Reset store before each test using public API
    useBasketStore.getState().clear()
  })

  describe('when adding new product', () => {
    it('adds item with quantity 1 and increments total count', () => {
      // ARRANGE - setup test state with empty basket, prepare valid product data
      const productId = 'product-1'
      const initialCount = selectTotalItemsCount(useBasketStore.getState())

      // ACT - call addProduct with productId
      useBasketStore.getState().addProduct(productId)

      // ASSERT - verify item exists with quantity 1 and total count incremented via public selectors
      expect(selectHasItem(useBasketStore.getState(), productId)).toBe(true)
      expect(selectItemQuantity(useBasketStore.getState(), productId)).toBe(1)
      expect(selectTotalItemsCount(useBasketStore.getState())).toBe(initialCount + 1)
    })

    it('rejects empty productId', () => {
      // ARRANGE - setup test state with empty basket, prepare invalid product data
      const productId = 'product-1'
      const initialCount = selectTotalItemsCount(useBasketStore.getState())

      // ACT - call addProduct with invalid productId
      useBasketStore.getState().addProduct('')

      // ASSERT - verify validation fails using Zod schema (no item added) via public selectors
      expect(selectHasItem(useBasketStore.getState(), productId)).toBe(false)
      expect(selectTotalItemsCount(useBasketStore.getState())).toBe(initialCount)
    })
  })

  describe('when adding existing product', () => {
    it('increments existing item quantity by 1', () => {
      // ARRANGE - setup test state with product already in basket
      const productId = 'product-1'
      useBasketStore.getState().addProduct(productId)
      const initialQuantity = selectItemQuantity(useBasketStore.getState(), productId)
      const initialCount = selectTotalItemsCount(useBasketStore.getState())

      // ACT - call addProduct with same productId
      useBasketStore.getState().addProduct(productId)

      // ASSERT - verify existing item quantity increments by 1 and total count increments via public selectors
      expect(selectItemQuantity(useBasketStore.getState(), productId)).toBe(initialQuantity + 1)
      expect(selectTotalItemsCount(useBasketStore.getState())).toBe(initialCount + 1)
    })
  })

  describe('when removing product', () => {
    it('removes item from basket and decrements total count', () => {
      // ARRANGE - setup test state with product in basket
      const productId = 'product-1'
      useBasketStore.getState().addProduct(productId)
      const initialCount = selectTotalItemsCount(useBasketStore.getState())

      // ACT - call removeProduct with productId
      useBasketStore.getState().removeProduct(productId)

      // ASSERT - verify item removed and total count decremented via public selectors
      expect(selectHasItem(useBasketStore.getState(), productId)).toBe(false)
      expect(selectItemQuantity(useBasketStore.getState(), productId)).toBe(0)
      expect(selectTotalItemsCount(useBasketStore.getState())).toBe(initialCount - 1)
    })
  })

  describe('when incrementing quantity', () => {
    it('increases item quantity by 1 and increments total count', () => {
      // ARRANGE - setup test state with product in basket
      const productId = 'product-1'
      useBasketStore.getState().addProduct(productId)
      const initialQuantity = selectItemQuantity(useBasketStore.getState(), productId)
      const initialCount = selectTotalItemsCount(useBasketStore.getState())

      // ACT - call incrementQuantity with productId
      useBasketStore.getState().incrementQuantity(productId)

      // ASSERT - verify item quantity increases by 1 and total count increments via public selectors
      expect(selectItemQuantity(useBasketStore.getState(), productId)).toBe(initialQuantity + 1)
      expect(selectTotalItemsCount(useBasketStore.getState())).toBe(initialCount + 1)
    })

    it('increases item quantity without stock limit', () => {
      // ARRANGE - setup test state with product in basket
      const productId = 'product-1'
      useBasketStore.getState().addProduct(productId)
      const initialQuantity = selectItemQuantity(useBasketStore.getState(), productId)

      // ACT - call incrementQuantity multiple times
      for (let i = 0; i < 10; i++) {
        useBasketStore.getState().incrementQuantity(productId)
      }

      // ASSERT - verify quantity increases without limit
      expect(selectItemQuantity(useBasketStore.getState(), productId)).toBe(initialQuantity + 10)
    })
  })

  describe('when decrementing quantity above 1', () => {
    it('decreases item quantity by 1 and decrements total count', () => {
      // ARRANGE - setup test state with product quantity > 1
      const productId = 'product-1'
      useBasketStore.getState().addProduct(productId)
      useBasketStore.getState().addProduct(productId)
      const initialQuantity = selectItemQuantity(useBasketStore.getState(), productId)
      const initialCount = selectTotalItemsCount(useBasketStore.getState())

      // ACT - call decrementQuantity with productId
      useBasketStore.getState().decrementQuantity(productId)

      // ASSERT - verify item quantity decreases by 1 and total count decrements via public selectors
      expect(selectItemQuantity(useBasketStore.getState(), productId)).toBe(initialQuantity - 1)
      expect(selectTotalItemsCount(useBasketStore.getState())).toBe(initialCount - 1)
    })
  })

  describe('when decrementing quantity to 0', () => {
    it('removes item from basket', () => {
      // ARRANGE - setup test state with product quantity = 1
      const productId = 'product-1'
      useBasketStore.getState().addProduct(productId)
      const initialCount = selectTotalItemsCount(useBasketStore.getState())

      // ACT - call decrementQuantity with productId
      useBasketStore.getState().decrementQuantity(productId)

      // ASSERT - verify item removed and total count decremented via public selectors
      expect(selectHasItem(useBasketStore.getState(), productId)).toBe(false)
      expect(selectItemQuantity(useBasketStore.getState(), productId)).toBe(0)
      expect(selectTotalItemsCount(useBasketStore.getState())).toBe(initialCount - 1)
    })
  })
})

describe('selectTotalItemsCount', () => {
  beforeEach(() => {
    useBasketStore.getState().clear()
  })

  describe('when basket has items', () => {
    it('returns sum of all item quantities', () => {
      // ARRANGE - setup test state with basket containing items with quantities
      useBasketStore.getState().addProduct('product-1')
      useBasketStore.getState().addProduct('product-1')
      useBasketStore.getState().addProduct('product-2')
      useBasketStore.getState().addProduct('product-2')
      useBasketStore.getState().addProduct('product-2')

      // ACT - call selectTotalItemsCount selector
      const result = selectTotalItemsCount(useBasketStore.getState())

      // ASSERT - verify sum of all item quantities returned
      expect(result).toBe(5)
    })
  })

  describe('when basket is empty', () => {
    it('returns 0', () => {
      // ARRANGE - setup test state with empty basket
      // Store already cleared in beforeEach

      // ACT - call selectTotalItemsCount selector
      const result = selectTotalItemsCount(useBasketStore.getState())

      // ASSERT - verify 0 returned
      expect(result).toBe(0)
    })
  })
})
