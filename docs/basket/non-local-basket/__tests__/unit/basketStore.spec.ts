// # Execution Specs: Slice 1 - Data Layer

// ## Selected Slice
// - Slice: Slice 1 - Data Layer - Zustand Store
// - Reason: Foundation for basket state management

import { describe, it, expect, beforeEach } from 'vitest'
import useBasketStore, { selectTotalItemsCount, selectHasItem, selectItemQuantity } from '../../../../../store/basketStore'

describe('BasketStore Actions', () => {
  beforeEach(() => {
    // Reset store before each test
    useBasketStore.setState({ items: [] })
  })

  describe('when adding new product', () => {
    it('adds item with quantity 1 and increments total count', () => {
      // ARRANGE - setup test state with empty basket, prepare valid product data
      const productId = 'product-1'
      const displayPriceAtAdd = 100
      const availableStockAtAdd = 10
      const state = useBasketStore.getState()
      const initialCount = selectTotalItemsCount(state)

      // ACT - call addProduct with productId, displayPriceAtAdd, availableStockAtAdd
      useBasketStore.getState().addProduct(productId, displayPriceAtAdd, availableStockAtAdd)

      // ASSERT - verify item exists with quantity 1 and total count incremented
      const newState = useBasketStore.getState()
      expect(selectHasItem(newState, productId)).toBe(true)
      expect(selectItemQuantity(newState, productId)).toBe(1)
      expect(selectTotalItemsCount(newState)).toBe(initialCount + 1)
    })

    it('validates productId, displayPriceAtAdd, availableStockAtAdd using Zod schema', () => {
      // ARRANGE - setup test state with empty basket, prepare invalid product data
      const productId = 'product-1'
      const state = useBasketStore.getState()
      const initialCount = selectTotalItemsCount(state)

      // ACT - call addProduct with invalid inputs
      useBasketStore.getState().addProduct('', -1, -1)

      // ASSERT - verify validation fails using Zod schema (no item added)
      const newState = useBasketStore.getState()
      expect(selectHasItem(newState, productId)).toBe(false)
      expect(selectTotalItemsCount(newState)).toBe(initialCount)
    })
  })

  describe('when adding existing product', () => {
    it('increments existing item quantity by 1', () => {
      // ARRANGE - setup test state with product already in basket
      const productId = 'product-1'
      useBasketStore.getState().addProduct(productId, 100, 10)
      const state = useBasketStore.getState()
      const initialQuantity = selectItemQuantity(state, productId)
      const initialCount = selectTotalItemsCount(state)

      // ACT - call addProduct with same productId
      useBasketStore.getState().addProduct(productId, 100, 10)

      // ASSERT - verify existing item quantity increments by 1 and total count increments
      const newState = useBasketStore.getState()
      expect(selectItemQuantity(newState, productId)).toBe(initialQuantity + 1)
      expect(selectTotalItemsCount(newState)).toBe(initialCount + 1)
    })
  })

  describe('when removing product', () => {
    it('removes item from basket and decrements total count', () => {
      // ARRANGE - setup test state with product in basket
      const productId = 'product-1'
      useBasketStore.getState().addProduct(productId, 100, 10)
      const state = useBasketStore.getState()
      const initialCount = selectTotalItemsCount(state)

      // ACT - call removeProduct with productId
      useBasketStore.getState().removeProduct(productId)

      // ASSERT - verify item removed and total count decremented
      const newState = useBasketStore.getState()
      expect(selectHasItem(newState, productId)).toBe(false)
      expect(selectItemQuantity(newState, productId)).toBe(0)
      expect(selectTotalItemsCount(newState)).toBe(initialCount - 1)
    })
  })

  describe('when incrementing quantity', () => {
    it('increases item quantity by 1 and increments total count', () => {
      // ARRANGE - setup test state with product in basket
      const productId = 'product-1'
      useBasketStore.getState().addProduct(productId, 100, 10)
      const state = useBasketStore.getState()
      const initialQuantity = selectItemQuantity(state, productId)
      const initialCount = selectTotalItemsCount(state)

      // ACT - call incrementQuantity with productId
      useBasketStore.getState().incrementQuantity(productId)

      // ASSERT - verify item quantity increases by 1 and total count increments
      const newState = useBasketStore.getState()
      expect(selectItemQuantity(newState, productId)).toBe(initialQuantity + 1)
      expect(selectTotalItemsCount(newState)).toBe(initialCount + 1)
    })

    it('does not increment quantity beyond availableStockAtAdd', () => {
      // ARRANGE - setup test state with product at stock limit
      const productId = 'product-1'
      const availableStockAtAdd = 5
      useBasketStore.getState().addProduct(productId, 100, availableStockAtAdd)
      const state = useBasketStore.getState()
      
      // Increment to stock limit
      for (let i = 0; i < availableStockAtAdd - 1; i++) {
        useBasketStore.getState().incrementQuantity(productId)
      }

      // ACT - attempt to increment beyond stock limit
      useBasketStore.getState().incrementQuantity(productId)

      // ASSERT - verify quantity does not exceed availableStockAtAdd
      const newState = useBasketStore.getState()
      expect(selectItemQuantity(newState, productId)).toBe(availableStockAtAdd)
    })
  })

  describe('when decrementing quantity above 1', () => {
    it('decreases item quantity by 1 and decrements total count', () => {
      // ARRANGE - setup test state with product quantity > 1
      const productId = 'product-1'
      useBasketStore.getState().addProduct(productId, 100, 10)
      useBasketStore.getState().addProduct(productId, 100, 10)
      const state = useBasketStore.getState()
      const initialQuantity = selectItemQuantity(state, productId)
      const initialCount = selectTotalItemsCount(state)

      // ACT - call decrementQuantity with productId
      useBasketStore.getState().decrementQuantity(productId)

      // ASSERT - verify item quantity decreases by 1 and total count decrements
      const newState = useBasketStore.getState()
      expect(selectItemQuantity(newState, productId)).toBe(initialQuantity - 1)
      expect(selectTotalItemsCount(newState)).toBe(initialCount - 1)
    })
  })

  describe('when decrementing quantity to 0', () => {
    it('removes item from basket', () => {
      // ARRANGE - setup test state with product quantity = 1
      const productId = 'product-1'
      useBasketStore.getState().addProduct(productId, 100, 10)
      const state = useBasketStore.getState()
      const initialCount = selectTotalItemsCount(state)

      // ACT - call decrementQuantity with productId
      useBasketStore.getState().decrementQuantity(productId)

      // ASSERT - verify item removed and total count decremented
      const newState = useBasketStore.getState()
      expect(selectHasItem(newState, productId)).toBe(false)
      expect(selectItemQuantity(newState, productId)).toBe(0)
      expect(selectTotalItemsCount(newState)).toBe(initialCount - 1)
    })
  })
})

describe('selectTotalItemsCount', () => {
  beforeEach(() => {
    useBasketStore.setState({ items: [] })
  })

  describe('when basket has items', () => {
    it('returns sum of all item quantities', () => {
      // ARRANGE - setup test state with basket containing items with quantities
      useBasketStore.setState({
        items: [
          { productId: 'product-1', quantity: 2, displayPriceAtAdd: 100, availableStockAtAdd: 10 },
          { productId: 'product-2', quantity: 3, displayPriceAtAdd: 200, availableStockAtAdd: 20 },
        ],
      })

      // ACT - call selectTotalItemsCount selector
      const state = useBasketStore.getState()
      const result = selectTotalItemsCount(state)

      // ASSERT - verify sum of all item quantities returned
      expect(result).toBe(5)
    })
  })

  describe('when basket is empty', () => {
    it('returns 0', () => {
      // ARRANGE - setup test state with empty basket
      useBasketStore.setState({ items: [] })

      // ACT - call selectTotalItemsCount selector
      const state = useBasketStore.getState()
      const result = selectTotalItemsCount(state)

      // ASSERT - verify 0 returned
      expect(result).toBe(0)
    })
  })
})
