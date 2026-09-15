---
product_id: "GPjMdcfFWZVrKyR2PB6IuA"
product_slug: "ladder-chopin-desktop-r2r-pre-amplifier"
brand: "Ladder"
name: "LADDER Chopin Desktop R2R Pre-amplifier"
slice: "audio-electronics"
spec_fields:
  customerRating: null
  awards: []
  condition: null
  dealsDiscount: null
  newArrival: null
  deviceType: "preamplifier"
  deviceConnectivity: "wired"
  amplification: null
  powerOutputPerChannelW: null
  channelCount:
    - "2.0"
  phonoStageBuiltIn: "none"
  trigger12v: false
  remoteControlIncluded: true
  inputs:
    - "xlr-balanced"
    - "rca"
  outputs:
    - "pre-out-xlr"
    - "pre-out-rca"
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
    - "Black"
    - "Silver"
  rackMountable19: false
  countryOfManufacture: null
source_urls:
  - "https://apos.audio/products/ladder-chopin-desktop-dac-amp"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **customerRating** (internal): `null` — store-computed aggregate; not individually sourced.
- **awards** (marketing-fact): `[]` — no awards or recognition mentioned on the Apos product page.
- **condition** (internal): `null` — store-operational field; no condition qualifier on the live listing.
- **dealsDiscount** (internal): `null` — store-operational field; no sale/clearance stated.
- **newArrival** (internal): `null` — store-operational field; not sourced.
- **deviceType** (marketing-fact): `preamplifier` — Apos product page title is "LADDER Chopin Desktop R2R Pre-amplifier" and spec list states "Type: Fully discrete Class-A line-stage preamplifier".
- **deviceConnectivity** (marketing-fact): `wired` — product has XLR and RCA analog inputs/outputs only; no Bluetooth or network connectivity is mentioned.
- **amplification** (conflict): `null` — the source describes the circuit as "pure Class-A fully discrete" and "fully-balanced differential", but the schema `amplification` topology field expects one of `solid-state` / `tube` / `hybrid` / `class-d`, and the source never states that vocabulary. Recorded as null rather than mapped to an unconfirmed enum value.
- **powerOutputPerChannelW** (n/a): `null` — the product is a line-stage preamplifier with unity gain (0dB); no per-channel speaker power output is stated.
- **channelCount** (marketing-fact): `["2.0"]` — stereo line-stage preamplifier with two XLR inputs and one RCA input, plus stereo XLR and RCA outputs.
- **phonoStageBuiltIn** (marketing-fact): `none` — no built-in phono stage (MM or MC) is mentioned on the Apos product page or in the spec list.
- **trigger12v** (marketing-fact): `false` — no 12V trigger / custom-install feature is mentioned.
- **remoteControlIncluded** (marketing-fact): `true` — Apos product page states "A remote control is included for convenient operation from the listening position" and "Remote control included" in the highlights.
- **inputs** (hard-spec): `["xlr-balanced", "rca"]` — Apos specs: "Inputs: 2 x XLR, 1 x RCA".
- **outputs** (hard-spec): `["pre-out-xlr", "pre-out-rca"]` — Apos specs list "Outputs: XLR: 4.0Vrms" and "Outputs: RCA: 2.0Vrms", which are pre-outs for a preamplifier; no headphone jack or speaker terminals are listed.
- **maxSampleRateBitDepth** (n/a): `null` — this field is gated to DAC/network-streamer/CD `deviceType`; the product is an analog preamplifier.
- **dsdSupport** (n/a): `null` — not a DAC or digital source component.
- **hiResCertification** (n/a): `null` — not a DAC or digital source component.
- **dacChipsetFamily** (n/a): `null` — not a DAC or digital source component.
- **streamingPlatformSupport** (n/a): `null` — not a network/streaming device.
- **networkConnection** (n/a): `null` — no wired or wireless network connectivity.
- **driveType**, **turntableOperation**, **speedsSupported**, **phonoPreampBuiltIn**, **cartridgeIncluded**, **usbDigitalOutput** (n/a): `null` — not a turntable.
- **bluetoothCodecs**, **voiceAssistant**, **multiroomSupport** (n/a): `null` — the product is `wired`; these fields are gated to Bluetooth/Wi-Fi/wired+wireless connectivity.
- **finishColor** (marketing-fact): `["Black", "Silver"]` — Apos product page offers "Black" and "Silver" color variants and the highlights state "Available in silver or black".
- **rackMountable19** (marketing-fact): `false` — desktop dimensions (13.2 × 14.7 × 2.6 in / 336 × 374 × 66 mm); no 19" rack-mount feature described.
- **countryOfManufacture** (hard-spec): `null` — no country of manufacture stated on the Apos product page.
