import type { Category } from '@/features/product-filtering/core/definitions/category';

/** What the picklist is kept per: each slice, and all products (the /products page, which spans the three slices). */
export type PicklistScope = Category | 'all-products';

/** Per scope, the filterAttributes paths the owner picked, in the owner's order. The all-products list starts empty. */
export type Picklist = Record<PicklistScope, string[]>;

/** Per scope, the fields the owner picked as sorts (after the always-on sorts), in the owner's order. Same shape as the filter picks. */
export type SortPicklist = Record<PicklistScope, string[]>;
