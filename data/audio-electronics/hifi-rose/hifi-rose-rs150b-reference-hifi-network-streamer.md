---
product_id: Pn6oyV4Ks5AcNbecjh1b8Y
product_slug: hifi-rose-rs150b-reference-hifi-network-streamer
brand: "HiFi Rose"
name: "HiFi Rose RS150B Reference HiFi Network Streamer"
slice: audio-electronics
spec_fields:
  price:
    min: 4995
    max: 4995
    currency: USD
  customerRating: null
  awards:
    - "Editor's Choice Award 2022"
    - "Editor's Choice Award 2024"
    - "EISA Award — High-End Music Player 2021–2022"
    - "Highly Commended"
    - "Five Stars — Recommended"
  condition: null
  inStock: true
  dealsDiscount: null
  newArrival: null
  deviceType: network-streamer
  deviceConnectivity: wired-wireless
  formFactor: desktop
  amplification: null
  dacIncluded: true
  balancedOutput: true
  powerOutputPerChannelW: null
  channelCount: null
  phonoStageBuiltIn: null
  trigger12v: null
  remoteControlIncluded: true
  inputs:
    - optical
    - coaxial
    - rca
    - aes-ebu
    - hdmi-earc
    - usb
  outputs:
    - pre-out-rca
    - pre-out-xlr
  maxSampleRateBitDepth: 32-bit/768kHz
  dsdSupport: dsd256-plus
  hiResCertification:
    - mqa
    - hi-res-audio
  dacChipsetFamily: ess-sabre
  streamingPlatformSupport:
    - dlna
    - roon-ready
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
    - Black
    - Silver
  rackMountable19: false
  countryOfManufacture: "South Korea"
source_urls:
  - "https://www.hifiroseusa.com/products/hifi-rose-rs150b-high-performance-network-streamer"
  - "https://cdn.shopify.com/s/files/1/0631/7608/1655/files/RS150_Manual_Simple__60202P-0004AD__ENGLISH_200521.pdf?v=1667224817"
  - "https://2tdmkpky.api.sanity.io/v2023-05-03/data/query/production?query=*%5B_id%3D%3D%22Pn6oyV4Ks5AcNbecjh1b8Y%22%5D%7Bprice_data%2Cstock%2CreservedStock%2CfilterAttributes%7D"
verified_at: 2026-09-14
data_status: COMPLETE
---

## Verification Notes

**price** (internal / store record): `{min: 4995, max: 4995, currency: "USD"}` — live Sanity `price_data.unit_amount`: 499500. The distributor product page currently shows a sale price of `$3,199.00 USD` (struck through from `$4,995.00 USD`); the live store price `$4995.00` is recorded.
- **customerRating** (marketing-fact): `null` — no aggregate customer star rating displayed.
- **awards** (marketing-fact): awards list — product page review/awards section lists `Editor&apos;s Choice Award 2022` (The Absolute Sound), `Editor&apos;s Choice Award 2024` (hi-fi+), `EISA Award — High-End Music Player 2021–2022`, `Highly Commended` (Hi-Fi News 2022), and `Five Stars — Recommended` (Hi-Fi Choice 2022).
- **condition** / **dealsDiscount** / **newArrival** (store-operational): `null`.
- **inStock** (internal / store record): `true` — Sanity `stock`: 30, `inStock`: true. Product page shows `Sale Out Of Stock`; distributor inventory, noted as a conflict.
- **deviceType** (marketing-fact): `"network-streamer"` — product title and description call it a `Reference HiFi Network Streamer` and `highest-performance network streamer and DAC`. It also functions as a DAC/preamp, captured in other fields.
- **deviceConnectivity** (marketing-fact): `"wired-wireless"` — product page: `Wireless (via USB dongle) or wired with gigabit ethernet` and `Wired: Ethernet 10/100/1000 BASE-T / Wireless: External USB type WiFi dongle supported / Bluetooth: BT : Supports external USB type BT dongle`.
- **formFactor** (marketing-fact): `"desktop"`.
- **amplification** / **powerOutputPerChannelW** / **channelCount** / **phonoStageBuiltIn** / **trigger12v** (domain-gated amplifier fields): `null` — the RS150B is a network streamer/DAC/preamp, not a power amplifier.
- **dacIncluded** (marketing-fact): `true` — `Quad-balanced ESS Sabre DAC` and `ESS Technology, SABER ES9038PRO` listed.
- **balancedOutput** (hard-spec): `true` — product page lists `Output Level: 6.5Vrms (Balanced), 2.2Vrms (Unbalanced)` and `Pre-OUT (Balanced x 1, Unbalanced x 1)`.
- **remoteControlIncluded** (marketing-fact): `true` — product page: `Remote Control: bluetooth remote control`; accessories include `Bluetooth remote control x 1`.
- **inputs** (hard-spec): `["optical", "coaxial", "rca", "aes-ebu", "hdmi-earc", "usb"]` — spec table: `Audio Input: Optical x 1, COAX x 1, Line-IN x 1, AES/EBU x 1, HDMI ARC x 1, USB DAC mode x 1`. HDMI ARC is mapped to the schema's `hdmi-earc` value; the source does not say `eARC`.
- **outputs** (hard-spec): `["pre-out-rca", "pre-out-xlr"]` — spec table: `Audio Output: Optical x 1, COAX x 1, Pre-OUT (Balanced x 1, Unbalanced x 1), I2S-DVI x 1, I2S-RJ45 x 1, AES/EBU x 1`. Digital outputs not in schema enum are omitted from outputs; the pre-outs are recorded.
- **maxSampleRateBitDepth** (hard-spec): `"32-bit/768kHz"` — spec table: `PCM: 8KHz~768KHz (8/16/24/32bit per Sample)`.
- **dsdSupport** (hard-spec): `"dsd256-plus"` — spec table: `Native DSD: DSD64(2.8MHz)/DSD128(5.6MHz)/DSD256(11.2MHz)/DSD512(22.5792Mhz)`.
- **hiResCertification** (marketing-fact): `["mqa", "hi-res-audio"]` — product page lists `MQA Certified`, `Hi-Res Audio compatible`, `MQA Full Decoder`, and `Hi-Res Certified`.
- **dacChipsetFamily** (hard-spec): `"ess-sabre"` — spec table: `ESS Technology, SABER ES9038PRO`.
- **streamingPlatformSupport** (marketing-fact): `["dlna", "roon-ready"]` — spec table: `Streaming: Airplay / DLNA / Roon Ready / MQA Full Decoder`. The description mentions Apple Music, Spotify, Tidal, Qobuz, but `spotify-connect`, `tidal-connect`, etc. are not explicitly named, so only `dlna` and `roon-ready` are recorded.
- **networkConnection** (marketing-fact): `["wifi", "ethernet"]` — `Wired: Ethernet 10/100/1000 BASE-T` and `Wireless: External USB type WiFi dongle supported`.
- **driveType**, **turntableOperation**, **speedsSupported**, **phonoPreampBuiltIn**, **cartridgeIncluded**, **usbDigitalOutput**: `null` — not a turntable.
- **bluetoothCodecs** (marketing-fact): `null` — Bluetooth uses an external USB dongle; no codec list stated.
- **voiceAssistant** / **multiroomSupport** (marketing-fact): `null` — no such features stated.
- **finishColor** (marketing-fact): `["Black", "Silver"]` — product variants list `Black` and `Silver`.
- **rackMountable19** (marketing-fact): `false` — no 19" rack-mounting claim; dimensions are 430(W) x 316(D) x 123(H) mm but no rack ears.
- **countryOfManufacture** (hard-spec): `"South Korea"` — manual: `Country of manufacture : South Korea`.

## Conflict / Caution Notes

**Price conflict** — live Sanity store record `$4995.00`; the distributor product page currently shows a `Sale price $3,199.00 USD` struck through from `$4,995.00 USD`. The live store price is recorded.
- **In-stock conflict** — Sanity `stock`: 30 and `inStock`: true; product page shows `Sale Out Of Stock`.
- **HDMI ARC vs. `hdmi-earc` mapping** — the source says `HDMI ARC`, not `HDMI eARC`. The schema's `inputs` enum contains only `hdmi-earc`; `hdmi-earc` is recorded with this note.
- **Outputs field scope** — the RS150B is a network streamer/DAC with pre-outs, but the schema's `outputs` field is domain-gated to amplifier-type `deviceType`s. The pre-outs are real and sourced, so they are recorded with this note.
