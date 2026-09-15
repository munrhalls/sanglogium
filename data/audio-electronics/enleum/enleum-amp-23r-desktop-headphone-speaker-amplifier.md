---
product_id: "PHPYj28HJdPDHAaIBChGhe"
product_slug: "enleum-amp-23r-desktop-headphone-speaker-amplifier"
brand: "Enleum"
name: "Enleum Amp-23r Desktop Headphone & Speaker Amplifier"
slice: "audio-electronics"
price: 625000
spec_fields:
  brand:
    - "enleum"
  customerRating: null
  condition: "new"
  inStock: false
  dealsDiscount: "none"
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
  - "https://enleum.com/amp-23r/"
  - "https://enleum.com/store/amp-23r/"
  - "https://headphones.com/products/enleum-amp-23r-desktop-headphone-speaker-amplifier"
  - "https://www.mimic-audio.com/products/enleum-amp-23r"
  - "https://www.heynowhifi.com.au/products/enleum-amp-23r-integrated-amplifier"
  - "https://soundnews.net/amplifiers/power-amps/for-ears-and-years-enleum-amp-23r-review/"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **brand** (hard-spec): `["enleum"]` — all sources identify the brand as Enleum.
- **customerRating** (internal): `null` — no aggregate customer rating is displayed on any source page.
- **condition** (marketing-fact): `"new"` — the Headphones.com regular listing is a full-price, non-open-box product page.
- **inStock** (internal): `false` — Headphones.com shows "Back-order" / "Pre-pay to reserve".
- **dealsDiscount** (marketing-fact): `"none"` — the regular listing shows a sale price equal to the regular price ($6,250).
- **newArrival** (marketing-fact): `false` — the product launched in 2021; no new-arrival badge or launch callout.
- **awards** (marketing-fact): `["Red Dot Award: Product Design 2021", "iF Design Gold Award 2022"]` — official Enleum product page.
- **deviceType** (marketing-fact): `"integrated-amplifier"` — Mimic Audio describes it as "integrated stereo amplifier and headphone amplifier, solid-state"; it drives loudspeakers and headphones.
- **deviceConnectivity** (marketing-fact): `"wired"` — RCA and ENLINK (BNC) inputs only; no Bluetooth, Wi-Fi, or network connectivity.
- **formFactor** (marketing-fact): `"desktop"` — Headphones.com "Not Portable"; AC-powered, 4.0 kg chassis.
- **dacIncluded** (marketing-fact): `false` — no digital-to-analog converter section is mentioned.
- **balancedOutput** (marketing-fact): `false` — no balanced XLR or 4.4 mm output is listed; the headphone output is 1/4" unbalanced and the speaker binding posts are unbalanced.
- **amplification** (marketing-fact): `"solid-state"` — Headphones.com "Amplifier type" field reads "Solid-state"; the official page describes discrete transistors / EXICON MOSFETs.
- **powerOutputPerChannelW** (hard-spec): `25` — official spec: "25 watts (8 Ω, 1 kHz)"; also "45 watts (4 Ω, 1 kHz)" and "4 watts (60 Ω, 1 kHz)".
- **channelCount** (marketing-fact): `["2.0"]` — integrated stereo amplifier.
- **inputs** (marketing-fact): `["rca"]` — official: "2 Voltage (RCA) | 1 ENLINK (BNC)". The ENLINK BNC current-mode input is not in the current `inputs` vocabulary, so it is recorded only in these notes.
- **outputs** (marketing-fact): `["speaker-terminals", "headphone-jack"]` — official: "5 Way Speaker Binding Post | 1/4" Headphone Out".
- **phonoStageBuiltIn** (marketing-fact): `"none"` — no phono / MM / MC input is mentioned.
- **trigger12v** (marketing-fact): `false` — no 12V trigger or custom-install-ready language found.
- **remoteControlIncluded** (marketing-fact): `true` — the official spec lists "Remote Controller" and Mimic's box contents list a remote control.
- **maxSampleRateBitDepth**, **dsdSupport**, **hiResCertification**, **dacChipsetFamily**, **streamingPlatformSupport**, **networkConnection** (hard-spec/marketing-fact): `null` — the AMP-23R is an analogue integrated amplifier, not a DAC, streamer, or CD player.
- **driveType**, **turntableOperation**, **speedsSupported**, **phonoPreampBuiltIn**, **cartridgeIncluded**, **usbDigitalOutput** (marketing-fact): `null` — not a turntable.
- **bluetoothCodecs**, **voiceAssistant**, **multiroomSupport** (marketing-fact): `null` — `deviceConnectivity` is `wired`; no wireless features.
- **finishColor** (marketing-fact): `["black"]` — HeyNow Hi-Fi product page lists "Colour: Black".
- **rackMountable19** (marketing-fact): `false` — desktop form factor; no 19" rack-mount claim.
- **countryOfManufacture** (marketing-fact): `"South Korea"` — Soundnews review states Enleum units are "made in South Korea".

## Conflict / Caution Notes

- **Price conflict**: Headphones.com lists the regular AMP-23R at $6,250, while the Enleum store and Mimic Audio list $6,500.00. The recorded `price` follows the Headphones.com listing; the higher manufacturer/retailer price is noted.
- **Country-of-manufacture conflict**: Soundnews states "made in South Korea"; the Red Dot / iF award entry for Enleum lists the company in San Jose, CA, USA, which appears to be the company/design office rather than the manufacturing facility. "South Korea" is recorded with the Soundnews citation.
- **Input vocabulary gap**: the ENLINK (BNC) proprietary current-mode input is not represented in the current `inputs` enum, so only `rca` is recorded.
- **deviceType source**: the manufacturer product page calls the unit a "reference compact amplifier"; the value `integrated-amplifier` is taken from the Mimic Audio retailer description, which explicitly calls it an "integrated stereo amplifier and headphone amplifier".
