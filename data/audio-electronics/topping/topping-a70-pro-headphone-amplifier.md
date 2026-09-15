---
product_id: n10eAegrGspodtsQvy4Z6W
product_slug: topping-a70-pro-headphone-amplifier
brand: Topping
name: Topping A70 Pro Headphone Amplifier
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
- https://www.toppingaudio.com/product-item/a70-pro
- https://toppingaudio.com/download/a70-pro-user-manual
- https://dl.topping.audio/usermanual/a70p_en.pdf
- https://hifigo.com/products/topping-a70pro
- https://www.topping.store/products/topping-a70-pro-headphone-amp-preamp
- https://apos.audio/products/topping-a70pro-headphone-amplifier
verified_at: '2026-09-14'
data_status: COMPLETE
---

## Verification Notes

- **deviceType** (marketing-fact): `null` — HIFiGO title: 'TOPPING A70Pro Amplifier Fully Balanced R2R Volume Control Module Headphone Amp'. The `should-be-audio-electronics.md` `deviceType` enum does not include `headphone-amp`, so the value is `null` rather than force-fit.
- **deviceConnectivity** (marketing-fact): `wired` — no Bluetooth or Wi-Fi input listed; wired XLR/RCA inputs and headphone outputs; the unit operates with wired line/digital inputs.
- **amplification**, **powerOutputPerChannelW**, **channelCount**, **inputs** (output side), **outputs**, **phonoStageBuiltIn**, **trigger12v**, **remoteControlIncluded**: `null` — these fields are domain-gated to the five amplifier `deviceType` values in `productType.ts`. Because `deviceType` is not an amplifier value, the fields do not apply, even when source pages mention features such as 12V trigger or remote control.
- **inputs**: `null` — domain-gated because `deviceType` is not an amplifier or digital-source value
- **outputs**: `null` — domain-gated to amplifier `deviceType` values
- **driveType**, **turntableOperation**, **speedsSupported**, **phonoPreampBuiltIn**, **cartridgeIncluded**, **usbDigitalOutput**: `null` — the product is not a turntable.
- **bluetoothCodecs**: `null` — no Bluetooth is listed or `deviceConnectivity` is `wired`; **voiceAssistant**, **multiroomSupport**: `null` — no Alexa, Google Assistant, or multi-room support is listed
- **finishColor**: `['Black', 'Silver']` — official store and HIFiGO variant options list 'Black' and 'Silver'; **rackMountable19**: `False` — product is described as desktop/portable; no 19-inch rack-mount claim or hardware found; **countryOfManufacture**: `null` — no source explicitly states the country of manufacture; **awards**: `[]` — no awards badges or named awards found on manufacturer/retailer pages

## Conflict / Caution Notes

- This product is described by manufacturer/retailer sources as a headphone amplifier (and/or pre-amplifier). The current `should-be-audio-electronics.md` `deviceType` enum does not include a `headphone-amp` value, so `deviceType` is `null` and all amplifier-gated fields are recorded as `null` rather than force-fit.
- This is a second A70 Pro record at a $439 price point; the source pages show the standard price as $499. Spec data is identical to the first A70 Pro entry.
- Source pages state the A70 Pro includes a 12V trigger and remote control, but those fields are domain-gated and remain `null`.
