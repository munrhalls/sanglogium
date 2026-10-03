AXIS naming · TURN 1 (of 1) · AREA: role-based names for homepage spotlights and the Shelf layout · PHASE 1.2 — Give Shelf a role-named layout folder

PREREQUISITE: phase 1.1 done on branch naming. Stay on that branch.
OWNS (touch only these): app/components/layout/general/Shelf.tsx (moved), app/(store)/page.tsx (one import line), app/(store)/basket/page.tsx (one import line).
NEVER TOUCH: everything else.

GOAL
app/components/layout/ folders are named by role (content, drawers, footer, header, navigation) except general/, a catch-all holding one file.

TASKS
1. git mv app/components/layout/general/Shelf.tsx app/components/layout/shelf/Shelf.tsx (create the shelf folder first; the empty general folder disappears with the move).
2. In app/(store)/page.tsx and app/(store)/basket/page.tsx change the import "@/app/components/layout/general/Shelf" to "@/app/components/layout/shelf/Shelf".
3. grep -rn "layout/general" app features returns nothing.

DONE
- [ ] app/components/layout/general no longer exists; app/components/layout/shelf/Shelf.tsx exists
- [ ] both importers use the new path; no other line changed

RULES: Never run build, lint, tsc, tests, dev server, npm install or no-mistakes; never spawn subagents or open a browser; use only git, ls, grep, mkdir, mv and file edits. Never put $(...) or backticks in a shell command; run one command at a time. Use git mv so history follows. Touch only the files listed under OWNS. If any path, line number or string above does not match the repo, STOP and report the exact mismatch (file:line); do not guess and do not re-plan. Report paths as file:// URIs.
