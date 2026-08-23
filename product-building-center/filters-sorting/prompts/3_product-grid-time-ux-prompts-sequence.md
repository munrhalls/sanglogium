Phase 0 — Orientation (comprehension check, no code)

Read, in full, before touching anything:
1. product-building-center/filters-sorting/prompts/3_products-grid-time-ux-north-star-story.md — the whole file: the six chapters, then the technical deconstruction (actors table, order, stack check, diagram).

Reply with:
1. The scope in one sentence: one URL, `http://localhost:3000/products/headphones`, plain hard load, no filters/sort/pagination in play.
2. The five-gate failure model from Chapter 3, in your own words.
3. The lean rule, confirmed verbatim in your own words: no tsc, no lint, no `npm run build`, no `npm run dev` restart, no test suites, for any bullet below. The dev server is already running and hot-reloads on save. The only trustworthy verification is a fast, direct, live check against that running server — a fetch/network-tab inspection, or a human looking at the page — never an automated rebuild/lint/typecheck pass. A tracer-bullet-sized change live-checked in seconds is worth more than any of those commands.
Stop after this and wait for me.

grid-batch-independence-verify — bullet 1

Verify (and only fix if wrong) actors 4 and 6 from the deconstruction table: each row of products must be its own independent unit — its own `<Suspense>`, its own offset/limit GROQ query — not one query sliced into rows afterward.
Files to inspect: app/(store)/products/[...slug]/StreamedProductGrid.tsx, app/(store)/products/[...slug]/ProductRow.tsx, sanity-cms/lib/products/getProductsSlice.ts.
If already correctly shaped this way, change nothing — say so plainly, don't refactor working code to "improve" it.
Verify live: this fetch runs server-side and won't appear in the browser's Network tab. Add one temporary line at the top of `getProductsSlice` — `console.log(offset, Date.now())` — hard-reload once, and read the dev server's terminal. Confirm three entries, one per offset. Concurrent (correct) looks like all three timestamps clustered within a few milliseconds of each other; sequential (a hidden waterfall) looks like entries spaced roughly one fetch-duration apart, since a truly sequential row 2 wouldn't even start until row 1's fetch had resolved. Remove the log line before reporting done.
No tsc, lint, build, or dev-server restart.
Report in one paragraph: what you found, what (if anything) you changed, and the concrete network evidence.
Then stop. Do not proceed further. I will review and reply.

grid-front-of-line-check — bullet 2

Verify (and only fix if wrong) actor 2: the route's server component must resolve only what it needs to know how many rows exist (total count) before rendering the row slots — nothing slower or unrelated should sit in front of that.
Files to inspect: app/(store)/products/[...slug]/page.tsx, app/(store)/products/[...slug]/StreamedProductGrid.tsx (in particular, whether a wishlist lookup or anything else is awaited above the per-row `<Suspense>` map — that would gate every row on it).
The filter/sort query-building machinery (FilterBuilder, buildOrderClause, the `filters`/`sort` parameters themselves) belongs to a different actor and is load-bearing even when unused on this plain URL — out of scope, do not touch it or flag it as "unrelated slow work."
If there's blocking work ahead of the row slots that doesn't need to be there, trim it to the minimum; if it's already minimal, change nothing.
Verify live: reload the page on the running dev server and confirm the skeleton shell for all rows appears immediately, with no long blank pause before any skeleton shows, and that the initial `loading.tsx` shell transitions into the row-count-aware skeleton set without a jarring flash (a quick swap is fine; a visibly different card count popping in is worth noting, not fixing unless it looks broken).
No tsc, lint, build, or dev-server restart.
Report in one paragraph: what you found, what (if anything) you changed, and what you observed live.
Then stop. Do not proceed further. I will review and reply.

grid-first-batch-speed-check — bullet 3

Verify (and only fix if wrong) actor 6 for row 1 specifically: its query must be small and direct — no unneeded fields, no unnecessary joins — since nothing else in this feature can make a slow first query fast.
Files to inspect: sanity-cms/lib/products/getProductsSlice.ts.
If it's already minimal, change nothing.
Verify live: on the running dev server, time how quickly the first row's real content (not skeleton) appears after a hard reload of `/products/headphones`. Report the approximate time.
No tsc, lint, build, or dev-server restart.
Report in one paragraph: what you found, what (if anything) you changed, and the approximate first-row time you observed.
Then stop. Do not proceed further. I will review and reply.

grid-stream-flush-check — bullet 4

Verify actor 8: nothing between the server resolving a row and the browser receiving it should require seeing the *whole* page first — no full-document postprocessing step sitting in the way. This is a static/config audit only; no live check in this bullet (the one live check for the whole sequence is bullet 5).
`middleware.ts` is already confirmed clean (plain pass-through, no response-body transformation) — no need to re-inspect. `next.config.ts`'s `optimizeCss` was already found and disabled in a prior pass for exactly this failure mode — read the comment at its definition, confirm it's still `false`, no further action needed there.
The one real unaudited surface: `next.config.ts`'s `withSentryConfig(bundleAnalyzer(nextConfig))` wrapper. Check, bounded to one question: does this repo have custom Sentry server instrumentation (`sentry.server.config.ts` / `instrumentation.ts`) that does more than the default build-time wrapping — specifically anything touching response handling? If nothing custom exists beyond the default wrapper, that's a clean result; don't chase further.
If you find something that requires the complete document before it can act: STOP and report it as a blocker — do not disable or change it yourself. Any real fix here is necessarily app-global (no per-route toggle in Next.js), a bigger blast radius than this bullet owns, and needs my explicit sign-off first.
No tsc, lint, build, or dev-server restart.
Report in one paragraph: what you found and, if anything is flagged, exactly what it is and why it needs sign-off.
Then stop. Do not proceed further. I will review and reply.

grid-live-ux-proof — bullet 5

No files to touch — this is the closing proof, matching Chapter 5, and the sequence's one live-timing check.
On the running dev server, with network throttling on, hard-reload `http://localhost:3000/products/headphones` and watch it happen: judge by each row's skeleton flipping to real markup (name/price text), not by photo-load completion (a separate, lazy-load-affected concern owned elsewhere) — confirm row 1 flips within well under a second, row 2 follows visibly after, row 3 follows after that. Row order may vary occasionally under real network conditions — expected, not a failure. The only failure this watches for is a long blank wait followed by everything appearing at once, or any row looking broken/corrupted rather than in its own clean stage.
Check the result against product-building-center/filters-sorting/prompts/3_product-grid-time-ux-end-acceptance-tests.md.
This must be watched live by a human on the running dev server and reported back — not declared solved from reasoning about the code alone.
No tsc, lint, build, or dev-server restart.
Report in one paragraph: exactly what was seen, in order, with rough timing for each row.
Then stop and wait for me.

grid-parallel-shell-fetches — bullet 6

Fix a small latency gap the diagram doesn't show: app/(store)/products/[...slug]/page.tsx currently awaits `getCategoryMetadata` then `getProductsCount` sequentially, even though neither depends on the other's result — both only need `nodeId`/`descendantKeys`, already resolved before either call starts. That's one full extra round-trip of latency in front of the shell, free to remove.
Files to touch: app/(store)/products/[...slug]/page.tsx.
Replace the two sequential awaits with one `Promise.all([...])` firing both concurrently, then destructure the results. Preserve the existing behavior exactly: if `metadata` comes back null, `notFound()` must still fire before anything else renders — don't skip that check, and don't treat a wasted `getProductsCount` call (fired in parallel even when the category turns out not to exist) as a problem to solve; it's just a discarded result in that rare path.
Do not touch app/(store)/products/page.tsx (the all-products route) — it has no per-category metadata lookup, this pattern doesn't apply there, out of scope.
Verify live: on the running dev server, hard-reload a real category URL (e.g. `/products/headphones`) before and after the change. For concrete evidence rather than a feel-check, temporarily wrap the two calls in `console.time`/`console.timeEnd`, read the elapsed ms in the terminal both ways, then remove it — after should be roughly the slower of the two calls, not their sum.
No tsc, lint, build, or dev-server restart.
Report in one paragraph: the diff, confirmation the `notFound()` behavior is unchanged, and the before/after timing you observed.
Then stop and wait for me.
