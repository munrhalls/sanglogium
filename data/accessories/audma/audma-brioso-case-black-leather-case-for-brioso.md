---
product_id: "MrEMtYwMtrFDGWmRnQr68D"
product_slug: "audma-brioso-case-black-leather-case-for-brioso"
brand: "Audma"
name: "Audma Brioso Case | Black Leather Case for Brioso"
slice: "accessories"
spec_fields:
  customerRating: null
  awards: []
  condition: null
  dealsDiscount: null
  newArrival: null
  accessoryType: "cases-storage-transport"
  compatibleProductType:
    - "amplifier-source"
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
  - "https://www.audma.it/brioso-phpa1"
  - "https://bloomaudio.com/products/audma-brioso-case"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **customerRating** (internal): `null` — Bloom displays one customer review and a distribution bar, but no explicit numeric star average; this is a store-computed field and not individually sourced from the manufacturer or product page.
- **awards** (marketing-fact): `[]` — no named award, editor’s choice, or recognition badge is listed on the Bloom product page or the Audma manufacturer site.
- **condition** (internal): `null` — condition (new / open-box / refurbished) is a store-operational field; the Bloom listing shows “Condition: New” and the variant title is “New”, but no manufacturer source states it.
- **dealsDiscount** (internal): `null` — no sale, clearance, or discount indication is listed on the Bloom product page; the price is $329.00 with no compare-at price.
- **newArrival** (internal): `null` — no new-arrival flag is listed on the Bloom product page.
- **accessoryType** (marketing-fact): `cases-storage-transport` — Bloom product title is “Audma Brioso Case | Black Leather Case for Brioso” and the site navigation lists the product under Accessories > Cases / Portable > Accessories > DAC Cases and DAP Cases; this maps to the should-be-accessories.md category “Cases & Storage/Transport” and the Sanity schema value `cases-storage-transport`.
- **compatibleProductType** (marketing-fact): `["amplifier-source"]` — the Bloom listing states “Black leather case for Audma Brioso”; the Audma Brioso PHPA1 manufacturer page identifies the device as a “portable headphones amplifier” and “portable headphone amplifier and DAC” with an analog-digital input architecture, which maps to the schema value `amplifier-source`.
- **material**: `null` — the product is described as a “leather case”, but the `filterAttributes.material` field is domain-gated to `stands-isolation` / `racks-furniture` and does not apply to `cases-storage-transport`.
- **compatibility**: `null` — the product is specifically designed for the Audma Brioso, but the `filterAttributes.compatibility` field is domain-gated to `replacement-parts` and does not apply to `cases-storage-transport`; the compatible device is captured under `compatibleProductType`.
- All other `spec_fields` are `null` because they are gated to other `accessoryType` domains (`cables-interconnects`, `stands-isolation`/`racks-furniture`, `power`, `cleaning-maintenance`, `replacement-parts`, `adapters-converters`, `room-acoustic-treatment`) and do not apply to a `cases-storage-transport` product.

## Conflict / Caution Notes

- The manufacturer’s own product page (`https://www.audma.it/brioso-phpa1`) and the Brioso PHPA1 user manual do not list the leather case as an Audma accessory; the case was only found on the Bloom Audio retailer listing. The Audma page was checked to confirm the Brioso device category; the Bloom page was used for the case product details.
- The Bloom page lists the product as “Sold Out” and the only variant as “New”; inventory and condition data are store-operational and are not written to `spec_fields`.
- Bloom’s navigation places the case under both “DAC Cases” and “DAP Cases” because the Brioso PHPA1 is a combined portable DAC/amplifier; both point to the same product URL.
