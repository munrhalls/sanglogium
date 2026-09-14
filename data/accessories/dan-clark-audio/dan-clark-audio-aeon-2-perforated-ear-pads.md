---
product_id: "Pn6oyV4Ks5AcNbecjjlPGd"
product_slug: "dan-clark-audio-aeon-2-perforated-ear-pads"
brand: "Dan Clark Audio"
name: "Dan Clark Audio AEON 2 Perforated Ear Pads"
slice: "accessories"
spec_fields:
  customerRating: 5
  awards: []
  condition: null
  dealsDiscount: null
  newArrival: null
  accessoryType: "replacement-parts"
  compatibleProductType:
    - "headphone"
  cableFunction: null
  connectorTermination: null
  lengthM: null
  conductorMaterial: null
  balancedUnbalanced: null
  furnitureType: null
  material: null
  adjustableHeight: null
  weightCapacityKg: null
  powerProductType: null
  outletCount: null
  powerConnectorType: null
  cleaningProductType: null
  formatCompatibility: null
  partType: "ear-pads-cushions"
  compatibility:
    - "AEON 2 Open"
    - "AEON 2 Closed"
    - "AEON Flow Open"
  adapterFunction: null
  treatmentType: null
  mounting: null
source_urls:
  - "https://danclarkaudio.com/aeon-ear-pads.html"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **customerRating** (marketing-fact): schema.org aggregateRating `ratingValue` 5 / `bestRating` 5 from 1 review — https://danclarkaudio.com/aeon-ear-pads.html
- **awards** (marketing-fact): `[]` — no named awards or recognition badges are listed
- **condition**, **dealsDiscount**, **newArrival** (marketing-fact): `null` — no explicit condition, sale/clearance, or new-arrival flag is stated
- **accessoryType** (marketing-fact): product description identifies these as "replacement AEON ear pads" — mapped to `replacement-parts`
- **compatibleProductType** (marketing-fact): ear pads are designed for AEON headphones — `headphone`
- **partType** (marketing-fact): product name "AEON Perforated Ear Pads" and description "replacement AEON ear pads" — `ear-pads-cushions`
- **compatibility** (marketing-fact): "These are replacement AEON ear pads for AEON 2 Open. The perforated pads can also be used with AEON 2 Closed ... may also be used with original AEON Flow Open." — `["AEON 2 Open", "AEON 2 Closed", "AEON Flow Open"]`
- **material** (marketing-fact): `null` — the description mentions "synthetic leather" and "memory foam", but the `material` field is domain-gated to Stands/Isolation/Furniture in `should-be-accessories.md` and does not apply to replacement parts
- All other `spec_fields` are `null` because their `should-be-accessories.md` domain groups do not apply to a `replacement-parts` ear-pad product.

## Conflict / Caution Notes

- The manufacturer page lists the price as $74.99, while the storefront product list shows $59.99. Price is not a `spec_fields` frontmatter field and is left to the storefront/Sanity product record. No spec-field conflict is introduced.
