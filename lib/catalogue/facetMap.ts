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
    facet: 'Availability',
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
    field: 'filterAttributes.backDesign',
    type: 'enum',
    valueVocab: ['open', 'closed', 'semi-open'],
    categories: ['headphones'],
    urlParam: 'backDesign',
  },
  {
    facet: 'Driver type',
    field: 'filterAttributes.driverType',
    type: 'enum',
    valueVocab: ['dynamic', 'planar-magnetic', 'electrostatic', 'balanced-armature', 'hybrid'],
    categories: ['headphones'],
    urlParam: 'driverType',
  },
  {
    facet: 'Connectivity',
    field: 'filterAttributes.connectivity',
    type: 'enum',
    valueVocab: ['wired', 'wireless'],
    categories: ['headphones'],
    urlParam: 'connectivity',
  },
  {
    facet: 'Connector / plug',
    field: 'filterAttributes.connector',
    type: 'multi',
    valueVocab: ['3.5mm', '6.35mm', '4.4mm-balanced', '4-pin-xlr', '2.5mm', 'usb-c', 'mmcx', '2-pin', 'fixed-cable'],
    categories: ['headphones'],
    urlParam: 'connector',
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
    field: 'filterAttributes.noiseCancelling',
    type: 'boolean',
    valueVocab: ['true', 'false'],
    categories: ['headphones'],
    urlParam: 'noiseCancelling',
  },
  {
    facet: 'Requires amplifier',
    field: 'filterAttributes.requiresAmplifier',
    type: 'boolean',
    valueVocab: ['true', 'false'],
    categories: ['headphones'],
    urlParam: 'requiresAmplifier',
  },
  {
    facet: 'Device type',
    field: 'filterAttributes.deviceType',
    type: 'enum',
    valueVocab: ['headphone-amp', 'dac', 'dac-amp-combo', 'dongle-dac', 'dap', 'network-streamer'],
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
    valueVocab: ['6.35mm', '4.4mm', '4-pin-xlr', 'rca-line-out'],
    categories: ['audio-electronics'],
    urlParam: 'outputs',
  },
  {
    facet: 'Accessory type',
    field: 'filterAttributes.accessoryType',
    type: 'enum',
    valueVocab: ['cable', 'adapter', 'interconnect', 'eartip', 'earpad', 'stand', 'case', 'care'],
    categories: ['accessories'],
    urlParam: 'accessoryType',
  },
  {
    facet: 'Connector / termination',
    field: 'filterAttributes.connectorTermination',
    type: 'multi',
    valueVocab: ['3.5mm', '6.35mm', '4.4mm-balanced', '4-pin-xlr', '2.5mm', 'usb-c', 'mmcx', '2-pin', 'fixed-cable'],
    categories: ['accessories'],
    urlParam: 'connectorTermination',
  },
  {
    facet: 'Compatibility',
    field: 'filterAttributes.compatibility',
    type: 'multi',
    valueVocab: ['<compatible-model>'],
    categories: ['accessories'],
    urlParam: 'compatibility',
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

export const FILTER_FACET_BY_PARAM = new Map(FILTER_FACETS.map((f) => [f.urlParam, f]));

export const FILTER_FACET_BY_FIELD = new Map(
  FILTER_FACETS.map((f) => [f.field.replace('filterAttributes.', ''), f])
);

export const SORT_OPTION_BY_VALUE = new Map(SORT_OPTIONS.map((s) => [s.urlValue, s]));

export const isPlaceholderVocab = (vocab: string[]) =>
  vocab.some((v) => v.startsWith('<') && v.endsWith('>'));
