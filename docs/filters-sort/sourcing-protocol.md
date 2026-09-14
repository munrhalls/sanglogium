# Sourcing Protocol — shared standard (all catalogue categories)

D0 deliverable for `sang-logium-1xs.12`. Generalizes
`sourcing-protocol-headphones.md` into one category-agnostic standard.
States the tier structure, the null convention, and the citation format that
every catalogue category's sourcing work uses — headphones, audio-electronics,
accessories, and any category added later. Does not source or verify any
actual product field value.

## Scope note

Everything in this document is shared, unmodified, across categories. The
**only** things a category-specific protocol supplies on top of this one are:

1. **The field→tier table** — which of that category's `filterAttributes.*`
   fields are Tier 1 (H), Tier 2 (M), Tier 3 (E), internal (I), or derived
   (D). Different categories have different fields.
2. **The Tier 2 audited-retailer list** — the specific retailers that stand
   in for "reputable domain retailer" at step (4) of the Tier 2 source order
   below. Headphones uses headphones.com, Bloom Audio, Linsoul, Apos, Moon
   Audio, Audio46, MusicTeck; another category names its own.
3. **The Tier 3 independent-source list** — the specific
   methodology-published measurement/review outlets that stand in for
   "independent editorial source" in Tier 3 below. Headphones uses Crinacle,
   ASR, and Rtings; a category with no equivalent editorial field has no
   Tier 3 section at all.

No category invents its own tier structure, citation shape, null rule, or
batch-assignment rule — those are fixed here.

## Tiers

Every fact-tier field in a category's schema (marked H, M, or E) belongs to
exactly one of these three tiers, in descending order of how directly
"factual" the source is expected to be:

### Tier 1 — Hard specs (H)

Fields whose value is a specification a manufacturer states as fact (e.g.
measurable electrical/mechanical parameters) — see the category's own schema
doc for its Tier 1 field list.

**Source order:** (1) manufacturer's official spec sheet/product page;
(2) manufacturer's own owner's manual/manual PDF — an equally-authoritative
manufacturer document, not a lesser fallback, and PDFs must actually be
opened and read (image-based PDFs need OCR/visual reading, not just a
text-scrape that gives up on "no text found"); (3) manufacturer's own
official press release for the launch (dated, attributable, not a leak);
(4) an independent measurement lab from the category's Tier 3 source list,
since they publish raw measured numbers, not just marketing claims;
(5) reputable tech press **only when it explicitly attributes the figure to
the manufacturer** (a press write-up of a leak or a Reddit tip is not this
tier — see "What does not count" below).

**Manufacturer self-contradiction rule:** if two same-tier manufacturer
sources state different values for the same field, resolve by recency rather
than flagging for human review — prefer the currently-live web product
page/spec sheet over a dated document (a launch press release, an older
manual revision) whenever one source is clearly more current than the other,
since the live page is the one most likely to reflect the actual current
hardware/spec. Record the current-source value, cite both, and note briefly
(one line) which was picked and why — no separate flagged-conflict block, no
human-resolution gate. Only fall back to flagging for human resolution when
recency doesn't resolve it (e.g. both sources are undated, or both are
equally current).

### Tier 2 — Marketing / feature facts (M)

Fields that describe a marketable feature or attribute a manufacturer states
as fact but that isn't a hard measured spec — see the category's own schema
doc for its Tier 2 field list.

**Source order:** (1) manufacturer official product page/spec sheet;
(2) manufacturer's own manual/manual PDF, equally authoritative, actually
opened and read; (3) manufacturer's own official press release; (4) the
category's audited-retailer list (see Scope note); (5) reputable tech press,
only when it states the fact as a directly-observed or manufacturer-attributed
spec, not a rumor/leak.

**What does not count, at any tier:** a search-engine excerpt that was never
actually opened; a tech-press article's own "reported to be" / "leaked"
framing (this is explicitly a signal to keep looking, not a source to cite);
a forum/enthusiast claim with no manufacturer or lab attribution.

### Tier 3 — Editorial / perceptual (E)

Fields whose value is a perceptual judgment no manufacturer can state
credibly about itself — see the category's own schema doc for whether it has
any Tier 3 field at all, and if so, which.

**Never** manufacturer marketing copy alone. Independent, methodology-published
measurement sources only, drawn from the category's Tier 3 source list (see
Scope note).

**Rule:** derive the label from the source's actual measured/published data
(e.g. a frequency-response curve, a scored methodology), not by copying a
reviewer's prose adjective — keeps the label consistent across products
instead of drifting with each reviewer's writing style. If a product isn't
covered by any source on the category's Tier 3 list, the field is `null`,
never inferred from marketing copy. If two sources materially disagree, the
category's Tier 3 source list states which source is primary; note the
other's reading as a low-confidence flag rather than averaging or guessing.

### Internal (I) and derived (D) fields

Not sourced by this protocol at all — see the category's own schema doc for
which fields these are and why (store-operational data, or values computed
from another field's already-cited source).

## Citation requirement

Every Tier 1/2/3 value written to `filterAttributes.*` gets a paired entry in
`filterAttributes.sourcing` (shape defined in the category's own schema doc):

```
filterAttributes.sourcing: Record<FieldName, {
  url: string;       // exact source URL
  quote: string;      // the exact phrase that produced the value
  tier: 'hard-spec' | 'marketing-fact' | 'editorial';
  sourcedAt: string;   // ISO date the citation was captured
}>
```

the exact URL, the exact quoted phrase that produced the value, the tier, and
the date the citation was captured. A later pass can then check the value
against its source without re-deriving the fact from scratch. This shape is
identical across every category — no category invents its own citation
fields.

## Missing-source convention

`null` is a last resort, not a routine outcome. Before a field is written as
null, the sourcing pass must have exhausted the tier order above for that
field — including actually opening a PDF/manual (not giving up when a
text-scrape returns nothing), checking the manufacturer's own launch press
release, and checking every source on the category's Tier 3 list where the
tier applies. A field is only left null when every applicable source in the
order has been checked and none states the value — reserved for genuinely
rare cases, not the default when the first page checked doesn't mention it.
It is still **never invented, never inferred, never a guessed default** — the
fix for "we don't have a value" is to look harder within the real tier order,
not to make one up.

**Boolean feature-absence exception:** for boolean M-tier fields that
describe a marketable feature a manufacturer would call out if present — as
opposed to a spec a manufacturer might simply omit from a given page —
silence across the manufacturer page, manual, and press release is read as
`false`, not `null`. A manufacturer that ships the feature advertises it; the
absence of any mention after checking those sources is itself the evidence,
not a gap requiring more searching. This exception does not apply to
non-boolean or non-marketable fields, where the general null-is-a-last-resort
rule above still governs.

This matches the consumption-side convention: filter-facet code treats a
null/undefined field value as "product doesn't match this filter" rather than
erroring — but that safety net exists for the rare genuine gap, not as
license to stop searching early.

## Parallel sourcing batch assignment

When sourcing is fanned out across multiple parallel batches, each batch is
assigned a disjoint slice of the product catalogue by product `_id` —
partitioned up front (e.g. sorted by `_id` and split into contiguous ranges,
or hashed into N buckets), never by field or facet. Two batches running at
once therefore never write to the same product record, so there is no
write-write race to resolve and no need for batch-level locking. A batch may
still touch multiple fields on its own assigned products, and every write it
makes carries its own citation per the requirement above.
