// # Execution Specs: Slice - Basket Page Data Layer - API Route Integration

// ## Selected Slice
// - Slice: API Route - GET /api/basket/products
// - Reason: Tests HTTP endpoint behavior for basket product fetching

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'

// Mock the CMS fetcher at the boundary
vi.mock('@/sanity-config/lib/products/getBasketProducts', () => ({
  getBasketProducts: vi.fn()
}))

import { GET } from '@/app/api/basket/products/route'
import { getBasketProducts } from '@/sanity-config/lib/products/getBasketProducts'

describe('GET /api/basket/products', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('when fetching with valid product IDs', () => {
    it('returns products with success response', async () => {
      // ARRANGE - setup mock CMS response
      const mockProducts = [
        {
          _id: 'product-1',
          name: 'Product 1',
          price_data: { currency: 'USD', unit_amount: 1000 },
          stock: 10,
          reservedStock: 2,
          image: { asset: { _ref: 'image-1' } }
        }
      ]
      vi.mocked(getBasketProducts).mockResolvedValue(mockProducts)

      const request = new NextRequest('http://localhost:3000/api/basket/products?ids=product-1')

      // ACT - call GET handler
      const response = await GET(request)
      const body = await response.json()

      // ASSERT - verify success response with products
      expect(response.status).toBe(200)
      expect(body.success).toBe(true)
      expect(body.data).toEqual(mockProducts)
      expect(getBasketProducts).toHaveBeenCalledWith(['product-1'])
    })

    it('handles multiple product IDs', async () => {
      // ARRANGE - setup mock CMS response with multiple products
      const mockProducts = [
        { _id: 'product-1', name: 'Product 1', price_data: { currency: 'USD', unit_amount: 1000 }, stock: 10, reservedStock: 2, image: null },
        { _id: 'product-2', name: 'Product 2', price_data: { currency: 'USD', unit_amount: 2000 }, stock: 5, reservedStock: 1, image: null }
      ]
      vi.mocked(getBasketProducts).mockResolvedValue(mockProducts)

      const request = new NextRequest('http://localhost:3000/api/basket/products?ids=product-1,product-2')

      // ACT - call GET handler
      const response = await GET(request)
      const body = await response.json()

      // ASSERT - verify all products returned
      expect(response.status).toBe(200)
      expect(body.success).toBe(true)
      expect(body.data).toHaveLength(2)
      expect(getBasketProducts).toHaveBeenCalledWith(['product-1', 'product-2'])
    })
  })

  describe('when fetching with empty IDs', () => {
    it('returns empty array', async () => {
      // ARRANGE - setup request with empty IDs
      const request = new NextRequest('http://localhost:3000/api/basket/products?ids=')

      // ACT - call GET handler
      const response = await GET(request)
      const body = await response.json()

      // ASSERT - verify empty array returned without calling CMS
      expect(response.status).toBe(200)
      expect(body.success).toBe(true)
      expect(body.data).toEqual([])
      expect(getBasketProducts).not.toHaveBeenCalled()
    })

    it('handles missing ids parameter', async () => {
      // ARRANGE - setup request without ids parameter
      const request = new NextRequest('http://localhost:3000/api/basket/products')

      // ACT - call GET handler
      const response = await GET(request)
      const body = await response.json()

      // ASSERT - verify empty array returned without calling CMS
      expect(response.status).toBe(200)
      expect(body.success).toBe(true)
      expect(body.data).toEqual([])
      expect(getBasketProducts).not.toHaveBeenCalled()
    })
  })

  describe('when CMS fetch fails', () => {
    it('returns error response', async () => {
      // ARRANGE - setup mock CMS failure
      vi.mocked(getBasketProducts).mockRejectedValue(new Error('CMS connection failed'))

      const request = new NextRequest('http://localhost:3000/api/basket/products?ids=product-1')

      // ACT - call GET handler
      const response = await GET(request)
      const body = await response.json()

      // ASSERT - verify error response
      expect(response.status).toBe(500)
      expect(body.success).toBe(false)
      expect(body.error).toBe('Unable to load products')
    })
  })

  describe('when CMS returns empty array', () => {
    it('returns success with empty data', async () => {
      // ARRANGE - setup mock CMS to return empty array
      vi.mocked(getBasketProducts).mockResolvedValue([])

      const request = new NextRequest('http://localhost:3000/api/basket/products?ids=non-existent')

      // ACT - call GET handler
      const response = await GET(request)
      const body = await response.json()

      // ASSERT - verify success with empty data
      expect(response.status).toBe(200)
      expect(body.success).toBe(true)
      expect(body.data).toEqual([])
    })
  })
})
