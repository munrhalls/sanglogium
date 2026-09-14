---
product_id: "GPjMdcfFWZVrKyR2PB5L30"
product_slug: "salad-halo-headphone-stand"
brand: "Salad"
name: "Salad Halo Headphone Stand"
slice: "accessories"
price:
  currency: "usd"
  unit_amount: 8000
spec_fields:
  brand: "Salad"
  price:
    currency: "usd"
    unit_amount: 8000
  rating: null
  ratingCount: null
  awards: []
  condition: "new"
  inStockOnly: true
  availability: "in-stock"
  deals: []
  discountPercent: null
  isNewArrival: null
  accessoryCategory: "stands-isolation"
  compatibleProductType: "headphone"
  cableFunction: null
  terminationType: null
  lengthM: null
  conductorMaterial: null
  balanced: null
  furnitureType: null
  material: "wood"
  adjustableHeight: false
  weightCapacityKg: null
  powerProductType: null
  outletCount: null
  connectorType: null
  cleaningProductType: null
  formatCompatibility: null
  partType: null
  compatibleModel: null
  adapterFunction: null
  treatmentType: null
  mounting: null
source_urls:
  - "https://www.salad.design/audio/halo"
  - "https://apos.audio/products/salad-halo-headphone-stand"
  - "https://www.salad.design/"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Sourcing context

Sourced against `docs/filters-sort/should-be-accessories.md` and the shared `docs/filters-sort/sourcing-protocol.md`. No category-specific `sourcing-protocol-accessories.md` or `schema-accessories.md` existed at source time; the field vocabulary below follows the conventions in `app/(test)/poc/filter-sort/accessories/lib/types.ts` and the should-be list items. A later schema reconciliation pass is required before any CMS write.

## Field audit

| # | Should-be item | Field | Tier | Value | Source | Status |
|---|---|---|---|---|---|---|
| 1 | Brand | `brand` | I | `Salad` | Sanity store record (`brand->name`) | — |
| 2 | Price | `price` | I | `$80.00` (8000 USD cents) | Sanity store record (`price_data`) | — |
| 3 | Customer Rating | `rating` / `ratingCount` | I | `null` / `null` | — | NULL — no customer rating displayed on manufacturer or Apos page |
| 4 | Awards / Recognition | `awards` | M | `[]` | — | NULL — no award/editor's-choice language found on manufacturer or Apos page |
| 5 | Condition / Stock Type | `condition` | I | `new` | Sanity store record | — |
| 6 | Availability / In Stock | `inStockOnly` | I | `true` | Sanity store record (`stock: 75`, `reservedStock: 0`) | — |
| 7 | Deals / Discount | `deals` / `discountPercent` | I | `[]` / `null` | Apos listing | — — no sale/clearance tag at source; quantity-tier discounts exist but are not product-level deal/clearance facets |
| 8 | New Arrivals | `isNewArrival` | I | `null` | — | NULL — derived from `_createdAt` once the new-arrival threshold is defined; not invented |
| 9 | Accessory Category | `accessoryCategory` | M | `stands-isolation` | Manufacturer page (`Halo Headphone Stand` under Salad Hi-Fi) + VFS path `/accessories/headphone-stands` | — |
| 10 | Compatible Product Type | `compatibleProductType` | M | `headphone` | Manufacturer page: "Give your headphones the heavenly treatment" / "designed for ear pads" | — |
| 11 | Cable Function | `cableFunction` | M | `null` | — | NULL — domain-gated to Cables & Interconnects; this product is a headphone stand |
| 12 | Termination / Connector Type | `terminationType` | M | `null` | — | NULL — domain-gated to Cables & Interconnects |
| 13 | Length | `lengthM` | H | `null` | — | NULL — domain-gated to Cables & Interconnects |
| 14 | Conductor Material | `conductorMaterial` | M | `null` | — | NULL — domain-gated to Cables & Interconnects |
| 15 | Balanced / Unbalanced | `balanced` | M | `null` | — | NULL — domain-gated to Cables & Interconnects |
| 16 | Furniture Type | `furnitureType` | M | `null` | — | NULL — "Headphone Stand" is not in the current `should-be-accessories.md` Furniture Type vocabulary (Speaker Stand, Equipment Rack/Shelf, Isolation Platform/Feet/Pucks, Turntable Wall Shelf, Wall Mount); recorded as null per the "never invent" rule |
| 17 | Material | `material` | M | `wood` | Manufacturer page: "100% African Sapele mahogany wood circle stand & base" / "A single piece of sapele wood... anchored by a solid Alder base" | — — see conflict note below |
| 18 | Adjustable Height | `adjustableHeight` | M | `false` | Manufacturer page | — — no height-adjustment mechanism described; fixed circle-and-base design |
| 19 | Weight / Load Capacity | `weightCapacityKg` | H | `null` | Manufacturer page | NULL — the page states the product's own weight (2.15 lbs / 35 oz / ~0.975 kg) and dimensions, but no load/weight capacity for headphones placed on the stand |
| 20 | Power Product Type | `powerProductType` | M | `null` | — | NULL — domain-gated to Power |
| 21 | Outlet Count | `outletCount` | H | `null` | — | NULL — domain-gated to Power |
| 22 | Connector / Plug Type | `connectorType` | M | `null` | — | NULL — domain-gated to Power |
| 23 | Product Type | `cleaningProductType` | M | `null` | — | NULL — domain-gated to Cleaning & Maintenance |
| 24 | Format Compatibility | `formatCompatibility` | M | `null` | — | NULL — domain-gated to Cleaning & Maintenance |
| 25 | Part Type | `partType` | M | `null` | — | NULL — domain-gated to Replacement Parts |
| 26 | Compatible Model / Brand | `compatibleModel` | M | `null` | — | NULL — domain-gated to Replacement Parts |
| 27 | Adapter Function | `adapterFunction` | M | `null` | — | NULL — domain-gated to Adapters & Converters |
| 28 | Treatment Type | `treatmentType` | M | `null` | — | NULL — domain-gated to Room Acoustic Treatment |
| 29 | Mounting | `mounting` | M | `null` | — | NULL — domain-gated to Room Acoustic Treatment |

## Source citations

- `brand` / `price` / `condition` / `inStockOnly` / `availability`: Sanity production dataset, product `_id` `GPjMdcfFWZVrKyR2PB5L30`, fetched 2026-09-14. `brand->name` = "Salad", `price_data.unit_amount` = 8000 (USD), `stock` = 75, `reservedStock` = 0.
- `accessoryCategory` / `compatibleProductType` (marketing-fact): Salad Design product page — https://www.salad.design/audio/halo — "Halo Headphone Stand" under Salad Hi-Fi products, with prose "Give your headphones the heavenly treatment they deserve with the Salad Halo Headphone Stand" and "designed for ear pads, not against them." Also corroborated by the VFS key `u9o83mfmx23cudko8phu5otx` resolving to `/accessories/headphone-stands`.
- `material` (marketing-fact): Salad Design product page — https://www.salad.design/audio/halo — Product Highlights list "100% African Sapele mahogany wood circle stand & base"; body prose states "A single piece of sapele wood, crafted in the naturally strong form of a circle, is anchored by a solid Alder base." Tier: marketing-fact.
- `material` (marketing-fact, corroborating / conflicting): Apos Audio product listing — https://apos.audio/products/salad-halo-headphone-stand — Product Highlights list "100% African Sapele mahogany wood circle stand & base" and description "A single piece of sapele mahogany wood, crafted in the naturally strong form of a circle, is anchored by a solid sapele mahogany base." Tier: marketing-fact (audited retailer).
- `adjustableHeight` (marketing-fact): Salad Design product page — https://www.salad.design/audio/halo — no height adjustment, extension, or telescoping mechanism is described; the design is a fixed wooden circle on a base. Boolean feature-absence rule applied: a manufacturer would advertise an adjustable feature if present.
- `weightCapacityKg` (hard-spec): Salad Design product page — https://www.salad.design/audio/halo — gives product weight ("Weight: 2.15 lbs (35oz)") and dimensions ("11.25\" High x 9\" Wide x 5.75\" Deep") but no load capacity.
- `awards` (marketing-fact): Checked manufacturer page and Apos listing; no award, editor's-choice, or recognition badge/text found.

## Conflict note

The Salad manufacturer product page (`https://www.salad.design/audio/halo`) contains an internal contradiction in the wood used for the base: the descriptive paragraph states "a solid Alder base," while the "Product Highlights" bullet states "100% African Sapele mahogany wood circle stand & base." The Apos retailer listing agrees with the highlights and states "sapele mahogany base." For the filterable `material` facet, both descriptions still resolve to `wood`, so the filter value is stable. The specific secondary wood type for the base cannot be determined from the available same-tier manufacturer sources and is therefore not recorded as a separate, more granular value, in keeping with the "never invent" rule.
