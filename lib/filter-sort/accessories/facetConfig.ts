// Minimal universal filter/sort module for the accessories slice.
// Slice-specific facets get added here from this slice's product data.

export type Option = { value: string; label: string };
export type FacetGroupId = 'commercial';

export interface FacetGroup {
  id: FacetGroupId;
  label: string;
  note?: string;
}

export interface FacetDef {
  id: string;
  group: FacetGroupId;
  label: string;
  control: 'checkbox' | 'boolean';
  options?: Option[] | 'derived';
}

export const FACET_GROUPS: FacetGroup[] = [
  {
    id: 'commercial',
    label: '',
  },
];

export const FACETS: FacetDef[] = [
  { id: 'brand', group: 'commercial', label: 'Brand', control: 'checkbox', options: 'derived' },
  { id: 'inStock', group: 'commercial', label: 'In Stock Only', control: 'boolean' },
];

export const facetsForGroup = (group: FacetGroupId): FacetDef[] => FACETS.filter((f) => f.group === group);

export const SORT_OPTIONS: Option[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price, Low to High' },
  { value: 'price-desc', label: 'Price, High to Low' },
  { value: 'alpha-asc', label: 'Alphabetically, A-Z' },
  { value: 'alpha-desc', label: 'Alphabetically, Z-A' },
  { value: 'date-old', label: 'Date, Old to New' },
];

export const SORT_DEFAULT: string = 'newest';
