import type { Option } from './option';

// Canonical sort allowlist: `urlValue` is the `sort=` URL vocabulary, `label`
// the human-facing name. App-defined — product data cannot provide it. The
// comparator per value is in adapters/sanity/buildProductQuery.ts.
export const SORT_OPTIONS = [
  { label: 'Featured', urlValue: 'featured' },
  { label: 'Best selling', urlValue: 'best-selling' },
  { label: 'Price: Low to High', urlValue: 'price-asc' },
  { label: 'Price: High to Low', urlValue: 'price-desc' },
  { label: 'Recently Added', urlValue: 'newest' },
  { label: 'Alphabetically, A-Z', urlValue: 'alpha-asc' },
  { label: 'Alphabetically, Z-A', urlValue: 'alpha-desc' },
] as const;

/** URL values of the canonical sort options above. */
export type SortValue = (typeof SORT_OPTIONS)[number]['urlValue'];

/** The sort applied when the URL carries none. */
export const SORT_DEFAULT: SortValue = 'newest';

// Sort choices a category dropdown offers: only those the product data can
// back today (featured/best-selling stay valid URL values).
export const SORT_DROPDOWN_OPTIONS: Option[] = [
  { value: 'newest', label: 'Recently Added' },
  { value: 'price-asc', label: 'Price, Low to High' },
  { value: 'price-desc', label: 'Price, High to Low' },
  { value: 'alpha-asc', label: 'Alphabetically, A-Z' },
  { value: 'alpha-desc', label: 'Alphabetically, Z-A' },
];
