---
product_id: GPjMdcfFWZVrKyR2PB5Tcg
product_slug: yulong-daart-asura-music-streamer-desktop-dac-headphone-amplifier
brand: Yulong
name: YULONG DAART Asura Music Streamer & Desktop DAC & Headphone Amplifier
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
  - optical
  - usb
  - coaxial
  outputs: null
  maxSampleRateBitDepth: 32-bit/1536kHz
  dsdSupport: dsd256-plus
  hiResCertification: []
  dacChipsetFamily: akm
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
- http://www.yulongaudio.com/pd.jsp?id=55
- https://apos.audio/products/yulong-daart-asura-ak4499ex-ak4191-music-streamer-desktop-dac-headphone-amplifier
verified_at: '2026-09-14'
data_status: COMPLETE
---

## Verification Notes
- **deviceType** (marketing-fact): Manufacturer product page title: "ASURA all-in-one Network Streaming, headphone amp, preamp" and Apos: "network streaming player" — primary category is network streamer.
- **deviceConnectivity** (marketing-fact): Apos: "Coaxial, Optical, USB, and LAN inputs" and "network streaming player" → Wi-Fi/Networked.
- **inputs** (hard-spec): Apos spec block: "NET, Optical: PCM up to 24-bit/192kHz; USB: PCM up to 32-bit/1536kHz; Coaxial: PCM up to 24-bit/384kHz".
- **maxSampleRateBitDepth** (hard-spec): Apos: "USB: PCM up to 32-bit/1536kHz" (highest supported format).
- **dsdSupport** (hard-spec): Apos: "USB: ... native DSD64–1024" → schema max enum dsd256-plus.
- **dacChipsetFamily** (hard-spec): Apos: "AK4499EX DAC chip, working in tandem with the AK4191 modulator" → AKM family.
- **streamingPlatformSupport** (marketing-fact): Apos: "Airplay2, DLNA, Roon Bridge, HQ NAA, Spotify, Squeezelite, Daphile, LMS" — only airplay2 and dlna map exactly to schema enum; Roon Bridge / Spotify / etc. do not map to roon-ready / spotify-connect.
- **networkConnection** (marketing-fact): Apos: "NET", "LAN" inputs and "gigabit network port" → ethernet.
- **bluetoothCodecs** (marketing-fact): No Bluetooth capability described in source.
- **multiroomSupport** (marketing-fact): No multi-room feature mentioned; set to false per marketable-feature absence.
- **finishColor** (marketing-fact): Apos: "Color: Black Silver Red".
- **rackMountable19** (marketing-fact): Desktop chassis (248x210x60mm); no 19" rack-mount feature described.
- **countryOfManufacture** (marketing-fact): Product page footer lists company address in Shenzhen, China.
- **outputs** (conflict): Apos lists RCA/XLR pre-out and XLR4/6.35mm/4.4mm headphone outputs, but the schema `outputs` field is domain-gated to amplifier deviceTypes; recorded as null with this note.

## Domain / Out-of-Scope Notes
- Fields that are null because they are gated to product categories or connectivity types this product does not match (e.g. turntable fields, amplification outputs for `dac` deviceType) are explicitly recorded as null rather than omitted.
- Manufacturer English pages for Aurora, Asura, A39, and D39 returned an empty product-detail body, so the audited Apos retailer product page was used for hard spec values; the manufacturer page is still cited for product identity and brand/address.
- Canary II and Aquila II have usable manufacturer English pages and are primarily sourced from those; Apos is cited only for `finishColor` because the manufacturer pages do not list colors.
