---
product_id: "xMEqvkRBbdrlJXyFG8hoYl"
product_slug: "xduoo-ta-30"
brand: "xDuoo"
name: "xDuoo TA-30"
slice: "audio-electronics"
spec_fields:
  customerRating: null
  awards: null
  condition: null
  inStock: null
  dealsDiscount: null
  newArrival: null
  deviceType: "dac"
  deviceConnectivity: "wired-wireless"
  formFactor: "desktop"
  amplification: null
  dacIncluded: true
  balancedOutput: false
  powerOutputPerChannelW: null
  channelCount: null
  phonoStageBuiltIn: null
  trigger12v: null
  remoteControlIncluded: null
  inputs:
    - "usb"
    - "coaxial"
    - "optical"
    - "bluetooth"
    - "rca"
  outputs: null
  maxSampleRateBitDepth: "32-bit/768kHz"
  dsdSupport: "dsd256-plus"
  hiResCertification: []
  dacChipsetFamily:
    - "ess-sabre"
  streamingPlatformSupport: []
  networkConnection: null
  driveType: null
  turntableOperation: null
  speedsSupported: null
  phonoPreampBuiltIn: null
  cartridgeIncluded: null
  usbDigitalOutput: null
  voiceAssistant: []
  multiroomSupport: null
  bluetoothCodecs:
    - "SBC"
    - "AAC"
    - "aptX"
    - "aptX HD"
    - "aptX LL"
    - "LDAC"
  finishColor: null
  rackMountable19: false
  countryOfManufacture: null
  price:
    min: 709
    max: 709
    currency: "USD"
source_urls:
  - "https://xduoo.net/product/ta-30/"
  - "https://apos.audio/products/xduoo-ta-30-tube-headphone-amp"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **deviceType** (marketing-fact): `dac` — xDuoo titles the product "TA-30 Tube DAC/Amp" and it has digital inputs.
- **deviceConnectivity** (marketing-fact): `wired-wireless` — xDuoo lists Bluetooth 5.0 and multiple wired inputs.
- **formFactor** (marketing-fact): `desktop` — xDuoo lists dimensions 29 x 11 x 17 cm and weight 3.0 kg.
- **dacIncluded** (marketing-fact): `true` — product is a tube DAC/amp.
- **balancedOutput** (marketing-fact): `false` — xDuoo page states "single-ended headphone output"; no balanced XLR or 4.4mm output is listed.
- **inputs** (hard-spec): `["usb", "coaxial", "optical", "bluetooth", "rca"]` — xDuoo: "USB, coaxial, optical, Bluetooth, RCA AUX IN".
- **maxSampleRateBitDepth** (hard-spec): `32-bit/768kHz` — xDuoo lists "PCM 768kHz" and Apos: "16-32bit/44.1-768kHz".
- **dsdSupport** (hard-spec): `dsd256-plus` — xDuoo: "DSD64-DSD512".
- **dacChipsetFamily** (marketing-fact): `["ess-sabre"]` — xDuoo: "ES9038Q2M".
- **bluetoothCodecs** (hard-spec): `["SBC", "AAC", "aptX", "aptX HD", "aptX LL", "LDAC"]` — Apos codec list.
- **hiResCertification** (marketing-fact): `[]` — no MQA or Hi-Res Audio certification found.
- **price** (internal): `{min: 709, max: 709, currency: "USD"}` — live Sanity product record for this issue lists $709.00.
- **rackMountable19** (marketing-fact): `false` — no 19" rack-mount feature mentioned.

## Conflict / Caution Notes

- Apos lists "Bluetooth chip CSR8675" while xDuoo states "Bluetooth 5.0". The `deviceConnectivity` field captures that the product has Bluetooth; the exact chip/version conflict is recorded.
