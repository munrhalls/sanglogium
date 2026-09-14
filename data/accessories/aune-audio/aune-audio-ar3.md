---
product_id: "3O1ZNp54LWQGln4uEAUIek"
product_slug: "aune-audio-ar3"
brand: "Aune Audio"
name: "Aune Audio AR3"
slice: "accessories"
spec_fields:
  customerRating: null
  condition: null
  dealsDiscount: null
  newArrival: null
  accessoryType: "cables-interconnects"
  compatibleProductType:
    - "headphone"
  cableFunction: null
  connectorTermination:
    - "4.4mm"
    - "3.5mm"
  lengthM: 1.5
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
  awards: []
source_urls:
  - "https://www.aune-store.com/en/aune-ar3-balanced-headphone-cable_110519_1241/"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **customerRating** (marketing-fact): `null` — store-computed aggregate; not stated on the manufacturer/retailer product page.
- **condition** (marketing-fact): `null` — the source page offers the item as a single unit with shipping stock, but does not explicitly label the condition as "new", "open-box", or "refurbished".
- **dealsDiscount** (marketing-fact): `null` — store-operational flag; the source page shows a sale price (EUR 49.90, crossed-out RRP EUR 58.90) but does not apply a fixed `sale`/`clearance` facet value.
- **newArrival** (marketing-fact): `null` — store-operational flag; no launch-date or "new arrival" badge is stated.
- **accessoryType** (marketing-fact): `cables-interconnects` — the source page lists the product under "Accessories" and the product title is "Aune AR3 Balanced Headphone Cable"; `categoryPath` in Sanity is `/accessories/audio-cables`.
- **compatibleProductType** (marketing-fact): `["headphone"]` — the title states "Balanced Headphone Cable" and the description states it is "for your headphones" and an "upgrade cable" for the Aune AR5000.
- **cableFunction** (hard-spec): `null` — the source describes the product as a "Balanced Headphone Cable" with 4.4mm and 3.5mm terminations; this does not match any value in the current `cableFunction` vocabulary (`interconnect-rca-xlr`, `speaker-cable`, `digital-usb-coaxial-optical-aes-ebu-ethernet`, `power-mains`, `phono`).
- **connectorTermination** (hard-spec): `["4.4mm", "3.5mm"]` — source bullets state "4.4mm Pentaconn to 3.5mm Klincke" and "Gold plated connectors".
- **lengthM** (hard-spec): `1.5` — source bullet states "1.5m Cable length".
- **conductorMaterial** (hard-spec): `null` — the source states "High purity 6N OCC copper", which is not one of the current `conductorMaterial` vocabulary values (`copper-ofc`, `silver`, `silver-plated-copper`); the source uses "OCC" not "OFC".
- **balancedUnbalanced** (hard-spec): `balanced` — source title and bullets repeatedly state "Balanced Headphone Cable" and the source-side connector is a 4.4mm Pentaconn balanced plug.
- **furnitureType**, **material**, **adjustableHeight**, **weightCapacityKg**, **powerProductType**, **outletCount**, **powerConnectorType**, **cleaningProductType**, **formatCompatibility**, **partType**, **compatibility**, **adapterFunction**, **treatmentType**, **mounting**: `null` — these fields are gated to accessory domains other than `cables-interconnects`; this product is a headphone cable and has none of those attributes.
- **awards** (marketing-fact): `[]` — no named award, editor's choice, or recognition badge is mentioned on the source page.

## Conflict / Caution Notes

- The official Aune manufacturer site (`auneaudio.com`) renders the AR3 product page as a JavaScript SPA and was not text-extractable; the manufacturer e-commerce mall (`mall.auneaudio.com`) returned 403. The next-best source is the official Aune Store page at `aune-store.com`, which carries the manufacturer product description, specifications, and item number (110519).
- Two fields with non-trivial vocabulary gaps are recorded as explicit `null` rather than mapped to a loosely similar value: `cableFunction` (manufacturer calls it a "Balanced Headphone Cable", which is not in the current `cableFunction` enum) and `conductorMaterial` (manufacturer calls it "6N OCC copper", which is not in the current `conductorMaterial` enum). The actual source phrases are preserved in the verification notes.
