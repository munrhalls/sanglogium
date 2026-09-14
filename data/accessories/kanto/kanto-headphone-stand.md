---
product_id: "C0JSb66CHOxy1G14ni5ga1"
product_slug: "kanto-headphone-stand"
brand: "Kanto"
name: "Kanto Headphone Stand"
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
  weightCapacityKg: 3
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
  - "https://kantoaudio.com/speaker-accessories/h1/"
  - "https://mans.io/item/kanto/ca-h1"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **accessoryType** (marketing-fact): product page title "H1 Headphone Stands" and page heading "HEADPHONE STAND" identify the item as a headphone stand; mapped to the canonical taxonomy value `stands-isolation` — https://kantoaudio.com/speaker-accessories/h1/
- **compatibleProductType** (marketing-fact): "Suitable for on-ear and over-ear headphones" and "accommodate most on-ear and over-ear headphone sizes" — `headphone` — https://kantoaudio.com/speaker-accessories/h1/
- **material** (hard-spec): "Constructed out of steel" and "steel frame" — steel maps to the closed-vocabulary option `metal` — https://kantoaudio.com/speaker-accessories/h1/
- **adjustableHeight** (marketing-fact): `false` — no height adjustment is mentioned; the page gives a fixed height of "H1 measures 10″ tall" — https://kantoaudio.com/speaker-accessories/h1/
- **weightCapacityKg** (hard-spec): product page states "holding up to 6.6 pounds", and the spec sheet cross-check lists "Support weight 6.6 lb (3 kg)" — recorded as 3 — https://kantoaudio.com/speaker-accessories/h1/ and https://mans.io/item/kanto/ca-h1
- **furnitureType**: `null` — the closed `furnitureType` vocabulary (speaker-stand, equipment-rack-shelf, isolation-platform-feet-pucks, turntable-wall-shelf, wall-mount) does not include a headphone stand; the product is correctly classified under `accessoryType: stands-isolation` — https://kantoaudio.com/speaker-accessories/h1/
- **customerRating**, **awards**, **condition**, **dealsDiscount**, **newArrival**: `null` — not stated on the manufacturer product page or spec sheet. `condition`, `dealsDiscount`, and `newArrival` are store-operational fields; `customerRating` and `awards` are not listed.
- All remaining `spec_fields` are `null` because their `filterAttributes` schema `domain` gates them to other `accessoryType` values (cables-interconnects, power, cleaning-maintenance, replacement-parts, adapters-converters, room-acoustic-treatment) and do not apply to a `stands-isolation` headphone stand.

## Conflict / Caution Notes

- The live manufacturer product page identifies this item as the **Kanto H1 Headphone Stand** and lists it at $44.99 USD, while the Sanity catalogue record has the generic name "Kanto Headphone Stand" and price $39.99. The sourced spec values are taken from the H1 manufacturer page because the product type, stand description, and major-retailer regular price ($39.99) align with the H1 model. The name/price discrepancy is recorded here and left for the CMS patch phase, which is out of scope for this sourcing issue.
