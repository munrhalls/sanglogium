AXIS app-data-boundary · TURN 1 (of 1) · AREA: keep Sanity access and pass-through wrappers out of app/ · PHASE 1.3 — Wrap-up: clean up, commit, push, open the PR

PREREQUISITE: phases 1.1 and 1.2 done on branch app-data-boundary.
OWNS: git only.

TASKS
1. Delete every file you created or were given to hold this axis's phases/tasks (anything under _project/working-memory/app-data-boundary/ in your worktree, scratch notes, briefs). Never commit them. Delete nothing else; leave every other folder under _project/working-memory/ alone.
2. git status: only edits/moves from phases 1.1 and 1.2 may appear; nothing under _project/working-memory/app-data-boundary/.
3. Commit with message: "refactor(app): move sitemap GROQ and homepage fetch wrapper into sanity-cms/lib; inline store layout config".
4. git push -u origin app-data-boundary.
5. Open the PR with npx -y gh-axi (pr create). Title: "Keep Sanity access out of app/: sitemap, homepage fetch, layout config". Body: what changed per phase; each done-criterion marked met/unmet; one line stating build/lint/type-check/tests were deliberately not run (repo rule); the minimal human check below.
   Minimal human check (localhost:3000): open /sitemap.xml (product and category URLs still listed), open / (page renders, tab title and Montserrat font unchanged).
6. treehouse return <worktree path>. Stop. Do not merge.

RULES: Never run build, lint, tsc, tests, dev server, npm install or no-mistakes; never spawn subagents or open a browser. Never put $(...) or backticks in a shell command; run one command at a time. If anything above does not match the repo, STOP and report the exact mismatch. Report paths as file:// URIs.
