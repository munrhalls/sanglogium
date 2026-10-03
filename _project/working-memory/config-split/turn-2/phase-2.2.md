AXIS config-split · TURN 2 (of 2) · AREA: Sanity filter-attributes schema · PHASE 2.2 — Wrap-up of the axis: clean up, commit, push, open the PR

PREREQUISITE: phase 2.1 done on branch config-split (turn 1 commits are already on the branch).
OWNS: git only.

TASKS
1. Delete every file you created or were given to hold this axis's phases/tasks (anything under _project/working-memory/config-split/ in your worktree, scratch notes, briefs). Never commit them. Delete nothing else; leave every other folder under _project/working-memory/ alone.
2. git status: only changes from phase 2.1 may appear; nothing under _project/working-memory/config-split/.
3. Commit with message: "refactor(sanity): split productFilterAttributes into per-category segments".
4. git push origin config-split.
5. Open the PR with npx -y gh-axi (pr create). Title: "Split Tailwind config and filter-attributes schema; tidy tsconfig". Body: what changed per turn/phase; each done-criterion marked met/unmet; one line stating build/lint/type-check/tests were deliberately not run (repo rule); the minimal human check below.
   Minimal human check (localhost:3000): the storefront looks unchanged (spot-check / and /products/headphones: colors, buttons, spacing); open /studio, open a product document and confirm the Filter Attributes fields appear in the same order as before.
6. treehouse return <worktree path>. Stop. Do not merge.

RULES: Never run build, lint, tsc, tests, dev server, npm install or no-mistakes; never spawn subagents or open a browser. Never put $(...) or backticks in a shell command; run one command at a time. If anything above does not match the repo, STOP and report the exact mismatch. Report paths as file:// URIs.
