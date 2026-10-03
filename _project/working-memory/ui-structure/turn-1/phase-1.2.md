AXIS ui-structure · TURN 1 (of 4) · AREA: basket, auth, account · PHASE 1.2 — Split features/account/ui/AccountActionsClient.tsx by section

PREREQUISITE: phase 1.1 done on branch ui-structure. Stay on that branch.
OWNS (touch only these): features/account/ui/AccountActionsClient.tsx and the new section files in features/account/ui/.
NEVER TOUCH: features/account/actions.ts, features/account/index.ts, app/(store)/account/**, features/auth/**, any other file.

GOAL
AccountActionsClient.tsx is one 451-line component holding six independent account sections. Extract each section into its own component. Pure extraction: same markup, class names, texts, handlers and server-action calls.

TASKS
1. Read features/account/ui/AccountActionsClient.tsx fully. Layout today: top-level helper requireFreshSession (line ~8); export default function AccountActionsClient (line ~24) with props, state and handlers up to line ~160 (including handleSignOut, handleSignOutAllDevices, delete-confirm state, handleDeleteClick, handleDeleteSubmit); then <section> blocks: Change Password (~161), Profile (~228), Email Address (~269), Notifications (~316), Session Management (~356), the imported <TwoFactorSection twoFactorEnabled={...} /> (~376), Danger Zone (~378 to end).
2. Create, in features/account/ui/, one client component per section: ChangePasswordSection.tsx, ProfileSection.tsx, EmailSection.tsx, NotificationsSection.tsx, SessionsSection.tsx, DangerZoneSection.tsx. Each starts with "use client", has a default export and explicit typed props.
   - A section takes over its own JSX plus the state and handlers that ONLY it uses.
   - State or handlers used by two or more sections stay in AccountActionsClient and are passed down as props.
   - requireFreshSession: if two or more sections call it, move it to features/account/ui/requireFreshSession.ts (exported) and import it where needed; if only one section calls it, move it into that section file.
3. AccountActionsClient.tsx keeps: its props type and default export signature (unchanged, so existing callers keep working), the shared state/handlers, and the composition of the sections in the original order, including <TwoFactorSection twoFactorEnabled={twoFactorEnabled} /> imported from "@/features/auth".
4. Do not change copy, class names, element order, handler logic, imports of server actions or any prop name that callers pass.

DONE
- [ ] the six section files exist (plus requireFreshSession.ts only if task 2 required it)
- [ ] AccountActionsClient.tsx is under 200 lines and renders the sections in the original order
- [ ] every handler/state still has exactly one owner; nothing is declared twice
- [ ] callers of AccountActionsClient (grep) need no change

RULES: Never run build, lint, tsc, tests, dev server, npm install or no-mistakes; never spawn subagents or open a browser; use only git, ls, grep and file edits. Never put $(...) or backticks in a shell command; run one command at a time. Touch only the files listed under OWNS. If a section's state is so entangled that it cannot be extracted without changing behaviour, STOP and report the exact lines instead of guessing. If any path, line number or string above does not match the repo, STOP and report the exact mismatch (file:line); do not re-plan. Report paths as file:// URIs.
