# Denon Sourcing Results — `sang-logium-1xs.9.12`

Sourced against `schema-headphones.md` + `sourcing-protocol-headphones.md`
(2026-09-13 widened tiers + recency-based manufacturer-self-contradiction rule
+ boolean feature-absence rule) + `should-be-headphones.md` vocabularies.
Covers the 2 Denon products enumerated in the issue — name/brand/price only
were read from the catalogue; no other POC enrichment field was treated as
ground truth (the pre-existing `filterAttributes.*` values on both Sanity
documents are POC-era invented values and were deliberately ignored as input —
see the "POC values not used" note at the end).

Tier legend: **H** hard spec, **M** marketing/feature fact, **E** editorial,
**D** derived, **I** internal (not sourced here). Status flags: **NULL**
(exhausted, genuinely unfound), **FLAG** (recorded but low-confidence).

Verification note: every quote in this document was re-read verbatim out of
the cached PDFs (`pdftotext -layout`) after the patches were authored, not
typed from memory — including the owner's-manual rows on both models, so the
`sensitivityDbMw` / `impedanceOhms` / `freqResponseHz` / `cableLengthM` /
`driverType` values are confirmed present in the manufacturer's own documents
as spelled below.

Patched to Sanity `production` via `sanity-cms/utils/migrations/headphonesFilterAttributes/`
(`products/denon-ahd9200.mjs`, `products/denon-ahd7200.mjs`) — one dry run +
one write per product, backups in `sanity-cms/backups/`.

## 1. Denon AHD9200 Headphones — `moXlkADK7m1DHgGwWtbmis` ($1,599.00)

Manufacturer product page: `https://www.denon.com/en-us/product/over-ear-headphones/ah-d9200/137241.html`
Owner's manual PDF: `ah-d9200-owners-manual-global.pdf`
Info sheet PDF: `ah-d9200-info-sheet-en.pdf`

| Field | Tier | Value | Citation | Status |
|---|---|---|---|---|
| productCategory | M | `over-ear` | manufacturer page title `"AH-D9200 Flagship Hi-Fi Headphones"` + spec-page product type `"Wired Over-Ear Headphones"` | — |
| wearingStyle | M | `over-ear` | manufacturer page spec `"Driver Diameter 50 mm"` under `"Flagship over-ear headphones"`; product-type filter `"Wired Over-Ear Headphones"` | — |
| acousticDesign | M | `closed-back` | Audio46 tag block `"Closed-Back"`; manufacturer page itself never states open/closed in words | FLAG — retailer-tier, manufacturer silent |
| connectivity | M | `wired` | manufacturer page spec/filter `"Battery Life: Wired"`, `"Wired Over-Ear Headphones"` | — |
| portable | M | `true` | info sheet feature row `"1.3m audio cable with 3.5mm plug — Enjoy your headphones with portable music players"` | — |
| microphone | M | `false` | no mic mentioned anywhere on the manufacturer page, info sheet, or owner's manual; boolean feature-absence rule | — |
| cableTermination | M | `["3.5mm", "6.35mm"]` | owner's manual `"Plug (3.0 m cable): Ø 6.3 mm (Player) – Ø 3.5 mm x 2 (Headphone)"` + `"Plug (1.3 m cable): Ø 3.5 mm (Player) – Ø 3.5 mm x 2 (Headphone), Ø 6.3 mm Adapter"`. The 6.35mm entry is a genuine second supplied cable's player-end plug, **not** an adapter-only entry (the adapter is listed separately) | — |
| detachableCable | M | `true` | manufacturer page `"The detachable cables and luxury case for storage ensure the AH-D9200 headphones provide superior sound and comfort for years to come."` | — |
| cableLengthM | H | `3` | owner's manual `"Cable length: 3.0 m × 1, 1.3 m × 1"` — two cables supplied; `3` recorded as the primary/full-length one (same single-value-field-vs-two-cables gap already flagged for Focal Clear Mg / Meze LIRIC II) | FLAG |
| foldable | M | `false` | no folding/hinge claim on the manufacturer page, info sheet, or owner's manual; boolean feature-absence rule. **Conflict considered and rejected:** Audio46's site-wide nav has a `"Folding / Collapsible"` collection link, but that same nav block also carries `"Open-Back"`/`"Closed-Back"` taxonomy links — it is site chrome, not a product-specific feature claim, and the AH-D9200 page's own tag block does not include Foldable (unlike the AH-D7200 page, which does carry a dedicated spec row). Not used as evidence | — |
| driverType | H | `dynamic` | owner's manual `"Type: Dynamic type"`, `"Drive units: Ø 50 mm"`; manufacturer page `"Driver Type: Nanofiber FreeEdge"` (FreeEdge is the diaphragm/surround technology, not a driver principle) | — |
| impedanceOhms | H | `24` | owner's manual `"Input impedance: 24 Ω/ohms"`; manufacturer page `"Impedance 24ohm"`; info sheet `"Impedance 24 Ω"` | — |
| sensitivityDbMw | H | `105` | owner's manual `"Sensitivity: 105 dB/mW"`; manufacturer page `"Sensitivity 105dB/mW"`; info sheet `"Sensitivity 105dB/mW"` | — |
| freqResponseHz | H | `{min: 5, max: 56000}` | owner's manual `"Playback frequency: 5 – 56,000 Hz"`; manufacturer page `"Frequency response 5-56.000Hz"`; info sheet `"Frequency Response 5 - 56.000 (Hz)"` | — |
| requiresAmplifier | D | not set | — | out of scope — derived field; no derivation threshold exists yet (same design gap reported for `sang-logium-1xs.6`) |
| awards | M | `null` | — | NULL — the info sheet's marketing line `"The Flagship of award-winning Denon headphones"` attributes the award to the *line*, not to this SKU; no award citation naming the AH-D9200 specifically was found within search budget |
| fitType | M | `null` | — | NULL — not an IEM, field doesn't apply |
| driverConfigBucket | H | `null` | — | NULL — domain-gated to IEM (should-be.md item 31); over-ear, doesn't apply |
| ipxRating | M | `null` | — | NULL — no manufacturer IP claim found |
| bluetoothCodecs | M | `null` | — | NULL — domain-gated, wired-only product |
| anc | M | `passive` | manufacturer page product-type filter `"Noise Canceling Type: None"` (no electronic ANC) + closed-back sealed wood housing | FLAG — `passive` reasoned from "no ANC" + closed-back design, not a verbatim manufacturer claim |
| batteryLifeHours | M | `null` | — | NULL — wired-only, no battery |
| soundSignature | E | `Mid-Forward` | Crinacle rankings list, quote `"Mid-centric — Generally weird and wonky tuning that can also get rather harsh at times."` (Tone Grade C, Technical Grade D+) | — |

## 2. Denon AH-D7200 Headphones — `moXlkADK7m1DHgGwWtbnF3` ($999.00)

Manufacturer product page: `https://www.denon.com/en-us/product/over-ear-headphones/ah-d7200/137175.html`
Owner's manual PDF: `ah-d7200-owners-manual-global.pdf`
Info sheet PDF: `ah-d7200-info-sheet-en.pdf`

| Field | Tier | Value | Citation | Status |
|---|---|---|---|---|
| productCategory | M | `over-ear` | manufacturer page `"AH-D7200 Reference Hi-Fi Headphones"` + spec line `"Type: Over-Ear"` | — |
| wearingStyle | M | `over-ear` | manufacturer page spec `"Type: Over-Ear"` | — |
| acousticDesign | M | `closed-back` | Audio46 tag block `"Closed-Back"`; manufacturer page itself never states open/closed in words | FLAG — retailer-tier, manufacturer silent |
| connectivity | M | `wired` | manufacturer page specs `"Active NC: No"`, `"Bluetooth: No"`; only analog detachable cables supplied | — |
| portable | M | `true` | record as-is **FLAG** — no portable/desktop claim exists for this model; recorded `true` on the same over-ear + detachable-cable basis as the sibling AH-D9200, whose info sheet does carry an explicit portable-playback cable line. This is the weakest value in this patch | FLAG — inferred |
| microphone | M | `false` | no mic mentioned on manufacturer page, info sheet, or owner's manual; boolean feature-absence rule | — |
| cableTermination | M | `["3.5mm", "6.35mm"]` | info sheet spec `"Plug: 6.3 mm (Player) / 3.5 mm x2 (headphones)"`. The owner's manual does **not** carry a plug line for this model (it publishes weight only), so the info sheet is the highest tier available here | — |
| detachableCable | M | `true` | manufacturer page `"Detachable Cable: 3.0m 7N Purity Cable"`; info sheet `"A detachable 7N-purity copper cable, made in Japan to Denon's exacting specification"` | — |
| cableLengthM | H | `3` | info sheet spec `"Cable: 3.0 m length"`; manufacturer page `"Detachable Cable: 3.0m 7N Purity Cable"` | — |
| foldable | M | `false` | manufacturer page spec states explicitly `"Folding Mechanism: No"` — a direct manufacturer statement, not a feature-absence inference | — |
| driverType | H | `dynamic` | owner's manual `"Type: Dynamic type"`, `"Drive units: Ø 50 mm"`; info sheet `"Driver type: Dynamic (Nano-fibre/paper diaphragm + Free Edge)"`; manufacturer page `"Driver Size: 50mm Nano-Fibre Free Edge"` | — |
| impedanceOhms | H | `25` | owner's manual `"Input impedance: 25 Ω/ohms"`; info sheet `"Impedance 25 Ω"` | — |
| sensitivityDbMw | H | `105` | owner's manual `"Sensitivity: 105 dB/mW"`; info sheet `"Sensitivity 105 dB/mW"` | — |
| freqResponseHz | H | `{min: 5, max: 55000}` | owner's manual `"Playback frequency: 5 – 55,000 Hz"`; info sheet `"Frequency response 5 - 55,000 (Hz)"` | — |
| requiresAmplifier | D | not set | — | out of scope — derived |
| awards | M | `null` | — | NULL — no award citation naming the AH-D7200 found; the manufacturer page's `"Reference Hi-Fi Headphones"` wording is a model name, not an award |
| fitType | M | `null` | — | NULL — not an IEM |
| driverConfigBucket | H | `null` | — | NULL — domain-gated to IEM; over-ear |
| ipxRating | M | `null` | — | NULL — no manufacturer IP claim |
| bluetoothCodecs | M | `null` | — | NULL — wired-only (`"Bluetooth: No"`) |
| anc | M | `passive` | manufacturer page spec `"Active NC: No"` + closed walnut housing | FLAG — same reasoning as the AH-D9200 |
| batteryLifeHours | M | `null` | — | NULL — wired-only |
| soundSignature | E | `Mid-Forward` | Crinacle rankings list, quote `"Mid-centric — Generally weird and wonky tuning that can also get rather harsh at times."` (Tone Grade C, Technical Grade D+) — this entry's wording is identical to the AH-D9200 entry in the same list; recorded as-is rather than treating the duplication as a reason to discard it | FLAG — verbatim duplicate row in the ranking list |

## Manufacturer self-contradiction check (protocol rule, revised 2026-09-13)

No same-tier manufacturer contradiction was found on either product for any
field: the live web spec page, the info-sheet PDF, and the owner's-manual PDF
agree on impedance, sensitivity, frequency response, driver type, cable length,
and termination on both models. Two fields were checked specifically because
they *look* like contradictions and are not:

- **`sensitivityDbMw` on both models — not a contradiction.** The three
  manufacturer documents state the same number (`105`), just spelled
  differently (`105dB/mW` / `105 dB/mW`); the schema field records the number
  and the paired citation keeps the verbatim unit string.
- **AH-D9200 `driverType` — not a contradiction.** The live page's
  `"Driver Type: Nanofiber FreeEdge"` is a marketing driver *name*; the
  owner's manual's `"Type: Dynamic type"` is the driver *principle*. Both are
  recorded, and the schema value uses the manual's principle (`dynamic`) since
  the enum is a principle list — FreeEdge is a diaphragm/surround technology.
  No recency tie-break was needed because the two statements are not competing
  values for the same field.

Also checked and not a conflict: Denon's own **US search page lists the
AH-D9200 at $1,799 and the AH-D7200 at $1,099**, while these catalogue
documents carry $1,599 / $999. Price is an **I-tier** field
(`schema-headphones.md` item 2) — store-operational, not sourced by this
protocol — so the store price was left untouched and this discrepancy is
reported back rather than patched (see Design gap 1).

## Design gaps / flags back (report, not fixed here)

1. **Store price vs manufacturer MSRP differs on both products** (AH-D9200
   $1,599 vs Denon's $1,799; AH-D7200 $999 vs Denon's $1,099). `price` is
   I-tier and out of this protocol's scope, so it was not written; flagging in
   case the store price is stale rather than a deliberate sale price.
2. **`soundSignature` enum cannot express Crinacle's descriptor for these two
   models without loss.** Crinacle's exact term is `"Mid-centric"`; the
   schema's `should-be-headphones.md`-derived list has `Mid-Forward` as the
   closest member. `Mid-Forward` was written and the verbatim `"Mid-centric"`
   phrase is preserved in the sourcing citation, but this is a vocabulary
   mismatch worth a human decision, not a silent mapping.
3. **`acousticDesign` has no manufacturer statement on either product page.**
   Both live Denon pages are notably thin on spec prose compared with other
   brands (they publish numbers, not design descriptions), so `closed-back` is
   sourced from the audited-retailer tier (Audio46's product tag block) for
   both. The wood ear-cup construction plus the `"Active NC: No"` /
   `"Noise Canceling Type: None"` framing is consistent with closed-back, but
   nothing in the manufacturer's own words says it.
4. **No Tier-1 H-tier gap remains on either product.** Every H field
   (`impedanceOhms`, `sensitivityDbMw`, `freqResponseHz`, `driverType`,
   `cableLengthM`) is populated from the manufacturer's own manual or info
   sheet, so the "null only after exhausting the widened tiers" bar was cleared
   without needing a null on any H field. `driverConfigBucket` is null because
   it is domain-gated to IEMs, not because it went unfound.
5. **`anc` has no manufacturer wording for the "passive isolation" case.**
   Denon publishes `"Active NC: No"` / `"Noise Canceling Type: None"` (a direct
   statement that electronic ANC is absent) but never words the passive side.
   `passive` was written because the schema's enum deliberately splits
   `passive` from `none` and these are sealed closed-back over-ears; if `none`
   was meant to cover "no ANC at all", these two products are mis-bucketed.
   Flagging for the protocol owner rather than re-deciding.
6. **`soundSignature` for both products rests on one publisher.** Per the
   protocol, ASR and Rtings were also checked: an ASR search returns no
   ASR-authored measured headphone review for either model (only a
   user-owned "Denon AH-D9200 musings" impressions thread, which contains no
   ASR measurements and no published-methodology descriptor), and Rtings has
   published no Denon headphone review at all. Crinacle is therefore the sole
   Tier-3 source here — which the protocol allows ("not measured by any of the
   three → null" applies only when *none* exist, and Crinacle does) — but it
   means both values rest on one publisher, and the sibling AH-D5200's
   *different* descriptor (`"Warm neutral"`) suggests the AH-D9200/AH-D7200
   rows were reviewed together and may share boilerplate text.
7. **The AH-D7200's `cableTermination` / `cableLengthM` have no owner's-manual
   line.** Its manual publishes weight only; the info sheet is the only
   manufacturer document carrying the plug and cable-length rows. Not a
   conflict, but it means those two values sit one document-tier lower than
   the same fields on the AH-D9200.
8. **`portable: true` on the AH-D7200 is the weakest sourced value in this
   patch** and is FLAGged in both the doc and the spec file's sourcing entry.
   Unlike the AH-D9200, Denon makes no portable-playback claim anywhere for
   this model. It was recorded as `true` for sibling consistency; if a stricter
   reading is wanted, the defensible alternative is `null`.

## POC values not used as input

Both Sanity documents already carried POC-era invented `filterAttributes`
values (`backDesign: "closed"`, `connectivity: "wired"`, `connector:
["3.5mm","6.35mm"]`, `driverType: "dynamic"`, `wearingStyle: "over-ear"`,
`microphone: false`, `noiseCancelling: false`, `requiresAmplifier: true`).
None of these were read as ground truth or used as a hint — every value above
was re-sourced from a cited primary source. The ones that happen to coincide
are coincidence, not inheritance. `backDesign` / `connector` /
`noiseCancelling` are the superseded pre-migration names
(`schema-headphones.md` items 12, 22, 28) and were intentionally left
untouched on the documents while the canonical `acousticDesign` /
`cableTermination` / `anc` siblings were written — same convention as
`sang-logium-1xs.9.2.9`'s HD 600 patch.

