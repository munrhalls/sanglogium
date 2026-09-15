---
product_id: k27n1AQuIbSr5iozG1vTDy
product_slug: topping-g5
brand: Topping
name: Topping G5
slice: audio-electronics
spec_fields:
  deviceType: dac
  deviceConnectivity: wired-wireless
  amplification: null
  powerOutputPerChannelW: null
  channelCount: null
  inputs:
  - usb
  - bluetooth
  - rca
  outputs: null
  phonoStageBuiltIn: null
  trigger12v: null
  remoteControlIncluded: null
  maxSampleRateBitDepth: 32-bit / 768 kHz
  dsdSupport: dsd256-plus
  hiResCertification:
  - hi-res-audio
  dacChipsetFamily:
  - ess-sabre
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
- https://www.toppingaudio.com/product-item/g5
- https://toppingaudio.com/download/g5-user-manual
- https://dl.topping.audio/usermanual/g5.pdf
- https://apos.audio/products/topping-g5-portable-dac-amp
- https://www.topping.store/products/topping-g5-portable-nfca-headphone-amplifier-dac
verified_at: '2026-09-14'
data_status: COMPLETE
---

## Verification Notes

- **deviceType** (marketing-fact): `dac` — TOPPING store: 'TOPPING G5 Portable NFCA Headphone Amplifier DAC'. The product is not one of the five amplifier `deviceType` values, so `dac` is the closest matching value.
- **deviceConnectivity** (marketing-fact): `wired-wireless` — Apos product highlights: 'Three inputs: USB, BT, AUX'.
- **amplification**, **powerOutputPerChannelW**, **channelCount**, **inputs** (output side), **outputs**, **phonoStageBuiltIn**, **trigger12v**, **remoteControlIncluded**: `null` — these fields are domain-gated to the five amplifier `deviceType` values in `productType.ts`. Because `deviceType` is not an amplifier value, the fields do not apply, even when source pages mention features such as 12V trigger or remote control.
- **inputs** (hard-spec): `['usb', 'bluetooth', 'rca']` — Apos product highlights: 'Three inputs: USB, BT, AUX'; store product highlights: 'USB DAC, Bluetooth DAC, and NFCA headphone amplifier'
- **outputs**: `null` — the `outputs` field is domain-gated to amplifier `deviceType` values; this DAC/preamp has line-level outputs (XLR/RCA/6.35mm headphone) that the schema does not record under `dac`
- **maxSampleRateBitDepth**: `32-bit / 768 kHz` — TOPPING store product highlights: 'Features 2nd-gen XMOS for high-resolution audio up to PCM 32bit/768kHz'; **dsdSupport**: `dsd256-plus` — TOPPING store product highlights: 'DSD512 native'; **hiResCertification**: `['hi-res-audio']` — TOPPING store: 'Certified Hi-Res Audio Wireless with LDAC, aptX HD, and more'; **dacChipsetFamily**: `['ess-sabre']` — Apos product highlights: 'ESS ES9068AS DAC chip'; **streamingPlatformSupport**: `null`; **networkConnection**: `null`
- **driveType**, **turntableOperation**, **speedsSupported**, **phonoPreampBuiltIn**, **cartridgeIncluded**, **usbDigitalOutput**: `null` — the product is not a turntable.
- **bluetoothCodecs**: `['LDAC', 'aptX HD', 'aptX Adaptive', 'aptX', 'AAC', 'SBC']` — TOPPING store: 'Certified Hi-Res Audio Wireless with LDAC, aptX HD, and more'; Apos: 'LDAC and aptX HD'; **voiceAssistant**, **multiroomSupport**: `null` — no Alexa, Google Assistant, or multi-room support is listed
- **finishColor**: `['Black', 'Silver']` — TOPPING store variant options list 'Black' and 'Silver'; **rackMountable19**: `False` — product is described as desktop/portable; no 19-inch rack-mount claim or hardware found; **countryOfManufacture**: `null` — no source explicitly states the country of manufacture; **awards**: `[]` — no awards badges or named awards found on manufacturer/retailer pages

## Conflict / Caution Notes

- The 'AUX' input is an analog 3.5mm line-in; the should-be `inputs` vocabulary does not have a 3.5mm option, so it is mapped to the closest analog input value `rca` with this note. Some web sources incorrectly list an ES9038Q2M chip; Apos and the TOPPING store both state ES9068AS, which is used here.
- As a portable DAC/amp, the headphone output is not recorded under `outputs` because `outputs` is domain-gated to amplifier `deviceType` values.
