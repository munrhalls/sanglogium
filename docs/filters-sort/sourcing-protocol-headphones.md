# Sourcing Protocol — `/products/headphones`

D0 deliverable for `sang-logium-1xs.6`, paired with `schema-headphones.md`.
States, per field, which tier it belongs to and where its value comes from.
Does not source or verify any actual product value — that's
`sang-logium-1xs.7` (pilot) and the fan-out batches after it.

## Tiers

Every fact-tier field in `schema-headphones.md` (marked H, M, or E) belongs
to exactly one of these three tiers, in descending order of how directly
"factual" the source is expected to be:

### Tier 1 — Hard specs (H)

`impedanceOhms`, `sensitivityDbMw`, `freqResponseHz`, `cableLengthM`,
`driverType`, `driverConfigBucket`.

**Source order (widened 2026-09-13 — see rationale below):** (1) manufacturer's
official spec sheet/product page; (2) manufacturer's own owner's
manual/manual PDF — an equally-authoritative manufacturer document, not a
lesser fallback, and PDFs must actually be opened and read (image-based PDFs
need OCR/visual reading, not just a text-scrape that gives up on "no text
found"); (3) manufacturer's own official press release for the launch (dated,
attributable, not a leak); (4) an independent measurement lab from Tier 3's
source list, since they publish raw measured numbers, not just marketing
claims; (5) reputable tech press **only when it explicitly attributes the
figure to the manufacturer** (a press write-up of a leak or a Reddit tip is
not this tier — see "What does not count" below).

**Manufacturer self-contradiction rule (revised 2026-09-13):** if two
same-tier manufacturer sources state different values for the same field,
resolve by recency rather than flagging for human review — prefer the
currently-live web product page/spec sheet over a dated document (a launch
press release, an older manual revision) whenever one source is clearly more
current than the other, since the live page is the one most likely to
reflect the actual current hardware/spec. Record the current-source value,
cite both, and note briefly (one line) which was picked and why — no
separate flagged-conflict block, no human-resolution gate. Only fall back to
flagging for human resolution when recency doesn't resolve it (e.g. both
sources are undated, or both are equally current).

### Tier 2 — Marketing / feature facts (M)

`awards`, `productCategory`, `wearingStyle`, `acousticDesign`, `fitType`,
`connectivity`, `portable`, `microphone`, `cableTermination`,
`detachableCable`, `foldable`, `ipxRating`, `bluetoothCodecs`, `anc`,
`batteryLifeHours`.

**Source order (widened 2026-09-13):** (1) manufacturer official product
page/spec sheet; (2) manufacturer's own manual/manual PDF, equally
authoritative, actually opened and read; (3) manufacturer's own official
press release; (4) the should-be-headphones.md audited retailers
(headphones.com, Bloom Audio, Linsoul, Apos, Moon Audio, Audio46, MusicTeck);
(5) reputable tech press, only when it states the fact as a directly-observed
or manufacturer-attributed spec, not a rumor/leak.

**What does not count, at any tier:** a search-engine excerpt that was never
actually opened; a tech-press article's own "reported to be" / "leaked"
framing (this is explicitly a signal to keep looking, not a source to cite);
a forum/enthusiast claim with no manufacturer or lab attribution.

### Tier 3 — Editorial / perceptual (E)

`soundSignature`.

**Never** manufacturer marketing copy alone — every brand calls itself
"balanced." Independent, methodology-published measurement sources only, in
this order:

1. **Crinacle** — not just the rankings list (squig.link / graph.hangout.audio
   / crinacle.com/rankings); **widened 2026-09-13 to also include Crinacle's
   individual review posts** (e.g. crinacle.com/YYYY/MM/DD/crinnotes-*), since
   a product can be graded in a dedicated post without appearing on the
   rankings list — the pilot found this gap directly (Focal Clear Mg). Check
   both before nulling.
2. **Audio Science Review (ASR)** — Amir Majidimehr's lab-measured FR,
   reproducible methodology, good cross-check.
3. **Rtings.com** — published 14-point methodology with explicit weighted
   sound-profile scoring (bass/mid/treble accuracy); best coverage for
   mainstream/wireless consumer headphones the other two may not have
   measured.

**Rule:** derive the Sound Signature label from the source's actual measured
frequency-response curve (e.g. elevated bass shelf + recessed mids →
V-Shaped/Basshead), not by copying a reviewer's prose adjective — keeps the
label consistent across products instead of drifting with each reviewer's
writing style. If a product isn't measured by any of the three, Sound
Signature is `null`, never inferred from marketing copy. If two sources
materially disagree, use Crinacle's reading as primary and note ASR's as a
low-confidence flag rather than averaging or guessing.

### Internal (I) and derived (D) fields

Not sourced by this protocol at all — see `schema-headphones.md`'s field
table for which fields these are and why (store-operational data, or values
computed from another field's already-cited source).

## Citation requirement

Every Tier 1/2/3 value written to `filterAttributes.*` gets a paired entry in
`filterAttributes.sourcing` (shape defined in `schema-headphones.md`): the
exact URL, the exact quoted phrase that produced the value, the tier, and the
date the citation was captured. A later pass can then check the value
against its source without re-deriving the fact from scratch.

## Missing-source convention (revised 2026-09-13)

`null` is a last resort, not a routine outcome. Before a field is written as
null, the sourcing pass must have exhausted the **widened** tier order above
for that field — including actually opening a PDF/manual (not giving up when
a text-scrape returns nothing), checking the manufacturer's own launch press
release, and checking Crinacle's individual review posts in addition to the
rankings list, where the tier applies. A field is only left null when every
applicable source in the widened order has been checked and none states the
value — reserved for genuinely rare cases, not the default when the first
page checked doesn't mention it. It is still **never invented, never
inferred, never a guessed default** — the fix for "we don't have a value" is
to look harder within the real tier order, not to make one up.

**Boolean feature-absence exception (added 2026-09-13):** for boolean M-tier
fields that describe a marketable feature a manufacturer would call out if
present (`microphone`, `foldable`, and fields of the same shape) — as
opposed to a spec a manufacturer might simply omit from a given page —
silence across the manufacturer page, manual, and press release is read as
`false`, not `null`. A manufacturer that ships a mic or a folding hinge
advertises it; the absence of any mention after checking those sources is
itself the evidence, not a gap requiring more searching. This exception does
not apply to non-boolean or non-marketable fields (e.g. `impedanceOhms`,
`cableTermination`), where the general null-is-a-last-resort rule above still
governs.

This still matches the existing consumption-side convention: both the POC's
`filterProducts.ts` and production's `getFilterFacets.ts` already treat a
null/undefined field value as "product doesn't match this filter" rather
than erroring — but that safety net exists for the rare genuine gap, not as
license to stop searching early.

## Parallel sourcing batch assignment

When sourcing is fanned out across multiple parallel batches (as
`sang-logium-1xs.7`'s pilot and the batches after it will do), each batch is
assigned a disjoint slice of the product catalogue by product `_id` —
partitioned up front (e.g. sorted by `_id` and split into contiguous ranges,
or hashed into N buckets), never by field or facet. Two batches running at
once therefore never write to the same product record, so there is no
write-write race to resolve and no need for batch-level locking. A batch may
still touch multiple fields on its own assigned products, and every write it
makes carries its own citation per the requirement above.
