---
product_id: GPjMdcfFWZVrKyR2PB7cLm
product_slug: yulong-daart-a39-desktop-r2r-pre-amp-headphone-amplifier
brand: Yulong
name: YULONG DAART A39 Desktop R2R Pre-Amp & Headphone Amplifier
slice: audio-electronics
spec_fields:
  customerRating: null
  awards: []
  condition: null
  dealsDiscount: null
  newArrival: null
  deviceType: preamplifier
  deviceConnectivity: wired
  amplification: null
  powerOutputPerChannelW: null
  channelCount:
  - '2.0'
  phonoStageBuiltIn: none
  trigger12v: false
  remoteControlIncluded: true
  inputs:
  - rca
  - xlr-balanced
  outputs:
  - pre-out-rca
  - pre-out-xlr
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
  multiroomSupport: null
  finishColor:
  - black
  - silver
  - red
  rackMountable19: false
  countryOfManufacture: China
source_urls:
- http://www.yulongaudio.com/pd.jsp?id=60
- https://apos.audio/products/yulong-a39-desktop-headphone-amplifier
verified_at: '2026-09-14'
data_status: COMPLETE
---

## Verification Notes
- **deviceType** (marketing-fact): Manufacturer product page title: "A39 Pre-amplifier, headphone amplifie" and Apos: "Pre-Amp & Headphone Amplifier" → preamplifier.
- **deviceConnectivity** (marketing-fact): Source describes only XLR/RCA analog inputs/outputs and headphone outputs → wired.
- **powerOutputPerChannelW** (hard-spec): Apos lists "Headphone output power (balanced): 32Ω: 6000mW", but the schema field asks for per-channel W RMS and the source does not provide a per-channel speaker-amp figure; recorded as null.
- **channelCount** (marketing-fact): Stereo preamp/headphone amplifier (single-ended and balanced outputs) → 2.0.
- **phonoStageBuiltIn** (marketing-fact): No phono stage mentioned in source.
- **trigger12v** (marketing-fact): No 12V trigger / custom-install feature mentioned.
- **remoteControlIncluded** (marketing-fact): Apos: "The intuitive knob or included remote make adjustments easy" and "Remote control included".
- **inputs** (hard-spec): Apos: "Balanced (XLR) and single-ended (RCA) preamp inputs and outputs".
- **outputs** (hard-spec): Apos: "Balanced (XLR/4.4mm) and single-ended (6.35mm) headphone outputs" and "Balanced (XLR) and single-ended (RCA) preamp inputs and outputs" → pre-out-rca, pre-out-xlr, headphone-jack.
- **dsdSupport** (hard-spec): Pure analog preamp/headphone amplifier with no digital inputs; `dsdSupport` is out of domain for `preamplifier` deviceType → null.
- **finishColor** (marketing-fact): Apos: "Color: Black Silver Red".
- **rackMountable19** (marketing-fact): Desktop chassis (248x210x60mm); no 19" rack-mount feature described.
- **countryOfManufacture** (marketing-fact): Product page footer lists company address in Shenzhen, China.
- **amplification** (conflict): Apos and manufacturer describe the headphone amplifier as "Class-A", but the schema `amplification` field is a topology enum (solid-state/tube/hybrid/class-d) and the source never states the topology; recorded as null with this note.

## Domain / Out-of-Scope Notes
- Fields that are null because they are gated to product categories or connectivity types this product does not match (e.g. turntable fields, amplification outputs for `dac` deviceType) are explicitly recorded as null rather than omitted.
- Manufacturer English pages for Aurora, Asura, A39, and D39 returned an empty product-detail body, so the audited Apos retailer product page was used for hard spec values; the manufacturer page is still cited for product identity and brand/address.
- Canary II and Aquila II have usable manufacturer English pages and are primarily sourced from those; Apos is cited only for `finishColor` because the manufacturer pages do not list colors.
