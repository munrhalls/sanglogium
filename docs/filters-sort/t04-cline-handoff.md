# Handoff: sang-logium-t04 — facet-map sync

**For: cline (deepseek). Mechanical rename task, not a design task — every
decision below is already made. If you find yourself deciding a new field
name or vocabulary value, stop and ask; that means this brief is missing
something, not that you should improvise.**

## What's wrong

`lib/catalogue/facetMap.ts` and `_project/filters/facet-map.json` feed the
live `FilterSidebar` and `ActiveFilterChips` components on `/products/*`
(confirmed live, not POC — see imports in
`app/components/features/filters/{FilterSidebar,ActiveFilterChips}.tsx`).
Both files still reference headphones field names that were renamed in
schema commit `42f8ee16` and fully migrated in the live dataset on
2026-09-13. The facets are very likely returning zero matches right now.

## Exact rename (ground truth: `docs/filters-sort/headphones-filterattributes-migration.md`)

| Old field | New field | Old value | New value |
|---|---|---|---|
| `backDesign` | `acousticDesign` | `open` | `open-back` |
| | | `closed` | `closed-back` |
| | | `semi-open` | `semi-open` |
| `connector` | `cableTermination` | `2.5mm` | `2.5mm-balanced` |
| | | (all other values) | unchanged |
| `noiseCancelling` (boolean) | `anc` (string enum) | `true` | `"anc"` |
| | | `false` | `"passive"` or `"none"` — see the doc's heuristic (depends on acousticDesign) |

## What to do

1. In both files, rename every `field: 'filterAttributes.backDesign'` →
   `'filterAttributes.acousticDesign'` (and the JSON equivalent), same for
   `connector` → `cableTermination`, `noiseCancelling` → `anc`. Also rename
   the matching `urlParam` values to match.
2. Update any hardcoded value lists / option arrays in these two files for
   the three renamed fields to the new vocab (see table above). Do not
   invent new option labels — copy them from the schema
   (`sanity-cms/schemaTypes/productType.ts`, search each field name) if the
   display list needs updating.
3. Leave every other field in both files untouched — `deviceType`,
   `accessoryType`, and everything else were not part of this rename.
4. Do not touch `sanity-cms/schemaTypes/productType.ts` — schema is already
   correct and committed.

## Verify (per CLAUDE.md — no build/lint/test commands)

- Diff `git diff lib/catalogue/facetMap.ts _project/filters/facet-map.json`
  and confirm only the 3 fields' keys/values changed, nothing else.
- Hand back to the human for the live `localhost:3000` check per this
  repo's Issue Risk Protocol — do not self-verify by starting a dev server.

## Acceptance criteria (from `sang-logium-t04`)

- `/products/headphones` filter sidebar's acoustic design, cable
  termination, and ANC facets show real options and return matching
  products.
- URL params for these filters use the new field names.
- Accessories/audio-electronics filters are unaffected.
