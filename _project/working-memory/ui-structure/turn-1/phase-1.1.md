AXIS ui-structure · TURN 1 (of 4) · AREA: basket, auth, account · PHASE 1.1 — Move the basket store and the sign-out hook out of ui/ into model/

WAVE 3 — PREREQUISITE: axes shared-ui, lib-structure and naming are merged into main (they touch the same feature folders). Verify on origin/main: shared/ui/carousel/CarouselRoot.tsx, lib/auth/server.ts and features/homepage/ui/product-spotlight-media-left/ all exist. If any is missing, STOP and report. No other axis runs in parallel with this one (it owns most of features/*/ui).
OWNS (touch only these): features/basket/**, features/auth/index.ts, features/auth/ui/useSignOut.ts (moves), features/auth/model/**. Phase 1.2 owns features/account/ui/**.
NEVER TOUCH: other features, app/**, docs/, any other file.

CONVENTION INTRODUCED BY THIS AXIS: each feature may have model/ = client-side state (Zustand stores and React hooks). ui/ = components only. domain/ = pure types and logic. PURITY RULE used in later phases: a file belongs in domain/ only if it has no "use client", no React import and no window/document/localStorage/sessionStorage access; otherwise it belongs in model/.

GOAL
features/*/ui/ is a catch-all. Stores and hooks leave it.

SETUP (do first)
1. Read CLAUDE.md and AGENTS.md.
2. git fetch origin; make sure you start from the latest origin/main (fast-forward or pull if behind).
3. treehouse get --lease, then cd into the printed path.
4. git switch -c ui-structure from up-to-date main.

TASKS
1. mkdir features/basket/model, then git mv features/basket/ui/basketStore.ts features/basket/model/basketStore.ts
2. features/basket/index.ts line 2: change './ui/basketStore' to './model/basketStore' (the export names stay).
3. grep -rn "basketStore" features app lib. Inside features/basket change relative importers (./basketStore, ../ui/basketStore ...) to the right relative path to model/basketStore. Fix the moved file's own relative imports if any. If a file OUTSIDE features/basket imports basketStore by path (not through @/features/basket), STOP and report: it is a lint-boundary violation that this plan did not expect.
4. mkdir features/auth/model, then git mv features/auth/ui/useSignOut.ts features/auth/model/useSignOut.ts
5. features/auth/index.ts line 10: change './ui/useSignOut' to './model/useSignOut'. Fix relative importers inside features/auth (./useSignOut becomes ../model/useSignOut) and any relative import inside the moved file.

DONE
- [ ] features/basket/ui no longer contains basketStore.ts; features/basket/model/basketStore.ts exists
- [ ] features/auth/ui no longer contains useSignOut.ts; features/auth/model/useSignOut.ts exists
- [ ] grep -rn "ui/basketStore\|ui/useSignOut" features app returns nothing
- [ ] the export names in features/basket/index.ts and features/auth/index.ts are unchanged

RULES: Never run build, lint, tsc, tests, dev server, npm install or no-mistakes; never spawn subagents or open a browser; use only git, ls, grep, mkdir, mv and file edits. Never put $(...) or backticks in a shell command; run one command at a time. Use git mv so history follows. Touch only the files listed under OWNS. If any path, line number or string above does not match the repo, STOP and report the exact mismatch (file:line); do not guess and do not re-plan. Report paths as file:// URIs.
