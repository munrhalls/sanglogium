# Brand Data Integrity — Inventory + Cleanup Plan

Reference doc for `sang-logium-g8q.1` — [Brand] Inventory + cleanup plan
Parent epic: `sang-logium-g8q` — EPIC Brand Data Integrity
Blocks: `sang-logium-g8q.2` (give every maker a slug) · `sang-logium-g8q.3` (merge duplicates, drop dead docs)

**Status:** g8q.1 CLOSED. §6 rulings all RESOLVED 2026-09-02 → g8q.2 is unblocked and ready; g8q.3 runs after g8q.2.

**Snapshot:** production dataset, read-only, 2026-09-02 ~09:50 UTC.
Every `_id` and count below is pasted verbatim from GROQ query output against
`https://2tdmkpky.apicdn.sanity.io` (public read, no token, `perspective: published`).
No writes were made. No drafts exist for `_type == "brand"` (`*[_type=="brand" && _id in path("drafts.**")]` → `[]`).

---

## 1. Totals

| Metric | Value |
|---|---|
| `count(*[_type == "brand"])` | **143** |
| Brand docs with a slug | 96 (93 distinct slug strings — `test-brand` repeats ×4) |
| Brand docs with **no** slug (`!defined(slug.current)`) | **47** |
| Brand docs with 0 product references | **12** |
| `count(*[_type == "product"])` | 1035 |
| Products with `defined(brand)` | 1035 (100%) |
| Products with a dangling brand ref (`!defined(brand->_id)`) | **0** |
| Σ per-brand product counts | 1035 (= total products; every product has exactly one resolvable brand) |

Product count per brand = `count(*[_type == "product" && references(^._id)])` (published perspective).

---

## 2. Full brand inventory

`pc` = product count. Sorted by name (case-insensitive). 143 rows.

| `_id` | name | slug | pc |
|---|---|---|---:|
| `36mAUM2eoaDVgeREyE22sd` | 64 Audio | `64-audio` | 12 |
| `36mAUM2eoaDVgeREyE25hh` | Advance Paris | `advance-paris` | 2 |
| `Pn6oyV4Ks5AcNbecjbXQ8L` | ALO audio | — | 1 |
| `36mAUM2eoaDVgeREyE26XZ` | Alpine | `alpine` | 6 |
| `GPjMdcfFWZVrKyR2PB4OVq` | Apos | — | 3 |
| `Pn6oyV4Ks5AcNbecjh0las` | Astell&Kern | — | 20 |
| `SRbPduY0SDJBJIcsBHIwsa` | Audeze | `audeze` | 16 |
| `SRbPduY0SDJBJIcsBHItZd` | Audio-Technica | `audio-technica` | 14 |
| `SRbPduY0SDJBJIcsBHIr1A` | AudioQuest | `audioquest` | 83 |
| `MrEMtYwMtrFDGWmRnQr5sf` | Audma | — | 1 |
| `36mAUM2eoaDVgeREyE23C5` | Aune Audio | `aune-audio` | 9 |
| `MrEMtYwMtrFDGWmRnRJq7A` | Auris Audio | — | 1 |
| `Pn6oyV4Ks5AcNbecjk6Yjk` | Austrian Audio | — | 2 |
| `36mAUM2eoaDVgeREyE2FTw` | Benchmark Media Systems | `benchmark-media-systems` | 1 |
| `SRbPduY0SDJBJIcsBHIwVL` | Bluesound | `bluesound` | 2 |
| `36mAUM2eoaDVgeREyE23P3` | Bose | `bose` | 10 |
| `DgvVxT5yo9RmuR6IbOwBd9` | Bowers & Wilkins | `bowers-wilkins` | 12 |
| `PHPYj28HJdPDHAaIBAHG4Y` | Burson | — | 1 |
| `36mAUM2eoaDVgeREyE2BSJ` | Burson Audio | `burson-audio` | 15 |
| `MrEMtYwMtrFDGWmRnRHb7T` | Cambridge Audio | — | 3 |
| `Pn6oyV4Ks5AcNbecjazF9c` | Campfire Audio | — | 5 |
| `PHPYj28HJdPDHAaIB63mOS` | Cayin | — | 12 |
| `36mAUM2eoaDVgeREyE299f` | Chief | `chief` | 1 |
| `MrEMtYwMtrFDGWmRnN6pZB` | Chord | — | 3 |
| `36mAUM2eoaDVgeREyE2BsF` | Chord Electronics | `chord-electronics` | 8 |
| `PHPYj28HJdPDHAaIB8e2ji` | Comply | — | 4 |
| `PHPYj28HJdPDHAaIBAKWq8` | CrinEar | — | 3 |
| `PHPYj28HJdPDHAaIBAMsO0` | Crystal Cables | — | 1 |
| `36mAUM2eoaDVgeREyE2APT` | Dan Clark Audio | `dan-clark-audio` | 10 |
| `PHPYj28HJdPDHAaIB68plG` | ddHiFi | — | 10 |
| `36mAUM2eoaDVgeREyE24LP` | Definitive Technology | `definitive-technology` | 1 |
| `36mAUM2eoaDVgeREyE2E4P` | Dekoni Audio | `dekoni-audio` | 108 |
| `DgvVxT5yo9RmuR6IbOw9vn` | Denon | `denon` | 14 |
| `PHPYj28HJdPDHAaIBCF5Ty` | Dunu | — | 2 |
| `DgvVxT5yo9RmuR6IbOwHHZ` | EarMen | `earmen` | 5 |
| `PHPYj28HJdPDHAaIB6GA5w` | Eletech | — | 9 |
| `36mAUM2eoaDVgeREyE2CIB` | Enleum | `enleum` | 4 |
| `DZc43yHr6ydfgE7zB45lD6` | ES Lab | — | 3 |
| `36mAUM2eoaDVgeREyE28wh` | Eversolo | `eversolo` | 7 |
| `DgvVxT5yo9RmuR6IbOw9NR` | Feliks Audio | `feliks-audio` | 5 |
| `Pn6oyV4Ks5AcNbecjguCZo` | Ferrum | — | 1 |
| `36mAUM2eoaDVgeREyE2Fts` | Ferrum Audio | `ferrum-audio` | 3 |
| `SRbPduY0SDJBJIcsBHIyp1` | FiiO | `fiio` | 16 |
| `36mAUM2eoaDVgeREyE2Fgu` | Final Audio | `final-audio` | 4 |
| `36mAUM2eoaDVgeREyE29mZ` | Focal | `focal` | 32 |
| `xMEqvkRBbdrlJXyFG8hKH9` | Fosi Audio | — | 2 |
| `GPjMdcfFWZVrKyR2PB5M4U` | Gustard | — | 6 |
| `DZc43yHr6ydfgE7zB462lv` | HarmonicDyne | — | 1 |
| `SRbPduY0SDJBJIcsBHIz5v` | headphones.com | `headphones-com` | 1 |
| `36mAUM2eoaDVgeREyE248R` | HEDD Audio | `hedd-audio` | 4 |
| `SRbPduY0SDJBJIcsBHIsU1` | HiFi Rose | `hifi-rose` | 7 |
| `36mAUM2eoaDVgeREyE2ACV` | Hifiman | `hifiman` | 18 |
| `DZc43yHr6ydfgE7zB41lLv` | HiFiMan | — | 9 |
| `MrEMtYwMtrFDGWmRnQVOFu` | Hisenior Audio | — | 1 |
| `PHPYj28HJdPDHAaIBACuBS` | iFi | — | 11 |
| `36mAUM2eoaDVgeREyE24YN` | iFi Audio | `ifi-audio` | 36 |
| `SRbPduY0SDJBJIcsBHIt1p` | Integra | `integra` | 2 |
| `DgvVxT5yo9RmuR6IbOw8ER` | IsoAcoustics | `isoacoustics` | 1 |
| `36mAUM2eoaDVgeREyE23vT` | JBL | `jbl` | 25 |
| `36mAUM2eoaDVgeREyE27gt` | JL Audio | `jl-audio` | 3 |
| `SRbPduY0SDJBJIcsBHIrUk` | Kanto | `kanto` | 24 |
| `DgvVxT5yo9RmuR6IbOwJCf` | Kanto Living | `kanto-living` | 3 |
| `DgvVxT5yo9RmuR6IbOwGuf` | KEF | `kef` | 2 |
| `36mAUM2eoaDVgeREyE25BH` | Kenwood | `kenwood` | 2 |
| `DgvVxT5yo9RmuR6IbOwJe9` | Kicker | `kicker` | **0** |
| `DZc43yHr6ydfgE7zB450Yd` | Kinera | — | 2 |
| `DgvVxT5yo9RmuR6IbOwE21` | KLH | `klh` | 1 |
| `DgvVxT5yo9RmuR6IbOwIpl` | Klipsch | `klipsch` | 1 |
| `GPjMdcfFWZVrKyR2PB5niY` | Ladder | — | 3 |
| `DgvVxT5yo9RmuR6IbOwHnd` | Lake People | `lake-people` | 1 |
| `36mAUM2eoaDVgeREyE29Zb` | LG | `lg` | 1 |
| `Pn6oyV4Ks5AcNbecjgvIl0` | Listenmore | — | 2 |
| `DgvVxT5yo9RmuR6IbOwJUz` | Lutron | `lutron` | 1 |
| `Pn6oyV4Ks5AcNbecjkVzCx` | Luxman | — | 1 |
| `DgvVxT5yo9RmuR6IbOwBKp` | madVR | `madvr` | 1 |
| `36mAUM2eoaDVgeREyE2619` | Marantz | `marantz` | 12 |
| `36mAUM2eoaDVgeREyE2Dkx` | Mark Levinson | `mark-levinson` | 1 |
| `DgvVxT5yo9RmuR6IbOwHZt` | Matrix Audio | `matrix-audio` | 7 |
| `SRbPduY0SDJBJIcsBHItIj` | McIntosh | `mcintosh` | 16 |
| `DgvVxT5yo9RmuR6IbOw7mx` | Meze | `meze` | 15 |
| `SRbPduY0SDJBJIcsBHIrdC` | Meze Audio | `meze-audio` | 26 |
| `DgvVxT5yo9RmuR6IbOwKJN` | Moondrop | `moondrop` | 12 |
| `DgvVxT5yo9RmuR6IbOw8fv` | Mountson | `mountson` | **0** |
| `SRbPduY0SDJBJIcsBHItmJ` | NAD Electronics | `nad-electronics` | 8 |
| `36mAUM2eoaDVgeREyE2DL1` | Naim | `naim` | 1 |
| `DgvVxT5yo9RmuR6IbOwI5x` | Nimbus | `nimbus` | 1 |
| `DgvVxT5yo9RmuR6IbOwIyv` | Noble Audio | `noble-audio` | 4 |
| `DgvVxT5yo9RmuR6IbOwEMd` | Onkyo | `onkyo` | 1 |
| `xMEqvkRBbdrlJXyFG8i8yZ` | Orchard Audio | — | 1 |
| `DgvVxT5yo9RmuR6IbOwAIh` | Ortofon | `ortofon` | **0** |
| `DgvVxT5yo9RmuR6IbOwDMn` | Panamax | `panamax` | **0** |
| `SRbPduY0SDJBJIcsBHIuhM` | Panasonic | `panasonic` | 2 |
| `36mAUM2eoaDVgeREyE26kX` | Polk Audio | `polk-audio` | 13 |
| `SRbPduY0SDJBJIcsBHIwMt` | Pro-Ject | `pro-ject` | 1 |
| `36mAUM2eoaDVgeREyE29zX` | PSB | `psb` | 1 |
| `36mAUM2eoaDVgeREyE2D1Z` | Questyle | `questyle` | 6 |
| `SRbPduY0SDJBJIcsBHIwdn` | Record Doctor | `record-doctor` | 1 |
| `PHPYj28HJdPDHAaIBAH12O` | RME | — | 1 |
| `DgvVxT5yo9RmuR6IbOwAkB` | Rotel | `rotel` | 1 |
| `36mAUM2eoaDVgeREyE27Tv` | Ruark Audio | `ruark-audio` | 1 |
| `DZc43yHr6ydfgE7zB40bhA` | Salad | — | 1 |
| `DgvVxT5yo9RmuR6IbOw8SB` | Sanus | `sanus` | 11 |
| `36mAUM2eoaDVgeREyE28QH` | Sennheiser | `sennheiser` | 26 |
| `MrEMtYwMtrFDGWmRnGiXr3` | Sensaphonics | — | 7 |
| `36mAUM2eoaDVgeREyE23iV` | Shure | `shure` | 15 |
| `SRbPduY0SDJBJIcsBHIxDi` | Singxer | `singxer` | 3 |
| `DZc43yHr6ydfgE7zB3zqzg` | SJY Audio | — | 1 |
| `36mAUM2eoaDVgeREyE2F7F` | SMSL | `smsl` | 3 |
| `SRbPduY0SDJBJIcsBHIwER` | Sofa Rockers | `sofa-rockers` | 1 |
| `MrEMtYwMtrFDGWmRnTESBj` | Softears | — | 1 |
| `36mAUM2eoaDVgeREyE273z` | Sonos | `sonos` | 21 |
| `DgvVxT5yo9RmuR6IbOwCPF` | Sonus faber | `sonus-faber` | 8 |
| `DgvVxT5yo9RmuR6IbOwA4x` | Sony | `sony` | 21 |
| `36mAUM2eoaDVgeREyE280L` | Sony Mobile | `sony-mobile` | **0** |
| `DgvVxT5yo9RmuR6IbOwDjh` | Soundcore | `soundcore` | 3 |
| `PHPYj28HJdPDHAaIB6GUkE` | Spinfit | — | 10 |
| `SRbPduY0SDJBJIcsBHIyHD` | SPL | `spl` | 4 |
| `DgvVxT5yo9RmuR6IbOwCm9` | SVS | `svs` | 11 |
| `Pn6oyV4Ks5AcNbecjb1KfG` | Symbio | — | 1 |
| `Pn6oyV4Ks5AcNbecjjqBMv` | Symphonium Audio | — | 2 |
| `Pn6oyV4Ks5AcNbecjjnQTy` | T+A | — | 4 |
| `SRbPduY0SDJBJIcsBHIscT` | TEAC | `teac` | 5 |
| `BmsCJrVMwh5L4y3NztGLbH` | Test Brand | `test-brand` | **0** |
| `RGVW3d7PGC4nLrVfIqsISd` | Test Brand | `test-brand` | **0** |
| `RGVW3d7PGC4nLrVfIqsJg7` | Test Brand | `test-brand` | **0** |
| `test-brand` | Test Brand | `test-brand` | **0** |
| `MHd9dKrYZDArdj3morESFI` | Test Brand Alpha | `test-brand-alpha` | **0** |
| `YcMKSEyusPBTcaoe1xiOw7` | Test Brand Beta | `test-brand-beta` | **0** |
| `DgvVxT5yo9RmuR6IbOwBTz` | The Last Factory | `the-last-factory` | **0** |
| `Pn6oyV4Ks5AcNbecjjooRT` | Thieaudio | — | 2 |
| `36mAUM2eoaDVgeREyE2Cbd` | Topping | `topping` | 18 |
| `PHPYj28HJdPDHAaIBCEsKc` | TRUTHEAR | — | 4 |
| `DgvVxT5yo9RmuR6IbOwB75` | Victrola | `victrola` | 3 |
| `SRbPduY0SDJBJIcsBHIx5G` | Violectric | `violectric` | 2 |
| `DZc43yHr6ydfgE7zB41Gqo` | VMV | — | 2 |
| `MrEMtYwMtrFDGWmRnTDD8U` | Warwick Acoustics | — | 3 |
| `36mAUM2eoaDVgeREyE2Enn` | Weiss | `weiss` | 1 |
| `xMEqvkRBbdrlJXyFG8c7FH` | Wicked Cushions | — | 24 |
| `36mAUM2eoaDVgeREyE2B2N` | Woo Audio | `woo-audio` | 5 |
| `xMEqvkRBbdrlJXyFG8gWlZ` | XDuoo | — | 11 |
| `SRbPduY0SDJBJIcsBHItul` | Yamaha | `yamaha` | 4 |
| `DZc43yHr6ydfgE7zB40m6c` | Yulong | — | 7 |
| `PHPYj28HJdPDHAaIBAHQ7W` | Zähl | — | 1 |

---

## 3. MERGE MAP

Each row: loser doc(s) whose products repoint to the winner, then the doc is deleted.
"Target pc" = current winner pc + Σ loser pc (checked: no product references both docs).

These 6 groups are the same real company under two docs — verified by reading
the loser's product names (all carry the winner's brand, e.g. the "Chord" doc's 3
products are all *Chord Electronics …*, not Chord Company cables). Kanto (ruling #1) is
a 7th confirmed group, listed separately below.

| Group | Loser `_id` (name, pc) | Winner `_id` | Winner name / slug | Target pc |
|---|---|---|---|---:|
| Burson | `PHPYj28HJdPDHAaIBAHG4Y` (Burson, 1) | `36mAUM2eoaDVgeREyE2BSJ` | Burson Audio / `burson-audio` | **16** |
| Chord | `MrEMtYwMtrFDGWmRnN6pZB` (Chord, 3) | `36mAUM2eoaDVgeREyE2BsF` | Chord Electronics / `chord-electronics` | **11** |
| Ferrum | `Pn6oyV4Ks5AcNbecjguCZo` (Ferrum, 1) | `36mAUM2eoaDVgeREyE2Fts` | Ferrum Audio / `ferrum-audio` | **4** |
| Hifiman | `DZc43yHr6ydfgE7zB41lLv` (HiFiMan, 9) | `36mAUM2eoaDVgeREyE2ACV` | Hifiman / `hifiman` | **27** |
| iFi | `PHPYj28HJdPDHAaIBACuBS` (iFi, 11) | `36mAUM2eoaDVgeREyE24YN` | iFi Audio / `ifi-audio` | **47** |
| Meze | `DgvVxT5yo9RmuR6IbOw7mx` (Meze, 15) | `SRbPduY0SDJBJIcsBHIrdC` | Meze Audio / `meze-audio` | **41** |

**Meze caveat for child 3:** the *loser* (`DgvVxT5yo9RmuR6IbOw7mx`) currently owns the
slug `meze`. After merge that slug is freed — child 3 must decide redirect
`/brand/meze` → `/brand/meze-audio` (see OPEN RULING #4) and must not leave the `?brand=meze`
filter value dangling.

Seventh group — **CONFIRMED** by ruling #1 (2026-09-02):

| Group | Loser `_id` (name, pc) | Winner `_id` | Winner name / slug | Target pc |
|---|---|---|---|---:|
| Kanto | `DgvVxT5yo9RmuR6IbOwJCf` (Kanto Living, 3) | `SRbPduY0SDJBJIcsBHIrUk` | Kanto / `kanto` | **27** |

Child 3 redirect: `/brand/kanto-living` → `/brand/kanto`.

**Sony Mobile** (`36mAUM2eoaDVgeREyE280L`, 0 products) — ruling #2: **not a merge, a delete.** Moved to §5 DELETE LIST.

---

## 4. SLUG MAP

42 standalone slugless docs that survive as their own brand (the 5 slugless
merge-losers above — Burson, Chord, Ferrum, HiFiMan, iFi — are **not** here; they are
deleted by the MERGE MAP).

Slug rule applied: lowercase, ASCII, `[^a-z0-9]+` → `-`, trimmed. **Collision check: all 42
checked against the 93 existing distinct slug strings — zero collisions.**

| `_id` | name | pc | slug to set |
|---|---|---:|---|
| `Pn6oyV4Ks5AcNbecjbXQ8L` | ALO audio | 1 | `alo-audio` |
| `GPjMdcfFWZVrKyR2PB4OVq` | Apos | 3 | `apos` |
| `Pn6oyV4Ks5AcNbecjh0las` | Astell&Kern | 20 | `astell-and-kern` |
| `MrEMtYwMtrFDGWmRnQr5sf` | Audma | 1 | `audma` |
| `MrEMtYwMtrFDGWmRnRJq7A` | Auris Audio | 1 | `auris-audio` |
| `Pn6oyV4Ks5AcNbecjk6Yjk` | Austrian Audio | 2 | `austrian-audio` |
| `MrEMtYwMtrFDGWmRnRHb7T` | Cambridge Audio | 3 | `cambridge-audio` |
| `Pn6oyV4Ks5AcNbecjazF9c` | Campfire Audio | 5 | `campfire-audio` |
| `PHPYj28HJdPDHAaIB63mOS` | Cayin | 12 | `cayin` |
| `PHPYj28HJdPDHAaIB8e2ji` | Comply | 4 | `comply` |
| `PHPYj28HJdPDHAaIBAKWq8` | CrinEar | 3 | `crinear` |
| `PHPYj28HJdPDHAaIBAMsO0` | Crystal Cables | 1 | `crystal-cables` |
| `PHPYj28HJdPDHAaIB68plG` | ddHiFi | 10 | `ddhifi` |
| `PHPYj28HJdPDHAaIBCF5Ty` | Dunu | 2 | `dunu` |
| `PHPYj28HJdPDHAaIB6GA5w` | Eletech | 9 | `eletech` |
| `DZc43yHr6ydfgE7zB45lD6` | ES Lab | 3 | `es-lab` |
| `xMEqvkRBbdrlJXyFG8hKH9` | Fosi Audio | 2 | `fosi-audio` |
| `GPjMdcfFWZVrKyR2PB5M4U` | Gustard | 6 | `gustard` |
| `DZc43yHr6ydfgE7zB462lv` | HarmonicDyne | 1 | `harmonicdyne` |
| `MrEMtYwMtrFDGWmRnQVOFu` | Hisenior Audio | 1 | `hisenior-audio` |
| `DZc43yHr6ydfgE7zB450Yd` | Kinera | 2 | `kinera` |
| `GPjMdcfFWZVrKyR2PB5niY` | Ladder | 3 | `ladder` |
| `Pn6oyV4Ks5AcNbecjgvIl0` | Listenmore | 2 | `listenmore` |
| `Pn6oyV4Ks5AcNbecjkVzCx` | Luxman | 1 | `luxman` |
| `xMEqvkRBbdrlJXyFG8i8yZ` | Orchard Audio | 1 | `orchard-audio` |
| `PHPYj28HJdPDHAaIBAH12O` | RME | 1 | `rme` |
| `DZc43yHr6ydfgE7zB40bhA` | Salad | 1 | `salad` |
| `MrEMtYwMtrFDGWmRnGiXr3` | Sensaphonics | 7 | `sensaphonics` |
| `DZc43yHr6ydfgE7zB3zqzg` | SJY Audio | 1 | `sjy-audio` |
| `MrEMtYwMtrFDGWmRnTESBj` | Softears | 1 | `softears` |
| `PHPYj28HJdPDHAaIB6GUkE` | Spinfit | 10 | `spinfit` |
| `Pn6oyV4Ks5AcNbecjb1KfG` | Symbio | 1 | `symbio` |
| `Pn6oyV4Ks5AcNbecjjqBMv` | Symphonium Audio | 2 | `symphonium-audio` |
| `Pn6oyV4Ks5AcNbecjjnQTy` | T+A | 4 | `t-plus-a` |
| `Pn6oyV4Ks5AcNbecjjooRT` | Thieaudio | 2 | `thieaudio` |
| `PHPYj28HJdPDHAaIBCEsKc` | TRUTHEAR | 4 | `truthear` |
| `DZc43yHr6ydfgE7zB41Gqo` | VMV | 2 | `vmv` |
| `MrEMtYwMtrFDGWmRnTDD8U` | Warwick Acoustics | 3 | `warwick-acoustics` |
| `xMEqvkRBbdrlJXyFG8c7FH` | Wicked Cushions | 24 | `wicked-cushions` |
| `xMEqvkRBbdrlJXyFG8gWlZ` | XDuoo | 11 | `xduoo` |
| `DZc43yHr6ydfgE7zB40m6c` | Yulong | 7 | `yulong` |
| `PHPYj28HJdPDHAaIBAHQ7W` | Zähl | 1 | `zahl` |

---

## 5. DELETE LIST

Docs to delete, each confirmed at **0 product references** —
`count(*[references([...these ids...])])` → **0** (across all perspectives, drafts included).

| `_id` | name | slug | created | source |
|---|---|---|---|---|
| `BmsCJrVMwh5L4y3NztGLbH` | Test Brand | `test-brand` | 2026-04-18 | test fixture |
| `RGVW3d7PGC4nLrVfIqsISd` | Test Brand | `test-brand` | 2026-04-18 | test fixture |
| `RGVW3d7PGC4nLrVfIqsJg7` | Test Brand | `test-brand` | 2026-04-18 | test fixture |
| `test-brand` | Test Brand | `test-brand` | 2026-04-16 | test fixture |
| `MHd9dKrYZDArdj3morESFI` | Test Brand Alpha | `test-brand-alpha` | 2026-04-12 | test fixture |
| `YcMKSEyusPBTcaoe1xiOw7` | Test Brand Beta | `test-brand-beta` | 2026-04-12 | test fixture |
| `36mAUM2eoaDVgeREyE280L` | Sony Mobile | `sony-mobile` | — | ruling #2 (2026-09-02) |
| `DgvVxT5yo9RmuR6IbOwBTz` | The Last Factory | `the-last-factory` | 2026-04-02 | ruling #3 (2026-09-02) |

Child 3 redirects for the two ruling-driven deletes: `/brand/sony-mobile` → `/brand/sony`; `/brand/the-last-factory` → 404/home (no successor).

### Not deleted — real brands with 0 products (leave untouched)

`Kicker` (`DgvVxT5yo9RmuR6IbOwJe9`), `Mountson` (`DgvVxT5yo9RmuR6IbOw8fv`),
`Ortofon` (`DgvVxT5yo9RmuR6IbOwAIh`), `Panamax` (`DgvVxT5yo9RmuR6IbOwDMn`) —
all have valid slugs, real brand names, just no catalogue products yet. No action in any child.

---

## 6. OPEN RULINGS — RESOLVED 2026-09-02 (Munrhalls)

All six answered. Nothing below is left to agent judgement.

| # | Question | Decision |
|---|---|---|
| 1 | **Kanto** + **Kanto Living** — merge or keep separate? | **MERGE.** Loser `DgvVxT5yo9RmuR6IbOwJCf`, winner `SRbPduY0SDJBJIcsBHIrUk` (Kanto / `kanto`), target pc 27. Redirect `/brand/kanto-living` → `/brand/kanto`. Folded into §3. |
| 2 | **Sony Mobile** (`sony-mobile`, 0 products) — merge, delete, or keep? | **DELETE** `36mAUM2eoaDVgeREyE280L`. Moved to §5. Redirect `/brand/sony-mobile` → `/brand/sony`. |
| 3 | **The Last Factory** (`the-last-factory`, 0 products) — keep or delete? | **DELETE** `DgvVxT5yo9RmuR6IbOwBTz`. Moved to §5. No successor — `/brand/the-last-factory` → 404/home. |
| 4 | **Meze** canonical slug? | **As recommended:** canonical `meze-audio`, child 3 redirects the freed `/brand/meze` → `/brand/meze-audio`. |
| 5 | **Hifiman** display-name casing? | Slug stays `hifiman` (already consistent — lowercase-hyphen). Otherwise as recommended: child 3 corrects the display name `Hifiman` → `HiFiMan` while patching the doc. |
| 6 | **Slug-string format** for `Astell&Kern`, `T+A`, `Zähl`? | **Accept all three as proposed**, and the rule is now standing convention: `&` → `-and-`, `+` → `-plus-`, diacritics folded to ASCII. → `astell-and-kern`, `t-plus-a`, `zahl`. §4 SLUG MAP is final and unchanged. |

---

## 7. CONSUMER LIST — every code path that reads brand slug or `_id`

Blast radius for child 3. Grouped by risk.

### Query / data layer (read `brand->{ _id, name, slug }`)

- **`sanity-cms/lib/products/getBrandFacets.ts`** — `*[_type == "brand" && defined(slug.current)]{ "slug": slug.current, "label": name, "count": count(*[_type=="product" && references(^._id) && …]) }`. The filter-sidebar brand facet list. **Slugless brands are silently excluded here — this is the exact bug the epic fixes.** Reads slug + name + `_id`. Sorts by count desc then label asc.
- **`lib/catalogue/buildProductQuery.ts`** (L68–78) — applies the `?brand=` URL filter: `parts.push('lower(brand->slug.current) in $brands')`. Case-insensitive match on brand slug via product deref. A renamed slug breaks any bookmarked `?brand=<oldslug>` URL.
- **`sanity-cms/lib/products/getProductBySlug.ts`** (L33) — `brand->{ _id, name, slug }` for the PDP.
- **`sanity-cms/lib/products/searchProducts.ts`** (L49, 95) — `brand._ref in *[_type == "brand" && name match $query]._id` (brand-name search) and (L56, 108) `"brand": brand->{ _id, name, slug }`. Also weights `brand->name match $query => 15`.
- **`sanity-cms/lib/products/getProductsByVfsKeys.ts`** (L38, 166) — `brand->{ _id, name, slug }` for catalogue grid rows.
- **`sanity-cms/lib/homepage/getHomepageData.ts`** — ~14 projections of `brand->{ _id, name, slug }` across homepage sections.
- **`sanity-cms/lib/products/getProductsByIds.ts`, `getRelatedProducts.ts`** — brand deref for basket / related-product rows.

All of the above deref **live** via `brand->` — after a merge (products repointed) and slug set, they self-heal on the next fetch. No stored brand id/slug to migrate in code.

### Routing / SEO

- **`app/(store)/brand/[slug]/page.tsx`** — a **stub**. It title-cases the URL slug for an `<h1>` and renders nothing else; it does **not** query the brand document. No `generateStaticParams`. Consequence: changing a brand's slug changes this URL, and old inbound links render the wrong heading — but nothing throws.
- **`app/sitemap.ts`** — emits product + category + static routes only. **No brand URLs.** Zero sitemap impact from slug changes.
- **No `/brand/<slug>` links exist anywhere under `app/`** — brand pages are currently unlinked from the UI.

### Client filter UI (round-trips brand slug through the URL)

- **`app/(store)/products/page.tsx`** (L46, 52) and **`app/(store)/products/[...slug]/page.tsx`** (L59, 65) — call `getBrandFacets(...)` and `brandLabelMap(...)`, pass `selectedSlugs: brand`.
- **`app/components/features/filters/ActiveFilterChips.tsx`** (L57–74) — renders a chip per `?brand=` slug, label from `brandLabels[slug] ?? slug`.
- **`app/components/features/filters/FilterSidebar.tsx` / `MobileFilterBar.tsx`** — consume `BrandFacet[]` (type import) to render checkboxes.
- **`app/hooks/nuqs/useFilterSort.tsx`** (L52) — `brand: string[]` in the URL contract.

### Display of `brand.name` (affected only if a merge changes the surviving name — e.g. "Meze" → "Meze Audio")

- **`app/components/features/products/ProductCard.tsx`** (L26–30) — strips a leading `"<brand.name> "` prefix from the product name. If the "Meze" doc is merged away, products named `"Meze 105 AER …"` (brand becomes "Meze Audio") stop having their prefix stripped.
- **`app/components/features/homepage/featured/Featured.tsx`** (L37–39) — `getModelName` does the same prefix strip with a regex built from `brandName`.
- **`ProductInfo.tsx` (L81), `AccessoryCard.tsx`, `DacCard.tsx`, `IemCard.tsx`** — render `brand.name` verbatim; harmless.

### Build-time / generated artifacts

- **`data/current-mappings.json`** — contains string `"brand": "Meze"` / `"Meze Audio"` / `"Kanto"` fields. **Not imported by any runtime code** (grep: only `data/catalogue-index.json` is imported, and it holds the category VFS, no brand data). Audit artifact only — no blast radius; regenerate for accuracy after merges if desired.
- **`data/catalogue-index.json` / `data/catalogue.ts`** — category tree VFS. **No brand data.** Untouched by this epic.
- **`sanity.types.ts`** — generated `Brand` type declares `slug: Slug` (non-optional) even though 47 docs currently have no slug. After child 2 this becomes true. The hand-written interfaces in `sanity-cms/lib/products/*` already type `brand.slug` as optional; `getProductBySlug.ts` types it `slug: string` (nominal only).

### Schema

- **`sanity-cms/schemaTypes/brandType.ts`** — `slug` field has `validation: Rule.required()`. The 47 slugless docs predate/bypass this (imported via API). Child 2's writes will bring them into compliance; no schema change needed.

---

## 8. Execution notes for children 2 & 3

- All 6 §6 rulings are **RESOLVED** (2026-09-02). Every mutation is now spelled out with a real `_id`; nothing is left to agent judgement at write time.
- **Child 2 (slugs) — unblocked, ready to start.** 42 `patch().set({ 'slug': { _type: 'slug', current: '<value>' } })` straight from §4 SLUG MAP (final, unchanged by the rulings). Additive only — no merges, deletes, or ref changes; no dependency on child 3. Re-verify each slug's uniqueness against live data at write time (read-only CDN, see appendix); abort the batch on any collision.
- **Child 3 (merge + delete) — run after child 2.** Serialize with `sang-logium-3a9`. For each of the 7 MERGE MAP groups (Burson, Chord, Ferrum, Hifiman, iFi, Meze, Kanto): repoint every `*[_type=="product" && brand._ref == "<loser>"]` to the winner `_ref`, assert loser inbound-ref count == 0 AND winner pc == target pc, then delete the loser. Then delete the 8 §5 DELETE LIST docs. Then set winner name `Hifiman` → `HiFiMan` (ruling #5). Then add redirects: `/brand/kanto-living`→`/brand/kanto`, `/brand/meze`→`/brand/meze-audio`, `/brand/sony-mobile`→`/brand/sony`, `/brand/the-last-factory`→ home.
- `data/current-mappings.json` regen is **not required** — it is imported by zero runtime code (see §7). Skip it.
- Re-run the §1 totals query after each child and diff against this snapshot.

---

## Appendix — queries used (all read-only, public CDN)

```groq
// Inventory (§2)
*[_type == "brand"]{
  _id, name, "slug": slug.current,
  "pc": count(*[_type == "product" && references(^._id)]),
  _createdAt, _updatedAt
} | order(lower(name) asc)

// Totals (§1)
{
  "products": count(*[_type == "product"]),
  "withBrand": count(*[_type == "product" && defined(brand)]),
  "dangling": count(*[_type == "product" && defined(brand) && !defined(brand->_id)])
}

// Drafts check
*[_type == "brand" && _id in path("drafts.**")]{ _id, name }        // → []

// Delete-list 0-reference proof (§5)
count(*[references([
  "BmsCJrVMwh5L4y3NztGLbH","RGVW3d7PGC4nLrVfIqsISd","RGVW3d7PGC4nLrVfIqsJg7",
  "test-brand","MHd9dKrYZDArdj3morESFI","YcMKSEyusPBTcaoe1xiOw7",
  "DgvVxT5yo9RmuR6IbOwBTz"
])])                                                                 // → 0

// Loser-doc product names (merge verification, §3) — per loser _ref
*[_type == "product" && brand._ref == "<loser-id>"]{ name }
```
