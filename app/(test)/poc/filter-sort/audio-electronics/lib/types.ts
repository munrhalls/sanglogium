// POC-local product type for /poc/filter-sort/audio-electronics — same
// discipline as ../headphones/lib/types.ts: `_id`/`slug`/`image`/`brand`/
// `price_data`/`stock` are REAL Sanity fields, everything below `price_data`
// is synthetic enrichment backing docs/filters-sort/should-be-audio-electronics.md.
//
// Unlike headphones, this slice spans structurally unrelated product types
// (amplifiers, DACs, turntables, ...) — `productCategory` (item 9) is the
// gate that decides which domain-specific fields are even meaningful for a
// given product; see facetConfig.ts's `visibleGroups` for the panel-side half
// of that gating.

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
export type AvailabilityStatus = 'in-stock' | 'preorder' | 'special-order';
export type DealTag = 'on-sale' | 'clearance';

// Item 9 — gates Amplification / Digital Source / Turntable groups.
export type ProductCategory =
  | 'integrated-amp'
  | 'power-amp'
  | 'preamp'
  | 'av-receiver'
  | 'stereo-receiver'
  | 'dac'
  | 'network-streamer'
  | 'cd-player'
  | 'turntable';

// Item 10 — gates the Connectivity & Wireless group.
export type ConnectivityType = 'wired' | 'bluetooth' | 'wifi' | 'wired-wireless';

export type AmplifierTopology = 'tube' | 'solid-state' | 'hybrid' | 'class-d';
export type InputType = 'rca' | 'xlr' | 'phono' | 'optical' | 'coaxial' | 'usb' | 'hdmi-earc' | 'bluetooth' | 'ethernet';
export type OutputType = 'speaker-terminals' | 'pre-out' | 'headphone-jack' | 'subwoofer-out';

export type DsdSupport = 'none' | 'dsd64' | 'dsd128' | 'dsd256-plus';
export type DacChipsetFamily = 'ess-sabre' | 'akm' | 'cirrus-logic' | 'r2r-ladder';
export type StreamingPlatform = 'airplay2' | 'chromecast' | 'spotify-connect' | 'tidal-connect' | 'roon-ready' | 'dlna';
export type NetworkConnection = 'wifi' | 'ethernet';
export type DigitalInput = 'usb' | 'optical' | 'coaxial' | 'i2s' | 'aes-ebu';

export type DriveType = 'belt-drive' | 'direct-drive' | 'idler-wheel';
export type TurntableOperation = 'manual' | 'automatic' | 'semi-automatic';
export type PlaybackSpeed = '33' | '45' | '78';

export type BluetoothCodec = 'sbc' | 'aac' | 'aptx' | 'aptx-hd' | 'ldac';
export type VoiceAssistant = 'alexa' | 'google-assistant';

export interface AudioElectronicsEnrichment {
  // Commercial (should-be-audio-electronics.md items 3–8; 1–2 are brand/price_data above)
  rating: number; // 1.0–5.0
  ratingCount: number;
  awards: AwardTag[];
  condition: Condition;
  availability: AvailabilityStatus;
  inStockOnly: boolean;
  deals: DealTag[];
  discountPercent: number | null; // backs the "% Discount" sort; null/0 when not onSale
  isNewArrival: boolean;

  // Type (items 9–10) — productCategory gates every domain group below
  productCategory: ProductCategory;
  connectivity: ConnectivityType;

  // Amplification (items 11–19) — meaningful only when productCategory is one
  // of the amp/receiver values; null/[]/false elsewhere.
  amplifierTopology: AmplifierTopology | null;
  powerOutputW: number | null; // item 13, critical filter
  channelCount: string | null; // e.g. "2.0", "5.1", "7.1.4" — display bucket, not numeric
  inputTypes: InputType[];
  outputTypes: OutputType[];
  phonoStage: boolean; // item 17, critical filter
  triggerReady: boolean; // 12V trigger / custom-install ready
  remoteIncluded: boolean;

  // Digital Source & Streaming (items 20–26) — meaningful only when
  // productCategory is dac/network-streamer/cd-player, or connectivity is wifi.
  maxSampleRateKhz: number | null;
  dsdSupport: DsdSupport;
  hiResCert: boolean;
  dacChipsetFamily: DacChipsetFamily | null;
  streamingPlatforms: StreamingPlatform[];
  networkConnection: NetworkConnection | null;
  digitalInputs: DigitalInput[];

  // Turntables & Vinyl (items 27–32) — meaningful only when productCategory is 'turntable'.
  driveType: DriveType | null;
  turntableOperation: TurntableOperation | null;
  speedsSupported: PlaybackSpeed[];
  phonoPreampBuiltIn: boolean; // item 30, critical filter
  cartridgeIncluded: boolean;
  digitalOutput: boolean; // USB output for digitizing vinyl

  // Connectivity & Wireless (items 33–35) — meaningful only when connectivity
  // is bluetooth/wifi/wired-wireless.
  bluetoothCodecs: BluetoothCodec[];
  voiceAssistants: VoiceAssistant[];
  multiroomSupport: boolean;

  // Physical & Install Factors (items 36–38)
  finish: string;
  rackMountable: boolean;
  countryOfManufacture: string;

  // Sort backing fields (mirrors production SORT_OPTIONS' backingField pattern)
  featuredPriority: number;
  popularity: number;
}

export type AudioElectronicsProduct = BaseProduct & AudioElectronicsEnrichment;
