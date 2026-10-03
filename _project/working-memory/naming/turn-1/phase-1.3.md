AXIS naming · TURN 1 (of 1) · AREA: role-based names for homepage spotlights and the Shelf layout · PHASE 1.3 — Wrap-up: clean up, commit, push, open the PR

PREREQUISITE: phases 1.1 and 1.2 done on branch naming.
OWNS: git only.

TASKS
1. Delete every file you created or were given to hold this axis's phases/tasks (anything under _project/working-memory/naming/ in your worktree, scratch notes, briefs). Never commit them. Delete nothing else; leave every other folder under _project/working-memory/ alone.
2. git status: only moves/edits from phases 1.1 and 1.2 may appear; nothing under _project/working-memory/naming/.
3. Commit with message: "refactor(naming): role-based names for homepage spotlights; move Shelf to layout/shelf".
4. git push -u origin naming.
5. Open the PR with npx -y gh-axi (pr create). Title: "Role-based names: homepage spotlights, Shelf". Body: what changed per phase; each done-criterion marked met/unmet; a note that the Sanity data keys spotlight1/2/3 were deliberately not renamed (CMS data contract); one line stating build/lint/type-check/tests were deliberately not run (repo rule); the minimal human check below.
   Minimal human check (localhost:3000): open / and confirm all three product spotlight sections render as before (image left, image right, fractal-ring variant); open /basket and confirm the page layout is unchanged.
6. treehouse return <worktree path>. Stop. Do not merge.

RULES: Never run build, lint, tsc, tests, dev server, npm install or no-mistakes; never spawn subagents or open a browser. Never put $(...) or backticks in a shell command; run one command at a time. If anything above does not match the repo, STOP and report the exact mismatch. Report paths as file:// URIs.
