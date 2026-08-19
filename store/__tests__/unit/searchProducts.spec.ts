// # Execution Specs: Search Feature — Data Layer

// ## Selected Slice
// - Slice: searchProducts.ts — GROQ queries for autocomplete and full search
// - Reason: Foundation for search data fetching; pagination, scoring, and validation logic

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  searchProductsAutocomplete,
  searchProductsFull,
} from '@/sanity-cms/lib/products/searchProducts'
import type { AutocompleteProduct, SearchProduct } from '@/sanity-cms/lib/products/searchProducts'

// Mock sanity client
vi.mock('@/sanity-cms/lib/client', () => ({
  sanityFetch: vi.fn(),
}))

import { sanityFetch } from '@/sanity-cms/lib/client'

const mockSanityFetch = sanityFetch as ReturnType<typeof vi.fn>

describe('searchProductsAutocomplete', () => {
  beforeEach(() => {
    mockSanityFetch.mockReset()
  })

  describe('when query is too short', () => {
    it('returns empty array for empty string', async () => {
      const result = await searchProductsAutocomplete('')
      expect(result).toEqual([])
      expect(mockSanityFetch).not.toHaveBeenCalled()
    })

    it('returns empty array for single character', async () => {
      const result = await searchProductsAutocomplete('a')
      expect(result).toEqual([])
      expect(mockSanityFetch).not.toHaveBeenCalled()
    })

    it('returns empty array for whitespace-only query', async () => {
      const result = await searchProductsAutocomplete('   ')
      expect(result).toEqual([])
      expect(mockSanityFetch).not.toHaveBeenCalled()
    })
  })

  describe('when query is valid', () => {
    it('calls sanityFetch with wildcard query', async () => {
      mockSanityFetch.mockResolvedValue([])

      await searchProductsAutocomplete('sennheiser')

      expect(mockSanityFetch).toHaveBeenCalledOnce()
      const callArgs = mockSanityFetch.mock.calls[0][0]
      expect(callArgs.params).toEqual({ query: 'sennheiser*' })
    })

    it('trims whitespace from query', async () => {
      mockSanityFetch.mockResolvedValue([])

      await searchProductsAutocomplete('  sennheiser  ')

      const callArgs = mockSanityFetch.mock.calls[0][0]
      expect(callArgs.params).toEqual({ query: 'sennheiser*' })
    })

    it('returns at most 6 results', async () => {
      const mockResults: AutocompleteProduct[] = Array.from({ length: 10 }, (_, i) => ({
        _id: `product-${i}`,
        name: `Product ${i}`,
        brand: null,
        price_data: { currency: 'USD', unit_amount: 10000 },
        slug: { current: `product-${i}` },
        image: null,
      }))
      mockSanityFetch.mockResolvedValue(mockResults.slice(0, 6))

      const results = await searchProductsAutocomplete('test')

      expect(results.length).toBeLessThanOrEqual(6)
    })

    it('returns results sorted by score desc then name asc', async () => {
      const mockResults: AutocompleteProduct[] = [
        { _id: '1', name: 'A Product', brand: null, price_data: { currency: 'USD', unit_amount: 100 }, slug: { current: 'a' }, image: null },
        { _id: '2', name: 'B Product', brand: null, price_data: { currency: 'USD', unit_amount: 200 }, slug: { current: 'b' }, image: null },
      ]
      mockSanityFetch.mockResolvedValue(mockResults)

      const results = await searchProductsAutocomplete('test')

      expect(results).toEqual(mockResults)
    })
  })
})

describe('searchProductsFull', () => {
  beforeEach(() => {
    mockSanityFetch.mockReset()
  })

  describe('when query is too short', () => {
    it('returns empty products and zero total count', async () => {
      const result = await searchProductsFull('')
      expect(result.products).toEqual([])
      expect(result.totalCount).toBe(0)
      expect(mockSanityFetch).not.toHaveBeenCalled()
    })
  })

  describe('when query is valid', () => {
    it('calls count and products queries in parallel', async () => {
      mockSanityFetch.mockResolvedValueOnce(50) // count
      mockSanityFetch.mockResolvedValueOnce([]) // products

      await searchProductsFull('sennheiser')

      expect(mockSanityFetch).toHaveBeenCalledTimes(2)
    })

    it('returns products with total count', async () => {
      const mockProducts: SearchProduct[] = [
        {
          _id: '1',
          name: 'HD 650',
          brand: { _id: 'b1', name: 'Sennheiser', slug: { current: 'sennheiser' } },
          price_data: { currency: 'USD', unit_amount: 34900 },
          stock: 10,
          reservedStock: 0,
          availableStock: 10,
          slug: { current: 'hd-650' },
          image: null,
          catalogueLocationKeys: [],
        },
      ]
      mockSanityFetch.mockResolvedValueOnce(1) // count
      mockSanityFetch.mockResolvedValueOnce(mockProducts) // products

      const result = await searchProductsFull('hd 650')

      expect(result.products).toEqual(mockProducts)
      expect(result.totalCount).toBe(1)
    })

    it('applies the relevance default order when no sort param', async () => {
      mockSanityFetch.mockResolvedValueOnce(0)
      mockSanityFetch.mockResolvedValueOnce([])

      await searchProductsFull('test')

      const productCall = mockSanityFetch.mock.calls[1][0]
      expect(productCall.query).toContain('| order(score desc, name asc)')
    })

    it('applies a valid explicit sort WITHOUT the score prefix', async () => {
      mockSanityFetch.mockResolvedValueOnce(0)
      mockSanityFetch.mockResolvedValueOnce([])

      await searchProductsFull('test', 'price_data.unit_amount:desc')

      const productCall = mockSanityFetch.mock.calls[1][0]
      expect(productCall.query).toContain('| order(price_data.unit_amount desc)')
      expect(productCall.query).not.toContain('score desc')
    })

    it('applies the relevance default for the legacy "featured" value', async () => {
      mockSanityFetch.mockResolvedValueOnce(0)
      mockSanityFetch.mockResolvedValueOnce([])

      await searchProductsFull('test', 'featured')

      const productCall = mockSanityFetch.mock.calls[1][0]
      expect(productCall.query).toContain('| order(score desc, name asc)')
    })

    it('falls back to the relevance default for an invalid sort field', async () => {
      mockSanityFetch.mockResolvedValueOnce(0)
      mockSanityFetch.mockResolvedValueOnce([])

      await searchProductsFull('test', 'invalid_field:asc')

      const productCall = mockSanityFetch.mock.calls[1][0]
      expect(productCall.query).toContain('| order(score desc, name asc)')
    })

    it('falls back to the relevance default for an invalid sort direction', async () => {
      mockSanityFetch.mockResolvedValueOnce(0)
      mockSanityFetch.mockResolvedValueOnce([])

      await searchProductsFull('test', 'name:invalid')

      const productCall = mockSanityFetch.mock.calls[1][0]
      expect(productCall.query).toContain('| order(score desc, name asc)')
    })
  })

  describe('pagination', () => {
    it('defaults to page 1 with 24 per page', async () => {
      mockSanityFetch.mockResolvedValueOnce(100)
      mockSanityFetch.mockResolvedValueOnce([])

      await searchProductsFull('test')

      const productCall = mockSanityFetch.mock.calls[1][0]
      expect(productCall.query).toContain('[0...24]')
    })

    it('offsets correctly for page 2', async () => {
      mockSanityFetch.mockResolvedValueOnce(100)
      mockSanityFetch.mockResolvedValueOnce([])

      await searchProductsFull('test', undefined, 2)

      const productCall = mockSanityFetch.mock.calls[1][0]
      expect(productCall.query).toContain('[24...48]')
    })

    it('offsets correctly for page 3 with custom perPage', async () => {
      mockSanityFetch.mockResolvedValueOnce(100)
      mockSanityFetch.mockResolvedValueOnce([])

      await searchProductsFull('test', undefined, 3, 10)

      const productCall = mockSanityFetch.mock.calls[1][0]
      expect(productCall.query).toContain('[20...30]')
    })

    it('floors an invalid page to page 1', async () => {
      mockSanityFetch.mockResolvedValueOnce(100)
      mockSanityFetch.mockResolvedValueOnce([])

      await searchProductsFull('test', undefined, -1)

      const productCall = mockSanityFetch.mock.calls[1][0]
      expect(productCall.query).toContain('[0...24]')
    })

    it('clamps an out-of-range page to the last page', async () => {
      const lastPageProducts: SearchProduct[] = [
        {
          _id: '7',
          name: 'HD 660S',
          brand: null,
          price_data: { currency: 'USD', unit_amount: 44900 },
          stock: 5,
          reservedStock: 0,
          availableStock: 5,
          slug: { current: 'hd-660s' },
          image: null,
          catalogueLocationKeys: [],
        },
      ]

      // totalCount = 30 → totalPages = ceil(30/24) = 2. Requesting page 99 must
      // return the page-2 window instead of an empty array (G2).
      mockSanityFetch.mockResolvedValueOnce(30) // count
      mockSanityFetch.mockResolvedValueOnce([]) // requested (empty) window
      mockSanityFetch.mockResolvedValueOnce(lastPageProducts) // clamped window

      const result = await searchProductsFull('test', undefined, 99)

      expect(result.totalCount).toBe(30)
      expect(result.products).toEqual(lastPageProducts)

      const clampedCall = mockSanityFetch.mock.calls[2][0]
      expect(clampedCall.query).toContain('[24...48]')
    })
  })
})
