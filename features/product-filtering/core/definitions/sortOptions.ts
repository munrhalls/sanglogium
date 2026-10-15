import type { Option } from './option';

// Sort choices a category dropdown offers: only those the product data can back today.
// The comparator for each value is in adapters/sanity/buildProductQuery.ts; the URL allowlist is in facetMap.ts.
export const SORT_OPTIONS: Option[] = [
  { value: 'newest', label: 'Date Added, New to Old' },
  { value: 'price-asc', label: 'Price, Low to High' },
  { value: 'price-desc', label: 'Price, High to Low' },
  { value: 'alpha-asc', label: 'Name, A to Z' },
  { value: 'alpha-desc', label: 'Name, Z to A' },
  { value: 'date-old', label: 'Date Added, Old to New' },
];

export const SORT_DEFAULT: string = 'newest';
