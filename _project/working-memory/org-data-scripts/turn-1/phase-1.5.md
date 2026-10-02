AXIS org-data-scripts | TURN 1 of 1 | TASK AREA: scripts, proofs and data layout | PHASE 1.5 of 5 — FINAL: cleanup, commit, push, PR

Prerequisite: phases 1.1 to 1.4 done on this branch.

TASKS (in order)
1. If the folder _project/working-memory/org-data-scripts/ exists in your worktree, delete it (rm -r). It must never be staged or committed.
2. git status: only features/product-filtering/{__tests__,config,domain/facetCounts.ts}, scripts/**, sanity-cms/utils, tsconfig.json and data/** may appear. Anything else: revert it and report.
3. git fetch origin main; if main moved, git rebase origin/main.
4. Commit with message: "Move proofs to scripts, share script helpers, separate data/ source from generated (audit M4, M6, M1)". One commit is fine (renames are detected by git).
5. git push -u origin <this branch>.
6. Open ONE PR against main (use npx -y gh-axi; check --help once if unsure; fall back to gh only if gh-axi is unavailable, one at a time). Title: "Scripts, proofs and data layout". Body: the move map (proofs to scripts/filters-proofs, helpers to scripts/lib, corpus to data/products, slice file rename), the deleted log, the pruned tsconfig excludes, the fixed dangling comments, "Audit findings closed: M4, M6 (getClient), M1, M7 (slice module name)", and: "Not touched on purpose: scripts/build-catalogue-index.mjs keeps its own inline Sanity client (standalone prebuild); data/catalogue-index.json keeps its path (runtime imports unchanged). CLAUDE.md still names the old proof and data locations; axis org-closeout rewrites it." Add: "Owner action if sourcing prompts exist: they must now write to data/products/<slice>/."

OWNER LIVE CHECK (put in the PR body)
- localhost:3000: a category page with filters and the header search still work (they read data/catalogue-index.json, unchanged path).
- Optional, owner's call, makes network calls: node --env-file=.env.local scripts/filters-proofs/ae-02-verify-facet-coverage-and-vocab.mjs runs without a module-not-found error.

DONE CRITERIA
- [ ] working-memory folder deleted and not staged
- [ ] branch pushed; one PR open against main
- [ ] PR body has the move map, findings closed, the not-touched note, and the owner checks

CONSTRAINTS
- No build, lint, type-check, test, proof or dev-server command. No $(...) or backticks. One command at a time. No subagents.
