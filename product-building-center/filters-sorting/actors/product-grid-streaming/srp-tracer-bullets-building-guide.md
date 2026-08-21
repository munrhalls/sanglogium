SRP tracer-bullets building guide — Product Grid + Server

Purpose: keep every tracer bullet a pluggable lego block, never a knitted-in patch. Read this before writing any code for this actor. Written in the same shape as `../filters-and-sorting-ui/srp-tracer-bullets-building-guide.md` — read that file for the full rationale behind the discipline below; this file only restates what's specific to this actor.

New chat session? Read build-status.md in this same folder FIRST, before this file or anything else. It tracks which bullets are actually done vs. still pending — a fresh session must never assume progress from the file map below; the map shows the plan, build-status.md shows reality.

Scope check first
- This actor is "The Product Grid" (working with "The Server") from ../../north-star-story.md. Its only job: read the URL, ask the Server for matching results, show the first batch immediately and stream the rest, and under rapid URL changes make sure only the request matching the latest URL ever lands on screen.
- It must never import from `../filters-and-sorting-ui/*`, never assume anything about how the URL got its value, and must never block or slow down that UI's own responsiveness.
- Reuse existing plumbing rather than inventing new fetch infrastructure: `data/catalogue.ts` (VFS key resolution), `sanity-cms/lib/products/getProductsSlice.ts` / `getProductsCount` (already accept `sort`/`filters` params, currently unused by the query itself), `StreamedProductGrid.tsx` / `ProductRow.tsx` (already stream per-row via Suspense). The GROQ order/filter-clause logic that used to drive `sort`/`filters` was archived, not deleted — it lives in git history (commit `536aecba~1`) and in `product-building-center/filters_archived/sanity-cms/lib/products/FilterBuilder.ts`. Only its query logic gets resurrected here, never its old coupling (no nuqs client hooks, no `useFilterNuqs`, no direct imports from the old filters UI files).

Lean execution rule — same as the other actor
- After each bullet, the only verification step is: show the running page to a human for a few seconds and get a yes/no. No human is present this session, so the agent substitutes a screenshot/DOM check and logs it explicitly as "agent self-verified, pending human review" — never as human-confirmed.
- Do NOT run type checks, linting, the build, or test suites while a bullet is still being stood up.
- One exception, called out in README.md: the debounce + stale-request-cancellation logic (bullet 4) is real race-condition logic, not markup. It gets an actual smoke test (rapid URL changes, confirm only the latest lands), not just a glance.

File-to-bullet map (build in this order, one at a time, verify before the next)

1. Read URL → ask the Server (real sort/filter query wiring)
   - `sanity-cms/lib/products/FilterBuilder.ts` — restored from `product-building-center/filters_archived/sanity-cms/lib/products/FilterBuilder.ts` (GROQ filter-clause builder, unchanged).
   - `lib/catalogue/sortParams.ts` — new, trimmed from the archived `lib/catalogue/filterParams.ts`: just the category-page sort allowlist (`SORT_OPTIONS`, `resolveSort`, `buildOrderClause`) and the `f` filter-array parsing (`parseFilterEntry`). No nuqs parsers, no client hooks — this file is consumed only by server code in this actor.
   - `sanity-cms/lib/products/getProductsSlice.ts` — `getProductsCount`/`getProductsSlice` now call `FilterBuilder.buildClause(filters)` and `buildOrderClause(sort)` and interpolate them into the GROQ query (this is exactly what commit `536aecba~1` did before the archival).
   - `app/(store)/products/[...slug]/page.tsx` — the ONLY wiring change: read `sort` and `f` off `searchParams` (already receives `searchParams`, just wasn't reading these two keys) and pass real values into `<StreamedProductGrid sort={...} filters={...} />` instead of the hardcoded `sort=""` / `filters=[]`.
   Watch for: don't touch page.tsx beyond reading those two keys and passing them through. Don't add UI here — this bullet is pure data-plumbing.

2. Render first batch immediately, stream the rest
   - No new files. This is already true of the existing architecture: `StreamedProductGrid.tsx` wraps each `ROW_SIZE`-row `ProductRow` in its own `<Suspense>` boundary, so the first row's fallback resolves and paints as soon as its own fetch completes, independent of later rows. This bullet is a verification pass, not new code: confirm (via curl/DOM check, since a human isn't present) that a category with more than one row still shows a skeleton-then-content sequence per row, and that this didn't regress after bullet 1's query changes.
   Watch for: do not collapse the per-row Suspense boundaries into one boundary "to simplify" — that would turn streaming back into an all-or-nothing wall.

3. Debounce + cancel stale requests under rapid URL changes
   - `app/(store)/products/[...slug]/ProductGridURLSync.tsx` — new, small client component. Watches the URL (via a `popstate` listener plus a patched `history.pushState`/`replaceState` so it also notices same-document URL writes that don't fire `popstate`), debounces reacting to changes by ~300ms, and calls `router.refresh()` once the URL has settled. This is what lets a future Filters & Sorting UI write the URL instantly (its own job, per the north star) while this actor is the one that "waits a beat" before asking the Server again — exactly the division of labor the north star assigns.
   - `lib/catalogue/urlChangeEvents.ts` — new, tiny shared util: patches `window.history.pushState`/`replaceState` exactly once (idempotent) to also dispatch a `locationchange` event, since browsers don't provide one natively. Isolated here so it's reusable and testably separate from the debounce logic itself.
   - Wired into `page.tsx` via one line: `<ProductGridURLSync />`, rendered inside `<main>` near `<StreamedProductGrid />`. It renders nothing (`return null`) — purely a side-effect watcher.
   - Cancellation: rather than manually tracking `AbortController`s against Next's internal RSC fetch (not exposed to app code), this relies on the documented behavior that `router.refresh()` supersedes an in-flight one — combined with the debounce meaning intermediate URL states during a rapid-fire burst never trigger a request at all, only the final settled URL does. This is the piece flagged in README.md as needing real human review, not just a glance.
   Watch for: this file must only ever call `router.refresh()` — never `router.push()`/`replace()` (that's the URL-writer's job, out of scope here) — and must not import anything from `../filters-and-sorting-ui/*`.

Do not skip ahead: don't add bullet 3's watcher before bullet 1's real query wiring is confirmed working (there's nothing meaningful to re-fetch on until sort/filters actually affect the query).

STOP after every bullet — literal, not a suggestion
Same rule as the other actor: output a one-line summary, end the turn, do not chain into the next bullet, do not run tsc/lint/build/tests mid-bullet.

Deletion test — per README.md
Give this actor any URL directly, with no Filters & Sorting UI present, and it must still stream correct, matching results. After each bullet, remove exactly that bullet's file(s), confirm nothing outside them breaks, then restore.

Red flags — stop and re-cut the bullet if you notice any of these
- Any import from `../filters-and-sorting-ui/*` or from `app/components/features/filters/*` appearing in this actor's files (or the reverse).
- Raw `searchParams` values reaching GROQ without going through `resolveSort`/`FilterBuilder`'s allowlisting/sanitization (GROQ-injection risk).
- `ProductGridURLSync` calling `router.push`/`replace` instead of only `router.refresh()` — that would mean it started writing the URL, which is not its job.
- Suspense boundaries collapsed into one, turning streaming back into a single wall of results.
