AXIS org-feature-structure | TURN 1 of 1 | TASK AREA: feature-internal structure | PHASE 1.4 of 4 — FINAL: cleanup, commit, push, PR

Prerequisite: phases 1.1 to 1.3 done on this branch.

TASKS (in order)
1. If the folder _project/working-memory/org-feature-structure/ exists in your worktree, delete it (rm -r). It must never be staged or committed.
2. git status: only paths under features/products, features/product-search, features/catalogue, features/basket may appear. Anything else: revert it and report.
3. git fetch origin main; if main moved, git rebase origin/main.
4. Commit with message: "Structure features: group ui folders, move link helpers and basket store to domain, drop dead indirection (audit M2)". One commit is fine.
5. git push -u origin <this branch>.
6. Open ONE PR against main (use npx -y gh-axi; check --help once if unsure; fall back to gh only if gh-axi is unavailable, one at a time). Title: "Feature-internal structure". Body: the folder maps for products/ui and product-search/ui, the moved/deleted files (searchLinks split, basketStore to domain, catalogueNavUtils and catalogueNavTypes removed), "Audit finding closed: M2", the three owner live checks from phases 1.1 to 1.3, and this note: "recentSearches.ts stays in product-search/ui on purpose: it is a browser-storage helper used only by the UI layer. CLAUDE.md still says the basket store lives in ui/; axis org-closeout rewrites it."

DONE CRITERIA
- [ ] working-memory folder deleted and not staged
- [ ] branch pushed; one PR open against main
- [ ] PR body lists the folder maps, findings closed, the note, and the owner live checks

CONSTRAINTS
- No build, lint, type-check, test or dev-server command. No $(...) or backticks. One command at a time. No subagents.
