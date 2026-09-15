---
product_id: "DZc43yHr6ydfgE7zB42wTA"
product_slug: "xduoo-mt-604-balanced-tube-headphone-amplifier"
brand: "xDuoo"
name: "xDuoo MT-604 Balanced Tube Headphone Amplifier"
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
  balancedOutput: true
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
    min: 169
    max: 169
    currency: "USD"
source_urls:
  - "https://xduoo.net/product/mt-604/"
  - "https://apos.audio/products/xduoo-mt604-balanced-tube-headphone-amplifier"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **deviceType** (marketing-fact): `null` — Apos titles the product "xDuoo MT-604 Balanced Tube Headphone Amplifier" and xDuoo describes it as a "fully balanced Class A tube amp"; headphone amplifier is not in the `deviceType` enum.
- **deviceConnectivity** (marketing-fact): `wired` — Apos lists balanced XLR and 4.4mm inputs/outputs; no wireless is mentioned.
- **formFactor** (marketing-fact): `desktop` — xDuoo/Apos list desktop dimensions and a mains-powered chassis.
- **dacIncluded** (marketing-fact): `false` — pure analog tube headphone amplifier, no DAC or digital inputs.
- **balancedOutput** (marketing-fact): `true` — Apos and xDuoo list balanced XLR and 4.4mm input/output.
- **price** (internal): `{min: 169, max: 169, currency: "USD"}` — live Sanity product record for this issue lists $169.00.
- **rackMountable19** (marketing-fact): `false` — no 19" rack-mount feature mentioned.
- Schema-gated amplifier/source fields (amplification, inputs, outputs, powerOutputPerChannelW, channelCount, phonoStageBuiltIn, trigger12v, remoteControlIncluded) are `null` because `deviceType` is `null`.

## Conflict / Caution Notes

- Apos lists four 6J1 tubes, 2000mW output at 32 Ohm, 16-600 Ohm headphone impedance range, and dimensions 17 x 10 x 6 cm / 0.55 kg. These are preserved for the schema patch phase because the relevant fields are domain-gated.
