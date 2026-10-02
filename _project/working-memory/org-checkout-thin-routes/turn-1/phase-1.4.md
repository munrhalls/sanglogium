AXIS org-checkout-thin-routes | TURN 1 of 1 | TASK AREA: checkout is one vertical slice | PHASE 1.4 of 4 — FINAL: cleanup, commit, push, PR

Prerequisite: phases 1.1 to 1.3 done on this branch.

TASKS (in order)
1. If the folder _project/working-memory/org-checkout-thin-routes/ exists in your worktree, delete it (rm -r). It must never be staged or committed.
2. git status: only app/checkout/**, app/api/checkout/payment-intent-session/route.ts, features/checkout/**, the two new sanity-cms/lib/products/ files and eslint.config.mjs may appear. Anything else: revert it and report.
3. git fetch origin main; if main moved, git rebase origin/main.
4. Commit with message: "Make checkout one feature slice and thin its routes (audit H2, H1 checkout parts, M7 .frozen)". One commit is fine.
5. git push -u origin <this branch>.
6. Open ONE PR against main (use npx -y gh-axi; check --help once if unsure; fall back to gh only if gh-axi is unavailable, one at a time). Title: "Checkout: one feature slice, thin routes". Body must state: what moved (PaymentFormClient.tsx, OrderDetails.tsx into features/checkout/ui; new domain/ and ui/ files; the two fetchers); the deliberate rule change (features may reach the data layer from adapters/, ESLint block added; client components exported through the barrel must not have import-time side effects, so loadStripe is now lazy); the single shared grand-total formula; the removed dev-only audit logs; the .frozen rename; "Audit findings closed: H2, H1 (checkout parts), M7 (.frozen)"; the height/sizing note (classNames moved verbatim); and the owner live checks from phases 1.2 and 1.3. Add: "CLAUDE.md still describes the old route-private rule; axis org-closeout rewrites it."

DONE CRITERIA
- [ ] working-memory folder deleted and not staged
- [ ] branch pushed; one PR open against main
- [ ] PR body contains the rule-change statement, the findings closed, and both owner live checks

CONSTRAINTS
- No build, lint, type-check, test or dev-server command. No $(...) or backticks. One command at a time. No subagents.
