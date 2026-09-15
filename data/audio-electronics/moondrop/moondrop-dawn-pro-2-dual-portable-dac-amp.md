---
product_id: "xMEqvkRBbdrlJXyFG8l6fJ"
product_slug: "moondrop-dawn-pro-2-dual-portable-dac-amp"
brand: "Moondrop"
name: "Moondrop Dawn Pro 2 Dual Portable DAC/Amp"
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
  - "https://moondroplab.com/en/products/dawn-pro-2"
  - "https://www.linsoul.com/products/moondrop-dawn-pro2"
  - "https://apos.audio/products/moondrop-dawn-pro-2-dual-portable-dac-amp"
  - "https://marlimgear.com/product/dawn-pro-2"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **customerRating** (internal): `null` — store-computed from review aggregate; not individually sourced.
- **awards** (marketing-fact): `[]` — no named award, editor’s choice, or recognition badge mentioned.
- **condition** (internal): `null` — store-operational; not stated by the manufacturer.
- **dealsDiscount** (internal): `null` — store-operational; no individually sourced deal/clearance value.
- **newArrival** (internal): `null` — store-operational; not stated by the manufacturer.
- **deviceType** (marketing-fact): `dac` — "MOONDROP DAWN PRO 2 USB DAC/AMP" and Apos describes it as a "portable DAC/amp"; maps to `dac`.
- **deviceConnectivity** (marketing-fact): `wired` — "USB DAC/AMP" and no Bluetooth/Wi-Fi mentioned; package includes USB-C cable.
- **amplification** (marketing-fact): `null` — `deviceType` is `dac`; field is domain-gated to amplifier/receiver categories.
- **powerOutputPerChannelW** (hard-spec): `null` — domain-gated to amplifier/receiver categories; the published 124mW headphone output is not per-channel amplifier power.
- **channelCount** (marketing-fact): `null` — domain-gated to amplifier/receiver categories.
- **inputs** (marketing-fact): `["usb"]` — Linsoul lists "Packaged with USB-C to USB-C cable" and Apos lists "Interchangeable USB-C cable design"; the product is a USB DAC, so `usb`.
- **outputs** (marketing-fact): `null` — domain-gated to amplifier/receiver categories; the product has 3.5mm/4.4mm headphone jacks, but the `outputs` facet is for amplifier output types.
- **phonoStageBuiltIn** (marketing-fact): `null` — domain-gated to amplifier/receiver categories.
- **trigger12v** (marketing-fact): `null` — domain-gated to amplifier/receiver categories.
- **remoteControlIncluded** (marketing-fact): `null` — domain-gated to amplifier/receiver categories.
- **maxSampleRateBitDepth** (hard-spec): `"16-bit/44.1kHz – 32-bit/384kHz"` — Linsoul: "supports lossless decoding from 16-bit/44.1kHz PCM up to 32-bit/384kHz PCM"; Apos specs: "Supported formats: PCM 16–32bit / 44.1–384kHz".
- **dsdSupport** (hard-spec): `"dsd256-plus"` — Linsoul and Apos both state "DSD256"; the schema's top bucket is `dsd256-plus` (DSD256+).
- **hiResCertification** (marketing-fact): `null` — no explicit "Hi-Res Audio" certification or MQA logo/statement found.
- **dacChipsetFamily** (hard-spec): `["cirrus-logic"]` — Linsoul: "Dual Cirrus Logic CS43198"; Apos: "Dual Cirrus Logic CS43198 DAC chips".
- **streamingPlatformSupport** (marketing-fact): `null` — no streaming platform support mentioned; wired USB DAC. The "2nd-generation online interactive DSP" is EQ/DSP via app/web over USB, not a streaming platform.
- **networkConnection** (marketing-fact): `null` — no Wi-Fi/Ethernet mentioned; wired USB DAC.
- **driveType**, **turntableOperation**, **speedsSupported**, **phonoPreampBuiltIn**, **cartridgeIncluded**, **usbDigitalOutput** (various): `null` — domain-gated to `turntable`; this is a `dac`.
- **bluetoothCodecs** (marketing-fact): `null` — `deviceConnectivity` is `wired`; no Bluetooth.
- **voiceAssistant** (marketing-fact): `null` — `deviceConnectivity` is `wired`; field is domain-gated to Bluetooth/Wi-Fi/wired-wireless.
- **multiroomSupport** (marketing-fact): `null` — `deviceConnectivity` is `wired`; field is domain-gated to Bluetooth/Wi-Fi/wired-wireless.
- **finishColor** (marketing-fact): `["Silver"]` — Marlim Gear table lists "Color | Silver"; corroborated by Apos/DrHead product titles which include "Silver".
- **rackMountable19** (marketing-fact): `false` — Apos describes it as "compact and pocket-ready" (1.67 × 0.91 × 0.45in / 42.5 × 23.2 × 11.4mm); no 19" rack-mounting mentioned.
- **countryOfManufacture** (marketing-fact): `null` — no explicit "Country of origin" / "Made in" statement found. Apos states "Designed and developed by Moondrop in Chengdu", which refers to design/development, not manufacturing.

## Conflict / Caution Notes

- **DSD support vs. manufacturer page:** The Dawn Pro 2 manufacturer product page does not list DSD support. Linsoul and Apos both state "DSD256", so the value is sourced from Tier-2 retailers and recorded as `dsd256-plus`.
- The DrHead live page for this product did not surface the characteristics table visible in some search-engine caches; color was instead confirmed from Marlim Gear's "Color | Silver" table.