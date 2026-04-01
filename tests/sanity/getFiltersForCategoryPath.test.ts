import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getFiltersForCategoryPath } from '../../sanity/lib/products/filter/getFiltersForCategoryPath';

// Mock the sanity client
vi.mock('../../sanity/lib/client', () => ({
  sanityFetch: vi.fn()
}));

describe('getFiltersForCategoryPath', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns FilterResult format with empty arrays and null prices when no keys provided', async () => {
    const { sanityFetch } = await import('../../sanity/lib/client');
    vi.mocked(sanityFetch).mockResolvedValue([]);

    const result = await getFiltersForCategoryPath([]);

    // Verify return format
    expect(result).toHaveProperty('filters');
    expect(result).toHaveProperty('priceRange');
    
    // Verify filters is empty array
    expect(Array.isArray(result.filters)).toBe(true);
    expect(result.filters).toHaveLength(0);
    
    // Verify priceRange structure
    expect(result.priceRange).toHaveProperty('minPrice');
    expect(result.priceRange).toHaveProperty('maxPrice');
    expect(result.priceRange.minPrice).toBeNull();
    expect(result.priceRange.maxPrice).toBeNull();
  });

  it('returns correct FilterResult format when products exist', async () => {
    const { sanityFetch } = await import('../../sanity/lib/client');
    
    // Mock price queries
    vi.mocked(sanityFetch)
      .mockResolvedValueOnce({ displayPrice: 100 }) // min price
      .mockResolvedValueOnce({ displayPrice: 1000 }) // max price
      .mockResolvedValueOnce([ // products
        { displayPrice: 100, brand: 'Sony', stock: 5 },
        { displayPrice: 500, brand: 'Bose', stock: 0 },
        { displayPrice: 1000, brand: 'Sony', stock: 3 }
      ]);

    const result = await getFiltersForCategoryPath(['test-key']);

    // Verify return format
    expect(result).toHaveProperty('filters');
    expect(result).toHaveProperty('priceRange');
    
    // Verify filters array structure
    expect(Array.isArray(result.filters)).toBe(true);
    expect(result.filters.length).toBeGreaterThan(0);
    
    // Verify priceRange values
    expect(result.priceRange.minPrice).toBe(100);
    expect(result.priceRange.maxPrice).toBe(1000);
    
    // Verify filter structure
    result.filters.forEach(filter => {
      expect(filter).toHaveProperty('field');
      expect(filter).toHaveProperty('label');
      expect(filter).toHaveProperty('options');
      expect(Array.isArray(filter.options)).toBe(true);
    });
  });
});
