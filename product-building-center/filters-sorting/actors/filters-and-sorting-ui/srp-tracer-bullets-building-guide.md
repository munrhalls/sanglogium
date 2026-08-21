SRP tracer-bullets building guide — filters & sorting

Purpose: keep every tracer bullet a pluggable lego block, never a knitted-in patch. Read this before writing any code for this feature.

New chat session? Read build-status.md in this same folder FIRST, before this file or anything else. It tracks which bullets are actually done vs. still pending — a fresh session must never assume progress from the file map below; the map shows the plan, build-status.md shows reality. Update build-status.md immediately after each bullet's deletion test passes.

Scope check first
- Only touch files listed as IN SCOPE in style-guide-components-tree.md. If a file isn't on that list, don't edit it.

Lean execution rule — read this before running any command
- After each bullet, the only verification step is: show the running page to a human for a few seconds and get a yes/no. That's it.
- Do NOT run type checks, linting, the build, or test suites while a bullet is still being stood up. They cost real minutes, they catch nothing a five-second glance wouldn't, and they arrive too late to be useful — that's fat on the process, not diligence.
- Do not reach for a heavier command "just to be safe." If the human glance says yes, the bullet is done. Move to the next one.
- Heavier checks (types, lint, build, tests) only ever make sense once real tracer bullets are standing end to end, and only if the task actually needs it — never as a reflex after every small edit.

The one rule

Every bullet's code must already live in the exact file it will occupy in the finished, wired version. Never write filters/sorting UI into a scratch file, a temp component, or inline into page.tsx "just for now." Hardcode props/data where real state will later go — don't invent a placeholder location for the code itself.

File-to-bullet map (build in this order, one at a time, verify visually before the next)

Reveal only the current bullet's row when prompting the agent — do not paste rows for future bullets ahead of time. Seeing the whole table at once is what causes an agent to chain multiple bullets into one pass instead of stopping.

1. Sidebar shell → app/components/features/filters/FilterSidebar.tsx
   Wired into app/(store)/products/[...slug]/page.tsx via the single 240px grid line only. Empty card, no children yet.
   Watch for: don't touch page.tsx beyond that one grid line. Don't pre-wire state/hooks into the empty shell "to be ready."
2. Checkbox filter group → app/components/ui/Checkbox.tsx + CollapsibleFilterGroup inside FilterSidebar.tsx
   Hardcoded option list. Dropped into the shell from step 1.
   Watch for: this is the first shared-pattern component — build its track/state styling so step 3's sliders can reuse the pattern rather than reinvent it.
3. Price + stock sliders → app/components/features/filters/PriceRangeSlider.tsx, StockMinimumSlider.tsx
   Hardcoded values. Dropped into the shell from step 1.
   Watch for: StockMinimumSlider must reuse PriceRangeSlider's track/handle pattern — do not copy-paste the styles between the two.
4. Sort dropdown + count row → app/components/features/filters/SortDropdown.tsx, app/(store)/products/[...slug]/SortAndCountBar.tsx
   Hardcoded selected value and count. Fully separate from the sidebar — its own bullet, its own files.
   Watch for: don't touch page.tsx beyond its own single wiring point, separate from the 240px grid line used in step 1.

Do not skip ahead: don't add step 3's markup before step 2 is visually confirmed. Don't merge two steps into one commit/edit pass even if it seems faster.

STOP after every bullet — literal, not a suggestion

When a bullet's code is written:
1. Output a one-line summary of what was built and where.
2. End your turn there. Do not run tsc, lint, build, or tests. Do not start the next bullet. Do not narrate confidence ("this should look right") as a substitute for showing it.
3. Wait for the human's literal yes/no on the running page before touching anything else.

A bullet is not done until a human has said so out loud — the agent assuming "yes" because the code looks right to itself does not count.

Deletion test — run this, don't reason about it in prose

Only after the human says yes:
1. Remove exactly the file(s) this bullet touched (e.g. `git stash -u` or move them out).
2. Look at the running page and the rest of the site. Does anything outside the filters folder, Checkbox.tsx, and that one grid line in page.tsx break or change visually?
3. Restore the file(s) (e.g. `git stash pop`).

- Nothing else breaks → the bullet is correctly isolated. Move to the next bullet.
- Something else breaks → stop. The bullet leaked a dependency (shared state, inline styles bled into page.tsx, a helper created in the wrong file, an import reached into product-grid code). Re-cut the bullet so it passes the test before continuing.

Answering this test by reasoning about what "should" happen instead of actually removing the files and looking does not count as running it.

Zero-functionality reminder (current phase only)

No hooks, no useFilterNuqs, no useDrawerState, no nuqs, no client state, no event handlers that do anything beyond local visual toggling if truly needed for a static demo. Hardcoded data only. Desktop only — do not add mobile/drawer/tablet styling in this pass.

Red flags — stop and re-cut the bullet if you notice any of these
- Filters/sorting markup appearing directly in page.tsx (beyond the one grid line).
- A new file created outside the IN SCOPE list to "temporarily" hold filter UI.
- Styling or data for one filter component copy-pasted into another instead of the shared component being reused (e.g. price slider styles duplicated into stock slider instead of both using the same track/handle pattern already defined).
- Any import from app/components/features/filters/* or app/(store)/products/[...slug]/{FilterSection,ProductsSection,ProductsToolbar,SortAndCountBar}.tsx appearing inside app/components/features/products/* or StreamedProductGrid.tsx/ProductRow.tsx (or the reverse — product-grid code imported into filters files).
