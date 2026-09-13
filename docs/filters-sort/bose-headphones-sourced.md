# Bose Sourcing Results — `sang-logium-1xs.9.10`

Sourced against `schema-headphones.md` + `sourcing-protocol-headphones.md`
(widened 2026-09-13 tiers) + `should-be-headphones.md` (canonical enum
vocabularies). Covers the 4 Bose products enumerated in the issue: 2 distinct
models (QuietComfort Ultra Earbuds; Ultra Open Earbuds), each in 2 colorways.

Per the 2026-09-13 product-owner note on this issue, the second independent
verification pass is dropped; sourced values were written straight to the
Sanity `production` dataset through
`sanity-cms/utils/migrations/headphonesFilterAttributes/` (one spec file per
product, dry run reviewed, then `--write`).

Tier legend: **H** hard spec, **M** marketing/feature fact, **E** editorial,
**D** derived, **I** internal (not sourced here).

**Every POC `filterAttributes` value on these 4 documents was untrusted
invented enrichment data and was discarded.** The POC's `productCategory`,
`wearingStyle`, `acousticDesign`, `connectivity`, `impedanceOhms`,
`soundSignature`, `driverType`, `anc`, `microphone`, `cableTermination` values
were never read as ground truth or used as hints — only each product's real
name/brand/price were carried over. (For reference, the POC had product 1 as a
`wired`, `over-ear`, `planar-magnetic`, 347 Ω "basshead" headphone and product
4 as a `true-wireless`, `balanced-armature`, 468 Ω "neutral" IEM — none of that
survives.)

## SKU → model map

| SKU | Model | Patch spec file |
|---|---|---|
| `Y7l1IhzX2fnyiano4irsdl` QC Ultra Earbuds (Lunar Blue) | QuietComfort Ultra Earbuds | `products/bose-quietcomfort-ultra-earbuds-lunar-blue.mjs` |
| `ZuUKzmkqDyQwdcwhxl8saP` QC Ultra Earbuds (Black) | QuietComfort Ultra Earbuds | `products/bose-quietcomfort-ultra-earbuds-black.mjs` |
| `ZuUKzmkqDyQwdcwhxl8p4E` Ultra Open Earbuds (Moonstone Blue) | Ultra Open Earbuds | `products/bose-ultra-open-earbuds-moonstone-blue.mjs` |
| `dLGDVDmEEI2lV8CArAdTYq` Ultra Open Earbuds (White Smoke) | Ultra Open Earbuds | `products/bose-ultra-open-earbuds-white-smoke.mjs` |

Colourway variants share `filterAttributes` with their base model by
construction — the Lunar Blue file re-exports the Black file, and both Ultra
Open files re-export `products/bose-ultra-open-earbuds-common.mjs`.

## Working citation path

Bose's live product pages at `bose.com/p/earbuds/...` fetch successfully and
carry a full structured specification table (`Headphone Fit`, `Microphones`,
`Noise Cancelling`, `Water Resistant`, `Battery Life`, `Wireless Connectivity`,
material and dimension rows) plus an FAQ block that states IPX and microphone
facts explicitly. `support.bose.com` specification articles are JS-rendered and

## 1. Bose QuietComfort Ultra Earbuds (both colourways)

| Field | Tier | Value |
|---|---|---|
| productCategory | M | `True Wireless` |
| wearingStyle | M | `In-Ear` |
| acousticDesign | M | `Closed-Back` |
| fitType | M | `Universal Fit` |
| connectivity | M | `True Wireless` |
| portable | M | `true` |
| soundSignature | E | `Warm` |
| microphone | M | `true` |
| cableTermination | M | `[]` (N/A — no cable) |
| detachableCable | M | `false` |
| cableLengthM | H | `null` (N/A — no cable) |
| foldable | M | `false` |
| ipxRating | M | `IPX4` |
| bluetoothCodecs | M | `SBC`, `AAC`, `aptX Adaptive` |
| anc | M | `anc` |
| batteryLifeHours | M | `{ancOn: 6, ancOff: 6}` |
| driverType | M | `Dynamic` |
| driverConfigBucket | M | `single-dynamic` |
| driverConfigDetail | D | `1 × dynamic (per earbud)` |
| awards | M | `[]` |
| impedanceOhms | H | **null** (see missing-source log) |
| sensitivityDbMw | H | **null** (see missing-source log) |
| freqResponseHz | H | **null** (see missing-source log) |

Key citations (full quotes live in the patch spec's `sourcing` array):

- `https://www.bose.com/p/earbuds/bose-quietcomfort-ultra-earbuds/QCUE-HEADPHONEIN.html`
  — Bose official product page + FAQ. `"In-ear"`; `"Yes. The Bose QuietComfort
  Ultra Earbuds have passed IPX4 testing, which means they are protected
  against sweat and splashing water from any angle."`; `"Yes. Bose QuietComfort
  Ultra Earbuds have an adaptive microphone system that allows you to use them
  during calls when connected to any smartphone."`; `"Other new features
  include Snapdragon Sound certification, using hi-res audio and low latency
  codec, Qualcomm aptX Adaptive, and Google Fast Pair."`; battery footnote
  `"With Immersive Audio off, playback time was up to 6 hours before battery
  depletion. With Immersive Audio on, playback time was up to 4 hours before
  battery depletion."`
- `https://www.rtings.com/headphones/reviews/bose/quietcomfort-ultra-earbuds-truly-wireless`
  — Tier-3 measurement source. `Sound Signature = Warm; Bass Amount =
  Emphasized (4 dB); Treble Amount = Balanced (0 dB)`.

### Sound signature derivation

`Warm` is derived from RTINGS' own published measured weighting (bass
emphasized above neutral, treble neutral) rather than copied from review prose,
per the protocol's Tier-3 derivation rule. Crinacle has no entry for either
Bose model (checked both the IEM rankings list and individual review search);
RTINGS is a listed Tier-3 source, so its reading stands.

### `batteryLifeHours` mapping decision

Bose publishes the QC Ultra Earbuds battery split by **Immersive Audio**
on/off, not by ANC on/off, and ANC is engaged in both published figures. The
schema's shape is `{ancOff, ancOn}`. Because ANC does not change Bose's
published numbers, both `ancOn` and `ancOff` are recorded as the published
6 hours, and the Immersive-Audio-on figure (4 h) is explicitly **not** written

## 2. Bose Ultra Open Earbuds (both colourways)

| Field | Tier | Value |
|---|---|---|
| productCategory | M | `True Wireless` |
| wearingStyle | M | `In-Ear` |
| acousticDesign | M | `Semi-Open` |
| fitType | M | `Universal Fit` |
| connectivity | M | `True Wireless` |
| portable | M | `true` |
| soundSignature | E | `Bright/Analytical` |
| microphone | M | `true` |
| cableTermination | M | `[]` (N/A — no cable) |
| detachableCable | M | `false` |
| cableLengthM | H | `null` (N/A — no cable) |
| foldable | M | `false` |
| ipxRating | M | `IPX4` |
| bluetoothCodecs | M | `SBC`, `AAC` |
| anc | M | `none` |
| batteryLifeHours | M | `{ancOn: 7.5, ancOff: 7.5}` |
| driverType | M | `Dynamic` |
| driverConfigBucket | M | `other` |
| driverConfigDetail | D | `1 × dipole transducer per earbud` |
| awards | M | `[]` |
| impedanceOhms | H | **null** (see missing-source log) |
| sensitivityDbMw | H | **null** (see missing-source log) |
| freqResponseHz | H | **null** (see missing-source log) |

Key citations (full quotes live in the patch spec's `sourcing` array):

- `https://www.bose.com/p/earbuds/bose-ultra-open-earbuds/ULT-HEADPHONEOPN.html`
  — Bose official product page + specification table. `"Headphone Fit: Open
  Ear"`; `"Water Resistant: IPX4"`; `"Noise Cancelling: No"`; `"Microphones:
  Built-in Microphone"`; `"In-ear"` fit row; `"Wireless Connectivity: A2DP
  Bluetooth Audio Streaming, Bluetooth, Bluetooth Low Energy, HFP Bluetooth,
  Wireless Connectivity, AAC Bluetooth, SBC Bluetooth"`; `"Each earbud uses a
  tiny dipole transducer system engineered for loud-and-clear personal audio
  that stays at the ear"`; battery footnote `"With Immersive Audio off,
  playback time was up to 7.5 hours before battery depletion. With Immersive
  Audio on, playback time was up to 4.5 hours before battery depletion."`
- `https://www.rtings.com/headphones/reviews/bose/ultra-open-earbuds`
  — Tier-3 measurement source. `Sound Signature = Bright; Bass Amount = Very
  Underemphasized (-18 dB); Treble Amount = Balanced (-1 dB)`.

### Open-ear: which field carries it

Bose's own taxonomy puts this product under `Headphone Fit: Open Ear`, which is
a fit/form factor, not an acoustic chamber construction. Two fields were
considered:

- `wearingStyle` was kept `In-Ear` — it is a Bose in-ear product and Bose's own
  fit vocabulary is the source of truth here; the open-ear character is a
  sub-variant of in-ear fit, not a third wearing style alongside the schema's
  `over-ear / on-ear / in-ear` vocabulary.
- `acousticDesign` was set `Semi-Open` — the earbud deliberately does not seal
  the ear canal (`"without sealing your ear"`), so the acoustic chamber is
  neither closed nor a conventional open-back cup; `semi-open` is the schema's
  closest truthful value.

`anc` is `none`, not `passive`: Bose's specification table states `Noise
Cancelling: No` and no passive-isolation claim appears anywhere on the page,
and an unsealed open-ear design provides no meaningful passive isolation to
claim.

`batteryLifeHours` uses the same Immersive-Audio-on/off mapping decision as the
QC Ultra Earbuds: `ancOn` and `ancOff` both take the published 7.5 hours, since
ANC does not exist on this product and therefore cannot change the figure. Note
the Bose spec table's summary row reads `Battery Life: 7 hours` (stereo mode)
while the battery footnote reads 7.5 hours with Immersive Audio off — a
manufacturer self-contradiction resolved by recency within the same live page;
the footnote is the more specific, more current statement and is the figure
recorded.


## Missing-source log

| Field | Reason |
|---|---|
| `impedanceOhms` | Bose does not publish impedance for either consumer TWS model on the product page, spec table, or launch press release. Checked the manufacturer tier (product page, specification table) and Tier-3 measurement sources (RTINGS publishes no impedance figure for these models); Crinacle has no entry. Null per the protocol's null-is-a-last-resort rule — not invented, not inferred. |
| `sensitivityDbMw` | Same as `impedanceOhms` — Bose publishes no sensitivity figure for either model on any checked tier; no Tier-3 source measures it. |
| `freqResponseHz` | Bose publishes no numeric frequency-response range for either TWS model. RTINGS publishes measured curves but no manufacturer-style `{min, max}` printed range, so no H-tier value is recorded. |
| `cableLengthM`, `cableTermination` | Genuinely not applicable — true-wireless earbuds ship with no audio cable. A real N/A, not a sourcing gap; recorded as `null` / `[]` with a citation explaining the N/A. |
| `requiresAmplifier` | D-tier, derived from `impedanceOhms` + `sensitivityDbMw`. Both are null, so this field is intentionally left unset rather than defaulted to `false` — a null-derived flag would be a guess. No `sourcing` entry is owed for D-tier fields either way. |

`acousticDesign`, `foldable`, `awards`, `microphone`, `ipxRating`, `anc` and
`bluetoothCodecs` are **not** in this log: each was positively resolved. For the
boolean "would-advertise-if-present" fields (`microphone`, `foldable`), missing
manufacturer mentions map to the valued result rather than to a gap, per the
protocol's revised boolean-absence rule.

## Design gaps found (report back, not fixed here)

1. **`batteryLifeHours`'s `{ancOff, ancOn}` shape assumes the ANC toggle is the
   manufacturer's split variable.** Neither Bose model splits by ANC: the QC
   Ultra Earbuds split by Immersive Audio (ANC on in both figures), and the
   Ultra Open Earbuds have no ANC at all. The schema and protocol do not state
   what to do in this case. This pass recorded the manufacturer's stereo-mode
   figure in both slots and documented the real split in the citation quote,
   rather than dropping the value or mapping the Immersive-Audio figure onto
   `ancOff`. A protocol/schema clarification is owed — this affects any TWS
   product that markets a non-ANC power-draw mode.
2. **`acousticDesign` has no open-ear value.** `open-back / closed-back /
   semi-open` is a cup/chamber vocabulary; an unsealed *earbud* is none of the
   three cleanly. `semi-open` was used as the closest truthful value for the
   Ultra Open Earbuds, but if more open-ear products arrive, the schema likely
   needs a dedicated value rather than reusing `semi-open`.
3. **`driverConfigBucket`'s IEM buckets assume conventional driver topologies.**
   Bose's Ultra Open uses a single dipole transducer per earbud, which matches
   neither `single-dynamic` nor `single-ba`; it was recorded as `other` with the
   real topology in `driverConfigDetail`. Worth deciding whether
   `single-other`/an explicit transducer bucket is warranted.
4. **`support.bose.com` specification articles are JS-rendered** and return no
   body text to a non-browser fetch (only `"Customer Support Loading …"`). This
   is a real access-blocked failure mode, distinct from a blocked domain, and
   was worked around by citing the live `bose.com` product page, which carries
   the same spec table. Not a blocker for this batch, but worth recording for
   other brands that mirror specs only in a JS support portal.

## Sanity patch trail

All four documents were dry-run first (`runPatch.mjs products/<spec>.mjs`), the
field-by-field diff reviewed, then patched with `--write`:

| Product `_id` | Result |
|---|---|
| `ZuUKzmkqDyQwdcwhxl8saP` | patched, rev `MzerujO1CrL1dzm03ZG3q5` |
| `Y7l1IhzX2fnyiano4irsdl` | patched, rev `7P2D00ai8KUgrZgiFaNpAp` |
| `ZuUKzmkqDyQwdcwhxl8p4E` | patched, rev `MzerujO1CrL1dzm03ZG4ht` |
| `dLGDVDmEEI2lV8CArAdTYq` | patched, rev `Ch755lAE5GLsZ435Cw8vf8` |

Each write backed the prior `filterAttributes` up to
`sanity-cms/backups/backup_headphones_<productId>_<timestamp>.json` before
patching. `filterAttributes.sourcing` merged per field name, so re-running any
spec replaces only that spec's own citations.

## Superseded draft note

An earlier draft of this file (same-day, before the product-owner note on this
issue) contained only product 1, left five H-tier fields null pending a "TLS
certificate expired on `assets.bose.com`" retry, left `soundSignature`
unresolved because the RTINGS body "could not be fetched", and ended with an
"Independent verification pass — Not yet run" section. All three of those
positions are superseded:

- The second independent verification pass is dropped by the same-day
  product-owner direction; sourcing and CMS patching are one pass.
- The RTINGS review data **is** retrievable (embedded in the raw HTML payload;
  the earlier attempt's text extractor only surfaced nav/header). Both models
  now have a Tier-3 `soundSignature`.
- The TLS-blocked manual PDF was not needed: the live manufacturer product page
  is a Tier-1 source in its own right and carries the specification table used
  above. The remaining H-tier nulls are genuine "manufacturer does not publish
  it", not access-blocked retries.

to this field — it is a spatial-audio-mode figure, not an ANC-off figure. The
mapping is documented in the citation quote rather than silently collapsed.
This differs from `sourcing-protocol-headphones.md`'s assumption that the ANC
toggle is the natural split variable; see Design gaps below.

return no body text to a non-browser fetch — the product page was used instead
as the manufacturer Tier-1 source. The earlier draft on this issue reported an
`assets.bose.com` PDF TLS failure and an unfetchable RTINGS page; both are
resolved by this pass (the RTINGS review data is present in the raw HTML
payload even though a text extractor only returns nav/header).
