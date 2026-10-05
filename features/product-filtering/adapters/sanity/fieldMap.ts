// Sanity document field paths for this slice — the only place that knows
// where a facet value or sort key lives in a product document. Keyed by the
// facet id (its urlParam) and the sort urlValue. core/definitions/ keeps
// labels, vocabularies, kinds and order only.
//
// Consumed by adapters/sanity/ (GROQ building, projections). Never imported
// by core/, ui/, state/, url/ or index.ts.

/** facet urlParam -> document field path (e.g. 'filterAttributes.brand'). */
export const FACET_FIELD_MAP: Record<string, string> = {
  price: 'filterAttributes.price',
  brand: 'filterAttributes.brand',
  inStock: 'filterAttributes.inStock',
  category: 'filterAttributes.category',
  wearingStyle: 'filterAttributes.wearingStyle',
  acousticDesign: 'filterAttributes.acousticDesign',
  driverType: 'filterAttributes.driverType',
  connectivity: 'filterAttributes.connectivity',
  cableTermination: 'filterAttributes.cableTermination',
  microphone: 'filterAttributes.microphone',
  anc: 'filterAttributes.anc',
  requiresAmplifier: 'filterAttributes.requiresAmplifier',
  productCategory: 'filterAttributes.productCategory',
  fitType: 'filterAttributes.fitType',
  portable: 'filterAttributes.portable',
  soundSignature: 'filterAttributes.soundSignature',
  detachableCable: 'filterAttributes.detachableCable',
  foldable: 'filterAttributes.foldable',
  ipx: 'filterAttributes.ipxRating',
  codec: 'filterAttributes.bluetoothCodecs',
  driverConfig: 'filterAttributes.driverConfigBucket',
  impedance: 'filterAttributes.impedanceOhms',
  sensitivity: 'filterAttributes.sensitivityDbMw',
  bassExtension: 'filterAttributes.freqResponseHz.min',
  cableLength: 'filterAttributes.cableLengthM',
  batteryLife: 'filterAttributes.batteryLifeHours.ancOff',
  deviceType: 'filterAttributes.deviceType',
  deviceConnectivity: 'filterAttributes.deviceConnectivity',
  dsdSupport: 'filterAttributes.dsdSupport',
  dacChipsetFamily: 'filterAttributes.dacChipsetFamily',
  streamingPlatformSupport: 'filterAttributes.streamingPlatformSupport',
  formFactor: 'filterAttributes.formFactor',
  amplification: 'filterAttributes.amplification',
  dacIncluded: 'filterAttributes.dacIncluded',
  balancedOutput: 'filterAttributes.balancedOutput',
  inputs: 'filterAttributes.inputs',
  accessoryType: 'filterAttributes.accessoryType',
  connectorTermination: 'filterAttributes.connectorTermination',
  awards: 'filterAttributes.awards',
  condition: 'filterAttributes.condition',
  compatibleProductType: 'filterAttributes.compatibleProductType',
  cableFunction: 'filterAttributes.cableFunction',
  length: 'filterAttributes.lengthM',
  conductorMaterial: 'filterAttributes.conductorMaterial',
  balanced: 'filterAttributes.balancedUnbalanced',
  partType: 'filterAttributes.partType',
};

/** sort urlValue -> its GROQ backing field and tie-break fragment. */
export const SORT_FIELD_MAP: Record<
  string,
  { backingField: string; tieBreak: string }
> = {
  'featured': { backingField: 'sortAttributes.featuredPriority', tieBreak: 'sortAttributes.popularity desc, _createdAt desc' },
  'best-selling': { backingField: 'sortAttributes.popularity', tieBreak: '_createdAt desc' },
  'price-asc': { backingField: 'price_data.unit_amount', tieBreak: '_createdAt desc' },
  'price-desc': { backingField: 'price_data.unit_amount', tieBreak: '_createdAt desc' },
  'newest': { backingField: '_createdAt', tieBreak: '_id desc' },
  'alpha-asc': { backingField: 'name', tieBreak: '_id asc' },
  'alpha-desc': { backingField: 'name', tieBreak: '_id desc' },
  'date-old': { backingField: '_createdAt', tieBreak: '_id asc' },
};
