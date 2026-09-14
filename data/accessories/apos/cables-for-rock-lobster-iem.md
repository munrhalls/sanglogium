---
product_id: "GPjMdcfFWZVrKyR2PB7nEI"
product_slug: "cables-for-rock-lobster-iem"
brand: "Apos"
name: "Cables for Rock Lobster IEM"
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
  lengthM: 1.2
  conductorMaterial:
    - "silver-plated-copper"
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
  - "https://apos.audio/products/cables-for-rock-lobster-iem"
  - "https://apos.audio/products/apos-x-community-rock-lobster-iems"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **customerRating** (internal): `null` — no visible customer rating or aggregate score on the manufacturer product page.
- **awards** (marketing-fact): `null` — no named product-level award, editor’s-choice badge, or recognition program is listed on the manufacturer product page.
- **condition** (marketing-fact): `new` — product page lists a single price and "Add to cart" with no condition qualifier; offered as a new product on the Apos store.
- **dealsDiscount** (internal): `null` — page displays "Sale price" but no compare-at price or discount/clearance qualifier; no active deal facet value can be confirmed.
- **newArrival** (internal): `null` — no new-arrival flag, announcement, or launch banner is listed on the manufacturer product page.
- **accessoryType** (marketing-fact): `cables-interconnects` — product is an IEM cable sold in the Apos Audio accessories catalogue.
- **compatibleProductType** (marketing-fact): `["headphone"]` — product title and description state it is for "Rock Lobster IEM" / IEMs, which are an in-ear headphone form factor.
- **cableFunction** (marketing-fact): `null` — page describes an IEM upgrade cable; the schema's `cableFunction` enum (interconnect, speaker, digital, power, phono) has no generic headphone/IEM cable option.
- **connectorTermination** (hard-spec): `["3.5mm", "4.4mm"]` — product option labels read "Plug: 3.5mm 4.4mm"; the IEM-side "0.78mm 2-pin" pin is not in the schema's standalone-cable connector enum, so it is not recorded here.
- **lengthM** (hard-spec): `1.2` — specs list "Length: 3.9 feet (1.2m)".
- **conductorMaterial** (hard-spec): `["silver-plated-copper"]` — specs list "Material: 5N copper silver-plated wire"; mapped to the schema's `silver-plated-copper` bucket.
- **balancedUnbalanced** (hard-spec): `null` — product is offered with both 3.5mm (unbalanced) and 4.4mm (balanced) source-side options; the single-value schema field cannot capture both, so it is recorded as null rather than guessed.
- **compatibility** (marketing-fact): `null` — page describes generic IEM compatibility and does not list specific compatible headphone brand or model exact-fit matches.

### Domain-gated accessory fields (all `null`)

Because the product is a `cables-interconnects` accessory, the following fields are not applicable under the schema's domain gating and are recorded as `null`: `furnitureType`, `material`, `adjustableHeight`, `weightCapacityKg`, `powerProductType`, `outletCount`, `powerConnectorType`, `cleaningProductType`, `formatCompatibility`, `partType`, `adapterFunction`, `treatmentType`, `mounting`.

## Conflict / Caution Notes

- The product page is titled "Cables for Rock Lobster IEM" and is also referenced from the "Apos x Community Rock Lobster IEMs" bundle page. The case is a cross-sell, not a replacement part, so `compatibility` is not populated.
