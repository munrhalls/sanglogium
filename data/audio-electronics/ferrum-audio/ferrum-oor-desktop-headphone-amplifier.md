---
product_id: "MrEMtYwMtrFDGWmRnRKsJY"
product_slug: "ferrum-oor-desktop-headphone-amplifier"
brand: "Ferrum Audio"
name: "Ferrum Oor Desktop Headphone Amplifier"
slice: "audio-electronics"
price: 227500
spec_fields:
  brand:
    - "ferrum-audio"
  customerRating: null
  condition: "new"
  inStock: null
  dealsDiscount: "none"
  newArrival: false
  awards:
    - "eisa-best-headphone-amplifier-2022-2023"
    - "headfonia-best-amplifier-2024-readers-choice"
  deviceType: null
  deviceConnectivity: "wired"
  formFactor: "desktop"
  dacIncluded: false
  balancedOutput: true
  amplification: null
  powerOutputPerChannelW: null
  channelCount: null
  inputs: null
  outputs: null
  phonoStageBuiltIn: null
  trigger12v: null
  remoteControlIncluded: null
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
  multiroomSupport: null
  finishColor:
    - "black"
    - "rust"
  rackMountable19: false
  countryOfManufacture: "Poland"
source_urls:
  - "https://ferrum.audio/oor/"
  - "https://ferrum.audio/wp-content/uploads/2022/03/White-paper-Ferrum-OOR.pdf"
  - "https://upscaleaudio.com/products/ferrum-oor-headphone-amplifier"
  - "https://headphones.com/products/ferrum-oor-desktop-headphone-amplifier"
  - "https://headphones.com/blogs/reviews/ferrum-oor-hypsos-review-and-measurements"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **price** (marketing-fact): `227500` cents ($2,275.00 USD) — both Upscale Audio ("Regular price $2,275") and Headphones.com ("Regular price $2,275") list the same price; matched to the catalogue price.
- **brand** (hard-spec): `["ferrum-audio"]` — the manufacturer product page lists "Ferrum" / "Ferrum Audio" and the product title is "OOR — headphone amplifier".
- **customerRating** (editorial): `null` — no public customer-review aggregate is displayed on the manufacturer page or on audited retailer listings.
- **condition** (marketing-fact): `"new"` — Upscale Audio and Headphones.com list regular-price product pages with no open-box, B-stock, refurbished, or used indication.
- **inStock** (marketing-fact): `null` — Upscale Audio lists "In stock now!" while Headphones.com lists the product as "Back-order" / "Join The Waitlist" (same-tier retailer conflict; see Conflict Notes).
- **dealsDiscount** (marketing-fact): `"none"` — both retailers show a single regular price with no sale, clearance, or discount callout.
- **newArrival** (marketing-fact): `false` — product page references the 2022–2023 EISA award and Headfonia 2024 award, with no "New Arrival" or launch callout.
- **awards** (editorial): `["eisa-best-headphone-amplifier-2022-2023", "headfonia-best-amplifier-2024-readers-choice"]` — Ferrum product page: "chosen by the honorable EISA members as best Headphone Amplifier of 2022-2023" and "Ferrum OOR has won Best Amplifier in the Headfonia 2024 Best Gear – Readers’ Choice Awards!"
- **deviceType** (marketing-fact): `null` — the manufacturer identifies the product as a "headphone amplifier" / "OOR fully Balanced analogue headphone amplifier". The `should-be-audio-electronics.md` product-category vocabulary does not include a headphone-amplifier value, so the field is recorded as `null` rather than force-fit into `integrated-amplifier`, `preamplifier`, or another category.
- **deviceConnectivity** (marketing-fact): `"wired"` — the product has XLR and RCA analog inputs and balanced 4-pin XLR / 6.35 mm headphone outputs. No Bluetooth, Wi-Fi, Ethernet, or other wireless connection is listed.
- **formFactor** (marketing-fact): `"desktop"` — the manufacturer product page lists dimensions of "8.6 x 8.1 x 2.0 inch / 21.7 x 20.6 x 5 cm" and the product is marketed as a desktop headphone amplifier.
- **dacIncluded** (marketing-fact): `false` — the product page states "100% analogue" and the white paper describes a fully analogue discrete amplifier; no DAC function is mentioned.
- **balancedOutput** (hard-spec): `true` — the product page states "Fully balanced from A to Z", has balanced XLR inputs and a balanced 4-pin XLR headphone output, and the white paper confirms a fully balanced signal path.
- **amplification**, **powerOutputPerChannelW**, **channelCount**, **inputs**, **outputs**, **phonoStageBuiltIn**, **trigger12v**, **remoteControlIncluded**: `null` — these fields are domain-gated in `sanity-cms/schemaTypes/productType.ts` to the five amplifier/receiver `deviceType` values. Because `deviceType` is `null`, the fields do not apply, even though the hardware is a discrete-transistor headphone amplifier with RCA/XLR inputs and headphone outputs.
- **maxSampleRateBitDepth**, **dsdSupport**, **hiResCertification**, **dacChipsetFamily**, **streamingPlatformSupport**, **networkConnection**: `null` — the product is an analogue headphone amplifier, not a DAC, network streamer, or CD player/transport; no digital-source fields apply.
- **driveType**, **turntableOperation**, **speedsSupported**, **phonoPreampBuiltIn**, **cartridgeIncluded**, **usbDigitalOutput**: `null` — the product is not a turntable.
- **bluetoothCodecs**, **voiceAssistant**, **multiroomSupport**: `null` — `deviceConnectivity` is `wired`; the wireless/connectivity group does not apply.
- **finishColor** (editorial): `["black", "rust"]` — Headphones.com review: "The chassis is the same matte black finish as the other Ferrum products, accented by the corten steel square and illuminated Ferrum logo" (discussing the Ferrum stack including OOR/HYPSOS); the review of OOR specifically says the logo square sports a "textured brown finish thanks to the corten steel".
- **rackMountable19** (marketing-fact): `false` — the product is marketed and dimensioned as a desktop unit; no 19" rack-mounting hardware or claim is found on the manufacturer page, white paper, or retailer listings.
- **countryOfManufacture** (marketing-fact): `"Poland"` — the Ferrum product page states "OOR is made by a group of very talented engineers and industrial designers, right in the heart of Poland" and the footer states "Ferrum is a new brand proudly made in Poland by parent company HEM".

## Conflict / Caution Notes

- **Product-category / taxonomy mismatch:** The manufacturer and retailer sources describe the OOR as a "headphone amplifier". The `should-be-audio-electronics.md` `deviceType` vocabulary does not contain a headphone-amplifier value, so the product is filed as `deviceType: null` rather than being force-fit into `preamplifier` or another category. This makes all amplification-group and input/output fields non-applicable under the current schema, even though the hardware has real inputs (XLR/RCA) and outputs (4-pin XLR / 6.35 mm headphone jacks).
- **In-stock conflict across same-tier retailers:** Upscale Audio lists the OOR as "In stock now!", while Headphones.com lists it as "Back-order" / "Join The Waitlist". Because these are same-tier audited retailers and they contradict each other, `inStock` is recorded as `null` and the conflict is documented rather than silently resolved.
- **Output power across load conditions:** The manufacturer product page lists "400 mW into 300 Ω, 2 W into 60 Ω" (single-ended) and "1.600 mW into 300 Ω, 8 W into 60 Ω" (balanced). The OOR white paper lists "For 32 Ohm: single ended 3.5W, balanced 5.5W. For 600 Ohm: single ended 200mW, balanced 800mW." These are not contradictory — they are different load conditions and are both internally consistent with the same output voltage. They are recorded here as sourced variants, not as unresolved conflicts, because they can be verified to be consistent at the same V RMS.
