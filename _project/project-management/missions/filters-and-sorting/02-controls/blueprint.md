# Blueprint — filters & sorting — controls

## 1. The filter groups offered

- [ ] 1.1 A filter group shows only where the slice has ≥2 distinct values.
  Means: per slice, list facet groups configured for the category where slice data has <2 distinct values. Pass: empty.

## 2. Options cohere across slices

- [ ] 2.1 Universal options mean, name, and behave identically in every slice.
  Means: list universals (`price`, `brand`, `inStock`) defined more than once across `facetMap.ts` / category modules, or with differing attribute/type. Pass: empty — they are single-source in `FILTER_FACETS`.

- [ ] 2.2 No slice-specific option duplicates or clashes with a universal one.
  Means: list category-scoped facet entries whose `attribute` or `urlParam` equals a universal's (`price`, `brand`, `inStock`). Pass: empty.

## 3. The sort set

- [ ] 3.1 A sort control shows only where the slice has ≥2 products.
  Means: list slices with <2 products. Pass: empty — and sort visibility is a UI concern; recorded as dismissal, not a check here.

- [ ] 3.2 Exactly six sorts: Newest (default), Price ↑, Price ↓, A–Z, Z–A, Oldest.
  Means: read `core/definitions/sortOptions.ts`. Pass: exactly the six entries, `SORT_DEFAULT === 'newest'`.

- [ ] 3.3 Every offered sort is backed by real product data.
  Means: per sort in `SORT_OPTIONS`, name the field its `ORDER_BY_SORT` clause reads (`_createdAt`, `price_data.unit_amount`, `name`). Pass: every clause's field exists on the product schema/projection; `featured`/`best-selling` are absent from `SORT_OPTIONS`.

- [ ] 3.4 The same six sorts appear on every surface.
  Means: list importers of `sortOptions.ts` and any local sort-option arrays elsewhere in the repo. Pass: one module, zero local redefinitions.

## Gaps / dismissals

- **Dismissed (3.1):** sort control visibility for <2-product slices — rendering condition, belongs to the UI layer; the data-side claim (sorts exist per slice) is covered by 3.2.

*Items 4.x–6.x carry over from DoD docs 2–3; means not yet blueprinted.*
