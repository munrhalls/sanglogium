# Diagram: Headphones facet structure

Source: `app/(test)/poc/filter-sort/headphones/lib/facetConfig.ts`, read
directly, 2026-09-15, after this session's edits. Facet counts per group
verified via `grep -oE "group: '[a-zA-Z]+'" ... | sort | uniq -c`.

```mermaid
graph TD
    ROOT["/products/headphones"]
    ROOT --> G1["Commercial (2 facets)<br/>brand, inStock"]
    ROOT --> G2["Type (6 facets)<br/>productCategory, wearingStyle, acousticDesign,<br/>fitType, connectivity, portable"]
    ROOT --> G3["Sound Properties (5 facets)<br/>soundSignature, impedance, sensitivity,<br/>bassExtension, requiresAmplifier"]
    ROOT --> G4["Material Factors (6 facets)<br/>microphone, cableTermination, detachableCable,<br/>cableLength, foldable, ipx"]
    ROOT --> G5["Wireless (3 facets)<br/>codec, anc, batteryLife"]
    ROOT --> G6["Technical Specs (2 facets)<br/>driverType, driverConfig"]
```

No group in this file has a `note` describing domain-gating. No
`visibleGroups` function exists in this file (checked via grep). All 6
groups render unconditionally in production as of 2026-09-15.

Bespoke controls not counted above (rendered directly by the panel, not
part of the `FACETS` array): Price, Customer Rating.
