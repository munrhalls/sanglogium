---
product_id: "GjMaRFaHMVTsBoyxtAJBKY"
product_slug: "kanto-h3-universal-desktop-headphone-stand-with-adapter-holder"
brand: "Kanto"
name: "Kanto H3 Universal Desktop Headphone Stand with Adapter Holder"
slice: "accessories"
spec_fields:
  customerRating: null
  awards: null
  condition: null
  dealsDiscount: null
  newArrival: null
  accessoryType: "stands-isolation"
  compatibleProductType:
    - "headphone"
  cableFunction: null
  connectorTermination: null
  lengthM: null
  conductorMaterial: null
  balancedUnbalanced: null
  furnitureType: null
  material:
    - "metal"
  adjustableHeight: false
  weightCapacityKg: 10
  powerProductType: null
  outletCount: null
  powerConnectorType: null
  cleaningProductType: null
  formatCompatibility: null
  partType: null
  compatibility: null
  adapterFunction: null
  treatmentType: null
  mounting: null
source_urls:
  - "https://kantoaudio.com/speaker-accessories/h3/"
  - "https://cdn.amplifi.pattern.com/722fa4ca-7acf-4364-8eb3-ef3132f77f34"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **accessoryType** (marketing-fact): product page title "H3 Headphone Stand with Adapter Storage" and page heading "HEADPHONE STAND" identify the item as a headphone stand; mapped to the canonical taxonomy value `stands-isolation` — https://kantoaudio.com/speaker-accessories/h3/
- **compatibleProductType** (marketing-fact): "H3 headset stand is large enough to work with headphones of any size" and "Show off your favorite pair of cans or gaming headsets" — `headphone` — https://kantoaudio.com/speaker-accessories/h3/
- **material** (hard-spec): "With premium materials and metal construction" — `metal` — https://kantoaudio.com/speaker-accessories/h3/
- **adjustableHeight** (marketing-fact): `false` — no height adjustment is mentioned; the stand has a fixed design with a built-in adapter storage slot — https://kantoaudio.com/speaker-accessories/h3/
- **weightCapacityKg** (hard-spec): user manual states "The maximum loading weight is 22lb (10kg)" — recorded as 10 — https://cdn.amplifi.pattern.com/722fa4ca-7acf-4364-8eb3-ef3132f77f34
- **furnitureType**: `null` — the closed `furnitureType` vocabulary (speaker-stand, equipment-rack-shelf, isolation-platform-feet-pucks, turntable-wall-shelf, wall-mount) does not include a headphone stand; the product is correctly classified under `accessoryType: stands-isolation` — https://kantoaudio.com/speaker-accessories/h3/
- **customerRating**, **awards**, **condition**, **dealsDiscount**, **newArrival**: `null` — not stated on the manufacturer product page or manual. `condition`, `dealsDiscount`, and `newArrival` are store-operational fields; `customerRating` and `awards` are not listed.
- All remaining `spec_fields` are `null` because their `filterAttributes` schema `domain` gates them to other `accessoryType` values (cables-interconnects, power, cleaning-maintenance, replacement-parts, adapters-converters, room-acoustic-treatment) and do not apply to a `stands-isolation` headphone stand.

## Conflict / Caution Notes

- The live Sanity `filterAttributes.accessoryType` for this product is the legacy value `"adapter"`. The manufacturer source identifies it as a headphone stand with an adapter storage slot (not an adapter/converter accessory), so the sourced `accessoryType` is `stands-isolation` and `adapterFunction` is `null`. The legacy value is left for the CMS patch phase, which is out of scope for this sourcing issue.
