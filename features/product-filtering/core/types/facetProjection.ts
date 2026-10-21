// Shapes of the data-derived facet projection: what the product data of one slice says
// about each filterAttributes field. Type-only module.

/** JS kind of a stored value. An array of anything is 'array'. */
export type ObservedKind = 'boolean' | 'number' | 'string' | 'array' | 'object';

/** The control a field is shown with. */
export type FacetControl = 'checkbox' | 'boolean' | 'range';

/** What one slice's products say about one filterAttributes path. */
export interface FieldStat {
  /** Path inside filterAttributes, nested keys joined with '.' (e.g. 'wearingStyle', 'freqResponseHz.min'). */
  attribute: string;
  /** Distinct kinds seen, sorted. */
  kinds: ObservedKind[];
  /** Number of products carrying a value. */
  count: number;
  /** Distinct string and boolean values (booleans as 'true' / 'false'; array elements flattened), data casing kept, sorted. */
  values: string[];
  /** Smallest and largest finite number seen (scalar or array element); null when none. */
  min: number | null;
  max: number | null;
}

/** attribute path -> stat. */
export type FieldInventory = Record<string, FieldStat>;

/** A checkbox option derived from data. */
export interface DerivedOption {
  value: string;
  label: string;
}
