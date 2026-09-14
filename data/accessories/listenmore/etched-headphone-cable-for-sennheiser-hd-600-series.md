---
product_id: "PHPYj28HJdPDHAaIBAHZj0"
product_slug: "etched-headphone-cable-for-sennheiser-hd-600-series"
brand: "Listenmore"
name: "Etched Headphone Cable for Sennheiser HD 600 Series"
slice: "accessories"
spec_fields:
  price:
    min: 69.99
    max: 99.99
    currency: "USD"
  customerRating: null
  awards: null
  condition: null
  inStock: null
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
  - "https://headphones.com/products/etched-headphone-cable-for-sennheiser-hd-600-series"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes
- **price** (hard-spec): Product variant selector lists prices from $69.99 (Green / 1.25m / 3.5mm) to $99.99 (Green / 3m / 4-Pin XLR); the page top shows "Regular price $69.99". — https://headphones.com/products/etched-headphone-cable-for-sennheiser-hd-600-series
- **customerRating** (marketing-fact): `null` — no aggregate customer rating is shown on the product page.
- **awards** (marketing-fact): `null` — no named awards, editor's choice, or recognition badges are listed.
- **condition** (marketing-fact): `null` — no condition (New / Open-Box / Refurbished) is stated.
- **inStock** (marketing-fact): `null` — the product page shows an "Add to cart" button and does not explicitly state "In stock" or "Out of stock" at the product level; one variant (Silver / 3m / 4-Pin XLR) is marked "Sold out". No explicit availability statement could be confirmed from the manufacturer page.
- **dealsDiscount** (marketing-fact): `null` — the sale price equals the regular price and no clearance or discount language is present.
- **newArrival** (marketing-fact): `null` — no "New Arrival" flag or launch callout is present.
- **accessoryType** (marketing-fact): `cables-interconnects` — the product is in the Accessories > Cables collection and the breadcrumbs are Home / Cables / Listenmore / Etched Headphone Cable for Sennheiser HD 600 Series. — https://headphones.com/products/etched-headphone-cable-for-sennheiser-hd-600-series
- **compatibleProductType** (marketing-fact): `headphone` — "Designed around Sennheiser's proprietary dual-pin connectors, this version fits perfectly with the HD 600 family". — https://headphones.com/products/etched-headphone-cable-for-sennheiser-hd-600-series
- **cableFunction** (marketing-fact): `null` — the manufacturer describes it as a headphone cable for the Sennheiser HD 600 Series; the current `Cable Function` vocabulary does not include a headphone-cable option.
- **connectorTermination** (hard-spec): `3.5mm`, `6.35mm`, and `xlr` — the specs table lists "Connector (Amp Side): 3.5 mm, 6.35 mm, or 4-Pin XLR" and the variant selector confirms these three options. The source says "4-Pin XLR"; it is recorded as `xlr` because the current connector vocabulary uses `xlr`. `6.35mm` is not in the current vocabulary and is recorded as a literal source value. — https://headphones.com/products/etched-headphone-cable-for-sennheiser-hd-600-series
- **lengthM** (hard-spec): `[1.25, 3]` — the specs table lists "Length Options: 1.25 m or 3 m" and the live variant selector offers 1.25m and 3m. — https://headphones.com/products/etched-headphone-cable-for-sennheiser-hd-600-series
- **conductorMaterial** (hard-spec): `null` — the manufacturer page does not state the conductor material.
- **balancedUnbalanced** (hard-spec): `true` — the product is offered with a 4-Pin XLR balanced termination in addition to 3.5mm/6.35mm single-ended options.
- **compatibility** (marketing-fact): `null` — the `Compatible Model / Brand` filter is domain-gated to `replacement-parts` per `should-be-accessories.md`. The manufacturer page does list compatible Sennheiser models; that list is preserved below for context, but the correct filter value for a `cables-interconnects` product is `null`.
- **furnitureType**, **material**, **adjustableHeight**, **weightCapacityKg**, **powerProductType**, **outletCount**, **powerConnectorType**, **cleaningProductType**, **formatCompatibility**, **partType**, **adapterFunction**, **treatmentType**, **mounting**: `null` — domain-gated fields that do not apply to a `cables-interconnects` product.

## Conflict / Caution Notes
- **Connector vocabulary gap**: The source lists a `6.35mm` (1/4\") termination, which is not in the current `should-be-accessories.md` / `TerminationType` vocabulary (`RCA, XLR, Banana Plug, Spade, BNC, 3.5mm, 2.5mm, 4.4mm, Mini-to-RCA`). It is recorded as a literal value; the vocabulary may need an update.
- **XLR specificity**: The source says "4-Pin XLR"; the current connector vocabulary only has `xlr`. Recorded as `xlr` while preserving the source's 4-Pin detail in the quote above.
- **CMS `filterAttributes` mismatch**: Sanity currently stores `connectorTermination: ["3.5mm", "6.35mm", "4.4mm-balanced"]` for this product; the manufacturer source supports 3.5mm, 6.35mm, and 4-Pin XLR (not 4.4mm).
- **Manufacturer-only source**: No separate Listenmore manufacturer site, manual PDF, or press release was found. The Headphones.com product page is the highest-tier source available and is treated as the manufacturer/brand page for this house brand.

## Source context for compatible models
The manufacturer page lists the following compatible models for this cable:
- Sennheiser HD 600, HD 650, HD 6XX, HD 660 S, HD 660 S2, and HD 58X Jubilee
- Any Sennheiser headphone using the dual-pin connector system
