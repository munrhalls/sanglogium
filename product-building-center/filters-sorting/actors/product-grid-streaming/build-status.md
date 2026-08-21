# Build status — Product Grid + Server actor

Read this FIRST in any new chat session before reading anything else in this folder. It's the current source of truth for what's actually done vs. what's still narrative/plan.

## Bullet progress (file-to-bullet map in srp-tracer-bullets-building-guide.md)

1. Read URL → ask the Server (real sort/filter query wiring) — **agent self-verified, pending human review**. Files: `sanity-cms/lib/products/FilterBuilder.ts` (restored, query logic only, from `product-building-center/filters_archived/sanity-cms/lib/products/FilterBuilder.ts`), `lib/catalogue/sortParams.ts` (new, trimmed sort allowlist + `f` parsing), `sanity-cms/lib/products/getProductsSlice.ts` (now calls `FilterBuilder.buildClause`/`buildOrderClause` and interpolates into the GROQ query), `app/(store)/products/[...slug]/page.tsx` (reads `sort`/`f` off `searchParams`, passes real values to `StreamedProductGrid`, and includes them in the Suspense `filterKey`). No human present, so verified via curl against the running dev server rather than a screenshot: `?f=brand:Sony` dropped the product-card count from 27 to 11, and `?sort=name:asc` changed the rendered product order from the featured default to true alphabetical order ("64 Audio Nio..." first) — confirmed by diffing the actual rendered `<h3>` product-name text between requests, not by reasoning about the code. Both requests returned HTTP 200.
2. Render first batch immediately, stream the rest — **agent self-verified, pending human review**. No new files needed — confirmed the existing `StreamedProductGrid.tsx` per-row `<Suspense>` boundaries (one per `ROW_SIZE`=8 products) still work after bullet 1's query changes; the page continues to return 200 with all rows present for both filtered and unfiltered/sorted requests. Did not regress into a single all-or-nothing boundary.
3. Debounce + cancel stale requests under rapid URL changes — **agent self-verified, pending human review — flagged for real human review, not just a glance**. Files: `lib/catalogue/urlChangeEvents.ts` (new, patches `history.pushState`/`replaceState` once to also dispatch a `locationchange` event, since same-document URL writes fire no native event), `app/(store)/products/[...slug]/ProductGridURLSync.tsx` (new client component, `'use client'`, listens for `locationchange`/`popstate`, debounces 300ms, then calls `router.refresh()` — never `router.push`/`replace`), wired into `page.tsx` via one line (`<ProductGridURLSync />` inside the grid column). See the manual smoke test result below — this is real race-condition logic and a screenshot alone would not have proven it works.

## Manual smoke test result — bullet 3 (debounce + cancel), the one piece needing real review

Ran in a live browser tab against the running dev server (not reasoned about in prose): fired 5 rapid `history.pushState` calls changing `?sort=` every 60ms (name:asc, name:desc, price asc, featured, price desc — the last one settling at `price_data.unit_amount:desc`), well inside the 300ms debounce window used by `ProductGridURLSync`.

Result: network log showed exactly ONE RSC fetch fired for the whole burst — `GET /products/headphones?sort=price_data.unit_amount%3Adesc&_rsc=...` — none of the 4 intermediate sort values ever triggered a request at all. After it resolved, the rendered grid showed products in true price-descending order (Aperio, T+A Solitaire P, Focal Utopia...), matching only the final settled URL. No stale intermediate result was ever visible on screen.

This confirms the debounce suppresses intermediate URL churn and only the latest state is ever asked for — but this was one manual browser-console test, not an automated regression test, and the underlying claim that Next's router supersedes an in-flight fetch on a newer navigation was not independently stress-tested (e.g. under network latency/throttling, or with the *first* of several changes landing slower than the last). A human should still review `ProductGridURLSync.tsx` and `urlChangeEvents.ts` directly and consider adding an automated test before this ships to real traffic.

## What a new session should do

All 3 bullets in the map are built and agent-self-verified. This actor is done from the agent's side; what remains is human review — especially bullet 3 (`ProductGridURLSync.tsx` / `urlChangeEvents.ts`), which is real race-condition logic that only got one manual smoke test, not an automated one.

## Actor complete?

Yes, from the agent's side — all 3 bullets self-verified (see above), including the mandatory manual smoke test for bullet 3. No bullet here has been human-confirmed yet; treat all of it as "agent self-verified, pending human review."

## Rule for keeping this file honest

Update this file immediately after each bullet is self-verified — not before, not from memory, not by inference. Verify file existence by listing the files, never by recalling that code was written.
