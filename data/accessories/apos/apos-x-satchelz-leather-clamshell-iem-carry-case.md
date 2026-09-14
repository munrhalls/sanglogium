---
product_id: "xMEqvkRBbdrlJXyFG8duy3"
product_slug: "apos-x-satchelz-leather-clamshell-iem-carry-case"
brand: "Apos"
name: "Apos x SATCHELZ Leather Clamshell IEM Carry Case"
slice: "accessories"
spec_fields:
  customerRating: null
  awards: null
  condition: "new"
  dealsDiscount: null
  newArrival: null
  accessoryType: "cases-storage-transport"
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
  partType: null
  compatibility: null
  adapterFunction: null
  treatmentType: null
  mounting: null
source_urls:
  - "https://apos.audio/products/apos-x-satchelz-leather-clamshell-iem-carry-case"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **customerRating** (internal): `null` — no visible customer rating or aggregate score on the manufacturer product page.
- **awards** (marketing-fact): `null` — no named product-level award, editor’s-choice badge, or recognition program is listed on the manufacturer product page.
- **condition** (marketing-fact): `new` — product page lists a single price and "Add to cart" with no condition qualifier; offered as a new product on the Apos store.
- **dealsDiscount** (internal): `null` — page displays "Sale price" but no compare-at price or discount/clearance qualifier; no active deal facet value can be confirmed.
- **newArrival** (internal): `null` — no new-arrival flag, announcement, or launch banner is listed on the manufacturer product page.
- **accessoryType** (marketing-fact): `cases-storage-transport` — product is a leather clamshell carry case for IEMs, sold in the Apos Audio accessories catalogue.
- **compatibleProductType** (marketing-fact): `["headphone"]` — product page describes it as a case "for your IEMs" and offers bundles with Rock Lobster IEM headphones; IEMs are an in-ear headphone form factor.
- **compatibility** (marketing-fact): `null` — page describes generic IEM/headphone compatibility and does not list specific compatible headphone brand or model exact-fit matches. Additionally, the `compatibility` field is domain-gated to `replacement-parts` in the schema, so it is not populated for a case.
- **material** (marketing-fact): `null` — page states "Italian leather", but the `material` filter field is domain-gated to `stands-isolation` / `racks-furniture` and its vocabulary (wood, metal, acrylic, composite-mdf) does not include leather; therefore it is recorded as null.

### Domain-gated accessory fields (all `null`)

Because the product is a `cases-storage-transport` accessory, the following fields are not applicable under the schema's domain gating and are recorded as `null`: `cableFunction`, `connectorTermination`, `lengthM`, `conductorMaterial`, `balancedUnbalanced`, `furnitureType`, `material`, `adjustableHeight`, `weightCapacityKg`, `powerProductType`, `outletCount`, `powerConnectorType`, `cleaningProductType`, `formatCompatibility`, `partType`, `adapterFunction`, `treatmentType`, `mounting`.

## Conflict / Caution Notes

- The product page gives dimensions as "3.5\" across x 5.5\" from top of clip to bottom of case x 2\" deep". No dedicated dimensions/weight field exists in `should-be-accessories.md` or the accessories `filterAttributes` schema, so these values are not recorded.
