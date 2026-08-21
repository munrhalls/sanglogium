# Deploy report — filters-sorting session, 2026-08-21 (unattended run)

No failures. Every phase completed and was verified with actual evidence, not just an exit code. Read the "still needs human review" section before trusting this in front of real traffic.

## What got built

### Filters & Sorting UI actor — bullet 4 closed out (actor now complete on the agent's side)

- `app/components/features/filters/SortDropdown.tsx`, `app/(store)/products/[...slug]/SortAndCountBar.tsx` already existed on disk from before this session (code written, never glance-confirmed or deletion-tested).
- No human was present to glance-confirm, so verification was done by fetching the rendered page HTML from the running dev server (curl) and diffing the actual output classNames against `style-guide-components-tree.md` sections 2 and 9 — confirmed exact match (sort bar layout, select border/focus-ring styling, sidebar sticky classes). A screenshot could not be captured in this environment (the browser preview pane would not composite frames), so this is DOM/markup verification, not a pixel-level visual glance.
- Deletion test run and passed: with the two files moved out and their wiring removed from `page.tsx`, the page still returned HTTP 200 and rendered the filter sidebar and all 27 product cards unaffected — only the sort bar itself disappeared. Files and wiring restored afterward.
- Logged in `actors/filters-and-sorting-ui/build-status.md` as **agent self-verified, pending human review** — not "human-confirmed." A prior session had also left an honesty correction in that file (a bullet had once been marked "in progress" before any code existed) — worth reading if you want the full history.

### Product Grid + Server actor — built from scratch this session (new actor, guide + 3 bullets)

Wrote `actors/product-grid-streaming/srp-tracer-bullets-building-guide.md` and `build-status.md` first (Phase B), then built:

1. **Read URL → ask the Server (real sort/filter query wiring).** The GROQ order/filter logic for this feature had been archived (not deleted) in a prior session — restored the *query logic only* (no old coupling) from `product-building-center/filters_archived/sanity-cms/lib/products/FilterBuilder.ts` and git history (`536aecba~1`) into `sanity-cms/lib/products/FilterBuilder.ts` (new) and `lib/catalogue/sortParams.ts` (new, trimmed — sort allowlist + `f`-param parsing only, no nuqs/client hooks). Wired `getProductsSlice.ts`/`getProductsCount` to actually use them in the GROQ query, and `page.tsx` now reads `sort`/`f` off `searchParams` instead of hardcoding `sort=""`/`filters=[]`.
   - Verified against the running dev server (not reasoned about): `?f=brand:Sony` dropped the product-card count from 27 to 11; `?sort=name:asc` changed the rendered product order to true alphabetical ("64 Audio Nio..." first) — confirmed by diffing actual rendered `<h3>` text between requests.
2. **Render first batch immediately, stream the rest.** No new code — confirmed the existing `StreamedProductGrid.tsx` per-row `Suspense` architecture (already built pre-session) still streams correctly after bullet 1's query changes, and did not regress into one all-or-nothing boundary.
3. **Debounce + cancel stale requests under rapid URL changes.** New: `lib/catalogue/urlChangeEvents.ts` (patches `history.pushState`/`replaceState` once to emit a `locationchange` event, since same-document URL writes fire no native browser event) and `app/(store)/products/[...slug]/ProductGridURLSync.tsx` (client component, debounces 300ms, then calls `router.refresh()` only — never writes the URL itself). Wired into `page.tsx` via one line.
   - This is real race-condition logic, not markup, so it got an actual smoke test rather than a glance: fired 5 rapid `history.pushState` sort changes 60ms apart in a live browser tab. Result — exactly ONE network request fired for the whole burst (the final settled `sort=price_data.unit_amount:desc`), none of the 4 intermediate values ever triggered a request, and the rendered grid ended up matching only the final state. No stale intermediate result ever appeared on screen.
   - **Flagged for real human review** (see below) — one manual test, not an automated one; the claim that Next's router supersedes an in-flight fetch on a newer navigation was not independently stress-tested under latency/throttling.

All bullets logged in `actors/product-grid-streaming/build-status.md` as **agent self-verified, pending human review**.

## What still needs human review

- **`app/(store)/products/[...slug]/ProductGridURLSync.tsx` and `lib/catalogue/urlChangeEvents.ts`** — the debounce/cancel logic. One manual browser smoke test passed cleanly, but it was not stress-tested under real network latency or with out-of-order request completion. This is the one piece of real logic built this session; everything else is markup/query-plumbing.
- **Bullet 4 of Filters & Sorting UI** (`SortDropdown.tsx`/`SortAndCountBar.tsx`) — verified via DOM/markup diff against the style guide, not an actual human glance at a rendered screenshot (screenshot capture was not available in this environment).
- Note: the sort dropdown itself is still non-functional (hardcoded `defaultValue`, no `onChange`) — that's intentional, out of scope for the Filters & Sorting UI actor's current bullets (see its "zero-functionality" rule), but it means a user changing the dropdown today does nothing yet. The `sort`/`f` URL contract this session wired up is ready for whenever that gets connected.

## npm run build

Passed clean on the first attempt, exit code 0. Compiled successfully, type checks passed, all 54 routes generated including `/products/[...slug]`. No fixes were needed, so there is no separate fix-only commit.

## Commit

`07749f74374b967293686f0b5f24752355c4bf90` — "filters-sorting: close out sort/count bar bullet, wire real sort/filter GROQ query, add debounced product-grid URL sync"

Pushed to `origin/main` and confirmed with `git status` — branch was up to date with remote before deploy started.

## Production deploy

`vercel --prod` — deployment ready, aliased to **https://www.sanglogium.com** (deployment id `dpl_8GJXuv1YxR7NfxBR9PqnQTiqv9dn`).

## Live verification (the part that actually proves it works)

- `GET https://www.sanglogium.com/products/headphones` → HTTP 200. Rendered content confirmed present: 27 product cards, the filter sidebar, the sort-and-count bar, 105 occurrences of "headphones" in the page.
- `GET https://www.sanglogium.com/products/headphones?sort=name%3Aasc` → HTTP 200, product order changed to true alphabetical ("64 Audio Nio..." first) — same result as local dev, confirming the new query wiring actually shipped and works in production, not just locally.
- `GET https://www.sanglogium.com/products/headphones?f=brand%3ASony` → HTTP 200, product-card count dropped from 27 to 11 — filter wiring also confirmed live.

No rollback was needed — verification passed on the first check.
