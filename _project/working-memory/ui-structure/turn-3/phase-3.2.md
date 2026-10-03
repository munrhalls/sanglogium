AXIS ui-structure · TURN 3 (of 4) · AREA: product-filtering · PHASE 3.2 — Split features/product-filtering/ui/PriceRangeSlider.tsx into three modules

PREREQUISITE: phase 3.1 done on branch ui-structure. Stay on that branch.
OWNS (touch only these): features/product-filtering/ui/PriceRangeSlider.tsx, new features/product-filtering/ui/FilterSection.tsx, new features/product-filtering/ui/DualRangeSlider.tsx, features/product-filtering/ui/FilterControls.tsx (its import block only).
NEVER TOUCH: any other file.

GOAL
PriceRangeSlider.tsx (508 lines) is a bag of shared filter-section primitives plus a dual-range slider plus the price component. Split by responsibility; behaviour and markup unchanged.

TASKS
1. Read PriceRangeSlider.tsx. Current layout: "use client" and imports (line 1-16); exported style constants filterSectionHeaderRow, filterSectionHeaderLabel, filterSectionHeaderAction, filterStateActive, filterStateInactive (17-21); ResetIcon (~60), exported ResetButton (~74), exported FilterSliderSection (~100); exported DualRangeSlider (~124-204); clampToBounds (~205), resolveActiveTier (~222), TierCheck (~236), PremiumTierTrack (~267), exported PriceRangeSlider (~317-end).
2. Create FilterSection.tsx ("use client"): the five style constants, ResetIcon (not exported), ResetButton, FilterSliderSection, plus the imports they need.
3. Create DualRangeSlider.tsx ("use client"): DualRangeSlider plus the imports it needs; import any constants or helpers it uses from "./FilterSection".
4. PriceRangeSlider.tsx keeps clampToBounds, resolveActiveTier, TierCheck, PremiumTierTrack and PriceRangeSlider, and imports what it needs from "./FilterSection" and "./DualRangeSlider". Dependency direction must stay FilterSection <- DualRangeSlider <- PriceRangeSlider; if the code would force a cycle, STOP and report.
5. FilterControls.tsx currently has one import block from './PriceRangeSlider' (ends near line 14). Split it by symbol: constants, ResetButton and FilterSliderSection from './FilterSection'; DualRangeSlider from './DualRangeSlider'; PriceRangeSlider (if imported) from './PriceRangeSlider'. grep shows FilterControls.tsx is the only importer; confirm with grep -rn "PriceRangeSlider'" features app.
6. Do not change any JSX, class string, prop name, handler or constant value.

DONE
- [ ] the three files exist and each is under 330 lines
- [ ] every symbol that was exported before is still exported, from exactly one of the three files
- [ ] FilterControls.tsx imports resolve to the right module for every symbol (check each name)
- [ ] no import cycle among the three files

RULES: Never run build, lint, tsc, tests, dev server, npm install or no-mistakes; never spawn subagents or open a browser; use only git, ls, grep and file edits. Never put $(...) or backticks in a shell command; run one command at a time. Touch only the files listed under OWNS. If any path, line number or string above does not match the repo, STOP and report the exact mismatch (file:line); do not guess and do not re-plan. Report paths as file:// URIs.
