---
product_id: "DZc43yHr6ydfgE7zB4112Z"
product_slug: "gustard-dac-r26ii-network-streaming-r2r-dac"
brand: "Gustard"
name: "GUSTARD DAC-R26II Network Streaming R2R DAC"
slice: "audio-electronics"
spec_fields:
  price:
    min: 1649.99
    max: 1649.99
    currency: USD
  customerRating: null
  awards: null
  condition: null
  inStock: true
  dealsDiscount: null
  newArrival: null
  deviceType: dac
  deviceConnectivity: wired-wireless
  formFactor: desktop
  amplification: null
  dacIncluded: true
  balancedOutput: true
  powerOutputPerChannelW: null
  channelCount: null
  phonoStageBuiltIn: none
  trigger12v: false
  remoteControlIncluded: true
  inputs: null
  outputs: [pre-out]
  maxSampleRateBitDepth: "PCM 32-bit / 768kHz"
  dsdSupport: dsd256-plus
  hiResCertification: false
  dacChipsetFamily: r2r-ladder
  streamingPlatformSupport: [airplay2, roon-ready, spotify-connect, dlna]
  networkConnection: ethernet
  driveType: null
  turntableOperation: null
  speedsSupported: null
  phonoPreampBuiltIn: null
  cartridgeIncluded: null
  usbDigitalOutput: null
  voiceAssistant: null
  multiroomSupport: null
  bluetoothCodecs: [sbc, aac, aptx, aptx-hd, aptx-ll, ldac]
  finishColor: [Black, Silver]
  rackMountable19: false
  countryOfManufacture: China
source_urls:
  - "http://www.gustard.com/?post_type=products&page_id=24428"
  - "https://www.gustard.com/qfy-content/uploads/2026/03/7267ba70644e3f1bd43923a0a922974c.pdf"
  - "https://apos.audio/products/gustard-dac-r26ii-network-streaming-r2r-dac"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **price** (hard-spec/internal): `{min: 1649.99, max: 1649.99, currency: "USD"}` — Apos product page shows "Sale price $1,649.99 USD" with an "Add to cart" button.
- **inStock** (internal): `true` — Apos page shows "Add to cart".
- **dacChipsetFamily** (hard-spec): `"r2r-ladder"` — Apos and manual describe a fully discrete R2R resistor ladder network.
- **maxSampleRateBitDepth** (hard-spec): `"PCM 32-bit / 768kHz"` — Manual: "USB 输入格式支持： PCM 16-32bit/44.1-768kHz".
- **dsdSupport** (hard-spec): `"dsd256-plus"` — Manual: native DSD DSD64-DSD2048 over IIS (DSD Direct mode) and DSD64-DSD512 over USB.
- **trigger12v** (hard-spec): `false` — Manufacturer manual and Apos product page do not list a 12V trigger interface.
- **bluetoothCodecs** (hard-spec/marketing-fact): `["sbc", "aac", "aptx", "aptx-hd", "aptx-ll", "ldac"]` — Manual states "BT 蓝牙 5.1: 输入格式支持： PCM LDAC、AAC、SBC、APTX、APTX LL、APTX HD".
- **finishColor** (marketing-fact): `["Black", "Silver"]` — Apos page offers "Black" and "Silver" variants.

## Conflict / Caution Notes

- **MQA/Hi-Res conflict for R26II:** The Apos product page lists "MQA ≤ 384kHz", but the Gustard manufacturer manual (V1.0) does not mention MQA. Per the tier order, the manufacturer manual is higher-priority for feature claims, so hiResCertification is recorded as false. The Apos MQA claim is noted as an unresolved conflict.
