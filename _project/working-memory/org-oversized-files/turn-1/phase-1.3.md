AXIS org-oversized-files | TURN 1 of 1 | TASK AREA: split oversized files at their real seams (audit L4) | PHASE 1.3 of 4 — AccountActionsClient into section components

Prerequisite: phases 1.1 and 1.2 done on this branch. Same OWNS / OFF-LIMITS as phase 1.1.

GOAL
features/account/ui/AccountActionsClient.tsx (451 lines, one component with six forms and all their state) becomes a composition of six section components; its public export and props do not change.

TASKS (in order)
1. Read AccountActionsClient.tsx fully. Its parts: the module helper requireFreshSession (used 4 times), the props (name, email, shouldClearMergeFlag, showEmailChangedBanner, marketingEmailsOptIn, twoFactorEnabled), a useEffect that strips the merge and emailChanged query params, hooks per form (changeAction/changeState/changePending; nameAction...; emailAction...; preferenceAction...), sign-out handlers, delete-confirm state and handlers, and six JSX sections (change password, name, email, preferences, sessions, delete) plus the TwoFactorSection usage.
2. Create in features/account/ui/ (each file starts with "use client"; each section's JSX moved verbatim; each owns ONLY the hooks, state and handlers that only it uses):
   - requireFreshSession.ts — the helper, exported; it uses authClient (keep the current import "@/lib/auth-client" unchanged; axis org-lib-infra repoints it later).
   - ChangePasswordSection.tsx
   - ProfileNameSection.tsx (prop: name)
   - ProfileEmailSection.tsx (props it needs, e.g. email and showEmailChangedBanner if the section renders the banner)
   - PreferencesSection.tsx (prop: marketingEmailsOptIn)
   - SessionsSection.tsx (sign out / sign out of all devices handlers)
   - DeleteAccountSection.tsx (showDeleteConfirm, deleteError, isDeleting, handleDeleteClick, handleDeleteSubmit)
   A section receives as props only what it reads from the parent's props; sections never import each other.
3. AccountActionsClient.tsx keeps: its props signature and default export, the useEffect that cleans the query params, any wrapper/banner JSX that sits between sections, the TwoFactorSection usage, and the composition of the six new components. Target: at most 130 lines. features/account/index.ts export of AccountActionsClient stays unchanged.
4. Imports: the server actions (updateName, updatePreferences, and any others from "../actions") are imported by the section that uses them; signOut / signOutAllDevices / TwoFactorSection from "@/features/auth" likewise.
5. Throwaway node resolver script over features/account: no unresolved relative import.

DONE CRITERIA
- [ ] AccountActionsClient.tsx at most 130 lines; the six section files and requireFreshSession.ts exist
- [ ] each useActionState call, each handler and each state hook of the old file appears exactly once in the new files (compare git grep -c "useActionState\|useState" before/after: same totals)
- [ ] every className and every user-visible string of the six sections appears exactly once across the new files (spot-check 5 strings per section)
- [ ] requireFreshSession is defined once, imported by every section that called it
- [ ] resolver script prints nothing; features/account/index.ts shows no diff

OWNER LIVE CHECK (for the PR body)
- /account signed in: change password (wrong and right current password), edit name, edit email (banner after change), toggle marketing preference, sign out and sign out of all devices, open the delete-account confirmation and cancel it (do not delete). Messages, pending states and 2FA section behave as before.

CONSTRAINTS (apply to every task)
- NEVER run tsc, next build, next lint, eslint, tests, a dev server, npm install/ci, curl against the dev server, or any other build/check command. Verify with git and grep only (the throwaway resolver script is allowed; never commit it). The owner verifies live on localhost:3000 and in PR review.
- No $(...) or backticks in shell commands. One command at a time. No subagents.
- Moved code stays verbatim: no reformatting, no className edits, no copy edits. Mandatory height/sizing review: say in the PR body that classNames moved without edits.
- Edit only files under OWNS; if a task seems to need another file, STOP and report.
- Print paths as file:// URIs in your reports.
