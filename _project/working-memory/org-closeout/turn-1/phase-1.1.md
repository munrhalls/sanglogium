AXIS org-closeout | TURN 1 of 1 | TASK AREA: enforce the boundary, align the written standard with the code (audit H1 enforcement, M3, M4, M7 rule, L1, L2, L3, L6, L7) | PHASE 1.1 of 5 — prerequisite gate and rename map

WAVE 3 (last). MUST WAIT FOR (all merged to main): org-docs-prune, org-data-boundary, org-checkout-thin-routes, org-app-shell, org-feature-structure, org-oversized-files, org-data-scripts, org-lib-infra, plus the owner's own uncommitted _project/ reorganization (see gate 9).

STANDARD APPLIED: the written standard describes the code that exists and the target that is right, not a stale convention. Where the code changed because the old rule was wrong, the rule changes here.

GOAL
Know exactly what changed so the standard and living docs can be corrected without guessing.

OWNS (only these may be edited, across all five phases)
- CLAUDE.md, AGENTS.md, README.md, eslint.config.mjs, tools/eslint-plugin-sang-logium.cjs (messages only), .gitignore
- the five living docs: docs/vertical-space-lg-touch.md, docs/homepage-structure.md, docs/search-ux.md, docs/post-homepage-product-discovery/catalogue-architecture.md, docs/design-system.md (path fixes only)
- _project/README.md, _project/lessons.md, _project/AI_LESSONS.md
- public/LOGO.svg, public/logo-orbit.svg, public/logo-orbit-white.svg (deletion only); .lavish/** (git rm --cached only)
OFF-LIMITS
- all other code, docs and config.

TASKS (in order)
0. SYNC FIRST: run git fetch origin main. If this branch has no commits of its own run git merge --ff-only origin/main; if it already has commits run git rebase origin/main. git status must be clean.
1. GATE. Every predicate must hold on the synced branch; otherwise STOP and name the unmerged axis:
   1) docs: git ls-files docs/user-account prints nothing; docs/auth/userprofile-atomicity-spec.md exists
   2) data-boundary: git grep -n "_type ==" -- lib app/sitemap.ts prints nothing
   3) checkout: features/checkout/ui/PaymentConfirmed.tsx exists
   4) app-shell: app/suppressWarnings.ts exists and git ls-files "app/(store)/lib" prints nothing
   5) feature-structure: git ls-files features/product-search/ui/field and features/basket/domain/basketStore.ts both list files
   6) oversized: sanity-cms/schemaTypes/productFilterAttributes.ts exists
   7) data-scripts: scripts/filters-proofs exists; git ls-files features/product-filtering | grep __tests__ prints nothing
   8) lib-infra: lib/eventLogger.ts, lib/auth/server.ts, lib/auth/client.ts exist
   9) owner _project/ reorganization: ask the owner in the chat: "Have the _project/ changes (archive, catalogue-integrity, filters-sorting, search, missions removed; project items added) been committed and merged to main?" Do not continue on a guess. If the new folder name contains a space ("project items"), tell the owner the Repository Layout Standard forbids spaces in tracked paths and let them decide before you continue.
2. Build the rename map: git diff -M --name-status 7d8843d7 origin/main, keep only lines starting with R, and save them in a scratch file in your OS temp dir (never in the repo, never committed). Phases 1.4 and 1.5 use it. Also note which files were deleted (D lines).
3. Print the five living docs' dead paths now (reference list for phase 1.4): throwaway node script in the OS temp dir that collects backtick-quoted tokens starting with app/ features/ lib/ sanity-cms/ scripts/ tools/ docs/ data/ public/ _project/ and tests/ from those five docs and from CLAUDE.md, AGENTS.md, README.md, _project/README.md, and prints those that match no tracked path. Save the output in the scratch file too.

DONE CRITERIA
- [ ] all nine gate checks passed (or the run stopped with a clear message)
- [ ] rename map and dead-path list exist in the scratch folder, not in the repo
- [ ] git status is still clean

CONSTRAINTS (apply to every task)
- NEVER run tsc, next build, next lint, eslint, tests, a dev server, npm install/ci, curl against the dev server, or any other build/check command. Verify with git and grep only (throwaway node scripts in your OS temp dir are allowed; never commit them). The owner verifies live and in PR review.
- No $(...) or backticks in shell commands. One command at a time. No subagents.
- Edit only files under OWNS; if a task seems to need another file, STOP and report.
- Print paths as file:// URIs in your reports.
