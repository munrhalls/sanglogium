import catalogueIndex from '@/data/catalogue-index.json';

// React cache is only available in React Server Components
// In test environments, we skip caching
const withCache = (fn: Function): Function => {
  try {
    // Dynamic import to avoid breaking in non-React environments
    const { cache } = require('react');
    return cache(fn);
  } catch {
    return fn;
  }
};

export interface CategoryMetadata {
  id: string;
  name: string;
  slug: string | null;
  type: 'header' | 'link';
  parentId: string | null;
  breadcrumb: Array<{ label: string; href: string }>;
}

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
