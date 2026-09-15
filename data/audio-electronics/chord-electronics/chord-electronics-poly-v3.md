---
product_id: "moXlkADK7m1DHgGwWwzejm"
product_slug: "chord-electronics-poly-v3"
brand: "Chord Electronics"
name: "Chord Electronics Poly V3"
slice: "audio-electronics"
price: 65000
spec_fields:
  brand:
    - "chord-electronics"
  customerRating: null
  condition: null
  inStock: null
  dealsDiscount: null
  newArrival: null
  awards:
    - "Gramophone Product of the Month"
  deviceType: "network-streamer"
  deviceConnectivity: "wifi-networked"
  formFactor: "portable"
  amplification: null
  dacIncluded: false
  balancedOutput: false
  powerOutputPerChannelW: null
  channelCount: null
  phonoStageBuiltIn: null
  trigger12v: null
  remoteControlIncluded: null
  inputs:
    - "bluetooth"
  outputs: null
  maxSampleRateBitDepth: "768kHz"
  dsdSupport: "dsd256-plus"
  hiResCertification: []
  dacChipsetFamily: []
  streamingPlatformSupport:
    - "dlna"
    - "roon-ready"
  networkConnection:
    - "wifi"
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
  - "https://chordelectronics.co.uk/product/chord-electronics-poly"
  - "https://chordelectronics.co.uk/wp-content/uploads/2017/01/Poly-User-manual-v3.3.pdf"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **deviceType** (hard-spec): `network-streamer` — product page: "portable music streamer/player" for Mojo 2 / Mojo.
- **deviceConnectivity** (hard-spec): `wifi-networked` — page lists Wi-Fi, Bluetooth, AirPlay, DLNA, Roon.
- **maxSampleRateBitDepth** (hard-spec): `768kHz` — page: "PCM data up to 768kHz resolution".
- **dsdSupport** (hard-spec): `dsd256-plus` — page: "DSD64 to DSD256 (Quad-DSD)".
- **inputs** (hard-spec): `bluetooth` — page lists Bluetooth wireless technology; Wi-Fi is captured under `networkConnection`.
- **streamingPlatformSupport** (hard-spec): `dlna`, `roon-ready` — page: "Roon Ready" and "DLNA streamer/server".
- **networkConnection** (hard-spec): `wifi` — page: "Long range WiFi (2.4GHz) streaming"; no Ethernet.
- **finishColor** (marketing-fact): `Black` — page: "black anodised aluminium casing".
- **awards** (marketing-fact): `Gramophone Product of the Month` — product page downloads list "Gramophone-Product-of-the-Month-Chord-Poly.pdf".
- **countryOfManufacture**: `null` — no "Made in..." statement found.

## Conflict / Caution Notes

- The page mentions "Airplay playback" but does not specify AirPlay 2; the `airplay2` schema option is therefore not recorded.
- Poly is a streamer add-on with no built-in DAC, so `dacChipsetFamily` is `[]` (none).
