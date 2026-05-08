// # Execution Specs: Slice - Basket Page Data Layer - Availability Handler

// ## Selected Slice
// - Slice: Availability Handler - separateByAvailability
// - Reason: Separates items by stock availability (stock > 0)

import { describe, it, expect } from 'vitest'
import { separateByAvailability } from '../../lib/availabilityHandler'

describe('separateByAvailability', () => {
  it('separates available items (stock > 0) from unavailable items (stock <= 0)', () => {
    // ARRANGE - setup test state with mixed availability
    const basketItems = [
      { productId: 'product-1', name: 'Product 1', displayPrice: 10.00, availableStock: 5, image: null },
      { productId: 'product-2', name: 'Product 2', displayPrice: 20.00, availableStock: 0, image: null },
      { productId: 'product-3', name: 'Product 3', displayPrice: 30.00, availableStock: 10, image: null },
      { productId: 'product-4', name: 'Product 4', displayPrice: 40.00, availableStock: -2, image: null }
    ]

    // ACT - call separateByAvailability
    const result = separateByAvailability(basketItems)

    // ASSERT - verify items separated correctly
    expect(result.available).toHaveLength(2)
    expect(result.unavailable).toHaveLength(2)
    expect(result.available.map((i: any) => i.productId)).toEqual(['product-1', 'product-3'])
    expect(result.unavailable.map((i: any) => i.productId)).toEqual(['product-2', 'product-4'])
  })

  it('treats boundary: stock = 0 as unavailable', () => {
    // ARRANGE - setup test state with boundary value
    const basketItems = [
      { productId: 'product-1', name: 'Product 1', displayPrice: 10.00, availableStock: 0, image: null }
    ]

    // ACT - call separateByAvailability
    const result = separateByAvailability(basketItems)

    // ASSERT - verify item in unavailable array
    expect(result.available).toHaveLength(0)
    expect(result.unavailable).toHaveLength(1)
  })

  it('handles empty array', () => {
    // ARRANGE - setup test state with empty array
    const basketItems: any[] = []

    // ACT - call separateByAvailability
    const result = separateByAvailability(basketItems)

    // ASSERT - verify both arrays are empty
    expect(result.available).toHaveLength(0)
    expect(result.unavailable).toHaveLength(0)
  })
})
