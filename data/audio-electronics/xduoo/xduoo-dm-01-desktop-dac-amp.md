---
product_id: "DZc43yHr6ydfgE7zB41oi2"
product_slug: "xduoo-dm-01-desktop-dac-amp"
brand: "xDuoo"
name: "xDuoo DM-01 Desktop DAC/Amp"
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
    - "bluetooth"
  outputs: null
  maxSampleRateBitDepth: "32-bit/384kHz"
  dsdSupport: "dsd256-plus"
  hiResCertification:
    - "mqa"
  dacChipsetFamily:
    - "cirrus-logic"
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
    - "aptX Adaptive"
    - "LDAC"
    - "LC3"
  finishColor: null
  rackMountable19: false
  countryOfManufacture: null
  price:
    min: 279
    max: 279
    currency: "USD"
source_urls:
  - "https://xduoo.net/product/xduoo-dm-01/"
  - "https://apos.audio/products/xduoo-dm-01-desktop-dac-amp"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **deviceType** (marketing-fact): `dac` — xDuoo product page titles the device "DM-01 Desktop DAC/Amp" and describes a "compact desktop tube DAC and headphone amplifier".
- **deviceConnectivity** (marketing-fact): `wired-wireless` — xDuoo lists "USB audio" and "Bluetooth 5.4" inputs.
- **formFactor** (marketing-fact): `desktop` — xDuoo describes a desktop unit with dimensions 17.5 x 8.6 x 6.0 cm and weight 0.73 kg.
- **dacIncluded** (marketing-fact): `true` — product is explicitly a DAC/amp.
- **balancedOutput** (marketing-fact): `false` — xDuoo and Apos list headphone and line outputs but no balanced (XLR/4.4mm) output.
- **inputs** (hard-spec): `["usb", "bluetooth"]` — xDuoo product page: "Input Interface: USB audio and Bluetooth 5.4".
- **maxSampleRateBitDepth** (hard-spec): `32-bit/384kHz` — Apos tech specs: "PCM 16-32Bit/44.1-384kHz".
- **dsdSupport** (hard-spec): `dsd256-plus` — Apos: "DSD64-256".
- **hiResCertification** (marketing-fact): `["mqa"]` — Apos lists "MQA 8X".
- **dacChipsetFamily** (marketing-fact): `["cirrus-logic"]` — Apos and xDuoo list the CS43131 DAC chip.
- **bluetoothCodecs** (hard-spec): `["SBC", "AAC", "aptX", "aptX HD", "aptX Adaptive", "LDAC", "LC3"]` — Apos lists SBC, AAC, aptX, aptX HD, aptX Adaptive, LDAC, and LE Audio; the LE Audio codec is recorded as the schema value `LC3`.
- **price** (internal): `{min: 279, max: 279, currency: "USD"}` — live Sanity product record for this issue lists $279.00.
- **rackMountable19** (marketing-fact): `false` — desktop chassis with no 19" rack-mount feature mentioned.

## Conflict / Caution Notes

- The source mentions a Class A amplifier architecture, but `amplification` is domain-gated to amplifier `deviceType` values in `productType.ts`; because `deviceType` is `dac`, the field is recorded as `null`.
