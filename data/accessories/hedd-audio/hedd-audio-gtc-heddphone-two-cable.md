---
product_id: "Pn6oyV4Ks5AcNbecjh3egq"
product_slug: "hedd-audio-gtc-heddphone-two-cable"
brand: "HEDD Audio"
name: "HEDD Audio GTC HEDDphone TWO Cable"
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
    - "4.4mm"
  lengthM: 1.6
  conductorMaterial: "copper-ofc"
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
  - "https://hedd.audio/products/gtc-heddphone-two-cable"
  - "https://headphones.com/products/hedd-audio-gtc-heddphone-two-cable"
  - "https://bloomaudio.com/products/hedd-audio-heddphone-two-cable"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **condition** (marketing-fact): `new` — product is listed as a standard retail item on HEDD's Accessories store and on Headphones.com; no open-box, refurbished, or used condition language found — https://hedd.audio/products/gtc-heddphone-two-cable
- **customerRating** (marketing-fact): `null` — no customer rating or review count displayed on the manufacturer product page or the Headphones.com listing at source time — https://hedd.audio/products/gtc-heddphone-two-cable
- **dealsDiscount** (marketing-fact): `null` — no store-level sale, clearance, or deal tag found on the manufacturer product page; `dealsDiscount` is store-operational and not individually sourced here — https://hedd.audio/products/gtc-heddphone-two-cable
- **newArrival** (marketing-fact): `null` — no "new arrival" badge, launch announcement, or dated new-product language found — https://hedd.audio/products/gtc-heddphone-two-cable
- **awards** (marketing-fact): `[]` — no named award, editor's-choice badge, or recognition program listed on the manufacturer or major retailer pages — https://hedd.audio/products/gtc-heddphone-two-cable
- **accessoryType** (marketing-fact): `cables-interconnects` — HEDD lists the product under Accessories with product_type "Cables" and describes it as "The GTC premium upgrade cable" — https://hedd.audio/products/gtc-heddphone-two-cable
- **compatibleProductType** (marketing-fact): `["headphone"]` — HEDD product page states "Compatible with the HEDDphone® D1, HEDDphone® TWO and HEDDphone® TWO GT"; all three are headphones — https://hedd.audio/products/gtc-heddphone-two-cable
- **cableFunction** (marketing-fact): `null` — the source describes an upgrade headphone cable; none of the closed `cableFunction` options (`interconnect-rca-xlr`, `speaker-cable`, `digital-usb-coaxial-optical-aes-ebu-ethernet`, `power-mains`, `phono`) is explicitly stated or appropriate for this SKU — https://hedd.audio/products/gtc-heddphone-two-cable
- **connectorTermination** (hard-spec): `["4.4mm"]` — the HEDD product page states "1.6m balanced cable with 4.4mm termination" in the Features list. The headphone-side connector is not stated on the GTC product page, so only the confirmed source-side `4.4mm` is recorded — https://hedd.audio/products/gtc-heddphone-two-cable
- **lengthM** (hard-spec): `1.6` — HEDD product page states "1.6m balanced cable with 4.4mm termination" in the Features list. This is the "Normal" variant that matches the $600.00 price in the issue's product list; a "Long" variant is also sold, but HEDD does not state its length on the product page — https://hedd.audio/products/gtc-heddphone-two-cable
- **conductorMaterial** (hard-spec): `copper-ofc` — HEDD states "8-braid, 40-core Linear Crystal-Oxygen Free Copper" and Headphones.com states "8-core Linear Crystal-Oxygen Free Copper"; both identify the conductor as LC-OFC, which maps to the `copper-ofc` enum value — https://hedd.audio/products/gtc-heddphone-two-cable and https://headphones.com/products/hedd-audio-gtc-heddphone-two-cable
- **balancedUnbalanced** (hard-spec): `balanced` — HEDD states "1.6m balanced cable with 4.4mm termination" and Headphones.com describes it as a "balanced cable" — https://hedd.audio/products/gtc-heddphone-two-cable and https://headphones.com/products/hedd-audio-gtc-heddphone-two-cable

### Domain-gated accessory fields

Because the product is a headphone cable in the `cables-interconnects` accessory category, the schema's domain gating means the following fields have no applicable value and are recorded as `null`:

`furnitureType`, `material`, `adjustableHeight`, `weightCapacityKg`, `powerProductType`, `outletCount`, `powerConnectorType`, `cleaningProductType`, `formatCompatibility`, `partType`, `compatibility`, `adapterFunction`, `treatmentType`, `mounting`.

## Conflict / Caution Notes

- **Conductor detail conflict**: HEDD's manufacturer page describes the GTC as "8-braid, 40-core LC-OFC", while Headphones.com describes it as "8-core LC-OFC". Both agree the material is LC-OFC (mapped to `copper-ofc`), but they disagree on the braid/core count. The `conductorMaterial` field records only the material, and the core-count discrepancy is noted here, not used as a filter value.
- **Length variant**: The HEDD product page offers "Normal" and "Long" length options. The Features list gives the "Normal" length as 1.6 m. The "Long" length is not stated on the manufacturer page; third-party retailers Bloom Audio and iCan list 3.0 m and 3.2 m respectively, but those are not same-tier manufacturer sources and are not recorded as the `lengthM` value.
- **Unconfirmed headphone-side connector**: Headphones.com states the GTC is "*Compatible with most headphones with dual 3.5mm connections," and the sibling HEDDphone® TWO GT Cable & Adapter Set page describes a balanced "4.4mm to 3.5mm" cable, but the GTC product page itself does not explicitly state the headphone-side connector. Therefore only the manufacturer-confirmed 4.4 mm termination is recorded in `connectorTermination`.
