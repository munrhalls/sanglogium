// Filter/sort module for the accessories slice. Facet ids equal the
// facetMap.ts urlParam for the accessories category; closed-vocab option
// values are locked to facetMap.ts valueVocab (checked by
// facetConfigParity.spec.ts (deleted)).

export type Option = { value: string; label: string };
export type FacetGroupId = 'commercial' | 'type' | 'cables' | 'replacementParts';

export interface FacetGroup {
  id: FacetGroupId;
  label: string;
  note?: string;
}

export interface FacetDef {
  id: string;
  group: FacetGroupId;
  label: string;
  control: 'checkbox' | 'boolean' | 'range';
  options?: Option[] | 'derived';
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
}

export const FACET_GROUPS: FacetGroup[] = [
  { id: 'commercial', label: '' },
  { id: 'type', label: 'Type' },
  { id: 'cables', label: 'Cables' },
  { id: 'replacementParts', label: 'Replacement Parts' },
];

export const FACETS: FacetDef[] = [
  { id: 'brand', group: 'commercial', label: 'Brand', control: 'checkbox', options: 'derived' },
  { id: 'inStock', group: 'commercial', label: 'In Stock Only', control: 'boolean' },
  {
    id: 'accessoryType',
    group: 'type',
    label: 'Accessory Category',
    control: 'checkbox',
    options: [
      { value: 'cables-interconnects', label: 'Cables & Interconnects' },
      { value: 'replacement-parts', label: 'Replacement Parts' },
      { value: 'cases-storage-transport', label: 'Cases & Storage' },
      { value: 'adapters-converters', label: 'Adapters & Converters' },
      { value: 'cleaning-maintenance', label: 'Cleaning & Maintenance' },
      { value: 'stands-isolation', label: 'Stands & Isolation' },
    ],
  },
  {
    id: 'compatibleProductType',
    group: 'type',
    label: 'Compatible With',
    control: 'checkbox',
    options: [
      { value: 'headphone', label: 'Headphones' },
      { value: 'speaker', label: 'Speakers' },
      { value: 'amplifier-source', label: 'Amplifiers & Sources' },
      { value: 'universal-any', label: 'Universal' },
    ],
  },
  {
    id: 'cableFunction',
    group: 'cables',
    label: 'Cable Type',
    control: 'checkbox',
    options: [
      { value: 'headphone-cable', label: 'Headphone Cable' },
      { value: 'interconnect-rca-xlr', label: 'Interconnect (RCA/XLR)' },
      {
        value: 'digital-usb-coaxial-optical-aes-ebu-ethernet',
        label: 'Digital (USB / Coaxial / Optical / AES / Ethernet)',
      },
    ],
  },
  {
    id: 'connectorTermination',
    group: 'cables',
    label: 'Connectors',
    control: 'checkbox',
    options: [
      { value: 'rca', label: 'RCA' },
      { value: 'xlr', label: 'XLR' },
      { value: '3.5mm', label: '3.5mm' },
      { value: '2.5mm', label: '2.5mm' },
      { value: '4.4mm', label: '4.4mm' },
      { value: '6.35mm', label: '6.35mm' },
      { value: '4-pin-mini-xlr', label: '4-Pin Mini XLR' },
      { value: 'mini-to-rca', label: 'Mini-to-RCA' },
    ],
  },
  {
    id: 'length',
    group: 'cables',
    label: 'Length',
    control: 'range',
    unit: 'm',
    min: 0,
    max: 15,
    step: 0.1,
  },
  {
    id: 'conductorMaterial',
    group: 'cables',
    label: 'Conductor Material',
    control: 'checkbox',
    options: [
      { value: 'copper-ofc', label: 'Copper / OFC' },
      { value: 'silver', label: 'Silver' },
      { value: 'silver-plated-copper', label: 'Silver-Plated Copper' },
    ],
  },
  {
    id: 'balanced',
    group: 'cables',
    label: 'Balanced / Unbalanced',
    control: 'checkbox',
    options: [
      { value: 'balanced', label: 'Balanced' },
      { value: 'unbalanced', label: 'Unbalanced' },
    ],
  },
  {
    id: 'partType',
    group: 'replacementParts',
    label: 'Part Type',
    control: 'checkbox',
    options: [
      { value: 'ear-pads-cushions', label: 'Ear Pads / Cushions' },
      { value: 'ear-tips', label: 'Ear Tips' },
    ],
  },
];

export const facetsForGroup = (group: FacetGroupId): FacetDef[] => FACETS.filter((f) => f.group === group);

export const SORT_OPTIONS: Option[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price, Low to High' },
  { value: 'price-desc', label: 'Price, High to Low' },
  { value: 'alpha-asc', label: 'Alphabetically, A-Z' },
  { value: 'alpha-desc', label: 'Alphabetically, Z-A' },
  { value: 'date-old', label: 'Date, Old to New' },
];

export const SORT_DEFAULT: string = 'newest';
