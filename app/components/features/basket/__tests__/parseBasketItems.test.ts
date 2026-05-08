// # Execution Specs: Slice - Basket Page Data Layer - Parser

// ## Selected Slice
// - Slice: Parser - parseBasketItems
// - Reason: Converts CMS product data to basket display format

import { describe, it, expect } from 'vitest'
import { parseBasketItems } from '../parseBasketItems'

describe('parseBasketItems', () => {
  describe('when converting price_data to displayPrice', () => {
    it('converts cents to dollars (100 cents = $1.00)', () => {
      // ARRANGE - setup test state with CMS product with price in cents
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

      // ASSERT - verify price converted from cents to dollars
      expect(result[0].displayPrice).toBe(1.00)
    })

    it('handles 0 cents correctly', () => {
      // ARRANGE - setup test state with CMS product with 0 price
      const cmsProducts = [
        {
          _id: 'product-1',
          price_data: { currency: 'USD', unit_amount: 0 },
          stock: 10,
          reservedStock: 2,
          name: 'Test Product',
          image: { asset: { _ref: 'image-1' } }
        }
      ]

      // ACT - call parseBasketItems
      const result = parseBasketItems(cmsProducts)

      // ASSERT - verify 0 cents converts to 0 dollars
      expect(result[0].displayPrice).toBe(0)
    })

    it('handles fractional cents', () => {
      // ARRANGE - setup test state with CMS product with fractional cents
      const cmsProducts = [
        {
          _id: 'product-1',
          price_data: { currency: 'USD', unit_amount: 99 },
          stock: 10,
          reservedStock: 2,
          name: 'Test Product',
          image: { asset: { _ref: 'image-1' } }
        }
      ]

      // ACT - call parseBasketItems
      const result = parseBasketItems(cmsProducts)

      // ASSERT - verify fractional cents converted correctly
      expect(result[0].displayPrice).toBe(0.99)
    })

    it('handles large amounts (10000 cents = $100.00)', () => {
      // ARRANGE - setup test state with CMS product with large price
      const cmsProducts = [
        {
          _id: 'product-1',
          price_data: { currency: 'USD', unit_amount: 10000 },
          stock: 10,
          reservedStock: 2,
          name: 'Test Product',
          image: { asset: { _ref: 'image-1' } }
        }
      ]

      // ACT - call parseBasketItems
      const result = parseBasketItems(cmsProducts)

      // ASSERT - verify large amount converted correctly
      expect(result[0].displayPrice).toBe(100.00)
    })
  })

  describe('when calculating availableStock', () => {
    it('calculates stock - reservedStock', () => {
      // ARRANGE - setup test state with CMS product with stock and reservedStock
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

      // ASSERT - verify availableStock = stock - reservedStock
      expect(result[0].availableStock).toBe(8)
    })

    it('handles stock = 0', () => {
      // ARRANGE - setup test state with CMS product with stock = 0
      const cmsProducts = [
        {
          _id: 'product-1',
          price_data: { currency: 'USD', unit_amount: 100 },
          stock: 0,
          reservedStock: 0,
          name: 'Test Product',
          image: { asset: { _ref: 'image-1' } }
        }
      ]

      // ACT - call parseBasketItems
      const result = parseBasketItems(cmsProducts)

      // ASSERT - verify availableStock = 0
      expect(result[0].availableStock).toBe(0)
    })

    it('handles reservedStock = 0', () => {
      // ARRANGE - setup test state with CMS product with reservedStock = 0
      const cmsProducts = [
        {
          _id: 'product-1',
          price_data: { currency: 'USD', unit_amount: 100 },
          stock: 10,
          reservedStock: 0,
          name: 'Test Product',
          image: { asset: { _ref: 'image-1' } }
        }
      ]

      // ACT - call parseBasketItems
      const result = parseBasketItems(cmsProducts)

      // ASSERT - verify availableStock = stock
      expect(result[0].availableStock).toBe(10)
    })

    it('handles availableStock = 0 (stock = reservedStock)', () => {
      // ARRANGE - setup test state with CMS product where stock = reservedStock
      const cmsProducts = [
        {
          _id: 'product-1',
          price_data: { currency: 'USD', unit_amount: 100 },
          stock: 5,
          reservedStock: 5,
          name: 'Test Product',
          image: { asset: { _ref: 'image-1' } }
        }
      ]

      // ACT - call parseBasketItems
      const result = parseBasketItems(cmsProducts)

      // ASSERT - verify availableStock = 0
      expect(result[0].availableStock).toBe(0)
    })

    it('handles negative availableStock (reservedStock > stock)', () => {
      // ARRANGE - setup test state with CMS product where reservedStock > stock
      const cmsProducts = [
        {
          _id: 'product-1',
          price_data: { currency: 'USD', unit_amount: 100 },
          stock: 3,
          reservedStock: 5,
          name: 'Test Product',
          image: { asset: { _ref: 'image-1' } }
        }
      ]

      // ACT - call parseBasketItems
      const result = parseBasketItems(cmsProducts)

      // ASSERT - verify availableStock is negative
      expect(result[0].availableStock).toBe(-2)
    })
  })

  describe('when parsing product name', () => {
    it('extracts name from CMS product', () => {
      // ARRANGE - setup test state with CMS product with name
      const cmsProducts = [
        {
          _id: 'product-1',
          price_data: { currency: 'USD', unit_amount: 100 },
          stock: 10,
          reservedStock: 2,
          name: 'Test Product Name',
          image: { asset: { _ref: 'image-1' } }
        }
      ]

      // ACT - call parseBasketItems
      const result = parseBasketItems(cmsProducts)

      // ASSERT - verify name extracted
      expect(result[0].name).toBe('Test Product Name')
    })

    it('handles missing name field', () => {
      // ARRANGE - setup test state with CMS product without name
      const cmsProducts = [
        {
          _id: 'product-1',
          price_data: { currency: 'USD', unit_amount: 100 },
          stock: 10,
          reservedStock: 2,
          name: '',
          image: { asset: { _ref: 'image-1' } }
        }
      ]

      // ACT - call parseBasketItems
      const result = parseBasketItems(cmsProducts)

      // ASSERT - verify empty string for missing name
      expect(result[0].name).toBe('')
    })
  })

  describe('when parsing product image', () => {
    it('extracts image from CMS product', () => {
      // ARRANGE - setup test state with CMS product with image
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

      // ASSERT - verify image extracted
      expect(result[0].image).toEqual({ asset: { _ref: 'image-1' } })
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
  })

  describe('when parsing multiple products', () => {
    it('maps all products correctly', () => {
      // ARRANGE - setup test state with multiple CMS products
      const cmsProducts = [
        {
          _id: 'product-1',
          price_data: { currency: 'USD', unit_amount: 100 },
          stock: 10,
          reservedStock: 2,
          name: 'Product 1',
          image: { asset: { _ref: 'image-1' } }
        },
        {
          _id: 'product-2',
          price_data: { currency: 'USD', unit_amount: 200 },
          stock: 5,
          reservedStock: 1,
          name: 'Product 2',
          image: { asset: { _ref: 'image-2' } }
        }
      ]

      // ACT - call parseBasketItems
      const result = parseBasketItems(cmsProducts)

      // ASSERT - verify all products mapped correctly
      expect(result).toHaveLength(2)
      expect(result[0].productId).toBe('product-1')
      expect(result[0].displayPrice).toBe(1.00)
      expect(result[0].availableStock).toBe(8)
      expect(result[1].productId).toBe('product-2')
      expect(result[1].displayPrice).toBe(2.00)
      expect(result[1].availableStock).toBe(4)
    })
  })

  describe('when parsing empty array', () => {
    it('returns empty array', () => {
      // ARRANGE - setup test state with empty array
      const cmsProducts: any[] = []

      // ACT - call parseBasketItems
      const result = parseBasketItems(cmsProducts)

      // ASSERT - verify empty array returned
      expect(result).toHaveLength(0)
    })
  })

  describe('boundary conditions', () => {
    it('handles maximum safe integer price', () => {
      // ARRANGE - setup test state with maximum safe integer price
      const cmsProducts = [
        {
          _id: 'product-1',
          price_data: { currency: 'USD', unit_amount: Number.MAX_SAFE_INTEGER },
          stock: 10,
          reservedStock: 2,
          name: 'Test Product',
          image: { asset: { _ref: 'image-1' } }
        }
      ]

      // ACT - call parseBasketItems
      const result = parseBasketItems(cmsProducts)

      // ASSERT - verify large price converted without overflow
      expect(result[0].displayPrice).toBe(Number.MAX_SAFE_INTEGER / 100)
    })
  })
})
