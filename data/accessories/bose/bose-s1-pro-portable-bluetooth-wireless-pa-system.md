---
product_id: "GqkAHteRmu9rQ6VLnW1fa9"
product_slug: "bose-s1-pro-portable-bluetooth-wireless-pa-system"
brand: "Bose"
name: "Bose S1 Pro+ Portable Bluetooth Wireless PA System"
slice: "accessories"
spec_fields:
  accessoryType: null
  compatibleProductType: null
  partType: null
  compatibility: null
  awards: null
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
  adapterFunction: null
  treatmentType: null
  mounting: null
source_urls:
  - "https://www.bose.com/p/portable-pa/s1-pro-wireless-pa-system/S1PROP-SPEAKERWIRELESS.html"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **accessoryType** (marketing-fact): `null` — the manufacturer page titles the product "Bose S1 Pro+ Portable Bluetooth Speaker System" and the site breadcrumb places it under "Portable PA"; it is described as "the ultimate all-in-one PA, floor monitor, practice amplifier, and primary music system," not as an accessory. Source: https://www.bose.com/p/portable-pa/s1-pro-wireless-pa-system/S1PROP-SPEAKERWIRELESS.html

- **awards** (marketing-fact): `null` — no named award, editor's-choice badge, or recognition program is listed on the manufacturer product page; because the product is a portable PA speaker rather than an accessory, this filterAttributes value is recorded as `null`. Source: https://www.bose.com/p/portable-pa/s1-pro-wireless-pa-system/S1PROP-SPEAKERWIRELESS.html

- **compatibleProductType**, **partType**, **compatibility**, **cableFunction**, **connectorTermination**, **lengthM**, **conductorMaterial**, **balancedUnbalanced**, **furnitureType**, **material**, **adjustableHeight**, **weightCapacityKg**, **powerProductType**, **outletCount**, **powerConnectorType**, **cleaningProductType**, **formatCompatibility**, **adapterFunction**, **treatmentType**, **mounting**: `null` — these fields are gated to the accessory domains in `should-be-accessories.md`; because `accessoryType` is `null` (the product is a portable PA speaker, not an accessory), none of these attributes apply. Source: https://www.bose.com/p/portable-pa/s1-pro-wireless-pa-system/S1PROP-SPEAKERWIRELESS.html

## Conflict / Caution Notes

- This product is currently catalogued in the `accessories` slice, but the manufacturer identifies it as a portable PA/speaker system. All accessory-specific `filterAttributes` are therefore correctly recorded as `null`. A later re-categorization pass (out of scope for this sourcing issue) may need to move it out of the `accessories` slice.
- The current Sanity `filterAttributes` for this product contain legacy `accessoryType: "cable"`, `connectorTermination: ["3.5mm", "6.35mm", "4.4mm-balanced"]`, and `compatibility: ["universal"]` values that describe accessory attributes and are not supported by the manufacturer source for this speaker; they have been replaced with `null` here.
