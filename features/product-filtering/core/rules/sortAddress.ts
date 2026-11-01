import type { SortOption } from '@/features/product-filtering/core/types/sortMenu';
import type { UrlContract, UrlPatch } from '@/features/product-filtering/core/types/urlState';

// What choosing an entry of the sort menu writes: the `sort` key and nothing else, so every filter and every other key stays. The route's own order removes the key.
// An id that is not an entry means the route's own order. The URL contract drops `page` (a new order moves products between pages).

export function sortPatch(options: SortOption[], id: string): UrlPatch {
  const option = options.find((candidate) => candidate.id === id);
  return { sort: option ? option.selection : null };
}

export function sortAddress(contract: UrlContract, address: string, options: SortOption[], id: string): string {
  return contract.encode(address, sortPatch(options, id));
}
