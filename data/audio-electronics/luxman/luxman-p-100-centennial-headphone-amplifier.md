---
product_id: "PHPYj28HJdPDHAaIBChaz2"
product_slug: "luxman-p-100-centennial-headphone-amplifier"
brand: "Luxman"
name: "Luxman P-100 Centennial Headphone Amplifier"
slice: "audio-electronics"
spec_fields:
  price:
    min: 13995
    max: 13995
    currency: "USD"
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
  finishColor:
    - "Platinum-like"
    - "Chrome-plated"
    - "Hairline"
  rackMountable19: false
  countryOfManufacture: "Japan"
source_urls:
  - "https://www.luxman.com/product/detail.php?id=52"
  - "https://www.luxman.co.jp/product/p-100-centennial"
  - "https://www.luxman.co.jp/asset/manual/P-100_AG00238G26A_20240930.pdf"
  - "https://sanglogium.com/products/luxman-p-100-centennial-headphone-amplifier"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **price** (internal): `{min: 13995, max: 13995, currency: "USD"}` — the live Sanity product list for this issue records the price as `$13995.00` (1399500 cents), mirrored by the Sang Logium product record — `https://sanglogium.com/products/luxman-p-100-centennial-headphone-amplifier`.
- **customerRating** (internal): `null` — no customer review aggregate is visible on the manufacturer product pages or in the live store record used for this pass.
- **awards** (marketing-fact): `null` — no named awards, editor's choice, or recognition badges are listed on the manufacturer product pages or in retailer pages checked.
- **condition** (internal): `null` — condition is a store-operational field; the manufacturer pages do not state New / Open-Box / Refurbished.
- **inStock** (internal): `null` — live stock status was not captured from a citable page text in this pass; treated as store-operational.
- **dealsDiscount** (internal): `null` — no sale or clearance flag is present on the manufacturer pages.
- **newArrival** (internal): `null` — no new-arrival flag or launch announcement callout is present on the manufacturer pages at the time of fetch.
- **deviceType** (marketing-fact): `null` — both the English and Japanese manufacturer pages identify the product as a "headphone amplifier" ("ヘッドフォンアンプ"). The current `filterAttributes.deviceType` vocabulary for `audio-electronics` (`integrated-amplifier`, `power-amplifier`, `preamplifier`, `av-surround-receiver`, `stereo-receiver`, `dac`, `network-streamer`, `cd-player-transport`, `turntable`) does not include `headphone-amplifier`; therefore the value is recorded as `null` rather than force-fit.
- **deviceConnectivity** (marketing-fact): `"wired"` — the product has balanced XLR and unbalanced RCA line inputs and 6.3mm / 4.4mm / 4-pin XLR / 3-pin XLR headphone outputs; no Bluetooth, Wi-Fi, or network input is listed.
- **formFactor** (marketing-fact): `"desktop"` — the product is a mains-powered chassis with dimensions 446(W) × 136(H) × 401(D) mm and a mass of 19.7 kg; the manual and product pages describe it as a stationary headphone amplifier.
- **amplification** (marketing-fact): `null` — the source describes the LIFES amplification feedback engine using discrete components and FETs, i.e. solid-state circuitry. However, the `filterAttributes.amplification` field is domain-gated in `sanity-cms/schemaTypes/productType.ts` to the five amplifier `deviceType` values (`integrated-amplifier`, `power-amplifier`, `preamplifier`, `av-surround-receiver`, `stereo-receiver`). Because `deviceType` is `null` for this headphone amplifier, `amplification` is recorded as `null` per the schema gating.
- **dacIncluded** (marketing-fact): `false` — the manufacturer pages and manual describe the P-100 as a pure analogue headphone amplifier; no DAC functionality or digital input processing is mentioned.
- **balancedOutput** (marketing-fact): `true` — the product page states "Fully balanced headphone outputs" and lists 4.4mm balanced, 4-pin XLR balanced, and 3-pin XLR BTL balanced output terminals.
- **powerOutputPerChannelW**, **channelCount**, **phonoStageBuiltIn**, **trigger12v**, **remoteControlIncluded**, **inputs**, **outputs**: `null` — these fields are domain-gated in `productType.ts` to the five amplifier `deviceType` values. Because this headphone amplifier does not match any of those `deviceType` values, the fields are recorded as `null`. The manufacturer page and manual do confirm a rated output of 4W+4W (unbalanced, 8Ω) and 8W+8W (balanced, 16Ω), stereo L/R operation, RCA (LINE) and XLR (BAL LINE) inputs, and 6.3mm / 4.4mm / 4-pin XLR / 3-pin XLR headphone outputs; those facts are noted in the Conflict / Caution section below for the later schema/CMS patch phase.
- **maxSampleRateBitDepth**, **dsdSupport**, **hiResCertification**, **dacChipsetFamily**, **streamingPlatformSupport**, **networkConnection**: `null` — this is an analogue headphone amplifier, not a DAC, network streamer, or CD player/transport.
- **driveType**, **turntableOperation**, **speedsSupported**, **phonoPreampBuiltIn**, **cartridgeIncluded**, **usbDigitalOutput**: `null` — this is not a turntable.
- **bluetoothCodecs**, **voiceAssistant**, **multiroomSupport**: `null` — `deviceConnectivity` is `wired`, so the connectivity & wireless group does not apply.
- **finishColor** (marketing-fact): `["Platinum-like", "Chrome-plated", "Hairline"]` — the English product page describes a "platinum like finish" and "precise hairline finish" on the front panel and nameplate; the Japanese product page describes the Centennial nameplate as "光沢クロムメッキ仕上げ" (gloss chrome-plated finish) and the front panel as "精緻なヘアライン加工" (precise hairline finish). "Hairline" is consistent across both sources; "Platinum-like" and "Chrome-plated" are two same-tier manufacturer descriptions of the nameplate finish and are both recorded.
- **rackMountable19** (marketing-fact): `false` — the product is a desktop amplifier with a large chassis and cast-iron feet; no 19" rack-mounting hardware or claim is mentioned on the manufacturer pages or in the manual.
- **countryOfManufacture** (marketing-fact): `"Japan"` — the owner's manual rear-panel diagram contains the marking "MADE IN JAPAN".

## Conflict / Caution Notes

- **Schema vocabulary gap for headphone amplifiers**: The manufacturer identifies the P-100 CENTENNIAL as a headphone amplifier, which is outside the current `filterAttributes.deviceType` enum for `audio-electronics`. As a result, `deviceType` and all domain-gated amplifier/source/turntable fields are recorded as `null` rather than mapped to `integrated-amplifier` or another inapplicable value. The following real, cited facts are therefore preserved here for a later schema/CMS patch phase:
  - Rated output: unbalanced 4W+4W (8Ω), 2W+2W (16Ω), 1W+1W (32Ω), 53mW+53mW (600Ω); balanced 8W+8W (16Ω), 4W+4W (32Ω), 213mW+213mW (600Ω) — source: `https://www.luxman.com/product/detail.php?id=52` and `https://www.luxman.co.jp/product/p-100-centennial`.
  - Input terminals: unbalanced RCA (LINE) and balanced XLR (BAL LINE-1 / BAL LINE-2) — source: `https://www.luxman.co.jp/asset/manual/P-100_AG00238G26A_20240930.pdf`.
  - Output terminals: 6.3mm unbalanced, 4.4mm balanced, 4-pin XLR balanced, and 3-pin XLR BTL (dual-unit) headphone outputs — source: `https://www.luxman.com/product/detail.php?id=52` and manual.
  - Topology: solid-state discrete LIFES amplification feedback engine with FET voltage amplification — source: `https://www.luxman.com/product/detail.php?id=52`.
- **Finish description across language variants**: The English page calls the nameplate finish "platinum like" while the Japanese page calls the same nameplate "光沢クロムメッキ仕上げ" (gloss chrome-plated). Both are live manufacturer pages and equally current; both values are recorded in `finishColor` rather than resolving the description unilaterally.
