---
product_id: n10eAegrGspodtsQvy4cvd
product_slug: spl-phonitor-x-desktop-headphone-amplifier-with-optional-dac
brand: SPL
name: SPL Phonitor X Desktop Headphone Amplifier with Optional DAC
slice: audio-electronics
spec_fields:
  deviceType: null
  deviceConnectivity: wired
  amplification: null
  powerOutputPerChannelW: 5
  channelCount:
    - '2.0'
  phonoStageBuiltIn: none
  trigger12v: true
  remoteControlIncluded: false
  inputs:
    - xlr-balanced
    - rca
    - usb
    - optical
    - coaxial
  outputs:
    - pre-out-xlr
    - pre-out-rca
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
  awards: null
source_urls:
  - https://www.spl.audio/en/products/phonitor-x/
verified_at: '2026-09-14'
data_status: COMPLETE
---

## Verification Notes
- **deviceType** (marketing-fact): Source calls Phonitor x a "Kopfhörerverstärker" (headphone amplifier) and also an "exzellenter Vorverstärker" (preamplifier); no single value captures a headphone amplifier / preamplifier combo in the current schema, so recorded as `null`.
- **deviceConnectivity** (marketing-fact): Wired analog + optional digital inputs only; no Bluetooth or Wi-Fi mentioned.
- **amplification** (hard-spec): Product page does not state a topology.
- **powerOutputPerChannelW** (hard-spec): "Ausgangsleistung (1 kHz, 1% THD 250 Ω) 2 x 3,5 W" / "2 x 0,7 W (32 Ω)" on the 4-Pol XLR output; standard 6.35 mm output "2 x 5 W (250 Ω)" / "2 x 1 W (32 Ω)" — max per-channel value used.
- **channelCount** (hard-spec): All output specs listed as "2 x" (stereo), interpreted as 2.0.
- **phonoStageBuiltIn** (hard-spec): No phono input mentioned in the spec table or product description.
- **trigger12v** (marketing-fact): "Über AMP CTL kann der Standby-Modus von Geräten mit 12V-Trigger-Eingang ein- und ausgeschaltet werden."
- **remoteControlIncluded** (marketing-fact): Page states the volume can be remote-controlled via any IR remote, but does not state a remote is included.
- **inputs** (hard-spec): "Bis zu fünf Stereo-Quellen können an den Phonitor x angeschlossen werden: XLR, Cinch und über den optionalen DAC768xs auch USB, COAX und OPTICAL."
- **outputs** (hard-spec): XLR and Cinch pre-outs for active speakers/amps ("symmetrisch über XLR-Buchsen ... unsymmetrisch über Cinch-Buchsen"); 6.35 mm and 4-Pol XLR headphone outputs.
- **maxSampleRateBitDepth** (hard-spec): Optional DAC768xs: "PCM-Audio mit einer Auflösung von 32 Bit und einer Abtastrate von bis zu 768 kHz".
- **dsdSupport** (hard-spec): Optional DAC768xs: "Direct Stream Digital wird bis zu einer Auflösung von DSD4 bzw. DSD256 unterstützt."
- **dacChipsetFamily** (hard-spec): Optional DAC768xs: "AKM AK4490 Velvet Sound Premium-DAC Chip".
- **hiResCertification** (marketing-fact): No MQA or Hi-Res Audio certification badge/language found.
- **streamingPlatformSupport** / **networkConnection** / **bluetoothCodecs** / **voiceAssistant** (marketing-fact): No streaming, network, Bluetooth or voice-assistant features mentioned.
- **multiroomSupport** (marketing-fact): No multi-room / multi-zone language found.
- **finishColor** (marketing-fact): Product images show black, red and silver case options; no single finish confirmed for this product.
- **rackMountable19** (marketing-fact): Dimensions 278 x 100 x 300 mm — not a 19" rack form factor.
- **countryOfManufacture** (marketing-fact): "Deswegen fertigen wir alle Geräte in unserer eigenen Fertigung in Niederkrüchten am Niederrhein." and "Sound Performance – Made in Germany".
- **awards** (marketing-fact): No award or editor's-choice badge/language found on the product page.
