AXIS org-lib-infra | TURN 1 of 1 | TASK AREA: lib/ infrastructure placement and naming (audit M6) | PHASE 1.2 of 3 — one auth folder with explicit server and client files; qrcode types

Prerequisite: phase 1.1 done on this branch.

OWNS (only these may be edited)
- lib/**
- IMPORT-LINE-ONLY edits (change the import specifier, nothing else) in: app/api/auth/[...all]/route.ts, features/account/actions.ts, every file under features/auth/** and features/account/ui/** and features/products/ui/card/WishlistButton.tsx that imports "@/lib/auth-client" or "@/lib/auth", and any other importer found by the greps below.
OFF-LIMITS
- everything else.

TASKS (in order)
1. git mv lib/auth.ts lib/auth/server.ts. In it change the relative import "./email" to "../email". Check for any other relative import and fix it.
2. Repoint every importer of the server auth from "@/lib/auth" to "@/lib/auth/server". Find them with git grep -n "lib/auth\"\|lib/auth'" -- . ':(exclude)docs' and git grep -n "from \"\./auth\"\|from \"\.\./auth\"\|from \"\./lib/auth\"" -- . ':(exclude)docs'. Expected: app/api/auth/[...all]/route.ts, features/account/actions.ts, lib/auth/dal.ts (and middleware.ts if it imports it). No specifier may end exactly in "/lib/auth" afterwards.
3. git mv lib/auth-client.ts lib/auth/client.ts. Repoint every "@/lib/auth-client" importer to "@/lib/auth/client". Find them with git grep -n "lib/auth-client" -- . ':(exclude)docs'. Expected (paths may differ after other axes): features/auth/ui/{ForgotPasswordForm,ResetPasswordForm,SignInForm,SignUpForm,TwoFactorSection}.tsx and useSignOut.ts, features/products/ui/card/WishlistButton.tsx, and the features/account/ui files that call authClient (requireFreshSession.ts and the section components).
4. lib/qrcode.d.ts. "@types/qrcode" is already a devDependency (package.json). Read the file. If it only declares the "qrcode" module API that @types/qrcode already covers (toDataURL and friends used by features/auth/ui/TwoFactorSection.tsx), git rm lib/qrcode.d.ts. If it declares something @types/qrcode does not, git mv it to features/auth/ui/qrcode.d.ts (its only consumer) instead. Say which branch you took in the PR.
5. Final greps, all must print nothing: git grep -n "lib/auth-client" -- . ':(exclude)docs'; git grep -n "from \"@/lib/auth\"" -- . ':(exclude)docs'. lib/ must now contain: lib/auth/{server,client,dal,providers}.ts, lib/email.ts, lib/eventLogger.ts, lib/stripe.ts, lib/utils/*.

DONE CRITERIA
- [ ] git ls-files lib/auth* shows lib/auth/server.ts, client.ts, dal.ts, providers.ts and no lib/auth.ts / lib/auth-client.ts
- [ ] both final greps print nothing
- [ ] lib/auth/server.ts imports "../email"; lib/auth/dal.ts imports "@/lib/auth/server"
- [ ] qrcode types: either lib/qrcode.d.ts is gone (deleted branch) or features/auth/ui/qrcode.d.ts exists (moved branch); never both
- [ ] outside renames, git diff shows only changed import lines

OWNER LIVE CHECK (for the PR body)
- Sign up and sign in/out; the 2FA setup screen in /account shows its QR code; a signed-out wishlist heart redirects/prompts as before; /account loads; place one Stripe test order (event logger still writes).

CONSTRAINTS (apply to every task)
- NEVER run tsc, next build, next lint, eslint, tests, a dev server, npm install/ci, curl against the dev server, or any other build/check command. Verify with git and grep only. The owner verifies live on localhost:3000 and in PR review (the Vercel build type-checks; the qrcode typing change in task 4 is the one thing it must confirm).
- No $(...) or backticks in shell commands. One command at a time. No subagents.
- Move with git mv only; fix every importer in the same phase.
- Behaviour must not change.
- Edit only files under OWNS; if a task seems to need another file, STOP and report.
- Print paths as file:// URIs in your reports.
