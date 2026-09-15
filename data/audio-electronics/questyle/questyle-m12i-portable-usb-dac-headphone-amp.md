---
product_id: "Pn6oyV4Ks5AcNbecjgsda0"
product_slug: "questyle-m12i-portable-usb-dac-headphone-amp"
brand: "Questyle"
name: "Questyle M12i Portable USB DAC & Headphone Amp"
slice: "audio-electronics"
spec_fields:
  customerRating: null
  condition: null
  dealsDiscount: null
  newArrival: null
  awards: []
  deviceType: "dac"
  deviceConnectivity: "wired"
  amplification: null
  powerOutputPerChannelW: null
  channelCount: null
  outputs: null
  phonoStageBuiltIn: null
  trigger12v: null
  remoteControlIncluded: null
  inputs:
    - "usb"
  maxSampleRateBitDepth: "PCM 44.1kHz - 768kHz (16/24/32Bit)"
  dsdSupport: "dsd256-plus"
  hiResCertification: null
  dacChipsetFamily:
    - "ess-sabre"
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
    - "Black"
  rackMountable19: false
  countryOfManufacture: null
source_urls:
  - "https://audio46.com/products/questyle-m12i-portable-dac-amp"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **deviceType** (marketing-fact): "dac" — Audio46 product title: "Questyle M12i Portable DAC/Amp"; the page describes it as a "Mobile Headphone Amplifier with DAC" — https://audio46.com/products/questyle-m12i-portable-dac-amp
- **deviceConnectivity** (marketing-fact): "wired" — no Bluetooth or Wi-Fi/networking is listed; it connects via USB-C to phones/tablets/PC — https://audio46.com/products/questyle-m12i-portable-dac-amp
- **inputs** (hard-spec): ["usb"] — the specifications state the M12i uses the "ESS flagship USB DAC chip, ES9281AC" and the "In the Box" list includes "Type-C to Type-C Cable" and "Type-C to USB-A Cable" — https://audio46.com/products/questyle-m12i-portable-dac-amp
- **maxSampleRateBitDepth** (hard-spec): "PCM 44.1kHz - 768kHz (16/24/32Bit)" — Audio46 SPECIFICATIONS / D/A converting Capability: "PCM: 44.1kHz - 768kHz (16/24/32Bit)" — https://audio46.com/products/questyle-m12i-portable-dac-amp
- **dsdSupport** (hard-spec): "dsd256-plus" — Audio46 SPECIFICATIONS / D/A converting Capability: "DSD: DSD64(1Bit 2.8MHz), DSD128(1Bit 5.6MHz), DSD256(1Bit 11.2MHz), DSD512(1Bit 22.4MHz)"; the schema top bucket is "dsd256-plus" — https://audio46.com/products/questyle-m12i-portable-dac-amp
- **dacChipsetFamily** (hard-spec): ["ess-sabre"] — Audio46 SPECIFICATIONS: "DAC: ESS Flagship USB DAC ES9281AC" — https://audio46.com/products/questyle-m12i-portable-dac-amp
- **finishColor** (marketing-fact): ["Black"] — Audio46 SPECIFICATIONS: "Exterior Material: CNC Anodized Black Aluminum Alloy" — https://audio46.com/products/questyle-m12i-portable-dac-amp
- **awards** (marketing-fact): [] — no named awards or editor recognitions are listed on the manufacturer-provided Audio46 page
- **customerRating**, **condition**, **dealsDiscount**, **newArrival** (internal): null — store-operational fields, not individually sourced
- **amplification**, **powerOutputPerChannelW**, **channelCount**, **outputs**, **phonoStageBuiltIn**, **trigger12v**, **remoteControlIncluded** (n/a): null — domain-gated to amplifier `deviceType` values; this product is a `dac`
- **bluetoothCodecs**, **voiceAssistant**, **multiroomSupport** (n/a): null — domain-gated to non-wired `deviceConnectivity` values; `deviceConnectivity` is "wired"
- **driveType**, **turntableOperation**, **speedsSupported**, **phonoPreampBuiltIn**, **cartridgeIncluded**, **usbDigitalOutput** (n/a): null — domain-gated to `deviceType: turntable`
- **rackMountable19** (marketing-fact): false — no 19" rack-mounting claim; it is a portable dongle DAC
- **countryOfManufacture** (marketing-fact): null — no explicit "Made in ..." statement on the source

## Conflict / Caution Notes

- The M12i and M15i use the same ESS ES9281AC DAC and share the same PCM/DSD maximums, but the M12i is a single-ended 3.5mm dongle with automatic gain, while the M15i adds a 4.4mm balanced output and manual gain.
- The `outputs` filter field is domain-gated to amplifier `deviceType`s, so this DAC/amp's 3.5mm headphone output is not captured by that facet.
