import catalogueIndex from "./catalogue-index.json";

export interface CatalogueTreeNode {
  _key: string;
  _type: "catalogueItem";
  title: string;
  type: "link" | "header";
  slug?: { _type: "slug"; current: string };
  icon?: string;
  children?: CatalogueTreeNode[];
}

export type CatalogueTree = CatalogueTreeNode[];

interface CatalogueIndexData {
  generatedAt: string;
  slugToIdMap: Record<string, string>;
  slotMetadataMap: Record<string, { children: string[] }>;
  tree: CatalogueTree;
}

export const getCatalogue = (): CatalogueTree => {
  const data = catalogueIndex as unknown;

  try {
    validateCatalogueIndex(data);
    return (data as CatalogueIndexData).tree || [];
  } catch (error) {
    console.error('❌ Catalogue validation failed:', error);
    // Return empty tree as graceful fallback
    return [];
  }
};

export const resolveSlugToId = (slug: string) => {
  const data = catalogueIndex as unknown as CatalogueIndexData;
  return data.slugToIdMap[slug];
};

export const unrollDescendantKeys = (nodeId: string): string[] => {
  const data = catalogueIndex as unknown as CatalogueIndexData;
  const slotMetadataMap = data.slotMetadataMap;

  // If ID not in slotMetadataMap, treat as leaf node and return itself
  if (!slotMetadataMap[nodeId]) {
    if (process.env.NODE_ENV === "development") {
      console.warn(`[VFS] ID ${nodeId} not in slotMetadataMap, treating as leaf`);
    }
    return [nodeId];
  }

  const result = new Set<string>();
  const stack = [nodeId];

  while (stack.length > 0) {
    const currentId = stack.pop()!;
    if (result.has(currentId)) {
      continue;
    }

    result.add(currentId);
    const children = slotMetadataMap[currentId]?.children || [];
    stack.push(...children);
  }

  return Array.from(result);
};

export const buildGroqKeysParam = (keys: string[]): string[] => {
  return keys;
};

// Runtime validation for VFS data integrity
export function validateCatalogueIndex(data: unknown): asserts data is CatalogueIndexData {
  if (!data || typeof data !== 'object') {
    throw new Error('Catalogue index data is not an object');
  }

  const indexData = data as CatalogueIndexData;

  // Validate required top-level properties
  if (!indexData.generatedAt || typeof indexData.generatedAt !== 'string') {
    throw new Error('Catalogue index missing or invalid generatedAt field');
  }

  if (!indexData.slugToIdMap || typeof indexData.slugToIdMap !== 'object') {
    throw new Error('Catalogue index missing or invalid slugToIdMap field');
  }

  if (!indexData.slotMetadataMap || typeof indexData.slotMetadataMap !== 'object') {
    throw new Error('Catalogue index missing or invalid slotMetadataMap field');
  }

  if (!Array.isArray(indexData.tree)) {
    throw new Error('Catalogue index missing or invalid tree field');
  }

  // Validate tree structure
  if (indexData.tree.length === 0) {
    console.warn('Catalogue tree is empty');
  }

  // Validate that we have the expected root categories
  const rootTitles = indexData.tree.map(node => node.title);
  const expectedRoots = ['Headphones', 'Audio Electronics', 'Accessories'];

  for (const expectedRoot of expectedRoots) {
    if (!rootTitles.includes(expectedRoot)) {
      console.warn(`Missing expected root category: ${expectedRoot}`);
    }
  }

  console.log('✅ Catalogue index validation passed');
}

// Navigation-specific interfaces
export interface NavigationLink {
  label: string;
  url: string;
  slug?: string;
}


export interface NavigationSection {
  title: string;
  links: NavigationLink[];
}

export interface NavigationItem {
  id: string;
  label: string;
  imageUrl: string;
  sections: NavigationSection[];
  feature: { caption: string };
}

// Transform VFS tree to navigation format
export const getCatalogueForNavigation = (): NavigationItem[] => {
  const tree = getCatalogue();

  return tree.map(rootItem => {
    const navigationItem: NavigationItem = {
      id: rootItem.slug?.current || rootItem.title.toLowerCase().replace(/\s+/g, '-'),
      label: rootItem.title,
      imageUrl: `/images/${rootItem.icon}-skeletal.png`,
      sections: [],
      feature: { caption: "Pure Resonance" }
    };

    // Process children into sections and links
    if (rootItem.children) {
      navigationItem.sections = rootItem.children.map(section => {
        const navigationSection: NavigationSection = {
          title: section.title,
          links: []
        };

        // Process leaf nodes into clickable links
        if (section.children) {
          navigationSection.links = section.children
            .filter(link => link.type === "link" && link.slug?.current)
            .map(link => ({
              label: link.title,
              url: `/products/${rootItem.slug?.current}/${link.slug?.current}`,
              slug: link.slug?.current
            }));
        }

        return navigationSection;
      });
    }

    return navigationItem;
  });
};
