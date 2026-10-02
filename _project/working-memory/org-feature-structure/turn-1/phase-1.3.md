AXIS org-feature-structure | TURN 1 of 1 | TASK AREA: feature-internal structure (audit M2) | PHASE 1.3 of 4 — basket state model out of ui/

Prerequisite: phases 1.1 and 1.2 done on this branch. Same OWNS / OFF-LIMITS as phase 1.1.

STANDARD APPLIED: the basket store is the feature's state model (zod validation + persisted zustand store), not a component. It belongs in domain/, not ui/. The old doc line "store in ui/basketStore.ts" is stale and is rewritten by axis org-closeout.

GOAL
features/basket/ui/ contains components only.

TASKS (in order)
1. git mv features/basket/ui/basketStore.ts features/basket/domain/basketStore.ts (create the domain/ folder).
2. Update every importer: features/basket/ui/BasketButton.tsx, BasketControls.tsx, BasketItem.tsx, BasketManager.tsx (each "./basketStore" becomes "../domain/basketStore") and features/basket/index.ts (the export of useBasketStore, selectTotalItemsCount, selectHasHydrated now points to ./domain/basketStore).
3. Run git grep -n "basketStore" -- app features lib sanity-cms and check every hit resolves. Any importer outside features/basket must already use "@/features/basket" (the barrel); if one deep-imports the old path, fix it to the barrel.
4. Run the throwaway resolver script from phase 1.1 over features/basket; it must print nothing. Leave the store's own code (zod schema, persist config, storage key, exports) untouched.

DONE CRITERIA
- [ ] features/basket/ui/basketStore.ts does not exist; features/basket/domain/basketStore.ts exists with unchanged content (git diff -M shows a pure rename)
- [ ] git grep -n "ui/basketStore\|\./basketStore" -- features app prints nothing except imports from the new location ("../domain/basketStore" and "./domain/basketStore")
- [ ] features/basket/index.ts exports the same three names as before
- [ ] resolver script prints nothing

OWNER LIVE CHECK (for the PR body)
- Add an item to the basket, reload the page: the basket count persists (localStorage) and the /basket page shows the item; quantity +/- and remove work.

CONSTRAINTS (apply to every task)
- NEVER run tsc, next build, next lint, eslint, tests, a dev server, npm install/ci, curl against the dev server, or any other build/check command. Verify with git and grep only (the throwaway resolver script is allowed; never commit it). The owner verifies live on localhost:3000 and in PR review.
- No $(...) or backticks in shell commands. One command at a time. No subagents.
- Move with git mv only; fix every importer in the same phase.
- Behaviour must not change; the store file content must not change.
- Edit only files under OWNS; if a task seems to need another file, STOP and report.
- Print paths as file:// URIs in your reports.
