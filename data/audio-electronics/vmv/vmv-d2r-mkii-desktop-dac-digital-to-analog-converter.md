---
product_id: "DZc43yHr6ydfgE7zB41H2s"
product_slug: "vmv-d2r-mkii-desktop-dac-digital-to-analog-converter"
brand: "VMV"
name: "VMV D2R MKII Desktop DAC (Digital-to-Analog Converter)"
slice: "audio-electronics"
spec_fields:
  customerRating: null
  awards: []
  condition: null
  dealsDiscount: null
  newArrival: null
  deviceType: "dac"
  deviceConnectivity: "wired-wireless"
  amplification: null
  powerOutputPerChannelW: null
  channelCount: null
  inputs:
    - "usb"
    - "optical"
    - "coaxial"
    - "bluetooth"
    - "i2s-iis"
    - "aes-ebu"
  outputs: null
  phonoStageBuiltIn: null
  trigger12v: null
  remoteControlIncluded: true
  maxSampleRateBitDepth: "USB / I2S: PCM 44.1~768kHz (32bit); Optical / Coaxial / AES: PCM 44.1~192kHz (24bit)"
  dsdSupport: "dsd256-plus"
  hiResCertification:
    - "hi-res-audio"
    - "mqa"
  dacChipsetFamily: null
  streamingPlatformSupport: []
  networkConnection: []
  driveType: null
  turntableOperation: null
  speedsSupported: []
  phonoPreampBuiltIn: null
  cartridgeIncluded: null
  usbDigitalOutput: null
  bluetoothCodecs:
    - "SBC"
    - "AAC"
    - "aptX"
    - "aptX HD"
    - "LDAC"
  voiceAssistant: []
  multiroomSupport: false
  finishColor:
    - "Black"
  rackMountable19: false
  countryOfManufacture: null
source_urls:
  - "https://smsl.shop/products/vmv-d2rmk2"
  - "https://www.smsl-audio.com/portal/product/detail/id/745.html"
  - "https://www.smsl-audio.com/upload/portal/download/VMVD2RMK2Manual.pdf"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **deviceType** (marketing-fact): "dac" — product title and SMSL/VMV official shop call it a "Flagship High-Resolution Desktop DAC" and "digital-to-analog converter (DAC)" — https://smsl.shop/products/vmv-d2rmk2
- **deviceConnectivity** (marketing-fact): "wired-wireless" — inputs include USB-C, Optical, Coaxial, I2S (HDMI), AES/EBU and Bluetooth 5.4; no Wi-Fi/networked claim — https://smsl.shop/products/vmv-d2rmk2
- **inputs** (marketing-fact): ["usb", "optical", "coaxial", "bluetooth", "i2s-iis", "aes-ebu"] — official shop spec table lists "USB-C / Optical / Coaxial / I2S (HDMI) / Bluetooth / AES/EBU" — https://smsl.shop/products/vmv-d2rmk2
- **outputs** (marketing-fact): null — the should-be-audio-electronics.md `outputs` field is domain-gated to amplifier/receiver device types; the DAC has XLR and RCA analog line outputs ("Balanced (XLR) | Unbalanced (RCA)" per the official shop), but no should-be/schema field captures DAC analog outputs
- **remoteControlIncluded** (marketing-fact): true — manufacturer product page states "a full-function remote" and the manual states "Equipped with remote control and full-function remote control" — https://www.smsl-audio.com/portal/product/detail/id/745.html
- **maxSampleRateBitDepth** (hard-spec): "USB / I2S: PCM 44.1~768kHz (32bit); Optical / Coaxial / AES: PCM 44.1~192kHz (24bit)" — exact spec table from official shop — https://smsl.shop/products/vmv-d2rmk2
- **dsdSupport** (hard-spec): "dsd256-plus" — spec table lists native DSD up to DSD512 via USB/I²S and DoP 2.8224MHz via optical/coaxial/AES; DSD512 maps to the schema's top enum bucket "dsd256-plus" — https://smsl.shop/products/vmv-d2rmk2
- **hiResCertification** (marketing-fact): ["hi-res-audio", "mqa"] — product page states "JAS Hi-Res certified" and "Full MQA & MQA-CD Decoding on All Digital Inputs"; manual also states "Japan Audio Association (JAS) Hi-Res certification" and that USB/optical/coaxial/AES support MQA — https://www.smsl-audio.com/portal/product/detail/id/745.html
- **dacChipsetFamily** (hard-spec): null — source states ROHM BD34302EKV, which is not in the current schema enum (ess-sabre / akm / cirrus-logic / r2r-ladder); recorded as null, not force-fit
- **streamingPlatformSupport** (marketing-fact): [] — no AirPlay, Chromecast, Spotify Connect, TIDAL Connect, Roon Ready, or DLNA support is listed on the manufacturer product page or in the manual; Bluetooth is the only wireless source
- **networkConnection** (marketing-fact): [] — no Wi-Fi or Ethernet networking claim; Bluetooth is the only wireless input
- **bluetoothCodecs** (hard-spec): ["SBC", "AAC", "aptX", "aptX HD", "LDAC"] — official shop spec table: "Bluetooth 5.4 (Supports SBC, AAC, aptX, aptX HD, LDAC)" and manual lists the same set — https://smsl.shop/products/vmv-d2rmk2
- **voiceAssistant** (marketing-fact): [] — no Alexa or Google Assistant feature is mentioned
- **multiroomSupport** (marketing-fact): false — no multiroom / multi-zone claim appears on any manufacturer source
- **finishColor** (marketing-fact): ["Black"] — manufacturer product page lists "Colour: Black" — https://www.smsl-audio.com/portal/product/detail/id/745.html
- **rackMountable19** (marketing-fact): false — no 19-inch rack-mount claim on any manufacturer source; product is explicitly marketed as a desktop DAC
- **countryOfManufacture** (marketing-fact): null — manufacturer company (Foshan Shuangmusanlin technology Co., Ltd) appears in the manual footer, but no explicit "Country of Manufacture" or "Made in ..." statement was found
- **customerRating**, **condition**, **dealsDiscount**, **newArrival** (internal): null — store-operational fields, not individually sourced from the manufacturer
- **awards** (marketing-fact): [] — no named award, editor's choice, or recognition badge is listed on the manufacturer product page or in the manual

## Conflict / Caution Notes

- The manufacturer identifies the DAC chip as "ROHM BD34302EKV", which does not match the current `dacChipsetFamily` enum in `sanity-cms/schemaTypes/productType.ts` (ess-sabre, akm, cirrus-logic, r2r-ladder). This is recorded as null and flagged for a later schema/category decision, not silently mapped.
- The `outputs` field in the current schema is domain-gated to amplifier/receiver `deviceType` values, so a DAC's analog line outputs (XLR/RCA) are not captured by that field. This is a known schema/should-be gap, not a sourcing omission.
