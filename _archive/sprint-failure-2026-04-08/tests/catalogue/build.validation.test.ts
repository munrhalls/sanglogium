import { describe, it, expect } from 'vitest';
import catalogueIndex from '@/data/catalogue-index.json';

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

describe('Build Script Validation', () => {
  it('catalogue-index.json passes completeness checks', () => {
    // All tree nodes in metadata
    const treeIds = extractAllNodeIds(catalogueIndex.tree);
    expect(treeIds.length).toBeGreaterThan(0);

    treeIds.forEach(id => {
      expect(catalogueIndex.slotMetadataMap).toHaveProperty(id);
    });

    // All child references valid
    for (const meta of Object.values(catalogueIndex.slotMetadataMap)) {
      const metaTyped = meta as { children: string[] };
      metaTyped.children.forEach(childId => {
        expect(catalogueIndex.slotMetadataMap[childId]).toBeDefined();
      });
    }

    // Generated timestamp valid
    expect(new Date(catalogueIndex.generatedAt).toISOString())
      .toBe(catalogueIndex.generatedAt);
  });

  it('has expected root categories', () => {
    const rootTitles = catalogueIndex.tree.map((node: any) => node.title);
    expect(rootTitles).toContain('Headphones');
    expect(rootTitles).toContain('Audio Electronics');
    expect(rootTitles).toContain('Accessories');
  });

  it('slugToIdMap has bidirectional mappings', () => {
    // Leaf slugs
    expect(catalogueIndex.slugToIdMap).toHaveProperty('open-back');
    expect(catalogueIndex.slugToIdMap).toHaveProperty('closed-back');

    // Path slugs
    expect(catalogueIndex.slugToIdMap).toHaveProperty('headphones/open-back');
    expect(catalogueIndex.slugToIdMap).toHaveProperty('audio-electronics/desktop-amps');
  });

  it('leaf nodes have no children', () => {
    for (const [id, meta] of Object.entries(catalogueIndex.slotMetadataMap)) {
      const metaTyped = meta as { type: string; children: string[] };
      if (metaTyped.type === 'link') {
        expect(metaTyped.children).toHaveLength(0);
      }
    }
  });

  it('header nodes have children', () => {
    for (const [id, meta] of Object.entries(catalogueIndex.slotMetadataMap)) {
      const metaTyped = meta as { type: string; children: string[] };
      if (metaTyped.type === 'header') {
        expect(metaTyped.children.length).toBeGreaterThan(0);
      }
    }
  });
});
