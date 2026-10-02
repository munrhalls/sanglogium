AXIS org-docs-prune | TURN 1 of 1 | TASK AREA: docs consolidation | PHASE 1.4 of 4 — FINAL: cleanup, commit, push, PR

Prerequisite: phases 1.1 to 1.3 done on this branch.

TASKS (in order)
1. If the folder _project/working-memory/org-docs-prune/ exists in your worktree, delete it (rm -r). It must never be staged or committed.
2. git status: only paths under docs/ may appear (plus nothing else). Anything else: revert it and report.
3. git fetch origin main; if main moved, git rebase origin/main (docs-only changes; resolve conflicts by keeping main's version of any file this axis did not intentionally change).
4. Commit with message: "Prune and consolidate docs (audit H3, L5, M4 docs part)". One commit is fine.
5. git push -u origin <this branch>.
6. Open ONE PR against main (use npx -y gh-axi; check --help once if unsure; fall back to gh only if gh-axi is unavailable, one at a time). Title: "Prune and consolidate docs". Body must list: files deleted (including the docs/testing decision), files renamed (old -> new), images deleted, docs that received a banner (from the 1.3 script), pre-existing broken links left alone, and "Audit findings closed: H3, L5, M4 (docs part)". Add: "Code comments in lib/auth.ts and lib/auth/dal.ts must cite docs/auth/userprofile-atomicity-spec.md; axis org-data-boundary does that."

OWNER LIVE CHECK (put in the PR body)
- Open docs/README.md in the GitHub PR view and click three folder links (auth, checkout, testing): all resolve, no 404.
- Nothing runs on localhost:3000 for this PR.

DONE CRITERIA
- [ ] working-memory folder deleted and not staged
- [ ] branch pushed; one PR open against main
- [ ] PR body lists deletions, renames, banners, findings closed, and the owner check

CONSTRAINTS
- No build, lint, type-check, test or dev-server command. No $(...) or backticks. One command at a time. No subagents.
