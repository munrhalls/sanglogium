AXIS org-data-boundary | TURN 1 of 1 | TASK AREA: GROQ only in the data layer, auth + sitemap | PHASE 1.3 of 3 — FINAL: cleanup, commit, push, PR

Prerequisite: phases 1.1 and 1.2 done on this branch.

TASKS (in order)
1. If the folder _project/working-memory/org-data-boundary/ exists in your worktree, delete it (rm -r). It must never be staged or committed.
2. git status: only the six new files plus lib/auth.ts, lib/auth/dal.ts, app/sitemap.ts may appear. Anything else: revert it and report.
3. git fetch origin main; if main moved, git rebase origin/main.
4. Commit with message: "Move inline GROQ out of auth and sitemap into sanity-cms/lib (audit H1)". One commit is fine.
5. git push -u origin <this branch>.
6. Open ONE PR against main (use npx -y gh-axi; check --help once if unsure; fall back to gh only if gh-axi is unavailable, one at a time). Title: "Move inline GROQ out of auth and sitemap into the data layer". Body: list the six new functions and which hook/page uses each; "Audit finding closed: H1 (auth, dal, sitemap parts). The checkout parts are in the org-checkout-thin-routes PR; the lint rule that enforces the boundary lands in org-closeout"; the dead-category-sitemap observation; the owner live check below.

OWNER LIVE CHECK (put in the PR body)
- Sign up a new user, then sign in and open /account (profile exists, no error in the server log).
- In /account change the name: the Sanity userProfile name updates.
- Open /sitemap.xml: product URLs are listed as before.
- (Optional, destructive: skip unless you have a throwaway user) delete-account flow blocks when an open order exists.

DONE CRITERIA
- [ ] working-memory folder deleted and not staged
- [ ] branch pushed; one PR open against main
- [ ] PR body lists the new functions, findings closed, observation, and the owner check

CONSTRAINTS
- No build, lint, type-check, test or dev-server command. No $(...) or backticks. One command at a time. No subagents.
