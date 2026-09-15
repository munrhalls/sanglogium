// POC-local mirror of lib/catalogue/facetMap.ts's shape and role, re-pointed at
// docs/filters-sort/should-be.md's 31-item taxonomy instead of the production
// ~13-facet set. Deliberately NOT added to the shared production facetMap: that
// file is sync-checked against _project/filters/facet-map.json by
// _project/filters/check-wiring.cjs, and should-be.md is explicit that final
// schema/field design and control type are out of its scope — i.e. this file's
// job, done here, not by editing shared prod source. See page.tsx for how this
// plugs into the URL <-> sidebar <-> grid mechanism.
//
// HEADLESS: no JSX, no data access — same discipline as the production file.

import type { HeadphoneProduct } from './types';

export type FacetGroupId = 'commercial' | 'type' | 'sound' | 'material' | 'wireless' | 'technical';

export interface FacetGroup {
  id: FacetGroupId;
  label: string;
  note?: string;
}

// Order + copy straight from docs/filters-sort/should-be.md's group headers.
export const FACET_GROUPS: FacetGroup[] = [
  {
    id: 'commercial',
    label: '',
  },
  {
    id: 'type',
    label: 'Type',
  },
  {
    id: 'sound',
    label: 'Sound Properties',
  },
  {
    id: 'material',
    label: 'Material Factors',
  },
  {
    id: 'wireless',
    label: 'Wireless',
  },
  {
    id: 'technical',
    label: 'Technical Specs',
  },
];

export type Option = { value: string; label: string };

interface FacetBase {
  /** URL query-param key. */
  id: string;
  group: FacetGroupId;
  label: string;
  /** should-be.md item number — traceability back to the should-be list. */
  itemNo: number;
  status: 'C' | 'R';
}

export interface CheckboxFacet extends FacetBase {
  control: 'checkbox';
  field: keyof HeadphoneProduct;
  /** Static closed vocabulary, or 'derived' to collect distinct values from the dataset at runtime (brand). */
  options: Option[] | 'derived';
}

export interface BooleanFacet extends FacetBase {
  control: 'boolean';
  field: keyof HeadphoneProduct;
}

export interface RangeFacet extends FacetBase {
  control: 'range';
  field: keyof HeadphoneProduct;
  min: number;
  max: number;
  step: number;
  unit: string;
}

export type FacetDef = CheckboxFacet | BooleanFacet | RangeFacet;

const opts = (pairs: [string, string][]): Option[] => pairs.map(([value, label]) => ({ value, label }));

/**
 * The 29 generic facets (checkbox / boolean / range). Price (item 2) and
 * Customer Rating (item 3) are bespoke controls rendered directly by the panel
 * — same reason production keeps Price out of its FILTER_FACETS loop
 * (FilterSidebar.tsx's PriceSection).
 */
export const FACETS: FacetDef[] = [
  // ── Commercial ──────────────────────────────────────────────────────────
  { id: 'brand', group: 'commercial', label: 'Brand', itemNo: 1, status: 'C', control: 'checkbox', field: 'brand', options: 'derived' },
  // Awards / Recognition removed from the headphones sidebar per UX cleanup.
  // Condition (5), Discount (7), and New Arrivals (8) removed (sang-logium-3rv.5):
  // productType.ts scopes `condition`, `dealsDiscount`, and `newArrival` to
  // categories: ["accessories", "audio-electronics"] only -- headphones has no
  // such field at all, so these could never carry a real count. Same class of
  // bug as the case-sensitivity fix, just unfixable because there is no real
  // data behind it for this category.
  { id: 'inStock', group: 'commercial', label: 'In Stock Only', itemNo: 6, status: 'C', control: 'boolean', field: 'inStockOnly' },

  // ── Type ─────────────────────────────────────────────────────────────────
  // No closed options.list in the schema either -- derive from real data,
  // same treatment as brand and awards (sang-logium-3rv.5).
  { id: 'productCategory', group: 'type', label: 'Product Category / Type', itemNo: 10, status: 'C', control: 'checkbox', field: 'productCategory', options: 'derived' },
  { id: 'wearingStyle', group: 'type', label: 'Wearing Style / Form Factor', itemNo: 11, status: 'C', control: 'checkbox', field: 'wearingStyle', options: opts([['over-ear', 'Over-Ear'], ['on-ear', 'On-Ear'], ['in-ear', 'In-Ear']]) },
  { id: 'acousticDesign', group: 'type', label: 'Acoustic Design', itemNo: 12, status: 'C', control: 'checkbox', field: 'acousticDesign', options: opts([['open-back', 'Open-Back'], ['closed-back', 'Closed-Back'], ['semi-open', 'Semi-Open / Hybrid']]) },
  { id: 'fitType', group: 'type', label: 'Fit Type (IEM)', itemNo: 13, status: 'R', control: 'checkbox', field: 'fitType', options: opts([['universal', 'Universal Fit'], ['custom', 'Custom Fit (CIEM)']]) },
  { id: 'connectivity', group: 'type', label: 'Connectivity', itemNo: 14, status: 'C', control: 'checkbox', field: 'connectivity', options: opts([['wired', 'Wired'], ['wireless', 'Wireless (Bluetooth)'], ['true-wireless', 'True Wireless'], ['hybrid', 'Wired + Wireless Hybrid']]) },
  { id: 'portable', group: 'type', label: 'Portable', itemNo: 15, status: 'C', control: 'boolean', field: 'portable' },

  // ── Sound Properties ────────────────────────────────────────────────────
  // Values are the exact strings from sanity-cms/schemaTypes/productType.ts's
  // soundSignature options.list (sang-logium-3rv.5) -- they must match
  // lib/catalogue/facetMap.ts's valueVocab exactly (case included), not this
  // POC's own synthetic-dataset SoundSignature type in ./types.ts, which uses
  // different lowercase slugs for its own unrelated mock-data filtering.
  { id: 'soundSignature', group: 'sound', label: 'Signature', itemNo: 16, status: 'R', control: 'checkbox', field: 'soundSignature', options: opts([['Neutral', 'Neutral / Reference'], ['Warm', 'Warm'], ['Bright/Analytical', 'Bright / Analytical'], ['Dark', 'Dark'], ['V-Shaped', 'V-Shaped'], ['Basshead', 'Bass'], ['Mid-Forward', 'Mid-Forward']]) },
  { id: 'impedance', group: 'sound', label: 'Impedance', itemNo: 17, status: 'R', control: 'range', field: 'impedanceOhms', min: 8, max: 600, step: 1, unit: 'Ω' },
  { id: 'sensitivity', group: 'sound', label: 'Sensitivity', itemNo: 18, status: 'R', control: 'range', field: 'sensitivityDbMw', min: 85, max: 125, step: 1, unit: 'dB/mW' },
  // Simplification of "frequency response range" (a per-product min–max pair) to
  // its single most-compared dimension, bass extension — see the enrichment
  // script for the full rationale (also flagged in should-be.md's own evidence
  // notes: printed FR min/max is a weak spec next to a measured graph).
  { id: 'bassExtension', group: 'sound', label: 'Frequency Response', itemNo: 19, status: 'R', control: 'range', field: 'bassExtensionHz', min: 5, max: 60, step: 1, unit: 'Hz' },
  { id: 'requiresAmplifier', group: 'sound', label: 'Requires Amplifier', itemNo: 20, status: 'C', control: 'boolean', field: 'requiresAmplifier' },

  // ── Material Factors ────────────────────────────────────────────────────
  { id: 'microphone', group: 'material', label: 'Microphone', itemNo: 21, status: 'C', control: 'boolean', field: 'microphone' },
  // Real schema options.list (productType.ts:385) has 9 entries; 4 were
  // missing, so real products with those terminations had no selectable
  // checkbox (sang-logium-3rv.5).
  { id: 'cableTermination', group: 'material', label: 'Cable', itemNo: 22, status: 'C', control: 'checkbox', field: 'cableTermination', options: opts([['3.5mm', '3.5mm SE'], ['2.5mm-balanced', '2.5mm Balanced'], ['4.4mm-balanced', '4.4mm Balanced'], ['4-pin-xlr', '4-Pin XLR'], ['6.35mm', '6.35mm (1/4 inch)'], ['usb-c', 'USB-C'], ['mmcx', 'MMCX'], ['2-pin', '2-Pin'], ['fixed-cable', 'Fixed Cable']]) },
  { id: 'detachableCable', group: 'material', label: 'Detachable Cable', itemNo: 23, status: 'C', control: 'boolean', field: 'detachableCable' },
  { id: 'cableLength', group: 'material', label: 'Cable Length', itemNo: 24, status: 'R', control: 'range', field: 'cableLengthM', min: 0.5, max: 3.5, step: 0.1, unit: 'm' },
  { id: 'foldable', group: 'material', label: 'Foldable', itemNo: 25, status: 'C', control: 'boolean', field: 'foldable' },
  // Real schema options.list is none/IPX2/IPX4/IPX5/IPX7/IPX8 (productType.ts:407)
  // -- was missing IPX2, lowercased IPX4/5/7, and had a phantom 'ip67' that
  // does not exist in the schema at all (sang-logium-3rv.5).
  { id: 'ipx', group: 'material', label: 'Water Resistance (IPX)', itemNo: 26, status: 'R', control: 'checkbox', field: 'ipxRating', options: opts([['none', 'None'], ['IPX2', 'IPX2'], ['IPX4', 'IPX4'], ['IPX5', 'IPX5'], ['IPX7', 'IPX7'], ['IPX8', 'IPX8']]) },

  // ── Wireless (domain-gated on connectivity !== 'wired') ────────────────
  // Real schema options.list (productType.ts:418) was missing 'aptX LL' and
  // used space-separated 'aptX HD'/'aptX Adaptive', not hyphenated -- both
  // silently zeroed those two out even after the countFor case-fix
  // (sang-logium-3rv.5).
  { id: 'codec', group: 'wireless', label: 'Bluetooth Codec', itemNo: 27, status: 'C', control: 'checkbox', field: 'bluetoothCodecs', options: opts([['SBC', 'SBC'], ['AAC', 'AAC'], ['aptX', 'aptX'], ['aptX HD', 'aptX HD'], ['aptX Adaptive', 'aptX Adaptive'], ['aptX LL', 'aptX LL'], ['LDAC', 'LDAC'], ['LC3', 'LC3']]) },
  { id: 'anc', group: 'wireless', label: 'Noise Cancelling', itemNo: 28, status: 'C', control: 'checkbox', field: 'anc', options: opts([['anc', 'Active Noise Cancelling'], ['passive', 'Passive Isolation Only'], ['none', 'None / Open']]) },
  { id: 'batteryLife', group: 'wireless', label: 'Battery Life', itemNo: 29, status: 'R', control: 'range', field: 'batteryLifeHours', min: 0, max: 70, step: 1, unit: 'hrs' },

  // ── Technical Specs ─────────────────────────────────────────────────────
  { id: 'driverType', group: 'technical', label: 'Driver Type', itemNo: 30, status: 'C', control: 'checkbox', field: 'driverType', options: opts([['dynamic', 'Dynamic'], ['planar-magnetic', 'Planar Magnetic'], ['electrostatic', 'Electrostatic'], ['balanced-armature', 'Balanced Armature'], ['amt', 'AMT / Ribbon'], ['bone-conduction', 'Bone Conduction'], ['electret', 'Electret'], ['hybrid', 'Hybrid']]) },
  // Real schema options.list is single-dynamic/single-ba/multi-ba/
  // hybrid-config/planar/other (productType.ts:472) -- 'tribrid' does not
  // exist in the schema at all and could never match; 'planar'/'other' were
  // missing entirely, so those products had no checkbox to select at all
  // (sang-logium-3rv.5).
  { id: 'driverConfig', group: 'technical', label: 'Driver Configuration', itemNo: 31, status: 'R', control: 'checkbox', field: 'driverConfigBucket', options: opts([['single-dynamic', 'Single Dynamic'], ['single-ba', 'Single BA'], ['multi-ba', 'Multi-BA'], ['hybrid-config', 'Hybrid'], ['planar', 'Planar'], ['other', 'Other']]) },
];

export const facetsForGroup = (group: FacetGroupId): FacetDef[] => FACETS.filter((f) => f.group === group);

export const FACET_BY_ID = new Map(FACETS.map((f) => [f.id, f]));

// ─────────────────────────────────────────────────────────────────────────
// Sort — should-be.md's observed baseline (9) + approved additions (2) = 11.
//
// Static value/label pairs only, same shape as production's SORT_OPTIONS in
// lib/catalogue/facetMap.ts — this is what the URL parser's allowlist and the
// (headless, product-data-blind) SortDropdown both consume. The comparator for
// each value — including the weighted-rating math a plain label can't carry —
// lives server-side in lib/filterProducts.ts, never imported by a client
// component. Keeping the two separate is what lets SortDropdown stay a pure
// URL <-> display control with zero product-data dependency, matching F2.
// ─────────────────────────────────────────────────────────────────────────

export const SORT_VALUES = [
  'featured',
  'most-relevant',
  'best-selling',
  'alpha-asc',
  'alpha-desc',
  'price-asc',
  'price-desc',
  'date-old',
  'date-new',
  'rating-desc',
  'discount-desc',
] as const;

export type SortValue = (typeof SORT_VALUES)[number];
export const SORT_DEFAULT: SortValue = 'featured';

const SORT_LABELS: Record<SortValue, string> = {
  featured: 'Featured',
  'most-relevant': 'Most Relevant',
  'best-selling': 'Best Selling',
  'alpha-asc': 'Alphabetically, A-Z',
  'alpha-desc': 'Alphabetically, Z-A',
  'price-asc': 'Price, Low to High',
  'price-desc': 'Price, High to Low',
  'date-old': 'Date, Old to New',
  'date-new': 'Date, New to Old',
  'rating-desc': 'Customer Rating, High to Low',
  'discount-desc': '% Discount, Biggest First',
};

export const SORT_OPTIONS: Option[] = SORT_VALUES.map((value) => ({ value, label: SORT_LABELS[value] }));
