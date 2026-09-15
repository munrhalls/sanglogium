---
product_id: "Pn6oyV4Ks5AcNbecjkVOLR"
product_slug: "enleum-amp-23-rmh-headphone-amplifier"
brand: "Enleum"
name: "Enleum Amp 23-RMH Headphone Amplifier"
slice: "audio-electronics"
price: 350000
spec_fields:
  brand:
    - "enleum"
  customerRating: null
  condition: "new"
  inStock: false
  dealsDiscount: "none"
  newArrival: false
  awards:
    - "Red Dot Design Award 2022"
    - "iF Design Award 2023"
  deviceType: null
  deviceConnectivity: "wired"
  formFactor: "portable"
  dacIncluded: false
  balancedOutput: false
  amplification: "solid-state"
  powerOutputPerChannelW: 1.35
  channelCount:
    - "2.0"
  inputs:
    - "rca"
  outputs:
    - "headphone-jack"
  phonoStageBuiltIn: null
  trigger12v: false
  remoteControlIncluded: false
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
  - "https://enleum.com/hpa-23rm/"
  - "https://enleum.com/store/hpa-23rm/"
  - "https://headphones.com/products/enleum-amp-23-rmh-headphone-amplifier"
  - "https://www.mimic-audio.com/products/enleum-hpa-23rm"
  - "https://soundnews.net/amplifiers/power-amps/for-ears-and-years-enleum-amp-23r-review/"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **brand** (hard-spec): `["enleum"]` — all sources identify the brand as Enleum.
- **customerRating** (internal): `null` — no aggregate customer rating is displayed; Mimic Audio shows "No reviews".
- **condition** (marketing-fact): `"new"` — the Headphones.com regular listing is a full-price, non-open-box product page.
- **inStock** (internal): `false` — Headphones.com shows "Back-order" / "Pre-pay to reserve".
- **dealsDiscount** (marketing-fact): `"none"` — the Headphones.com listing shows a sale price equal to the regular price ($3,500).
- **newArrival** (marketing-fact): `false` — no new-arrival badge or launch callout.
- **awards** (marketing-fact): `["Red Dot Design Award 2022", "iF Design Award 2023"]` — the HPA-23RMH is based on the HPA-23RM platform, which the official page says won the Red Dot Design Award 2022 and iF Design Award 2023. Headphones.com describes it as "Red Dot 2022 award winner" and a "Red Dot Design Award 2022 and iF Design Award 2023 winning platform".
- **deviceType** (marketing-fact): `null` — the product is described as a "reference-grade headphone amplifier"; the current `deviceType` vocabulary does not contain a headphone-amplifier value.
- **deviceConnectivity** (marketing-fact): `"wired"` — RCA and 3.5 mm mini jack inputs; no Bluetooth, Wi-Fi, or network connectivity.
- **formFactor** (marketing-fact): `"portable"` — the product has an internal battery and is designed for both desktop and on-the-go use; the Headphones.com `Portability` field reads "Not Portable, Portable". `portable` is recorded because the battery-powered mobile capability is the distinctive form factor.
- **dacIncluded** (marketing-fact): `false` — no DAC function is mentioned.
- **balancedOutput** (marketing-fact): `false` — no balanced XLR or 4.4 mm output is listed; the outputs are 6.35 mm and 3.5 mm unbalanced headphone jacks.
- **amplification** (marketing-fact): `"solid-state"` — Headphones.com "Amplifier type" reads "Solid-state"; Mimic Audio describes MOSFET voltage output and bipolar transistor current output.
- **powerOutputPerChannelW** (hard-spec): `1.35` — official spec: "Current: 1.35 W (HPA-23RMH) ... at 30ohms"; the voltage output is 500 mW at 30ohms.
- **channelCount** (marketing-fact): `["2.0"]` — stereo headphone amplifier.
- **inputs** (marketing-fact): `["rca"]` — Mimic Audio lists "RCA, 3.5mm mini jack". The 3.5 mm mini jack is not in the current `inputs` vocabulary.
- **outputs** (marketing-fact): `["headphone-jack"]` — Mimic Audio lists "6.35mm (current), 3.5mm (voltage)" headphone jacks.
- **phonoStageBuiltIn** (marketing-fact): `null` — not applicable; no phono input mentioned.
- **trigger12v** (marketing-fact): `false` — no 12V trigger or custom-install-ready language found.
- **remoteControlIncluded** (marketing-fact): `false` — no remote control is listed in the specification or box contents.
- **maxSampleRateBitDepth**, **dsdSupport**, **hiResCertification**, **dacChipsetFamily**, **streamingPlatformSupport**, **networkConnection** (hard-spec/marketing-fact): `null` — the HPA-23RMH is an analogue headphone amplifier, not a digital source.
- **driveType**, **turntableOperation**, **speedsSupported**, **phonoPreampBuiltIn**, **cartridgeIncluded**, **usbDigitalOutput** (marketing-fact): `null` — not a turntable.
- **bluetoothCodecs**, **voiceAssistant**, **multiroomSupport** (marketing-fact): `null` — `deviceConnectivity` is `wired`; no wireless features.
- **finishColor** (marketing-fact): `["black"]` — Headphones.com description calls it a "sleek black high-power amp".
- **rackMountable19** (marketing-fact): `false` — portable/desktop form factor; no 19" rack-mount claim.
- **countryOfManufacture** (marketing-fact): `"South Korea"` — Soundnews review states Enleum units are "made in South Korea".

## Conflict / Caution Notes

- **Awards inheritance**: the HPA-23RMH is a higher-power variant of the HPA-23RM. The Red Dot and iF awards are for the HPA-23RM platform; the HPA-23RMH product page and Headphones.com listing describe it as a "Red Dot 2022 award winner" / part of the award-winning platform.
- **Device-type vocabulary gap**: the source calls the product a "reference headphone amplifier"; the current `deviceType` vocabulary does not include `headphone-amp`, so the value is `null` and the amplification/output/input fields are recorded where data exists.
- **Form-factor dual nature**: the product is marketed as both desktop and portable. The schema allows one value, so `portable` is recorded and the desktop use case is noted.
- **Input vocabulary gap**: the 3.5 mm mini jack input is not in the current `inputs` enum, so only `rca` is recorded.
- **Output mapping**: the product has both 6.35 mm and 3.5 mm unbalanced headphone outputs, mapped to the single `headphone-jack` value.
