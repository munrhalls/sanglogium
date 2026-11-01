import type { Category } from '@/features/product-filtering/core/definitions/category';

/** What the picklist is kept per: each slice, and all products (the /products page, which spans the three slices). */
export type PicklistScope = Category | 'all-products';

/** Per scope, the filterAttributes paths the owner picked, in the owner's order. The all-products list starts empty. */
export type Picklist = Record<PicklistScope, string[]>;
