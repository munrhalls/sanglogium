# Data-layer DoD — Filters & Sorting — 3 of 3

Presumes document 2 holds.

## 9. Sort correctness
- [ ] 9.1 Each sort orders by what its name says.
- [ ] 9.2 Equal items keep a deterministic order across visits.
- [ ] 9.3 Products lacking the sorted attribute sort last.
- [ ] 9.4 Name sort is case-insensitive with natural model order (HD 58 < HD 600).

## 10. Filter/sort independence
- [ ] 10.1 Changing sort never changes which products are in the result.
- [ ] 10.2 Changing a filter never resets the sort.

## 11. Pagination
- [ ] 11.1 Every result is reachable by moving through pages.
- [ ] 11.2 No product appears on two pages.
- [ ] 11.3 The last page is unmistakable.

## 12. Counts reflect reality
- [ ] 12.1 Each option's count equals the products returned by choosing it under the current selection.
- [ ] 12.2 The shown result total equals the actual result set.
