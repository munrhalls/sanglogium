AXIS org-data-scripts | TURN 1 of 1 | TASK AREA: scripts, proofs and data layout (audit M4, M6 getClient, M1) | PHASE 1.1 of 5 — proofs out of features/

WAVE 1. Runs in parallel with: org-docs-prune, org-data-boundary, org-checkout-thin-routes, org-app-shell, org-feature-structure, org-oversized-files. Waits for nothing. Blocks: org-closeout.

STANDARD APPLIED: a folder named __tests__ holds tests; hand-run proof scripts are scripts and live in scripts/. Committed logs do not exist. Shared script helpers live in scripts/lib/. The old CLAUDE.md line keeping the proofs in features/product-filtering/__tests__ is stale; axis org-closeout rewrites it.

GOAL
features/product-filtering/__tests__ is gone; its proof scripts, helper and result data live under scripts/ with every relative path rewritten.

OWNS (only these may be edited)
- features/product-filtering/__tests__/** , features/product-filtering/config/** , features/product-filtering/domain/facetCounts.ts (one comment)
- scripts/** , sanity-cms/utils/** , tsconfig.json , data/**
OFF-LIMITS
- features/product-filtering/ui/**, features/product-filtering/index.ts (axis org-oversized-files), eslint.config.mjs, docs/**, CLAUDE.md/AGENTS.md (axis org-closeout), everything else.

TASKS (in order)
0. SYNC FIRST: run git fetch origin main. If this branch has no commits of its own run git merge --ff-only origin/main; if it already has commits run git rebase origin/main. git status must be clean before you touch anything.
1. git rm features/product-filtering/__tests__/data/acc-subset-proof.log (a committed log).
2. git mv features/product-filtering/__tests__/proofs scripts/filters-proofs, then git mv features/product-filtering/__tests__/data scripts/filters-proofs/data. The folder features/product-filtering/__tests__ must no longer exist.
3. git mv scripts/filters-proofs/sanityRaw.mjs scripts/lib/sanityRaw.mjs (new folder scripts/lib/). Replace its header comment claim "for the filter/sort proof scripts in this folder ONLY" with: shared by scripts/filters-proofs and scripts/catalogue-integrity; reads Sanity connection info from env; imports no repo code. Keep the rest.
4. Rewrite relative paths in scripts/filters-proofs/*.mjs (they now sit two levels below the repo root):
   - "./sanityRaw.mjs" -> "../lib/sanityRaw.mjs"
   - new URL('../data/<file>.json', import.meta.url) -> new URL('./data/<file>.json', import.meta.url)
   - '../../config/facetMap.ts' -> '../../features/product-filtering/config/facetMap.ts'
   - '../../domain/buildProductQuery.ts' -> '../../features/product-filtering/domain/buildProductQuery.ts'
   - '../../../../data/catalogue-index.json' -> '../../data/catalogue-index.json'
   Also update every run-instruction comment and console message that names features/product-filtering/__tests__/ (including the "--loader ./features/product-filtering/__tests__/proofs/tsExtLoader.mjs" lines) to scripts/filters-proofs/.
5. Write a throwaway node script in your OS temp dir (never committed) that, for every .mjs under scripts/, resolves each relative import specifier and each new URL('<relative>', import.meta.url) literal against the file's own folder and prints any target that does not exist. Run it; it must print nothing for scripts/filters-proofs and scripts/lib (scripts/catalogue-integrity is fixed in phase 1.2, so ignore its output for now).

DONE CRITERIA
- [ ] git ls-files features/product-filtering | grep __tests__ prints nothing; git ls-files scripts/filters-proofs lists the 8 .mjs files and scripts/filters-proofs/data lists the 3 json files, with no .log
- [ ] scripts/lib/sanityRaw.mjs exists and no sanityRaw.mjs remains in scripts/filters-proofs
- [ ] git grep -n "__tests__" -- scripts features prints nothing
- [ ] the resolver script prints nothing for scripts/filters-proofs and scripts/lib
- [ ] all moves are pure renames except the path/comment edits listed (git diff -M --stat)

CONSTRAINTS (apply to every task)
- NEVER run tsc, next build, next lint, eslint, tests, a dev server, npm install/ci, curl against the dev server, any proof script, or any other build/check command. Verify with git, grep and the throwaway resolver only. The owner verifies in PR review.
- No $(...) or backticks in shell commands. One command at a time. No subagents.
- Move with git mv only; fix every reference in the same phase.
- Edit only files under OWNS; if a task seems to need another file, STOP and report.
- Print paths as file:// URIs in your reports.
