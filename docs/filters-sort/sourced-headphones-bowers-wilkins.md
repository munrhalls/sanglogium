# Sourced Data — Bowers & Wilkins Headphones (`sang-logium-1xs.9.6`)

Sourced against `schema-headphones.md` + `sourcing-protocol-headphones.md`
(widened 2026-09-13 tiers). Field order below follows `schema-headphones.md`'s
fixed numbering (not tier grouping), so the same field sits in the same row
position across every product in this file — scan a column straight down to
compare across products. Tier legend: **H** hard spec, **M** marketing/feature
fact, **E** editorial, **D** derived (no own citation).

Scope: the 7 products enumerated in `sang-logium-1xs.9.6`. This is the
sourcing pass only — a separate independent verification pass (mirroring
`pilot-headphones-verification.md`) is required before this counts as done,
per the issue's acceptance tests.

---

## 1. Bowers & Wilkins Pi7 S2 Wireless In-Ear Headphones — `moXlkADK7m1DHgGwWwznPb` ($299.00)

| # | Field | Tier | Value | Citation |
|---|---|---|---|---|
| 4 | awards | M | **NULL** — no award found on manufacturer page, launch press coverage, or What Hi-Fi?/EISA award listings checked | — (search exhausted) |
| 10 | productCategory | M | `IEM`, `True Wireless` | manufacturer product page + info sheet |
| 11 | wearingStyle | M | `In-Ear` | manufacturer product page: "In-ear noise canceling True Wireless headphones" |
| 12 | acousticDesign | M | **NULL** — not stated on product page, info sheet, or owner's manual; open/closed-back vocabulary doesn't map cleanly onto a sealed true-wireless IEM and B&W makes no venting claim | — (search exhausted) |
| 13 | fitType | M | `Universal Fit` | manufacturer info sheet: "Small/Medium/Large ear tips" included (inference: interchangeable stock tip sizes = universal fit, not custom-molded CIEM) |
| 14 | connectivity | M | `true-wireless` | manufacturer product page: "True Wireless Headphones" |
| 15 | portable | M | `true` | manufacturer product page/category (true-wireless in-ear form factor) |
| 16 | soundSignature | E | **NULL** — no Crinacle rankings-list or individual-review-post entry found; no ASR measurement found; Rtings has a review page (`rtings.com/headphones/reviews/bowers-wilkins/pi7-s2-true-wireless`) but its measured sound-profile content is JS-rendered and not extractable by direct fetch — **flagged UNVERIFIABLE-BY-DIRECT-FETCH, not a confirmed absence**, needs a tool that can render the page | — (Crinacle/ASR: exhausted; Rtings: access-blocked, see note) |
| 17 | impedanceOhms | H | **NULL** — not published on manufacturer product page, info sheet PDF, or owner's manual (p.8 Specifications table checked directly); not stated in launch press release; no Crinacle/ASR/Rtings lab measurement found | — (search exhausted) |
| 18 | sensitivityDbMw | H | **NULL** — same exhaustion as impedanceOhms | — (search exhausted) |
| 19 | freqResponseHz | H | **NULL** — same exhaustion as impedanceOhms; a non-Tier-3-list squig.link contributor (DHRME) has published an FR graph for this product, but per protocol Tier 1's lab-measurement fallback is scoped to "Tier 3's source list" (Crinacle/ASR/Rtings specifically), so this does not count as a citable source | — (search exhausted within protocol's named sources) |
| 21 | microphone | M | `true` | manufacturer info sheet: "Three microphones per earbud for calls and ANC" |
| 22 | cableTermination | M | **NULL — not applicable** (true-wireless, no listening cable; the box's 3.5mm-to-USB-C cable is for the case's audio-retransmission input, not the earbuds' signal path) | manufacturer info sheet |
| 23 | detachableCable | M | **NULL — not applicable** (no listening cable) | manufacturer info sheet |
| 24 | cableLengthM | H | **NULL — not applicable** (true-wireless; schema explicitly domain-gates this null for true-wireless products) | — |
| 25 | foldable | M | **NULL — not applicable** (true-wireless earbuds; no fold hinge on the earbud body, only a hinged charging case, which isn't what this field measures) | manufacturer info sheet (no folding mechanism described) |
| 26 | ipxRating | M | `IP54` — **vocab gap flagged**: should-be-headphones.md's IPX vocabulary is `None, IPX4, IPX5, IPX7, IP67`; `IP54` (dust+splash, no dedicated IPX water figure) isn't a listed value. Recording the real sourced value; flagging the vocab gap for human resolution rather than force-fitting it to the nearest listed option. | manufacturer product page/info sheet: "Waterproof: Yes - IP54 (earbuds only)" |
| 27 | bluetoothCodecs | M | `aptX Adaptive`, `aptX HD`, `aptX Classic`, `AAC`, `SBC` | manufacturer info sheet: "aptX™ – Adaptive, aptX™ – HD, aptX™ – Classic, AAC, SBC" |
| 28 | anc | M | `anc` | manufacturer product page/info sheet: "Adaptive Active Noise Cancelling" |
| 29 | batteryLifeHours | M | `{ancOff: 5, ancOn: null}` — ancOn **not published by the manufacturer** on the product page, info sheet, or owner's manual (all three list ANC-off only); third-party reviewers report figures that disagree with each other (3.5h vs. 4h), reinforcing that this shouldn't be guessed from secondary sources | manufacturer info sheet: "Up to 5 hours for earbuds (with ANC off)" |
| 30 | driverType | H | `dynamic`, `balanced-armature` | manufacturer info sheet: "9.2 mm Dynamic Drive Unit with Balanced Armature" |
| 31 | driverConfigBucket | H | `Hybrid` | manufacturer info sheet: "2-way drive unit design" + "9.2 mm dynamic drive unit with balanced armature" |
| 31 | driverConfigDetail | D | `1DD+1BA` | derived from driverConfigBucket's source, no separate citation |

### Citations

- **Manufacturer product page** — `https://www.bowerswilkins.com/en-us/product/archive-headphones/pi7-s2/300650.html` (also mirrored at the global URL `https://www.bowerswilkins.com/en/product/wireless-earbuds/pi7-s2/FP43761P.html`, identical spec content). Quotes: `"In-ear noise canceling True Wireless headphones"`, `"9.2mm Dynamic Drive with Balanced Armature"`, `"Waterproof: Yes - IP54 (earbuds only)"`, `"Up to 5 hours for earbuds (with ANC off)"`. Tier `marketing-fact`, sourcedAt `2026-09-13`.
- **Manufacturer info sheet (PDF)** — `https://www.bowerswilkins.com/on/demandware.static/-/Library-Sites-bowers_apac_shared/default/dwba7be652/downloads/Pi7-S2_Information-Sheet.pdf` (fetched and read directly, page images). Quotes: `"Drive Units — 9.2 mm Dynamic Drive Unit with Balanced Armature"`, `"Microphone — Three microphones per earbud for calls and ANC"`, `"Bluetooth Codecs — aptX™ Adaptive / aptX™ HD / aptX™ Classic / AAC / SBC"`, `"Battery Life — Up to 5 hours for earbuds (with ANC off), Additional 16 hours from charging case"`, `"Waterproof — Yes - IP54 (earbuds only)"`, `"In-box Accessories — ...Small / Medium / Large ear tips"`. Tier `hard-spec`/`marketing-fact` as applicable, sourcedAt `2026-09-13`.
- **Manufacturer owner's manual (PDF, 120pp)** — `https://www.bowerswilkins.com/on/demandware.static/-/Library-Sites-bowers_northamerica_shared/default/dwae0761bb/downloads/bw--pi7-s2-owners-manual.pdf`, p.8 "Specifications" table (fetched and read directly as a page image, not a text-scrape) — confirms identical values to the info sheet, no additional fields (no impedance/sensitivity/frequency-response/ANC-on-battery entries present). Tier `hard-spec`/`marketing-fact`, sourcedAt `2026-09-13`.
- **Rtings review page** — `https://www.rtings.com/headphones/reviews/bowers-wilkins/pi7-s2-true-wireless` — page confirmed to exist (search-indexed, published 2023-02-28) but content is JS-rendered; direct fetch returned only navigation chrome, no measured sound-profile data retrievable. Not used as a citation; recorded as an access gap, not a checked-and-absent source.
- **Crinacle** — `https://crinacle.com/rankings/iems/` (rankings list) checked directly: no Pi7 S2 entry. A search for individual Crinacle review posts (crinacle.com/YYYY/MM/DD/...) for this product returned none. Both required checks per the widened protocol were performed.
- **Audio Science Review** — no Pi7 S2 measurement thread located via search.

### Design/protocol gaps found (flag for human, not improvised)

1. **IPX vocabulary gap**: `IP54` is a real, sourced value that doesn't fit the should-be-headphones.md IPX enum (`None, IPX4, IPX5, IPX7, IP67`). This will very likely recur across other true-wireless earbuds in the catalogue (IP54/IP55 dust+splash ratings are common on earbuds) — worth resolving once rather than per-product.
2. **acousticDesign / cableTermination / detachableCable / foldable domain-gating for true-wireless IEMs**: the schema explicitly domain-gates `cableLengthM` null for true-wireless, but doesn't say the same for `acousticDesign`, `cableTermination`, `detachableCable`, or `foldable` — all four hit the same "doesn't really apply to this form factor" wall here. Recorded as null per the sourcing pass's own judgment (not invented), but a should-be-list/schema-level domain-gating decision would remove the ambiguity for the rest of the true-wireless fan-out.
3. **Rtings JS-rendering access gap**: this tool's WebFetch cannot read Rtings' measured review content (client-rendered), even though the review exists. This will recur for every product Rtings has reviewed across the whole catalogue, not just this one — worth a standing note (or a fetch workaround) rather than re-discovering it per product.

---

## 2. Bowers & Wilkins PI7 True Wireless Noise Cancelling In-Ear Headphones — `k27n1AQuIbSr5iozG2j7uo` ($399.00)

**Note:** the current live B&W product page (`bowerswilkins.com/en-us/product/pi7/150254.html`) has been stripped to commercial data only (price/SKU/stock) — this is a discontinued predecessor to the Pi7 S2, and its spec content now lives only in the archived owner's manual PDF, not on a current web page. Per protocol this is still a manufacturer-tier source; it's simply a PDF-only product now rather than page+PDF.

| # | Field | Tier | Value | Citation |
|---|---|---|---|---|
| 4 | awards | M | **NULL** — no award found in press coverage or What Hi-Fi?/EISA listings checked | — (search exhausted) |
| 10 | productCategory | M | `IEM`, `True Wireless` | manufacturer manual |
| 11 | wearingStyle | M | `In-Ear` | manufacturer manual: "True Wireless technology" + in-ear form factor throughout |
| 12 | acousticDesign | M | **NULL** — not stated; same true-wireless-IEM domain-fit issue as product 1 | — (search exhausted) |
| 13 | fitType | M | `Universal Fit` | headphones.com (audited retailer, tier-4 fallback): stock silicone tip sizes listed, no custom-mold option |
| 14 | connectivity | M | `true-wireless` | manufacturer manual: "True Wireless technology" |
| 15 | portable | M | `true` | manufacturer manual (true-wireless in-ear form factor) |
| 16 | soundSignature | E | **NULL** — no Crinacle rankings-list entry; the only crinacle.com mention found is a reader forum comment, not Crinacle's own graded assessment, so it doesn't count per protocol ("a forum/enthusiast claim with no manufacturer or lab attribution" is explicitly excluded); no ASR entry found; Rtings has a review page (`rtings.com/headphones/reviews/bowers-wilkins/pi7-true-wireless`) but is the same JS-rendering access gap as product 1 — **flagged UNVERIFIABLE-BY-DIRECT-FETCH** | — (Crinacle/ASR: exhausted; Rtings: access-blocked, see note) |
| 17 | impedanceOhms | H | **NULL** — not in manufacturer manual's Specifications page (p.7, opened directly as image); no Crinacle/ASR/Rtings measurement found | — (search exhausted) |
| 18 | sensitivityDbMw | H | **NULL** — same exhaustion as impedanceOhms | — (search exhausted) |
| 19 | freqResponseHz | H | `{min: 10, max: 20000}` | manufacturer manual, p.7 Specifications: "Frequency Range — 10Hz to 20kHz" |
| 21 | microphone | M | `true` | headphones.com (retailer, tier-4): "two cVc mics" per earbud for calls/ANC — **not independently confirmed by the manufacturer manual**, which mentions ANC but not an explicit mic count; recorded from the audited-retailer fallback tier as the manual doesn't state it |
| 22 | cableTermination | M | **NULL — not applicable** (true-wireless) | manufacturer manual |
| 23 | detachableCable | M | **NULL — not applicable** (true-wireless) | manufacturer manual |
| 24 | cableLengthM | H | **NULL — not applicable** (true-wireless; schema domain-gate) | — |
| 25 | foldable | M | **NULL — not applicable** (true-wireless, no fold hinge on earbud body) | manufacturer manual (no folding mechanism described) |
| 26 | ipxRating | M | `IP54` — same vocab gap as product 1 | headphones.com (retailer, tier-4 fallback): "IP54-rated water resistance" — **not stated in the manufacturer manual itself**, which has no waterproof/IP line on its Specifications page; recorded from the audited-retailer fallback since the manufacturer source is silent |
| 27 | bluetoothCodecs | M | `aptX Adaptive`, `aptX HD`, `aptX Low Latency`, `aptX Classic`, `AAC`, `SBC` | manufacturer manual, p.7: "aptX – Adaptive / aptX – HD / aptX – Low Latency / aptX – Classic / AAC / SBC" |
| 28 | anc | M | `anc` | manufacturer manual, p.7 Technical Features: "Auto ANC" |
| 29 | batteryLifeHours | M | `{ancOff: null, ancOn: null}` — manual states only a single undifferentiated figure, **not split by ANC state**, so it cannot be attributed to either bucket without guessing; the schema's `{ancOff, ancOn}` shape doesn't have a slot for an ANC-state-unspecified figure | manufacturer manual, p.7: "Battery Life — Up to 4 hours Bluetooth" (undifferentiated; flagged, not force-fit into ancOff or ancOn) |
| 30 | driverType | H | `dynamic`, `balanced-armature` | manufacturer manual, p.7: "Drive Units — 9.2mm Dynamic Drive with Balanced Armature" |
| 31 | driverConfigBucket | H | `Hybrid` | manufacturer manual (dynamic + BA, dual-driver-per-earbud design confirmed by headphones.com retailer description too) |
| 31 | driverConfigDetail | D | `1DD+1BA` | derived, no separate citation |

### Citations

- **Manufacturer owner's manual (PDF, 97pp, archived)** — `https://www.bowerswilkins.com/on/demandware.static/-/Library-Sites-bowers_northamerica_shared/default/dwd4c9c56f/archive-manuals/pi7_manual.pdf` (fetched and read directly, p.7 "Specifications" table as a page image, not text-scraped). Quotes: `"Technical Features — True Wireless technology / Bluetooth 5.0 with AptX Adaptive technology / Auto ANC / Audio streaming from chargingcase / Wireless and USB-C charging / Fast charging support"`; `"Bluetooth Codecs — AptX – Adaptive / AptX – HD / AptX – Low Latency / AptX – Classic / AAC / SBC"`; `"Drive Units — 9.2mm Dynamic Drive with Balanced Armature"`; `"Frequency Range — 10Hz to 20kHz"`; `"Battery Life — Up to 4 hours Bluetooth"`; `"Weight — 7g for earbuds, 61g for chargingcase"`. Tier `hard-spec`/`marketing-fact` as applicable, sourcedAt `2026-09-13`.
- **headphones.com (audited retailer, tier-4 fallback used only where the manufacturer manual is silent)** — `https://headphones.com/products/bowers-wilkins-pi7-true-wireless-noise-cancelling-in-ear-headphones`. Quotes: `"IP54-rated water resistance"`, `"two cVc mics"`. Tier `marketing-fact`, sourcedAt `2026-09-13`.
- **Crinacle** — rankings list (`crinacle.com/rankings/iems/`) checked directly: no entry. The only individual-page mention found (`crinacle.com/2021/11/23/the-almost-thousand-update/`) is a reader's forum comment, not a Crinacle-authored graded assessment — excluded per protocol's "forum/enthusiast claim" exclusion, not cited.
- **Audio Science Review** — no PI7 measurement thread located via search.
- **Rtings review page** — `https://www.rtings.com/headphones/reviews/bowers-wilkins/pi7-true-wireless` — confirmed to exist, same JS-rendering access gap as product 1; not used as a citation.

### Design/protocol gaps found (new this product)

4. **Undifferentiated battery-life figure**: the manufacturer manual gives a single "up to 4 hours Bluetooth" figure with no ANC-on/ANC-off split, unlike the Pi7 S2's ANC-off-only figure. The schema's `batteryLifeHours: {ancOff, ancOn}` shape has no slot for "stated but ANC-state-unspecified" — recorded both as null rather than guessing which bucket it belongs to. Likely to recur on older/simpler product manuals across the fan-out.

---

## 3–7. Remaining products — not yet sourced

PI5, Pi6 (×3 color variants — same base spec expected, sourced once and
applied to all three unless a variant-specific difference is found), Pi8. To
be sourced next, one at a time, same format as above.
