import type { SortOption } from '@/features/product-filtering/core/types/sortMenu';
import type { UrlValue } from '@/features/product-filtering/core/types/urlState';

// The entry of the menu the URL's sort stands for. No sort, a sort that is not an entry, or a value of the wrong shape all mean the route's own order (the entry with id '').

export function currentSortId(options: SortOption[], sort: UrlValue | undefined): string {
  if (sort === null || sort === undefined || typeof sort !== 'object' || Array.isArray(sort) || !('field' in sort) || !('direction' in sort)) return '';
  const hit = options.find((option) => option.selection !== null && option.selection.field === sort.field && option.selection.direction === sort.direction);
  return hit ? hit.id : '';
}
