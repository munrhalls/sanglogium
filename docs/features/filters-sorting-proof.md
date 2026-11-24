# Filters & sorting — conclusive-proof pack

Working doc for the collaboration (owner: Jan). Agreed 2026-11-04.
Goal: credible, prominent proof of engineering competence for the portfolio
and job applications. Constraint: inside the one-day packaging budget — this
feeds conversion; it must not starve leads.

## The claim (what we say publicly)

"Filters and sorting aren't checked with example tests — they're verified
against 7 formally stated behavioural laws, property-tested over generated
catalogs, plus live-CMS proof scripts. Example tests sample the input space;
laws constrain all of it."

## The seven laws

1. **Soundness** — every product in the result satisfies ALL active predicates.
2. **Completeness** — every input product satisfying all predicates IS in the result.
3. **No fabrication** — result ⊆ input, exactly.
4. **Monotone shrinking** — adding a filter never grows the result set.
5. **Permutation + order** — sorted output is the same multiset as input AND
   every adjacent pair obeys the comparator (catches inconsistent-comparator
   bugs that produce silent garbage).
6. **Composition** — sort(filter(X)) ≡ filter(sort(X)). The feature as one system.
7. **URL round-trip** — filter state → URL → parsed back = identical state.
   Where real-world filter bugs actually live.

## The artifact

- `tests/product-filtering/filters-sorting.laws.ts` — the permitted law form:
  `node:test`, zero deps, seeded PRNG (deterministic), one `test()` per law,
  ~1k generated catalogs each.
- Human runs it (repo rule): `node --experimental-strip-types --import
  ./tools/alias-loader.mjs --test tests/product-filtering/filters-sorting.laws.ts`
- Existing live-CMS proof scripts in `tests/product-filtering/` complement.

## UX / demo script (Loom, ≤90s)

Facet select → results narrow, URL updates live → sort change → reorder →
copy URL → open in new tab → identical state restored (demonstrates law 7
live). Optional: mobile filter sheet, one take only — no narration polish.

## Packaging

- Slides ≤5: feature → the problem (infinite input space, examples can't
  cover it) → the 7 laws → method (generated catalogs + live CMS) → links.
- PDF case study: this doc, trimmed — exportable when needed.
- CV/LinkedIn line: the claim above, verbatim.

## Scope limits

- Laws bind only to real exports of `features/product-filtering`
  (`index.ts`/`server.ts`, `core/`, `url/`) — no invented signatures.
- No feature changes *unless a law breaks* — then the break is the finding:
  fix or report, never weaken the law to pass.
- No new dependencies, no test framework, no test dirs beyond the law file.

## Status / next steps

- [ ] Read `features/product-filtering` surface; map each law to real functions.
- [ ] Draft `filters-sorting.laws.ts`.
- [ ] Jan runs it once; green output = the snippet for slide 3 + repo artifact.
- [ ] Shoot the Loom; assemble slides; paste claim into CV/LinkedIn/portfolio.
