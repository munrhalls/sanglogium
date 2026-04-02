import { describe, it, expect } from 'vitest';
import { getProductBySlug } from '../../sanity/lib/products/getProductBySlug';
import { getRelatedProducts } from '../../sanity/lib/products/getRelatedProducts';

/**
 * Product API Integration Tests
 *
 * Validates data layer contracts:
 * 1. getProductBySlug returns valid product structure
 * 2. getRelatedProducts returns valid slugs (no 404s)
 */
describe('Product API - Data Contract Validation', () => {

  describe('getProductBySlug', () => {
    it('should return valid product structure for existing slug', async () => {
      const product = await getProductBySlug('64-audio-premium-pearl-cable-3-5mm');

      // Should not be null
      expect(product).not.toBeNull();

      // Required fields must exist and be correct types
      expect(product).toMatchObject({
        _id: expect.any(String),
        name: expect.any(String),
        displayPrice: expect.any(Number),
        stock: expect.any(Number),
        sku: expect.any(String),
        slug: {
          current: expect.any(String),
        },
        catalogueLocationKeys: expect.any(Array),
      });

      // Additional validations
      expect(product!._id).toMatch(/^[a-zA-Z0-9_-]+$/); // Sanity ID format (allows uppercase)
      expect(product!.name.length).toBeGreaterThan(0);
      expect(product!.displayPrice).toBeGreaterThanOrEqual(0);
      expect(product!.stock).toBeGreaterThanOrEqual(0);
      expect(product!.slug.current).toMatch(/^[a-z0-9-]+$/); // URL-safe slug
    });

    it('should return null for non-existent slug', async () => {
      const product = await getProductBySlug('non-existent-product-12345');
      expect(product).toBeNull();
    });

    it('should return product with valid image reference if image exists', async () => {
      const product = await getProductBySlug('64-audio-premium-pearl-cable-3-5mm');
      expect(product).not.toBeNull();

      // If product has an image, it should have asset reference
      if (product!.image) {
        expect(product!.image).toHaveProperty('asset');
        expect(product!.image.asset).toHaveProperty('_ref');
      }
    });
  });

  describe('getRelatedProducts', () => {
    it('should return array of related products with valid slugs', async () => {
      // First get a product with catalogue keys
      const product = await getProductBySlug('64-audio-premium-pearl-cable-3-5mm');
      expect(product).not.toBeNull();
      expect(product!.catalogueLocationKeys.length).toBeGreaterThan(0);

      // Get related products
      const related = await getRelatedProducts(
        product!._id,
        product!.catalogueLocationKeys,
        6
      );

      // Should return array (may be empty if no related products)
      expect(Array.isArray(related)).toBe(true);

      // If we have related products, validate their structure
      if (related.length > 0) {
        for (const item of related) {
          // Each related product must have valid structure
          expect(item).toMatchObject({
            _id: expect.any(String),
            name: expect.any(String),
            displayPrice: expect.any(Number),
            slug: {
              current: expect.any(String),
            },
          });

          // Critical: Slug must be URL-safe (no spaces, special chars)
          expect(item.slug.current).toMatch(/^[a-z0-9-]+$/);
          expect(item._id).toMatch(/^[a-zA-Z0-9_-]+$/); // Sanity IDs allow uppercase
          expect(item.name.length).toBeGreaterThan(0);
          expect(item.displayPrice).toBeGreaterThanOrEqual(0);

          // If brand exists, it should have a name
          if (item.brand) {
            expect(item.brand.name).toBeTruthy();
          }

          // If image exists, it should have asset reference
          if (item.image) {
            expect(item.image).toHaveProperty('asset');
          }
        }
      }
    });

    it('should not include current product in related products', async () => {
      const product = await getProductBySlug('64-audio-premium-pearl-cable-3-5mm');
      expect(product).not.toBeNull();

      const related = await getRelatedProducts(
        product!._id,
        product!.catalogueLocationKeys,
        6
      );

      // Current product should NOT be in related products
      const currentProductInRelated = related.find(r => r._id === product!._id);
      expect(currentProductInRelated).toBeUndefined();
    });

    it('should return empty array for product with no catalogue keys', async () => {
      const related = await getRelatedProducts(
        'some-id',
        [],
        6
      );

      expect(related).toEqual([]);
    });

    it('should respect the limit parameter', async () => {
      const product = await getProductBySlug('64-audio-premium-pearl-cable-3-5mm');
      expect(product).not.toBeNull();
      expect(product!.catalogueLocationKeys.length).toBeGreaterThan(0);

      // Request only 2 related products
      const related = await getRelatedProducts(
        product!._id,
        product!.catalogueLocationKeys,
        2
      );

      // Should return at most 2 products
      expect(related.length).toBeLessThanOrEqual(2);
    });
  });

  describe('Link Integrity - All Related Product URLs Valid', () => {
    it('should verify all related product slugs are valid URL segments', async () => {
      const product = await getProductBySlug('64-audio-premium-pearl-cable-3-5mm');
      expect(product).not.toBeNull();

      const related = await getRelatedProducts(
        product!._id,
        product!.catalogueLocationKeys,
        6
      );

      // Track any invalid slugs
      const invalidSlugs: string[] = [];

      for (const item of related) {
        const slug = item.slug.current;

        // Valid URL segment rules:
        // - Only lowercase letters, numbers, hyphens
        // - No spaces
        // - No special characters
        // - Not empty
        const isValid = /^[a-z0-9-]+$/.test(slug) && slug.length > 0;

        if (!isValid) {
          invalidSlugs.push(`"${slug}" (id: ${item._id})`);
        }
      }

      // All slugs should be valid
      expect(invalidSlugs).toEqual([]);
    });
  });

});
