# Filter Schema — `/products/headphones`

D0 deliverable for `sang-logium-1xs.6`. Reconciles the POC's proposed flat
field names (`app/(test)/poc/filter-sort/headphones/lib/types.ts` +
`facetConfig.ts`) with the existing production `filterAttributes` object
(`lib/catalogue/facetMap.ts`, `_project/filters/facet-map.json`) into one
final naming per item of `should-be-headphones.md`'s 31-item list. This
document does not source or write any product data — see
`sourcing-protocol-headphones.md` for how a value is decided once sourcing
begins (`sang-logium-1xs.7` and later).

## Reconciliation rule

Where production already has a field for a should-be item, keep its name
unless there's a concrete reason to change it (stated per-row below). Where
the POC introduced a name for a should-be item production doesn't have yet,
adopt the POC's name unless noted. There is exactly one canonical name per
item from this point forward — no parallel vocabularies.

All fields live under `filterAttributes.*` on the `product` document, same as
today's production shape (not the POC's flattened top-level shape — that was
a POC-only convenience for its in-memory dataset).

## Field table

Tier column: **H** = hard spec, **M** = marketing/feature fact, **E** =
editorial/perceptual, **I** = internal/operational (store data, not sourced
from a manufacturer — no citation needed), **D** = derived (computed from
other fields already carrying citations — no citation of its own).

| # | Should-be item | Field | Type | Tier | Naming decision |
|---|---|---|---|---|---|
| 1 | Brand | `filterAttributes.brand` | multi | I | Unchanged. |
| 2 | Price | `filterAttributes.price` | range | I | Unchanged. |
| 3 | Customer Rating | `filterAttributes.rating`, `filterAttributes.ratingCount` | range, internal | I | New; sourced from the store's own review system, not a manufacturer — internal, not part of the sourcing protocol. |
| 4 | Awards / Recognition | `filterAttributes.awards` | multi | M | New. POC's `awards` name adopted as-is. |
| 5 | Condition / Stock Type | `filterAttributes.condition` | enum | I | New; internal inventory state, not sourced. |
| 6 | Availability / In Stock | `filterAttributes.inStock` | boolean | I | Unchanged; derived from `stock`/`reservedStock`. |
| 7 | Deals / Discount | `filterAttributes.deals` | multi | I | New; internal, derived from active promotions/price data. |
| 8 | New Arrivals | `filterAttributes.isNewArrival` | boolean | I | New; internal, derived from `_createdAt`. |
| 9 | Preorder / Interest Check Status | `filterAttributes.availability` | enum | I | New; internal store-operational status. |
| 10 | Product Category / Type | `filterAttributes.productCategory` | multi | M | New. Distinct from the existing catalogue-routing `filterAttributes.category` (headphones/audio-electronics/accessories) — this is the shopper-facing sub-type within the headphones slice. |
| 11 | Wearing Style / Form Factor | `filterAttributes.wearingStyle` | multi | M | Unchanged. |
| 12 | Acoustic Design | `filterAttributes.acousticDesign` | multi | M | **Renamed** from production's `backDesign`. POC's `acousticDesign` name adopted — "back design" undersells that semi-open/hybrid isn't strictly a back-of-cup attribute; `acousticDesign` matches the should-be.md item title. Existing `backDesign` data (if any) migrates 1:1 by value — no vocabulary change, name change only. |
| 13 | Fit Type (IEM) | `filterAttributes.fitType` | enum, nullable | M | New. `null` when not an IEM (item doesn't apply). |
| 14 | Connectivity | `filterAttributes.connectivity` | enum | M | Unchanged field name; vocabulary extended `wired, wireless` → `wired, wireless, true-wireless, hybrid` per should-be.md item 14. |
| 15 | Portable / Desktop | `filterAttributes.portable` | boolean | M | New. |
| 16 | Sound Signature / Tonal Preference | `filterAttributes.soundSignature` | enum | E | New. Editorial tier — see sourcing protocol's Tier 3 hierarchy. |
| 17 | Impedance | `filterAttributes.impedanceOhms` | range | H | New. |
| 18 | Sensitivity | `filterAttributes.sensitivityDbMw` | range | H | New. |
| 19 | Frequency Response Range | `filterAttributes.freqResponseHz` (`{min, max}`) | range | H | New. The should-be.md item is the full printed range, not a single derived number — the POC's `bassExtensionHz` simplification (single most-compared dimension) was a POC-only display shortcut; the schema's sourced fact field is the full `{min, max}` pair. A `bassExtensionHz` display value MAY still be derived from `freqResponseHz.min` at render time, but it is not itself a stored/sourced field. |
| 20 | Requires Amplifier | `filterAttributes.requiresAmplifier` | boolean | D | Unchanged name. Derived from items 17+18 at data-write time — inherits their citations, carries none of its own (see sourcing protocol). |
| 21 | Microphone / Call Support | `filterAttributes.microphone` | boolean | M | Unchanged. |
| 22 | Cable / Termination Connector | `filterAttributes.cableTermination` | multi | M | **Renamed** from production's `connector`. POC's `cableTermination` name adopted — disambiguates from the Wireless group's Bluetooth "connectivity," and matches the naming pattern already used by the accessories slice's `connectorTermination`. Same closed vocabulary as before (`3.5mm`, `2.5mm-balanced`, `4.4mm-balanced`, `4-pin-xlr`, `6.35mm`), name change only. |
| 23 | Detachable / Upgradeable Cable | `filterAttributes.detachableCable` | boolean | M | New. |
| 24 | Cable Length | `filterAttributes.cableLengthM` | range, nullable | H | New. `null` when not applicable (e.g. true-wireless). |
| 25 | Foldable | `filterAttributes.foldable` | boolean | M | New. |
| 26 | Water / Sweat Resistance (IPX) | `filterAttributes.ipxRating` | enum | M | New. |
| 27 | Bluetooth Codec | `filterAttributes.bluetoothCodecs` | multi | M | New. Domain-gated: meaningful only when `connectivity !== 'wired'`. |
| 28 | Active Noise Cancelling (ANC) | `filterAttributes.anc` | enum | M | **Replaces** production's boolean `noiseCancelling`. POC's richer three-value enum (`anc`, `passive`, `none`) adopted — should-be.md item 28 explicitly distinguishes "Passive Isolation Only" from "None/Open," which a boolean can't express. |
| 29 | Battery Life | `filterAttributes.batteryLifeHours` (`{ancOff, ancOn}`, both nullable) | range | M | New. should-be.md calls for ANC-on/ANC-off shown separately where available; a wired-only product has both `null`. |
| 30 | Driver Type | `filterAttributes.driverType` | multi | H | Unchanged field name; vocabulary extended to add `amt`, `bone-conduction`, `electret` per should-be.md item 30. |
| 31 | Driver Configuration / Count | `filterAttributes.driverConfigBucket` (filterable), `filterAttributes.driverConfigDetail` (display-only string, e.g. `"1DD+4BA"`) | enum + string | H (bucket), D (detail) | New. `driverConfigDetail` is not itself filtered on and is derived from the same source as `driverConfigBucket` — no separate citation. |

## Citation field

Every **H**, **M**, and **E** tier field above gets a paired citation — not
31 parallel citation fields, but one shared map:

```
filterAttributes.sourcing: Record<FieldName, {
  url: string;       // exact source URL
  quote: string;      // the exact phrase that produced the value
  tier: 'hard-spec' | 'marketing-fact' | 'editorial';
  sourcedAt: string;   // ISO date the citation was captured
}>
```

**D**-tier fields (`requiresAmplifier`, `driverConfigDetail`) do not get their
own `sourcing` entry — a later check re-derives them from the fields they
depend on (17+18, and the driver source behind 31 respectively) and can
re-verify against those fields' citations instead.

**I**-tier fields (`rating`, `ratingCount`, `condition`, `deals`,
`isNewArrival`, `availability` — see table) never get a `sourcing` entry;
they are internal store data, never fed by the manufacturer-sourcing
pipeline. `awards` is tier **M**, not I, and does get a citation (the
awarding publication's page) despite reading like a store-side tag.

## Out of scope

Sourcing any actual value into these fields (`sang-logium-1xs.7` pilot, and
fan-out batches after it); live verification on
`/products/headphones` (`sang-logium-1xs.3`, blocked transitively).
