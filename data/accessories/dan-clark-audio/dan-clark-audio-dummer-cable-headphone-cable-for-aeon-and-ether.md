---
product_id: "PHPYj28HJdPDHAaIB6cRSG"
product_slug: "dan-clark-audio-dummer-cable-headphone-cable-for-aeon-and-ether"
brand: "Dan Clark Audio"
name: "Dan Clark Audio DUMMER Cable | Headphone Cable for AEON and ETHER"
slice: "accessories"
spec_fields:
  customerRating: 5
  awards: []
  condition: null
  dealsDiscount: null
  newArrival: null
  accessoryType: "cables-interconnects"
  compatibleProductType:
    - "headphone"
  cableFunction: null
  connectorTermination:
    - "3.5mm"
    - "4.4mm"
    - "xlr"
  lengthM: 2
  conductorMaterial: null
  balancedUnbalanced:
    - "balanced"
    - "unbalanced"
  furnitureType: null
  material: null
  adjustableHeight: null
  weightCapacityKg: null
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
  - "https://danclarkaudio.com/dummer-cable-for-aeon-and-ether-headphones.html"
  - "https://apos.audio/products/dan-clark-audio-dummer-headphone-cable"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **customerRating** (marketing-fact): schema.org aggregateRating `ratingValue` 5 / `bestRating` 5 from 3 reviews — https://danclarkaudio.com/dummer-cable-for-aeon-and-ether-headphones.html
- **awards** (marketing-fact): `[]` — no named awards, editor's choice, or recognition badges are listed on the manufacturer product page or the Apos listing — https://danclarkaudio.com/dummer-cable-for-aeon-and-ether-headphones.html
- **condition**, **dealsDiscount**, **newArrival** (marketing-fact): `null` — no explicit condition, sale/clearance, or new-arrival flag is stated on the product page
- **accessoryType** (marketing-fact): product page title and option names identify it as a headphone cable; mapped to `cables-interconnects` — https://danclarkaudio.com/dummer-cable-for-aeon-and-ether-headphones.html
- **compatibleProductType** (marketing-fact): product name and options state "for AEON and ETHER" headphones — `headphone`
- **cableFunction** (marketing-fact): `null` — the source describes a headphone cable; the current `Cable Function` vocabulary (interconnect, speaker, digital, power/mains, phono) does not contain a `headphone-cable` value, so it is recorded as `null` rather than invented
- **connectorTermination** (hard-spec): manufacturer product options list a 3.5mm / 1/4" dual-tip source plug, 4-pin XLR, and 4.4mm. Apos confirms "1/4" or 3.5mm dual tip" and "4-pin XLR" — the field records the supported vocabulary values `["3.5mm", "4.4mm", "xlr"]`
- **lengthM** (hard-spec): every manufacturer product option is prefixed "2m ..." — `2`
- **conductorMaterial** (hard-spec): `null` — no conductor material is stated on the manufacturer product page or the Apos listing after checking the tier-order sources
- **balancedUnbalanced** (hard-spec): product options include "4-pin XLR Balanced" and "4.4mm Balanced" (balanced) and a 3.5mm source option (unbalanced) — `["balanced", "unbalanced"]`
- All remaining `spec_fields` are `null` because their `should-be-accessories.md` domain groups do not apply to a `cables-interconnects` headphone cable.

## Conflict / Caution Notes

- The manufacturer and Apos both list a 1/4" (6.35mm) source-side plug or adapter for the DUMMER cable. The current accessories `connectorTermination` controlled vocabulary (`should-be-accessories.md` item 12 and `facetConfig.ts`) does not include `6.35mm` / `1/4"`, so that value is not recorded in the facet field and is preserved here for a future vocabulary update. The Apos listing does not mention the 4.4mm option shown on the manufacturer page; the manufacturer page is the higher-tier source and is preferred.
