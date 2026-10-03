AXIS lib-structure · TURN 1 (of 1) · AREA: lib/ roles, one file-name casing rule, dead ambient types · PHASE 1.1 — Fold lib/auth.ts and lib/auth-client.ts into lib/auth/

WAVE 2 — PREREQUISITE: axis shared-ui is merged into main (it edits features/products/ui/ProductInfo.tsx, which this axis also edits). Verify: shared/ui/carousel/CarouselRoot.tsx exists on origin/main. If it does not, STOP and report. Runs in parallel with: config-split, naming (file-disjoint).
OWNS (touch only these): lib/auth.ts, lib/auth-client.ts, lib/auth/**, and the importer files listed in task 3 and (phase 1.2) tasks 1-2. Phase 1.2 also owns lib/sanity/** (new), lib/utils/sanityImage*.ts, lib/dev/**, lib/qrcode.d.ts, next.config.ts.
NEVER TOUCH: lib/email.ts, lib/stripe.ts, lib/utils/{formatting,price,tailwind}.ts, docs/, CLAUDE.md, AGENTS.md, any other file.

GOAL
lib/ has a file lib/auth.ts next to a folder lib/auth/ and a kebab-case lib/auth-client.ts beside camelCase siblings. Target shape: lib/auth/{server,client,dal,providers}.ts.

SETUP (do first)
1. Read CLAUDE.md and AGENTS.md.
2. git fetch origin; make sure you start from the latest origin/main (fast-forward or pull if behind).
3. treehouse get --lease, then cd into the printed path.
4. git switch -c lib-structure from up-to-date main.

TASKS
1. git mv lib/auth.ts lib/auth/server.ts and git mv lib/auth-client.ts lib/auth/client.ts
2. Fix relative imports inside the moved/neighbouring files (read every import that starts with ./ or ../ in lib/auth/server.ts, lib/auth/client.ts, lib/auth/dal.ts, lib/auth/providers.ts):
   - in server.ts and client.ts a sibling-of-lib import such as ./email or ./stripe or ./utils/x becomes ../email, ../stripe, ../utils/x; ./auth/providers becomes ./providers; ./auth/dal becomes ./dal
   - in dal.ts and providers.ts an import of ../auth or ../auth-client (or the alias @/lib/auth) becomes ./server or ./client
   Alias imports (@/...) other than the two auth ones stay as they are.
3. Rewrite alias imports across the repo: "@/lib/auth" (exact, double or single quote) becomes "@/lib/auth/server"; "@/lib/auth-client" becomes "@/lib/auth/client". Files that import them today (re-grep to be sure): app/api/auth/[...all]/route.ts, features/account/actions.ts, features/account/ui/AccountActionsClient.tsx, features/auth/ui/ForgotPasswordForm.tsx, ResetPasswordForm.tsx, SignInForm.tsx, SignUpForm.tsx, TwoFactorSection.tsx, features/auth/ui/useSignOut.ts, features/products/ui/WishlistButton.tsx, lib/auth/dal.ts. Do NOT change imports of @/lib/auth/dal or @/lib/auth/providers.
4. Two comments cite docs/auth/userprofile-atomicity-spec-updated.md (a file that does not exist; docs/auth is deleted by another axis): in lib/auth/server.ts (was lib/auth.ts line ~267) and lib/auth/dal.ts (line ~74) delete only that "See docs/auth/..." sentence/line and keep the rest of each comment.

DONE
- [ ] git ls-files lib shows lib/auth/{client,dal,providers,server}.ts and no lib/auth.ts, no lib/auth-client.ts
- [ ] grep -rnE "@/lib/auth(\"|')|lib/auth-client" app features lib sanity-cms middleware.ts returns nothing
- [ ] grep -rn "docs/auth" lib returns nothing
- [ ] no relative import in lib/auth/*.ts points at a path that no longer exists (check each ./ and ../ import with ls)

RULES: Never run build, lint, tsc, tests, dev server, npm install or no-mistakes; never spawn subagents or open a browser; use only git, ls, grep, mkdir, mv, rm and file edits. Never put $(...) or backticks in a shell command; run one command at a time. Use git mv / git rm so history follows. Touch only the files listed under OWNS. If any path, line number or string above does not match the repo, STOP and report the exact mismatch (file:line); do not guess and do not re-plan. Report paths as file:// URIs.
