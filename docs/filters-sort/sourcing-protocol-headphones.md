# Sourcing Protocol — `/products/headphones`

D0 deliverable for `sang-logium-1xs.6`, paired with `schema-headphones.md`.
This is the headphones-specific instantiation of the shared
`sourcing-protocol.md` standard — see that doc for the tier structure, the
manufacturer self-contradiction rule, the null convention, the citation
format, and the batch-assignment rule, all of which apply here unmodified.
This doc supplies only the three category-specific inputs that standard
calls for: the field→tier table, the Tier 2 audited-retailer list, and the
Tier 3 independent-source list. Does not source or verify any actual product
value — that's `sang-logium-1xs.7` (pilot) and the fan-out batches after it.

## Field → tier table

### Tier 1 — Hard specs (H)

`impedanceOhms`, `sensitivityDbMw`, `freqResponseHz`, `cableLengthM`,
`driverType`, `driverConfigBucket`.

### Tier 2 — Marketing / feature facts (M)

`awards`, `productCategory`, `wearingStyle`, `acousticDesign`, `fitType`,
`connectivity`, `portable`, `microphone`, `cableTermination`,
`detachableCable`, `foldable`, `ipxRating`, `bluetoothCodecs`, `anc`,
`batteryLifeHours`.

### Tier 3 — Editorial / perceptual (E)

`soundSignature`.

### Internal (I) and derived (D) fields

Not sourced by this protocol at all — see `schema-headphones.md`'s field
table for which fields these are and why.

## Tier 2 audited-retailer list

headphones.com, Bloom Audio, Linsoul, Apos, Moon Audio, Audio46, MusicTeck —
per `should-be-headphones.md`'s retailer audit. This is step (4) of the
shared standard's Tier 2 source order.

## Tier 3 independent-source list

In priority order:

1. **Crinacle** — not just the rankings list (squig.link / graph.hangout.audio
   / crinacle.com/rankings); also Crinacle's individual review posts (e.g.
   crinacle.com/YYYY/MM/DD/crinnotes-*), since a product can be graded in a
   dedicated post without appearing on the rankings list — the pilot found
   this gap directly (Focal Clear Mg). Check both before nulling.
2. **Audio Science Review (ASR)** — Amir Majidimehr's lab-measured FR,
   reproducible methodology, good cross-check.
3. **Rtings.com** — published 14-point methodology with explicit weighted
   sound-profile scoring (bass/mid/treble accuracy); best coverage for
   mainstream/wireless consumer headphones the other two may not have
   measured.

**Primary-source rule:** derive the Sound Signature label from the source's
actual measured frequency-response curve (e.g. elevated bass shelf +
recessed mids → V-Shaped/Basshead), not by copying a reviewer's prose
adjective. If two sources materially disagree, use Crinacle's reading as
primary and note ASR's as a low-confidence flag rather than averaging or
guessing.

## Revision history

- 2026-09-13 — source order widened (manufacturer manual/PDF and press
  release added as equally-authoritative tiers; Crinacle individual review
  posts added to the Tier 3 list); manufacturer self-contradiction rule
  changed from human-flag to recency-based resolution; boolean
  feature-absence exception added to the null convention. These changes now
  live in the shared `sourcing-protocol.md` and applied here by reference.
- 2026-09-13 — generalized: tier structure, null convention, citation
  format, and batch-assignment rule extracted to `sourcing-protocol.md`
  (`sang-logium-1xs.12`). This doc now carries only headphones-specific
  inputs.
