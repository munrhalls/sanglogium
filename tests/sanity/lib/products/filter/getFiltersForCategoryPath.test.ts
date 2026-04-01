import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sanityFetch } from '@/sanity/lib/client';
import { getFiltersForCategoryPath } from '@/sanity/lib/products/filter/getFiltersForCategoryPath';

// Mock sanityFetch
vi.mock('@/sanity/lib/client');

describe('getFiltersForCategoryPath - GROQ Data Structure', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('min/max price aggregation query', () => {
    it('should query minPrice and maxPrice using GROQ aggregation', async () => {
      // Mock the price range aggregation response
      const mockPriceRange = {
        minPrice: 100,
        maxPrice: 5000
      };
      
      // Mock the products response
      const mockProducts = [
        {
          displayPrice: 100,
          brand: 'Brand A',
          stock: 5
        },
        {
          displayPrice: 5000,
          brand: 'Brand B',
          stock: 0
        }
      ];

      // Mock sanityFetch calls
      vi.mocked(sanityFetch)
        .mockResolvedValueOnce(mockPriceRange) // First call: price range
        .mockResolvedValueOnce(mockProducts); // Second call: products

      await getFiltersForCategoryPath(['category1']);

      // Verify first call is for price range aggregation
      expect(sanityFetch).toHaveBeenCalledWith({
        query: expect.stringContaining('minPrice'),
        params: { keys: ['category1'] }
      });

      // Verify the GROQ query contains min() and max() functions
      const firstCall = vi.mocked(sanityFetch).mock.calls[0][0];
      expect(firstCall.query).toContain('min(');
      expect(firstCall.query).toContain('max(');
      expect(firstCall.query).toContain('displayPrice');
    });

    it('should return minPrice and maxPrice in aggregation response', async () => {
      const mockPriceRange = {
        minPrice: 250,
        maxPrice: 7500
      };

      const mockProducts = [
        { displayPrice: 250, brand: 'Test Brand', stock: 3 }
      ];

      vi.mocked(sanityFetch)
        .mockResolvedValueOnce(mockPriceRange)
        .mockResolvedValueOnce(mockProducts);

      await getFiltersForCategoryPath(['category1']);

      // Verify the first call returns min/max price structure
      expect(sanityFetch).toHaveBeenNthCalledWith(1, {
        query: expect.stringContaining('minPrice'),
        params: { keys: ['category1'] }
      });
    });
  });

  describe('full products query', () => {
    it('should query individual product data including displayPrice', async () => {
      const mockPriceRange = { minPrice: 100, maxPrice: 5000 };
      const mockProducts = [
        {
          displayPrice: 100,
          brand: 'Brand A',
          stock: 5
        },
        {
          displayPrice: 5000,
          brand: 'Brand B',
          stock: 0
        }
      ];

      vi.mocked(sanityFetch)
        .mockResolvedValueOnce(mockPriceRange)
        .mockResolvedValueOnce(mockProducts);

      await getFiltersForCategoryPath(['category1']);

      // Verify second call is for individual product data
      expect(sanityFetch).toHaveBeenNthCalledWith(2, {
        query: expect.stringContaining('displayPrice'),
        params: { keys: ['category1'] }
      });

      // Verify the GROQ query returns individual product fields
      const secondCall = vi.mocked(sanityFetch).mock.calls[1][0];
      expect(secondCall.query).toContain('displayPrice');
      expect(secondCall.query).toContain('brand');
      expect(secondCall.query).toContain('stock');
    });

    it('should return complete product data structure', async () => {
      const mockPriceRange = { minPrice: 100, maxPrice: 5000 };
      const mockProducts = [
        {
          displayPrice: 299,
          brand: 'Test Brand',
          stock: 10
        }
      ];

      vi.mocked(sanityFetch)
        .mockResolvedValueOnce(mockPriceRange)
        .mockResolvedValueOnce(mockProducts);

      await getFiltersForCategoryPath(['category1']);

      // Verify the second call returns full product structure
      expect(sanityFetch).toHaveBeenNthCalledWith(2, {
        query: expect.stringContaining('displayPrice'),
        params: { keys: ['category1'] }
      });
    });
  });

  describe('complete GROQ query sequence', () => {
    it('should execute both queries in correct order', async () => {
      const mockPriceRange = { minPrice: 50, maxPrice: 10000 };
      const mockProducts = [
        { displayPrice: 50, brand: 'Brand X', stock: 1 },
        { displayPrice: 10000, brand: 'Brand Y', stock: 2 }
      ];

      vi.mocked(sanityFetch)
        .mockResolvedValueOnce(mockPriceRange)
        .mockResolvedValueOnce(mockProducts);

      const result = await getFiltersForCategoryPath(['category1']);

      // Verify both queries were called
      expect(sanityFetch).toHaveBeenCalledTimes(2);

      // Verify first call: price aggregation
      expect(sanityFetch).toHaveBeenNthCalledWith(1, {
        query: expect.stringContaining('minPrice'),
        params: { keys: ['category1'] }
      });

      // Verify second call: individual products
      expect(sanityFetch).toHaveBeenNthCalledWith(2, {
        query: expect.stringContaining('displayPrice'),
        params: { keys: ['category1'] }
      });

      // Verify function returns filter groups
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
