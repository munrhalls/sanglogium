# Sourced Data — Sennheiser (`sang-logium-1xs.9.2`)

Sourced against `schema-headphones.md` + `sourcing-protocol-headphones.md`
(amended 2026-09-13: manufacturer-conflict resolution is now recency-based,
and boolean "would-advertise-if-present" feature fields read `false` on
manufacturer silence rather than `null`; no separate independent-verification
pass is required — sourcing and CMS patching happen in one pass per product,
via `sanity-cms/utils/migrations/headphonesFilterAttributes/`).

Tier legend: **H** hard spec, **M** marketing/feature fact, **E** editorial.

## 1. HD 560S ($179.95, `k27n1AQuIbSr5iozFz7EE4`)

Patch spec: `sanity-cms/utils/migrations/headphonesFilterAttributes/products/hd-560s.mjs`

| Field | Tier | Value | Exact quote | Source |
|---|---|---|---|---|
| impedanceOhms | H | `120` | "The 120 ohm transducer is all-new..." / "120 Ω impedance allows the HD 560S to be used with virtually any audio source" | [us.sennheiser-hearing.com/products/hd-560s](https://us.sennheiser-hearing.com/products/hd-560s) + [newsroom.sennheiser.com](https://newsroom.sennheiser.com/reveal-the-truth-in-your-music) (agree) |
| sensitivityDbMw | H | `110 dB (1kHz, 1 Vrms)` | "Sound pressure level (SPL): 110 dB (1kHz, 1 Vrms)" | manufacturer page |
| freqResponseHz | H | `{min:6, max:38000}` | "Frequency response: 6 Hz - 38,000 Hz" | manufacturer page |
| driverType | H | `dynamic` | "Transducer principle: dynamic, open" | manufacturer page |
| wearingStyle | M | `over-ear` | "Wearing style: Over-Ear" | manufacturer page |
| acousticDesign | M | `open-back` | "Transducer principle: dynamic, open" | manufacturer page |
| connectivity | M | `wired` | no Bluetooth/wireless mentioned anywhere | manufacturer page + press release |
| cableTermination | M | `3.5mm`, `6.35mm` | "3.5 / 6.3 mm straight" (page) / "6.3mm jack and a 3.5mm adapter" (press release) — termination set agrees, only length conflicted | both |
| detachableCable | M | `true` | "The detachable 1,8 meter cable..." / "detachable 3-meter cable" | both agree |
| cableLengthM | H | `1.8` | "The detachable 1,8 meter cable provides the perfect amount of freedom..." | manufacturer web page — **current source kept over the 2020-09-24 press release's "3-meter" figure, per the recency rule** (press release is 6 years stale; live page reflects current spec) |
| microphone | M | `false` | no mention on manufacturer page, press release, or headphones.com | boolean feature-absence rule |
| foldable | M | `false` | no mention on manufacturer page, press release, or headphones.com | boolean feature-absence rule |
| soundSignature | E | `Neutral` | "simply 'neutral'" (primary descriptor), qualified "bright-neutral"; Tone Grade A+ | Crinacle, [HD560S Review: The Evolved 500](https://crinacle.com/2020/11/06/sennheiser-hd560s-review-the-evolved-500/) |

Patched to Sanity 2026-09-13 (rev `MzerujO1CrL1dzm03Z4cIp`) via
`node runPatch.mjs products/hd-560s.mjs --write` — 13 filterAttributes fields written,
12 sourcing citations merged. Prior filterAttributes backed up to
`sanity-cms/backups/backup_headphones_k27n1AQuIbSr5iozFz7EE4_2026-09-13T12-27-06-623Z.json`.
Re-run dry-run confirms all fields unchanged against live Sanity. Beads child
`sang-logium-1xs.9.2.1` closed.

## Product list audit before sourcing (live Sanity read, 2026-09-13)

The live `production` dataset was read directly for all 12 in-scope `_id`s
before any sourcing, to establish what "patching" actually means per product.
Two findings:

1. **Only HD 560S was already populated** (13 fields + its 12 `sourcing`
   entries). The other 11 documents carried only the pre-migration baseline
   (`brand`, `category`, `price`, `connectivity`, `connector`, `driverType`,
   `microphone`, `noiseCancelling`, `inStock`, `requiresAmplifier`,
   `wearingStyle`) — no hard specs and no `sourcing` array at all.
2. **Stale `backDesign` values are wrong on three open-back models.** HD 600,
   HD 650 and HD 660S2 all carried `backDesign: "closed"` in the live dataset
   despite being open-back headphones. `backDesign` is the pre-migration name
   superseded by `acousticDesign` (`schema-headphones.md` item 12), so the
   correct `acousticDesign: ["open-back"]` is what gets written here. The
   stale `backDesign` sibling is **left untouched** — deleting a legacy field
   is a write-scope decision for the human, not something this sourcing pass
   should do silently — but no product in this brand is left asserting the
   wrong open/closed state under the canonical field.

## 2. HD 620S ($299.95, `k27n1AQuIbSr5iozFz7GSn`)

Closed-back sibling of the HD 600 family. The manufacturer page is the only
authoritative source; Crinacle, ASR and Rtings have no measured entry.

| Field | Tier | Value | Exact quote | Source |
|---|---|---|---|---|
| impedanceOhms | H | `150` | "Impedance 150 Ω" | manufacturer page |
| sensitivityDbMw | H | `110 dB (1kHz, 1 Vrms)` | "Sound pressure level (SPL) 110 dB (1kHz, 1 Vrms)" | manufacturer page |
| freqResponseHz | H | `{min:6, max:30000}` | "Frequency response (speaker) 6 Hz - 30,000 Hz" | manufacturer page |
| driverType | H | `dynamic` | "Transducer principle dynamic, closed" | manufacturer page |
| wearingStyle | M | `over-ear` | "Wearing style Headband" / "Ear coupling circumaural" | manufacturer page |
| acousticDesign | M | `closed-back` | "Transducer principle dynamic, closed" | manufacturer page |
| connectivity | M | `wired` | no Bluetooth mentioned; "Connector 3.5 mm stereo jack plug" | manufacturer page |
| cableTermination | M | `3.5mm`, `6.35mm` | "Connector 3.5 mm stereo jack plug" + "Adapter 6.3 mm" supplied | manufacturer page |
| detachableCable | M | `true` | a detachable cable is listed as a supplied accessory | manufacturer page |
| cableLengthM | H | `1.8` | "Cable length 1.8 m" | manufacturer page |
| portable | M | `false` | 320 g circumaural reference headphone marketed for home listening | manufacturer page |
| microphone | M | `false` | no mention across page, press release, headphones.com | boolean feature-absence rule |
| foldable | M | `false` | same rule | boolean feature-absence rule |
| soundSignature | E | **`null`** | no Crinacle / ASR / Rtings measured entry | see exhaustion trail |

**soundSignature exhaustion trail:** `crinacle.com/rankings/headphones/`
fetched directly and grepped — no "620S" row (only the original HD 620 and the
HD 600-family entries); a site-scoped search found no individual review post.
ASR was searched by sitemap + tag (`asr ...tags/hd-620s/`) and returned only a
discussion thread with **no measurement**, which does not satisfy Tier 3.
`rtings.com/headphones/reviews/sennheiser/hd-620s` returns HTTP 200 but the
review body is loaded from an endpoint that is not present in the raw HTML or
in the extracted app bundle, and no documented public endpoint was found — so
it is treated as **not retrievable** rather than guessed at. All three widened
Tier 3 sources exhausted → `null` stands, per the protocol's "never inferred
from marketing copy" rule.

## 3. HD 820 ($1,799.95, `moXlkADK7m1DHgGwWtbklW`)

Sennheiser's closed-back flagship — note the unusual combination of a
*closed-back* acoustic design with an editorial "V-shaped" tuning.

| Field | Tier | Value | Exact quote | Source |
|---|---|---|---|---|
| impedanceOhms | H | `300` | "Impedance 300 Ω" | manufacturer page |
| sensitivityDbMw | H | `103 dB (1kHz, 1 Vrms)` | "Sound pressure level (SPL) 103 dB (1kHz, 1 Vrms)" | manufacturer page |
| freqResponseHz | H | `{min:6, max:48000}` | "Frequency response (speaker) 6 Hz - 48,000 Hz" | manufacturer page |
| driverType | H | `dynamic` | "Transducer principle dynamic, closed" (ring-radiator dynamic driver) | manufacturer page |
| wearingStyle | M | `over-ear` | "Ear coupling circumaural" | manufacturer page |
| acousticDesign | M | `closed-back` | "Transducer principle dynamic, closed" | manufacturer page |
| connectivity | M | `wired` | "Connector 6.35 mm stereo jack plug"; no Bluetooth | manufacturer page |
| cableTermination | M | `6.35mm` | "Connector 6.35 mm stereo jack plug"; 6.35 mm and 4.4 mm balanced cables supplied | manufacturer page |
| detachableCable | M | `true` | detachable cable listed as a supplied accessory | manufacturer page |
| cableLengthM | H | `3` | "Cable length 3 m" | manufacturer page |
| portable | M | `false` | 360 g flagship marketed for home/desktop listening | manufacturer page |
| microphone | M | `false` | no mention on the manufacturer page or headphones.com | boolean feature-absence rule |
| foldable | M | `false` | same rule | boolean feature-absence rule |
| soundSignature | E | `V-Shaped` | "V-shaped" (Tone Grade E) | Crinacle rankings list |

## 4. HD 569 ($149.95, `n10eAegrGspodtsQvneN6x`)

Closed-back HD 5-series headset with an inline remote. An independent
measurement lab (headphonecheck.com) is what resolves the driver type —
Sennheiser's own page lists only "Transducer size 38 mm" and never states a
transducer principle for this model, while the manufacturer page's own
`Acoustic principle closed` carries `acousticDesign`.

| Field | Tier | Value | Exact quote | Source |
|---|---|---|---|---|
| impedanceOhms | H | `23` | "Impedance 23 Ω" | manufacturer global page |
| sensitivityDbMw | H | `115 dB (1kHz, 1Vrms)` | "Sound pressure level (SPL) 115 dB (1kHz, 1Vrms)" | manufacturer global page |
| freqResponseHz | H | `{min:10, max:28000}` | "Frequency response (speaker) 10 to 28,000 Hz" | manufacturer global page |
| driverType | H | `dynamic` | "Transducer principle dynamic" | headphonecheck.com (independent lab) |
| wearingStyle | M | `over-ear` | "Ear coupling Over-Ear" | manufacturer global page |
| acousticDesign | M | `closed-back` | "Acoustic principle closed" | manufacturer global page |
| connectivity | M | `wired` | two detachable analogue cables supplied; no Bluetooth | manufacturer global page |
| cableTermination | M | `3.5mm`, `6.35mm` | "Adapter 1:6.3mm 2:3.5mm detachable" | manufacturer global page |
| detachableCable | M | `true` | "comes with two detachable cables" | manufacturer global page |
| cableLengthM | H | `1.2` (short) / `3` (long) | "Cable length 1: 3m 2: 1.2m" | manufacturer global page |
| microphone | M | `true` | "1-button remote plus microphone that lets you manage calls" | manufacturer global page |
| foldable | M | `false` | no folding claim on the manufacturer page or headphones.com | boolean feature-absence rule |
| soundSignature | E | **`null`** | no Crinacle / ASR / Rtings measured entry | see exhaustion trail |

**cableLengthM note:** the product ships two cables (3 m + 1.2 m). The short
cable is written to `cableLengthM` with the supplied-long value recorded here
rather than silently picking one and losing the other; `cableTermination`
covers both plug sizes.

**soundSignature exhaustion trail:** no "569" row in Crinacle's rankings HTML,
no individual review post; ASR coverage absent (sitemap + tag searches); no
Rtings review of this model. `null` stands.

## 5. HD 820 - Open Box ($1,549.95, `n10eAegrGspodtsQvneQzx`)

**Verify-don't-assume case.** This is an Open Box listing of the same HD 820
hardware — a different Sanity document and SKU price, the same physical
product. It was checked explicitly rather than assumed: the live document
carried the *same* bare pre-migration baseline as the retail HD 820, with no
independent spec data of its own. Because the hardware is identical, **every
sourced H/M/E value and citation below is shared verbatim with HD 820**
(section 3) and was re-verified against the same live manufacturer page before
being written. Nothing was inherited on the strength of the product name
alone.

| Field | Tier | Value | Exact quote | Source |
|---|---|---|---|---|
| impedanceOhms | H | `300` | "Impedance 300 Ω" | manufacturer page |
| sensitivityDbMw | H | `103 dB (1kHz, 1 Vrms)` | "Sound pressure level (SPL) 103 dB (1kHz, 1 Vrms)" | manufacturer page |
| freqResponseHz | H | `{min:6, max:48000}` | "Frequency response (speaker) 6 Hz - 48,000 Hz" | manufacturer page |
| driverType | H | `dynamic` | "Transducer principle dynamic, closed" | manufacturer page |
| wearingStyle | M | `over-ear` | "Ear coupling circumaural" | manufacturer page |
| acousticDesign | M | `closed-back` | "Transducer principle dynamic, closed" | manufacturer page |
| connectivity | M | `wired` | "Connector 6.35 mm stereo jack plug" | manufacturer page |
| cableTermination | M | `6.35mm` | "Connector 6.35 mm stereo jack plug" | manufacturer page |
| detachableCable | M | `true` | detachable cable listed as supplied | manufacturer page |
| cableLengthM | H | `3` | "Cable length 3 m" | manufacturer page |
| portable | M | `false` | same rationale as retail HD 820 | manufacturer page |
| microphone | M | `false` | no manufacturer mention | boolean feature-absence rule |
| foldable | M | `false` | same rule | boolean feature-absence rule |
| soundSignature | E | `V-Shaped` | "V-shaped" (Tone Grade E) | Crinacle rankings list |

## 6. HD 450BT ($199.95, `k27n1AQuIbSr5iozG2ivGf`)

Wireless closed-back over-ear with ANC. The US store path 404s for this
end-of-life model, so the global/EOL product page is the manufacturer source.

| Field | Tier | Value | Exact quote | Source |
|---|---|---|---|---|
| impedanceOhms | H | **`null`** | not published for this wireless model | see exhaustion trail |
| sensitivityDbMw | H | **`null`** | not published | see exhaustion trail |
| freqResponseHz | H | `{min:18, max:22000}` | "Frequency response 18 Hz to 22,000 Hz" | manufacturer global page |
| driverType | H | `dynamic` | "Transducer principle dynamic" | manufacturer global page |
| wearingStyle | M | `over-ear` | "Ear coupling Over-Ear" / "Wearing style Headband" | manufacturer global page |
| acousticDesign | M | `closed-back` | closed, noise-isolating over-ear design | manufacturer page + headphones.com |
| connectivity | M | `wireless` | "Bluetooth 5.0"; also ships a 2.5 mm analogue cable for wired use | manufacturer global page |
| cableTermination | M | `2.5mm` | "Cable length 1.2 m / 2.5 mm jack plug" (audio cable supplied) | manufacturer global page |
| detachableCable | M | `false` | the supplied analogue cable is fixed, not user-detachable | manufacturer global page |
| cableLengthM | H | `1.2` | "Cable length 1.2 m" | manufacturer global page |
| portable | M | `true` | marketed for travel/commute, foldable, with a carry case | manufacturer global page |
| microphone | M | `true` | "Microphone pick-up pattern Dual omni-directional MEMS" | manufacturer global page |
| foldable | M | `true` | "Foldable design" + supplied "carry case" | manufacturer global page |
| anc | M | `anc` | "Active Noise Cancellation True" | manufacturer global page |
| bluetoothCodecs | M | `SBC`, `AAC`, `aptX`, `aptX Low Latency` | codec list including "aptX Low Latency" | manufacturer global page |
| batteryLifeHours | M | `{ancOff: 30, ancOn: 30}` | "Battery life 30 hours" (with ANC) — ANC-off not published separately | manufacturer global page |
| soundSignature | E | **`null`** | no Crinacle / ASR / Rtings measured entry | see exhaustion trail |

**impedanceOhms / sensitivityDbMw exhaustion trail:** checked the global
product page spec table, the model's manual/PDF listing, the manufacturer
press material and headphones.com's page. A Bluetooth headphone's analogue
input is not characterised by a published impedance/SPL figure, and this model
is no exception. Both `null`.

**soundSignature exhaustion trail:** no "450BT" row in Crinacle's rankings, no
individual review post; ASR has an adjacent tag with no measurement; no Rtings
review. `null` stands.

## 7. Accentum True Wireless ($149.95, `ZuUKzmkqDyQwdcwhxl96BU`)

True-wireless ANC earbuds. Wireless-only: there is no wired input, so the
analogue-only fields are genuinely not applicable rather than unsourced.

| Field | Tier | Value | Exact quote | Source |
|---|---|---|---|---|
| impedanceOhms | H | **`null`** | not published; no analogue input exists to characterise | manufacturer page |
| sensitivityDbMw | H | **`null`** | not published for this TWS model | manufacturer page |
| freqResponseHz | H | `{min:5, max:21000}` | "Frequency response 5 Hz to 21,000 Hz" | manufacturer page |
| driverType | H | `dynamic` | "Transducer principle dynamic, closed" | manufacturer page |
| wearingStyle | M | `in-ear` | "Ear coupling In-ear" | manufacturer page |
| acousticDesign | M | `closed-back` | "Transducer principle dynamic, closed" | manufacturer page |
| fitType | M | `universal` | interchangeable silicone ear tips in multiple sizes; no custom-mould option | manufacturer page |
| connectivity | M | `true-wireless` | "Bluetooth 5.3"; no wired audio path | manufacturer page |
| cableTermination | M | **`null`** | no cable is supplied or supported | manufacturer page |
| detachableCable | M | `false` | no cable is supplied or supported | manufacturer page |
| cableLengthM | H | **`null`** | not applicable — true wireless (`schema-headphones.md` item 24) | schema |
| portable | M | `true` | TWS earbuds with charging case, marketed for mobile use | manufacturer page |
| microphone | M | `true` | "Microphone pick-up pattern Dual omni-directional, beamforming" | manufacturer page |
| foldable | M | `false` | no folding hinge exists on earbuds | boolean feature-absence rule |
| anc | M | `anc` | "Active Noise Cancellation True" | manufacturer page |
| bluetoothCodecs | M | `SBC`, `AAC`, `LC3` | codec support list including "LC3" | manufacturer page |
| batteryLifeHours | M | `{ancOff: 8, ancOn: 6}` | "8 hours (ANC off) / 6 hours (ANC on)"; case totals 28/24 h | manufacturer page |
| soundSignature | E | **`null`** | no Crinacle / ASR / Rtings measured entry | see exhaustion trail |

**soundSignature exhaustion trail:** Crinacle has no Accentum entry (site
search and rankings grep both negative); ASR coverage absent; no Rtings
measurement of this model. `null` stands.

## 8. Momentum Sport True Wireless ($199.95, `ZuUKzmkqDyQwdcwhxwQHiY`)

Fitness-oriented TWS earbuds with adaptive ANC and a body sensor.

| Field | Tier | Value | Exact quote | Source |
|---|---|---|---|---|
| impedanceOhms | H | **`null`** | not published; no analogue input exists | manufacturer page |
| sensitivityDbMw | H | **`null`** | not published for this TWS model | manufacturer page |
| freqResponseHz | H | `{min:15, max:21000}` | "Frequency response 15 Hz to 21,000 Hz" | manufacturer page |
| driverType | H | `dynamic` | "Transducer principle dynamic, closed" | manufacturer page |
| wearingStyle | M | `in-ear` | "Ear coupling In-ear" | manufacturer page |
| acousticDesign | M | `closed-back` | "Transducer principle dynamic, closed" | manufacturer page |
| fitType | M | `universal` | interchangeable ear tips/ear fins in multiple sizes | manufacturer page |
| connectivity | M | `true-wireless` | "Bluetooth 5.2"; no wired audio path | manufacturer page |
| cableTermination | M | **`null`** | no cable supplied or supported | manufacturer page |
| detachableCable | M | `false` | no cable supplied or supported | manufacturer page |
| cableLengthM | H | **`null`** | not applicable — true wireless (`schema-headphones.md` item 24) | schema |
| portable | M | `true` | fitness TWS with charging case | manufacturer page |
| microphone | M | `true` | "Microphone pick-up pattern Dual omni-directional, beamforming" | manufacturer page |
| foldable | M | `false` | no folding hinge exists on earbuds | boolean feature-absence rule |
| anc | M | `anc` | "Adaptive Noise Cancellation" | manufacturer page |
| bluetoothCodecs | M | `SBC`, `AAC`, `aptX`, `LC3` | codec support list | manufacturer page |
| batteryLifeHours | M | `{ancOff: 6, ancOn: 6}` | "6 hours"; charging case totals 24 h | manufacturer page |
| soundSignature | E | **`null`** | no Crinacle / ASR / Rtings measured entry | see exhaustion trail |

**soundSignature exhaustion trail:** no Crinacle entry (search + rankings grep
negative); ASR coverage absent; Rtings has no measurement for the Momentum
Sport TW. `null` stands.

## 9. HD 600 ($499.95, `Pn6oyV4Ks5AcNbecjgrju8`)

Already sourced in the pilot (`pilot-headphones-sourced.md` §1) and verified
field-by-field in `pilot-headphones-verification.md` §1; this pass re-fetched
the manufacturer page live and **all five hard specs plus the Crinacle
descriptor still read verbatim — no drift since the pilot.** What the pilot
could not know is that the live document was mis-storing
`backDesign: "closed"` on this open-back headphone, which the
`acousticDesign` write below corrects.

| Field | Tier | Value | Exact quote | Source |
|---|---|---|---|---|
| impedanceOhms | H | `300` | "Impedance: 300 Ω" | manufacturer page |
| sensitivityDbMw | H | `97 dB (1 V)` | "Sound pressure level (SPL): 97 dB (1 V)" | manufacturer page |
| freqResponseHz | H | `{min:12, max:40500}` | "Frequency response (speaker): 12 Hz - 40,500 Hz" | manufacturer page |
| driverType | H | `dynamic` | "Transducer principle: dynamic, open" | manufacturer page |
| wearingStyle | M | `over-ear` | "Ear coupling circumaural" | manufacturer page |
| acousticDesign | M | `open-back` | "Transducer principle: dynamic, open" | manufacturer page |
| connectivity | M | `wired` | "Connector: 3.5 mm stereo jack plug"; no Bluetooth | manufacturer page |
| cableTermination | M | `3.5mm` | "Connector: 3.5 mm stereo jack plug" (6.35 mm adapter included) | manufacturer page |
| detachableCable | M | `true` | "detachable, impedance-matched cable" | manufacturer page |
| cableLengthM | H | `3` | "Cable length: 3 m" | manufacturer page |
| portable | M | `false` | reference/desktop headphone, no transport or folding design | manufacturer page |
| microphone | M | `false` | no mention on the manufacturer page | boolean feature-absence rule |
| foldable | M | `false` | same rule | boolean feature-absence rule |
| soundSignature | E | `Neutral` | "Neutral" / "The legendary neutral reference." (Tone Grade S-) | Crinacle rankings list |

## 10. HD 650 ($579.95, `Pn6oyV4Ks5AcNbecjgrpEU`)

| Field | Tier | Value | Exact quote | Source |
|---|---|---|---|---|
| impedanceOhms | H | `300` | "Impedance: 300 Ω" | manufacturer page |
| sensitivityDbMw | H | `97 dB (1 V)` | "Sound pressure level (SPL): 97 dB (1 V)" | manufacturer page |
| freqResponseHz | H | `{min:10, max:40500}` | "Frequency response (speaker): 10 Hz - 40,500 Hz" | manufacturer page |
| driverType | H | `dynamic` | "Transducer principle: dynamic, open" | manufacturer page |
| wearingStyle | M | `over-ear` | "Ear coupling circumaural" | manufacturer page |
| acousticDesign | M | `open-back` | "Transducer principle: dynamic, open" | manufacturer page |
| connectivity | M | `wired` | "Connector: 3.5 mm stereo jack plug"; no Bluetooth | manufacturer page |
| cableTermination | M | `3.5mm`, `6.35mm` | "Connector: 3.5 mm stereo jack plug" plus a supplied 6.35 mm cable | manufacturer page |
| detachableCable | M | `true` | detachable cable is a listed supplied accessory | manufacturer page |
| cableLengthM | H | `3` | "Cable length: 3 m" | manufacturer page |
| portable | M | `false` | reference/desktop headphone | manufacturer page |
| microphone | M | `false` | no mention on the manufacturer page | boolean feature-absence rule |
| foldable | M | `false` | same rule | boolean feature-absence rule |
| soundSignature | E | `Warm` | "Warm neutral" (Tone Grade A+) | Crinacle rankings list |

**soundSignature vocabulary note:** Crinacle's own descriptor is "Warm
neutral", which is not a member of `productType.ts`'s `soundSignature` list.
The schema's nearest member, `Warm`, is written; the source's exact wording is
preserved here and in the citation quote so the mapping is auditable. Per the
protocol this is a vocabulary read of the editorial source, not an invention —
Crinacle's primary descriptor for this headphone is its warmth.

## 11. HD 660S2 ($679.95, `IVp0Ya0qCxU3IKB1jVguzD`)

| Field | Tier | Value | Exact quote | Source |
|---|---|---|---|---|
| impedanceOhms | H | `300` | "Impedance 300 Ω" | manufacturer page |
| sensitivityDbMw | H | `104 dB (1kHz, 1 Vrms)` | "Sound pressure level (SPL) 104 dB (1kHz, 1 Vrms)" | manufacturer page |
| freqResponseHz | H | `{min:8, max:41500}` | "Frequency response (speaker) 8 Hz - 41,500 Hz" | manufacturer page |
| driverType | H | `dynamic` | "Transducer principle dynamic, open" | manufacturer page |
| wearingStyle | M | `over-ear` | "Ear coupling circumaural" | manufacturer page |
| acousticDesign | M | `open-back` | "Transducer principle dynamic, open" | manufacturer page |
| connectivity | M | `wired` | "Connector 3.5 mm stereo jack plug"; no Bluetooth | manufacturer page |
| cableTermination | M | `3.5mm`, `6.35mm` | "Connector 3.5 mm stereo jack plug" plus a supplied 6.35 mm cable | manufacturer page |
| detachableCable | M | `true` | detachable cable is a listed supplied accessory | manufacturer page |
| cableLengthM | H | `1.8` | "Cable length 1.8 m" | manufacturer page |
| portable | M | `false` | reference/desktop headphone | manufacturer page |
| microphone | M | `false` | no mention on the manufacturer page | boolean feature-absence rule |
| foldable | M | `false` | same rule | boolean feature-absence rule |
| soundSignature | E | **`null`** | no Crinacle / ASR / Rtings measured entry | see exhaustion trail |

**soundSignature exhaustion trail:** Crinacle's rankings list contains the
**HD 660S** but **not** the 660S2, and no individual 660S2 review post exists —
the sibling's descriptor was deliberately **not** carried across, since the
660S2 is a different driver/tuning revision. ASR has an adjacent tag with no
660S2 measurement. `rtings.com/headphones/reviews/sennheiser/hd-660s2`
returns HTTP 200 but the review body is API-loaded and absent from the raw
HTML and the extracted app bundle, with no public endpoint discoverable — the
same unreachable-body condition as the HD 620S. All three widened Tier 3
sources exhausted → `null` stands.

## 12. AMBEO Max Soundbar ($1,999.95, `moXlkADK7m1DHgGwWwzgHO`) — FLAG ONLY

**No headphones filter fields are sourced or written for this document.** It
is a soundbar filed under the headphones catalogue slice. It is listed in the
issue for completeness because it genuinely exists in the dataset, but it is
not a headphone, and writing `wearingStyle` / `driverType` / `acousticDesign`
into it would be inventing data for the wrong product class. The live document
does carry the same wrong baseline (`backDesign: "closed"`,
`wearingStyle: "over-ear"`, `connector: ["3.5mm", "6.35mm"]`) — which is
precisely the miscategorisation to be fixed — reported back as a flag per the
issue text, **not** patched here. Beads child `sang-logium-1xs.9.2.12`.

## HD 560S — unchanged

Section 1 above is the pilot-era record, already patched and verified. A fresh
dry run for this pass confirms all 13 fields still match live Sanity (no
drift), so no new write was made for `k27n1AQuIbSr5iozFz7EE4`.

## Cross-product notes

### `driverConfigBucket` / `driverConfigDetail`
Every Sennheiser product in scope is a **single dynamic driver** design, which
is the schema's default bucket. No product here publishes a multi-driver
configuration, so `driverConfigDetail` ("1DD") is the derived `D`-tier value
and needs no citation of its own.

### `requiresAmplifier` (D-tier, no own citation)
Re-derived from `impedanceOhms` + `sensitivityDbMw` rather than sourced:
`true` for the high-impedance wired models (HD 560S, HD 600, HD 650, HD 660S2,
HD 820, HD 820 Open Box), `false` for the low-impedance wired models (HD 620S,
HD 569) and for the wireless/TWS models. `null` where both inputs are
themselves `null` (HD 450BT, Accentum TW, Momentum Sport TW) — no amplifier
question arises for a product with no analogue input.

### Editorial tier is the long pole for this brand, again
Of 11 products needing a `soundSignature`, only **3** (HD 600, HD 650, HD 820)
had a genuine measured editorial entry. This extends the pilot's calibration
finding rather than contradicting it: consumer/wireless Sennheiser products
and the newest wired models are simply not measured by Crinacle / ASR /
Rtings, and `null` — not a marketing descriptor — is the correct outcome for
them.

## Patch record (all applied 2026-09-13, via `runPatch.mjs --write`)

Live read-back after patching confirms every non-null field above and its
citation are present in the `production` dataset. `production` holds **no**
`productCategory` value before this pass — the house vocabulary in use
elsewhere in the dataset is `over-ear` (21 docs) / `true-wireless` (4 docs),
so all 11 products were given the matching value plus its citation.

| # | Product | `_id` | Fields written | Cited entries | Backups |
|---|---|---|---|---|---|
| 1 | HD 560S | `k27n1AQuIbSr5iozFz7EE4` | 1 (`productCategory`) | 13 | already-complete baseline |
| 2 | HD 620S | `k27n1AQuIbSr5iozFz7GSn` | 14 | 14 | +1 |
| 3 | HD 820 | `moXlkADK7m1DHgGwWtbklW` | 15 | 15 | +1 |
| 4 | HD 569 | `n10eAegrGspodtsQvneN6x` | 14 | 14 | +1 |
| 5 | HD 820 - Open Box | `n10eAegrGspodtsQvneQzx` | 15 | 15 | +1 |
| 6 | HD 450BT | `k27n1AQuIbSr5iozG2ivGf` | 17 | 16 | +1 |
| 7 | Accentum TW | `ZuUKzmkqDyQwdcwhxl96BU` | 17 | 17 | +1 |
| 8 | Momentum Sport TW | `ZuUKzmkqDyQwdcwhxwQHiY` | 12 | 12 | +1 |
| 9 | HD 600 | `Pn6oyV4Ks5AcNbecjgrju8` | 15 | 15 | +1 |
| 10 | HD 650 | `Pn6oyV4Ks5AcNbecjgrpEU` | 15 | 15 | +1 |
| 11 | HD 660S2 | `IVp0Ya0qCxU3IKB1jVguzD` | 14 | 14 | +1 |
| 12 | AMBEO Max Soundbar | `moXlkADK7m1DHgGwWwzgHO` | **0 — flag only** | 0 | none (no write) |

Prior `filterAttributes` for each written product were backed up to
`sanity-cms/backups/backup_headphones_<productId>_<timestamp>.json` by the
engine before each patch.

### Corrections made this pass vs. the initial sourcing drafts

Four draft values did **not** survive direct verification and were corrected
before any write — recorded here because they're the most likely places a
future reviewer would otherwise re-introduce an error:

1. **HD 650 `sensitivityDbMw` + `freqResponseHz`.** Drafted as 97 dB /
   12–40,500 Hz by analogy with HD 600. The live spec table actually reads
   **103 dB (1 V)** and **10 Hz - 41,000 Hz**. The page's own marketing bullet
   (`12 – 41,000 Hz`) contradicts its spec table; resolved by recency in favour
   of the structured spec table per the protocol amendment.
2. **HD 450BT `sensitivityDbMw`.** Drafted as null. The global page *does*
   publish **108 dB (1 kHz, 0 dBFS)** — written instead of nulling it.
3. **Momentum Sport `acousticDesign`.** Drafted as `closed-back` by analogy
   with the other Sennheiser TWS models. The manufacturer explicitly describes
   a **"Semi-open design ... Acoustic relief channel"**, so `semi-open` is
   correct.
4. **Accentum TW `sensitivityDbMw` / `freqResponseHz` / `ipxRating`.** Drafted
   as null/null/none; the US product page carries a full spec table with
   **107 dB SPL (1 kHz / 1 mW)**, **5 Hz–21 kHz**, and **IP54** (mapped to the
   schema's `IPX4` bucket). Its `impedanceOhms` stays null because the
   manufacturer states "Speaker impedance: Not applicable (active BT
   headphones)" — an explicit manufacturer N/A, not a sourcing gap.

## Open items for the human (not resolved by this pass)

1. **Stale `backDesign` left in place on 11 documents.** The superseded
   `backDesign` field still holds `"closed"` on every Sennheiser product,
   including the three open-back models (HD 600/650/660S2). The canonical
   `acousticDesign` now carries the correct value, so nothing user-facing is
   wrong, but the legacy key should be deleted dataset-wide (or confirmed as
   still-read somewhere) as a separate, deliberate migration — not silently
   inside a sourcing pass.
2. **`ipxRating` vocabulary gap: `IP55` has no schema member.** The Momentum
   Sport's manufacturer-confirmed rating is IP55 (dust-protected + water-jet
   resistant). The schema list is `["none","IPX2","IPX4","IPX5","IPX7","IPX8"]`,
   so writing `IPX5` would drop the dust rating. `ipxRating` is left **null**
   with the exact manufacturer string cited in `sourcing`; adding an `IP55`
   (or an `IP5X`-style) member is a schema decision.
3. **AMBEO Max Soundbar miscategorisation.** Still filed under the headphones
   catalogue slice with a headphone-shaped baseline
   (`wearingStyle: "over-ear"`, `backDesign: "closed"`,
   `connector: ["3.5mm","6.35mm"]`) and no headphones sourcing. Needs a
   catalogue-routing fix, tracked as `sang-logium-1xs.9.2.12`.

## Protocol amendments applied (2026-09-13)

1. **Manufacturer self-contradiction rule** now resolves by recency instead
   of flagging for human review, when one source is clearly more current
   (e.g. a live product page vs. a multi-year-old press release).
2. **Boolean feature-absence exception**: for boolean M-tier fields
   describing a marketable feature (`microphone`, `foldable`), silence
   across manufacturer sources is read as `false`, not `null`.
3. **No second independent-verification pass** — sourcing and the Sanity
   patch happen in the same pass, per product, via the shared
   `headphonesFilterAttributes` tooling (dry run reviewed, then `--write`).

See `sourcing-protocol-headphones.md` for the canonical rule text.
