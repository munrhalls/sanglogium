// POC-local mirror of lib/catalogue/facetMap.ts's shape and role, re-pointed at
// docs/filters-sort/should-be-accessories.md's 29-item taxonomy instead of the
// production ~13-facet set. Deliberately NOT added to the shared production
// facetMap: that file is sync-checked against _project/filters/facet-map.json
// by _project/filters/check-wiring.cjs, and should-be-accessories.md is
// explicit that final schema/field design and control type are out of its
// scope — i.e. this file's job, done here, not by editing shared prod source.
// See page.tsx for how this plugs into the URL <-> sidebar <-> grid mechanism.
//
// HEADLESS: no JSX, no data access — same discipline as the production file.

import type { AccessoryProduct } from './types';

export type FacetGroupId =
  | 'commercial'
  | 'type'
  | 'cables'
  | 'furniture'
  | 'power'
  | 'cleaning'
  | 'replacementParts'
  | 'adapters'
  | 'roomAcoustic';

export interface FacetGroup {
  id: FacetGroupId;
  label: string;
  note: string;
}

// Order + copy straight from docs/filters-sort/should-be-accessories.md's
// group headers ("Group order: Commercial -> Type -> Cables & Interconnects ->
// Stands, Isolation & Furniture -> Power -> Cleaning & Maintenance ->
// Replacement Parts -> Adapters & Converters -> Room Acoustic Treatment").
export const FACET_GROUPS: FacetGroup[] = [
  {
    id: 'commercial',
    label: 'Commercial',
    note: 'Not about the product — about whether, and how, to buy it.',
  },
  {
    id: 'type',
    label: 'Type',
    note: 'External identity — what kind of accessory this is, and what it’s for. Gates every group below.',
  },
  {
    id: 'cables',
    label: 'Cables & Interconnects',
    note: 'Domain-gated — exists only once Accessory Category is Cables & Interconnects.',
  },
  {
    id: 'furniture',
    label: 'Stands, Isolation & Furniture',
    note: 'Domain-gated — exists only once Accessory Category is Stands & Isolation or Racks & Furniture.',
  },
  {
    id: 'power',
    label: 'Power',
    note: 'Domain-gated — exists only once Accessory Category is Power.',
  },
  {
    id: 'cleaning',
    label: 'Cleaning & Maintenance',
    note: 'Domain-gated — exists only once Accessory Category is Cleaning & Maintenance.',
  },
  {
    id: 'replacementParts',
    label: 'Replacement Parts',
    note: 'Domain-gated — exists only once Accessory Category is Replacement Parts.',
  },
  {
    id: 'adapters',
    label: 'Adapters & Converters',
    note: 'Domain-gated — exists only once Accessory Category is Adapters & Converters.',
  },
  {
    id: 'roomAcoustic',
    label: 'Room Acoustic Treatment',
    note: 'Domain-gated — exists only once Accessory Category is Room Acoustic Treatment.',
  },
];

export type Option = { value: string; label: string };

interface FacetBase {
  /** URL query-param key. */
  id: string;
  group: FacetGroupId;
  label: string;
  /** should-be-accessories.md item number — traceability back to the should-be list. */
  itemNo: number;
  status: 'C' | 'R';
}

export interface CheckboxFacet extends FacetBase {
  control: 'checkbox';
  field: keyof AccessoryProduct;
  /** Static closed vocabulary, or 'derived' to collect distinct values from the dataset at runtime (brand). */
  options: Option[] | 'derived';
}

export interface BooleanFacet extends FacetBase {
  control: 'boolean';
  field: keyof AccessoryProduct;
}

export interface RangeFacet extends FacetBase {
  control: 'range';
  field: keyof AccessoryProduct;
  min: number;
  max: number;
  step: number;
  unit: string;
}

export type FacetDef = CheckboxFacet | BooleanFacet | RangeFacet;

const opts = (pairs: [string, string][]): Option[] => pairs.map(([value, label]) => ({ value, label }));

/**
 * The generic facets (checkbox / boolean / range). Price (item 2) and
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
  { id: 'availability', group: 'commercial', label: 'Availability / In Stock', itemNo: 6, status: 'C', control: 'checkbox', field: 'availability', options: opts([['in-stock', 'In Stock'], ['preorder', 'Preorder'], ['interest-check', 'Interest Check / Group Buy']]) },

  // ── Type ─────────────────────────────────────────────────────────────────
  { id: 'accessoryCategory', group: 'type', label: 'Accessory Category', itemNo: 9, status: 'C', control: 'checkbox', field: 'accessoryCategory', options: opts([
    ['cables-interconnects', 'Cables & Interconnects'],
    ['stands-isolation', 'Stands & Isolation'],
    ['racks-furniture', 'Racks & Furniture'],
    ['power', 'Power'],
    ['cases-storage', 'Cases & Storage/Transport'],
    ['cleaning-maintenance', 'Cleaning & Maintenance'],
    ['replacement-parts', 'Replacement Parts'],
    ['adapters-converters', 'Adapters & Converters'],
    ['room-acoustic-treatment', 'Room Acoustic Treatment'],
  ]) },
  { id: 'compatibleProductType', group: 'type', label: 'Compatible Product Type', itemNo: 10, status: 'R', control: 'checkbox', field: 'compatibleProductType', options: opts([
    ['headphone', 'Headphone'],
    ['speaker', 'Speaker'],
    ['turntable', 'Turntable'],
    ['amplifier-source', 'Amplifier/Source'],
    ['universal', 'Universal/Any'],
  ]) },

  // ── Cables & Interconnects (domain-gated on accessoryCategory === 'cables-interconnects') ──
  { id: 'cableFunction', group: 'cables', label: 'Cable Function', itemNo: 11, status: 'R', control: 'checkbox', field: 'cableFunction', options: opts([
    ['interconnect-rca-xlr', 'Interconnect (RCA/XLR)'],
    ['speaker-cable', 'Speaker Cable'],
    ['digital', 'Digital (USB/Coaxial/Optical/AES-EBU/Ethernet)'],
    ['power-mains', 'Power/Mains'],
    ['phono', 'Phono'],
  ]) },
  { id: 'terminationType', group: 'cables', label: 'Termination / Connector Type', itemNo: 12, status: 'C', control: 'checkbox', field: 'terminationType', options: opts([
    ['rca', 'RCA'], ['xlr', 'XLR'], ['banana-plug', 'Banana Plug'], ['spade', 'Spade'], ['bnc', 'BNC'],
    ['3.5mm', '3.5mm'], ['2.5mm', '2.5mm'], ['4.4mm', '4.4mm'], ['mini-to-rca', 'Mini-to-RCA'],
  ]) },
  { id: 'length', group: 'cables', label: 'Length', itemNo: 13, status: 'R', control: 'range', field: 'lengthM', min: 0.5, max: 10, step: 0.1, unit: 'm' },
  { id: 'conductorMaterial', group: 'cables', label: 'Conductor Material', itemNo: 14, status: 'R', control: 'checkbox', field: 'conductorMaterial', options: opts([
    ['copper-ofc', 'Copper/OFC'], ['silver', 'Silver'], ['silver-plated-copper', 'Silver-Plated Copper'],
  ]) },
  { id: 'balanced', group: 'cables', label: 'Balanced / Unbalanced', itemNo: 15, status: 'C', control: 'boolean', field: 'balanced' },

  // ── Stands, Isolation & Furniture (domain-gated on 'stands-isolation' | 'racks-furniture') ──
  { id: 'furnitureType', group: 'furniture', label: 'Furniture Type', itemNo: 16, status: 'C', control: 'checkbox', field: 'furnitureType', options: opts([
    ['speaker-stand', 'Speaker Stand'],
    ['equipment-rack-shelf', 'Equipment Rack/Shelf'],
    ['isolation-platform-feet-pucks', 'Isolation Platform/Feet/Pucks'],
    ['turntable-wall-shelf', 'Turntable Wall Shelf'],
    ['wall-mount', 'Wall Mount'],
  ]) },
  { id: 'furnitureMaterial', group: 'furniture', label: 'Material', itemNo: 17, status: 'R', control: 'checkbox', field: 'material', options: opts([
    ['wood', 'Wood'], ['metal', 'Metal'], ['acrylic', 'Acrylic'], ['composite-mdf', 'Composite/MDF'],
  ]) },
  { id: 'adjustableHeight', group: 'furniture', label: 'Adjustable Height', itemNo: 18, status: 'R', control: 'boolean', field: 'adjustableHeight' },
  { id: 'weightCapacity', group: 'furniture', label: 'Weight / Load Capacity', itemNo: 19, status: 'R', control: 'range', field: 'weightCapacityKg', min: 5, max: 200, step: 1, unit: 'kg' },

  // ── Power (domain-gated on accessoryCategory === 'power') ──────────────
  { id: 'powerProductType', group: 'power', label: 'Power Product Type', itemNo: 20, status: 'R', control: 'checkbox', field: 'powerProductType', options: opts([
    ['conditioner', 'Conditioner'], ['surge-protector', 'Surge Protector'], ['power-distributor', 'Power Distributor'],
    ['battery-ups-backup', 'Battery/UPS Backup'], ['power-cable', 'Power Cable'],
  ]) },
  { id: 'outletCount', group: 'power', label: 'Outlet Count', itemNo: 21, status: 'R', control: 'range', field: 'outletCount', min: 1, max: 12, step: 1, unit: '' },
  { id: 'powerConnectorType', group: 'power', label: 'Connector / Plug Type', itemNo: 22, status: 'C', control: 'checkbox', field: 'connectorType', options: opts([
    ['nema-5-15', 'NEMA 5-15'], ['iec-c13', 'IEC C13'], ['iec-c15', 'IEC C15'], ['20-amp', '20-Amp'],
  ]) },

  // ── Cleaning & Maintenance (domain-gated on accessoryCategory === 'cleaning-maintenance') ──
  { id: 'cleaningProductType', group: 'cleaning', label: 'Product Type', itemNo: 23, status: 'C', control: 'checkbox', field: 'cleaningProductType', options: opts([
    ['record-cleaning-fluid', 'Record Cleaning Fluid'],
    ['record-cleaning-machine', 'Record Cleaning Machine'],
    ['stylus-brush-cleaner', 'Stylus Brush/Cleaner'],
    ['carbon-fiber-brush', 'Carbon Fiber Brush'],
    ['anti-static-gun', 'Anti-Static Gun'],
    ['demagnetizer', 'Demagnetizer'],
    ['screen-lens-cloth', 'Screen/Lens Cloth'],
  ]) },
  { id: 'formatCompatibility', group: 'cleaning', label: 'Format Compatibility', itemNo: 24, status: 'R', control: 'checkbox', field: 'formatCompatibility', options: opts([
    ['vinyl', 'Vinyl'], ['cd', 'CD'], ['stylus-cartridge', 'Stylus/Cartridge'], ['optical-lens', 'Optical Lens'],
  ]) },

  // ── Replacement Parts (domain-gated on accessoryCategory === 'replacement-parts') ──
  { id: 'partType', group: 'replacementParts', label: 'Part Type', itemNo: 25, status: 'C', control: 'checkbox', field: 'partType', options: opts([
    ['ear-pads-cushions', 'Ear Pads/Cushions'],
    ['ear-tips', 'Ear Tips'],
    ['phono-cartridge-stylus', 'Phono Cartridge/Stylus'],
    ['drive-belt', 'Drive Belt'],
    ['remote-control', 'Remote Control'],
    ['dust-cover', 'Dust Cover'],
    ['fuses', 'Fuses'],
    ['vacuum-tubes-valves', 'Vacuum Tubes/Valves'],
  ]) },
  // Compatible Model / Brand (item 26) is a searchable/select exact-fit match
  // in production — out of scope for this generic-control POC (facetConfig
  // only wires checkbox/boolean/range); the field still round-trips in the
  // dataset for a future dedicated control.

  // ── Adapters & Converters (domain-gated on accessoryCategory === 'adapters-converters') ──
  { id: 'adapterFunction', group: 'adapters', label: 'Adapter Function', itemNo: 27, status: 'R', control: 'checkbox', field: 'adapterFunction', options: opts([
    ['bluetooth-transmitter-receiver', 'Bluetooth Transmitter/Receiver'],
    ['impedance-attenuator-adapter', 'Headphone Impedance/Attenuator Adapter'],
    ['connector-adapter', 'Connector Adapter (3.5mm↔6.35mm, RCA↔XLR)'],
    ['standalone-phono-preamp', 'Standalone Phono Preamp'],
    ['usb-dac-dongle', 'USB DAC Dongle'],
  ]) },

  // ── Room Acoustic Treatment (domain-gated on accessoryCategory === 'room-acoustic-treatment') ──
  { id: 'treatmentType', group: 'roomAcoustic', label: 'Treatment Type', itemNo: 28, status: 'R', control: 'checkbox', field: 'treatmentType', options: opts([
    ['acoustic-panel', 'Acoustic Panel'], ['bass-trap', 'Bass Trap'], ['diffuser', 'Diffuser'], ['isolation-pad', 'Isolation Pad'],
  ]) },
  { id: 'mounting', group: 'roomAcoustic', label: 'Mounting', itemNo: 29, status: 'R', control: 'checkbox', field: 'mounting', options: opts([
    ['wall', 'Wall'], ['ceiling', 'Ceiling'], ['freestanding', 'Freestanding'],
  ]) },
];

export const facetsForGroup = (group: FacetGroupId): FacetDef[] => FACETS.filter((f) => f.group === group);

export const FACET_BY_ID = new Map(FACETS.map((f) => [f.id, f]));

// ─────────────────────────────────────────────────────────────────────────
// Sort — should-be-accessories.md's observed baseline (7) + approved
// additions (2) = 9. Never default to Alphabetical (should-be-accessories.md
// explicit caution).
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
