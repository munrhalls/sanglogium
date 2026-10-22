// Canonical facet and sort definitions for the product-filtering feature.
// Single source of truth for the URL param contract and the sort allowlist.
// There is no value vocabulary here: selectable values are derived from
// product data at request time. The Studio option lists editors pick from
// live in features/products/schema/productFilterAttributes/vocab.ts.

export type FilterFacetType = 'range' | 'enum' | 'boolean' | 'multi';

export interface FilterFacet {
  /** Human-facing facet name. */
  facet: string;
  /** Key path inside the product's filterAttributes object (RawProduct
   *  shape, e.g. "wearingStyle", "freqResponseHz.min"). The document-level
   *  'filterAttributes.' prefix is added at query-build time. */
  attribute: string;
  /** Storage type. */
  type: FilterFacetType;
  /** Applicable category slugs; ["*"] means universal. */
  categories: string[];
  /** URL query-param key. */
  urlParam: string;
}


export const FILTER_FACETS: FilterFacet[] = [
  {
    facet: 'Price',
    attribute: 'price',
    type: 'range',
    categories: ['*'],
    urlParam: 'price',
  },
  {
    facet: 'Brand',
    attribute: 'brand',
    type: 'multi',
    categories: ['*'],
    urlParam: 'brand',
  },
  {
    facet: 'In stock only',
    attribute: 'inStock',
    type: 'boolean',
    categories: ['*'],
    urlParam: 'inStock',
  },
  {
    facet: 'Category',
    attribute: 'category',
    type: 'multi',
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
    categories: ['headphones'],
    urlParam: 'wearingStyle',
  },
  {
    facet: 'Back design',
    attribute: 'acousticDesign',
    // Array field in schema, same enum/array mismatch as wearingStyle above.
    type: 'multi',
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
    categories: ['headphones'],
    urlParam: 'driverType',
  },
  {
    facet: 'Connectivity',
    attribute: 'connectivity',
    type: 'enum',
    // Was missing 2 of the schema's 4 real options (features/products/schema/
    // productType.ts:296) -- true-wireless/hybrid silently never got counted.
    categories: ['headphones'],
    urlParam: 'connectivity',
  },
  {
    facet: 'Connector / plug',
    attribute: 'cableTermination',
    type: 'multi',
    categories: ['headphones'],
    urlParam: 'cableTermination',
  },
  {
    facet: 'Microphone',
    attribute: 'microphone',
    type: 'boolean',
    categories: ['headphones'],
    urlParam: 'microphone',
  },
  {
    facet: 'Noise cancelling',
    attribute: 'anc',
    type: 'enum',
    categories: ['headphones'],
    urlParam: 'anc',
  },
  {
    facet: 'Requires amplifier',
    attribute: 'requiresAmplifier',
    type: 'boolean',
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
    categories: ['headphones'],
    urlParam: 'productCategory',
  },
  {
    facet: 'Fit type',
    attribute: 'fitType',
    type: 'enum',
    categories: ['headphones'],
    urlParam: 'fitType',
  },
  {
    facet: 'Portable',
    attribute: 'portable',
    type: 'boolean',
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
    categories: ['headphones'],
    urlParam: 'soundSignature',
  },
  {
    facet: 'Detachable cable',
    attribute: 'detachableCable',
    type: 'boolean',
    categories: ['headphones'],
    urlParam: 'detachableCable',
  },
  {
    facet: 'Foldable',
    attribute: 'foldable',
    type: 'boolean',
    categories: ['headphones'],
    urlParam: 'foldable',
  },
  {
    facet: 'Water / sweat resistance',
    attribute: 'ipxRating',
    type: 'enum',
    categories: ['headphones'],
    urlParam: 'ipx',
  },
  {
    facet: 'Bluetooth codec',
    attribute: 'bluetoothCodecs',
    type: 'multi',
    categories: ['headphones'],
    urlParam: 'codec',
  },
  {
    facet: 'Driver configuration',
    attribute: 'driverConfigBucket',
    type: 'enum',
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
    categories: ['headphones'],
    urlParam: 'impedance',
  },
  {
    facet: 'Sensitivity',
    attribute: 'sensitivityDbMw',
    type: 'range',
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
    categories: ['headphones'],
    urlParam: 'bassExtension',
  },
  {
    facet: 'Cable length',
    attribute: 'cableLengthM',
    type: 'range',
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
    categories: ['headphones'],
    urlParam: 'batteryLife',
  },
  {
    facet: 'Device type',
    attribute: 'deviceType',
    type: 'enum',
    categories: ['audio-electronics'],
    urlParam: 'deviceType',
  },
  {
    facet: 'Connectivity',
    attribute: 'deviceConnectivity',
    type: 'enum',
    categories: ['audio-electronics'],
    urlParam: 'deviceConnectivity',
  },
  {
    facet: 'DSD support',
    attribute: 'dsdSupport',
    type: 'enum',
    categories: ['audio-electronics'],
    urlParam: 'dsdSupport',
  },
  {
    facet: 'DAC chipset family',
    attribute: 'dacChipsetFamily',
    type: 'multi',
    categories: ['audio-electronics'],
    urlParam: 'dacChipsetFamily',
  },
  {
    facet: 'Streaming platform support',
    attribute: 'streamingPlatformSupport',
    type: 'multi',
    categories: ['audio-electronics'],
    urlParam: 'streamingPlatformSupport',
  },
  {
    facet: 'Form factor',
    attribute: 'formFactor',
    type: 'enum',
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
    categories: ['audio-electronics'],
    urlParam: 'amplification',
  },
  {
    facet: 'DAC included',
    attribute: 'dacIncluded',
    type: 'boolean',
    categories: ['audio-electronics'],
    urlParam: 'dacIncluded',
  },
  {
    facet: 'Balanced output',
    attribute: 'balancedOutput',
    type: 'boolean',
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
    categories: ['accessories'],
    urlParam: 'accessoryType',
  },
  {
    facet: 'Connector / termination',
    attribute: 'connectorTermination',
    type: 'multi',
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
    categories: ['headphones'],
    urlParam: 'awards',
  },
  {
    facet: 'Condition',
    attribute: 'condition',
    type: 'enum',
    categories: ['audio-electronics'],
    urlParam: 'condition',
  },
  {
    facet: 'Compatible product type',
    attribute: 'compatibleProductType',
    type: 'multi',
    categories: ['accessories'],
    urlParam: 'compatibleProductType',
  },
  {
    facet: 'Cable function',
    attribute: 'cableFunction',
    type: 'multi',
    categories: ['accessories'],
    urlParam: 'cableFunction',
  },
  {
    facet: 'Length',
    attribute: 'lengthM',
    type: 'range',
    categories: ['accessories'],
    urlParam: 'length',
  },
  {
    facet: 'Conductor material',
    attribute: 'conductorMaterial',
    type: 'multi',
    categories: ['accessories'],
    urlParam: 'conductorMaterial',
  },
  {
    facet: 'Balanced / unbalanced',
    attribute: 'balancedUnbalanced',
    type: 'enum',
    categories: ['accessories'],
    urlParam: 'balanced',
  },
  {
    facet: 'Part type',
    attribute: 'partType',
    type: 'enum',
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
    sort: 'Recently Added',
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
] as const;

/** URL values of the canonical sort options above. */
export type SortValue = (typeof SORT_OPTIONS)[number]['urlValue'];

/** The sort applied when the URL carries none. */
export const SORT_DEFAULT: SortValue = 'newest';
