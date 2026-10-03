AXIS ui-structure · TURN 2 (of 4) · AREA: catalogue and product-search · PHASE 2.2 — Wrap-up of turn 2: clean up, commit, push (NO PR yet)

PREREQUISITE: phase 2.1 done on branch ui-structure.
OWNS: git only.

TASKS
1. Delete every file you created or were given to hold this turn's phases/tasks (anything under _project/working-memory/ui-structure/ in your worktree, scratch notes, briefs). Never commit them. Delete nothing else; leave every other folder under _project/working-memory/ alone.
2. git status: only changes from phase 2.1 may appear; nothing under _project/working-memory/ui-structure/.
3. Commit with message: "refactor(ui-structure): catalogue nav logic and search logic to domain/, search hooks to model/".
4. git push origin ui-structure. Do NOT open a PR (the PR comes from the last phase of turn 4).
5. treehouse return <worktree path>. Stop.

RULES: Never run build, lint, tsc, tests, dev server, npm install or no-mistakes; never spawn subagents or open a browser. Never put $(...) or backticks in a shell command; run one command at a time. If anything above does not match the repo, STOP and report the exact mismatch. Report paths as file:// URIs.
