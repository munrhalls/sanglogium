# DoD — Filters & Sorting — alignment (product data ↔ options)

Presumes `01-membership` and `02-controls` hold. Each group presumes every group
above it already holds. Precedence: the products are the ground truth — options
must be backed by them, and products must be filterable by what is offered.

## 1. Options are backed by products (option → product)
- [ ] 1.1 Every offered filter value matches ≥1 product in that slice — zero dead options.
- [ ] 1.2 No option appears in a slice whose products cannot carry it — zero misplaced options.
- [ ] 1.3 A filter group shows only where the slice has ≥2 distinct values.
- [ ] 1.4 Price range ends equal the real lowest/highest prices in the slice.
- [ ] 1.5 A sort control shows only where the slice has ≥2 products.

## 2. Products are filterable by the options (product → option)
- [ ] 2.1 Every attribute distinguishing ≥2 products in a slice is offered as a filter — zero missing filters.
- [ ] 2.2 Every product carries a real value for each facet relevant to it — zero unfilterable products where the option applies. (Relevance is gated per facet, e.g. wireless facets apply only to non-wired products.)
