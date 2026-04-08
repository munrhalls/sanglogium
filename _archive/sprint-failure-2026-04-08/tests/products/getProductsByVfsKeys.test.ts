import { describe, it, expect } from 'vitest';
import { getProductsByVfsKeys } from '@/sanity/lib/products/getProductsByVfsKeys';
import { resolveSlugToId, unrollDescendantKeys } from '@/data/catalogue';

describe('L2 Data: getProductsByVfsKeys', () => {

  it('L2-01: Returns products for single leaf key', async () => {
    const key = 'o7c6baiuobsr7ni2y2vf22sh'; // open-back
    const products = await getProductsByVfsKeys([key]);

    // Should return at least 6 products (actual data has 6)
    expect(products.length).toBeGreaterThanOrEqual(6);

    // Each product should have the key in catalogueLocationKeys
    products.forEach(product => {
      expect(product.catalogueLocationKeys).toContain(key);
    });
  });

  it('L2-02: Returns products for parent category (all descendants)', async () => {
    const headphonesKey = 'ugyeto8653n495dpf89nzoar';
    const descendantKeys = unrollDescendantKeys(headphonesKey);

    // Should include all headphone subcategories
    expect(descendantKeys.length).toBeGreaterThan(1);

    const products = await getProductsByVfsKeys(descendantKeys);

    // Should return products from multiple subcategories
    expect(products.length).toBeGreaterThanOrEqual(38);

    // Each product should have at least one key from descendants
    products.forEach(product => {
      const hasValidKey = product.catalogueLocationKeys.some(
        key => descendantKeys.includes(key)
      );
      expect(hasValidKey).toBe(true);
    });
  });

  it('L2-03: Returns empty array for invalid keys', async () => {
    const products = await getProductsByVfsKeys(['invalid-key-123']);
    expect(products).toEqual([]);
  });

  it('L2-04: Returns correct product fields', async () => {
    const key = 'o7c6baiuobsr7ni2y2vf22sh';
    const products = await getProductsByVfsKeys([key]);

    if (products.length > 0) {
      const product = products[0];
      expect(product._id).toBeDefined();
      expect(product.name).toBeDefined();
      expect(product.brand).toBeDefined();
      expect(product.displayPrice).toBeDefined();
      expect(product.image).toBeDefined();
      expect(product.slug).toBeDefined();
    }
  });

});
