// # Execution Specs: Slice 1 - Data Layer

// ## Selected Slice
// - Slice: Slice 1 - Data Layer - Zustand Store
// - Reason: Foundation for basket state management

import { describe, it, expect, beforeEach } from 'vitest'
import useBasketStore, { selectTotalItemsCount } from '../../../../../store/basketStore'

describe('BasketStore Actions', () => {
  beforeEach(() => {
    // Reset store before each test
    useBasketStore.setState({ items: [] })
  })

  describe('when adding new product', () => {
    it('adds item to items array with quantity 1', () => {
      // ARRANGE - setup test state with empty basket, prepare valid product data
      const productId = 'product-1'
      const displayPriceAtAdd = 100
      const availableStockAtAdd = 10

      // ACT - call addProduct with productId, displayPriceAtAdd, availableStockAtAdd
      useBasketStore.getState().addProduct(productId, displayPriceAtAdd, availableStockAtAdd)

      // ASSERT - verify item added to items array with quantity 1
      const state = useBasketStore.getState()
      expect(state.items).toHaveLength(1)
      expect(state.items[0].productId).toBe(productId)
      expect(state.items[0].quantity).toBe(1)
      expect(state.items[0].displayPriceAtAdd).toBe(displayPriceAtAdd)
      expect(state.items[0].availableStockAtAdd).toBe(availableStockAtAdd)
    })

    it('validates productId, displayPriceAtAdd, availableStockAtAdd using Zod schema', () => {
      // ARRANGE - setup test state with empty basket, prepare invalid product data
      const initialItems = useBasketStore.getState().items.length

      // ACT - call addProduct with invalid inputs
      useBasketStore.getState().addProduct('', -1, -1)

      // ASSERT - verify validation fails using Zod schema (no item added)
      const state = useBasketStore.getState()
      expect(state.items).toHaveLength(initialItems)
    })
  })

  describe('when adding existing product', () => {
    it('increments existing item quantity by 1', () => {
      // ARRANGE - setup test state with product already in basket
      const productId = 'product-1'
      useBasketStore.getState().addProduct(productId, 100, 10)

      // ACT - call addProduct with same productId
      useBasketStore.getState().addProduct(productId, 100, 10)

      // ASSERT - verify existing item quantity increments by 1
      const state = useBasketStore.getState()
      expect(state.items).toHaveLength(1)
      expect(state.items[0].quantity).toBe(2)
    })
  })

  describe('when removing product', () => {
    it('removes item from items array by productId', () => {
      // ARRANGE - setup test state with product in basket
      const productId = 'product-1'
      useBasketStore.getState().addProduct(productId, 100, 10)

      // ACT - call removeProduct with productId
      useBasketStore.getState().removeProduct(productId)

      // ASSERT - verify item removed from items array
      const state = useBasketStore.getState()
      expect(state.items).toHaveLength(0)
    })
  })

  describe('when incrementing quantity', () => {
    it('increases item quantity by 1', () => {
      // ARRANGE - setup test state with product in basket
      const productId = 'product-1'
      useBasketStore.getState().addProduct(productId, 100, 10)

      // ACT - call incrementQuantity with productId
      useBasketStore.getState().incrementQuantity(productId)

      // ASSERT - verify item quantity increases by 1
      const state = useBasketStore.getState()
      expect(state.items[0].quantity).toBe(2)
    })

    it('does not increment quantity beyond availableStockAtAdd', () => {
      // ARRANGE - setup test state with product at stock limit
      const productId = 'product-1'
      const availableStockAtAdd = 5
      useBasketStore.getState().addProduct(productId, 100, availableStockAtAdd)
      
      // Increment to stock limit
      for (let i = 0; i < availableStockAtAdd - 1; i++) {
        useBasketStore.getState().incrementQuantity(productId)
      }

      // ACT - attempt to increment beyond stock limit
      useBasketStore.getState().incrementQuantity(productId)

      // ASSERT - verify quantity does not exceed availableStockAtAdd
      const state = useBasketStore.getState()
      expect(state.items[0].quantity).toBe(availableStockAtAdd)
    })
  })

  describe('when decrementing quantity above 1', () => {
    it('decreases item quantity by 1', () => {
      // ARRANGE - setup test state with product quantity > 1
      const productId = 'product-1'
      useBasketStore.getState().addProduct(productId, 100, 10)
      useBasketStore.getState().addProduct(productId, 100, 10)

      // ACT - call decrementQuantity with productId
      useBasketStore.getState().decrementQuantity(productId)

      // ASSERT - verify item quantity decreases by 1
      const state = useBasketStore.getState()
      expect(state.items[0].quantity).toBe(1)
    })
  })

  describe('when decrementing quantity to 0', () => {
    it('removes item from items array', () => {
      // ARRANGE - setup test state with product quantity = 1
      const productId = 'product-1'
      useBasketStore.getState().addProduct(productId, 100, 10)

      // ACT - call decrementQuantity with productId
      useBasketStore.getState().decrementQuantity(productId)

      // ASSERT - verify item removed from items array
      const state = useBasketStore.getState()
      expect(state.items).toHaveLength(0)
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
