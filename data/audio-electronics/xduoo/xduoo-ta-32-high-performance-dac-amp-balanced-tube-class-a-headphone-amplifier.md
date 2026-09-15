---
product_id: "GPjMdcfFWZVrKyR2PB7GdO"
product_slug: "xduoo-ta-32-high-performance-dac-amp-balanced-tube-class-a-headphone-amplifier"
brand: "xDuoo"
name: "xDuoo TA-32 High-performance DAC & Balanced Tube Class-A Headphone Amplifier"
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
    - "aes-ebu"
    - "bluetooth"
    - "rca"
    - "xlr-balanced"
  outputs: null
  maxSampleRateBitDepth: "32-bit/768kHz"
  dsdSupport: "dsd256-plus"
  hiResCertification:
    - "mqa"
  dacChipsetFamily: null
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
    min: 999
    max: 999
    currency: "USD"
source_urls:
  - "https://xduoo.net/product/ta-32/"
  - "https://apos.audio/products/xduoo-ta-32-high-performance-dac-balanced-tube-class-a-headphone-amplifier"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **deviceType** (marketing-fact): `dac` — xDuoo titles the product "TA-32 High-performance DAC & Balanced Tube Class-A Headphone Amplifier" and positions it as a DAC/amp.
- **deviceConnectivity** (marketing-fact): `wired-wireless` — xDuoo lists Bluetooth and multiple wired inputs.
- **formFactor** (marketing-fact): `desktop` — xDuoo lists dimensions 31.0 x 24.2 x 17.4 cm and weight 5.2 kg.
- **dacIncluded** (marketing-fact): `true` — product is a DAC/amp with a replaceable DAC module.
- **balancedOutput** (marketing-fact): `true` — xDuoo lists 6.35mm single-ended, 4.4mm balanced, and 4-pin XLR balanced outputs.
- **inputs** (hard-spec): `["usb", "coaxial", "optical", "aes-ebu", "bluetooth", "rca", "xlr-balanced"]` — xDuoo: "USB, coaxial, optical, AES, Bluetooth, RCA AUX IN, XLR balanced input".
- **maxSampleRateBitDepth** (hard-spec): `32-bit/768kHz` — xDuoo: "PCM 32-bit/768kHz".
- **dsdSupport** (hard-spec): `dsd256-plus` — xDuoo: "DSD512".
- **hiResCertification** (marketing-fact): `["mqa"]` — xDuoo lists MQA support.
- **dacChipsetFamily** (marketing-fact): `null` — the stock replaceable DAC module is a ROHM BD34301EKV, which is not in the `dacChipsetFamily` enum (ESS Sabre, AKM, Cirrus Logic, R-2R/Ladder). Apos notes optional ESS and AKM modules.
- **bluetoothCodecs** (hard-spec): `["SBC", "AAC", "aptX", "aptX HD", "aptX LL", "LDAC"]` — Apos codec list.
- **price** (internal): `{min: 999, max: 999, currency: "USD"}` — live Sanity product record for this issue lists $999.00.
- **rackMountable19** (marketing-fact): `false` — desktop unit with no 19" rack-mount feature mentioned.

## Conflict / Caution Notes

- The source describes a Class A transistor buffer, but `amplification` is domain-gated to amplifier `deviceType` values and is recorded as `null`.
