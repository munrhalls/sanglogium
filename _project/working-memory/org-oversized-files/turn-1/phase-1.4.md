AXIS org-oversized-files | TURN 1 of 1 | TASK AREA: split oversized files at their real seams | PHASE 1.4 of 4 — FINAL: cleanup, commit, push, PR

Prerequisite: phases 1.1 to 1.3 done on this branch.

TASKS (in order)
1. If the folder _project/working-memory/org-oversized-files/ exists in your worktree, delete it (rm -r). It must never be staged or committed.
2. git status: only sanity-cms/schemaTypes/**, sanity-cms/lib/homepage/**, features/product-filtering/ui/**, features/account/ui/** may appear. Anything else: revert it and report.
3. git fetch origin main; if main moved, git rebase origin/main.
4. Commit with message: "Split oversized schema, query and UI files at their seams (audit L4)". One commit is fine.
5. git push -u origin <this branch>.
6. Open ONE PR against main (use npx -y gh-axi; check --help once if unsure; fall back to gh only if gh-axi is unavailable, one at a time). Title: "Split oversized files". Body: before/after line counts for the six files (productType, orderType, getHomepageData, PriceRangeSlider, AccountActionsClient), the new modules, "Audit finding closed: L4", "facetMap.ts (539 lines) intentionally not split: it is one declarative facet table", the three owner live checks, and the height/sizing statement: "classNames moved verbatim in features/product-filtering/ui and features/account/ui; none edited".

DONE CRITERIA
- [ ] working-memory folder deleted and not staged
- [ ] branch pushed; one PR open against main
- [ ] PR body has the line-count table, findings closed, the facetMap note, and the owner live checks

CONSTRAINTS
- No build, lint, type-check, test or dev-server command. No $(...) or backticks. One command at a time. No subagents.
