---
product_id: "GPjMdcfFWZVrKyR2PB76mM"
product_slug: "xduoo-ta-22-dac-tube-amp"
brand: "xDuoo"
name: "xDuoo TA-22 DAC/Tube Amp"
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
  balancedOutput: true
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
  maxSampleRateBitDepth: "32-bit/384kHz"
  dsdSupport: "dsd256-plus"
  hiResCertification:
    - "mqa"
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
    min: 489
    max: 489
    currency: "USD"
source_urls:
  - "https://xduoo.net/product/xduoo-ta-22/"
  - "https://apos.audio/products/apos-certified-xduoo-ta-22-dac-tube-amp"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **deviceType** (marketing-fact): `dac` — xDuoo and Apos title the product "TA-22 DAC/Tube Amp".
- **deviceConnectivity** (marketing-fact): `wired-wireless` — xDuoo lists Bluetooth 5.1 and multiple wired inputs.
- **formFactor** (marketing-fact): `desktop` — xDuoo describes a desktop chassis with weight 3 kg.
- **dacIncluded** (marketing-fact): `true` — product is a DAC/amp.
- **balancedOutput** (marketing-fact): `true` — Apos lists 4-pin XLR and 4.4mm balanced outputs.
- **inputs** (hard-spec): `["usb", "coaxial", "optical", "bluetooth", "rca"]` — xDuoo: "USB, coaxial, optical, Bluetooth and analog inputs"; analog input is mapped to `rca`.
- **maxSampleRateBitDepth** (hard-spec): `32-bit/384kHz` — xDuoo and Apos list PCM up to 32-bit/384kHz.
- **dsdSupport** (hard-spec): `dsd256-plus` — xDuoo and Apos list DSD64-DSD256.
- **hiResCertification** (marketing-fact): `["mqa"]` — Apos lists "MQA renderer" and xDuoo mentions MQA support.
- **dacChipsetFamily** (marketing-fact): `["ess-sabre"]` — xDuoo and Apos list dual ES9038Q2M DACs.
- **bluetoothCodecs** (hard-spec): `["SBC", "AAC", "aptX", "aptX HD", "aptX LL", "LDAC"]` — Apos codec list.
- **price** (internal): `{min: 489, max: 489, currency: "USD"}` — live Sanity product record for this issue lists $489.00.
- **rackMountable19** (marketing-fact): `false` — no 19" rack-mount feature mentioned.

## Conflict / Caution Notes

- The source describes a Class A transistor buffer, but `amplification` is domain-gated to amplifier `deviceType` values and is recorded as `null`.
