AXIS org-oversized-files | TURN 1 of 1 | TASK AREA: split oversized files at their real seams (audit L4) | PHASE 1.2 of 4 — getHomepageData and the slider primitives

Prerequisite: phase 1.1 done on this branch. Same OWNS / OFF-LIMITS as phase 1.1.

GOAL
sanity-cms/lib/homepage/getHomepageData.ts (482 lines) and features/product-filtering/ui/PriceRangeSlider.tsx (508 lines) each end under about 250 lines, with their reusable parts in named modules.

TASKS (in order)
1. Create sanity-cms/lib/homepage/homepageQueries.ts: move HOMEPAGE_DATA_QUERY (starts about line 14) and HERO_QUERY (about line 211) verbatim, export both, import defineQuery from "next-sanity".
2. Create sanity-cms/lib/homepage/homepageProcessors.ts: move processSpotlightProduct, processSpotlightData and processNewestReleaseData (about lines 254 to 305) verbatim, export all three, with the type imports they need from "@/features/homepage".
3. getHomepageData.ts keeps fetchHeroData, fetchHomepageSections and "export async function fetchHomepageDataBatched()" (same name, same file path: app/(store)/page.tsx imports it) and imports from the two new modules. Result: at most 200 lines.
4. Create features/product-filtering/ui/SliderPrimitives.tsx (first line "use client", as in the original): move verbatim from PriceRangeSlider.tsx the shared pieces from the top of the file down to the end of DualRangeSlider (about lines 1 to 196): the exported constants filterSectionHeaderRow, filterSectionHeaderLabel, filterSectionHeaderAction, filterStateActive, filterStateInactive; TRACK_ACTIVE_FILL, TRACK_REST, THUMB_CLASSES; ResetIcon; ResetButton; FilterSliderSection; DualRangeSlider; and the imports they need. If a constant is also used by the price-specific code, export it from SliderPrimitives and import it in PriceRangeSlider.tsx.
5. PriceRangeSlider.tsx keeps the price-specific logic (PRICE_WRITE_DEBOUNCE_MS, clampToBounds, resolveActiveTier, TierCheck, PremiumTierTrack, PriceRangeSlider) and imports what it needs from "./SliderPrimitives".
6. Fix importers. FilterControls.tsx imports 7 symbols from "./PriceRangeSlider": point them at "./SliderPrimitives" (keep FilterControls' own re-export block). Run git grep -n "PriceRangeSlider'" -- features and git grep -n "PriceRangeSlider\"" -- features; every other file importing these symbols (FilterSidebar.tsx, ProgressiveFilterOptionList.tsx, features/product-filtering/index.ts) either already imports them via "./FilterControls" (then no change) or must be repointed. The exported name PriceRangeSlider itself stays in PriceRangeSlider.tsx.

DONE CRITERIA
- [ ] getHomepageData.ts at most 200 lines, still exports fetchHomepageDataBatched; git grep -n "defineQuery(" -- sanity-cms/lib/homepage shows both queries only in homepageQueries.ts
- [ ] PriceRangeSlider.tsx at most 260 lines; SliderPrimitives.tsx begins with "use client"
- [ ] throwaway node resolver script (OS temp dir, never committed) over features/product-filtering/ui and sanity-cms/lib/homepage prints no unresolved relative import
- [ ] every className string in the moved code still appears exactly once in the repo (spot-check "group/header", THUMB_CLASSES content, TRACK_ACTIVE_FILL value); no className was edited
- [ ] git diff shows moved blocks only plus import/export lines

OWNER LIVE CHECK (for the PR body)
- Homepage / loads all sections; /products/headphones (or any category) filter sidebar: price slider drags both handles, reset works, section headers look identical.

CONSTRAINTS (apply to every task)
- NEVER run tsc, next build, next lint, eslint, tests, a dev server, npm install/ci, curl against the dev server, or any other build/check command. Verify with git and grep only. The owner verifies live on localhost:3000 and in PR review.
- No $(...) or backticks in shell commands. One command at a time. No subagents.
- Moved code stays verbatim. Mandatory height/sizing review: this PR moves classNames under features/**/ui/** without editing them; say so in the PR body.
- Edit only files under OWNS; if a task seems to need another file, STOP and report.
- Print paths as file:// URIs in your reports.
