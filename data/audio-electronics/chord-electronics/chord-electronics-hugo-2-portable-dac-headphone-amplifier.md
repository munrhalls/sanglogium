---
product_id: "MrEMtYwMtrFDGWmRnN74UJ"
product_slug: "chord-electronics-hugo-2-portable-dac-headphone-amplifier"
brand: "Chord Electronics"
name: "Chord Electronics Hugo 2 Portable DAC & Headphone Amplifier"
slice: "audio-electronics"
price: 259500
spec_fields:
  brand:
    - "chord-electronics"
  customerRating: null
  condition: null
  inStock: null
  dealsDiscount: null
  newArrival: null
  awards:
    - "What Hi-Fi? Best DAC"
  deviceType: "dac"
  deviceConnectivity: "wired-wireless"
  formFactor: "portable"
  amplification: null
  dacIncluded: true
  balancedOutput: false
  powerOutputPerChannelW: null
  channelCount: null
  phonoStageBuiltIn: null
  trigger12v: null
  remoteControlIncluded: null
  inputs:
    - "usb"
    - "optical"
    - "coaxial"
    - "bluetooth"
  outputs: null
  maxSampleRateBitDepth: "44.1kHz to 768Khz - 16bit to 32bit"
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
  bluetoothCodecs:
    - "aptX"
  voiceAssistant: null
  multiroomSupport: null
  finishColor:
    - "Silver"
    - "Black"
  rackMountable19: false
  countryOfManufacture: "England"
source_urls:
  - "https://chordelectronics.co.uk/product/hugo-2"
  - "https://chordelectronics.co.uk/wp-content/uploads/2017/01/Hugo-2-User-Manual.pdf"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **deviceType** (hard-spec): `dac` — product page describes Hugo 2 as a "transportable DAC/headphone amplifier".
- **deviceConnectivity** (hard-spec): `wired-wireless` — product page lists wired inputs plus Bluetooth.
- **maxSampleRateBitDepth** (hard-spec): `44.1kHz to 768Khz - 16bit to 32bit` — Hugo 2 user manual.
- **dsdSupport** (hard-spec): `dsd256-plus` — manual: "Native DSD playback up to DSD512".
- **inputs** (hard-spec): `usb`, `optical`, `coaxial`, `bluetooth` — product page: "Four digital inputs including optical, coaxial, and HD USB, plus Bluetooth"; manual lists 3.5mm digital coax.
- **bluetoothCodecs** (hard-spec): `aptX` — product page: "Bluetooth® ( APTX )".
- **finishColor** (marketing-fact): `Silver`, `Black` — product page: "natural silver, and satin black".
- **countryOfManufacture** (hard-spec): `England` — manual: "Made in England".
- **awards** (marketing-fact): `What Hi-Fi? Best DAC` — product page lists "Winner of Best DAC (£1,500+) in the What Hi-Fi? Awards 2022" and prior wins.

## Conflict / Caution Notes

- Hugo 2 includes RCA/3.5mm/6.35mm analogue outputs and an IR remote, but the `outputs` and `remoteControlIncluded` fields are domain-gated to amplifier `deviceType` values in the schema, so they cannot be recorded here.
