---
product_id: "GPjMdcfFWZVrKyR2PB7o7q"
product_slug: "magia-modular-cable-kit"
brand: "Apos"
name: "Magia Modular Cable Kit"
slice: "accessories"
spec_fields:
  customerRating: null
  awards: null
  condition: "new"
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
  lengthM: 0.127
  conductorMaterial:
    - "copper-ofc"
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
  partType: null
  compatibility: null
  adapterFunction: null
  treatmentType: null
  mounting: null
source_urls:
  - "https://apos.audio/products/apos-x-z-reviews-magia-modular-cable-kit"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **customerRating** (internal): `null` — no visible customer rating or aggregate score on the manufacturer product page.
- **awards** (marketing-fact): `null` — no named product-level award, editor’s-choice badge, or recognition program is listed on the manufacturer product page.
- **condition** (marketing-fact): `new` — product page lists a single price and "Add to cart" with no condition qualifier; the "made to order" note does not change the new-condition classification.
- **dealsDiscount** (internal): `null` — page displays "Sale price" but no compare-at price or discount/clearance qualifier; no active deal facet value can be confirmed.
- **newArrival** (internal): `null` — no new-arrival flag, announcement, or launch banner is listed on the manufacturer product page.
- **accessoryType** (marketing-fact): `cables-interconnects` — product is a modular cable / adapter kit sold in the Apos Audio accessories catalogue.
- **compatibleProductType** (marketing-fact): `["headphone"]` — product is designed for the Magia headphone cable's "mini XLR headphone connectors" and therefore for headphone use.
- **cableFunction** (marketing-fact): `null` — page describes modular headphone-cable adapters; the schema's `cableFunction` enum has no generic headphone/IEM cable option.
- **connectorTermination** (hard-spec): `["3.5mm", "4.4mm", "xlr"]` — specs list "Modular outputs: 3.5mm TRS, 4.4mm TRRRS balanced, 4-pin XLR"; the 4-pin XLR is mapped to the schema's `xlr` option because the accessories enum does not distinguish pin count.
- **lengthM** (hard-spec): `0.127` — specs list "Length of cable (excluding plugs): About 5\""; 5 in ≈ 0.127 m.
- **conductorMaterial** (hard-spec): `["copper-ofc"]` — specs list "Conductors: OCC 6N 99.99997% pure copper"; the schema has no dedicated OCC option, so it is mapped to the `copper-ofc` high-purity copper bucket.
- **balancedUnbalanced** (hard-spec): `null` — product is offered with 3.5mm TRS (unbalanced), 4.4mm balanced, and 4-pin XLR balanced options; the single-value schema field cannot capture both balanced and unbalanced, so it is recorded as null rather than guessed.
- **compatibility** (marketing-fact): `null` — product is designed for the Magia Cable's mini XLR headphone connectors, but no specific compatible headphone brand or model exact-fit match is listed.

### Domain-gated accessory fields (all `null`)

Because the product is a `cables-interconnects` accessory, the following fields are not applicable under the schema's domain gating and are recorded as `null`: `furnitureType`, `material`, `adjustableHeight`, `weightCapacityKg`, `powerProductType`, `outletCount`, `powerConnectorType`, `cleaningProductType`, `formatCompatibility`, `partType`, `adapterFunction`, `treatmentType`, `mounting`.

## Conflict / Caution Notes

- The live manufacturer product-page URL is `https://apos.audio/products/apos-x-z-reviews-magia-modular-cable-kit`, while the Sanity product slug is `magia-modular-cable-kit`. The file and frontmatter use the Sanity slug; the source URL is cited exactly as fetched.
