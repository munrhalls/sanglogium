---
product_id: "MrEMtYwMtrFDGWmRnN7D4q"
product_slug: "questyle-m15i-usb-portable-dac-headphone-amplifier"
brand: "Questyle"
name: "Questyle M15i USB Portable DAC & Headphone Amplifier"
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
  maxSampleRateBitDepth: "PCM 44.1kHz – 768kHz (16/24/32Bit)"
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
  - "https://bloomaudio.com/products/questyle-m15i-portable-dac"
  - "https://headphones.com/products/questyle-m15-usb-portable-dac-headphone-amplifier"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **deviceType** (marketing-fact): "dac" — Bloom Audio product title calls it "Questyle M15i | Balanced Portable DAC and Amp" and the page describes it as a mobile headphone amplifier with DAC — https://bloomaudio.com/products/questyle-m15i-portable-dac
- **deviceConnectivity** (marketing-fact): "wired" — no Bluetooth or Wi-Fi/networking is listed; it connects via USB-C to phones/PC/Mac/iOS/Android — https://bloomaudio.com/products/questyle-m15i-portable-dac
- **inputs** (hard-spec): ["usb"] — the specifications list a "DAC Capability" section (PCM/DSD over USB) and the "In the Box" list includes "USB Type-C to Type-C Cable" and "USB Type-C to Type-A Cable" — https://bloomaudio.com/products/questyle-m15i-portable-dac
- **maxSampleRateBitDepth** (hard-spec): "PCM 44.1kHz – 768kHz (16/24/32Bit)" — Bloom Audio specifications: "DAC Capability / PCM: 44.1kHz – 768kHz (16/24/32Bit)" — https://bloomaudio.com/products/questyle-m15i-portable-dac
- **dsdSupport** (hard-spec): "dsd256-plus" — Bloom Audio specifications: "DSD: DSD64 (1Bit 2.8MHz), DSD128 (1Bit 5.6MHz), DSD256 (1Bit 11.2MHz), DSD512 (1Bit 22.4MHz)"; the schema top bucket is "dsd256-plus" — https://bloomaudio.com/products/questyle-m15i-portable-dac
- **dacChipsetFamily** (hard-spec): ["ess-sabre"] — Bloom Audio specifications: "DAC: ESS flagship USB DAC chip ES9281AC" — https://bloomaudio.com/products/questyle-m15i-portable-dac
- **hiResCertification** (marketing-fact): null — no MQA or JAS Hi-Res Audio certification is mentioned on the manufacturer or audited-retailer source; M15i dropped MQA support per ecoustics, but that source is not used for this field
- **finishColor** (marketing-fact): ["Black"] — Bloom Audio specifications: "Color: Black" and "CNC machined aluminum" — https://bloomaudio.com/products/questyle-m15i-portable-dac
- **awards** (marketing-fact): [] — no named awards or editor recognitions are listed on the manufacturer or audited-retailer pages
- **customerRating**, **condition**, **dealsDiscount**, **newArrival** (internal): null — store-operational fields, not individually sourced per sourcing-protocol.md
- **amplification**, **powerOutputPerChannelW**, **channelCount**, **outputs**, **phonoStageBuiltIn**, **trigger12v**, **remoteControlIncluded** (n/a): null — domain-gated to amplifier `deviceType` values in sanity-cms/schemaTypes/productType.ts; this product is a `dac`
- **bluetoothCodecs**, **voiceAssistant**, **multiroomSupport** (n/a): null — domain-gated to non-wired `deviceConnectivity` values; `deviceConnectivity` is "wired"
- **driveType**, **turntableOperation**, **speedsSupported**, **phonoPreampBuiltIn**, **cartridgeIncluded**, **usbDigitalOutput** (n/a): null — domain-gated to `deviceType: turntable`
- **rackMountable19** (marketing-fact): false — no 19" rack-mounting claim on any source; the product is a portable dongle-style DAC
- **countryOfManufacture** (marketing-fact): null — no explicit "Made in ..." or country-of-manufacture statement was found on the manufacturer or audited-retailer sources

## Conflict / Caution Notes

- The M15i shares its core specs with the M12i (both use the ESS ES9281AC and support PCM 768kHz/32-bit and DSD512) but is a distinct product (manual gain control and 4.4mm balanced output).
- The `outputs` and `remoteControlIncluded` fields are domain-gated to amplifier `deviceType`s, so this DAC/amp's 3.5mm/4.4mm headphone outputs and lack of a remote are not captured by those filter facets.
