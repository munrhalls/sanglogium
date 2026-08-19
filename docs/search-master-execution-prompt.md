# Master Execution Prompt — Sang Logium Search (G1–G9)

*2026-08-19. Copy-paste this prompt into an agent session to execute the search improvement
program issue by issue, in priority order. Companion to
`docs/search-professional-audit-gaps.md` (per-gap evidence),
`docs/search-technical-architecture.md` (system trace R1–R7) and
`docs/search-professional-execution-expectations.md` (E1–E12).*

---

## Mission

Execute the search program in `C:\webdev\sang-logium`: 9 gap issues (G1–G9), one at a time,
in the priority order below. Do not parallelize, do not skip, do not touch unrelated issues.
The master issue (`sang-logium-abo`) is coordination-only — no work.

## Ground rules (apply to every issue)

1. Read `AGENTS.md` first — resource discipline: one shared dev server (port 3000), one
   shared CDP browser, build lock for heavy ops, never kill Wispr Flow, targeted tests only.
2. `bd show <id>` before working — the description is the contract: verified `ROOT CAUSE`
   (file:line), pinned `SCOPE` (exact files), `FIX`, `DoD`, `GUARDRAILS`. Do not re-derive,
   do not expand scope.
3. System context — do NOT redesign: Next.js 15 App Router + React 19 + nuqs 2.8.9 + Sanity
   GROQ. Search is catalogue-scoped (`defined(catalogueLocationKeys)`). The search route
   parses `q`/`sort`/`page` ad hoc in `app/(store)/search/page.tsx`; the GROQ queries live
   ONLY in `sanity-cms/lib/products/searchProducts.ts` (`searchProductsAutocomplete`,
   `searchProductsFull`). The category route (`/products`) is the reference implementation
   for shared parsers (`lib/catalogue/searchParams.ts`), page clamping
   (`getProductsByVfsKeys.ts`), link pagination, and SEO noindex — mirror its patterns, do
   not re-invent.
4. Never link beads issues (no `--deps`/`--parent`/`--waits-for`).
5. Verification = the issue's own DoD (targeted `npx vitest run <spec>` / manual checks).
   No full build or full test suites unless the DoD explicitly requires them.

## Execution order (one at a time, top to bottom)

- **P1:** `sang-logium-91k` (G1 sort no-op/wrong) → `sang-logium-cs7` (G2 page clamp)
- **P2:** `sang-logium-8jf` (G3 shared param contract) → `sang-logium-13r` (G4 empty-state
  CTA) → `sang-logium-8jt` (G5 SEO noindex/canonical)
- **P3:** `sang-logium-w8w` (G6 dead Searchbar) → `sang-logium-7p3` (G7 mobile overlay a11y)
  → `sang-logium-1v8` (G8 pagination links) → `sang-logium-dz0` (G9 typing/allowlist dedup)

## Per-issue protocol (follow exactly)

1. `bd show <id>` — read PRIORITY / ROOT CAUSE / SCOPE / FIX / DoD / GUARDRAILS.
2. `bd update <id> --claim`, then `bd update <id> --status in_progress`.
3. Implement the FIX touching ONLY the files in SCOPE. Keep the change minimal and follow
   the codebase's existing patterns. Read each referenced file once; don't re-read others.
4. Run the DoD checks from the issue. If a check fails, fix within SCOPE and re-run until
   green. If genuinely blocked (external dependency, unresolvable ambiguity): leave the
   issue open, `bd comment <id> "blocked: <reason>"`, `bd update <id> --status blocked`,
   then continue to the next issue.
5. On green: `bd note <id> "Implemented: <1-2 line summary>; DoD verified: <commands>."`
   then `bd update <id> --status done`.
6. Before the next issue: confirm no leftover scratch files, no running watchers/browsers.
7. Repeat until all 9 are done. G1 and G3 touch related files — implement G1 first, then
   land G3 on top; if G1 changes `searchProducts.ts` sort resolution, G3 consumes it via the
   shared loader.

## Stop conditions

- Stop after `sang-logium-dz0` (G9) is done. Do not pick up other open board issues
  (e.g. the catalogue-filters issues `sang-logium-bsr`/G1–G18, `sang-logium-fz0`,
  `sang-logium-2de`) — leave them alone.
- The master issue `sang-logium-abo` stays open (coordination only) unless told otherwise.
- If a change might violate an issue's GUARDRAILS or the system context above, stop and ask.
  Do not guess.
- Do not commit, push, or run `bd dolt push` unless explicitly asked.

## Definition of done (whole program)

- All 9 gap issues closed (`done`) with notes; each DoD verified.
- Targeted specs green (`searchProducts.spec.ts`, `SearchPagination.spec.tsx`, any new
  `searchParams` spec); `npx tsc --noEmit` clean for the touched areas.
- No changes outside each issue's SCOPE files; no bead links created.
- On `/search`: sorting actually re-orders results, out-of-range pages never show a false
  "no products", empty-state CTA goes to `/products`, query pages are noindex, mobile
  overlay closes on Escape with focus restore, pagination is link-based, and no `as any` or
  duplicated sort logic remains.
