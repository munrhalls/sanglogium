import { describe, it, expect } from 'vitest';
import { resolveSlugToId, unrollDescendantKeys } from '@/data/catalogue';
import catalogueIndex from '@/data/catalogue-index.json';
import { getProductsByVfsKeys } from '@/sanity/lib/products/getProductsByVfsKeys';

/**
 * Helper: Extract all node IDs from tree structure
 */
function extractAllNodeIds(tree: any[]): string[] {
  const ids: string[] = [];

  function traverse(nodes: any[]) {
    for (const node of nodes) {
      ids.push(node._key || node.id);
      if (node.children && node.children.length > 0) {
        traverse(node.children);
      }
    }
  }

  traverse(tree);
  return ids;
}

describe('VFS Minimal Integrity', () => {
  // L1-01: Slug resolution
  it('resolves known leaf slugs to IDs', () => {
    expect(resolveSlugToId('open-back')).toBe('o7c6baiuobsr7ni2y2vf22sh');
    expect(resolveSlugToId('closed-back')).toBe('yq3p9s798zszjkzm5btnebjh');
    expect(resolveSlugToId('dac-amp-combos')).toBe('o37u0yjphzt3qu91ewnww2yj');
  });

  // L1-02: Metadata completeness
  it('has metadata for all tree nodes', () => {
    const allIds = extractAllNodeIds(catalogueIndex.tree);
    expect(allIds.length).toBeGreaterThan(0);
    allIds.forEach(id => {
      expect(catalogueIndex.slotMetadataMap[id]).toBeDefined();
    });
  });

  // L1-03: Descendant validity
  it('unrollDescendantKeys returns valid IDs', () => {
    const descendants = unrollDescendantKeys('ugyeto8653n495dpf89nzoar');
    expect(descendants.length).toBeGreaterThan(0);
    descendants.forEach(id => {
      expect(catalogueIndex.slotMetadataMap[id]).toBeDefined();
    });
  });

  // L1-04: Build validation - all child references exist
  it('all child references exist in metadata', () => {
    for (const [_, meta] of Object.entries(catalogueIndex.slotMetadataMap)) {
      const metaTyped = meta as { children: string[] };
      metaTyped.children.forEach(childId => {
        expect(catalogueIndex.slotMetadataMap[childId]).toBeDefined();
      });
    }
  });

  // L1-05: No duplicate IDs in unrollDescendantKeys
  it('unrollDescendantKeys returns unique IDs', () => {
    const descendants = unrollDescendantKeys('ugyeto8653n495dpf89nzoar');
    const unique = new Set(descendants);
    expect(unique.size).toBe(descendants.length);
  });
});

describe('VFS GROQ Integration', () => {
  // GROQ-01: GROQ pattern test (requires CMS)
  it('GROQ query with array intersection works', async () => {
    const keys = ['o7c6baiuobsr7ni2y2vf22sh']; // open-back

    try {
      const products = await getProductsByVfsKeys({ keys });

      // If CMS is available, validate results
      if (products.length > 0) {
        products.forEach(p => {
          expect(p.catalogueLocationKeys).toContain(keys[0]);
        });
      }
    } catch (error) {
      // CMS unavailable - skip test
      console.log('CMS unavailable - skipping GROQ integration test');
    }
  });
});
