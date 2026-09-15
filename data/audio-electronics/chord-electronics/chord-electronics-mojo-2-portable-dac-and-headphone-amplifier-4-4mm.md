---
product_id: "Pn6oyV4Ks5AcNbecjgsEF8"
product_slug: "chord-electronics-mojo-2-portable-dac-and-headphone-amplifier-4-4mm"
brand: "Chord Electronics"
name: "Chord Electronics Mojo 2 Portable DAC and Headphone Amplifier (4.4mm)"
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
    - "What Hi-Fi? Best DAC"
    - "What Hi-Fi? Product of the Year"
  deviceType: "dac"
  deviceConnectivity: "wired"
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
  outputs: null
  maxSampleRateBitDepth: "768 kHz 32-bit"
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
  finishColor: null
  rackMountable19: false
  countryOfManufacture: "UK"
source_urls:
  - "https://chordelectronics.co.uk/product/mojo-2"
  - "https://chordelectronics.co.uk/wp-content/uploads/2022/01/Mojo-2-4.4-user-manual.pdf"
  - "https://chordelectronics.co.uk/the-mojo-2-gets-key-updates"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **deviceType** (hard-spec): `dac` — product page: "portable DAC and headphone amplifier".
- **maxSampleRateBitDepth** (hard-spec): `768 kHz 32-bit` — Mojo 2 (4.4mm) user manual.
- **dsdSupport** (hard-spec): `dsd256-plus` — manual: "capable of playing files up to 768 kHz 32-bit and DSD 256".
- **inputs** (hard-spec): `usb`, `optical`, `coaxial` — manual lists "3.5 mm coaxial, USB-C, Micro-USB, optical"; both USB-C and Micro-USB map to `usb`.
- **awards** (marketing-fact): `What Hi-Fi? Best DAC`, `What Hi-Fi? Product of the Year` — product page: "Multiple winner of 'Best DAC' ... and 'Product of the Year'".
- **countryOfManufacture** (marketing-fact): `UK` — product page: "Handmade in the UK".
- **finishColor**: `null` — no explicit finish list in the manufacturer page or manual.

## Conflict / Caution Notes

- Mojo 2 has 3.5mm/4.4mm headphone outputs, but the `outputs` field is domain-gated to amplifier `deviceType` values in the schema and cannot be recorded here.
- The manufacturer page at /product/mojo-2 currently describes the 4.4mm variant; this is the 4.4mm product record.
