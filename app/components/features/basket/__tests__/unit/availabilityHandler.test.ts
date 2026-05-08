// # Execution Specs: Slice - Basket Page Data Layer - Availability Handler

// ## Selected Slice
// - Slice: Availability Handler - separateByAvailability
// - Reason: Separates items by stock availability (stock > 0)

import { describe, it, expect } from 'vitest'
import { separateByAvailability } from '../../availabilityHandler'

describe('separateByAvailability', () => {
  describe('when all items have availableStock > 0', () => {
    it('returns all items in available array', () => {
      // ARRANGE - setup test state with all items having availableStock > 0
      const basketItems = [
        { productId: 'product-1', name: 'Product 1', displayPrice: 10.00, availableStock: 5 },
        { productId: 'product-2', name: 'Product 2', displayPrice: 20.00, availableStock: 10 },
        { productId: 'product-3', name: 'Product 3', displayPrice: 30.00, availableStock: 1 }
      ]

      // ACT - call separateByAvailability
      const result = separateByAvailability(basketItems)

      // ASSERT - verify all items in available array
      expect(result.available).toHaveLength(3)
      expect(result.unavailable).toHaveLength(0)
    })

    it('returns empty unavailable array', () => {
      // ARRANGE - setup test state with all items having availableStock > 0
      const basketItems = [
        { productId: 'product-1', name: 'Product 1', displayPrice: 10.00, availableStock: 5 }
      ]

      // ACT - call separateByAvailability
      const result = separateByAvailability(basketItems)

      // ASSERT - verify unavailable array is empty
      expect(result.unavailable).toHaveLength(0)
    })
  })

  describe('when all items have availableStock <= 0', () => {
    it('returns all items in unavailable array', () => {
      // ARRANGE - setup test state with all items having availableStock <= 0
      const basketItems = [
        { productId: 'product-1', name: 'Product 1', displayPrice: 10.00, availableStock: 0 },
        { productId: 'product-2', name: 'Product 2', displayPrice: 20.00, availableStock: -5 },
        { productId: 'product-3', name: 'Product 3', displayPrice: 30.00, availableStock: -1 }
      ]

      // ACT - call separateByAvailability
      const result = separateByAvailability(basketItems)

      // ASSERT - verify all items in unavailable array
      expect(result.available).toHaveLength(0)
      expect(result.unavailable).toHaveLength(3)
    })

    it('returns empty available array', () => {
      // ARRANGE - setup test state with all items having availableStock <= 0
      const basketItems = [
        { productId: 'product-1', name: 'Product 1', displayPrice: 10.00, availableStock: 0 }
      ]

      // ACT - call separateByAvailability
      const result = separateByAvailability(basketItems)

      // ASSERT - verify available array is empty
      expect(result.available).toHaveLength(0)
    })
  })

  describe('when items have mixed availability', () => {
    it('separates items correctly', () => {
      // ARRANGE - setup test state with mixed availability
      const basketItems = [
        { productId: 'product-1', name: 'Product 1', displayPrice: 10.00, availableStock: 5 },
        { productId: 'product-2', name: 'Product 2', displayPrice: 20.00, availableStock: 0 },
        { productId: 'product-3', name: 'Product 3', displayPrice: 30.00, availableStock: 10 },
        { productId: 'product-4', name: 'Product 4', displayPrice: 40.00, availableStock: -2 }
      ]

      // ACT - call separateByAvailability
      const result = separateByAvailability(basketItems)

      // ASSERT - verify items separated correctly
      expect(result.available).toHaveLength(2)
      expect(result.unavailable).toHaveLength(2)
      expect(result.available.map((i: any) => i.productId)).toEqual(['product-1', 'product-3'])
      expect(result.unavailable.map((i: any) => i.productId)).toEqual(['product-2', 'product-4'])
    })
  })

  describe('boundary conditions', () => {
    it('treats availableStock = 0 as unavailable', () => {
      // ARRANGE - setup test state with availableStock = 0
      const basketItems = [
        { productId: 'product-1', name: 'Product 1', displayPrice: 10.00, availableStock: 0 }
      ]

      // ACT - call separateByAvailability
      const result = separateByAvailability(basketItems)

      // ASSERT - verify item in unavailable array
      expect(result.available).toHaveLength(0)
      expect(result.unavailable).toHaveLength(1)
      expect(result.unavailable[0].productId).toBe('product-1')
    })

    it('treats availableStock = 1 as available', () => {
      // ARRANGE - setup test state with availableStock = 1
      const basketItems = [
        { productId: 'product-1', name: 'Product 1', displayPrice: 10.00, availableStock: 1 }
      ]

      // ACT - call separateByAvailability
      const result = separateByAvailability(basketItems)

      // ASSERT - verify item in available array
      expect(result.available).toHaveLength(1)
      expect(result.unavailable).toHaveLength(0)
      expect(result.available[0].productId).toBe('product-1')
    })

    it('handles negative availableStock', () => {
      // ARRANGE - setup test state with negative availableStock
      const basketItems = [
        { productId: 'product-1', name: 'Product 1', displayPrice: 10.00, availableStock: -5 }
      ]

      // ACT - call separateByAvailability
      const result = separateByAvailability(basketItems)

      // ASSERT - verify item in unavailable array
      expect(result.available).toHaveLength(0)
      expect(result.unavailable).toHaveLength(1)
      expect(result.unavailable[0].productId).toBe('product-1')
    })

    it('handles large positive availableStock', () => {
      // ARRANGE - setup test state with large availableStock
      const basketItems = [
        { productId: 'product-1', name: 'Product 1', displayPrice: 10.00, availableStock: 10000 }
      ]

      // ACT - call separateByAvailability
      const result = separateByAvailability(basketItems)

      // ASSERT - verify item in available array
      expect(result.available).toHaveLength(1)
      expect(result.unavailable).toHaveLength(0)
      expect(result.available[0].productId).toBe('product-1')
    })
  })

  describe('when array is empty', () => {
    it('returns empty arrays for both', () => {
      // ARRANGE - setup test state with empty array
      const basketItems: any[] = []

      // ACT - call separateByAvailability
      const result = separateByAvailability(basketItems)

      // ASSERT - verify both arrays are empty
      expect(result.available).toHaveLength(0)
      expect(result.unavailable).toHaveLength(0)
    })
  })

  describe('when single item', () => {
    it('handles single available item', () => {
      // ARRANGE - setup test state with single available item
      const basketItems = [
        { productId: 'product-1', name: 'Product 1', displayPrice: 10.00, availableStock: 5 }
      ]

      // ACT - call separateByAvailability
      const result = separateByAvailability(basketItems)

      // ASSERT - verify single item in available array
      expect(result.available).toHaveLength(1)
      expect(result.unavailable).toHaveLength(0)
    })

    it('handles single unavailable item', () => {
      // ARRANGE - setup test state with single unavailable item
      const basketItems = [
        { productId: 'product-1', name: 'Product 1', displayPrice: 10.00, availableStock: 0 }
      ]

      // ACT - call separateByAvailability
      const result = separateByAvailability(basketItems)

      // ASSERT - verify single item in unavailable array
      expect(result.available).toHaveLength(0)
      expect(result.unavailable).toHaveLength(1)
    })
  })

  describe('state transitions', () => {
    it('handles transition from available to unavailable', () => {
      // ARRANGE - setup test state simulating stock depletion
      const basketItemsBefore = [
        { productId: 'product-1', name: 'Product 1', displayPrice: 10.00, availableStock: 5 }
      ]
      const basketItemsAfter = [
        { productId: 'product-1', name: 'Product 1', displayPrice: 10.00, availableStock: 0 }
      ]

      // ACT - call separateByAvailability for both states
      const resultBefore = separateByAvailability(basketItemsBefore)
      const resultAfter = separateByAvailability(basketItemsAfter)

      // ASSERT - verify transition from available to unavailable
      expect(resultBefore.available).toHaveLength(1)
      expect(resultAfter.available).toHaveLength(0)
      expect(resultAfter.unavailable).toHaveLength(1)
    })

    it('handles transition from unavailable to available', () => {
      // ARRANGE - setup test state simulating stock replenishment
      const basketItemsBefore = [
        { productId: 'product-1', name: 'Product 1', displayPrice: 10.00, availableStock: 0 }
      ]
      const basketItemsAfter = [
        { productId: 'product-1', name: 'Product 1', displayPrice: 10.00, availableStock: 5 }
      ]

      // ACT - call separateByAvailability for both states
      const resultBefore = separateByAvailability(basketItemsBefore)
      const resultAfter = separateByAvailability(basketItemsAfter)

      // ASSERT - verify transition from unavailable to available
      expect(resultBefore.available).toHaveLength(0)
      expect(resultAfter.available).toHaveLength(1)
      expect(resultAfter.unavailable).toHaveLength(0)
    })
  })
})
