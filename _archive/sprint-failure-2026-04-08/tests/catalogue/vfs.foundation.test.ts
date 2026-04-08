import { describe, it, expect } from 'vitest';
import { resolveSlugToId, unrollDescendantKeys } from '@/data/catalogue';
import catalogueIndex from '@/data/catalogue-index.json';

/**
 * Helper: Extract all node IDs from tree structure
 */
function extractAllNodeIds(tree: any[]): string[] {
  const ids: string[] = [];

  function traverse(nodes: any[]) {
    for (const node of nodes) {
      ids.push(node.id);
      if (node.children && node.children.length > 0) {
        traverse(node.children);
      }
    }
  }

  traverse(tree);
  return ids;
}

describe('L1 Foundation: VFS Data Integrity', () => {

  it('L1-01: All leaf slugs resolve to IDs', () => {
    const leafSlugs = ['open-back', 'closed-back', 'dac-amp-combos'];
    leafSlugs.forEach(slug => {
      const id = resolveSlugToId(slug);
      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
      expect(id?.length).toBeGreaterThan(0);
    });
  });

  it('L1-02: All tree node IDs exist in slotMetadataMap', () => {
    const allNodeIds = extractAllNodeIds(catalogueIndex.tree);
    expect(allNodeIds.length).toBeGreaterThan(0);

    allNodeIds.forEach(id => {
      expect(
        catalogueIndex.slotMetadataMap[id],
        `Node ID ${id} missing from slotMetadataMap`
      ).toBeDefined();
    });
  });

  it('L1-03: Descendant keys are valid slot IDs', () => {
    // Headphones root ID
    const headphonesKey = 'ugyeto8653n495dpf89nzoar';
    const descendants = unrollDescendantKeys(headphonesKey);

    expect(descendants.length).toBeGreaterThan(0);

    descendants.forEach(id => {
      expect(
        catalogueIndex.slotMetadataMap[id],
        `Descendant ID ${id} from unrollDescendantKeys() missing from slotMetadataMap`
      ).toBeDefined();
    });
  });

  it('L1-04: Known test slugs resolve correctly', () => {
    // These are our 3 test cases
    const testCases = [
      { slug: 'open-back', expectedId: 'o7c6baiuobsr7ni2y2vf22sh' },
      { slug: 'closed-back', expectedId: 'yq3p9s798zszjkzm5btnebjh' },
      { slug: 'dac-amp-combos', expectedId: 'o37u0yjphzt3qu91ewnww2yj' },
    ];

    testCases.forEach(({ slug, expectedId }) => {
      const actualId = resolveSlugToId(slug);
      expect(actualId).toBe(expectedId);
    });
  });

});
