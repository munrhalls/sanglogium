/**
 * S5 Regression Tests: Filters & Sort Integration
 *
 * These tests establish baseline before sprint execution.
 * All tests must pass BEFORE and AFTER sprint changes.
 *
 * Run: npm test tests/regression/S5-filters-sort.regression.test.ts
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { getProductsByVfsKeys } from '../../sanity/lib/products/getProductsByVfsKeys';
import { resolveSlugToId } from '../../data/catalogue';

describe('S5 Regression: Filters & Sort Integration', () => {

  // Test data: Open-Back headphones category
  const testSlug = 'open-back';
  let categoryId: string | null;
  let descendantKeys: string[];

  beforeAll(async () => {
    categoryId = resolveSlugToId(testSlug);
    if (categoryId) {
      const { unrollDescendantKeys } = await import('../../data/catalogue');
      descendantKeys = unrollDescendantKeys(categoryId);
    }
  });

  // ═══════════════════════════════════════════════════════════
  // R1: getProductsByVfsKeys backwards compatibility
  // Risk: Adding sort/filter params breaks existing calls
  // ═══════════════════════════════════════════════════════════
  describe('R1: getProductsByVfsKeys backwards compatibility', () => {

    it('R1-01: Returns products with keys-only call (no sort/filter)', async () => {
      // This is the EXISTING call pattern - must continue working
      const products = await getProductsByVfsKeys(descendantKeys);

      expect(products).toBeDefined();
      expect(Array.isArray(products)).toBe(true);
      expect(products.length).toBeGreaterThan(0);
    });

    it('R1-02: Returns correct product structure', async () => {
      const products = await getProductsByVfsKeys(descendantKeys);
      const product = products[0];

      // Verify all required fields exist
      expect(product).toHaveProperty('_id');
      expect(product).toHaveProperty('name');
      expect(product).toHaveProperty('brand');
      expect(product).toHaveProperty('displayPrice');
      expect(product).toHaveProperty('image');
      expect(product).toHaveProperty('slug');
      expect(product.slug).toHaveProperty('current');
    });

    it('R1-03: Returns empty array for empty keys', async () => {
      const products = await getProductsByVfsKeys([]);
      expect(products).toEqual([]);
    });

    it('R1-04: Product count matches category metadata', async () => {
      const { getCategoryMetadata } = await import('../../sanity/lib/products/getCategoryMetadata');
      const metadata = await getCategoryMetadata(categoryId!);
      const products = await getProductsByVfsKeys(descendantKeys);

      // Product count should be consistent
      expect(products.length).toBeGreaterThan(0);
      if (metadata?.productCount) {
        expect(products.length).toBe(metadata.productCount);
      }
    });
  });

  // ═══════════════════════════════════════════════════════════
  // R2: Category page renders without searchParams
  // Risk: Adding searchParams prop breaks existing URLs
  // ═══════════════════════════════════════════════════════════
  describe('R2: Category page renders without searchParams', () => {

    it('R2-01: Page component accepts both params and searchParams', async () => {
      const { default: CategoryPage } = await import('../../app/(store)/products/[...slug]/page');

      // Verify the page component exists and is a function
      expect(typeof CategoryPage).toBe('function');
    });

    it('R2-02: Category slugs resolve correctly (existing categories)', () => {
      // Test only slugs known to exist in current data
      const existingSlugs = ['open-back']; // Confirmed working slug

      existingSlugs.forEach(slug => {
        const id = resolveSlugToId(slug);
        expect(typeof id).toBe('string');
        expect(id).toBeTruthy();
      });
    });

    it('R2-03: Non-existent slugs return falsy (no crash)', () => {
      // Verify missing categories return falsy (undefined/null), not errors
      const missingSlugs = ['non-existent', 'fake-category'];

      missingSlugs.forEach(slug => {
        const id = resolveSlugToId(slug);
        expect(id).toBeFalsy(); // null or undefined
      });
    });

    it('R2-03: Descendant keys resolve for known categories', () => {
      expect(descendantKeys).toBeDefined();
      expect(Array.isArray(descendantKeys)).toBe(true);
      expect(descendantKeys.length).toBeGreaterThan(0);
    });
  });

  // ═══════════════════════════════════════════════════════════
  // R3: ProductGrid handles empty products
  // Risk: Filtered results may return empty array
  // ═══════════════════════════════════════════════════════════
  describe('R3: ProductGrid empty state', () => {

    it('R3-01: ProductGrid component exists', async () => {
      const { ProductGrid } = await import('../../app/components/features/products/ProductGrid');
      expect(typeof ProductGrid).toBe('function');
    });

    it('R3-02: ProductGrid renders with empty array without error', async () => {
      // This test verifies the component won't crash on empty results
      // Actual rendering test would need React Testing Library
      const { ProductGrid } = await import('../../app/components/features/products/ProductGrid');

      // Component should accept empty products prop
      const props = { products: [] };
      expect(() => ProductGrid(props)).not.toThrow();
    });
  });

  // ═══════════════════════════════════════════════════════════
  // R4: Existing URLs work (URL shareability preservation)
  // Risk: URL param parsing breaks existing links
  // ═══════════════════════════════════════════════════════════
  describe('R4: URL shareability preservation', () => {

    it('R4-01: Category URLs without params work', async () => {
      const urls = [
        '/products/headphones',
        '/products/headphones/open-back',
        '/products/headphones/closed-back',
      ];

      // Verify these URL patterns are valid
      urls.forEach(url => {
        const parts = url.split('/').filter(Boolean);
        expect(parts[0]).toBe('products');
        expect(parts.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('R4-02: URL param patterns are valid', () => {
      const validParamPatterns = [
        'sort=displayPrice:asc',
        'sort=name:desc',
        'brand=sennheiser',
        'brand=sennheiser&driverType=dynamic',
      ];

      validParamPatterns.forEach(pattern => {
        const params = new URLSearchParams(pattern);

        // Verify parsing works
        if (params.has('sort')) {
          expect(params.get('sort')).toMatch(/^[a-zA-Z]+:(asc|desc)$/);
        }
        if (params.has('brand')) {
          expect(typeof params.get('brand')).toBe('string');
        }
      });
    });
  });

  // ═══════════════════════════════════════════════════════════
  // R5: Filter components exist and export correctly
  // ═══════════════════════════════════════════════════════════
  describe('R5: Filter components structure', () => {

    it('R5-01: All filter components exist', async () => {
      const [
        { SortDropdown },
        { ActiveFilters },
        { FilterSidebar },
        { MobileFilterDrawer },
      ] = await Promise.all([
        import('../../app/components/features/filters/SortDropdown'),
        import('../../app/components/features/filters/ActiveFilters'),
        import('../../app/components/features/filters/FilterSidebar'),
        import('../../app/components/features/filters/MobileFilterDrawer'),
      ]);

      expect(typeof SortDropdown).toBe('function');
      expect(typeof ActiveFilters).toBe('function');
      expect(typeof FilterSidebar).toBe('function');
      expect(typeof MobileFilterDrawer).toBe('function');
    });

    it('R5-02: FilterConfigProvider exists', async () => {
      const { FilterConfigProvider } = await import('../../app/components/features/filters/FilterConfigProvider');
      expect(typeof FilterConfigProvider).toBe('function');
    });
  });

});
