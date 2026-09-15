---
product_id: "k27n1AQuIbSr5iozG1vPuL"
product_slug: "enleum-amp-23r-desktop-headphone-&-speaker-amplifier---open-box"
brand: "Enleum"
name: "Enleum Amp-23r Desktop Headphone & Speaker Amplifier - Open Box"
slice: "audio-electronics"
price: 505000
spec_fields:
  brand:
    - "enleum"
  customerRating: null
  condition: "open-box"
  inStock: false
  dealsDiscount: "sale"
  newArrival: false
  awards:
    - "Red Dot Award: Product Design 2021"
    - "iF Design Gold Award 2022"
  deviceType: "integrated-amplifier"
  deviceConnectivity: "wired"
  formFactor: "desktop"
  dacIncluded: false
  balancedOutput: false
  amplification: "solid-state"
  powerOutputPerChannelW: 25
  channelCount:
    - "2.0"
  inputs:
    - "rca"
  outputs:
    - "speaker-terminals"
    - "headphone-jack"
  phonoStageBuiltIn: "none"
  trigger12v: false
  remoteControlIncluded: true
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
    - "black"
  rackMountable19: false
  countryOfManufacture: "South Korea"
source_urls:
  - "https://headphones.com/products/enleum-amp-23r-desktop-headphone-speaker-amplifier-open-box"
  - "https://enleum.com/amp-23r/"
  - "https://www.mimic-audio.com/products/enleum-amp-23r"
  - "https://www.heynowhifi.com.au/products/enleum-amp-23r-integrated-amplifier"
  - "https://soundnews.net/amplifiers/power-amps/for-ears-and-years-enleum-amp-23r-review/"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **brand** (hard-spec): `["enleum"]` — all sources identify the brand as Enleum.
- **customerRating** (internal): `null` — no aggregate customer rating is displayed.
- **condition** (marketing-fact): `"open-box"` — Headphones.com page title includes "- Open Box" and the page states "Open Box" and "Open box items are final sale".
- **inStock** (internal): `false` — Headphones.com shows "Sold out" and "Join The Waitlist".
- **dealsDiscount** (marketing-fact): `"sale"` — the page lists "Sale price $5,050" with the original regular price of $6,250.00 struck through; the discount is tied to the open-box condition.
- **newArrival** (marketing-fact): `false` — no new-arrival badge or launch callout.
- **awards** (marketing-fact): `["Red Dot Award: Product Design 2021", "iF Design Gold Award 2022"]` — this is the same AMP-23R hardware; official product page lists the awards.
- **deviceType** (marketing-fact): `"integrated-amplifier"` — Mimic Audio describes the AMP-23R as "integrated stereo amplifier and headphone amplifier, solid-state".
- **deviceConnectivity** (marketing-fact): `"wired"` — RCA and ENLINK (BNC) inputs; no wireless.
- **formFactor** (marketing-fact): `"desktop"` — the same non-portable AMP-23R hardware; Headphones.com regular listing "Not Portable".
- **dacIncluded** (marketing-fact): `false` — no DAC function is mentioned.
- **balancedOutput** (marketing-fact): `false` — no balanced output is listed.
- **amplification** (marketing-fact): `"solid-state"` — Headphones.com "Amplifier type" field reads "Solid-state".
- **powerOutputPerChannelW** (hard-spec): `25` — official AMP-23R spec: "25 watts (8 Ω, 1 kHz)".
- **channelCount** (marketing-fact): `["2.0"]` — integrated stereo amplifier.
- **inputs** (marketing-fact): `["rca"]` — official: "2 Voltage (RCA) | 1 ENLINK (BNC)". The ENLINK BNC current-mode input is not in the current `inputs` vocabulary.
- **outputs** (marketing-fact): `["speaker-terminals", "headphone-jack"]` — official: "5 Way Speaker Binding Post | 1/4" Headphone Out".
- **phonoStageBuiltIn** (marketing-fact): `"none"` — no phono input mentioned.
- **trigger12v** (marketing-fact): `false` — no 12V trigger or custom-install-ready language found.
- **remoteControlIncluded** (marketing-fact): `true` — the regular AMP-23R specification lists a remote controller and Mimic's box contents include a remote control.
- **maxSampleRateBitDepth**, **dsdSupport**, **hiResCertification**, **dacChipsetFamily**, **streamingPlatformSupport**, **networkConnection** (hard-spec/marketing-fact): `null` — analogue integrated amplifier.
- **driveType**, **turntableOperation**, **speedsSupported**, **phonoPreampBuiltIn**, **cartridgeIncluded**, **usbDigitalOutput** (marketing-fact): `null` — not a turntable.
- **bluetoothCodecs**, **voiceAssistant**, **multiroomSupport** (marketing-fact): `null` — `deviceConnectivity` is `wired`.
- **finishColor** (marketing-fact): `["black"]` — the open-box listing uses the same product images as the regular AMP-23R; HeyNow Hi-Fi lists the regular model's colour as Black.
- **rackMountable19** (marketing-fact): `false` — desktop form factor; no 19" rack-mount claim.
- **countryOfManufacture** (marketing-fact): `"South Korea"` — Soundnews review states Enleum units are "made in South Korea".

## Conflict / Caution Notes

- **Open-box vs. regular product**: this record represents the open-box variant of the AMP-23R. The technical specifications are identical to the regular AMP-23R; only `condition`, `price`, and `dealsDiscount` differ.
- **Price / discount relationship**: the open-box price of $5,050 is lower than the regular $6,250.00. The `dealsDiscount` value is `sale` because the page uses "Sale price" wording and a struck-through higher price, but the discount is driven by the open-box condition.
- **Input vocabulary gap**: the ENLINK (BNC) proprietary current-mode input is not represented in the current `inputs` enum, so only `rca` is recorded.
- **Country-of-manufacture conflict**: Soundnews states "made in South Korea"; Red Dot / iF entries for Enleum list the company in San Jose, CA, USA. "South Korea" is recorded.
