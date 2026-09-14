---
product_id: "xMEqvkRBbdrlJXyFG8fkYr"
product_slug: "gustard-x26-iii-dual-es9039spro-digital-to-analog-convertor-dac"
brand: "Gustard"
name: "GUSTARD X26 III Dual ES9039SPRO Digital to Analog Convertor (DAC)"
slice: "audio-electronics"
spec_fields:
  price:
    min: 1599.99
    max: 1599.99
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
  trigger12v: true
  remoteControlIncluded: true
  inputs: null
  outputs: [pre-out]
  maxSampleRateBitDepth: "PCM 32-bit / 768kHz"
  dsdSupport: dsd256-plus
  hiResCertification: true
  dacChipsetFamily: ess-sabre
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
  bluetoothCodecs: null
  finishColor: [Black, Silver]
  rackMountable19: false
  countryOfManufacture: China
source_urls:
  - "http://www.gustard.com/?post_type=products&page_id=21310"
  - "http://www.gustard.com/qfy-content/uploads/2025/07/692f098b594d19c255e801f618a447c5.pdf"
  - "https://apos.audio/products/gustard-x26-iii-dual-es9039spro-digital-to-analog-convertor-dac"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **price** (hard-spec/internal): `{min: 1599.99, max: 1599.99, currency: "USD"}` — Apos product page shows "Sale price $1,599.99 USD" with an "Add to cart" button.
- **inStock** (internal): `true` — Apos page shows "Add to cart".
- **dacChipsetFamily** (hard-spec): `"ess-sabre"` — Apos and manual state dual ESS ES9039SPRO chips.
- **maxSampleRateBitDepth** (hard-spec): `"PCM 32-bit / 768kHz"` — Manual: "USB 输入格式支持： PCM 16-32bit/44.1-768kHz".
- **dsdSupport** (hard-spec): `"dsd256-plus"` — Manual: native DSD DSD64-DSD512 over USB/Streamer/IIS.
- **hiResCertification** (hard-spec/marketing-fact): `true` — Manual explicitly lists "MQA 最高至 384K" for all digital inputs.
- **trigger12v** (hard-spec): `true` — Manual lists a 10MHz BNC input and Trigger interface details.
- **streamingPlatformSupport** (marketing-fact): `["airplay2", "roon-ready", "spotify-connect", "dlna"]` — Apos page lists "Roon, AirPlay, UPnP, NAA, Spotify".
- **bluetoothCodecs** (hard-spec/marketing-fact): `null` — Apos main product page and manufacturer manual do not list Bluetooth; a third-party retailer (Audiomagic) claims Bluetooth 5.1, but the manufacturer source is silent and no Bluetooth antenna is shown in the packing list.

## Conflict / Caution Notes

- **Bluetooth conflict for X26 III:** Some third-party retailer pages list Bluetooth 5.1 with LDAC/aptX support. The Gustard manufacturer manual and the Apos product page make no mention of Bluetooth, and the packing list does not include a Bluetooth antenna (in contrast to the R26II packing list, which does). Per the sourcing protocol, the manufacturer source is silent, so bluetoothCodecs is recorded as null.
