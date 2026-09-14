---
product_id: "PHPYj28HJdPDHAaIBCQJvQ"
product_slug: "austrian-audio-the-composer-travel-case-hard-case"
brand: "Austrian Audio"
name: "Austrian Audio The Composer Travel Case | Hard Case"
slice: "accessories"
spec_fields:
  accessoryType: "cases-storage-transport"
  compatibleProductType:
    - "headphone"
  awards: []
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
  - "https://austrian.audio/product/tctc-travel-case/"
  - "https://austrian.audio/product/the-composer/"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **accessoryType** (marketing-fact): `cases-storage-transport` — manufacturer product page titles the item "TCTC Travel Case" and describes it as a "Travel Case with moulded inlay and cable compartment"; the Austrian Audio accessories category filters place it under Headphones → Cases, which maps to the should-be-accessories.md category "Cases & Storage/Transport" and the Sanity schema value `cases-storage-transport` — https://austrian.audio/product/tctc-travel-case/
- **compatibleProductType** (marketing-fact): `["headphone"]` — product page states "for The Composer" and lists a "Products Compatible With" section pointing to The Composer; The Composer product page identifies it as "Premium Open-Back Reference Headphones" — https://austrian.audio/product/tctc-travel-case/ and https://austrian.audio/product/the-composer/
- **awards** (marketing-fact): `[]` — no named award, editor's-choice badge, or recognition program is listed on the manufacturer product page or the accessories category listing — https://austrian.audio/product/tctc-travel-case/

### Domain-gated accessory fields (all `null`)

Because the product is a travel case for headphones in the `cases-storage-transport` accessory category, the schema's domain gating means the following fields have no applicable value and are recorded as `null`:

`cableFunction`, `connectorTermination`, `lengthM`, `conductorMaterial`, `balancedUnbalanced`, `furnitureType`, `material`, `adjustableHeight`, `weightCapacityKg`, `powerProductType`, `outletCount`, `powerConnectorType`, `cleaningProductType`, `formatCompatibility`, `partType`, `compatibility`, `adapterFunction`, `treatmentType`, `mounting`.

## Conflict / Caution Notes

- The product name in the Sanity catalogue is "Austrian Audio The Composer Travel Case | Hard Case"; the manufacturer's own product page shortens this to "TCTC Travel Case". The .md file uses the Sanity name as the canonical `name` and the manufacturer short name only in verification notes.
