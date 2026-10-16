// Filter/sort module for the audio-electronics category. Option lists mirror
// ../facetMap.ts valueVocab exactly; facet ids equal the
// facetMap urlParam of the same facet.

import type { Option } from '@/features/product-filtering/core/definitions/option';

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
  { id: 'inStock', group: 'commercial', label: 'In Stock Only', control: 'boolean' },

  {
    id: 'deviceType',
    group: 'type',
    label: 'Device Type',
    control: 'checkbox',
    options: [
      { value: 'headphone-amplifier', label: 'Headphone Amplifier' },
      { value: 'digital-audio-player', label: 'Digital Audio Player' },
      { value: 'dac', label: 'DAC (Converter)' },
      { value: 'network-streamer', label: 'Network Streamer' },
      { value: 'preamplifier', label: 'Preamplifier (Needs Power Amp)' },
      { value: 'integrated-amplifier', label: 'Integrated Amp (All-in-One)' },
      { value: 'power-amplifier', label: 'Power Amp (Needs Preamp)' },
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
      { value: 'wired-wireless', label: 'Wired + Wireless (BT/Wi-Fi)' },
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
      { value: 'xlr-balanced', label: 'XLR / Balanced' },
      { value: 'phono-mm-mc', label: 'Phono / Turntable (MM/MC)' },
      { value: 'hdmi-earc', label: 'HDMI (ARC / eARC)' },
      { value: 'ethernet-lan', label: 'Ethernet / LAN' },
      { value: 'i2s-iis', label: 'I2S / IIS (Pro Audio)' },
      { value: 'aes-ebu', label: 'AES/EBU (Pro Audio)' },
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
      { value: 'hybrid', label: 'Hybrid (Tube + Solid-State)' },
      { value: 'class-d', label: 'Class D (Switching Amp)' },
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
      { value: 'dsd64', label: 'DSD64 (Hi-Res Audio)' },
      { value: 'dsd128', label: 'DSD128 (Hi-Res Audio)' },
      { value: 'dsd256-plus', label: 'DSD256+ (Hi-Res Audio)' },
    ],
  },
  {
    id: 'dacChipsetFamily',
    group: 'digital',
    label: 'DAC Chipset',
    control: 'checkbox',
    options: [
      { value: 'ess-sabre', label: 'ESS Sabre (Crisp, Detailed)' },
      { value: 'akm', label: 'AKM (Warm, Smooth)' },
      { value: 'cirrus-logic', label: 'Cirrus Logic (Balanced)' },
      { value: 'r2r-ladder', label: 'R-2R Ladder (Analog-Style)' },
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
      { value: 'dlna', label: 'DLNA (Legacy Network Share)' },
    ],
  },
];

export const facetsForGroup = (group: FacetGroupId): FacetDef[] => FACETS.filter((f) => f.group === group);

