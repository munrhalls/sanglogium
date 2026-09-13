// POC-local mirror of lib/catalogue/facetMap.ts's shape and role, re-pointed
// at docs/filters-sort/should-be-audio-electronics.md's 38-item taxonomy.
// Deliberately NOT added to the shared production facetMap — same reasoning
// as ../headphones/lib/facetConfig.ts. See page.tsx for how this plugs into
// the URL <-> sidebar <-> grid mechanism.
//
// The one thing this file adds beyond the headphones POC: `visibleGroups`,
// because should-be-audio-electronics.md requires domain gating an
// unconditional facet list can't express — an amplifier's listing never
// shows turntable speed options, and vice versa (see its acceptance tests).
//
// HEADLESS: no JSX, no data access — same discipline as the production file.

import type { AudioElectronicsProduct } from './types';
import type { FilterSortState } from './filterSortParams';

export type FacetGroupId = 'commercial' | 'type' | 'amplification' | 'digital' | 'turntable' | 'wireless' | 'physical';

export interface FacetGroup {
  id: FacetGroupId;
  label: string;
  note: string;
}

// Order + copy straight from docs/filters-sort/should-be-audio-electronics.md's group headers.
export const FACET_GROUPS: FacetGroup[] = [
  {
    id: 'commercial',
    label: 'Commercial',
    note: 'Not about the product — about whether, and how, to buy it.',
  },
  {
    id: 'type',
    label: 'Type',
    note: "External identity — what kind of component this is, independent of its internal engineering. Gates every group below.",
  },
  {
    id: 'amplification',
    label: 'Amplification',
    note: 'Domain-gated — exists only once Product Category is an amplifier, receiver, or preamplifier.',
  },
  {
    id: 'digital',
    label: 'Digital Source & Streaming',
    note: 'Domain-gated — exists only once Product Category is DAC, Network Streamer, or CD Player, or Connectivity is Wi-Fi/Networked.',
  },
  {
    id: 'turntable',
    label: 'Turntables & Vinyl',
    note: 'Domain-gated — exists only once Product Category is Turntable.',
  },
  {
    id: 'wireless',
    label: 'Connectivity & Wireless',
    note: 'Domain-gated — exists only once Connectivity is Bluetooth, Wi-Fi/Networked, or Wired+Wireless.',
  },
  {
    id: 'physical',
    label: 'Physical & Install Factors',
    note: 'Internal but tangible — how the piece sits in a room.',
  },
];

export type Option = { value: string; label: string };

interface FacetBase {
  /** URL query-param key. */
  id: string;
  group: FacetGroupId;
  label: string;
  /** should-be-audio-electronics.md item number — traceability back to the should-be list. */
  itemNo: number;
  status: 'C' | 'R';
}

export interface CheckboxFacet extends FacetBase {
  control: 'checkbox';
  field: keyof AudioElectronicsProduct;
  options: Option[] | 'derived';
}

export interface BooleanFacet extends FacetBase {
  control: 'boolean';
  field: keyof AudioElectronicsProduct;
}

export interface RangeFacet extends FacetBase {
  control: 'range';
  field: keyof AudioElectronicsProduct;
  min: number;
  max: number;
  step: number;
  unit: string;
}

export type FacetDef = CheckboxFacet | BooleanFacet | RangeFacet;

const opts = (pairs: [string, string][]): Option[] => pairs.map(([value, label]) => ({ value, label }));

// Categories that gate each domain group (item 9's vocabulary).
const AMP_CATEGORIES = ['integrated-amp', 'power-amp', 'preamp', 'av-receiver', 'stereo-receiver'];
const DIGITAL_SOURCE_CATEGORIES = ['dac', 'network-streamer', 'cd-player'];
const TURNTABLE_CATEGORIES = ['turntable'];
const WIRELESS_CONNECTIVITY = ['bluetooth', 'wifi', 'wired-wireless'];

/**
 * Which domain groups the sidebar should render, given the currently active
 * Product Category / Connectivity selections. No category selected (a bare
 * browse of the full slice) shows every group — gating only narrows once the
 * shopper has actually picked a category, matching the acceptance test's
 * "while browsing turntables" framing (a selection, not a default state).
 */
export function visibleGroups(state: FilterSortState): FacetGroupId[] {
  const categories = (state.productCategory ?? []).map((v) => String(v).toLowerCase());
  const connectivity = (state.connectivity ?? []).map((v) => String(v).toLowerCase());

  const showAmp = categories.length === 0 || categories.some((c) => AMP_CATEGORIES.includes(c));
  const showDigital =
    categories.length === 0 ||
    categories.some((c) => DIGITAL_SOURCE_CATEGORIES.includes(c)) ||
    connectivity.includes('wifi');
  const showTurntable = categories.length === 0 || categories.some((c) => TURNTABLE_CATEGORIES.includes(c));
  const showWireless = connectivity.length === 0 || connectivity.some((c) => WIRELESS_CONNECTIVITY.includes(c));

  return FACET_GROUPS.filter((g) => {
    if (g.id === 'amplification') return showAmp;
    if (g.id === 'digital') return showDigital;
    if (g.id === 'turntable') return showTurntable;
    if (g.id === 'wireless') return showWireless;
    return true;
  }).map((g) => g.id);
}

/**
 * The generic facets (checkbox / boolean / range). Price (item 2) and
 * Customer Rating (item 3) are bespoke controls rendered directly by the
 * panel — same reason production keeps Price out of its FILTER_FACETS loop.
 */
export const FACETS: FacetDef[] = [
  // ── Commercial ──────────────────────────────────────────────────────────
  { id: 'brand', group: 'commercial', label: 'Brand', itemNo: 1, status: 'C', control: 'checkbox', field: 'brand', options: 'derived' },
  { id: 'awards', group: 'commercial', label: 'Awards / Recognition', itemNo: 4, status: 'R', control: 'checkbox', field: 'awards', options: opts([['award-winner', 'Award Winner'], ['editors-choice', "Editor's Choice"]]) },
  { id: 'condition', group: 'commercial', label: 'Condition / Stock Type', itemNo: 5, status: 'C', control: 'checkbox', field: 'condition', options: opts([['new', 'New'], ['open-box', 'Open-Box'], ['b-stock', 'Blemished / B-Stock'], ['demo', 'Demo / Ex-Display'], ['used', 'Used / Trade-In'], ['refurbished', 'Refurbished']]) },
  { id: 'availability', group: 'commercial', label: 'Availability', itemNo: 6, status: 'C', control: 'checkbox', field: 'availability', options: opts([['in-stock', 'In Stock'], ['preorder', 'Preorder'], ['special-order', 'Special / Custom Order']]) },
  { id: 'inStockOnly', group: 'commercial', label: 'In Stock Only', itemNo: 6, status: 'C', control: 'boolean', field: 'inStockOnly' },
  { id: 'deals', group: 'commercial', label: 'Deals / Discount', itemNo: 7, status: 'C', control: 'checkbox', field: 'deals', options: opts([['on-sale', 'On Sale'], ['clearance', 'Clearance / Closeout']]) },
  { id: 'newArrival', group: 'commercial', label: 'New Arrivals', itemNo: 8, status: 'C', control: 'boolean', field: 'isNewArrival' },

  // ── Type ─────────────────────────────────────────────────────────────────
  { id: 'productCategory', group: 'type', label: 'Product Category', itemNo: 9, status: 'C', control: 'checkbox', field: 'productCategory', options: opts([
    ['integrated-amp', 'Integrated Amplifier'],
    ['power-amp', 'Power Amplifier'],
    ['preamp', 'Preamplifier'],
    ['av-receiver', 'AV / Surround Receiver'],
    ['stereo-receiver', 'Stereo Receiver'],
    ['dac', 'DAC'],
    ['network-streamer', 'Network Streamer'],
    ['cd-player', 'CD Player / Transport'],
    ['turntable', 'Turntable'],
  ]) },
  { id: 'connectivity', group: 'type', label: 'Connectivity', itemNo: 10, status: 'C', control: 'checkbox', field: 'connectivity', options: opts([['wired', 'Wired'], ['bluetooth', 'Bluetooth'], ['wifi', 'Wi-Fi / Networked'], ['wired-wireless', 'Wired + Wireless']]) },

  // ── Amplification (gated: productCategory ∈ AMP_CATEGORIES) ────────────
  { id: 'amplifierTopology', group: 'amplification', label: 'Amplifier Topology', itemNo: 12, status: 'C', control: 'checkbox', field: 'amplifierTopology', options: opts([['tube', 'Tube / Valve'], ['solid-state', 'Solid-State'], ['hybrid', 'Hybrid'], ['class-d', 'Class D']]) },
  { id: 'powerOutput', group: 'amplification', label: 'Power Output per Channel', itemNo: 13, status: 'R', control: 'range', field: 'powerOutputW', min: 5, max: 1000, step: 5, unit: 'W RMS' },
  { id: 'channelCount', group: 'amplification', label: 'Channel Count', itemNo: 14, status: 'R', control: 'checkbox', field: 'channelCount', options: opts([['2.0', '2.0'], ['2.1', '2.1'], ['5.1', '5.1'], ['7.1', '7.1'], ['7.1.4', '7.1.4']]) },
  { id: 'inputTypes', group: 'amplification', label: 'Input Types', itemNo: 15, status: 'C', control: 'checkbox', field: 'inputTypes', options: opts([['rca', 'RCA'], ['xlr', 'XLR / Balanced'], ['phono', 'Phono (MM/MC)'], ['optical', 'Optical'], ['coaxial', 'Coaxial'], ['usb', 'USB'], ['hdmi-earc', 'HDMI / eARC'], ['bluetooth', 'Bluetooth'], ['ethernet', 'Ethernet / LAN']]) },
  { id: 'outputTypes', group: 'amplification', label: 'Output Types', itemNo: 16, status: 'C', control: 'checkbox', field: 'outputTypes', options: opts([['speaker-terminals', 'Speaker Terminals'], ['pre-out', 'Pre-Out (RCA/XLR)'], ['headphone-jack', 'Headphone Jack'], ['subwoofer-out', 'Subwoofer Out']]) },
  { id: 'phonoStage', group: 'amplification', label: 'Built-in Phono Stage', itemNo: 17, status: 'C', control: 'boolean', field: 'phonoStage' },
  { id: 'triggerReady', group: 'amplification', label: '12V Trigger / Custom-Install Ready', itemNo: 18, status: 'C', control: 'boolean', field: 'triggerReady' },
  { id: 'remoteIncluded', group: 'amplification', label: 'Remote Control Included', itemNo: 19, status: 'C', control: 'boolean', field: 'remoteIncluded' },

  // ── Digital Source & Streaming (gated) ──────────────────────────────────
  { id: 'maxSampleRate', group: 'digital', label: 'Max Sample Rate (PCM)', itemNo: 20, status: 'R', control: 'range', field: 'maxSampleRateKhz', min: 44, max: 768, step: 1, unit: 'kHz' },
  { id: 'dsdSupport', group: 'digital', label: 'DSD Support', itemNo: 21, status: 'R', control: 'checkbox', field: 'dsdSupport', options: opts([['none', 'None'], ['dsd64', 'DSD64'], ['dsd128', 'DSD128'], ['dsd256-plus', 'DSD256+']]) },
  { id: 'hiResCert', group: 'digital', label: 'MQA / Hi-Res Audio Certification', itemNo: 22, status: 'R', control: 'boolean', field: 'hiResCert' },
  { id: 'dacChipsetFamily', group: 'digital', label: 'DAC Chipset Family', itemNo: 23, status: 'C', control: 'checkbox', field: 'dacChipsetFamily', options: opts([['ess-sabre', 'ESS Sabre'], ['akm', 'AKM'], ['cirrus-logic', 'Cirrus Logic'], ['r2r-ladder', 'R-2R / Ladder']]) },
  { id: 'streamingPlatforms', group: 'digital', label: 'Streaming Platform Support', itemNo: 24, status: 'C', control: 'checkbox', field: 'streamingPlatforms', options: opts([['airplay2', 'AirPlay 2'], ['chromecast', 'Chromecast built-in'], ['spotify-connect', 'Spotify Connect'], ['tidal-connect', 'TIDAL Connect'], ['roon-ready', 'Roon Ready'], ['dlna', 'DLNA']]) },
  { id: 'networkConnection', group: 'digital', label: 'Network Connection', itemNo: 25, status: 'C', control: 'checkbox', field: 'networkConnection', options: opts([['wifi', 'Wi-Fi'], ['ethernet', 'Ethernet']]) },
  { id: 'digitalInputs', group: 'digital', label: 'Digital Inputs', itemNo: 26, status: 'C', control: 'checkbox', field: 'digitalInputs', options: opts([['usb', 'USB'], ['optical', 'Optical'], ['coaxial', 'Coaxial'], ['i2s', 'I2S / IIS'], ['aes-ebu', 'AES/EBU']]) },

  // ── Turntables & Vinyl (gated: productCategory === 'turntable') ────────
  { id: 'driveType', group: 'turntable', label: 'Drive Type', itemNo: 27, status: 'R', control: 'checkbox', field: 'driveType', options: opts([['belt-drive', 'Belt-Drive'], ['direct-drive', 'Direct-Drive'], ['idler-wheel', 'Idler-Wheel']]) },
  { id: 'turntableOperation', group: 'turntable', label: 'Operation', itemNo: 28, status: 'R', control: 'checkbox', field: 'turntableOperation', options: opts([['manual', 'Manual'], ['automatic', 'Automatic'], ['semi-automatic', 'Semi-Automatic']]) },
  { id: 'speedsSupported', group: 'turntable', label: 'Speeds Supported', itemNo: 29, status: 'R', control: 'checkbox', field: 'speedsSupported', options: opts([['33', '33⅓ RPM'], ['45', '45 RPM'], ['78', '78 RPM']]) },
  { id: 'phonoPreampBuiltIn', group: 'turntable', label: 'Built-in Phono Preamp', itemNo: 30, status: 'C', control: 'boolean', field: 'phonoPreampBuiltIn' },
  { id: 'cartridgeIncluded', group: 'turntable', label: 'Cartridge Included', itemNo: 31, status: 'R', control: 'boolean', field: 'cartridgeIncluded' },
  { id: 'digitalOutput', group: 'turntable', label: 'USB / Digital Output', itemNo: 32, status: 'R', control: 'boolean', field: 'digitalOutput' },

  // ── Connectivity & Wireless (gated) ─────────────────────────────────────
  { id: 'bluetoothCodec', group: 'wireless', label: 'Bluetooth Codec', itemNo: 33, status: 'R', control: 'checkbox', field: 'bluetoothCodecs', options: opts([['sbc', 'SBC'], ['aac', 'AAC'], ['aptx', 'aptX'], ['aptx-hd', 'aptX HD'], ['ldac', 'LDAC']]) },
  { id: 'voiceAssistant', group: 'wireless', label: 'Voice Assistant Built-in', itemNo: 34, status: 'R', control: 'checkbox', field: 'voiceAssistants', options: opts([['alexa', 'Alexa'], ['google-assistant', 'Google Assistant']]) },
  { id: 'multiroomSupport', group: 'wireless', label: 'Multiroom Support', itemNo: 35, status: 'R', control: 'boolean', field: 'multiroomSupport' },

  // ── Physical & Install Factors ──────────────────────────────────────────
  { id: 'finish', group: 'physical', label: 'Finish / Color', itemNo: 36, status: 'R', control: 'checkbox', field: 'finish', options: 'derived' },
  { id: 'rackMountable', group: 'physical', label: 'Rack-Mountable (19")', itemNo: 37, status: 'R', control: 'boolean', field: 'rackMountable' },
  { id: 'countryOfManufacture', group: 'physical', label: 'Country of Manufacture', itemNo: 38, status: 'R', control: 'checkbox', field: 'countryOfManufacture', options: 'derived' },
];

export const facetsForGroup = (group: FacetGroupId): FacetDef[] => FACETS.filter((f) => f.group === group);

export const FACET_BY_ID = new Map(FACETS.map((f) => [f.id, f]));

// ─────────────────────────────────────────────────────────────────────────
// Sort — should-be-audio-electronics.md's observed baseline (9) + approved
// additions (2) = 11, identical set to the headphones POC.
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
