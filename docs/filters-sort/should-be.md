o# Filter & Sort — Should-Be List for `/products/headphones`

**Scope: `/products/headphones` only.** This list is not for any other
catalogue slice (e.g. `/products/audio-electronics`). Other slices need their
own should-be determination, done separately.

Determination of the filter and sort facets the `/products/headphones` slice
should offer. Built by auditing live filter panels at real boutique
audiophile retailers (headphones.com, Bloom Audio, Linsoul, Apos, Moon Audio,
Audio46, MusicTeck), cross-checked against Baymard Institute e-commerce
filtering research and standard audiophile technical references.

This document is the sole source of truth for the `/products/headphones`
filter/sort should-be list. Any prior filter-sort documentation is stale and
superseded by this file.

Decision record: `sang-logium-1xs.1` — [Filters] /products/headphones should-be list determined

Status per item: **C** = confirmed live on ≥1 audited retailer. **R** =
recommended, approved this pass on strong adjacent evidence though not yet a
literal checkbox anywhere observed.

Group order: Commercial → Type → Sound Properties → Material Factors →
Wireless → Technical Specs. Sound Properties is its own group — the
perceptual tuning description (Sound Signature) and the measured acoustics
that predict it (Impedance, Sensitivity, Frequency Response, the derived
Requires-Amplifier flag) live together, unified by "this is a fact about how
it sounds," not split by whether it renders as a checkbox or a slider.

## Commercial

Not about the product — about whether, and how, to buy it.

1. **[C]** Brand
2. **[C]** Price — min–max range, optional coarse bands
3. **[R]** Customer Rating — 4★ & up, 3★ & up, etc.
4. **[R]** Awards / Recognition — "Award Winner," "Editor's Choice," named awards
5. **[C]** Condition / Stock Type — New, Open-Box, Certified/Sealed B-Stock, Demo Unit, Used/Trade-In, Refurbished
6. **[C]** Availability / In Stock — In Stock Only toggle, Include Out of Stock, Preorder
7. **[C]** Deals / Discount — On Sale, Clearance
8. **[C]** New Arrivals — toggle / standing collection
9. **[C]** Preorder / Interest Check Status — In Stock, Preorder, Interest Check/Group Buy

**Scrapped:** Editorial Score / Critic Ranking (was previously "not yet
decided" — now dropped from the should-be list entirely).

## Type

External, experiential identity — how a shopper would describe what kind of
headphone this is, independent of how it's built inside or how it sounds.

10. **[C]** Product Category / Type — Over-Ear, IEM, On-Ear, True Wireless (+ Amps/DACs/Cables/DAPs if carried)
11. **[C]** Wearing Style / Form Factor — Over-Ear, On-Ear, In-Ear
12. **[C]** Acoustic Design — Open-Back, Closed-Back, Semi-Open/Hybrid
13. **[R]** Fit Type (IEM) — Universal Fit, Custom Fit (CIEM)
14. **[C]** Connectivity — Wired, Wireless (Bluetooth), True Wireless, Hybrid — gates the Wireless group below
15. **[C]** Portable / Desktop — the use-case claim; the physical hinge fact (Foldable) lives in Material Factors, item 25

## Sound Properties

Everything that's a fact about how it sounds — perceptual tuning and the
measured acoustics that predict it, together.

16. **[R]** Sound Signature / Tonal Preference — Neutral, Warm, Bright/Analytical, Dark, V-Shaped, Basshead, Mid-Forward, Harman-target-like
17. **[R]** Impedance — range filter, roughly <32 Ω / 32–150 Ω / 150 Ω+ — **critical filter**
18. **[R]** Sensitivity — range filter, dB SPL/mW — **critical filter**
19. **[R]** Frequency Response Range — range filter in Hz (e.g. 20Hz–20kHz)
20. **[C]** Requires Amplifier (derived Yes/No flag from 17+18) — **critical filter**

## Material Factors

Internal, but tangible — physical construction and hardware-presence facts.

21. **[C]** Microphone / Call Support — Yes/No
22. **[C]** Cable / Termination Connector — 3.5mm SE, 2.5mm bal., 4.4mm bal., 4-pin XLR, 6.35mm
23. **[C]** Detachable / Upgradeable Cable — Yes/No
24. **[R]** Cable Length — range filter in meters/feet
25. **[C]** Foldable — Yes/No (the hinge fact, split from item 15's use-case claim)
26. **[R]** Water / Sweat Resistance (IPX) — None, IPX4, IPX5, IPX7, IP67

## Wireless

Domain-gated — exists only once Connectivity (item 14) is Wireless.

27. **[C]** Bluetooth Codec — SBC, AAC, aptX, aptX HD, aptX Adaptive, LDAC, LC3
28. **[C]** Active Noise Cancelling (ANC) — ANC, Passive Isolation Only, None/Open
29. **[R]** Battery Life — range filter in hours, ANC-on/ANC-off shown separately where available

## Technical Specs

Internal and categorical — engineering architecture.

30. **[C]** Driver Type — Dynamic, Planar Magnetic, Electrostatic, Balanced Armature, AMT/Ribbon, Bone Conduction, Electret, Hybrid
31. **[R]** Driver Configuration / Count (IEM) — Single Dynamic, Single BA, Multi-BA, Hybrid, Tribrid. Default-visible within the Technical Specs group — not collapsed under an "advanced" tab.

## Sort Options

Observed baseline (confirmed): Featured · Most Relevant · Best Selling ·
Alphabetical A→Z / Z→A · Price Low→High / High→Low · Date Old→New / New→Old.

Approved additions: Customer Rating High→Low (weight by count, not average
alone); % Discount biggest-first (once a Sale/Clearance filter is active).

Never default to Alphabetical sort.

## What Not to Filter On

Editorial Score / Critic Ranking (scrapped, see Commercial section); weight/
clamping force/cup dimensions; country of manufacture; any attribute not
actually displayed on the category's list items (no cross-category
bleed-through, e.g. no source-gear-only attributes leaking into the
headphone panel).

## Out of Scope for This Document

Final enum vocabularies, schema/field design, UI component design, control
type per facet, progressive-disclosure wiring, and all implementation — this
is the should-be list only.
