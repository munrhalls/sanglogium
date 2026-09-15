---
product_id: moXlkADK7m1DHgGwWwEenW
product_slug: spl-phonitor-one
brand: SPL
name: SPL Phonitor One
slice: audio-electronics
spec_fields:
  deviceType: null
  deviceConnectivity: wired
  amplification: solid-state
  powerOutputPerChannelW: 0.4
  channelCount:
    - '2.0'
  phonoStageBuiltIn: none
  trigger12v: false
  remoteControlIncluded: false
  inputs:
    - xlr-balanced
    - rca
  outputs:
    - headphone-jack
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
  multiroomSupport: false
  finishColor: null
  rackMountable19: false
  countryOfManufacture: Germany
  awards: null
source_urls:
  - https://www.spl.audio/en/products/phonitor-one/
verified_at: '2026-09-14'
data_status: COMPLETE
---

## Verification Notes
- **deviceType** (marketing-fact): Source calls Phonitor One a "Kopfhörerverstärker" (headphone amplifier); no matching value in the current `deviceType` list, so recorded as `null`.
- **deviceConnectivity** (marketing-fact): Wired analog inputs only; no Bluetooth or Wi-Fi mentioned.
- **amplification** (hard-spec): "Die Endstufe des Kopfhörerverstärkers ist als Gegentaktverstärker im Class AB-Betrieb konzipiert. Die bipolaren Transistoren ..." — interpreted as `solid-state`.
- **powerOutputPerChannelW** (hard-spec): "Max. Ausgangsleistung (47 Ω) 2 x 400 mW", "(250 Ω) 2 x 330 mW", "(600 Ω) 2 x 190 mW" — max per-channel value 0.4 W used.
- **channelCount** (hard-spec): All output specs listed as "2 x" (stereo), interpreted as 2.0.
- **phonoStageBuiltIn** (hard-spec): No phono input mentioned.
- **trigger12v** (marketing-fact): No AMP CTL / 12V trigger language found.
- **remoteControlIncluded** (marketing-fact): No remote or IR learning feature mentioned.
- **inputs** (hard-spec): "Der Phonitor One bietet zwei analoge Stereo-Eingänge (TRS und Cinch)." — 6.35 mm TRS balanced encoded as `xlr-balanced` and Cinch as `rca` per the current `inputs` vocab.
- **outputs** (hard-spec): 6.35 mm headphone jack only.
- **maxSampleRateBitDepth** / **dsdSupport** / **dacChipsetFamily** / **hiResCertification** (hard-spec): No DAC or digital source section on this model.
- **streamingPlatformSupport** / **networkConnection** / **bluetoothCodecs** / **voiceAssistant** (marketing-fact): No streaming, network, Bluetooth or voice-assistant features mentioned.
- **multiroomSupport** (marketing-fact): No multi-room / multi-zone language found.
- **finishColor** (marketing-fact): Product images show a dark / metallic finish; no single color name confirmed for this product.
- **rackMountable19** (marketing-fact): Dimensions 210 x 49,6 x 220 mm — not a 19" rack form factor.
- **countryOfManufacture** (marketing-fact): "Deswegen fertigen wir alle Geräte in unserer eigenen Fertigung in Niederkrüchten am Niederrhein." and "Sound Performance – Made in Germany".
- **awards** (marketing-fact): No award or editor's-choice badge/language found on the product page.
