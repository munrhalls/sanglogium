AXIS ui-structure · TURN 4 (of 4) · AREA: homepage · PHASE 4.1 — Move section-local type files from ui/ to domain/

PREREQUISITE: turn 3 is committed and pushed on branch ui-structure. Task area is disjoint from turns 1-3.
OWNS (touch only these): features/homepage/ui/hero/types.ts and features/homepage/ui/accessories/types.ts (move), features/homepage/domain/**, and the importers of those two files inside features/homepage.
NEVER TOUCH: features/homepage/index.ts unless a type re-export forces it (see task 3), sanity-cms/**, app/**, other features, any other file.

GOAL
Types live in domain/ (features/homepage/domain/homepageTypes.ts already exists); two section-local types.ts files still sit in ui/.

SETUP (do first)
1. Read CLAUDE.md and AGENTS.md.
2. git fetch origin; treehouse get --lease, then cd into the printed path.
3. git switch ui-structure; if origin/main moved, git merge origin/main (no rebase, no force-push).

TASKS
1. git mv features/homepage/ui/hero/types.ts features/homepage/domain/heroTypes.ts and git mv features/homepage/ui/accessories/types.ts features/homepage/domain/accessoryTypes.ts. If either destination name already exists, STOP and report.
2. Open the two moved files. If any exported type name is ALSO exported by features/homepage/domain/homepageTypes.ts, STOP and report the duplicate names; do not merge or delete them.
3. grep -rn "from './types'\|from \"./types\"" features/homepage. Update each importer to the new relative path (for example ../../domain/heroTypes from features/homepage/ui/hero/Hero.tsx). If features/homepage/index.ts re-exports from either old file, update that path too.

DONE
- [ ] features/homepage/ui has no types.ts left; domain holds heroTypes.ts and accessoryTypes.ts
- [ ] grep -rn "./types" features/homepage returns nothing that points at a deleted file
- [ ] the exported type names are unchanged

RULES: Never run build, lint, tsc, tests, dev server, npm install or no-mistakes; never spawn subagents or open a browser; use only git, ls, grep and file edits. Never put $(...) or backticks in a shell command; run one command at a time. Use git mv so history follows. Touch only the files listed under OWNS. If any path, line number or string above does not match the repo, STOP and report the exact mismatch (file:line); do not guess and do not re-plan. Report paths as file:// URIs.
