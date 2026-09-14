---
product_id: "GPjMdcfFWZVrKyR2PB494I"
product_slug: "find-tips-for-your-device"
brand: "Comply"
name: "Memory Foam Ear Tips for Apple AirPods Pro 3"
slice: "accessories"
price:
  currency: "usd"
  unit_amount: 2499
spec_fields:
  customerRating: null
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
  partType: "ear-tips"
  compatibility:
    - "apple-airpods-pro-gen-3"
  adapterFunction: null
  treatmentType: null
  mounting: null
source_urls:
  - "https://www.complyfoam.com/products/memory-foam-ear-tips-for-apple-airpods-pro-3"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **accessoryType** (marketing-fact): the product page is titled "Memory Foam Ear Tips for Apple AirPods Pro 3" and sells replacement foam ear tips — mapped to `replacement-parts` — https://www.complyfoam.com/products/memory-foam-ear-tips-for-apple-airpods-pro-3
- **partType** (marketing-fact): product title and description explicitly refer to "Memory Foam Ear Tips" — mapped to `ear-tips` — https://www.complyfoam.com/products/memory-foam-ear-tips-for-apple-airpods-pro-3
- **compatibleProductType** (marketing-fact): the product is for Apple AirPods Pro (Gen 3), a headphone/earbud form factor — `headphone` — https://www.complyfoam.com/products/memory-foam-ear-tips-for-apple-airpods-pro-3
- **compatibility** (marketing-fact): the product page states "Compatible with Apple AirPods Pro (Gen 3)" — `apple-airpods-pro-gen-3` — https://www.complyfoam.com/products/memory-foam-ear-tips-for-apple-airpods-pro-3
- **customerRating** (marketing-fact): `null` — the page displays "215 reviews" but no aggregate star rating; a review count is not a customer-rating value — https://www.complyfoam.com/products/memory-foam-ear-tips-for-apple-airpods-pro-3
- **condition** (store-operational): `null` — the manufacturer page does not state a condition/stock type
- **dealsDiscount** (store-operational): `null` — the product is listed at $24.99 with no sale, clearance, or discount badge on the product page
- **newArrival** (store-operational): `null` — no new-arrival flag or launch date is stated
- **awards** (marketing-fact): `[]` — no named award or editor's-choice badge is listed
- All non-replacement-parts `spec_fields` are `null` because their `filterAttributes` domains are gated to other `accessoryType` values.

## Conflict / Caution Notes

- The Sanity store record lists the product name as "Find Tips for your Device" with the slug `find-tips-for-your-device`, while the manufacturer product page is titled "Memory Foam Ear Tips for Apple AirPods Pro 3". The CMS description ("Comply memory foam replacement ear tips for Apple AirPods Pro 3") and the price of $24.99 align with the manufacturer page. This file uses the manufacturer-derived product name; the CMS name/slug mismatch is recorded here and left for the later CMS reconciliation pass.
