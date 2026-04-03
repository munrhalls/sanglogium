import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchHomepageDataBatched } from '@/app/lib/data/homepageBatch';
import { sanityFetch } from '@/sanity/lib/client';

// Mock sanityFetch from the client module
vi.mock('@/sanity/lib/client', () => ({
  sanityFetch: vi.fn(),
  client: { fetch: vi.fn() },
}));

describe('fetchHomepageDataBatched Integrity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('FAILING TEST: should return featured products with slug and stock', async () => {
    // Current query result from Sanity based on HOMEPAGE_DATA_QUERY
    (sanityFetch as any).mockResolvedValue({
      featured: [
        {
          productPromo: 'Special Offer',
          _id: 'prod-123',
          name: 'Sennheiser Headphones',
          brand: { _id: 'b1', name: 'Sennheiser', slug: 'sennheiser' },
          displayPrice: 135,
          stock: 99,
          slug: 'sennheiser-slug',
          image: { asset: { url: 'https://cdn.sanity.io/...' } },
        }
      ],
      spotlight1: null,
      spotlight2: null,
      spotlight3: null,
      iemsGallery: [],
      newestRelease: null,
      dacs: [],
      accessoriesCables: [],
      accessoriesEarpads: []
    });

    const result = await fetchHomepageDataBatched();
    const featuredProduct = result.featured[0] as any;

    // These assertions FAIL because the current GROQ query and interfaces 
    // in app/lib/data/homepageBatch.ts are missing both slug and stock
    expect(featuredProduct.slug).toBeDefined();
    expect(typeof featuredProduct.slug).toBe('string');
    expect(featuredProduct.stock).toBeDefined();
    expect(typeof featuredProduct.stock).toBe('number');
  });
});
