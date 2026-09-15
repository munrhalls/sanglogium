---
product_id: "k27n1AQuIbSr5iozG1vG7I"
product_slug: "singxer-sa1-v2-headphone-amplifier"
brand: "Singxer"
name: "Singxer SA1 V2 Headphone Amplifier"
slice: "audio-electronics"
spec_fields:
  customerRating: null
  awards: []
  condition: null
  dealsDiscount: null
  newArrival: null
  deviceType: "preamplifier"
  deviceConnectivity: "wired"
  amplification: "solid-state"
  powerOutputPerChannelW: 10
  channelCount:
    - "2.0"
  inputs:
    - "rca"
    - "xlr-balanced"
  outputs:
    - "headphone-jack"
    - "pre-out-rca"
    - "pre-out-xlr"
  phonoStageBuiltIn: "none"
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
  multiroomSupport: null
  finishColor:
    - "Black"
  rackMountable19: false
  countryOfManufacture: null
source_urls:
  - "http://singxer.com/pd.jsp?id=84"
  - "https://apos.audio/products/singxer-sa-1-fully-balanced-amplifier"
  - "https://apos.audio/blogs/news/singxer-sa-1-fully-balanced-amp-now-available-on-apos-audio"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **customerRating** (internal): `null` — not individually sourced; store-operational field.
- **awards** (marketing-fact): `[]` — no named award, editor's choice, or recognition badge is listed on any checked manufacturer, retailer, or editorial source.
- **condition** (store-operational): `null` — neither the manufacturer product page nor the audited Apos Audio product page states a condition, so this store-operational field is not sourced.
- **dealsDiscount** (internal): `null` — not individually sourced; store-operational field.
- **newArrival** (internal): `null` — not individually sourced; store-operational field.
- **deviceType** (marketing-fact): `"preamplifier"` — the manufacturer product page titles the product as a "全平衡，全分立甲类耳放/前级" (fully balanced discrete Class A headphone amplifier/preamplifier) and the Apos Audio product page describes it as "a headphone amplifier and preamplifier" with XLR/RCA preamp outputs; the should-be `deviceType` enum does not contain `headphone-amp`, so the closest matching category is `preamplifier`. Source: http://singxer.com/pd.jsp?id=84 and https://apos.audio/products/singxer-sa-1-fully-balanced-amplifier.
- **deviceConnectivity** (marketing-fact): `"wired"` — the product has balanced XLR and RCA inputs and outputs; no Bluetooth, Wi-Fi, or other wireless input is listed. Source: http://singxer.com/pd.jsp?id=84 and Apos Audio product page.
- **amplification** (marketing-fact): `"solid-state"` — the product page describes the circuit as fully discrete ("全分立") Class A and the Apos Audio blog review states it "uses MOSFET transistors at its output stage"; no tube, hybrid, or Class D topology claim appears. Source: http://singxer.com/pd.jsp?id=84 and https://apos.audio/blogs/news/singxer-sa-1-fully-balanced-amp-now-available-on-apos-audio.
- **powerOutputPerChannelW** (hard-spec): `10` — the manufacturer product page gives a balanced output power table with "16Ω 10000mW" (i.e., 10W at 16Ω, the lowest listed load). Source: http://singxer.com/pd.jsp?id=84.
- **channelCount** (hard-spec): `["2.0"]` — stereo RCA/XLR inputs and headphone outputs; the source describes per-channel output and stereo operation. Source: http://singxer.com/pd.jsp?id=84.
- **inputs** (marketing-fact): `["rca", "xlr-balanced"]` — the product page states "支持单端平衡输入，自由切换" and the Apos Audio page confirms "Inputs: Balanced XLR, RCA". Source: http://singxer.com/pd.jsp?id=84 and Apos Audio product page.
- **outputs** (marketing-fact): `["headphone-jack", "pre-out-rca", "pre-out-xlr"]` — the product page lists three headphone outputs (4.4 mm balanced, 6.35 mm single-ended, 4-pin XLR balanced) plus XLR/RCA preamp outputs; the Apos Audio page confirms "three outputs on the front panel: 4-pin balanced XLR, balanced 4.4, and single-ended 6.35" and "two outputs: balanced XLR and RCA". Source: http://singxer.com/pd.jsp?id=84 and Apos Audio product page.
- **phonoStageBuiltIn** (marketing-fact): `"none"` — the RCA input is described as line-level and the source lists only RCA and XLR inputs; no MM/MC phono stage is mentioned. Source: http://singxer.com/pd.jsp?id=84.
- **trigger12v** (marketing-fact): `false` — no 12V trigger or custom-install feature is mentioned on the manufacturer page or in the Apos listing; for this marketable feature, manufacturer silence is read as `false`.
- **remoteControlIncluded** (marketing-fact): `false` — no remote control is mentioned in the product page, spec list, or included accessories; the controls are front-panel switches. For this marketable feature, manufacturer silence is read as `false`.
- **maxSampleRateBitDepth**, **dsdSupport**, **hiResCertification**, **dacChipsetFamily**, **streamingPlatformSupport**, **networkConnection**: `null` — the SA1 V2 is a pure analog amplifier/preamplifier with no DAC, network, or digital source functionality; these fields are domain-gated in `productType.ts` to `dac`/`network-streamer`/`cd-player-transport`.
- **driveType**, **turntableOperation**, **speedsSupported**, **phonoPreampBuiltIn**, **cartridgeIncluded**, **usbDigitalOutput**: `null` — these fields are domain-gated in `productType.ts` to `deviceType: turntable`; the SA1 V2 is not a turntable.
- **bluetoothCodecs**, **voiceAssistant**, **multiroomSupport**: `null` — `deviceConnectivity` is `wired`, so these wireless/connectivity-gated fields do not apply.
- **finishColor** (marketing-fact): `["Black"]` — the audited Apos Audio product page explicitly lists "Color: Black". The manufacturer product page does not state a color. Source: https://apos.audio/products/singxer-sa-1-fully-balanced-amplifier.
- **rackMountable19** (marketing-fact): `false` — the product is a desktop unit with dimensions 234 mm × 170 mm × 46 mm; no 19" rack-mounting hardware or claim is mentioned. Source: http://singxer.com/pd.jsp?id=84 and Apos Audio product page.
- **countryOfManufacture** (marketing-fact): `null` — no explicit "Made in ..." or country-of-manufacture statement for the product was found; the Apos Audio page notes Singxer operates as an ODM/OEM, but it does not state the product's country of manufacture.

## Conflict / Caution Notes

- The Apos Audio SA-1 V2 product page lists "Output power: 6480mW @ 32Ω", while the manufacturer product page lists "32Ω 5500mW" and adds "16Ω 10000mW" and "68Ω 3100mW". The 120Ω and 600Ω figures match between sources. Because the manufacturer is the higher-tier source and provides the full load table, the `powerOutputPerChannelW` value uses the manufacturer figure (10W at 16Ω) and the manufacturer 32Ω figure; the Apos 32Ω figure is recorded here as an unresolved lower-tier conflict.
- The Apos Audio page reports "SNR: 126dB" and "Dynamic range: 147dB @A-wt", while the manufacturer product page reports "信噪比 147 dB" (SNR). The should-be schema has no standalone `snr` field, so this conflict is recorded but not resolved.
- The current Sanity `filterAttributes` for this product may contain legacy values such as `deviceType: "headphone-amp"`. These are not supported by the new `should-be-audio-electronics.md` schema. The sourced `deviceType` is `preamplifier` because the source explicitly describes the unit as a headphone amplifier and preamp with XLR/RCA preamp outputs.
- The source does not use the word "solid-state" literally, but it describes discrete transistor-based (MOSFET) circuitry with no tube, hybrid, or Class D claim; the value `solid-state` is the should-be vocabulary match for this topology.
