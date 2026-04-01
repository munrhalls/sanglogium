import { describe, it, expect, vi } from 'vitest';
import { sanityFetch } from '@/sanity/lib/client';
import { getFiltersForCategoryPath } from '@/sanity/lib/products/filter/getFiltersForCategoryPath';

// Mock sanityFetch
vi.mock('@/sanity/lib/client');

describe('getFiltersForCategoryPath - Stock Data Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('queries max stock using GROQ order and slicing', async () => {
    // Mock max stock query response
    const mockMaxStock = { stock: 25 };
    
    // Mock price queries
    vi.mocked(sanityFetch)
      .mockResolvedValueOnce({ minPrice: 100, maxPrice: 5000 }) // Price range
      .mockResolvedValueOnce(mockMaxStock) // Max stock
      .mockResolvedValueOnce([ // Products
        { displayPrice: 100, brand: 'Brand A', stock: 5 },
        { displayPrice: 5000, brand: 'Brand B', stock: 25 }
      ]);

    const result = await getFiltersForCategoryPath(['category1']);

    // Verify maxStock is included in result
    expect(result.maxStock).toBe(25);

    // Verify the third call (max stock query) uses correct GROQ
    const maxStockCall = vi.mocked(sanityFetch).mock.calls[2][0];
    expect(maxStockCall.query).toContain('order(stock desc)[0]');
    expect(maxStockCall.query).toContain('stock');
  });

  it('returns null maxStock when no products have stock', async () => {
    // Mock empty max stock query
    const mockMaxStock = null;
    
    vi.mocked(sanityFetch)
      .mockResolvedValueOnce({ minPrice: 100, maxPrice: 5000 })
      .mockResolvedValueOnce(mockMaxStock)
      .mockResolvedValueOnce([]);

    const result = await getFiltersForCategoryPath(['category1']);

    expect(result.maxStock).toBeNull();
  });

  it('includes maxStock in FilterResult structure', async () => {
    const mockMaxStock = { stock: 50 };
    
    vi.mocked(sanityFetch)
      .mockResolvedValueOnce({ minPrice: 100, maxPrice: 5000 })
      .mockResolvedValueOnce(mockMaxStock)
      .mockResolvedValueOnce([{ displayPrice: 200, brand: 'Test', stock: 10 }]);

    const result = await getFiltersForCategoryPath(['category1']);

    // Verify FilterResult structure includes all required fields
    expect(result).toHaveProperty('filters');
    expect(result).toHaveProperty('priceRange');
    expect(result).toHaveProperty('maxStock');
    expect(result.priceRange).toHaveProperty('minPrice');
    expect(result.priceRange).toHaveProperty('maxPrice');
    expect(typeof result.maxStock).toBe('number');
  });

  it('handles empty catalogue keys gracefully', async () => {
    const result = await getFiltersForCategoryPath([]);

    expect(result.filters).toEqual([]);
    expect(result.priceRange.minPrice).toBeNull();
    expect(result.priceRange.maxPrice).toBeNull();
    expect(result.maxStock).toBeNull();
  });
});
