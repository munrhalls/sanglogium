---
product_id: "PHPYj28HJdPDHAaIB8e38u"
product_slug: "comply-t100-foam-ear-tips"
brand: "Comply"
name: "100 Core Series - Memory Foam Ear Tips"
slice: "accessories"
price:
  currency: "usd"
  unit_amount: 1999
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
  compatibility: null
  adapterFunction: null
  treatmentType: null
  mounting: null
source_urls:
  - "https://www.complyfoam.com/products/comply-100-series-foam-ear-tips"
  - "https://www.complyfoam.com/collections/3dme"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **accessoryType** (marketing-fact): the product is a memory-foam replacement ear tip family — mapped to `replacement-parts` — https://www.complyfoam.com/products/comply-100-series-foam-ear-tips
- **partType** (marketing-fact): product title and description refer to "Memory Foam Ear Tips" and list shapes "Original (TZ-100), Round (TRZ-100), and Oval (TOZ-100)" — mapped to `ear-tips` — https://www.complyfoam.com/products/comply-100-series-foam-ear-tips
- **compatibleProductType** (marketing-fact): the page says the tips are for "wired earphones and IEMs" — `headphone` — https://www.complyfoam.com/products/comply-100-series-foam-ear-tips
- **compatibility** (marketing-fact): `null` — the 100 Core Series product page lists a generic compatibility set ("Compatible With - QuietOn 3.1, Etymotic Research ER2XR/ER4SR/hf5, ISOtunes Pro IT-01/Free, Westone, Klipsch, Jays and more") and does not mention 3DME; the 3DME collection page lists 100 Core Series among its products, but does not state an exact 3DME model fit. Because the product-page compatibility statement is the more specific manufacturer source and does not confirm 3DME, the exact-fit `compatibility` field is recorded as `null`.
- **customerRating** (marketing-fact): `null` — the 100 Core Series page displays "13 reviews" but no aggregate star rating
- **condition** (store-operational): `null` — the manufacturer page does not state a condition/stock type
- **dealsDiscount** (store-operational): `null` — the product is listed at $19.99 (some no-TechDefender variants at $17.99) with no sale, clearance, or discount badge
- **newArrival** (store-operational): `null` — no new-arrival flag or launch date is stated
- **awards** (marketing-fact): `[]` — no named award or editor's-choice badge is listed
- All non-replacement-parts `spec_fields` are `null` because their `filterAttributes` domains are gated to other `accessoryType` values.

## Conflict / Caution Notes

- The Sanity store record titles this product "Comply T100 Foam Ear Tips" and describes it as "Comply(TM) T100 replacement ear tips for 3DME universal-fit IEM earphones." The manufacturer "100 Core Series" page is the closest product-page match (T100 corresponds to TZ-100 / TRZ-100 / TOZ-100) and does not list 3DME. The 3DME collection page does list 100 Core Series, but does not confirm an exact 3DME model fit. The conflict is recorded here rather than resolved silently; `compatibility` is `null` pending a later CMS/manufacturer reconciliation pass.
