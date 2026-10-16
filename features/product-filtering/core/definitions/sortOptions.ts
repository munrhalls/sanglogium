import type { Option } from './option';

// Sort choices a category dropdown offers: only those the product data can back today.
// The comparator for each value is in adapters/sanity/buildProductQuery.ts; the URL allowlist is in facetMap.ts.
export const SORT_OPTIONS: Option[] = [
  { value: 'newest', label: 'Recently Added' },
  { value: 'price-asc', label: 'Price, Low to High' },
  { value: 'price-desc', label: 'Price, High to Low' },
  { value: 'alpha-asc', label: 'Alphabetically, A-Z' },
  { value: 'alpha-desc', label: 'Alphabetically, Z-A' },
];

export const SORT_DEFAULT: string = 'newest';
