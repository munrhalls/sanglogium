import type { CatalogueTree, NavigationItem, CategoryLookup, CategoryMetadata } from './rules/catalogue';

export interface CatalogueIndex {
  getCatalogue(): CatalogueTree;
  resolveSlugToId(slug: string): string | undefined;
  unrollDescendantKeys(nodeId: string): string[];
  getAllLeafKeys(): string[];
  getCatalogueForNavigation(): NavigationItem[];
  getCategoryLookup(): CategoryLookup;
  getCategoryMetadata(key: string): Promise<CategoryMetadata | null>;
  getBreadcrumbLabels(parts: string[]): string[];
}
