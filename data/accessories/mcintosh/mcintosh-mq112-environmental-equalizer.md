---
product_id: "x2LkzHeaGqoEz8Jhogdmti"
product_slug: "mcintosh-mq112-environmental-equalizer"
brand: "McIntosh"
name: "MQ112 Environmental Equalizer"
slice: "accessories"
price: 350000
spec_fields:
  brand:
    - "mcintosh"
  customerRating: null
  condition: "new"
  inStock: true
  dealsDiscount: "none"
  newArrival: false
  awards: null
  accessoryType: null
  compatibleProductType:
    - "amplifier-source"
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
source_urls:
  - "https://www.mcintoshlabs.com/products/room-correction/MQ112"
  - "https://www.mcintoshlabs.com/-/media/Files/mcintoshlabs/DocumentMaster/us/MQ112-Product-Sheet-00.pdf"
  - "https://www.mcintoshlabs.com/-/media/Files/mcintoshlabs/DocumentMaster/us/MQ112-OM-24120000.pdf"
  - "https://www.musicdirect.com/equipment/accessories/analog-accessories/mcintosh-mq112-environmental-equalizer/"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **brand** (hard-spec): `mcintosh` — manufacturer product page and Music Direct listing identify brand as McIntosh — https://www.mcintoshlabs.com/products/room-correction/MQ112
- **price** (marketing-fact): 350000 cents ($3,500.00 USD) — Music Direct lists "Price Now $3,500.00" — https://www.musicdirect.com/equipment/accessories/analog-accessories/mcintosh-mq112-environmental-equalizer/
- **customerRating** (marketing-fact): null — Music Direct shows "Reviews (0)" and "Q & A (0)"; no customer rating or review aggregate found on manufacturer page or audited retailer listings
- **condition** (marketing-fact): `new` — Music Direct regular new-item listing (separate pre-owned listing exists at a different URL); no open-box/refurbished indication on this listing — https://www.musicdirect.com/equipment/accessories/analog-accessories/mcintosh-mq112-environmental-equalizer/
- **inStock** (marketing-fact): `true` — Music Direct lists "In Stock" and the offer metadata states `InStock` availability — https://www.musicdirect.com/equipment/accessories/analog-accessories/mcintosh-mq112-environmental-equalizer/
- **dealsDiscount** (marketing-fact): `none` — Music Direct lists "Not Eligible For Discount" and "0% off"; no sale or clearance callout on the listing — https://www.musicdirect.com/equipment/accessories/analog-accessories/mcintosh-mq112-environmental-equalizer/
- **newArrival** (marketing-fact): `false` — no new-arrival badge or callout on Music Direct or McIntosh product pages; product manual is dated 2023-08-14 — https://www.mcintoshlabs.com/-/media/Files/mcintoshlabs/DocumentMaster/us/MQ112-OM-24120000.pdf
- **awards** (marketing-fact): null — no named awards, editor's-choice badges, or recognition callouts found on the manufacturer product page, product sheet, owner's manual, or Music Direct listing
- **accessoryType** (marketing-fact): null — the manufacturer describes the product as an "8-band analog equalizer" under the "Room Correction" section, and Music Direct places it under "Equipment > Accessories > Analog Accessories"; none of the should-be-accessories.md `accessoryType` values (cables-interconnects, stands-isolation, racks-furniture, power, cases-storage-transport, cleaning-maintenance, replacement-parts, adapters-converters, room-acoustic-treatment) accurately describe an equalizer — https://www.mcintoshlabs.com/products/room-correction/MQ112
- **compatibleProductType** (marketing-fact): `["amplifier-source"]` — manufacturer page states "place it between the preamplifier and power amplifier(s)" and that it can also be used with integrated amplifiers; the primary placement is in the preamplifier/amplifier signal chain — https://www.mcintoshlabs.com/products/room-correction/MQ112
- **cableFunction** (marketing-fact): null — not a cable or interconnect; domain-gated to `cables-interconnects`, which does not apply
- **connectorTermination** (marketing-fact): null — not a cable or interconnect; the product has RCA and XLR input/output jacks, but these are on an equalizer, not a cable product
- **lengthM** (marketing-fact): null — not a cable or interconnect
- **conductorMaterial** (marketing-fact): null — not a cable or interconnect
- **balancedUnbalanced** (marketing-fact): null — not a cable or interconnect; the product has both balanced (XLR) and unbalanced (RCA) I/O, but `balancedUnbalanced` is gated to the `cables-interconnects` domain
- **furnitureType** (marketing-fact): null — not a stand, isolation device, rack, or furniture product
- **material** (marketing-fact): null — not a stand, isolation device, rack, or furniture product
- **adjustableHeight** (marketing-fact): null — not a stand, isolation device, rack, or furniture product
- **weightCapacityKg** (marketing-fact): null — not a stand, isolation device, rack, or furniture product; the unit itself weighs 6.8 kg, but that is not a load capacity spec
- **powerProductType** (marketing-fact): null — not a power conditioner, surge protector, distributor, UPS, or power cable; the product is an equalizer
- **outletCount** (marketing-fact): null — not a power product; the rear panel has a Power Control In/Out trigger, not AC outlets for power distribution
- **powerConnectorType** (marketing-fact): null — not a power product; the unit has an IEC AC inlet for its own power, but this field is gated to the `power` domain
- **cleaningProductType** (marketing-fact): null — not a record/stylus/cleaning product
- **formatCompatibility** (marketing-fact): null — not a cleaning/maintenance product
- **partType** (marketing-fact): null — not a replacement part
- **compatibility** (marketing-fact): null — not a replacement part; no compatible model list is relevant
- **adapterFunction** (marketing-fact): null — not a Bluetooth adapter, impedance adapter, connector adapter, phono preamp, or USB DAC dongle; it is an equalizer
- **treatmentType** (marketing-fact): null — not an acoustic panel, bass trap, diffuser, or isolation pad; it is an electronic room-correction equalizer, not a physical room-acoustic treatment
- **mounting** (marketing-fact): null — not a room-acoustic treatment product; intended to sit on a rack or shelf, with no wall/ceiling/freestanding mounting spec

## Conflict / Caution Notes

- **Slice/category mismatch:** The McIntosh MQ112 is an 8-band analog environmental equalizer (an audio-electronics room-correction component) and is merchandised by Music Direct under "Analog Accessories" and in the store under `accessories`. The should-be-accessories.md `accessoryType` taxonomy has no value for an equalizer, so `accessoryType` is honestly recorded as `null`. A later cross-slice reclassification to `audio-electronics` may be appropriate, but that is out of scope for this sourcing pass.
- **Price anomaly:** A 2025 FutureAudiophile review lists the MQ112 at $2,999.00, while current audited retailers (Music Direct, Audio Advice, Flanner's, Overture, SkyFi) and the store list $3,500.00 as of 2026-09-14. Because the audited/major retailers are a higher tier than a review for a price fact, the retailer consensus of $3,500.00 is used.
- **Power-related features do not make this a power accessory:** The owner's manual and product sheet note a Power Control In/Out trigger and an IEC AC inlet, but these are component-level power/trigger connections, not the outlet/connectivity features described by the `power` domain fields (`powerProductType`, `outletCount`, `powerConnectorType`), which all remain `null`.
