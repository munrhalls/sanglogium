---
product_id: "E5AJbuTajbv7O6i4rY3WSR"
product_slug: "heddphone-balanced-4-pin-xlr-cable"
brand: "HEDD Audio"
name: "HEDDphone Balanced 4-Pin XLR Cable"
slice: "accessories"
spec_fields:
  customerRating: null
  condition: "new"
  dealsDiscount: null
  newArrival: null
  awards: []
  accessoryType: "cables-interconnects"
  compatibleProductType:
    - "headphone"
  cableFunction: null
  connectorTermination:
    - "xlr"
  lengthM: 2.2
  conductorMaterial: null
  balancedUnbalanced: "balanced"
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
  - "https://hedd.audio/products/heddphone-cable"
  - "https://headphones.com/products/heddphone-balanced-4-pin-xlr-cable"
  - "https://www.thomannmusic.com/hedd_hpc_2.htm"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **condition** (marketing-fact): `new` — product is listed as a standard retail item on HEDD's Accessories store and on Headphones.com; no open-box, refurbished, or used condition language found — https://hedd.audio/products/heddphone-cable
- **customerRating** (marketing-fact): `null` — no customer rating or review count displayed on the manufacturer product page or the Headphones.com listing at source time — https://hedd.audio/products/heddphone-cable
- **dealsDiscount** (marketing-fact): `null` — no store-level sale, clearance, or deal tag found on the manufacturer product page; `dealsDiscount` is store-operational and not individually sourced here — https://hedd.audio/products/heddphone-cable
- **newArrival** (marketing-fact): `null` — no "new arrival" badge, launch announcement, or dated new-product language found — https://hedd.audio/products/heddphone-cable
- **awards** (marketing-fact): `[]` — no named award, editor's-choice badge, or recognition program listed on the manufacturer or major retailer pages — https://hedd.audio/products/heddphone-cable
- **accessoryType** (marketing-fact): `cables-interconnects` — HEDD lists the product under Accessories with product_type "Cables" and describes it as "The official HEDDphone cable" with five termination variants — https://hedd.audio/products/heddphone-cable
- **compatibleProductType** (marketing-fact): `["headphone"]` — product name "HEDDphone Balanced 4-Pin XLR Cable" and Headphones.com description "perfect for anyone looking to run their HEDDphones balanced from their favourite headphone amplifier" both point to headphone use — https://hedd.audio/products/heddphone-cable and https://headphones.com/products/heddphone-balanced-4-pin-xlr-cable
- **cableFunction** (marketing-fact): `null` — the source describes a headphone cable; none of the closed `cableFunction` options (`interconnect-rca-xlr`, `speaker-cable`, `digital-usb-coaxial-optical-aes-ebu-ethernet`, `power-mains`, `phono`) is explicitly stated or appropriate for this SKU — https://hedd.audio/products/heddphone-cable
- **connectorTermination** (hard-spec): `["xlr"]` — the HEDD variant title is "HPC2 - 4-pin XLR (balanced) / 2.2m length" and Thomann states "4-Pin XLR (male, balanced) to 2x mini XLR (female)"; the source-side 4-pin XLR maps to the `xlr` enum value. The headphone-side mini XLR is not in the current `connectorTermination` closed vocabulary, so it is not recorded — https://hedd.audio/products/heddphone-cable and https://www.thomannmusic.com/hedd_hpc_2.htm
- **lengthM** (hard-spec): `2.2` — HEDD variant title "HPC2 - 4-pin XLR (balanced) / 2.2m length" and Headphones.com "The 4-Pin Balanced XLR cable comes in at 2.2m in length" both confirm 2.2 m — https://hedd.audio/products/heddphone-cable and https://headphones.com/products/heddphone-balanced-4-pin-xlr-cable
- **conductorMaterial** (hard-spec): `null` — no conductor material (copper/OFC, silver, or silver-plated-copper) is stated on the HEDD product page or on the audited retailer pages checked (Thomann mentions only Rean connectors and low resistance; Audiosaurus mentions "Premium Rean connections" and "extremely low resistance") — https://hedd.audio/products/heddphone-cable and https://www.thomannmusic.com/hedd_hpc_2.htm
- **balancedUnbalanced** (hard-spec): `balanced` — HEDD variant title "4-pin XLR (balanced)" and Headphones.com "4-Pin Balanced XLR cable" explicitly state balanced — https://hedd.audio/products/heddphone-cable and https://headphones.com/products/heddphone-balanced-4-pin-xlr-cable

### Domain-gated accessory fields

Because the product is a headphone cable in the `cables-interconnects` accessory category, the schema's domain gating means the following fields have no applicable value and are recorded as `null`:

`furnitureType`, `material`, `adjustableHeight`, `weightCapacityKg`, `powerProductType`, `outletCount`, `powerConnectorType`, `cleaningProductType`, `formatCompatibility`, `partType`, `compatibility`, `adapterFunction`, `treatmentType`, `mounting`.

## Conflict / Caution Notes

- The HEDD manufacturer page (`https://hedd.audio/products/heddphone-cable`) renders a single product for five cable variants (HPC1–HPC5). The HPC2-specific values for `connectorTermination` and `lengthM` are taken from the Shopify variant title and the product JSON, not from a prose description block.
- The headphone-side connector is described by Thomann and Audiosaurus as two mini-XLR (3-pin) females, but `mini-xlr` is not in the closed `connectorTermination` vocabulary, so only the source-side `xlr` value is recorded.
- The `conductorMaterial` field is left `null` despite marketing language about "low resistance" because none of the allowed values (`copper-ofc`, `silver`, `silver-plated-copper`) is explicitly stated by the manufacturer or an audited retailer.
