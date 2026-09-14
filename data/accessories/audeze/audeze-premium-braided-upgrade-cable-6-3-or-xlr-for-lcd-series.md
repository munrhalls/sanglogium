---
product_id: "Pn6oyV4Ks5AcNbecjbXRKV"
product_slug: "audeze-premium-braided-upgrade-cable-6-3-or-xlr-for-lcd-series"
brand: "Audeze"
name: "Audeze Premium Braided Upgrade Cable | 6.3 or XLR for LCD Series"
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
  lengthM: 2.5
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
  - "https://www.audeze.com/products/lcd-4-premium-braided-cable"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **customerRating** (marketing-fact): `5.0` — product page shows "Overall rating: 5.0 / 5 from 10 reviews." — https://www.audeze.com/products/lcd-4-premium-braided-cable
- **awards** (marketing-fact): `[]` — no named awards, editor's choice, or recognition programs are listed on the product page — https://www.audeze.com/products/lcd-4-premium-braided-cable
- **condition, dealsDiscount, newArrival, inStock** (store-operational): `null` — not explicitly stated on the manufacturer product page; these are internal store data and are not individually sourced in this pass — https://www.audeze.com/products/lcd-4-premium-braided-cable
- **accessoryType** (marketing-fact): `cables-interconnects` — product page title and description identify this as an Audeze LCD-series cable / Cables & Interconnects accessory (SKU CBL1099-KT) — https://www.audeze.com/products/lcd-4-premium-braided-cable
- **compatibleProductType** (marketing-fact): `["headphone"]` — product description states "2 x 4-pin mini XLR for headphone earcup connection" and the cable is for Audeze LCD-series headphones — https://www.audeze.com/products/lcd-4-premium-braided-cable
- **cableFunction** (marketing-fact): `null` — source describes a headphone cable; the current `Cable Function` vocabulary does not contain a `headphone-cable` value — https://www.audeze.com/products/lcd-4-premium-braided-cable
- **connectorTermination** (hard-spec): `["xlr", "6.35mm", "4-pin-mini-xlr"]` — product page states "4-pin balanced XLR plug with 1/4\" Single Ended adapter" and "2 x 4-pin mini XLR for headphone earcup connection" — the 1/4\" is 6.35mm, the XLR is 4-pin, and the headphone side is 4-pin mini-XLR — https://www.audeze.com/products/lcd-4-premium-braided-cable
- **lengthM** (hard-spec): `2.5` — product page states "Length: 2.5m; Weight: 110 g" — https://www.audeze.com/products/lcd-4-premium-braided-cable
- **conductorMaterial** (hard-spec): `["copper-ofc"]` — product page states "single-crystal OCC copper" — mapped to the `copper-ofc` value in the current `conductorMaterial` vocabulary — https://www.audeze.com/products/lcd-4-premium-braided-cable
- **balancedUnbalanced** (hard-spec): `["balanced", "unbalanced"]` — product page lists a 4-pin balanced XLR plug plus a 1/4\" (6.35mm) single-ended adapter, so both balanced and unbalanced use are supported — https://www.audeze.com/products/lcd-4-premium-braided-cable
- **compatibility** (marketing-fact): `null` — the `Compatible Model / Brand` filter is domain-gated to `replacement-parts` per `should-be-accessories.md`; the source indicates the cable is for Audeze LCD-series headphones — https://www.audeze.com/products/lcd-4-premium-braided-cable
- All remaining `spec_fields` are `null` because their `should-be-accessories.md` domain groups do not apply to a `cables-interconnects` headphone cable.

## Conflict / Caution Notes

- **Conductor material variants**: The fetched Audeze manufacturer page (CBL1099-KT) states "single-crystal OCC copper". Unopened retailer listings for other Audeze premium cable SKUs / color options (e.g., single-ended CBL-L5-1000, Bloom BLK/SLV) describe a silver-plated conductor, but no separate Audeze manufacturer page for a silver-plated XLR combo variant was found in this pass. Per the sourcing protocol, the opened manufacturer page is the higher-tier source, so `conductorMaterial` is recorded as `copper-ofc`.
- **Connector vocabulary gap**: The source lists `6.35mm` (1/4\") and `4-pin-mini-xlr` terminations, which are not in the current `should-be-accessories.md` / `TerminationType` vocabulary (`RCA, XLR, Banana Plug, Spade, BNC, 3.5mm, 2.5mm, 4.4mm, Mini-to-RCA`). They are recorded as source-cited literal values; the vocabulary may need an update.
