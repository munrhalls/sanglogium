# Org Invariants Register

How to read: this is the audit register of repository-organization invariants; each row is verified against the tree at the baseline commit. Rows labelled H are human-enforced (judgment, PR review), not mechanically locked. Lock plan classes: [A] mechanically locked, [B] human-enforced, [C] violated today — fix or rule before locking.

## Baseline

- Baseline commit: `1c464ca5` (`git rev-parse --short origin/main`)
- eslint version: `^9.39.4` (package.json)
- Date: 2026-10-03

## Scope

Agent-behaviour rules (self-verification ban, git authority, feedback cadence, resource discipline, response formatting) are NOT repository-organization invariants and are out of this register.

## Legend

- **Kind:** M = mechanically verifiable and lockable; H = judgment call, human-enforced (PR review); M+H = mechanical part plus a judgment part.
- **Holds today:** YES | NO (n violations, up to 5 example paths, then "+N more") | PARTIAL (what holds, what not) | NOT-CHECKED (reason) | N-A (human).
- **Existing lock vocabulary:** ESL:ENTRY_ONLY, ESL:NO_SANITY, ESL:NO_APP, ESL:NO_FEATURES, ESL:NO_PARENT_RELATIVE, ESL:data-layer-no-actions, ESL:no-cycle(warn), ESL:JEST_PATHS, PLG:<rule-name>, CHK:resolve, CHK:deleted-referrer, GIT:.gitignore, none.
- **Lock plan classes:** [A] holds + will be mechanically locked (mechanism | file | turn); [B] holds + human-enforced (one-line reviewer check); [C] violated today (which side is wrong + fix-or-decision, never lock first).

## S - Layout and naming

| ID | Invariant | Source | Kind | Holds today | Existing lock | Lock plan |
|----|-----------|--------|------|-------------|---------------|-----------|
| S1 | Root tracked files are a subset of the CLAUDE.md root allowlist (tool config, tool-generated files schema.json / sanity.types.ts / skills-lock.json, entry docs README/CLAUDE/AGENTS) | CLAUDE.md Repository Layout Standard | M | YES | none | [A] check-imports: added/renamed root files vs allowlist | tools/check-imports.mjs | turn 2 |
| S2 | Root tracked folders are a subset of: app features lib sanity-cms scripts tools docs data public shared _project .github .claude .codex .devin | CLAUDE.md Repository Layout Standard | M | YES | none | [A] check-imports: added/renamed root folders vs allowlist | tools/check-imports.mjs | turn 2 |
| S3 | Never committed: .env* except .env.example, logs, backups, caches, virtualenvs, conversation caches; git ls-files -ci --exclude-standard lists nothing | CLAUDE.md Repository Layout Standard | M | YES (only .env.example tracked; ls-files -ci empty) | GIT:.gitignore (.env*, logs/, node_modules, .next listed) | [A] check-imports: fail on added path matching .env*/logs/cache/backup names | tools/check-imports.mjs | turn 2 |
| S4 | No tracked file under _project/working-memory/; tracked _project/ is exactly the three living process documents | CLAUDE.md Repository Layout Standard + Campaign process | M | YES (3 process docs; working-memory empty) | none (check-ignore: no rule; discipline only) | [A] add _project/working-memory/ to .gitignore + check-imports ban on added paths there | .gitignore + tools/check-imports.mjs | turn 2 |
| S5 | No spaces or non-ASCII characters in tracked paths | CLAUDE.md Repository Layout Standard (Naming) | M | YES | none | [A] check-imports: added paths must be ASCII, no spaces | tools/check-imports.mjs | turn 2 |
| S6 | docs/ and scripts/ paths are lowercase kebab-case (exempt: README.md, ADR-NNN-*.md) | CLAUDE.md Repository Layout Standard (Naming) | M | YES (only exempt ADR-002 printed) | none | [A] check-imports: added docs//scripts/ paths kebab-case | tools/check-imports.mjs | turn 2 |
| S7 | Components PascalCase; client/server pairs named XClient.tsx / XServer.tsx | CLAUDE.md Repository Layout Standard (Naming) | M | PARTIAL (PascalCase holds; 8 unpaired: NewsletterSignupClient, NavbarActionsServer, ActionBarServer, AccountActionsClient, AddressesClient, +3 more) | none | [C] doc wrong -> correct the pairing wording in CLAUDE.md (turn 4), DEC-6; then [A] added-path PascalCase + suffix-naming rule | tools/check-imports.mjs | turn 2 |
| S8 | docs/ holds only the four living references and ADR-002; no working notes or generated analyses | CLAUDE.md Repository Layout Standard (Where things go, Docs honesty) | M | YES | none | [A] check-imports: added docs/ paths vs allowlist (incl. this register per DEC-2) | tools/check-imports.mjs | turn 2 |
| S9 | An executed one-off script in scripts/ is deleted (git history is the archive) | CLAUDE.md Repository Layout Standard (Where things go) | H | N-A (human; scripts on disk: build-catalogue-index.mjs, commit.sh, feed-next.sh, sourcing-pipeline-monitor.sh) | none (PR review) | [B] human-enforced: reviewer checks each added scripts/ file is a needed recurring tool, not an executed one-off |
| S10 | Closed campaign records are deleted, not archived (no archive directory tracked) | CLAUDE.md Repository Layout Standard (Where things go) | M | YES | none | [A] check-imports: ban added paths under archive/campaign dirs | tools/check-imports.mjs | turn 2 |
| S11 | No identical copy of a document exists in two places | CLAUDE.md Repository Layout Standard (Docs honesty) | M | YES | none | [A] check-imports: blob-hash of added .md files vs tracked .md files | tools/check-imports.mjs | turn 2 |
| S12 | tools/ holds local tooling only (ESLint plugin, check script) | CLAUDE.md Repository Layout Standard (Where things go) | M | YES (check-imports.mjs, eslint-plugin-sang-logium.cjs) | none | [A] check-imports: added tools/ paths vs local-tooling allowlist | tools/check-imports.mjs | turn 2 |

## F - Feature shape

| ID | Invariant | Source | Kind | Holds today | Existing lock | Lock plan |
|----|-----------|--------|------|-------------|---------------|-----------|
| F1 | features/ contains only feature directories; each feature root is a subset of {ui/ model/ config/ domain/ adapters/ proofs/ index.ts server.ts actions.ts} | CLAUDE.md Conventions (Where feature code goes) | M | YES | none | [A] check-imports: added feature-root entries vs subset | tools/check-imports.mjs | turn 2 |
| F2 | Every feature has index.ts (client-safe entry) | CLAUDE.md Conventions (Where feature code goes) | M | YES | none | [A] check-imports: an added feature dir must include index.ts | tools/check-imports.mjs | turn 2 |
| F3 | server.ts, when present, imports 'server-only' | CLAUDE.md Conventions (Where feature code goes) | M | YES (4/4 server.ts import it; index.ts hits are comments; checkout/adapters/orders.ts also imports it) | none (Next build fails only if a client module imports it) | [A] check-imports content rule: added/changed server.ts must import 'server-only' | tools/check-imports.mjs | turn 2 |
| F4 | actions.ts, when present, is 'use server' and its value exports are async functions only | CLAUDE.md Conventions (Server Actions) | M | YES (3 files: account, checkout, products; all 'use server', async-only exports, no stray directives) | none (Next build rejects non-async exports; no repo check) | [A] check-imports content rule on changed actions.ts ('use server' + async-only value exports) | tools/check-imports.mjs | turn 2 |
| F5 | index.ts is client-safe: imports no server.ts, actions.ts, adapters/ or 'server-only' | CLAUDE.md Conventions (Where feature code goes) | M | YES (only header-comment mentions matched, no real imports) | none | [A] check-imports content rule on changed features/*/index.ts | tools/check-imports.mjs | turn 2 |
| F6 | adapters/ modules are imported only by the same feature's server.ts and actions.ts | CLAUDE.md Conventions (Where feature code goes) | M | NO (1: features/checkout/ui/OrderDetails.tsx imports @/features/checkout/adapters/orders; nuqs/adapters hit is external, ignored) | none | [C] tree wrong -> fix the importer (DEC-5, precedes turn 2); then [A] check-imports content rule on adapters/ importers | tools/check-imports.mjs | turn 2 |
| F7 | Features on disk are exactly the nine in the Feature map; only product-filtering and product-search carry the product- prefix | CLAUDE.md Conventions (Naming, Feature map) | M | YES (9 dirs; only product-filtering + product-search prefixed) | none | [A] check-imports: added features/<dir> vs feature-map allowlist + product-* prefix ban | tools/check-imports.mjs | turn 2 |
| F8 | Client components with module-scope side effects (e.g. loadStripe) and async Server Components that fetch Sanity stay next to their route and are never re-exported from index.ts | CLAUDE.md Conventions (Where feature code goes) | H | N-A (human) | none (PR review) | [B] human-enforced: reviewer checks a changed index.ts does not re-export a side-effect or Sanity-fetching component |
| F9 | proofs/ exists only in product-filtering and its output dir is git-ignored | CLAUDE.md Conventions (Tests) | M | YES (only product-filtering; out/ ignored via nested proofs/out/.gitignore) | GIT:.gitignore (nested proofs/out/.gitignore); none for location half | [A] check-imports: ban added proofs/ paths outside features/product-filtering/ | tools/check-imports.mjs | turn 2 |

## D - Dependency direction and imports

| ID | Invariant | Source | Kind | Holds today | Existing lock | Lock plan |
|----|-----------|--------|------|-------------|---------------|-----------|
| D1 | Features never import app/ | eslint.config.mjs NO_APP; CLAUDE.md Conventions (Shared UI and shell) | M | YES | ESL:NO_APP on features/**/*.{ts,tsx,mts,mjs} | [A] keep ESL:NO_APP; agent-gate reach per DEC-1 (default: mirror boundary rules in check-imports, turn 2) |
| D2 | shared/ imports neither app/ nor features/ | eslint.config.mjs NO_APP, NO_FEATURES | M | YES | ESL:NO_APP + ESL:NO_FEATURES on shared/**/*.{ts,tsx} | [A] keep ESL locks; agent-gate reach per DEC-1 |
| D3 | Features never import sanity-cms, except features/*/actions.ts and features/*/adapters/** | eslint.config.mjs NO_SANITY; CLAUDE.md Conventions (Server Actions) | M | YES | ESL:NO_SANITY on features/**, exempt in features/*/actions.ts + features/*/adapters/** | [A] keep ESL:NO_SANITY; agent-gate reach per DEC-1 |
| D4 | sanity-cms/lib never imports @/features/*/actions | eslint.config.mjs (sanity-cms/lib block) | M | YES | ESL:data-layer-no-actions on sanity-cms/lib/** (gap: regex only matches alias form ^@/features/[^/]+/actions$, not relative) | [A] widen the block's regex to also match the relative form | eslint.config.mjs | turn 3 |
| D5 | sanity-cms/lib imports a feature only through its index or server entry (never ui, domain, actions) | CLAUDE.md Conventions (Data layer, Feature dependency graph) | M | YES | ESL:ENTRY_ONLY + ESL:data-layer-no-actions on sanity-cms/lib/** | [A] keep ESL locks; agent-gate reach per DEC-1 |
| D6 | Code outside features/ imports a feature only through @/features/<n>, /server or /actions (no deep imports) | eslint.config.mjs ENTRY_ONLY; CLAUDE.md Conventions | M | YES | ESL:ENTRY_ONLY on **/*.{ts,tsx} (and repeated per scope block) | [A] keep ESL:ENTRY_ONLY (after DEC-3 settles same-feature paths); agent-gate reach per DEC-1 |
| D7 | Inside features/, anything reaching outside the file's directory uses the @/ alias, while ENTRY_ONLY forbids deep @/features paths: the two must not contradict | CLAUDE.md Conventions (Import specifiers) vs eslint.config.mjs ENTRY_ONLY | M | NO (doc requires @/features/<self>/... alias, ENTRY_ONLY regex flags it — no exemption exists: 57 files / 92 import lines; lint not run, derived from regex. No cross-feature deep imports) | ESL:ENTRY_ONLY (cause of the contradiction) | [C] both sides conflict -> DEC-3 (default: exempt same-feature deep paths in ENTRY_ONLY, eslint.config.mjs turn 3); doc wording follow-up turn 4 |
| D8 | No import specifier containing '..' anywhere under features/ | CLAUDE.md Conventions (Import specifiers); eslint NO_PARENT_RELATIVE; check-imports | M | YES | ESL:NO_PARENT_RELATIVE group ["../*",".."] on features/** blocks (incl. actions.ts + adapters blocks); multi-level '../..' match NOT-CHECKED (needs lint run); check-imports has no '..' check | [A] extend group to cover multi-level '../..' + add specifier-level '..' scan in check-imports | eslint.config.mjs turn 3 + tools/check-imports.mjs turn 2 |
| D9 | Inside features/ only './' same-directory relative imports exist; the claim "the feature's own UI imports ./actions relatively" is consistent with that | CLAUDE.md Conventions (Import specifiers, Server Actions) | M | PARTIAL (~100 './<subdir>/' imports, mostly index.ts/server.ts re-exports + ui subdir files, e.g. catalogue/ui, homepage/ui; UI imports actions via @/features/*/actions alias — doc './actions' claim stale) | none for the sub-directory half | [C] doc wrong -> correct the relative-import claims in CLAUDE.md (turn 4), DEC-6; lock only after the convention is restated |
| D10 | Cross-feature import edges are acyclic and a subset of the documented L0-L3 dependency graph | CLAUDE.md Conventions (Feature dependency graph) | M | YES (all edges match documented graph; acyclic: yes) | none | [A] check-imports: allowed-edge table evaluated on changed files under features/ | tools/check-imports.mjs | turn 2 |
| D11 | No import cycles inside features/ and app/components/layout | eslint.config.mjs import/no-cycle (warn) | M | NOT-CHECKED (file-level cycles need a lint run, banned; feature-level acyclic: yes) | ESL:no-cycle(warn, maxDepth 6) on features/**/*.{ts,tsx} + app/components/layout/**/*.{ts,tsx}; warn not error | [B] human-enforced: owner runs npm run lint-strict by hand and confirms no-cycle is clean before it can be raised to error (turn 3 decision) |
| D12 | features/*/actions.ts (and adapters/) are the only feature files importing server-only lib/* modules | CLAUDE.md Conventions (Server Actions) | M | YES (non-actions files import only client-safe modules: auth/client, sanity/imageLoader, sanity/imageUrl, utils/*; none of the server-ish set dal/providers/server/eventLogger/email/stripe) | none (nothing bans @/lib/* in features) | [A] check-imports content rule: changed non-actions/non-adapters feature file must not import server-ish lib modules | tools/check-imports.mjs | turn 2 |
| D13 | Client Components never use the Sanity client directly | tools/eslint-plugin-sang-logium.cjs no-direct-sanity-in-client | M | PARTIAL (no client.fetch; 2 import hits: app/(studio)/studio/[[...tool]]/page.tsx next-sanity/studio, app/components/layout/header/SearchField.tsx @/sanity-cms/lib searchProducts — documented injection) | PLG:no-direct-sanity-in-client (heuristic: only flags X.fetch where X contains "sanity" in a 'use client' file; ignores imports) | [C] doc/wording wrong -> restate the client-boundary incl. the studio + injected-action exceptions (turn 4), DEC-6; also strengthen plugin to check imports | tools/eslint-plugin-sang-logium.cjs | turn 3 |
| D14 | No Jest or @testing-library imports anywhere (tests are retired; Jest paths are banned imports) | eslint.config.mjs JEST_PATHS | M | YES | ESL:JEST_PATHS (dead tests/AGENTS.md messages tracked under H3) | [A] keep ESL:JEST_PATHS after its message cleanup (H3 fix, turn 3); agent-gate reach per DEC-1 |

## A - Data layer, shared and shell shape

| ID | Invariant | Source | Kind | Holds today | Existing lock | Lock plan |
|----|-----------|--------|------|-------------|---------------|-----------|
| A1 | GROQ queries and Sanity patches exist only under sanity-cms/lib (Studio schema code excepted) | CLAUDE.md Conventions (Data layer) | M | NO (real GROQ/patch in lib/auth/dal.ts + lib/auth/server.ts; also scripts/build-catalogue-index.mjs + features/product-filtering/proofs/*.mjs — owner must rule on script/proof exception) | none for location (PLG:groq-reference-syntax checks syntax only) | [C] tree wrong (lib/auth) + owner ruling needed on scripts/proofs -> DEC-4 (precedes turn 2); then [A] check-imports content rule on GROQ/patch outside allowed dirs | tools/check-imports.mjs | turn 2 |
| A2 | backendClient (write client) is imported only inside sanity-cms/lib | CLAUDE.md Conventions (Data layer) | M | NO (2: lib/auth/dal.ts, lib/auth/server.ts import @/sanity-cms/lib/backendClient) | none | [C] tree wrong, same cause as A1 -> DEC-4; then [A] check-imports content rule on backendClient importers | tools/check-imports.mjs | turn 2 |
| A3 | Order writers createOrderFromPaymentIntent and mergeGuestOrders are defined in sanity-cms/lib/orders | CLAUDE.md Conventions (Data layer) | M | PARTIAL (both under sanity-cms/lib/orders/, but mergeGuestOrders is named mergeGuestOrdersByEmail — doc name stale) | none | [C] doc wrong -> fix the function name in CLAUDE.md (turn 4), DEC-6; then [B]-ish [A] check-imports: writers stay under orders/ | tools/check-imports.mjs | turn 2 |
| A4 | actions.ts is thin: auth guard, one call into sanity-cms/lib, revalidate; no inline GROQ or patches | CLAUDE.md Conventions (Server Actions) | M+H | PARTIAL (no inline GROQ in any actions.ts; but 0 files call revalidate, and checkout/actions.ts (279 lines) imports no dal guard; guard->call->revalidate shape + thinness: human-reviewed) | none | [C] doc-or-tree wrong -> DEC-7 (owner rules whether revalidate/dal shape is the contract); doc correction default (turn 4); thinness stays [B] reviewer check |
| A5 | sanity-cms/lib is grouped into account/ homepage/ orders/ products/ plus client.ts and backendClient.ts | CLAUDE.md Conventions (Data layer) | M | YES | none | [A] check-imports: added sanity-cms/lib top-level entries vs grouping allowlist | tools/check-imports.mjs | turn 2 |
| A6 | lib/ holds only the enumerated cross-cutting modules, camelCase module files, no domain code | CLAUDE.md Conventions (lib/) | M+H | YES (all 12 files in enumerated set, camelCase; domain-free half: human) | none | [A] check-imports: added lib/ paths vs enumerated set + camelCase | tools/check-imports.mjs | turn 2 (domain-free half stays [B] reviewer check) |
| A7 | shared/ui holds primitives with no domain knowledge or at least two consuming features | CLAUDE.md Conventions (Shared UI and shell) | H | N-A (human) | none (PR review) | [B] human-enforced: reviewer checks each added shared/ui file is domain-free or has >=2 consuming features |
| A8 | app/ is route-only and thin: route groups (store) (admin) (studio), checkout/, api/, components/{layout,analytics}; app/components/features/ does not exist | CLAUDE.md Architecture Overview + Conventions | M+H | YES (shape; components=layout+analytics only; thin half: human. Also top-level shell files: error.tsx, global-error.tsx, globals.css, robots.ts, sitemap.ts, suppress-warnings.ts) | none | [A] check-imports: added app/ top-level entries vs shape allowlist (incl. shell files) | tools/check-imports.mjs | turn 2 (thin half stays [B]) |
| A9 | shared/ contains only ui/ and styles/ | CLAUDE.md Architecture Overview | M | YES | none | [A] check-imports: added shared/ top-level entries vs {ui,styles} | tools/check-imports.mjs | turn 2 |
| A10 | sanity-cms/ top level is schemaTypes/, structure.ts, env.ts, lib/ | CLAUDE.md Conventions (Data layer) | M | YES | none | [A] check-imports: added sanity-cms/ top-level entries vs allowlist | tools/check-imports.mjs | turn 2 |
| A11 | The generated catalogue artifact data/catalogue-index.json stays in data/ (not inside the feature) | CLAUDE.md Conventions (Feature map) | M | YES (data/catalogue-index.json is the only tracked file under data/) | none | [A] check-imports: added data/ paths vs single-file allowlist | tools/check-imports.mjs | turn 2 |
| A12 | Feature-map placement exceptions hold: wishlist page stays a route; account route pages stay in app/(store)/account; checkout keeps app/checkout pages; auth infrastructure stays in lib/auth; homepage data stays in sanity-cms/lib/homepage and app/(store)/page.tsx | CLAUDE.md Conventions (Feature map) | M+H | YES (all placements confirmed; props-only/thinness halves: human) | none | [A] check-imports: added paths for the named placements (wishlist/account/checkout routes, lib/auth, homepage fetchers) | tools/check-imports.mjs | turn 2 (props-only half stays [B]) |

## H - Docs and enforcement honesty

| ID | Invariant | Source | Kind | Holds today | Existing lock | Lock plan |
|----|-----------|--------|------|-------------|---------------|-----------|
| H1 | The living docs (four UX/architecture references + ADR-002) contain no dead path | CLAUDE.md Repository Layout Standard (Docs honesty) | M | NO (1: features/products/ui/WishlistButton.tsx in homepage-structure.md — real file is ui/card/WishlistButton.tsx; ~20 hits triaged to component-name/route/placeholder false positives) | none | [C] doc wrong -> fix the path ref (turn 4), DEC-6; then [A] check-imports: verify backticked paths in changed living docs + scan them on deletes/renames | tools/check-imports.mjs | turn 2 |
| H2 | The entry docs CLAUDE.md, AGENTS.md, README.md contain no dead path | CLAUDE.md Repository Layout Standard (Docs honesty), extended | M | PARTIAL (no outright dead path; ~50 hits triaged to shorthand/extension-less refs — features/*/server, lib/auth/dal — plus _project/working-memory/ untracked by design; file:// examples are samples) | none | [C] doc ambiguity -> restate which ref forms count as paths (turn 4), DEC-6; then same check-imports doc-path rule as H1 | tools/check-imports.mjs | turn 2 |
| H3 | eslint.config.mjs is honest: every ignore, message and files-glob refers to something that exists and matches at least one tracked file | eslint.config.mjs | M | NO (dead refs: tests/AGENTS.md cited in 3 JEST_PATHS messages — missing, Vitest retired; dead ignores _archive/** and docs/examples/** match no tracked file; all files-globs live) | none | [C] config wrong -> remove/rewrite dead refs and ignores, DEC-8 (turn 3 fixes its own file before locking); keep honest via reviewer check on future edits |
| H4 | Every custom plugin rule in tools/eslint-plugin-sang-logium.cjs still targets something that exists (test-import-discipline vs retired tests) | tools/eslint-plugin-sang-logium.cjs; CLAUDE.md Conventions (Tests) | M | NO (dead rule: test-import-discipline — 0 .test/.spec files, message cites retired tests/AGENTS.md; other 5 rules have live targets or are preventive guards) | PLG:test-import-discipline (dead) | [C] config wrong -> delete the dead rule + dead messages, DEC-8 (turn 3, same fix); reviewer checks rule liveness on future plugin edits |
| H5 | Tests are retired: no tracked test files, test configs or test dependencies; only the two product-filtering proof scripts remain | CLAUDE.md Conventions (Tests) | M | YES (0 test files/configs; no test dep or script in package.json; workflows have no test step; proofs excluded) | ESL:JEST_PATHS (bans jest imports only — nothing prevents adding test files) | [A] check-imports: fail on added test/spec/config paths + package.json diff adding test deps | tools/check-imports.mjs | turn 2 |
| H6 | tools/check-imports.mjs does what CLAUDE.md and AGENTS.md say it does (checks performed match the claims) | CLAUDE.md Hard Limits + AGENTS.md rule 0 | M | YES (claims "name-resolution check" = specifier resolution; script also does deleted-referrer checks beyond the claim; no syntax parse, no '..' check — none claimed) | CHK:resolve, CHK:deleted-referrer | [B] human-enforced: when check-imports.mjs changes, reviewer verifies the CLAUDE.md/AGENTS.md description still matches (turn 4 keeps claims current) |
| H7 | Every ESL/PLG lock is exercised by a gate that actually runs (CI, or a command an agent is allowed to run) | AGENTS.md rule 0 + eslint.config.mjs | M | NO (ESL/PLG locks run only when the owner lints by hand; agents cannot run them; only CHK locks bite at ship; no CI lint step) | none | [C] enforcement layer wrong -> DEC-1 (default: mirror agent-relevant locks in check-imports, keep eslint as editor-time layer) |

## Owner decisions

| DEC | What is violated / at stake (rows) | Option 1 | Option 2 | Recommended default |
|-----|-----------------------------------|----------|----------|---------------------|
| DEC-0 | Guard-file drift: the owner's main checkout carries uncommitted edits that turns 2-3 will collide with. Recorded `git -C /home/jan/work/sanglogium status --short`: ` M AGENTS.md`, ` M CLAUDE.md`, ` M eslint.config.mjs`, ` M package-lock.json`, ` M package.json`, `?? _project/working-memory/`, `?? tools/check-imports.mjs` | Land them via a PR before turns 2-3 touch those files | Discard them | Land or discard BEFORE turn 2 — turns 2-3 edit exactly those files |
| DEC-1 (lock-layer) | No gate runs eslint for agents; all ESL/PLG locks are advisory-only today (H7, and every row whose lock is ESL/PLG) | (a) Move agent-relevant boundary locks into check-imports; keep eslint as editor-time layer | (b) Add a CI lint step; (c) keep both, accept duplication | (a) |
| DEC-2 (register-home) | docs/ allowlist counts five documents; this register is a sixth (S8, H1, CLAUDE.md Docs honesty) | Keep it in docs/ as a living reference; turn 4 adds it to the CLAUDE.md allowed-docs list and the S8/H1 sets | Delete it after the axis | Keep it; the S8 check-imports allowlist must include docs/org-invariants-register.md |
| DEC-3 (alias contradiction) | D7: CLAUDE.md requires intra-feature code to use the deep @/features/<self>/... alias; ENTRY_ONLY forbids exactly that (57 files / 92 lines) | Exempt same-feature deep paths from ENTRY_ONLY (eslint.config.mjs, turn 3) | Change the doc to ban deep self-imports and use ./ everywhere | Exempt same-feature paths in the regex; doc wording follow-up in turn 4 |
| DEC-4 (data-layer bypass) | A1 + A2: lib/auth/dal.ts and lib/auth/server.ts run their own GROQ/patches and import backendClient; also whether scripts/ and proofs/ GROQ is a blessed exception | Move lib/auth Sanity access into sanity-cms/lib (tree fix, precedes turn 2) | Bless lib/auth + scripts + proofs as allowed locations (doc fix, turn 4) | Move the code (tree fix); bless scripts/proofs separately in the doc |
| DEC-5 (adapters leak) | F6: features/checkout/ui/OrderDetails.tsx imports @/features/checkout/adapters/orders | Fix the importer to go through the server entry (tree fix, precedes turn 2) | Amend the doc to allow ui importers of adapters | Fix the tree |
| DEC-6 (stale doc claims) | S7 pairing wording, D9 './'-only + './actions' claims, A3 mergeGuestOrders name, D13 client-boundary wording, H1 dead path, H2 ambiguous ref forms | Correct CLAUDE.md / docs to match the tree (turn 4) | Change the tree to match the doc | Correct the docs (turn 4) |
| DEC-7 (actions shape) | A4: doc says actions.ts = auth guard + one sanity-cms/lib call + revalidate; reality: 0 files revalidate, checkout/actions.ts has no dal guard and is 279 lines | Restate the contract to match reality (turn 4) | Add guards/revalidate to the three actions.ts (tree fix) | Restate the doc; owner decides if checkout needs a guard |
| DEC-8 (dead enforcement refs) | H3 + H4: tests/AGENTS.md cited in JEST_PATHS messages, _archive/** and docs/examples/** ignores match nothing, test-import-discipline rule is dead | Delete dead refs/ignores/rule in turn 3 | Restore the referenced files/targets | Delete them (tests are retired) |

## Lock design rules and file ownership per turn

Rules:
1. One invariant, one lock location.
2. Mechanisms in order: .gitignore, check-imports (diff-scoped), eslint pattern, plugin rule, human.
3. A violated row is fixed or ruled on BEFORE it is locked.
4. No new dependency, no new top-level file, no test file.
5. Locks add no whole-repo scan — check-imports rules stay diff-scoped (~0.1s).

Ownership (two turns never edit the same file):

| Turn | Owns | Does not touch |
|------|------|----------------|
| Turn 2 | tools/check-imports.mjs, .gitignore | eslint.config.mjs, plugin, docs |
| Turn 3 | eslint.config.mjs, tools/eslint-plugin-sang-logium.cjs | check-imports, docs |
| Turn 4 | CLAUDE.md, AGENTS.md, README.md, docs/** (register finalized here) | tools/, eslint.config.mjs |

Turns 2 and 3 report lock status in their commit messages; they do NOT edit this register.

Fix-before-lock work (must precede the locking turn; assigned after owner answers the decisions):
- DEC-4 tree fix: lib/auth/{dal,server}.ts Sanity access moved into sanity-cms/lib — touches lib/auth/ + sanity-cms/lib/ — before turn 2 (blocks A1/A2 locks).
- DEC-5 tree fix: features/checkout/ui/OrderDetails.tsx import routed via server entry — touches features/checkout/ — before turn 2 (blocks F6 lock).

## Summary counts

- Total rows: 54 (S:12, F:9, D:14, A:12, H:7)
- Kind: M 47 | M+H 4 (A4, A6, A8, A12) | H 3 (S9, F8, A7)
- Holds today: YES 36 | NO 8 (F6, D7, A1, A2, H1, H3, H4, H7) | PARTIAL 6 (S7, D9, D13, A3, A4, H2) | NOT-CHECKED 1 (D11) | N-A 3 (S9, F8, A7)
- Class: [A] 35 | [B] 5 (S9, F8, A7, D11, H6) | [C] 14 (S7, F6, D7, D9, D13, A1, A2, A3, A4, H1, H2, H3, H4, H7)

Axis done standard met when every row is [A] locked, [B] labelled, or [C] fixed/ruled.
