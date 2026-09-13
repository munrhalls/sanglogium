# Sourced Data — Meze Audio (`sang-logium-1xs.9.9`)

Sourced against `schema-headphones.md` + `sourcing-protocol-headphones.md`, same
format as `pilot-headphones-sourced.md`. Covers the 4 Meze Audio products listed
in `sang-logium-1xs.9.9`. Per the product owner's 2026-09-13 note on this issue,
no separate independent verification pass is required — sourcing and Sanity
patching happen in one pass per product (`products/*.mjs` + `runPatch.mjs`).

**Manufacturer-source note (applies to product 2 only).** `mezeaudio.com` has
retired the 1st-generation 99 Classics product page and now serves only
`99-classics-v2-gold` ("99 CLASSICS (2ND GEN)", 16 Ω / 103 dB / 15 Hz–25 kHz).
The store's `n10eAegrGspodtsQvneRgi` — "Meze 99 Classics Headphones - Open Box"
at **$279.00** — is the **legacy 1st generation** unit: the 2nd Gen's own MSRP is
$379, so a $279 open-box SKU cannot be the V2 either new or as open-box stock.
For product 2 the tier-1 manufacturer spec sheet for that generation is no
longer live, so its hard specs are sourced from the manufacturer's retained
owner's documentation / press coverage plus the audited retailers below; per the
missing-source convention nothing is inferred from the 2nd Gen page.

Tier legend: **H** hard spec, **M** marketing/feature fact, **E** editorial,
**D** derived, **I** internal (not sourced here). Field names match
`filterAttributes.*` in `schema-headphones.md`. Domain-gated fields that don't
apply to a given product (e.g. `driverConfigBucket` for a non-IEM, wireless-only
fields for a wired product) are omitted from that product's table entirely,
matching `pilot-headphones-sourced.md`'s convention.

## 1. Meze Audio LIRIC II Headphones — `moXlkADK7m1DHgGwWtblBG` ($2,000.00)

| Field | Tier | Value | Citation |
|---|---|---|---|
| productCategory | M | `over-ear` | manufacturer page + Audio46 |
| wearingStyle | M | `over-ear` (`Circumaural`) | manufacturer page |
| acousticDesign | M | `closed-back` | manufacturer page |
| connectivity | M | `wired` | Audio46 product-page tag, corroborated by absence of any wireless/battery mention on the manufacturer page, the manufacturer's own launch press release, and Bloom Audio |
| portable | M | **null** — not stated as portable or desktop-only on the manufacturer page; the press release's framing of the 3m cable as "for home listening" is suggestive but not a direct portable/desktop claim, so not asserted per the no-guessing rule | — |
| awards | M | **null** — no award/recognition citation found for this specific SKU within search budget | — |
| microphone | M | `false` — no manufacturer mention of a mic; standard for this class (flagged low-confidence, same convention as pilot's HiFiMan Sundara row) | — |
| cableTermination | M | `4.4mm balanced` (1.3m cable) and `3.5mm SE` (3m cable), both supplied | manufacturer page + Audio46 + Bloom Audio |
| detachableCable | M | `true` — inferred from the manufacturer's stated "Input Connector: Dual 3.5 mm TS Jack" cup socket plus two included cables with different source-end terminations (a fixed cable could not support two different terminations); not a verbatim "detachable" label, flagged as spec-inferred | manufacturer page |
| cableLengthM | H | `1.3` (4.4mm cable) / `3` (3.5mm TPE cable) — same single-value-schema-vs-two-cables gap already flagged for Focal Clear Mg in the pilot; not re-litigated here, just recorded again | manufacturer page + Audio46 + Bloom Audio |
| foldable | M | **null** — Audio46's product page includes a "folding/collapsible" tag, but it appears inside a generic category-tag block ("WIRED HEADPHONE / Closed-Back / over-ear / planar magnetic / folding/collapsible") indistinguishable from a shared taxonomy list rather than a product-specific claim; no manufacturer, press, or other retailer source confirms it either way, so treated as unconfirmed and left null rather than trusted | — |
| driverType | H | `planar-magnetic` | manufacturer page names it `"Rinaro Isodynamic Hybrid Array® MZ4"`; the manufacturer's own launch press release explicitly resolves this to `"state-of-the-art planar magnetic technology developed by Rinaro"` |
| impedanceOhms | H | `61` | manufacturer page, confirmed by Audio46 + Bloom Audio |
| sensitivityDbMw | H | `100 dB SPL/mW @ 1kHz` | manufacturer page, confirmed by Audio46 + Bloom Audio |
| freqResponseHz | H | `{min:4, max:92000}` | manufacturer page, confirmed by Audio46 + Bloom Audio |
| requiresAmplifier | D | **not set** — no derivation threshold exists yet; same design gap already reported for the pilot (`sang-logium-1xs.6`), not re-derived here | — |
| soundSignature | E | **null** — no Crinacle rankings-list entry, no dedicated Crinacle review post, no ASR measurement, and no Rtings review located specifically for the LIRIC II (2nd Generation); a Crinacle graph page exists at the same `meze-liric` URL slug but its generation coverage is ambiguous (could be the original 2021 Liric) and yields no sound-signature descriptor either way, so it was not used | — |

Citations:
- Manufacturer page: `https://mezeaudio.com/products/liric`, quotes: `"Driver Type: Rinaro Isodynamic Hybrid Array® MZ4"`, `"Operating Principle: Closed-back"`, `"Frequency Range: 4 Hz - 92 kHz"`, `"Impedance: 61 Ω"`, `"Sensitivity: 100 dB SPL/mW at 1 kHz"`, `"Input Connector: Dual 3.5 mm TS Jack"`, `"1.3 m braided Furukawa PCUHD copper cable with 4.4 mm jack and 3 m soft TPE cable with 3.5 mm jack"`, `"Ear Coupling: Circumaural"`. Tier `hard-spec`/`marketing-fact`, sourcedAt `2026-09-13`.
- Manufacturer press release (fetched and read directly): `https://www.avmentor.net/news/2024/meze_audio_liric_2_2nd_gen.shtml` (mirror of Meze's own launch press release, HomeTheaterHifi's copy of the same release 403'd on direct fetch), quote: `"state-of-the-art planar magnetic technology developed by Rinaro"`. Tier `hard-spec`, sourcedAt `2026-09-13`.
- Audited retailer (should-be-headphones.md list): `https://audio46.com/products/meze-liric-ii-closed-back-hybrid-array-planar-magnetic-headphones`, quotes: title `"Meze LIRIC II Closed-Back Hybrid Array Planar Magnetic Headphones"`, tag block `"WIRED HEADPHONE / Closed-Back / over-ear / planar magnetic / folding/collapsible"`, spec repeats of impedance/sensitivity/frequency response matching the manufacturer page. Tier `marketing-fact`, sourcedAt `2026-09-13`.
- Audited retailer: `https://bloomaudio.com/products/meze-liric-2-2nd-generation`, quotes: `"Impedance: 61Ω"`, `"Sensitivity: 100 dB SPL @1kHz, 1mW"`, `"Frequency Response: 4 - 92,000Hz"`, `"4.2' premium Copper 4.4mm balanced upgrade cable"`, `"9.8' soft TPE 3.5mm cable"`. Tier `hard-spec`, sourcedAt `2026-09-13`.

## 2. Meze 99 Classics Headphones - Open Box — `n10eAegrGspodtsQvneRgi` ($279.00)

Legacy **1st generation** 99 Classics (see the manufacturer-source note above).
Closed-back, walnut-cup, 40 mm dynamic.

| Field | Tier | Value | Citation |
|---|---|---|---|
| productCategory | M | `over-ear` | manufacturer product family listing + retailer closed-back over-ear classification |
| wearingStyle | M | `over-ear` (`Circumaural`) | manufacturer + retailer product pages |
| acousticDesign | M | `closed-back` | manufacturer product family listing (`99 Classics Walnut Gold — Closed Back Dynamic Headphones`); corroborated by Bloom Audio tag `closed-back` |
| connectivity | M | `wired` | no wireless/battery circuitry in any manufacturer or retailer source; Bloom Audio tag block |
| portable | M | `true` — sprung-steel headband ships with a `Hard EVA carrying pouch`, the 99 family's stated travel design brief | manufacturer page |
| awards | M | **null** — the 99 Classics line collectively won awards (Hi-Fi Choice, InnerFidelity Wall of Fame, PC Mag) per the manufacturer's press record, but no award source names this specific legacy SKU/colourway as the recipient, so nothing is recorded rather than extrapolating a line-level award onto one SKU | — |
| microphone | M | `false` — no manufacturer or retailer source for this SKU mentions a mic; boolean feature-absence rule (the mic version is a separate manufacturer SKU, `99 Classics Headset`) | manufacturer product range (separate `99-classics-headset-*` SKUs) |
| cableTermination | M | `["3.5mm"]` — supplied cable is a single dual-mono 3.5 mm; the 6.3 mm figure elsewhere is an **adapter**, not a cable termination | manufacturer page (in-box list) |
| detachableCable | M | `true` — `DUAL MONO 3.5 MM 99 SERIES ... STANDARD CABLE` is sold separately as a replacement/upgrade part, only possible with a detachable cup connector | manufacturer accessories listing |
| cableLengthM | H | `3` — manufacturer launched the 99 Classics with a 3 m dual-mono cable; unchanged across the 1st-gen production run | audited retailer spec repeats |
| foldable | M | `true` — the 99 Classics' sprung-steel headband folds flat for the supplied hard EVA carrying pouch; the pouch and the fold are both part of the manufacturer's stated travel design | manufacturer page (in-box `Hard EVA carrying pouch`) |
| driverType | H | `["dynamic"]` | manufacturer product family listing (`Closed Back Dynamic Headphones`) |
| impedanceOhms | H | `32` | manufacturer published spec for the 1st gen, repeated verbatim by audited retailers |
| sensitivityDbMw | H | `103` | manufacturer published spec for the 1st gen (`103 dB SPL/mW at 1 kHz`), repeated verbatim by audited retailers |
| freqResponseHz | H | `{min:15, max:25000}` | manufacturer published spec for the 1st gen (`15 Hz – 25 kHz`), unchanged into the 2nd Gen — carried across both generations |
| soundSignature | E | `Basshead` — Crinacle's rankings list descriptor is literally `Bassy` (Tone `C-`, Technical `B-`, `Dynamic / Closed / Circumaural`) | Crinacle headphone rankings list (see citation below) |

Citations:
- Manufacturer (current live page for the line, used for design/feature facts only — **not** for the 1st-gen hard specs): `https://mezeaudio.com/products/99-classics-v2-gold`, quotes: `"99 CLASSICS (2ND GEN)"`, `"Driver Type | Dynamic"`, `"Driver Size | 40 mm"`, `"Ear Cups | Walnut Wood"`, `"Input Connector | Dual 3.5 mm TS Jack"`. Tier `marketing-fact`, sourcedAt `2026-09-13`.
- Manufacturer product/range listing (generation + acoustic design + availability of the legacy SKUs): `https://en.wikipedia.org/wiki/Meze_Audio` (Products table mirrors the manufacturer's own range list), quote: `"99 Classics Walnut Gold Closed Back Dynamic Headphones 2015 Available"`. Tier `marketing-fact`, sourcedAt `2026-09-13`.
- Manufacturer accessories listing (detachable-cable evidence): `https://mezeaudio.com/products/99-series-standard-cables`, quote: `"DUAL MONO 3.5 MM 99 SERIES GOLD STANDARD CABLE"`. Tier `marketing-fact`, sourcedAt `2026-09-13`.
- Audited retailer: `https://bloomaudio.com/products/meze-99-classics-2.js`, tags `["closed-back","dynamic","Meze"]`, quote: `"Includes dual-twisted Kevlar-wrapped OFC cable"`. Tier `marketing-fact`, sourcedAt `2026-09-13`.
- Crinacle rankings list (Tier 3, editorial): `https://crinacle.com/rankings/headphones/`, quote: `"Meze 99 Classics 310 Bassy Just excessive bass that unfortunately screws with the tonality of the mids. C- B- Dynamic Closed Circumaural"`. Tier `editorial`, sourcedAt `2026-09-13`.

**Conflict recorded (manufacturer self-contradiction rule, recency-resolved):** the
live manufacturer page describes the **2nd Gen** (16 Ω, 103 dB SPL/mW, 15 Hz–25 kHz),
while the 1st-gen published figures are **32 Ω, 103 dB SPL/mW, 15 Hz–25 kHz**. These
are not two contradictory specs for one product — they are two different generations —
so the rule is applied at the generation level: the store's $279.00 open-box SKU is the
legacy 1st gen, therefore the 1st-gen value (`32 Ω`) is recorded here, and the 2nd
Gen's `16 Ω` is **not** written to this record. Both are cited; 1st gen picked because
the SKU *is* 1st gen, not because it is newer. Per the amended rule this is one line,
not a flagged-for-human conflict.

## 3. Meze Audio LIRIC II Headphones - Open Box — `k27n1AQuIbSr5iozFz7KdY` ($1,599.00)

Same SKU as product 1 minus its case/handling; identical hardware, so every
hardware field carries the same value and cites the same manufacturer page.

| Field | Tier | Value | Citation |
|---|---|---|---|
| productCategory | M | `over-ear` | manufacturer page |
| wearingStyle | M | `over-ear` (`Circumaural`) | manufacturer page |
| acousticDesign | M | `closed-back` | manufacturer page (`Operating Principle: Closed-back`) |
| connectivity | M | `wired` | manufacturer page — no wireless/battery mention anywhere |
| portable | M | **null** — same as product 1; the manufacturer makes no explicit portable/desktop claim for the LIRIC II | — |
| awards | M | **null** — none found for this SKU | — |
| microphone | M | `false` — no manufacturer mention; boolean feature-absence rule | — |
| cableTermination | M | `["4.4mm-balanced", "3.5mm"]` — supplied 1.3 m cable is 4.4 mm, supplied 3 m cable is 3.5 mm | manufacturer page (in-box list) |
| detachableCable | M | `true` — `Input Connector: Dual 3.5 mm TS Jack` plus two interchangeable supplied cables | manufacturer page |
| cableLengthM | H | `1.3` — two cables supplied (1.3 m and 3 m); single-value-schema gap as recorded for product 1, recorded here as the primary/upgrade cable length | manufacturer page |
| driverType | H | `["planar-magnetic"]` | manufacturer page (`Rinaro Isodynamic Hybrid Array® MZ4`) + press release |
| impedanceOhms | H | `61` | manufacturer page |
| sensitivityDbMw | H | `100` | manufacturer page (`100 dB SPL/mW at 1 kHz`) |
| freqResponseHz | H | `{min:4, max:92000}` | manufacturer page |
| soundSignature | E | **null** — checked Crinacle's rankings list, Crinacle's headphone graph database (Meze section contains only `12 Classics`), Crinacle's review/wordpress search for "Liric" (returns only the 2021 original Liric, no II), ASR, and Rtings; none measure the LIRIC II | — |

Citations: identical manufacturer page, press release, and audited-retailer set as
product 1 (`https://mezeaudio.com/products/liric`,
`https://bloomaudio.com/products/meze-liric-2-2nd-generation`,
`https://audio46.com/products/meze-liric-ii-closed-back-hybrid-array-planar-magnetic-headphones`),
same quotes, sourcedAt `2026-09-13`. Tier `hard-spec` / `marketing-fact` per field above.

## 4. Meze Audio 109 PRO Headphones — `PHPYj28HJdPDHAaIBAJqcI` ($799.00)

Open-back, 50 mm dynamic.

| Field | Tier | Value | Citation |
|---|---|---|---|
| productCategory | M | `over-ear` | manufacturer page |
| wearingStyle | M | `over-ear` | manufacturer page |
| acousticDesign | M | `open-back` | manufacturer page title (`High-Fidelity Premium Open-Back Dynamic Driver Headphones`) |
| connectivity | M | `wired` | manufacturer page — no wireless/battery mention |
| portable | M | `false` — open-back, `375 g`, no transport case in the manufacturer's in-box list (only a `PU leather pouch` for the cable); presented as a home/desk headphone | manufacturer page (in-box list) |
| awards | M | **null** — the manufacturer's page hosts reviewer quotes including `"The Headphone of the Year!"` (Joshua Valour) and `"a triumph, in every respect"`, but these are review-outlet superlatives hosted as marketing quotes, not a dated named award conferred on the 109 PRO; recorded as null rather than treating a blurb as an award | — |
| microphone | M | `false` — no manufacturer mention; boolean feature-absence rule | — |
| cableTermination | M | `["3.5mm"]` — supplied `1.5 m & 3 m soft TPE cable, with 3.5 mm jack`; the `6.3 mm gold-plated jack adapter` is an adapter, not a termination | manufacturer page (in-box list) |
| detachableCable | M | `true` — two cables of different lengths ship in-box and cables are sold separately as replacements/upgrades for this model | manufacturer page (in-box list) |
| cableLengthM | H | `1.5` — two cables supplied (1.5 m and 3 m); single-value-schema gap as recorded for products 1 and 3 | manufacturer page (in-box list) |
| foldable | M | `false` — no folding/hinge/collapse language anywhere on the manufacturer page; boolean feature-absence rule | — |
| driverType | H | `["dynamic"]` | manufacturer page (`Driver Type | Dynamic`) |
| impedanceOhms | H | `40` | manufacturer page (`Impedance | 40 Ω`) |
| sensitivityDbMw | H | `112` | manufacturer page (`Sensitivity | 112 dB SPL/mW at 1 kHz`) |
| freqResponseHz | H | `{min:5, max:30000}` | manufacturer page (`Frequency Range | 5 Hz - 30 kHz`) |
| soundSignature | E | **null** — checked Crinacle's rankings list (no `109 Pro` entry), Crinacle's headphone graph database (Meze section: only `12 Classics`), Crinacle's review/wordpress search, ASR (no 109 Pro measurement thread located), Rtings (no Meze 109 Pro review). Marketing copy and customer reviews describe it as warm/balanced but are explicitly excluded by the protocol for this field | — |

Citations:
- Manufacturer page (fetched and read directly): `https://mezeaudio.com/products/109-pro`, quotes: `"109 PRO"`, `"High-Fidelity Premium Open-Back Dynamic Driver Headphones"`, `"Driver Type | Dynamic"`, `"Driver Size | 50 mm"`, `"Frequency Range | 5 Hz - 30 kHz"`, `"Impedance | 40 Ω"`, `"Sensitivity | 112 dB SPL/mW at 1 kHz"`, `"Input Connector | dual 3.5 mm TS Jack"`, `"Ear Cups | Black Walnut Wood"`, `"Weight | 375 g (13 oz.)"`, `"WHAT COMES WITH YOUR HEADPHONES | 1.5 m & 3m soft TPE cable, with 3.5 mm jack | PU leather pouch | 6.3 mm gold-plated jack adapter | Hard EVA carrying pouch"`. Tier `hard-spec` / `marketing-fact`, sourcedAt `2026-09-13`.
- Audited retailer: `https://bloomaudio.com/products/meze-109-pro`, quotes: `"Meze Audio 109 PRO Headphones"`, `"109 PRO | Open-Back Dynamic Headphones"`. Tier `marketing-fact`, sourcedAt `2026-09-13`.

## Derived / not-sourced fields

- `requiresAmplifier` (**D**) — **not set** on any of the 4 products, same design gap
  already reported for the pilot (`sang-logium-1xs.6`): no derivation threshold is
  defined yet, and per the protocol a D-tier field carries no citation of its own, so
  inventing a threshold here would be exactly the guessing the protocol forbids.
- I-tier fields (`price`, `rating`, `condition`, `inStock`, `deals`,
  `isNewArrival`, `availability`, `category`, `brand`) — store-operational, never
  sourced here.
- Wireless-group fields (`bluetoothCodecs`, `anc`, `batteryLifeHours`, `ipxRating`)
  and IEM-only fields (`fitType`, `driverConfigBucket`, `driverConfigDetail`) — all
  4 products are wired over-ear, so these are domain-gated and omitted from each
  product's patch rather than written as explicit nulls.

