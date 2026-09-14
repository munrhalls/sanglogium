# Audio-electronics `filterAttributes` schema blueprint

D0 deliverable for `sang-logium-1xs.13.1` (Adapt Sanity audio-electronics
filterAttributes schema). Unlike accessories, no schema edit exists yet for
this slice — this doc is the plan the edit will follow, checked field-by-
field against `should-be-audio-electronics.md`.

**Scope, same as the accessories blueprint:** this is about whether the
schema can *house* the should-be shape. No existing product data, no
migration script, no sourcing — those are separate, later concerns.

**Status: schema edit applied (uncommitted) to `productType.ts`. Decisions 1
and 2 below are resolved and implemented; the should-be-doc redundancy is
resolved by merging into one field. Two known limitations are flagged at the
bottom, not solved.**

## Existing fields today (`categories: ["audio-electronics"]`)

`deviceType`, `formFactor`, `amplification`, `dacIncluded`, `balancedOutput`,
`inputs`, `outputs`. These were built for a narrower scope (portable
headphone-amp/DAC/dongle gear) than `should-be-audio-electronics.md` now
defines (full-size amps, receivers, DACs, streamers, CD players,
turntables — the should-be doc explicitly excludes DAPs and headphone amps
aren't in its Product Category list at all). That mismatch is the source of
the two decisions below.

## Decision 1: what gates the whole slice (item 9, Product Category)

`should-be-audio-electronics.md` item 9 needs a single field whose value is
one of: Integrated Amplifier, Power Amplifier, Preamplifier, AV/Surround
Receiver, Stereo Receiver, DAC, Network Streamer, CD Player/Transport,
Turntable — it gates every domain-specific group below, the same role
`accessoryType` plays for accessories.

`deviceType` already exists, is audio-electronics-only, and is structurally
the right shape (single gating string) — but its current vocab
(`headphone-amp`, `dac`, `dac-amp-combo`, `dongle-dac`, `dap`,
`network-streamer`) doesn't match the target list; `dap` and `headphone-amp`
in particular fall outside this slice's scope per the should-be doc's own
exclusions.

**Resolved — applied.** `deviceType` repurposed: title changed to "Product
category", vocab replaced with the target's 9 values
(`integrated-amplifier`, `power-amplifier`, `preamplifier`,
`av-surround-receiver`, `stereo-receiver`, `dac`, `network-streamer`,
`cd-player-transport`, `turntable`). Field key unchanged, same pattern as
`accessoryType`'s vocab rename.

This also required generalizing the shared domain-gating mechanism in
`productType.ts`'s field-mapping code: it previously hardcoded
`filterAttributes.accessoryType` as the only possible gate field. It now
reads a `domainField` property (defaulting to `accessoryType` for backward
compat) so a field can gate off `deviceType` or the new
`deviceConnectivity` field instead. This was necessary, not optional — an
audio-electronics product needs two independent gate axes (what kind of
device it is, and how it connects), which the old single-field-only
mechanism couldn't express.

## Decision 2: `outputs` vocab is shaped wrong for its target

Current vocab (`6.35mm`, `4.4mm`, `4-pin-xlr`, `rca-line-out`) is
headphone-output-jack-shaped. Target item 16 (Output Types) wants
**Speaker Terminals, Pre-Out (RCA/XLR), Headphone Jack, Subwoofer Out** —
a different, coarser taxonomy.

**Resolved — applied.** Vocab replaced with 5 values: `speaker-terminals`,
`pre-out-rca`, `pre-out-xlr` (split rather than one combined value, for
consistency with how the rest of the schema splits connector types),
`headphone-jack`, `subwoofer-out`. Domain-gated to the 5 amplifier-type
`deviceType` values.

## should-be-doc redundancy worth a quick read, not a schema decision

Item 9 (Product Category) already includes the 5 amplifier sub-types as
values; item 11 (Amplifier Type) restates the same 5 values inside the
Amplification group. Similarly item 15 (Input Types) and item 26 (Digital
Inputs) overlap (USB/Optical/Coaxial appear in both).

**Resolved, per explicit instruction: no restated field.** Checked and
confirmed both are the same redundancy, not two different facts:

- No separate `amplifierType` field was created — `deviceType` (Product
  Category) already carries the amp sub-type value; the Amplification
  group's fields don't need to restate it.
- Item 15 and item 26 were merged into one field: `inputs`' vocab is now
  the union of both lists (adds `xlr-balanced`, `phono-mm-mc`,
  `hdmi-earc`, `ethernet-lan`, `i2s-iis`, `aes-ebu` to the existing
  `usb`/`optical`/`coaxial`/`rca`/`bluetooth`), domain-gated across both
  the 5 amp-type values and the 3 digital-source-type values — both
  groups share the same gate field (`deviceType`), so one field with a
  wider `domain` array covers both without recording the same fact twice.
  No separate `digitalInputs` field exists.

## Fields to reuse by extending `categories` (no new field, no duplication)

These already exist for other slices with the same meaning — extend
`categories` to include `"audio-electronics"` rather than create
duplicates:

| should-be item | Existing field | Current categories |
|---|---|---|
| 4 Awards / Recognition | `awards` | `["headphones", "accessories"]` |
| 3 Customer Rating | `customerRating` | `["accessories"]` |
| 5 Condition / Stock Type | `condition` | `["accessories"]` |
| 7 Deals / Discount | `dealsDiscount` | `["accessories"]` |
| 8 New Arrivals | `newArrival` | `["accessories"]` |
| 33 Bluetooth Codec | `bluetoothCodecs` | `["headphones"]` — vocab has `aptX Adaptive`/`aptX LL`/`LC3`, target wants `aptX HD` too; vocab extension needed alongside the category extension |

Item 6 (Availability) is out of scope again, same reasoning as accessories
— inventory-level, not `filterAttributes`.

## New fields needed (no existing equivalent, pure additions)

Grouped by should-be section, domain-gated on the outcome of Decision 1:

**Type (ungated):** Connectivity (item 10 — gates the Connectivity &
Wireless group; Wired / Bluetooth / Wi-Fi-Networked / Wired+Wireless).

**Amplification** (domain: amp-type Product Category values): Power Output
per Channel (W RMS, critical filter), Channel Count, Built-in Phono Stage
(critical filter), 12V Trigger, Remote Control Included. Plus `inputs`
vocab needs extending (add XLR/Balanced, Phono MM/MC, HDMI/eARC,
Ethernet/LAN) and `amplification` vocab needs extending (add Class D) —
both are additions to existing fields, not redesigns.

**Digital Source & Streaming** (domain: DAC/Network Streamer/CD
Player/Transport, or Connectivity = Wi-Fi): Max Sample Rate/Bit Depth, DSD
Support, MQA/Hi-Res Certification, DAC Chipset Family, Streaming Platform
Support, Network Connection, Digital Inputs (see redundancy note above
before building this one separately from `inputs`).

**Turntables & Vinyl** (domain: Turntable): Drive Type, Operation, Speeds
Supported, Built-in Phono Preamp (critical filter — distinct field from
Amplification's Built-in Phono Stage, different domain, don't collide the
two names), Cartridge Included, USB/Digital Output.

**Connectivity & Wireless** (domain: Connectivity = Bluetooth/Wi-Fi/
Wired+Wireless): Voice Assistant Built-in, Multiroom Support (Bluetooth
Codec is the reuse above, not new).

**Physical & Install Factors** (ungated): Finish/Color, Rack-Mountable
(19"), Country of Manufacture.

## Citation shape

Reuses the shared `sourcing` array (already `categories: ["headphones",
"accessories"]`) — extend its categories to include `"audio-electronics"`
too. No new citation shape needed, per `sang-logium-1xs.12`'s generalized
protocol, same as accessories.

## Completeness check (post-edit verification, all 38 items accounted for)

Confirmed against the committed schema, not assumed:

| Items | Resolution |
|---|---|
| 1, 2, 6 (Brand, Price, Availability) | Out of `filterAttributes` scope, same as accessories/headphones |
| 3, 4, 5, 7, 8 (Customer Rating, Awards, Condition, Deals, New Arrivals) | Reused fields, `categories` extended |
| 9 (Product Category) | `deviceType`, repurposed |
| 10 (Connectivity) | `deviceConnectivity`, new |
| 11 (Amplifier Type) | Merged into `deviceType` — no separate field, by design |
| 12–19 (Amplification group) | `amplification`, `powerOutputPerChannelW`, `channelCount`, `inputs`, `outputs`, `phonoStageBuiltIn`, `trigger12v`, `remoteControlIncluded` |
| 20–26 (Digital Source group) | `maxSampleRateBitDepth`, `dsdSupport`, `hiResCertification`, `dacChipsetFamily`, `streamingPlatformSupport`, `networkConnection`; item 26 merged into `inputs` |
| 27–32 (Turntables group) | `driveType`, `turntableOperation`, `speedsSupported`, `phonoPreampBuiltIn`, `cartridgeIncluded`, `usbDigitalOutput` |
| 33–35 (Connectivity & Wireless) | `bluetoothCodecs` (reused), `voiceAssistant`, `multiroomSupport` |
| 36–38 (Physical & Install) | `finishColor`, `rackMountable19`, `countryOfManufacture` |

All 33 fields confirmed present in the committed schema by direct grep, not inferred
from the edit history.

## Known limitations, flagged not solved

- **`bluetoothCodecs` is not domain-gated.** It's shared across headphones
  and audio-electronics (`categories` extended, vocab gained `aptX HD`),
  but headphones already used it ungated — adding `domain`/`domainField`
  to a field shared across two categories that use different gate-field
  conventions would silently break it for headphones (their gate field is
  `connectivity`, a different field with a different vocab, not
  `deviceConnectivity`). Left ungated for both, matching the existing
  convention this field already had. Net effect: it'll show on all
  audio-electronics products regardless of `deviceConnectivity` value,
  slightly looser than the should-be doc's implied gating.
- **The Digital Source & Streaming group only gates on `deviceType`, not
  the should-be doc's "OR Connectivity is Wi-Fi/Networked" clause.** A
  Stereo Receiver with built-in streaming (Connectivity =
  `wifi-networked`, but `deviceType` = `stereo-receiver`, not
  `network-streamer`) won't show the streaming fields, even though the
  should-be doc says it should. The current gating mechanism checks one
  field's value against one domain list; expressing "domain A OR domain
  B across two different gate fields" would need a real mechanism change,
  not a one-line fix — raised here rather than silently built without
  confirmation.

## Not yet done

Migration tooling and verification — same as accessories, out of scope for
this pass (no existing audio-electronics product data to migrate; sourcing
will populate these fields directly).
