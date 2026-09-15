---
product_id: "k27n1AQuIbSr5iozG1vTNo"
product_slug: "questyle-m12i-portable-usb-dac-&-headphone-amp"
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

- This is the second Sanity catalogue entry for the same Questyle M12i product (a variant/listing with a different slug containing an ampersand). All spec values are identical to the first M12i entry because the same Audio46 product page (which carries manufacturer-provided details) was used.
- **deviceType** (marketing-fact): "dac" — see first M12i file; Audio46 product title: "Questyle M12i Portable DAC/Amp" — https://audio46.com/products/questyle-m12i-portable-dac-amp
- **deviceConnectivity** (marketing-fact): "wired" — no Bluetooth or Wi-Fi/networking is listed — https://audio46.com/products/questyle-m12i-portable-dac-amp
- **inputs** (hard-spec): ["usb"] — Audio46 page: M12i uses the "ESS flagship USB DAC chip, ES9281AC" and the box includes Type-C cables — https://audio46.com/products/questyle-m12i-portable-dac-amp
- **maxSampleRateBitDepth** (hard-spec): "PCM 44.1kHz - 768kHz (16/24/32Bit)" — Audio46 SPECIFICATIONS: "PCM: 44.1kHz - 768kHz (16/24/32Bit)" — https://audio46.com/products/questyle-m12i-portable-dac-amp
- **dsdSupport** (hard-spec): "dsd256-plus" — Audio46: "DSD: DSD64, DSD128, DSD256, DSD512" — https://audio46.com/products/questyle-m12i-portable-dac-amp
- **dacChipsetFamily** (hard-spec): ["ess-sabre"] — Audio46: "DAC: ESS Flagship USB DAC ES9281AC" — https://audio46.com/products/questyle-m12i-portable-dac-amp
- **finishColor** (marketing-fact): ["Black"] — Audio46 SPECIFICATIONS: "Exterior Material: CNC Anodized Black Aluminum Alloy" — https://audio46.com/products/questyle-m12i-portable-dac-amp
- **awards** (marketing-fact): [] — no named awards listed
- **customerRating**, **condition**, **dealsDiscount**, **newArrival** (internal): null — store-operational fields, not individually sourced
- **amplification**, **powerOutputPerChannelW**, **channelCount**, **outputs**, **phonoStageBuiltIn**, **trigger12v**, **remoteControlIncluded** (n/a): null — domain-gated to amplifier `deviceType` values; this product is a `dac`
- **bluetoothCodecs**, **voiceAssistant**, **multiroomSupport** (n/a): null — domain-gated to non-wired `deviceConnectivity` values; `deviceConnectivity` is "wired"
- **driveType**, **turntableOperation**, **speedsSupported**, **phonoPreampBuiltIn**, **cartridgeIncluded**, **usbDigitalOutput** (n/a): null — domain-gated to `deviceType: turntable`
- **rackMountable19** (marketing-fact): false — no 19" rack-mounting claim; portable dongle DAC
- **countryOfManufacture** (marketing-fact): null — no explicit "Made in ..." statement on the source

## Conflict / Caution Notes

- This file represents a duplicate/variant catalogue identity for the same Questyle M12i product. It was filed separately because the beads issue lists two distinct product IDs for the M12i.
- The `outputs` filter field is domain-gated to amplifier `deviceType`s, so this DAC/amp's 3.5mm headphone output is not captured.
