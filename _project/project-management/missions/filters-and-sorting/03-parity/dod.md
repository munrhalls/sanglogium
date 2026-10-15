# DoD — Filters & Sorting — parity

Presumes `01-membership` and `02-control-semantics` hold. Each group presumes every group above it already holds.

## 1. Options ↔ inventory
- [ ] 1.1 Every offered filter value matches ≥1 product in that slice.
- [ ] 1.2 No option appears that belongs only to another slice.
- [ ] 1.3 Every attribute distinguishing ≥2 products in a slice is offered as a filter.

## 2. Selection returns the right subset
- [ ] 2.1 Any filter combination returns exactly the qualifying products — none extra, none missing.
- [ ] 2.2 Multiple values within one group widen the result (OR).
- [ ] 2.3 Selections across groups narrow the result (AND).

## 3. Price filtering
- [ ] 3.1 The range filters on the displayed price.
- [ ] 3.2 Range bounds are inclusive.

## 4. Sort correctness
- [ ] 4.1 Each sort orders by what its name says.
- [ ] 4.2 Equal items keep a deterministic order across visits.
- [ ] 4.3 Products lacking the sorted attribute sort last.
- [ ] 4.4 Name sort is case-insensitive with natural model order (HD 58 < HD 600).

## 5. Filter/sort independence
- [ ] 5.1 Changing sort never changes which products are in the result.
- [ ] 5.2 Changing a filter never resets the sort.

## 6. Pagination
- [ ] 6.1 Every result is reachable by moving through pages.
- [ ] 6.2 No product appears on two pages.
- [ ] 6.3 The last page is unmistakable.

## 7. Counts reflect reality
- [ ] 7.1 Each option's count equals the products returned by choosing it under the current selection.
- [ ] 7.2 The shown result total equals the actual result set.
