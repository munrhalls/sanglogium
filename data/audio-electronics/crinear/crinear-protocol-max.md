---
product_id: "Pn6oyV4Ks5AcNbecjh0awA"
product_slug: "crinear-protocol-max"
brand: "CrinEar"
name: "CrinEar Protocol Max"
slice: "audio-electronics"
price:
  min: 8999
  max: 8999
  currency: "USD"
spec_fields:
  customerRating: null
  awards: []
  condition: null
  inStock: null
  dealsDiscount: null
  newArrival: null
  deviceType: "dac"
  deviceConnectivity: "wired"
  amplification: null
  powerOutputPerChannelW: null
  channelCount: null
  inputs:
    - "usb"
  outputs: null
  phonoStageBuiltIn: null
  trigger12v: null
  remoteControlIncluded: null
  maxSampleRateBitDepth: null
  dsdSupport: null
  hiResCertification: null
  dacChipsetFamily:
    - "cirrus-logic"
  streamingPlatformSupport: []
  networkConnection: []
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
    - "Black"
  rackMountable19: false
  countryOfManufacture: null
source_urls:
  - "https://crinear.com/protocol-max"
  - "https://crinacle.com/2025/10/05/crinear-protocol-max-user-guide-specifications/"
  - "https://www.linsoul.com/products/crinear-protocol-max"
  - "https://hangout.audio/products/crinear-protocolmax"
  - "https://www.amazon.com/dp/B0FSRT288B"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **price** (marketing-fact): `8999` cents (US$89.99) — the manufacturer product page lists "US$89.99" as the product price; Linsoul, Hangout.Audio, and Amazon also list $89.99 USD — source: https://crinear.com/protocol-max.

- **customerRating** (internal): `null` — store-computed from review aggregate; not individually sourced.

- **awards** (marketing-fact): `[]` — no named award, editor's choice, or recognition badge is mentioned on the manufacturer product page, user guide, or retailer listings.

- **condition** (internal): `null` — store-operational; not individually sourced in this pass.

- **inStock** (internal): `null` — store/inventory-level field; this sourcing pass has no live Sang Logium inventory source, so it is left explicit `null`.

- **dealsDiscount** (internal): `null` — store-operational; not individually sourced.

- **newArrival** (internal): `null` — store-operational; not individually sourced.

- **deviceType** (marketing-fact): `dac` — the product page describes it as a "Portable DAC-Amplifier" and "DAC-amp" with dual Cirrus Logic CS43198 DAC chips. The `should-be-audio-electronics.md` Product Category list does not include "headphone amplifier" or "DAC-amp combo"; the closest matching category is `dac`. The headphone-amp aspect is noted as a category gap.

- **deviceConnectivity** (marketing-fact): `wired` — the product is USB-powered (USB-C-to-C cable, USB-C-to-A adapter included) and the manufacturer page lists no Bluetooth, Wi-Fi, or Ethernet. Linsoul confirms "Power Source: USB-Powered" and the guide notes Windows, macOS, Android, and Nintendo Switch (UAC 1.0) compatibility.

- **amplification** (marketing-fact): `null` — the field is domain-gated to the five amplifier `deviceType` values (`integrated-amplifier`, `power-amplifier`, `preamplifier`, `av-surround-receiver`, `stereo-receiver`). The product is a portable DAC/amp with SGM8262-2 op-amp output stage, not an amplifier in the schema's amplifier-category sense.

- **powerOutputPerChannelW** (hard-spec): `null` — domain-gated to amplifier `deviceType` values. The published power figures are headphone output power (e.g., 600 mW @ 16Ω balanced, 500 mW @ 8Ω single-ended from the manufacturer page and guide), not per-channel amplifier RMS power.

- **channelCount** (marketing-fact): `null` — domain-gated to amplifier/receiver `deviceType` values.

- **inputs** (hard-spec): `["usb"]` — the product is a USB-C-powered DAC/amp. The manufacturer page and guide list the included "USB C-to-C cable" and "USB C-to-A adapter", and Linsoul lists "Power Source: USB-Powered". No other audio input (optical, coaxial, etc.) is mentioned.

- **outputs** (marketing-fact): `null` — the `outputs` filter facet is domain-gated to amplifier `deviceType` values and uses a coarser taxonomy (speaker-terminals, pre-out, headphone-jack, subwoofer-out). The product has 4.4 mm balanced and 3.5 mm single-ended headphone jacks, but because `deviceType` is `dac` the field is recorded as `null` per the schema.

- **phonoStageBuiltIn** (marketing-fact): `null` — domain-gated to amplifier `deviceType` values; no phono stage is mentioned.

- **trigger12v** (marketing-fact): `null` — domain-gated to amplifier `deviceType` values; no 12V trigger or custom-install feature is mentioned.

- **remoteControlIncluded** (marketing-fact): `null` — domain-gated to amplifier `deviceType` values; no remote control is mentioned.

- **maxSampleRateBitDepth** (hard-spec): `null` — the manufacturer product page and user-guide specifications do not state a maximum PCM sample rate or bit depth. Linsoul, Hangout.Audio, and Amazon listings also omit this. The Cirrus Logic CS43198 chip is named, but the product's supported sample rates are not inferred from the chip alone per the sourcing protocol.

- **dsdSupport** (hard-spec): `null` — the manufacturer product page and user-guide specifications do not state DSD support. Retailer listings (Linsoul, Hangout.Audio, Amazon) do not state DSD support either. The CS43198 chip is used, but the product-level DSD capability is not confirmed.

- **hiResCertification** (marketing-fact): `null` — no explicit "Hi-Res Audio" certification or MQA logo/statement is found on the manufacturer product page, user guide, or retailer listings. The word "high-resolution" appears in Amazon marketing copy, but no named certification is given.

- **dacChipsetFamily** (hard-spec): `["cirrus-logic"]` — the manufacturer product page states "DAC Chip: Dual Cirrus Logic CS43198"; the user guide and Linsoul confirm the same. The schema enum value for Cirrus Logic is `cirrus-logic`.

- **streamingPlatformSupport** (marketing-fact): `[]` — the product is a wired USB DAC with no network or streaming service support. The Hangout.Audio Graph Tool is a browser-based PEQ utility, not a streaming platform.

- **networkConnection** (marketing-fact): `[]` — no Wi-Fi or Ethernet hardware is mentioned; the product is USB-powered only.

- **driveType**, **turntableOperation**, **speedsSupported**, **phonoPreampBuiltIn**, **cartridgeIncluded**, **usbDigitalOutput**: `null` — all domain-gated to `deviceType: turntable`; this product is a `dac`.

- **bluetoothCodecs** (marketing-fact): `null` — `deviceConnectivity` is `wired`; no Bluetooth or codec support is mentioned.

- **voiceAssistant** (marketing-fact): `null` — `deviceConnectivity` is `wired`; the field is domain-gated to Bluetooth / Wi-Fi / wired-wireless connectivity.

- **multiroomSupport** (marketing-fact): `null` — `deviceConnectivity` is `wired`; no multiroom or network feature is mentioned.

- **finishColor** (marketing-fact): `["Black"]` — the manufacturer product page states only "sleek aluminium" / "CNC-Machined Aluminum" without naming a color. Amazon product information lists "Color: Black" and "Enclosure Material: Aluminum" (https://www.amazon.com/dp/B0FSRT288B), so the color is recorded as `Black`.

- **rackMountable19** (marketing-fact): `false` — the product is a thumb-drive-sized portable USB DAC/amp; no 19" rack-mounting claim or hardware is mentioned.

- **countryOfManufacture** (marketing-fact): `null` — no country of manufacture, "Made in ...", or origin statement is found on the manufacturer product page, user guide, or retailer listings.

## Conflict / Caution Notes

- **Product-category / taxonomy mismatch:** The manufacturer and retailers describe the product as a "portable DAC-amplifier" / "DAC-amp" / "portable USB-powered DAC-amp". The `should-be-audio-electronics.md` Product Category list does not contain a headphone-amplifier or DAC-amp-combo value, so `deviceType` is recorded as `dac` (the closest matching category) rather than being force-fit into another value. The headphone-amp functionality is real but falls outside the current `deviceType` vocabulary.

- **Output power not in `powerOutputPerChannelW`:** The manufacturer page and guide publish headphone output power (600 mW @ 16Ω balanced in Boost mode, 500 mW @ 8Ω single-ended in Boost mode). Because `deviceType` is `dac`, the `powerOutputPerChannelW` field is domain-gated to amplifier categories and is recorded as `null`; the published headphone power is preserved in the verification notes above, not in the filter field.

- **Finish / color sourcing:** The manufacturer page describes the housing as "sleek aluminium" / "CNC-Machined Aluminum" but does not name the color. Amazon's product information is the only opened source that names a color ("Black"), so `finishColor` is sourced from the retailer, not the manufacturer.

- **Max sample rate / DSD unconfirmed:** The manufacturer product page, user-guide specifications, Linsoul technical details, Hangout.Audio listing, and Amazon specifications table all omit max PCM sample rate, bit depth, and DSD support. The CS43198 chip used in the device is capable of high sample rates and DSD in general, but per the sourcing protocol these values are not inferred from the chip alone and are recorded as `null`.
