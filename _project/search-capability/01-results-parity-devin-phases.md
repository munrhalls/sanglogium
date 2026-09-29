# Search capability — turn 1 of 4: RESULTS PARITY (filters + sort on `/search`) — Devin phases

Axis: search capability (plan: `_project/search-capability/plan.md`). Turn 1 task area: give `/search` the same filter/sort experience as `/products`, restricted to the category-agnostic `commercial` group (Price, Brand, In stock).
Branch for this turn: **`search-capability/results-parity`** (new, from `origin/main`). One PR at the end. Paste ONE phase at a time, in order, into the SAME Devin session/worktree.

Files this turn may touch (nothing else, ever):
`sanity-cms/lib/products/getFilterFacets.ts`, `sanity-cms/lib/products/searchProducts.ts`, `app/components/features/filters/FilterSidebar.tsx`, `app/components/features/filters/MobileFilterSheet.tsx`, `app/components/features/search/SearchSort.tsx`, `app/components/features/search/SearchPagination.tsx`, `app/(store)/search/page.tsx`, `app/(store)/search/SearchResults.tsx`, `docs/search-ux.md`.

Git facts verified 2026-09-29: `origin/main` == `6ddfe52a`; no branch `search-capability/results-parity` exists; local branches `search-ux/live-check` and `search-ux/tablet` are NOT yours; a shared `git stash` stack holds the human's parked work; other Devin sessions may hold their own treehouse worktrees.

Design in one paragraph (so every phase makes sense): `searchProductsFull` already fetches every product matching the words (window 2000, catalogue ≈ 707) and scores/sorts in memory. This turn passes the parsed catalogue filter state into it; it computes facet counts from that same matched set (`computeCatalogueFacets`, extracted from `getFilterFacets`), filters in memory with the existing `productMatchesState`, sorts, paginates, and returns counts + price range. The `/search` page then renders the `/products` layout (sidebar / mobile sheet / chips / toolbar). Counts and results come from the same array, so they can never disagree. `sort` on `/search` is NOT parsed by `loadFilterSort` (its vocabulary has no `relevance`); the page passes the raw `sort` string and `searchProductsFull` validates it.

---

## Phase 1 — Create the branch (git only, no code)

```markdown
# Phase 1 — create branch `search-capability/results-parity` safely (git only, no code changes)

Repo rules (apply to every phase): never run tsc, next build, lint, tests, npm run dev, curl, npm install, browser automation against the dev server. No subagents. No `$(...)` or backticks in shell commands — one plain command at a time. The human checks live on localhost:3000.

FORBIDDEN in every phase: `git stash`, `git checkout`/`git switch` to any branch other than the one created below, `git merge`, `git rebase`, `git cherry-pick`, `git reset --hard`, `git clean`, `git push --force` (or `+ref`), `git branch -d/-D`, `git worktree remove/prune`, `git add -A`, `git add .`, `git add -u`, committing on `main`, pushing any branch except `search-capability/results-parity`, touching any worktree or branch that is not yours. If any check below fails: STOP and report the exact output. Do not improvise a workaround.

Tasks (run in order, one command at a time):
1. `git rev-parse --show-toplevel` — the path MUST start with `/home/jan/.treehouse/sanglogium-29d78f/`. If it is `/home/jan/work/sanglogium` (the human's own checkout), STOP.
2. `git branch --show-current` — MUST NOT start with `search-ux/` or `search-capability/`. If it does, this is another session's worktree: STOP.
3. `git status --porcelain` — MUST print nothing. If not empty, STOP (do not stash, do not discard).
4. `git fetch origin --prune`
5. `git rev-list --count origin/main..HEAD` — MUST print `0` (no foreign commits in this worktree). Otherwise STOP.
6. `git branch --list search-capability/results-parity` AND `git ls-remote --heads origin search-capability/results-parity` — BOTH MUST print nothing. If either prints a line, STOP (never reuse, delete or overwrite an existing branch).
7. `git switch -c search-capability/results-parity --no-track origin/main`
8. `git branch --show-current` MUST print `search-capability/results-parity`. `git rev-parse HEAD` and `git rev-parse origin/main` MUST be identical.
9. Sanity gates — open these files and report each as `yes`/`no` (do not fix anything):
   - `app/components/features/search/SearchSort.tsx` exists → `SORT_FILE=yes|no`
   - `app/components/features/search/SearchPagination.tsx` nav className contains `lg:flex-row` → `PAGINATION_LG=yes|no`
   - `app/(store)/search/SearchResults.tsx` contains `SearchSort` → `RESULTS_SORT=yes|no`
   If `SORT_FILE=no` or `RESULTS_SORT=no`, STOP and report (the base is not what this plan expects).
10. Do not push yet (nothing to push).

Done =
- [ ] (a) toplevel under `/home/jan/.treehouse/sanglogium-29d78f/`, branch was not another session's, 0 foreign commits
- [ ] (b) working tree clean before branching
- [ ] (c) branch created from `origin/main`, HEAD == origin/main
- [ ] (d) the three gate values reported
- [ ] (e) zero files changed, nothing pushed
```

---

## Phase 2 — Data layer: shared facet computation + filtered/sorted `searchProductsFull`

```markdown
# Phase 2 — data layer: `computeCatalogueFacets` + `searchProductsFull(…, state)` (branch `search-capability/results-parity`)

Repo rules: never run tsc, next build, lint, tests, npm run dev, curl, npm install, browser automation. No subagents. No `$(...)`/backticks in shell commands. Human checks live on localhost:3000.

GIT GUARD (run first): `git branch --show-current` MUST print `search-capability/results-parity`; `git rev-parse --show-toplevel` MUST start with `/home/jan/.treehouse/sanglogium-29d78f/`; `git status --porcelain` MUST be empty. Otherwise STOP and report; do not switch branches. Forbidden: git stash, checkout/switch, merge, rebase, reset --hard, force push, `git add -A`/`.`/`-u`. Files you may edit: `sanity-cms/lib/products/getFilterFacets.ts` and `sanity-cms/lib/products/searchProducts.ts` ONLY.

Context: `/products` computes facet counts with `getFilterFacets`. `/search` needs the same counts over ITS matched products. So the counting code must become a pure function both can call. `searchProducts.ts` is a `'use server'` file: it may only EXPORT async functions and types; keep it that way (no new non-async exports there).

Tasks:
A. `sanity-cms/lib/products/getFilterFacets.ts` — pure extraction, NO behaviour change:
1. Find `getFilterFacetsFn`. After its product-fetch `try/catch` (the one that ends with the `return { groups: {}, booleans: {}, brandLabels: {}, ranges: {} };` error path), everything from the line `const groups: FacetGroups = {};` down to and including the final `return { groups, booleans, brandLabels, ranges, isDefaultState: isDefaultFilterState(state) };` moves VERBATIM (no edits to the logic) into a new exported function placed directly above `getFilterFacetsFn`: `export function computeCatalogueFacets(products: RawProduct[], state: ProductQueryState): CatalogueFacets { … }`. Add a one-line doc comment: `/** Pure facet counts over an already-fetched product set (catalogue routes and /search share it). */`.
2. In `getFilterFacetsFn`, the code you moved is replaced by the single line `return computeCatalogueFacets(products, state);`. Everything before it (the `keys` early return, the GROQ fetch, the try/catch) stays exactly as is. `getFilterFacets` (the `withCache` export) stays exactly as is.
3. Do not touch any other function in the file.

B. `sanity-cms/lib/products/searchProducts.ts`:
4. Add imports (type imports with `import type`): `import { computeCatalogueFacets, productMatchesState } from '@/sanity-cms/lib/products/getFilterFacets';` `import type { CatalogueFacets, RawProduct } from '@/sanity-cms/lib/products/getFilterFacets';` `import { sanitizeFilterState } from '@/lib/catalogue/sanitizeFilterState';` `import type { ProductQueryState } from '@/lib/catalogue/buildProductQuery';` `import type { PriceRangeData } from '@/lib/catalogue/priceBounds';`
5. `SearchProduct` interface: add three optional fields: `filterAttributes?: Record<string, unknown>;` `brandRef?: { name: string; slug: string } | null;` `price?: number;`.
6. `SearchResult` interface: add `unfilteredCount: number;` (required) and optional `facets?: CatalogueFacets; priceRange?: PriceRangeData; state?: ProductQueryState;`. Every `return { products: [], totalCount: 0 }` in `searchProductsFull` (the early return, the zero-count return and the `catch` return) becomes `return { products: [], totalCount: 0, unfilteredCount: 0 };`.
7. `searchProductsFull` new signature: `(query: string, sort?: string, page: number = 1, perPage: number = DEFAULT_PER_PAGE, state?: ProductQueryState)`. Keep the existing count query and its early return. Rename the local `totalCount` (the count result) to `unfilteredCount`.
8. In the matched-products GROQ projection add three lines after `catalogueLocationKeys`: `filterAttributes,` then `"brandRef": brand->{ name, "slug": slug.current },` then `"price": price_data.unit_amount`. (Watch the commas so the projection stays valid.)
9. After `matchedProducts` is fetched, write: `const matched = matchedProducts ?? [];` then, only when `state` is provided:
   - `facets = computeCatalogueFacets(matched as unknown as RawProduct[], state)`
   - `appliedState = sanitizeFilterState(state, { brand: Object.keys(facets.brandLabels) })`
   - `filtered = matched.filter((p) => productMatchesState(p as unknown as RawProduct, appliedState))`
   - `priceRange = { minPrice, maxPrice, prices }` where `prices` = every `p.price_data.unit_amount` in `matched` that is a finite number, `minPrice`/`maxPrice` = Math.min/Math.max of `prices` or `null` when `prices` is empty (cents).
   When `state` is NOT provided: `filtered = matched`, and `facets`, `priceRange`, `appliedState` stay `undefined` (existing callers behave exactly as before).
10. Sort: sort `filtered` (not `matched`) with the existing comparator logic. Extend the name sort: `sort === 'alpha-asc' || sort === 'name-asc'` uses the name comparator (`name-asc` is the legacy value, keep it working). Any unknown/absent sort = relevance (existing default branch).
11. Result count: `const resultCount = state ? filtered.length : unfilteredCount;` — use `resultCount` (not the old count) for `totalPages`, and return `totalCount: resultCount`.
12. The returned `products` page slice must not leak the extra fields: map each item with `({ filterAttributes, brandRef, price, ...product }) => product` after slicing.
13. Return `{ products: pageProducts, totalCount: resultCount, unfilteredCount, facets, priceRange, state: appliedState }`.
14. Do NOT touch `searchProductsAutocomplete`, `scoreProduct` or any helper. Do NOT edit any other file (page/UI are later phases).
15. Commit and push:
   - `git add sanity-cms/lib/products/getFilterFacets.ts sanity-cms/lib/products/searchProducts.ts`
   - `git diff --cached --name-only` MUST list exactly those two files
   - `git commit -m "Search capability: facet counts and filter state for search results"`
   - `git push -u origin search-capability/results-parity`

Done =
- [ ] (a) guard passed
- [ ] (b) `computeCatalogueFacets` exists and `getFilterFacetsFn` just calls it (moved code byte-identical)
- [ ] (c) `searchProductsFull` accepts `state`, filters/sorts `filtered`, returns `unfilteredCount`, `facets`, `priceRange`, `state`; extra fields stripped from items; no-`state` callers unchanged
- [ ] (d) `searchProductsAutocomplete` untouched; diff = the two files only; pushed
```

---

## Phase 3 — Sidebar and mobile sheet can show a subset of groups

```markdown
# Phase 3 — `groupIds` prop on the filter panel (branch `search-capability/results-parity`)

Repo rules: never run tsc, next build, lint, tests, npm run dev, curl, npm install, browser automation. No subagents. No `$(...)`/backticks in shell commands. Human checks live on localhost:3000.

GIT GUARD (run first): `git branch --show-current` MUST print `search-capability/results-parity`; `git rev-parse --show-toplevel` MUST start with `/home/jan/.treehouse/sanglogium-29d78f/`; `git status --porcelain` MUST be empty. Otherwise STOP and report; do not switch branches. Forbidden: git stash, checkout/switch, merge, rebase, reset --hard, force push, `git add -A`/`.`/`-u`. Files you may edit: `app/components/features/filters/FilterSidebar.tsx` and `app/components/features/filters/MobileFilterSheet.tsx` ONLY.

Context: `/search` results span all categories, so only the category-agnostic `commercial` group (Price, Brand, In stock) makes sense there; the headphone-only groups would show zero counts. The panel currently always renders every group of the facet module. Add an OPTIONAL restriction; `/products` pages pass nothing and must render exactly as today.

Tasks:
1. `FilterSidebar.tsx`, interface `FilterSidebarProps`: add `/** Optional: render only these FACET_GROUPS ids (e.g. ['commercial'] for cross-category /search). Omitted = every group, as before. */ groupIds?: string[];`
2. `FilterPanelBody`: destructure `groupIds`. After `const { FACET_GROUPS, facetsForGroup, useClearAllFilters } = getFacetModule(category);` add `const groups = groupIds ? FACET_GROUPS.filter((g) => groupIds.includes(g.id)) : FACET_GROUPS;`
3. Replace BOTH `FACET_GROUPS.map(...)` usages in the JSX (the rail tiles and the panel sections) with `groups.map(...)`. Leave `FACET_GROUPS`/`facetsForGroup` usage elsewhere as is.
4. Hide the jump rail when it would hold a single tile: wrap the `<nav aria-label="Jump to a filter section" …>` element in `{groups.length > 1 && ( … )}`; do not change its classes.
5. `MobileFilterSheet.tsx`: add the same optional `groupIds?: string[];` to `MobileFilterSheetProps`. The component already passes `{...panelProps}` into `FilterPanelBody` — confirm that; if `groupIds` would not be forwarded, forward it explicitly.
6. Do NOT change any className, height, layout or the sidebar's `h-[calc(...)]`, and do not edit any other file. Height-sizing review gate (mandatory, repo rule): these files contain `h-`/`max-h-` classes — re-read your diff against `docs/vertical-space-lg-touch.md` and confirm ZERO sizing class was added, removed or changed.
7. Commit and push:
   - `git add app/components/features/filters/FilterSidebar.tsx app/components/features/filters/MobileFilterSheet.tsx`
   - `git diff --cached --name-only` MUST list exactly those two files
   - `git commit -m "Search capability: filter panel can render a subset of groups"`
   - `git push origin search-capability/results-parity`

Done =
- [ ] (a) guard passed, tree was clean
- [ ] (b) `groupIds` optional on both props; panel + rail filter by it; rail hidden when ≤1 group
- [ ] (c) no sizing class changed; omitted `groupIds` = identical behaviour
- [ ] (d) diff = the two files only; pushed
```

---

## Phase 4 — Sort control matches the catalogue look; pagination stacks in the narrower column

```markdown
# Phase 4 — `SearchSort` restyle + vocabulary, `SearchPagination` breakpoint (branch `search-capability/results-parity`)

Repo rules: never run tsc, next build, lint, tests, npm run dev, curl, npm install, browser automation. No subagents. No `$(...)`/backticks in shell commands. Human checks live on localhost:3000.

GIT GUARD (run first): `git branch --show-current` MUST print `search-capability/results-parity`; `git rev-parse --show-toplevel` MUST start with `/home/jan/.treehouse/sanglogium-29d78f/`; `git status --porcelain` MUST be empty. Otherwise STOP and report; do not switch branches. Forbidden: git stash, checkout/switch, merge, rebase, reset --hard, force push, `git add -A`/`.`/`-u`. Files you may edit: `app/components/features/search/SearchSort.tsx` and `app/components/features/search/SearchPagination.tsx` ONLY. Read-only reference: `app/components/features/filters/SortDropdown.tsx` (do not edit it).

Tasks:
1. `SearchSort.tsx` options become exactly: `relevance` "Relevance", `price-asc` "Price: Low to High", `price-desc` "Price: High to Low", `alpha-asc` "Name: A–Z" (replaces `name-asc`).
2. Current value: `const raw = searchParams.get('sort') ?? 'relevance';` map legacy `name-asc` to `alpha-asc`; if the value is not one of the four options use `relevance`. `handleChange` keeps its current logic (delete `sort` for `relevance`, else set it; always delete `page`; `router.push`).
3. Restyle to match `SortDropdown.tsx` (copy its markup and classes, do not import it): wrapper `flex items-center gap-2`; the label text "Sort by" shown from `sm` up (`hidden sm:inline`) with classes `type-caption text-text-caption whitespace-nowrap`; the `<select>` inside a `relative` div with SortDropdown's exact select classes plus `min-h-11`, and SortDropdown's chevron `<svg>` after it. Keep `aria-label="Sort search results"` on the select and keep it associated with its visible label (wrap in `<label>` as today).
4. `SearchPagination.tsx`: the results column is now narrower (a sidebar sits beside it from 1024px), so the caption + controls row only fits from `xl` (1280px). In the `<nav>` className replace `lg:flex-row lg:justify-between` with `xl:flex-row xl:justify-between`. Keep `mt-8 flex flex-col gap-3 border-t border-border-secondary pt-6 sm:items-center` exactly. If the nav still contains the older `sm:flex-row sm:items-center sm:justify-between`, replace that whole group with `sm:items-center xl:flex-row xl:justify-between` instead. Change no other line in the file.
5. Height-sizing review gate (mandatory): `SearchSort.tsx` gains `min-h-11` — re-read the diff against `docs/vertical-space-lg-touch.md`; confirm the select is ≥44px tall and nothing else changed size.
6. Commit and push:
   - `git add app/components/features/search/SearchSort.tsx app/components/features/search/SearchPagination.tsx`
   - `git diff --cached --name-only` MUST list exactly those two files
   - `git commit -m "Search capability: catalogue-style sort control, pagination stacks below xl"`
   - `git push origin search-capability/results-parity`

Done =
- [ ] (a) guard passed, tree was clean
- [ ] (b) four sort options with `alpha-asc`; legacy `name-asc` still selects "Name: A–Z"
- [ ] (c) markup/classes mirror `SortDropdown`, `min-h-11`, label + aria-label intact
- [ ] (d) pagination nav uses `xl:flex-row xl:justify-between`, nothing else changed
- [ ] (e) diff = the two files only; pushed
```

---

## Phase 5 — Compose the `/search` page: sidebar, chips, toolbar, empty states, skeleton

```markdown
# Phase 5 — `/search` page composition (branch `search-capability/results-parity`)

Repo rules: never run tsc, next build, lint, tests, npm run dev, curl, npm install, browser automation. No subagents. No `$(...)`/backticks in shell commands. Human checks live on localhost:3000. Read `app/(store)/products/page.tsx` first: it is the template for the layout (sidebar + chips + toolbar); copy its structure, not its data flow.

GIT GUARD (run first): `git branch --show-current` MUST print `search-capability/results-parity`; `git rev-parse --show-toplevel` MUST start with `/home/jan/.treehouse/sanglogium-29d78f/`; `git status --porcelain` MUST be empty. Otherwise STOP and report; do not switch branches. Forbidden: git stash, checkout/switch, merge, rebase, reset --hard, force push, `git add -A`/`.`/`-u`. Files you may edit: `app/(store)/search/page.tsx` and `app/(store)/search/SearchResults.tsx` ONLY (quote the parentheses in shell paths).

Tasks:
A. `page.tsx`:
1. Add imports: `loadFilterSort` from `@/lib/catalogue/filterSortParams`; `import type { ProductQueryState } from '@/lib/catalogue/buildProductQuery'`; `SearchResultsSkeleton` from `./SearchResults` (extend the existing `SearchResults` import; remove the now-unused `ProductGridSkeleton` import).
2. Right after the existing `page` parsing, parse the filters: `const filterState = loadFilterSort(query) as ProductQueryState;` (same call `products/page.tsx` makes). Keep the existing `sortValue`/`sort` lines (raw string; `loadFilterSort` does NOT own `sort` on this page).
3. Call `searchProductsFull(q, sort, page, undefined, filterState)`.
4. Suspense fallback becomes `<SearchResultsSkeleton />`. Do not change the wrapper `div` className, `SearchHeader`, `generateMetadata` or the redirect logic.

B. `SearchResults.tsx`:
5. Imports to add: `FilterSidebar` from `@/app/components/features/filters/FilterSidebar`; `MobileFilterSheet` from `@/app/components/features/filters/MobileFilterSheet`; `ActiveFilterChips` from `@/app/components/features/filters/ActiveFilterChips`; `EmptyResults` from `@/app/components/features/products/EmptyResults`; `ProductGridSkeleton` from `@/app/components/skeletons/ProductGridSkeleton`; `resolvePriceBounds` from `@/lib/catalogue/priceBounds`; `isFiltersActive` from `@/lib/catalogue/buildProductQuery`; `SORT_DEFAULT` from `@/lib/catalogue/filterSortParams`.
6. Destructure `const { products, totalCount, unfilteredCount, facets, priceRange, state } = await resultsPromise;`. Replace the current `if (products.length === 0) return <SearchEmpty … />` with `if (unfilteredCount === 0) return <SearchEmpty query={query} />;` (nothing matches the words at all).
7. Build shared props once: `const priceBounds = resolvePriceBounds(priceRange);` `const filtersActive = state ? isFiltersActive({ ...state, sort: SORT_DEFAULT }) : false;` `const panelProps = facets ? { checkboxCounts: facets.groups, booleanCounts: facets.booleans, brandLabels: facets.brandLabels, priceBounds: { min: priceBounds.min, max: priceBounds.max }, isDefaultState: facets.isDefaultState, groupIds: ['commercial'] } : null;`
8. Return this structure (mirror `/products`; keep `getWishlistProductIds` as is):
   - outer `<div className="flex flex-col lg-touch:flex-row lg-desktop:flex-row gap-8">`
   - `{panelProps && <FilterSidebar {...panelProps} />}`
   - `<div className="min-w-0 flex-1">` containing, in order: `{facets && <ActiveFilterChips brandLabels={facets.brandLabels} />}`; the toolbar `<div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-border-secondary pb-4">` holding on the left `<div className="flex items-center gap-3">` with `{panelProps && <MobileFilterSheet {...panelProps} totalCount={totalCount} />}` and the existing count `<span className="type-metadata text-secondary" aria-live="polite">` (same "N product(s)" text), and on the right `<SearchSort />`; then either `<EmptyResults filtersActive={filtersActive} />` when `totalCount === 0` (filters matched nothing), or `<ProductGrid products={products} wishlistProductIds={wishlistProductIds} />` followed by `<SearchPagination totalCount={totalCount} />`.
9. Remove `className="max-w-content"` from `ProductGrid` and delete the comment above it that explains the old width cap (the sidebar column now bounds the grid, exactly like `/products`). Remove the now-unused old toolbar `div`.
10. Export a new server-safe component in the same file: `export function SearchResultsSkeleton()` returning `<div className="flex flex-col lg-touch:flex-row lg-desktop:flex-row gap-8"><div aria-hidden="true" className="hidden w-96 shrink-0 lg-touch:block lg-desktop:block" /><div className="min-w-0 flex-1"><ProductGridSkeleton /></div></div>` — it reserves the sidebar's width so the grid does not change width when results stream in.
11. Do NOT edit any other file. Height/sizing review gate: you added `w-96` (a width, not a height class) and no `h-`/`min-h-`/`max-h-`/`aspect-` class — re-read the diff against `docs/vertical-space-lg-touch.md` and confirm.
12. Commit and push:
   - `git add "app/(store)/search/page.tsx" "app/(store)/search/SearchResults.tsx"`
   - `git diff --cached --name-only` MUST list exactly those two files
   - `git commit -m "Search capability: filters, chips and toolbar on the search results page"`
   - `git push origin search-capability/results-parity`

Done =
- [ ] (a) guard passed, tree was clean
- [ ] (b) `page.tsx` parses `filterState`, passes it (and raw `sort`) to `searchProductsFull`, uses `SearchResultsSkeleton`
- [ ] (c) `SearchResults` renders sidebar (`groupIds: ['commercial']`), mobile sheet, chips, toolbar with count + Sort, grid + pagination; filtered-zero → `EmptyResults`; unfiltered-zero → `SearchEmpty`
- [ ] (d) old `max-w-content` grid cap and its comment removed; skeleton reserves the sidebar width
- [ ] (e) diff = the two files only; pushed
```

---

## Phase 6 — Docs

```markdown
# Phase 6 — document the results filter/sort contract in `docs/search-ux.md` (branch `search-capability/results-parity`)

Repo rules: never run tsc, next build, lint, tests, npm run dev, curl, npm install, browser automation. No subagents. No `$(...)`/backticks in shell commands.

GIT GUARD (run first): `git branch --show-current` MUST print `search-capability/results-parity`; `git rev-parse --show-toplevel` MUST start with `/home/jan/.treehouse/sanglogium-29d78f/`; `git status --porcelain` MUST be empty. Otherwise STOP and report; do not switch branches. Forbidden: git stash, checkout/switch, merge, rebase, reset --hard, force push, `git add -A`/`.`/`-u`. Only file you may edit: `docs/search-ux.md`.

Tasks (keep it lean: no new sections, do not reword existing text):
1. In "Behaviour summary", add ONE bullet after the `/search` bullet: results filters use the same URL contract as the catalogue (`loadFilterSort`), limited to the category-agnostic `commercial` group (Price, Brand, In stock) because results span categories; the sidebar shows from `lg`, a Filters sheet below it; facet counts, the price range and the result list are computed from the same in-memory matched set inside `searchProductsFull`, so counts always equal results; `sort` is NOT parsed by `loadFilterSort` — valid values are `relevance` (default, absent from the URL), `price-asc`, `price-desc`, `alpha-asc` (legacy `name-asc` accepted), validated in `searchProductsFull`.
2. In "Checking it", append one sentence: on `/search?q=hd` tick a brand and confirm the toolbar count equals the brand's sidebar count, `q` survives, Back undoes one step, and Clear all keeps `q`; check the Filters sheet at 390 and 744 and the sidebar at 1024, 1280 and 1920.
3. Commit and push:
   - `git add docs/search-ux.md`
   - `git diff --cached --name-only` MUST list exactly that one file
   - `git commit -m "Docs: search results filters and sort contract"`
   - `git push origin search-capability/results-parity`

Done =
- [ ] (a) guard passed
- [ ] (b) exactly one bullet + one sentence added, nothing else changed
- [ ] (c) diff = `docs/search-ux.md` only; pushed
```

---

## Phase 7 — Open the PR (git/gh only)

```markdown
# Phase 7 — open the PR for `search-capability/results-parity` (no code changes)

Repo rules: no tsc, build, lint, tests, dev server, curl, npm install; no subagents; no `$(...)`/backticks; do NOT run no-mistakes; do NOT wait for CI; do NOT merge or enable auto-merge.

GIT GUARD (run first, one command at a time):
1. `git branch --show-current` MUST print `search-capability/results-parity`; `git rev-parse --show-toplevel` MUST start with `/home/jan/.treehouse/sanglogium-29d78f/`; `git status --porcelain` MUST be empty. Otherwise STOP and report.
2. `git fetch origin`
3. `git diff --name-only origin/main...HEAD` — every listed path MUST be one of: `sanity-cms/lib/products/getFilterFacets.ts`, `sanity-cms/lib/products/searchProducts.ts`, `app/components/features/filters/FilterSidebar.tsx`, `app/components/features/filters/MobileFilterSheet.tsx`, `app/components/features/search/SearchSort.tsx`, `app/components/features/search/SearchPagination.tsx`, `app/(store)/search/page.tsx`, `app/(store)/search/SearchResults.tsx`, `docs/search-ux.md`. Anything else (especially `_project/`, `lib/catalogue/*`, `SearchFieldDesktop.tsx`): STOP and report — do not open the PR.
4. `git log --oneline origin/main..HEAD` MUST show exactly 5 commits (Phases 2–6, messages starting "Search capability" / "Docs"). Anything else: STOP.
5. `git push origin search-capability/results-parity` (plain push; if rejected, STOP — never force).

Tasks:
1. Write the PR description to `/tmp/pr-body-search-capability-results-parity.md` (outside the repo): What changed (filters + sort on `/search` reusing the catalogue contract; commercial group only; counts/results/price range from one matched set; sidebar from `lg`, Filters sheet below; chips; filter-aware empty state; skeleton reserves sidebar width; pagination stacks below `xl`; `SearchSort` restyled with `alpha-asc`); "Not touched: ranking, autocomplete, `/products` behaviour"; the human live-check list below. End with the line: `🤖 Generated with [Claude Code](https://claude.com/claude-code)`.
2. `npx -y gh-axi pr create --base main --head search-capability/results-parity --title "Search capability (1/4): filters and sort on the results page" --body-file /tmp/pr-body-search-capability-results-parity.md`
3. `npx -y gh-axi pr view <number>` — confirm base = `main`, head = `search-capability/results-parity`, changed files ⊆ the allowed list.
4. Report the PR URL and `git status -sb` (must be clean). Do not delete the branch or the worktree.

Human live-check list (put in the PR body; the human runs it on localhost:3000):
- [ ] `/search?q=hd` at 1280: sidebar shows Price slider, Brand list with counts, In stock; grid is 3 columns; toolbar shows count + Sort; no sidebar jump while loading (reload once, watch the first paint).
- [ ] Tick Sennheiser: URL `?q=hd&brand=sennheiser`; toolbar count == Sennheiser's count in the sidebar before ticking; a chip appears; pagination matches; page resets; Back undoes the tick.
- [ ] Price: the slider max/min reflect the "hd" results (not the whole shop); dragging narrows results. In stock only narrows.
- [ ] Sort each option with a brand ticked, then go to page 2: sort and filters persist in the URL; `?sort=name-asc` (typed by hand) still shows "Name: A–Z".
- [ ] Chip ×, sidebar "Clear all": both keep `q=hd`.
- [ ] Force zero (brand + tiny price range): "No products match the selected filters" + working Clear all. `/search?q=zzzzzz` and `/search` (no query) still show the old empty pages.
- [ ] 1024 (2 columns, pagination stacked), 1279 (3 columns, pagination stacked), 1280+ (pagination single row), 1920 (4 columns), laptop 1366×650 (sidebar scrolls inside itself, page scrolls separately).
- [ ] 744 and 390: no sidebar; Filters button opens the sheet with Price/Brand/In stock only (no rail icons); "Show N results" closes it; count + Filters + Sort wrap cleanly at 390/320.
- [ ] Regression: `/products` and `/products/headphones` filters unchanged (all groups, rail icons present); header popup and phone sheet unchanged.
- [ ] Report-only: time from click to updated results with a filter (feels instant or laggy?); whether the customer-rating control appears and works on `/search`.

Done =
- [ ] (a) all guard checks passed (branch, path, clean tree, file whitelist, 5 commits)
- [ ] (b) PR open with base `main`, head `search-capability/results-parity`, body includes the live-check list
- [ ] (c) nothing merged, no force push, worktree clean
```

---

Turn 1 covers: filters + sort parity on `/search` (category-agnostic facets only).
Remaining: turn 2 relevance integrity (one scorer, popup == page), turn 3 brand/category suggestions + category narrowing, turn 4 typo tolerance, recovery and final QA. Turns are sequential: merge this PR before turn 2 starts.
