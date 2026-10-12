# Blueprint — filters & sorting — data-1

## 1. Slice membership

Membership is editorial: `catalogueLocationKeys` is the product's own
placement, and no independent machine-readable "what am I" field exists.
So belonging is settled by human review of complete lists — not by a
second query that would only self-agree.

- [ ] 1.1 Zero non-belonging products in each slice.
  Means: print each slice's products (name, brand). Human reads the lists.
  Pass: nothing a shopper would call out of place.

- [ ] 1.2 Zero missing products in each slice.
  Means: print all products not in the slice. Human reads for items that
  belong there. Pass: none found.

- [ ] 1.3 Zero duplicates within each slice.
  Means: per slice, count returned `_id`s vs count distinct `_id`s.
  Pass: equal. (Also assert slice size < 1000 — the query's `0...1000`
  cap would silently hide products.)

## 2. Options match the slice's inventory

- [ ] 2.1 Every offered filter value matches ≥1 product in that slice.
  Means: per slice, list options in `computeCatalogueFacets` output with count 0. Pass: empty. (Trivially true by construction if options are derived — the real assertion is the next one.)

- [ ] 2.2 No option appears that belongs only to another slice.
  Means: per slice, list facet groups present in the category's `FACETS`/`FILTER_FACETS` whose attribute is absent from every product in the slice. Pass: empty.

- [ ] 2.3 Every attribute distinguishing ≥2 products in a slice is offered as a filter.
  Means: per slice, list `filterAttributes` keys with ≥2 distinct values that have no entry in `FILTER_FACETS` (or the category's `FACETS`). Pass: empty — or each listed key is a stated dismissal.

- [ ] 2.4 A filter group shows only where the slice has ≥2 distinct values.
  Means: per slice, list facet groups configured for the category where slice data has <2 distinct values. Pass: empty.

## 3. Options cohere across slices

- [ ] 3.1 Universal options mean, name, and behave identically in every slice.
  Means: list universals (`price`, `brand`, `inStock`) defined more than once across `facetMap.ts` / category modules, or with differing attribute/type. Pass: empty — they are single-source in `FILTER_FACETS`.

- [ ] 3.2 No slice-specific option duplicates or clashes with a universal one.
  Means: list category-scoped facet entries whose `attribute` or `urlParam` equals a universal's (`price`, `brand`, `inStock`). Pass: empty.

## 4. The sort set

- [ ] 4.1 A sort control shows only where the slice has ≥2 products.
  Means: list slices with <2 products. Pass: empty — and sort visibility is a UI concern (DoD-3/UI doc); recorded as dismissal, not a check here.

- [ ] 4.2 Exactly six sorts: Newest (default), Price ↑, Price ↓, A–Z, Z–A, Oldest.
  Means: read `core/definitions/sortOptions.ts`. Pass: exactly the six entries, `SORT_DEFAULT === 'newest'`.

- [ ] 4.3 Every offered sort is backed by real product data.
  Means: per sort in `SORT_OPTIONS`, name the field its `ORDER_BY_SORT` clause reads (`_createdAt`, `price_data.unit_amount`, `name`). Pass: every clause's field exists on the product schema/projection; `featured`/`best-selling` are absent from `SORT_OPTIONS`.

- [ ] 4.4 The same six sorts appear on every surface.
  Means: list importers of `sortOptions.ts` and any local sort-option arrays elsewhere in the repo. Pass: one module, zero local redefinitions.

## Gaps / dismissals

- **G1 (1.1–1.2):** no independent membership oracle exists — `catalogueLocationKeys` is both the selector and the declaration. 1.1–1.2 are therefore human-review proofs by nature, not mechanical ones; that's a stated limitation, not a gap to fill.
- **G2 (2.3):** "attribute distinguishing ≥2 products" needs the list of `filterAttributes` keys considered attributes — derived mechanically by scanning distinct keys across slice products; stated in the check itself.
- **Dismissed:** sort control visibility for <2-product slices (4.1) — rendering condition, belongs to the UI layer; data-side claim (sorts exist per slice) is covered by 4.2.
