# Dan Clark Audio Sourcing Results — `sang-logium-1xs.9.8`

Sourced against `schema-headphones.md` + `sourcing-protocol-headphones.md`
(2026-09-13 widened tiers). Products drawn from the real catalogue —
name/brand/price only; no other POC enrichment field is treated as ground
truth.

Tier legend: **H** hard spec, **M** marketing/feature fact, **E** editorial,
**D** derived, **I** internal (not sourced). Status flags: **NULL**
(exhausted, genuinely unfound), **FLAG** (recorded but low-confidence /
inference), **CONFLICT** (two same-tier manufacturer sources disagree).

## 1. Dan Clark Audio AEON 2 Noire ($899.99) — `k27n1AQuIbSr5iozFz7Fdd`

| Field | Tier | Value | Source | Status |
|---|---|---|---|---|
| driverType | H | `planar-magnetic` | manufacturer page + quick guide PDF | — |
| impedanceOhms | H | `13` | manufacturer page | — |
| sensitivityDbMw | H | `~90 dB/mW` | manufacturer page | FLAG — see note |
| freqResponseHz | H | `null` | — | NULL — exhausted |
| driverConfigBucket / driverConfigDetail | H/D | `null` | — | NULL — domain-gated to IEM (should-be.md item 31), doesn't apply to an over-ear |
| requiresAmplifier | D | not set | — | out of scope — derived field, not decided by this pass |
| wearingStyle | M | `over-ear` | manufacturer page | — |
| acousticDesign | M | `closed-back` | manufacturer page ("Closed versions... used when blocking noise" — this is the Noire closed variant) | — |
| fitType | M | `null` | — | NULL — not an IEM, field doesn't apply |
| connectivity | M | `wired` | manufacturer page (no wireless mentioned; only analog cable options) | — |
| portable | M | `true` | quick guide PDF ("compact travel case") + manufacturer page ("packs into a truly compact case") | FLAG — inferred from foldability/case language, not an explicit "portable" label |
| microphone | M | `false` | — | FLAG — no mic mentioned anywhere; absence-based inference, not an explicit manufacturer statement |
| cableTermination | M | `3.5mm, 6.35mm (1/4"), 4-pin-xlr, 4.4mm-balanced, 2.5mm-balanced` | manufacturer page "Choose Your Cable" options | — |
| detachableCable | M | `true` | quick guide PDF (Hirose-style connector, explicit attach/release instructions) | — |
| cableLengthM | H | `2` (stock 1/4"-3.5mm DUMMER cable) | manufacturer page "Choose Your Cable" dropdown, live-verified 2026-09-13 | — (second pass: value confirmed against the live page; the dropdown's base/no-upcharge option is `1/4\"-3.5mm 2m DUMMER`, so `2` is the stock length. Earlier rationale referencing the paid VIVO options was imprecise but the recorded value is unchanged.) |
| foldable | M | `true` | manufacturer page + quick guide PDF (dedicated folding-storage instructions) | — |
| ipxRating | M | `null` | — | NULL — no manufacturer claim found |
| bluetoothCodecs | M | `null` | — | NULL — domain-gated, wired-only product |
| anc | M | `passive` | manufacturer page (closed-back design "used when blocking noise"; no electronic ANC feature stated) | — |
| batteryLifeHours | M | `{ancOff: null, ancOn: null}` | — | NULL — wired-only, no battery |
| awards | M | `NYT Wirecutter — "best-sounding closed headphone under $2,000"` | manufacturer page | FLAG — the quoted award text names "ÆON 2 Closed," not "Noire," even though it's displayed on the Noire product page; recorded as-is, not silently relabeled |
| soundSignature | E | `V-Shaped` (Crinacle: "Warm V-shape", Tone Grade B-) | Crinacle rankings list | FLAG — Crinacle's descriptor is "Warm V-shape"; the schema's `soundSignature` list (productType.ts) has no "Warm V-shape" member, and `Warm` / `V-Shaped` are the two adjacent members. Mapped to **V-Shaped** because Crinacle's own primary adjective is "V-shape" and his note ("slightly thick midrange and least offensive treble") describes the V-shape's midrange dip, not a warm tilt. Recorded, not silently relabelled. |

### Citations

- `filterAttributes.sourcing.{driverType, impedanceOhms, sensitivityDbMw, wearingStyle, acousticDesign, connectivity, cableTermination, foldable, awards}`: url `https://danclarkaudio.com/aeon-2-noir.html`, quotes: `"62mm x 34mm single-ended planar magnetic"` / `"13ohms"` / `"~90 dB/mW"` / `"ÆON 2's unique and patented folding gimbal design allows it to pack into a truly compact case"` / `"Closed versions of the headphones should be used when blocking noise"` / cable dropdown listing `1/4"-3.5mm`, `4-pin XLR`, `4.4mm`, `2.5mm` / `"New York Times Wirecutter called ÆON 2 Closed the best-sounding closed headphone under $2,000"`. Tier `hard-spec`/`marketing-fact` as applicable, sourcedAt `2026-09-13`.
- `filterAttributes.sourcing.{detachableCable, foldable}`: url `https://danclarkaudio.com/pub/docs/2022/ÆON-2-QUICK-GUIDE.pdf` (ÆON 2 Quick User Guide, opened and read visually, page images — not a failed text-scrape), quotes: `"All Dan Clark Audio planar-magnetic products use Hirose-style connectors. To attach your cable hold the male connector by the boot and rotate it into the female receptacle on the headphone until you feel it click into place. To release the cable, pull down on the top of the connector's metal jacket."` / folding-storage steps 1–3 with explicit fold instructions. Tier `marketing-fact`, sourcedAt `2026-09-13`.
- `filterAttributes.sourcing.soundSignature`: url `https://crinacle.com/rankings/headphones/`, quote `"Warm V-shape"` / `"Arguably the best tuned DCA headphone with a slightly thick midrange and least offensive treble."` (Tone Grade B-), tier `editorial`, sourcedAt `2026-09-13`.
- **Not a citation, informational only:** ASR forum measurement thread (`audiosciencereview.com/forum/.../dan-clark-audio-aeon-2-noire-review.46055`) independently measured impedance as `13Ω` (corroborates manufacturer value, no conflict) and sensitivity as `84dB/mW` (differs from the manufacturer's `~90 dB/mW`). This is **not** flagged as a protocol CONFLICT — the self-contradiction rule applies only to two same-tier *manufacturer* sources disagreeing, and ASR is a different tier (independent lab, used only as a fallback when the manufacturer is silent). Noted here for the human-review pass in case the sensitivity FLAG above needs a second look.
- **freqResponseHz exhaustion trail:** manufacturer page states literally `"Yes, it has one"` in place of a number (confirmed via direct fetch, not a scrape failure); the quick guide PDF (opened visually, no frequency response section) has no number; no manufacturer press release with a number was found (only third-party press covering the launch, none stating a Hz range); Crinacle's and ASR's pages show measured FR as a graph, not a quoted numeric range. All tier-1 fallbacks exhausted — `null` stands per the missing-source convention.

## 2. Dan Clark Audio Stealth ($3,999.99) — `k27n1AQuIbSr5iozFz7HA5`

| Field | Tier | Value | Source | Status |
|---|---|---|---|---|
| driverType | H | `planar-magnetic` | manufacturer page + quick guide PDF | — |
| impedanceOhms | H | `23` | manufacturer page | — |
| sensitivityDbMw | H | `~90 dB/mW` | manufacturer page | FLAG — identical generic figure to AEON 2 Noire, possibly reused marketing copy across the planar lineup rather than model-specific; ASR gives no independent number to cross-check |
| freqResponseHz | H | `null` | — | NULL — exhausted (see trail below) |
| driverConfigBucket / driverConfigDetail | H/D | `null` | — | NULL — domain-gated to IEM (should-be.md item 31), n/a |
| requiresAmplifier | D | not set | — | out of scope — derived field, not decided by this pass |
| wearingStyle | M | `over-ear` | manufacturer page | — |
| acousticDesign | M | `closed-back` | manufacturer page | — |
| fitType | M | `null` | — | NULL — not an IEM |
| connectivity | M | `wired` | manufacturer page (no wireless mentioned) | — |
| portable | M | `true` | manufacturer page (`"Travel friendly - Packs Small!"`, folding gimbals + compact case) | FLAG — inferred from travel/case language, not an explicit "portable" label |
| microphone | M | `false` | — | FLAG — no mic mentioned anywhere; absence-based inference |
| cableTermination | M | `3.5mm, 6.35mm (1/4"), 4-pin-xlr, 4.4mm-balanced, 2.5mm-balanced` | manufacturer page (VIVO cable option listing) | — |
| detachableCable | M | `true` | quick guide PDF (push-pull self-latching connector, explicit attach/release instructions) | — |
| cableLengthM | H | `2` (stock option) | manufacturer page (2m or 3m options listed) | FLAG — multiple lengths offered; `2` recorded as the shorter/stock option, same convention as product 1 |
| foldable | M | `true` | manufacturer page + quick guide PDF (dedicated 4-step folding-storage instructions) | — |
| ipxRating | M | `null` | — | NULL — no manufacturer claim found |
| bluetoothCodecs | M | `null` | — | NULL — domain-gated, wired-only |
| anc | M | `passive` | manufacturer page (closed-back design, no electronic ANC feature stated) | — |
| batteryLifeHours | M | `{ancOff: null, ancOn: null}` | — | NULL — wired-only, no battery |
| awards | M | `null` | — | NULL — page displays award badge images but no quotable attributed press text; a badge image alone can't satisfy the citation requirement (exact quoted phrase) |
| soundSignature | E | `Neutral` | ASR lab measurement (Crinacle has no Stealth entry — checked rankings list, no individual review post found either) | FLAG — derived from ASR's "highest compliance to their target [Harman-style] curve of any headphone they've tested" + "no need to apply any EQ" framing, per the protocol's rule to derive the label from the measured curve; Crinacle is the protocol's primary Tier 3 source and has no Stealth entry at all, so this is a secondary-source derivation, not the primary |

### Citations (Stealth)

- `filterAttributes.sourcing.{driverType, impedanceOhms, sensitivityDbMw, wearingStyle, acousticDesign, connectivity, cableTermination, portable, foldable}`: url `http://danclarkaudio.com/headphones/stealth-2.html`, quotes: `"76mm x 51mm single-ended planar magnetic"` (product page) / `"51 mm x 76mm Dan Clark Audio designed single-ended planar magnetic"` (quick guide, minor mm-order discrepancy between the two manufacturer sources — not flagged as a protocol CONFLICT since both describe the identical driver, just transposed dimension order) / `"23ohms"` / `"~90 dB/mW"` / `"Travel friendly - Packs Small!"` / `"Folding gimbals allow Stealth to be packed in a compact case for safe and easy transport"`. Tier `hard-spec`/`marketing-fact`, sourcedAt `2026-09-13`.
- `filterAttributes.sourcing.{detachableCable, foldable}`: url `https://danclarkaudio.com/docs/2022/STEALTH-QUICKGUIDE.pdf` (Stealth Quick User Guide, opened and read visually, page images), quotes: `"All Dan Clark Audio planar-magnetic products use push-pull self-latching connectors. To attach your cable hold the male connector by the boot and rotate it into the female receptacle on the headphone until you feel it click into place. To release the cable, pull down on the top of the connector's metal jacket."` / 4-step folding-storage instructions. Tier `marketing-fact`, sourcedAt `2026-09-13`.
- `filterAttributes.sourcing.soundSignature`: url `https://www.audiosciencereview.com/forum/index.php?threads/dan-clark-stealth-review-state-of-the-art-headphone.25920/`, quote `"the highest compliance to their target curve of any headphone they have ever tested"` / `"an incredibly clean, dynamic sound with absolute correctness in tonality... no need to apply any EQ"`, tier `editorial`, sourcedAt `2026-09-13`.
- **freqResponseHz exhaustion trail:** manufacturer product page states `"Yes, it has one"` (same joke placeholder as AEON 2 Noire); the Stealth Quick User Guide PDF (opened visually) has no frequency-response section; no manufacturer press release with a number found; the ASR review thread's opening post discusses measured FR compliance narratively but states no min–max Hz figure; Crinacle has no Stealth entry to check. All applicable tier-1 fallbacks exhausted — `null` stands.

## 3. Dan Clark Audio E3 (Open Box, $1,699.99) — `moXlkADK7m1DHgGwWtbkq7`

Manufacturer page `https://danclarkaudio.com/e3.html` (opened and read
2026-09-13). E3 is DCA's midrange **closed-back** headphone; the catalogue
record is the Open Box listing of that same model.

| Field | Tier | Value | Source | Status |
|---|---|---|---|---|
| driverType | H | `planar-magnetic` | manufacturer page ("5th generation driver", V-Planar / "100% proprietary driver" family; DCA's planar-magnetic line) | — |
| impedanceOhms | H | `27` | manufacturer page Specifications `"Impedance 27ohms"` | — |
| sensitivityDbMw | H | `90` | manufacturer page Specifications `"Sensitivity ~90 dB/mW"` | FLAG — manufacturer's own figure is prefixed `~` (approximate); recorded as `90`, same convention as Noire and Stealth |
| freqResponseHz | H | `null` | — | NULL — exhausted: manufacturer Specifications block reads `"Frequency response Yes, it has one"`, the same joke placeholder DCA uses on Noire/Stealth — no number published. No E3 manual/press release with a Hz figure found. |
| driverConfigBucket / driverConfigDetail | H/D | `null` | — | NULL — domain-gated to IEM (should-be.md item 31); E3 is an over-ear |
| requiresAmplifier | D | not set | — | out of scope — derived field, not decided by this pass |
| wearingStyle | M | `over-ear` | manufacturer page (circumaural, self-adjusting headband, closed-back ergonomics) | — |
| acousticDesign | M | `closed-back` | manufacturer page (`"E3 is Dan Clark Audio's revolutionary new closed-back headphone"`) | — |
| fitType | M | `null` | — | NULL — not an IEM |
| connectivity | M | `wired` | manufacturer page (no wireless/Bluetooth mentioned; analog cable choices only) | — |
| portable | M | `true` | manufacturer page (`"Travel friendly Packs Small!"`, `"convenient and stylish folding gimbals that make E3 a conveniently compact travel headphone"`) | — |
| microphone | M | `false` | — | FLAG — boolean feature-absence rule: no mic mentioned on the manufacturer page; a mic would be advertised |
| cableTermination | M | `3.5mm, 6.35mm, 4-pin-xlr, 4.4mm-balanced, 2.5mm-balanced` | manufacturer page "Choose Your Cable" options (`1/4"` = 6.35mm, `XLR` = 4-pin, `4.4mm`, `2.5mm`, `3.5mm`) | — |
| detachableCable | M | `true` | manufacturer page cable dropdown + DCA's push-pull self-latching inline connector system across its planar-magnetic line | — |
| cableLengthM | H | `2` (stock 1/4" VIVO cable) | manufacturer page "Choose Your Cable" dropdown — base no-upcharge option is `2m 1/4" VIVO` | FLAG — multiple lengths offered (1.1m / 2m / 3m); `2` recorded as the stock/no-upcharge option, same convention as products 1–2 |
| foldable | M | `true` | manufacturer page (`"convenient and stylish folding gimbals"`) | — |
| ipxRating | M | `null` | — | NULL — no manufacturer water/sweat-resistance claim found |
| bluetoothCodecs | M | `null` | — | NULL — domain-gated, wired-only product |
| anc | M | `passive` | manufacturer page (closed-back design with isolation; no electronic ANC feature stated) | — |
| batteryLifeHours | M | `{ancOff: null, ancOn: null}` | — | NULL — wired-only, no battery |
| awards | M | `null` | — | NULL — page shows an "E3 Awards Details" badge element but no quotable attributed press text; a badge image alone cannot satisfy the citation requirement |
| soundSignature | E | `null` | — | NULL — exhausted: see trail below. |

### Citations (E3)

- `filterAttributes.sourcing.{driverType, impedanceOhms, sensitivityDbMw, wearingStyle, acousticDesign, connectivity, cableTermination, detachableCable, cableLengthM, portable, foldable, microphone, anc}`: url `https://danclarkaudio.com/e3.html`, quotes: `"Impedance 27ohms"` / `"Sensitivity ~90 dB/mW"` / `"E3 is Dan Clark Audio's revolutionary new closed-back headphone"` / `"Travel friendly Packs Small!"` / `"convenient and stylish folding gimbals that make E3 a conveniently compact travel headphone"` / cable dropdown listing `2m 1/4" VIVO`, `3m 1/4" VIVO`, `2m XLR VIVO`, `3m XLR VIVO`, `1.1m 2.5mm VIVO`, `2m 2.5MM VIVO`, `1.1m 4.4mm VIVO`, `2m 4.4mm VIVO`, `1.1m 3.5mm VIVO`, `2m 3.5mm VIVO`. Tier `hard-spec`/`marketing-fact` as applicable, sourcedAt `2026-09-13`.
- **freqResponseHz exhaustion trail:** manufacturer Specifications block states `"Frequency response Yes, it has one"` (DCA's house joke placeholder — identical wording on Noire, Stealth and NOIRE X); the E3 product page publishes no Hz range; no DCA E3 manual/quick-guide PDF was locatable (the `/docs/2024/E3-QUICKGUIDE.pdf` pattern 404s); no manufacturer press release with a numeric range found. All applicable Tier-1 fallbacks exhausted — `null` stands.
- **soundSignature exhaustion trail:** Crinacle rankings list checked in full for `E3` / `NOIRE X` / `Stealth` / `Expanse` / `Corina` — **zero** matching entries (only the Aeon/Ether/Voce family). Crinacle individual review posts likewise show none. ASR's `tags/dan-clark-audio` thread index checked — no E3 measurement thread; the only E3 thread is a classifieds "for sale" post. Rtings has no Dan Clark Audio review. All three protocol Tier-3 sources exhausted — `null` stands, not inferred from DCA's own "silky midrange, utterly smooth highs" marketing copy.

## 4. Dan Clark Audio NOIRE X ($999.99) — `n10eAegrGspodtsQvneQBQ`

Manufacturer page `https://danclarkaudio.com/noirex.html` (note: the
`/noire-x.html` and `/headphones/noire-x.html` URL patterns 404; the live URL
has no hyphen). Opened and read 2026-09-13.

| Field | Tier | Value | Source | Status |
|---|---|---|---|---|
| driverType | H | `planar-magnetic` | manufacturer page ("designed around an updated and improved AEON audio driver", V-Planar, DCA planar-magnetic line) | — |
| impedanceOhms | H | `13` | manufacturer page Specifications `"Impedance 13ohms"` | — |
| sensitivityDbMw | H | `90` | manufacturer page Specifications `"Sensitivity ~90 dB/mW"` | FLAG — manufacturer's own figure is prefixed `~`; same convention as products 1–3 |
| freqResponseHz | H | `null` | — | NULL — exhausted: manufacturer Specifications block reads `"Frequency response Yes, it has one"` — no number. No NOIRE X manual/press release with a Hz figure found. |
| driverConfigBucket / driverConfigDetail | H/D | `null` | — | NULL — domain-gated to IEM (should-be.md item 31); NOIRE X is an over-ear |
| requiresAmplifier | D | not set | — | out of scope — derived field, not decided by this pass |
| wearingStyle | M | `over-ear` | manufacturer page (circumaural, self-tensioning headband, over-ear pads) | — |
| acousticDesign | M | `closed-back` | manufacturer page — NOIRE X "updates our iconic AEON 2 NOIRE"; the AEON 2 Noire is DCA's closed model and NOIRE X adds isolation/closed-cup language | FLAG — the NOIRE X page itself never prints the literal words "closed-back"; the value is carried from its explicitly-stated predecessor (AEON 2 NOIRE) that this model "updates". Recorded, not inferred from silence. |
| fitType | M | `null` | — | NULL — not an IEM |
| connectivity | M | `wired` | manufacturer page (no wireless/Bluetooth mentioned; analog cable options only) | — |
| portable | M | `true` | manufacturer page (`"Travel friendly Packs Small!"`) | — |
| microphone | M | `false` | — | FLAG — boolean feature-absence rule: no mic mentioned on the manufacturer page |
| cableTermination | M | `3.5mm, 6.35mm, 4-pin-xlr, 4.4mm-balanced, 2.5mm-balanced` | manufacturer page "Choose Your Cable" options and `"offers a comprehensive range of cable terminations at the base price, including combo 1/4" and 3.5mm tips, 4-pin XLR, and 4.4mm"` | — |
| detachableCable | M | `true` | manufacturer page (`"it's easy to upgrade to our ultra-premium VIVO cables"` — an upgrade requires a detachable connector; DCA's push-pull self-latching inline system) | — |
| cableLengthM | H | `2` (stock 1/4"-3.5mm DUMMER cable) | manufacturer page "Choose Your Cable" dropdown — base no-upcharge option is `1/4"-3.5mm 2m DUMMER` | — (the base option is explicit about both length and no upcharge, so `2` is unambiguous here) |
| foldable | M | `false` | — | FLAG — boolean feature-absence rule: unlike Noire/Stealth/E3, the NOIRE X page carries **no** folding-gimbal or folding-storage language; the page markets "self-tensioning headband" and "Packs Small!" but never a hinge. Recorded `false` per the feature-absence rule, not left null. |
| ipxRating | M | `null` | — | NULL — no manufacturer water/sweat-resistance claim found |
| bluetoothCodecs | M | `null` | — | NULL — domain-gated, wired-only product |
| anc | M | `passive` | manufacturer page (closed-back isolation language; no electronic ANC feature stated) | — |
| batteryLifeHours | M | `{ancOff: null, ancOn: null}` | — | NULL — wired-only, no battery |
| awards | M | `null` | — | NULL — the page shows a "NOIRE X Awards Details" badge element but prints no quotable attributed press text; a badge image alone cannot satisfy the citation requirement |
| soundSignature | E | `null` | — | NULL — exhausted: see trail below. |


### Citations (NOIRE X)

- `filterAttributes.sourcing.{driverType, impedanceOhms, sensitivityDbMw, wearingStyle, connectivity, cableTermination, detachableCable, cableLengthM, portable, foldable, microphone, anc}`: url `https://danclarkaudio.com/noirex.html`, quotes: `"Impedance 13ohms"` / `"Sensitivity ~90 dB/mW"` / `"NOIRE X™ updates our iconic AEON 2 NOIRE by integrating DCA's state-of-the-art Acoustic Metamaterial Tuning System™ (AMTS™) with an improved driver"` / `"Travel friendly Packs Small!"` / `"offers a comprehensive range of cable terminations at the base price, including combo 1/4" and 3.5mm tips, 4-pin XLR, and 4.4mm"` / `"it's easy to upgrade to our ultra-premium VIVO cables"` / cable dropdown base option `1/4"-3.5mm 2m DUMMER`. Tier `hard-spec`/`marketing-fact` as applicable, sourcedAt `2026-09-13`.
- **freqResponseHz exhaustion trail:** manufacturer Specifications block states `"Frequency response Yes, it has one"` (identical placeholder to Noire/Stealth/E3); no NOIRE X manual or press release with a numeric Hz range found; no Tier-3 lab publishes a numeric min–max range for it (and none covers the model at all). All applicable Tier-1 fallbacks exhausted — `null` stands.
- **soundSignature exhaustion trail:** Crinacle rankings — no NOIRE X row. Crinacle individual posts — none. ASR — no measurement thread; only the unattributed user comparison thread `DCA Noire X vs Meze Strada vs SJY Horizon Closed Carbon` (excluded by the protocol's "what does not count" rule: a forum/enthusiast claim with no manufacturer or lab attribution). Rtings — no DCA review. `null` stands.


## Citation re-check (same pass as sourcing, not the dropped second pass)

**Note on acceptance tests:** the issue's original second acceptance test
("a second, independent pass… a separate pass from the one that sourced the
values") was **dropped by the product owner on 2026-09-13** (recorded in the
issue's NOTES) — it is superseded, not enforced. It was replaced by: source
each product, then patch Sanity directly after a reviewed dry run. What
follows is therefore *not* an independent verification pass and is not claimed
as one: it is a same-pass re-read of each cited URL, done as the last step
before the patch, and it is labelled as such.

| # | Product | Result |
|---|---|---|
| 1 | AEON 2 Noire | Values re-read on `https://danclarkaudio.com/aeon-2-noir.html`: `"Impedance 13ohms"`, `"Sensitivity ~90 dB/mW"`, `"62mm x 34mm single-ended planar magnetic"`, `"ÆON 2's unique and patented folding gimbal design allows it to pack into a truly compact case"`, `"Frequency response Yes, it has one"`, and the NYT Wirecutter sentence naming "ÆON 2 Closed". **Correction applied:** the earlier `cableLengthM` rationale implied the 2 m figure came from the paid VIVO list; the dropdown's base no-upcharge line is `1/4"-3.5mm 2m DUMMER`, so the recorded `2` is correct but now cites the right line. `soundSignature` re-checked: the Crinacle row **is** "DCA Aeon 2 Noire", descriptor `"Warm V-shape"` — exact. **Mapping applied:** the schema has no "Warm V-shape"; recorded as `V-Shaped` with the discrepancy flagged inline above. |
| 2 | Stealth | Values re-read on `http://danclarkaudio.com/headphones/stealth-2.html`: `"Impedance 23ohms"`, `"Sensitivity ~90 dB/mW"`, `"76mm x 51mm single-ended planar magnetic"`, folding-gimbal/travel text, `"Frequency response Yes, it has one"`. **Price drift observed** (see drift below): the live page now reads **$4,499.99** with a `NEW` flag where the catalogue record says $3,999.99. Also confirmed the citation's `http://` URL still resolves. |
| 3 | E3 | Values re-read on `https://danclarkaudio.com/e3.html`: `"Impedance 27ohms"`, `"Sensitivity ~90 dB/mW"`, `"closed-back headphone"`, folding gimbals, `"Travel friendly Packs Small!"`, cable dropdown contents. `soundSignature` null re-confirmed by checking the Crinacle rankings list and individual posts, and ASR's DCA tag index. |
| 4 | NOIRE X | Values re-read on `https://danclarkaudio.com/noirex.html`: `"Impedance 13ohms"`, `"Sensitivity ~90 dB/mW"`, `"updates our iconic AEON 2 NOIRE"`, `"Travel friendly Packs Small!"`, base cable `1/4"-3.5mm 2m DUMMER`. Confirmed the page carries **no** folding language (hence `foldable: false`) and no numeric frequency response. `soundSignature` null re-confirmed the same way as E3. |

### Data-drift observations (recorded, not written — out of scope for this pass)

- **Stealth live price $4,499.99 vs. catalogue $3,999.99.** Price is `filterAttributes.price`, an **I-tier** internal field — the sourcing protocol does not source it and this issue does not write it. Flagged for whoever owns catalogue pricing.
- **NOIRE X live price $1,099.99 vs. catalogue $999.99.** Same class of drift; same disposition.
- **DCA's "Frequency response" joke placeholder** (`"Yes, it has one"`) appears on all four product pages identically. It is a manufacturer-page defect worth reporting upstream, not something to work around by inventing a value.

### Notes on the live documents (observed during dry run)

- **Stale pre-migration siblings, deliberately not touched.** The Noire and
  Stealth documents carry legacy `filterAttributes` values that predate the
  canonical field set: `wearingStyle: "over-ear"` and
  `driverType: "planar-magnetic"` as **bare strings** where the canonical
  fields are `array` (`schema-headphones.md` items 1 and 5), plus
  `backDesign: "closed"` alongside the canonical `acousticDesign`. The specs
  write only the canonical array-typed fields. The bare-string siblings were
  not converted and `backDesign` was not deleted — collapsing a stale
  superseded field is a schema-migration decision (`backDesign` was renamed
  during schema design), not a sourcing one, and this issue is explicitly out
  of scope for schema work.
- **The engine merges `sourcing` by `field`, and that collides here.**
  `engine.mjs` replaces any prior entry with the same `field` name and keeps
  the rest. Two DCA fields are cited from one URL but need two distinct
  quotes to be honest: Noire's `cableTermination` (the "Choose Your Cable"
  options) and its `cableLengthM` (the base `2m DUMMER` line). Both are
  written; whichever is applied last wins the single `sourcing` slot. The
  spec files therefore keep the per-field quotes adjacent and clearly
  labelled so the surviving entry is still accurate on its own, and this
  limitation is reported below rather than worked around by editing the
  shared engine.

## Protocol gaps reported (not improvised around)

- `should-be-headphones.md` has no field for **weight** or **driver dimensions**, both of which DCA publishes and which the sourcing pass captured only as supporting quotes. No schema change made — reported per the issue's "report gaps back rather than improvising a fix".
- The **`soundSignature` schema vocabulary** (`Neutral, Warm, Bright/Analytical, Dark, V-Shaped, Basshead, Mid-Forward, Harman-target-like`) cannot express "Warm V-shape", the phrase Crinacle actually uses for this brand. Mapping was applied and flagged rather than silently rounded. No schema change made.
- The protocol's Tier-3 list (Crinacle → ASR → Rtings) has **zero coverage of DCA's current lineup** — Crinacle's newest DCA rows predate E3/NOIRE X entirely, and Rtings has no DCA review at all. Two of this brand's four products therefore take `soundSignature: null`. This is the protocol working as written, but it is worth noting that a well-known boutique brand can be fully uncovered by all three sources.
- **`sourcing` cannot hold two citations for one field.** `engine.mjs` merges the array by `field`, so a field with two legitimately distinct quotes (Noire's `cableTermination` and `cableLengthM` on the Stealth/Noire cable dropdown) keeps only the last one written. Either the `sourcing` shape needs a stable per-entry key, or the engine needs to append rather than replace same-`field` entries. Not fixed here — the engine is shared by every `sang-logium-1xs.9.*` brand issue and the issue forbids schema/tooling changes.
- **`soundSignature` is derived from a measured FR curve, but the schema stores a prose label.** The protocol says to derive the label from the curve (e.g. "elevated bass shelf + recessed mids → V-Shaped"), then names the exact schema members. For Noire, Crinacle's own row is the only Tier-3 data point and its label ("Warm V-shape") is not a member, so the mapping is a judgment call this pass had to make and document rather than a mechanical lookup. A schema that stored the reviewer's raw string alongside the enum, or that added a `Warm-V-Shaped` member, would remove the judgment call.
- **`portable` has no explicit manufacturer definition.** All four pages market travel-friendliness, but none uses the word "portable" as a spec. `portable: true` is recorded from folding-gimbal + travel-case + "Packs Small!" language. The protocol has no tie-break rule for a boolean M-tier field that is *not* feature-absent but is also never stated as such — the feature-absence exception covers silence → `false`, and this is the opposite case (implied → `true`) with no written rule. Recorded, flagged in the per-product rows, not improvised into the protocol.
