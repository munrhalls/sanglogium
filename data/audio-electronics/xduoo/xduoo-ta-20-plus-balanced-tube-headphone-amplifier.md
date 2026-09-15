---
product_id: "DZc43yHr6ydfgE7zB42uia"
product_slug: "xduoo-ta-20-plus-balanced-tube-headphone-amplifier"
brand: "xDuoo"
name: "xDuoo TA-20 Plus Balanced Tube Headphone Amplifier"
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
    min: 499
    max: 499
    currency: "USD"
source_urls:
  - "https://xduoo.net/product/xduoo-ta-20-plus/"
  - "https://apos.audio/products/xduoo-ta-20-plus-tube-amp"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **deviceType** (marketing-fact): `null` — xDuoo identifies the product as a "Desktop Tube Headphone Amplifier" and Apos as a "Fully Balanced Tube Headphone Amplifier"; this category is not in the current `deviceType` enum.
- **deviceConnectivity** (marketing-fact): `wired` — xDuoo lists XLR and RCA analog inputs; no Bluetooth or network input is mentioned.
- **formFactor** (marketing-fact): `desktop` — xDuoo describes a mains-powered desktop chassis.
- **dacIncluded** (marketing-fact): `false` — product is a pure analog headphone amplifier; no DAC or digital input is mentioned.
- **balancedOutput** (marketing-fact): `true` — xDuoo key feature lists "XLR + 4.4mm Balanced Input and Output".
- **price** (internal): `{min: 499, max: 499, currency: "USD"}` — live Sanity product record for this issue lists $499.00.
- **rackMountable19** (marketing-fact): `false` — desktop unit with no 19" rack-mount feature mentioned.
- **amplification**, **inputs**, **outputs**, **powerOutputPerChannelW**, **channelCount**, **phonoStageBuiltIn**, **trigger12v**, **remoteControlIncluded** (hard-spec): `null` — these fields are domain-gated to the five amplifier `deviceType` values in `productType.ts`. Because this is a headphone amplifier and `deviceType` is `null`, the fields are not recorded here.

## Conflict / Caution Notes

- The manufacturer source lists XLR and RCA inputs, 6.35mm/4.4mm/4-pin XLR outputs, 2000mW output at 32 Ohm, and a Class A tube + transistor architecture. These facts cannot be recorded in the schema-gated fields above because `deviceType` is `null`, and `powerOutputPerChannelW` requires a value in watts while the source gives milliwatts. They are preserved here for a later schema/CMS patch phase.
