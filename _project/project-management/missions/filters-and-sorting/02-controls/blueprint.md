# Blueprint — filters & sorting — controls (the option set)

Source of truth for facets: `features/product-filtering/core/definitions/categories/*.ts`
plus `facetMap.ts` / `facetRegistry.ts`; schema vocabulary: `productType.ts` `options.list`s;
sorts: `core/definitions/sortOptions.ts` + `buildProductQuery.ts` `ORDER_BY_SORT`.

## 1. Options are semantically correct per slice

- [ ] 1.1 Zero nonsensical or misplaced options in any slice.
  Means: per slice, print the full FACETS list (id, group, label, options) for the
  category. Human reads each facet+option against what the slice sells.
  Pass: nothing a shopper would call nonsense or misplaced. Editorial — human
  review is the means.

- [ ] 1.2 Every facet's option set equals the schema's real vocabulary.
  Means: script diffing each checkbox facet's `options` values against the
  matching `productType.ts` `options.list` (and 'derived' facets against
  distinct live values). Pass: identical sets — no phantom, none missing.

- [ ] 1.3 One real-world value = one option.
  Means: per slice, print distinct raw values per filterable attribute. Human
  reads for spelling variants, casing drift, unit-expression drift, jargon.
  Pass: clean under human read.

- [ ] 1.4 Universal options identical across slices; no slice option clashes.
  Means: list universals (`price`, `brand`, `inStock`) defined more than once
  across `facetMap.ts` / category modules, or with differing attribute/type;
  plus category-scoped facets whose attribute/urlParam equals a universal's.
  Pass: empty — single-source.

## 2. Option order is meaningful

- [ ] 2.1–2.3 Brands alphabetical; numeric specs numeric; ranked values natural.
  Means: read the ordering logic, then print one rendered option list per slice.
  Pass: human confirms each ordering rule on the printed lists.

## 3. The sort set

- [ ] 3.1 Exactly six sorts, Newest default.
  Means: read `sortOptions.ts`. Pass: exactly the six entries,
  `SORT_DEFAULT === 'newest'`.

- [ ] 3.2 Every sort reads a real schema field.
  Means: per sort in `SORT_OPTIONS`, name the field its `ORDER_BY_SORT` clause
  reads (`_createdAt`, `price_data.unit_amount`, `name`). Pass: every field
  exists on the product schema/projection; `featured`/`best-selling` absent.

- [ ] 3.3 Single source on every surface.
  Means: list importers of `sortOptions.ts` and any local sort-option arrays
  elsewhere. Pass: one module, zero redefinitions.

## Gaps / dismissals

- Slice-level presence claims (≥2 values, ≥2 products, real price ends) moved to
  `03-alignment` — they are claims about product data, not the option set.
