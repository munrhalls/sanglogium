import type { CatalogueTree, NavigationItem } from './rules/catalogue';

export interface CatalogueIndex {
  getCatalogue(): CatalogueTree;
  resolveSlugToId(slug: string): string | undefined;
  unrollDescendantKeys(nodeId: string): string[];
  getAllLeafKeys(): string[];
  getCatalogueForNavigation(): NavigationItem[];
}
