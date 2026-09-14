---
product_id: "MrEMtYwMtrFDGWmRnQqu20"
product_slug: "astell-kern-kann-cube-leather-case"
brand: "Astell&Kern"
name: "Astell&Kern KANN CUBE | Leather Case"
slice: "accessories"
spec_fields:
  customerRating: 4.5
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
  - "https://www.moon-audio.com/products/astell-kern-kann-cube-case"
  - "https://docs/filters-sort/should-be-accessories.md"
  - "https://docs/filters-sort/accessories-filterattributes-migration.md"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **customerRating** (marketing-fact): `4.5` — the Moon Audio listing displays "Rated 4.5 out of 5 stars" based on 2 reviews — https://www.moon-audio.com/products/astell-kern-kann-cube-case
- **awards** (marketing-fact): `null` — no named product-level award, editor's-choice badge, or recognition program is listed on the source — https://www.moon-audio.com/products/astell-kern-kann-cube-case
- **condition** (internal): `null` — no condition (new / open-box / refurbished) is stated by the source; this is a store-operational field — https://www.moon-audio.com/products/astell-kern-kann-cube-case
- **dealsDiscount** (internal): `null` — the source lists the price at $179.00, which conflicts with the issue's Sanity-sourced price of $79.00 and with another major retailer listing at $79.00; the stable facet value format is not defined, so `dealsDiscount` is left `null` for the later patch phase — https://www.moon-audio.com/products/astell-kern-kann-cube-case
- **newArrival** (internal): `null` — no new-arrival flag or announcement is listed on the source — https://www.moon-audio.com/products/astell-kern-kann-cube-case
- **accessoryType** (marketing-fact): `cases-storage-transport` — the source categorizes the product as a protective leather case, which maps to the `should-be-accessories.md` `Cases & Storage/Transport` category — https://www.moon-audio.com/products/astell-kern-kann-cube-case
- **compatibleProductType** (marketing-fact): `["amplifier-source"]` — the source describes the case as "Custom-designed protective leather case for the Astell&Kern KANN CUBE" and states "KANN CUBE is the most powerful digital music player in the Astell&Kern lineup"; a digital audio player is an amplifier/source — https://www.moon-audio.com/products/astell-kern-kann-cube-case
- **compatibility** (marketing-fact): `null` — the `compatibility` field is domain-gated to `replacement-parts` and does not apply to a case; the source confirms a specific product fit (KANN CUBE) rather than a generic replacement-part compatibility match — https://www.moon-audio.com/products/astell-kern-kann-cube-case

### Domain-gated accessory fields (all `null`)

Because the product is a case in the `cases-storage-transport` accessory category, the `filterAttributes` schema's `domain` gating means the following fields have no applicable value and are recorded as `null`:

`cableFunction`, `connectorTermination`, `lengthM`, `conductorMaterial`, `balancedUnbalanced`, `furnitureType`, `material`, `adjustableHeight`, `weightCapacityKg`, `powerProductType`, `outletCount`, `powerConnectorType`, `cleaningProductType`, `formatCompatibility`, `adapterFunction`, `treatmentType`, `mounting`.

Source for the product-type determination: https://www.moon-audio.com/products/astell-kern-kann-cube-case

## Conflict / Caution Notes

- A manufacturer product page for the KANN CUBE case was not located on `astellnkern.com` or `astellnkern.co.uk` after searching; this record uses Moon Audio, an authorized Astell&Kern retailer, as the highest-tier available source.
- The Moon Audio listing prices the KANN CUBE case at $179.00 USD, while the issue's Sanity-sourced price is $79.00 USD and Bloom Audio lists it at $79.00 USD. This is a same-currency price conflict between two audited retailers; the conflict is recorded for the later patch phase.
- The source's "Tech Specs" table merges the two leather tanneries into one row as "Minerva leather from Badalassi Carlo (Italy)Dakota leather from La Perla Azzurra (Italy)" with no separator; no value is invented and the original formatting is preserved in the note.
