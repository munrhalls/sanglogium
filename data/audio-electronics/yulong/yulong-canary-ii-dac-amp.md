---
product_id: GPjMdcfFWZVrKyR2PB6how
product_slug: yulong-canary-ii-dac-amp
brand: Yulong
name: Yulong Canary II DAC/Amp
slice: audio-electronics
spec_fields:
  customerRating: null
  awards: []
  condition: null
  dealsDiscount: null
  newArrival: null
  deviceType: dac
  deviceConnectivity: wired
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
  - aes-ebu
  outputs: null
  maxSampleRateBitDepth: 32-bit/384kHz
  dsdSupport: dsd256-plus
  hiResCertification: []
  dacChipsetFamily: ess-sabre
  streamingPlatformSupport: []
  networkConnection: []
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
  - black
  - red
  - silver
  rackMountable19: false
  countryOfManufacture: China
source_urls:
- http://www.yulongaudio.com/pd.jsp?id=41
- https://apos.audio/products/yulong-canaryii-dac-amp
verified_at: '2026-09-14'
data_status: COMPLETE
---

## Verification Notes
- **deviceType** (marketing-fact): Manufacturer product page title: "Canary II PCM768Khz DAC Class A headphone amplifier" and Apos: "DAC/Amp" — primary category is DAC.
- **deviceConnectivity** (marketing-fact): Source describes only wired USB/S/PDIF inputs and 6.35mm/RCA outputs → wired.
- **inputs** (hard-spec): Manufacturer: "S/PDIF (Coaxial, AES, Optical)" plus "USB Audio" → usb, coaxial, optical, aes-ebu.
- **maxSampleRateBitDepth** (hard-spec): Manufacturer: "USB Audio ... upto 32Bit/384kHz" (highest supported format).
- **dsdSupport** (hard-spec): Manufacturer: "Native DSD64/128/256/512" over USB → schema max enum dsd256-plus.
- **dacChipsetFamily** (hard-spec): Manufacturer: "ES9038Q2M DAC" → ess-sabre.
- **finishColor** (marketing-fact): Apos description: "comes in three colors--black, red, and silver".
- **rackMountable19** (marketing-fact): Compact desktop chassis (190x120x55mm); no 19" rack-mount feature described.
- **countryOfManufacture** (marketing-fact): Product page footer lists company address in Shenzhen, China.
- **outputs** (conflict): Manufacturer describes 6.35mm headphone output and RCA preamp output, but schema `outputs` is domain-gated to amplifier deviceTypes; recorded as null with this note.

## Domain / Out-of-Scope Notes
- Fields that are null because they are gated to product categories or connectivity types this product does not match (e.g. turntable fields, amplification outputs for `dac` deviceType) are explicitly recorded as null rather than omitted.
- Manufacturer English pages for Aurora, Asura, A39, and D39 returned an empty product-detail body, so the audited Apos retailer product page was used for hard spec values; the manufacturer page is still cited for product identity and brand/address.
- Canary II and Aquila II have usable manufacturer English pages and are primarily sourced from those; Apos is cited only for `finishColor` because the manufacturer pages do not list colors.
