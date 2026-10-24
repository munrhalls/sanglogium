export type SortDirection = 'asc' | 'desc';
/** A sort choice: `value` is what the URL carries, `field` and `direction` what it sorts by, `text` what the shopper reads. */
export interface DerivedSortOption {
  value: string;
  field: string;
  direction: SortDirection;
  text: string;
}
/** `default` is the `value` of the option used when the URL carries no sort. */
export interface DerivedSort {
  options: DerivedSortOption[];
  default: string;
}
/** category -> its sort; a category with no sort option has no entry */
export type SortByCategory = Record<string, DerivedSort>;
