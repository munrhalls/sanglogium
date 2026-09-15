---
product_id: "Pn6oyV4Ks5AcNbecjkVKDF"
product_slug: "enleum-hpa-23rm-headphone-amplifier"
brand: "Enleum"
name: "Enleum HPA-23rm Headphone Amplifier"
slice: "audio-electronics"
price: 299900
spec_fields:
  brand:
    - "enleum"
  customerRating: null
  condition: "new"
  inStock: false
  dealsDiscount: null
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
  powerOutputPerChannelW: 1
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
  - "https://audio46.com/products/enleum-hpa-23rm-reference-headphone-amplifier"
  - "https://majorhifi.com/enleum-hpa-23rm-review/"
  - "https://www.audiomagic.com.au/product-page/enleum-hpa-23rm-headphones-amplifier"
  - "https://soundnews.net/amplifiers/power-amps/for-ears-and-years-enleum-amp-23r-review/"
  - "https://www.red-dot.org/project/enleum-hpa-23rm-55736"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **brand** (hard-spec): `["enleum"]` — all sources identify the brand as Enleum.
- **customerRating** (internal): `null` — no aggregate customer rating is displayed on any source page.
- **condition** (marketing-fact): `"new"` — Audio46 states "New, factory sealed, and covered by 2 year limited Enleum manufacturer warranty".
- **inStock** (internal): `false` — Audio46 shows "Discontinued - Sadly we're unable to get any more".
- **dealsDiscount** (marketing-fact): `null` — no sale, clearance, or discount callout is found for the HPA-23RM itself.
- **newArrival** (marketing-fact): `false` — the product is discontinued; no new-arrival callout.
- **awards** (marketing-fact): `["Red Dot Design Award 2022", "iF Design Award 2023"]` — official Enleum product page states the HPA-23RM "won the Red Dot Design Award 2022 and iF Design Award 2023".
- **deviceType** (marketing-fact): `null` — the manufacturer and retailers describe the product as a "reference dedicated headphone amplifier"; the current `deviceType` vocabulary does not contain a headphone-amplifier value, so it is recorded as `null`.
- **deviceConnectivity** (marketing-fact): `"wired"` — RCA and 1/8" mini jack inputs; no Bluetooth, Wi-Fi, or network connectivity.
- **formFactor** (marketing-fact): `"portable"` — the product is battery-powered, 750g, and explicitly designed for "desktop and mobile usage"; the Headphones.com HPA-23RMH page (same chassis/platform) lists "Not Portable, Portable". The `portable` value is recorded because the battery-powered mobile capability is the distinctive form factor.
- **dacIncluded** (marketing-fact): `false` — no DAC function is mentioned.
- **balancedOutput** (marketing-fact): `false` — no balanced XLR or 4.4 mm output is listed; the outputs are 1/4" and 1/8" unbalanced headphone jacks.
- **amplification** (marketing-fact): `"solid-state"` — the official page describes MOSFET voltage output and bipolar transistor current output, both solid-state.
- **powerOutputPerChannelW** (hard-spec): `1` — official spec: "Current: 1 W (HPA-23RM) ... at 30ohms"; the voltage output is 500 mW at 30ohms.
- **channelCount** (marketing-fact): `["2.0"]` — stereo headphone amplifier (left/right channels).
- **inputs** (marketing-fact): `["rca"]` — official: "RCA and 1/8" Mini Jack (Analog)". The 1/8" mini jack is not in the current `inputs` vocabulary.
- **outputs** (marketing-fact): `["headphone-jack"]` — official: "1/4" (Current Output) and 1/8" (Voltage Output) Headphone Jacks".
- **phonoStageBuiltIn** (marketing-fact): `null` — not applicable to a headphone amplifier; no phono input mentioned.
- **trigger12v** (marketing-fact): `false` — no 12V trigger or custom-install-ready language found.
- **remoteControlIncluded** (marketing-fact): `false` — no remote control is listed in the specification or box contents.
- **maxSampleRateBitDepth**, **dsdSupport**, **hiResCertification**, **dacChipsetFamily**, **streamingPlatformSupport**, **networkConnection** (hard-spec/marketing-fact): `null` — the HPA-23RM is an analogue headphone amplifier, not a digital source.
- **driveType**, **turntableOperation**, **speedsSupported**, **phonoPreampBuiltIn**, **cartridgeIncluded**, **usbDigitalOutput** (marketing-fact): `null` — not a turntable.
- **bluetoothCodecs**, **voiceAssistant**, **multiroomSupport** (marketing-fact): `null` — `deviceConnectivity` is `wired`; no wireless features.
- **finishColor** (marketing-fact): `["black"]` — Audio Magic product page lists "Black".
- **rackMountable19** (marketing-fact): `false` — portable/desktop form factor; no 19" rack-mount claim.
- **countryOfManufacture** (marketing-fact): `"South Korea"` — Soundnews review states Enleum units are "made in South Korea".

## Conflict / Caution Notes

- **Price sourcing**: the HPA-23RM is discontinued and no current retailer lists the price. Major HiFi's review states "It's priced at $2,999"; this is the value recorded. The Audio46 page is for the discontinued product and instead displays the HPA-23RMH at $3,500.
- **Device-type vocabulary gap**: the source calls the product a "reference dedicated headphone amplifier"; the current `deviceType` vocabulary does not include `headphone-amp`, so the value is `null` and the amplification/output/input fields are recorded where data exists.
- **Country-of-manufacture conflict**: Soundnews states "made in South Korea"; the Red Dot award entry lists Manufacturer "Enleum Inc., San Jose, CA, USA". The CA listing appears to be the company/design office, while Soundnews explicitly describes the manufacturing location. "South Korea" is recorded.
- **Input vocabulary gap**: the 1/8" mini jack input is not in the current `inputs` enum, so only `rca` is recorded.
- **Output mapping**: the product has both 1/4" and 1/8" unbalanced headphone outputs, mapped to the single `headphone-jack` value.
