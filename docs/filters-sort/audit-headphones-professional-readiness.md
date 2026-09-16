# Filter/Sort — Headphones professional-readiness audit

Tracked by `sang-logium-3rv` — EPIC Filter Sort Migration. New child issues from this
audit: `sang-logium-3rv.9` (Phase 1, implemented), `sang-logium-3rv.10` and `.11`
(Phase 2, implemented as new test files), `sang-logium-3rv.12` (Phase 4, investigated
and implemented differently than originally scoped — see Phase 4 below — which also
surfaced and fixed a second duplicated-logic bug, Phase 5).

## Method

- Read-only source audit for `/products/headphones`. No dev server started, no
  curl/browser automation, no self-run build/lint/test — per this repo's standing
  Issue Risk Protocol Part B. Live-app behaviour is inferred from source, not observed.
- Full read: `app/(store)/products/[...slug]/page.tsx`, `lib/catalogue/{facetMap,
  buildProductQuery,filterSortParams,sanitizeFilterState}.ts`, `sanity-cms/lib/products/
  {getFilterFacets,getProductsByVfsKeys}.ts`, the full `sanity-cms/schemaTypes/
  productType.ts` schema, `app/(test)/poc/filter-sort/headphones/lib/facetConfig.ts`,
  `app/components/features/filters/{facetRegistry,FilterControls}.tsx`, `data/
  catalogue.ts`, `_project/filters/{facet-map.json,sort-map.json,check-wiring.cjs}`.
- Cross-checked against beads epic `sang-logium-3rv` and its children (1 closed today,
  6 open/in-progress before this audit).
- Every claim below traces to a specific file. Claims already made in beads notes were
  independently re-verified against current file contents, not taken on trust — two
  were found stale (see Gap 3, and the deleted `filters-sorting-gap-closure-plan.md`
  provenance note at the end).
- Not verified this session: live browser behaviour of any filter combination (out of
  scope by task design); full line-by-line read of `FilterSidebar.tsx`/
  `ActiveFilterChips.tsx`/`SortBar.tsx`/`SortDropdown.tsx` (architecture inferred with
  high confidence from three independent sources instead — see Architecture map);
  whether `check-wiring.cjs` runs in CI or is a manual-only tool.

## Architecture map (verified from source)

1. Route `/products/headphones` → `app/(store)/products/[...slug]/page.tsx`, one
   dynamic catch-all shared by all three catalogue categories, `force-dynamic`.
2. Category/slug tree (`data/catalogue-index.json`, via `data/catalogue.ts`) is the one
   build-time-baked piece. It only resolves a URL slug to a VFS key set — every
   product, price, stock, and facet value is fetched live from Sanity on each request.
   A CMS edit (e.g. today's 706-product patch) is reflected immediately, no rebuild
   needed.
3. URL state: `nuqs`, via `lib/catalogue/filterSortParams.ts`. The parser map is
   generated programmatically from `FILTER_FACETS` (facetMap.ts) — a facet added there
   automatically gets a correctly-typed URL parser, so this layer cannot drift from
   facetMap.ts by construction.
4. Junk-URL defense: `sanitizeFilterState.ts` drops array-facet values outside the
   known vocabulary before the query runs (`?driverType=banana` → inert, not a
   dead-end empty page). Boolean/range/sort params are separately defended by their
   nuqs parser defaults. Applied twice in `page.tsx` — once for closed vocabularies,
   once more after brand's real data-derived vocab is known.
5. Query building: `buildProductQuery.ts` is a single pure function (its own header:
   "the ONE query translation in the app"), and `page.tsx` hands its output to both
   `getProductsCount` and every `getProductsChunk` call unchanged — the displayed count
   and the rendered grid cannot disagree, structurally.
6. Facet counts/options: `getFilterFacets.ts` is a **separate, hand-written**
   in-memory re-implementation of "does this product match the filter state"
   (`productMatchesState`), not shared code with `buildProductQuery.ts`. Traced
   field-by-field this session (price, inStock, boolean, range, multi/enum) — the two
   currently agree, but nothing enforces they stay that way (Gap 4).
7. UI vocabulary: production's `FilterSidebar`/`FilterControls`/`ActiveFilterChips`
   render from `facetRegistry.ts`, which selects one of three **POC** modules
   (`app/(test)/poc/filter-sort/{category}/lib/facetConfig.ts`) per category. Every
   label, grouping, and checkbox option a shopper sees lives there — not in
   `lib/catalogue/facetMap.ts`, which independently defines its own vocabulary for
   counting/querying. The two are linked only by matching `urlParam`/`id` strings and a
   comment-based convention, with no automated value-level check (Gap 2).

## Grand Step 1 — Critical Q&A

**Q1. Can a product be wrongly included in, or excluded from, a filtered result set
relative to its own data?**
No structural way found. One function builds the query predicate; the exact same
predicate feeds both the count and the grid, so they cannot disagree. Junk URL values
are neutralised before the query runs, not turned into a false result.

**Q2. Can a real product be un-findable through the filter UI even though its data is
correct?**
Yes — this is the live risk. Two hand-maintained files (`facetMap.ts`,
`facetConfig.ts`) plus the Sanity schema itself are three copies of the same
vocabulary, kept in sync by memory alone. Confirmed live example: the schema allows
`soundSignature: "Harman-target-like"`; neither vocab file offered that checkbox
before this audit (Gap 1, now fixed — see Phase 1).

**Q3. Is there a test or script that would catch the next version of that bug
automatically?**
Not before this audit. The one existing script, `_project/filters/check-wiring.cjs`,
never reads `facetConfig.ts` at all and only checks crude substring presence in a
handful of files, not value-set equality. Zero of the repo's 34 test files referenced
`facetMap`, `facetConfig`, `buildProductQuery`, `getFilterFacets`, or
`filterSortParams` — despite sibling files in the exact same directories
(`lib/catalogue/__tests__/priceBounds.spec.ts`, `seo.spec.ts`,
`parentCategoryResolution.spec.ts`) having tests. Two new test files close this gap —
see Phase 2.

**Q4. Is the catalogue data live, or could it be stale after a Sanity edit?**
Live — see Architecture map point 2.

**Q5. What are the core best practices for this stack, and which does this app already
follow?**
Faceted search has five fundamentals: (1) one predicate builder feeding both the count
and the list, (2) URL as the single source of filter state, (3) disjunctive per-facet
counts ("if I also picked X"), (4) closed vocabularies generated from the data schema
rather than hand-copied, (5) automated regression coverage on the vocab/schema
contract. This app has 1–3 solidly (verified in source, including the disjunctive
`excludeParam` logic in `getFilterFacets.ts`). It was missing 4 and 5 — exactly where
the real bugs (today's and historical) have come from.

**Headline verdict:** the matching/counting logic is close to provably correct by
construction. The vocabulary *coverage* was not provable at all before this audit — it
was correct only because of one-time manual audits, with nothing stopping the next
schema edit from silently reopening the same bug class. Phase 2 changes that answer
from "no" to "yes, a test will catch it."

## Grand Step 2a — Gap list (scanned, evidenced)

| # | Gap | Evidence | Severity |
|---|---|---|---|
| 1 | Schema's `soundSignature` has 8 options; `facetMap.ts` and `facetConfig.ts` both had 7 — `Harman-target-like` missing from both. | `productType.ts:318` vs `facetMap.ts` vs `facetConfig.ts` (pre-fix) | Live bug, low blast radius — **fixed, Phase 1** |
| 2 | No automated check ties `facetConfig.ts` (UI vocab) to `facetMap.ts` (query vocab) or to the schema. `check-wiring.cjs` doesn't read `facetConfig.ts` and only does substring checks. | Full read of `check-wiring.cjs` | Structural, root cause of gaps 1 and 5 — **mitigated, Phase 2** |
| 3 | `sang-logium-3rv.5`'s own closing notes say `cableTermination` is "missing 4 of 9 options, correctly out of scope" — current `facetConfig.ts` already has all 9. Notes are stale vs. live source. | `facetConfig.ts` vs bd notes text | Informational — trust source over notes going forward |
| 4 | `getFilterFacets.ts`'s in-memory `productMatchesState()` and `buildProductQuery.ts`'s GROQ predicates are two hand-written implementations of the same match logic, not shared code. Consistent today, not enforced to stay that way. | Both files, full read | Structural, not currently causing a bug — **flagged for design review, Phase 4, not implemented** |
| 5 | Zero automated test coverage on the filter/sort engine, despite sibling files in the same directories having tests. | Repo-wide test search, 34 files found, none referenced the facet engine | Structural, same root cause as gap 2 — **mitigated, Phase 2** |
| 6 | `check-wiring.cjs` references some files not re-verified this session to exist (`getBrandFacets.ts`, `useFilterSort.tsx`, `MobileSortButton.tsx`, `MobileFilterBar.tsx`), and its CI wiring was not checked. | Script body only | Unverified, flagged not confirmed |
| 7 | An unrecognised `slug[0]` silently defaults to `'headphones'` instead of 404ing. | `page.tsx` | Cosmetic/theoretical — practically unreachable given the route structure |
| 8 | `app/(store)/products/page.tsx` and `app/(store)/products/[...slug]/page.tsx` each independently hand-wrote their own equivalent "is any filter active" check (one iterating `FILTER_SORT_KEYS`, the other `Object.entries(state)`) — `sang-logium-3rv.5` already had to fix the same empty-state-message bug in both copies separately once. | Direct read of both files this session, while scoping Phase 4 | Structural, same duplicated-logic pattern as gap 4 — **fixed, Phase 5** |

**Coherence check:** every gap traces to one of two root causes (vocabulary duplicated
across three places with no enforcement; zero test coverage on that duplication),
except gap 7 (unrelated, cosmetic) and gap 3 (resolved by re-verification, not a live
issue). No gap contradicts another.

**Provenance note:** `sanity-cms/schemaTypes/__tests__/productType.spec.ts` references
a prior `filters-sorting-gap-closure-plan.md` (Phase 4/T4.1). That file no longer
exists in the repo; `git log` confirms it was removed in a deliberate cleanup commit
("remove deprecated scripts, project docs and AI tooling bloat"), not abandoned — the
feature it tracked (`displayPriority`) is confirmed shipped in the current schema and
covered by that same test file. No conflict with this audit's phase numbering.

## The Plan (risk-mitigated, simple, robust)

Ordering principle: cheapest and safest first, riskiest last, never bundle a
behaviour-risk change with an unrelated one, each phase independently shippable and
independently revertible — so no single step risks more than it needs to.

**Phase 1 — close the one live data gap. IMPLEMENTED this session.**
Added `Harman-target-like` to `facetMap.ts` and `facetConfig.ts`'s `soundSignature`
lists. 2 files, 2 lines, same pattern already used for every other value in both
arrays. Risk: negligible — additive value to an existing closed list.
Tracked: `sang-logium-3rv.9`, closed.

**Phase 2 — add the regression tests that prevent recurrence. IMPLEMENTED this
session.**
Two new test files, mirroring the existing `lib/catalogue/__tests__/` and
`sanity-cms/schemaTypes/__tests__/` conventions:
- `lib/catalogue/__tests__/facetSchemaParity.spec.ts` — schema `options.list` vs
  `facetMap.ts` valueVocab, per facet, every category.
- `lib/catalogue/__tests__/facetConfigParity.spec.ts` — `facetMap.ts` valueVocab vs
  each of the three POC `facetConfig.ts` modules' options, per category.
New test files only — cannot change production behaviour, can only fail loudly on a
real mismatch. Not run this session (self-verification ban); hand to the human to run.
Tracked: `sang-logium-3rv.10`, `sang-logium-3rv.11` — implementation notes added, left
open for the human to run and close.

**Phase 3 — human live-check.** Not an agent task. Per this repo's standing rule, spot
check `/products/headphones`: Sound Signature → Harman-target-like now selectable;
toggle 2–3 other facets; confirm the count and the grid agree; then run the two new
test files.

**Phase 4 — investigate unifying the two match-logic implementations (gap 4).
INVESTIGATED, resolved differently than originally proposed, IMPLEMENTED.**

Closer inspection found that a literal code-level merge is not the right fix:
`buildProductQuery.ts` compiles a GROQ query string (executed later, by Sanity) and
`getFilterFacets.ts`'s `productMatchesState` evaluates directly in JS — two different
execution targets for the same rule, not one function duplicated. Forcing a shared
abstraction over them would be unverifiable (no way to assert the GROQ string and the
JS boolean agree without a GROQ interpreter or a live Sanity call, both out of reach
here) for marginal risk reduction — exactly the over-engineering this project's own
conventions warn against.

What was done instead, which is both safe and achievable without running anything:
- Exported `productMatchesState` and its helpers (`getPriceCents`, `isInStock`,
  `valuesForFacet`, `numericValueForRangeFacet`, `RawProduct`) from
  `getFilterFacets.ts` — additive visibility change only, zero behaviour change.
- Added `sanity-cms/lib/products/__tests__/getFilterFacets.spec.ts` — direct,
  previously-nonexistent correctness coverage of the in-memory matching engine: price,
  inStock, boolean, range (including a missing-field-with-active-filter case), multi
  (including case-insensitive overlap), and the `excludeParam` disjunctive-count
  mechanism that makes every facet's own displayed option counts honest.
- Added `lib/catalogue/__tests__/buildProductQuery.spec.ts` — direct correctness
  coverage of the GROQ predicate builder, including an explicit regression guard on the
  exact price/inStock fragments `sang-logium-3rv.5` flagged as must-not-silently-break.

Net effect: gap 4's real risk (a silent behaviour change in either engine going
unnoticed) is now caught by tests in both engines independently, without a merge that
could not itself be verified by this session. True cross-engine equivalence testing
would need a GROQ interpreter or an integration test against real/mocked Sanity data —
a larger, separately-scoped undertaking, not attempted here. Not run this session
(self-verification ban, standing regardless of process); hand to the human to run.

**Phase 5 — found and fixed while scoping Phase 4: a second duplicated-logic instance
(gap 8). IMPLEMENTED.**

While reading `app/(store)/products/page.tsx` to check whether Phase 4's fix needed to
touch it too, found it and `app/(store)/products/[...slug]/page.tsx` each independently
hand-wrote their own version of "is any filter currently active" — one iterating
`FILTER_SORT_KEYS`, the other `Object.entries(state)`. Equivalent in practice (both
ultimately visit the same key set, given how the nuqs loader populates state), but two
separately-maintained copies of the same rule — the same drift pattern as gap 2 and gap
4, and `sang-logium-3rv.5`'s own notes confirm it already caused a real bug once,
independently patched in both copies rather than fixed at a shared source. Extracted to
one exported `isFiltersActive()` in `lib/catalogue/buildProductQuery.ts`; both pages now
call it; both now-unused imports (`SORT_DEFAULT`, `FILTER_SORT_KEYS`) removed from the
two page files; direct test coverage added to `buildProductQuery.spec.ts`. Re-read both
page files in full after editing to confirm no dangling references — this repo's
self-verification ban means that manual re-read is the only check available, so it was
done deliberately rather than skipped.

## Out of scope, not touched by this audit

`sang-logium-3rv.2/.3/.6/.7/.8` (audio-electronics/accessories facet parity and UX
cleanup) — pre-existing, separately tracked, not duplicated here. Phase 2's schema
parity test also covers their categories as a side benefit, since it loops over every
category in `FILTER_FACETS`, not just headphones.

## Adjacent finding, out of scope here — flagged on `sang-logium-3rv.2`

While tracing `bluetoothCodecs` for Phase 2's test: the Sanity schema scopes it to both
`headphones` and `audio-electronics` (`productType.ts`, `categories: ["headphones",
"audio-electronics"]`), but `lib/catalogue/facetMap.ts`'s only `codec` entry is scoped
to `categories: ['headphones']`. Audio-electronics products with `bluetoothCodecs` data
(e.g. a wireless streamer) have no facet entry to be counted or filtered by at all on
`/products/audio-electronics`. This is a facet-*coverage* gap (a missing category on an
existing entry), not a vocabulary-*value* mismatch — Phase 2's two new tests compare
value sets for facets that already exist per category, so they will not catch this by
design. Not actioned here (audio-electronics is out of this audit's scope); noted on
`sang-logium-3rv.2` for whoever picks that issue up.
