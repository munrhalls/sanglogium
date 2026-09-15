---
product_id: "k27n1AQuIbSr5iozG1vMai"
product_slug: "chord-electronics-qutest"
brand: "Chord Electronics"
name: "Chord Electronics Qutest"
slice: "audio-electronics"
price: 159500
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
  deviceConnectivity: "wired"
  formFactor: "desktop"
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
  outputs: null
  maxSampleRateBitDepth: "44.1kHz to 768kHz - 16-bit to 32-bit"
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
    - "Jett Black"
  rackMountable19: false
  countryOfManufacture: "England"
source_urls:
  - "https://chordelectronics.co.uk/product/qutest"
  - "https://chordelectronics.co.uk/wp-content/uploads/2018/01/Qutest-User-manual-2.1.pdf"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **deviceType** (hard-spec): `dac` — product page: "standalone desktop DAC" with no built-in headphone amplifier.
- **maxSampleRateBitDepth** (hard-spec): `44.1kHz to 768kHz - 16-bit to 32-bit` — Qutest user manual.
- **dsdSupport** (hard-spec): `dsd256-plus` — manual: "DSD 64 - DSD 256 via DoP, native DSD up to DSD 512".
- **inputs** (hard-spec): `usb`, `optical`, `coaxial` — page: "USB Type-B, two BNC coax, optical"; manual confirms dual BNC `coaxial`.
- **finishColor** (marketing-fact): `Jett Black` — page: "Available only in Jett Black".
- **countryOfManufacture** (hard-spec): `England` — manual: "developed and manufactured by Chord Electronics in Kent, England".
- **awards** (marketing-fact): `What Hi-Fi? Best DAC` — page lists What Hi-Fi? Best DAC wins.
- **dacChipsetFamily**: `null` — the manual mentions a custom Xilinx Artix 7 FPGA, which is not one of the schema enum values (ESS Sabre, AKM, Cirrus Logic, R-2R/Ladder).

## Conflict / Caution Notes

- Qutest has stereo RCA analogue outputs, but the `outputs` field is domain-gated to amplifier `deviceType` values, so the line-out is not captured.
- The product page mentions "Roon tested", but the schema streaming-platform option is `roon-ready`; because the source says "tested" rather than "Ready", Roon is not recorded in `streamingPlatformSupport`.
