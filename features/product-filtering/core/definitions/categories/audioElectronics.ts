// Filter/sort module for the audio-electronics category. Option lists mirror
// ../facetMap.ts valueVocab exactly; facet ids equal the
// facetMap urlParam of the same facet.

export type Option = { value: string; label: string };
export type FacetGroupId = 'commercial' | 'type' | 'connections' | 'amplification' | 'digital';

export interface FacetGroup {
  id: FacetGroupId;
  label: string;
  note?: string;
}

export interface FacetDef {
  id: string;
  group: FacetGroupId;
  label: string;
  control: 'checkbox' | 'boolean';
  options?: Option[] | 'derived';
}

export const FACET_GROUPS: FacetGroup[] = [
  { id: 'commercial', label: '' },
  { id: 'type', label: 'Type' },
  { id: 'connections', label: 'Connections' },
  { id: 'amplification', label: 'Amplification' },
  { id: 'digital', label: 'Digital & Streaming' },
];

export const FACETS: FacetDef[] = [
  { id: 'brand', group: 'commercial', label: 'Brand', control: 'checkbox', options: 'derived' },
  {
    id: 'condition',
    group: 'commercial',
    label: 'Condition',
    control: 'checkbox',
    options: [
      { value: 'new', label: 'New' },
      { value: 'open-box', label: 'Open Box' },
      { value: 'refurbished', label: 'Refurbished' },
    ],
  },
  { id: 'inStock', group: 'commercial', label: 'In Stock Only', control: 'boolean' },

  {
    id: 'deviceType',
    group: 'type',
    label: 'Device Type',
    control: 'checkbox',
    options: [
      { value: 'headphone-amplifier', label: 'Headphone Amplifier' },
      { value: 'digital-audio-player', label: 'Digital Audio Player' },
      { value: 'dac', label: 'DAC' },
      { value: 'network-streamer', label: 'Network Streamer' },
      { value: 'preamplifier', label: 'Preamplifier' },
      { value: 'integrated-amplifier', label: 'Integrated Amplifier' },
      { value: 'power-amplifier', label: 'Power Amplifier' },
      { value: 'cd-player-transport', label: 'CD Player / Transport' },
    ],
  },
  {
    id: 'formFactor',
    group: 'type',
    label: 'Form Factor',
    control: 'checkbox',
    options: [
      { value: 'desktop', label: 'Desktop' },
      { value: 'portable', label: 'Portable' },
      { value: 'dongle', label: 'Dongle' },
    ],
  },

  {
    id: 'deviceConnectivity',
    group: 'connections',
    label: 'Connectivity',
    control: 'checkbox',
    options: [
      { value: 'wired', label: 'Wired' },
      { value: 'bluetooth', label: 'Bluetooth' },
      { value: 'wifi-networked', label: 'Wi-Fi / Networked' },
      { value: 'wired-wireless', label: 'Wired + Wireless' },
    ],
  },
  {
    id: 'inputs',
    group: 'connections',
    label: 'Inputs',
    control: 'checkbox',
    options: [
      { value: 'usb', label: 'USB' },
      { value: 'optical', label: 'Optical' },
      { value: 'coaxial', label: 'Coaxial' },
      { value: 'rca', label: 'RCA' },
      { value: 'bluetooth', label: 'Bluetooth' },
      { value: 'xlr-balanced', label: 'XLR / Balanced' },
      { value: 'phono-mm-mc', label: 'Phono (MM/MC)' },
      { value: 'hdmi-earc', label: 'HDMI / eARC' },
      { value: 'ethernet-lan', label: 'Ethernet / LAN' },
      { value: 'i2s-iis', label: 'I2S / IIS' },
      { value: 'aes-ebu', label: 'AES/EBU' },
    ],
  },
  { id: 'balancedOutput', group: 'connections', label: 'Balanced Output', control: 'boolean' },

  {
    id: 'amplification',
    group: 'amplification',
    label: 'Amplifier Topology',
    control: 'checkbox',
    options: [
      { value: 'solid-state', label: 'Solid-State' },
      { value: 'tube', label: 'Tube / Valve' },
      { value: 'hybrid', label: 'Hybrid' },
      { value: 'class-d', label: 'Class D' },
    ],
  },

  { id: 'dacIncluded', group: 'digital', label: 'Built-in DAC', control: 'boolean' },
  {
    id: 'dsdSupport',
    group: 'digital',
    label: 'DSD Support',
    control: 'checkbox',
    options: [
      { value: 'none', label: 'None' },
      { value: 'dsd64', label: 'DSD64' },
      { value: 'dsd128', label: 'DSD128' },
      { value: 'dsd256-plus', label: 'DSD256+' },
    ],
  },
  {
    id: 'dacChipsetFamily',
    group: 'digital',
    label: 'DAC Chipset',
    control: 'checkbox',
    options: [
      { value: 'ess-sabre', label: 'ESS Sabre' },
      { value: 'akm', label: 'AKM' },
      { value: 'cirrus-logic', label: 'Cirrus Logic' },
      { value: 'r2r-ladder', label: 'R-2R / Ladder' },
    ],
  },
  {
    id: 'streamingPlatformSupport',
    group: 'digital',
    label: 'Streaming Platforms',
    control: 'checkbox',
    options: [
      { value: 'airplay2', label: 'AirPlay 2' },
      { value: 'chromecast', label: 'Chromecast built-in' },
      { value: 'spotify-connect', label: 'Spotify Connect' },
      { value: 'tidal-connect', label: 'TIDAL Connect' },
      { value: 'roon-ready', label: 'Roon Ready' },
      { value: 'dlna', label: 'DLNA' },
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
