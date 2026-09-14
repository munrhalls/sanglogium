---
product_id: xMEqvkRBbdrlJXyFG8fV4x
product_slug: yulong-daart-d39-ess9039pro-music-streamer-desktop-dac
brand: Yulong
name: YULONG DAART D39 ESS9039PRO Music Streamer & Desktop DAC
slice: audio-electronics
spec_fields:
  customerRating: null
  awards: []
  condition: null
  dealsDiscount: null
  newArrival: null
  deviceType: network-streamer
  deviceConnectivity: wifi-networked
  amplification: null
  powerOutputPerChannelW: null
  channelCount: null
  phonoStageBuiltIn: null
  trigger12v: null
  remoteControlIncluded: null
  inputs:
  - ethernet-lan
  - usb
  - aes-ebu
  - coaxial
  - optical
  outputs: null
  maxSampleRateBitDepth: 32-bit/768kHz
  dsdSupport: dsd256-plus
  hiResCertification: []
  dacChipsetFamily: ess-sabre
  streamingPlatformSupport:
  - airplay2
  - dlna
  networkConnection:
  - ethernet
  driveType: null
  turntableOperation: null
  speedsSupported: null
  phonoPreampBuiltIn: null
  cartridgeIncluded: null
  usbDigitalOutput: null
  bluetoothCodecs: []
  voiceAssistant: []
  multiroomSupport: false
  finishColor:
  - black
  - silver
  - red
  rackMountable19: false
  countryOfManufacture: China
source_urls:
- http://www.yulongaudio.com/pd.jsp?id=58
- https://apos.audio/products/yulong-daart-d39-ess9039pro-music-streamer-desktop-dac
verified_at: '2026-09-14'
data_status: COMPLETE
---

## Verification Notes
- **deviceType** (marketing-fact): Manufacturer product page title: "D39 Streaming DAC" and Apos: "Music Streamer & Desktop DAC" → network streamer.
- **deviceConnectivity** (marketing-fact): Apos: "network-enabled DAC" with "Network, USB, AES, Coaxial, Optical" inputs → Wi-Fi/Networked.
- **inputs** (hard-spec): Apos spec block: "Digital inputs: Network, USB, AES, Coaxial, Optical".
- **maxSampleRateBitDepth** (hard-spec): Apos: "Supported formats (USB/NET): PCM 32-bit/768kHz" (highest supported format).
- **dsdSupport** (hard-spec): Apos: "DSD64/128/256/512/1024 (DoP and native)" over USB/NET → schema max enum dsd256-plus.
- **dacChipsetFamily** (hard-spec): Apos: "ESS9039PRO" DAC chip → ess-sabre.
- **streamingPlatformSupport** (marketing-fact): Apos: "Airplay2, DLNA, Roon Bridge, HQ NAA, Spotify, Squeezelite, Daphile, LMS" — only airplay2 and dlna map exactly to schema enum.
- **networkConnection** (marketing-fact): Apos: "Digital inputs: Network" and "gigabit network port" → ethernet.
- **bluetoothCodecs** (marketing-fact): No Bluetooth capability described in source.
- **multiroomSupport** (marketing-fact): No multi-room feature mentioned; set to false per marketable-feature absence.
- **finishColor** (marketing-fact): Apos: "Color: Black Silver Red".
- **rackMountable19** (marketing-fact): Desktop chassis (248x210x60mm); no 19" rack-mount feature described.
- **countryOfManufacture** (marketing-fact): Product page footer lists company address in Shenzhen, China.
- **outputs** (conflict): Apos lists RCA/XLR analog outputs, but the schema `outputs` field is domain-gated to amplifier deviceTypes; recorded as null with this note.

## Domain / Out-of-Scope Notes
- Fields that are null because they are gated to product categories or connectivity types this product does not match (e.g. turntable fields, amplification outputs for `dac` deviceType) are explicitly recorded as null rather than omitted.
- Manufacturer English pages for Aurora, Asura, A39, and D39 returned an empty product-detail body, so the audited Apos retailer product page was used for hard spec values; the manufacturer page is still cited for product identity and brand/address.
- Canary II and Aquila II have usable manufacturer English pages and are primarily sourced from those; Apos is cited only for `finishColor` because the manufacturer pages do not list colors.
