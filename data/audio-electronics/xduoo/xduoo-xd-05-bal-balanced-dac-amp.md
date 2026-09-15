---
product_id: "DZc43yHr6ydfgE7zB46Kfr"
product_slug: "xduoo-xd-05-bal-balanced-dac-amp"
brand: "xDuoo"
name: "xDuoo XD-05 BAL Balanced DAC/Amp"
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
  formFactor: "portable"
  amplification: null
  dacIncluded: true
  balancedOutput: true
  powerOutputPerChannelW: null
  channelCount: null
  phonoStageBuiltIn: null
  trigger12v: null
  remoteControlIncluded: null
  inputs:
    - "rca"
    - "usb"
    - "optical"
    - "coaxial"
    - "aes-ebu"
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
    min: 429
    max: 429
    currency: "USD"
source_urls:
  - "http://www.xduoo.com/product/xd-05-bal/"
  - "https://apos.audio/products/xd-05-bal-balanced-dac-amp"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **deviceType** (marketing-fact): `dac` — Apos titles the product "xDuoo XD-05 BAL Balanced DAC/Amp" and it is positioned as a portable DAC/amp.
- **deviceConnectivity** (marketing-fact): `wired-wireless` — Apos lists Bluetooth input.
- **formFactor** (marketing-fact): `portable` — Apos and xDuoo describe a battery-powered portable unit.
- **dacIncluded** (marketing-fact): `true` — product is a DAC/amp.
- **balancedOutput** (marketing-fact): `true` — product name and Apos list a 4.4mm balanced output.
- **inputs** (hard-spec): `["rca", "usb", "optical", "coaxial", "aes-ebu"]` — Apos detailed specs list "RCA, USB, Optical, Coaxial, AES" as inputs; Bluetooth is listed separately.
- **maxSampleRateBitDepth** (hard-spec): `32-bit/768kHz` — Apos: "PCM 16-32Bit/44.1-768kHz".
- **dsdSupport** (hard-spec): `dsd256-plus` — Apos: "DSD64-512".
- **dacChipsetFamily** (marketing-fact): `["ess-sabre"]` — Apos: "Dual ESS ES9038Q2M DAC chips".
- **bluetoothCodecs** (hard-spec): `["SBC", "AAC", "aptX", "aptX HD", "aptX LL", "LDAC"]` — Apos codec list.
- **hiResCertification** (marketing-fact): `[]` — no MQA or Hi-Res Audio certification found in the consulted sources.
- **price** (internal): `{min: 429, max: 429, currency: "USD"}` — live Sanity product record for this issue lists $429.00.
- **rackMountable19** (marketing-fact): `false` — portable device, no rack-mount feature mentioned.

## Conflict / Caution Notes

- Bluetooth version: Apos product highlights say "Bluetooth 5.0", while the detailed specs heading says "Bluetooth 5.1". The `deviceConnectivity` field does not encode a version, so this conflict is recorded rather than resolved.
- Input count: Apos product highlights say "four inputs (optical, coaxial, RCA, USB)", while the detailed specs table adds AES and Bluetooth. The `inputs` field uses the more detailed source and lists all five physical digital inputs plus Bluetooth; the conflict is recorded.
