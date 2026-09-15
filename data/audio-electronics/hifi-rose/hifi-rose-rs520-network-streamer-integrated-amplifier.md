---
product_id: PHPYj28HJdPDHAaIBAL1Lw
product_slug: hifi-rose-rs520-network-streamer-integrated-amplifier
brand: "HiFi Rose"
name: "HiFi Rose RS520 Network Streamer & Integrated Amplifier"
slice: audio-electronics
spec_fields:
  price:
    min: 3695
    max: 3695
    currency: USD
  customerRating: null
  awards:
    - "The Absolute Sound Buyer's Guide Pick 2024"
  condition: null
  inStock: true
  dealsDiscount: null
  newArrival: null
  deviceType: integrated-amplifier
  deviceConnectivity: wired-wireless
  formFactor: desktop
  amplification: class-d
  dacIncluded: true
  balancedOutput: false
  powerOutputPerChannelW: 250
  channelCount: 2.0
  phonoStageBuiltIn: null
  trigger12v: true
  remoteControlIncluded: true
  inputs:
    - optical
    - coaxial
    - rca
    - usb
    - hdmi-earc
  outputs:
    - pre-out-rca
    - speaker-terminals
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
  countryOfManufacture: "Republic of Korea"
source_urls:
  - "https://www.hifiroseusa.com/products/rs520-wireless-network-streamer-integrated-amplifier"
  - "https://www.sarte-audio.com/sites/default/files/manuales/RS520_Owners_Manual%2860201P-0006BA%29_en_220928.pdf"
  - "https://2tdmkpky.api.sanity.io/v2023-05-03/data/query/production?query=*%5B_id%3D%3D%22PHPYj28HJdPDHAaIBAL1Lw%22%5D%7Bprice_data%2Cstock%2CreservedStock%2CfilterAttributes%7D"
  - "https://cdn.shopify.com/s/files/1/0631/7608/1655/files/RS520_brochure_A4_8p_220913-en.pdf?v=1667224865"
verified_at: 2026-09-14
data_status: COMPLETE
---

## Verification Notes

**price** (internal / store record): `{min: 3695, max: 3695, currency: "USD"}` — from live Sanity product record (`price_data.unit_amount`: 369500, `stock`: 31, `inStock`: true). The manufacturer/distributor product page lists `$3,995.00 USD`; the live catalogue price is recorded here and the conflict is noted below.
- **customerRating** (marketing-fact): `null` — no aggregate customer star rating is shown; reviews section only lists press quotes.
- **awards** (marketing-fact): `["The Absolute Sound Buyer's Guide Pick 2024"]` — the product page lists a `The Absolute Sound` 2024 entry with a `Buyer&apos;s Guide Pick` badge.
- **condition** / **dealsDiscount** / **newArrival** (store-operational): `null` — no condition, sale/clearance, or new-arrival flag is stated in the live store record.
- **inStock** (internal / store record): `true` — live Sanity record shows `stock`: 31 and `inStock`: true. The product page shows `Out Of Stock` for the US distributor; this conflict is noted below.
- **deviceType** (marketing-fact): `"integrated-amplifier"` — the manufacturer product page title is `RS520 Wireless Network Streamer & Integrated Amplifier` and the spec table lists 250 W x 2ch speaker output. The device is also a network streamer and DAC; because the schema allows only one primary `deviceType`, `integrated-amplifier` is chosen and the streaming/DAC functions are captured in `streamingPlatformSupport`, `networkConnection`, and `dacChipsetFamily`.
- **deviceConnectivity** (marketing-fact): `"wired-wireless"` — product page lists `Ethernet: 10/100/1000 BASE-T`, `WiFi: 802.11ac Dualband USB Wireless LAN Card (Dongle)`, and `Bluetooth 4.2 (Via USB Dongle)`.
- **formFactor** (marketing-fact): `"desktop"` — listed as a desktop all-in-one component.
- **amplification** (marketing-fact): `"class-d"` — the brochure/manufacturer page describes a `Class AD amplifier module developed by applying new material GaN FET`; the schema value `class-d` is the closest controlled-vocabulary match, noted as a brand-specific term in the conflict section.
- **dacIncluded** (marketing-fact): `true` — the product page and brochure state the RS520 is an `all-in-one product with built-in network player, DAC, and amplifier` and is `equipped with ES9038PRO`.
- **balancedOutput** (hard-spec): `false` — the product page lists `Preamp-Out x 1` and the manual shows `Preamp GND Output(R,L)`; no balanced XLR pre-out is listed.
- **powerOutputPerChannelW** (hard-spec): `250` — the product page spec table states `FTC Power Output Rating (RMS): 250W x 2ch (8Ω, 20Hz-20kHz, THD 0.05%)`. The legacy Sanity overview text claims 200 W per channel; this conflict is noted below.
- **channelCount** (hard-spec): `"2.0"` — the spec table lists `2ch` / `2ch stereo`.
- **phonoStageBuiltIn** (hard-spec): `null` — the product page and first page of the manual list `Line-In` only; a later page in the same multi-product manual contains the line `Line1, Line2, Line3(Bypass), Balanced, Phono(MM/MC)` in a table that also references other models, so it cannot be confidently attributed to the RS520 alone. Recorded as `null` with the conflict noted below.
- **trigger12v** (hard-spec): `true` — the manual's rear-panel description and text include `TRIGGER In/Out` ports.
- **remoteControlIncluded** (marketing-fact): `true` — the product page states `Remote control: BT Remote controller` and the accessories include a `Bluetooth Remote Controller x 1`.
- **inputs** (hard-spec): `["optical", "coaxial", "rca", "usb", "hdmi-earc"]` — product page spec table: `Audio input: Optical x 1, Coaxial x 1, Line-In x 1, USB DAC x 1, eARC x 1`.
- **outputs** (hard-spec): `["pre-out-rca", "speaker-terminals"]` — product page: `Audio output: Optical x 1, Coaxial x 1, Preamp-Out x 1`; manual/brochure show `Speaker Output(L/R)`. Digital outputs are present but not in the schema's output enum; the schema output types are recorded.
- **maxSampleRateBitDepth** (hard-spec): `"32-bit/768kHz"` — product page: `PCM: 8kHz~768kHz (8/16/24/32bit per Sample)`.
- **dsdSupport** (hard-spec): `"dsd256-plus"` — product page: `Native DSD: DSD64(2.8MHz)/DSD128(5.6MHz)/DSD256(11.2MHz)/DSD512(22.4MHz)`.
- **hiResCertification** (marketing-fact): `["mqa", "hi-res-audio"]` — product page lists `MQA` in the codec list and describes `MQA Full Decoder` support; `Hi-Res Certified` is stated in the `At A Glance` list.
- **dacChipsetFamily** (hard-spec): `"ess-sabre"` — product page/brochure: `ESS technology, ES9038PRO`.
- **streamingPlatformSupport** (marketing-fact): `["dlna", "roon-ready", "spotify-connect"]` — product page spec table: `Streaming: Airplay / DLNA / Roon Ready / Spotify Connect / Bluetooth`. `airplay2` is not stated; the source only says `Airplay`.
- **networkConnection** (marketing-fact): `["wifi", "ethernet"]` — product page lists `Ethernet: 10/100/1000 BASE-T` and `WiFi: 802.11ac Dualband USB Wireless LAN Card (Dongle)`.
- **driveType**, **turntableOperation**, **speedsSupported**, **phonoPreampBuiltIn**, **cartridgeIncluded**, **usbDigitalOutput** (hard-spec/marketing-fact): `null` — this is not a turntable.
- **bluetoothCodecs** (marketing-fact): `null` — Bluetooth is supported via a USB dongle; no specific codec list is provided.
- **voiceAssistant** / **multiroomSupport** (marketing-fact): `null` — no Alexa, Google Assistant, or multiroom feature is stated.
- **finishColor** (marketing-fact): `["Silver", "Black"]` — product page shows `Color Silver Black` with `Silver` and `Black` variants.
- **rackMountable19** (marketing-fact): `false` — no 19" rack-mounting claim or hardware is listed.
- **countryOfManufacture** (hard-spec): `"Republic of Korea"` — manual: `Manufacturer/Country of Manufacture: CI TECH Co., Ltd. / Republic of Korea` (certification section `R-R-SYH-520`).

## Conflict / Caution Notes

**Price conflict** — live Sanity store record lists `$3695.00` (`price_data.unit_amount: 369500`); the manufacturer/distributor product page lists `$3,995.00 USD` regular price. The live catalogue record is recorded as the authoritative store price; the product page price is a distributor-side figure.
- **In-stock conflict** — Sanity shows `stock: 31` and `inStock: true`; the product page shows `Out Of Stock` and `Not currently sold online. For sales information please contact: sales@hifirose.com`. The live store availability is recorded; the product page reflects the US distributor's inventory status.
- **Power output conflict** — the current product page and spec table state `250W x 2ch (8Ω, 20Hz-20kHz, THD 0.05%)`. The legacy Sanity overview text and some retailer materials claim `200 watts per channel into 8 ohms`. The more current live manufacturer page is authoritative, so `250` is recorded.
- **Phono-stage ambiguity** — the Sarte-sourced manual's first product page for the RS520 lists only `Line In`. A later multi-product comparison page in the same PDF includes `Line1, Line2, Line3(Bypass), Balanced, Phono(MM/MC)`; that page also references other HiFi Rose models, so it is not a definitive RS520-only statement and the field is left `null`.
- **Amplifier topology note** — the source uses the brand term `Class AD` (with GaN FET). The schema's controlled vocabulary has `class-d`, so `class-d` is recorded with this note.
