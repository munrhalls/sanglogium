---
product_id: "MrEMtYwMtrFDGWmRnN7qVp"
product_slug: "chord-electronics-2go"
brand: "Chord Electronics"
name: "Chord Electronics 2go"
slice: "audio-electronics"
price: 150000
spec_fields:
  brand:
    - "chord-electronics"
  customerRating: null
  condition: null
  inStock: null
  dealsDiscount: null
  newArrival: null
  awards: []
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
    - "ethernet-lan"
    - "bluetooth"
  outputs: null
  maxSampleRateBitDepth: "44.1kHz – 768kHZ (16bit – 32bit)"
  dsdSupport: "dsd256-plus"
  hiResCertification: []
  dacChipsetFamily: []
  streamingPlatformSupport:
    - "dlna"
    - "roon-ready"
  networkConnection:
    - "wifi"
    - "ethernet"
  driveType: null
  turntableOperation: null
  speedsSupported: null
  phonoPreampBuiltIn: null
  cartridgeIncluded: null
  usbDigitalOutput: null
  bluetoothCodecs: null
  voiceAssistant: null
  multiroomSupport: null
  finishColor: null
  rackMountable19: false
  countryOfManufacture: null
source_urls:
  - "https://chordelectronics.co.uk/product/2go"
  - "https://chordelectronics.co.uk/wp-content/uploads/2020/02/2Go-user-manual.pdf"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **deviceType** (hard-spec): `network-streamer` — product page: "2go is a high-performance streamer/server that transforms the Hugo 2 DAC into a fully featured Wi-Fi- and Ethernet-enabled device".
- **deviceConnectivity** (hard-spec): `wifi-networked` — page lists Wi-Fi, Ethernet and Bluetooth.
- **maxSampleRateBitDepth** (hard-spec): `44.1kHz – 768kHZ (16bit – 32bit)` — product page.
- **dsdSupport** (hard-spec): `dsd256-plus` — page: "DSD 64 to DSD 256 (via DoP)".
- **inputs** (hard-spec): `ethernet-lan`, `bluetooth` — page lists "Gigabit (GbE) ethernet" and "Bluetooth® wireless technology".
- **streamingPlatformSupport** (hard-spec): `dlna`, `roon-ready` — page: "Roon ready", "DLNA streamer/server".
- **networkConnection** (hard-spec): `wifi`, `ethernet` — page lists "Long-range 2.4GHz WiFi" and "Gigabit (GbE) ethernet".
- **finishColor** and **countryOfManufacture**: `null` — no explicit finish or "Made in..." statement found in the manufacturer page or manual; "proprietary British technology" is marketing wording, not a country-of-manufacture claim.

## Conflict / Caution Notes

- The product page mentions "Airplay playback" and "Tidal, Qobuz and Internet radio playback" but does not specify AirPlay 2, TIDAL Connect, or Spotify Connect; only the schema-certain `dlna` and `roon-ready` values are recorded.
- 2go is a streamer add-on for Hugo 2; it has no DAC of its own, so `dacChipsetFamily` is recorded as `[]` (none).
