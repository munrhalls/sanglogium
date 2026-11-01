import type { Picklist } from '@/features/product-filtering/core/types/picklist';

/** The scope of the /products page: the products of the three slices together. Its name in the maps and in the Filter labels page. */
export const ALL_PRODUCTS = 'all-products' as const;

export const EMPTY_PICKLIST: Picklist = { headphones: [], 'audio-electronics': [], accessories: [], 'all-products': [] };
