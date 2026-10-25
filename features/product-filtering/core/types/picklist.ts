import type { Category } from '@/features/product-filtering/core/definitions/category';

/** Per slice, the filterAttributes paths the owner picked, in the owner's order. */
export type Picklist = Record<Category, string[]>;
