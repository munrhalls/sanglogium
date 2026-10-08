import "server-only";

import catalogueIndex from "@/data/catalogue-index.json";
import {
  catalogueToNavigation,
  validateCatalogueIndex,
  type CatalogueIndexData,
  type CatalogueTree,
  type CategoryLookup,
  type CategoryMetadata,
} from "@/features/catalogue/core/rules/catalogue";

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

export const getCatalogueForNavigation = () => catalogueToNavigation(getCatalogue());

export const getAllLeafKeys = (): string[] => {
  const data = catalogueIndex as unknown as CatalogueIndexData;
  return Object.entries(data.slotMetadataMap)
    .filter(([_, v]) => v.children.length === 0)
    .map(([id]) => id);
};

export const getCategoryLookup = (): CategoryLookup => {
  const data = catalogueIndex as unknown as CatalogueIndexData;
  const parentById: Record<string, string> = {};
  for (const [parentId, meta] of Object.entries(data.slotMetadataMap)) {
    for (const childId of meta.children) {
      parentById[childId] = parentId;
    }
  }
  return { parentById, idBySlug: data.slugToIdMap };
};

// React cache is only available in React Server Components
// In test environments, we skip caching
const withCache = <T extends (...args: any[]) => any>(fn: T): T => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- Dynamic import to avoid breaking in non-React environments
    const { cache } = require('react');
    return cache(fn) as T;
  } catch {
    return fn;
  }
};

const getCategoryMetadataFn = async (key: string): Promise<CategoryMetadata | null> => {
  const metadata = catalogueIndex.slotMetadataMap[key as keyof typeof catalogueIndex.slotMetadataMap];

  if (!metadata) {
    return null;
  }

  // Build breadcrumb from path
  const breadcrumb = buildBreadcrumbFromPath(metadata.path || '');

  // Find parent ID from tree structure
  const parentId = findParentId(key, catalogueIndex.tree);

  return {
    id: (metadata as any).id || key,
    name: metadata.title,
    slug: metadata.slug || null,
    type: metadata.type as 'link' | 'header',
    parentId,
    breadcrumb,
  };
};

export const getCategoryMetadata = withCache(getCategoryMetadataFn) as (key: string) => Promise<CategoryMetadata | null>;

function buildBreadcrumbFromPath(path: string): Array<{ label: string; href: string }> {
  // Parse path like "/headphones/by-design/open-back"
  // Return breadcrumb segments
  const segments = path.split('/').filter(Boolean);
  return segments.map((segment, index) => ({
    label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
    href: '/shop/' + segments.slice(0, index + 1).join('/'),
  }));
}

function findParentId(nodeId: string, tree: any[]): string | null {
  // Traverse tree to find parent of nodeId
  for (const node of tree) {
    if (node.children?.some((child: any) => child.id === nodeId || child._key === nodeId)) {
      return node.id || node._key;
    }
    if (node.children) {
      const found = findParentId(nodeId, node.children);
      if (found) return found;
    }
  }
  return null;
}

export const getBreadcrumbLabels = (parts: string[]): string[] => {
  const { slugToIdMap, slotMetadataMap } = catalogueIndex as any;

  return parts.map((part, index) => {
    const pathQualifiedKey = parts.slice(0, index + 1).join("/");
    const id = slugToIdMap[pathQualifiedKey] ?? slugToIdMap[part];

    if (id) {
      const metadata = slotMetadataMap[id];
      if (metadata?.title) return metadata.title;
    }

    return part
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  });
};
