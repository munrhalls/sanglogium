// The maps the sidebar and the sorting will receive. Both are computed; only the owner's curated rows are stored (in the CMS).

/** A value a product holds at a field: text, a number or true/false. */
export type OptionValue = string | number | boolean;

/** Per slice, per control (a field path as the picklist writes it), the sorted distinct values the slice's products hold. */
export type RawMap = Record<string, Record<string, OptionValue[]>>;

/** One curated row of the CMS labels document. No value: the control's own name. With a value: that option, written exactly as stored. */
export type CuratedLabel = { field?: string; value?: string; text?: string };

/** The RawMap's keys with one text per control and per option (an option's key is String(value)). */
export type LabelsMap = Record<string, Record<string, { label: string; options: Record<string, string> }>>;
