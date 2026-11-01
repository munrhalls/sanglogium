// The sort menu of a route: what the shopper can choose and how a choice is written to the URL.

import type { SortSelection } from '@/features/product-filtering/core/types/urlState';

/** One entry of the menu. `id` is '' for the route's own order and the JSON of [field, direction] for the others; `selection` is what the URL carries for it (null for the route's own order, which is no sort at all). */
export type SortOption = { id: string; label: string; selection: SortSelection | null };
