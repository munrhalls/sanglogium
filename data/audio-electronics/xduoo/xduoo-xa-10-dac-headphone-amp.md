---
product_id: "xMEqvkRBbdrlJXyFG8gbWv"
product_slug: "xduoo-xa-10-dac-headphone-amp"
brand: "xDuoo"
name: "xDuoo XA-10 DAC/Headphone Amp"
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
    - "optical"
    - "coaxial"
    - "bluetooth"
  outputs: null
  maxSampleRateBitDepth: "32-bit/768kHz"
  dsdSupport: "dsd256-plus"
  hiResCertification:
    - "mqa"
  dacChipsetFamily:
    - "akm"
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
    min: 479
    max: 479
    currency: "USD"
source_urls:
  - "https://xduoo.net/product/xa-10/"
  - "https://apos.audio/products/xduoo-xa-10-dac-headphone-amp"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **deviceType** (marketing-fact): `dac` — xDuoo and Apos title the product "XA-10 DAC/Headphone Amp".
- **deviceConnectivity** (marketing-fact): `wired-wireless` — xDuoo lists Bluetooth and wired inputs.
- **formFactor** (marketing-fact): `desktop` — xDuoo lists dimensions 22 x 7 x 10 cm and weight 0.9 kg.
- **dacIncluded** (marketing-fact): `true` — product is a DAC/amp.
- **balancedOutput** (marketing-fact): `true` — xDuoo lists a 4.4mm balanced headphone output and Apos describes a fully balanced circuit.
- **inputs** (hard-spec): `["usb", "optical", "coaxial", "bluetooth"]` — xDuoo: "USB, optical, coaxial and Bluetooth inputs". Apos also lists an RCA AUX IN, which conflicts with the manufacturer page; the manufacturer page is used for this field and the conflict is recorded.
- **maxSampleRateBitDepth** (hard-spec): `32-bit/768kHz` — Apos: "PCM 16-32Bit/44.1-768kHz" and xDuoo lists "PCM 768kHz".
- **dsdSupport** (hard-spec): `dsd256-plus` — Apos: "DSD64-512".
- **hiResCertification** (marketing-fact): `["mqa"]` — Apos lists "Full MQA Decoder".
- **dacChipsetFamily** (marketing-fact): `["akm"]` — Apos and xDuoo list dual AK4493 DACs.
- **bluetoothCodecs** (hard-spec): `["SBC", "AAC", "aptX", "aptX HD", "aptX LL", "LDAC"]` — Apos codec list.
- **price** (internal): `{min: 479, max: 479, currency: "USD"}` — live Sanity product record for this issue lists $479.00.
- **rackMountable19** (marketing-fact): `false` — no 19" rack-mount feature mentioned.

## Conflict / Caution Notes

- Apos lists an RCA AUX IN in addition to the USB/optical/coaxial/Bluetooth inputs given by xDuoo. The `inputs` field uses the manufacturer source and records the conflict.
- Apos lists output power up to 4000mW; the `powerOutputPerChannelW` field is domain-gated to amplifier `deviceType` values and the source uses milliwatts, so it is recorded as `null`.
