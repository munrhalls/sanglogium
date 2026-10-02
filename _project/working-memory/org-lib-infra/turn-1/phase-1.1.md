AXIS org-lib-infra | TURN 1 of 1 | TASK AREA: lib/ infrastructure placement and naming (audit M6, M7 module naming) | PHASE 1.1 of 3 — prerequisite gate, event logger

WAVE 2. MUST WAIT FOR (merged to main): org-data-boundary, org-checkout-thin-routes, org-feature-structure, org-oversized-files. Runs in parallel with: org-docs-prune, org-app-shell, org-data-scripts (disjoint files). Blocks: org-closeout.

STANDARD APPLIED: lib/ is cross-cutting infrastructure named by what it does. A folder called dev must not hold code that runs in production routes; one concern gets one folder (auth); TS modules are camelCase; server and client halves are explicit files, not a barrel that could mix them.

GOAL
lib/dev/event-logger.ts becomes lib/eventLogger.ts and every importer follows.

OWNS (only these may be edited)
- lib/**
- IMPORT-LINE-ONLY edits (change the import specifier, nothing else) in: app/api/checkout/payment-intent-session/route.ts, app/api/checkout/return/route.ts, app/api/trace/route.ts, app/api/webhooks/stripe/route.ts, app/checkout/payment/page.tsx, app/checkout/shipping/page.tsx, app/checkout/success/page.tsx, features/checkout/actions.ts, features/checkout/adapters/allekurierRates.ts, sanity-cms/lib/orders/createOrderFromPaymentIntent.ts
OFF-LIMITS
- everything else in those files; all other files.

TASKS (in order)
0. SYNC FIRST: run git fetch origin main. If this branch has no commits of its own run git merge --ff-only origin/main; if it already has commits run git rebase origin/main. git status must be clean.
1. PREREQUISITE GATE. All four must hold on the synced branch; if any fails STOP and tell the owner which axis is not merged yet:
   - git grep -n "_type ==" -- lib app/sitemap.ts prints nothing (org-data-boundary)
   - git grep -n "_type ==" -- app/checkout app/api/checkout prints nothing, and features/checkout/ui/PaymentFormClient.tsx exists (org-checkout-thin-routes)
   - features/products/ui/card/WishlistButton.tsx exists (org-feature-structure)
   - features/account/ui/ChangePasswordSection.tsx exists (org-oversized-files)
2. git mv lib/dev/event-logger.ts lib/eventLogger.ts. Check the file for relative imports and fix them if any. The folder lib/dev/ must disappear.
3. Run git grep -n "dev/event-logger" -- . ':(exclude)docs' and repoint every hit from "@/lib/dev/event-logger" to "@/lib/eventLogger" (expected: the 10 files listed under OWNS; if the list differs, repoint what you find only if it is a pure import line, otherwise stop and report).

DONE CRITERIA
- [ ] gate predicates all held
- [ ] git ls-files lib shows eventLogger.ts and no lib/dev/
- [ ] git grep -n "dev/event-logger" -- . ':(exclude)docs' prints nothing
- [ ] git diff shows, outside the rename itself, only changed import lines in the 10 files (no other line touched)

CONSTRAINTS (apply to every task)
- NEVER run tsc, next build, next lint, eslint, tests, a dev server, npm install/ci, curl against the dev server, or any other build/check command. Verify with git and grep only (a throwaway node resolver script in your OS temp dir is allowed; never commit it). The owner verifies live on localhost:3000 and in PR review (the Vercel build type-checks).
- No $(...) or backticks in shell commands. One command at a time. No subagents.
- Move with git mv only; fix every importer in the same phase.
- Behaviour must not change.
- Edit only files under OWNS; if a task seems to need another file, STOP and report.
- Print paths as file:// URIs in your reports.
