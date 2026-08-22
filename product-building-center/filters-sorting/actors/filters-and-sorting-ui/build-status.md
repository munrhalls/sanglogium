# Build status — Filters & Sorting UI actor

Read this FIRST in any new chat session before reading anything else in this folder. It's the current source of truth for what's actually done vs. what's still narrative/plan.

## Correction — 2026-08-22 — CODE RESET, IGNORE "done" STATUS BELOW

Everything below this line describes a build that has since been reset. On 2026-08-22 all application source code for this actor was deleted and restored to its pre-build state (commit `1f3962a4`) after a live check showed the built feature didn't actually work — see `product-building-center/HANDOFF.md` for the full explanation. `FilterSidebar.tsx`, `Checkbox.tsx` changes, `PriceRangeSlider.tsx`, `StockMinimumSlider.tsx`, `SortDropdown.tsx`, and `SortAndCountBar.tsx` do NOT exist on disk anymore. Treat every bullet below as **not started**. The plan (file-to-bullet map, style guide, scope rules) below is still valid and unchanged — only the code was wiped, per an explicit decision to keep this folder's planning docs intact while resetting the source.

## Bullet progress (file-to-bullet map in srp-tracer-bullets-building-guide.md)

1. Sidebar shell (FilterSidebar.tsx + 240px grid line in page.tsx) — **done**. Human-confirmed live, deletion test passed.
2. Checkbox filter group (Checkbox.tsx + CollapsibleFilterGroup) — **done**. Human-confirmed live, deletion test passed.
3. Price + stock sliders (PriceRangeSlider.tsx, StockMinimumSlider.tsx) — **done**. Human-confirmed live, deletion test passed.
4. Sort dropdown + count row (SortDropdown.tsx, SortAndCountBar.tsx) — **agent self-verified, pending human review**. Files confirmed on disk:
   - `app/components/features/filters/SortDropdown.tsx`
   - `app/(store)/products/[...slug]/SortAndCountBar.tsx`
   - `page.tsx` wiring: import line + `<SortAndCountBar />` render line, separate from bullet 1's 240px grid line.
   No human was present to glance-confirm, so the agent verified by fetching the rendered page HTML directly (curl against the running dev server) and confirming the actual rendered className output matches style-guide-components-tree.md sections 2 and 9 exactly (sort bar layout classes, select border/focus-ring styling, filter sidebar sticky classes). A live screenshot could not be captured in this environment (the browser pane would not composite frames), so this is DOM/markup verification, not a pixel-level visual glance — a human should still do the actual glance-check later.
   Deletion test run and passed: with SortDropdown.tsx/SortAndCountBar.tsx moved out and their two wiring lines removed from page.tsx, the page still returned HTTP 200, the filter sidebar and all 27 product cards on the page rendered unaffected, and only the sort bar itself disappeared (0 matches for its test id) — no leaked dependency. Files and page.tsx wiring were restored afterward.

## Correction — 2026-08-21

An earlier version of this file recorded bullet 4 as "in progress — build prompt sent, code written." That was wrong: the build prompt had been sent, but no files were ever written. A later session was asked to run bullet 4's deletion test and found nothing to delete — `SortDropdown.tsx` and `SortAndCountBar.tsx` did not exist, and `grep` for them across `app/` returned zero matches. The code described above was written only after that discovery.

Lesson: "build prompt sent" is not "code written." Only record a bullet's files as existing after listing them on disk. A status line inferred from having sent a prompt is exactly the drift the honesty rule below exists to prevent, and it cost a session a fabricated-test near-miss.

## What a new session should do

This actor (Filters & Sorting UI) is complete — there are no bullets left in the map. Next work is the Product Grid + Server actor (`../product-grid-streaming/`).

## Actor complete?

Yes — agent self-verified (see bullet 4 note above on the DOM-based verification method used in place of a screenshot). Bullets 1-3 were previously human-confirmed; bullet 4 is agent self-verified only and still needs an actual human glance-confirm.

## Rule for keeping this file honest

Update this file immediately after each bullet's deletion test passes — not before, not from memory, not by inference. A bullet is only "done" here once both the human glance and the deletion test are actually confirmed, matching srp-tracer-bullets-building-guide.md's stop/deletion-test rules. Verify file existence by listing the files, never by recalling that a prompt was sent.

## Post-reset rebuild progress — started 2026-08-22

This section supersedes the pre-reset bullet list above. After the 2026-08-22 code reset, bullets are being rebuilt from scratch, one at a time.

1. Sidebar shell — **done** (2026-08-22). Files on disk, verified by listing:
   - `app/components/features/filters/FilterSidebar.tsx` (card shell only: sticky, `pt-6`, hidden below 1024px via `lg-touch`/`lg-desktop`, `bg-surface-elevated` + `border-border-secondary` + `rounded-md` + `p-6` + `gap-6`, single `type-overline` "Filters" label, no children/state/hooks).
   - `app/(store)/products/[...slug]/page.tsx`: 4 added lines only, no existing line modified — the import, the 240px two-column grid wrapper `<div>` (the one line the style guide assigns to this scope), `<FilterSidebar />`, and the wrapper's closing `</div>`.
   Human glance-confirmed live on `/products/headphones`.
   Deletion test run and passed: `FilterSidebar.tsx` moved out and `page.tsx` reverted to HEAD, page still returned HTTP 200 with zero error markers, all 99 `product-card` occurrences, breadcrumbs, and pagination rendered unchanged; only the sidebar itself disappeared (`filter-sidebar` and `240px` both dropped to 0 matches). Only diff outside the sidebar was RSC Flight chunk-ID renumbering, not a visual change. Both files restored afterward and the page re-verified at HTTP 200 with the sidebar back.
2. Checkbox filter group — not started.
3. Price + stock sliders — not started.
4. Sort dropdown + count row — not started.
