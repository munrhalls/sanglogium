---
product_id: n10eAegrGspodtsQvy3fgK
product_slug: topping-l30-ii
brand: Topping
name: Topping L30 II
slice: audio-electronics
spec_fields:
  deviceType: null
  deviceConnectivity: wired
  amplification: null
  powerOutputPerChannelW: null
  channelCount: null
  inputs: null
  outputs: null
  phonoStageBuiltIn: null
  trigger12v: null
  remoteControlIncluded: null
  maxSampleRateBitDepth: null
  dsdSupport: null
  hiResCertification: null
  dacChipsetFamily: null
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
- https://www.toppingaudio.com/product-item/l30-ii
- https://toppingaudio.com/download/l30-ii-user-manual
- https://dl.topping.audio/usermanual/l30ii.pdf
- https://hifigo.com/products/topping-l30-ii
- https://www.topping.store/products/topping-l30-ii-nfca-headphone-amplifier
verified_at: '2026-09-14'
data_status: COMPLETE
---

## Verification Notes

- **deviceType** (marketing-fact): `null` — HIFiGO title: 'TOPPING L30 II NFCA Modules UHGF Technology Headphone Amplifier'. The `should-be-audio-electronics.md` `deviceType` enum does not include `headphone-amp`, so the value is `null` rather than force-fit.
- **deviceConnectivity** (marketing-fact): `wired` — wired desktop amplifier; no Bluetooth or Wi-Fi listed; the unit operates with wired line/digital inputs.
- **amplification**, **powerOutputPerChannelW**, **channelCount**, **inputs** (output side), **outputs**, **phonoStageBuiltIn**, **trigger12v**, **remoteControlIncluded**: `null` — these fields are domain-gated to the five amplifier `deviceType` values in `productType.ts`. Because `deviceType` is not an amplifier value, the fields do not apply, even when source pages mention features such as 12V trigger or remote control.
- **inputs**: `null` — domain-gated because `deviceType` is not an amplifier or digital-source value
- **outputs**: `null` — domain-gated to amplifier `deviceType` values
- **driveType**, **turntableOperation**, **speedsSupported**, **phonoPreampBuiltIn**, **cartridgeIncluded**, **usbDigitalOutput**: `null` — the product is not a turntable.
- **bluetoothCodecs**: `null` — no Bluetooth is listed or `deviceConnectivity` is `wired`; **voiceAssistant**, **multiroomSupport**: `null` — no Alexa, Google Assistant, or multi-room support is listed
- **finishColor**: `['Black', 'Silver']` — official store variant options list 'Black' and 'Silver'; **rackMountable19**: `False` — product is described as desktop/portable; no 19-inch rack-mount claim or hardware found; **countryOfManufacture**: `null` — no source explicitly states the country of manufacture; **awards**: `[]` — no awards badges or named awards found on manufacturer/retailer pages

## Conflict / Caution Notes

- This product is described by manufacturer/retailer sources as a headphone amplifier (and/or pre-amplifier). The current `should-be-audio-electronics.md` `deviceType` enum does not include a `headphone-amp` value, so `deviceType` is `null` and all amplifier-gated fields are recorded as `null` rather than force-fit.
- HIFiGO lists L30 II variant titles including 'Blue' and 'Red', while the TOPPING official store only lists 'Black' and 'Silver'. `finishColor` uses the manufacturer store.
