---
product_id: "moXlkADK7m1DHgGwWwEeK6"
product_slug: "feliks-audio-envy-flagship-desktop-headphone-tube-amplifier---open-box"
brand: "Feliks Audio"
name: "Feliks Audio Envy Flagship Desktop Headphone Tube Amplifier - Open Box"
slice: "audio-electronics"
price: 689500
spec_fields:
  brand: ["feliks-audio"]
  customerRating: null
  condition: "open-box"
  inStock: false
  dealsDiscount: "on-sale"
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
  - "https://headphones.com/products/feliks-audio-envy-flagship-desktop-headphone-tube-amplifier-open-box"
  - "https://feliksaudio.pl/product/envy/"
  - "https://headphones.com/products/feliks-audio-envy-flagship-desktop-headphone-tube-amplifier"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **price** (hard-spec): `$6,895.00` — headphones.com open-box listing shows `$6,895.00`; regular price crossed out at `$7,995.00`.
- **condition** (marketing-fact): `open-box` — headphones.com product title explicitly includes "- Open Box".
- **inStock** (marketing-fact): `false` — headphones.com open-box listing says "Sold out".
- **dealsDiscount** (marketing-fact): `on-sale` — headphones.com shows open-box price `$6,895.00` reduced from `$7,995.00`.
- **deviceType** (marketing-fact): `null` — the Envy is a headphone amplifier; `should-be-audio-electronics.md` Product Category has no "headphone amplifier" value.
- **deviceConnectivity** (marketing-fact): `wired` — only RCA/XLR inputs and RCA/XLR plus 6.3mm/XLR outputs; no Bluetooth or network.
- **formFactor** (marketing-fact): `desktop` — same desktop component as the standard Envy; dimensions `35 x 33 x 18.5 cm` and weight `15.1 kg` from Feliks product page.
- **amplification** (hard-spec): `tube` — Feliks product page: Class A, single-ended, transformer-coupled, 300B power tubes, PsVane CV-181 mk2 driver tubes.
- **inputs** (hard-spec): `["rca", "xlr"]` — Feliks product page: 2 unbalanced RCA inputs and 1 balanced XLR input.
- **outputs** (hard-spec): `["headphone-jack", "pre-out"]` — Feliks product page: 6.3mm and XLR headphone outputs plus RCA and XLR pre-out pairs.
- **balancedOutput** (hard-spec): `true` — Feliks product page lists balanced XLR input and XLR headphone output.
- **finishColor** (hard-spec): `["oak", "american walnut", "custom", "amazaque", "merbau", "sapele mahogany", "zebrano"]` — Feliks product page "Additional information" lists these wood-finish options for the Envy.
- **countryOfManufacture** (hard-spec): `Poland` — Feliks Audio product page states "handcrafted in Poland".
- **powerOutputPerChannelW** (hard-spec): `null` — source quotes up to 8W into a 16 Ω load, not a standard per-channel W RMS rating.

## Conflict / Caution Notes

- **Open-box source split:** Technical specifications are sourced from the standard Envy manufacturer and retailer pages; the open-box listing itself confirms condition, price, sold-out status, and discount.
- **Product category mismatch:** The manufacturer identifies the Envy as a headphone amplifier. `should-be-audio-electronics.md` Product Category has no "headphone amplifier" value, so `deviceType` is `null`.
- **Power-output field:** The 8W figure is a maximum into a low-impedance headphone load, not a per-channel W RMS speaker rating, so `powerOutputPerChannelW` is `null`.
