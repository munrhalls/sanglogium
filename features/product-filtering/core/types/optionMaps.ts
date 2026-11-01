// The maps the sidebar and the sorting will receive. Both are computed; only the owner's curated rows are stored (in the CMS).

import type { Picklist, SortPicklist } from '@/features/product-filtering/core/types/picklist';

/** A value a product holds at a field: text, a number or true/false. */
export type OptionValue = string | number | boolean;

/** Per slice, per control (a field path as the picklist writes it), the sorted distinct values the slice's products hold. */
export type RawMap = Record<string, Record<string, OptionValue[]>>;

/** One curated row of the CMS labels document. No value: the control's own name. With a value: that option, written exactly as stored. */
export type CuratedLabel = { field?: string; value?: string; text?: string };

/** The RawMap's keys with one text per control and per option (an option's key is String(value)). */
export type LabelsMap = Record<string, Record<string, { label: string; options: Record<string, string> }>>;

/** One control of the list the Studio draws: its automatic name and, sorted, its options (value as stored, as text) with their automatic texts. */
export type ControlLabels = { field: string; label: string; options: { value: string; text: string }[] };

/** One sort of the list the Studio draws: the field the shopper can sort by and its automatic name. */
export type SortName = { field: string; label: string };

/** Per scope, the fields the shopper can sort by, in order: the always-on sorts, then the owner's sort picks, each once. */
export type SortMap = Record<string, string[]>;

/** The name of each sort field, per scope: the curated control-name row when a non-empty one exists, else the automatic name. */
export type SortLabels = Record<string, Record<string, string>>;

/** One section of the list the Studio draws: a scope (its catalogue slug, or 'all-products'), the controls it holds (only what that scope holds) and, apart, its sorts. */
export type SliceControls = { slice: string; controls: ControlLabels[]; sorts: SortName[] };

/** A catalogue item as the slicing needs it: `parent` is the id of the item above it. */
export type CatalogueNode = { _id: string; slug?: string; parent?: string };

/** A published product as the maps need it: always-on fields on the product (the brand as its name), picks in filterAttributes, the slice by catalogueLocationKeys. */
export type OptionMapProduct = { _id: string; filterAttributes?: Record<string, unknown>; catalogueLocationKeys?: string[]; [key: string]: unknown };

/** Everything the control list is computed from: the stored picklist (always-on fields, and the picks per slice), the catalogue items and the published products. */
export type OptionMapData = { alwaysOn: string[]; picks: Picklist; sortAlwaysOn: string[]; sortPicks: SortPicklist; items: CatalogueNode[]; products: OptionMapProduct[] };

/** What one route's controls are computed from: the stored picklist (always-on fields, the picks and the sort lists per scope), the curated rows and the published products on the route. No catalogue items: the route's products are already picked by its key set. A product carries the always-on fields on itself (the brand as its name) and the picks in filterAttributes. */
export type RouteMapData = Omit<OptionMapData, 'items' | 'products'> & {
  products: { filterAttributes?: Record<string, unknown>; [key: string]: unknown }[];
  rows: CuratedLabel[];
};

/** One scope's controls and sorts on one route, and the products they were computed from. `raw`: per control (a field path as the picklist writes it) the sorted distinct values the route's products hold. `labels`: the control's text and the text of each option. Only controls that hold a value on the route; the keys of both maps are the same, in the owner's order. `sorts`: the fields the shopper can sort by on this route, each with its name (the control's name: the curated text, else the automatic one); the always-on sorts first, then the scope's picks, each once, only those a route product holds. `products`: the route's products as the request read them; the counts read them. */
export type RouteControls = { raw: RawMap[string]; labels: LabelsMap[string]; sorts: SortLabels[string]; products: RouteMapData['products'] };
