# Handoff — Filters & Sorting rebuild

Read this file first, before anything else in `filters-sorting/`. Everything below is the current, honest state as of 2026-08-22.

## What we are building

Filters and sorting for `/products/[...slug]` — checkbox filters, sliders, a sort dropdown, and a product grid that streams results — rebuilt from scratch after the old implementation was archived (`product-building-center/filters_archived/`) for being one tangled knot of code where nothing could change without breaking something else. The old visuals were fine; only the wiring underneath was the problem.

## How we are building it

A fixed sequence, in this order, every time:

1. **End-user UX acceptance tests first** — plain "when I do X, I see Y" statements, not code. Already written: [`filters-sorting/end-user-ux-acceptance-tests.md`](filters-sorting/end-user-ux-acceptance-tests.md). This is the actual foundation everything else is checked against.
2. **Salvage what's already correct** — the old implementation's visual styling was design-system-aligned and worth keeping even though its logic wasn't. Already captured: [`filters-sorting/actors/filters-and-sorting-ui/style-guide-components-tree.md`](filters-sorting/actors/filters-and-sorting-ui/style-guide-components-tree.md).
3. **North Star Story, derived from the acceptance tests** — names the actors, gives each exactly one job. Already written: [`filters-sorting/north-star-story.md`](filters-sorting/north-star-story.md), 10 chapters. Four actors: **Filters & Sorting UI** (writes to the URL, redraws itself from the URL), **The URL** (the one shared source of truth), **Product Grid** (reads the URL, shows results, streams progressively), **The Server** (supplies those results). No actor may reach into another's job — they only ever meet at the URL.
4. **A file-to-bullet map per actor** — small vertical-slice tracer bullets, each with an exact scope boundary (only these files, nothing else). Filters & Sorting UI's map: [`srp-tracer-bullets-building-guide.md`](filters-sorting/actors/filters-and-sorting-ui/srp-tracer-bullets-building-guide.md). Product Grid's map: [`srp-tracer-bullets-building-guide.md`](filters-sorting/actors/product-grid-streaming/srp-tracer-bullets-building-guide.md).
5. **One bullet at a time**, via two prompts each (build prompt, then a deletion-test prompt), fed to the agent one at a time — never the whole map at once.

## Why this way, specifically

The old code broke because responsibilities were tangled — one place doing filtering, sorting, fetching, and rendering all at once. Splitting into actors with one job each, connected only through the URL, means any actor can be deleted and the other side keeps working — that's not a nice-to-have, it's the actual test we run (see below) to prove the separation is real and not just claimed on paper. Building in tiny, immediately-checkable slices — rather than a big batch — is what makes it possible to catch a violation the moment it happens instead of discovering it expensively, mid-feature, weeks later.

## The load-bearing process rules

- **Lean execution guard rail — no BS verification.** While a bullet is being built, the ONLY thing that counts as verification is a human looking at the already-running dev server for a few seconds and saying yes or no. No `tsc`, no lint, no build, no test suite, no dev-server restart, no rebuild. Those tools aren't wrong, they're just the wrong tool here — they cost real minutes and catch nothing a glance wouldn't, while eating the time that should go to the live check.
- **Live checks only, on the dev server that's already running** at `localhost:3000/products/headphones`. Next.js hot-reloads on save — never restart it, never re-run `npm run dev`.
- **The deletion test — SRP checked, not just claimed.** After a bullet looks right, actually delete the file(s) it just added, look at the site, confirm nothing outside that bullet's boundary broke, then restore the files. This is run after *every single bullet*, not just at milestones — that's what "almost obsessive" SRP checking means in practice: never trust that a boundary held, always verify it by actually breaking it on purpose.
- **Scope boundary per bullet.** Each bullet names the exact file(s) it may touch. Red flags that mean "stop and re-cut the bullet": filter markup leaking into `page.tsx` beyond its one wiring line, a new file invented outside the approved list, styles copy-pasted between components instead of shared, or an import crossing between the filters folder and the product-grid folder in either direction.
- **Ordered, ready-to-paste prompts, one at a time.** Each slice's build prompt restates its scope and the guard rail (don't assume it's remembered). Only after a human's live "yes" does the matching deletion-test prompt get sent. Never reveal more than the current bullet to the agent — that's what prevents chaining multiple slices into one ungated pass.
- **A status file is the single source of truth, not the conversation.** `build-status.md` in each actor's folder ([filters-and-sorting-ui](filters-sorting/actors/filters-and-sorting-ui/build-status.md), [product-grid-streaming](filters-sorting/actors/product-grid-streaming/build-status.md)) records exactly which bullets are done and how they were verified. A brand-new chat window, with zero memory of prior conversations, reads that file first and picks up exactly where things stood — no re-deriving anything from a long chat history. It's kept honest: a bullet is only marked done once both the live glance and the deletion test actually happened, verified by listing files on disk — never inferred from "a prompt was sent."
- **The full generalized version of this process** (for reuse on the next feature too) lives at [`lean-tracer-bullet-methodology.md`](lean-tracer-bullet-methodology.md) and is mirrored as the top doc in `_project/`.

## Current actual state — read this part carefully

All of the above is the *plan*, and it's solid. The *code* is not where the plan says it should be:

- On 2026-08-22, a live check showed the built feature didn't actually work. Rather than debug on top of a shaky foundation, all application source code for both actors was deleted and reset to its exact pre-build state (git commit `1f3962a4` — confirmed via `git log` to be the last commit with zero filters/sorting app code, purely planning docs).
- **Zero filters/sorting component files exist right now.** `app/components/features/filters/` doesn't exist. No `SortDropdown.tsx`, `FilterBuilder.ts`, `ProductGridURLSync.tsx`, etc.
- Both `build-status.md` files have a correction note at the top flagging this — their bullet-by-bullet history below that note is real history, not fiction, but it no longer reflects what's on disk. Treat every bullet in both files as **not started**.
- The plan itself (acceptance tests, north star story, both file-to-bullet maps, the style guide) needed no changes and is untouched, exactly as the reset was scoped to do.

## What the next session should actually do

Start at bullet 1 of the Filters & Sorting UI actor's file-to-bullet map, following the process above: build prompt → live glance on `localhost:3000/products/headphones` → deletion-test prompt → update `build-status.md` → next bullet. Nothing needs to be re-planned — only rebuilt, one small, checked slice at a time.
