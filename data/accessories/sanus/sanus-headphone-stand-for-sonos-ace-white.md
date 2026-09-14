---
product_id: "fisKNZUL2oYuqkoQMTzLCp"
product_slug: "sanus-headphone-stand-for-sonos-ace-white"
brand: "Sanus"
name: "Sanus Headphone Stand for Sonos Ace (White)"
slice: "accessories"
spec_fields:
  customerRating: null
  awards: null
  condition: null
  dealsDiscount: null
  newArrival: null
  accessoryType: "stands-isolation"
  compatibleProductType:
    - "headphone"
  cableFunction: null
  connectorTermination: null
  lengthM: null
  conductorMaterial: null
  balancedUnbalanced: null
  furnitureType: null
  material: "metal"
  adjustableHeight: false
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
  - "https://www.sanus.com/en_us/products/speaker-stands/wshsh1/"
  - "https://www.sanus.com/assets/literature/pdf/WSHSH1-Headphone-Stand-Designed-for-Sonos-Ace-Headphones.pdf"
  - "https://ravepubs.com/sanus-launches-stylish-headphone-stand-for-sonos-ace/"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes
- **customerRating** (marketing-fact / internal): `null` — the manufacturer product page renders a Bazaarvoice reviews block that returns HTTP 404; no customer review aggregate is stated
- **awards** (marketing-fact): `null` — no named product-level award, editor’s choice, or recognition badge is listed; the page contains a brand-level “#1 best-selling TV mount brand in the U.S.” claim, not an award for this product
- **condition** (internal): `null` — condition (new / open-box / refurbished) is a store-operational field, not stated by the manufacturer
- **dealsDiscount** (internal): `null` — no sale, clearance, or discount indication is listed
- **newArrival** (internal): `null` — no new-arrival flag is listed; the product page explicitly states “This product has been discontinued”
- **accessoryType** (marketing-fact): mapped to `stands-isolation` — the product is named “SANUS Headphone Stand” and is shelved under “Products > Speaker Mounts and Stands > Designed For Sonos” — https://www.sanus.com/en_us/products/speaker-stands/wshsh1/
- **compatibleProductType** (marketing-fact): `headphone` — “Designed for the Sonos Ace Headphones” / “exclusively designed for the Sonos Ace headphones” — https://www.sanus.com/en_us/products/speaker-stands/wshsh1/
- **cableFunction**, **connectorTermination**, **lengthM**, **conductorMaterial**, **balancedUnbalanced**: `null` — these fields are gated to `cables-interconnects`; this is a stand, not a cable
- **furnitureType** (marketing-fact): `null` — the product is a headphone stand; the `stands-isolation`/`racks-furniture` `furnitureType` vocabulary (speaker-stand, equipment-rack-shelf, isolation-platform-feet-pucks, turntable-wall-shelf, wall-mount) does not contain a headphone-stand value, so no value is assigned
- **material** (marketing-fact): `metal` — product features state “Built from high quality powder-coated steel” and the press release describes the “premium powder-coated steel base” — https://www.sanus.com/en_us/products/speaker-stands/wshsh1/ / https://ravepubs.com/sanus-launches-stylish-headphone-stand-for-sonos-ace/
- **adjustableHeight** (marketing-fact): `false` — the product height is given as a fixed 10.44" / 26.52 cm and no adjustable-height mechanism is mentioned on the manufacturer page or in the PDF; absence of this marketable feature is read as `false`
- **weightCapacityKg** (hard-spec): `null` — no load-capacity or weight-limit figure is stated by the manufacturer; the PDF lists packaging weight (3.14 lbs / 1.42 kg) and product dimensions, but not load capacity
- **powerProductType**, **outletCount**, **powerConnectorType**: `null` — this is not a power product
- **cleaningProductType**, **formatCompatibility**: `null` — this is not a cleaning/maintenance product
- **partType**, **compatibility**: `null` — this is not a replacement-parts product
- **adapterFunction**: `null` — this is not an adapter/converter product
- **treatmentType**, **mounting**: `null` — this is not a room-acoustic-treatment product

## Conflict / Caution Notes
- The product page header lists “Speaker Stand Height 10"” while the page’s specification table and the PDF both list product height 10.44" / 26.52 cm. The exact 10.44" value from the spec table/PDF is recorded in the notes above for reference; no `filterAttributes` height/dimension field exists in the accessories schema, so the rounded marketing line is not written as a spec value.
- The manufacturer page lists two UPCs: 793795539861 for Black and 793795539878 for White. This file corresponds to the White variant (UPC 793795539878).
