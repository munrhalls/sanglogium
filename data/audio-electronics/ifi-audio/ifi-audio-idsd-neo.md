---
product_id: "PHPYj28HJdPDHAaIBCgFZU"
product_slug: "ifi-audio-idsd-neo"
brand: "iFi Audio"
name: iFi Audio iDSD NEO
slice: "audio-electronics"
spec_fields:
  deviceType: dac
  deviceConnectivity: "wired-wireless"
  formFactor: desktop
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
    - "rca"
    - "bluetooth"
    - "xlr-balanced"
    - "phono-mm-mc"
  outputs:
    - "headphone-jack"
    - "headphone-jack"
    - "pre-out-rca"
    - "speaker-terminals"
  maxSampleRateBitDepth: null
  dsdSupport: null
  hiResCertification:
    - "hi-res-audio"
  dacChipsetFamily: null
  streamingPlatformSupport:
    - "roon-ready"
  networkConnection: null
  driveType: null
  turntableOperation: null
  speedsSupported: null
  phonoPreampBuiltIn: null
  cartridgeIncluded: null
  usbDigitalOutput: null
  bluetoothCodecs:
    - "SBC"
    - "AAC"
    - "aptX Adaptive"
    - "aptX"
    - "LDAC"
  voiceAssistant: null
  multiroomSupport: null
  finishColor:
    - "blue"
  rackMountable19: null
  countryOfManufacture: null
  awards: null
  customerRating: null
  condition: null
  dealsDiscount: null
  newArrival: null
source_urls:
  - "https://ifi-audio.com/products/neo-idsd-3"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes
- **inputs** (hard-spec): "Single-Ended RCA (L/R)" mapped to usb, optical, coaxial, rca, bluetooth, xlr-balanced, phono-mm-mc — https://ifi-audio.com/products/neo-idsd-3
- **outputs** (hard-spec): "Balanced 4.4mm; Single-Ended 6.3mm" mapped to headphone-jack, headphone-jack, pre-out-rca, speaker-terminals — https://ifi-audio.com/products/neo-idsd-3
- **bluetoothCodecs** (hard-spec): "aptX Lossless, aptX Adaptive, aptX, LDAC, LHDC/HWA, AAC, SBC" mapped to SBC, AAC, aptX Adaptive, aptX, LDAC — https://ifi-audio.com/products/neo-idsd-3
- **hiResCertification** (hard-spec): "hi-res-audio" — https://ifi-audio.com/products/neo-idsd-3
- **streamingPlatformSupport** (marketing-fact): "roon-ready" — https://ifi-audio.com/products/neo-idsd-3
- **finishColor** (marketing-fact): "blue" — https://ifi-audio.com/products/neo-idsd-3

## Conflict / Caution Notes
- **bluetoothCodecs**: source lists "aptX Lossless" but this value is not in the schema `bluetoothCodecs` enum; omitted rather than wrong-format.
