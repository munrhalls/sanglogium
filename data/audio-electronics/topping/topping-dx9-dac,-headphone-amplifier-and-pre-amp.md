---
product_id: k27n1AQuIbSr5iozG1vToN
product_slug: topping-dx9-dac,-headphone-amplifier-and-pre-amp
brand: Topping
name: Topping DX9 DAC, Headphone Amplifier and Pre-Amp
slice: audio-electronics
spec_fields:
  deviceType: dac
  deviceConnectivity: wired-wireless
  amplification: null
  powerOutputPerChannelW: null
  channelCount: null
  inputs:
  - usb
  - optical
  - coaxial
  - bluetooth
  - aes-ebu
  - i2s-iis
  outputs: null
  phonoStageBuiltIn: null
  trigger12v: null
  remoteControlIncluded: null
  maxSampleRateBitDepth: 32-bit / 768 kHz
  dsdSupport: dsd256-plus
  hiResCertification:
  - hi-res-audio
  dacChipsetFamily: null
  streamingPlatformSupport: null
  networkConnection: null
  driveType: null
  turntableOperation: null
  speedsSupported: null
  phonoPreampBuiltIn: null
  cartridgeIncluded: null
  usbDigitalOutput: null
  bluetoothCodecs:
  - LDAC
  - aptX HD
  - aptX Adaptive
  - aptX
  - AAC
  - SBC
  voiceAssistant: null
  multiroomSupport: null
  finishColor:
  - Black
  - Silver
  rackMountable19: false
  countryOfManufacture: null
  awards: []
source_urls:
- https://www.toppingaudio.com/product-item/dx9
- https://toppingaudio.com/download/dx9-discrete-user-manual
- https://dl.topping.audio/um/DX9_Discrete.pdf
- https://hifigo.com/products/topping-dx9-discrete
- https://www.topping.store/products/topping-dx9-discrete-fully-balanced-1-bit-dac-headphone-amplifier
verified_at: '2026-09-14'
data_status: COMPLETE
---

## Verification Notes

- **deviceType** (marketing-fact): `dac` — TOPPING store: 'TOPPING DX9 Discrete Fully Balanced 1-Bit DAC & Headphone Amplifier'. The product is not one of the five amplifier `deviceType` values, so `dac` is the closest matching value.
- **deviceConnectivity** (marketing-fact): `wired-wireless` — the unit supports both wired and Bluetooth wireless input.
- **amplification**, **powerOutputPerChannelW**, **channelCount**, **inputs** (output side), **outputs**, **phonoStageBuiltIn**, **trigger12v**, **remoteControlIncluded**: `null` — these fields are domain-gated to the five amplifier `deviceType` values in `productType.ts`. Because `deviceType` is not an amplifier value, the fields do not apply, even when source pages mention features such as 12V trigger or remote control.
- **inputs** (hard-spec): `['usb', 'optical', 'coaxial', 'bluetooth', 'aes-ebu', 'i2s-iis']` — TOPPING store product highlights: 'inputs include USB, IIS, AES, coaxial, optical for flexible connectivity'
- **outputs**: `null` — the `outputs` field is domain-gated to amplifier `deviceType` values; this DAC/preamp has line-level outputs (XLR/RCA/6.35mm headphone) that the schema does not record under `dac`
- **maxSampleRateBitDepth**: `32-bit / 768 kHz` — store highlights: 'up to PCM 32bit/768kHz'; **dsdSupport**: `dsd256-plus` — store and web sources list 'DSD512' support; **hiResCertification**: `['hi-res-audio']` — store product highlights: 'exceptional Hi-Res audio experience'; **dacChipsetFamily**: `null`; **streamingPlatformSupport**: `null`; **networkConnection**: `null`
- **driveType**, **turntableOperation**, **speedsSupported**, **phonoPreampBuiltIn**, **cartridgeIncluded**, **usbDigitalOutput**: `null` — the product is not a turntable.
- **bluetoothCodecs**: `['LDAC', 'aptX HD', 'aptX Adaptive', 'aptX', 'AAC', 'SBC']` — HIFiGO: 'LDAC, AptX HD, AptX Adaptive, etc.'; **voiceAssistant**, **multiroomSupport**: `null` — no Alexa, Google Assistant, or multi-room support is listed
- **finishColor**: `['Black', 'Silver']` — HIFiGO and store variant titles list Black and Silver; **rackMountable19**: `False` — product is described as desktop/portable; no 19-inch rack-mount claim or hardware found; **countryOfManufacture**: `null` — no source explicitly states the country of manufacture; **awards**: `[]` — no awards badges or named awards found on manufacturer/retailer pages

## Conflict / Caution Notes

- This is a duplicate DX9 record in the issue. It is sourced from the same DX9 Discrete product as the first DX9 entry because the issue provides no distinguishing name or SKU.
- The DAC architecture (PSRM, 1-bit discrete) is not in the `dacChipsetFamily` enum, so `null` is recorded.
