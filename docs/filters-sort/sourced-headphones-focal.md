# Focal Sourcing Results — `sang-logium-1xs.9.5`

Sourced against `schema-headphones.md` + `sourcing-protocol-headphones.md`
(2026-09-13 widened tiers). Products drawn from the real catalogue enumerated
in `sang-logium-1xs.9.5` — name/brand/price only; no other POC enrichment
field (`app/(test)/poc/filter-sort/headphones/dataset.json`) is treated as
ground truth. The live `filterAttributes` currently on these 8 Sanity docs is
prior migration output, not a source, and is overwritten field by field.

Tier legend: **H** hard spec, **M** marketing/feature fact, **E** editorial,
**D** derived, **I** internal (not sourced). Status flags: **NULL**
(exhausted, genuinely unfound), **FLAG** (recorded but low-confidence /
inference), **CONFLICT** (two same-tier manufacturer sources disagree).

Scope: all 8 products enumerated in `sang-logium-1xs.9.5`. Sourced per child
issue `sang-logium-1xs.9.5.1` … `.8`.

## Manufacturer sources actually opened

Every Focal page/PDF below was fetched and read, not quoted from a search
excerpt. Focal's live catalogue URLs are `focal.com/products/<slug>`;
`focal.com/en/headphones/<slug>` is a dead pattern (404) and was not used.

| # | Product | `_id` | Price |
|---|---|---|---|
| 1 | Focal Utopia | `moXlkADK7m1DHgGwWtUHWs` | $4,999.00 |
| 2 | Focal Bathys Headphones - Open Box | `moXlkADK7m1DHgGwWtX5bB` | $559.00 |
| 3 | Focal Radiance Headphones \| Limited Edition | `k27n1AQuIbSr5iozFz7E1H` | $890.00 |
| 4 | Focal Clear Mg Headphones | `k27n1AQuIbSr5iozFz7EsP` | $1,499.00 |
| 5 | Focal Celestee High-End Headphones | `k27n1AQuIbSr5iozFz7FSo` | $699.00 |
| 6 | Focal Azurys - Open Box | `k27n1AQuIbSr5iozFz7IlS` | $439.00 |
| 7 | Focal Hadenys | `Pn6oyV4Ks5AcNbecjgql0e` | $649.00 |
| 8 | Utopia 2022 | `PHPYj28HJdPDHAaIBADqsm` | $4,999.00 |

Manufacturer documents used (all opened and read):

- Product pages (live): `https://www.focal.com/products/{utopia,clear-mg,celestee,hadenys,azurys,bathys}`
- Product pages (archived — Radiance is discontinued and pulled from the live site; the last live Focal page is the Wayback capture `https://web.archive.org/web/20240621131446/https://www.focal.com/products/radiance-bentley`)
- User manuals / product sheets (PDF, read via `pdftotext -layout`):
  - Utopia: `https://dam.focal-naim.com/m/75168348b21e34b6/original/UserManual_Utopia_74x200_Web-pdf.pdf`
  - Clear Mg: `https://dam.focal-naim.com/m/15443cc8eacda39e/original/UserManual_ClearMG_85x200_web-pdf.pdf`
  - Celestee: `https://dam.focal-naim.com/m/57e89b6c50955937/original/User_Manual_CELESTEE_85x200_CODO1665_web-pdf.pdf`
  - Hadenys: `https://dam.focal-naim.com/m/29118ef5ebb678ea/original/Notice_Hadenys_Web-pdf.pdf`
  - Azurys: `https://dam.focal-naim.com/m/80f064a403195fa/original/Notice_Azurys_web-pdf.pdf`
  - Bathys: `https://dam.focal-naim.com/m/27830ac90e411d8/original/Notice_Bathys-pdf.pdf`
  - Radiance product sheet (archived): `https://web.archive.org/web/20211207080622if_/https://www.focal.com/sites/www.focal.fr/files/shared/catalog/document/fp_radiance_en_0.pdf`
  - Radiance user manual (archived): `https://web.archive.org/web/20211207080517if_/https://www.focal.com/sites/www.focal.fr/files/shared/catalog/document/usermanual_radiance_85x200_web.pdf`

## Cross-cutting CONFLICT: live web page vs. manufacturer manual

Three separate same-tier manufacturer conflicts were found and are recorded
here rather than silently resolved, per the issue's third acceptance test.
The protocol's manufacturer self-contradiction rule resolves by recency —
**the currently-live web product page wins over the older PDF manual
whenever they disagree**, because the live page is the one most likely to
reflect the current hardware revision. Each is cited in both directions.

| Product | Field | Live web page (kept) | Manual PDF (superseded) | Resolution |
|---|---|---|---|---|
| Utopia | `freqResponseHz` | `5 Hz – 23 kHz (+/- 3dB)` | `5Hz - 50kHz` | Live page is the current 2022-revision spec; manual is an older revision. Web value kept. |
| Celestee | `cableTermination` | `Jack 3.5 mm` only (page spec) | `1/8" TRS Jack connector` + `Jack adapter, 1/8" female – 1/4" male` | Manual additionally documents the bundled 6.35mm adapter, which the page's single Connector line omits. Manual's more complete set kept for the *multi* field (adapters are termination options); both cited. |
| Bathys | `cableTermination` | `Jack 3.5 mm, USB-C` | `1.2m mini-jack` + `1.2m USB Type-C®` | Same two connectors, different granularity/units — recorded as agreement, not conflict. |

## Two Utopia records in scope (products 1 and 8)

`moXlkADK7m1DHgGwWtUHWs` (`Utopia`) and `PHPYj28HJdPDHAaIBADqsm`
(`Utopia 2022`) are two separate Sanity documents with the **same price
($4,999.00)** and the same underlying hardware: Focal sells exactly one
current Utopia, and the live product page's own subtitle is "Utopia —
Reference open-back hi-fi headphones" with the 2022-revision specs (80 Ω,
1.08 lb / 490 g, 5 Hz–23 kHz). The live page does not carry a separate
"2022" SKU.

Both documents are in this issue's scope, so both are sourced and patched
with the same sourced values — no field is guessed differently for the
"2022" alias. This is recorded here explicitly so the duplicate is not
mistaken for a sourcing mistake: it is a catalogue-side duplicate that a
later de-duplication pass may want to collapse. Flagged, not invented
around.

## 1. Focal Utopia ($4,999.00) — `moXlkADK7m1DHgGwWtUHWs`

| Field | Tier | Value | Source | Status |
|---|---|---|---|---|
| impedanceOhms | H | `80` (Ω) | Focal Utopia product page + user manual | — |
| sensitivityDbMw | H | `104` (dB SPL / 1mW @ 1kHz) | Focal Utopia user manual | — |
| freqResponseHz | H | `{min:5, max:23000}` | Focal Utopia product page | CONFLICT-resolved — page `5 Hz – 23 kHz` wins over manual `5Hz - 50kHz` |
| driverType | H | `dynamic` | Focal Utopia product page (`pure Beryllium 'M'-shaped dome`) | — |
| driverConfigBucket / driverConfigDetail | H/D | `null` | — | NULL — domain-gated to IEM (should-be.md item 31), does not apply to an over-ear |
| cableLengthM | H | `1.5` (stock 3.5mm cable) | Focal Utopia product page (`1 x 5ft (1.5m) Jack 1/8" (3.5mm) cable`) | FLAG — two cables supplied (1.5m + 3m); schema models one value, stock SE cable recorded |
| awards | M | `null` | — | NULL — Focal page carries testimonial quotes only (no award badge); checked headphones.com, Bloom Audio, Audio46 and press review titles; no award designation found |
| productCategory | M | `["over-ear"]` | Focal product page (`open-back hi-fi headphones`, circum-aural) | — |
| wearingStyle | M | `["over-ear"]` | Focal product page (`Circum-aural`) | — |
| acousticDesign | M | `["open-back"]` | Focal product page (`Reference open-back hi-fi headphones`) | — |
| fitType | M | `null` | — | NULL — not an IEM, field does not apply |
| connectivity | M | `wired` | Focal product page (no Bluetooth/ANC/electronics anywhere; LEMO wired cables only) | — |
| portable | M | `false` | Focal product page + manual | FLAG — inferred from reference open-back design; no portability language anywhere |
| microphone | M | `false` | Focal product page + manual | FLAG — absence-based per protocol's boolean feature-absence exception |
| cableTermination | M | `["3.5mm", "6.35mm", "4-pin-xlr"]` | Focal Utopia product page (cables provided list) | FLAG — cable->cup side is LEMO® (not in the schema's closed vocabulary); recorded values are the supplied plug terminations plus the 6.35mm adapter |
| detachableCable | M | `true` | Focal Utopia user manual (`To disconnect the cable from the headphones, hold the ends of the cable by the "grip" (fig.2) to unlock`) | — |
| foldable | M | `false` | Focal Utopia manual | FLAG — only headband/yoke adjustment and a hard carry case described; absence-based |
| ipxRating | M | `null` | — | NULL — no IP/water-resistance claim found anywhere (expected for a reference open-back) |
| bluetoothCodecs | M | `null` | — | NULL — domain-gated, wired-only product |
| anc | M | `none` | derived from already-cited `acousticDesign: Open-Back` + `connectivity: wired` | — |
| batteryLifeHours | M | `{ancOff: null, ancOn: null}` | — | NULL — wired-only, no battery |
| soundSignature | E | `Neutral` (Tone Grade S-, Technical S-) | Crinacle rankings list | — |

### Citations (1)

- `filterAttributes.sourcing.{impedanceOhms, freqResponseHz, driverType, cableLengthM, productCategory, wearingStyle, acousticDesign, connectivity, cableTermination}`: url `https://www.focal.com/products/utopia`, quotes: `"Product type : Open-back headphones"` / `"Loudspeakers : 15/8" (40mm) pure Beryllium 'M'-shaped dome"` / `"Frequency response (+/- 3dB) : 5 Hz – 23 kHz"` / `"Impedance : 80 Ω"` / `"Maximum SPL (peak@1m) : 104 dB SPL"` / `"1 x 5ft (1.5m) Jack 1/8" (3.5mm) cable with Lemo® connectors"` / `"1 x 10ft (3m) 4-pin XLR cable with Lemo® connectors"` / `"1 x Jack adapter, 1/8" (3.5mm) point socket – 1/4" (6.35mm) point plug"` / `"Weight : 490 g / 1.08 lb"`. Tier `hard-spec`/`marketing-fact` as applicable, sourcedAt `2026-09-13`.
- `filterAttributes.sourcing.{sensitivityDbMw, detachableCable, foldable}`: url `https://dam.focal-naim.com/m/75168348b21e34b6/original/UserManual_Utopia_74x200_Web-pdf.pdf` (opened and read via `pdftotext -layout`), quotes: `"Sensitivity 104dB SPL / 1mW @ 1kHz"` / `"THD <0.2% @ 1kHz / 100dB SPL"` / `"Frequency response 5Hz - 50kHz"` / `"Cable provided • 1 x 5ft cable (1 x 1/4" TRS Jack connector and 2 x LEMO® connectors)"`. Tier `hard-spec`/`marketing-fact`, sourcedAt `2026-09-13`.
- `filterAttributes.sourcing.soundSignature`: url `https://crinacle.com/rankings/headphones/`, quote `"Neutral — Solid tuning with close to top-tier resolution. An inoffensive all-rounder that lives up to its reputation."` (entry "Focal Utopia", $4,000, Tone Grade S-, Technical Grade S-, star value rating). Tier `editorial`, sourcedAt `2026-09-13`. **Flagged**: the rankings row is not labeled "2022"; see the two-Utopia-records note above — treated as the same hardware.
- **CONFLICT (recorded, resolved by recency):** `freqResponseHz` — live page states `"5 Hz – 23 kHz (+/- 3dB)"`, the older manual states `"5Hz - 50kHz"`. Live page kept per the manufacturer self-contradiction rule; both cited. Utopia is a single current SKU, so this is a revision skew (the 50 kHz figure is the earlier measurement range), not two different products.
- **Sensitivity note:** Focal's *web page* publishes only `"Maximum SPL (peak@1m) : 104 dB SPL"`, a peak-SPL-at-1m figure, not a dB/mW sensitivity rating. The *manual* publishes the correctly-based `"Sensitivity 104dB SPL / 1mW @ 1kHz"`. The manual is used for `sensitivityDbMw` because it is the only source stating the field's actual basis — this is not a value conflict, since the page never claimed a dB/mW sensitivity.
- **Exhaustion trail (awards / portable / microphone / foldable):** Focal page (testimonials only), headphones.com, Bloom Audio, Audio46, and press review titles show no award designation; the full manual contains no portability, microphone, or folding-hinge language. Recorded as absence-based `false`/FLAG per the fan-out convention, not as a positive manufacturer statement.

## 2. Focal Bathys Headphones - Open Box ($559.00) — `moXlkADK7m1DHgGwWtX5bB`

| Field | Tier | Value | Source | Status |
|---|---|---|---|---|
| impedanceOhms | H | `null` | — | NULL — live page, full manual, and FAQ block all read; Focal publishes no impedance figure for this powered/ANC model |
| sensitivityDbMw | H | `null` | — | NULL — same exhaustion; no dB/mW sensitivity figure published anywhere for this powered model |
| freqResponseHz | H | `{min:15, max:22100}` | Focal Bathys product page + manual | — |
| driverType | H | `dynamic` | Focal Bathys product page (`40mm Aluminium-Magnesium 'M'-shaped dome`) | — |
| driverConfigBucket / driverConfigDetail | H/D | `null` | — | NULL — domain-gated to IEM, does not apply to an over-ear |
| cableLengthM | H | `1.2` | Focal Bathys manual (`1.2m mini-jack`) | FLAG — two cables supplied (1.2m jack + 1.2m USB-C); schema models one value, analog jack cable recorded |
| awards | M | `null` | — | NULL — no award badge on the Focal page (press quotes only, incl. a TechRadar recommendation quoted by Focal itself); audited retailers checked; no formal award designation found |
| productCategory | M | `["over-ear"]` | Focal Bathys product page (closed, circum-aural) | — |
| wearingStyle | M | `["over-ear"]` | Focal Bathys product page (`Circum-aural`) | — |
| acousticDesign | M | `["closed-back"]` | Focal Bathys product page (`Bluetooth closed headphones with active noise reduction`) | — |
| fitType | M | `null` | — | NULL — not an IEM, field does not apply |
| connectivity | M | `wireless` | Focal Bathys product page (`Bluetooth 5.1`, ANC, battery) | FLAG — also has wired fallback (jack + USB-DAC); primary marketed mode is wireless, recorded per the schema enum |
| portable | M | `true` | Focal Bathys product page (`the perfect travel companion`, `battery life of over 30 hours`) | — |
| microphone | M | `true` | Focal Bathys product page + manual (`Microphones : 8.0000`) | — |
| cableTermination | M | `["3.5mm", "usb-c"]` | Focal Bathys product page (`Connector : Jack 3.5 mm, USB-C`) | FLAG — `usb-c` not in the field's documented closed vocabulary; recorded verbatim because USB-C is a real supplied listenable termination (USB-DAC mode) the vocabulary cannot express — **schema vocabulary gap** |
| detachableCable | M | `true` | Focal Bathys manual (`Connect the cable to the jack input on the right-hand earcup`) | — |
| foldable | M | `false` | Focal Bathys manual | FLAG — manual describes a hard carrying case and earcup rotation, no folding/collapsing hinge; absence-based |
| ipxRating | M | `null` | — | NULL — no IP/water-resistance rating published for Bathys anywhere checked |
| bluetoothCodecs | M | `["SBC", "AAC", "aptX", "aptX Adaptive"]` | Focal Bathys product page (`Bluetooth Codec : AAC, aptX™, aptX™ Adaptive, SBC`) | — |
| anc | M | `anc` | Focal Bathys product page (`active noise cancelling`, Silent/Soft/Transparent modes) | — |
| batteryLifeHours | M | `{ancOff: 35, ancOn: 30}` | Focal Bathys product page (`30h in Bluetooth / 35h with mini Jack / 42h in USB-DAC`) | FLAG — the schema's `{ancOn, ancOff}` pair cannot map onto Focal's three modes; closest honest mapping recorded — **design gap** |
| soundSignature | E | `null` | — | NULL — exhausted: absent from Crinacle's rankings list, no Crinacle individual post (`crinacle.com/?s=Focal+Bathys` returns none; no `graphs/headphones/focal-bathys` page), no retrievable ASR measurement, no Rtings review; left null rather than inferred from Focal marketing copy, which the protocol forbids for this field |

### Citations (2)

- `filterAttributes.sourcing.{freqResponseHz, driverType, productCategory, wearingStyle, acousticDesign, connectivity, portable, microphone, cableTermination, bluetoothCodecs, anc, batteryLifeHours}`: url `https://www.focal.com/products/bathys`, quotes: `"Product type : Bluetooth closed headphones with active noise reduction"` / `"Loudspeakers : 15/8" (40mm) Aluminium/Magnesium 'M'-shaped dome"` / `"Frequency response (+/- 3dB) : 15 Hz - 22 kHz"` / `"Active noise cancelling : Yes"` / `"Bluetooth Codec : AAC, aptX™, aptX™ Adaptive, SBC"` / `"Connector : Jack 3.5 mm, USB-C"` / `"Microphones : 8.0000"` / `"Battery Autonomy : 30h in Bluetooth 35h with mini Jack connection 42h in USB-DAC mode"` / `"the perfect travel companion"` / `"Weight : 350 g / 0.77 lb"`. Tier `hard-spec`/`marketing-fact`, sourcedAt `2026-09-13`.
- `filterAttributes.sourcing.{freqResponseHz, driverType, microphone, cableLengthM, detachableCable, foldable}`: url `https://dam.focal-naim.com/m/27830ac90e411d8/original/Notice_Bathys-pdf.pdf` (opened and read via `pdftotext -layout`), quotes: `"Type Closed-back headphones, active, noise cancelling"` / `"Drivers 40mm Aluminium-Magnesium"` / `"Frequency response 15Hz to 22.1kHz"` / `"Microphones 8"` / `"Cables and connectors 1.2m mini-jack / 1.2m USB Type-C®"` / `"To use the headphones with the jack mode, you must use the jack cable supplied in the pack. Connect the cable to the jack input on the right-hand earcup"` / `"Carrying case 9.5x8.3x2.8" (24x21x7cm)"`. Tier `hard-spec`/`marketing-fact`, sourcedAt `2026-09-13`.
- **`impedanceOhms` / `sensitivityDbMw` exhaustion trail:** the live product page's entire "Sound - Acoustics" and "Sound - Electronics" blocks were read in full and contain no impedance or sensitivity line; the manual's spec table was read in full and likewise has no impedance or sensitivity row (it lists Type, Bluetooth, codecs, autonomy, drivers, frequency response, THD, battery, power supply, microphones, weight, cables). Focal publishes neither for this powered model — null is the exhausted result, not an early stop.
- **Schema vocabulary gap (flagged for design issue):** `cableTermination`'s documented closed vocabulary (`3.5mm`, `2.5mm-balanced`, `4.4mm-balanced`, `4-pin-xlr`, `6.35mm`) cannot express `USB-C`, which Bathys genuinely supplies as a listenable input (USB-DAC mode). Recorded verbatim rather than dropping the fact to fit the vocabulary.
- **Design gap (flagged for design issue):** `batteryLifeHours` models only `{ancOn, ancOff}`, but Bathys publishes three distinct autonomy figures across three listening modes (Bluetooth/ANC 30h, jack 35h, USB-DAC 42h). The closest honest mapping is recorded; the schema cannot represent the third mode.

## 3. Focal Radiance Headphones | Limited Edition ($890.00) — `k27n1AQuIbSr5iozFz7E1H`

Discontinued by Focal and removed from the live catalogue (`focal.com/products/radiance` and `focal.com/products/radiance-bentley` both 404 live). Per the protocol's tier order this is still a **manufacturer** source: the official Focal product sheet and user manual PDFs plus the last live Focal product page, all retrieved from the Internet Archive as published by Focal. No retailer or press source was needed for any field on this product.

| Field | Tier | Value | Source | Status |
|---|---|---|---|---|
| impedanceOhms | H | `35` (Ω) | Focal Radiance product sheet + user manual | — |
| sensitivityDbMw | H | `105` (dB SPL / 1mW @ 1kHz) | Focal Radiance product sheet + user manual | — |
| freqResponseHz | H | `{min:5, max:23000}` | Focal Radiance product sheet + user manual | — |
| driverType | H | `dynamic` | Focal Radiance product sheet (`15/8" (40mm) aluminium/magnesium "M" shape dome`) | — |
| driverConfigBucket / driverConfigDetail | H/D | `null` | — | NULL — domain-gated to IEM, does not apply to an over-ear |
| cableLengthM | H | `1.2` | Focal Radiance product sheet (`1 x 4ft. (1.2m) OFC 24 AWG cable`) | — |
| awards | M | `null` | — | NULL — no award designation on the Focal sheet/page (the Bentley relationship is a co-branding licence, not an award) |
| productCategory | M | `["over-ear"]` | Focal Radiance product sheet (`Circum-aural closed-back headphones`) | — |
| wearingStyle | M | `["over-ear"]` | Focal Radiance product sheet (`Circum-aural`) | — |
| acousticDesign | M | `["closed-back"]` | Focal Radiance product sheet (`complement the range of Focal closed-back headphones`) | — |
| fitType | M | `null` | — | NULL — not an IEM, field does not apply |
| connectivity | M | `wired` | Focal Radiance product sheet (detachable mini-jack cable only; no electronics) | — |
| portable | M | `true` | Focal Radiance product sheet (`For use at home and on the move`) | — |
| microphone | M | `false` | Focal Radiance product sheet + user manual | FLAG — absence-based per protocol's boolean feature-absence exception |
| cableTermination | M | `["3.5mm", "6.35mm"]` | Focal Radiance product sheet (`1/8" (3.5mm) unbalanced TRS jack connector` + `jack adapter, 1/8" (3.5mm) point socket – 1/4" (6.35mm) point plug`) | — |
| detachableCable | M | `true` | Focal Radiance user manual (`you simply have to disconnect the cable and store it in the case`) | — |
| foldable | M | `false` | Focal Radiance product sheet + user manual | FLAG — hard-shell carry case described, no folding hinge; absence-based |
| ipxRating | M | `null` | — | NULL — no IP/water-resistance claim found anywhere |
| bluetoothCodecs | M | `null` | — | NULL — domain-gated, wired-only product |
| anc | M | `none` | derived from already-cited `acousticDesign: Closed-Back` + `connectivity: wired` | FLAG — closed-back gives passive isolation only; no electronics, so no ANC |
| batteryLifeHours | M | `{ancOff: null, ancOn: null}` | — | NULL — wired-only, no battery |
| soundSignature | E | `Neutral` (Tone Grade B, Technical Grade B) | Crinacle rankings list | — |

### Citations (3)

- `filterAttributes.sourcing.{impedanceOhms, sensitivityDbMw, freqResponseHz, driverType, cableLengthM, productCategory, wearingStyle, acousticDesign, cableTermination, portable, foldable}`: url `https://web.archive.org/web/20211207080622if_/https://www.focal.com/sites/www.focal.fr/files/shared/catalog/document/fp_radiance_en_0.pdf` (official Focal product sheet, opened and read via `pdftotext -layout`), quotes: `"The Radiance headphones, under licence of Bentley Motors, complement the range of Focal closed-back headphones"` / `"Type Circum-aural closed-back headphones"` / `"Impedance 35 Ohms"` / `"Sensitivity 105dB SPL / 1mW @ 1 kHz"` / `"THD 0,1% @ 1kHz / 100dB SPL"` / `"Frequency response 5Hz – 23kHz"` / `"Speaker driver 15/8" Aluminium/Magnesium "M" shape dome"` / `"Weight 0.96lbs (435g)"` / `"Cables supplied • 1 x 4ft. (1.2m) OFC 24 AWG cable with 1/8" (3.5mm) unbalanced TRS jack connector • 1 x jack adapter, 1/8" (3.5mm) point socket – 1/4" (6.35mm) point plug"` / `"For use at home and on the move"`. Tier `hard-spec`/`marketing-fact`, sourcedAt `2026-09-13`.
- `filterAttributes.sourcing.{impedanceOhms, sensitivityDbMw, freqResponseHz, detachableCable}` (corroborating): url `https://web.archive.org/web/20211207080517if_/https://www.focal.com/sites/www.focal.fr/files/shared/catalog/document/usermanual_radiance_85x200_web.pdf` (official Focal user manual, opened and read via `pdftotext -layout`), quotes: `"Type Casque fermé circum-aural"` / `"Impedance 35 Ohms"` / `"Sensitivity 105dB SPL / 1mW @ 1kHz"` / `"Frequency response 5Hz–23kHz"` / `"you simply have to disconnect the cable and store it in the case"`. Tier `hard-spec`/`marketing-fact`, sourcedAt `2026-09-13`.
- `filterAttributes.sourcing.soundSignature`: url `https://crinacle.com/rankings/headphones/`, quote `"Harman neutral — Probably the best of the closed-back Focals. Some tuning refinements over the Stellia, though technically limited."` (entry "Focal Radiance", $1,300, Tone Grade B+, Technical Grade B). Tier `editorial`, sourcedAt `2026-09-13`. **Flagged**: the rankings row is not labeled "Limited Edition" — Radiance shipped only as the Bentley licensed limited edition, so the row is the same SKU.
- **Discontinued-source note:** Focal's live pages for this product return 404 (`focal.com/products/radiance`, `focal.com/products/radiance-bentley`), confirming end-of-life. The product sheet footer reads `Focal® is a Focal-JMLab® brand - www.focal.com - SCAF - v3 - 28/05/2021` and the archived live-page capture is 2024-06-21 — both are Focal's own published documents, so this stays a Tier-1/Tier-2 manufacturer source rather than a fallback tier.

## 4. Focal Clear Mg Headphones ($1,499.00) — `k27n1AQuIbSr5iozFz7EsP`

| Field | Tier | Value | Source | Status |
|---|---|---|---|---|
| impedanceOhms | H | `55` (Ω) | Focal Clear Mg product page + user manual | — |
| sensitivityDbMw | H | `104` (dB SPL / 1mW @ 1kHz) | Focal Clear Mg user manual | — |
| freqResponseHz | H | `{min:5, max:23000}` | Focal Clear Mg product page + user manual | CONFLICT-resolved — page `5 Hz – 23 kHz` kept over manual `5Hz–28kHz` |
| driverType | H | `dynamic` | Focal Clear Mg product page (`Magnesium 'M'-shaped dome`) | — |
| driverConfigBucket / driverConfigDetail | H/D | `null` | — | NULL — domain-gated to IEM, does not apply to an over-ear |
| cableLengthM | H | `1.2` (unbalanced cable) | Focal Clear Mg product page + user manual (`1,2m unbalanced cable`) | FLAG — two cables supplied (1.2m unbalanced + 3m balanced); schema models one value, unbalanced recorded |
| awards | M | `null` | — | NULL — Focal page has testimonial quotes including `"Focal Clear MG are the best of today's headphones for the Wired Over-Ear category."` (a press outlet's category statement, not an award granted to the product); no award badge on the page; no designation found at audited retailers |
| productCategory | M | `["over-ear"]` | Focal Clear Mg product page (open-back, circum-aural) | — |
| wearingStyle | M | `["over-ear"]` | Focal Clear Mg product page (`Circum-aural`) | — |
| acousticDesign | M | `["open-back"]` | Focal Clear Mg product page (`Open-back hi-fi headphones for the home`) | — |
| fitType | M | `null` | — | NULL — not an IEM, field does not apply |
| connectivity | M | `wired` | Focal Clear Mg product page (no electronics; wired cables only) | — |
| portable | M | `false` | Focal Clear Mg product page (`for the home`) + manual (hard case, home use) | FLAG — inferred; "for the home" is close to explicit but the page has no portable/desktop field |
| microphone | M | `false` | Focal Clear Mg product page + user manual | FLAG — absence-based per protocol's boolean feature-absence exception |
| cableTermination | M | `["3.5mm", "6.35mm", "4-pin-xlr"]` | Focal Clear Mg product page (`1 x 4ft (1.2m) Jack 1/8" cable`, `1 x 10ft (3m) 4-pin XLR cable`, `Jack adapter, 1/8" (3.5mm) female – 1/4" (6.35mm) male`) | — |
| detachableCable | M | `true` | Focal Clear Mg user manual (`you simply have to disconnect the cable and store it in the case`) | — |
| foldable | M | `false` | Focal Clear Mg product page + user manual | FLAG — hard carrying case described, no folding hinge; absence-based |
| ipxRating | M | `null` | — | NULL — no IP/water-resistance claim found anywhere |
| bluetoothCodecs | M | `null` | — | NULL — domain-gated, wired-only product |
| anc | M | `none` | derived from already-cited `acousticDesign: Open-Back` + `connectivity: wired` | — |
| batteryLifeHours | M | `{ancOff: null, ancOn: null}` | — | NULL — wired-only, no battery |
| soundSignature | E | `Warm` (Tone Grade B-, Technical Grade A-) | Crinacle rankings list + Crinacle individual review post | — |

### Citations (4)

- `filterAttributes.sourcing.{impedanceOhms, freqResponseHz, driverType, cableLengthM, productCategory, wearingStyle, acousticDesign, connectivity, cableTermination, portable}`: url `https://www.focal.com/products/clear-mg`, quotes: `"Product type : Open-back headphones"` / `"Loudspeakers : 15/8" (40mm) Magnesium 'M'-shaped dome"` / `"Frequency response (+/- 3dB) : 5 Hz – 23 kHz"` / `"Impedance : 55 Ω"` / `"Maximum SPL (peak@1m) : 104 dB SPL"` / `"1 x 4ft (1.2m) Jack 1/8" cable"` / `"1 x 10ft (3m) 4-pin XLR cable"` / `"1 Jack adapter,1/8" (3.5mm) female – 1/4" (6.35mm) male"` / `"Weight : 450 g / 0.99 lb"`. Tier `hard-spec`/`marketing-fact`, sourcedAt `2026-09-13`.
- `filterAttributes.sourcing.{sensitivityDbMw, freqResponseHz, cableLengthM, detachableCable, foldable}`: url `https://dam.focal-naim.com/m/15443cc8eacda39e/original/UserManual_ClearMG_85x200_web-pdf.pdf` (opened and read via `pdftotext -layout`), quotes: `"Type Circum-aural open-back headphones"` / `"Impedance 55 Ohms"` / `"Sensitivity 104dB SPL / 1mW @ 1kHz"` / `"THD 0.25% @ 1kHz / 100 dB SPL"` / `"Frequency response 5Hz–28kHz"` / `"Cable provided • 3m balanced cable (XLR 4-pin) • 1,2m unbalanced cable (1/8" TRS Jack) • 1/8" Jack to 1/4" stereo Jack adapter"`. Tier `hard-spec`/`marketing-fact`, sourcedAt `2026-09-13`.
- `filterAttributes.sourcing.soundSignature`: url `https://crinacle.com/rankings/headphones/`, quote `"Warm neutral — Lacks upper mids and resolution compared to its predecessor."` (entry "Focal Clear Mg", $1,500, Tone Grade B-, Technical Grade A-). Corroborated by url `https://crinacle.com/2021/03/22/crinnotes-focal-clear-mg-quick-review-padgate/` (fetched and read directly), quote `"The Clear Mg is definitely warmer and possesses less upper mids than the original."` with overall grade `"B"` (Tone B, Technical A-). Tier `editorial`, sourcedAt `2026-09-13`.
- **CONFLICT (recorded, resolved by recency):** `freqResponseHz` — live page states `"5 Hz – 23 kHz (+/- 3dB)"`, the manual states `"5Hz–28kHz"`. Live page kept per the manufacturer self-contradiction rule; both cited.
- **Sensitivity correction:** the earlier pilot pass (`docs/filters-sort/pilot-headphones-sourced.md`, product 3) recorded `sensitivityDbMw` as **null** because the *web page* publishes only `"104 dB SPL (peak@1m)"`, a peak-SPL figure rather than a dB/mW rating. The protocol's widened tier 1 explicitly makes the manufacturer manual "an equally-authoritative manufacturer document, not a lesser fallback" and requires PDFs to actually be opened — the Clear Mg manual publishes the correctly-based `"Sensitivity 104dB SPL / 1mW @ 1kHz"`. This pass therefore writes `104` with the manual as citation and supersedes the pilot's null. The pilot's diagnosis (the page's figure is mislabeled as sensitivity) was correct; the conclusion (field is unfindable) is not, once the manual tier is actually opened.

## 5. Focal Celestee High-End Headphones ($699.00) — `k27n1AQuIbSr5iozFz7FSo`

| Field | Tier | Value | Source | Status |
|---|---|---|---|---|
| impedanceOhms | H | `35` (Ω) | Focal Celestee product page + user manual | — |
| sensitivityDbMw | H | `105` (dB SPL / 1mW @ 1kHz) | Focal Celestee user manual | — |
| freqResponseHz | H | `{min:5, max:23000}` | Focal Celestee product page + user manual | — |
| driverType | H | `dynamic` | Focal Celestee product page (`Aluminium/Magnesium 'M'-shaped dome`) | — |
| driverConfigBucket / driverConfigDetail | H/D | `null` | — | NULL — domain-gated to IEM, does not apply to an over-ear |
| cableLengthM | H | `1.2` | Focal Celestee product page + user manual (`1 x 4ft (1.2m) Jack 1/8" (3.5mm) cable`) | — |
| awards | M | `null` | — | NULL — Focal page carries a SoundStage Solo quote, not an award badge; no designation found at audited retailers |
| productCategory | M | `["over-ear"]` | Focal Celestee product page (closed, circum-aural) | — |
| wearingStyle | M | `["over-ear"]` | Focal Celestee product page (`Circum-aural`) | — |
| acousticDesign | M | `["closed-back"]` | Focal Celestee product page (`Closed hi-fi headphones`) | — |
| fitType | M | `null` | — | NULL — not an IEM, field does not apply |
| connectivity | M | `wired` | Focal Celestee product page (no electronics; wired cable only) | — |
| portable | M | `true` | Focal Celestee product page (`a cable suitable for both home and portable use`) | — |
| microphone | M | `false` | Focal Celestee product page + user manual | FLAG — absence-based per protocol's boolean feature-absence exception |
| cableTermination | M | `["3.5mm", "6.35mm"]` | Focal Celestee user manual (`1/8" TRS Jack connector` + `Jack adapter, 1/8" female – 1/4" male`) | CONFLICT-resolved — see cross-cutting table; manual's bundled-adapter detail kept over the page's bare `Jack 3.5 mm` |
| detachableCable | M | `true` | Focal Celestee user manual (`you simply have to disconnect the cable and store it in the case`) | — |
| foldable | M | `false` | Focal Celestee product page + user manual | FLAG — hard carrying case described, no folding hinge; absence-based |
| ipxRating | M | `null` | — | NULL — no IP/water-resistance claim found anywhere |
| bluetoothCodecs | M | `null` | — | NULL — domain-gated, wired-only product |
| anc | M | `none` | derived from already-cited `acousticDesign: Closed-Back` + `connectivity: wired` | FLAG — closed-back gives passive isolation only; the page markets "added isolation", not ANC, and there are no electronics |
| batteryLifeHours | M | `{ancOff: null, ancOn: null}` | — | NULL — wired-only, no battery |
| soundSignature | E | `Neutral` (Tone Grade B-, Technical Grade C) | Crinacle rankings list | — |

### Citations (5)

- `filterAttributes.sourcing.{impedanceOhms, freqResponseHz, driverType, cableLengthM, productCategory, wearingStyle, acousticDesign, connectivity, portable, cableTermination}`: url `https://www.focal.com/products/celestee`, quotes: `"Product type : Closed-back headphones"` / `"Loudspeakers : 15/8" (40mm) Aluminium/Magnesium 'M'-shaped dome"` / `"Frequency response (+/- 3dB) : 5 Hz – 23 kHz"` / `"Impedance : 35 Ω"` / `"Maximum SPL (peak@1m) : 105 dB SPL"` / `"Connector : Jack 3.5 mm"` / `"1 x 4ft (1.2m) Jack 1/8" (3.5mm) cable"` / `"a cable suitable for both home and portable use"` / `"Weight : 430 g / 0.95 lb"`. Tier `hard-spec`/`marketing-fact`, sourcedAt `2026-09-13`.
- `filterAttributes.sourcing.{sensitivityDbMw, cableTermination, detachableCable, foldable}`: url `https://dam.focal-naim.com/m/57e89b6c50955937/original/User_Manual_CELESTEE_85x200_CODO1665_web-pdf.pdf` (opened and read via `pdftotext -layout`), quotes: `"Type Circum-aural closed-back headphones"` / `"Impedance 35 Ohms"` / `"Sensitivity 105dB SPL / 1mW @ 1kHz"` / `"THD 0.1% @ 1 kHz / 100 dB SPL"` / `"Frequency response 5Hz – 23kHz"` / `"Cable provided • 1 x 4ft OFC 24 AWG cable with 1/8" TRS Jack connector • 1 x Jack adapter, 1/8" female – 1/4" male"`. Tier `hard-spec`/`marketing-fact`, sourcedAt `2026-09-13`.
- `filterAttributes.sourcing.soundSignature`: url `https://crinacle.com/rankings/headphones/`, quote `"Neutral with bass boost — Thin and uneven mids with narrow, congested staging."` (entry "Focal Celestee", $1,000, Tone Grade B-, Technical Grade C). Tier `editorial`, sourcedAt `2026-09-13`.
- **CONFLICT (recorded):** `cableTermination` — the live page's Connectivity block lists only `"Connector : Jack 3.5 mm"`, while the manual documents both the `"1/8" TRS Jack connector"` and the bundled `"Jack adapter, 1/8" female – 1/4" male"`. This is not a value disagreement so much as the page omitting the adapter; both are cited and the more complete two-value set is kept, since the adapter is a genuine supplied termination.
- **`portable: true` note:** unlike the open-back home models in this batch, Celestee's page explicitly markets dual home/portable use and its closed-back isolation; recorded `true` from that page language rather than inferred.

## 6. Focal Azurys - Open Box ($439.00) — `k27n1AQuIbSr5iozFz7IlS`

| Field | Tier | Value | Source | Status |
|---|---|---|---|---|
| impedanceOhms | H | `26` (Ω) | Focal Azurys product page + user manual | — |
| sensitivityDbMw | H | `100` (dB SPL / 1mW @ 1kHz) | Focal Azurys user manual | — |
| freqResponseHz | H | `{min:15, max:22000}` | Focal Azurys product page + user manual | — |
| driverType | H | `dynamic` | Focal Azurys product page (`Aluminium/Magnesium 'M'-shaped dome`) | — |
| driverConfigBucket / driverConfigDetail | H/D | `null` | — | NULL — domain-gated to IEM, does not apply to an over-ear |
| cableLengthM | H | `1.25` | Focal Azurys user manual (`4ft (1.25m) mini-jack cable`) | — |
| awards | M | `null` | — | NULL — no award badge on the Focal page; no designation found at audited retailers |
| productCategory | M | `["over-ear"]` | Focal Azurys product page (closed, circum-aural) | — |
| wearingStyle | M | `["over-ear"]` | Focal Azurys product page (`Circum-aural`) | — |
| acousticDesign | M | `["closed-back"]` | Focal Azurys product page + manual (`Circum-aural closed-back headphones`) | — |
| fitType | M | `null` | — | NULL — not an IEM, field does not apply |
| connectivity | M | `wired` | Focal Azurys product page + manual (wired mini-jack only; no Bluetooth/ANC despite the mobile-cable remote) | — |
| portable | M | `true` | Focal Azurys user manual (carrying case + `turning the earcups to face inwards, and storing the cable in the space provided` + mobile cable with remote) | FLAG — inferred from supplied carry-case/mobile-cable usage pattern and 306 g weight; page itself has no portable field |
| microphone | M | `true` | Focal Azurys product page + user manual (`4ft (1.25m) mini-jack cable with remote control and microphone`, `The cable supplied with the Azurys headphones includes a remote control with a microphone and a button`) | — |
| cableTermination | M | `["3.5mm"]` | Focal Azurys product page (`Connector : Jack 3.5 mm`) + manual (`mini-jack cable`) | — |
| detachableCable | M | `true` | Focal Azurys user manual (`Connect the 1/8” (3.5mm) jack adapter to the connector located on the left-hand earcup of the headphones`) | — |
| foldable | M | `false` | Focal Azurys user manual | FLAG — manual describes only earcup rotation (earcups turned inwards for casing) and cable stowage; no folding hinge/lock described, so this is a swivel, not the schema's `foldable`; absence-based |
| ipxRating | M | `null` | — | NULL — no IP/water-resistance claim found anywhere |
| bluetoothCodecs | M | `null` | — | NULL — domain-gated, wired-only product |
| anc | M | `none` | derived from already-cited `acousticDesign: Closed-Back` + `connectivity: wired` | FLAG — closed-back gives passive isolation only; no ANC electronics |
| batteryLifeHours | M | `{ancOff: null, ancOn: null}` | — | NULL — wired-only, no battery |
| soundSignature | E | `null` | — | NULL — exhausted: absent from Crinacle's rankings list (no "Azurys" row), no Crinacle individual post (`crinacle.com/?s=Focal+Azurys` returns none; no `graphs/headphones/focal-azurys` page), no ASR/Rtings review; left null rather than inferred from Focal marketing copy, which the protocol forbids |

### Citations (6)

- `filterAttributes.sourcing.{impedanceOhms, freqResponseHz, driverType, productCategory, wearingStyle, acousticDesign, connectivity, portable, microphone, cableTermination}`: url `https://www.focal.com/products/azurys`, quotes: `"Product type : Closed-back headphones"` / `"Loudspeakers : 15/8'' (40mm) Aluminium/ Magnesium 'M'-shaped dome"` / `"Frequency response (+/- 3dB) : 15 Hz - 22 kHz"` / `"Impedance : 26 Ω"` / `"Maximum SPL (peak@1m) : 100 dB SPL"` / `"Connector : Jack 3.5 mm"` / `"1x 4ft (1.25m) Jack 1/8" (3.5mm) cable"` / `"1 x remote control and microphone"` / `"Weight : 306 g (excluding carrying case)"` (weight from manual). Tier `hard-spec`/`marketing-fact`, sourcedAt `2026-09-13`.
- `filterAttributes.sourcing.{sensitivityDbMw, freqResponseHz, cableLengthM, microphone, portable, foldable, detachableCable}`: url `https://dam.focal-naim.com/m/80f064a403195fa/original/Notice_Azurys_web-pdf.pdf` (opened and read via `pdftotext -layout`), quotes: `"Type Circum-aural closed-back headphones"` / `"Impedance 26Ω"` / `"Sensitivity 100dB SPL / 1mW @ 1kHz"` / `"THD 0.3% @ 1kHz / 100dB SPL"` / `"Frequency response 15Hz – 22kHz"` / `"Speaker drivers 15/8" (40mm) 'M'-shaped Aluminium/Magnesium dome"` / `"Weight 306g (excluding carrying case)"` / `"Cable provided 4ft (1.25m) mini-jack cable with remote control and microphone"` / `"The cable supplied with the Azurys headphones includes a remote control with a microphone and a button (fig. 3)"` / `"turning the earcups to face inwards, and storing the cable in the space provided for this purpose (fig. 4)"`. Tier `hard-spec`/`marketing-fact`, sourcedAt `2026-09-13`.
- **`microphone: true` note:** unlike every other product in this batch, Azurys genuinely ships a mic — it is on the supplied cable's inline remote, which the product page and manual both state and the manual depicts in a numbered figure. Recorded `true` from that explicit manufacturer language, not from the boolean feature-absence rule.
- **No soundSignature citation** — the tier-3 source list was exhausted with no Azurys measurement found; left null rather than inferred, per the protocol's explicit prohibition on using manufacturer marketing copy for this field.
- **`foldable: false` distinction:** the manual's "turning the earcups to face inwards" is a rotation for casing, not a folding hinge — recorded as `false` for the schema's `foldable` (a hinge/collapse feature) rather than as a positive, matching how the HiFiMan fan-out handled the same distinction.

## 7. Focal Hadenys ($649.00) — `Pn6oyV4Ks5AcNbecjgql0e`

| Field | Tier | Value | Source | Status |
|---|---|---|---|---|
| impedanceOhms | H | `26` (Ω) | Focal Hadenys product page + user manual | — |
| sensitivityDbMw | H | `100` (dB SPL / 1mW @ 1kHz) | Focal Hadenys user manual | — |
| freqResponseHz | H | `{min:25, max:22000}` | Focal Hadenys product page + user manual | — |
| driverType | H | `dynamic` | Focal Hadenys product page (`Aluminium/Magnesium 'M'-shaped dome`) | — |
| driverConfigBucket / driverConfigDetail | H/D | `null` | — | NULL — domain-gated to IEM, does not apply to an over-ear |
| cableLengthM | H | `1.8` | Focal Hadenys product page + user manual (`6ft (1.8m) mini-jack cable`) | — |
| awards | M | `null` | — | NULL — Focal page carries press quotes only; no award badge; no designation found at audited retailers |
| productCategory | M | `["over-ear"]` | Focal Hadenys product page (`Open-back headphones`, circum-aural) | — |
| wearingStyle | M | `["over-ear"]` | Focal Hadenys product page (`Circum-aural`) | — |
| acousticDesign | M | `["open-back"]` | Focal Hadenys product page (`Open-back headphones for the home`) | — |
| fitType | M | `null` | — | NULL — not an IEM, field does not apply |
| connectivity | M | `wired` | Focal Hadenys product page + manual (`Circum-aural open-back Headphones wired`) | — |
| portable | M | `false` | Focal Hadenys product page (`for the home`) | FLAG — inferred; page markets home use and the lightweight build is framed as listening comfort, not travel |
| microphone | M | `false` | Focal Hadenys product page + user manual | FLAG — absence-based per protocol's boolean feature-absence exception |
| cableTermination | M | `["3.5mm", "6.35mm"]` | Focal Hadenys product page (`Connector : Jack 3.5 mm, Jack 6.35 mm`) + manual (`6ft (1.8m) mini-jack cable, 1/4'' (6.3mm) jack adapter`) | — |
| detachableCable | M | `true` | Focal Hadenys user manual (cable plugged into the left earcup connector; detachable) | — |
| foldable | M | `false` | Focal Hadenys user manual (`transport en faisant pivoter les écouteurs vers l'intérieur` — earcup rotation only) | FLAG — same swivel-vs-hinge distinction as Azurys; absence-based |
| ipxRating | M | `null` | — | NULL — no IP/water-resistance claim found anywhere |
| bluetoothCodecs | M | `null` | — | NULL — domain-gated, wired-only product |
| anc | M | `none` | derived from already-cited `acousticDesign: Open-Back` + `connectivity: wired` | — |
| batteryLifeHours | M | `{ancOff: null, ancOn: null}` | — | NULL — wired-only, no battery |
| soundSignature | E | `null` | — | NULL — exhausted: absent from Crinacle's rankings list (no "Hadenys" row), no Crinacle individual post (no `graphs/headphones/focal-hadenys` page), no ASR/Rtings review; left null rather than inferred from Focal marketing copy |

### Citations (7)

- `filterAttributes.sourcing.{impedanceOhms, freqResponseHz, driverType, cableLengthM, productCategory, wearingStyle, acousticDesign, connectivity, portable, cableTermination}`: url `https://www.focal.com/products/hadenys`, quotes: `"Product type : Open-back headphones"` / `"Loudspeakers : 15/8'' (40mm) Aluminium/ Magnesium 'M'-shaped dome"` / `"Frequency response (+/- 3dB) : 25 Hz - 22 kHz"` / `"Impedance : 26 Ω"` / `"Maximum SPL (peak@1m) : 105 dB SPL"` / `"Connector : Jack 3.5 mm, Jack 6.35 mm"` / `"1X 6ft (1.8m) Jack 1/8" (3,5mm)"` / `"1 x adapter 1/4" (6.35mm)"` / `"Weight : 294 g / 0.65 lb"` / `"Open-back headphones for the home"`. Tier `hard-spec`/`marketing-fact`, sourcedAt `2026-09-13`.
- `filterAttributes.sourcing.{sensitivityDbMw, cableLengthM, detachableCable, foldable, connectivity}`: url `https://dam.focal-naim.com/m/29118ef5ebb678ea/original/Notice_Hadenys_Web-pdf.pdf` (opened and read via `pdftotext -layout`), quotes: `"Type Circum-aural open-back Headphones wired"` / `"Impedance 26Ω"` / `"Sensitivity 100dB SPL / 1mW @ 1kHz"` / `"THD 0.2% @ 1kHz / 100dB SPL"` / `"Frequency response 25Hz - 22kHz"` / `"Speaker drivers 15/8'' (40mm) 'M'-shaped Aluminium/Magnesium dome"` / `"Weight 294g (without carrying case)"` / `"Cable provided 6ft (1.8m) mini-jack cable, 1/4'' (6.3mm) jack adapter"` / `"transport en faisant pivoter les écouteurs vers l'intérieur"` (earcup rotation for transit, no folding hinge). Tier `hard-spec`/`marketing-fact`, sourcedAt `2026-09-13`.
- **No soundSignature citation** — tier-3 sources exhausted with no Hadenys measurement found; left null rather than inferred, per the protocol's explicit prohibition on using manufacturer marketing copy for this field.
- **`portable: false` note:** Hadenys is unusually light (294 g) and Focal markets that lightness, but exclusively as long-session listening comfort at home; no travel/commute framing appears, unlike Celestee's explicit "home and portable use". Recorded `false` on that basis and flagged as inference.

## 8. Utopia 2022 ($4,999.00) — `PHPYj28HJdPDHAaIBADqsm`

Same hardware as product 1 — see the two-Utopia-records note above. Every field carries the identical value and the identical citation as product 1; no field is guessed differently for the "2022" alias.

| Field | Tier | Value | Source | Status |
|---|---|---|---|---|
| impedanceOhms | H | `80` (Ω) | Focal Utopia product page + user manual | — |
| sensitivityDbMw | H | `104` (dB SPL / 1mW @ 1kHz) | Focal Utopia user manual | — |
| freqResponseHz | H | `{min:5, max:23000}` | Focal Utopia product page | CONFLICT-resolved — page `5 Hz – 23 kHz` wins over manual `5Hz - 50kHz` |
| driverType | H | `dynamic` | Focal Utopia product page (`pure Beryllium 'M'-shaped dome`) | — |
| driverConfigBucket / driverConfigDetail | H/D | `null` | — | NULL — domain-gated to IEM, does not apply to an over-ear |
| cableLengthM | H | `1.5` (stock 3.5mm cable) | Focal Utopia product page (`1 x 5ft (1.5m) Jack 1/8" (3.5mm) cable`) | FLAG — two cables supplied (1.5m + 3m); schema models one value, stock SE cable recorded |
| awards | M | `null` | — | NULL — same exhaustion as product 1 (testimonial quotes only; no award designation) |
| productCategory | M | `["over-ear"]` | Focal product page (circum-aural) | — |
| wearingStyle | M | `["over-ear"]` | Focal product page (`Circum-aural`) | — |
| acousticDesign | M | `["open-back"]` | Focal product page (`Reference open-back hi-fi headphones`) | — |
| fitType | M | `null` | — | NULL — not an IEM, field does not apply |
| connectivity | M | `wired` | Focal product page (LEMO wired cables only; no electronics) | — |
| portable | M | `false` | Focal product page + manual | FLAG — inferred from reference open-back design; no portability language anywhere |
| microphone | M | `false` | Focal product page + manual | FLAG — absence-based per protocol's boolean feature-absence exception |
| cableTermination | M | `["3.5mm", "6.35mm", "4-pin-xlr"]` | Focal Utopia product page (cables provided list) | FLAG — cable->cup side is LEMO®, outside the schema's closed vocabulary |
| detachableCable | M | `true` | Focal Utopia user manual (LEMO connector unlock procedure) | — |
| foldable | M | `false` | Focal Utopia manual | FLAG — only headband/yoke adjustment and a hard carry case described; absence-based |
| ipxRating | M | `null` | — | NULL — no IP/water-resistance claim found anywhere |
| bluetoothCodecs | M | `null` | — | NULL — domain-gated, wired-only product |
| anc | M | `none` | derived from already-cited `acousticDesign: Open-Back` + `connectivity: wired` | — |
| batteryLifeHours | M | `{ancOff: null, ancOn: null}` | — | NULL — wired-only, no battery |
| soundSignature | E | `Neutral` (Tone Grade S-, Technical S-) | Crinacle rankings list | — |

### Citations (8)

Identical to product 1's citations, reused verbatim because it is the same product:

- url `https://www.focal.com/products/utopia` — quotes as in section 1. Tier `hard-spec`/`marketing-fact`, sourcedAt `2026-09-13`.
- url `https://dam.focal-naim.com/m/75168348b21e34b6/original/UserManual_Utopia_74x200_Web-pdf.pdf` — quotes as in section 1. Tier `hard-spec`/`marketing-fact`, sourcedAt `2026-09-13`.
- url `https://crinacle.com/rankings/headphones/`, quote `"Neutral — Solid tuning with close to top-tier resolution. An inoffensive all-rounder that lives up to its reputation."` Tier `editorial`, sourcedAt `2026-09-13`.
- **Duplicate-record note:** this document's Sanity `name` is `Utopia 2022` while product 1's is `Utopia`; both hold $4,999.00 and both map to Focal's single current Utopia SKU. Sourced identically rather than fabricating a second distinct spec set. Flagged for a catalogue de-duplication pass — not resolved here, because removing a product from the catalogue is outside this issue's scope (`sang-logium-1xs.9.5` requires the product list to match its 8 enumerated `_id`s exactly).

## Verification status

Per the issue's second acceptance test, a **separate independent pass** (mirroring `pilot-headphones-verification.md`) must open each citation above and confirm the source actually states the recorded value. That pass has **not** been run here — this document is the sourcing artifact it will verify against.
