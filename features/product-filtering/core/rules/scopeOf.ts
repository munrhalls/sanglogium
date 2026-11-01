import { isCategory } from '@/features/product-filtering/core/definitions/category';
import { ALL_PRODUCTS } from '@/features/product-filtering/core/definitions/picklist';
import type { PicklistScope } from '@/features/product-filtering/core/types/picklist';

// The picklist scope a listing route reads its controls from: the top-level category of the route (`slug[0]`, also for a nested category page), or all products
// for /products and for a first segment that is no known category.

export function scopeOf(slug: string[] | null): PicklistScope {
  const root = slug?.[0];
  return root !== undefined && isCategory(root) ? root : ALL_PRODUCTS;
}
