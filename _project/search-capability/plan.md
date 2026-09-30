# Search capability axis — plan (4 turns)

Written 2026-09-29 by the architect. Baseline: `origin/main` == `6ddfe52a` (search-ux axis merged: sheet, tablet, small desktop, PR #12 sort).
Trigger: objective QA of the live-check screenshots scored the search UX **6.3/10** — visual craft ~7.5, search *capability* ~4. This axis lifts capability. Target after turn 4: **≥ 8/10** on the same rubric.

## Intelligence (verified in code, 2026-09-29)

| Fact | Where |
|---|---|
| `/products` already has the complete filter system: URL contract via nuqs, GROQ builder, in-memory facet counts, sidebar, mobile sheet, chips, sort | `lib/catalogue/filterSortParams.ts`, `buildProductQuery.ts`, `sanitizeFilterState.ts`, `sanity-cms/lib/products/getFilterFacets.ts`, `app/components/features/filters/*`, `app/(store)/products/page.tsx` (the template to copy) |
| `/search` has none of it: only a count and `SearchSort` (own select, own vocab: relevance/price-asc/price-desc/name-asc) | `app/(store)/search/SearchResults.tsx`, `SearchSort.tsx` |
| Search fetches ALL matches (window 2000; catalogue is ~707) then scores + sorts + slices in memory | `sanity-cms/lib/products/searchProducts.ts` `searchProductsFull` |
| `searchProducts.ts` is a `'use server'` file: it may only export async functions, so its scorer cannot be imported elsewhere until extracted | same file |
| The sidebar `commercial` group = Price, Brand, In-stock: category-agnostic (the customer-rating control was removed). Other groups come from the per-category modules | `lib/filter-sort/<slice>/facetConfig.ts` |
| `loadFilterSort` parses `sort` against the catalogue vocabulary only; `relevance` is not in it | `filterSortParams.ts` |
| Autocomplete takes `order(_id asc)[0...48]` BEFORE scoring, so for broad queries the best matches can miss the candidate window | `searchProductsAutocomplete` |
| Scoring builds `fullName = brand+name` with spaces stripped, so substrings can match across the brand/name seam (`mcintosh|ds200` contains "hd") | `scoreProduct`, `buildFullName` |
| Autocomplete returns products only: no brand or category entries, no query suggestions, no typo tolerance (GROQ `match` is exact-prefix) | `searchProductsAutocomplete` |
| Catalogue category roots + parent map exist for category logic | `data/catalogue-index.json`, `getRootCategory` |

## Gap scan (what the screenshots + code say is missing vs elite audio-shop search)

1. Results page: no filters, no working sort parity with the catalogue. Biggest gap (rubric: results structure 4.5, site consistency 5.5).
2. Ranking: window truncation, seam false-matches, no multi-token logic, popup order ≠ page order (rubric: relevance 4.5).
3. Suggestions are a flat product list (rubric: autocomplete 7.5 but domain intelligence 3.5).
4. Zero-result dead end and typo intolerance ("sennhesier" returns nothing).
Out of scope for the whole axis: personalisation, popularity/analytics ranking, synonyms dictionary, category-specific facets on mixed results, Algolia/external search engine.

## Cross-turn rules

- **Sequential, not parallel.** Turns 1–3 all touch `searchProducts.ts` / the search results files. Merge each turn's PR into `main` before the next turn's Devin starts. Turn N+1 branches from the updated `origin/main`.
- Branch per turn: `search-capability/results-parity`, `search-capability/relevance`, `search-capability/navigation`, `search-capability/recovery`.
- Same Devin rules as before: no build/lint/tests/dev-server/curl, no subagents, no `$(...)`, one command at a time, git guard in every phase, one PR per turn, human live-checks on `localhost:3000`.
- Devin may WRITE tests (turn 2, 4) but never runs them; the human/CI does.
- After turns 1 and 4 the human re-shoots the screenshot pack (`/tmp/search-ux-live-check` structure) so the rubric can be re-scored.

## Turn 1 — Results parity: filters + sort on `/search` (Devin phases: `01-results-parity-devin-phases.md`)

Scope: reuse the catalogue filter system on `/search`, restricted to the `commercial` group (Price, Brand, In stock). Single fetch of the matched set feeds results, counts and price bounds, so counts always equal results. `/products`-style layout: sticky sidebar from `lg`, Filters sheet below `lg`, active chips, toolbar row (count, Filters button, Sort), filter-aware empty state, skeleton without layout jump, pagination stacks below `xl` (narrower column).
Non-goals: category-specific facets, ranking changes, autocomplete changes, new filter UI components, rating data work.
Definition of done:
- [ ] (a) `/search?q=hd` at ≥1024px shows the sidebar with Price, Brand (with counts) and In-stock; below 1024px a Filters button opens the sheet with the same controls and a "Show N results" footer.
- [ ] (b) Ticking a brand narrows results; the toolbar count, pagination and the brand's sidebar count agree; the URL is `?q=hd&brand=<slug>`; `q` survives every filter change; page resets to 1; browser Back undoes one step.
- [ ] (c) Price slider bounds come from the matched set, not the whole catalogue; In-stock toggle narrows correctly.
- [ ] (d) Sort: Relevance (default, absent from URL), Price low→high, Price high→low, Name A–Z; persists across filter changes and paging; legacy `sort=name-asc` still works.
- [ ] (e) Active-filter chips render and remove; "Clear all" keeps `q`.
- [ ] (f) Filtered-to-zero shows the filter empty state with a working Clear all; unfiltered-zero and no-query keep `SearchEmpty`.
- [ ] (g) No layout jump between skeleton and results at ≥1024px; grid column counts match `/products` (2 at 1024, 3 at 1280, 4 at 1920); pagination single row only from `xl`.
- [ ] (h) `/products`, category pages, autocomplete popup/sheet unchanged.
- [ ] (i) Rubric targets: results structure 4.5→8, site consistency 5.5→8; overall ≈ 7.0.

## Turn 2 — Relevance integrity: one scorer, correct ranking, popup == page

Scope: extract a shared non-server scorer module used by both autocomplete and full search; fix the candidate-window truncation; fix seam false-matches (match brand and name as separate token fields); multi-token AND matching with field weights (exact model code > name > brand > SKU > specs/overview); in-stock and category tie-breaks; the popup's top 6 equals the page's top 6 for the same query; written (not run) unit tests with a golden-query table; `docs`/golden file.
Non-goals: typo tolerance, new suggestion types, popularity signals.
Definition of done:
- [ ] (a) One scoring module; `searchProducts.ts` contains no scoring logic of its own.
- [ ] (b) Autocomplete scores the full matched set (no `order(_id)[0...48]` cut-off).
- [ ] (c) Golden queries (≥20, in `_project/search-capability/golden-queries.md`: `hd`, `hd800s`, `hd 800 s`, `sennheiser`, `sennheiser hd 6`, `dac`, `topping dx3`, `cable`, `iem`, `fiio`, …) verified by the human: expected product in the top 3, and popup top-6 order == page order.
- [ ] (d) `hd` no longer ranks a product whose only match is the brand/name seam above real HD models; spec-only matches rank below name/brand matches.
- [ ] (e) A unit-test file with the golden cases is written and committed (run by the human/CI).
- [ ] (f) Redirect detection and turn-1 filters/sort behave exactly as before.
- [ ] (g) Rubric: relevance 4.5→8; overall ≈ 7.6.

## Turn 3 — Navigation intelligence: brands, categories, category narrowing

Scope: autocomplete v2 with sections (Categories, Brands, Products) in one keyboard-navigable listbox on both surfaces (popup + sheet); brand entries link to the brand-filtered catalogue, category entries to the category page; a "Refine by category" chip row with counts on `/search` (`cat` param, single-select, works with turn-1 filters and sort, derived from the matched set's `catalogueLocationKeys`).
Non-goals: typo tolerance, category-specific facets, new ranking.
Definition of done:
- [ ] (a) Typing `sen` shows a Brand entry (Sennheiser) above products; typing `head` shows a Category entry (Headphones); each section is labelled and screen-reader correct (`role="listbox"`, options only, headings outside).
- [ ] (b) Arrow keys move through all sections in order; Enter opens the highlighted entry; phone sheet behaves identically; tap targets ≥44px.
- [ ] (c) `/search?q=hd` shows category chips with counts summing to the result count; selecting one narrows results, keeps `q`, filters and sort; chip is removable; URL `cat=`.
- [ ] (d) Popup/sheet visual polish unchanged in feel (no regressions at 390/640/1024/1440).
- [ ] (e) Rubric: domain intelligence 3.5→6.5, autocomplete 7.5→8.5; overall ≈ 8.0.

## Turn 4 — Recovery + final QA: typos, did-you-mean, zero-result rescue, docs, re-score

Scope: typo tolerance from an in-memory vocabulary (brands + product-name tokens, edit distance ≤ 1–2 for tokens ≥ 4 chars): "Showing results for X" / "Search instead for Y" on the page and a corrected fallback in autocomplete when it would return nothing; relaxed (any-token) matching with a clear "partial matches" banner when strict AND yields zero; docs consolidation (`docs/search-ux.md` + new `docs/search-capability.md`); the final screenshot pack and re-score against the rubric.
Definition of done:
- [ ] (a) 12 typo cases resolve (`sennhesier`, `focall`, `topping dx3s`, `hd800`, `airpods max`-style misses fail gracefully, …) with a visible, reversible correction notice.
- [ ] (b) Genuinely unknown queries still land on `SearchEmpty`, never on a wrong "correction".
- [ ] (c) Autocomplete never shows an empty panel for a one-typo query.
- [ ] (d) Docs updated; golden and typo tables checked in.
- [ ] (e) Human re-shoot scores **≥ 8/10 overall** with no metric below 6.

## Rubric mapping (screenshot QA, 2026-09-29 → target)

| Metric | Now | T1 | T2 | T3 | T4 |
|---|---|---|---|---|---|
| Results-page structure | 4.5 | 8 | 8 | 8.5 | 8.5 |
| Site consistency | 5.5 | 8 | 8 | 8 | 8.5 |
| Relevance and ranking | 4.5 | 4.5 | 8 | 8 | 8.5 |
| Audio-domain intelligence | 3.5 | 3.5 | 4.5 | 6.5 | 8 |
| Autocomplete design | 7.5 | 7.5 | 7.5 | 8.5 | 8.5 |
| Empty/error states | 8 | 8 | 8 | 8 | 9 |
| Overall | 6.3 | ~7.0 | ~7.6 | ~8.0 | ≥ 8.3 |

## Housekeeping noticed (not part of any turn)

- Stale local branch `search-ux/live-check` (throwaway, delete it) and `search-ux/tablet` still linked to a worktree (`+`).
- `_project/search-ux/05-…07-…` phase files are no longer on disk. The unfinished desktop phases (`max-w-[1344px]` wrapper fix, docs consolidation) are superseded by turn 1 (the sidebar layout removes the grid/wrapper mismatch) and by turn 4 docs.
- Category page showed a Next.js dev "1 Issue" badge in the screenshots: worth a look, outside this axis.
