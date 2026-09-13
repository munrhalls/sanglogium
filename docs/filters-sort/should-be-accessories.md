# Filter & Sort — Should-Be List for `/products/accessories`

**Scope: `/products/accessories` only.** This list excludes core electronics
(amplifier/DAC/speaker/turntable specs — owned by the
`/products/audio-electronics` should-be list) and headphone-specific fit
parts and cable termination when merchandised inside the
`/products/headphones` slice (owned by that should-be list's Product Category
parenthetical and Material Factors group). This slice covers accessories sold
as their own product line: cables/interconnects, stands & isolation, racks &
furniture, power, cases, cleaning & maintenance, replacement parts, adapters,
and room acoustic treatment.

Determination of the filter and sort facets the `/products/accessories` slice
should offer. Built by auditing live filter panels and category structure at
Music Direct (Accessories, Record Care, and live filter URL parameters —
`custom_condition`, `custom_availability`, `custom_cable_termination`, brand,
price, specials — confirmed directly from a captured filtered-listing URL)
and Audio Advisor (Phono Cartridge Replacement Stylus, confirmed as its own
live category), cross-referenced against Apos Audio's cross-cutting attribute
conventions (Balanced, wall-mount, termination-adjacent tags), cross-checked
against Baymard Institute e-commerce filtering research. Grouping and
status-tag conventions kept consistent with `should-be-headphones.md` and
`should-be-audio-electronics.md`.

This document is the sole source of truth for the `/products/accessories`
filter/sort should-be list.

Decision record: `sang-logium-1xs.5` — [Filters] /products/accessories
should-be list determined

Status per item: **C** = confirmed live on ≥1 audited retailer. **R** =
recommended, approved this pass on strong adjacent evidence though not yet a
literal checkbox observed this pass.

Group order: Commercial → Type → Cables & Interconnects → Stands, Isolation &
Furniture → Power → Cleaning & Maintenance → Replacement Parts → Adapters &
Converters → Room Acoustic Treatment. Accessory Category (item 9) gates which
domain-specific group applies — a cable listing never shows record-cleaning
fluid options.

## Commercial

Not about the product — about whether, and how, to buy it.

1. **[C]** Brand
2. **[C]** Price — min–max range, optional coarse bands
3. **[R]** Customer Rating — 4★ & up, 3★ & up, etc.
4. **[R]** Awards / Recognition — "Stereophile Recommended," named awards
5. **[C]** Condition / Stock Type — New, Open-Box, Refurbished
6. **[C]** Availability / In Stock — In Stock Only toggle, Include Out of Stock
7. **[C]** Deals / Discount — On Sale, Clearance/Closeout
8. **[C]** New Arrivals — toggle / standing collection

## Type

External identity — what kind of accessory this is, and what it's for. Gates
every group below.

9. **[C]** Accessory Category — Cables & Interconnects, Stands & Isolation, Racks & Furniture, Power, Cases & Storage/Transport, Cleaning & Maintenance, Replacement Parts, Adapters & Converters, Room Acoustic Treatment
10. **[R]** Compatible Product Type — Headphone, Speaker, Turntable, Amplifier/Source, Universal/Any

## Cables & Interconnects

Domain-gated — exists only once Accessory Category (item 9) is Cables &
Interconnects. Covers source/speaker/power/digital cables sold as standalone
accessories; headphone-specific upgrade cables merchandised inside
`/products/headphones` are that slice's concern, not this group's.

11. **[R]** Cable Function — Interconnect (RCA/XLR), Speaker Cable, Digital (USB/Coaxial/Optical/AES-EBU/Ethernet), Power/Mains, Phono
12. **[C]** Termination / Connector Type — RCA, XLR, Banana Plug, Spade, BNC, 3.5mm, 2.5mm, 4.4mm, Mini-to-RCA — **critical filter**
13. **[R]** Length — range filter
14. **[R]** Conductor Material — Copper/OFC, Silver, Silver-Plated Copper
15. **[C]** Balanced / Unbalanced

## Stands, Isolation & Furniture

Domain-gated — exists only once Accessory Category (item 9) is Stands &
Isolation or Racks & Furniture.

16. **[C]** Furniture Type — Speaker Stand, Equipment Rack/Shelf, Isolation Platform/Feet/Pucks, Turntable Wall Shelf, Wall Mount
17. **[R]** Material — Wood, Metal, Acrylic, Composite/MDF
18. **[R]** Adjustable Height — Yes/No
19. **[R]** Weight / Load Capacity — range filter

## Power

Domain-gated — exists only once Accessory Category (item 9) is Power.

20. **[R]** Power Product Type — Conditioner, Surge Protector, Power Distributor, Battery/UPS Backup, Power Cable
21. **[R]** Outlet Count — range filter
22. **[C]** Connector / Plug Type — NEMA 5-15, IEC C13/C15, 20-Amp

## Cleaning & Maintenance

Domain-gated — exists only once Accessory Category (item 9) is Cleaning &
Maintenance.

23. **[C]** Product Type — Record Cleaning Fluid, Record Cleaning Machine, Stylus Brush/Cleaner, Carbon Fiber Brush, Anti-Static Gun, Demagnetizer, Screen/Lens Cloth
24. **[R]** Format Compatibility — Vinyl, CD, Stylus/Cartridge, Optical Lens

## Replacement Parts

Domain-gated — exists only once Accessory Category (item 9) is Replacement
Parts.

25. **[C]** Part Type — Ear Pads/Cushions, Ear Tips, Phono Cartridge/Stylus, Drive Belt, Remote Control, Dust Cover, Fuses, Vacuum Tubes/Valves
26. **[R]** Compatible Model / Brand — searchable/select exact-fit match — **critical filter**

## Adapters & Converters

Domain-gated — exists only once Accessory Category (item 9) is Adapters &
Converters.

27. **[R]** Adapter Function — Bluetooth Transmitter/Receiver, Headphone Impedance/Attenuator Adapter, Connector Adapter (3.5mm↔6.35mm, RCA↔XLR), Standalone Phono Preamp, USB DAC Dongle

## Room Acoustic Treatment

Domain-gated — exists only once Accessory Category (item 9) is Room Acoustic
Treatment.

28. **[R]** Treatment Type — Acoustic Panel, Bass Trap, Diffuser, Isolation Pad
29. **[R]** Mounting — Wall, Ceiling, Freestanding

## Sort Options

Observed baseline (confirmed, identical across every audited retailer and
matching `/products/headphones` and `/products/audio-electronics`): Featured ·
Most Relevant · Best Selling · Alphabetical A→Z / Z→A · Price Low→High /
High→Low · Date Old→New / New→Old.

Approved additions: Customer Rating High→Low (weight by count, not average
alone); % Discount biggest-first (once a Sale/Clearance filter is active).

Never default to Alphabetical sort.

## What Not to Filter On

Core electronic specs (wattage, sample rate, driver type, amplifier class) —
owned by the `/products/audio-electronics` should-be list. Headphone-specific
ear-pad/tip material and cable termination when sold as part of a headphone
listing — owned by the `/products/headphones` should-be list; this slice's
Cables group and Replacement Parts group cover the standalone-accessory sale
of adjacent items (e.g. generic ear tips, generic upgrade cables) without
duplicating headphone-listing-page facets. Any attribute not actually
displayed on the category's list items — no cross-category bleed-through
(e.g. no record-cleaning-fluid filter showing while browsing cables).

## Out of Scope for This Document

Final enum vocabularies, schema/field design, UI component design, control
type per facet, progressive-disclosure wiring, and all implementation — this
is the should-be list only. Also out of scope: the `/products/headphones` and
`/products/audio-electronics` slices, each with their own should-be
determination.
