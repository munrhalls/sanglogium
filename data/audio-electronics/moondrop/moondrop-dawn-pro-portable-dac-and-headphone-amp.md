---
product_id: "MrEMtYwMtrFDGWmRnNGOLg"
product_slug: "moondrop-dawn-pro-portable-dac-and-headphone-amp"
brand: "Moondrop"
name: "Moondrop Dawn Pro Portable DAC and Headphone Amp"
slice: "audio-electronics"
spec_fields:
  customerRating: null
  awards: []
  condition: null
  dealsDiscount: null
  newArrival: null
  deviceType: "dac"
  deviceConnectivity: "wired"
  amplification: null
  powerOutputPerChannelW: null
  channelCount: null
  inputs:
    - "usb"
  outputs: null
  phonoStageBuiltIn: null
  trigger12v: null
  remoteControlIncluded: null
  maxSampleRateBitDepth: "16-bit/44.1kHz – 32-bit/384kHz"
  dsdSupport: "dsd256-plus"
  hiResCertification: null
  dacChipsetFamily:
    - "cirrus-logic"
  streamingPlatformSupport: null
  networkConnection: null
  driveType: null
  turntableOperation: null
  speedsSupported: null
  phonoPreampBuiltIn: null
  cartridgeIncluded: null
  usbDigitalOutput: null
  bluetoothCodecs: null
  voiceAssistant: null
  multiroomSupport: null
  finishColor:
    - "Silver"
  rackMountable19: false
  countryOfManufacture: null
source_urls:
  - "https://moondroplab.com/en/products/dawn-pro"
  - "https://www.audiophonics.fr/en/mobile-hp-amplifiers/moondrop-dawn-pro-portable-balanced-headphone-amplifier-dac-2xcs43131-32bit-384khz-dsd256-p-18175.html"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **customerRating** (internal): `null` — store-computed from review aggregate; not individually sourced from the manufacturer.
- **awards** (marketing-fact): `[]` — no named award, editor’s choice, or recognition badge mentioned on the manufacturer page or the retailer listing.
- **condition** (internal): `null` — condition (new/open-box/refurbished) is a store-operational field; not stated by the manufacturer.
- **dealsDiscount** (internal): `null` — no sale/clearance indication on the manufacturer page at the time of sourcing; store-operational.
- **newArrival** (internal): `null` — new-arrival flag is store-operational; not stated by the manufacturer.
- **deviceType** (marketing-fact): `dac` — "MOONDROP DAWN PRO USB DAC/AMP" and "High-performance DAC/AMP" on the manufacturer page; the portable USB DAC/amp maps to the `dac` product category.
- **deviceConnectivity** (marketing-fact): `wired` — "Input: USB C (UAC)" and wired 3.5mm/4.4mm outputs; no Bluetooth or Wi-Fi mentioned.
- **amplification** (marketing-fact): `null` — `deviceType` is `dac`; field is domain-gated to amplifier/receiver categories.
- **powerOutputPerChannelW** (hard-spec): `null` — domain-gated to amplifier/receiver categories; the headphone-amp output power is not the same as this amplifier field.
- **channelCount** (marketing-fact): `null` — domain-gated to amplifier/receiver categories.
- **inputs** (marketing-fact): `["usb"]` — "Input: USB C (UAC)" maps to the `usb` input type.
- **outputs** (marketing-fact): `null` — domain-gated to amplifier/receiver categories; the product has 3.5mm/4.4mm headphone jacks, but the `outputs` facet is for amplifier output types.
- **phonoStageBuiltIn** (marketing-fact): `null` — domain-gated to amplifier/receiver categories.
- **trigger12v** (marketing-fact): `null` — domain-gated to amplifier/receiver categories.
- **remoteControlIncluded** (marketing-fact): `null` — domain-gated to amplifier/receiver categories.
- **maxSampleRateBitDepth** (hard-spec): `"16-bit/44.1kHz – 32-bit/384kHz"` — "Supported Formats: PCM 16 bit 44.1 kHz to 32 bit 384 kHz".
- **dsdSupport** (hard-spec): `"dsd256-plus"` — "Supported Formats: ... DSD up to DSD512" maps to the schema's `dsd256-plus` (DSD256+) bucket.
- **hiResCertification** (marketing-fact): `null` — no explicit "Hi-Res Audio" certification or MQA logo/statement found.
- **dacChipsetFamily** (hard-spec): `["cirrus-logic"]` — "DAC Chips: Dual Cirrus Logic CS43131".
- **streamingPlatformSupport** (marketing-fact): `null` — no AirPlay/Chromecast/Spotify/Tidal/Roon/DLNA support mentioned; wired USB DAC.
- **networkConnection** (marketing-fact): `null` — no Wi-Fi/Ethernet mentioned (Audiophonics table lists "Networking | No").
- **driveType**, **turntableOperation**, **speedsSupported**, **phonoPreampBuiltIn**, **cartridgeIncluded**, **usbDigitalOutput** (various): `null` — domain-gated to `turntable`; this is a `dac`.
- **bluetoothCodecs** (marketing-fact): `null` — `deviceConnectivity` is `wired`; no Bluetooth.
- **voiceAssistant** (marketing-fact): `null` — `deviceConnectivity` is `wired`; field is domain-gated to Bluetooth/Wi-Fi/wired-wireless.
- **multiroomSupport** (marketing-fact): `null` — `deviceConnectivity` is `wired`; field is domain-gated to Bluetooth/Wi-Fi/wired-wireless.
- **finishColor** (marketing-fact): `["Silver"]` — Audiophonics table lists "Color | Silver".
- **rackMountable19** (marketing-fact): `false` — portable/dongle form factor (42 × 22.45 × 12.39 mm, 13 g); no 19" rack-mounting mentioned.
- **countryOfManufacture** (marketing-fact): `null` — no explicit "Country of origin" / "Made in" statement found on the opened manufacturer or retailer pages; left null rather than infer from the company address.

## Conflict / Caution Notes

- **DSD support conflict:** The manufacturer product page states "DSD up to DSD512", while the Audiophonics retailer listing lists "Max sampling rate | DSD256". The manufacturer page is the higher-probability Tier-1 source and the schema's top DSD bucket is `dsd256-plus` (DSD256+), which covers both values. Both sources are recorded; the conflict is not silently resolved.