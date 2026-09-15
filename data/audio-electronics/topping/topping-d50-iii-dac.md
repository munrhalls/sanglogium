---
product_id: MrEMtYwMtrFDGWmRnN8n4N
product_slug: topping-d50-iii-dac
brand: Topping
name: Topping D50 III DAC
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
- https://www.toppingaudio.com/product-item/d50-iii
- https://toppingaudio.com/download/d50-iii-user-manual
- https://dl.topping.audio/um/d50_iii.pdf
- https://apos.audio/products/topping-d50-iii-desktop-dac
- https://www.topping.store/products/topping-d50-iii-desktop-hifi-dac
- https://www.audiomagic.eu/en/headphones/headphone-electronics/dac/topping-d50-iii
verified_at: '2026-09-14'
data_status: COMPLETE
---

## Verification Notes

- **deviceType** (marketing-fact): `dac` — Apos product page: 'TOPPING D50 III Desktop DAC'. The product is not one of the five amplifier `deviceType` values, so `dac` is the closest matching value.
- **deviceConnectivity** (marketing-fact): `wired-wireless` — Apos product highlights include 'LDAC and Bluetooth 5.1 for high-quality wireless audio'.
- **amplification**, **powerOutputPerChannelW**, **channelCount**, **inputs** (output side), **outputs**, **phonoStageBuiltIn**, **trigger12v**, **remoteControlIncluded**: `null` — these fields are domain-gated to the five amplifier `deviceType` values in `productType.ts`. Because `deviceType` is not an amplifier value, the fields do not apply, even when source pages mention features such as 12V trigger or remote control.
- **inputs** (hard-spec): `['usb', 'optical', 'coaxial', 'bluetooth']` — audiomagic.eu listing: 'Digital Inputs: 1x USB-C (Signal/Data), 1x Optical (Toslink), 1x Coaxial (SPDIF), Wireless Bluetooth'
- **outputs**: `null` — the `outputs` field is domain-gated to amplifier `deviceType` values; this DAC/preamp has line-level outputs (XLR/RCA/6.35mm headphone) that the schema does not record under `dac`
- **maxSampleRateBitDepth**: `32-bit / 768 kHz` — Apos product page: 'up to DSD 512 and PCM 768kHz'; **dsdSupport**: `dsd256-plus` — Apos product page: 'up to DSD 512'; **hiResCertification**: `['hi-res-audio']` — Apos product page: 'backed by hi-res certification for audiophile-grade sound'; **dacChipsetFamily**: `['ess-sabre']` — Apos product page: 'Dual ES9039Q2M D/A chips'; **streamingPlatformSupport**: `null`; **networkConnection**: `null`
- **driveType**, **turntableOperation**, **speedsSupported**, **phonoPreampBuiltIn**, **cartridgeIncluded**, **usbDigitalOutput**: `null` — the product is not a turntable.
- **bluetoothCodecs**: `['LDAC', 'aptX HD', 'aptX Adaptive', 'aptX', 'AAC', 'SBC']` — audiomagic.eu listing: 'Supported codecs: LDAC, aptX HD, aptX Adaptive' and manual lists AAC/SBC/aptX/aptX HD/aptX-Adaptive/LDAC; **voiceAssistant**, **multiroomSupport**: `null` — no Alexa, Google Assistant, or multi-room support is listed
- **finishColor**: `['Black', 'Silver']` — TOPPING official store variant options list 'Black' and 'Silver'; **rackMountable19**: `False` — product is described as desktop/portable; no 19-inch rack-mount claim or hardware found; **countryOfManufacture**: `null` — no source explicitly states the country of manufacture; **awards**: `[]` — no awards badges or named awards found on manufacturer/retailer pages

## Conflict / Caution Notes

- D50 III includes a remote control, preamp mode, and 12V trigger, but `remoteControlIncluded`, `trigger12v`, and `outputs` are domain-gated and remain `null` because `deviceType` is `dac`.
