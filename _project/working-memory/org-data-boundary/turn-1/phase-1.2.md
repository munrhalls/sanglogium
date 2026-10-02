AXIS org-data-boundary | TURN 1 of 1 | TASK AREA: GROQ only in the data layer, auth + sitemap (audit H1) | PHASE 1.2 of 3 — rewire callers

Prerequisite: phase 1.1 done on this branch. Same OWNS / OFF-LIMITS as phase 1.1.

GOAL
lib/auth.ts, lib/auth/dal.ts and app/sitemap.ts contain no GROQ and no direct Sanity client.

TASKS (in order)
1. lib/auth.ts
   - beforeDelete: replace the inline fetch + openStatuses constant with: if (await hasOpenOrdersForUser(user.id)) throw the SAME Error message as today.
   - afterDelete, profile delete: inside the existing try/catch call deleteUserProfileByAuthId(user.id) (replaces the fetch + backendClient.delete).
   - afterDelete, anonymize: inside the existing try/catch call anonymizeUserOrders(user.id).
   - databaseHooks.user.update.after, profile sync: inside the existing try/catch call syncUserProfileFromAuth({ authId: user.id, email: user.email, name: user.name }).
   - databaseHooks.user.create.after: replace the full-document fetch with getProfileIdByAuthId(user.id) (only truthiness was used), then createUserProfile({ authId: user.id, email: user.email, name: user.name }).
   - Remove the now-unused backendClient import (keep the mergeGuestOrdersByEmail import). Keep every console.log/console.error, thrown message and comment unchanged EXCEPT: the comment path docs/auth/userprofile-atomicity-spec-updated.md becomes docs/auth/userprofile-atomicity-spec.md (axis org-docs-prune renames that doc to this exact name).
2. lib/auth/dal.ts
   - ensureUserProfile: use getProfileIdByAuthId(user.id) for the existence check and createUserProfile(...) for the create; remove the backendClient import. Keep the cache, logging and "never throw" behaviour untouched.
   - Docstring path docs/auth/userprofile-atomicity-spec-updated.md becomes docs/auth/userprofile-atomicity-spec.md.
3. app/sitemap.ts
   - Replace the client import and the two inline client.fetch calls with getSitemapProducts() and getSitemapCategories() inside the same Promise.all; import the SitemapDocument type from the new module and delete the local SanityDocument interface. Everything else (static routes, URL shapes, /category/ block, catch) stays unchanged.
   - Observation to put in the PR body (do NOT change it): the "category" document type has no schema in sanity-cms/schemaTypes and no /category/[slug] route exists, so that sitemap block looks dead. Out of scope for this audit.

DONE CRITERIA
- [ ] git grep -n "_type ==" -- lib app/sitemap.ts prints nothing
- [ ] git grep -n "backendClient" -- lib prints nothing
- [ ] git grep -n "userprofile-atomicity-spec-updated" -- lib prints nothing
- [ ] lib/auth.ts imports only fetchers/mutators from sanity-cms/lib (no client); every hook still has its original try/catch, log text and error text
- [ ] app/sitemap.ts compiles by eye: both new functions awaited in Promise.all, destructuring order (products, categories) unchanged

CONSTRAINTS (apply to every task)
- NEVER run tsc, next build, next lint, eslint, tests, a dev server, npm install/ci, curl against the dev server, or any other build/check command. Verify with git and grep only. The owner verifies live on localhost:3000 and in PR review.
- No $(...) or backticks in shell commands. One command at a time. No subagents.
- Behaviour must not change.
- Edit only files under OWNS; if a task seems to need another file, STOP and report.
- Print paths as file:// URIs in your reports.
