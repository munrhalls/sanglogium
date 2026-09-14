# 64 Audio Sourcing Results — `sang-logium-zdb.1.11`

Sourced against `schema-headphones.md` + `sourcing-protocol-headphones.md`. Products drawn from the live catalogue; no POC enrichment data used as ground truth.

Tier legend: **H** hard spec, **M** marketing/feature fact, **E** editorial, **D** derived.
Status flags: **NULL** (exhausted, genuinely unfound), **FLAG** (recorded but low-confidence / inference), **CONFLICT** (two same-tier sources disagree).

Scope: all 3 products enumerated in `sang-logium-zdb.1.11`. **Complete — 3 of 3 sourced.**

## 1. 64 Audio U4s In-Ear Headphones ($1,099.00) — `Agdc7UdudmikAzJtKWUVPW`

| Field | Tier | Value | Source | Status |
|---|---|---|---|---|
| productCategory | M | `iem` | 64 Audio product page | — |
| wearingStyle | M | `in-ear` | Audio46 product page | — |
| acousticDesign | M | `null` | — | NULL — not applicable to IEMs |
| fitType | M | `universal` | 64 Audio product page | — |
| connectivity | M | `wired` | 64 Audio product page | — |
| portable | M | `true` | 64 Audio product page (IEM form factor + included case/tips) | FLAG — portable use inferred from form factor; no explicit “portable” claim found |
| driverType | H | `balanced-armature`, `dynamic` | 64 Audio product page | — |
| impedanceOhms | H | `11` Ω | 64 Audio product page | — |
| sensitivityDbMw | H | `107` dB/mW | 64 Audio product page | — |
| freqResponseHz | H | `{min:10, max:20000}` | 64 Audio product page | — |
| cableTermination | M | `3.5mm` | Audio46 in-box list | — |
| detachableCable | M | `true` | Audio46 (0.78mm 2-pin connection) | — |
| cableLengthM | H | `null` | — | NULL — no cable length stated by manufacturer or audited retailer |
| microphone | M | `false` | — | FLAG — no microphone mentioned anywhere; absence-based inference |
| foldable | M | `false` | — | FLAG — IEMs have no folding mechanism; absence-based inference |
| ipxRating | M | `null` | — | NULL — no water/sweat resistance rating found |
| bluetoothCodecs | M | `null` | — | NULL — wired-only, domain-gated |
| anc | M | `passive` | 64 Audio product page (Apex isolation) | — |
| batteryLifeHours | M | `null` | — | NULL — wired-only, no battery |
| soundSignature | E | `null` | — | NULL — no Crinacle graph/ranking-list entry for U4s; manufacturer/retailer descriptions conflict (sub-bass focused/U-shaped/Neutral) and do not map to one FR-derived enum value |
| awards | M | `null` | — | NULL — no named award or editor’s-choice badge found |
| driverConfigBucket / driverConfigDetail | H/D | `hybrid` / `1DD+3BA` | 64 Audio product page | — |

### Citations
- `filterAttributes.sourcing.{impedanceOhms, sensitivityDbMw, freqResponseHz, driverType, driverConfigBucket}`: url `https://www.64audio.com/products/u4s`, quotes: `"1 tia High Driver – 1 High-Mid Driver – 1 Mid Driver – 1 Dynamic Low Driver"` / `"10hz – 20kHz Frequency Response"` / `"107 dB/mW Sensitivity @1kHz"` / `"11Ω Impedance @1kHz"`. Tier `hard-spec`, sourcedAt `2026-09-14`.
- `filterAttributes.sourcing.{wearingStyle, cableTermination, detachableCable}`: url `https://audio46.com/products/64-audio-u4s-universal-in-ear-monitor`, quotes: `"WIRED in-ear HEADPHONE"` / `"2-pin connection"` / `"3.5mm Black Premium Cable"`. Tier `marketing-fact`, sourcedAt `2026-09-14`.
- `filterAttributes.sourcing.soundSignature` (exhaustion): url `https://headphones.com/blogs/buying-guides/the-best-in-ear-monitors-iems-to-start-2025`, quote: `"tuned in a U-shaped fashion with a strong emphasis on sub-bass and upper-treble"`; and `https://www.64audio.com/products/u4s` marketing text `"sub-bass focused, balanced mids, pleasant high-mid band, open, airy tia high-driver presentation"`. No Crinacle ranking-list or graph entry found for U4s. Tier `editorial`, sourcedAt `2026-09-14`.
- **U4s conflict note:** The 64 Audio product page renders unrelated U18s/Fourté text; values were extracted from the U4s-specific block.

## 2. 64 Audio U12t In-Ear Headphones ($1,999.00) — `MrEMtYwMtrFDGWmRnQW6KX`

| Field | Tier | Value | Source | Status |
|---|---|---|---|---|
| productCategory | M | `iem` | 64 Audio product page | — |
| wearingStyle | M | `in-ear` | Audio46 product page | — |
| acousticDesign | M | `null` | — | NULL — not applicable to IEMs |
| fitType | M | `universal` | 64 Audio product page | — |
| connectivity | M | `wired` | 64 Audio product page | — |
| portable | M | `true` | 64 Audio product page (IEM form factor + included case/tips) | FLAG — portable use inferred from form factor; no explicit “portable” claim found |
| driverType | H | `balanced-armature` | 64 Audio product page | — |
| impedanceOhms | H | `12.6` Ω | 64 Audio product page | — |
| sensitivityDbMw | H | `108` dB/mW | 64 Audio product page | — |
| freqResponseHz | H | `{min:10, max:20000}` | 64 Audio product page | — |
| cableTermination | M | `3.5mm`, `4.4mm-balanced` | Audio46 in-box list | — |
| detachableCable | M | `true` | Audio46 (0.78mm 2-pin connection) | — |
| cableLengthM | H | `null` | — | NULL — no cable length stated by manufacturer or audited retailer |
| microphone | M | `false` | — | FLAG — no microphone mentioned anywhere; absence-based inference |
| foldable | M | `false` | — | FLAG — IEMs have no folding mechanism; absence-based inference |
| ipxRating | M | `null` | — | NULL — no water/sweat resistance rating found |
| bluetoothCodecs | M | `null` | — | NULL — wired-only, domain-gated |
| anc | M | `passive` | 64 Audio product page (Apex isolation -10dB to -20dB) | — |
| batteryLifeHours | M | `null` | — | NULL — wired-only, no battery |
| soundSignature | E | `Neutral` | Crinacle IEM ranking list | FLAG — Crinacle labels U12t as “Neutral with bass boost”; mapped to `Neutral` with the bass-boost qualifier noted |
| awards | M | `null` | — | NULL — no named award or editor’s-choice badge found |
| driverConfigBucket / driverConfigDetail | H/D | `multi-ba` / `12BA` | 64 Audio product page | — |

### Citations
- `filterAttributes.sourcing.{impedanceOhms, sensitivityDbMw, freqResponseHz, driverType, driverConfigBucket}`: url `https://www.64audio.com/products/u12t`, quotes: `"1 tia High Driver – 1 High-Mid Driver – 6 Mid Drivers – 4 Low Drivers"` / `"10 Hz – 20 kHz"` / `"108 dB/mW @ 1 kHz"` / `"12.6 Ω"` / `"0.78mm 2-Pin Cables"`. Tier `hard-spec`, sourcedAt `2026-09-14`.
- `filterAttributes.sourcing.{wearingStyle, cableTermination, detachableCable}`: url `https://audio46.com/products/64-audio-u12t-universal-in-ear-monitor-2nd-gen`, quotes: `"WIRED in-ear HEADPHONE"` / `"2-pin connection"` / `"3.5 mm Silver Cable"` / `"4.4 mm Silver Cable"`. Tier `marketing-fact`, sourcedAt `2026-09-14`.
- `filterAttributes.sourcing.soundSignature`: url `https://crinacle.com/rankings/iems/`, quote: `"64 Audio A/U12t | 2000 | Neutral with bass boost | Amazing bass (for a BA), top-tier resolution and detail-oriented signature."`. Tier `editorial`, sourcedAt `2026-09-14`.
- **U12t conflict note:** The 64 Audio product page also renders unrelated Solo product text (e.g., “14.2mm planar”, “100dB”, “4.4mm”). Values were extracted from the U12t-specific block.

## 3. 64 Audio Nio In-Ear Headphones ($1,699.00) — `Pn6oyV4Ks5AcNbecjjohGV`

| Field | Tier | Value | Source | Status |
|---|---|---|---|---|
| productCategory | M | `iem` | 64 Audio product page | — |
| wearingStyle | M | `in-ear` | Audio46 product page | — |
| acousticDesign | M | `null` | — | NULL — not applicable to IEMs |
| fitType | M | `universal` | 64 Audio product page | — |
| connectivity | M | `wired` | 64 Audio product page | — |
| portable | M | `true` | 64 Audio product page (IEM form factor + included case/tips) | FLAG — portable use inferred from form factor; no explicit “portable” claim found |
| driverType | H | `balanced-armature`, `dynamic` | 64 Audio product page | — |
| impedanceOhms | H | `6` Ω | 64 Audio product page | — |
| sensitivityDbMw | H | `105` dB/mW | 64 Audio product page | — |
| freqResponseHz | H | `{min:10, max:20000}` | 64 Audio product page | — |
| cableTermination | M | `3.5mm` | 64 Audio product page | — |
| detachableCable | M | `true` | Audio46 (0.78mm 2-pin; 48" detachable cable) | — |
| cableLengthM | H | `1.22` | Audio46 in-box list (48" detachable cable) | — |
| microphone | M | `false` | — | FLAG — no microphone mentioned anywhere; absence-based inference |
| foldable | M | `false` | — | FLAG — IEMs have no folding mechanism; absence-based inference |
| ipxRating | M | `null` | — | NULL — no water/sweat resistance rating found |
| bluetoothCodecs | M | `null` | — | NULL — wired-only, domain-gated |
| anc | M | `passive` | 64 Audio product page (Apex isolation -20dB/-15dB/-10dB) | — |
| batteryLifeHours | M | `null` | — | NULL — wired-only, no battery |
| soundSignature | E | `null` | — | NULL — Crinacle labels Nio as “Variable” (module-dependent); no fixed FR-derived enum mapping |
| awards | M | `null` | — | NULL — no named award or editor’s-choice badge found |
| driverConfigBucket / driverConfigDetail | H/D | `hybrid` / `1DD+8BA` | 64 Audio product page | — |

### Citations
- `filterAttributes.sourcing.{impedanceOhms, sensitivityDbMw, freqResponseHz, driverType, driverConfigBucket}`: url `https://www.64audio.com/products/nio`, quotes: `"1 tia High Driver – 1 High-Mid Driver – 6 Mid Drivers – 1 Dynamic Low Driver"` / `"10hz – 20kHz Frequency Response"` / `"105 dB/mW Sensitivity @1kHz"` / `"6Ω Impedance @1kHz"`. Tier `hard-spec`, sourcedAt `2026-09-14`.
- `filterAttributes.sourcing.{wearingStyle, cableTermination, detachableCable, cableLengthM}`: url `https://audio46.com/collections/64-audio/products/64-audio-nio-universal-fit-iem`, quotes: `"WIRED in-ear HEADPHONE"` / `"2-pin connection"` / `"3.5mm premium cable"` / `"48\" Detachable 2 Pin Professional Black Cable"`. Tier `hard-spec`/`marketing-fact`, sourcedAt `2026-09-14`.
- `filterAttributes.sourcing.soundSignature`: url `https://crinacle.com/rankings/iems/`, quote: `"64 Audio Nio | 1700 | Variable | A decent bassy set with the m15/m20 modules, but really shines with the mX modules."`. Tier `editorial`, sourcedAt `2026-09-14`.
- **Nio conflict note:** The 64 Audio product page also renders Duo/Solo product text; values were extracted from the Nio-specific block.
