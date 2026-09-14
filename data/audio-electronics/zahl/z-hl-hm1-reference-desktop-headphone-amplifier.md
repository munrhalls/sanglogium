---
product_id: "MrEMtYwMtrFDGWmRnNA955"
product_slug: "z-hl-hm1-reference-desktop-headphone-amplifier"
brand: "Zähl"
name: "Zähl HM1 Reference Desktop Headphone Amplifier"
slice: "audio-electronics"
spec_fields:
  deviceType: null
  deviceConnectivity: "wired"
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
  finishColor: null
  rackMountable19: false
  countryOfManufacture: "Germany"
  awards:
    - "Reviewer's Choice"
source_urls:
  - "https://zaehl.com/products/hm1-headphones-mixing-amplifier"
  - "https://hm1.zaehl.com/en/"
  - "https://hm1.zaehl.com/downloads/Zaehl-HM1-Manual-V1-3.pdf"
  - "https://headphones.com/products/zahl-hm1-reference-desktop-headphone-amplifier"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **deviceType** (marketing-fact): `null` — the manufacturer identifies the product as a "Reference headphones mixing amplifier" and "headphones amplifier" (https://zaehl.com/products/hm1-headphones-mixing-amplifier). The audio-electronics schema's `deviceType` enum does not include a headphone-amplifier value; the nine allowed values are `integrated-amplifier`, `power-amplifier`, `preamplifier`, `av-surround-receiver`, `stereo-receiver`, `dac`, `network-streamer`, `cd-player-transport`, and `turntable` (see `docs/filters-sort/audio-electronics-filterattributes-migration.md` and `sanity-cms/schemaTypes/productType.ts`). The HM1 is therefore outside the current audio-electronics category taxonomy and is recorded as `null`.

- **deviceConnectivity** (marketing-fact): `"wired"` — the product has balanced XLR/RCA line inputs and balanced/unbalanced line outputs, plus a 4-pin XLR and 6.35 mm headphone output; no Bluetooth or Wi-Fi/networked input is listed (https://hm1.zaehl.com/en/ "Technical Data"; https://headphones.com/products/zahl-hm1-reference-desktop-headphone-amplifier lists "Wired").

- **amplification**, **powerOutputPerChannelW**, **channelCount**, **inputs**, **outputs**, **phonoStageBuiltIn**, **trigger12v**, **remoteControlIncluded**: `null` — these fields are domain-gated in `productType.ts` to the five amplifier `deviceType` values; because `deviceType` is `null` for this headphone amplifier, the fields do not apply. Source: manufacturer product page and manual.

- **maxSampleRateBitDepth**, **dsdSupport**, **hiResCertification**, **dacChipsetFamily**, **streamingPlatformSupport**, **networkConnection**: `null` — these fields are domain-gated to `deviceType` values `dac`, `network-streamer`, or `cd-player-transport`; the HM1 is a pure analogue headphone amplifier with no DAC, network, or digital source functionality. Source: manufacturer product page and manual.

- **driveType**, **turntableOperation**, **speedsSupported**, **phonoPreampBuiltIn**, **cartridgeIncluded**, **usbDigitalOutput**: `null` — these fields are domain-gated to `deviceType: turntable`; the HM1 is not a turntable. Source: manufacturer product page and manual.

- **bluetoothCodecs**: `null` — no Bluetooth is listed in the manufacturer technical data or the Headphones.com listing (source confirms "Wired"). Source: https://hm1.zaehl.com/en/ and https://headphones.com/products/zahl-hm1-reference-desktop-headphone-amplifier.

- **voiceAssistant**, **multiroomSupport**: `null` — these fields are domain-gated to `deviceConnectivity` values `bluetooth`, `wifi-networked`, or `wired-wireless`; `deviceConnectivity` is `wired`. Source: https://hm1.zaehl.com/en/.

- **finishColor**: `null` — no explicit finish or color is stated on the manufacturer product page, the manual, or the Headphones.com listing. Product photographs are not a citable source for this field.

- **rackMountable19** (marketing-fact): `false` — the product is described as a desktop unit with dimensions 225 x 90 x 300 mm and an external mains adapter; no 19" rack-mounting hardware or claim is mentioned in the manufacturer page or manual. For this marketable feature, manufacturer silence is read as `false`. Source: https://hm1.zaehl.com/en/ "Technical Data".

- **countryOfManufacture** (marketing-fact): `"Germany"` — the manufacturer product page states "Designed and manufactured in Germany" and "Manufactured in Germany in a limited edition of 50 units per year" (https://zaehl.com/products/hm1-headphones-mixing-amplifier). The manual technical data also lists the unit and power supply dimensions/weights (https://hm1.zaehl.com/downloads/Zaehl-HM1-Manual-V1-3.pdf).

- **awards** (marketing-fact): `["Reviewer's Choice"]` — the Headphones.com product listing displays a "Reviewer's Choice" badge alongside the product title; the manufacturer page and manual do not list any named awards. Source: https://headphones.com/products/zahl-hm1-reference-desktop-headphone-amplifier.

## Conflict / Caution Notes

- The current Sanity `filterAttributes` for this product contain legacy `deviceType: "headphone-amp"`, `amplification: "solid-state"`, `formFactor: "desktop"`, `dacIncluded: false`, and `balancedOutput: false`. These are not supported by the new `should-be-audio-electronics.md` schema, which excludes headphone-amp/DAP concepts from the audio-electronics slice. The sourced `deviceType` is therefore `null`, and all domain-gated amplification/source/turntable fields are `null`.
- `awards` is sourced from a major retailer (Headphones.com) rather than the manufacturer; no manufacturer press release or product page mentions an award.
- This product is a headphone/mixing amplifier. It does not match any of the nine `deviceType` values defined for `audio-electronics` in the current schema, so it is correctly recorded as `null` for `deviceType` rather than force-fit into `integrated-amplifier`, `preamplifier`, or another value.
