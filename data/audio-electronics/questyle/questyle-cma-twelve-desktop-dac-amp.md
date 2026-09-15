---
product_id: "PHPYj28HJdPDHAaIBCgUJK"
product_slug: "questyle-cma-twelve-desktop-dac-amp"
brand: "Questyle"
name: "Questyle CMA Twelve Desktop DAC & Amp"
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
    - "optical"
    - "coaxial"
    - "aes-ebu"
  maxSampleRateBitDepth: "USB: 44.1kHz-384kHz/16Bit-32Bit; Optical/SPDIF/AES: 44.1kHz-192kHz/16Bit-24Bit"
  dsdSupport: "dsd256-plus"
  hiResCertification: null
  dacChipsetFamily:
    - "akm"
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
    - "Golden"
  rackMountable19: false
  countryOfManufacture: null
source_urls:
  - "https://audio46.com/products/questyle-cma-twelve-dac-headphone-amp"
  - "https://questyleshop.com/blogs/cma-twelve/headphone-guru-the-cma-twelve-s-layout-is-clean-with-top-quality-parts-used-throughout"
  - "https://headphones.com/products/questyle-cma-twelve"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **deviceType** (marketing-fact): "dac" — Headphones.com product title: "Questyle CMA Twelve Desktop DAC & Amp"; Audio46: "Questyle CMA Twelve DAC/Headphone Amp" — https://headphones.com/products/questyle-cma-twelve / https://audio46.com/products/questyle-cma-twelve-dac-headphone-amp
- **deviceConnectivity** (marketing-fact): "wired" — no Bluetooth, Wi-Fi or Ethernet is listed on the official product details; wired inputs are USB, optical, SPDIF and AES/EBU — https://audio46.com/products/questyle-cma-twelve-dac-headphone-amp
- **inputs** (hard-spec): ["usb", "optical", "coaxial", "aes-ebu"] — Audio46 specifications: "USB Type B Input: Support 44.1kHz-384kHz/16Bit-32Bit PCM and DSD Native DSD64, DSD128, DSD256, as well as DSD64, DSD128, DSD256 of DoP format"; "Digital Input & Output: SPDIF input and output, Optical input, AES/EBU input; Support 44.1kHz-192kHz/16Bit-24Bit PCM" — https://audio46.com/products/questyle-cma-twelve-dac-headphone-amp
- **maxSampleRateBitDepth** (hard-spec): "USB: 44.1kHz-384kHz/16Bit-32Bit; Optical/SPDIF/AES: 44.1kHz-192kHz/16Bit-24Bit" — derived directly from the Audio46 USB and digital-input spec quotes — https://audio46.com/products/questyle-cma-twelve-dac-headphone-amp
- **dsdSupport** (hard-spec): "dsd256-plus" — Audio46: "DSD Native DSD64, DSD128, DSD256, as well as DSD64, DSD128, DSD256 of DoP format"; the schema top bucket is "dsd256-plus" — https://audio46.com/products/questyle-cma-twelve-dac-headphone-amp
- **dacChipsetFamily** (hard-spec): ["akm"] — Questyle shop blog (manufacturer-hosted): "Flagship AKM 4490 DAC chips are supported by WIMA Capacitors..." — https://questyleshop.com/blogs/cma-twelve/headphone-guru-the-cma-twelve-s-layout-is-clean-with-top-quality-parts-used-throughout
- **finishColor** (marketing-fact): ["Black", "Golden"] — Audio46 specifications: "Finish: Black | Golden"; Questyle shop blog: "Produced in Black or Gold machined aluminum" — https://audio46.com/products/questyle-cma-twelve-dac-headphone-amp / https://questyleshop.com/blogs/cma-twelve/headphone-guru-the-cma-twelve-s-layout-is-clean-with-top-quality-parts-used-throughout
- **awards** (marketing-fact): [] — no named awards or editor recognitions are listed
- **customerRating**, **condition**, **dealsDiscount**, **newArrival** (internal): null — store-operational fields, not individually sourced
- **amplification**, **powerOutputPerChannelW**, **channelCount**, **outputs**, **phonoStageBuiltIn**, **trigger12v**, **remoteControlIncluded** (n/a): null — domain-gated to amplifier `deviceType` values in productType.ts; this product is a `dac`
- **bluetoothCodecs**, **voiceAssistant**, **multiroomSupport** (n/a): null — domain-gated to non-wired `deviceConnectivity` values; `deviceConnectivity` is "wired"
- **driveType**, **turntableOperation**, **speedsSupported**, **phonoPreampBuiltIn**, **cartridgeIncluded**, **usbDigitalOutput** (n/a): null — domain-gated to `deviceType: turntable`
- **rackMountable19** (marketing-fact): false — no 19" rack-mounting claim on any source; it is a desktop DAC/amp
- **countryOfManufacture** (marketing-fact): null — the Questyle shop blog mentions assembly at a Foxconn facility but does not state an explicit country of manufacture; the manufacturer manual PDF is image-based and could not be OCR'd

## Conflict / Caution Notes

- The official Questyle CMA Twelve manual PDF (https://questyle-en.oss-us-west-1.aliyuncs.com/User_Manual/CMA-Twelve-EN-181112.pdf) is image-based; `pdftotext` returned no extractable text, so it was not used as a primary source. The Audio46 product details (marked "Details provided by Questyle") and the Questyle shop blog were used instead.
- The `outputs` filter field is domain-gated to amplifier `deviceType`s, so the CMA Twelve's 4.4mm/4-pin/6.35mm headphone outputs and XLR/RCA pre-amp outputs are not captured by that facet.
