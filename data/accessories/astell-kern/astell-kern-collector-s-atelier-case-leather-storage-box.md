---
product_id: "PHPYj28HJdPDHAaIBCQ9Og"
product_slug: "astell-kern-collector-s-atelier-case-leather-storage-box"
brand: "Astell&Kern"
name: "Astell&Kern Collector's Atelier Case | Leather Storage Box"
slice: "accessories"
spec_fields:
  customerRating: null
  awards: null
  condition: null
  dealsDiscount: null
  newArrival: null
  accessoryType: "cases-storage-transport"
  compatibleProductType:
    - "amplifier-source"
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
  - "https://astellnkern.co.uk/products/collectors-atelier"
  - "https://docs/filters-sort/should-be-accessories.md"
  - "https://docs/filters-sort/accessories-filterattributes-migration.md"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **customerRating** (marketing-fact): `null` — the manufacturer product page does not display a customer rating or review score — https://astellnkern.co.uk/products/collectors-atelier
- **awards** (marketing-fact): `null` — no named product-level award, editor's-choice badge, or recognition program is listed on the manufacturer product page — https://astellnkern.co.uk/products/collectors-atelier
- **condition** (internal): `null` — no condition (new / open-box / refurbished) is stated by the manufacturer on the product page; this is a store-operational field — https://astellnkern.co.uk/products/collectors-atelier
- **dealsDiscount** (internal): `null` — the product page shows a sale price of £229.00, but the stable facet value format is not defined in the schema; the issue's Sanity-sourced USD price is $260.00, so `dealsDiscount` is left `null` for the later patch phase — https://astellnkern.co.uk/products/collectors-atelier
- **newArrival** (internal): `null` — no new-arrival flag or announcement is listed on the manufacturer product page — https://astellnkern.co.uk/products/collectors-atelier
- **accessoryType** (marketing-fact): `cases-storage-transport` — the product is listed under the Astell&Kern "Audio Accessories" and "Cases" catalogues and is described as a premium case for DAPs and IEMs, which maps to the `should-be-accessories.md` `Cases & Storage/Transport` category — https://astellnkern.co.uk/products/collectors-atelier
- **compatibleProductType** (marketing-fact): `["amplifier-source", "headphone"]` — the source states the case is "designed to securely store your Astell&Kern digital audio player and premium IEMs"; a digital audio player is an amplifier/source and IEMs are a headphone form factor — https://astellnkern.co.uk/products/collectors-atelier
- **compatibility** (marketing-fact): `null` — the `compatibility` field is domain-gated to `replacement-parts` and does not apply to a case; the source confirms product fit for DAPs and IEMs but not a specific model in the `replacement-parts` sense — https://astellnkern.co.uk/products/collectors-atelier

### Domain-gated accessory fields (all `null`)

Because the product is a case in the `cases-storage-transport` accessory category, the `filterAttributes` schema's `domain` gating means the following fields have no applicable value and are recorded as `null`:

`cableFunction`, `connectorTermination`, `lengthM`, `conductorMaterial`, `balancedUnbalanced`, `furnitureType`, `material`, `adjustableHeight`, `weightCapacityKg`, `powerProductType`, `outletCount`, `powerConnectorType`, `cleaningProductType`, `formatCompatibility`, `adapterFunction`, `treatmentType`, `mounting`.

Source for the product-type determination: https://astellnkern.co.uk/products/collectors-atelier

## Conflict / Caution Notes

- The manufacturer UK product page lists a sale price of £229.00, while the issue's Sanity-sourced price is $260.00 USD. No currency conversion is applied; the conflict is recorded for the later patch phase.
