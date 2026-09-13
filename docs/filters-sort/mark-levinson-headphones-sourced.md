# Sourced Data — Mark Levinson (`sang-logium-1xs.9.17`)

Sourced against `schema-headphones.md` + `sourcing-protocol-headphones.md`, same
format as `meze-audio-sourced.md`. Covers the **1 Mark Levinson product** listed
in `sang-logium-1xs.9.17`:

- `k27n1AQuIbSr5iozG2iyZJ` — Mark Levinson № 5909 Active Noise Cancellation Headphones ($999.00)

## Manufacturer-source note

`marklevinson.com` has **retired the live № 5909 product page** —
`https://www.marklevinson.com/products/headphones/NO5909-.html` returns 404.
Per the sourcing protocol's widened Tier-1/Tier-2 order, the manufacturer's own
documentation was used directly and read end-to-end, rather than giving up at the
dead page:

1. **Official Owner's Manual** (`ML_No5909_Owners_Manual_Rev1_220202.pdf`) — read via
   `pdftotext`; covers what's-in-the-box, passive/aux wiring, ANC button behaviour,
   power/playback controls, ear-pad replacement.
2. **Official Spec Sheet** (`SC04510_NA_Mark_Levinson_No5909_Spec_Sheet_v2_HR.pdf`) —
   read via `pdftotext`; the full numeric specification table (driver, frequency
   response, sensitivity, impedance, Bluetooth, battery, dimensions, weight).
3. **Manufacturer product page as archived** by the Internet Archive
   (`web.archive.org/web/20230331215112/…/NO5909-.html`) — the manufacturer's own
   marketing/spec table (Hi-Res certification, codecs, ANC modes, what's-included).
4. **Audited retailer** `headphones.com` — used for exactly one field
   (`acousticDesign`), where the manufacturer sources do not state a cup-style word.

Both PDFs are served live (HTTP 200, `application/pdf`) from the headphones.com
Shopify CDN file store at the URLs cited below; they were downloaded and their text
extracted this pass.

Tier legend: **H** hard spec, **M** marketing/feature fact, **E** editorial,
**D** derived, **I** internal (not sourced here). Field names match
`filterAttributes.*` in `schema-headphones.md`. Domain-gated fields that don't
apply are omitted from the table entirely, matching `pilot-headphones-sourced.md`.

**The POC `filterAttributes` value on this document was untrusted invented
enrichment data and was not used as ground truth.** Its prior values
(`productCategory: null`, `wearingStyle: "over-ear"`, `connectivity: "wireless"`,
`driverType: "dynamic"`, `microphone: false`) were never treated as hints — every
value below was re-sourced from scratch against the sources listed above and
diffed in the dry run, which is why `connectivity` moves `wireless → hybrid` and
`microphone` moves `false → true`.

## 1. Mark Levinson № 5909 — `k27n1AQuIbSr5iozG2iyZJ` ($999.00)

| Field | Tier | Value | Citation |
|---|---|---|---|
| productCategory | M | `["over-ear"]` | manufacturer PDP (`HIGH-RESOLUTION WIRELESS HEADPHONES`) + headphones.com `Wearing style: Over-ear` |
| wearingStyle | M | `["over-ear"]` | manufacturer PDP `Premium leather headband and replaceable leather ear cushions` + headphones.com `Wearing style: Over-ear`; the manual's fit section uses no on-ear/in-ear wording |
| acousticDesign | M | `["closed-back"]` | headphones.com `Cup style: Closed-Back` — the manufacturer PDP/manual/spec sheet never use a `closed-back` token, so this one field falls to the audited retailer per the widened M-tier order |
| connectivity | M | `"hybrid"` | manufacturer PDP lists **both** `Bluetooth 5.1 with LDAC, AAC and aptX™ Adaptive technologies` **and** an included `1.25 m USB-C to 3.5 mm audio cable`; the manual's `PASSIVE` section confirms wired analog operation (`Plug the 3.5mm stereo mini jack … to your source component's headphone input`) |
| portable | M | `true` | manufacturer PDP `Designed For Travel — A hard-shell carrying case discretely stores a complete assortment of cables and accessories`; manual ships a `Travel Storage Case` |
| microphone | M | `true` | manufacturer PDP `Four-microphone voice array with Smart Wind Adaption`; manual overview lists `8 Microphones (4 talk microphones and 4 ANC microphones)` |
| cableTermination | M | `["3.5mm", "usb-c"]` | manufacturer PDP `Cables (audio): 4 m USB-C to 3.5 mm audio cable / 1.25 m USB-C to 3.5 mm audio cable`; `Adapters: 3.5 mm to 6.3 mm audio adaptor` |
| detachableCable | M | `true` | manual `Plug the USB-C connection end into the USB-C input on the Right ear cup` + `Choose the appropriate length (1.25m or 4m) proprietary audio cable` — a plug-in socket at the cup accepting two interchangeable cables |
| cableLengthM | H | `4` — two cables supplied (4 m and 1.25 m); same single-value-schema-vs-two-cables gap already recorded for Focal Clear Mg / Meze, not re-litigated | manufacturer PDP (`Cables (audio)`) + spec sheet |
| foldable | M | `false` | boolean feature-absence rule: no folding / hinge / collapse / flat-fold claim anywhere across the manufacturer PDP, the Owner's Manual, or the Spec Sheet. The manual's only adjustability language is `Adjust to find optimal fit` and `Rotates for comfort around neck` — swivel for wearing around the neck, not a travel fold |
| ipxRating | M | `"none"` | no IPX / water-resistance / sweat rating appears in the Spec Sheet's complete specification list nor in the PDP feature list; `"none"` is the schema's own enum value for "no rating", not an inferred rating |
| bluetoothCodecs | M | `["SBC", "AAC", "aptX Adaptive", "LDAC"]` | manual `connectivity via Bluetooth 5.1 with LDAC, AAC, and aptX™ Adaptive`; PDP `Bluetooth 5.1 with LDAC, AAC and aptX™ Adaptive technologies`. `SBC` is the mandatory baseline codec of A2DP (`Bluetooth profile version: A2DP 1.3.1` in the spec sheet); the schema's closed list has no bare `aptX` entry and the manufacturer states only Adaptive |
| anc | M | `"anc"` | manufacturer PDP `Adaptive Active Noise Cancellation (ANC) with three modes`; manual ANC button `x1: ANC ON (HIGH, ADAPTIVE, LOW modes)` |
| batteryLifeHours | M | `{ancOff: 34, ancOn: 30}` | spec sheet `Music playtime with BT on: 34 hrs` / `Music playtime with BT & ANC on: 30 hrs` |
| driverType | H | `["dynamic"]` | manufacturer PDP `Expertly tuned 40 mm Beryllium coated drivers`; spec sheet `Driver size: 40mm Beryllium Coated Driver` — a beryllium-coated dynamic driver is still a `dynamic` driver, not a new driver-type vocabulary entry |
| impedanceOhms | H | `32` | spec sheet `Impedance: 32 ohm` |
| sensitivityDbMw | H | `97` | spec sheet `Sensitivity: 97dB SPL @1kHz/1mW` |
| freqResponseHz | H | `{min: 10, max: 40000}` | spec sheet `Frequency response (Passive): 10Hz – 40kHz` |

Citations:
- Manufacturer Owner's Manual (downloaded, opened, text-extracted):
  `https://cdn.shopify.com/s/files/1/1791/0383/files/ML_No5909_Owners_Manual_Rev1_220202.pdf?v=1652392823`,
  quotes: `"WHAT'S IN THE BOX | Mark Levinson N0 5909 Premium Wireless ANC Headphones | Travel Storage Case | 1.25m USB-C to USB-C Charging Cable | 1.25m USB-C to 3.5mm Proprietary Audio Cable | 4m USB-C to 3.5mm Proprietary Audio Cable | 3.5mm to 6.3mm Adaptor | USB-C to USB-A Adaptor | Airplane Adaptor | Microfiber Polishing Cloth"`, `"8 Microphones (4 talk microphones and 4 ANC microphones)"`, `"Adjust to find optimal fit"`, `"Rotates for comfort around neck"`, `"x1: ANC ON (Delfault selectable via app; HIGH, ADAPTIVE, LOW modes)"`, `"Plug the USB-C connection end into the USB-C input on the Right ear cup"`, `"connectivity via Bluetooth 5.1 with LDAC, AAC, and aptX™ Adaptive"`. Tier `hard-spec` / `marketing-fact`, sourcedAt `2026-09-13`.
- Manufacturer Spec Sheet (downloaded, opened, text-extracted):
  `https://cdn.shopify.com/s/files/1/1791/0383/files/SC04510_NA_Mark_Levinson_No5909_Spec_Sheet_v2_HR.pdf?v=1652392823`,
  quotes: `"Driver size: 40mm Beryllium Coated Driver"`, `"Frequency response (Passive): 10Hz – 40kHz"`, `"Frequency response (Active): 20Hz – 20kHz"`, `"Sensitivity: 97dB SPL @1kHz/1mW"`, `"Impedance: 32 ohm"`, `"Bluetooth version: v5.1"`, `"Bluetooth profile version: A2DP 1.3.1, AVRCP 1.6, HFP 1.7.1"`, `"Charging time: 100 minutes"`, `"Music playtime with BT on: 34 hrs"`, `"Music playtime with BT & ANC on: 30 hrs"`, `"Dimensions (H x W x D): 202.6mm (7.9\") x 205.4mm (8.1\") x 65.4mm (2.6\")"`, `"Weight: 340g (12 oz)"`. Tier `hard-spec` / `marketing-fact`, sourcedAt `2026-09-13`.
- Manufacturer PDP, Internet Archive capture 2023-03-31 (fetched and read directly):
  `https://web.archive.org/web/20230331215112/https://www.marklevinson.com/products/headphones/NO5909-.html?dwvar_NO5909-_color=Black-AM-Current`,
  quotes: `"№ 5909 | HIGH-RESOLUTION WIRELESS HEADPHONES WITH ACTIVE NOISE CANCELLATION"`, `"Adaptive Active Noise Cancellation (ANC) with three modes"`, `"Four-microphone voice array with Smart Wind Adaption"`, `"Expertly tuned 40 mm Beryllium coated drivers acoustically optimized to the HARMAN Curve"`, `"Bluetooth 5.1 with LDAC, AAC and aptX™ Adaptive technologies"`, `"Cables (audio): 4 m USB-C to 3.5 mm audio cable / 1.25 m USB-C to 3.5 mm audio cable"`, `"Adapters: USB-C to USB-A adaptor / 3.5 mm to 6.3 mm audio adaptor / Airplane audio adaptor"`, `"Designed For Travel — A hard-shell carrying case discretely stores a complete assortment of cables and accessories"`, `"Premium leather headband and replaceable leather ear cushions"`, `"Battery: Up to 34 hours battery life; 30 hours playtime with ANC enabled"`. Tier `marketing-fact`, sourcedAt `2026-09-13`.
- Audited retailer headphones.com (fetched and read directly, HTTP 200):
  `https://headphones.com/products/mark-levinson-5909-active-noise-cancellation-headphones`,
  quotes: `"Cup style: Closed-Back"`, `"Wearing style: Over-ear"`, `"Connectivity: Wireless"`, `"$999.00"`. Tier `marketing-fact`, sourcedAt `2026-09-13`.

## Same-tier source conflict notes (protocol's self-contradiction rule)

Both conflicts below were resolved by the protocol's recency/scoping rule rather
than silently picking one — recorded here as required by the issue's 3rd acceptance
test.

1. **`freqResponseHz` — passive vs. active split (two figures, one spec sheet).**
   The manufacturer Spec Sheet publishes *two* frequency responses:
   `"Frequency response (Passive): 10Hz – 40kHz"` and
   `"Frequency response (Active): 20Hz – 20kHz"`. The schema has a single
   `{min, max}` pair, so this is a schema-granularity limitation, not a source
   disagreement. Resolved by recording the **passive** figure (`10 Hz – 40 kHz`),
   because (a) it is the wider range, (b) it is the figure the manufacturer also
   headlines as its Hi-Res claim (`Acoustic response up to 40kHz`) on the PDP, and
   (c) the schema's own `sensitivityDbMw` description already establishes that
   passive/wired figures are the field's default basis. The active figure is
   retained in the citation quotes above so a later pass can see both.
2. **`connectivity` — manufacturer+wired sources vs. retailer `Wireless`.**
   headphones.com's structured spec block says `Connectivity: Wireless`, matching
   the POC's prior stored value. The manufacturer sources, however, ship two wired
   analog cables and the manual devotes a `PASSIVE` section to wired operation, so
   the product genuinely spans both vocabularies. Resolved in favour of the schema's
   own `hybrid` value (`wired + wireless` per `should-be-headphones.md` item 14),
   which is the more accurate of the two, rather than deferring to the retailer's
   narrow tag. The retailer's narrower value is recorded here, not discarded.

## Sound Signature (`soundSignature`) — tier E

Per the Tier-3 source order, checked in order, all **not manufacturer copy**:

1. **Crinacle — rankings list** (`https://crinacle.com/rankings/headphones/`, fetched
   HTTP 200, ~1.03 MB): no `Mark Levinson` / `5909` entry anywhere on the page; also
   checked the IEM rankings. Confirmed independently via Crinacle's own WordPress
   search API (`/wp-json/wp/v2/search?search=Mark Levinson` and `?search=5909`, both
   HTTP 200 returning `[]`, and `/wp-json/wp/v2/posts?search=levinson` also `[]`) —
   so this is not a page-scrape miss, the site genuinely has no Mark Levinson content.
2. **ASR — Audio Science Review**: found one thread,
   `Mark Levinson 5909, new ANC wireless cans that advertise use of the Harman curve`,
   several pages long. Read the thread text: it contains **no measurements at all** —
   it opens waiting for a review, the site owner replies asking someone to buy one
   for testing, and the only substantive content is members noting the
   manufacturer's Harman Curve claim. No measurement review, no squig/graph/
   frequency-response data. Per the protocol, an enthusiast thread without a lab
   measurement is explicitly *not* a Tier-3 source.
3. **Rtings**: no review page exists for this product — the
   `/headphones/reviews/mark-levinson/no-5909-wireless` URL returns HTTP 404 and the
   RTINGS brand index and site search (both fetched) contain zero occurrences of
   `Levinson`.

**Result: `soundSignature` is left unset (null).** Every applicable Tier-3 source in
the protocol's order was checked — Crinacle's rankings *and* its own search API,
ASR (including opening the product's thread rather than trusting a search-result
snippet), and Rtings — and none publishes a measurement of the № 5909. Per the
protocol, when a product isn't measured by any of the three, Sound Signature is
`null`, never inferred from marketing copy. The manufacturer's own
`acoustically optimized to the HARMAN Curve` claim is exactly the marketing copy the
protocol excludes for this field, so it was *not* used to write a
"Harman-target-like" value despite being tempting — doing so would be the guessing
the protocol forbids. This is a genuine missing-source case, not an early stop: the
widened order was exhausted first.

## Absence-based fields worth flagging

- `foldable: false` and `ipxRating: "none"` are both **absence conclusions** after
  checking the PDP, the Owner's Manual and the Spec Sheet end-to-end. The manual's
  `Rotates for comfort around neck` swivel was considered and rejected as a folding
  claim — it describes wearing the headphones around the neck, not collapsing them
  for storage. `ipxRating: "none"` uses the schema's own enum value for "no rating
  published" and does not assert any water resistance.
- The Owner's Manual was **actually opened and read** (via `pdftotext`, 16 KB of
  extracted text), per the protocol's explicit rule that a text-scrape giving up must
  not stand in for reading the document. The Spec Sheet (11 KB extracted) likewise.

## Derived / not-sourced fields

- `requiresAmplifier` (**D**) — **not set**, same design gap already reported for the
  pilot (`sang-logium-1xs.6`) and every batch since: no derivation threshold is
  defined yet, and a D-tier field carries no citation of its own. For this product the
  gap is moot in practice anyway — the № 5909 is a self-amplifying wireless headphone
  (`Lithium-ion battery (750mAh/3.7V)`), so the field does not describe it.
- I-tier fields (`price`, `rating`, `condition`, `inStock`, `deals`, `isNewArrival`,
  `availability`, `category`, `brand`) — store-operational, never sourced here.
- IEM-only fields (`fitType`, `driverConfigBucket`, `driverConfigDetail`) — this is an
  over-ear dynamic headphone, so these are domain-gated and omitted from the patch
  rather than written as explicit nulls.
- `awards` — left unset (null). The manufacturer PDP hosts reviewer superlatives
  (`"The best wireless headphones you can buy." — AV Forum`; `"Let me cut to the
  chase: These are the best-sounding noise-canceling headphones I've ever
  reviewed." — TechHive`; a ★★★★★ What Hi-Fi? quote), but these are review-outlet
  blurbs hosted as marketing, not a dated named award conferred on the SKU. Same
  convention applied to Meze 109 PRO in `meze-audio-sourced.md`.

## Verification

- `node runPatch.mjs products/mark-levinson-no-5909.mjs` dry run resolved cleanly:
  product name matched exactly (`k27n1AQuIbSr5iozG2iyZJ`), no name-mismatch abort.
- 18 field diffs + 18 citation entries reported; no unknown field names, no enum
  rejections.
- Re-run after the final URL/citation fix above; no output errors.

## Summary

| # | Field | Value | Tier |
|---|---|---|---|
| 1 | productCategory | `["over-ear"]` | M |
| 2 | wearingStyle | `["over-ear"]` | M |
| 3 | acousticDesign | `["closed-back"]` | M |
| 4 | connectivity | `"hybrid"` | M |
| 5 | portable | `true` | M |
| 6 | microphone | `true` | M |
| 7 | cableTermination | `["3.5mm","usb-c"]` | M |
| 8 | detachableCable | `true` | M |
| 9 | cableLengthM | `4` | H |
| 10 | foldable | `false` | M |
| 11 | ipxRating | `"none"` | M |
| 12 | bluetoothCodecs | `["SBC","AAC","aptX Adaptive","LDAC"]` | M |
| 13 | anc | `"anc"` | M |
| 14 | batteryLifeHours | `{ancOff:34, ancOn:30}` | M |
| 15 | driverType | `["dynamic"]` | H |
| 16 | impedanceOhms | `32` | H |
| 17 | sensitivityDbMw | `97` | H |
| 18 | freqResponseHz | `{min:10, max:40000}` | H |
| — | soundSignature | **null** — no Tier-3 measurement exists | E |
| — | awards | **null** — no dated named award | M |

**18 sourced fields** for 1 product; 2 absence/unsourced fields explicitly justified
above. Zero fields guessed.
