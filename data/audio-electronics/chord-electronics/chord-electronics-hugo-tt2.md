---
product_id: "moXlkADK7m1DHgGwWwEfPD"
product_slug: "chord-electronics-hugo-tt2"
brand: "Chord Electronics"
name: "Chord Electronics Hugo TT2"
slice: "audio-electronics"
price: 529500
spec_fields:
  brand:
    - "chord-electronics"
  customerRating: null
  condition: null
  inStock: null
  dealsDiscount: null
  newArrival: null
  awards: []
  deviceType: "dac"
  deviceConnectivity: "wired"
  formFactor: "desktop"
  amplification: null
  dacIncluded: true
  balancedOutput: true
  powerOutputPerChannelW: null
  channelCount: null
  phonoStageBuiltIn: null
  trigger12v: null
  remoteControlIncluded: null
  inputs:
    - "usb"
    - "optical"
    - "coaxial"
  outputs: null
  maxSampleRateBitDepth: "768kHz 32-bit"
  dsdSupport: "dsd256-plus"
  hiResCertification: []
  dacChipsetFamily: null
  streamingPlatformSupport: []
  networkConnection: []
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
    - "Silver"
    - "Black"
  rackMountable19: false
  countryOfManufacture: null
source_urls:
  - "https://chordelectronics.co.uk/product/hugott2"
  - "https://chordelectronics.co.uk/wp-content/uploads/2018/05/Hugo-TT-2-User-manual-V1.9.2.pdf"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **deviceType** (hard-spec): `dac` — product page: "DAC, preamplifier, and headphone amplifier".
- **deviceConnectivity** (hard-spec): `wired` — page lists only wired inputs (USB-B, BNC, optical).
- **maxSampleRateBitDepth** (hard-spec): `768kHz 32-bit` — manual: "capable of playing files up to 768kHz 32-bit".
- **dsdSupport** (hard-spec): `dsd256-plus` — manual: "DSD64 to DSD512".
- **inputs** (hard-spec): `usb`, `optical`, `coaxial` — page: "1 × USB Type-B, 2 × coaxial BNC, 2 × optical"; the two BNC/optical inputs are still types `coaxial` and `optical`.
- **balancedOutput** (hard-spec): `true` — page lists "stereo XLR" output and manual confirms balanced XLR outputs.
- **finishColor** (marketing-fact): `Silver`, `Black` — page: "Available in silver and satin black".
- **countryOfManufacture**: `null` — no "Made in..." statement found in the manufacturer page or manual.

## Conflict / Caution Notes

- Hugo TT 2 includes an IR remote and multiple outputs (XLR, RCA, 6.35mm, 3.5mm), but `remoteControlIncluded` and `outputs` are domain-gated to amplifier `deviceType` values in the schema, so they cannot be recorded here.
- The product page and manual both call the device a "DAC, preamplifier, and headphone amplifier"; the schema does not have a combined DAC/preamp/headphone-amp `deviceType`, so `dac` is recorded.
