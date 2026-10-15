# Wholeness — filters & sorting

## Catalogue data (mission 01, proven)
- 0 orphan products
- per slice, 0 products that don't belong
- 0 duplicates
- catalogue status readout

## Filter/sorting controls — semantically accurate
- universal: every control makes sense on every slice it appears on
- per slice: 0 controls that don't belong to that slice's theme
- per control: 0 options that aren't a real, understandable choice for that theme
- 0 controls or options whose label could confuse the end user
- surface read: controls are defined per top-level category (headphones, audio-electronics, accessories), shared by all its sub-slices; the sidebar hides options with 0 products in the slice and groups with nothing selectable



## Option values — clean
- one real-world value = one option, no spelling variants
- one casing style across labels
- one unit expression per unit type
- every label accurate, correctly spelled, jargon-free



## Option order — meaningful
- brands alphabetical
- numeric specs numeric
- ranked values in natural order



## Slices agree (coherence)
- universal controls identical across slices
- no slice option duplicates or clashes with a universal one



## Sorts
- exactly the offered set, same on every surface
- every sort backed by a real product field

## Price range
- range ends = real lowest/highest price in the slice

## Selection correctness (mission 03)
- any filter combo returns exactly the qualifying products
- values in one group widen (OR); across groups narrow (AND)
- every offered option matches ≥1 product; nothing offered that only another slice has
- option counts = what selecting them would return

## Sort correctness (mission 03)
- each sort orders by what it says
- ties deterministic; missing-attribute products last
- name sort case-insensitive, natural model order

## Independence & paging (mission 03)
- sort never changes the result set; filter never resets sort
- every result reachable through pages; none on two pages; last page unmistakable


