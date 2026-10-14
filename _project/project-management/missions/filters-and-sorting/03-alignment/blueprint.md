# Blueprint — filters & sorting — alignment (product data ↔ options)

Products are the ground truth. Group 1: every offered option is backed by
product data. Group 2: every product is filterable by what is offered.

## 1. Options are backed by products (option → product)

- [ ] 1.1 Every offered filter value matches ≥1 product in that slice.
  Means: per slice, list options in `computeCatalogueFacets` output with
  count 0. Pass: empty.

- [ ] 1.2 No option appears in a slice whose products cannot carry it.
  Means: per slice, list facet entries whose attribute is absent from every
  product in the slice. Pass: empty.

- [ ] 1.3 A filter group shows only where the slice has ≥2 distinct values.
  Means: per slice, list configured facet groups where slice data has <2
  distinct values. Pass: empty (each is either a code fix or a stated dismissal).

- [ ] 1.4 Price range ends equal the real slice min/max.
  Means: per slice, query `min(price_data.unit_amount)` and `max(...)`; compare
  to the rendered range ends. Pass: equal.

- [ ] 1.5 Sort control shows only where the slice has ≥2 products.
  Means: list slices with <2 products. Pass: empty. (Rendering condition is UI;
  recorded as dismissal — see below.)

## 2. Products are filterable by the options (product → option)

- [ ] 2.1 Every attribute distinguishing ≥2 products is offered as a filter.
  Means: per slice, scan `filterAttributes` keys with ≥2 distinct values that
  have no entry in `FILTER_FACETS` / the category's `FACETS`. Pass: empty —
  or each listed key is a stated dismissal.

- [ ] 2.2 Zero unfilterable products where a facet applies.
  Means: per slice, per facet, count products missing a value for that facet's
  attribute — gated by the facet's relevance rule (e.g. `codec`, `anc`,
  `batteryLife` apply only where `connectivity !== 'wired'`; the rule per facet
  is stated in the check). Pass: 0 for every relevant facet.

## Gaps / dismissals

- **G1 (1.5):** sort-control visibility for <2-product slices is a rendering
  condition, belongs to the UI layer; the data-side claim is covered by 1.4-style
  checks and the sort-field proof in 02.
- **G2 (2.1):** "distinguishing attribute" = keys in `filterAttributes` with ≥2
  distinct values across the slice; the check derives the key list mechanically.
- **G3 (2.2):** "relevant" is defined per facet inside the check script —
  domain gates mirror the definitions modules; a facet with no stated gate
  applies to the whole slice.
