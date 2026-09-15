---
product_id: "GPjMdcfFWZVrKyR2PB7D0Y"
product_slug: "xduoo-ta-66-otl-tube-amplifier"
brand: "xDuoo"
name: "xDuoo TA-66 OTL Tube Amplifier"
slice: "audio-electronics"
spec_fields:
  customerRating: null
  awards: null
  condition: null
  inStock: null
  dealsDiscount: null
  newArrival: null
  deviceType: null
  deviceConnectivity: "wired"
  formFactor: "desktop"
  amplification: null
  dacIncluded: false
  balancedOutput: false
  powerOutputPerChannelW: null
  channelCount: null
  phonoStageBuiltIn: null
  trigger12v: null
  remoteControlIncluded: null
  inputs: null
  outputs: null
  maxSampleRateBitDepth: null
  dsdSupport: null
  hiResCertification: null
  dacChipsetFamily: null
  streamingPlatformSupport: null
  networkConnection: null
  driveType: null
  turntableOperation: null
  speedsSupported: null
  phonoPreampBuiltIn: null
  cartridgeIncluded: null
  usbDigitalOutput: null
  voiceAssistant: null
  multiroomSupport: null
  bluetoothCodecs: null
  finishColor: null
  rackMountable19: false
  countryOfManufacture: null
  price:
    min: 249
    max: 249
    currency: "USD"
source_urls:
  - "https://xduoo.net/product/ta-66/"
  - "https://apos.audio/products/apos-certified-xduoo-ta-66-otl-tube-amplifier"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **deviceType** (marketing-fact): `null` — xDuoo and Apos identify the product as an "OTL Tube Amplifier" / headphone amplifier; this category is not in the `deviceType` enum.
- **deviceConnectivity** (marketing-fact): `wired` — Apos lists a 6.35mm headphone jack and AUX OUT; no Bluetooth or network input is mentioned.
- **formFactor** (marketing-fact): `desktop` — xDuoo lists dimensions 29 x 15.3 x 18.4 cm and weight 5.0 kg.
- **dacIncluded** (marketing-fact): `false` — product is a pure analog tube headphone amplifier; no DAC or digital inputs.
- **balancedOutput** (marketing-fact): `false` — Apos lists a single 6.35mm headphone jack; no balanced output is mentioned.
- **price** (internal): `{min: 249, max: 249, currency: "USD"}` — live Sanity product record for this issue lists $249.00.
- **rackMountable19** (marketing-fact): `false` — desktop chassis with no 19" rack-mount feature mentioned.
- Schema-gated amplifier/source fields are `null` because `deviceType` is `null`.

## Conflict / Caution Notes

- Apos provides detailed analog specs: 6N2 tube pre-stage, 6N5P tube current expansion, point-to-point wiring, 200mW at 300 Ohm, frequency range 10Hz-30kHz, +18dB gain, THD+N 0.08% at 1kHz/300 Ohm, SNR 107dB, and a 60-600 Ohm impedance range. These cannot be recorded in `amplification`, `powerOutputPerChannelW`, `inputs`, or `outputs` because the headphone-amplifier category is not in the `deviceType` enum.
