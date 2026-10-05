// Headless facet definitions for the headphones slice: facet ids equal the
// ../facetMap.ts urlParam of the same facet; option lists mirror
// facetMap valueVocab (checked by ../../__tests__/facetConfigParity.spec.ts).

export type FacetGroupId = 'commercial' | 'type' | 'sound' | 'material' | 'wireless' | 'technical';

export interface FacetGroup {
  id: FacetGroupId;
  label: string;
  note?: string;
}

export const FACET_GROUPS: FacetGroup[] = [
  {
    id: 'commercial',
    label: '',
  },
  {
    id: 'type',
    label: '',
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
  /** Optional sub-section heading rendered above this facet in the panel, for
   *  grouping a few facets under one label without a new top-level FACET_GROUP. */
  subheading?: string;
}

export interface CheckboxFacet extends FacetBase {
  control: 'checkbox';
  /** Static closed vocabulary, or 'derived' to collect distinct values from the dataset at runtime (brand). */
  options: Option[] | 'derived';
}

export interface BooleanFacet extends FacetBase {
  control: 'boolean';
}

export interface RangeFacet extends FacetBase {
  control: 'range';
  min: number;
  max: number;
  unit: string;
}

export type FacetDef = CheckboxFacet | BooleanFacet | RangeFacet;

const opts = (pairs: [string, string][]): Option[] => pairs.map(([value, label]) => ({ value, label }));

/**
 * Generic facets (checkbox / boolean / range). Price is a bespoke control
 * rendered by the panel (FilterSidebar.tsx's PriceSection).
 */
export const FACETS: FacetDef[] = [
  // ── Commercial ──────────────────────────────────────────────────────────
  { id: 'brand', group: 'commercial', label: 'Brand', control: 'checkbox', options: 'derived' },
  // Awards / Recognition removed from the headphones sidebar per UX cleanup.
  // Condition, Discount, and New Arrivals removed (sang-logium-3rv.5):
  // productType.ts scopes `condition`, `dealsDiscount`, and `newArrival` to
  // categories: ["accessories", "audio-electronics"] only -- headphones has no
  // such field at all, so these could never carry a real count. Same class of
  // bug as the case-sensitivity fix, just unfixable because there is no real
  // data behind it for this category.
  { id: 'inStock', group: 'commercial', label: 'In Stock Only', control: 'boolean' },

  // ── Type ─────────────────────────────────────────────────────────────────
  // No closed options.list in the schema either -- derive from real data,
  // same treatment as brand and awards (sang-logium-3rv.5).
  { id: 'productCategory', group: 'type', label: 'Type', control: 'checkbox', options: opts([['over-ear', 'Over Ear'], ['iem', 'In-Ear'], ['true-wireless', 'Wireless'], ['on-ear', 'On Ear']]) },
  { id: 'acousticDesign', group: 'type', label: 'Acoustic Design', control: 'checkbox', options: opts([['open-back', 'Open-Back'], ['closed-back', 'Closed-Back'], ['semi-open', 'Semi-Open / Hybrid']]) },
  { id: 'connectivity', group: 'type', label: 'Connectivity', control: 'checkbox', options: opts([['wired', 'Wired'], ['wireless', 'Wireless (Bluetooth)'], ['true-wireless', 'True Wireless'], ['hybrid', 'Wired + Wireless Hybrid']]) },

  // ── Sound Properties ────────────────────────────────────────────────────
  // Values are the exact strings from features/products/schema/productType.ts's
  // soundSignature options.list (sang-logium-3rv.5) -- they must match
  // ../facetMap.ts's valueVocab exactly (case included).
  // sang-logium-3rv.9 -- schema options.list (productType.ts) has 8 values;
  // 'Harman-target-like' was missing here, so a product carrying it could
  // never be selected or counted. Added to match the schema exactly.
  { id: 'soundSignature', group: 'sound', label: 'Signature', control: 'checkbox', options: opts([['Neutral', 'Neutral / Reference'], ['Warm', 'Warm'], ['Bright/Analytical', 'Bright / Analytical'], ['Dark', 'Dark'], ['V-Shaped', 'V-Shaped'], ['Basshead', 'Bass'], ['Mid-Forward', 'Mid-Forward'], ['Harman-target-like', 'Harman Target-Like']]) },
  { id: 'impedance', group: 'sound', label: 'Impedance', control: 'range', min: 3, max: 520, unit: 'Ω' },
  { id: 'sensitivity', group: 'sound', label: 'Sensitivity', control: 'range', min: 89, max: 128, unit: 'dB/mW' },
  // Simplification of "frequency response range" (a per-product min–max pair) to
  // its single most-compared dimension, bass extension — see the enrichment
  // script for the full rationale.
  { id: 'bassExtension', group: 'sound', label: 'Frequency Response', control: 'range', min: 2, max: 25, unit: 'Hz' },

  // ── Material Factors ────────────────────────────────────────────────────
  { id: 'microphone', group: 'material', label: 'Microphone', control: 'boolean' },
  // Real schema options.list (productType.ts:385) has 9 entries; 4 were
  // missing, so real products with those terminations had no selectable
  // checkbox (sang-logium-3rv.5).
  { id: 'cableTermination', group: 'material', label: 'Cable Type', control: 'checkbox', options: opts([['3.5mm', '3.5mm SE'], ['2.5mm-balanced', '2.5mm Balanced'], ['4.4mm-balanced', '4.4mm Balanced'], ['4-pin-xlr', '4-Pin XLR'], ['6.35mm', '6.35mm (1/4 inch)'], ['usb-c', 'USB-C'], ['mmcx', 'MMCX'], ['2-pin', '2-Pin'], ['fixed-cable', 'Fixed Cable']]) },
  { id: 'detachableCable', group: 'material', label: 'Detachable Cable', control: 'boolean', subheading: 'Cable Properties' },
  { id: 'foldable', group: 'material', label: 'Foldable', control: 'boolean' },
  { id: 'cableLength', group: 'material', label: 'Cable Length', control: 'range', min: 0.2, max: 4.0, unit: 'm' },
  // Real schema options.list is none/IPX2/IPX4/IPX5/IPX7/IPX8 (productType.ts:407)
  // -- was missing IPX2, lowercased IPX4/5/7, and had a phantom 'ip67' that
  // does not exist in the schema at all (sang-logium-3rv.5).
  { id: 'ipx', group: 'material', label: 'Water Resistance (IPX)', control: 'checkbox', options: opts([['none', 'None'], ['IPX2', 'IPX2'], ['IPX4', 'IPX4'], ['IPX5', 'IPX5'], ['IPX7', 'IPX7'], ['IPX8', 'IPX8']]) },
  { id: 'requiresAmplifier', group: 'material', label: 'Requires Amplifier', control: 'boolean' },
  { id: 'portable', group: 'material', label: 'Portable', control: 'boolean' },

  // ── Wireless (domain-gated on connectivity !== 'wired') ────────────────
  // Real schema options.list (productType.ts:418) was missing 'aptX LL' and
  // used space-separated 'aptX HD'/'aptX Adaptive', not hyphenated -- both
  // silently zeroed those two out even after the countFor case-fix
  // (sang-logium-3rv.5).
  { id: 'codec', group: 'wireless', label: 'Bluetooth Codec', control: 'checkbox', options: opts([['SBC', 'SBC'], ['AAC', 'AAC'], ['aptX', 'aptX'], ['aptX HD', 'aptX HD'], ['aptX Adaptive', 'aptX Adaptive'], ['aptX LL', 'aptX LL'], ['LDAC', 'LDAC'], ['LC3', 'LC3']]) },
  { id: 'anc', group: 'wireless', label: 'Noise Cancelling', control: 'checkbox', options: opts([['anc', 'Active Noise Cancelling'], ['passive', 'Passive Isolation Only'], ['none', 'None / Open']]) },
  { id: 'batteryLife', group: 'wireless', label: 'Battery Life', control: 'range', min: 0, max: 70, unit: 'hrs' },

  // ── Technical Specs ─────────────────────────────────────────────────────
  { id: 'driverType', group: 'technical', label: 'Driver Type', control: 'checkbox', options: opts([['dynamic', 'Dynamic'], ['planar-magnetic', 'Planar Magnetic'], ['electrostatic', 'Electrostatic'], ['balanced-armature', 'Balanced Armature'], ['amt', 'AMT / Ribbon'], ['bone-conduction', 'Bone Conduction'], ['electret', 'Electret'], ['hybrid', 'Hybrid']]) },
  // Real schema options.list is single-dynamic/single-ba/multi-ba/
  // hybrid-config/planar/other (productType.ts:472) -- 'tribrid' does not
  // exist in the schema at all and could never match; 'planar'/'other' were
  // missing entirely, so those products had no checkbox to select at all
  // (sang-logium-3rv.5).
  { id: 'driverConfig', group: 'technical', label: 'Driver Configuration', control: 'checkbox', options: opts([['single-dynamic', 'Single Dynamic'], ['single-ba', 'Single BA'], ['multi-ba', 'Multi-BA'], ['hybrid-config', 'Hybrid'], ['planar', 'Planar'], ['other', 'Other']]) },
];

export const facetsForGroup = (group: FacetGroupId): FacetDef[] => FACETS.filter((f) => f.group === group);

// ─────────────────────────────────────────────────────────────────────────
// Sort — only options that can be made meaningful from the current headphones
// product data. Options not data-supported for this category (featured,
// most-relevant, best-selling, rating-desc, discount-desc) are kept out of
// this route's dropdown until their backing fields are populated. The
// comparator for each value lives server-side in
// @/features/product-filtering/adapters/sanity/buildProductQuery.ts.
//
// Static value/label pairs only, same shape as production's SORT_OPTIONS in
// ../facetMap.ts — this is what the URL parser's allowlist and the
// (headless, product-data-blind) SortDropdown both consume. Keeping the two
// separate is what lets SortDropdown stay a pure URL <-> display control with
// zero product-data dependency, matching F2.
// ─────────────────────────────────────────────────────────────────────────

export const SORT_VALUES = [
  'newest',
  'price-asc',
  'price-desc',
  'alpha-asc',
  'alpha-desc',
  'date-old',
] as const;

export type SortValue = (typeof SORT_VALUES)[number];
export const SORT_DEFAULT: SortValue = 'newest';

const SORT_LABELS: Record<SortValue, string> = {
  newest: 'Newest',
  'price-asc': 'Price, Low to High',
  'price-desc': 'Price, High to Low',
  'alpha-asc': 'Alphabetically, A-Z',
  'alpha-desc': 'Alphabetically, Z-A',
  'date-old': 'Date, Old to New',
};

export const SORT_OPTIONS: Option[] = SORT_VALUES.map((value) => ({ value, label: SORT_LABELS[value] }));
