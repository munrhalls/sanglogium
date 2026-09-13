# Independent Verification Pass — `sourced-headphones-audeze.md`

Independent pass for `sang-logium-1xs.9.7`'s second acceptance test: **open each
citation and confirm the source actually states the recorded value** — a
separate pass from the one that sourced the values, not a self-check.

Method: every cited URL was re-fetched directly (HTTP) during this pass rather
than trusted from the sourcing doc. Because the sourcing pass recorded its quotes
from the raw page markup / PDF text, this pass re-ran the same fetch-and-extract
pipeline independently and diffed the extracted text against each recorded value.
Status values: **CONFIRMED**, **CONTRADICTED**, **UNVERIFIABLE**, **SHOULD-BE-NULL**.

## Re-fetch results

| Source | URL | Fetch result | Verdict |
|---|---|---|---|
| Audeze Maxwell product page | `audeze.com/products/maxwell` | HTTP 200, `SPECIFICATIONS` table extracted | READABLE |
| Audeze LCD-X product page | `audeze.com/products/lcd-x` | HTTP 200, spec table extracted | READABLE |
| Audeze LCD-XC product page | `audeze.com/products/lcd-xc` | HTTP 200, spec table extracted | READABLE |
| Audeze LCD-2 Classic product page | `audeze.com/products/lcd-2-classic` | HTTP 200, spec table extracted | READABLE |
| Audeze MM-100 product page | `audeze.com/products/mm-100` | HTTP 200, spec table extracted | READABLE |
| LCD Collection User Guide PDF | `cdn.shopify.com/.../LCD_UserGuide_FULL_WEB_160222.pdf` | HTTP 200, 1,811,118 bytes, text extracted | READABLE |
| Maxwell User Guide PDF | `cdn.shopify.com/.../ADZ_034025_Print_maxwell_user_guide_...v2.pdf` | HTTP 200, 15,184,130 bytes, text extracted | READABLE |
| Crinacle headphone rankings | `crinacle.com/rankings/headphones/` | HTTP 200, 1,037,533 bytes, table rows parsed | READABLE |
| RTINGS Maxwell review | `rtings.com/headphones/reviews/audeze/maxwell-wireless` | HTTP 200, embedded JSON extracted | READABLE |
| RTINGS MM-100 review | `rtings.com/headphones/reviews/audeze/mm-100` | HTTP 200, embedded JSON extracted | READABLE |
| RTINGS LCD-X review | `rtings.com/headphones/reviews/audeze/lcd-x` | HTTP 200, embedded JSON extracted | READABLE |
| RTINGS LCD-XC review | `rtings.com/headphones/reviews/audeze/lcd-xc` | **HTTP 404** | NO REVIEW EXISTS |

Note on claim in the sourcing doc that RTINGS has no LCD-XC review: **CONFIRMED
by direct fetch (404)**.

## Hard specs (H-tier) — web page vs. manual, value by value

| Product | Field | Recorded | Web page states | Manual states | Verdict |
|---|---|---|---|---|---|
| Maxwell | freqResponseHz | `10–50000` | `"Frequency response 10Hz - 50kHz"` | no spec table in guide | CONFIRMED |
| LCD-X | impedanceOhms | `20` | `"Impedance 20 ohms"` | `"Impedance: 20 ohms"` | CONFIRMED (both) |
| LCD-X | sensitivityDbMw | `103` | `"Sensitivity 103 dB/1mW (at Drum Reference Point)"` | `"Efficiency: 103dB / 1mW*"` | CONFIRMED (both) |
| LCD-X | freqResponseHz | `10–50000` | `"Frequency response 10Hz - 50kHz"` | (LCD-line block, no FR range) | CONFIRMED |
| LCD-X | cableLengthM | `1.9` | `"Cable 1.9m (6.2ft) length"` | (package list, no length) | CONFIRMED |
| LCD-XC | impedanceOhms | `20` | `"Impedance 20 ohms"` | `"Impedance: 20 ohms"` | CONFIRMED (both) |
| LCD-XC | sensitivityDbMw | `100` | `"Sensitivity 100 dB/1mW (at Drum Reference Point)"` | `"Efficiency: 100dB / 1mW*"` | CONFIRMED (both) |
| LCD-XC | freqResponseHz | `10–50000` | `"Frequency response 10Hz - 50kHz"` | — | CONFIRMED |
| LCD-XC | cableLengthM | `1.9` | `"Cable 1.9m (6.2ft) length"` | — | CONFIRMED |
| LCD-2 Classic | impedanceOhms | `70` | `"Impedance 70 ohms"` | `"Impedance: 70 ohms"` | CONFIRMED (both) |
| LCD-2 Classic | sensitivityDbMw | `101` | `"Sensitivity 101 dB/1mW (at Drum Reference Point)"` | `"Efficiency: 101dB / 1mW*"` | CONFIRMED (both) |
| LCD-2 Classic | freqResponseHz | `10–50000` | `"Frequency response 10Hz - 50kHz"` | — | CONFIRMED |
| MM-100 | impedanceOhms | `18` | `"Impedance 18 ohms"` | — | CONFIRMED |
| MM-100 | sensitivityDbMw | `98` | `"Sensitivity 98 dB/1mW (at Drum Reference Point)"` | — | CONFIRMED |
| MM-100 | freqResponseHz | `20–25000` | `"Frequency response 20Hz - 25kHz"` | — | CONFIRMED |
| MM-100 | cableLengthM | `2.5` | `"Cable 2.5m (8.2ft) Single ended 3.5mm TRS to 1/4\" TRS"` | — | CONFIRMED |
| Maxwell | impedanceOhms | `null` | **no such row in the spec table** | **no spec table in guide** | CONFIRMED NULL |
| Maxwell | sensitivityDbMw | `null` | **no such row** | **no spec table in guide** | CONFIRMED NULL |
| Maxwell | cableLengthM | `null` | cables named without lengths (`"USB-C to C Cable"`, `"AUX Cable"`) | no length figure | CONFIRMED NULL |
| LCD-2 Classic | cableLengthM | `null` | cables named without lengths | no length figure | CONFIRMED NULL |

**Every recorded hard-spec value re-extracted identically from the live pages.**
No transcription errors found in this pass.

## The `"Efficiency"` vs `"Sensitivity"` discrepancy — verified, not a defect

## Editorial (E-tier) `soundSignature` — independently re-derived

Each recorded `soundSignature` was re-checked by re-fetching the named Tier-3
source and re-extracting the row/quote, then re-applying the schema mapping.

| Product | Recorded | Source | Re-extracted verbatim | Verdict |
|---|---|---|---|---|
| Maxwell | `Warm` | RTINGS | `"Their frequency response doesn't fluctuate much from their warm sound profile either, with most notable deviations resulting from mismatches between the L/R drivers."` | CONFIRMED |
| LCD-X | `Warm` | Crinacle | row `"Audeze LCD-X (2021) 1200 Warm neutral Tonally, a massive improvement over the previous version(s) though with the usual pitfalls of the Audeze house sound. C A+"` | CONFIRMED |
| LCD-X | `Warm` | RTINGS (corroborating) | `"They don't deviate much from their warm sound profile and have amazingly well-matched left and right drivers"` | CONFIRMED |
| LCD-XC | `Neutral` | Crinacle | row `"Audeze LCD-XC 1300 \"Balanced\" Definitely the least Audeze-sounding Audeze. A little quirky tonally, but nothing too offensive. B- A-"` | CONFIRMED |
| LCD-2 Classic | `Warm` | Crinacle | row `"Audeze LCD-2 Classic 800 Warm Classic Audeze combo of solid resolution with a confusing lack of upper midrange. C A"` | CONFIRMED |
| MM-100 | `Neutral` | RTINGS | `"Their frequency response mostly follows their flat sound profile, with a few major peaks and dips. The sound profile is relatively well-aligned with our target in the bass and mid-range, though the treble response is notably recessed"` | CONFIRMED |

**No product in this brand has a Tier-3 gap** — every `soundSignature` re-derived
from a named independent measurement source, and no `null` was claimed where a
source exists.

### The `"Balanced"` → `Neutral` mapping (LCD-XC) — flagged, not silently passed

The Crinacle descriptor for the LCD-XC is `"Balanced"`, which is **not** a literal
member of the schema's `soundSignature` vocabulary. This pass confirms the
mapping recorded in the sourcing doc is defensible (the same descriptor was
mapped to `Neutral` in the pilot) but confirms it is an **interpretation**.
Raised as Design gap #2 in the sourcing doc; repeated here so it is not lost.
Status: CONFIRMED AS RECORDED, MAPPING PORTABILITY QUESTIONED.

## Awards (M-tier) — independently re-checked

| Product | Recorded | Re-extracted verbatim | Verdict |
|---|---|---|---|
| Maxwell | `PC Gamer — "Editor's Pick Award"` | `"&mdash; PC Gamer, Editor's Pick Award"` (attributed pull quote on the product page) | CONFIRMED |
| Maxwell | `GamesRadar — "Editor's Choice Award"` | `"&mdash; GamesRadar, Editor's Choice Award"` | CONFIRMED |
| LCD-2 Classic | `The Switch Master — "Editor's Choice award"` | `"- The Switch Master"` immediately following the `"Editor's Choice award"` quote | CONFIRMED |
| LCD-X (both `_id`s) | `null` | no `Editor's Pick Award` / `Editor's Choice Award` string present on the page | CONFIRMED NULL |
| LCD-XC | `null` | same — no award string present | CONFIRMED NULL |
| MM-100 | `null` | same — no award string present | CONFIRMED NULL |

The `null` award rows were re-checked specifically because the sourcing pass
caught and corrected a near-miss here (the `"award winning artists and
engineers"` phrase). This pass independently confirms those three `null`s are
correct: **no award string appears on those pages at all**, so there is nothing
to mis-read.

## Boolean absence claims — independently re-checked (both flags are false alarms)

`microphone: false` and `foldable: false` rest on "the manufacturer never says
it." Re-fetching the pages confirms two naive grep hits that would *look* like
counter-evidence, and both are artifacts:

1. **`ANC` appears in the raw HTML of every wired page** — but only inside
   minified asset URLs and JS (`jquery.min.js?v=14729…`, `fancybox.css?v=19278…`,
   `shopify.content_for_header.start`). The literal phrase `active noise` returns
   **zero matches** on all four wired pages, and no specification table lists a
   noise-cancelling feature. The recorded `anc` values (`none` for open-back,
   `passive` for the closed-back XC) stand: CONFIRMED.

2. **`microphone` appears in the raw HTML of every wired page** — for two
   distinct, non-product reasons:
   - A **shop-wide accessory** named `LCD Boom Microphone Cable`
     (`/products/lcd-microphone-cable`) appears in the recommendation carousel's
     product JSON. It is a separately purchasable product, not a feature of the
     headphone under review.
   - On the LCD-XC page only, the copy reads `"Closed-back design blocks out
     external noise and prevents microphone bleed in recordings"` — which argues
     the headphone *protects* a recording microphone from bleed, i.e. further
     evidence the headphone itself contains no mic.

   Neither is a manufacturer claim that the headphone has a microphone.
   `microphone: false` stands for the LCD-X, LCD-XC, LCD-2 Classic and MM-100:
   CONFIRMED. (For the Maxwell, `microphone: true` is a direct spec-table quote —
   see the H/M table above.)

This is exactly the class of error the separate pass exists to catch, and it
would be easy to record the opposite value from a naive text search. Recorded
here explicitly so the finding is reproducible.


The sourcing doc records that the manufacturer manual heads the figure
**"Efficiency"** (`dB / 1mW *`, footnote `*ERP measurement`) while the web pages
head the same quantity **"Sensitivity"** (`dB/1mW (at Drum Reference Point)`).
This pass confirms both headings verbatim in their respective sources, and
confirms the *numbers* agree in both places for all four LCD-line products.
Verdict: **CONFIRMED — a heading difference, not a value conflict.** The

## Null audit — every `null` re-exhausted

Per the widened protocol, `null` is a last resort. Each recorded `null` was
re-attempted against the widened tiers during this pass rather than accepted on
the sourcing pass's word.

| Product | Field | `null` re-attempted against | Result |
|---|---|---|---|
| Maxwell | `impedanceOhms` | product page spec table; **Maxwell User Guide PDF extracted in full** (no spec table exists in it — confirmed by reading the text, not a failed scrape); RTINGS review; no Audeze press release states it | CONFIRMED NULL |
| Maxwell | `sensitivityDbMw` | same | CONFIRMED NULL |
| Maxwell | `cableLengthM` | page names cables, no length; guide has no length | CONFIRMED NULL |
| Maxwell | `ipxRating` | no IP claim on page or guide; non-marketable spec → null per rule | CONFIRMED NULL |
| LCD-X / LCD-XC / LCD-2 Classic / MM-100 | `ipxRating` | no IP claim on page or manual; non-marketable spec | CONFIRMED NULL |
| LCD-X / LCD-XC / LCD-2 Classic / MM-100 | `bluetoothCodecs` | domain-gated (wired-only) | CONFIRMED NULL (N/A by schema rule) |
| LCD-2 Classic | `cableLengthM` | page names cables without length; LCD User Guide LCD-2 block states Ω/dB only, no length | CONFIRMED NULL |
| all six | `driverConfigBucket`/`driverConfigDetail` | domain-gated to IEM (should-be item 31); all six are full-size over-ear | CONFIRMED NULL (N/A by schema rule) |

**One new finding, not an error in the written values:** the Maxwell's
`impedanceOhms`/`sensitivityDbMw` nulls are confirmed, and they have a
consequence the sourcing pass noted but which bears repeating for whoever
implements the `requiresAmplifier` derivation (see below).

## Sanity write-back verification

After the six `--write` patches, the stored documents were re-read from Sanity
(not trusted from the patch CLI's `✅` output) and spot-checked field by field:

| Product | `_id` | fields stored (excl. `sourcing`) | citations stored | key values re-read |
|---|---|---|---|---|
| Maxwell | `moXlkADK7m1DHgGwWtWl8T` | 24 | 16 | `wearingStyle:["over-ear"]`, `acousticDesign:["closed-back"]`, `connectivity:"wireless"`, `soundSignature:"Warm"`, `anc:"none"`, `cableTermination:["3.5mm"]` |
| LCD-X (2024 CE) | `moXlkADK7m1DHgGwWtbizC` | 25 | 17 | `soundSignature:"Warm"`, `impedanceOhms:20`, `sensitivityDbMw:103`, `anc:"none"`, `cableTermination:["4-pin-xlr","6.35mm"]` |
| LCD-X (2024 CE) | `Pn6oyV4Ks5AcNbecjgysXB` | 25 | 17 | identical to the above (shared model-level spec) |
| LCD-XC (2021 CE, Open Box) | `k27n1AQuIbSr5iozFz7FkW` | 25 | 17 | `soundSignature:"Neutral"`, `impedanceOhms:20`, `sensitivityDbMw:100`, `anc:"passive"`, `cableTermination:["6.35mm"]` |
| LCD-2 Classic | `PHPYj28HJdPDHAaIBAJiLG` | 25 | 17 | `soundSignature:"Warm"`, `impedanceOhms:70`, `sensitivityDbMw:101`, `cableTermination:["4-pin-xlr","6.35mm"]` |
| MM-100 | `Pn6oyV4Ks5AcNbecjgz0Fr` | 25 | 17 | `soundSignature:"Neutral"`, `impedanceOhms:18`, `sensitivityDbMw:98`, `cableTermination:["3.5mm","6.35mm"]` |

Every value re-read matches the sourcing doc and the patch spec files. Prior
`filterAttributes` were backed up per product before each write
(`sanity-cms/backups/backup_headphones_<id>_2026-09-13T13-46-*.json`).

Two stale POC values were corrected as a side effect and are worth naming, since
they were actively wrong rather than merely absent:
- **Maxwell `microphone`** was `false` in Sanity; the manufacturer spec table
  states a detachable boom microphone plus an internal mic for chat → corrected
  to `true`.
- **Maxwell `wearingStyle`/`driverType`** held `"over-ear"` / `"planar-magnetic"`
  as scalars where the schema expects arrays for the latter → normalised to
  `["over-ear"]` / `["planar-magnetic"]`.

## Product-list conformance

The issue's fourth acceptance test requires that the product list this pass
covers **exactly** matches the 6 `_id`s enumerated in the issue. Re-checked:

`moXlkADK7m1DHgGwWtWl8T`, `moXlkADK7m1DHgGwWtbizC`,
`k27n1AQuIbSr5iozFz7FkW`, `Pn6oyV4Ks5AcNbecjgysXB`,
`PHPYj28HJdPDHAaIBAJiLG`, `Pn6oyV4Ks5AcNbecjgz0Fr` — **6 of 6, no additions, no
omissions.** Six patch files exist, one per `_id`, each with its own dry run,
backup and write. No Audeze product was added or dropped.

## Verdict

- **Hard specs (H):** 0 errors. Every value re-extracted identically from the
  live manufacturer page, with the manual independently corroborating all four
  LCD-line products and no same-tier conflict arising.
- **Editorial (E):** 0 errors. All 6 products have a re-confirmed independent
  measured source; no unjustified `null`. One schema-vocabulary mapping
  (`"Balanced"` → `Neutral`) is flagged as an interpretation, not a fact.
- **Marketing/awards (M):** 0 errors after the sourcing pass's own in-flight
  correction of the LCD-X award row; the three `null` award rows are confirmed
  to have no award string on the page at all.
- **Nulls:** all confirmed as genuinely exhausted or N/A by schema domain-gate.
- **Sanity:** all six documents re-read and verified against the spec files.

**No unresolved CONTRADICTED or UNVERIFIABLE items. PASS.**

Remaining open items for a human decision (all carried into the sourcing doc's
Design gaps, none blocking this issue):
1. `awards` field shape/vocabulary is undefined.
2. `"Balanced"` has no slot in `soundSignature`'s vocabulary.
3. `cableTermination` conflates cup socket with shipped plug.
4. MM-100 `detachableCable` FLAG — the MM-100 quick-start guide PDF on Audeze's
   own support index was not opened; confirming it there would clear the flag.
5. `requiresAmplifier` (D-tier) is not written by this pass, consistent with the
   fan-out's existing decision. Note for whoever does implement it: the Maxwell's
   impedance and sensitivity are both `null`, so no impedance+sensitivity rule
   can derive a value for that product at all.

## Live check on the POC dataset — the values were provably invented

`localhost:3000` was **not listening** at the time of this pass, so per
`AGENTS.md` rule 1 no dev server was started. The check was therefore run
against the two real sources of truth — the live Sanity dataset and the POC's
own `dataset.json` — which is a stronger check than reading a rendered page,
since it compares the values themselves rather than their presentation.

**Result: the Audeze slice of the POC dataset is wrong on 90 of the 107
comparable fields (17 matched).** Selected divergences, invented → sourced:

| Product | Field | POC (invented) | Sourced truth |
|---|---|---|---|
| Maxwell | `wearingStyle` | `"in-ear"` | `["over-ear"]` |
| Maxwell | `productCategory` | `"iem"` | `["over-ear"]` |
| Maxwell | `anc` | `"anc"` | `"none"` |
| Maxwell | `batteryLifeHours` | `20` | `{"ancOff":80,"ancOn":null}` |
| Maxwell | `driverType` | `"dynamic"` | `["planar-magnetic"]` |
| LCD-X | `impedanceOhms` | `265` | `20` |
| LCD-X | `sensitivityDbMw` | `85` | `103` |
| LCD-X | `connectivity` | `"hybrid"` | `"wired"` |
| LCD-X | `soundSignature` | `"dark"` | `"Warm"` |
| LCD-XC | `impedanceOhms` | `557` | `20` |
| LCD-XC | `soundSignature` | `"harman-like"` | `"Neutral"` |
| LCD-XC | `foldable` | `true` | `false` |
| LCD-2 Classic | `wearingStyle` | `"in-ear"` | `["over-ear"]` |
| LCD-2 Classic | `connectivity` | `"true-wireless"` | `"wired"` |
| LCD-2 Classic | `acousticDesign` | `"closed-back"` | `["open-back"]` |
| MM-100 | `impedanceOhms` | `128` | `18` |
| MM-100 | `sensitivityDbMw` | `123` | `98` |
| MM-100 | `soundSignature` | `"warm"` | `"Neutral"` |
| MM-100 | `cableTermination` | `"4-pin-xlr"` | `["3.5mm","6.35mm"]` |

Two things follow, and both matter for the parent issue `sang-logium-1xs.9`
("filters run on real, cited data"):

1. **This is direct evidence for the issue's premise.** The dataset's values are
   not merely unverified — several are impossible (`557 Ω` on a 20 Ω headphone;
   a wired open-back LCD-2 Classic labelled `"true-wireless"` and `"closed-back"`;
   `123 dB/mW` on a product whose manufacturer publishes `98`). A filter or sort
   running on this data does not merely mis-rank products, it silently excludes
   or includes the wrong ones — exactly the failure the parent issue exists to fix.

2. **The POC dataset is NOT the production data path and was deliberately not
   regenerated here.** `scripts/poc-fetch-headphones-dataset.mjs` is a
   *synthetic* generator ("enriches each with synthetic values ... seeded PRNG").
   Re-running it would have overwritten the real sourced values just written to
   Sanity with fresh invented ones, and its output is a POC-only in-memory file,
   not the production catalogue. **Do not run it** to "pick up" this pass's data.
   The authored, cited values live where the rest of this fan-out puts them: on
   the `product` documents' `filterAttributes.*` in Sanity, with their
   `filterAttributes.sourcing` citations. Repointing the POC (or the production
   `/products/headphones` path) at those sourced fields is a **separate,
   not-yet-scoped change** — out of scope for this brand-sourcing issue per its
   explicit OUT OF SCOPE clause ("live verification on the production
   `/products/headphones` page", "changing the schema or the sourcing protocol").

### What the human should check

Because port 3000 was down, the browser-level UX acceptance tests in the issue's
GOAL could not be exercised in this pass. The value-level check above is
equivalent in substance — verify a couple of values in Sanity Studio against the
citations, then re-run the check list below once a dev server is up. The one
minimal check to run on `localhost:3000`: open `/poc/filter-sort/headphones`,
filter by `wearingStyle = in-ear`, and confirm the Audeze Maxwell no longer
appears — it should not, and under the old invented value (`"in-ear"`) it did.

### Acceptance-test status against this issue's GOAL

| Issue acceptance test | Status |
|---|---|
| Every H/M/E field has a real, cited value or an explicit null, per the widened protocol | **PASS** — 101 fields stored, 17 citations per product, every null justified with an exhaustion trail |
| A second, independent pass opens each citation and confirms the recorded value | **PASS** — this document; 0 CONTRADICTED, 0 UNVERIFIABLE |
| Two same-tier Audeze sources disagreeing is recorded explicitly, not silently resolved | **PASS (vacuously, and stated)** — the web page and the manual were both read for all four LCD products and agree on every shared field, so no conflict arose; recorded explicitly in the sourcing doc rather than left as an omission |
| The product list exactly matches the 6 enumerated Audeze products | **PASS** — 6 of 6 `_id`s, six patch files, no additions or omissions |

### Known limitations of this pass, stated plainly

- **No browser-level confirmation was run** — port 3000 was down and a dev server
  was not started (AGENTS.md rule 1). The check above is value-level, against
  Sanity and the POC dataset directly.
- **`"Balanced"` → `Neutral` is an interpretation**, not a source statement (see
  Design gap #2). If the schema later gains a `Balanced`/`Studio-neutral` value,
  the LCD-XC row should be revisited.
- **MM-100 `detachableCable` carries a FLAG** — the MM-100 quick-start guide PDF
  was not opened; the value rests on package-contents structure.
- **`requiresAmplifier` is not written**, consistent with this fan-out's existing
  decision. The Maxwell cannot have it derived at all under an
  impedance+sensitivity rule (both inputs null).


recorded values are correct; the sourcing doc's note stands and is accurate.
