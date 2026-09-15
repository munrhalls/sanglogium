---
product_id: "Pn6oyV4Ks5AcNbecjh34kd"
product_slug: "feliks-audio-echo-classic"
brand: "Feliks Audio"
name: "Feliks Audio Echo Classic"
slice: "audio-electronics"
price: 94900
spec_fields:
  brand: ["feliks-audio"]
  customerRating: null
  condition: "new"
  inStock: false
  dealsDiscount: "on-sale"
  newArrival: false
  awards: null
  deviceType: null
  deviceConnectivity: "wired"
  formFactor: "desktop"
  dacIncluded: false
  balancedOutput: false
  amplification: "tube"
  powerOutputPerChannelW: null
  channelCount: null
  inputs: ["rca"]
  outputs: ["headphone-jack", "pre-out"]
  phonoStageBuiltIn: false
  trigger12v: false
  remoteControlIncluded: false
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
  bluetoothCodecs: null
  voiceAssistant: null
  multiroomSupport: false
  finishColor: null
  rackMountable19: false
  countryOfManufacture: "Poland"
source_urls:
  - "https://feliksaudio.pl/product/echo-classic/"
  - "https://headphones.com/products/feliks-audio-echo-mk-ii"
  - "https://www.audioemotion.co.uk/feliks-audio-echo-classic-headphone-amplifier-50097-p.asp"
  - "https://expert-hifi.com/en/feliks-audio-amplifiers/272-feliks-audio-echo-classic-tube-headphone-amplifier-class-a.html"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **price** (hard-spec): `$949.00` — headphones.com lists regular price `$949`, sale price `$949`, was `$1,099.00`, save 14%.
- **condition** (marketing-fact): `new` — Audio Emotion product page lists Condition: New.
- **inStock** (marketing-fact): `false` — headphones.com lists "Back-order" / "Pre-pay to reserve"; Audio Emotion does not confirm in-stock for this exact listing.
- **dealsDiscount** (marketing-fact): `on-sale` — headphones.com shows "Save 14%" and a struck-through `$1,099.00` regular price.
- **deviceType** (marketing-fact): `null` — Feliks Audio calls it an "OTL tube headphone amplifier/preamplifier"; `should-be-audio-electronics.md` Product Category has no "headphone amplifier" value, so this is a category gap.
- **deviceConnectivity** (marketing-fact): `wired` — only RCA input, RCA pre-out and 6.3mm headphone output are listed; no Bluetooth or network.
- **formFactor** (marketing-fact): `desktop` — headphones.com "Portability" field says "Not Portable"; it is a desktop tube amplifier.
- **amplification** (marketing-fact): `tube` — Feliks Audio product page: "tube audio" / "tubes"; expert-hifi: "Tube headphone amplifier, Class-A".
- **inputs** (hard-spec): `["rca"]` — expert-hifi: "RCA input/output + 6.35mm jack"; Audio Emotion calls it a "preamplifier" with one input path.
- **outputs** (hard-spec): `["headphone-jack", "pre-out"]` — expert-hifi lists 6.35mm jack and RCA output; Feliks product page: "Headphones output: Jack 6.3mm"; pre-out is inferred from the "preamp" use case and explicit RCA output.
- **countryOfManufacture** (hard-spec): `Poland` — Feliks Audio product page: "handcrafted in Poland"; Audio Emotion "About the brand": "assembled at our site in Lubliniec (Poland)".
- **finishColor** (hard-spec): `null` — Audio Emotion says "Wooden, engraved walnut side panels"; other opened sources only say "wood" or "black and wood" with no consistent color/finish; the Feliks product page lists no color options.
- **powerOutputPerChannelW** (hard-spec): `null` — source quotes 350mW headphone output power, not a per-channel W RMS speaker rating.

## Conflict / Caution Notes

- **Product category mismatch:** The source describes an OTL tube headphone amplifier/preamplifier. `should-be-audio-electronics.md` Product Category does not include "headphone amplifier", so `deviceType` is `null` and flagged as a category gap.
- **Power-output field:** The technical spec lists 350mW at the headphone output. The `powerOutputPerChannelW` field is defined for speaker-amplifier W RMS, so it is left `null`.
