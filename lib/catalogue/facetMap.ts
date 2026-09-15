// Source-of-truth copies of _project/filters/facet-map.json and
// _project/filters/sort-map.json for the app layer.
//
// They are hard-coded here (not imported from _project) because _project is
// research/tooling and is excluded from the TypeScript include list. The
// _project/filters/check-wiring.cjs script verifies these arrays stay in sync
// with the canonical JSON files.

export type FilterFacetType = 'range' | 'enum' | 'boolean' | 'multi';

export interface FilterFacet {
  /** Human-facing facet name (matches facet-map.json). */
  facet: string;
  /** Sanity filterAttributes path, e.g. "filterAttributes.wearingStyle". */
  field: string;
  /** Storage type. */
  type: FilterFacetType;
  /** Closed vocabulary or placeholder marker. */
  valueVocab: string[];
  /** Applicable category slugs; ["*"] means universal. */
  categories: string[];
  /** URL query-param key. */
  urlParam: string;
}

export interface SortOption {
  /** Human-facing sort label. */
  sort: string;
  /** URL query-param value. */
  urlValue: string;
  /** GROQ field path. */
  backingField: string;
  /** Sort direction. */
  direction: 'asc' | 'desc';
  /** Tie-break GROQ fragment (comma-separated). */
  tieBreak: string;
}

export const FILTER_FACETS: FilterFacet[] = [
  {
    facet: 'Price',
    field: 'filterAttributes.price',
    type: 'range',
    valueVocab: ['min', 'max'],
    categories: ['*'],
    urlParam: 'price',
  },
  {
    facet: 'Brand',
    field: 'filterAttributes.brand',
    type: 'multi',
    valueVocab: ['<brand-slug>'],
    categories: ['*'],
    urlParam: 'brand',
  },
  {
    facet: 'In stock only',
    field: 'filterAttributes.inStock',
    type: 'boolean',
    valueVocab: ['true', 'false'],
    categories: ['*'],
    urlParam: 'inStock',
  },
  {
    facet: 'Category',
    field: 'filterAttributes.category',
    type: 'multi',
    valueVocab: ['headphones', 'audio-electronics', 'accessories'],
    categories: ['all-products'],
    urlParam: 'category',
  },
  {
    facet: 'Wearing style',
    field: 'filterAttributes.wearingStyle',
    type: 'enum',
    valueVocab: ['over-ear', 'on-ear', 'in-ear'],
    categories: ['headphones'],
    urlParam: 'wearingStyle',
  },
  {
    facet: 'Back design',
    field: 'filterAttributes.acousticDesign',
    type: 'enum',
    valueVocab: ['open-back', 'closed-back', 'semi-open'],
    categories: ['headphones'],
    urlParam: 'acousticDesign',
  },
  {
    facet: 'Driver type',
    field: 'filterAttributes.driverType',
    type: 'enum',
    // Was missing 3 of the schema's 8 real options (sanity-cms/schemaTypes/
    // productType.ts:452) -- amt/bone-conduction/electret silently never got
    // counted, regardless of real product data.
    valueVocab: ['dynamic', 'planar-magnetic', 'electrostatic', 'balanced-armature', 'hybrid', 'amt', 'bone-conduction', 'electret'],
    categories: ['headphones'],
    urlParam: 'driverType',
  },
  {
    facet: 'Connectivity',
    field: 'filterAttributes.connectivity',
    type: 'enum',
    // Was missing 2 of the schema's 4 real options (sanity-cms/schemaTypes/
    // productType.ts:296) -- true-wireless/hybrid silently never got counted.
    valueVocab: ['wired', 'wireless', 'true-wireless', 'hybrid'],
    categories: ['headphones'],
    urlParam: 'connectivity',
  },
  {
    facet: 'Connector / plug',
    field: 'filterAttributes.cableTermination',
    type: 'multi',
    valueVocab: ['3.5mm', '6.35mm', '4.4mm-balanced', '4-pin-xlr', '2.5mm-balanced', 'usb-c', 'mmcx', '2-pin', 'fixed-cable'],
    categories: ['headphones'],
    urlParam: 'cableTermination',
  },
  {
    facet: 'Microphone',
    field: 'filterAttributes.microphone',
    type: 'boolean',
    valueVocab: ['true', 'false'],
    categories: ['headphones'],
    urlParam: 'microphone',
  },
  {
    facet: 'Noise cancelling',
    field: 'filterAttributes.anc',
    type: 'enum',
    valueVocab: ['anc', 'passive', 'none'],
    categories: ['headphones'],
    urlParam: 'anc',
  },
  {
    facet: 'Requires amplifier',
    field: 'filterAttributes.requiresAmplifier',
    type: 'boolean',
    valueVocab: ['true', 'false'],
    categories: ['headphones'],
    urlParam: 'requiresAmplifier',
  },
  // sang-logium-3rv.4 — the following headphones facets were already sourced
  // in filterAttributes but missing from FILTER_FACETS, so getFilterFacets
  // never computed their counts and the sidebar showed them greyed out even
  // though the underlying product data exists. urlParam values below must
  // match the `id` keys in app/(test)/poc/filter-sort/headphones/lib/facetConfig.ts —
  // that's the key production's copied-in FilterSidebar/FilterControls use to
  // look up checkboxCounts/booleanCounts, independent of the Sanity field name.
  // Awards / recognition facet removed from the headphones sidebar per UX cleanup.
  {
    facet: 'Product category',
    field: 'filterAttributes.productCategory',
    type: 'multi',
    // No closed options.list in the schema either — derive from data.
    valueVocab: ['<product-category>'],
    categories: ['headphones'],
    urlParam: 'productCategory',
  },
  {
    facet: 'Fit type',
    field: 'filterAttributes.fitType',
    type: 'enum',
    valueVocab: ['universal', 'custom'],
    categories: ['headphones'],
    urlParam: 'fitType',
  },
  {
    facet: 'Portable',
    field: 'filterAttributes.portable',
    type: 'boolean',
    valueVocab: ['true', 'false'],
    categories: ['headphones'],
    urlParam: 'portable',
  },
  {
    facet: 'Sound signature',
    field: 'filterAttributes.soundSignature',
    type: 'enum',
    valueVocab: ['Neutral', 'Warm', 'Bright/Analytical', 'Dark', 'V-Shaped', 'Basshead', 'Mid-Forward'],
    categories: ['headphones'],
    urlParam: 'soundSignature',
  },
  {
    facet: 'Detachable cable',
    field: 'filterAttributes.detachableCable',
    type: 'boolean',
    valueVocab: ['true', 'false'],
    categories: ['headphones'],
    urlParam: 'detachableCable',
  },
  {
    facet: 'Foldable',
    field: 'filterAttributes.foldable',
    type: 'boolean',
    valueVocab: ['true', 'false'],
    categories: ['headphones'],
    urlParam: 'foldable',
  },
  {
    facet: 'Water / sweat resistance',
    field: 'filterAttributes.ipxRating',
    type: 'enum',
    valueVocab: ['none', 'IPX2', 'IPX4', 'IPX5', 'IPX7', 'IPX8'],
    categories: ['headphones'],
    urlParam: 'ipx',
  },
  {
    facet: 'Bluetooth codec',
    field: 'filterAttributes.bluetoothCodecs',
    type: 'multi',
    valueVocab: ['SBC', 'AAC', 'aptX', 'aptX HD', 'aptX Adaptive', 'aptX LL', 'LDAC', 'LC3'],
    categories: ['headphones'],
    urlParam: 'codec',
  },
  {
    facet: 'Driver configuration',
    field: 'filterAttributes.driverConfigBucket',
    type: 'enum',
    valueVocab: ['single-dynamic', 'single-ba', 'multi-ba', 'hybrid-config', 'planar', 'other'],
    categories: ['headphones'],
    urlParam: 'driverConfig',
  },
  // sang-logium-3rv.5 -- these 5 were declared in the POC's facetConfig.ts
  // (RangeFacet) but never added here, so RangeControl rendered a slider with
  // zero data or query dependency: hardcoded min/max, no filtering effect at
  // all. urlParam matches the `id` keys in facetConfig.ts, same convention as
  // every other headphones facet added in sang-logium-3rv.4, because that's
  // the key RangeControl's useFilterParam(`${facet.id}Min/Max`) already
  // writes to (it was live, just never read anywhere downstream).
  {
    facet: 'Impedance',
    field: 'filterAttributes.impedanceOhms',
    type: 'range',
    valueVocab: ['min', 'max'],
    categories: ['headphones'],
    urlParam: 'impedance',
  },
  {
    facet: 'Sensitivity',
    field: 'filterAttributes.sensitivityDbMw',
    type: 'range',
    valueVocab: ['min', 'max'],
    categories: ['headphones'],
    urlParam: 'sensitivity',
  },
  {
    facet: 'Frequency response -- bass extension',
    // freqResponseHz is a {min,max} object (sanity-cms/schemaTypes/
    // productType.ts:337); there is no stored bassExtensionHz field --
    // docs/filters-sort/schema-headphones.md:51 documents bass extension as
    // "MAY be derived from freqResponseHz.min at render time". Lower min =
    // deeper bass extension, so this filters on the low end of the pair.
    field: 'filterAttributes.freqResponseHz.min',
    type: 'range',
    valueVocab: ['min', 'max'],
    categories: ['headphones'],
    urlParam: 'bassExtension',
  },
  {
    facet: 'Cable length',
    field: 'filterAttributes.cableLengthM',
    type: 'range',
    valueVocab: ['min', 'max'],
    categories: ['headphones'],
    urlParam: 'cableLength',
  },
  {
    facet: 'Battery life',
    // batteryLifeHours is {ancOff, ancOn}, both nullable (productType.ts:434).
    // should-be.md wants both shown separately where available; for the single
    // range-filter value this facet backs, ancOff (the headline, ANC-off
    // figure manufacturers usually quote) is the simplification -- same
    // one-field-of-a-pair treatment as bass extension above. A product with
    // only ancOn populated will not match this filter; that is a known
    // narrowing, not a bug, flagged for follow-up if it proves wrong in
    // practice.
    field: 'filterAttributes.batteryLifeHours.ancOff',
    type: 'range',
    valueVocab: ['min', 'max'],
    categories: ['headphones'],
    urlParam: 'batteryLife',
  },
  {
    facet: 'Device type',
    field: 'filterAttributes.deviceType',
    type: 'enum',
    valueVocab: ['integrated-amplifier', 'power-amplifier', 'preamplifier', 'av-surround-receiver', 'stereo-receiver', 'dac', 'network-streamer', 'cd-player-transport', 'turntable'],
    categories: ['audio-electronics'],
    urlParam: 'deviceType',
  },
  {
    facet: 'Form factor',
    field: 'filterAttributes.formFactor',
    type: 'enum',
    valueVocab: ['desktop', 'portable', 'dongle'],
    categories: ['audio-electronics'],
    urlParam: 'formFactor',
  },
  {
    facet: 'Amplification',
    field: 'filterAttributes.amplification',
    type: 'enum',
    valueVocab: ['solid-state', 'tube', 'hybrid'],
    categories: ['audio-electronics'],
    urlParam: 'amplification',
  },
  {
    facet: 'DAC included',
    field: 'filterAttributes.dacIncluded',
    type: 'boolean',
    valueVocab: ['true', 'false'],
    categories: ['audio-electronics'],
    urlParam: 'dacIncluded',
  },
  {
    facet: 'Balanced output',
    field: 'filterAttributes.balancedOutput',
    type: 'boolean',
    valueVocab: ['true', 'false'],
    categories: ['audio-electronics'],
    urlParam: 'balancedOutput',
  },
  {
    facet: 'Inputs',
    field: 'filterAttributes.inputs',
    type: 'multi',
    valueVocab: ['usb', 'optical', 'coaxial', 'rca', 'bluetooth'],
    categories: ['audio-electronics'],
    urlParam: 'inputs',
  },
  {
    facet: 'Outputs',
    field: 'filterAttributes.outputs',
    type: 'multi',
    valueVocab: ['speaker-terminals', 'pre-out-rca', 'pre-out-xlr', 'headphone-jack', 'subwoofer-out'],
    categories: ['audio-electronics'],
    urlParam: 'outputs',
  },
  {
    facet: 'Accessory type',
    field: 'filterAttributes.accessoryType',
    type: 'enum',
    valueVocab: ['cables-interconnects', 'stands-isolation', 'racks-furniture', 'power', 'cases-storage-transport', 'cleaning-maintenance', 'replacement-parts', 'adapters-converters', 'room-acoustic-treatment'],
    categories: ['accessories'],
    urlParam: 'accessoryType',
  },
  {
    facet: 'Connector / termination',
    field: 'filterAttributes.connectorTermination',
    type: 'multi',
    valueVocab: ['rca', 'xlr', 'banana-plug', 'spade', 'bnc', '3.5mm', '2.5mm', '4.4mm', 'mini-to-rca'],
    categories: ['accessories'],
    urlParam: 'connectorTermination',
  },
];

export const SORT_OPTIONS = [
  {
    sort: 'Featured',
    urlValue: 'featured',
    backingField: 'sortAttributes.featuredPriority',
    direction: 'desc',
    tieBreak: 'sortAttributes.popularity desc, _createdAt desc',
  },
  {
    sort: 'Best selling',
    urlValue: 'best-selling',
    backingField: 'sortAttributes.popularity',
    direction: 'desc',
    tieBreak: '_createdAt desc',
  },
  {
    sort: 'Price: Low to High',
    urlValue: 'price-asc',
    backingField: 'price_data.unit_amount',
    direction: 'asc',
    tieBreak: '_createdAt desc',
  },
  {
    sort: 'Price: High to Low',
    urlValue: 'price-desc',
    backingField: 'price_data.unit_amount',
    direction: 'desc',
    tieBreak: '_createdAt desc',
  },
  {
    sort: 'Newest',
    urlValue: 'newest',
    backingField: '_createdAt',
    direction: 'desc',
    tieBreak: '_id desc',
  },
] as const;

/** Canonical category keys used by `FilterFacet.categories` (besides `"*"`). */
export type FacetCategory =
  | 'headphones'
  | 'audio-electronics'
  | 'accessories'
  | 'all-products';

/**
 * The facets that apply to a given catalogue category: the universal ones
 * (`categories: ["*"]`) plus any whose `categories` list names this category.
 * An unrecognised category still gets the universal facets.
 */
export const facetsForCategory = (category: string): FilterFacet[] =>
  FILTER_FACETS.filter(
    (f) => f.categories.includes('*') || f.categories.includes(category),
  );

export const FILTER_FACET_BY_PARAM = new Map(FILTER_FACETS.map((f) => [f.urlParam, f]));

export const FILTER_FACET_BY_FIELD = new Map(
  FILTER_FACETS.map((f) => [f.field.replace('filterAttributes.', ''), f])
);

export const SORT_OPTION_BY_VALUE = new Map(SORT_OPTIONS.map((s) => [s.urlValue, s]));

export const isPlaceholderVocab = (vocab: string[]) =>
  vocab.some((v) => v.startsWith('<') && v.endsWith('>'));
