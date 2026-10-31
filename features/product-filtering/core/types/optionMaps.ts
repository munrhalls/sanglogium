// The maps the sidebar and the sorting will receive. Both are computed; only the owner's curated rows are stored (in the CMS).

/** A value a product holds at a field: text, a number or true/false. */
export type OptionValue = string | number | boolean;

/** Per slice, per control (a field path as the picklist writes it), the sorted distinct values the slice's products hold. */
export type RawMap = Record<string, Record<string, OptionValue[]>>;
