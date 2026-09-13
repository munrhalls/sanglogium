# Sourced filter attributes — Final Audio (`sang-logium-1xs.9.15`)

Product: **Final Audio ZE8000** — Sanity `_id` `moXlkADK7m1DHgGwWx071u`.
Scope is the **original ZE8000**, not the ZE8000 Mk2 (the Mk2 is a separate
product page and a separate SKU).

Migration spec: `sanity-cms/utils/migrations/headphonesFilterAttributes/products/final-ze8000.mjs`.

## Product class

True-wireless in-ear (TWS). That determines which schema fields are
*not applicable* vs. genuinely *unsourced* — a distinction the protocol's
null-is-a-last-resort rule does not overrule, since a cable-termination value
for a cable-less product is not a value anyone failed to find.

## Field table

| Field | Value | Basis |
|---|---|---|
| `productCategory` | `["true-wireless"]` | Final's own ZE Series wireless-earphone product page. |
| `wearingStyle` | `["in-ear"]` | Earphone form factor; Audio46 classifies it "In-Ear Headphones". |
| `acousticDesign` | `null` | Field vocab (`open-back`/`closed-back`/`semi-open`) is over-ear-oriented — not applicable to a TWS IEM. |
| `fitType` | `"universal"` | Supplied silicone earpieces in 5 sizes (SS/S/M/L/LL); no custom-fit option. |
| `connectivity` | `"true-wireless"` | Bluetooth 5.2; no wired input supplied or accepted. |
| `portable` | `true` | Charging-case TWS, IPX4, marketed for "sport and active lifestyles". |
| `soundSignature` | `null` | Exhausted Tier 3 — see below. |
| `impedanceOhms` | `null` | Exhausted — see below. |
| `sensitivityDbMw` | `null` | Exhausted — see below. |
| `freqResponseHz` | `null` | Exhausted — see below. |
| `microphone` | `true` | MEMS mics with beamforming for calls. |
| `cableTermination` | `null` | Not applicable — true-wireless, no cable. |
| `detachableCable` | `null` | Not applicable — true-wireless, no cable. |
| `cableLengthM` | `null` | Not applicable — schema itself says "Null when not applicable (e.g. true-wireless)". |
| `foldable` | `null` | Not applicable — no folding hinge on an earbud. |
| `ipxRating` | `"IPX4"` | Manufacturer spec block. |
| `bluetoothCodecs` | `["SBC","AAC","aptX","aptX Adaptive"]` | Manufacturer spec block. |
| `anc` | `"anc"` | Manufacturer states noise cancelling; ANC + ambient modes. |
| `batteryLifeHours` | `{ancOff: 5, ancOn: 5}` | 5 h continuous playback, 15 h with case. |
| `driverType` | `["dynamic"]` | "13mm equivalent ultra-low distortion dynamic driver … for 8K SOUND". |
| `awards` | `null` | No award citation found for this SKU. |
| `driverConfigBucket` | `"single-dynamic"` | One dynamic driver per earbud. |
| `driverConfigDetail` | `"1DD"` | Derived from the same source as the bucket (D-tier, no own citation). |

## Tier-1 source situation (why three H-tier fields are null)

Final's own ZE8000 page is the authoritative Tier-1 source
(`https://final-inc.com/products/ze8000-jp` — the live canonical product page;
the archived copy used during sourcing was byte-compared against it and the
spec block is identical). Its whole spec block is **five lines**:

- communication format — Bluetooth® 5.2
- codecs — SBC, AAC, Qualcomm aptX™, aptX™ Adaptive
- continuous music playback — up to 5 h / 15 h with case; 45 min from a 5-min charge
- charging time — ~1.5 h buds / ~2 h case
- water resistance — IPX4

There is **no impedance line, no sensitivity line and no frequency-response
line**. The downloadable owner's manual was opened and read in full; it
contains no spec table at all. The EN and JP manufacturer pages carry the same
five-line table. The independent retailer that does publish a fuller spec table
(Audio46) reproduces the *same* five manufacturer lines plus a driver line,
and likewise publishes no impedance, sensitivity or FR figure.

The driver line **does** exist — on the manufacturer page, in its feature copy
rather than the spec table: 「超高精度＆超低歪ドライバー「f-CORE for 8K SOUND」搭載 …
完全ワイヤレスイヤホンでは異例の直径13mm相当の大口径振動板」 ("ultra-high-precision,
ultra-low-distortion driver f-CORE for 8K SOUND … an unusually large 13 mm-equivalent
diaphragm for a true-wireless earphone"). Audio46 renders the same figure in
English as "13mm equivalent ultra-low distortion dynamic driver". That is the
basis for `driverType: ["dynamic"]` and `driverConfigBucket: "single-dynamic"`.

Conclusion: `impedanceOhms`, `sensitivityDbMw` and `freqResponseHz` are
**exhausted nulls** under the protocol's widened tier order (manufacturer page
→ manual → press release → measurement lab → attributed tech press), not early
stops.

## Tier-3 (soundSignature) audit

The protocol restricts Tier 3 to three methodology-published measurement
sources and states plainly that if none has measured the product, Sound
Signature is `null` and is never inferred from marketing copy. All three were
audited on 2026-09-13:

| Source | Method of audit | Result |
|---|---|---|
| Crinacle | rankings list, graphs, and individual review posts | No ZE8000 entry. |
| Audio Science Review | review index + on-site search | No ZE8000 measurement. |
| Rtings | review sitemap + on-site search | Final Audio not reviewed at all. |

There is no Tier-3 fallback in the protocol. Retailer prose and Final's own
"8K Sound" copy are explicitly disqualified both as a source ("never
manufacturer marketing copy alone") and as a derivation basis (the label must
come from a measured response curve, not a reviewer's adjective). Final's
customer reviews on its own page are enthusiast claims with no lab attribution,
which the protocol also disqualifies at any tier.

→ `soundSignature: null`, recorded with an `editorial`-tier citation naming the
exhausted search rather than a URL that produced a value.

## Flagged schema observations

- `batteryLifeHours.{ancOff,ancOn}` cannot express a third number; Final
  publishes only one playback figure (5 h) plus a case figure (15 h), so the
  case-inclusive number is not representable. Both keys were set to the same
  5 h single-bud figure rather than inventing an ANC-off differential, since
  Final publishes no per-mode split. This mirrors the same gap flagged on
  `focal-bathys.mjs`.
- `acousticDesign`, `cableTermination`, `detachableCable`, `cableLengthM` and
  `foldable` are all vocabulary-shaped for wired over-ear products. For TWS
  in-ears they carry no meaning. Whether the eventual UI should hide these
  facets (rather than receive `null` and match nothing) is a consumption-side
  question for `sang-logium-1xs.3`, not a sourcing one.
