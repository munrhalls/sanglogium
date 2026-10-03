AXIS config-split · TURN 1 (of 2) · AREA: Tailwind config and tsconfig · PHASE 1.3 — Wrap-up of turn 1: clean up, commit, push (NO PR yet)

PREREQUISITE: phases 1.1 and 1.2 done on branch config-split.
OWNS: git only.

TASKS
1. Delete every file you created or were given to hold this turn's phases/tasks (anything under _project/working-memory/config-split/ in your worktree, scratch notes, briefs). Never commit them. Delete nothing else; leave every other folder under _project/working-memory/ alone.
2. git status: only changes from phases 1.1 and 1.2 may appear; nothing under _project/working-memory/config-split/.
3. Commit with message: "refactor(config): extract Tailwind tokens and component plugin to shared/styles; tsconfig includes shared and drops dead test excludes".
4. git push -u origin config-split. Do NOT open a PR: PRs are opened once per axis, by the last phase of the last turn (turn 2).
5. treehouse return <worktree path>. Stop.

RULES: Never run build, lint, tsc, tests, dev server, npm install or no-mistakes; never spawn subagents or open a browser. Never put $(...) or backticks in a shell command; run one command at a time. If anything above does not match the repo, STOP and report the exact mismatch. Report paths as file:// URIs.
