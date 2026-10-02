AXIS org-app-shell | TURN 1 of 1 | TASK AREA: storefront shell cleanup | PHASE 1.3 of 3 — FINAL: cleanup, commit, push, PR

Prerequisite: phases 1.1 and 1.2 done on this branch.

TASKS (in order)
1. If the folder _project/working-memory/org-app-shell/ exists in your worktree, delete it (rm -r). It must never be staged or committed.
2. git status: only app/(store)/**, app/components/**, app/suppressWarnings.ts and features/homepage/{index.ts,domain/emptyHomepageData.ts} may appear. Anything else: revert it and report.
3. git fetch origin main; if main moved, git rebase origin/main.
4. Commit with message: "Clean up the storefront shell: drop homepage shim, split configuration, Client/Server naming (audit M5, M7, L7)". One commit is fine.
5. git push -u origin <this branch>.
6. Open ONE PR against main (use npx -y gh-axi; check --help once if unsure; fall back to gh only if gh-axi is unavailable, one at a time). Title: "Storefront shell cleanup". Body: list every rename/move (old -> new), the removed shim and where its error fallback now lives (EMPTY_HOMEPAGE_DATA), "Audit findings closed: M5, M7 (Client/Server pairs, suppressWarnings), L7 (Shelf bucket)", "No className edited", the owner live check from phases 1.1 and 1.2, and this note: "Not changed on purpose: routes product/[slug] vs products/[...slug] are public URLs (SEO contract); app/components stays where it is (renaming it would churn every import for no functional gain)."

DONE CRITERIA
- [ ] working-memory folder deleted and not staged
- [ ] branch pushed; one PR open against main
- [ ] PR body lists renames, findings closed, the not-changed note, and the owner checks

CONSTRAINTS
- No build, lint, type-check, test or dev-server command. No $(...) or backticks. One command at a time. No subagents.
