# DoD — Filters & Sorting — parity (runtime mechanics)

Presumes `01-membership`, `02-controls`, and `03-alignment` hold. Each group
presumes every group above it already holds.

## 1. Selection returns the right subset
- [ ] 1.1 Any filter combination returns exactly the qualifying products — none extra, none missing.
- [ ] 1.2 Multiple values within one group widen the result (OR).
- [ ] 1.3 Selections across groups narrow the result (AND).

## 2. Price filtering
- [ ] 2.1 The range filters on the displayed price.
- [ ] 2.2 Range bounds are inclusive.

## 3. Sort correctness
- [ ] 3.1 Each sort orders by what its name says.
- [ ] 3.2 Equal items keep a deterministic order across visits.
- [ ] 3.3 Products lacking the sorted attribute sort last.
- [ ] 3.4 Name sort is case-insensitive with natural model order (HD 58 < HD 600).

## 4. Filter/sort independence
- [ ] 4.1 Changing sort never changes which products are in the result.
- [ ] 4.2 Changing a filter never resets the sort.

## 5. Pagination
- [ ] 5.1 Every result is reachable by moving through pages.
- [ ] 5.2 No product appears on two pages.
- [ ] 5.3 The last page is unmistakable.

## 6. Counts reflect reality
- [ ] 6.1 Each option's count equals the products returned by choosing it under the current selection.
- [ ] 6.2 The shown result total equals the actual result set.
