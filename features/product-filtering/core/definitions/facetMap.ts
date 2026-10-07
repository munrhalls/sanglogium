// Canonical facet and sort definitions for the product-filtering feature.
// Single source of truth.

export type FilterFacetType = 'range' | 'enum' | 'boolean' | 'multi';

export interface FilterFacet {
  /** Human-facing facet name. */
  facet: string;
  /** Key path inside the product's filterAttributes object (RawProduct
   *  shape, e.g. "wearingStyle", "freqResponseHz.min"). The document-level
   *  'filterAttributes.' prefix lives in adapters/sanity/fieldMap.ts. */
  attribute: string;
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
  /** Sort direction. */
  direction: 'asc' | 'desc';
}

export const FILTER_FACETS: FilterFacet[] = [
  {
    facet: 'Price',
    attribute: 'price',
    type: 'range',
    valueVocab: ['min', 'max'],
    categories: ['*'],
    urlParam: 'price',
  },
  {
    facet: 'Brand',
    attribute: 'brand',
    type: 'multi',
    valueVocab: ['<brand-slug>'],
    categories: ['*'],
    urlParam: 'brand',
  },
  {
    facet: 'In stock only',
    attribute: 'inStock',
    type: 'boolean',
    valueVocab: ['true', 'false'],
    categories: ['*'],
    urlParam: 'inStock',
  },
  {
    facet: 'Category',
    attribute: 'category',
    type: 'multi',
    valueVocab: ['headphones', 'audio-electronics', 'accessories'],
    categories: ['all-products'],
    urlParam: 'category',
  },
  {
    facet: 'Wearing style',
    attribute: 'wearingStyle',
    // Schema field is an array (productType.ts) despite being single-select in
    // practice -- 'enum' here made buildProductQuery.ts emit a scalar
    // `lower(field) in [...]` predicate against an array field, which silently
    // failed to match any correctly-typed product and only matched legacy
    // un-migrated docs storing a raw string (sang-logium bug hunt 2026-09-15).
    type: 'multi',
    valueVocab: ['over-ear', 'on-ear', 'in-ear'],
    categories: ['headphones'],
    urlParam: 'wearingStyle',
  },
  {
    facet: 'Back design',
    attribute: 'acousticDesign',
    // Array field in schema, same enum/array mismatch as wearingStyle above.
    type: 'multi',
    valueVocab: ['open-back', 'closed-back', 'semi-open'],
    categories: ['headphones'],
    urlParam: 'acousticDesign',
  },
  {
    facet: 'Driver type',
    attribute: 'driverType',
    // Array field in schema, same enum/array mismatch as wearingStyle above.
    type: 'multi',
    // Was missing 3 of the schema's 8 real options (features/products/schema/
    // productType.ts:452) -- amt/bone-conduction/electret silently never got
    // counted, regardless of real product data.
    valueVocab: ['dynamic', 'planar-magnetic', 'electrostatic', 'balanced-armature', 'hybrid', 'amt', 'bone-conduction', 'electret'],
    categories: ['headphones'],
    urlParam: 'driverType',
  },
  {
    facet: 'Connectivity',
    attribute: 'connectivity',
    type: 'enum',
    // Was missing 2 of the schema's 4 real options (features/products/schema/
    // productType.ts:296) -- true-wireless/hybrid silently never got counted.
    valueVocab: ['wired', 'wireless', 'true-wireless', 'hybrid'],
    categories: ['headphones'],
    urlParam: 'connectivity',
  },
  {
    facet: 'Connector / plug',
    attribute: 'cableTermination',
    type: 'multi',
    valueVocab: ['3.5mm', '6.35mm', '4.4mm-balanced', '4-pin-xlr', '2.5mm-balanced', 'usb-c', 'mmcx', '2-pin', 'fixed-cable'],
    categories: ['headphones'],
    urlParam: 'cableTermination',
  },
  {
    facet: 'Microphone',
    attribute: 'microphone',
    type: 'boolean',
    valueVocab: ['true', 'false'],
    categories: ['headphones'],
    urlParam: 'microphone',
  },
  {
    facet: 'Noise cancelling',
    attribute: 'anc',
    type: 'enum',
    valueVocab: ['anc', 'passive', 'none'],
    categories: ['headphones'],
    urlParam: 'anc',
  },
  {
    facet: 'Requires amplifier',
    attribute: 'requiresAmplifier',
    type: 'boolean',
    valueVocab: ['true', 'false'],
    categories: ['headphones'],
    urlParam: 'requiresAmplifier',
  },
  // sang-logium-3rv.4 — the following headphones facets were already sourced
  // in filterAttributes but missing from FILTER_FACETS, so getFilterFacets
  // never computed their counts and the sidebar showed them greyed out even
  // though the underlying product data exists. urlParam values below must
  // match the `id` keys in features/product-filtering/core/definitions/categories/headphones.ts —
  // that's the key production's copied-in FilterSidebar/FilterControls use to
  // look up checkboxCounts/booleanCounts, independent of the Sanity field name.
  // Awards / recognition facet removed from the headphones sidebar per UX cleanup.
  {
    facet: 'Product category',
    attribute: 'productCategory',
    type: 'multi',
    // No closed options.list in the schema either — derive from data.
    valueVocab: ['<product-category>'],
    categories: ['headphones'],
    urlParam: 'productCategory',
  },
  {
    facet: 'Fit type',
    attribute: 'fitType',
    type: 'enum',
    valueVocab: ['universal', 'custom'],
    categories: ['headphones'],
    urlParam: 'fitType',
  },
  {
    facet: 'Portable',
    attribute: 'portable',
    type: 'boolean',
    valueVocab: ['true', 'false'],
    categories: ['headphones'],
    urlParam: 'portable',
  },
  {
    facet: 'Sound signature',
    attribute: 'soundSignature',
    type: 'enum',
    // sang-logium-3rv.9 -- schema options.list (productType.ts) has 8 values;
    // 'Harman-target-like' was missing here, so a product carrying it could
    // never be counted or filtered to. Added to match the schema exactly.
    valueVocab: ['Neutral', 'Warm', 'Bright/Analytical', 'Dark', 'V-Shaped', 'Basshead', 'Mid-Forward', 'Harman-target-like'],
    categories: ['headphones'],
    urlParam: 'soundSignature',
  },
  {
    facet: 'Detachable cable',
    attribute: 'detachableCable',
    type: 'boolean',
    valueVocab: ['true', 'false'],
    categories: ['headphones'],
    urlParam: 'detachableCable',
  },
  {
    facet: 'Foldable',
    attribute: 'foldable',
    type: 'boolean',
    valueVocab: ['true', 'false'],
    categories: ['headphones'],
    urlParam: 'foldable',
  },
  {
    facet: 'Water / sweat resistance',
    attribute: 'ipxRating',
    type: 'enum',
    valueVocab: ['none', 'IPX2', 'IPX4', 'IPX5', 'IPX7', 'IPX8'],
    categories: ['headphones'],
    urlParam: 'ipx',
  },
  {
    facet: 'Bluetooth codec',
    attribute: 'bluetoothCodecs',
    type: 'multi',
    valueVocab: ['SBC', 'AAC', 'aptX', 'aptX HD', 'aptX Adaptive', 'aptX LL', 'LDAC', 'LC3'],
    categories: ['headphones'],
    urlParam: 'codec',
  },
  {
    facet: 'Driver configuration',
    attribute: 'driverConfigBucket',
    type: 'enum',
    valueVocab: ['single-dynamic', 'single-ba', 'multi-ba', 'hybrid-config', 'planar', 'other'],
    categories: ['headphones'],
    urlParam: 'driverConfig',
  },
  // sang-logium-3rv.5 -- these 5 were declared in the headphones facetConfig.ts
  // (RangeFacet) but never added here, so RangeControl rendered a slider with
  // zero data or query dependency: hardcoded min/max, no filtering effect at
  // all. urlParam matches the `id` keys in facetConfig.ts, same convention as
  // every other headphones facet added in sang-logium-3rv.4, because that's
  // the key RangeControl's useFilterParam(`${facet.id}Min/Max`) already
  // writes to (it was live, just never read anywhere downstream).
  {
    facet: 'Impedance',
    attribute: 'impedanceOhms',
    type: 'range',
    valueVocab: ['min', 'max'],
    categories: ['headphones'],
    urlParam: 'impedance',
  },
  {
    facet: 'Sensitivity',
    attribute: 'sensitivityDbMw',
    type: 'range',
    valueVocab: ['min', 'max'],
    categories: ['headphones'],
    urlParam: 'sensitivity',
  },
  {
    facet: 'Frequency response -- bass extension',
    // freqResponseHz is a {min,max} object (features/products/schema/
    // productType.ts:337); there is no stored bassExtensionHz field --
    // bass extension is derived from freqResponseHz.min. Lower min =
    // deeper bass extension, so this filters on the low end of the pair.
    attribute: 'freqResponseHz.min',
    type: 'range',
    valueVocab: ['min', 'max'],
    categories: ['headphones'],
    urlParam: 'bassExtension',
  },
  {
    facet: 'Cable length',
    attribute: 'cableLengthM',
    type: 'range',
    valueVocab: ['min', 'max'],
    categories: ['headphones'],
    urlParam: 'cableLength',
  },
  {
    facet: 'Battery life',
    // batteryLifeHours is {ancOff, ancOn}, both nullable (productType.ts:434).
    // Both figures exist; for the single
    // range-filter value this facet backs, ancOff (the headline, ANC-off
    // figure manufacturers usually quote) is the simplification -- same
    // one-field-of-a-pair treatment as bass extension above. A product with
    // only ancOn populated will not match this filter; that is a known
    // narrowing, not a bug, flagged for follow-up if it proves wrong in
    // practice.
    attribute: 'batteryLifeHours.ancOff',
    type: 'range',
    valueVocab: ['min', 'max'],
    categories: ['headphones'],
    urlParam: 'batteryLife',
  },
  {
    facet: 'Device type',
    attribute: 'deviceType',
    type: 'enum',
    valueVocab: ['headphone-amplifier', 'digital-audio-player', 'dac', 'network-streamer', 'preamplifier', 'integrated-amplifier', 'power-amplifier', 'cd-player-transport'],
    categories: ['audio-electronics'],
    urlParam: 'deviceType',
  },
  {
    facet: 'Connectivity',
    attribute: 'deviceConnectivity',
    type: 'enum',
    valueVocab: ['wired', 'bluetooth', 'wifi-networked', 'wired-wireless'],
    categories: ['audio-electronics'],
    urlParam: 'deviceConnectivity',
  },
  {
    facet: 'DSD support',
    attribute: 'dsdSupport',
    type: 'enum',
    valueVocab: ['none', 'dsd64', 'dsd128', 'dsd256-plus'],
    categories: ['audio-electronics'],
    urlParam: 'dsdSupport',
  },
  {
    facet: 'DAC chipset family',
    attribute: 'dacChipsetFamily',
    type: 'multi',
    valueVocab: ['ess-sabre', 'akm', 'cirrus-logic', 'r2r-ladder'],
    categories: ['audio-electronics'],
    urlParam: 'dacChipsetFamily',
  },
  {
    facet: 'Streaming platform support',
    attribute: 'streamingPlatformSupport',
    type: 'multi',
    valueVocab: ['airplay2', 'chromecast', 'spotify-connect', 'tidal-connect', 'roon-ready', 'dlna'],
    categories: ['audio-electronics'],
    urlParam: 'streamingPlatformSupport',
  },
  {
    facet: 'Form factor',
    attribute: 'formFactor',
    type: 'enum',
    valueVocab: ['desktop', 'portable', 'dongle'],
    categories: ['audio-electronics'],
    urlParam: 'formFactor',
  },
  {
    facet: 'Amplification',
    attribute: 'amplification',
    type: 'enum',
    // sang-logium-ttn: was missing 'class-d', which productType.ts's own
    // options.list declares -- no live product could ever be filtered to
    // by that value.
    valueVocab: ['solid-state', 'tube', 'hybrid', 'class-d'],
    categories: ['audio-electronics'],
    urlParam: 'amplification',
  },
  {
    facet: 'DAC included',
    attribute: 'dacIncluded',
    type: 'boolean',
    valueVocab: ['true', 'false'],
    categories: ['audio-electronics'],
    urlParam: 'dacIncluded',
  },
  {
    facet: 'Balanced output',
    attribute: 'balancedOutput',
    type: 'boolean',
    valueVocab: ['true', 'false'],
    categories: ['audio-electronics'],
    urlParam: 'balancedOutput',
  },
  {
    facet: 'Inputs',
    attribute: 'inputs',
    type: 'multi',
    // sang-logium-ttn: was missing 6 of 11 values productType.ts's own
    // options.list declares (xlr-balanced, phono-mm-mc, hdmi-earc,
    // ethernet-lan, i2s-iis, aes-ebu) -- real products carry these but no
    // checkbox ever existed to filter by them.
    valueVocab: ['usb', 'optical', 'coaxial', 'rca', 'bluetooth', 'xlr-balanced', 'phono-mm-mc', 'hdmi-earc', 'ethernet-lan', 'i2s-iis', 'aes-ebu'],
    categories: ['audio-electronics'],
    urlParam: 'inputs',
  },
  // sang-logium-3rv.6 -- condition/deals/newArrival/awards are shared with
  // the accessories slice (same schema field, same closed vocabulary). The
  // canonical entries live in the accessories block below, so they are tagged
  // with both categories there rather than duplicated here.
  {
    facet: 'Accessory type',
    attribute: 'accessoryType',
    type: 'enum',
    valueVocab: ['cables-interconnects', 'replacement-parts', 'cases-storage-transport', 'adapters-converters', 'cleaning-maintenance', 'stands-isolation'],
    categories: ['accessories'],
    urlParam: 'accessoryType',
  },
  {
    facet: 'Connector / termination',
    attribute: 'connectorTermination',
    type: 'multi',
    valueVocab: ['rca', 'xlr', '3.5mm', '2.5mm', '4.4mm', '6.35mm', '4-pin-mini-xlr', 'mini-to-rca'],
    categories: ['accessories'],
    urlParam: 'connectorTermination',
  },
  // sang-logium-3rv.7 — accessories commercial + domain facets vocabulary/parity cleanup.
  // Closed vocabularies below match features/products/schema/productType.ts
  // options.list values for each field.
  {
    facet: 'Awards / recognition',
    attribute: 'awards',
    type: 'multi',
    valueVocab: ['<award-slug>'],
    categories: ['headphones'],
    urlParam: 'awards',
  },
  {
    facet: 'Condition',
    attribute: 'condition',
    type: 'enum',
    valueVocab: ['new', 'open-box', 'refurbished'],
    categories: ['audio-electronics'],
    urlParam: 'condition',
  },
  {
    facet: 'Compatible product type',
    attribute: 'compatibleProductType',
    type: 'multi',
    valueVocab: ['headphone', 'speaker', 'amplifier-source', 'universal-any'],
    categories: ['accessories'],
    urlParam: 'compatibleProductType',
  },
  {
    facet: 'Cable function',
    attribute: 'cableFunction',
    type: 'multi',
    valueVocab: ['headphone-cable', 'interconnect-rca-xlr', 'digital-usb-coaxial-optical-aes-ebu-ethernet'],
    categories: ['accessories'],
    urlParam: 'cableFunction',
  },
  {
    facet: 'Length',
    attribute: 'lengthM',
    type: 'range',
    valueVocab: ['min', 'max'],
    categories: ['accessories'],
    urlParam: 'length',
  },
  {
    facet: 'Conductor material',
    attribute: 'conductorMaterial',
    type: 'multi',
    valueVocab: ['copper-ofc', 'silver', 'silver-plated-copper'],
    categories: ['accessories'],
    urlParam: 'conductorMaterial',
  },
  {
    facet: 'Balanced / unbalanced',
    attribute: 'balancedUnbalanced',
    type: 'enum',
    valueVocab: ['balanced', 'unbalanced'],
    categories: ['accessories'],
    urlParam: 'balanced',
  },
  {
    facet: 'Part type',
    attribute: 'partType',
    type: 'enum',
    valueVocab: ['ear-pads-cushions', 'ear-tips'],
    categories: ['accessories'],
    urlParam: 'partType',
  },
];

export const SORT_OPTIONS = [
  {
    sort: 'Featured',
    urlValue: 'featured',
    direction: 'desc',
  },
  {
    sort: 'Best selling',
    urlValue: 'best-selling',
    direction: 'desc',
  },
  {
    sort: 'Price: Low to High',
    urlValue: 'price-asc',
    direction: 'asc',
  },
  {
    sort: 'Price: High to Low',
    urlValue: 'price-desc',
    direction: 'desc',
  },
  {
    sort: 'Newest',
    urlValue: 'newest',
    direction: 'desc',
  },
  {
    sort: 'Alphabetically, A-Z',
    urlValue: 'alpha-asc',
    direction: 'asc',
  },
  {
    sort: 'Alphabetically, Z-A',
    urlValue: 'alpha-desc',
    direction: 'desc',
  },
  {
    sort: 'Date, Old to New',
    urlValue: 'date-old',
    direction: 'asc',
  },
] as const;

/** URL values of the canonical sort options above. */
export type SortValue = (typeof SORT_OPTIONS)[number]['urlValue'];

/** The sort applied when the URL carries none. */
export const SORT_DEFAULT: SortValue = 'newest';

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

export const isPlaceholderVocab = (vocab: string[]) =>
  vocab.some((v) => v.startsWith('<') && v.endsWith('>'));
