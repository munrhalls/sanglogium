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
  note: string;
}

// Order + copy straight from docs/filters-sort/should-be.md's group headers.
export const FACET_GROUPS: FacetGroup[] = [
  {
    id: 'commercial',
    label: 'Commercial',
    note: 'Not about the product — about whether, and how, to buy it.',
  },
  {
    id: 'type',
    label: 'Type',
    note: "External, experiential identity — how a shopper would describe what kind of headphone this is, independent of how it's built inside or how it sounds.",
  },
  {
    id: 'sound',
    label: 'Sound Properties',
    note: "Everything that's a fact about how it sounds — perceptual tuning and the measured acoustics that predict it, together.",
  },
  {
    id: 'material',
    label: 'Material Factors',
    note: 'Internal, but tangible — physical construction and hardware-presence facts.',
  },
  {
    id: 'wireless',
    label: 'Wireless',
    note: 'Domain-gated — exists only once Connectivity is Wireless.',
  },
  {
    id: 'technical',
    label: 'Technical Specs',
    note: 'Internal and categorical — engineering architecture.',
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
  { id: 'awards', group: 'commercial', label: 'Awards / Recognition', itemNo: 4, status: 'R', control: 'checkbox', field: 'awards', options: opts([['award-winner', 'Award Winner'], ['editors-choice', "Editor's Choice"]]) },
  { id: 'condition', group: 'commercial', label: 'Condition / Stock Type', itemNo: 5, status: 'C', control: 'checkbox', field: 'condition', options: opts([['new', 'New'], ['open-box', 'Open-Box'], ['b-stock', 'Certified / Sealed B-Stock'], ['demo', 'Demo Unit'], ['used', 'Used / Trade-In'], ['refurbished', 'Refurbished']]) },
  { id: 'inStockOnly', group: 'commercial', label: 'In Stock Only', itemNo: 6, status: 'C', control: 'boolean', field: 'inStockOnly' },
  { id: 'deals', group: 'commercial', label: 'Deals / Discount', itemNo: 7, status: 'C', control: 'checkbox', field: 'deals', options: opts([['on-sale', 'On Sale'], ['clearance', 'Clearance']]) },
  { id: 'newArrival', group: 'commercial', label: 'New Arrivals', itemNo: 8, status: 'C', control: 'boolean', field: 'isNewArrival' },
  { id: 'availability', group: 'commercial', label: 'Preorder / Interest Check Status', itemNo: 9, status: 'C', control: 'checkbox', field: 'availability', options: opts([['in-stock', 'In Stock'], ['preorder', 'Preorder'], ['interest-check', 'Interest Check / Group Buy']]) },

  // ── Type ─────────────────────────────────────────────────────────────────
  { id: 'productCategory', group: 'type', label: 'Product Category / Type', itemNo: 10, status: 'C', control: 'checkbox', field: 'productCategory', options: opts([['over-ear', 'Over-Ear'], ['iem', 'In-Ear Monitor'], ['on-ear', 'On-Ear'], ['true-wireless', 'True Wireless']]) },
  { id: 'wearingStyle', group: 'type', label: 'Wearing Style / Form Factor', itemNo: 11, status: 'C', control: 'checkbox', field: 'wearingStyle', options: opts([['over-ear', 'Over-Ear'], ['on-ear', 'On-Ear'], ['in-ear', 'In-Ear']]) },
  { id: 'acousticDesign', group: 'type', label: 'Acoustic Design', itemNo: 12, status: 'C', control: 'checkbox', field: 'acousticDesign', options: opts([['open-back', 'Open-Back'], ['closed-back', 'Closed-Back'], ['semi-open', 'Semi-Open / Hybrid']]) },
  { id: 'fitType', group: 'type', label: 'Fit Type (IEM)', itemNo: 13, status: 'R', control: 'checkbox', field: 'fitType', options: opts([['universal', 'Universal Fit'], ['custom', 'Custom Fit (CIEM)']]) },
  { id: 'connectivity', group: 'type', label: 'Connectivity', itemNo: 14, status: 'C', control: 'checkbox', field: 'connectivity', options: opts([['wired', 'Wired'], ['wireless', 'Wireless (Bluetooth)'], ['true-wireless', 'True Wireless'], ['hybrid', 'Wired + Wireless Hybrid']]) },
  { id: 'portable', group: 'type', label: 'Portable', itemNo: 15, status: 'C', control: 'boolean', field: 'portable' },

  // ── Sound Properties ────────────────────────────────────────────────────
  { id: 'soundSignature', group: 'sound', label: 'Sound Signature / Tonal Preference', itemNo: 16, status: 'R', control: 'checkbox', field: 'soundSignature', options: opts([['neutral', 'Neutral / Reference'], ['warm', 'Warm'], ['bright', 'Bright / Analytical'], ['dark', 'Dark'], ['v-shaped', 'V-Shaped'], ['basshead', 'Basshead'], ['mid-forward', 'Mid-Forward'], ['harman-like', 'Harman-Target-Like']]) },
  { id: 'impedance', group: 'sound', label: 'Impedance', itemNo: 17, status: 'R', control: 'range', field: 'impedanceOhms', min: 8, max: 600, step: 1, unit: 'Ω' },
  { id: 'sensitivity', group: 'sound', label: 'Sensitivity', itemNo: 18, status: 'R', control: 'range', field: 'sensitivityDbMw', min: 85, max: 125, step: 1, unit: 'dB/mW' },
  // Simplification of "frequency response range" (a per-product min–max pair) to
  // its single most-compared dimension, bass extension — see the enrichment
  // script for the full rationale (also flagged in should-be.md's own evidence
  // notes: printed FR min/max is a weak spec next to a measured graph).
  { id: 'bassExtension', group: 'sound', label: 'Frequency Response — Bass Extension', itemNo: 19, status: 'R', control: 'range', field: 'bassExtensionHz', min: 5, max: 60, step: 1, unit: 'Hz' },
  { id: 'requiresAmplifier', group: 'sound', label: 'Requires Amplifier', itemNo: 20, status: 'C', control: 'boolean', field: 'requiresAmplifier' },

  // ── Material Factors ────────────────────────────────────────────────────
  { id: 'microphone', group: 'material', label: 'Microphone / Call Support', itemNo: 21, status: 'C', control: 'boolean', field: 'microphone' },
  { id: 'cableTermination', group: 'material', label: 'Cable / Termination Connector', itemNo: 22, status: 'C', control: 'checkbox', field: 'cableTermination', options: opts([['3.5mm', '3.5mm SE'], ['2.5mm-balanced', '2.5mm Balanced'], ['4.4mm-balanced', '4.4mm Balanced'], ['4-pin-xlr', '4-Pin XLR'], ['6.35mm', '6.35mm (1/4")']]) },
  { id: 'detachableCable', group: 'material', label: 'Detachable / Upgradeable Cable', itemNo: 23, status: 'C', control: 'boolean', field: 'detachableCable' },
  { id: 'cableLength', group: 'material', label: 'Cable Length', itemNo: 24, status: 'R', control: 'range', field: 'cableLengthM', min: 0.5, max: 3.5, step: 0.1, unit: 'm' },
  { id: 'foldable', group: 'material', label: 'Foldable', itemNo: 25, status: 'C', control: 'boolean', field: 'foldable' },
  { id: 'ipx', group: 'material', label: 'Water / Sweat Resistance (IPX)', itemNo: 26, status: 'R', control: 'checkbox', field: 'ipxRating', options: opts([['none', 'None'], ['ipx4', 'IPX4'], ['ipx5', 'IPX5'], ['ipx7', 'IPX7'], ['ip67', 'IP67']]) },

  // ── Wireless (domain-gated on connectivity !== 'wired') ────────────────
  { id: 'codec', group: 'wireless', label: 'Bluetooth Codec', itemNo: 27, status: 'C', control: 'checkbox', field: 'bluetoothCodecs', options: opts([['sbc', 'SBC'], ['aac', 'AAC'], ['aptx', 'aptX'], ['aptx-hd', 'aptX HD'], ['aptx-adaptive', 'aptX Adaptive'], ['ldac', 'LDAC'], ['lc3', 'LC3']]) },
  { id: 'anc', group: 'wireless', label: 'Active Noise Cancelling', itemNo: 28, status: 'C', control: 'checkbox', field: 'anc', options: opts([['anc', 'ANC'], ['passive', 'Passive Isolation Only'], ['none', 'None / Open']]) },
  { id: 'batteryLife', group: 'wireless', label: 'Battery Life', itemNo: 29, status: 'R', control: 'range', field: 'batteryLifeHours', min: 0, max: 70, step: 1, unit: 'hrs' },

  // ── Technical Specs ─────────────────────────────────────────────────────
  { id: 'driverType', group: 'technical', label: 'Driver Type', itemNo: 30, status: 'C', control: 'checkbox', field: 'driverType', options: opts([['dynamic', 'Dynamic'], ['planar-magnetic', 'Planar Magnetic'], ['electrostatic', 'Electrostatic'], ['balanced-armature', 'Balanced Armature'], ['amt', 'AMT / Ribbon'], ['bone-conduction', 'Bone Conduction'], ['electret', 'Electret'], ['hybrid', 'Hybrid']]) },
  { id: 'driverConfig', group: 'technical', label: 'Driver Configuration / Count', itemNo: 31, status: 'R', control: 'checkbox', field: 'driverConfigBucket', options: opts([['single-dynamic', 'Single Dynamic'], ['single-ba', 'Single BA'], ['multi-ba', 'Multi-BA'], ['hybrid-config', 'Hybrid'], ['tribrid', 'Tribrid']]) },
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
