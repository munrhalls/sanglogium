AXIS ui-structure · TURN 3 (of 4) · AREA: product-filtering · PHASE 3.1 — Move useFilterParam out of ui/ into model/

PREREQUISITE: turn 2 is committed and pushed on branch ui-structure. Task area is disjoint from turns 1-2.
OWNS (touch only these): features/product-filtering/ui/useFilterParam.ts (moves), features/product-filtering/model/**, features/product-filtering/index.ts (one line), importers inside features/product-filtering. Phase 3.2 owns features/product-filtering/ui/PriceRangeSlider.tsx and FilterControls.tsx.
NEVER TOUCH: features/product-filtering/proofs/**, features/product-filtering/config/**, domain/**, other features, any other file.

SETUP (do first)
1. Read CLAUDE.md and AGENTS.md.
2. git fetch origin; treehouse get --lease, then cd into the printed path.
3. git switch ui-structure; if origin/main moved, git merge origin/main (no rebase, no force-push).

TASKS
1. mkdir features/product-filtering/model, then git mv features/product-filtering/ui/useFilterParam.ts features/product-filtering/model/useFilterParam.ts
2. features/product-filtering/index.ts line 23: './ui/useFilterParam' becomes './model/useFilterParam' (the export name useClearAllFilters stays).
3. grep -rn "useFilterParam" features app. Fix relative importers inside features/product-filtering (./useFilterParam becomes ../model/useFilterParam) and the moved file's own relative imports. If a file outside features/product-filtering imports it by path, STOP and report.

DONE
- [ ] features/product-filtering/model/useFilterParam.ts exists; features/product-filtering/ui/useFilterParam.ts does not
- [ ] grep -rn "ui/useFilterParam" features app returns nothing
- [ ] the export in features/product-filtering/index.ts is unchanged

RULES: Never run build, lint, tsc, tests, dev server, npm install or no-mistakes; never spawn subagents or open a browser; use only git, ls, grep, mkdir, mv and file edits. Never put $(...) or backticks in a shell command; run one command at a time. Use git mv so history follows. Touch only the files listed under OWNS. If any path, line number or string above does not match the repo, STOP and report the exact mismatch (file:line); do not guess and do not re-plan. Report paths as file:// URIs.
