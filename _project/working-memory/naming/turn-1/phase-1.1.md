AXIS naming · TURN 1 (of 1) · AREA: role-based names for homepage spotlights and the Shelf layout · PHASE 1.1 — Rename the three numbered product spotlights

WAVE 2 — PREREQUISITES: axis shared-ui AND axis app-data-boundary are merged into main (both edit files this axis edits). Verify on origin/main: shared/ui/carousel/CarouselRoot.tsx exists AND app/(store)/lib/fetchHomepageData.ts does NOT exist. If either check fails, STOP and report. Runs in parallel with: lib-structure, config-split (file-disjoint).
OWNS (touch only these): features/homepage/ui/product-spotlight-1/**, product-spotlight-2/**, product-spotlight-3/** (renamed), features/homepage/index.ts (3 lines), app/(store)/page.tsx. Phase 1.2 owns app/components/layout/general/Shelf.tsx (moved) and app/(store)/basket/page.tsx.
NEVER TOUCH: sanity-cms/**, the Sanity data keys spotlight1/spotlight2/spotlight3 and the spotlightData prop (data contract with the CMS), docs/, any other file.

GOAL
Components named ProductSpotlight1/2/3 carry no meaning. They differ by layout, which the code shows: 1 puts the image column first on md+ (classes order-2 md:order-1, text order-1 md:order-2); 2 puts the text first and the image second (order-1 / order-2); 3 renders over a fractal-ring mask (FRACTAL_RING_MASK). Name them by that role.

SETUP (do first)
1. Read CLAUDE.md and AGENTS.md.
2. git fetch origin; make sure you start from the latest origin/main (fast-forward or pull if behind).
3. treehouse get --lease, then cd into the printed path.
4. git switch -c naming from up-to-date main.

TASKS
1. Renames (git mv folder, then git mv the file inside):
   - features/homepage/ui/product-spotlight-1/ProductSpotlight1.tsx becomes features/homepage/ui/product-spotlight-media-left/ProductSpotlightMediaLeft.tsx
   - features/homepage/ui/product-spotlight-2/ProductSpotlight2.tsx becomes features/homepage/ui/product-spotlight-media-right/ProductSpotlightMediaRight.tsx
   - features/homepage/ui/product-spotlight-3/ProductSpotlight3.tsx becomes features/homepage/ui/product-spotlight-fractal/ProductSpotlightFractal.tsx
2. Inside each renamed file rename the default-exported function and its props interface (ProductSpotlight1Props etc.) to match the new name, and replace the import alias "SpotlightData as Spotlight1Data" by plain SpotlightData with all usages updated (same in all three files; the numeral in the alias is misleading).
3. features/homepage/index.ts: update the three export lines (export { default as ProductSpotlight1 } from './ui/product-spotlight-1/ProductSpotlight1' etc.) to the new export names and paths.
4. app/(store)/page.tsx: update the import list and the three JSX usages to ProductSpotlightMediaLeft, ProductSpotlightMediaRight and ProductSpotlightFractal. Keep the props exactly as they are (spotlightData={data.spotlight1} / spotlight2 / spotlight3).

DONE
- [ ] grep -rnE "ProductSpotlight[123]|product-spotlight-[123]|Spotlight1Data" app features returns nothing
- [ ] data.spotlight1/2/3 and spotlightData are unchanged in page.tsx
- [ ] the three new folders each contain one file with the matching name

RULES: Never run build, lint, tsc, tests, dev server, npm install or no-mistakes; never spawn subagents or open a browser; use only git, ls, grep, mkdir, mv and file edits. Never put $(...) or backticks in a shell command; run one command at a time. Use git mv so history follows. Touch only the files listed under OWNS. If any path, line number or string above does not match the repo, STOP and report the exact mismatch (file:line); do not guess and do not re-plan. Report paths as file:// URIs.
