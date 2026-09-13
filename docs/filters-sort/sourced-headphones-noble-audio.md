# Sourced Data — Noble Audio (`sang-logium-1xs.9.19`)

Sourced against `schema-headphones.md` + `sourcing-protocol-headphones.md`
(amended 2026-09-13: manufacturer-conflict resolution is recency-based; boolean
"would-advertise-if-present" feature fields read `false` on manufacturer silence rather
than `null`; the separate independent-verification pass is dropped in favour of sourcing
and CMS patching in one pass per product, via
`sanity-cms/utils/migrations/headphonesFilterAttributes/`).

Tier legend: **H** hard spec, **M** marketing/feature fact, **E** editorial.

**Product in scope (1):** `moXlkADK7m1DHgGwWwzwUF` — Noble Audio FoKus Apollo Wireless
Headphones ($649.00). Live-Sanity read 2026-09-13 confirms this `_id` exists with
`name: "Noble Audio FoKus Apollo Wireless Headphones"`, `filterAttributes.category:
["headphones"]`, `filterAttributes.brand: ["noble-audio"]`.

## Live pre-state (Sanity `production`, read 2026-09-13, before any patch)

```
backDesign: "closed"        <-- superseded legacy name
brand: ["noble-audio"]
category: ["headphones"]
connectivity: "wireless"
connector: ["3.5mm","6.35mm"]   <-- superseded legacy name
driverType: "planar-magnetic"   <-- stale/wrong: it is a hybrid, see below
inStock: true
microphone: false               <-- stale/wrong: it has 6 mics + a boom mic
noiseCancelling: false          <-- superseded legacy name; wrong value
price: 64900
requiresAmplifier: false
wearingStyle: "over-ear"
```

Three pre-existing values are contradicted by the manufacturer: `driverType`
(`planar-magnetic` vs the sourced `["dynamic","planar-magnetic"]`), `microphone`
(`false` vs the sourced `true`), and the legacy `backDesign`/`noiseCancelling`/`connector`
names. The canonical fields are written by this pass; the superseded sibling fields
(`backDesign`, `noiseCancelling`, `connector`) are **left untouched** — deleting a legacy
field is a write-scope decision for the human, not something this sourcing pass does
silently (same convention as the Sennheiser pass).

## 1. FoKus Apollo ($649.00, `moXlkADK7m1DHgGwWwzwUF`)

Patch spec: `sanity-cms/utils/migrations/headphonesFilterAttributes/products/noble-fokus-apollo.mjs`

| Field | Tier | Value | Exact quote | Source |
|---|---|---|---|---|
| productCategory | M | `over-ear` | "The FoKus Apollo is Noble's first forey into the world of over-ear headphones." / ecoustics: "Noble's first swing at the over-ear category" | manufacturer page + [ecoustics](https://www.ecoustics.com/reviews/noble-fokus-apollo/) |
| wearingStyle | M | `over-ear` | "Noble's first forey into the world of over-ear headphones" | manufacturer page |
| acousticDesign | M | `closed-back` | circumaural closed cups; no open/vented design described anywhere. **Conflict resolved by recency per the amended rule:** the live Sanity `backDesign: "closed"` legacy value agrees, and neither the manufacturer page, the manual, nor any audited retailer describes an open-back or vented design (contrast: an open-back would be marketed as such, as Noble does for its wired Osprey/Sceptre lines) | manufacturer page + user manual |
| fitType | M | *omitted (n/a)* | not an IEM — schema says null/unset when the product is not an IEM, so this field is simply not written | `schema-headphones.md` item 13 |
| connectivity | M | `hybrid` | "Can be played with an included 3.5mm auxiliary cable" (analog wired) **and** Bluetooth 5.3 (wireless) — the schema's `hybrid` value is "wired + wireless", not "wireless-only" | manufacturer page + headphones.com |
| portable | M | `true` | "Accessories include an EVA carrying case"; 80 h battery; Bluetooth-first self-powered design; ecoustics: "these headphones don't fold flat ... the carrying case takes up nearly the entire footprint" — marketed for travel/office/gaming | manufacturer page + [headphones.com](https://headphones.com/products/noble-audio-fokus-apollo-wireless-headphones) |
| awards | M | `["Ecoustics Editor's Award — Best of 2025"]` | "Winner of Ecoustic's editor award for best of 2025." | [manufacturer page](https://nobleaudio.com/products/fokus-apollo) → [ecoustics.com/reviews/noble-fokus-apollo](https://www.ecoustics.com/reviews/noble-fokus-apollo/) |
| driverType | H | `dynamic`, `planar-magnetic` | "The world's first 1x40mm dynamic driver + 14.5mm planar magnetic hybrid driver speaker arrangement" | manufacturer page (+ headphones.com "Hybrid Dual Driver: 40mm dynamic driver + 14.5mm planar magnetic driver") |
| impedanceOhms | H | **`null`** | no value published — exhaustion trail below | see "Tier-1 exhaustion" |
| sensitivityDbMw | H | **`null`** | no value published — exhaustion trail below | see "Tier-1 exhaustion" |
| freqResponseHz | H | **`null`** | no value published — exhaustion trail below | see "Tier-1 exhaustion" |
| cableTermination | M | `3.5mm`, `6.35mm`, `usb-c`, `4.4mm-balanced` | "Accessories include an EVA carrying case, 3.5mm auxiliary cable, USB-C cable, two prong airline adapter, 1/4\" adapter for headphone amps, a 3.5mm to 4.4mm adapter, and a detachable boom mic"; ecoustics: "a 6.35mm adapter, a 3.5mm to 4.4mm balanced adapter" | manufacturer page + ecoustics |
| detachableCable | M | `true` | "Can be played with an included 3.5mm auxiliary cable" as a listed accessory, not a captive lead — every cable ships as a separate, swappable item alongside the boom mic, which is itself described as "Removable" | manufacturer page |
| cableLengthM | H | **`null`** | no length published for any of the three included cables | see "Tier-1 exhaustion" |
| microphone | M | `true` | "Integrated ADI chip combined with 3 microphones per side providing hybrid ANC"; "Removable boom mic"; "Excellent call quality with or without the supplied boom mic attached"; headphones.com: "Number of Microphones: 6 ... Detachable Boom Mic: Included, with mute switch" | manufacturer page + headphones.com |
| foldable | M | `false` | ecoustics (independent, and Noble ships no hinge/implication otherwise): "these headphones don't fold flat, and Noble skipped hinges at the gimbals, so you're getting full-size cans in full-size form." No fold/hinge/collapse language on the manufacturer page or in the manual. Boolean feature-absence rule — a manufacturer shipping a hinge advertises it | ecoustics + manufacturer page |
| ipxRating | M | *omitted* | no IPX rating claimed anywhere across the manufacturer page, manual, or audited retailers. This is **not** the boolean feature-absence case — `ipxRating` is an enum a manufacturer may legitimately omit; left unwritten rather than asserted as `none` | manufacturer page + user manual + headphones.com |
| bluetoothCodecs | M | `LDAC`, `AAC`, `aptX`, `aptX HD`, `SBC` | "supported codecs include LDAC, AAC, aptX, aptX HD, SBC; QCC3084 chip" (manufacturer); headphones.com's spec block lists "LDAC, AAC, aptX, aptX HD". **Conflict (same-tier, manufacturer vs audited retailer): resolved by recency/completeness — the manufacturer's own live page names SBC explicitly, so SBC is included; the retailer simply omits it from its shorter list.** **VOCAB GAP: `aptX HD` is a real sourced codec but is MISSING from `productType.ts`'s `bluetoothCodecs` enum (which lists `aptX`, `aptX Adaptive`, `aptX LL` — but not `aptX HD`), even though `should-be-headphones.md` item 27 and the Bowers & Wilkins sourced doc both include it. Recorded as sourced and flagged, per the B&W precedent, rather than force-fit to `aptX` or dropped** | manufacturer page (primary) + headphones.com |
| anc | M | `anc` | "Integrated ADI chip combined with 3 microphones per side providing hybrid ANC with a reduction depth of up to -35db"; "Superior transparency mode"; headphones.com spec block: "Active Noise Cancellation: -20dB to -35dB reduction" | manufacturer page + headphones.com |
| batteryLifeHours | M | `{ancOff: 80, ancOn: 60}` | "80 hours of play time without ANC / 60 hours of play time with ANC"; headphones.com: "Battery Life (No ANC): Up to 80 hours (50% volume)" / "Battery Life (With ANC): Up to 60 hours (50% volume)" | manufacturer page + headphones.com |
| soundSignature | E | **`null`** | no Crinacle / ASR / Rtings measured entry — exhaustion trail below | see "soundSignature exhaustion" |
| requiresAmplifier | D | `false` | derived from `impedanceOhms` + `sensitivityDbMw` — both null, and a Bluetooth ANC headphone with an internal amp never requires one; no citation of its own per `schema-headphones.md` | derived |

Not written: `price`, `brand`, `inStock`, `category` (I-tier, already correct in live
Sanity and outside the sourcing protocol's remit), `rating`/`ratingCount`/`condition`/
`deals`/`isNewArrival`/`availability` (I-tier, store-operational, no source),
`driverConfigBucket` (enum has no "hybrid" value — see "Gaps reported back" below),
`driverConfigDetail` (D-tier, depends on the bucket that can't be written),
`fitType`/`ipxRating` (genuinely n/a or unclaimed, see rows above).



## Tier-1 exhaustion — `impedanceOhms`, `sensitivityDbMw`, `freqResponseHz`, `cableLengthM`

Checked in the widened order before nulling any of these:

1. **Manufacturer product page** (`nobleaudio.com/products/fokus-apollo`) — full page text
   retrieved. States drivers, codecs, Bluetooth version, ANC, battery, mics, materials,
   accessories. **States no frequency response, no impedance, no sensitivity, no weight,
   no cable length.**
2. **Manufacturer user manual (EN PDF)** —
   `cdn.shopify.com/.../Noble_FoKus_Apollo_Manual_20240515_2.pdf`, downloaded and its text
   extracted with `pdftotext` (1 page; text layer present). It is an operation/quick-start
   sheet only (pairing, MFB controls, ANC cycle, charging, 3.5 mm vs USB-C behaviour,
   hearing-safety, troubleshooting). **It contains no specification table at all.**
   Chinese (V3.1, 2024-09-03), Japanese (V3.1) and Korean (V3.1) revisions were also
   downloaded/extracted — same document, same absence. This is the "actually open the PDF,
   don't give up on a failed text scrape" tier, done rather than assumed.
3. **Manufacturer press release** — the launch post exists
   (`headphones.com` blog, "Noble announces the launch of its FoKus Apollo ANC headphones",
   Griffin Silver, 2024-09-04) but its direct URL 404s; its claim set is identical to the
   manufacturer product page and quotes no FR/impedance/sensitivity figure.
4. **Audited retailers** (`should-be-headphones.md` list) — headphones.com's spec block
   (quoted in full in the retailer evidence file) has no FR/impedance/sensitivity/weight.
   Bloom Audio carries the product but lists no spec block. Moon Audio does **not** stock it
   ("Search: 0 results found for 'fokus apollo'"). Audio46 stocks the Noble brand but
   returned no Apollo product page. Linsoul / Apos / MusicTeck are IEM-focused and do not
   carry it.
5. **Tech press attributing a figure to the manufacturer** — none found; no reviewer quoted
   an impedance, sensitivity, or frequency-response number.

These three fields are also the values Bluetooth ANC manufacturers essentially never
publish (the amp is internal and the DSP target is fixed), so this is the genuine-gap case
the protocol reserves `null` for — **not** a search failure and **not** a guessed default.
`cableLengthM` is the same story: three cables ship, none is length-specified anywhere.

## `soundSignature` exhaustion (E-tier)

Per the amended Tier-3 order, all four independent measurement sources were checked:

1. **Crinacle rankings list** — `crinacle.com/rankings/headphones/` fetched (1,037,190 bytes).
   Direct string count on the retrieved HTML: `Noble` → **0**, `Fokus` → **0**,
   `FoKus` → **0**, `Apollo` → **0**. The product is not on the list.
2. **Crinacle individual review post** — no FoKus Apollo review post exists. The Crinacle
   headphone graph index (`crinacle.com/graphs/headphones/`, HTTP 200, 767,069 bytes) was
   also checked programmatically: no Noble hit. The product URL
   (`/graphs/headphones/noble-fokus-apollo/`) returns HTTP 404.
3. **ASR (Audio Science Review)** — no measurement of this product is published. The two
   candidate thread URLs resolve to unrelated threads ("DIY speaker stands"; "Albarry M408
   question").
4. **Rtings** — an RTINGS review **does** exist (`/headphones/reviews/noble/fokus-apollo`
   returns HTTP 200 with the title "Noble FoKus Apollo Review - RTINGS.com"), but the site
   serves a JS-rendered shell and no measured body content or tuning verdict could be read
   from it. Recorded as *present but unreadable*, not as absent.

With Crinacle, ASR and every readable source silent, `soundSignature` is left `null`
rather than inferred from the manufacturer's marketing prose ("vast soundstage", "bass is
punchy and warm", "trebles have a compelling clarity and sparkle"), which the protocol
explicitly forbids as an E-tier source. Noble's own app EQ presets are likewise not a
measurement and are not used.

## Same-tier conflicts recorded (per the amended manufacturer-self-contradiction rule)

1. **`bluetoothCodecs`** — manufacturer page: "LDAC, AAC, aptX, aptX HD, **SBC**";
   headphones.com spec block: "LDAC, AAC, aptX, aptX HD" (SBC absent).
   *Resolution:* kept the manufacturer's live-page set (both agree on the four; the
   manufacturer additionally names SBC). The retailer's list is the shorter one, so
   preferring it would silently drop a codec the manufacturer states. Both cited.
2. **ANC depth** — manufacturer page: "-35db" reduction; headphones.com: "-20dB to -35dB"
   reduction. *Resolution:* same-tier restatement, and the two do not contradict on the
   ceiling. ANC **depth is not itself a `filterAttributes` field** (the field is the `anc`
   enum, sourced `anc`), so no field value turns on this. Recorded here for transparency.
3. **`acousticDesign`** — no live manufacturer statement either way; resolved by the live
   Sanity legacy value (`backDesign: "closed"`) agreeing with the absence of any open-back
   or vented language. Recorded rather than silently assumed.

## Gaps reported back (NOT fixed here — out of scope per the issue)

1. **`bluetoothCodecs` vocab gap — `aptX HD` is missing from the schema enum.** The
   manufacturer states `aptX HD` support. `sanity-cms/schemaTypes/productType.ts`'s
   `bluetoothCodecs` options list is
   `["SBC", "AAC", "aptX", "aptX Adaptive", "aptX LL", "LDAC", "LC3"]` — verified by
   `grep` to contain **no `aptX HD`** entry. Meanwhile `should-be-headphones.md` item 27
   specifies the codec facet as "SBC, AAC, aptX, **aptX HD**, aptX Adaptive, LDAC, LC3",
   and `docs/filters-sort/sourced-headphones-bowers-wilkins.md` already records `aptX HD`
   as a sourced value with the same flag. So the schema is out of sync with the facet
   spec, and this genuinely affects the catalogue (aptX HD is extremely common on
   Qualcomm-based headphones). **Handling:** the real sourced value is written (the patch
   spec contains `"aptX HD"`), and the gap is flagged here rather than force-fit to
   `aptX` or dropped. **This is the main item needing human decision** — see the
   "Human action required" note below.
   *(Note: the migration engine at `engine.mjs` performs no enum validation, so an
   out-of-vocabulary value is written to Sanity silently. That is precisely why this is
   surfaced rather than absorbed.)*
2. **`driverConfigBucket` has no value that fits this product.** The enum is
   `["single-dynamic", "single-ba", "multi-ba", "hybrid-config", "planar", "other"]`.
   The FoKus Apollo is a headphone with a two-driver hybrid arrangement (1 dynamic + 1
   planar). `other` is technically valid but carries no information; the IEM-shaped
   `hybrid-config` would be misleading on a non-IEM. Left **omitted** rather than forced.
   (`driverConfigDetail` is D-tier and depends on this bucket, so it is omitted too.)
3. **`ipxRating` has no honest value for "never claimed".** The enum is
   `["none", "IPX2", "IPX4", "IPX5", "IPX7", "IPX8"]`. No IP claim exists anywhere for
   this product. Writing `"none"` would assert a *findable negative* (as was correct for
   the WH-1000XM5, where Sony publishes an IP story) whereas this product simply has no
   rating — and IPX is an enum a manufacturer may legitimately omit, so the boolean
   feature-absence rule does not apply. Left **omitted**.
4. **Three superseded legacy fields hold stale/contradictory values** on this document:
   `backDesign: "closed"`, `noiseCancelling: false`, `connector: ["3.5mm","6.35mm"]`.
   Their canonical replacements (`acousticDesign`, `anc`, `cableTermination`) are written
   by this patch. Deleting the legacy fields is a write-scope decision for the human, not
   something this sourcing pass does silently (same convention as the Sennheiser pass).

## Human action required

**One decision:** widen `productType.ts`'s `bluetoothCodecs` enum to include `"aptX HD"`
(aligning it with `should-be-headphones.md` item 27 and the B&W sourced doc). Until that
happens, this product carries one value outside the Studio dropdown list.

If you'd rather not widen it, the alternative is to drop `"aptX HD"` from
`noble-fokus-apollo.mjs`'s `filterAttributes.bluetoothCodecs` (leaving
`["LDAC","AAC","aptX","SBC"]`) and record the omission — but that would under-report a
codec the manufacturer explicitly advertises, so widening the enum is the recommended fix.

## Verification performed

`runPatch.mjs products/noble-fokus-apollo.mjs` (dry run, from
`sanity-cms/utils/migrations/headphonesFilterAttributes/`) against live Sanity
`production`. Result: resolves `moXlkADK7m1DHgGwWwzwUF`, **no NAME MISMATCH warning**,
19 citation entries ready to merge. Every field diff is intentional — including the four
deliberate `unchanged (null)` rows (`impedanceOhms`, `sensitivityDbMw`, `freqResponseHz`,
`cableLengthM`) and the `soundSignature: unchanged (null)` row. No `--write` was run.


