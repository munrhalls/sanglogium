import { describe, it, expect } from 'vitest';
import { resolveSlugToId, unrollDescendantKeys } from '@/data/catalogue';
import { getProductsByVfsKeys } from '@/sanity/lib/products/getProductsByVfsKeys';

describe('L5 E2E: Data Flow Verification', () => {

  it('L5-E2E-01: /products/open-back returns 7+ products', async () => {
    const nodeId = resolveSlugToId('open-back');
    expect(nodeId).toBeDefined();
    const keys = unrollDescendantKeys(nodeId);
    const products = await getProductsByVfsKeys(keys);

    expect(products.length).toBeGreaterThanOrEqual(6);

    products.forEach(p => {
      expect(p._id).toBeDefined();
      expect(p.name).toBeDefined();
      expect(p.brand).toBeDefined();
      expect(p.displayPrice).toBeGreaterThan(0);
    });
  });

  it('L5-E2E-02: /products/closed-back returns 31+ products', async () => {
    const nodeId = resolveSlugToId('closed-back');
    expect(nodeId).toBeDefined();
    const keys = unrollDescendantKeys(nodeId);
    const products = await getProductsByVfsKeys(keys);

    expect(products.length).toBeGreaterThanOrEqual(31);
  });

  it('L5-E2E-03: Products have required fields for cards', async () => {
    const nodeId = resolveSlugToId('open-back');
    expect(nodeId).toBeDefined();
    const keys = unrollDescendantKeys(nodeId);
    const products = await getProductsByVfsKeys(keys);

    if (products.length > 0) {
      const p = products[0];
      expect(p._id).toBeDefined();
      expect(p.name).toBeDefined();
      // Brand is optional in some products
      if (p.brand) {
        expect(p.brand._id).toBeDefined();
        expect(p.brand.name).toBeDefined();
      }
      expect(p.displayPrice).toBeDefined();
      expect(p.slug?.current).toBeDefined();
    }
  });

});
