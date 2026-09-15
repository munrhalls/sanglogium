---
product_id: "MrEMtYwMtrFDGWmRnNKGX9"
product_slug: "astell-kern-a-ultima-sp4000-digital-audio-player"
brand: "Astell&Kern"
name: "Astell&Kern A&Ultima SP4000 | Digital Audio Player"
slice: "audio-electronics"
price: 348200
spec_fields:
  brand:
    - "astell-and-kern"
  customerRating: null
  awards: []
  condition: null
  dealsDiscount: null
  newArrival: null
  deviceType: null
  deviceConnectivity: "wired-wireless"
  formFactor: "portable"
  dacIncluded: true
  balancedOutput: true
  amplification: null
  powerOutputPerChannelW: null
  channelCount: null
  inputs: null
  outputs: null
  phonoStageBuiltIn: null
  trigger12v: null
  remoteControlIncluded: null
  maxSampleRateBitDepth: "PCM 32-bit/768kHz; DSD512"
  dsdSupport: "dsd256-plus"
  hiResCertification: []
  dacChipsetFamily:
    - "akm"
  streamingPlatformSupport: null
  networkConnection:
    - "wifi"
  driveType: null
  turntableOperation: null
  speedsSupported: null
  phonoPreampBuiltIn: null
  cartridgeIncluded: null
  usbDigitalOutput: null
  bluetoothCodecs:
    - "SBC"
    - "AAC"
    - "aptX HD"
    - "LDAC"
  voiceAssistant: null
  multiroomSupport: null
  finishColor:
    - "black"
    - "silver"
  rackMountable19: false
  countryOfManufacture: null
source_urls:
  - "https://astellnkern.co.uk/products/a-ultima-sp4000"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **brand** (hard-spec): `["astell-and-kern"]` — product page lists brand as Astell&Kern; the Sanity `brandSlug` is `astell-and-kern` — https://astellnkern.co.uk/products/a-ultima-sp4000
- **customerRating** (internal): `null` — no customer-review aggregate is shown on the manufacturer product page
- **awards** (marketing-fact): `[]` — no named awards, editor's-choice badges, or recognition callouts are listed
- **condition** (internal): `null` — the manufacturer page lists a price but does not state condition; this is a store-operational field
- **dealsDiscount** (internal): `null` — no sale, clearance, or discount callout is listed
- **newArrival** (internal): `null` — no "new arrival" callout or announcement is listed
- **deviceType** (marketing-fact): `null` — the product is marketed as a flagship "Digital Audio Player" (DAP). The `should-be-audio-electronics.md` product-category list and the Sanity `deviceType` vocabulary exclude DAPs, so no listed category is confirmed by the source. Recorded as `null` and flagged as a category gap. — https://astellnkern.co.uk/products/a-ultima-sp4000
- **deviceConnectivity** (marketing-fact): `wired-wireless` — the product has wired headphone output (3.5mm/2.5mm/4.4mm) plus Wi-Fi and Bluetooth
- **formFactor** (marketing-fact/legacy): `portable` — the product is a portable digital audio player (85mm x 149.8mm x 19.5mm; about 615g)
- **dacIncluded** (marketing-fact/legacy): `true` — the spec table lists "DAC: AKM4191 x4 + AKM4499EX x4 (Real Quad DAC)"
- **balancedOutput** (marketing-fact/legacy): `true` — the spec table lists "Outputs: Unbalanced Out (3.5mm), Optical Out(3.5mm), Balanced Out (2.5mm ... | 4.4m ...)"
- **amplification** (hard-spec): `null` — `amplification` is domain-gated to amplifier/receiver product categories; with `deviceType: null` it is not applicable
- **powerOutputPerChannelW** (hard-spec): `null` — not applicable to a DAP outside the slice's product-category schema
- **channelCount** (hard-spec): `null` — not applicable to a DAP outside the slice's product-category schema
- **inputs** (hard-spec): `null` — `inputs` is domain-gated to amplifier/receiver, DAC, network-streamer, or CD player categories; the SP4000's USB Type-C input is not recordable under the current schema because the DAP category is out of scope
- **outputs** (hard-spec): `null` — `outputs` is domain-gated to amplifier/receiver categories; the 3.5mm/2.5mm/4.4mm headphone outputs are not recordable under the current schema because the DAP category is out of scope
- **phonoStageBuiltIn** (marketing-fact): `null` — no phono-stage or turntable input is mentioned
- **trigger12v** (marketing-fact): `null` — no 12 V trigger or custom-install-ready feature is mentioned
- **remoteControlIncluded** (marketing-fact): `null` — no remote control is mentioned
- **maxSampleRateBitDepth** (hard-spec): `"PCM 32-bit/768kHz; DSD512"` — spec table: "Sample rate: PCM : 8kHz ~ 768kHz (8/16/24/32bits per Sample); DSD Native: DSD64 / DSD128 / DSD256 / DSD512"
- **dsdSupport** (hard-spec): `dsd256-plus` — DSD Native up to DSD512 is listed; the `dsd256-plus` enum value represents DSD256 and above
- **hiResCertification** (marketing-fact): `[]` — no MQA, Hi-Res Audio, or other named certification is stated on the manufacturer product page
- **dacChipsetFamily** (hard-spec): `["akm"]` — spec table: "DAC: AKM4191 x4 + AKM4499EX x4 (Real Quad DAC)"
- **streamingPlatformSupport** (marketing-fact): `null` — no AirPlay 2, Chromecast, Spotify Connect, TIDAL Connect, Roon Ready, or DLNA support is explicitly listed
- **networkConnection** (hard-spec): `["wifi"]` — spec table: "Wi-Fi: 802.11 a/b/g/n/ac (2.4/5GHz)"
- **driveType**, **turntableOperation**, **speedsSupported**, **phonoPreampBuiltIn**, **cartridgeIncluded**, **usbDigitalOutput** (hard-spec/marketing-fact): `null` — not a turntable
- **bluetoothCodecs** (marketing-fact): `["SBC", "AAC", "aptX HD", "LDAC"]` — spec table: "Bluetooth: V5.0 (A2DP, AVRCP, Qualcomm aptX HD, LDAC, LHDC, SBC, AAC)"; LHDC is not in the current schema vocabulary and is omitted
- **voiceAssistant** (marketing-fact): `null` — no Alexa or Google Assistant support is listed
- **multiroomSupport** (marketing-fact): `null` — no multiroom support is listed
- **finishColor** (hard-spec): `["black", "silver"]` — spec table: "Body Color: Black, Silver"
- **rackMountable19** (marketing-fact): `false` — portable device with no 19" rack-mount callout
- **countryOfManufacture** (hard-spec): `null` — no country of manufacture is stated on the product page
