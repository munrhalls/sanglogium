---
product_id: "PHPYj28HJdPDHAaIBAHVcm"
product_slug: "etched-headphone-cable"
brand: "Listenmore"
name: "Etched Headphone Cable"
slice: "accessories"
spec_fields:
  price:
    min: 69.99
    max: 99.99
    currency: "USD"
  customerRating: null
  awards: null
  condition: null
  inStock: true
  dealsDiscount: null
  newArrival: null
  accessoryType: "cables-interconnects"
  compatibleProductType: "headphone"
  cableFunction: null
  connectorTermination:
    - "3.5mm"
    - "6.35mm"
    - "xlr"
  lengthM:
    - 1.25
    - 3
  conductorMaterial: null
  balancedUnbalanced: true
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
  - "https://headphones.com/products/etched-headphone-cable"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes
- **price** (hard-spec): Product variant selector lists prices from $69.99 (Blue / 3.5mm / 1.25m) to $99.99 (Blue/Silver/Copper/Green / 4-Pin XLR / 3m); the page top also shows "Regular price $99.99". — https://headphones.com/products/etched-headphone-cable
- **customerRating** (marketing-fact): `null` — no aggregate customer rating is shown on the product page.
- **awards** (marketing-fact): `null` — no named awards, editor's choice, or recognition badges are listed.
- **condition** (marketing-fact): `null` — no condition (New / Open-Box / Refurbished) is stated.
- **inStock** (marketing-fact): `true` — the page shows "Ships today!" and "In stock" at the product level; some individual variants are marked "Sold out".
- **dealsDiscount** (marketing-fact): `null` — the sale price equals the regular price and no clearance or discount language is present.
- **newArrival** (marketing-fact): `null` — no "New Arrival" flag or launch callout is present.
- **accessoryType** (marketing-fact): `cables-interconnects` — the product is in the Accessories > Cables collection and the breadcrumbs are Home / Cables / Listenmore / Etched Headphone Cable. — https://headphones.com/products/etched-headphone-cable
- **compatibleProductType** (marketing-fact): `headphone` — the description says "designed to be universally compatible with all your favourite headphones" and lists specific headphone models. — https://headphones.com/products/etched-headphone-cable
- **cableFunction** (marketing-fact): `null` — the manufacturer describes it as a headphone upgrade cable; the current `Cable Function` vocabulary (`interconnect-rca-xlr`, `speaker-cable`, `digital`, `power-mains`, `phono`) does not include a headphone-cable option.
- **connectorTermination** (hard-spec): `3.5mm`, `6.35mm`, and `xlr` — the specs table lists "Amp Side: 6.35mm (1/4\") Single-Ended or 4-Pin XLR Balanced" and the variant selector adds a 3.5mm (1/8\") option. The source says "4-Pin XLR"; it is recorded as `xlr` because the current connector vocabulary uses `xlr`. `6.35mm` is not in the current vocabulary and is recorded as a literal source value. — https://headphones.com/products/etched-headphone-cable
- **lengthM** (hard-spec): `[1.25, 3]` — the live variant selector offers "1.25m" and "3m". The older description/specs table states "Length: 3 metres (9.7 feet)" and "What's included?: 3m (9.7ft) Listenmore Etched Headphone Cable". The live, selectable variants are treated as the current source per the manufacturer self-contradiction rule. — https://headphones.com/products/etched-headphone-cable
- **conductorMaterial** (hard-spec): `null` — the manufacturer page does not state the conductor material.
- **balancedUnbalanced** (hard-spec): `true` — the product is offered with a 4-Pin XLR balanced termination in addition to 3.5mm/6.35mm single-ended options.
- **compatibility** (marketing-fact): `null` — the `Compatible Model / Brand` filter is domain-gated to `replacement-parts` per `should-be-accessories.md`. The manufacturer page does list compatible headphones; that list is preserved below for context, but the correct filter value for a `cables-interconnects` product is `null`.
- **furnitureType**, **material**, **adjustableHeight**, **weightCapacityKg**, **powerProductType**, **outletCount**, **powerConnectorType**, **cleaningProductType**, **formatCompatibility**, **partType**, **adapterFunction**, **treatmentType**, **mounting**: `null` — domain-gated fields that do not apply to a `cables-interconnects` product.

## Conflict / Caution Notes
- **Connector vocabulary gap**: The source lists a `6.35mm` (1/4\") termination, which is not in the current `should-be-accessories.md` / `TerminationType` vocabulary (`RCA, XLR, Banana Plug, Spade, BNC, 3.5mm, 2.5mm, 4.4mm, Mini-to-RCA`). It is recorded as a literal value; the vocabulary may need an update.
- **XLR specificity**: The source says "4-Pin XLR"; the current connector vocabulary only has `xlr`. Recorded as `xlr` while preserving the source's 4-Pin detail in the quote above.
- **Color / length conflict**: The live product offers Blue, Silver, Copper, Green and lengths 1.25m/3m, while the older description/specs table says "Colour: Blue or Silver" and "Length: 3 metres". The live variants are treated as the current source per the manufacturer self-contradiction rule.
- **CMS `filterAttributes` mismatch**: Sanity currently stores `connectorTermination: ["3.5mm", "6.35mm", "4.4mm-balanced"]` for this product; the manufacturer source supports 3.5mm, 6.35mm, and 4-Pin XLR (not 4.4mm).
- **Manufacturer-only source**: No separate Listenmore manufacturer site, manual PDF, or press release was found. The Headphones.com product page is the highest-tier source available and is treated as the manufacturer/brand page for this house brand.

## Source context for compatible models
The manufacturer page lists the following compatible headphones for this universal cable:
- Focal: Elear, Elex, Clear, Elegia, Celestee, Radiance, Clear Mg, Stellia
- Hifiman: HE400se, Sundara, Sundara Closed, Edition XS, Ananda, Ananda Stealth, Arya, Arya Stealth, Arya Organic, Audivina, HE1000 Stealth, HE1000SE, Susvara
- Meze Audio: 99 Classics, 109 Pro, 109 Pro Primal, LIRIC
- HEDD Audio: HEDDphone TWO
- Denon: AH-D5200, AH-D7200, AH-D9200
- Sony: MDR-Z7M2, MDR-Z1R
