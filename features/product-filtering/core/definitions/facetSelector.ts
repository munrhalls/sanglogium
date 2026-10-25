// Facet selector: per slice, only the presentation product data cannot
// provide — a display label, group, range unit, subheading and showWhen per
// field, plus the group list. Which of these fields become controls is picked
// in the CMS; control kind, options and bounds all come from product data.
// Edited by hand.

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

/** Presentation metadata for one field a slice's owner may pick. */
export interface FieldMeta {
  label: string;
  group: string;
  unit?: string;
  subheading?: string;
  /** `facet` is a facet id (URL key), not an attribute path. */
  showWhen?: { facet: string; values: string[] };
}

export const COMMERCIAL_GROUP: SelectorGroup = { id: 'commercial', label: '' };

export const MORE_GROUP: SelectorGroup = { id: 'more', label: 'More filters' };

/** Brand and in stock are the same in every slice. */
export const COMMERCIAL_FACETS: SelectedFacet[] = [
  { id: 'brand', attribute: 'brand', label: 'Brand', group: 'commercial' },
  { id: 'inStock', attribute: 'inStock', label: 'In Stock Only', group: 'commercial' },
];

export interface SliceSelector {
  groups: SelectorGroup[];
  /** Presentation per attribute path, for the fields the owner may pick. */
  fields: Record<string, FieldMeta>;
}

export const FACET_SELECTOR: {
  headphones: SliceSelector;
  'audio-electronics': SliceSelector;
  accessories: SliceSelector;
} = {
  'headphones': {
    groups: [
      COMMERCIAL_GROUP,
      { id: 'type', label: '' },
      { id: 'sound', label: 'Sound Properties' },
      { id: 'material', label: 'Material Factors' },
      { id: 'wireless', label: 'Wireless' },
      { id: 'technical', label: 'Technical Specs' },
    ],
    fields: {
      acousticDesign: { label: 'Acoustic Design', group: 'type' },
      connectivity: { label: 'Connectivity', group: 'type' },
      soundSignature: { label: 'Signature', group: 'sound' },
      impedanceOhms: { label: 'Impedance', group: 'sound', unit: 'Ω' },
      sensitivityDbMw: { label: 'Sensitivity', group: 'sound', unit: 'dB/mW' },
      'freqResponseHz.min': { label: 'Bass Extension', group: 'sound', unit: 'Hz' },
      microphone: { label: 'Microphone', group: 'material' },
      cableTermination: { label: 'Cable Type', group: 'material' },
      foldable: { label: 'Foldable', group: 'material' },
      cableLengthM: { label: 'Cable Length', group: 'material', unit: 'm' },
      ipxRating: { label: 'Water Resistance (IPX)', group: 'material' },
      requiresAmplifier: { label: 'Requires Amplifier', group: 'material' },
      portable: { label: 'Portable', group: 'material' },
      bluetoothCodecs: { label: 'Bluetooth Codec', group: 'wireless' },
      anc: { label: 'Noise Cancelling', group: 'wireless' },
      'batteryLifeHours.ancOff': { label: 'Battery Life', group: 'wireless', unit: 'hrs' },
      driverType: { label: 'Driver Type', group: 'technical' },
      driverConfigBucket: { label: 'Driver Configuration', group: 'technical' },
    },
  },

  'audio-electronics': {
    groups: [
      COMMERCIAL_GROUP,
      { id: 'type', label: 'Type' },
      { id: 'connections', label: 'Connections' },
      { id: 'amplification', label: 'Amplification' },
      { id: 'digital', label: 'Digital & Streaming' },
    ],
    fields: {
      deviceType: { label: 'Device Type', group: 'type' },
      formFactor: { label: 'Form Factor', group: 'type' },
      deviceConnectivity: { label: 'Connectivity', group: 'connections' },
      inputs: { label: 'Inputs', group: 'connections' },
      balancedOutput: { label: 'Balanced Output', group: 'connections' },
      amplification: { label: 'Amplifier Topology', group: 'amplification' },
      dacIncluded: { label: 'Built-in DAC', group: 'digital' },
      dsdSupport: { label: 'DSD Support', group: 'digital' },
      dacChipsetFamily: { label: 'DAC Chipset', group: 'digital' },
      streamingPlatformSupport: { label: 'Streaming Platforms', group: 'digital' },
    },
  },

  'accessories': {
    groups: [
      COMMERCIAL_GROUP,
      { id: 'type', label: 'Type' },
      { id: 'cables', label: 'Cables' },
      { id: 'replacementParts', label: 'Replacement Parts' },
    ],
    fields: {
      accessoryType: { label: 'Accessory Type', group: 'type' },
      compatibleProductType: { label: 'Compatible With', group: 'type' },
      cableFunction: { label: 'Cable Type', group: 'cables', showWhen: { facet: 'accessoryType', values: ['cables-interconnects'] } },
      connectorTermination: { label: 'Connectors', group: 'cables' },
      lengthM: { label: 'Length', group: 'cables', unit: 'm', showWhen: { facet: 'accessoryType', values: ['cables-interconnects'] } },
      conductorMaterial: { label: 'Conductor Material', group: 'cables' },
      balancedUnbalanced: { label: 'Signal Type', group: 'cables' },
      partType: { label: 'Part Type', group: 'replacementParts', showWhen: { facet: 'accessoryType', values: ['replacement-parts'] } },
    },
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
