AXIS org-app-shell | TURN 1 of 1 | TASK AREA: shell component naming and placement (audit M7 pairs, L7 Shelf) | PHASE 1.2 of 3 — Client/Server pairs, Shelf placement

Prerequisite: phase 1.1 done on this branch. Same OWNS / OFF-LIMITS as phase 1.1.

GOAL
Every client/server pair in app/components/layout follows XClient / XServer; no one-file "general" bucket remains.

TASKS (in order)
1. git mv app/components/layout/header/NavbarActions.tsx app/components/layout/header/NavbarActionsClient.tsx. Inside: rename the component constant and its default export from NavbarActions to NavbarActionsClient and the props interface NavbarActionsProps to NavbarActionsClientProps. In NavbarActionsServer.tsx update the import path, the imported identifier and its JSX usage. (Header.tsx imports NavbarActionsServer and NavbarActionsSkeleton, which keep their names.)
2. git mv app/components/layout/navigation/ActionBar.tsx app/components/layout/navigation/ActionBarClient.tsx. Rename the function ActionBar to ActionBarClient (ActionButtonsProps keeps its name). In ActionBarServer.tsx update the import path, identifier and JSX usage. app/(store)/layout.tsx imports ActionBarServer and needs no change.
3. git mv app/components/layout/general/Shelf.tsx app/components/layout/content/Shelf.tsx (next to ContentLayout; it is a content-section wrapper). Update the two importers, app/(store)/page.tsx and app/(store)/basket/page.tsx, from "@/app/components/layout/general/Shelf" to "@/app/components/layout/content/Shelf". The folder general/ must disappear.
4. Check leftovers: git grep -n -w "NavbarActions\|ActionBar" -- app features. Allowed remaining hits: a prose comment in features/product-search/ui/useSearchOverlay.ts that mentions the bottom ActionBar generically (leave it; another axis owns that file). Anything else: fix it.

DONE CRITERIA
- [ ] git ls-files app/components/layout lists NavbarActionsClient.tsx, ActionBarClient.tsx, content/Shelf.tsx and no NavbarActions.tsx, ActionBar.tsx, general/
- [ ] git grep -n "layout/general/Shelf" prints nothing
- [ ] git grep -n -w "NavbarActions\|ActionBar" -- app features prints at most that one comment line
- [ ] no className string in any of the touched files changed (git diff shows only import/identifier/rename lines); the height/sizing review gate is therefore not triggered, say so in the PR body

OWNER LIVE CHECK (for the PR body)
- Header right-side actions (account / basket count) render on desktop and mobile; the bottom action bar renders on mobile width; homepage and /basket section spacing unchanged.

CONSTRAINTS (apply to every task)
- NEVER run tsc, next build, next lint, eslint, tests, a dev server, npm install/ci, curl against the dev server, or any other build/check command. Verify with git and grep only. The owner verifies live on localhost:3000 and in PR review.
- No $(...) or backticks in shell commands. One command at a time. No subagents.
- Move/rename with git mv only; fix every importer in the same phase.
- Behaviour must not change.
- Edit only files under OWNS; if a task seems to need another file, STOP and report.
- Print paths as file:// URIs in your reports.
