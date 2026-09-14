---
product_id: "PHPYj28HJdPDHAaIB6cRiI"
product_slug: "dan-clark-audio-vivo-super-premium-headphone-cable"
brand: "Dan Clark Audio"
name: "Dan Clark Audio VIVO | Super Premium Headphone Cable"
slice: "accessories"
spec_fields:
  customerRating: 4.4
  awards: []
  condition: null
  dealsDiscount: null
  newArrival: null
  accessoryType: "cables-interconnects"
  compatibleProductType:
    - "headphone"
  cableFunction: null
  connectorTermination:
    - "2.5mm"
    - "3.5mm"
    - "4.4mm"
    - "xlr"
  lengthM:
    - 1.1
    - 2
    - 3.1
  conductorMaterial: "silver-plated-copper"
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
  - "https://danclarkaudio.com/vivo.html"
  - "https://www.audiosanctuary.co.uk/dan-clark-audio-vivo-super-premium-headphone-cable.html"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **customerRating** (marketing-fact): schema.org aggregateRating `ratingValue` 4.4 / `bestRating` 5 from 6 reviews — https://danclarkaudio.com/vivo.html
- **awards** (marketing-fact): `[]` — no named awards or recognition badges are listed
- **condition**, **dealsDiscount**, **newArrival** (marketing-fact): `null` — no explicit condition, sale/clearance, or new-arrival flag is stated
- **accessoryType** (marketing-fact): product description calls VIVO a "super-premium headphone cable"; mapped to `cables-interconnects` — https://danclarkaudio.com/vivo.html
- **compatibleProductType** (marketing-fact): "VIVO is included with all ETHER class headphones ... and is recommended as an upgrade cable for AEON class headphones" — `headphone`
- **cableFunction** (marketing-fact): `null` — source describes a headphone cable; the current `Cable Function` vocabulary does not contain a `headphone-cable` value
- **connectorTermination** (hard-spec): manufacturer "Length and Termination" options list 2.5mm, 3.5mm, 4.4mm, and 4-pin XLR source-side terminations — the field records the supported vocabulary values `["2.5mm", "3.5mm", "4.4mm", "xlr"]`
- **lengthM** (hard-spec): manufacturer options include 1.1m (3' 6"), 2m (6'), and 3.1m (10') lengths — `[1.1, 2, 3.1]`
- **conductorMaterial** (hard-spec): product description states "silver plated OFHC copper" — mapped to `silver-plated-copper`
- **balancedUnbalanced** (hard-spec): options include 2.5mm, 4.4mm, and 4-pin XLR (balanced) as well as 3.5mm and 1/4" (unbalanced) source terminations — `["balanced", "unbalanced"]`
- All remaining `spec_fields` are `null` because their `should-be-accessories.md` domain groups do not apply.

## Conflict / Caution Notes

- The same-tier audited retailer Audio Sanctuary lists VIVO lengths as 1.1 / 1.8 / 3.1m and source terminations as "3.5 mm / 6.3 mm / 4-Pin XLR". The live manufacturer product page (higher-tier source) lists lengths 1.1 / 2 / 3.1m and terminations 1/4" (6.35mm), 2.5mm, 3.5mm, 4-pin XLR, and 4.4mm. Per the sourcing protocol, the live manufacturer page is preferred. The 1.8m length from Audio Sanctuary and the 1/4" (6.35mm / 6.3mm) termination are recorded here as a conflict because the current `connectorTermination` controlled vocabulary does not include `6.35mm` / `6.3mm` / `1/4"`.
