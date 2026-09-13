# Filter & Sort — Should-Be List for `/products/audio-electronics`

**Scope: `/products/audio-electronics` only.** This list excludes anything
already owned by the `/products/headphones` should-be list (driver type,
acoustic design, ANC, ear-tip/pad fit, headphone cable termination, DAPs) and
anything owned by the `/products/accessories` should-be list (standalone
cables, stands, isolation, power, cleaning, replacement parts). Those are
separate catalogue slices with their own should-be determinations.

**Loudspeakers are out of scope entirely.** This catalogue does not carry
loudspeakers, subwoofers, or soundbars as a product line — there is no
Loudspeakers group in this document, and no speaker-format values anywhere
below. Amplification and source components that merely *drive* speakers
(integrated amps, AV receivers, preamps) remain in scope on their own terms.

Determination of the filter and sort facets the `/products/audio-electronics`
slice should offer. Built by auditing live filter panels at Apos Audio and
Upscale Audio (both fully rendered and confirmed: brand, condition, product
type/category, and a large cross-cutting attribute set), cross-referenced
against Music Direct's live filter URL parameters and category structure,
cross-checked against Baymard Institute e-commerce filtering research and
standard audio engineering references. Crutchfield and B&H were targeted for
their unusually granular AV filtering but blocked automated access; their
confirmed facets could not be captured this pass — items sourced from general
industry knowledge rather than a literal live checkbox are marked **R**, not
**C**. Grouping and status-tag conventions kept consistent with
`should-be-headphones.md`.

This document is the sole source of truth for the `/products/audio-electronics`
filter/sort should-be list.

Decision record: `sang-logium-1xs.4` — [Filters] /products/audio-electronics
should-be list determined

Status per item: **C** = confirmed live on ≥1 audited retailer. **R** =
recommended, approved this pass on strong adjacent evidence though not yet a
literal checkbox observed this pass.

Group order: Commercial → Type → Amplification → Digital Source & Streaming →
Turntables & Vinyl → Connectivity & Wireless → Physical & Install Factors.
Product Category (item 9) gates which domain-specific group applies — an
amplifier's listing never shows turntable speed options, a turntable's
listing never shows channel-count options. No single flat technical-specs
bucket, because unlike headphones this slice spans several structurally
unrelated product types.

## Commercial

Not about the product — about whether, and how, to buy it.

1. **[C]** Brand
2. **[C]** Price — min–max range, optional coarse bands
3. **[R]** Customer Rating — 4★ & up, 3★ & up, etc.
4. **[R]** Awards / Recognition — "Award Winner," "Editor's Choice," named awards
5. **[C]** Condition / Stock Type — New, Open-Box, Blemished/B-Stock, Demo/Ex-Display, Used/Trade-In, Refurbished
6. **[C]** Availability / In Stock — In Stock Only toggle, Include Out of Stock, Preorder, Special/Custom Order
7. **[C]** Deals / Discount — On Sale, Clearance/Closeout
8. **[C]** New Arrivals — toggle / standing collection

## Type

External identity — what kind of component this is, independent of its
internal engineering. Gates every group below.

9. **[C]** Product Category — Integrated Amplifier, Power Amplifier, Preamplifier, AV/Surround Receiver, Stereo Receiver, DAC, Network Streamer, CD Player/Transport, Turntable
10. **[C]** Connectivity — Wired, Bluetooth, Wi-Fi/Networked, Wired+Wireless — gates the Connectivity & Wireless group below

## Amplification

Domain-gated — exists only once Product Category (item 9) is Integrated
Amplifier, Power Amplifier, Preamplifier, AV/Surround Receiver, or Stereo
Receiver.

11. **[C]** Amplifier Type — Integrated, Power, Preamplifier, AV/Surround Receiver, Stereo Receiver
12. **[C]** Amplifier Topology — Tube/Valve, Solid-State, Hybrid, Class D
13. **[R]** Power Output per Channel (W RMS) — range filter — **critical filter**
14. **[R]** Channel Count — 2.0, 2.1, 5.1, 7.1, 7.1.4, etc.
15. **[C]** Input Types — RCA, XLR/Balanced, Phono (MM/MC), Optical, Coaxial, USB, HDMI/eARC, Bluetooth, Ethernet/LAN
16. **[C]** Output Types — Speaker Terminals, Pre-Out (RCA/XLR), Headphone Jack, Subwoofer Out
17. **[C]** Built-in Phono Stage — Yes/No, MM/MC — **critical filter**
18. **[C]** 12V Trigger / Custom-Install Ready — Yes/No
19. **[C]** Remote Control Included — Yes/No

## Digital Source & Streaming

Domain-gated — exists only once Product Category (item 9) is DAC, Network
Streamer, or CD Player/Transport, or Connectivity (item 10) is Wi-Fi/Networked.

20. **[R]** Max Sample Rate / Bit Depth (PCM) — range filter
21. **[R]** DSD Support — None, DSD64, DSD128, DSD256+
22. **[R]** MQA / Hi-Res Audio Certification — Yes/No
23. **[C]** DAC Chipset Family — ESS Sabre, AKM, Cirrus Logic, R-2R/Ladder
24. **[C]** Streaming Platform Support — AirPlay 2, Chromecast built-in, Spotify Connect, TIDAL Connect, Roon Ready, DLNA
25. **[C]** Network Connection — Wi-Fi, Ethernet
26. **[C]** Digital Inputs — USB, Optical, Coaxial, I2S/IIS, AES/EBU

## Turntables & Vinyl

Domain-gated — exists only once Product Category (item 9) is Turntable.

27. **[R]** Drive Type — Belt-Drive, Direct-Drive, Idler-Wheel
28. **[R]** Operation — Manual, Automatic, Semi-Automatic
29. **[R]** Speeds Supported — 33⅓, 45, 78 RPM
30. **[C]** Built-in Phono Preamp — Yes/No — **critical filter**
31. **[R]** Cartridge Included — Yes/No; Type (MM/MC)
32. **[R]** USB / Digital Output (for digitizing vinyl) — Yes/No

## Connectivity & Wireless

Domain-gated — exists only once Connectivity (item 10) is Bluetooth,
Wi-Fi/Networked, or Wired+Wireless.

33. **[R]** Bluetooth Codec — SBC, AAC, aptX, aptX HD, LDAC
34. **[R]** Voice Assistant Built-in — Alexa, Google Assistant
35. **[R]** Multiroom Support — Yes/No

## Physical & Install Factors

Internal but tangible — how the piece sits in a room.

36. **[R]** Finish / Color
37. **[R]** Rack-Mountable (19") — Yes/No
38. **[R]** Country of Manufacture

## Sort Options

Observed baseline (confirmed, identical across every audited retailer and
matching `/products/headphones`): Featured · Most Relevant · Best Selling ·
Alphabetical A→Z / Z→A · Price Low→High / High→Low · Date Old→New / New→Old.

Approved additions: Customer Rating High→Low (weight by count, not average
alone); % Discount biggest-first (once a Sale/Clearance filter is active).

Never default to Alphabetical sort.

## What Not to Filter On

Loudspeaker, subwoofer, and soundbar attributes (impedance, sensitivity,
power handling, driver size, number of ways, recommended room size, speaker
format) — out of scope entirely; this catalogue does not carry loudspeakers
as a product line. Headphone-specific attributes (driver type, acoustic
design, ANC, ear-tip/pad fit, headphone cable termination) — owned by the
`/products/headphones` should-be list, not duplicated here. Accessory-specific
attributes (standalone cable gauge/termination, isolation-platform material,
stand height) — owned by the `/products/accessories` should-be list.
Weight/dimensions as a standalone filter — not a decision axis at this tier.
Internal component marketing terms (e.g. "Gallium Nitride," specific
capacitor brands) — spec-sheet trivia, not a customer-facing decision axis.
Any attribute not actually displayed on the category's list items — no
cross-category bleed-through (e.g. no turntable speed filter showing while
browsing amplifiers).

## Out of Scope for This Document

Final enum vocabularies, schema/field design, UI component design, control
type per facet, progressive-disclosure wiring, and all implementation — this
is the should-be list only. Also out of scope: the `/products/headphones` and
`/products/accessories` slices, each with their own should-be determination,
and loudspeakers/subwoofers/soundbars, which this catalogue does not carry.
