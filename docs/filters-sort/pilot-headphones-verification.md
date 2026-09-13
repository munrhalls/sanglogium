# Independent Verification Pass — `pilot-headphones-sourced.md`

Each cited URL was opened directly (WebFetch) where possible; where a citation
was itself sourced from a search excerpt, or where a null field was
spot-checked, WebSearch was used (one search per null field, per the brief).
Status values: **CONFIRMED**, **CONTRADICTED**, **UNVERIFIABLE**, **SHOULD-BE-NULL**.

## 1. Sennheiser HD 600

| Field | Status | Notes |
|---|---|---|
| impedanceOhms (300) | CONFIRMED | Page states "Impedance: 300 Ω" verbatim. |
| sensitivityDbMw (97 dB, 1V) | CONFIRMED | "Sound pressure level (SPL): 97 dB (1 V)" verbatim. |
| freqResponseHz (12–40500) | CONFIRMED | "Frequency response (speaker): 12 Hz - 40,500 Hz" verbatim. |
| driverType (dynamic) | CONFIRMED | "Transducer principle: dynamic, open" verbatim. |
| cableTermination (3.5mm SE) | CONFIRMED | "Connector: 3.5 mm stereo jack plug"; page also confirms a 6.35mm adapter is included. |
| cableLengthM (3) | CONFIRMED | "Cable length: 3 m" verbatim. |
| soundSignature (Neutral, Crinacle) | CONFIRMED | Crinacle rankings list entry: "Neutral" / "The legendary neutral reference." |

All 7 citable fields for this product check out exactly as recorded.

## 2. HiFiMan Sundara (2020 Edition)

| Field | Status | Notes |
|---|---|---|
| impedanceOhms (32) | CONFIRMED | Page states "32Ω". |
| sensitivityDbMw (92 dB) | CONFIRMED | Page states "92dB". |
| freqResponseHz (6–75000) | CONFIRMED | Page states "6Hz-75kHz". |
| soundSignature (Neutral, Crinacle) | CONFIRMED | Crinacle rankings: "Neutral" / "Solid tuning with a little treble spiciness... one of the better midrange planars." |
| cableTermination (null) | **QUESTIONABLE NULL** | One search turned up the HiFiMan owner's manual (`down.hifiman.com/manual/SUNDARA-Owners-Manual.pdf`) and multiple retailer listings stating the Sundara uses dual 3.5mm connectors per ear cup with a 3.5mm-to-3.5mm stock cable. This looks like a real, findable manufacturer-adjacent source the original pass didn't reach — worth a follow-up fetch in the real pass rather than leaving null, though I did not fetch the PDF myself to confirm it's a "hard" citation. |
| foldable (null) | CONFIRMED NULL | One search of reviews found headband/comfort commentary but no explicit foldable/non-foldable claim. Null stands. |
| microphone (false, flagged low-confidence) | CONFIRMED (corroborated) | Independent search confirms Sundara is a wired-only headphone with no mic and cable options incompatible with common boom-mic add-ons. Supports the recorded `false`, though still not a direct manufacturer statement — the original's low-confidence flag remains fair. |

## 3. Focal Clear Mg

| Field | Status | Notes |
|---|---|---|
| freqResponseHz (5–23000) | CONFIRMED | "5 Hz – 23 kHz (±3dB)" verbatim. |
| impedanceOhms (55) | CONFIRMED | "55 Ω" verbatim. |
| driverType (dynamic, 40mm Mg dome) | CONFIRMED | "40mm Magnesium 'M'-shaped dome" verbatim. |
| cableTermination (3.5mm SE + 4-pin XLR) | CONFIRMED | Page lists both a 1.2m 3.5mm cable and a 3m 4-pin XLR cable, plus a 3.5→6.35mm adapter. |
| cableLengthM (1.2 SE / 3 XLR) | CONFIRMED | Matches the two cable lengths listed on the page. |
| **sensitivityDbMw (`104 dB SPL/1mW@1kHz`)** | **CONTRADICTED** | The page's actual spec is "104 dB SPL (peak@1m)" — a peak-SPL-at-1-meter figure, not a sensitivity-per-mW-at-1kHz figure. The citation block in the sourced doc quotes the peak@1m figure correctly, but the table row mislabels it as `dB SPL/1mW@1kHz`, which is a different measurement basis Focal does not publish on this page. The number (104) happens to match, but the unit/context is wrong — this is a transcription error, not just an ambiguous field. |
| soundSignature (null) | **PARTIALLY QUESTIONABLE NULL** | The original pass checked Crinacle's *rankings list* and ASR (which only has the Clear Professional, a different SKU) — correctly. However, one search found a separate Crinacle blog post ("Crinnotes: Focal Clear Mg Quick Review") that does grade the Clear Mg directly (a "B" grade, described as "warmer and more veiled" than the standard Clear). This is a genuine editorial source the original pass missed, though it's a different Crinacle page than the rankings list they checked, and it does not map cleanly to the same Neutral/Warm/Bright vocabulary used elsewhere. Flag for the real pass: check Crinacle's individual review posts, not just the rankings list, before nulling this field.

## 4. Sony WH-1000XM5

| Field | Status | Notes |
|---|---|---|
| impedanceOhms (48 Ω) | CONFIRMED | Help-guide page: "48 Ω (1 kHz) ... with the headset turned on" verbatim. |
| sensitivityDbMw (102 dB/mW) | CONFIRMED | "102 dB/mW ... with the headset turned on" verbatim. |
| freqResponseHz (4–40000) | CONFIRMED | "4 Hz - 40 000 Hz (JEITA)" verbatim. |
| bluetoothCodecs (SBC, AAC, LDAC) | CONFIRMED | Page confirms all three codecs. |
| batteryLifeHours (ANC on 30 / off 40) | CONFIRMED (indirect) | Could not extract text from the cited PDF directly (binary/compressed, unreadable to WebFetch) — same access problem the original sourcer likely also hit. An independent web search corroborates "30 hours ANC on / 40 hours ANC off" from Sony's own published specs via secondary retail listings. Treat the PDF citation itself as UNVERIFIABLE-BY-DIRECT-FETCH but the value as corroborated. |
| ipxRating (none — "not waterproof") | UNVERIFIABLE | Same PDF access problem; could not independently confirm the exact "not waterproof" quote. Plausible and consistent with the product (no official IP rating exists for this SKU) but not independently re-confirmed here. |
| driverType (dynamic, flagged low-confidence) | CONFIRMED (indirect) | Independent search confirms XM5 uses a dynamic driver (specifically a 30mm carbon-fiber-composite dynamic driver, replacing the 40mm driver in prior generations) — the "dynamic" type is correct; note the sourced doc doesn't claim a size, so no conflict, but flag for the real pass that "40mm" is NOT correct for this SKU if anyone infers it from older Sony models. |
| foldable (false, self-flagged as should-be-null) | **SHOULD-BE-NULL — AGREE** | The original pass already flagged this correctly. I found no independent statement either way; the recorded `false` is an inference from absence of folding instructions, which is exactly the kind of guess the null-over-guess protocol says shouldn't be asserted. Confirmed this should be null. |
| soundSignature (null) | CONFIRMED NULL | One search found only prose consumer reviews (warm/bass-forward descriptions), no Crinacle/ASR/Rtings measured ranking entry located. Null stands. |

## 5. Sony WF-1000XM5

| Field | Status | Notes |
|---|---|---|
| bluetoothCodecs (SBC, AAC, LDAC, LC3) | CONFIRMED | Page lists all four codecs verbatim. |
| freqResponseHz (20–20000) | CONFIRMED | "20 Hz - 20 000 Hz" verbatim (plus an extended LDAC figure not used in the sourced doc). |
| ipxRating (IPX4) | CONFIRMED | "IPX4: Protected against water splashing from any direction." verbatim. |
| batteryLifeHours (ANC on 8 / off 12, via Sony-mea) | UNVERIFIABLE | Sony-mea page returned HTTP 403 on direct fetch, same as the original pass's experience — the original's flag that this needs a direct-fetch re-check in the real pass stands; I could not clear it either. |
| driverType (null) | **QUESTIONABLE NULL** | One search found Sony's own press/spec materials (via Notebookcheck and other tech press quoting Sony) stating the WF-1000XM5 uses an "8.4mm Dynamic Driver X." This is a findable, attributable spec that the original pass missed by only checking the two help-guide subpages fetched. Recommend the real pass check Sony's press-release / product-page copy, not just the two help-guide URLs, before nulling driver fields. |
| driverConfigBucket (single-dynamic, flagged low-confidence) | CONFIRMED (indirect) | Consistent with the 8.4mm single dynamic driver found above. |
| soundSignature (null) | CONFIRMED NULL (inconclusive) | Search surfaced prose reviews only; no clear Crinacle IEM-ranking-list entry found for this SKU in one search. Null stands but was not exhaustively re-checked. |

## 6. Moondrop Alice

| Field | Status | Notes |
|---|---|---|
| driverType (dynamic, 10mm U.L.T.) | CONFIRMED | "10mm U.L.T. Super-linear Dynamic Driver" verbatim. |
| driverConfigBucket (single-dynamic) | CONFIRMED | Only one driver mentioned on the page, consistent. |
| impedanceOhms (32 ±15% @1kHz) | CONFIRMED | "impedance 32Ω ± 15% at 1kHz" verbatim. |
| bluetoothCodecs (AAC, SBC, aptX Adaptive) | CONFIRMED | "AAC/SBC/aptX Adaptive" verbatim. |
| batteryLifeHours (8 + 40) | CONFIRMED | "About 8 + 40hours" verbatim. |
| ipxRating (null) | CONFIRMED NULL | One search confirms no official IP rating exists for this product anywhere, including third-party reviews explicitly noting its absence. Null stands, well-supported. |
| soundSignature (null) | CONFIRMED NULL | One search found no Crinacle/ASR/Rtings entry specifically for the Alice. Null stands. |
| anc (none, via Qucox secondary source) | UNVERIFIABLE | Did not independently re-fetch the Qucox review; manufacturer page's silence on ANC is consistent but not a positive statement either way, as the original doc itself flags. No new information found. |
| microphone (true, dual MEMS, flagged low-confidence) | UNVERIFIABLE | Did not independently re-fetch the Headfonics/press source cited; not re-checked in this pass. |

## Missing-source log spot-checks (one search each)

| Product | Field | Result |
|---|---|---|
| Focal Clear Mg | soundSignature | Partial hit — see above (Crinacle quick-review post exists; rankings-list absence still correct). |
| Sony WH-1000XM5 | soundSignature | Null confirmed. |
| Sony WF-1000XM5 | soundSignature | Null confirmed (inconclusive search). |
| Moondrop Alice | soundSignature | Null confirmed. |
| HiFiMan Sundara | cableTermination | Questionable — likely findable via HiFiMan's own manual PDF; recommend re-check. |
| HiFiMan Sundara | foldable | Null confirmed. |
| Sony WF-1000XM5 | driverType | Questionable — 8.4mm dynamic driver spec is publicly attributed to Sony; recommend re-check via press materials. |
| Moondrop Alice | ipxRating | Null confirmed, strongly supported. |

## Summary

Of the ~28 distinct citation-backed field values across the six products, I
was able to directly re-fetch and exactly confirm the vast majority — all
manufacturer hard-spec pages (Sennheiser, HiFiMan, Focal, both Sony
help-guide HTML pages, Moondrop) returned readable content and their quotes
checked out verbatim, with one real error found: Focal Clear Mg's
`sensitivityDbMw` is mislabeled (the page's "104 dB SPL peak@1m" was
transcribed into a `dB SPL/1mW@1kHz` field, a different metric Focal doesn't
actually publish there). Two citations were genuinely unverifiable by me for
the same reasons the original sourcer flagged: the WH-1000XM5 PDF help guide
is unreadable to automated fetching (binary/compressed), and the Sony-mea
spec page 403s on direct fetch — both would need a different access method
(e.g. a text-extraction tool for the PDF, or a differently-routed fetch for
Sony-mea) in the real pass, not just another search. Of the 8 null fields
spot-checked, 6 held up as genuine nulls (often strongly, e.g. Moondrop's
missing IP rating), but 2 look like misses rather than genuine gaps — HiFiMan
Sundara's cable termination and the Sony WF-1000XM5's driver size/type both
have plausible, attributable public sources that one extra search turned up
in under a minute. Net calibration signal: for a wired/manufacturer-page-rich
product the "confirm-by-refetch" pass is fast and nearly 1:1 with the
sourcing pass itself (most fields check out cleanly), but the null fields are
where the real pass will find the most actionable misses — a second search
pass on nulled editorial/hard-spec fields before accepting them as null looks
worth budgeting into the full 70+ product run, and PDF/blocked-domain
citations should be flagged early as needing a non-search remediation
(e.g. PDF text extraction) rather than being re-attempted by search alone.
