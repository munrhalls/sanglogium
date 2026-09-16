# Patterns Catalogue

Recurring technical/process patterns found in the sanglogium filters/sorting
history, each with the specific evidence it is based on. Scope: the
codebase and issue tracker only — no claims about the person doing the
work. A pattern is listed only where at least two independent occurrences
were found in git history, beads notes, or this session's own code reads.

---

## Large-scale patterns

### P1 — Full system restart, at least three times
Evidence:
- `51dd4028` (2025-12-12): full Sanity schema redesign for filters/sorts.
- `e625f0f8` (2026-08-21): "archive entire filters/sorting system — relocate
  56 files"; `536aecba` same day removes filter/sort imports from product
  pages/search/Sanity queries; `f4f3026a` (2026-08-26): "remove legacy
  filters/sorting system, its archived copy, filter/search docs and Sanity
  filter query modules."
- `9d0dfb89` (2026-08-22): "Filters and sorting - restart", `82c6e96e` same
  day: "filters-ui-visual-only."
- Following the August 2026 removal, a `should-be-*.md`-driven POC rebuild
  began (`fd993139`, 2026-09-13: "accessories + audio-electronics
  filterAttributes schema complete vs should-be docs"), leading directly
  into the current `sang-logium-3rv` epic.

### P2 — Underlying data-model change breaks filter code
Evidence:
- Brand reference migration (mid-2025): `24633958` "Fixed brand filter GROQ
  syntax", `d6fef891` "Difficulty: 9 ... Fix brand reference handling in
  filter generation", `865252a9` "Fixed useQueryState hydration failures
  with null checks", plus a dedicated lessons doc committed from this
  incident (`7fad6fd6`).
- Price format migration: `52ed7409` "Update auth and filter components to
  use price_data structure", `11540f89` "Update product data fetching and
  filtering to use price_data structure."
- Field renames this year, both noted directly in `productType.ts`:
  `acousticDesign` "Renamed from backDesign 2026-09-13"; `anc` "Replaces
  the old boolean noiseCancelling 2026-09-13."

### P3 — Parallel/duplicated config for the same concept drifts apart
Evidence, all found in this session:
- `app/(test)/poc/filter-sort/headphones/lib/facetConfig.ts` (UI-facing,
  hand-typed option lists) vs. `sanity-cms/schemaTypes/productType.ts`
  (schema, authoritative `options.list`) had independently drifted on
  Sound Signature, IPX, Bluetooth Codec, and Driver Configuration —
  documented with before/after values in `filters-sorting-history.md`.
- `lib/catalogue/facetMap.ts` (production's own canonical facet list) had
  independently drifted from the same schema on Connectivity and Driver
  Type, despite being the file the project treats as ground truth for
  production.
- Production's shared filter components imported URL-param logic from
  `app/(test)/poc/filter-sort/headphones/lib/useFilterParam.ts`, backed by
  a parser map local to that folder, while the server-side route parsed the
  same URL via `lib/catalogue/filterSortParams.ts` — two independently
  maintained parser maps for the same URL contract.
- Three near-identical copies of the same file shape exist per category:
  `facetConfig.ts`, `filterProducts.ts`, `filterSortParams.ts`, `types.ts`,
  `useFilterParam.ts`, once each under `headphones/`, `audio-electronics/`,
  `accessories/` — confirmed via `ls` on all three `lib/` directories.

### P4 — Name match assumed to mean correct wiring
Evidence:
- `sang-logium-3rv.1` notes, "FALSE COMPLETE (2026-09-15)": an earlier pass
  concluded no work was needed because production already had components
  named `FilterSidebar`/`SortBar`, without checking that two separate
  component trees shared those names.
- This session's own finding on `sang-logium-3rv` (section 6 of the session
  journal): every `/products/*` category route rendered via a component
  literally named generically enough (`FilterSidebar`) that its actually
  being hardcoded to one category's data was not visible without reading
  the import statement specifically.

---

## Medium-scale patterns

### P5 — "Grayed out despite real data" recurs with different root causes
Evidence, each a distinct root cause for the same visible symptom:
- This session, case-sensitivity in `countFor`'s string comparison
  (`sang-logium-3rv.5`).
- This session, five range facets present in the UI but absent from
  `lib/catalogue/facetMap.ts`'s `FILTER_FACETS`, so never queried server-
  side.
- `sang-logium-3rv.1` "DEVIN POST-SWAP FINDING" note: facets greyed out
  because their schema field is scoped to other categories entirely
  (expected), separately from facets greyed out because they were simply
  missing from `FILTER_FACETS` (filed as `sang-logium-3rv.4`).
- This session, a facet (`availability`) wired to a URL param and value
  (`preorder`) that exists nowhere in the schema or the production parser
  map.
- This session, an entire group (`type`) missing from the group list that
  controls what renders at all.

### P6 — GROQ query syntax errors, recurring
Evidence: `f261dec1` "Fix GROQ reference syntax from brand->{name} to
brand->name"; `24633958` "Fixed brand filter GROQ syntax"; `ccfa7fde`
"Updated GROQ query for brand reference compatibility"; `d6fef891`
"Difficulty: 9 ... Fix brand reference handling in filter generation."

### P7 — Re-render / URL-thrashing performance bugs on sliders
Evidence: `4df2967d` "prevent excessive re-renders during slider drag"
(StockMinimumSlider); `562b1507` "prevent excessive re-renders and URL
thrashing during slider drag" (PriceRangeSlider); `33cf0abb` "Add debounce
and shared pending state for filter performance." This session's own
`RangeControl`/`PriceControl` code (read directly) already contains a
300ms debounce (`RANGE_WRITE_DEBOUNCE_MS`) and local-state buffering,
consistent with these being the accumulated fix for this exact recurring
issue.

### P8 — Hydration-related errors in filter code, more than once
Evidence: `865252a9` (historical) "Fixed useQueryState hydration failures
with null checks" — a confirmed code bug. This session's hydration error —
diagnosed (not independently re-tested) as a browser-extension DOM
mutation at the document root, unrelated to filter code. Two occurrences
of the same class of console error, with two different root causes; listed
here as a recurring *symptom category*, not a recurring *cause*.

---

## Small-scale patterns

### P9 — Standing self-verification ban shapes when bugs are caught
`/home/jan/work/sanglogium/CLAUDE.md` states an "ABSOLUTE BAN ON
SELF-VERIFICATION COMMANDS" (no `tsc`, `next build`, `next dev`, test runs,
etc., by an agent), citing `sang-logium-5gc` and `sang-logium-pb7`, with
verification restricted to a human running the live dev server or a
human/agent reading the diff. Both bugs found in this session's live-check
(the TypeScript narrowing error, the hydration warning) are the kind of
error a local `tsc`/`next build` run would surface before a human ever
loads the page — this is a direct structural consequence of that standing
rule, not a one-off.

### P10 — Verbose, self-labeled commit messages throughout
The large majority of commits in the 225-commit filter/sort history follow
a `Difficulty: N - Letter, Category (files): description -> DoD:X` format,
self-reported by whoever/whatever authored the commit. This convention
made reconstructing this catalogue and the companion history document
possible directly from `git log` without needing to open individual diffs
for most entries.

### P11 — Large, separately-tracked real-data sourcing effort running in parallel
Evidence: a long run of commits distinct from the filter-*code* history —
`3fd5f566`, `547ca631`, `805fbdc9`, `ad3879c7`, plus many single-brand
"Source and file real, cited ... data" commits, and `f80e2686` (2026-09-15,
10:27am, this session's own day) recording 706 products patched into
Sanity with 0 failures. Beads notes on `sang-logium-1xs.9` (referenced in
commit `1887e2c7`) describe this as a large sourcing subtree with multiple
stalled children. This is the data-fidelity half of "filters show real
options with real counts" — separate from, but a precondition for, the
facet-wiring work catalogued above.
