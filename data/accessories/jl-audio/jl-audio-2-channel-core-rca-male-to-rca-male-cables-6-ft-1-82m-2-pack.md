---
product_id: "Y7l1IhzX2fnyiano58Giz2"
product_slug: "jl-audio-2-channel-core-rca-male-to-rca-male-cables-6-ft-1-82m-2-pack"
brand: "JL Audio"
name: "JL Audio 2-Channel Core RCA Male to RCA Male Cables - 6 ft. (1.82m) - 2-Pack"
slice: "accessories"
spec_fields:
  accessoryType: "cables-interconnects"
  compatibleProductType:
    - "amplifier-source"
  cableFunction:
    - "interconnect-rca-xlr"
  connectorTermination:
    - "rca"
  lengthM: 1.83
  conductorMaterial:
    - "copper-ofc"
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
  awards: []
source_urls:
  - "https://www.onlinecarstereo.com/CarAudio/p_28720_JL_Audio_XD-CLRAIC2-6.aspx"
  - "https://www.worldwidestereo.com/products/jl-audio-2-channel-core-rca-male-to-rca-male-cables-6-ft-1-82m-2-pack"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **accessoryType** (marketing-fact): the product is listed as a "2-channel Core Audio Interconnect Cable" and is categorized under "RCAs & Interconnects" / "Audio Interconnects" — https://www.onlinecarstereo.com/CarAudio/p_28720_JL_Audio_XD-CLRAIC2-6.aspx
- **compatibleProductType** (marketing-fact): product overview states the cable is "designed specifically for car audio applications" and is for "connecting amplifiers, head units, or processors" — mapped to `amplifier-source` — https://www.onlinecarstereo.com/CarAudio/p_28720_JL_Audio_XD-CLRAIC2-6.aspx
- **cableFunction** (marketing-fact): "2-channel Core Audio Interconnect Cable" with RCA male-to-male connectors — mapped to `interconnect-rca-xlr` — https://www.onlinecarstereo.com/CarAudio/p_28720_JL_Audio_XD-CLRAIC2-6.aspx
- **connectorTermination** (marketing-fact): product name and features identify "RCA Male to RCA Male" / "dual-molded RCA connectors" — https://www.onlinecarstereo.com/CarAudio/p_28720_JL_Audio_XD-CLRAIC2-6.aspx
- **lengthM** (hard-spec): 6 ft (1.83 m) — stated by both the authorized retailer product title and the "Length: 6 ft" specification line — https://www.onlinecarstereo.com/CarAudio/p_28720_JL_Audio_XD-CLRAIC2-6.aspx
- **conductorMaterial** (marketing-fact): "Pure OFC Copper Conductors" / "oxygen-free copper (OFC) conductors" — mapped to `copper-ofc` — https://www.onlinecarstereo.com/CarAudio/p_28720_JL_Audio_XD-CLRAIC2-6.aspx
- **balancedUnbalanced** (hard-spec): `null` — no source explicitly states whether the cable is balanced or unbalanced; the source only states it has RCA connectors, which is insufficient to confirm the schema value.
- **awards** (marketing-fact): `[]` — no named awards, editor's choice, or recognition badges are listed on either retailer page.

### Domain-gated accessory fields (all `null`)

Because `accessoryType` is `cables-interconnects`, only the Cables & Interconnects group (`cableFunction`, `connectorTermination`, `lengthM`, `conductorMaterial`, `balancedUnbalanced`) is applicable. All other domain-gated fields are `null`:

`furnitureType`, `material`, `adjustableHeight`, `weightCapacityKg`, `powerProductType`, `outletCount`, `powerConnectorType`, `cleaningProductType`, `formatCompatibility`, `partType`, `compatibility`, `adapterFunction`, `treatmentType`, `mounting`.

## Conflict / Caution Notes

- **Length conflict**: the product slug and store title use "1.82m", while both audited retailer sources (Online Car Stereo and World Wide Stereo) list the length as "6 ft (1.83 m)". The live retailer sources agree on 1.83 m, so `lengthM` is recorded as `1.83` with both sources cited; the slug's "1.82m" is treated as a low-confidence legacy value.
- **No manufacturer product page found**: searches on `jlaudio.com` and the JL Audio support/registration sites did not return a product page, manual, or spec PDF for `XD-CLRAIC2-6` (model 90416). Values are therefore sourced from an authorized JL Audio dealer (Online Car Stereo) and a major retailer (World Wide Stereo), which both carry the identical product description and model/UPC.
- **World Wide Stereo cross-check**: Model 90416 | UPC 699440904162; product title "2-channel Core Audio Interconnect Cable - 6 ft (1.83 m)" with the same feature list (Twisted-Pair Construction, Pure OFC Copper Conductors, Molded Connector Bodies, Machined Brass Connector Elements) — https://www.worldwidestereo.com/products/jl-audio-2-channel-core-rca-male-to-rca-male-cables-6-ft-1-82m-2-pack
