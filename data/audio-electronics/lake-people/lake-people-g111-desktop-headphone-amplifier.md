---
product_id: "k27n1AQuIbSr5iozG1vKTr"
product_slug: "lake-people-g111-desktop-headphone-amplifier"
brand: "Lake People"
name: "Lake People G111 Desktop Headphone Amplifier"
slice: "audio-electronics"
price: 54995
spec_fields:
  brand:
    - "lake-people"
  customerRating: null
  condition: "new"
  inStock: true
  dealsDiscount: "none"
  newArrival: false
  awards: []
  deviceType: null
  deviceConnectivity: "wired"
  formFactor: "desktop"
  dacIncluded: false
  balancedOutput: false
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
    - "Black"
  rackMountable19: false
  countryOfManufacture: "Germany"
source_urls:
  - "https://www.lake-people.de/en/categories/headphone-preamps/lake-people-phone-amp-g111-mkii"
  - "https://www.lake-people.de/media/pdf/e1/d4/9e/Lake_People_G111_MKII_Manual_EN_2024_07.pdf"
  - "https://www.lake-people.de/media/pdf/1a/ab/e9/Lake_People_G111_MKII_TechGuide_EN_2024_07.pdf"
  - "https://web.archive.org/web/20210123103413/https://power-holdings-inc.com/Lake-People-G111-Headphone-Amplifier-p137192152"
  - "https://power-holdings-inc.com/Lake-People-G111-MKII-Headphone-Amplifier-p137192152"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **price** (internal): `54995` cents ($549.95 USD) — the archived Power Holdings Inc. product page (2021-01-23) shows "Lake People G111 Headphone Amplifier" with "$549.95" and "In stock". The live Power Holdings listing for the G111 MKII now shows "$599.95"; that conflict is recorded below.

- **brand** (hard-spec): `["lake-people"]` — the manufacturer product page lists the brand as "Lake People" and the product title is "Lake People Phone-Amp G111 MKII".

- **customerRating** (internal): `null` — no customer-review aggregate is displayed on the manufacturer page or on the audited Power Holdings listing.

- **condition** (marketing-fact): `"new"` — the Power Holdings archived listing is a regular, full-price product page with no open-box, B-stock, refurbished, or used indication.

- **inStock** (marketing-fact): `true` — the archived Power Holdings page explicitly states "In stock".

- **dealsDiscount** (marketing-fact): `"none"` — the archived Power Holdings page shows a single price of $549.95 with no sale, clearance, or discount callout.

- **newArrival** (marketing-fact): `false` — the product page and manual describe an established product line (G111 / G111 MKII), with no "New Arrival" or launch callout.

- **awards** (marketing-fact): `[]` — no named awards, editor's-choice badges, or recognition callouts are found on the manufacturer product page, manual, TechGuide, or retailer listing.

- **deviceType** (marketing-fact): `null` — the manufacturer identifies the product as a "Phone-Amp" / "stereo headphone amplifier" and "headphone preamp". The `should-be-audio-electronics.md` product-category vocabulary does not include a headphone-amplifier value, so the field is recorded as `null` rather than force-fit into `integrated-amplifier`, `preamplifier`, or another category.

- **deviceConnectivity** (marketing-fact): `"wired"` — the product has balanced XLR and unbalanced RCA analog inputs and two 6.3 mm unbalanced headphone outputs. No Bluetooth, Wi-Fi, Ethernet, or other wireless connection is listed.

- **formFactor** (legacy): `"desktop"` — the manufacturer product page technical-data table lists "housing form: Desktop" and the TechGuide describes a compact, rugged aluminium desktop case.

- **dacIncluded** (legacy): `false` — the product is described as a pure analogue headphone amplifier; no DAC, D/A converter, or digital-source function is mentioned on the manufacturer page, in the manual, or in the TechGuide.

- **balancedOutput** (legacy): `false` — the manufacturer product page states the headphone outputs are "2x TRS, 6,3 mm, unbalanced"; the manual and TechGuide list two 6.3 mm (1/4") unbalanced phone jacks. Balanced XLR connectors are present only on the input side.

- **amplification**, **powerOutputPerChannelW**, **channelCount**, **inputs**, **outputs**, **phonoStageBuiltIn**, **trigger12v**, **remoteControlIncluded**: `null` — these fields are domain-gated in `sanity-cms/schemaTypes/productType.ts` to the five amplifier/receiver `deviceType` values. Because `deviceType` is `null`, the fields do not apply, even though the hardware is a discrete-transistor stereo headphone amplifier with RCA/XLR inputs and 6.3 mm headphone outputs.

- **maxSampleRateBitDepth**, **dsdSupport**, **hiResCertification**, **dacChipsetFamily**, **streamingPlatformSupport**, **networkConnection**: `null` — the product is an analogue headphone amplifier, not a DAC, network streamer, or CD player/transport; no digital-source fields apply.

- **driveType**, **turntableOperation**, **speedsSupported**, **phonoPreampBuiltIn**, **cartridgeIncluded**, **usbDigitalOutput**: `null` — the product is not a turntable.

- **bluetoothCodecs**, **voiceAssistant**, **multiroomSupport**: `null` — `deviceConnectivity` is `wired`; the wireless/connectivity group does not apply.

- **finishColor** (marketing-fact): `["Black"]` — the manufacturer product-page technical-data table lists "color: black"; the TechGuide states the case is "4 mm aluminium, black anodized".

- **rackMountable19** (marketing-fact): `false` — the product is marketed and dimensioned as a desktop unit; no 19" rack-mounting hardware or claim is found on the manufacturer page, in the manual, or in the TechGuide.

- **countryOfManufacture** (marketing-fact): `"Germany"` — the manufacturer product page and TechGuide both state "Made in Germany".

## Conflict / Caution Notes

- **Product-category / taxonomy mismatch:** The manufacturer and retailer sources describe the G111 as a "headphone amplifier" / "Phone-Amp". The `should-be-audio-electronics.md` `deviceType` vocabulary does not contain a headphone-amplifier value, so the product is filed as `deviceType: null` rather than being force-fit into `preamplifier` or another category. This makes all amplification-group and output/input fields non-applicable under the current schema, even though the hardware has real inputs (XLR/RCA) and outputs (6.3 mm headphone jacks).

- **Price conflict across revisions and time:** The archived 2021 Power Holdings page for "Lake People G111 Headphone Amplifier" lists the price as $549.95. The current live Power Holdings page is for "Lake People G111 MKII Headphone Amplifier" and lists $599.95. The Lake People manufacturer shop lists 699.90 EUR for the G111 MKII. The $549.95 value is recorded for the original G111 SKU (matching the CMS `price_data` of 54995 cents), with the current MKII and EU prices noted as same-tier conflicts.

- **Dimensional conflict across sources:** The Lake People product page and TechGuide list the chassis as 168 x 47 x 165 mm (W x H x D). The Power Holdings and other audited retailer listings (e.g., Markertek, Thomann) list 168 x 47 x 125 mm. This is a same-tier manufacturer-vs-retailer conflict, but dimensions are not a `should-be-audio-electronics.md` filter field, so it is noted here and not recorded in a `filterAttributes` value.
