---
product_id: PHPYj28HJdPDHAaIBAGWYs
product_slug: topping-d70-pro-dac
brand: Topping
name: Topping D70 Pro DAC
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
- https://www.toppingaudio.com/product-item/d70-pro-sabre
- https://toppingaudio.com/download/d70-pro-sabre-user-manual
- https://dl.topping.audio/usermanual/d70p_s_en.pdf
- https://hifigo.com/products/topping-d70pro
- https://device.report/manual/7948208
verified_at: '2026-09-14'
data_status: COMPLETE
---

## Verification Notes

- **deviceType** (marketing-fact): `dac` — HIFiGO title: 'TOPPING D70Pro SABRE DAC'. The product is not one of the five amplifier `deviceType` values, so `dac` is the closest matching value.
- **deviceConnectivity** (marketing-fact): `wired-wireless` — HIFiGO features list 'Bluetooth V5.1 Connectivity'.
- **amplification**, **powerOutputPerChannelW**, **channelCount**, **inputs** (output side), **outputs**, **phonoStageBuiltIn**, **trigger12v**, **remoteControlIncluded**: `null` — these fields are domain-gated to the five amplifier `deviceType` values in `productType.ts`. Because `deviceType` is not an amplifier value, the fields do not apply, even when source pages mention features such as 12V trigger or remote control.
- **inputs** (hard-spec): `['usb', 'optical', 'coaxial', 'bluetooth', 'aes-ebu']` — Manual extract (device.report): 'Signal input: USB/BT/OPT/COAX/AES' and 'Support USB, Coaxial, Optical, Bluetooth, AES input'
- **outputs**: `null` — the `outputs` field is domain-gated to amplifier `deviceType` values; this DAC/preamp has line-level outputs (XLR/RCA/6.35mm headphone) that the schema does not record under `dac`
- **maxSampleRateBitDepth**: `32-bit / 768 kHz` — Manual extract: 'USBIN PCM 44.1kHz-768kHz/16bit-32bit'; **dsdSupport**: `dsd256-plus` — Manual extract: 'USBIN DSD DSD64-DSD512 (Native)'; **hiResCertification**: `['hi-res-audio']` — HIFiGO features list 'Hi-Res Audio & Hi-Res Audio Wireless Certified'; **dacChipsetFamily**: `['ess-sabre']` — HIFiGO features list 'Flagship ES9039S Pro DAC Chip'; **streamingPlatformSupport**: `null`; **networkConnection**: `null`
- **driveType**, **turntableOperation**, **speedsSupported**, **phonoPreampBuiltIn**, **cartridgeIncluded**, **usbDigitalOutput**: `null` — the product is not a turntable.
- **bluetoothCodecs**: `['LDAC', 'aptX HD', 'aptX Adaptive', 'aptX', 'AAC', 'SBC']` — Manual extract: 'BTIN AAC/SBC/APTX/APTX HD/APTX-Adaptive/LDAC'; **voiceAssistant**, **multiroomSupport**: `null` — no Alexa, Google Assistant, or multi-room support is listed
- **finishColor**: `['Black', 'Silver']` — HIFiGO variant options list 'Black' and 'Silver'; **rackMountable19**: `False` — product is described as desktop/portable; no 19-inch rack-mount claim or hardware found; **countryOfManufacture**: `null` — no source explicitly states the country of manufacture; **awards**: `[]` — no awards badges or named awards found on manufacturer/retailer pages

## Conflict / Caution Notes

- The D70 Pro is a DAC with XLR/RCA line outputs and 12V trigger; `outputs`, `trigger12v`, and `remoteControlIncluded` are domain-gated and remain `null` because `deviceType` is `dac`.
