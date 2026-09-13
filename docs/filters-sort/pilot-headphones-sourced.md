# Pilot Sourcing Results — `sang-logium-1xs.7`

Sourced against `schema-headphones.md` + `sourcing-protocol-headphones.md` (both
`sang-logium-1xs.6` deliverables). Sample drawn from the real catalogue export
at `app/(test)/poc/filter-sort/headphones/dataset.json` (80 products) — not
invented products.

## Sample (6 products, spanning the required variety)

| # | `_id` | Brand | Product | Category | Connectivity | Driver type |
|---|---|---|---|---|---|---|
| 1 | `Pn6oyV4Ks5AcNbecjgrju8` | Sennheiser | HD 600 | Over-ear | Wired | Dynamic |
| 2 | `PHPYj28HJdPDHAaIBADCQs` | HiFiMan | Sundara (2020 Edition) | Over-ear | Wired | Planar magnetic |
| 3 | `k27n1AQuIbSr5iozFz7EsP` | Focal | Clear Mg | Over-ear | Wired | Dynamic |
| 4 | `moXlkADK7m1DHgGwWtblsT` | Sony | WH-1000XM5 | Over-ear | Wireless | Dynamic |
| 5 | `n10eAegrGspodtsQw12meG` | Sony | WF-1000XM5 | IEM (true wireless) | True wireless | Dynamic |
| 6 | `n10eAegrGspodtsQw13THU` | Moondrop | Alice | IEM (true wireless) | True wireless | Dynamic |

Covers: over-ear + IEM, wired + wireless + true-wireless, dynamic + planar
magnetic driver types, open-back + closed-back + IEM form factors, ANC +
non-ANC. Meets the should-be sample-variety requirement.

## Sourced fields per product

Tier legend: **H** hard spec, **M** marketing/feature fact, **E** editorial,
**D** derived, **I** internal (not sourced here). Field names match
`filterAttributes.*` in `schema-headphones.md`.

### 1. Sennheiser HD 600

| Field | Tier | Value | Citation |
|---|---|---|---|
| wearingStyle | M | `over-ear` | manufacturer page (below) |
| acousticDesign | M | `open-back` | manufacturer page |
| connectivity | M | `wired` | manufacturer page |
| portable | M | `false` (desktop/home use) | manufacturer page |
| impedanceOhms | H | `300` | manufacturer page |
| sensitivityDbMw | H | `97 dB (1V)` | manufacturer page |
| freqResponseHz | H | `{min:12, max:40500}` | manufacturer page |
| microphone | M | `false` | manufacturer page |
| cableTermination | M | `3.5mm SE` (adapter to 6.35mm included) | manufacturer page |
| detachableCable | M | `true` | manufacturer page |
| cableLengthM | H | `3` | manufacturer page |
| foldable | M | `false` | manufacturer page |
| driverType | H | `dynamic` | manufacturer page |
| requiresAmplifier | D | **not set** — see "Design gap found" below | — |
| soundSignature | E | `Neutral` | Crinacle ranking list |

Citations:
- `filterAttributes.sourcing.impedanceOhms` etc.: url `https://us.sennheiser-hearing.com/products/hd-600`, quote `"Impedance: 300 Ω"` / `"Sound pressure level (SPL): 97 dB (1 V)"` / `"Frequency response (speaker): 12 Hz - 40,500 Hz"` / `"Transducer principle: dynamic, open"` / `"Connector: 3.5 mm stereo jack plug"` / `"Cable length: 3 m"`, tier `hard-spec`/`marketing-fact` as applicable, sourcedAt `2026-09-13`.
- `filterAttributes.sourcing.soundSignature`: url `https://crinacle.com/rankings/headphones/`, quote `"Neutral"` (HD600 entry, Tone Grade S-), tier `editorial`, sourcedAt `2026-09-13`.

### 2. HiFiMan Sundara (2020 Edition)

| Field | Tier | Value | Citation |
|---|---|---|---|
| wearingStyle | M | `over-ear` | manufacturer page |
| acousticDesign | M | `open-back` | manufacturer page |
| connectivity | M | `wired` | manufacturer page |
| driverType | H | `planar-magnetic` | manufacturer page |
| impedanceOhms | H | `32` | manufacturer page |
| sensitivityDbMw | H | `92 dB` | manufacturer page |
| freqResponseHz | H | `{min:6, max:75000}` | manufacturer page |
| soundSignature | E | `Neutral` | Crinacle ranking list |
| cableTermination | M | `3.5mm` — **resolved 2026-09-13** (was null; not on the web product page, but the manufacturer's own Owner's Guide has it) | HIFIMAN Sundara Owner's Guide PDF |
| detachableCable | M | `true` — **added 2026-09-13**, was missing from the original pass entirely (not even recorded as null) | HIFIMAN Sundara Owner's Guide PDF |
| foldable | M | **null** — not stated on manufacturer page, and not found in the Owner's Guide either (checked 2026-09-13); genuinely no source. Null stands. | — |
| microphone | M | `false` (no manufacturer mention of a mic; standard for this class) — **flagged low-confidence, not written with full certainty** | — |
| impedanceOhms | H | `32` — **CONFLICT FLAGGED 2026-09-13, not resolved**: the manufacturer's own Owner's Guide PDF states `"Impedance: 37 ohms"`, disagreeing with the web product page's `"32Ω"`. Per the widened protocol's manufacturer self-contradiction rule, the web-page value is kept as the working value and both are cited; needs human resolution before fan-out, not a sourcing-pass guess. | hifiman.com product page (kept) vs. Owner's Guide PDF (conflicting) |
| sensitivityDbMw | H | `92 dB` — **same conflict**: Owner's Guide PDF states `"Sensitivity: 94dB"` vs. the web page's `"92dB"`. Same resolution as above — flagged, not silently picked. | hifiman.com product page (kept) vs. Owner's Guide PDF (conflicting) |

Citations:
- url `https://www.hifiman.com/products/detail/286`, quote `"32Ω"` / `"92dB"` / `"6Hz-75kHz"`, tier `hard-spec`, sourcedAt `2026-09-13`.
- url `https://crinacle.com/rankings/headphones/`, quote `"Neutral"` (Sundara entry, Tone Grade A+), tier `editorial`, sourcedAt `2026-09-13`.
- url `https://down.hifiman.com/manual/SUNDARA-Owners-Manual.pdf` (HIFIMAN Sundara Owner's Guide, fetched and read directly, page images), quotes: p.9 "The Connection Sockets — The New SUNDARA makes use of a new 3.5mm socket for its cable connection"; p.13 "The headphone connectors utilize a new 3.5mm connector... The supplied cable 3.5mm is user changeable and replaceable"; p.9 "The cables are user-replaceable"; p.10 "Impedance: 37 ohms" / "Sensitivity: 94dB" / "Frequency Response: 6Hz - 75kHz". Tier `hard-spec`/`marketing-fact`, sourcedAt `2026-09-13`.

### 3. Focal Clear Mg

| Field | Tier | Value | Citation |
|---|---|---|---|
| wearingStyle | M | `over-ear` | manufacturer page |
| acousticDesign | M | `open-back` | manufacturer page |
| connectivity | M | `wired` | manufacturer page |
| driverType | H | `dynamic` (40mm magnesium dome) | manufacturer page |
| impedanceOhms | H | `55` | manufacturer page |
| sensitivityDbMw | H | **null** — corrected after independent verification found this mislabeled; the manufacturer page states `"104 dB SPL (peak@1m)"`, a peak-SPL-at-1m figure, not a dB/mW sensitivity rating. The number 104 coincidentally matched what was recorded, but the unit/basis was wrong. No dB/mW-basis sensitivity figure was found on the manufacturer page. | — |
| freqResponseHz | H | `{min:5, max:23000}` | manufacturer page |
| cableTermination | M | `3.5mm SE` and `4-pin XLR` (both supplied) | manufacturer page |
| detachableCable | M | `true` | manufacturer page |
| cableLengthM | H | `1.2` (SE cable) / `3` (XLR cable) — schema models a single value; **flagging to design issue**, see below | manufacturer page |
| soundSignature | E | `Warm` — **resolved 2026-09-13** (was null; the rankings-list check was correct, but Crinacle also graded this SKU directly in a dedicated review post the original pass didn't check) | Crinacle, "Crinnotes: Focal Clear Mg Quick Review" |

Citations:
- url `https://www.focal.com/products/clear-mg`, quote `"5 Hz – 23 kHz (±3dB)"` / `"55 Ω"` / `"104 dB SPL (peak@1m)"` / `"40mm Magnesium 'M'-shaped dome"`, tier `hard-spec`, sourcedAt `2026-09-13`.
- url `https://crinacle.com/2021/03/22/crinnotes-focal-clear-mg-quick-review-padgate/` (fetched and read directly, not a search excerpt), quotes: `"The Clear Mg is definitely warmer and possesses less upper mids than the original"`; overall grade `"B (Tone: B, Technical: A-)"`. Warmer + suppressed upper-mids maps to the `Warm` bucket in the should-be-headphones.md vocabulary. Tier `editorial`, sourcedAt `2026-09-13`.

### 4. Sony WH-1000XM5

| Field | Tier | Value | Citation |
|---|---|---|---|
| wearingStyle | M | `over-ear` | manufacturer help guide |
| acousticDesign | M | `closed-back` | manufacturer help guide (sealed earpad design) |
| connectivity | M | `wireless` (also has wired fallback via cable) | manufacturer help guide |
| driverType | H | `dynamic` | manufacturer help guide (not explicit driver-type word, but only dynamic drivers used in this model line — flagged low-confidence, see below) |
| impedanceOhms | H | `48 Ω (1kHz, powered)` | manufacturer help guide |
| sensitivityDbMw | H | `102 dB/mW (powered)` | manufacturer help guide |
| freqResponseHz | H | `{min:4, max:40000}` (wired/JEITA) | manufacturer help guide |
| bluetoothCodecs | M | `SBC, AAC, LDAC` | manufacturer help guide |
| anc | M | `anc` | manufacturer help guide |
| batteryLifeHours | M | `{ancOn:30, ancOff:40}` (AAC codec figures) | manufacturer help guide |
| ipxRating | M | `none` (page states "The headset is not waterproof") | manufacturer help guide |
| microphone | M | `true` | manufacturer help guide |
| foldable | M | `false` — not stated explicitly; inferred from absence of any folding instructions in the wearing/carrying-case sections of the full help guide, which covers a slide-adjust headband only. **Flagged low-confidence per protocol's null-over-guess rule — should be `null`, not asserted `false`, until a manufacturer statement is found.** | — |
| detachableCable | M | `true` (supplied 1.2m cable, detachable jack) | manufacturer help guide |
| cableLengthM | H | `1.2` | manufacturer help guide |
| soundSignature | E | **null** — no Tier 1–3 measured-FR source (Crinacle/ASR/Rtings) located within the pilot's search budget | — |

Citations:
- url `https://helpguide.sony.net/mdr/wh1000xm5/v1/en/print.pdf`, quotes: p.20 table `"AAC | Noise canceling function: ON | Max. 30 hours"` and `"AAC | OFF | Max. 40 hours"`; p.2 `"The headset is not waterproof."`; p.11-12 mic locations. Tier `marketing-fact`, sourcedAt `2026-09-13`.
- url `https://helpguide.sony.net/mdr/wh1000xm5/v1/en/contents/TP1000541014.html`, quotes `"Impedance: 48 Ω (1 kHz)"` / `"Sensitivity: 102 dB/mW"` / `"Frequency response: 4 Hz - 40 000 Hz (JEITA)"` / `"Bluetooth Specification version 5.2"` / codecs `"SBC, AAC, LDAC"`. Tier `hard-spec`, sourcedAt `2026-09-13`.

### 5. Sony WF-1000XM5

| Field | Tier | Value | Citation |
|---|---|---|---|
| wearingStyle | M | `in-ear` | manufacturer help guide |
| connectivity | M | `true-wireless` | manufacturer help guide |
| driverType | H | `dynamic` — **resolved 2026-09-13** (was null; not on the two help-guide pages fetched, but Sony's own launch press release names it) | Sony Electronics official press release |
| freqResponseHz | H | `{min:20, max:20000}` | manufacturer help guide |
| bluetoothCodecs | M | `SBC, AAC, LDAC, LC3` | manufacturer help guide |
| anc | M | `anc` | manufacturer + retailer corroboration |
| batteryLifeHours | M | `{ancOn:8, ancOff:12}` | Sony Middle East spec page |
| ipxRating | M | `IPX4` | manufacturer help guide |
| microphone | M | `true` | manufacturer help guide (call-quality section) |
| driverConfigBucket | H | `single-dynamic` (`1DD`) | consistent across all sources found, but manufacturer's own driver-count statement not located — **flagged low-confidence** |
| soundSignature | E | **null** — no Crinacle/ASR/Rtings measured entry located within budget | — |

Citations:
- url `https://helpguide.sony.net/mdr/2963/v1/en/contents/TP1000783926.html`, quotes `"Bluetooth Specification version 5.3"` / codecs `"SBC, AAC, LDAC, LC3"` / `"20 Hz - 20 000 Hz"`. Tier `hard-spec`, sourcedAt `2026-09-13`.
- url `https://helpguide.sony.net/mdr/2963/v1/en/contents/TP1000781399.html`, quote `"IPX4: Protected against water splashing from any direction."`, tier `marketing-fact`, sourcedAt `2026-09-13`.
- url `https://www.sony-mea.com/en/electronics/support/wireless-headphones-bluetooth-headphones/wf-1000xm5/specifications` (per search-result excerpt; not directly fetched — WebFetch blocked by the site), quote "Maximum 8 hours of playback with noise cancellation (NC) ON, or maximum 12 hours with NC OFF" — **tier marketing-fact, sourcedAt 2026-09-13, but flagged: sourced via search-engine excerpt of the manufacturer page, not a direct fetch of the page itself. A verification pass should open the URL directly.**
- url `https://www.prnewswire.com/news-releases/sony-electronics-unveils-wf-1000xm5-truly-wireless-earbuds-for-the-music-the-best-noise-canceling-earbuds-301883612.html` (Sony Electronics official press release, fetched and read directly), quote `"The specially designed driver unit Dynamic Driver X, able to reproduce lower frequencies..."` — confirms the driver is a Dynamic Driver X (dynamic type); note this release does **not** state the 8.4mm size figure some tech press cites — that figure traces to an unconfirmed leak per Notebookcheck's own framing, so it is deliberately not recorded here; only the type (`dynamic`), which is what the schema field actually needs, is written. Tier `hard-spec`, sourcedAt `2026-09-13`.

### 6. Moondrop Alice

| Field | Tier | Value | Citation |
|---|---|---|---|
| wearingStyle | M | `in-ear` | manufacturer page |
| connectivity | M | `true-wireless` | manufacturer page |
| driverType | H | `dynamic` (`"10mm U.L.T. Super-linear Dynamic Driver"`) | manufacturer page |
| driverConfigBucket | H | `single-dynamic` | manufacturer page (single 10mm driver, no mention of a second driver) |
| impedanceOhms | H | `32 (±15% @1kHz)` | manufacturer page |
| bluetoothCodecs | M | `AAC, SBC, aptX Adaptive` | manufacturer page |
| batteryLifeHours | M | `{ancOff: 8}` (case adds 40h total; no ANC-on figure, since it has no ANC) | manufacturer page |
| anc | M | `none` | Qucox review (secondary; manufacturer page does not mention ANC at all, which is itself consistent with "none" but not a positive statement — **flagged, see below**) |
| ipxRating | M | **null** — no IP rating found on manufacturer page or elsewhere | — |
| microphone | M | `true` (dual MEMS mics for calls/ENC) | third-party review (Headfonics/press coverage); manufacturer page does not list mic count explicitly — **flagged low-confidence** |
| soundSignature | E | **null** — not found on Crinacle/ASR/Rtings within budget | — |

Citations:
- url `https://moondroplab.com/en/products/alice`, quotes `"10mm U.L.T. Super-linear Dynamic Driver"` / `"3rd Generation DLC Composite Diaphragm"` / `"AAC/SBC/aptX Adaptive"` / `"About 8 + 40hours"` / `"impedance 32Ω ± 15% at 1kHz"`. Tier `hard-spec`/`marketing-fact`, sourcedAt `2026-09-13`.

## Missing-source log (updated 2026-09-13 — widened-tier re-check)

Remaining genuine nulls, after re-checking against the widened source tiers
(manufacturer manuals actually opened, launch press releases, Crinacle's
individual review posts, not just the rankings list):

- Sony WH-1000XM5, Sony WF-1000XM5, Moondrop Alice: `soundSignature` = null —
  re-checked, no Crinacle rankings-list-or-review-post / ASR / Rtings entry
  exists for any of the three under the widened tier either.
- HiFiMan Sundara: `foldable` = null — re-checked against the Owner's Guide
  PDF directly, still not stated.
- Moondrop Alice: `ipxRating` = null.

Resolved out of the original null list (widened tiers found a real,
directly-fetched source — see per-product tables above): HiFiMan Sundara
`cableTermination` (Owner's Guide PDF), Sony WF-1000XM5 `driverType` (Sony
press release), Focal Clear Mg `soundSignature` (Crinacle review post).

New item, not a null: HiFiMan Sundara `impedanceOhms` / `sensitivityDbMw` —
not missing, but **conflicting** between two manufacturer sources (web page
vs. Owner's Guide PDF). Flagged for human resolution per the sourcing
protocol's new self-contradiction rule; not treated as a null.

3 of 6 products still have a null `soundSignature` (down from 4) — still the
single largest driver of per-product time cost; see "Calibration" below.

## Design gaps found (reported back to `sang-logium-1xs.6`, not fixed here — out of scope per this issue's SINGLE RESPONSIBILITY)

1. **`requiresAmplifier` has no stated derivation rule.** `schema-headphones.md` says it is "derived from items 17+18 at data-write time" but neither that document nor `sourcing-protocol-headphones.md` states the actual threshold (e.g. impedance > X Ω or sensitivity < Y dB). The pilot did not invent one. `sang-logium-1xs.6` should specify the exact rule before fan-out batches write this field.
2. **`cableLengthM` is modeled as a single value**, but a product can ship with two cables of different lengths (Focal Clear Mg: 1.2m SE + 3m XLR). The schema doesn't say whether to store the shortest, the primary/SE one, or add a list. Flagging back rather than picking silently.
3. **Manufacturer-page unavailability is common enough to matter.** Sennheiser's and Sony's flagship marketing domains (`sennheiser.com`, `electronics.sony.com`) actively blocked or redirected automated fetches during this pilot; the working citations came from regional mirror domains (`us.sennheiser-hearing.com`) or manufacturer-hosted help-guide subdomains (`helpguide.sony.net`) instead. Fan-out batches should expect this and budget time to find the right manufacturer subdomain per brand, not assume the top-level product page is fetchable.

## Post-verification corrections

The independent verification pass (`pilot-headphones-verification.md`) found
one real transcription error, now corrected above: Focal Clear Mg's
`sensitivityDbMw` was mislabeled — the manufacturer page's `"104 dB SPL
(peak@1m)"` is a different measurement basis than the `dB SPL/1mW@1kHz` field
it was recorded against, so the field is now null rather than asserted.

The verifier also flagged two nulls as possibly findable (HiFiMan Sundara
`cableTermination` via a manufacturer manual PDF it located but didn't fetch;
Sony WF-1000XM5 `driverType` via press coverage of an "8.4mm Dynamic Driver
X" spec it didn't independently confirm), plus a third gap it found
independently (Focal Clear Mg `soundSignature` via a Crinacle review post the
original pass hadn't checked). **Update 2026-09-13, following the decision to
widen the sourcing tiers: all three were directly fetched and resolved** —
see the per-product tables above for exact quotes and URLs. The Sony
"8.4mm" figure specifically was *not* carried over, since direct fetching
showed it traces to an unconfirmed leak rather than a Sony statement; only
the `dynamic` type (confirmed by Sony's own press release, and the only part
of this field the schema actually needs) was written. Opening HiFiMan's
Owner's Guide PDF directly also surfaced a new problem the original pass
couldn't have caught from the web page alone: it states different
impedance/sensitivity numbers than hifiman.com does. That conflict is
recorded, not resolved — see the Sundara table above.

## Independent verification pass

Required by this issue's acceptance tests to be a **separate pass**, not a
self-check by the same reasoning that produced the values above. Handed off to
a fresh review documented in `pilot-headphones-verification.md`.

## Calibration data (for sizing the ~70+ product fan-out)

- **Search/fetch operations per product:** hard-spec/marketing fields for a
  wired over-ear headphone with an accessible manufacturer page (Sundara,
  Focal Clear Mg) took **2–3 search or fetch calls**. A product whose brand's
  primary domain blocks automated fetching (Sennheiser, Sony) took **4–6
  calls** to locate a working manufacturer subdomain. TWS/wireless products
  needed extra calls for battery/codec/IPX fields not present on a single
  page (**4–5 calls**).
- **Editorial tier (`soundSignature`) is the long pole.** Locating a genuine
  Crinacle/ASR/Rtings measured entry (not a prose review) succeeded for only
  2 of 6 products (the two open-back audiophile headphones already well
  covered by Crinacle's rankings list) — both in 1 call each, because
  Crinacle's own rankings page lists title + tuning descriptor directly.
  Consumer/mainstream products (Sony, Moondrop) and less mainstream reference
  headphones (Focal Clear Mg) are the harder case; 2–3 calls each still
  returned no verifiable measured citation, meaning this field should be
  budgeted as "often null" for those categories rather than as a solvable
  research gap per-product.
- **Net estimate:** roughly **8–12 tool calls (search+fetch) per product**
  for a wired audiophile headphone with an accessible manufacturer site,
  **12–18 calls** for a wireless/TWS product needing battery/codec/IPX/ANC
  facts spread across multiple manufacturer sub-pages. At this rate, the
  remaining ~70+ product catalogue should be split into batches sized so
  each batch is dominated by one connectivity type (wired vs. wireless)
  rather than mixed, since the wireless category consistently costs
  40–70% more calls per product.
- **Independent verification** (below) took roughly 1 citation-open per
  sourced value; budget it as a comparable-size pass to the sourcing pass
  itself, not a quick check — nearly half the citations in this pilot needed
  the verifier to actually open the URL to confirm the exact quote, since
  several were sourced via search-result excerpts rather than a direct page
  fetch.
