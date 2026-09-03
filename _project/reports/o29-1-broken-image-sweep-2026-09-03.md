# o29.1 — Broken product-image sweep (verified)

> **EPIC o29 COMPLETE 2026-09-03.** The 15 broken products resolved: **11 promoted**
> a real gallery photo to main (verified on :3000); **4 deleted** — Cayin HA-2A,
> Cayin HA-3A, Cayin N6iii, Yulong Aquila III (galleries were marketing-slides only,
> nothing to promote; human decision; run via `sang-logium-data/_o29-delete.ts`).
> The 60×45 placeholder asset `c4f4425f…` was deleted (0 references remained).
> Gustard R30 gallery also trimmed 8→4 (dropped spec-sheet graphics).
> Re-run sweep: **0 tiny/placeholder, 0 missing**. Audio Electronics count 238→234.
> Still open: `sang-logium-86r` (7 mis-assigned photos), section D (25 empty galleries → `2de`).


**Issue:** `sang-logium-o29.1` — [Images] Sweep catalogue for broken product images
**Run:** 2026-09-03 · dataset `production` (`2tdmkpky`) · 1038 products
**Tool:** `sang-logium-data/find-bad-images.ts` (regenerated `bad-images-report.json`)
**Verification:** every flagged item below was checked against the real Sanity
asset (downloaded and viewed) and, for a sample, against the live storefront on
`localhost:3000`. The script's raw output is **not** trusted as-is — see false
positives.

---

## Raw script output

| bucket | count |
|---|---|
| missingImage | 0 |
| tinyImage (<150px) | 15 |
| emptyGallery | 25 |
| brokenGalleryAsset | 0 |
| repeatedHash (asset shared by ≥3 products) | 55 |

`repeatedHash` overlaps `tinyImage` — the 15 tiny images are all the same asset.
Distinct problem products in the raw output: **15 tiny + 40 other repeated-hash + 25 empty gallery**.

---

## A. CONFIRMED BROKEN — the shared 60×45 placeholder (15 products)

Asset `c4f4425f0953affea308dfd5dfa78b225112bca2-60x45.png` — a 60×45 grey-blue
halftone smear, byte-identical across **5 brands**. Impossible for a real photo.
All 15 sit in **Audio Electronics** (`ti2wufd15h51jxtq855ogbfa`).

**Every one of these 15 has a full, usable gallery (3–8 real images each)** — so
they can be fixed by promoting an existing image (o29.3), no external sourcing.
Caveat: `gallery[0]` is **not** always a clean pack shot — Cayin N6iii leads with
a marketing banner; Burson Voyager's is a partial detail shot. o29.3 must let the
human pick the right gallery frame, not blind-take index 0.

| # | brand | product | slug | gallery |
|---|---|---|---|---|
| 1 | Burson Audio | Burson Playmate 3 Class-A Headphone Amp/Pre-Amp/DAC | `burson-playmate-3-class-a-headphone-amp-pre-amp-dac` | 8/8 |
| 2 | Burson Audio | Burson SOLOIST STELLAR 8W XLR Class-A Headphone/Pre Amp | `burson-soloist-stellar-8w-xlr-class-a-headphone-pre-amp` | 8/8 |
| 3 | Burson Audio | Burson Soloist Voyager Flagship Class-A Headphone Amplifier | `burson-soloist-voyager-flagship-class-a-headphone-amplifier` | 8/8 (detail shot) |
| 4 | Cayin | Cayin HA-2A Desktop Tube Headphone Amplifier | `cayin-ha-2a-desktop-tube-headphone-amplifier` | 8/8 |
| 5 | Cayin | Cayin HA-3A Desktop Tube Headphone Amplifier | `cayin-ha-3a-desktop-tube-headphone-amplifier` | 8/8 |
| 6 | Cayin | Cayin N6iii Digital Audio Player | `cayin-n6iii-digital-audio-player` | 8/8 (gallery[0] = banner) |
| 7 | Gustard | GUSTARD R30 Fully-Discrete R2R Network Streaming DAC (Apos Certified) | `gustard-r30-fully-discrete-r2r-network-streaming-dac-apos-certified` | 8/8 |
| 8 | Gustard | GUSTARD X26 III Dual ES9039SPRO DAC | `gustard-x26-iii-dual-es9039spro-digital-to-analog-convertor-dac` | 5/5 |
| 9 | Gustard | GUSTARD X30 4xES9039SPRO Streamer DAC | `gustard-x30-4xes9039spro-streamer-digital-to-analog-convertor-dac` | 3/3 |
| 10 | Singxer | Singxer SA-2 Fully-balanced Headphone Amplifier (Apos Certified) | `singxer-sa-2-fully-balanced-headphone-amplifier-apos-certified` | 8/8 |
| 11 | Yulong | YULONG DAART A39 Desktop R2R Pre-Amp & Headphone Amplifier | `yulong-daart-a39-desktop-r2r-pre-amp-headphone-amplifier` | 6/6 |
| 12 | Yulong | YULONG DAART Aquila III Desktop DAC/Pre-amp/Amp | `yulong-daart-aquila-iii-desktop-dac-pre-amp-amp` | 8/8 |
| 13 | Yulong | YULONG DAART Asura Music Streamer & Desktop DAC & Headphone Amplifier | `yulong-daart-asura-music-streamer-desktop-dac-headphone-amplifier` | 7/7 |
| 14 | Yulong | YULONG DAART Aurora Desktop DAC/Pre-amp/Headphone Amp | `yulong-daart-aurora-desktop-dac-pre-amp-headphone-amp` | 8/8 |
| 15 | Yulong | YULONG DAART D39 ESS9039PRO Music Streamer & Desktop DAC | `yulong-daart-d39-ess9039pro-music-streamer-desktop-dac` | 5/5 |

Exact within-category order to be pinned against the live listing when batches are cut.

---

## B. FALSE POSITIVES — `repeatedHash` flagged legitimate shared variant photos (40 products, 10 groups)

Every one of these has a **full-resolution, correct** main image. The hash repeats
because the same product is sold in multiple lengths / voltages / pack sizes /
conditions and correctly shares one photo. **Do not touch.** Verified by viewing
each asset; AudioQuest Pearl 48 HDMI also confirmed correct on `localhost:3000`.

| hash | image | products | verdict |
|---|---|---|---|
| `e15f03c0` | SVS RCA subwoofer cable, 1024² | 6 × SVS SoundPath RCA (1–15 m) | correct |
| `0612d6c7` | AudioQuest Red River XLR, 1024² | 4 × AQ Red River XLR (lengths / 2-pack) | correct |
| `6e68f7e4` | AQ NRG-X2 power cable, 1200² | 3 × AQ NRG-X2 (lengths) | correct |
| `75cc9625` | AQ NRG-X3 power cable, 1200² | 3 × AQ NRG-X3 (lengths) | correct |
| `bd812d3d` | AQ Pearl 48 HDMI, 1200² | 5 × AQ Pearl 48 HDMI (lengths) | correct |
| `45fa3ce9` | AQ Vodka 48 HDMI, 1200² | 3 × AQ Vodka 48 HDMI (lengths) | correct |
| `d6a121ce` | AQ Pearl RJ/E Ethernet, 1200² | 3 × AQ Pearl RJ/E (lengths) | correct |
| `03f0e327` | iFi iPower X PSU, 1200² | 3 × iFi iPower X (5 V / 12 V / 15 V) | correct |
| `fca0e748` | Focal Clear headphones, 1024² | 3 × Focal Clear (new + 2 open-box) | correct |

The script's `REPEATED_HASH_THRESHOLD = 3` is too aggressive for a catalogue that
sells cables in 6 lengths. A safe future heuristic: flag only when the shared hash
spans **≥2 distinct brands** OR the product names are not
length/voltage/pack/condition variants of one base name.

---

## C. DIFFERENT DEFECT — real photo, mis-assigned (7 products, not placeholders)

Not the placeholder, not in the o29 scope as written. Real product photos reused
on genuinely different products. Needs a human judgement call — flag to the human,
do not auto-fix in this epic.

| hash | image actually shows | wrongly used on |
|---|---|---|
| `04a1f289` | an **aluminium** headphone stand, marble base | `focal-headphone-stand` (plausible), `focal-mahogany-headphone-stand` (**wrong — should be mahogany**, confirmed on :3000), `audio-technica-aluminum-headphone-stand` (probably wrong) |
| `9fbb5fa1` | generic black earpads on a headphone | `dekoni-...-choice-leather-earpads-hifiman-sundara`, **`dekoni-audio-protective-headphone-travel-pouch` (wrong — it's a pouch)**, `focal-clear-mg-replacement-ear-pads`, `dekoni-...-elite-fenestrated-sheepskin-hd6xx` |

---

## D. OUT OF SCOPE — empty gallery (25 products)

All 25 have a **valid main image** (1000–1024 px). "Empty gallery" is a distinct
defect (missing secondary photos), not a broken listing image. Belongs to
`sang-logium-2de` or its own issue, not o29. List retained in
`sang-logium-data/bad-images-report.json` → `emptyGallery`.

---

## Recommendations

1. **o29 scope = the 15 in section A.** Nothing else in this sweep is a broken
   main listing image.
2. **o29.3 can likely clear all 15** by promoting a gallery image — no re-scrape,
   no external download. o29.2's scrape-pipeline path may be unnecessary for this
   epic; keep it only as fallback for any product whose gallery has no clean
   pack shot.
3. **Batching:** 15 products / one brand cluster / one category → a single batch
   of ~15, or two of 8+7, is enough. No need for many batch issues.
4. Section C (7 mis-assigned photos) → raise with the human as a separate small
   issue or fold into `2de`.
5. Section D (25 empty galleries) → `2de`.
6. `knownBadHashes` in the report currently lists 12 hashes — 11 of those are the
   section B/C legitimate-or-different ones. Only `c4f4425f…` should be treated as
   a hard placeholder. A `fix-bad-images.ts` run today would wrongly try to
   "fix" the 40 section-B products — **do not run it unfiltered.**
