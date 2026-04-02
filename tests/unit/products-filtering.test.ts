import { describe, it, expect, vi } from 'vitest';
import { getProductsByVfsKeys } from '@/sanity/lib/products/getProductsByVfsKeys';

// Mock sanityFetch to control test data
vi.mock('@/sanity/lib/client', () => ({
  sanityFetch: vi.fn(),
}));

import { sanityFetch } from '@/sanity/lib/client';

describe('Products Filtering - GROQ Queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should build correct GROQ query for brand filter', async () => {
    // Mock successful response
    vi.mocked(sanityFetch).mockResolvedValue([
      {
        _id: 'product1',
        name: 'Audeze LCD-X',
        brand: { name: 'Audeze' },
        displayPrice: 1299,
        slug: { current: 'audeze-lcd-x' }
      }
    ]);

    await getProductsByVfsKeys({
      keys: ['headphones'],
      filters: ['brand:audeze'],
      sort: 'featured'
    });

    // Verify the GROQ query was called with correct filter clause
    const callArgs = vi.mocked(sanityFetch).mock.calls[0][0];
    console.log('Actual GROQ query:', callArgs.query);
    expect(callArgs.query).toContain('brand->name == "audeze"');
    expect(callArgs.query).not.toContain('brand == "audeze"'); // Should use reference syntax
  });

  it('should handle multiple brand filters correctly', async () => {
    vi.mocked(sanityFetch).mockResolvedValue([]);

    await getProductsByVfsKeys({
      keys: ['headphones'],
      filters: ['brand:audeze', 'brand:sennheiser'],
      sort: 'featured'
    });

    const callArgs = vi.mocked(sanityFetch).mock.calls[0][0];
    // Should include both brand filters
    expect(callArgs.query).toContain('brand->name == "audeze"');
    expect(callArgs.query).toContain('brand->name == "sennheiser"');
  });

  it('should build correct GROQ query for specification filters', async () => {
    vi.mocked(sanityFetch).mockResolvedValue([]);

    await getProductsByVfsKeys({
      keys: ['headphones'],
      filters: ['driver-size:40mm'],
      sort: 'featured'
    });

    const callArgs = vi.mocked(sanityFetch).mock.calls[0][0];
    expect(callArgs.query).toContain('overviewFields[@.title == "driver-size" && @.value == "40mm"]');
    expect(callArgs.query).toContain('specifications[@.title == "driver-size" && @.value == "40mm"]');
  });

  it('should combine brand and specification filters', async () => {
    vi.mocked(sanityFetch).mockResolvedValue([]);

    await getProductsByVfsKeys({
      keys: ['headphones'],
      filters: ['brand:audeze', 'driver-size:40mm'],
      sort: 'featured'
    });

    const callArgs = vi.mocked(sanityFetch).mock.calls[0][0];
    expect(callArgs.query).toContain('brand->name == "audeze"');
    expect(callArgs.query).toContain('overviewFields[@.title == "driver-size" && @.value == "40mm"]');
  });
});

describe('Products Filtering - Brand Data Integrity', () => {
  it('should return products with proper brand reference structure', async () => {
    // Mock response with proper brand reference
    vi.mocked(sanityFetch).mockResolvedValue([
      {
        _id: 'product1',
        name: 'Audeze LCD-X',
        brand: {
          _id: 'brand-audeze',
          name: 'Audeze',
          slug: { current: 'audeze' }
        },
        displayPrice: 1299,
        slug: { current: 'audeze-lcd-x' }
      },
      {
        _id: 'product2',
        name: 'Sennheiser HD 660S',
        brand: {
          _id: 'brand-sennheiser',
          name: 'Sennheiser',
          slug: { current: 'sennheiser' }
        },
        displayPrice: 499,
        slug: { current: 'sennheiser-hd-660s' }
      }
    ]);

    const result = await getProductsByVfsKeys({
      keys: ['headphones'],
      filters: [],
      sort: 'featured'
    });

    // Verify brand reference structure
    expect(result).toHaveLength(2);
    expect(result[0].brand).toHaveProperty('_id');
    expect(result[0].brand).toHaveProperty('name');
    expect(result[0].brand).toHaveProperty('slug');
    expect(typeof result[0].brand.name).toBe('string');
  });

  it('should handle missing brand references gracefully', async () => {
    // Mock response with missing brand
    vi.mocked(sanityFetch).mockResolvedValue([
      {
        _id: 'product1',
        name: 'Product without brand',
        brand: null,
        displayPrice: 100,
        slug: { current: 'no-brand' }
      }
    ]);

    const result = await getProductsByVfsKeys({
      keys: ['headphones'],
      filters: [],
      sort: 'featured'
    });

    expect(result[0].brand).toBeNull();
  });

  it('should filter by exact brand name match', async () => {
    // Mock response with mixed brands
    vi.mocked(sanityFetch).mockResolvedValue([
      {
        _id: 'product1',
        name: 'Audeze LCD-X',
        brand: { name: 'Audeze' },
        displayPrice: 1299,
        slug: { current: 'audeze-lcd-x' }
      }
    ]);

    await getProductsByVfsKeys({
      keys: ['headphones'],
      filters: ['brand:audeze'], // Filter uses lowercase
      sort: 'featured'
    });

    const callArgs = vi.mocked(sanityFetch).mock.calls[0][0];
    expect(callArgs.query).toContain('brand->name == "audeze"');
  });
});
