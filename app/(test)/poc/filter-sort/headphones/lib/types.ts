// POC-local product type: the real base fields Product Card / the reveal
// mechanism need (unchanged shape — see sanity-cms/lib/products/getProductsByVfsKeys.ts
// `Product`), plus the should-be.md enrichment fields grafted on top.
//
// _id / slug / image / brand / price_data / stock are REAL Sanity values (fetched
// from the live headphones VFS category by scripts/poc-fetch-headphones-dataset.mjs)
// so links, basket, wishlist and the LQIP image reveal all work unmodified. Every
// field below `price_data` is synthetic enrichment authored for this POC — see
// docs/filters-sort/should-be.md for the facet this backs.

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

export type Condition = 'new' | 'open-box' | 'b-stock' | 'demo' | 'used' | 'refurbished';
export type AwardTag = 'award-winner' | 'editors-choice';
export type AvailabilityStatus = 'in-stock' | 'preorder' | 'interest-check';
export type DealTag = 'on-sale' | 'clearance';

export type ProductCategory = 'over-ear' | 'iem' | 'on-ear' | 'true-wireless';
export type WearingStyle = 'over-ear' | 'on-ear' | 'in-ear';
export type AcousticDesign = 'open-back' | 'closed-back' | 'semi-open';
export type FitType = 'universal' | 'custom';
export type Connectivity = 'wired' | 'wireless' | 'true-wireless' | 'hybrid';

export type SoundSignature =
  | 'neutral'
  | 'warm'
  | 'bright'
  | 'dark'
  | 'v-shaped'
  | 'basshead'
  | 'mid-forward'
  | 'harman-like';

export type CableTermination = '3.5mm' | '2.5mm-balanced' | '4.4mm-balanced' | '4-pin-xlr' | '6.35mm';
export type IpxRating = 'none' | 'ipx4' | 'ipx5' | 'ipx7' | 'ip67';
export type BluetoothCodec = 'sbc' | 'aac' | 'aptx' | 'aptx-hd' | 'aptx-adaptive' | 'ldac' | 'lc3';
export type AncMode = 'anc' | 'passive' | 'none';

export type DriverType =
  | 'dynamic'
  | 'planar-magnetic'
  | 'electrostatic'
  | 'balanced-armature'
  | 'amt'
  | 'bone-conduction'
  | 'electret'
  | 'hybrid';

/** should-be.md's own vocabulary for item 31 — the filterable bucket, not the
 *  literal per-product driver string (that lives in `driverConfigDetail`). */
export type DriverConfigBucket = 'single-dynamic' | 'single-ba' | 'multi-ba' | 'hybrid-config' | 'tribrid';

export interface HeadphoneEnrichment {
  // Commercial (should-be.md items 3–9; 1–2 are brand/price_data above)
  rating: number; // 1.0–5.0
  ratingCount: number;
  awards: AwardTag[];
  condition: Condition;
  inStockOnly: boolean; // item 6's "In Stock Only" toggle backing value
  deals: DealTag[]; // item 7
  discountPercent: number | null; // backs the "% Discount" sort; null/0 when not onSale
  isNewArrival: boolean; // item 8
  availability: AvailabilityStatus; // item 9

  // Type (items 10–15; sound signature is item 16 but conceptually a Type-like
  // fact — see should-be.md's Sound Properties group note)
  productCategory: ProductCategory;
  wearingStyle: WearingStyle;
  acousticDesign: AcousticDesign;
  fitType: FitType | null; // null when not an IEM
  connectivity: Connectivity;
  portable: boolean;

  // Sound Properties (items 16–20)
  soundSignature: SoundSignature;
  impedanceOhms: number;
  sensitivityDbMw: number;
  bassExtensionHz: number; // simplification of "frequency response range" (item 19) — see script comment
  requiresAmplifier: boolean; // item 20, derived from impedance+sensitivity at generation time

  // Material Factors (items 21–26)
  microphone: boolean;
  cableTermination: CableTermination;
  detachableCable: boolean;
  cableLengthM: number | null; // null when not applicable (e.g. true-wireless)
  foldable: boolean;
  ipxRating: IpxRating;

  // Wireless (items 27–29) — meaningful only when connectivity !== 'wired'
  bluetoothCodecs: BluetoothCodec[];
  anc: AncMode;
  batteryLifeHours: number | null;

  // Technical Specs (items 30–31)
  driverType: DriverType;
  driverConfigBucket: DriverConfigBucket;
  driverConfigDetail: string; // e.g. "1DD+4BA" — display only, not filtered on

  // Sort backing fields (mirrors production SORT_OPTIONS' backingField pattern)
  featuredPriority: number;
  popularity: number;
}

export type HeadphoneProduct = BaseProduct & HeadphoneEnrichment;
