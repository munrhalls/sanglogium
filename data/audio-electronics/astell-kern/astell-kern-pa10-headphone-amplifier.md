---
product_id: "MrEMtYwMtrFDGWmRnNGIa4"
product_slug: "astell-kern-pa10-headphone-amplifier"
brand: "Astell&Kern"
name: "Astell&Kern PA10 Headphone Amplifier"
slice: "audio-electronics"
price: 49900
spec_fields:
  brand:
    - "astell-and-kern"
  customerRating: null
  awards: []
  condition: null
  dealsDiscount: null
  newArrival: null
  deviceType: null
  deviceConnectivity: "wired"
  formFactor: "portable"
  dacIncluded: false
  balancedOutput: true
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
    - "graphite-gray"
  rackMountable19: false
  countryOfManufacture: null
source_urls:
  - "https://astellnkern.co.uk/products/ak-pa10-class-a-amplifier"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **brand** (hard-spec): `["astell-and-kern"]` — product page lists brand as Astell&Kern; the Sanity `brandSlug` is `astell-and-kern` — https://astellnkern.co.uk/products/ak-pa10-class-a-amplifier
- **customerRating** (internal): `null` — no customer-review aggregate is shown on the manufacturer product page
- **awards** (marketing-fact): `[]` — no named awards, editor's-choice badges, or recognition callouts are listed
- **condition** (internal): `null` — the manufacturer page lists a price but does not state condition; this is a store-operational field
- **dealsDiscount** (internal): `null` — no sale, clearance, or discount callout is listed
- **newArrival** (internal): `null` — no "new arrival" callout or announcement is listed
- **deviceType** (marketing-fact): `null` — the product is a portable Class-A headphone amplifier. The `should-be-audio-electronics.md` product-category list and the Sanity `deviceType` vocabulary for this slice exclude headphone amplifiers, so no listed category is confirmed by the source. Recorded as `null` and flagged as a category gap. — https://astellnkern.co.uk/products/ak-pa10-class-a-amplifier
- **deviceConnectivity** (marketing-fact): `wired` — the product has analog 3.5mm/4.4mm input and output only; the USB-C port is for charging, not audio input
- **formFactor** (marketing-fact/legacy): `portable` — the product is a portable Class-A amplifier (73mm x 140mm x 23.3mm; about 325g)
- **dacIncluded** (marketing-fact/legacy): `false` — the product is an analogue Class-A amplifier; the spec table lists no DAC and the "Digital Chipset" field in the export explicitly says "Not Specified by Manufacturer" (because there is none)
- **balancedOutput** (marketing-fact/legacy): `true` — the page states "AK PA10 supports 4.4mm True Balanced input/output" and the spec table lists "Headphone Outputs: Unbalanced 3.5mm / Balanced 4.4mm"
- **amplification** (hard-spec): `null` — `amplification` is domain-gated to amplifier/receiver product categories; with `deviceType: null` it is not applicable, even though the product is a Class-A amplifier
- **powerOutputPerChannelW** (hard-spec): `null` — `powerOutputPerChannelW` is domain-gated to amplifier/receiver categories and measures W RMS into speaker loads; the PA10's output is quoted in Vrms (up to 6.2Vrms balanced), not W RMS per channel
- **channelCount** (hard-spec): `null` — not applicable to a headphone amplifier outside the slice's product-category schema
- **inputs** (hard-spec): `null` — `inputs` is domain-gated to amplifier/receiver, DAC, network-streamer, or CD player categories; the PA10's analogue 3.5mm/4.4mm inputs are not recordable under the current schema because the headphone-amp category is out of scope
- **outputs** (hard-spec): `null` — `outputs` is domain-gated to amplifier/receiver categories; the 3.5mm/4.4mm headphone outputs are not recordable under the current schema because the headphone-amp category is out of scope
- **phonoStageBuiltIn** (marketing-fact): `null` — no phono-stage or turntable input is mentioned
- **trigger12v** (marketing-fact): `null` — no 12 V trigger or custom-install-ready feature is mentioned
- **remoteControlIncluded** (marketing-fact): `null` — no remote control is mentioned
- **maxSampleRateBitDepth** (hard-spec): `null` — the product is an analogue amplifier with no digital audio input or DAC; this field is not applicable
- **dsdSupport** (hard-spec): `null` — the product is an analogue amplifier with no digital audio input; this field is not applicable
- **hiResCertification** (marketing-fact): `null` — the product is an analogue amplifier with no MQA/Hi-Res certification; this field is not applicable
- **dacChipsetFamily** (hard-spec): `null` — the product contains no DAC; this field is not applicable
- **streamingPlatformSupport** (marketing-fact): `null` — no network or streaming platform support is listed
- **networkConnection** (hard-spec): `null` — no Wi-Fi or Ethernet network connection is listed
- **driveType**, **turntableOperation**, **speedsSupported**, **phonoPreampBuiltIn**, **cartridgeIncluded**, **usbDigitalOutput** (hard-spec/marketing-fact): `null` — not a turntable
- **bluetoothCodecs** (marketing-fact): `null` — `deviceConnectivity` is `wired`; no Bluetooth is listed
- **voiceAssistant** (marketing-fact): `null` — `deviceConnectivity` is `wired`; no voice assistant is listed
- **multiroomSupport** (marketing-fact): `null` — `deviceConnectivity` is `wired`; no multiroom support is listed
- **finishColor** (hard-spec): `["graphite-gray"]` — spec table: "Body Color: Graphite Gray"
- **rackMountable19** (marketing-fact): `false` — portable device with no 19" rack-mount callout
- **countryOfManufacture** (hard-spec): `null` — no country of manufacture is stated on the product page
