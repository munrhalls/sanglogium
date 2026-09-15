---
product_id: moXlkADK7m1DHgGwWwEdoq
product_slug: spl-phonitor-one-d
brand: SPL
name: SPL Phonitor One D
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
    - usb
  outputs:
    - headphone-jack
  maxSampleRateBitDepth: 32-bit/768kHz
  dsdSupport: dsd256-plus
  hiResCertification: null
  dacChipsetFamily:
    - akm
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
  awards:
    - EC PAM 2021
source_urls:
  - https://www.spl.audio/en/products/phonitor-one-d/
verified_at: '2026-09-14'
data_status: COMPLETE
---

## Verification Notes
- **deviceType** (marketing-fact): Source calls Phonitor One d a "Kopfhörerverstärker" (headphone amplifier) and also an "eigenständiger DAC" (standalone DAC); no single value captures a headphone amplifier / DAC combo in the current schema, so recorded as `null`.
- **deviceConnectivity** (marketing-fact): Wired analog + USB input only; no Bluetooth or Wi-Fi mentioned.
- **amplification** (hard-spec): "Die Endstufe des Kopfhörerverstärkers ist als Gegentaktverstärker im Class AB-Betrieb konzipiert. Die bipolaren Transistoren ..." — interpreted as `solid-state`.
- **powerOutputPerChannelW** (hard-spec): "Max. Ausgangsleistung (47 Ω) 2 x 400 mW", "(250 Ω) 2 x 330 mW", "(600 Ω) 2 x 190 mW" — max per-channel value 0.4 W used.
- **channelCount** (hard-spec): All output specs listed as "2 x" (stereo), interpreted as 2.0.
- **phonoStageBuiltIn** (hard-spec): No phono input mentioned.
- **trigger12v** (marketing-fact): No AMP CTL / 12V trigger language found.
- **remoteControlIncluded** (marketing-fact): No remote or IR learning feature mentioned.
- **inputs** (hard-spec): "Der Phonitor One d bietet zwei analoge Stereo-Eingänge (TRS und Cinch) und einen digitalen (USB)." — 6.35 mm TRS balanced encoded as `xlr-balanced` and Cinch as `rca` per the current `inputs` vocab.
- **outputs** (hard-spec): 6.35 mm headphone jack; additional "Line Out" is present but the spec page does not give a connector matching the current `outputs` vocab, so only `headphone-jack` is recorded.
- **maxSampleRateBitDepth** (hard-spec): "Es werden PCM Abtastfrequenzen bis 768 kHz ... unterstützt" and "32-Bit DA-Wandler".
- **dsdSupport** (hard-spec): "DSD ... bis zu einer Auflösung von DSD4 oder DSD256 (11,2 MHz)" — `dsd256-plus`.
- **dacChipsetFamily** (hard-spec): "Premium AK4490, 32-Bit DAC mit AKM's Velvet Sound".
- **hiResCertification** (marketing-fact): No MQA or Hi-Res Audio certification badge/language found.
- **streamingPlatformSupport** / **networkConnection** / **bluetoothCodecs** / **voiceAssistant** (marketing-fact): No streaming, network, Bluetooth or voice-assistant features mentioned.
- **multiroomSupport** (marketing-fact): No multi-room / multi-zone language found.
- **finishColor** (marketing-fact): Product images show a dark / metallic finish; no single color name confirmed for this product.
- **rackMountable19** (marketing-fact): Dimensions 210 x 49,6 x 220 mm — not a 19" rack form factor.
- **countryOfManufacture** (marketing-fact): "Deswegen fertigen wir alle Geräte in unserer eigenen Fertigung in Niederkrüchten am Niederrhein." and "Sound Performance – Made in Germany".
- **awards** (marketing-fact): Award seal with alt text "Siegel_EC_PAM_2021_SPL Phonitor One d" visible on product page — recorded as named award `EC PAM 2021`.
