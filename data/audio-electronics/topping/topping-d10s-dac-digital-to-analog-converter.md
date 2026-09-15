---
product_id: xMEqvkRBbdrlJXyFG8fdhP
product_slug: topping-d10s-dac-digital-to-analog-converter
brand: Topping
name: TOPPING D10s DAC (Digital-to-Analog Converter)
slice: audio-electronics
spec_fields:
  deviceType: dac
  deviceConnectivity: wired
  amplification: null
  powerOutputPerChannelW: null
  channelCount: null
  inputs:
  - usb
  - optical
  - coaxial
  outputs: null
  phonoStageBuiltIn: null
  trigger12v: null
  remoteControlIncluded: null
  maxSampleRateBitDepth: 32-bit / 384 kHz
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
  bluetoothCodecs: null
  voiceAssistant: null
  multiroomSupport: null
  finishColor:
  - Black
  - Silver
  rackMountable19: false
  countryOfManufacture: null
  awards: []
source_urls:
- https://toppingaudio.com/download/d10s-user-manual
- https://dl.topping.audio/um/D10s_说明书.pdf
- https://hifigo.com/products/topping-d10s-usb-dac-es9038q2m-dsd256-psd384
- https://apos.audio/products/topping-d10s-dac
verified_at: '2026-09-14'
data_status: COMPLETE
---

## Verification Notes

- **deviceType** (marketing-fact): `dac` — HIFiGO title: 'TOPPING D10s Hi-Res USB DAC'. The product is not one of the five amplifier `deviceType` values, so `dac` is the closest matching value.
- **deviceConnectivity** (marketing-fact): `wired` — USB-powered desktop DAC; no Bluetooth or Wi-Fi listed; the unit operates with wired line/digital inputs.
- **amplification**, **powerOutputPerChannelW**, **channelCount**, **inputs** (output side), **outputs**, **phonoStageBuiltIn**, **trigger12v**, **remoteControlIncluded**: `null` — these fields are domain-gated to the five amplifier `deviceType` values in `productType.ts`. Because `deviceType` is not an amplifier value, the fields do not apply, even when source pages mention features such as 12V trigger or remote control.
- **inputs** (hard-spec): `['usb', 'optical', 'coaxial']` — HIFiGO description: 'can decode up to 32-bit 384 kHz PCM and native DSD256 via USB, and up to 24-bit 192 kHz PCM and DSD64 via its optical/coaxial input'
- **outputs**: `null` — the `outputs` field is domain-gated to amplifier `deviceType` values; this DAC/preamp has line-level outputs (XLR/RCA/6.35mm headphone) that the schema does not record under `dac`
- **maxSampleRateBitDepth**: `32-bit / 384 kHz` — HIFiGO: 'decode up to 32-bit 384 kHz PCM'; **dsdSupport**: `dsd256-plus` — HIFiGO: 'native DSD256 via USB, and ... DSD64 via its optical/coaxial input'; **hiResCertification**: `['hi-res-audio']` — HIFiGO product title includes 'Hi-Res USB DAC'; **dacChipsetFamily**: `['ess-sabre']` — HIFiGO: 'single ESS ES9038QM DAC chip'; **streamingPlatformSupport**: `null`; **networkConnection**: `null`
- **driveType**, **turntableOperation**, **speedsSupported**, **phonoPreampBuiltIn**, **cartridgeIncluded**, **usbDigitalOutput**: `null` — the product is not a turntable.
- **bluetoothCodecs**: `null` — no Bluetooth is listed or `deviceConnectivity` is `wired`; **voiceAssistant**, **multiroomSupport**: `null` — no Alexa, Google Assistant, or multi-room support is listed
- **finishColor**: `['Black', 'Silver']` — HIFiGO variant options list 'Black' and 'Silver'; **rackMountable19**: `False` — product is described as desktop/portable; no 19-inch rack-mount claim or hardware found; **countryOfManufacture**: `null` — no source explicitly states the country of manufacture; **awards**: `[]` — no awards badges or named awards found on manufacturer/retailer pages

## Conflict / Caution Notes

- No manufacturer product page for the D10s was found on toppingaudio.com (404 on /product-item/d10s); the manual landing page and HIFiGO listing are the highest available sources.
- HIFiGO refers to the DAC chip as 'ES9038QM' while the product title uses 'ES9038Q2M'; both are ESS Sabre chips and map to `ess-sabre`.
