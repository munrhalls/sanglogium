// Facet selector: the human picklist of which product-data attributes are
// projected as filter controls, per slice. Seeded from target-snapshot.json —
// it carries only what data cannot provide (id, attribute path, display label,
// group, range unit, and the display metadata showWhen, subheading and group
// note), plus the query-only facets. No control, options, bounds or vocab:
// those are derived from product data. selectorSeeding.laws.ts proves the
// rendered facet set and the query-only list equal the snapshot (display
// metadata is set aside there, the snapshot does not record it); edited by
// hand from here on.

export interface SelectorGroup {
  id: string;
  label: string;
  /** Short note under the group heading; absent when the group has none. */
  note?: string;
}

export interface SelectedFacet {
  /** Facet id. */
  id: string;
  /** Path inside filterAttributes this facet projects (e.g. 'impedanceOhms', 'freqResponseHz.min'). */
  attribute: string;
  /** Human-facing control name. */
  label: string;
  /** Group id from this slice's groups list. */
  group: string;
  /** Display unit for range controls (e.g. 'Ω'); absent otherwise. */
  unit?: string;
  /** Sub-heading drawn above this facet inside its group; absent when it has none. */
  subheading?: string;
  /** Draw this facet only while the selection of the facet named here includes one of `values`; an empty selection draws everything. */
  showWhen?: { facet: string; values: string[] };
}

export interface SliceSelector {
  groups: SelectorGroup[];
  facets: SelectedFacet[];
}

export const FACET_SELECTOR: {
  headphones: SliceSelector;
  'audio-electronics': SliceSelector;
  accessories: SliceSelector;
} = {
  'headphones': {
    groups: [
      { id: 'commercial', label: '' },
      { id: 'type', label: '' },
      { id: 'sound', label: 'Sound Properties' },
      { id: 'material', label: 'Material Factors' },
      { id: 'wireless', label: 'Wireless' },
      { id: 'technical', label: 'Technical Specs' },
    ],
    facets: [
      { id: 'brand', attribute: 'brand', label: 'Brand', group: 'commercial' },
      { id: 'inStock', attribute: 'inStock', label: 'In Stock Only', group: 'commercial' },
      { id: 'acousticDesign', attribute: 'acousticDesign', label: 'Acoustic Design', group: 'type' },
      { id: 'connectivity', attribute: 'connectivity', label: 'Connectivity', group: 'type' },
      { id: 'soundSignature', attribute: 'soundSignature', label: 'Signature', group: 'sound' },
      { id: 'impedance', attribute: 'impedanceOhms', label: 'Impedance', group: 'sound', unit: 'Ω' },
      { id: 'sensitivity', attribute: 'sensitivityDbMw', label: 'Sensitivity', group: 'sound', unit: 'dB/mW' },
      { id: 'bassExtension', attribute: 'freqResponseHz.min', label: 'Bass Extension', group: 'sound', unit: 'Hz' },
      { id: 'microphone', attribute: 'microphone', label: 'Microphone', group: 'material' },
      { id: 'cableTermination', attribute: 'cableTermination', label: 'Cable Type', group: 'material' },
      { id: 'foldable', attribute: 'foldable', label: 'Foldable', group: 'material' },
      { id: 'cableLength', attribute: 'cableLengthM', label: 'Cable Length', group: 'material', unit: 'm' },
      { id: 'ipx', attribute: 'ipxRating', label: 'Water Resistance (IPX)', group: 'material' },
      { id: 'requiresAmplifier', attribute: 'requiresAmplifier', label: 'Requires Amplifier', group: 'material' },
      { id: 'portable', attribute: 'portable', label: 'Portable', group: 'material' },
      { id: 'codec', attribute: 'bluetoothCodecs', label: 'Bluetooth Codec', group: 'wireless' },
      { id: 'anc', attribute: 'anc', label: 'Noise Cancelling', group: 'wireless' },
      { id: 'batteryLife', attribute: 'batteryLifeHours.ancOff', label: 'Battery Life', group: 'wireless', unit: 'hrs' },
      { id: 'driverType', attribute: 'driverType', label: 'Driver Type', group: 'technical' },
      { id: 'driverConfig', attribute: 'driverConfigBucket', label: 'Driver Configuration', group: 'technical' },
    ],
  },

  'audio-electronics': {
    groups: [
      { id: 'commercial', label: '' },
      { id: 'type', label: 'Type' },
      { id: 'connections', label: 'Connections' },
      { id: 'amplification', label: 'Amplification' },
      { id: 'digital', label: 'Digital & Streaming' },
    ],
    facets: [
      { id: 'brand', attribute: 'brand', label: 'Brand', group: 'commercial' },
      { id: 'inStock', attribute: 'inStock', label: 'In Stock Only', group: 'commercial' },
      { id: 'deviceType', attribute: 'deviceType', label: 'Device Type', group: 'type' },
      { id: 'formFactor', attribute: 'formFactor', label: 'Form Factor', group: 'type' },
      { id: 'deviceConnectivity', attribute: 'deviceConnectivity', label: 'Connectivity', group: 'connections' },
      { id: 'inputs', attribute: 'inputs', label: 'Inputs', group: 'connections' },
      { id: 'balancedOutput', attribute: 'balancedOutput', label: 'Balanced Output', group: 'connections' },
      { id: 'amplification', attribute: 'amplification', label: 'Amplifier Topology', group: 'amplification' },
      { id: 'dacIncluded', attribute: 'dacIncluded', label: 'Built-in DAC', group: 'digital' },
      { id: 'dsdSupport', attribute: 'dsdSupport', label: 'DSD Support', group: 'digital' },
      { id: 'dacChipsetFamily', attribute: 'dacChipsetFamily', label: 'DAC Chipset', group: 'digital' },
      { id: 'streamingPlatformSupport', attribute: 'streamingPlatformSupport', label: 'Streaming Platforms', group: 'digital' },
    ],
  },

  'accessories': {
    groups: [
      { id: 'commercial', label: '' },
      { id: 'type', label: 'Type' },
      { id: 'cables', label: 'Cables' },
      { id: 'replacementParts', label: 'Replacement Parts' },
    ],
    facets: [
      { id: 'brand', attribute: 'brand', label: 'Brand', group: 'commercial' },
      { id: 'inStock', attribute: 'inStock', label: 'In Stock Only', group: 'commercial' },
      { id: 'accessoryType', attribute: 'accessoryType', label: 'Accessory Type', group: 'type' },
      { id: 'compatibleProductType', attribute: 'compatibleProductType', label: 'Compatible With', group: 'type' },
      { id: 'cableFunction', attribute: 'cableFunction', label: 'Cable Type', group: 'cables', showWhen: { facet: 'accessoryType', values: ['cables-interconnects'] } },
      { id: 'connectorTermination', attribute: 'connectorTermination', label: 'Connectors', group: 'cables' },
      { id: 'length', attribute: 'lengthM', label: 'Length', group: 'cables', unit: 'm', showWhen: { facet: 'accessoryType', values: ['cables-interconnects'] } },
      { id: 'conductorMaterial', attribute: 'conductorMaterial', label: 'Conductor Material', group: 'cables' },
      { id: 'balanced', attribute: 'balancedUnbalanced', label: 'Signal Type', group: 'cables' },
      { id: 'partType', attribute: 'partType', label: 'Part Type', group: 'replacementParts', showWhen: { facet: 'accessoryType', values: ['replacement-parts'] } },
    ],
  },
};

/** A facet only the URL knows: no control draws it, but it still narrows the counts like any other
 *  (search redirects link to wearingStyle=in-ear). Its control comes from the data. */
export interface QueryOnlyFacet {
  id: string;
  attribute: string;
}

export const QUERY_ONLY_FACETS: QueryOnlyFacet[] = [
  { id: 'category', attribute: 'category' },
  { id: 'wearingStyle', attribute: 'wearingStyle' },
  { id: 'productCategory', attribute: 'productCategory' },
  { id: 'fitType', attribute: 'fitType' },
  { id: 'detachableCable', attribute: 'detachableCable' },
  { id: 'awards', attribute: 'awards' },
  { id: 'condition', attribute: 'condition' },
];
