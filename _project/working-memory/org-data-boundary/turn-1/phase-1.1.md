AXIS org-data-boundary | TURN 1 of 1 | TASK AREA: GROQ only in the data layer, auth + sitemap (audit H1) | PHASE 1.1 of 3 — create the data-layer modules

WAVE 1. Runs in parallel with: org-docs-prune, org-checkout-thin-routes, org-app-shell, org-feature-structure, org-oversized-files, org-data-scripts. Waits for nothing. Blocks: org-lib-infra, org-closeout.

GOAL
Every Sanity query and mutation now inline in lib/auth.ts, lib/auth/dal.ts and app/sitemap.ts becomes a named, single-purpose function in sanity-cms/lib. (Phase 1.2 rewires the callers.) Standard: the data layer is the only place that knows GROQ.

OWNS (only these may be edited or created)
- NEW files: sanity-cms/lib/orders/hasOpenOrdersForUser.ts, sanity-cms/lib/orders/anonymizeUserOrders.ts, sanity-cms/lib/account/createUserProfile.ts, sanity-cms/lib/account/deleteUserProfileByAuthId.ts, sanity-cms/lib/account/syncUserProfileFromAuth.ts, sanity-cms/lib/products/getSitemapEntries.ts
- lib/auth.ts, lib/auth/dal.ts, app/sitemap.ts (phase 1.2)
OFF-LIMITS
- app/checkout/**, app/api/**, features/**, every other file in lib/ and sanity-cms/lib/ (axis org-checkout-thin-routes creates sanity-cms/lib/products/getPaymentProducts.ts and getProductUnitAmountsByIds.ts; do not create or edit those).

TASKS (in order)
0. SYNC FIRST: run git fetch origin main. If this branch has no commits of its own run git merge --ff-only origin/main; if it already has commits run git rebase origin/main. git status must be clean before you touch anything.
1. Read lib/auth.ts (hooks: deleteUser.beforeDelete, deleteUser.afterDelete, databaseHooks.user.update.after, databaseHooks.user.create.after), lib/auth/dal.ts (ensureUserProfile), app/sitemap.ts, and sanity-cms/lib/account/getProfileIdByAuthId.ts (existing; returns { _id } | null via backendClient). Do not edit them yet.
2. Create sanity-cms/lib/orders/hasOpenOrdersForUser.ts: export async function hasOpenOrdersForUser(userId: string): Promise<boolean>. It holds the open-status list (pending_payment, processing, packed, shipped, out_for_delivery) and the exact query now in beforeDelete, runs it with backendClient (import from "@/sanity-cms/lib/backendClient"), returns true when at least one order comes back.
3. Create sanity-cms/lib/orders/anonymizeUserOrders.ts: export async function anonymizeUserOrders(userId: string): Promise<void>. Exact patch from afterDelete: query selecting orders by userId, unset userId, set isGuest true, commit. It must throw on failure exactly as the inline code does (the caller keeps its try/catch and log).
4. Create sanity-cms/lib/account/createUserProfile.ts: export async function createUserProfile(input: { authId: string; email: string; name?: string | null }): Promise<void> — backendClient.create of { _type: "userProfile", authId, email, name: name || "" }.
5. Create sanity-cms/lib/account/deleteUserProfileByAuthId.ts: export async function deleteUserProfileByAuthId(authId: string): Promise<void> — uses the existing getProfileIdByAuthId, then backendClient.delete(id) when a profile exists; no-op otherwise.
6. Create sanity-cms/lib/account/syncUserProfileFromAuth.ts: export async function syncUserProfileFromAuth(input: { authId: string; email: string; name?: string | null }): Promise<void> — getProfileIdByAuthId, then when found patch .set({ email, name: name || "" }).commit().
7. Create sanity-cms/lib/products/getSitemapEntries.ts: export type SitemapDocument = { slug: string; _updatedAt?: string }; export async function getSitemapProducts(): Promise<SitemapDocument[]> and getSitemapCategories(): Promise<SitemapDocument[]>, each running the exact query now in app/sitemap.ts with client from "@/sanity-cms/lib/client". Copy the query strings character for character.
8. Every new file: no import from features/** and no console noise added; match the style of the neighbouring files in the same folder (named export, one function per file).

DONE CRITERIA
- [ ] the six new files exist with the names and signatures above
- [ ] each query/patch string is byte-identical to the inline original (check with git grep on a distinctive fragment, e.g. the openStatuses query and the anonymize patch)
- [ ] none of the new files imports from "@/features/"
- [ ] lib/auth.ts, lib/auth/dal.ts, app/sitemap.ts are still unmodified at the end of this phase

CONSTRAINTS (apply to every task)
- NEVER run tsc, next build, next lint, eslint, tests, a dev server, npm install/ci, curl against the dev server, or any other build/check command. Verify with git and grep only. The owner verifies live on localhost:3000 and in PR review.
- No $(...) or backticks in shell commands. One command at a time. No subagents.
- Behaviour must not change: queries, patch bodies and fallback values stay verbatim.
- Edit only files under OWNS; if a task seems to need another file, STOP and report.
- Print paths as file:// URIs in your reports.
