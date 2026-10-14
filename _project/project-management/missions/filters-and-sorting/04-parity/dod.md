# DoD — Filters & Sorting — parity (the returned set is exactly right)

Presumes `01-membership`, `02-controls`, and `03-alignment` hold. Each group
presumes every group above it already holds.

The spine of this mission: an independent expected-subset generator (the
oracle) is proven trustworthy FIRST, then every app's returned set is proven
equal to the oracle's — single options, then pairs.

## 1. The oracle — an independent expected-result generator
- [ ] 1.1 The oracle computes the expected subset by pure, inspectable logic: fetch the slice's raw products, apply the selection in memory. Every step is black-box readable — zero borrowed machinery from the code under test.
- [ ] 1.2 The oracle is proven sound: with no selection it returns exactly the slice membership proven in mission 01 (174 / 221 / 259); on hand-verifiable sample selections its output equals what a human derives by reading the raw data.
- [ ] 1.3 The oracle is proven complete: it evaluates every option the slice offers — no facet type or value is outside its reach.

## 2. Single-option parity — every option returns exactly its set
- [ ] 2.1 For every single offered option value in each slice: the app's returned set equals the oracle's expected set — identical `_id`s, identical count.
- [ ] 2.2 Boolean and range-end selections likewise: app's set equals oracle's set.

## 3. Pair parity — every pair returns exactly its set
- [ ] 3.1 Two values within one group widen correctly (OR): app's set equals oracle's OR-set for every offered pair.
- [ ] 3.2 Two values across groups narrow correctly (AND): app's set equals oracle's AND-set for every offered cross-group pair.

## 4. Sort correctness
- [ ] 4.1 Each sort orders the returned set by what its name says — verified against the oracle's ordering of the same set.
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
