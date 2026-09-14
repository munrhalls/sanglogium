---
product_id: "MrEMtYwMtrFDGWmRnQqv2C"
product_slug: "astell-kern-pd20-case-premium-leather-case"
brand: "Astell&Kern"
name: "Astell&Kern PD20 Case | Premium Leather Case"
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
  - "https://astellnkern.co.uk/products/pd20-case"
  - "https://docs/filters-sort/should-be-accessories.md"
  - "https://docs/filters-sort/accessories-filterattributes-migration.md"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **customerRating** (marketing-fact): `null` — the manufacturer product page does not display a customer rating or review score — https://astellnkern.co.uk/products/pd20-case
- **awards** (marketing-fact): `null` — no named product-level award, editor's-choice badge, or recognition program is listed on the manufacturer product page — https://astellnkern.co.uk/products/pd20-case
- **condition** (internal): `null` — no condition (new / open-box / refurbished) is stated by the manufacturer on the product page; this is a store-operational field — https://astellnkern.co.uk/products/pd20-case
- **dealsDiscount** (internal): `null` — the product page shows a sale price of £149.00, but the stable facet value format is not defined in the schema; the issue's Sanity-sourced USD price is $165.00, so `dealsDiscount` is left `null` for the later patch phase — https://astellnkern.co.uk/products/pd20-case
- **newArrival** (internal): `null` — no new-arrival flag or announcement is listed on the manufacturer product page — https://astellnkern.co.uk/products/pd20-case
- **accessoryType** (marketing-fact): `cases-storage-transport` — the product is listed under the Astell&Kern "Cases" catalogue, which maps to the `should-be-accessories.md` `Cases & Storage/Transport` category — https://astellnkern.co.uk/products/pd20-case
- **compatibleProductType** (marketing-fact): `["amplifier-source"]` — the source states the case "has been designed specifically for the PD20" and the PD20 is a digital audio player / amplifier-source — https://astellnkern.co.uk/products/pd20-case
- **compatibility** (marketing-fact): `null` — the `compatibility` field is domain-gated to `replacement-parts` and does not apply to a case; the source confirms a specific product fit (PD20) rather than a generic replacement-part compatibility match — https://astellnkern.co.uk/products/pd20-case

### Domain-gated accessory fields (all `null`)

Because the product is a case in the `cases-storage-transport` accessory category, the `filterAttributes` schema's `domain` gating means the following fields have no applicable value and are recorded as `null`:

`cableFunction`, `connectorTermination`, `lengthM`, `conductorMaterial`, `balancedUnbalanced`, `furnitureType`, `material`, `adjustableHeight`, `weightCapacityKg`, `powerProductType`, `outletCount`, `powerConnectorType`, `cleaningProductType`, `formatCompatibility`, `adapterFunction`, `treatmentType`, `mounting`.

Source for the product-type determination: https://astellnkern.co.uk/products/pd20-case

## Conflict / Caution Notes

- The manufacturer UK product page lists a sale price of £149.00, while the issue's Sanity-sourced price is $165.00 USD. No currency conversion is applied; the conflict is recorded for the later patch phase.
- The product page contains an internal contradiction: the page title, heading, and feature bullets describe the **PD20 Case** with ALRAN goatskin leather in Grey / Marine, while the bottom specifications table lists **Model: PD10 Leather Case** and **Colours: Black / Burgundy**. This is a copy/paste error from the PD10 case page. The PD20-specific title and feature bullets are treated as the reliable source for this product; the contradictory spec table is recorded as a conflict.
