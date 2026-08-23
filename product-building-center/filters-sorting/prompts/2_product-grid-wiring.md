Phase 0 — Orientation (comprehension check, no code)

Read, in full, before writing any code:
1. product-building-center/filters-sorting/north-star-story.md — specifically Chapters 6-8 (Filters & Sorting's URL-only contract, the Product Grid's job, and the deletion-test proof in both directions).
2. product-building-center/filters-sorting/actors/product-grid-streaming/build-status.md — the actual current state, not the plan (a fresh session must never assume progress from the guide's file map alone).
3. product-building-center/filters-sorting/actors/product-grid-streaming/srp-tracer-bullets-building-guide.md — the three bullets this actor covers.
4. product-building-center/filters-sorting/actors/product-grid-streaming/README.md — this actor's one job and what it must never do.

Reply with:
1. This actor's one job, in one sentence, and the one thing it must never do (assume anything about how the URL got its value, or import from the filters UI actor).
2. The deletion test for this actor, in your own words (give it any URL directly, with no Filters & Sorting UI present — must still stream correct, matching results).
3. Confirmation that you will not run tsc, lint, build, tests, or restart the dev server for bullets 1 and 2 — verification there is a direct fetch/DOM/network check against the running dev server, with concrete before/after evidence shown in your report. For bullet 3 only (debounce/cancel), confirm you understand this is real race-condition logic and needs an actual smoke test in a live browser tab (rapid URL changes, confirm only the latest lands) — still no tsc/lint/build/tests.
Stop after this and wait for me.

grid-query-wiring — bullet 1

Build ONLY bullet 1 from the file-to-bullet map in actors/product-grid-streaming/srp-tracer-bullets-building-guide.md: real sort/filter query wiring.
Files: sanity-cms/lib/products/FilterBuilder.ts (restore from product-building-center/filters_archived/sanity-cms/lib/products/FilterBuilder.ts, unchanged), lib/catalogue/sortParams.ts (new — trimmed from the archived lib/catalogue/filterParams.ts: just SORT_OPTIONS/resolveSort/buildOrderClause and parseFilterEntry, no nuqs parsers, no client hooks), sanity-cms/lib/products/getProductsSlice.ts (getProductsCount/getProductsSlice now call FilterBuilder.buildClause and buildOrderClause and interpolate into the GROQ query).
Also touch app/(store)/products/[...slug]/page.tsx — the ONLY wiring change: read sort and f off searchParams and pass real values into <StreamedProductGrid sort={...} filters={...} /> instead of the hardcoded sort="" / filters=[]. Do not touch page.tsx beyond that.
Never import from ../filters-and-sorting-ui/* or app/components/features/filters/*. Raw searchParams values must go through resolveSort/FilterBuilder's allowlisting before reaching GROQ — never interpolate them raw (GROQ-injection risk).
No human is present this session — do not wait for a screenshot. Verify by fetching the running dev server directly (curl or an equivalent request) with a couple of real query params, e.g. ?f=brand:Sony and ?sort=name:asc, and diff the actual rendered product names/count between requests to prove the query changed, not by reasoning about the code.
Do not run tsc, lint, build, or test suites.
When done, give me a one-paragraph SRP report: which files you touched, confirm page.tsx changes are limited to reading sort/f and passing them through, confirm no import from the filters UI actor, and show the concrete before/after evidence from your verification requests.
Then stop. Do not proceed further. I will review and reply.

Wiring looked correct — run the deletion test now. Remove exactly FilterBuilder.ts, sortParams.ts, and this bullet's page.tsx changes (revert to hardcoded sort=""/filters=[]), tell me what, if anything, changes elsewhere on the live page or site (in particular confirm the Filters & Sorting UI sidebar/checkboxes/sliders/sort dropdown built in filters-ui-visual-only.md still render exactly as before, untouched), then restore the files.
Report the result in one paragraph, then stop and wait for me.

grid-stream-verify — bullet 2

Build ONLY bullet 2 from the file-to-bullet map in actors/product-grid-streaming/srp-tracer-bullets-building-guide.md.
No new files — this is a verification pass confirming StreamedProductGrid.tsx's existing per-row Suspense boundaries still work correctly after grid-query-wiring's query changes.
Do not collapse the per-row Suspense boundaries into one boundary "to simplify" — that would turn streaming back into a single all-or-nothing wall.
No human is present this session — verify via curl/DOM check against the running dev server: confirm a category with more than one row still returns all rows correctly for both a filtered and an unfiltered/sorted request, and that nothing regressed after grid-query-wiring.
Do not run tsc, lint, build, or test suites.
When done, give me a one-paragraph report: what you checked, what you found, confirm no files were changed (this bullet is verification-only) or, if something had regressed, exactly what you fixed and where.
Then stop. I will review and reply.

Verification looked correct — there is nothing to run a deletion test against since no files were added. Confirm that explicitly in one line, then stop and wait for me.

grid-debounce-cancel — bullet 3

Build ONLY bullet 3 from the file-to-bullet map in actors/product-grid-streaming/srp-tracer-bullets-building-guide.md.
Files: lib/catalogue/urlChangeEvents.ts (new — patches history.pushState/replaceState exactly once, idempotent, to also dispatch a locationchange event), app/(store)/products/[...slug]/ProductGridURLSync.tsx (new client component — listens for locationchange/popstate, debounces ~300ms, then calls router.refresh() once the URL has settled).
Wire it into page.tsx via exactly one line: <ProductGridURLSync /> rendered inside <main> near <StreamedProductGrid />. It renders nothing (return null).
ProductGridURLSync must only ever call router.refresh() — never router.push()/replace() (that's the URL-writer's job, out of scope here) — and must not import anything from ../filters-and-sorting-ui/*.
This is real race-condition logic, not markup — per README.md this is the one piece in this whole feature that needs an actual test, not just a glance. No human is present this session: run a real smoke test in a live browser tab against the running dev server — fire several rapid history.pushState calls changing ?sort= well inside the 300ms debounce window, confirm via the network log that exactly ONE request fires for the whole burst and it matches only the final settled URL, and confirm the rendered grid matches only that final state (no flash of an intermediate result).
Do not run tsc, lint, build, or test suites.
When done, give me a one-paragraph report: which files you touched, confirm page.tsx's change is limited to the one <ProductGridURLSync /> line, confirm ProductGridURLSync never calls push/replace, and give the concrete smoke-test result (request count, which URL it matched, what rendered).
Then stop. Do not proceed further. I will review and reply.

Smoke test looked correct — run the deletion test now. Remove exactly urlChangeEvents.ts, ProductGridURLSync.tsx, and its one wiring line in page.tsx, tell me what, if anything, changes elsewhere (in particular confirm rapid filter/sort changes from the sidebar still eventually resolve correctly, just without the debounce/dedup — i.e. every intermediate URL now re-fetches), then restore.
Report the result in one paragraph, then stop and wait for me.
