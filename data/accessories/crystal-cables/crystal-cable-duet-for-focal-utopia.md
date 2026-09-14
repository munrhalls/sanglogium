---
product_id: "Pn6oyV4Ks5AcNbecjh3ghZ"
product_slug: "crystal-cable-duet-for-focal-utopia"
brand: "Crystal Cables"
name: "Crystal Cable DUET for Focal Utopia"
slice: "accessories"
spec_fields:
  accessoryType: "cables-interconnects"
  compatibleProductType:
    - "headphone"
  cableFunction: null
  connectorTermination: null
  lengthM: 1.2
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
  awards:
    - "Editor's Choice Award, HiFi+ (2020)"
    - "Guo Hancheng, U-Audio (2018)"
    - "Red Hot Magazine (2018)"
    - "Max Delissen, Art's Excellence (2018) (Dutch)"
source_urls:
  - "https://crystalcable.com/duet-series/"
  - "https://headphones.com/products/crystal-cable-duet-for-focal-utopia"
  - "https://anquan-av.gr/cables/portable-duet-iem-configuration-crc-00104"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **accessoryType** (marketing-fact): the manufacturer product page groups the item under the "Portable Duet Series" and describes it as a "portable high-end cable" — the accessories taxonomy maps standalone cables to `cables-interconnects` — https://crystalcable.com/duet-series/
- **compatibleProductType** (marketing-fact): the manufacturer lists "Connectors Out: ... Lemo for Focal Utopia; HD800; Mini-XLR 4-pole (for Audeze)" and describes the product as supporting "all kind of headphone and IEM termination" — these are all headphone/IEM products, so the value is `headphone` — https://crystalcable.com/duet-series/
- **cableFunction** (marketing-fact): `null` — the manufacturer describes the product as a "headphone cable" / "portable cable"; none of the closed `cableFunction` values (`interconnect-rca-xlr`, `speaker-cable`, `digital-usb-coaxial-optical-aes-ebu-ethernet`, `power-mains`, `phono`) is stated by the source — https://crystalcable.com/duet-series/
- **connectorTermination** (marketing-fact): `null` — the headphone-side connector is a LEMO connector for Focal Utopia, which is not in the closed `connectorTermination` vocabulary (`rca`, `xlr`, `banana-plug`, `spade`, `bnc`, `3.5mm`, `2.5mm`, `4.4mm`, `mini-to-rca`), and the source-side connector is configurable and not specified for this pre-configured variant — https://crystalcable.com/duet-series/
- **lengthM** (hard-spec): `1.2` — the manufacturer page does not state cable length; an authorized-distributor/retailer listing for the same Portable Duet series (IEM configuration) states "Cable Length: 1,2 Meters" and "Length: 1200 mm" — https://anquan-av.gr/cables/portable-duet-iem-configuration-crc-00104
- **conductorMaterial** (hard-spec): `null` — the manufacturer states "proprietary silver-gold conductors" and "Silver-gold conductors"; this does not match any of the closed `conductorMaterial` options (`copper-ofc`, `silver`, `silver-plated-copper`) — https://crystalcable.com/duet-series/
- **balancedUnbalanced** (marketing-fact): `null` — the source-side connector is configurable (manufacturer lists 2.5mm, 3.5mm, 4.4mm, 6.35mm, 4-pole XLR, 2 x 3-pole XLR) and is not specified for this pre-configured variant — https://crystalcable.com/duet-series/
- **awards** (marketing-fact): the manufacturer Duet Series page lists "Editor's Choice Award, HiFi+ (2020)", "Guo Hancheng, U-Audio (2018)", "Red Hot Magazine (2018)", and "Max Delissen, Art's Excellence (2018) (Dutch)" in the Reviews & Awards section — https://crystalcable.com/duet-series/
- All other domain-gated fields (`furnitureType`, `material`, `adjustableHeight`, `weightCapacityKg`, `powerProductType`, `outletCount`, `powerConnectorType`, `cleaningProductType`, `formatCompatibility`, `partType`, `compatibility`, `adapterFunction`, `treatmentType`, `mounting`) are `null` because this product is a cable in the `cables-interconnects` domain, not in any other accessory domain — https://crystalcable.com/duet-series/

## Conflict / Caution Notes

- `lengthM` is sourced from a retailer listing for the "Portable Duet - IEM configuration" variant (same Portable Duet series). The Focal Utopia variant is expected to share the same standard cable length, but the manufacturer product page is silent on length.
- `connectorTermination` and `balancedUnbalanced` remain `null` because the specific source-side connector for the pre-configured "DUET for Focal Utopia" product is not stated by the manufacturer or the major retailer listing, and the LEMO headphone-side connector is outside the closed vocabulary.
- `conductorMaterial` remains `null` because the manufacturer's "silver-gold" conductor description does not map to the current closed vocabulary.
