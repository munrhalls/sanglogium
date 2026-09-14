---
product_id: "apzyFbFDTajEZntmxssRcT"
product_slug: "yamaha-ns-ic800-140-watt-8-inch-2-way-in-ceiling-speakers-pair-white"
brand: "Yamaha"
name: "Yamaha NS-IC800 140 Watt 8 Inch 2 Way In Ceiling Speakers - Pair (White)"
slice: "accessories"
spec_fields:
  accessoryType: null
  compatibleProductType: null
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
  partType: null
  compatibility: null
  adapterFunction: null
  treatmentType: null
  mounting: null
  awards: null
source_urls:
  - "https://usa.yamaha.com/products/audio_visual/speaker_systems/ns-ic800/index.html"
  - "https://usa.yamaha.com/products/audio_visual/speaker_systems/ns-ic800/specs.html"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **accessoryType** (marketing-fact): `null` — Yamaha categorizes this product under *Home Audio > Speakers & Subwoofers* as "NS-IC800 In-Ceiling Speakers (Pair)", which does not match any of the nine `accessoryType` values in the accessories taxonomy. Source: https://usa.yamaha.com/products/audio_visual/speaker_systems/ns-ic800/index.html
- **compatibleProductType** (marketing-fact): `null` — the product is itself an in-ceiling speaker, not an accessory designed for use with headphones, speakers, turntables, or amplifier/source components. Source: https://usa.yamaha.com/products/audio_visual/speaker_systems/ns-ic800/index.html
- **awards** (marketing-fact): `null` — no named awards, editor's-choice badges, or recognition programs are listed on the manufacturer product page or spec page. Source: https://usa.yamaha.com/products/audio_visual/speaker_systems/ns-ic800/index.html

### Domain-gated accessory fields (all `null`)

Because the manufacturer identifies this product as an in-ceiling speaker and not as an accessory, `accessoryType` is `null`. Per the schema's domain-gating, the following fields therefore have no applicable value and are all recorded as `null`:

`cableFunction`, `connectorTermination`, `lengthM`, `conductorMaterial`, `balancedUnbalanced`, `furnitureType`, `material`, `adjustableHeight`, `weightCapacityKg`, `powerProductType`, `outletCount`, `powerConnectorType`, `cleaningProductType`, `formatCompatibility`, `partType`, `compatibility`, `adapterFunction`, `treatmentType`, `mounting`.

Primary source for the product type determination: https://usa.yamaha.com/products/audio_visual/speaker_systems/ns-ic800/specs.html (lists "Type: 2-way coaxial", "Woofers: 8\" PP (polypropylene) mica cone", etc., confirming it is a speaker, not an accessory).

## Conflict / Caution Notes

- This product is currently catalogued in the accessories slice, but the manufacturer identifies it as an in-ceiling loudspeaker. All accessory-specific `filterAttributes` are therefore correctly recorded as `null`. A later re-categorization pass (out of scope for this sourcing issue) may need to move it out of the accessories slice.
- The current Sanity `filterAttributes` for this product contain legacy `connectorTermination` values (`3.5mm`, `6.35mm`, `4.4mm-balanced`) that describe headphone cable connectors and are not supported by the manufacturer source for this speaker; they have been replaced with `null` here.
