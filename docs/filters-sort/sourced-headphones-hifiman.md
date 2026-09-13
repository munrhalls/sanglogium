# HiFiMan Sourcing Results — `sang-logium-1xs.9.3`

Sourced against `schema-headphones.md` + `sourcing-protocol-headphones.md`
(2026-09-13 widened tiers). Products drawn from the real catalogue —
name/brand/price only; no other POC enrichment field (`app/(test)/poc/filter-sort/headphones/dataset.json`)
is treated as ground truth. That dataset's existing values for these HiFiMan
products are known-wrong for several fields (e.g. this first product is
mislabeled there as a true-wireless in-ear) and are ignored entirely.

Tier legend: **H** hard spec, **M** marketing/feature fact, **E** editorial,
**D** derived, **I** internal (not sourced). Status flags: **NULL**
(exhausted, genuinely unfound), **FLAG** (recorded but low-confidence /
inference), **CONFLICT** (two same-tier manufacturer sources disagree).

Scope: all 11 products enumerated in `sang-logium-1xs.9.3`. **In progress —
3 of 11 sourced so far.** A separate independent verification pass (mirroring
`pilot-headphones-verification.md`) is required per product before this
counts as done, per the issue's acceptance tests.

## 1. Hifiman Arya Headphones | Stealth Magnets Edition ($599.00) — `moXlkADK7m1DHgGwWtXu6V`

| Field | Tier | Value | Source | Status |
|---|---|---|---|---|
| impedanceOhms | H | `32` (Ω) | HIFIMAN Arya Owner's Guide PDF | — |
| sensitivityDbMw | H | `94` (dB) | HIFIMAN Arya Owner's Guide PDF | — |
| freqResponseHz | H | `{min:8, max:65000}` | HIFIMAN Arya Owner's Guide PDF | — |
| driverType | H | `planar-magnetic` | HIFIMAN Owner's Guide + headphones.com + Bloom Audio | — |
| driverConfigBucket / driverConfigDetail | H/D | `null` | — | NULL — domain-gated to IEM (should-be.md item 31), doesn't apply to an over-ear |
| cableLengthM | H | `1.5` (stock 6.35mm cable) | HIFIMAN Owner's Guide PDF ("Package Contents") | — |
| awards | M | `null` | — | NULL — checked headphones.com, Bloom Audio, Audio46, and press review titles (RTINGS, Headfonia, Headphonesty, ThePCEnthusiast, SoundStage! Solo); no award/editor's-choice designation found |
| productCategory | M | `Over-Ear` | headphones.com product facet | — |
| wearingStyle | M | `Over-Ear` | headphones.com product facet | — |
| acousticDesign | M | `Open-Back` | HIFIMAN Owner's Guide PDF + headphones.com facet | — |
| fitType | M | `null` | — | NULL — not an IEM, field doesn't apply |
| connectivity | M | `wired` | headphones.com facet + Owner's Guide (no wireless feature mentioned) | — |
| portable | M | `false` | — | FLAG — inferred from full-size open-back design + explicit amp-required facet + no case/travel language anywhere found; not an explicit manufacturer "portable/desktop" statement |
| microphone | M | `false` | — | FLAG — no mic mentioned anywhere in the Owner's Guide or retailer pages; absence-based inference, not an explicit statement |
| cableTermination | M | `6.35mm` (stock cable); swappable to `4.4mm-balanced`, `4-pin-xlr`, `2.5mm-balanced` per manual | HIFIMAN Owner's Guide PDF ("The Plugs") | — |
| detachableCable | M | `true` | HIFIMAN Owner's Guide PDF ("The cable is user-replaceable") | — |
| foldable | M | `false` | — | FLAG — Owner's Guide describes only headband-height adjustment and ear-cup swivel; no folding/collapsing mechanism described anywhere; absence-based inference |
| ipxRating | M | `null` | — | NULL — no IP/water-resistance claim found anywhere (expected for an open desktop headphone) |
| bluetoothCodecs | M | `null` | — | NULL — domain-gated, wired-only product |
| anc | M | `none` | derived from already-cited `acousticDesign: Open-Back` + `connectivity: wired` (open-back leaks ambient sound by design; no electronics present) | — |
| batteryLifeHours | M | `{ancOff: null, ancOn: null}` | — | NULL — wired-only, no battery |
| soundSignature | E | `Bright/Analytical` (Tone Grade A+, Technical S-) | Crinacle rankings list | FLAG — see note below |

### Citations

- `filterAttributes.sourcing.{impedanceOhms, sensitivityDbMw, freqResponseHz, driverType, cableLengthM, acousticDesign, cableTermination, detachableCable}`: url `https://hifiman.com/attachments/file/20250211/20250211033708_51720.pdf` (HIFIMAN Arya Owner's Guide, opened and read visually as page images — not a failed text-scrape), quotes: `"Impedance: 32 Ω"` / `"Sensitivity: 94 dB"` / `"Frequency response: 8 Hz-65 kHz"` / `"(1) 1.5m headphone cable (6.35mm)"` / `"HIFIMAN utilizes an 'Open Back' design for best possible sound"` / `"The Arya package includes a 6.35mm connector cable... if you require a 4.4mm or XLR cable one can easily be swapped over... The Arya itself has 3.5mm sockets"` / `"The cable is user-replaceable and has channel orientation for left and right"`. Tier `hard-spec`/`marketing-fact` as applicable, sourcedAt `2026-09-13`.
- `filterAttributes.sourcing.{productCategory, wearingStyle, connectivity, driverType}` (corroborating): url `https://headphones.com/products/hifiman-arya-headphones-stealth-magnets-edition`, facets quoted verbatim: `"Cup Style: Open-Back"` / `"Wearing Style: Over-ear"` / `"Driver Type: Planar Magnetic"` / `"Connectivity: Wired"` / `"Amp Required: Yes"`. Tier `marketing-fact`, sourcedAt `2026-09-13`.
- `filterAttributes.sourcing.{acousticDesign, driverType}` (corroborating): url `https://bloomaudio.com/products/hifiman-arya-stealth-magnets`, quotes: `"3.5mm headphone connectors that are angled at 10°"` / `"Open-back headphones utilizing HiFiMAN's innovative, low-distortion planar magnetic technology"`. Tier `marketing-fact`, sourcedAt `2026-09-13`.
- `filterAttributes.sourcing.soundSignature`: url `https://crinacle.com/rankings/headphones/`, quote `"High resolution planar that may be a little peaky in the treble for some."` (entry "Hifiman Arya", $1,600, Tone Grade A+, Technical Grade S-). Tier `editorial`, sourcedAt `2026-09-13`. **Flagged**: this is the rankings list's only "Arya" row, not explicitly labeled "Stealth Magnets Edition." The $1,600 MSRP matches the current standalone Arya, which HIFIMAN has sold only in Stealth Magnets form since the original non-Stealth Arya was discontinued — treated as likely the same product, but not manufacturer-confirmed as SKU-identical. A dedicated `crinacle.com/graphs/headphones/hifiman-arya-stealth/` page also exists but its review text/grade was not extractable via direct fetch (JS-rendered); needs the verification pass to try harder (e.g. render the page) before this flag can be cleared.
- **Awards exhaustion trail:** checked headphones.com and Bloom Audio product pages (no award badge/text), plus a targeted search across RTINGS, Headfonia, Headphonesty, ThePCEnthusiast, and SoundStage! Solo review titles/summaries — no "award winner" or "editor's choice" designation found for this SKU.
- **Portable/microphone/foldable exhaustion trail:** the full 16-page HIFIMAN Owner's Guide (read visually in full) contains no folding, portability, or microphone language anywhere; headphones.com and Bloom Audio product pages are likewise silent on all three. A Headphonesty review that might have covered handling/build details returned HTTP 403 and could not be fetched. No other tech-press source was directly quoted for these three fields — recorded as absence-based `false`/FLAG rather than `null`, matching this fan-out's established convention (see `headphones-dca-sourced.md`'s `microphone`/`portable` rows) for "explicitly checked, consistently absent" facts, not treated as a positive manufacturer statement.

## 2. HiFiMAN Audivina Closed-Back Headphones ($699.00) — `k27n1AQuIbSr5iozFz7KCz`

| Field | Tier | Value | Source | Status |
|---|---|---|---|---|
| impedanceOhms | H | `20` (Ω) | HIFIMAN Audivina Owner's Guide PDF | — |
| sensitivityDbMw | H | `97` (dB) | HIFIMAN Audivina Owner's Guide PDF | — |
| freqResponseHz | H | `{min:5, max:55000}` | HIFIMAN Audivina Owner's Guide PDF | — |
| driverType | H | `planar-magnetic` | HIFIMAN Owner's Guide ("NEO Supernano Diaphragm", "planar headphones") + headphones.com | — |
| driverConfigBucket / driverConfigDetail | H/D | `null` | — | NULL — domain-gated to IEM (should-be.md item 31), doesn't apply to an over-ear |
| cableLengthM | H | `1.5` (3.5mm SE cable, primary) | HIFIMAN Owner's Guide PDF ("Package Contents") | FLAG — three cables ship in-box at different lengths (3.5mm SE 1.5m, 6.35mm SE 3m, XLR balanced 3m); schema models a single value, so the shortest/SE cable is recorded per the pilot's established convention (see Focal Clear Mg in `pilot-headphones-sourced.md`) |
| awards | M | `null` | — | NULL — checked headphones.com, Bloom Audio, and press review titles (Headfonia, HomeTheaterHifi, Headfonics, The Mad Audio, MOONSTAR); no award/editor's-choice designation found |
| productCategory | M | `Over-Ear` | headphones.com product facet | — |
| wearingStyle | M | `Over-Ear` | headphones.com product facet | — |
| acousticDesign | M | `Closed-Back` | HIFIMAN Owner's Guide PDF (explicit "Closed-back" badge + "Acoustic Structure Specialized for Closed-back Design") + headphones.com facet | — |
| fitType | M | `null` | — | NULL — not an IEM, field doesn't apply |
| connectivity | M | `wired` | headphones.com facet + Owner's Guide (no wireless feature mentioned) | — |
| portable | M | `true` | HIFIMAN Audivina Owner's Guide PDF | — direct — cables described as "suitable for most portable audio devices, mobile phones, PCs..."; package includes a "Headphone Travel Bag" |
| microphone | M | `false` | — | FLAG — no mic mentioned anywhere in the Owner's Guide or retailer pages; absence-based inference |
| cableTermination | M | `3.5mm SE`, `6.35mm`, `4-pin-xlr` (all three included in box) | HIFIMAN Owner's Guide PDF ("Package Contents") | — |
| detachableCable | M | `true` | HIFIMAN Owner's Guide PDF (three swappable cables via "highly reliable socket") | — |
| foldable | M | `false` | — | FLAG — Owner's Guide describes only headband adjustment; the included Travel Bag is a carry pouch, not evidence of a folding hinge; no folding mechanism described or shown anywhere; absence-based inference |
| ipxRating | M | `null` | — | NULL — no IP/water-resistance claim found anywhere |
| bluetoothCodecs | M | `null` | — | NULL — domain-gated, wired-only product |
| anc | M | `passive` | derived from already-cited `acousticDesign: Closed-Back` (sealed cup design provides passive isolation; no ANC electronics, wired-only) | — |
| batteryLifeHours | M | `{ancOff: null, ancOn: null}` | — | NULL — wired-only, no battery |
| soundSignature | E | `null` | — | NULL — no Crinacle rankings-list or individual-review-post entry found; no Rtings review exists for this model (404); no dedicated ASR measurement thread found (only a non-measurement "arrived today" forum post) — all three Tier 3 sources exhausted |

### Citations

- `filterAttributes.sourcing.{impedanceOhms, sensitivityDbMw, freqResponseHz, driverType, cableLengthM, acousticDesign, cableTermination, detachableCable, portable}`: url `https://hifiman.com/attachments/file/20230510/20230510094538_17805.pdf` (HIFIMAN Audivina Owner's Guide, opened and read visually as page images — not a failed text-scrape), quotes: `"Frequency Response: 5Hz-55kHz"` / `"Impedance: 20Ω"` / `"Sensitivity: 97dB"` / `"Weight: 470g"` / `"AUDIVINA Headphone... Ear pads... 3.5mm single-end 1.5m cable x1, 6.35mm single-ended 3m cable x1, XLR balanced 3m cable x1, Headphone Travel Bag x1"` / `"Closed-back"` badge + `"Acoustic Structure Specialized for Closed-back Design"` / `"Inbox companions include 3.5mm single-end cable, XLR balanced cable and 6.35mm single-end cable, which are suitable for most portable audio devices, mobile phones, PCs, and professional- and audiophile-grade amplifiers etc."` / `"The highly reliable socket ensures the contact resistance remains extremely low while having no effect on the signal path"` (swappable-cable system). Tier `hard-spec`/`marketing-fact` as applicable, sourcedAt `2026-09-13`.
- `filterAttributes.sourcing.{productCategory, wearingStyle, connectivity, driverType, acousticDesign}` (corroborating): url `https://headphones.com/products/hifiman-audivina-closed-back-headphones`, facets quoted verbatim: `"Cup Style: Closed-Back"` / `"Wearing Style: Over-ear"` / `"Driver Type: Planar Magnetic"` / `"Connectivity: Wired"` / `"Amp Required: Yes"`. Tier `marketing-fact`, sourcedAt `2026-09-13`.
- **soundSignature exhaustion trail:** `https://crinacle.com/rankings/headphones/` fetched directly, no "Audivina" row found; a site-scoped search for `crinacle.com Audivina` returned no matching page (no rankings entry, no individual review/crinnotes post); `https://www.rtings.com/headphones/reviews/hifiman/audivina` returned HTTP 404 (no review exists); an ASR forum search found only a non-measurement "Hifiman Audivina arrived today" thread, not a lab-measurement post. All three widened Tier 3 sources exhausted; `null` stands.
- **Awards exhaustion trail:** checked headphones.com and Bloom Audio product pages (no award badge/text), plus a targeted search across Headfonia, HomeTheaterHifi.com, Headfonics, The Mad Audio, and MOONSTAR Reviews titles/summaries — no "award winner" or "editor's choice" designation found for this SKU.
- **Microphone/foldable exhaustion trail:** the full 22-page HIFIMAN Owner's Guide (read visually in full) contains no microphone language anywhere and no folding/hinge mechanism described or pictured (only headband-height adjustment); the included "Headphone Travel Bag" is package contents, not a folding claim. Recorded as absence-based `false`/FLAG, matching the same-issue precedent set for product 1 and the DCA sibling batch.

## 3. HiFiMAN Ananda BT (2024 Edition) ($799.00) — `n10eAegrGspodtsQw136D2`

The `hifiman.com/products/detail/349` spec tab renders server-side only from
the Download Center path (`/services/downlist/0/349`), which is how the
official Owner's Guide PDF below was located. Tier-1 numbers come from that
guide; the Open-Back fact is corroborated by RTINGS.

| Field | Tier | Value | Source | Status |
|---|---|---|---|---|
| impedanceOhms | H | `25` (Ω) | HIFIMAN ANANDA-BT Owner's Guide PDF | — |
| sensitivityDbMw | H | `103` (dB) | HIFIMAN ANANDA-BT Owner's Guide PDF | — |
| freqResponseHz | H | `{min:8, max:55000}` | HIFIMAN ANANDA-BT Owner's Guide PDF | — |
| driverType | H | `planar-magnetic` | Guide ("Acoustically Invisible Stealth Magnets" / "NEO Supernano Diaphragm" / "Planar headphones benefit from break-in…") | — |
| driverConfigBucket / driverConfigDetail | H/D | `null` | — | NULL — domain-gated to IEM (should-be.md item 31), doesn't apply to an over-ear |
| batteryLifeHours | H | `{ancOff: 10, ancOn: null}` | Guide ("Play Time: ~10 hours") | — |
| cableTermination | H | `usb-c` | Guide ("USB C to USB A cable x1", "USB C to USB C cable x1") | — |
| cableLengthM | H | `null` | — | NULL — guide states no length for either included USB cable; genuinely unfound |
| productCategory | M | `over-ear` | RTINGS review class + wired-Ananda sibling facets | — |
| wearingStyle | M | `over-ear` | RTINGS review ("the Bluetooth version of the HiFiMan Ananda") | — |
| acousticDesign | M | `open-back` | RTINGS: "These open-back headphones are designed to allow background noise to enter the ear cups…" | — |
| fitType | M | `null` | — | NULL — not an IEM, field doesn't apply |
| connectivity | M | `hybrid` | Guide: "not only supports Bluetooth playback but also can be directly connected to a device via a USB cable for music playback" | — |
| portable | M | `true` | Guide: "devices such as mobile phones or other portable players that don't include a power supply" + "Headphone Travel Bag x1"; self-powered Bluetooth | FLAG — no explicit manufacturer "portable" label, but the Bluetooth-first design + travel bag + portable-player language make this a positive factual inference (contrast product 1, which had none) |
| microphone | M | `true` | Guide: "dual-microphone cVc 8.0 noise reduction technology… when making calls" (`HFP,HSP` profiles); RTINGS: "they also have a detachable boom microphone" | — — **inverted** vs. products 1–2, which were absence-based `false` |
| detachableCable | M | `false` | Guide package contents list only fixed USB cables; no swappable socket system described | — — contrast products 1–2 (`true`) |
| foldable | M | `false` | — | FLAG — Guide describes only "Headband Adjustment" via two adjustment blocks; no fold/hinge/collapse mechanism described anywhere; absence-based inference (same rule as products 1–2) |
| ipxRating | M | `null` | — | NULL — no IP/water-resistance claim found anywhere |
| bluetoothCodecs | M | `sbc, aac, aptx, aptx-hd, ldac` | Guide: "Audio Codec: aptX, aptX HD, LDAC, AAC, SBC" (Bluetooth 5.1, profiles HFP/HSP/A2DP/AVRCP) | — |
| anc | M | `passive` | derived + absence-based: the guide's only "noise reduction" language is the dual-microphone **cVc 8.0 call path**, not music playback; no ANC mode, battery figure has only one value | — — **ANC ≠ mic noise reduction**; do not read product 3's `microphone: true` as implying ANC |
| soundSignature | E | `Neutral` | Crinacle rankings list, entry "Hifiman Ananda" (Tone Grade S-, Technical Grade B, ★) | FLAG — see note below |

### Citations

- `filterAttributes.sourcing.{impedanceOhms, sensitivityDbMw, freqResponseHz, driverType, cableTermination, batteryLifeHours, connectivity, microphone, anc, portable, detachableCable, cableLengthM, foldable}`: url `https://hifiman.com/attachments/file/20250211/20250211033309_95943.pdf` (HIFIMAN ANANDA-BT Owner's Guide, v20250207, retrieved from the product page's "Download Center" link at `https://hifiman.com/services/downlist/0/349` and extracted with `pdftotext` — 20 pages, not a failed text-scrape), quotes: `"Frequency Response: 8Hz-55kHz"` / `"Impedance: 25Ω"` / `"Sensitivity: 103dB"` / `"Weight: 469g"` / `"Charging Time: ~2.7 hours"` / `"Play Time: ~10 hours"` / `"Bluetooth Version: Bluetooth 5.1"` / `"Bluetooth Profile: HFP,HSP,A2DP,AVRCP"` / `"Audio Codec: aptX ,aptX HD, LDAC, AAC,SBC"` / `"Maximum Communication Distance: 10m (barrier-free transmission)"` / `"Package Contents: ANANDA-BT Headphone / Ear Pads (installed on the headphone) x1 pair / Headphone Travel Bag x1 / USB C to USB A cable x1 / USB C to USB C cable x1"` / `"ANANDA-BT not only supports Bluetooth playback but also can be directly connected to a device via a USB cable for music playback."` / `"Bluetooth / USB Mode Easy Switching"` / `"ANANDA-BT is designed to transmit crystal-clear voice quality when making calls. Adopting the most advanced dual-microphone cVc 8.0 noise reduction technology…"` / `"Acoustically Invisible Stealth Magnets"` + `"NEO Supernano Diaphragm"` + `"Planar headphones benefit from break-in"` / `"Please note that if the headphone is connected to devices such as mobile phones or other portable players that don't include a power supply, it may need a charge more quickly than under other circumstances."` / `"Headband Adjustment — To secure the proper fit, use the two adjustment blocks to change the position of the headband strap."` / `"Type-C Jack"`. Tier `hard-spec`/`marketing-fact` as applicable, sourcedAt `2026-09-13`.
- `filterAttributes.sourcing.{acousticDesign, productCategory, wearingStyle}` (corroborating): url `https://www.rtings.com/headphones/reviews/hifiman/ananda-bt`, quotes: `"The HiFiMan ANANDA-BT Wireless are the Bluetooth version of the HiFiMan Ananda. They support higher resolution codecs like LDAC and aptX HD alongside USB audio connectivity for high-quality audio. Their open-back design lets sound interact with your environment…"` / `"They aren't designed for outdoor use, as their open-back design means they don't isolate any background noise and they leak a lot of sound."` / `"Also, their bulky design isn't very portable, so they may not fit easily into smaller bags and purses."` / summary blurb `"Detachable boom microphone."` / `"their over 11-hour continuous battery life"`. Tier `marketing-fact`, sourcedAt `2026-09-13`.
  - **Note on RTINGS portability vs. our `portable: true`:** RTINGS says *not* "very portable" in the everyday sense (bulky, doesn't fit small bags), while our `portable` field means "runs without a desktop amp / designed for on-the-go listening with portable sources". The two are not in conflict — a large self-powered Bluetooth headphone is `portable: true` in the schema's sense even if it's bulky. Recorded rather than silently dropped, since it reads like a contradiction at a glance.
- `filterAttributes.sourcing.soundSignature`: url `https://crinacle.com/rankings/headphones/`, quote `"One of the best tuned headphones available, only limited by its raw resolving ability."` (entry "Hifiman Ananda", $700, Neutral, Tone Grade S-, Technical Grade B, ★). Tier `editorial`, sourcedAt `2026-09-13`. **Flagged**: the row is labeled "Hifiman Ananda", not "Ananda BT". RTINGS independently states the ANANDA-BT is "the Bluetooth version of the HiFiMan Ananda" with the same "open-back design" — treated as the same acoustics, but not manufacturer-confirmed as measurement-identical to the BT SKU. The verification pass should try the dedicated `crinacle.com/graphs/headphones/hifiman-ananda/` page (JS-rendered, not text-extractable by direct fetch) before clearing this flag.
- **Access trail (why earlier attempts failed):** `https://hifiman.com/products/detail/349` returns HTML whose "Specification" tab is *empty* — the page's spec block is served from the Download Center at `https://hifiman.com/services/downlist/0/349`, which lists both the Owner's Guide (`.../20250211/20250211033309_95943.pdf`) and a `Declaration of Conformity (DOC) - ANANDA-BT` (`.../20240924/20240924101531_26844.pdf`, not a spec document). Wayback snapshots and `/manual/` URL guessing were the wrong branch — the live Download Center is the authoritative path and is fully fetchable.
- **`cableTermination: usb-c` rationale:** the schema's `cableTermination` vocabulary has no generic USB value but does include `usb-c` (the field description says `usb-c`/`mmcx`/`2-pin`/`fixed-cable` were "kept from the old list"). The guide's connector is labelled `Type-C Jack` and both included cables terminate in USB-C at the headphone, so `usb-c` is the correct in-vocabulary value.
- **Microphone/ANC disambiguation:** the ANANDA-BT is the one HiFiMan product in this batch where a "noise reduction" phrase appears *and* is not ANC — it describes the dual-microphone cVc 8.0 voice pipeline (`HFP`/`HSP` profiles; `To answer a call` / `To reject a call` / `To finish a call` controls). `microphone: true` and `anc: "passive"` are both correct simultaneously; the guide contains no ANC mode and no ANC-off alternative battery figure, and RTINGS lists a `Microphone` / `Detachable boom microphone` entry but no ANC test.
- **Foldable / cableLength exhaustion trail:** the full 20-page Owner's Guide was read; it contains no `fold`/`collaps`/`hinge`/`swivel` token, only "Headband Adjustment" via two adjustment blocks (same absence pattern as products 1–2 → `false`). No cable length is published for either included USB cable in Specifications or Package Contents → `cableLengthM` stays `null` (protocol's null-is-a-last-resort rule: the tier order was exhausted and the figure genuinely isn't published).


