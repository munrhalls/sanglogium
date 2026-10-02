AXIS org-checkout-thin-routes | TURN 1 of 1 | TASK AREA: checkout is one vertical slice, routes only compose (audit H2) | PHASE 1.1 of 4 — move the two route-private components into the feature

WAVE 1. Runs in parallel with: org-docs-prune, org-data-boundary, org-app-shell, org-feature-structure, org-oversized-files, org-data-scripts. Waits for nothing. Blocks: org-lib-infra, org-closeout.

DESIGN DECISION (owner-confirmed): the target is what is right for a feature slice, not what the old rule says. A feature owns its whole vertical slice: client UI, server components, domain logic, and its own data access through server-only boundary files. app/checkout/** only composes pages (guards, redirects, layout). The old rule "components with module-scope side effects or Sanity-fetching server components stay next to the route" is stale and is being replaced; the ESLint rule that blocks features from importing sanity-cms is relaxed for feature adapters in this phase.

GOAL
PaymentFormClient.tsx and OrderDetails.tsx live in features/checkout/ui/; checkout pages import them from the feature entries.

OWNS (only these may be edited)
- app/checkout/**, app/api/checkout/**, features/checkout/**
- eslint.config.mjs (ONLY the new adapters block described in task 1)
- NEW (phase 1.2): sanity-cms/lib/products/getPaymentProducts.ts, sanity-cms/lib/products/getProductUnitAmountsByIds.ts
OFF-LIMITS
- Do not touch the import "@/lib/dev/event-logger" anywhere (axis org-lib-infra renames it later). Nothing in lib/**, app/api/webhooks, app/api/trace, app/(store), other features, other eslint.config.mjs blocks.

TASKS (in order)
0. SYNC FIRST: run git fetch origin main. If this branch has no commits of its own run git merge --ff-only origin/main; if it already has commits run git rebase origin/main. git status must be clean before you touch anything.
1. eslint.config.mjs: after the existing block whose files is ["features/*/actions.ts"], add one new block with files ["features/*/adapters/**/*.{ts,tsx}"] and the same no-restricted-imports rule as the actions.ts block (jest paths + ENTRY_ONLY + NO_APP, WITHOUT NO_SANITY). Comment: "Server-only boundary files of a feature (actions.ts, adapters/) are the only feature files allowed to import sanity-cms." Leave every other block and message untouched (axis org-closeout edits them later).
2. Read features/checkout/adapters/session.ts first lines to copy its server-only convention. Create features/checkout/adapters/orders.ts: same server-only line as session.ts; export { fetchOrderByPaymentIntentId as getOrderByPaymentIntentId } and export type { OrderForSuccessPage }, both from "@/sanity-cms/lib/orders/getOrderByPaymentIntentId". This file is the only place the checkout feature touches the order data layer.
3. git mv app/checkout/success/OrderDetails.tsx features/checkout/ui/OrderDetails.tsx. Edit its imports only: fetchOrderByPaymentIntentId -> getOrderByPaymentIntentId from "../adapters/orders" (rename the one call); RefreshButton from "./RefreshButton". It stays an async Server Component (no "use client").
4. git mv app/checkout/payment/PaymentFormClient.tsx features/checkout/ui/PaymentFormClient.tsx. A client component exported through the barrel must have no import-time side effects, so make Stripe loading lazy: replace the module-scope "const stripePromise = loadStripe(...)" with a module-level memoized getter (create the promise on first call, reuse it afterwards) and pass getStripePromise() where stripePromise was used (the Elements stripe prop). Same publishable key, same options. No other change in the file.
5. features/checkout/index.ts: add export { default as PaymentForm } from './ui/PaymentFormClient'. features/checkout/server.ts: add export { default as OrderDetails } from './ui/OrderDetails'; export { getOrderByPaymentIntentId } from './adapters/orders'; export type { OrderForSuccessPage } from './adapters/orders'. (OrderDetails goes through the server entry only, never the client-safe index.)
6. app/checkout/payment/page.tsx: import PaymentForm from "@/features/checkout" (add it to the existing named import) and delete the import of "./PaymentFormClient". JSX unchanged.
7. app/checkout/success/page.tsx: import OrderDetails and getOrderByPaymentIntentId from "@/features/checkout/server" (extend the existing import); delete the imports of './OrderDetails' and fetchOrderByPaymentIntentId; rename the single call site.

DONE CRITERIA
- [ ] git ls-files app/checkout shows no PaymentFormClient.tsx and no OrderDetails.tsx; both exist under features/checkout/ui/
- [ ] git grep -n "sanity-cms" -- app/checkout shows only app/checkout/payment/page.tsx (fixed in phase 1.2)
- [ ] git grep -n "loadStripe(" -- features/checkout shows one call, inside a function (not at module top level)
- [ ] git grep -n "PaymentFormClient\|success/OrderDetails" -- app features shows only the index.ts export line and the new file
- [ ] eslint.config.mjs diff is one added block, nothing else
- [ ] OrderDetails is exported from features/checkout/server.ts and NOT from index.ts

CONSTRAINTS (apply to every task)
- NEVER run tsc, next build, next lint, eslint, tests, a dev server, npm install/ci, curl against the dev server, or any other build/check command. Verify with git and grep only. The owner verifies live on localhost:3000 and in PR review.
- No $(...) or backticks in shell commands. One command at a time. No subagents.
- Move with git mv only; fix every importer in the same phase.
- Behaviour must not change except the lazy Stripe initialization named above.
- Edit only files under OWNS; if a task seems to need another file, STOP and report.
- Print paths as file:// URIs in your reports.
