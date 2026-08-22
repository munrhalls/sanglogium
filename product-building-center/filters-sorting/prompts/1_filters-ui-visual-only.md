Phase 0 — Orientation (comprehension check, no code)

Read product-building-center/filters-sorting/north-star-story.md and product-building-center/filters-sorting/actors/filters-and-sorting-ui/srp-tracer-bullets-building-guide.md in full. Do not write any code yet.
Reply with:
1. The four actors and their one job each.
2. The deletion test, in your own words.
3. Confirmation that during bullet execution you will not run tsc, lint, build, tests, or restart the dev server — the only verification is a human glance at the running page.
Stop after this and wait for me.

filters-sidebar-shell — bullet 1

Build ONLY bullet 1 from the file-to-bullet map in srp-tracer-bullets-building-guide.md: the sidebar shell.
File: app/components/features/filters/FilterSidebar.tsx — empty card, no children, styled per style-guide-components-tree.md.
Wire it into app/(store)/products/[...slug]/page.tsx via a single 240px grid line — that is the ONLY line you may touch in page.tsx.
No hooks, no state, no nuqs, no event handlers, no data fetching. Hardcoded/empty only. Desktop only.
Do not run tsc, lint, build, tests, or restart the dev server.
When done, give me a one-paragraph SRP report: which files you touched, confirm page.tsx has only the one grid-line change, confirm no product-grid/server code was touched or imported.
Then stop. Do not proceed further. I will check localhost:3000/products/headphones and reply.
The sidebar shell looked correct — run the deletion test now. Remove exactly FilterSidebar.tsx and the one grid line you added in page.tsx (e.g. git stash -u or manual revert), tell me what, if anything, changes elsewhere on the live page or site, then restore the files.
Report the result in one paragraph, then stop and wait for me.

filters-checkbox-group — bullet 2

Build ONLY bullet 2 from the file-to-bullet map: the checkbox filter group.
Files: app/components/ui/Checkbox.tsx + a CollapsibleFilterGroup inside FilterSidebar.tsx.
Hardcoded option list, dropped into the shell from bullet 1. Build the track/state styling so it's genuinely reusable — bullet 3's sliders will need to share this pattern, not reinvent it.
No hooks, no state beyond local visual toggling if truly needed for the static demo, no nuqs. Desktop only.
Do not run tsc, lint, build, tests, or restart the dev server.
When done, give me a one-paragraph SRP report: which files you touched, confirm nothing outside the filters folder and Checkbox.tsx changed, confirm no product-grid/server code was touched or imported.
Then stop. I will check the live page and reply.
Checkboxes looked correct — run the deletion test. Remove exactly Checkbox.tsx and the CollapsibleFilterGroup addition to FilterSidebar.tsx, tell me what, if anything, changes elsewhere, then restore.
Report in one paragraph, then stop and wait for me.

filters-sliders — bullet 3

Build ONLY bullet 3 from the file-to-bullet map: price + stock sliders.
Files: app/components/features/filters/PriceRangeSlider.tsx, StockMinimumSlider.tsx.
Hardcoded values, dropped into the shell from bullet 1. StockMinimumSlider MUST reuse PriceRangeSlider's track/handle pattern — do not copy-paste styles between the two.
No hooks, no state, no nuqs. Desktop only.
Do not run tsc, lint, build, tests, or restart the dev server.
When done, give me a one-paragraph SRP report: which files you touched, confirm the two sliders share the same underlying pattern rather than duplicated styles, confirm no product-grid/server code was touched.
Then stop. I will check the live page and reply.
Sliders looked correct — run the deletion test. Remove exactly PriceRangeSlider.tsx and StockMinimumSlider.tsx, tell me what, if anything, changes elsewhere, then restore.
Report in one paragraph, then stop and wait for me.

filters-sort-bar — bullet 4

Build ONLY bullet 4 from the file-to-bullet map: sort dropdown + count row.
Files: app/components/features/filters/SortDropdown.tsx, app/(store)/products/[...slug]/SortAndCountBar.tsx.
Hardcoded selected value and count. This is fully separate from the sidebar — its own bullet, its own files. It has its own single wiring point in page.tsx, distinct from bullet 1's 240px grid line — do not touch page.tsx beyond that one point.
No hooks, no state, no nuqs. Desktop only.
Do not run tsc, lint, build, tests, or restart the dev server.
When done, give me a one-paragraph SRP report: which files you touched, confirm page.tsx changes are limited to this bullet's single wiring point, confirm no product-grid/server code was touched.
Then stop. I will check the live page and reply.
Sort bar looked correct — run the deletion test. Remove exactly SortDropdown.tsx, SortAndCountBar.tsx, and this bullet's wiring line in page.tsx, tell me what, if anything, changes elsewhere, then restore.
Report in one paragraph, then stop and wait for me.
