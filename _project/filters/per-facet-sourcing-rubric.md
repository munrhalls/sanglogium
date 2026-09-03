# Per-facet Sourcing Rubric

D0 deliverable for `sang-logium-u8w.1` — first layer of the Filter Attribute Sourcing epic.

## Canonical map reference

This rubric is downstream of `sang-logium-ylz.1` L0. The closed vocabularies below are copied verbatim from `_project/filters/facet-map.json`. If that map changes, this rubric must be regenerated from it. This file does not invent or redefine any option.

## Out of scope & sequence

- **In scope:** defining, per facet, how a value is decided and from where.
- **Out of scope:** collecting any product values (D2), deciding which products a facet applies to (D1).
- **Sequence:** first layer; blocks `sang-logium-u8w.2` (product x facet applicability matrix).

## Global sourcing rules

1. **No free-text values.** Every value stored in `filterAttributes` must be one of the closed-vocabulary options listed below.
2. **No inferred or guessed values.** If the authoritative sources do not state the value explicitly, put the product/facet pair in the unresolved queue (D3). Do not fill it with a placeholder.
3. **Source URL required.** For every non-N/A value the data sheet must cite the exact URL and the quoted phrase that produced the value.
4. **Conflict resolution.** If two sources disagree, prefer the higher-ranked source in the facet's source order.
5. **N/A means unset.** A facet that does not apply to a product is left empty in `filterAttributes`. The D1 matrix decides applicability; this rubric only decides how to source a value when one is needed.

## Source authority ladder

### Attribute facets (Headphones, Audio Electronics, Accessories)

1. **Manufacturer spec page** — the brand's own product page, dedicated specs page, or technical documentation.
2. **Official manual** — PDF or web manual / quick-start guide distributed by the manufacturer.
3. **Distributor datasheet** — product page or PDF from an authorized distributor (e.g. B&H, Sweetwater, local Polish distributor). Only use when #1 and #2 are silent.

### Universal facets

These are derived from internal catalogue data, not from manufacturer pages.

- **Price** — `product.price_data.unit_amount` (cents).
- **Brand** — `product.brand` reference, stored as the brand slug.
- **Availability** — `product.stock > 0`.
- **Category** — the root title from `catalogueLocationKeys`, mapped to the canonical slug.

## Per-facet rubric

| Facet | Field | Type | Categories | URL param | Closed vocabulary | Source order | Normalization rule & example |
|-------|-------|------|------------|-----------|-------------------|--------------|------------------------------|
| **Price** | `filterAttributes.price` | range | `*` | `price` | `min`, `max` (range boundaries) | Internal price data | None; use `price_data.unit_amount` in cents. |
| **Brand** | `filterAttributes.brand` | multi | `*` | `brand` | `<brand-slug>` (from the brand document) | Brand reference | Use the existing brand document slug; do not create new slugs. Example: `Sennheiser` → `sennheiser`. |
| **Availability** | `filterAttributes.inStock` | boolean | `*` | `inStock` | `true`, `false` | Stock field | `product.stock > 0` → `true`; otherwise `false`. |
| **Category** | `filterAttributes.category` | multi | `all-products` | `category` | `headphones`, `audio-electronics`, `accessories` | Catalogue location | Map root category title to slug: `Headphones` → `headphones`, `Audio Electronics` → `audio-electronics`, `Accessories` → `accessories`. |
| **Wearing style** | `filterAttributes.wearingStyle` | enum | `headphones` | `wearingStyle` | `over-ear`, `on-ear`, `in-ear` | Manufacturer spec page → Official manual → Distributor datasheet | Map common synonyms to canonical slug. Example: `circumaural` → `over-ear`; `supra-aural` → `on-ear`; `IEM / in-ear monitor / earbud` → `in-ear`. |
| **Back design** | `filterAttributes.backDesign` | enum | `headphones` | `backDesign` | `open`, `closed`, `semi-open` | Manufacturer spec page → Official manual → Distributor datasheet | Map phrase variants to canonical. Example: `open-back / open acoustic` → `open`; `closed-back / sealed` → `closed`; `semi-open / semi-closed / vented` → `semi-open`. IEMs are not applicable (D1). |
| **Driver type** | `filterAttributes.driverType` | enum | `headphones` | `driverType` | `dynamic`, `planar-magnetic`, `electrostatic`, `balanced-armature`, `hybrid` | Manufacturer spec page → Official manual → Distributor datasheet | If more than one driver technology is used, use `hybrid`. Example: `10 mm dynamic + 4 balanced armatures` → `hybrid`; `single 50 mm dynamic` → `dynamic`; `planar magnetic` → `planar-magnetic`; `electrostatic` → `electrostatic`; `BA / balanced armature` → `balanced-armature`. |
| **Connectivity** | `filterAttributes.connectivity` | enum | `headphones` | `connectivity` | `wired`, `wireless` | Manufacturer spec page → Official manual → Distributor datasheet | If the source lists both wired and wireless capability, prefer `wireless` when Bluetooth is a supported primary mode. Example: `Bluetooth 5.2 with wired backup` → `wireless`; `3.5 mm wired only` → `wired`. |
| **Connector / plug** | `filterAttributes.connector` | multi | `headphones` | `connector` | `3.5mm`, `6.35mm`, `4.4mm-balanced`, `4-pin-xlr`, `2.5mm`, `usb-c`, `mmcx`, `2-pin`, `fixed-cable` | Manufacturer spec page → Official manual → Distributor datasheet | Normalize connector variants. Example: `3.5 mm (1/8")` → `3.5mm`; `6.35 mm (1/4")` → `6.35mm`; `4.4 mm balanced` → `4.4mm-balanced`; `4-pin XLR` → `4-pin-xlr`; `USB Type-C` → `usb-c`; `MMCX` → `mmcx`; `0.78 mm 2-pin` → `2-pin`; `non-detachable / fixed` → `fixed-cable`. |
| **Microphone** | `filterAttributes.microphone` | boolean | `headphones` | `microphone` | `true`, `false` | Manufacturer spec page → Official manual → Distributor datasheet | Any unambiguous yes phrase → `true`; no phrase → `false`. Example: `built-in microphone / inline mic` → `true`; `no microphone` → `false`. |
| **Noise cancelling** | `filterAttributes.noiseCancelling` | boolean | `headphones` | `noiseCancelling` | `true`, `false` | Manufacturer spec page → Official manual → Distributor datasheet | Yes / no / supported / not supported. Example: `ANC / active noise cancellation` → `true`; `passive isolation only` → `false`. |
| **Requires amplifier** | `filterAttributes.requiresAmplifier` | boolean | `headphones` | `requiresAmplifier` | `true`, `false` | Manufacturer spec page → Official manual → Distributor datasheet | Use the manufacturer's explicit recommendation, not impedance/sensitivity math. Example: `requires dedicated headphone amplifier` → `true`; `easily driven from phones and laptops` → `false`. |
| **Device type** | `filterAttributes.deviceType` | enum | `audio-electronics` | `deviceType` | `headphone-amp`, `dac`, `dac-amp-combo`, `dongle-dac`, `dap`, `network-streamer` | Manufacturer spec page → Official manual → Distributor datasheet | Choose the single best description. Example: `USB-C DAC/amp stick` → `dongle-dac`; `portable player with built-in amp and DAC` → `dap`; `desktop DAC with headphone output` → `dac-amp-combo`; `DAC only, no amp` → `dac`; `headphone amplifier only` → `headphone-amp`; `Ethernet streaming transport` → `network-streamer`. |
| **Form factor** | `filterAttributes.formFactor` | enum | `audio-electronics` | `formFactor` | `desktop`, `portable`, `dongle` | Manufacturer spec page → Official manual → Distributor datasheet | Based on power / size. Example: `mains-powered chassis for desk use` → `desktop`; `battery-powered pocket unit` → `portable`; `USB-C/Lightning stick, no battery` → `dongle`. |
| **Amplification** | `filterAttributes.amplification` | enum | `audio-electronics` | `amplification` | `solid-state`, `tube`, `hybrid` | Manufacturer spec page → Official manual → Distributor datasheet | If both tube and solid-state stages are present, use `hybrid`. Example: `pure tube output stage` → `tube`; `transistor / Class A/B` → `solid-state`; `tube pre-amp + solid-state power amp` → `hybrid`. |
| **DAC included** | `filterAttributes.dacIncluded` | boolean | `audio-electronics` | `dacIncluded` | `true`, `false` | Manufacturer spec page → Official manual → Distributor datasheet | Yes if a DAC chip is part of the device. Example: `built-in AK4499 DAC` → `true`; `pure analogue headphone amplifier` → `false`. |
| **Balanced output** | `filterAttributes.balancedOutput` | boolean | `audio-electronics` | `balancedOutput` | `true`, `false` | Manufacturer spec page → Official manual → Distributor datasheet | Any balanced headphone output (4.4 mm, XLR, etc.) → `true`; single-ended only → `false`. |
| **Inputs** | `filterAttributes.inputs` | multi | `audio-electronics` | `inputs` | `usb`, `optical`, `coaxial`, `rca`, `bluetooth` | Manufacturer spec page → Official manual → Distributor datasheet | Normalize input names. Example: `USB Type-B / USB-C` → `usb`; `TOSLINK` → `optical`; `S/PDIF coaxial` → `coaxial`; `RCA line-in` → `rca`; `Bluetooth input` → `bluetooth`. A device can have multiple inputs. |
| **Outputs** | `filterAttributes.outputs` | multi | `audio-electronics` | `outputs` | `6.35mm`, `4.4mm`, `4-pin-xlr`, `rca-line-out` | Manufacturer spec page → Official manual → Distributor datasheet | Normalize output names. Example: `6.35 mm (1/4") headphone out` → `6.35mm`; `4.4 mm balanced out` → `4.4mm`; `4-pin XLR balanced` → `4-pin-xlr`; `RCA line-out / pre-out` → `rca-line-out`. A device can have multiple outputs. |
| **Accessory type** | `filterAttributes.accessoryType` | enum | `accessories` | `accessoryType` | `cable`, `adapter`, `interconnect`, `eartip`, `earpad`, `stand`, `case`, `care` | Manufacturer spec page → Official manual → Distributor datasheet | Map product type to canonical. Example: `replacement silicone tips` → `eartip`; `memory foam earpads` → `earpad`; `3.5 mm to 4.4 mm cable` → `cable`; `interconnect cable` → `interconnect`; `6.35 mm adapter` → `adapter`; `headphone stand` → `stand`; `hard carrying case` → `case`; `cleaning kit / care solution` → `care`. |
| **Connector / termination** | `filterAttributes.connectorTermination` | multi | `accessories` | `connectorTermination` | `3.5mm`, `6.35mm`, `4.4mm-balanced`, `4-pin-xlr`, `2.5mm`, `usb-c`, `mmcx`, `2-pin`, `fixed-cable` | Manufacturer spec page → Official manual → Distributor datasheet | Same normalization as **Connector / plug**. Identify both ends of the accessory. Example: `3.5 mm TRS → 4.4 mm balanced` → `3.5mm`, `4.4mm-balanced`; `MMCX → 2-pin 0.78 mm` → `mmcx`, `2-pin`. |
| **Compatibility** | `filterAttributes.compatibility` | multi | `accessories` | `compatibility` | `<compatible-model>` (slugs of products this accessory fits) | Manufacturer spec page → Official manual → Distributor datasheet | Extract the model names the manufacturer says the accessory fits, then slugify them. Example: `compatible with HD 600 and HD 650` → `hd-600`, `hd-650`. |

## Facet value checklist

For every row above:

- The **closed vocabulary** matches `_project/filters/facet-map.json` exactly.
- The **source order** is stated.
- A **normalization example** is provided.

Any facet whose value cannot be sourced from the stated order goes to the unresolved-value queue (`sang-logium-u8w.4`).
