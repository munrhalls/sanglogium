---
product_id: "Pn6oyV4Ks5AcNbecjh3AqB"
product_slug: "feliks-audio-envy-flagship-desktop-headphone-tube-amplifier"
brand: "Feliks Audio"
name: "Feliks Audio Envy Flagship Desktop Headphone Tube Amplifier"
slice: "audio-electronics"
price: 889900
spec_fields:
  brand: ["feliks-audio"]
  customerRating: null
  condition: "new"
  inStock: false
  dealsDiscount: "none"
  newArrival: false
  awards: null
  deviceType: null
  deviceConnectivity: "wired"
  formFactor: "desktop"
  dacIncluded: false
  balancedOutput: true
  amplification: "tube"
  powerOutputPerChannelW: null
  channelCount: null
  inputs: ["rca", "xlr"]
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
  finishColor: ["oak", "american walnut", "custom", "amazaque", "merbau", "sapele mahogany", "zebrano"]
  rackMountable19: false
  countryOfManufacture: "Poland"
source_urls:
  - "https://feliksaudio.pl/product/envy/"
  - "https://headphones.com/products/feliks-audio-envy-flagship-desktop-headphone-tube-amplifier"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **price** (hard-spec): `$8,899.00` — headphones.com lists regular price `$8,899.00`.
- **condition** (marketing-fact): `new` — headphones.com product listing; this is the standard, not open-box, model.
- **inStock** (marketing-fact): `false` — headphones.com listing says "Pre-pay to reserve", not currently shipping.
- **dealsDiscount** (marketing-fact): `none` — headphones.com shows no discount; only the standard price of `$8,899.00`.
- **deviceType** (marketing-fact): `null` — Feliks Audio describes it as a "Class A single-ended transformer-coupled balanced headphone amplifier"; the audio-electronics Product Category list has no headphone-amplifier value.
- **deviceConnectivity** (marketing-fact): `wired` — no Bluetooth, streaming, or network inputs; only RCA/XLR and headphone outputs.
- **formFactor** (marketing-fact): `desktop` — Feliks product page dimensions `35 x 33 x 18.5 cm` and weight `15.1 kg`; it is a desktop component.
- **amplification** (hard-spec): `tube` — Feliks product page: Class A, single-ended, transformer-coupled, 300B power tubes, PsVane CV-181 mk2 driver tubes.
- **inputs** (hard-spec): `["rca", "xlr"]` — Feliks product page: "2 unbalanced RCA inputs", "1 balanced XLR input".
- **outputs** (hard-spec): `["headphone-jack", "pre-out"]` — Feliks product page: headphone outputs 6.3mm and XLR; "RCA preamp output pair" and "XLR preamp output pair".
- **balancedOutput** (hard-spec): `true` — Feliks product page lists balanced XLR input and XLR headphone output.
- **finishColor** (hard-spec): `["oak", "american walnut", "custom", "amazaque", "merbau", "sapele mahogany", "zebrano"]` — Feliks product page "Additional information" lists these wood-finish options.
- **countryOfManufacture** (hard-spec): `Poland` — Feliks Audio product page states "handcrafted in Poland".
- **powerOutputPerChannelW** (hard-spec): `null` — source quotes "up to 8 Watts" into a 16 Ω load at THD >5%, which is not a standard per-channel W RMS rating; the field is not applicable to this headphone amplifier.

## Conflict / Caution Notes

- **Product category mismatch:** The manufacturer identifies the Envy as a headphone amplifier. `should-be-audio-electronics.md` Product Category has no "headphone amplifier" value, so `deviceType` is `null` with a category-gap note.
- **Power-output field:** The 8W figure is a maximum into a low-impedance headphone load, not a per-channel W RMS speaker rating, so `powerOutputPerChannelW` is `null`.
