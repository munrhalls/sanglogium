---
product_id: DZc43yHr6ydfgE7zB42MQD
product_slug: yulong-daart-aurora-desktop-dac-pre-amp-headphone-amp
brand: Yulong
name: YULONG DAART Aurora Desktop DAC/Pre-amp/ Headphone Amp
slice: audio-electronics
spec_fields:
  customerRating: null
  awards: []
  condition: null
  dealsDiscount: null
  newArrival: null
  deviceType: dac
  deviceConnectivity: wired-wireless
  amplification: null
  powerOutputPerChannelW: null
  channelCount: null
  phonoStageBuiltIn: null
  trigger12v: null
  remoteControlIncluded: null
  inputs:
  - usb
  - coaxial
  - optical
  - rca
  outputs: null
  maxSampleRateBitDepth: 32-bit/768kHz
  dsdSupport: dsd256-plus
  hiResCertification:
  - mqa
  dacChipsetFamily: ess-sabre
  streamingPlatformSupport: []
  networkConnection: []
  driveType: null
  turntableOperation: null
  speedsSupported: null
  phonoPreampBuiltIn: null
  cartridgeIncluded: null
  usbDigitalOutput: null
  bluetoothCodecs:
  - aptx
  - ldac
  voiceAssistant: []
  multiroomSupport: false
  finishColor:
  - black
  - silver
  - red
  rackMountable19: false
  countryOfManufacture: China
source_urls:
- http://www.yulongaudio.com/pd.jsp?id=49
- https://apos.audio/products/yulong-daart-aurora-desktop-dac-pre-amp-headphone-amp
verified_at: '2026-09-14'
data_status: COMPLETE
---

## Verification Notes
- **deviceType** (marketing-fact): Manufacturer product page title: "Aurora PCM768Khz DAC/preamp/headphone amplifier" and Apos category "DAC/Pre-amp/Headphone Amp" — primary category is DAC.
- **deviceConnectivity** (marketing-fact): Apos: "Optional Bluetooth 5.0 (aptX, LDAC) depending on region" plus USB/coaxial/optical/RCA wired inputs → wired + wireless.
- **inputs** (hard-spec): Apos spec block: "USB Audio: PCM 32-bit/768kHz...; Coaxial: PCM 24-bit/384kHz...; Optical: PCM 24-bit/384kHz...; RCA Line-in: 2V nominal".
- **maxSampleRateBitDepth** (hard-spec): Apos: "USB Audio: PCM 32-bit/768kHz" (highest supported format).
- **dsdSupport** (hard-spec): Apos: "DSD64–512 (native & DoP)" over USB → schema max enum dsd256-plus.
- **hiResCertification** (marketing-fact): Apos: "MQA 8x" listed in USB/coaxial/optical input specs.
- **dacChipsetFamily** (hard-spec): Apos: "ESS ES9068AS" DAC chip.
- **bluetoothCodecs** (hard-spec): Apos: "Optional Bluetooth 5.0 (aptX, LDAC)" → aptx, ldac.
- **multiroomSupport** (marketing-fact): No multi-room feature mentioned; set to false per marketable-feature absence.
- **finishColor** (marketing-fact): Apos: "Color: Black Silver Red".
- **rackMountable19** (marketing-fact): Desktop chassis (200x165x52mm); no 19" rack-mount feature described.
- **countryOfManufacture** (marketing-fact): Product page footer lists company address in Shenzhen, China.
- **outputs** (conflict): Apos lists RCA/XLR pre-out and 6.35mm/4.4mm/XLR4 headphone outputs, but the schema `outputs` field is domain-gated to amplifier deviceTypes; recorded as null with this note.

## Domain / Out-of-Scope Notes
- Fields that are null because they are gated to product categories or connectivity types this product does not match (e.g. turntable fields, amplification outputs for `dac` deviceType) are explicitly recorded as null rather than omitted.
- Manufacturer English pages for Aurora, Asura, A39, and D39 returned an empty product-detail body, so the audited Apos retailer product page was used for hard spec values; the manufacturer page is still cited for product identity and brand/address.
- Canary II and Aquila II have usable manufacturer English pages and are primarily sourced from those; Apos is cited only for `finishColor` because the manufacturer pages do not list colors.
