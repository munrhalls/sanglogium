// # Execution Specs: Slice - Basket Page Data Layer - Parser

// ## Selected Slice
// - Slice: Parser - parseBasketItems
// - Reason: Converts CMS product data to basket display format

import { describe, it, expect } from 'vitest'
import { parseBasketItems } from '../../lib/parseBasketItems'

describe('parseBasketItems', () => {
  it('converts price_data cents to dollars and calculates availableStock', () => {
    // ARRANGE - setup test state with CMS product
    const cmsProducts = [
      {
        _id: 'product-1',
        price_data: { currency: 'USD', unit_amount: 100 },
        stock: 10,
        reservedStock: 2,
        name: 'Test Product',
        image: { asset: { _ref: 'image-1' } }
      }
    ]

    // ACT - call parseBasketItems
    const result = parseBasketItems(cmsProducts)

    // ASSERT - verify price converted and stock calculated
    expect(result[0].displayPrice).toBe(1.00)
    expect(result[0].availableStock).toBe(8)
    expect(result[0].productId).toBe('product-1')
    expect(result[0].name).toBe('Test Product')
  })

  it('handles missing image field', () => {
    // ARRANGE - setup test state with CMS product without image
    const cmsProducts = [
      {
        _id: 'product-1',
        price_data: { currency: 'USD', unit_amount: 100 },
        stock: 10,
        reservedStock: 2,
        name: 'Test Product',
        image: null
      }
    ]

    // ACT - call parseBasketItems
    const result = parseBasketItems(cmsProducts)

    // ASSERT - verify null for missing image
    expect(result[0].image).toBeNull()
  })

  it('handles empty array', () => {
    // ARRANGE - setup test state with empty array
    const cmsProducts: any[] = []

    // ACT - call parseBasketItems
    const result = parseBasketItems(cmsProducts)

    // ASSERT - verify empty array returned
    expect(result).toHaveLength(0)
  })
})
