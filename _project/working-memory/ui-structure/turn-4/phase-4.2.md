AXIS ui-structure · TURN 4 (of 4) · AREA: homepage · PHASE 4.2 — Wrap-up of the axis: clean up, commit, push, open the PR

PREREQUISITE: phase 4.1 done on branch ui-structure (turns 1-3 commits are already on the branch).
OWNS: git only.

TASKS
1. Delete every file you created or were given to hold this axis's phases/tasks (anything under _project/working-memory/ui-structure/ in your worktree, scratch notes, briefs). Never commit them. Delete nothing else; leave every other folder under _project/working-memory/ alone.
2. git status: only changes from phase 4.1 may appear; nothing under _project/working-memory/ui-structure/.
3. Commit with message: "refactor(ui-structure): homepage section types to domain/".
4. git push origin ui-structure.
5. Open the PR with npx -y gh-axi (pr create). Title: "Feature ui/ cleanup: model/ for stores and hooks, domain/ for logic, split oversized components". Body: what changed per turn and phase (basket+auth+account; catalogue+search; filtering; homepage); each done-criterion marked met/unmet; the convention introduced (ui/ components, model/ client state, domain/ pure logic) and a note that CLAUDE.md is updated by the entry-docs axis; one line stating build/lint/type-check/tests were deliberately not run (repo rule); the minimal human check below.
   Minimal human check (localhost:3000): /account (all six sections work: change password, profile, email, notifications, sessions, delete flow opens); header search (open, type, suggestions, recent searches); /products/headphones (filters, price slider, reset buttons); basket badge count and add-to-basket; / renders.
6. treehouse return <worktree path>. Stop. Do not merge.

RULES: Never run build, lint, tsc, tests, dev server, npm install or no-mistakes; never spawn subagents or open a browser. Never put $(...) or backticks in a shell command; run one command at a time. If anything above does not match the repo, STOP and report the exact mismatch. Report paths as file:// URIs.
