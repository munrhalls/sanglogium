---
product_id: "PHPYj28HJdPDHAaIBCgaYO"
product_slug: "chord-electronics-anni"
brand: "Chord Electronics"
name: "Chord Electronics Anni"
slice: "audio-electronics"
price: 197500
spec_fields:
  brand:
    - "chord-electronics"
  customerRating: null
  condition: null
  inStock: null
  dealsDiscount: null
  newArrival: null
  awards: []
  deviceType: "integrated-amplifier"
  deviceConnectivity: "wired"
  formFactor: "desktop"
  amplification: "solid-state"
  dacIncluded: false
  balancedOutput: false
  powerOutputPerChannelW: 10
  channelCount:
    - "2.0"
  phonoStageBuiltIn: "none"
  trigger12v: false
  remoteControlIncluded: false
  inputs:
    - "rca"
  outputs:
    - "headphone-jack"
    - "speaker-terminals"
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
  bluetoothCodecs: null
  voiceAssistant: null
  multiroomSupport: null
  finishColor: null
  rackMountable19: false
  countryOfManufacture: null
source_urls:
  - "https://chordelectronics.co.uk/product/anni"
  - "https://chordelectronics.co.uk/wp-content/uploads/2021/09/Anni-user-manual-V1.1.pdf"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **deviceType** (hard-spec): `integrated-amplifier` — product page: "desktop integrated amplifier" with volume control and input selector driving speakers and headphones.
- **amplification** (hard-spec): `solid-state` — page describes "Dual Feed Forward" / "Class AB Sliding Bias" ULTIMA topology, which is solid-state.
- **powerOutputPerChannelW** (hard-spec): `10` — page: "10 w into 8Ω".
- **channelCount** (hard-spec): `2.0` — stereo integrated amplifier.
- **inputs** (hard-spec): `rca` — page: "Unbalanced RCA Inverted Inputs" for the two line-level inputs.
- **outputs** (hard-spec): `headphone-jack`, `speaker-terminals` — page: "3.5 mm and 6.35 mm headphone jack outputs" and "4 mm (banana) loudspeaker outputs".
- **phonoStageBuiltIn** (hard-spec): `none` — page mentions a separate "Huei phono stage"; no built-in phono stage on Anni.
- **trigger12v** and **remoteControlIncluded**: `false` — no 12V trigger or remote control mentioned on the page or in the manual.
- **finishColor** and **countryOfManufacture**: `null` — no explicit finish list or "Made in..." statement found.

## Conflict / Caution Notes

- Anni is described as a "desktop integrated amplifier". The schema does not have a dedicated headphone-amplifier `deviceType`; the `integrated-amplifier` value is the closest fit.
