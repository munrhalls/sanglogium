---
product_id: k27n1AQuIbSr5iozG2j6zk
product_slug: hifi-rose-rs250a-network-streamer
brand: "HiFi Rose"
name: "HiFi Rose RS250A Network Streamer"
slice: audio-electronics
spec_fields:
  price:
    min: 2695
    max: 2695
    currency: USD
  customerRating: null
  awards: null
  condition: null
  inStock: true
  dealsDiscount: null
  newArrival: null
  deviceType: network-streamer
  deviceConnectivity: wired-wireless
  formFactor: desktop
  amplification: null
  dacIncluded: true
  balancedOutput: false
  powerOutputPerChannelW: null
  channelCount: null
  phonoStageBuiltIn: null
  trigger12v: null
  remoteControlIncluded: true
  inputs:
    - rca
    - optical
    - coaxial
    - usb
  outputs:
    - pre-out-rca
    - headphone-jack
  maxSampleRateBitDepth: 32-bit/768kHz
  dsdSupport: dsd256-plus
  hiResCertification:
    - mqa
    - hi-res-audio
  dacChipsetFamily: ess-sabre
  streamingPlatformSupport:
    - dlna
    - roon-ready
    - spotify-connect
  networkConnection:
    - wifi
    - ethernet
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
    - Silver
    - Black
  rackMountable19: false
  countryOfManufacture: Korea
source_urls:
  - "https://www.hifiroseusa.com/products/hifi-rose-rs250-wireless-network-streamer"
  - "https://cdn.shopify.com/s/files/1/0631/7608/1655/files/RS250_Owners_Manual__60202P-0005AA__EN_Kr_210408_web.pdf?v=1667224782"
  - "https://2tdmkpky.api.sanity.io/v2023-05-03/data/query/production?query=*%5B_id%3D%3D%22k27n1AQuIbSr5iozG2j6zk%22%5D%7Bprice_data%2Cstock%2CreservedStock%2CfilterAttributes%7D"
verified_at: 2026-09-14
data_status: COMPLETE
---

## Verification Notes

**price** (internal / store record): `{min: 2695, max: 2695, currency: "USD"}` — live Sanity `price_data.unit_amount`: 269500. The product page lists `$2,695.00 USD`, so the public and store prices agree.
- **customerRating** (marketing-fact): `null` — product page shows `Reviews Coming Soon`; no aggregate rating.
- **awards** (marketing-fact): `null` — no awards or recognition badges listed.
- **condition** / **dealsDiscount** / **newArrival** (store-operational): `null`.
- **inStock** (internal / store record): `true` — Sanity `stock`: 26, `inStock`: true. Product page shows `Out Of Stock` for the US distributor; this conflict is noted below.
- **deviceType** (marketing-fact): `"network-streamer"` — product title `RS250A Wireless Network Streamer` and description `streamer, DAC, and pre-amplifier`. The pre-amplifier function is captured in `outputs`.
- **deviceConnectivity** (marketing-fact): `"wired-wireless"` — product page: `Network Support: Ethernet 10/100/1000 BASE-T, WiFi (802.11 b/g/n/a/ac) 2.4Ghz/5Ghz Dual Band` and `Bluetooth: Bluetooth supported (A2DP Sink, AVRCP v1.3)`.
- **formFactor** (marketing-fact): `"desktop"`.
- **amplification** / **powerOutputPerChannelW** / **channelCount** / **phonoStageBuiltIn** / **trigger12v**: `null` — the RS250A is a streamer/DAC/preamp, not a power amplifier.
- **dacIncluded** (marketing-fact): `true` — product page: `ESS flagship DAC (ES9028PRO)` and `streamer, DAC, and pre-amplifier`.
- **balancedOutput** (hard-spec): `false` — product page lists `Output Level: Max 2.3Vrms (Unbalanced)` and `Audio Output: PreAmp Out (Unbalanced RCA) x 1`; no XLR balanced output.
- **remoteControlIncluded** (marketing-fact): `true` — product page: `Remote Control: Bluetooth remote control` and accessories list `Bluetooth remote control x 1`.
- **inputs** (hard-spec): `["rca", "optical", "coaxial", "usb"]` — product page spec table: `Audio Input: Line Input x 1, Optical In x 1, COAX x 1, USB Audio In x1`.
- **outputs** (hard-spec): `["pre-out-rca", "headphone-jack"]` — product page spec table: `Audio Output: PreAmp Out (Unbalanced RCA) x 1, Optical Out x 1, COAX x 1, USB Audio Out x1, Headphone Out x1`. The schema `outputs` enum does not include digital outputs; `pre-out-rca` and `headphone-jack` are recorded.
- **maxSampleRateBitDepth** (hard-spec): `"32-bit/768kHz"` — product page: `PCM: 8KHz~768KHz (8/16/24/32bit per Sample)`.
- **dsdSupport** (hard-spec): `"dsd256-plus"` — product page: `Native DSD: DSD64(2.8MHz)/DSD128(5.6MHz)/DSD256(11.2MHz)/DSD512(22.5792Mhz)`.
- **hiResCertification** (marketing-fact): `["mqa", "hi-res-audio"]` — product page: `Hi-Res Certified` and `MQA Full Decoder` in the key-features and spec table (`MQA` listed in codecs).
- **dacChipsetFamily** (hard-spec): `"ess-sabre"` — product page: `DAC Chip: ES9028 Pro`.
- **streamingPlatformSupport** (marketing-fact): `["dlna", "roon-ready", "spotify-connect"]` — product description says `Roon Ready with Spotify Connect, Airplay, Bluetooth A2DP, and DLNA support`; the spec table lists `Airplay / DLNA / Roon Ready / MQA Full Decoder`. `airplay2` is not explicitly named; only `dlna`, `roon-ready`, and `spotify-connect` are recorded.
- **networkConnection** (marketing-fact): `["wifi", "ethernet"]` — product page lists Ethernet and WiFi support.
- **driveType**, **turntableOperation**, **speedsSupported**, **phonoPreampBuiltIn**, **cartridgeIncluded**, **usbDigitalOutput**: `null` — not a turntable.
- **bluetoothCodecs** (marketing-fact): `null` — Bluetooth A2DP is supported; no codec list is provided.
- **voiceAssistant** / **multiroomSupport** (marketing-fact): `null` — no such features stated.
- **finishColor** (marketing-fact): `["Silver", "Black"]` — product page shows `Color Silver Black` with variants.
- **rackMountable19** (marketing-fact): `false` — no 19" rack-mounting claim; dimensions are 10.9" H x 7.9" W x 3" D.
- **countryOfManufacture** (hard-spec): `"Korea"` — manual: `Manufacturer/Country of Manufacture: Citech Co., Ltd./Korea`.

## Conflict / Caution Notes

**In-stock conflict** — Sanity `stock`: 26 and `inStock`: true; product page shows `Out Of Stock` and `Not currently sold online. For sales information please contact: sales@hifirose.com`. The live store availability is recorded.
- **Outputs field scope** — the RS250A is a network streamer/DAC/preamp with pre-out and headphone jack, but the schema's `outputs` field is domain-gated to amplifier-type `deviceType`s. The real outputs are recorded with this note.
- **Spotify Connect wording** — the product description attributes `Spotify Connect` to `RS201E` in one sentence while the overall RS250A page repeats the same feature set; the spec table does not list Spotify. `spotify-connect` is recorded because the page's product description explicitly names it in the RS250A feature block.
