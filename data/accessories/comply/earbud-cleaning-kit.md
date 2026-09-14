---
product_id: "GPjMdcfFWZVrKyR2PB4Lju"
product_slug: "earbud-cleaning-kit"
brand: "Comply"
name: "Earbud Cleaning Kit"
slice: "accessories"
price:
  currency: "usd"
  unit_amount: 699
spec_fields:
  customerRating: null
  awards: []
  condition: null
  dealsDiscount: "sale"
  newArrival: null
  accessoryType: "cleaning-maintenance"
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
  - "https://www.complyfoam.com/products/earbud-cleaning-kit"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **accessoryType** (marketing-fact): the product page is titled "Earbud Cleaning Kit", the top navigation lists it under "Cleaning Kits", and the body describes a "multi-purpose cleaning kit" for ear tips, earbuds, and charging cases — mapped to `cleaning-maintenance` — https://www.complyfoam.com/products/earbud-cleaning-kit
- **compatibleProductType** (marketing-fact): the kit is "Ideal for maintaining both Comply Foam tips and stock silicone ear tips" — i.e., for headphone/earbud accessories — `headphone` — https://www.complyfoam.com/products/earbud-cleaning-kit
- **cleaningProductType** (marketing-fact): `null` — the product is an earbud/ear-tip cleaning kit, not any of the `cleaning-maintenance` enum values (record-cleaning-fluid, record-cleaning-machine, stylus-brush-cleaner, carbon-fiber-brush, anti-static-gun, demagnetizer, screen-lens-cloth); none match the product's purpose — https://www.complyfoam.com/products/earbud-cleaning-kit
- **dealsDiscount** (store-operational): `sale` — the product page shows a strikethrough list price of $9.99 and a current price of $6.99 with "Save 30%" — https://www.complyfoam.com/products/earbud-cleaning-kit
- **customerRating** (marketing-fact): `null` — the page displays "30 reviews" but no aggregate star rating
- **condition** (store-operational): `null` — the manufacturer page does not state a condition/stock type
- **newArrival** (store-operational): `null` — no new-arrival flag or launch date is stated
- **awards** (marketing-fact): `[]` — no named award or editor's-choice badge is listed
- **formatCompatibility** (marketing-fact): `null` — the product is for earbuds/ear tips, not for vinyl, CD, stylus/cartridge, or optical-lens formats
- All other `spec_fields` are `null` because their `filterAttributes` domains are gated to other `accessoryType` values.
