# Audeze Sourcing Results — `sang-logium-1xs.9.7`

Sourced against `schema-headphones.md` + `sourcing-protocol-headphones.md`
(2026-09-13 widened tiers) + `should-be-headphones.md` (canonical enum
vocabularies). Products drawn from the real catalogue — name/brand/price only;
no other POC enrichment field
(`app/(test)/poc/filter-sort/headphones/dataset.json`) is treated as ground
truth. That dataset's existing values for these Audeze products are known-wrong
for several fields (e.g. the Maxwell is mislabeled there as an `in-ear` / `iem`
product with `mid-forward` tuning, and the LCD-X/XLC entries carry wrong
impedance/sensitivity figures) and are ignored entirely.

Tier legend: **H** hard spec, **M** marketing/feature fact, **E** editorial,
**D** derived, **I** internal (not sourced). Status flags: **NULL**
(exhausted, genuinely unfound), **FLAG** (recorded but low-confidence /
inference), **CONFLICT** (two same-tier manufacturer sources disagree).

Scope: all 6 products enumerated in `sang-logium-1xs.9.7`.

## Manufacturer sources used (all Audeze-owned)

- Web spec tables: `audeze.com/products/{maxwell,lcd-x,lcd-xc,lcd-2-classic,mm-100}`
  (the `SPECIFICATIONS` table on each product page, read from the page's own
  markup — not a search excerpt).
- Owner's manual PDFs, opened and read as text:
  - LCD Collection User Guide (`LCD_UserGuide_FULL_WEB_160222.pdf`) — carries
    the LCD-4 / LCD-3 / LCD-X / LCD-XC / LCD-2 specification block.
  - Maxwell User Guide (`ADZ_034025_Print_maxwell_user_guide_...v2.pdf`) —
    multilingual quick-start; contains **no** impedance/sensitivity spec table.
- Audeze support download index (`audeze.com/pages/product-support-docs`) —
  the source of both PDF URLs above.

### Cross-check: manufacturer web page vs. manufacturer manual

Both same-tier Audeze sources were read for the four LCD-line products. They
**agree** on every shared field (LCD-X `20 Ω` / `103 dB/1mW`; LCD-XC `20 Ω` /
`100 dB/1mW`; LCD-2 (Classic) `70 Ω` / `101 dB/1mW`). No
manufacturer self-contradiction arises for this brand, so the protocol's
recency rule had nothing to resolve — recorded here so the absence of a
conflict entry is explicit rather than an omission.

Two manufacturer-side naming catches worth recording:

1. The manual's LCD-2 block is headed simply "LCD-2 Specifications"
   (`70 Ω`, `101 dB/1mW`) and the web `lcd-2-classic` page carries the same
   figures. The in-scope SKU is the **LCD-2 Classic**; Audeze's LCD-2 and
   LCD-2 Classic are different products that historically shared a driver
   spec, so the figures are recorded for the Classic only because the Classic's
   own product page states them.
2. The manual titles the sensitivity figure **"Efficiency"** (`dB / 1mW *`,
   `*ERP measurement`) while the web pages title the same quantity
   **"Sensitivity"**. Same measurement, different heading — the schema's single
   `sensitivityDbMw` field holds it, and the basis is captured in the citation
   quote rather than invented as a separate field.

## 1. Audeze Maxwell Wireless Headphones ($299.00) — `moXlkADK7m1DHgGwWtWl8T`

| # | Field | Tier | Value | Citation |
|---|---|---|---|---|
| 4 | awards | M | `PC Gamer — "Editor's Pick Award"`, `GamesRadar — "Editor's Choice Award"` | manufacturer product page, publisher-attributed pull quotes: `"The perfect union of audiophile drivers and wireless gaming headset" — PC Gamer, Editor's Pick Award` and `"The next brilliant step for a legendary line of audiophile gaming headsets" — GamesRadar, Editor's Choice Award`. Two named, attributed awards with their awarding publication — recorded as the awarding publication's own designations (shape matches the DCA batch's `NYT Wirecutter` award row). |
| 10 | productCategory | M | `over-ear` | manufacturer spec table: `"Style Over-ear (circumaural), closed-back"` |
| 11 | wearingStyle | M | `over-ear` | manufacturer spec table: `"Over-ear (circumaural)"` |
| 12 | acousticDesign | M | `closed-back` | manufacturer spec table: `"closed-back"` |
| 13 | fitType | M | `null` — not an IEM, field doesn't apply | — |
| 14 | connectivity | M | `wireless` | manufacturer spec table lists wireless (Bluetooth 5.3) **plus** a wired fallback: `"Wired - Digital USB-C with dual-audio endpoints and game-chat mix"` / `"Wired - Analog 3.5mm TRRS active"`. Recorded as `wireless`, not `hybrid` — the two wired modes are auxiliary/charging-and-fallback paths on a BT-first headset. |
| 15 | portable | M | `true` | manufacturer spec table (full-size wireless gaming headset with `"Lithium-polymer, 1800mAh"` battery, detachable boom mic, travel-oriented accessory set: `"Low Latency USB Dongle / Microphone / USB-C to C Cable / AUX Cable / USB-A to C Adapter"`) |
| 16 | soundSignature | E | `Warm` | RTINGS measured review — `"Their frequency response doesn't fluctuate much from their warm sound profile either"` |
| 17 | impedanceOhms | H | **NULL** | Exhausted: not on the manufacturer product page spec table; **not** in the manufacturer user guide (the Maxwell guide is a multilingual quick-start with no specification table at all — verified by reading the extracted PDF text, not a failed scrape); no Audeze launch press release states it; RTINGS' Maxwell review does not publish a numeric impedance. Genuine gap, not an early stop. |
| 18 | sensitivityDbMw | H | **NULL** | Same exhaustion as `impedanceOhms` — including the guide-read step above. |
| 19 | freqResponseHz | H | `{min: 10, max: 50000}` | manufacturer spec table: `"Frequency response 10Hz - 50kHz"` |
| 20 | requiresAmplifier | D | not set — derived field, not decided by this pass (both inputs are null here) | — |
| 21 | microphone | M | `true` | manufacturer spec table: `"Microphones Boom Microphone Detachable, Hypercardioid Beamforming Physical and AI noise reduction, Internal mic for chat"` |
| 22 | cableTermination | M | `3.5mm` | manufacturer spec table `"Wired - Analog 3.5mm TRRS active"` + accessory list `"AUX Cable"`. `usb-c` **not** recorded: USB-C is the digital audio/charging port, and `cableTermination` intends the analog listening termination. |
| 23 | detachableCable | M | `true` | manufacturer spec table: `"Boom Microphone Detachable"` + user guide `"Boom Mic Port — Remove to use internal mics"`; the AUX cable is likewise a removable plug-in, not a captive lead. |
| 24 | cableLengthM | H | **NULL** | Exhausted: the manufacturer product page and accessory list name the included cables (`"USB-C to C Cable"`, `"AUX Cable"`) without any length; the user guide's extracted text contains no cable-length figure. |
| 25 | foldable | M | `false` | Boolean feature-absence rule: the user guide describes a head strap with no folding/collapsing mechanism anywhere in its function guide, and no manufacturer source claims a folding hinge. Absence read as `false`. |
| 26 | ipxRating | M | **NULL** | Exhausted: no IP/water-resistance claim anywhere on the manufacturer product page, spec table, or user guide. Recorded `null`, **not** `none` — an IP rating is a spec a manufacturer can simply omit (unlike a marketable feature), so the boolean-absence exception does not apply. |
| 27 | bluetoothCodecs | M | `SBC`, `AAC`, `LDAC`, `LC3` | manufacturer spec table: `"Supports: Multipoint, LE Audio, LC3, LC3plus, LDAC, AAC, SBC"` |
| 28 | anc | M | `none` | RTINGS measured review states directly: `"While they lack noise cancelling"`. Corroborated by the manufacturer's own silence on ANC across its product page and guide (zero occurrences of `ANC` / `active noise` in the extracted guide text) — the Maxwell's AI noise *reduction* is on the microphone path, not headphone ANC. |
| 29 | batteryLifeHours | M | `{ancOn: null, ancOff: 80}` | manufacturer spec table: `"Battery life Over 80 hrs wireless playback @ 80dBA"`. The single undifferentiated figure goes in `ancOff` because the product has no ANC at all (row 28) — "ANC off" is the only condition the headset can be in, not a guess between two buckets. `ancOn` stays `null` since ANC cannot be enabled. |
| 30 | driverType | H | `planar-magnetic` | manufacturer spec table: `"Transducer type Planar Magnetic"` + `"Diaphragm type Ultra-Thin Uniforce™"` |
| 31 | driverConfigBucket / driverConfigDetail | H/D | `null` | NULL — domain-gated to IEM (should-be.md item 31); this is a full-size over-ear with a single 90 mm planar driver. |

### Citations

- `filterAttributes.sourcing.{productCategory, wearingStyle, acousticDesign, connectivity, portable, freqResponseHz, microphone, cableTermination, detachableCable, bluetoothCodecs, batteryLifeHours, driverType}`: url `https://www.audeze.com/products/maxwell`, quotes: `"Style Over-ear (circumaural), closed-back"` / `"Transducer type Planar Magnetic"` / `"Diaphragm type Ultra-Thin Uniforce™"` / `"Frequency response 10Hz - 50kHz"` / `"Battery life Over 80 hrs wireless playback @ 80dBA"` / `"Microphones Boom Microphone Detachable, Hypercardioid Beamforming Physical and AI noise reduction, Internal mic for chat"` / `"Wireless Ultra-low-latency Bluetooth: 5.3 Supports: Multipoint, LE Audio, LC3, LC3plus, LDAC, AAC, SBC"` / `"Wired - Digital USB-C with dual-audio endpoints and game-chat mix"` / `"Wired - Analog 3.5mm TRRS active"`. Tier `hard-spec`/`marketing-fact` as applicable, sourcedAt `2026-09-13`.
- `filterAttributes.sourcing.soundSignature`: url `https://www.rtings.com/headphones/reviews/audeze/maxwell-wireless`, quote `"Their frequency response doesn't fluctuate much from their warm sound profile either, with most notable deviations resulting from mismatches between the L/R drivers."`. Tier `editorial`, sourcedAt `2026-09-13`.
- `filterAttributes.sourcing.anc`: url `https://www.rtings.com/headphones/reviews/audeze/maxwell-wireless`, quote `"While they lack noise cancelling, they can block out some mid-range noise, like ambient chatter, and a lot of high-pitched noise, like the hum of A/C fans."`. Tier `marketing-fact`, sourcedAt `2026-09-13`.
- `filterAttributes.sourcing.detachableCable` (corroborating): url `https://www.audeze.com/pages/maxwell-user-guide`, quote `"Boom Mic Port — Remove to use internal mics"` / `"AUX Input 3.5mm analog"` (function-guide page of the Maxwell User Guide PDF), tier `marketing-fact`, sourcedAt `2026-09-13`.
- `filterAttributes.sourcing.{impedanceOhms, sensitivityDbMw, cableLengthM}` exhaustion trail: manufacturer product page spec table read in full (no such rows); Maxwell User Guide PDF (`https://cdn.shopify.com/s/files/1/3013/1908/files/ADZ_034025_Print_maxwell_user_guide_EFPIGS_Translations_v2.pdf`) opened and its text extracted — a multilingual quick-start whose prose sections are battery/Bluetooth and regulatory warnings, with **no** specification table and no cable-length figure (PDF read, not a failed text-scrape). Audeze publishes no separate Maxwell launch press release stating impedance/sensitivity. RTINGS' Maxwell review does not publish a numeric impedance. All applicable widened tiers exhausted; `null` stands.
- `filterAttributes.sourcing.ipxRating` exhaustion trail: no IP/water-resistance line on the manufacturer product page, its spec table, or in the user guide PDF. `null` per the non-marketable-spec rule.
- `filterAttributes.sourcing.foldable`: absence across the manufacturer spec table and the user guide's function guide (no hinge/fold step described or pictured; the guide's only structural adjustment is the head strap). Boolean feature-absence rule → `false`.
- `filterAttributes.sourcing.awards`: url `https://www.audeze.com/products/maxwell`, quotes `"The perfect union of audiophile drivers and wireless gaming headset" — PC Gamer, Editor's Pick Award` / `"The next brilliant step for a legendary line of audiophile gaming headsets" — GamesRadar, Editor's Choice Award`. Tier `marketing-fact`, sourcedAt `2026-09-13`. (Corrected during this pass: an initial reading of the manufacturer page recorded `awards` as null; re-reading the page's attributed press-quote strip found both named awards above. The page also carries unattributed `"Award-winning Audeze 90mm Planar Magnetic Drivers"` marketing copy, which is **not** cited — it names no awarding body and no product award.)




## 2. Audeze LCD-X Headphones | 2024 Creator's Edition ($1,199.00) — `moXlkADK7m1DHgGwWtbizC`

## 3. Audeze LCD-X Headphones | 2024 Creator's Edition ($1,199.00) — `Pn6oyV4Ks5AcNbecjgysXB`

Two catalogue documents for the same SKU (Creator's Edition). The manufacturer
specification block is byte-identical for both (the Audeze LCD-X specification
is model-level, not edition-level) and the editorial reading is likewise
model-level, so every value and citation below applies to **both `_id`s**
unless marked otherwise. Each `_id` still gets its own patch file and its own
backup trail, per the patch tooling's one-product-per-file rule.

| # | Field | Tier | Value | Citation |
|---|---|---|---|---|
| 4 | awards | M | `null` | No named award for the LCD-X itself. The page's only "award" text is `"Trusted by award winning artists and engineers"` — that describes the *people who use* the product, not an award it received, so it is not a citable product award. Checked the manufacturer page, the LCD User Guide, and the Crinacle/RTINGS sources; no editor's-choice or named-award designation found for this SKU. `null` stands. |
| 10 | productCategory | M | `over-ear` | manufacturer spec table: `"Style Over-ear, open-back"` |
| 11 | wearingStyle | M | `over-ear` | manufacturer spec table: `"Over-ear"` |
| 12 | acousticDesign | M | `open-back` | manufacturer spec table: `"open-back"` |
| 13 | fitType | M | `null` — not an IEM | — |
| 14 | connectivity | M | `wired` | manufacturer spec table (analog cable only; no wireless mode anywhere in the spec block) |
| 15 | portable | M | `false` | — **FLAG** — inferred, not an explicit manufacturer "desktop" label: full-size open-back circumaural, `612 g`, `"Recommended power level >250mW"`, and a published `"1.9m (6.2ft) length 4-pin XLR"` studio cable. No case/travel/portability language on the manufacturer page contrary to that. |
| 16 | soundSignature | E | `Warm` | Crinacle rankings list: `"Warm neutral"` (`"Tonally, a massive improvement over the previous version(s) though with the usual pitfalls of the Audeze house sound."`, Tone Grade C, Technical Grade A+). Corroborated by RTINGS: `"They don't deviate much from their warm sound profile"`. |
| 17 | impedanceOhms | H | `20` | manufacturer spec table: `"Impedance 20 ohms"`; manufacturer LCD User Guide: `"LCD-X Specifications ... Impedance: 20 ohms"` (both same-tier sources agree) |
| 18 | sensitivityDbMw | H | `103` | manufacturer spec table: `"Sensitivity 103 dB/1mW (at Drum Reference Point)"`; LCD User Guide: `"Efficiency: 103dB / 1mW*"` (`*ERP measurement`) — headings differ ("Sensitivity" vs "Efficiency"), value agrees |
| 19 | freqResponseHz | H | `{min: 10, max: 50000}` | manufacturer spec table: `"Frequency response 10Hz - 50kHz"` |
| 20 | requiresAmplifier | D | not set — derived field, not decided by this pass | — |
| 21 | microphone | M | `false` | Boolean feature-absence rule: no microphone anywhere on the manufacturer page, its spec table, or the user guide's LCD-X section; the manual's package contents for the LCD line list only `"Single-ended cable (1/4in connector)"` / `"Balanced cable (4-pin XLR connector)"` / `"1/4in to 1/8in mini-adapter"` — no mic, no mic path. |
| 22 | cableTermination | M | `4-pin-xlr`, `6.35mm` | manufacturer spec table: `"Cable 1.9m (6.2ft) length 4-pin XLR with Single ended 1/4\" (6.3mm) adapter"` (the 4-pin XLR cable plus the included single-ended 1/4" adapter maps to the schema's `6.35mm` value) |
| 23 | detachableCable | M | `true` | LCD User Guide `"Connecting Your Headphones"`: `"Look for the (L) and (R) indicators on the cable ends and match them to the headphone's (L) and (R) inputs ... To remove the connector press down on the small black (L) and red (R) button and gently remove the connector"` — an explicit attach/detach procedure. |
| 24 | cableLengthM | H | `1.9` | manufacturer spec table: `"Cable 1.9m (6.2ft) length"` |
| 25 | foldable | M | `false` | Boolean feature-absence rule: neither the manufacturer spec table nor the LCD User Guide's structure/comfort sections describe a folding hinge; the LCD design is a fixed circumaural frame whose only adjustment is the headband block (where the (L)/(R) connectors live). |
| 26 | ipxRating | M | `null` | Exhausted: no IP/water-resistance claim on the manufacturer page, spec table, or user guide. `null` per the non-marketable-spec rule (an open-back studio headphone is not marketed on water resistance). |
| 27 | bluetoothCodecs | M | `null` | NULL — domain-gated, wired-only product. |
| 28 | anc | M | `none` | Derived from already-cited `acousticDesign: open-back` + `connectivity: wired`: an open-back passive headphone has neither ANC electronics nor a sealed cup; the manufacturer lists no noise-cancelling feature. |
| 29 | batteryLifeHours | M | `{ancOff: null, ancOn: null}` | NULL — wired-only, no battery. |
| 30 | driverType | H | `planar-magnetic` | manufacturer spec table: `"Transducer type Planar Magnetic"` + `"Diaphragm type Ultra-Thin Uniforce™"` + `"Transducer size 106 mm"`; LCD User Guide `"advanced planar magnetics enhanced with Fazor™ technology"` |
| 31 | driverConfigBucket / driverConfigDetail | H/D | `null` | NULL — domain-gated to IEM (should-be.md item 31); full-size over-ear with a single 106 mm planar driver. |


### Citations (applies to both `moXlkADK7m1DHgGwWtbizC` and `Pn6oyV4Ks5AcNbecjgysXB`)

- `filterAttributes.sourcing.{productCategory, wearingStyle, acousticDesign, connectivity, freqResponseHz, impedanceOhms, sensitivityDbMw, cableTermination, cableLengthM, driverType}`: url `https://www.audeze.com/products/lcd-x`, quotes: `"Style Over-ear, open-back"` / `"Transducer type Planar Magnetic"` / `"Diaphragm type Ultra-Thin Uniforce™"` / `"Transducer size 106 mm"` / `"Frequency response 10Hz - 50kHz"` / `"Sensitivity 103 dB/1mW (at Drum Reference Point)"` / `"Impedance 20 ohms"` / `"Cable 1.9m (6.2ft) length 4-pin XLR with Single ended 1/4\" (6.3mm) adapter"`. Tier `hard-spec`/`marketing-fact` as applicable, sourcedAt `2026-09-13`.
- `filterAttributes.sourcing.{impedanceOhms, sensitivityDbMw, driverType, detachableCable, cableTermination}` (same-tier manufacturer corroboration): url `https://cdn.shopify.com/s/files/1/3013/1908/files/LCD_UserGuide_FULL_WEB_160222.pdf` (LCD Collection User Guide, downloaded from `https://www.audeze.com/pages/product-support-docs` and read as extracted text — a real read, not a failed scrape), quotes: `"LCD-X Specifications Style: Open-back circumaural ... Impedance: 20 ohms ... Efficiency: 103dB / 1mW*"` / `"*ERP measurement"` / `"advanced planar magnetics enhanced with Fazor™ technology"` / `"Look for the (L) and (R) indicators on the cable ends and match them to the headphone's (L) and (R) inputs ... To remove the connector press down on the small black (L) and red (R) button and gently remove the connector"` / `"Single-ended cable (1/4in connector)"` / `"Balanced cable (4-pin XLR connector)**"`. Tier `hard-spec`/`marketing-fact`, sourcedAt `2026-09-13`. **No conflict:** this same-tier manufacturer source agrees with the web page on both hard specs (`20 Ω`, `103 dB/1mW`), so the protocol's recency rule had nothing to resolve.
- `filterAttributes.sourcing.soundSignature`: url `https://crinacle.com/rankings/headphones/`, quote `"Warm neutral"` / `"Tonally, a massive improvement over the previous version(s) though with the usual pitfalls of the Audeze house sound."` (entry `"Audeze LCD-X (2021)"`, $1,200, Tone Grade C, Technical Grade A+). Tier `editorial`, sourcedAt `2026-09-13`. **Cross-tool corroboration:** url `https://www.rtings.com/headphones/reviews/audeze/lcd-x`, quote `"They don't deviate much from their warm sound profile and have amazingly well-matched left and right drivers"`. Note on the Crinacle row name: it is labelled `"LCD-X (2021)"`, and the in-scope SKUs are the **2024** Creator's Edition. The two editorial sources agree on `Warm`, and this is the only LCD-X entry on the list (a separate `"LCD-X (Pre-20201)"` row exists for the older tuning, which is explicitly the *previous* version and was not used). Recorded as `Warm`, not force-fit to a more specific vocabulary item the sources do not state.
- `filterAttributes.sourcing.{microphone, portable, foldable, ipxRating}` exhaustion/corroboration trail: the LCD User Guide's LCD-X specification section, package-contents list, and connecting/compliance/comfort sections were read in full; the manufacturer product page and its spec table were read in full. No microphone, no IP rating, no folding mechanism, and no wearable/portability claim appear in any of them. `microphone` and `foldable` are marketable features a manufacturer calls out when present → boolean feature-absence rule gives `false`; `ipxRating` is a spec a manufacturer may simply omit → `null`; `portable` → `false` with a FLAG (see the row).
- `filterAttributes.sourcing.awards` exhaustion trail: the manufacturer product page's only award-adjacent string is `"Trusted by award winning artists and engineers"`, which describes the product's *users* rather than an award to the product; the LCD User Guide carries no award text; Crinacle and RTINGS publish grades/scores, which the should-be list explicitly scrapped as a facet (see Design gaps). `null` stands.


## 4. Audeze LCD-XC Headphones | 2021 Creator's Edition with Economy Travel Case - Open Box ($999.00) — `k27n1AQuIbSr5iozFz7FkW`

The closed-back sibling of the LCD-X — same 106 mm planar driver platform,
same 20 Ω figure, different acoustic design and tuning. The SKU string says
"Open Box" plus a travel case, which is a *condition* fact, not a model
variant: the acoustic product is the LCD-XC Creator's Edition. Condition is
I-tier (store-operational) and is **not** sourced here — this pass writes only
H/M/E-tier facts.

| # | Field | Tier | Value | Citation |
|---|---|---|---|---|
| 4 | awards | M | `null` | No named award for the LCD-XC. The page's only award-adjacent string is `"Trusted by award winning artists and engineers"` (describes the product's users, not an award to the product). Checked the manufacturer page, the LCD User Guide, Crinacle, and RTINGS; no editor's-choice or named-award designation found. `null` stands. |
| 10 | productCategory | M | `over-ear` | manufacturer spec table: `"Style Over-ear, closed-back"` |
| 11 | wearingStyle | M | `over-ear` | manufacturer spec table: `"Over-ear"` |
| 12 | acousticDesign | M | `closed-back` | manufacturer spec table: `"closed-back"`; LCD User Guide: `"LCD-XC Specifications Style: Closed-back circumaural"` |
| 13 | fitType | M | `null` — not an IEM | — |
| 14 | connectivity | M | `wired` | manufacturer spec table (analog cable only; no wireless mode) |
| 15 | portable | M | `false` | — **FLAG** — inferred, not an explicit manufacturer label: full-size closed-back circumaural at `677 g` with `"Recommended power level > 250mW"` and a fixed-length studio cable. Weighed against it: this SKU ships with an `"Economy Travel Case"`, which is the strongest portability signal on the page and the reason this row is flagged rather than asserted flatly — an accessory travel case is packaging, not a manufacturer statement that the headphone is a portable product. Recorded `false`; the case is the one piece of contrary evidence, recorded rather than dropped. |
| 16 | soundSignature | E | `Neutral` | Crinacle rankings list: `"Balanced"` / `"Definitely the least Audeze-sounding Audeze. A little quirky tonally, but nothing too offensive."` (Tone Grade B-, Technical Grade A-). `"Balanced"` is not one of the schema's vocabulary items; it is the descriptor for a non-warm, non-bright tuning, so it maps to `Neutral` — the same mapping the pilot applied to Crinacle's `"Balanced"`-family readings. The Crinacle row is labelled `"LCD-XC"` with no year, and is the only XC entry on the list. |
| 17 | impedanceOhms | H | `20` | manufacturer spec table: `"Impedance 20 ohms"`; LCD User Guide: `"LCD-XC Specifications ... Impedance: 20 ohms"` (both same-tier sources agree) |
| 18 | sensitivityDbMw | H | `100` | manufacturer spec table: `"Sensitivity 100 dB/1mW (at Drum Reference Point)"`; LCD User Guide: `"Efficiency: 100dB / 1mW*"` (both agree) |
| 19 | freqResponseHz | H | `{min: 10, max: 50000}` | manufacturer spec table: `"Frequency response 10Hz - 50kHz"` |
| 20 | requiresAmplifier | D | not set — derived field, not decided by this pass | — |
| 21 | microphone | M | `false` | Boolean feature-absence rule: no microphone on the manufacturer page, its spec table, or the LCD User Guide's LCD-XC section; the manual's package contents for the LCD line list only cables and an adapter. |
| 22 | cableTermination | M | `6.35mm` | manufacturer spec table: `"Cable 1.9m (6.2ft) length, Single ended 1/4\" (6.3mm) termination"` — the XC's stock cable is single-ended, unlike the LCD-X's 4-pin XLR stock cable, and this records what the manufacturer states for **this** model. The LCD User Guide's LCD-line package list also mentions a `"Balanced cable (4-pin XLR connector)**"` with footnote `"** Not included with LCD-2"`, i.e. not marked as excluded for the XC; the web page's single-ended figure is the more current same-tier source and is what is written. |
| 23 | detachableCable | M | `true` | LCD User Guide `"Connecting Your Headphones"`: explicit (L)/(R) connector attach/release procedure (`"To remove the connector press down on the small black (L) and red (R) button"`), shared across the LCD collection including the XC. |
| 24 | cableLengthM | H | `1.9` | manufacturer spec table: `"Cable 1.9m (6.2ft) length"` |
| 25 | foldable | M | `false` | Boolean feature-absence rule: no folding hinge described in the manufacturer spec table or the LCD User Guide's structure/comfort sections. |
| 26 | ipxRating | M | `null` | Exhausted: no IP/water-resistance claim on the manufacturer page, spec table, or user guide. `null` per the non-marketable-spec rule. |
| 27 | bluetoothCodecs | M | `null` | NULL — domain-gated, wired-only product. |
| 28 | anc | M | `passive` | Derived from already-cited `acousticDesign: closed-back` + `connectivity: wired`: a sealed closed-back cup provides passive isolation; the manufacturer states no ANC electronics and the product is wired-only. Matches the same-issue HiFiMan Audivina and DCA AEON 2 Noire precedent. |
| 29 | batteryLifeHours | M | `{ancOff: null, ancOn: null}` | NULL — wired-only, no battery. |
| 30 | driverType | H | `planar-magnetic` | manufacturer spec table: `"Transducer type Planar Magnetic"` + `"Transducer size 106 mm"`; LCD User Guide `"advanced planar magnetics enhanced with Fazor™ technology"` |
| 31 | driverConfigBucket / driverConfigDetail | H/D | `null` | NULL — domain-gated to IEM; full-size over-ear with a single 106 mm planar driver. |


### Citations

- `filterAttributes.sourcing.{productCategory, wearingStyle, acousticDesign, connectivity, freqResponseHz, impedanceOhms, sensitivityDbMw, cableTermination, cableLengthM, driverType}`: url `https://www.audeze.com/products/lcd-xc`, quotes: `"Style Over-ear, closed-back"` / `"Transducer type Planar Magnetic"` / `"Transducer size 106 mm"` / `"Frequency response 10Hz - 50kHz"` / `"Sensitivity 100 dB/1mW (at Drum Reference Point)"` / `"Impedance 20 ohms"` / `"Cable 1.9m (6.2ft) length, Single ended 1/4\" (6.3mm) termination"`. Tier `hard-spec`/`marketing-fact` as applicable, sourcedAt `2026-09-13`.
- `filterAttributes.sourcing.{impedanceOhms, sensitivityDbMw, acousticDesign, driverType, detachableCable}` (same-tier manufacturer corroboration): url `https://cdn.shopify.com/s/files/1/3013/1908/files/LCD_UserGuide_FULL_WEB_160222.pdf` (LCD Collection User Guide, read as extracted text), quotes: `"LCD-XC Specifications Style: Closed-back circumaural ... Impedance: 20 ohms ... Efficiency: 100dB / 1mW*"` / `"To remove the connector press down on the small black (L) and red (R) button and gently remove the connector"`. Tier `hard-spec`/`marketing-fact`, sourcedAt `2026-09-13`. **No conflict:** the manual and the web page agree on `20 Ω` and `100 dB/1mW`.
- `filterAttributes.sourcing.soundSignature`: url `https://crinacle.com/rankings/headphones/`, quote `"Balanced"` / `"Definitely the least Audeze-sounding Audeze. A little quirky tonally, but nothing too offensive."` (entry `"Audeze LCD-XC"`, $1,300, Tone Grade B-, Technical Grade A-). Tier `editorial`, sourcedAt `2026-09-13`. RTINGS has no LCD-XC review (`https://www.rtings.com/headphones/reviews/audeze/lcd-xc` returns HTTP 404) and no ASR measurement thread was located, so Crinacle is the sole Tier-3 source for this model — recorded with that single-source status explicit.
- `filterAttributes.sourcing.{microphone, foldable, ipxRating}` exhaustion trail: LCD User Guide LCD-XC section, package-contents list, warnings and compliance sections read in full; manufacturer product page and spec table read in full. No microphone, no IP rating, no folding mechanism in any of them. `microphone`/`foldable` → `false` by the marketable-feature-absence rule; `ipxRating` → `null` per the non-marketable-spec rule.

---

## 5. Audeze LCD-2 Classic Headphones ($799.00) — `PHPYj28HJdPDHAaIBAJiLG`

| # | Field | Tier | Value | Citation |
|---|---|---|---|---|
| 4 | awards | M | `The Switch Master — "Editor's Choice award"` | manufacturer product page, attributed pull quote: `"Editor's Choice award. It's one of the best models that Audeze have ever made...for under a grand, nothing sounds as good." - The Switch Master`. Named and attributed to its awarding publication. The same page also carries an unattributed `THE VERGE` soundstage quote with no award attached, which is **not** recorded. |
| 10 | productCategory | M | `over-ear` | manufacturer spec table: `"Style Over-ear, open-back"` |
| 11 | wearingStyle | M | `over-ear` | manufacturer spec table: `"Over-ear"` |
| 12 | acousticDesign | M | `open-back` | manufacturer spec table: `"open-back"` |
| 13 | fitType | M | `null` — not an IEM | — |
| 14 | connectivity | M | `wired` | manufacturer spec table (analog cable only; no wireless mode) |
| 15 | portable | M | `false` | — **FLAG** — inferred, not an explicit manufacturer label: full-size `544 g` open-back with `"Recommended power level >250mW"`. No portability claim and no case/travel language on this page, unlike its sibling XC SKU. |
| 16 | soundSignature | E | `Warm` | Crinacle rankings list: `"Warm"` / `"Classic Audeze combo of solid resolution with a confusing lack of upper midrange."` (entry `"Audeze LCD-2 Classic"`, $800, Tone Grade C, Technical Grade A) |
| 17 | impedanceOhms | H | `70` | manufacturer spec table: `"Impedance 70 ohms"`; LCD User Guide: `"LCD-2 Specifications ... Impedance: 70 ohms"` (both same-tier sources agree) |
| 18 | sensitivityDbMw | H | `101` | manufacturer spec table: `"Sensitivity 101 dB/1mW (at Drum Reference Point)"`; LCD User Guide: `"Efficiency: 101dB / 1mW*"` (both agree) |
| 19 | freqResponseHz | H | `{min: 10, max: 50000}` | manufacturer spec table: `"Frequency response 10Hz - 50kHz"` |
| 20 | requiresAmplifier | D | not set — derived field, not decided by this pass | — |
| 21 | microphone | M | `false` | Boolean feature-absence rule: no microphone on the manufacturer page, its spec table, or the LCD User Guide's LCD-2 section. |
| 22 | cableTermination | M | `4-pin-xlr`, `6.35mm` | manufacturer spec table's package contents: `"4-pin XLR Cable"` / `"4-pin XLR to 1/4\" TRS adapter cable"` / `"1/4\" to 3.5mm adapter"`. The 4-pin XLR cable plus its 1/4" adapter map to the schema's `4-pin-xlr` + `6.35mm`. The LCD User Guide's footnote `"** Not included with LCD-2"` on the balanced XLR cable does **not** govern here: the manual's bundle is keyed to the LCD-2, whereas the current `lcd-2-classic` product page explicitly lists a 4-pin XLR cable as included for this SKU — the more current same-tier source governs. |
| 23 | detachableCable | M | `true` | manufacturer spec table lists cables as separate package items (not a captive lead) + LCD User Guide `"Connecting Your Headphones"` attach/release procedure. |
| 24 | cableLengthM | H | `null` | Exhausted: the manufacturer page names the cables (`"4-pin XLR Cable"`, `"4-pin XLR to 1/4\" TRS adapter cable"`) with **no** length; the LCD User Guide's LCD-2 specification block states impedance and efficiency but no cable length; the guide's LCD-line package list likewise gives no length. Genuine gap. |
| 25 | foldable | M | `false` | Boolean feature-absence rule: no folding hinge described in the manufacturer spec table or the LCD User Guide's structure/comfort sections. |
| 26 | ipxRating | M | `null` | Exhausted: no IP/water-resistance claim on the manufacturer page, spec table, or user guide. `null` per the non-marketable-spec rule. |
| 27 | bluetoothCodecs | M | `null` | NULL — domain-gated, wired-only product. |
| 28 | anc | M | `none` | Derived from already-cited `acousticDesign: open-back` + `connectivity: wired`: open-back design leaks ambient sound by intent and there are no ANC electronics. |
| 29 | batteryLifeHours | M | `{ancOff: null, ancOn: null}` | NULL — wired-only, no battery. |
| 30 | driverType | H | `planar-magnetic` | manufacturer spec table: `"Transducer type Planar Magnetic"` + `"Magnetic structure Proprietary magnet array"` + `"Transducer size 106 mm"`; LCD User Guide `"advanced planar magnetics"` |
| 31 | driverConfigBucket / driverConfigDetail | H/D | `null` | NULL — domain-gated to IEM; full-size over-ear with a single 106 mm planar driver. |

- `filterAttributes.sourcing.portable` note: recorded `false` with a FLAG. Evidence considered both ways — full-size `677 g` closed-back, `> 250mW` recommended power, fixed studio cable (against portability) versus an included `"Economy Travel Case"` (for it). No manufacturer statement of portability or desktop-only use exists, so the value is an inference and is flagged as such rather than presented as manufacturer-stated.


### Citations

- `filterAttributes.sourcing.{productCategory, wearingStyle, acousticDesign, connectivity, freqResponseHz, impedanceOhms, sensitivityDbMw, cableTermination, driverType, awards}`: url `https://www.audeze.com/products/lcd-2-classic`, quotes: `"Style Over-ear, open-back"` / `"Transducer type Planar Magnetic"` / `"Magnetic structure Proprietary magnet array"` / `"Transducer size 106 mm"` / `"Frequency response 10Hz - 50kHz"` / `"Impedance 70 ohms"` / `"Sensitivity 101 dB/1mW (at Drum Reference Point)"` / `"Minimum power requirement >100mW"` / `"Recommended power level >250mW"` / `"Includes: LCD-2 Classic Headphone | Standard LCD Travel Case | 4-pin XLR Cable | 4-pin XLR to 1/4\" TRS adapter cable | 1/4\" to 3.5mm adapter | Warranty Card and Certificate of Authenticity"` / `"Editor's Choice award. It's one of the best models that Audeze have ever made...for under a grand, nothing sounds as good." - The Switch Master`. Tier `hard-spec`/`marketing-fact` as applicable, sourcedAt `2026-09-13`.
- `filterAttributes.sourcing.{impedanceOhms, sensitivityDbMw, detachableCable, driverType}` (same-tier manufacturer corroboration): url `https://cdn.shopify.com/s/files/1/3013/1908/files/LCD_UserGuide_FULL_WEB_160222.pdf`, quotes: `"LCD-2 Specifications Style: Open-back circumaural ... Impedance: 70 ohms ... Efficiency: 101dB / 1mW*"` / `"** Not included with LCD-2"` / `"To remove the connector press down on the small black (L) and red (R) button and gently remove the connector"`. Tier `hard-spec`/`marketing-fact`, sourcedAt `2026-09-13`. **No conflict** on either hard spec: both same-tier sources agree on `70 Ω` and `101 dB/1mW`. The two sources' package lists differ only on whether a 4-pin XLR cable ships (the manual excludes it for "LCD-2"; the current Classic page includes it) — a bundle question, where the recency rule gives the currently-live product page precedence for the SKU actually on sale, so `4-pin-xlr` is recorded.
- `filterAttributes.sourcing.soundSignature`: url `https://crinacle.com/rankings/headphones/`, quote `"Warm"` / `"Classic Audeze combo of solid resolution with a confusing lack of upper midrange."` (entry `"Audeze LCD-2 Classic"`, $800, Tone Grade C, Technical Grade A). Tier `editorial`, sourcedAt `2026-09-13`. Corroborating manufacturer copy on the product page (`"a warm and energetic musical experience"`) is **not** cited — Tier 3 requires independent methodology-published sources, never manufacturer marketing — and is recorded here only as a non-citation.

---

## 6. Audeze MM-100 Headphones ($399.00) — `Pn6oyV4Ks5AcNbecjgz0Fr`

The one Audeze product in this batch whose specification Audeze publishes in a
single clean block *including* a cable length, and the one with a Tier-3
measured review that independently publishes numeric figures.

| # | Field | Tier | Value | Citation |
|---|---|---|---|---|
| 4 | awards | M | `null` | No award to the product found. The page's only award-adjacent string is `"Pedigree: Designed in collaboration with Grammy award-winning engineer/producer Manny Marroquin"`, which credits a *collaborator's* Grammy, not an award to the headphone. Checked the manufacturer page, spec block, and the RTINGS review; no named product award. `null` stands. |
| 10 | productCategory | M | `over-ear` | manufacturer spec table: `"Style Over-ear, open-back"` |
| 11 | wearingStyle | M | `over-ear` | manufacturer spec table: `"Over-ear"` |
| 12 | acousticDesign | M | `open-back` | manufacturer spec table: `"open-back"` |
| 13 | fitType | M | `null` — not an IEM | — |
| 14 | connectivity | M | `wired` | manufacturer spec table (analog cable only; no wireless mode) |
| 15 | portable | M | `true` | manufacturer spec table: `"Cable 2.5m (8.2ft) Single ended 3.5mm TRS to 1/4\" TRS"` plus `"Soft Storage Bag"` in the included items, and the page's `"Versatile: High efficiency drivers, works well with wide variety of equipment"`. RTINGS' review body independently supports it: `"Their low sensitivity and impedance also mean you can use them with a phone or laptop without a dedicated amp or sound card to drive them."` |
| 16 | soundSignature | E | `Neutral` | RTINGS measured review: `"Their frequency response mostly follows their flat sound profile, with a few major peaks and dips. The sound profile is relatively well-aligned with our target in the bass and mid-range, though the treble response is notably recessed"` — a flat, target-aligned reading with recessed treble maps to `Neutral` (`Bright/Analytical` is specifically ruled out by the recessed treble; `Warm` is not supported by the bass/mid-range alignment). |
| 17 | impedanceOhms | H | `18` | manufacturer spec table: `"Impedance 18 ohms"`; RTINGS independently corroborates it is low-impedance and phone-drivable. |
| 18 | sensitivityDbMw | H | `98` | manufacturer spec table: `"Sensitivity 98 dB/1mW (at Drum Reference Point)"` |
| 19 | freqResponseHz | H | `{min: 20, max: 25000}` | manufacturer spec table: `"Frequency response 20Hz - 25kHz"` |
| 20 | requiresAmplifier | D | not set — derived field, not decided by this pass | — |
| 21 | microphone | M | `false` | Boolean feature-absence rule: no microphone in the manufacturer spec block, the included-items list, or the page's feature copy. |
| 22 | cableTermination | M | `3.5mm`, `6.35mm` | manufacturer spec table: `"Cable 2.5m (8.2ft) Single ended 3.5mm TRS to 1/4\" TRS"` + included `"1/4\" to 3.5mm adapter"` — a 3.5mm-to-1/4" cable with an adapter, mapping to both vocabulary values. |
| 23 | detachableCable | M | `true` | manufacturer spec block lists the cable as a discrete included item (`"Braided Headphone Cable"`) separate from the headphone, and no captive-cable language appears on the page. **FLAG** — Audeze's MM-100 quick-start guide PDF (`ADZ_MM100_S20_Quick_Start_Guide_061725_v1.pdf`, listed on the support index) was **not** opened in this pass, so this leans on package-contents structure rather than an explicit attach/detach instruction of the kind the LCD User Guide provides. Carried into Design gaps as a verification-pass item. |
| 24 | cableLengthM | H | `2.5` | manufacturer spec table: `"Cable 2.5m (8.2ft) ..."` — the manufacturer's own dual-unit figure, so no conversion was inferred. |
| 25 | foldable | M | `false` | Boolean feature-absence rule: no folding/hinge mechanism in the manufacturer spec block or the page's structure copy (magnesium yokes, spring-steel headband, no fold claim). |
| 26 | ipxRating | M | `null` | Exhausted: no IP/water-resistance claim on the manufacturer page, spec block, or feature copy. `null` per the non-marketable-spec rule. |
| 27 | bluetoothCodecs | M | `null` | NULL — domain-gated, wired-only product. |
| 28 | anc | M | `none` | Derived from already-cited `acousticDesign: open-back` + `connectivity: wired`: open-back design leaks ambient sound by intent and there are no ANC electronics. |

### Citations

- `filterAttributes.sourcing.{productCategory, wearingStyle, acousticDesign, connectivity, freqResponseHz, impedanceOhms, sensitivityDbMw, cableTermination, cableLengthM, portable, driverType}`: url `https://www.audeze.com/products/mm-100`, quotes: `"Style Over-ear, open-back"` / `"Transducer type Planar Magnetic"` / `"Magnetic structure Fluxor™ magnet array"` / `"Diaphragm type Ultra-Thin Uniforce™"` / `"Transducer size 90 mm"` / `"Frequency response 20Hz - 25kHz"` / `"Sensitivity 98 dB/1mW (at Drum Reference Point)"` / `"Impedance 18 ohms"` / `"Cable 2.5m (8.2ft) Single ended 3.5mm TRS to 1/4\" TRS"` / `"Includes: MM-100 Headphone | Braided Headphone Cable | Soft Storage Bag | Certificate of Authenticity and Warranty Cards | 1/4\" to 3.5mm adapter"` / `"Versatile: High efficiency drivers, works well with wide variety of equipment"`. Tier `hard-spec`/`marketing-fact` as applicable, sourcedAt `2026-09-13`.
- `filterAttributes.sourcing.soundSignature`: url `https://www.rtings.com/headphones/reviews/audeze/mm-100`, quote `"Their frequency response mostly follows their flat sound profile, with a few major peaks and dips. The sound profile is relatively well-aligned with our target in the bass and mid-range, though the treble response is notably recessed"`. Tier `editorial`, sourcedAt `2026-09-13`. Crinacle's rankings list has no MM-100 entry (checked directly) and no ASR measurement thread for the MM-100 was located, so RTINGS is the sole Tier-3 source — recorded with that single-source status explicit.
- `filterAttributes.sourcing.portable` / `impedanceOhms` (corroborating, RTINGS): url `https://www.rtings.com/headphones/reviews/audeze/mm-100`, quote `"Their low sensitivity and impedance also mean you can use them with a phone or laptop without a dedicated amp or sound card to drive them."`. Tier `editorial`, sourcedAt `2026-09-13`.
- `filterAttributes.sourcing.{microphone, foldable, ipxRating}` exhaustion trail: manufacturer product page (spec block, feature bullets, included-items list, FAQ) read in full; no microphone, no IP rating, no folding mechanism. `microphone`/`foldable` → `false` by the marketable-feature-absence rule; `ipxRating` → `null` per the non-marketable-spec rule.
- `filterAttributes.sourcing.awards` exhaustion trail: the page's only award-adjacent text credits `"Grammy award-winning engineer/producer Manny Marroquin"` — a collaborator's credential, not an award to this headphone; the spec block and included-items list carry no award; the RTINGS review publishes a score but no award. `null` stands.

---

## Verification pass (separate pass, not a self-check)


## Design gaps found (reported back, not fixed here — out of scope per this issue)

1. **`awards` has no stated shape.** The schema types it as a free-text array
   (`of: [{ type: "string" }]`) with no vocabulary, so two independent passes can
   legitimately produce different strings for the same award
   (`"PC Gamer — \"Editor's Pick Award\""` here vs. a bare `"PC Gamer"` or
   `"Editor's Pick"` elsewhere). The DCA batch hit the same thing with its
   `NYT Wirecutter` entry. Recommend the schema/`should-be` side settle a
   convention (e.g. `"<Publication> — \"<Award name>\""`) before fan-out, since
   filter facet counting on a free-text array will fragment otherwise.
2. **`soundSignature`'s vocabulary has no slot for Crinacle's `"Balanced"`.**
   Crinacle uses `"Balanced"` for the LCD-XC; the schema's list offers
   `Neutral` / `Warm` / `Bright/Analytical` / `Dark` / `V-Shaped` / `Basshead` /
   `Mid-Forward` / `Harman-target-like`. This pass mapped `"Balanced"` → `Neutral`
   by reading it as "neither warm nor bright" (the same call the pilot made), but
   that is an interpretation, not a stated equivalence. Worth a decision before
   other brands hit the same descriptor.
3. **`cableTermination` conflates "cup socket" with "shipped plug".** The LCD
   collection's cups take a 3.5mm connector while the stock cable terminates in
   4-pin XLR (LCD-X, LCD-2 Classic) or 1/4" (LCD-XC). This pass recorded the
   *shipped termination(s)*, consistent with the HiFiMan batch's Arya row, but the
   schema does not say which of the two facts the facet means. A shopper filtering
   "4-pin XLR" is plausibly asking about the plug they will hold, not the socket
   inside the cup — worth stating explicitly.
4. **Audeze's award-adjacent copy is a trap for extraction.** Three of these
   pages carry the phrase `"award winning artists and engineers"` and another
   carries `"Grammy award-winning engineer/producer Manny Marroquin"`. All
   describe *people*, not products. An initial pass of this document wrongly
   recorded `awards` for the LCD-X on the strength of that phrase; it was caught
   and corrected during the same pass. Flagging it so the verification pass and
   later brands do not repeat it.
5. **MM-100 `detachableCable` rests on package-contents structure, not an
   explicit instruction** (see the row's FLAG). The MM-100 quick-start guide PDF
   on Audeze's own support index was not opened in this pass; confirming it there
   would clear the flag. Recorded rather than silently asserted.

## Summary

| Product | `_id` | Tier-3 `soundSignature` source | Flags |
|---|---|---|---|
| Maxwell | `moXlkADK7m1DHgGwWtWl8T` | RTINGS: `Warm` | 0 |
| LCD-X (2024 CE) | `moXlkADK7m1DHgGwWtbizC` | Crinacle `Warm neutral` + RTINGS `warm` → `Warm` | 1 (`portable`) |
| LCD-X (2024 CE) | `Pn6oyV4Ks5AcNbecjgysXB` | same as above (shared model-level spec + review) | 1 (`portable`) |
| LCD-XC (2021 CE, Open Box) | `k27n1AQuIbSr5iozFz7FkW` | Crinacle: `Balanced` → `Neutral` (sole Tier-3 source) | 1 (`portable`) |
| LCD-2 Classic | `PHPYj28HJdPDHAaIBAJiLG` | Crinacle: `Warm` | 1 (`portable`) |
| MM-100 | `Pn6oyV4Ks5AcNbecjgz0Fr` | RTINGS: flat/recessed treble → `Neutral` (sole Tier-3 source) | 1 (`detachableCable`) |

Tier-3 coverage: **6 of 6 products** have an independent measured source for
`soundSignature` — Crinacle for the LCD-X, LCD-XC and LCD-2 Classic; RTINGS for
the Maxwell and MM-100; the LCD-X carrying both. No product in this batch has a
`soundSignature` null, making Audeze the best-covered brand in the fan-out so
far on the fan-out's documented long pole.

`requiresAmplifier` (D-tier) is deliberately **not written** by this pass — the
pilot flagged that the schema states no derivation threshold, and an earlier
pass on this fan-out recorded it as "out of scope — derived field, not decided
by this pass". That decision is maintained here rather than inventing a
threshold. Note for whoever does decide it: the Maxwell's `impedanceOhms` and
`sensitivityDbMw` are both `null`, so `requiresAmplifier` cannot be derived for
that product at all under an impedance+sensitivity rule, regardless of threshold.

The issue's second acceptance test requires an independent pass that **opens
each citation and confirms the source states the recorded value**, done
separately from the sourcing pass above. That pass is recorded in
`sourced-headphones-audeze-verification.md` and is **not** performed in this document.
This file is the sourcing pass only.

| 29 | batteryLifeHours | M | `{ancOff: null, ancOn: null}` | NULL — wired-only, no battery. |
| 30 | driverType | H | `planar-magnetic` | manufacturer spec table: `"Transducer type Planar Magnetic"` + `"Magnetic structure Fluxor™ magnet array"` + `"Diaphragm type Ultra-Thin Uniforce™"` + `"Transducer size 90 mm"` |
| 31 | driverConfigBucket / driverConfigDetail | H/D | `null` | NULL — domain-gated to IEM; full-size over-ear with a single 90 mm planar driver. |

- `filterAttributes.sourcing.{microphone, foldable, ipxRating, cableLengthM}` exhaustion trail: manufacturer product page and spec table read in full; LCD User Guide LCD-2 specification block, package-contents list, and connecting/structure sections read in full. No microphone, no IP rating, no folding mechanism, and no cable length in any of them. `microphone`/`foldable` → `false` by the marketable-feature-absence rule; `ipxRating` and `cableLengthM` → `null` (both are specs a manufacturer may simply omit, so the null-is-a-last-resort rule governs and both were exhausted first).

---
