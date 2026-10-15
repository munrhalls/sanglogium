# Blueprint — filters & sorting — parity

## 1. Options ↔ inventory

- [ ] 1.1 Every offered filter value matches ≥1 product in that slice.
  Means: per slice, list options in `computeCatalogueFacets` output with count 0. Pass: empty. (Trivially true by construction if options are derived — the real assertion is the next one.)

- [ ] 1.2 No option appears that belongs only to another slice.
  Means: per slice, list facet groups present in the category's `FACETS`/`FILTER_FACETS` whose attribute is absent from every product in the slice. Pass: empty.

- [ ] 1.3 Every attribute distinguishing ≥2 products in a slice is offered as a filter.
  Means: per slice, list `filterAttributes` keys with ≥2 distinct values that have no entry in `FILTER_FACETS` (or the category's `FACETS`). Pass: empty — or each listed key is a stated dismissal.

## Gaps / dismissals

- **G2 (1.3):** "attribute distinguishing ≥2 products" needs the list of `filterAttributes` keys considered attributes — derived mechanically by scanning distinct keys across slice products; stated in the check itself.

*Groups 2–7 carry over from DoD docs 2–3; means not yet blueprinted.*
