# Accessories `filterAttributes` schema blueprint

D0 deliverable for `sang-logium-1xs.14.1` (Adapt Sanity accessories
filterAttributes schema). Records the schema shape already written into the
**uncommitted** working-tree diff on `sanity-cms/schemaTypes/productType.ts`,
checked field-by-field against the target in `should-be-accessories.md`.
This doc is the pointer the schema's own comment ("see
docs/filters-sort/accessories-filterattributes-migration.md") already
promises.

**Scope, explicitly:** this covers whether the schema can *house* the
should-be shape — field names, types, vocabularies, domain gating. It does
not cover existing product data. Old `accessoryType`/`connectorTermination`
values on current documents are out of scope here; sourcing will populate
the new fields directly with cited data later, so no legacy-value migration
script is needed for this schema.

**Status: schema shape structurally complete against `should-be-accessories.md`.**

## Completeness check (28/29 should-be items map to a field; 1 is out of scope)

All 9 target domain groups are represented: Cables & Interconnects, Stands
& Isolation + Racks & Furniture (combined), Power, Cleaning & Maintenance,
Replacement Parts, Adapters & Converters, Room Acoustic Treatment, plus the
ungated Commercial group and the Type group (`accessoryType`,
`compatibleProductType`).

| should-be-accessories.md item | Field |
|---|---|
| 3 Customer Rating | `customerRating` |
| 4 Awards / Recognition | `awards` (categories extended to include `accessories`) |
| 5 Condition / Stock Type | `condition` |
| 6 Availability / In Stock | *(not filterAttributes-level — inventory/stock concern, same as Brand/Price)* |
| 7 Deals / Discount | `dealsDiscount` |
| 8 New Arrivals | `newArrival` |
| 9 Accessory Category | `accessoryType` (vocab updated to the 9-value taxonomy) |
| 10 Compatible Product Type | `compatibleProductType` |
| 11 Cable Function | `cableFunction` |
| 12 Termination / Connector Type | `connectorTermination` (vocab updated to standalone-cable connectors — see note) |
| 13 Length | `lengthM` |
| 14 Conductor Material | `conductorMaterial` |
| 15 Balanced / Unbalanced | `balancedUnbalanced` |
| 16 Furniture Type | `furnitureType` |
| 17 Material | `material` |
| 18 Adjustable Height | `adjustableHeight` |
| 19 Weight / Load Capacity | `weightCapacityKg` |
| 20 Power Product Type | `powerProductType` |
| 21 Outlet Count | `outletCount` |
| 22 Connector / Plug Type (power) | `powerConnectorType` |
| 23 Product Type (cleaning) | `cleaningProductType` |
| 24 Format Compatibility | `formatCompatibility` |
| 25 Part Type | `partType` |
| 26 Compatible Model / Brand | `compatibility` (title reworded, `domain: ["replacement-parts"]` added) |
| 27 Adapter Function | `adapterFunction` |
| 28 Treatment Type | `treatmentType` |
| 29 Mounting | `mounting` |

Items 1 (Brand) and 2 (Price) are standard product-level fields, not
`filterAttributes` — consistent with how headphones' schema also doesn't
duplicate them.

## Notes on two vocabulary changes (informational, not decisions)

- `accessoryType`: old vocab (`cable`, `adapter`, `interconnect`, `eartip`,
  `earpad`, `stand`, `case`, `care`) is fully superseded by the new 9-value
  taxonomy (`cables-interconnects`, `stands-isolation`, `racks-furniture`,
  `power`, `cases-storage-transport`, `cleaning-maintenance`,
  `replacement-parts`, `adapters-converters`, `room-acoustic-treatment`).
  Two of the old values (`eartip`, `earpad`) don't correspond to a single
  new value — they'd need both `accessoryType: replacement-parts` and the
  new `partType` field populated. Not resolved here: out of scope per
  above, left for sourcing.
- `connectorTermination`: vocab re-scoped from headphone-cable connectors
  (`mmcx`, `usb-c`, `2-pin`, `fixed-cable`, etc.) to standalone-accessory
  cable connectors (`rca`, `xlr`, `banana-plug`, `spade`, `bnc`,
  `mini-to-rca`), matching `should-be-accessories.md` item 12 exactly.
  Correct scope boundary: headphone-specific cable termination is
  headphones' own `cableTermination` field, not this one.

## Domain gating mechanism (shared, reusable)

A `domain` array on each domain-specific field, checked in the shared
`hidden` callback against `filterAttributes.accessoryType`. This is
general-purpose, not accessories-only — audio-electronics' schema work
should reuse the same mechanism.

## Citation shape (shared, reusable)

The `sourcing` citation array (added in an earlier commit) already has
`categories: ["headphones", "accessories"]` — accessories reuses the same
shared citation shape headphones uses, per `sang-logium-1xs.12`'s
generalized protocol. No new citation shape needed for accessories or,
later, audio-electronics.
