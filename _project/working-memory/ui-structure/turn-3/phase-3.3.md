AXIS ui-structure · TURN 3 (of 4) · AREA: product-filtering · PHASE 3.3 — Wrap-up of turn 3: clean up, commit, push (NO PR yet)

PREREQUISITE: phases 3.1 and 3.2 done on branch ui-structure.
OWNS: git only.

TASKS
1. Delete every file you created or were given to hold this turn's phases/tasks (anything under _project/working-memory/ui-structure/ in your worktree, scratch notes, briefs). Never commit them. Delete nothing else; leave every other folder under _project/working-memory/ alone.
2. git status: only changes from phases 3.1 and 3.2 may appear; nothing under _project/working-memory/ui-structure/.
3. Commit with message: "refactor(ui-structure): useFilterParam to model/; split PriceRangeSlider into FilterSection, DualRangeSlider, PriceRangeSlider".
4. git push origin ui-structure. Do NOT open a PR (the PR comes from the last phase of turn 4).
5. treehouse return <worktree path>. Stop.

RULES: Never run build, lint, tsc, tests, dev server, npm install or no-mistakes; never spawn subagents or open a browser. Never put $(...) or backticks in a shell command; run one command at a time. If anything above does not match the repo, STOP and report the exact mismatch. Report paths as file:// URIs.
