---
product_id: "Pn6oyV4Ks5AcNbecjkV2A5"
product_slug: "hifiman-prelude-headphone-amplifier"
brand: "Hifiman"
name: "Hifiman Prelude Headphone Amplifier"
slice: "audio-electronics"
spec_fields:
  price:
    min: 2199
    max: 2199
    currency: "USD"
  customerRating: null
  awards: []
  condition: "new"
  inStock: null
  dealsDiscount: "sale"
  newArrival: null
  deviceType: null
  deviceConnectivity: "wired"
  formFactor: "desktop"
  amplification: null
  dacIncluded: false
  balancedOutput: true
  powerOutputPerChannelW: null
  channelCount: null
  phonoStageBuiltIn: null
  trigger12v: null
  remoteControlIncluded: null
  inputs: null
  outputs: null
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
  voiceAssistant: null
  multiroomSupport: null
  bluetoothCodecs: null
  finishColor: ["Aluminum"]
  rackMountable19: false
  countryOfManufacture: null
source_urls: ["https://hifiman.com/products/detail/341", "https://hifiman.com/services/downlist/0/341", "https://store.hifiman.com/index.php/prelude.html", "https://headphones.com/products/hifiman-prelude-headphone-amplifier"]
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **price** (internal): `{min: 2199, max: 2199, currency: "USD"}` — sang-logium-zdb.2.22 product list lists Prelude at `$2,199.00`; Headphones.com shows `Sale price $2,199` with `Regular price $2,499.00` struck through. The HIFIMAN manufacturer store lists the unit at `$2,499.00` with no discount.
- **condition** (internal): `"new"` — the main product listing on Headphones.com and the HIFIMAN store is for a new unit.
- **inStock** (internal): `null` — Headphones.com shows `Sold out` / `On back order`, while the HIFIMAN store lists `Availability: In stock`. These same-tier retailers disagree, so the value is recorded as `null` and the conflict is noted.
- **dealsDiscount** (internal): `"sale"` — Headphones.com lists the unit at $2,199 with a struck-through $2,499 regular price. The HIFIMAN store lists $2,499 with no sale, so the conflict is noted.
- **deviceType** (marketing-fact): `null` — the product is marketed as a "Fully Balanced Class A Headphone Amplifier" and the manual cover calls it a "DAC and Headphone Amplifier". The current `audio-electronics` `deviceType` vocabulary (integrated-amplifier, power-amplifier, preamplifier, av-surround-receiver, stereo-receiver, dac, network-streamer, cd-player-transport, turntable) does not include `headphone-amp`. It is not forced into `preamplifier` because, despite having pre-amp (line-level) outputs, the product is primarily a headphone amplifier; `null` is recorded to avoid shoe-horning.
- **deviceConnectivity** (marketing-fact): `"wired"` — the Owner's Guide and Headphones.com confirm only analog (RCA/XLR) and AC power connections; no Bluetooth or network interface is listed.
- **formFactor** (marketing-fact): `"desktop"` — Headphones.com `Portability` field reads `Not Portable`; manual dimensions 330*56*260mm, net weight 6.5kg.
- **amplification**, **powerOutputPerChannelW**, **channelCount**, **phonoStageBuiltIn**, **trigger12v**, **remoteControlIncluded**, **inputs**, **outputs**: `null` — these fields are domain-gated in `productType.ts` to the five amplifier `deviceType` values. Because Prelude is a headphone amplifier and `deviceType` is recorded as `null`, the amplification-domain fields do not apply. The manual and Headphones.com do describe a Class A MOS-FET design, RCA/XLR inputs and pre-amp/headphone outputs, but they are captured in the conflict/caution notes rather than forced into a mismatched schema category.
- **dacIncluded** (marketing-fact): `false` — the Owner's Guide only lists analog inputs and outputs and contains no DAC, digital input, or D/A conversion description. The cover phrase "DAC and Headphone Amplifier" conflicts with the actual technical content, so `false` is recorded.
- **balancedOutput** (hard-spec): `true` — manual and Headphones.com both list balanced XLR and 4.4mm/XLR 4-pin headphone outputs.
- **maxSampleRateBitDepth**, **dsdSupport**, **hiResCertification**, **dacChipsetFamily**, **streamingPlatformSupport**, **networkConnection**: `null` — these fields are domain-gated to `deviceType` values `dac`, `network-streamer`, or `cd-player-transport`. The Prelude is an analog headphone amplifier, so none apply.
- **bluetoothCodecs**, **voiceAssistant**, **multiroomSupport**: `null` — these fields are domain-gated to `deviceConnectivity` values `bluetooth`, `wifi-networked`, or `wired-wireless`; the Prelude is `wired`.
- **finishColor** (marketing-fact): `["Aluminum"]` — Headphones.com description: "The Prelude's housing is meticulously crafted from a single piece of aluminum".
- **rackMountable19** (marketing-fact): `false` — desktop unit; no 19" rack-mounting claim.
- **countryOfManufacture** (marketing-fact): `null` — not stated on the product page or manual.

## Conflict / Caution Notes

- **Price and discount conflict:** sang-logium-zdb.2.22 lists $2,199.00. Headphones.com matches this sale price ($2,199, down from $2,499). The HIFIMAN manufacturer store lists $2,499.00 with no discount. `price` is recorded from the issue/Headphones.com, and the conflict is noted.
- **Stock conflict:** Headphones.com shows the unit `Sold out` / `On back order`, while the HIFIMAN store shows `In stock`. Because same-tier retailers disagree, `inStock` is recorded as `null`.
- **DAC claim conflict:** The Owner's Guide cover reads "DAC and Headphone Amplifier / PROFESSIONAL DIGITAL TO ANALOG CONVERTER", but the manual's connector list and input description are purely analog (RCA/XLR) and there is no digital input. `dacIncluded` is recorded as `false` based on the actual technical content, not the cover copy.
- **Product-category / taxonomy gap:** The Prelude is a headphone amplifier, but the current `audio-electronics` `deviceType` enum does not include `headphone-amp`. It is not force-fit into `preamplifier`; `deviceType` is recorded as `null`. The observed Class A MOS-FET topology, RCA/XLR inputs and XLR/RCA pre-amp plus 4.4mm/XLR headphone outputs are documented in the verification/conflict notes but are not shoe-horned into the amplifier-domain schema fields.
