AXIS entry-docs · TURN 1 (of 1) · AREA: make CLAUDE.md, AGENTS.md and the living docs tell the truth about the reorganized repo · PHASE 1.4 — Wrap-up: clean up, commit, push, open the PR

PREREQUISITE: phases 1.1, 1.2 and 1.3 done on branch entry-docs.
OWNS: git only.

TASKS
1. Delete every file you created or were given to hold this axis's phases/tasks (anything under _project/working-memory/entry-docs/ in your worktree, scratch notes, briefs). Never commit them. Delete nothing else; leave every other folder under _project/working-memory/ alone.
2. git status: only CLAUDE.md, AGENTS.md, README.md, .no-mistakes.yaml and the five docs may appear; nothing under _project/working-memory/entry-docs/.
3. Commit with message: "docs: align CLAUDE.md, AGENTS.md, README and living docs with the reorganized repo".
4. git push -u origin entry-docs.
5. Open the PR with npx -y gh-axi (pr create). Title: "Align entry docs and living docs with the reorganized repo". Body: what changed per phase (counts only for the docs sweep); each done-criterion marked met/unmet; any edit skipped because the owner dropped an axis; one line stating build/lint/type-check/tests were deliberately not run (repo rule).
   Minimal human check: skim the CLAUDE.md diff; every path it now names exists (spot-check shared/ui, model/, lib/auth/server.ts, features/product-filtering/proofs/).
6. treehouse return <worktree path>. Stop. Do not merge.

RULES: Never run build, lint, tsc, tests, dev server, npm install or no-mistakes; never spawn subagents or open a browser. Never put $(...) or backticks in a shell command; run one command at a time. If anything above does not match the repo, STOP and report the exact mismatch. Report paths as file:// URIs.
