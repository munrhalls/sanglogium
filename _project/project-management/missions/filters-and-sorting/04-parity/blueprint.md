# Blueprint — filters & sorting — parity

The crux: expected subsets cannot be hand-written — thousands of
combinations. So the mission's first group proves an ORACLE: a generator
of expected subsets so simple its logic is exact proof by reading. Then
groups 2–3 compare the app's returned `_id` set against the oracle's.

The oracle is one script (`tests/filtering/oracle.mjs`): fetch every
product in the slice (membership by catalogue-key unroll, same as
mission 01), with `_id` + `filterAttributes`; apply a selection as
in-memory predicates — `in`-group OR, cross-group AND, boolean equality,
range bounds inclusive. Zero imports from `features/product-filtering`.

The app's side: `buildProductQuery` produces the GROQ the storefront
runs; the check executes that query against Sanity and takes the `_id`
set — the set a shopper actually receives.

## 1. The oracle

- [ ] 1.1 Pure inspectable logic.
  Means: human reads `oracle.mjs` top to bottom. Pass: every step is a
  black box whose TRUST holds by logic alone; no code under test is
  imported.

- [ ] 1.2 Proven sound.
  Means: run oracle with empty selection per slice — must print exactly
  174 / 221 / 259 (mission-01 proven counts). Then 3 stated sample
  selections per slice: the oracle prints its picked product names; human
  confirms each pick against the printed raw attribute lists from
  `check-2.3-raw-values.mjs`. Pass: counts exact, every sample pick right.

- [ ] 1.3 Proven complete.
  Means: script lists every offered facet id per slice vs the set of
  attributes the oracle's predicate map covers. Pass: covered = offered,
  zero gaps printed.

## 2. Single-option parity

- [ ] 2.1 Every checkbox/enum value: app set == oracle set.
  Means: per slice, iterate every offered option value; for each, run
  `buildProductQuery`'s GROQ and the oracle; compare `_id` sets.
  Pass: `SET DIFFS: 0`. Any diff prints both lists.

- [ ] 2.2 Booleans and range bounds likewise.
  Means: same loop over boolean facets (true) and range facets
  (min-only, max-only, min+max ends). Pass: `SET DIFFS: 0`.

## 3. Pair parity

- [ ] 3.1 Within-group pairs (OR).
  Means: per slice, every 2-value combination inside each multi-value
  facet: app vs oracle union. Pass: `SET DIFFS: 0`.

- [ ] 3.2 Cross-group pairs (AND).
  Means: per slice, every (facetA value × facetB value) pair across
  distinct facets: app vs oracle intersection. Pass: `SET DIFFS: 0`.
  (Pair count is large — printed as progress chunks; the pass is the
  zero, not reading each pair.)

## 4–7. Sort, independence, pagination, counts

- [ ] 4.1 Each sort orders by its name.
  Means: for each `SORT_OPTIONS` value, fetch app's ordered `_id` list;
  oracle sorts the same set independently; compare sequences.
  Pass: identical order per sort.
- [ ] 4.2 Deterministic ties.
  Means: run one sort twice; identical `_id` sequences both times.
- [ ] 4.3 Missing attribute sorts last.
  Means: per sortable attribute, verify products lacking it occupy the
  tail of the app's ordered result.
- [ ] 4.4 Natural name order.
  Means: oracle's name comparator (case-insensitive, numeric-aware) vs
  app's `alpha-asc` sequence.

- [ ] 5.1 Sort never changes the set.
  Means: same selection, all six sorts — `_id` SETS equal (order ignored).
- [ ] 5.2 Filter never resets sort.
  Means: UI-level claim — human check on localhost, or read of
  `filterSortParams` merge logic. Pass: stated per evidence.

- [ ] 6.1–6.3 Pagination.
  Means: walk `offset/limit` pages of one sorted query per slice via the
  same query builder; union of pages must equal the full set, page
  `_id`s pairwise disjoint, last page non-empty and terminal.
  Pass: all three hold in printed summary.

- [ ] 7.1 Option counts equal returned-set sizes.
  Means: under a stated selection, each facet option's count from
  `computeCatalogueFacets` equals the oracle subset size choosing it.
  Pass: `COUNT DIFFS: 0`.
- [ ] 7.2 Result total equals actual set.
  Means: the query's `count()` wrapper equals oracle set size for a
  sample of selections. Pass: equal on every sample.

## Gaps / dismissals

- **G1 (1.2):** "hand-verifiable sample selections" are fixed inside the
  check (e.g. `soundSignature=Warm` in headphones) so the human derives
  the same answer independently from the printed raw data.
- **G2 (3.x):** "every pair" means every pair the slice's sidebar can
  express — the cross-product over offered values; the script prints the
  pair counts so the coverage is visible, not assumed.
