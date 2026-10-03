AXIS lib-structure · TURN 1 (of 1) · AREA: lib/ roles, one file-name casing rule, dead ambient types · PHASE 1.3 — Wrap-up: clean up, commit, push, open the PR

PREREQUISITE: phases 1.1 and 1.2 done on branch lib-structure.
OWNS: git only.

TASKS
1. Delete every file you created or were given to hold this axis's phases/tasks (anything under _project/working-memory/lib-structure/ in your worktree, scratch notes, briefs). Never commit them. Delete nothing else; leave every other folder under _project/working-memory/ alone.
2. git status: only moves/edits from phases 1.1 and 1.2 may appear; nothing under _project/working-memory/lib-structure/.
3. Commit with message: "refactor(lib): lib/auth/{server,client}, lib/sanity image helpers, camelCase eventLogger; drop redundant qrcode typings".
4. git push -u origin lib-structure.
5. Open the PR with npx -y gh-axi (pr create). Title: "Tidy lib/: auth folder, sanity image helpers, casing". Body: what changed per phase; each done-criterion marked met/unmet; one line stating build/lint/type-check/tests were deliberately not run (repo rule); the minimal human check below.
   Minimal human check (localhost:3000): product images load on / and a product page (next/image loader path); /sign-in works and /account/** loads for a signed-in user; the 2FA setup QR renders in account security; /checkout/payment still loads.
6. treehouse return <worktree path>. Stop. Do not merge.

RULES: Never run build, lint, tsc, tests, dev server, npm install or no-mistakes; never spawn subagents or open a browser. Never put $(...) or backticks in a shell command; run one command at a time. If anything above does not match the repo, STOP and report the exact mismatch. Report paths as file:// URIs.
