AXIS entry-docs · TURN 1 (of 1) · AREA: make CLAUDE.md, AGENTS.md and the living docs tell the truth about the reorganized repo · PHASE 1.2 — AGENTS.md, README.md, .no-mistakes.yaml

PREREQUISITE: phase 1.1 done on branch entry-docs. Stay on that branch.
OWNS (touch only these): AGENTS.md, README.md, .no-mistakes.yaml.
NEVER TOUCH: CLAUDE.md (phase 1.1), docs/ (phase 1.3), any source file. Do NOT merge, delete or restructure AGENTS.md or CLAUDE.md: the owner uses Claude Code CLI, Devin CLI and occasionally Cline, and each reads its own file. Keep both files; only correct false statements.

GOAL
The other entry files stop pointing at deleted or moved things.

TASKS
1. AGENTS.md lines 7-10 contain the same stale campaign-process sentence as CLAUDE.md: "`_project/<feature name>/plan.md` (feature campaigns) or `_project/missions/<mission name>/plan.md` ... -- e.g. `_project/filters-sorting/plan.md`." Replace it with the same sentence used in CLAUDE.md phase 1.1: "Live plans are the architect's phase files under `_project/working-memory/<axis>/turn-<n>/phase-<n.m>.md` (transient: each turn's last phase deletes them, never committed); one PR per thematic axis." Drop the filters-sorting example.
2. grep -nE "app/components/ui|__tests__|docs/|_project/archive|_project/missions|\.lavish|lessons\.md|devin-cloud|lib/auth-client|ui/basketStore|catalogue-integrity|progress\.txt" AGENTS.md README.md. For every hit that is now false, correct it minimally (new path, or delete the clause). Do not touch true statements.
3. .no-mistakes.yaml, test.instructions, the paragraph "For a PR that moves or edits code under features/<name>/ui or app/components/ (an organization-only refactor): ...": change "features/<name>/ui or app/components/" to "features/<name>/ui, app/components/ or shared/".

DONE
- [ ] the grep in task 2 returns only statements that are true in the current tree
- [ ] AGENTS.md still exists with the same sections; only false statements changed
- [ ] .no-mistakes.yaml differs by exactly the one phrase in task 3 relative to the previous phase

RULES: Never run build, lint, tsc, tests, dev server, npm install or no-mistakes; never spawn subagents or open a browser; use only git, ls, grep and file edits. Never put $(...) or backticks in a shell command; run one command at a time. Touch only the files listed under OWNS. If any path, line number or string above does not match the repo, STOP and report the exact mismatch (file:line); do not guess and do not re-plan. Report paths as file:// URIs.
