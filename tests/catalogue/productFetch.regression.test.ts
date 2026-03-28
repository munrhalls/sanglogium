import { getSelectedProducts } from '@/sanity/lib/products/getSelectedProducts';
import { FilterItem } from '@/app/components/ui/filters/FilterTypes';

// Mock data for regression testing
const mockCatalogueKeys = ['o7c6baiuobsr7ni2y2vf22sh']; // open-back category
const mockFilters: [FilterItem[], FilterItem[], FilterItem[], FilterItem[]] = [[], [], [], []];
const mockSort = { field: 'name', direction: 'asc' };
const mockPagination = { page: 1, pageSize: 12 };

describe('Product Fetch Regression Tests', () => {
  describe('getSelectedProducts', () => {
    it('should return products structure unchanged', async () => {
      const result = await getSelectedProducts(
        mockCatalogueKeys,
        mockFilters,
        mockSort,
        mockPagination
      );

      expect(result).toHaveProperty('products');
      expect(result).toHaveProperty('totalProductsCount');
      expect(Array.isArray(result.products)).toBe(true);
      expect(typeof result.totalProductsCount).toBe('number');
    });

    it('should handle empty catalogue keys', async () => {
      const result = await getSelectedProducts(
        [],
        mockFilters,
        mockSort,
        mockPagination
      );

      expect(result.products).toBeDefined();
      expect(result.totalProductsCount).toBeGreaterThanOrEqual(0);
    });

    it('should handle filters without breaking', async () => {
      const filtersWithValues: [FilterItem[], FilterItem[], FilterItem[], FilterItem[]] = [
        [{ field: 'brand', value: 'Sony', type: 'regular' }],
        [],
        [],
        []
      ];

      const result = await getSelectedProducts(
        mockCatalogueKeys,
        filtersWithValues,
        mockSort,
        mockPagination
      );

      expect(result.products).toBeDefined();
      expect(result.totalProductsCount).toBeGreaterThanOrEqual(0);
    });

    it('should handle different sort options', async () => {
      const sortOptions = [
        { field: 'name', direction: 'asc' },
        { field: 'displayPrice', direction: 'desc' },
        { field: 'default', direction: 'asc' }
      ];

      for (const sort of sortOptions) {
        const result = await getSelectedProducts(
          mockCatalogueKeys,
          mockFilters,
          sort,
          mockPagination
        );

        expect(result.products).toBeDefined();
        expect(result.totalProductsCount).toBeGreaterThanOrEqual(0);
      }
    });

    it('should handle pagination correctly', async () => {
      const paginationOptions = [
        { page: 1, pageSize: 12 },
        { page: 2, pageSize: 24 },
        { page: 1, pageSize: 48 }
      ];

      for (const pagination of paginationOptions) {
        const result = await getSelectedProducts(
          mockCatalogueKeys,
          mockFilters,
          mockSort,
          pagination
        );

        expect(result.products).toBeDefined();
        expect(result.totalProductsCount).toBeGreaterThanOrEqual(0);
        expect(result.products.length).toBeLessThanOrEqual(pagination.pageSize);
      }
    });

    it('should handle API errors gracefully', async () => {
      // Test with invalid catalogue keys that might cause API errors
      const result = await getSelectedProducts(
        ['invalid-key'],
        mockFilters,
        mockSort,
        mockPagination
      );

      expect(result).toHaveProperty('products');
      expect(result).toHaveProperty('totalProductsCount');
      // Should return empty result on error, not throw
      expect(result.products).toEqual([]);
      expect(result.totalProductsCount).toBe(0);
    });
  });
});
