// POC-local product type: the real base fields Product Card / the reveal
// mechanism need (unchanged shape — see sanity-cms/lib/products/getProductsByVfsKeys.ts
// `Product`), plus should-be-accessories.md's enrichment fields grafted on top.
//
// _id / slug / image / brand / price_data / stock are REAL Sanity values (fetched
// from the live accessories VFS category by scripts/poc-fetch-accessories-dataset.mjs)
// so links, basket, wishlist and the LQIP image reveal all work unmodified. Every
// field below `price_data` is synthetic enrichment authored for this POC — see
// docs/filters-sort/should-be-accessories.md for the facet this backs.

export interface BaseProduct {
  _id: string;
  name: string;
  brand: { _id: string; name: string; slug?: { current: string } } | null;
  price_data: { currency: string; unit_amount: number };
  image: unknown;
  catalogueLocationKeys: string[];
  slug: { current: string };
  stock: number;
  reservedStock: number;
  availableStock: number;
  _createdAt: string;
}

export type Condition = 'new' | 'open-box' | 'refurbished';
export type AwardTag = 'award-winner' | 'editors-choice';
export type DealTag = 'none' | 'sale' | 'clearance';

// should-be-accessories.md item 9 — gates every domain-specific group below.
export type AccessoryCategory =
  | 'cables-interconnects'
  | 'stands-isolation'
  | 'racks-furniture'
  | 'power'
  | 'cases-storage-transport'
  | 'cleaning-maintenance'
  | 'replacement-parts'
  | 'adapters-converters'
  | 'room-acoustic-treatment';

export type CompatibleProductType = 'headphone' | 'speaker' | 'turntable' | 'amplifier-source' | 'universal-any';

// Cables & Interconnects (items 11-15) — domain-gated on accessoryCategory === 'cables-interconnects'.
export type CableFunction =
  | 'interconnect-rca-xlr'
  | 'speaker-cable'
  | 'digital-usb-coaxial-optical-aes-ebu-ethernet'
  | 'power-mains'
  | 'phono';

export type TerminationType =
  | 'rca'
  | 'xlr'
  | 'banana-plug'
  | 'spade'
  | 'bnc'
  | '3.5mm'
  | '2.5mm'
  | '4.4mm'
  | 'mini-to-rca';

export type ConductorMaterial = 'copper-ofc' | 'silver' | 'silver-plated-copper';

// Stands, Isolation & Furniture (items 16-19) — domain-gated on 'stands-isolation' | 'racks-furniture'.
export type FurnitureType =
  | 'speaker-stand'
  | 'equipment-rack-shelf'
  | 'isolation-platform-feet-pucks'
  | 'turntable-wall-shelf'
  | 'wall-mount';

export type FurnitureMaterial = 'wood' | 'metal' | 'acrylic' | 'composite-mdf';

// Power (items 20-22) — domain-gated on accessoryCategory === 'power'.
export type PowerProductType =
  | 'conditioner'
  | 'surge-protector'
  | 'power-distributor'
  | 'battery-ups-backup'
  | 'power-cable';

export type PowerConnectorType = 'nema-5-15' | 'iec-c13-c15' | '20-amp';

// Cleaning & Maintenance (items 23-24) — domain-gated on accessoryCategory === 'cleaning-maintenance'.
export type CleaningProductType =
  | 'record-cleaning-fluid'
  | 'record-cleaning-machine'
  | 'stylus-brush-cleaner'
  | 'carbon-fiber-brush'
  | 'anti-static-gun'
  | 'demagnetizer'
  | 'screen-lens-cloth';

export type FormatCompatibility = 'vinyl' | 'cd' | 'stylus-cartridge' | 'optical-lens';

// Replacement Parts (items 25-26) — domain-gated on accessoryCategory === 'replacement-parts'.
export type PartType =
  | 'ear-pads-cushions'
  | 'ear-tips'
  | 'phono-cartridge-stylus'
  | 'drive-belt'
  | 'remote-control'
  | 'dust-cover'
  | 'fuses'
  | 'vacuum-tubes-valves';

// Adapters & Converters (item 27) — domain-gated on accessoryCategory === 'adapters-converters'.
export type AdapterFunction =
  | 'bluetooth-transmitter-receiver'
  | 'headphone-impedance-attenuator-adapter'
  | 'connector-adapter'
  | 'standalone-phono-preamp'
  | 'usb-dac-dongle';

// Room Acoustic Treatment (items 28-29) — domain-gated on accessoryCategory === 'room-acoustic-treatment'.
export type TreatmentType = 'acoustic-panel' | 'bass-trap' | 'diffuser' | 'isolation-pad';
export type Mounting = 'wall' | 'ceiling' | 'freestanding';

export interface AccessoryEnrichment {
  // Commercial (should-be-accessories.md items 3-8; 1-2 are brand/price_data above)
  rating: number; // 1.0-5.0
  ratingCount: number;
  awards: AwardTag[];
  condition: Condition;
  inStockOnly: boolean;
  deals: DealTag[];
  discountPercent: number | null;
  isNewArrival: boolean;

  // Type (items 9-10)
  accessoryCategory: AccessoryCategory;
  compatibleProductType: CompatibleProductType;

  // Domain-gated groups — null on every product outside that group.
  cableFunction: CableFunction | null;
  terminationType: TerminationType | null;
  lengthM: number | null;
  conductorMaterial: ConductorMaterial | null;
  balancedUnbalanced: 'balanced' | 'unbalanced' | null;

  furnitureType: FurnitureType | null;
  material: FurnitureMaterial | null;
  adjustableHeight: boolean | null;
  weightCapacityKg: number | null;

  powerProductType: PowerProductType | null;
  outletCount: number | null;
  connectorType: PowerConnectorType | null;

  cleaningProductType: CleaningProductType | null;
  formatCompatibility: FormatCompatibility | null;

  partType: PartType | null;
  compatibleModel: string | null;

  adapterFunction: AdapterFunction | null;

  treatmentType: TreatmentType | null;
  mounting: Mounting | null;

  // Sort backing fields (mirrors production SORT_OPTIONS' backingField pattern)
  featuredPriority: number;
  popularity: number;
}

export type AccessoryProduct = BaseProduct & AccessoryEnrichment;
