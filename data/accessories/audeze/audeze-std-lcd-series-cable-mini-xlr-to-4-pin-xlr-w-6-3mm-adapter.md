---
product_id: "MrEMtYwMtrFDGWmRnGPkI2"
product_slug: "audeze-std-lcd-series-cable-mini-xlr-to-4-pin-xlr-w-6-3mm-adapter"
brand: "Audeze"
name: "Audeze Std LCD Series Cable | Mini-XLR to 4-pin XLR w/ 6.3mm Adapter"
slice: "accessories"
spec_fields:
  customerRating: 5.0
  awards: []
  condition: null
  dealsDiscount: null
  newArrival: null
  inStock: null
  accessoryType: "cables-interconnects"
  compatibleProductType:
    - "headphone"
  cableFunction: null
  connectorTermination:
    - "xlr"
    - "6.35mm"
    - "4-pin-mini-xlr"
  lengthM: 1.9
  conductorMaterial:
    - "copper-ofc"
  balancedUnbalanced:
    - "balanced"
    - "unbalanced"
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
  - "https://www.audeze.com/products/lcd-combo-cable"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **customerRating** (marketing-fact): `5.0` — product page shows "Overall rating: 5.0 / 5 from 6 reviews." — https://www.audeze.com/products/lcd-combo-cable
- **awards** (marketing-fact): `[]` — no named awards, editor's choice, or recognition programs are listed on the product page — https://www.audeze.com/products/lcd-combo-cable
- **condition, dealsDiscount, newArrival, inStock** (store-operational): `null` — not explicitly stated on the manufacturer product page; these are internal store data and are not individually sourced in this pass — https://www.audeze.com/products/lcd-combo-cable
- **accessoryType** (marketing-fact): `cables-interconnects` — product page title and description identify this as an Audeze LCD-series cable / Cables & Interconnects accessory (SKU CBL1103-KT) — https://www.audeze.com/products/lcd-combo-cable
- **compatibleProductType** (marketing-fact): `["headphone"]` — product description states "Pro-quality latching 4-pin mini-XLR connectors to headphones" and the cable is for Audeze LCD-series headphones — https://www.audeze.com/products/lcd-combo-cable
- **cableFunction** (marketing-fact): `null` — source describes a headphone cable; the current `Cable Function` vocabulary does not contain a `headphone-cable` value — https://www.audeze.com/products/lcd-combo-cable
- **connectorTermination** (hard-spec): `["xlr", "6.35mm", "4-pin-mini-xlr"]` — product page states "Balanced cable: Pro-quality XLR connector on the amp side; Adapter has a 1/4\" gold-plated connector on the amp side; Pro-quality latching 4-pin mini-XLR connectors to headphones" — the 1/4\" is 6.35mm, the XLR is 4-pin, and the headphone side is 4-pin mini-XLR — https://www.audeze.com/products/lcd-combo-cable
- **lengthM** (hard-spec): `1.9` — product page states "Length: 6.2 ft (1.9 m)" — https://www.audeze.com/products/lcd-combo-cable
- **conductorMaterial** (hard-spec): `["copper-ofc"]` — product page states "High-purity OCC cast audio-grade OFHC copper core" — mapped to the `copper-ofc` value in the current `conductorMaterial` vocabulary — https://www.audeze.com/products/lcd-combo-cable
- **balancedUnbalanced** (hard-spec): `["balanced", "unbalanced"]` — product page lists a balanced 4-pin XLR amp-side connector plus a 1/4\" (6.35mm) single-ended adapter, so both balanced and unbalanced use are supported — https://www.audeze.com/products/lcd-combo-cable
- **compatibility** (marketing-fact): `null` — the `Compatible Model / Brand` filter is domain-gated to `replacement-parts` per `should-be-accessories.md`; the source states the cable "will not work with LCD-1" and is for other Audeze LCD-series headphones — https://www.audeze.com/products/lcd-combo-cable
- All remaining `spec_fields` are `null` because their `should-be-accessories.md` domain groups do not apply to a `cables-interconnects` headphone cable.

## Conflict / Caution Notes

- **Price / Sanity mismatch**: The live Sanity product list for this issue records the price as `$90.00`, while the Audeze manufacturer product page lists `$175.00`. `price` is store-operational and not included in `spec_fields` for this pass; the conflict is noted for the later CMS reconciliation phase.
- **Connector vocabulary gap**: The source lists `6.35mm` (1/4\") and `4-pin-mini-xlr` terminations, which are not in the current `should-be-accessories.md` / `TerminationType` vocabulary (`RCA, XLR, Banana Plug, Spade, BNC, 3.5mm, 2.5mm, 4.4mm, Mini-to-RCA`). They are recorded as source-cited literal values; the vocabulary may need an update.
