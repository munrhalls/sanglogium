AXIS org-lib-infra | TURN 1 of 1 | TASK AREA: lib/ infrastructure placement and naming | PHASE 1.3 of 3 — FINAL: cleanup, commit, push, PR

Prerequisite: phases 1.1 and 1.2 done on this branch.

TASKS (in order)
1. If the folder _project/working-memory/org-lib-infra/ exists in your worktree, delete it (rm -r). It must never be staged or committed.
2. git status: only lib/** renames/deletions and import-line edits in files listed under OWNS of phases 1.1 and 1.2 may appear. Anything else: revert it and report.
3. git fetch origin main; if main moved, git rebase origin/main.
4. Commit with message: "Place lib infrastructure by concern: eventLogger, lib/auth/{server,client}, drop ambient qrcode types (audit M6, M7)". One commit is fine.
5. git push -u origin <this branch>.
6. Open ONE PR against main (use npx -y gh-axi; check --help once if unsure; fall back to gh only if gh-axi is unavailable, one at a time). Title: "lib/ infrastructure placement". Body: old -> new map (lib/dev/event-logger.ts -> lib/eventLogger.ts; lib/auth.ts -> lib/auth/server.ts; lib/auth-client.ts -> lib/auth/client.ts; qrcode.d.ts outcome), the importer count per specifier, "Audit findings closed: M6 (event logger, auth folder, qrcode types; getClient and the standalone prebuild client are handled in org-data-scripts), M7 (module naming)", and the owner live check from phase 1.2. Add: "CLAUDE.md still cites the old auth paths; axis org-closeout rewrites them."

DONE CRITERIA
- [ ] working-memory folder deleted and not staged
- [ ] branch pushed; one PR open against main
- [ ] PR body has the move map, findings closed, the qrcode outcome, and the owner live check

CONSTRAINTS
- No build, lint, type-check, test or dev-server command. No $(...) or backticks. One command at a time. No subagents.
