# Macro Refactor Roadmap — every major area to a 9+/10, system-fit

Status: v1.2 · 2026-10-01 · baseline `main` = `origin/main` = `047b0072` (PR #40 merged, so the CLAUDE.md "features" paragraph is already on main).
v1.1 owner decisions: (1) the 58 zero-reference `sanity-cms/utils` scripts are deleted; (2) the conflicting remote branches are deleted by the executor; both happen in the new first axis `repo-hygiene` (H, 1 turn). (3) The dev pages (`normalization`, `normalize-accessories-section`, `app/dev`, `app/design-system-test`) are deferred completely: no decision, no prune, no gating; axes touch them only to keep their imports compiling.
v1.2: the plan was made parallel-safe: no shared log file (one log per axis), CLAUDE.md edited only by A0 and A11, .no-mistakes.yaml surfaces declared once in A0 T3, docs/homepage-structure.md edited only by A8, infra-closeout reduced to one turn; the certified parallel groups are in `parallel-plan.md`.
Working memory: every turn is written out as `_project/working-memory/<axis-slug>/turn-<n>/phase-<n.m>.md`. Feature-axis slugs carry the `-reorg` suffix (`checkout-reorg`, `catalogue-reorg`, `auth-reorg`, `basket-reorg`, `products-reorg`, `homepage-reorg`, `account-reorg`); the others use the slugs of §6.1 (`repo-hygiene`, `boundary-conventions`, `test-lanes`, `shell-carve-out`, `infra-closeout`, `legacy-retirement`).
Author: Architect pass, read-only. Marks: **[V]** = verified by reading, grep, or an import-graph script at the baseline. **[U]** = could not be verified read-only (needs the human, GitHub, or a run).

Scope: organization only. No behaviour, UX or visual change. Nothing speculative. Dead code is pruned, never migrated. Every axis is executable through grep-verified phases (executors never run tsc/lint/build/tests; verification = human PR review + live dev-server check).

The template every axis follows comes from the two finished axes (`git log`: filtering 17/11/8/13 files per turn, search 6/20/8): **T1 headless core (config/domain) → T2 UI move + entries → T3 server/actions/fetcher decoupling → T4 tests + docs pointers + legacy removal.**

---

## 1. Inventory check (your hypothesis vs. the repo)

Counts are exact [V]. Three classifications are amended:

- `app/components/layout` (31) is really three things: storefront chrome (12), carousel primitives (7), catalogue navigation UI (12).
- `app/components/ui` (6) holds three single-consumer components (Checkbox, QuantitySelector, ProductBadge) and one dead file (`modal/Modal.tsx`).
- `sanity-cms/utils` is 69 scripts (68 `.mjs` + 1 `.js`) plus 302 PNGs. 58 scripts have zero references anywhere, 7 are referenced only inside utils, and only 4 (the `getClient` variants and `accessories.mjs`) are referenced from outside [V]. Owner decision: the 58 zero-reference scripts are deleted (axis `repo-hygiene`); the other 11 and the PNGs stay untouched.

---

## 2. Gap-scan

| # | Finding | Evidence [V unless marked] | Settled by |
|---|---|---|---|
| G1 | File-level cycle in the shell | `layout/header/NavbarActions.tsx` imports `features/basket/BasketButton`, which imports `NavActionItem` from `NavbarActions` | D-b, A2 |
| G2 | Inverted dependencies | `sanity-cms/lib/account/getUserAddresses.ts` imports `app/checkout/checkout.types.ts`; `WishlistButton` imports a route's server action (`app/(store)/account/wishlist/actions.ts`); 3 homepage `get*.ts` shims re-export types owned by `sanity-cms`; `ProductCard/Grid/Chunk/Detail/Info` import 7 types from `sanity-cms/lib/products/*` | D-e, A3, A7, A8 |
| G3 | Raw Sanity writes outside `sanity-cms/` | `backendClient.patch` inline in 3 account actions + wishlist actions; `lib/checkout/*` (order writes); `lib/wishlist.ts`; `getIemProducts.ts` and `Dacs.tsx` run GROQ inside `app/components` | D-a, D-e |
| G4 | Server Actions have 4 homes | `app/actions/*`, route-local `account/**/actions.ts` ×3, `sanity-cms/lib/products/searchProducts.ts`, plus `app/api/shipping/route.ts` calling an action as a plain function | D-a |
| G5 | Shell composes a Sanity action | `SearchField` passes `searchProductsAutocomplete` into `useSearchController` (injection). Legit and established, so it stays | D-a note |
| G6 | Client component reaches the data layer | `ProductInfo.tsx` (client) imports `urlFor` from `sanity-cms/lib/image`; what `image.ts` imports internally is **[U]** | A7 gate |
| G7 | Test-lane defects | Default vitest globs `**/*.{spec,test}.ts(x)` also match 8 Playwright files that import `@playwright/test`; whether `npm test` is red today is **[U]**. `vitest.integration.config.ts` lists 3 nonexistent globs (`tests/basket/integration`, `tests/checkout/guest-checkout-inventory-reservation/**`). `playwright-ct.config.ts` points at a missing `tests/component`. Redis-era leftovers: `RESERVATION_TTL_SEC`, `tests/config.ts`, `shipping-visual-tracer.test.ts` writes `basketReservation` docs. `tests/AGENTS.md` naming (`.test` unit, `.spec` e2e) contradicts the established colocated `.spec` unit tests. `tsconfig` excludes `tests/` (never type-checked) and includes the nonexistent `components/**` | D-f, A1 |
| G8 | Barrel/RSC hazard check | `store/basketStore.ts` guards `typeof localStorage`, so it is SSR-safe and a client-safe barrel may re-export it | A6 |
| G9 | Public dev/test pages with no production guard | `app/dev`, `app/design-system-test` (own `<html>`, `robots.ts` allows `/`), `(store)/normalization`, `(store)/normalize-accessories-section`. Only `(test)/checkout-seed` is guarded. Sitemap exposure not checked **[U]** | **Deferred completely by the owner**: no action in any axis except keeping their imports compiling |
| G10 | Dead code (unreachable from any route/config/test entry, 15 files) | `app/actions/{test,user}.ts`, `homepage/newest-release/types.ts`, `ui/modal/Modal.tsx`, `lib/address/nominatim-validator.ts`, `lib/dev/{integrity-monitor,logger}.ts`, `lib/sanity/helpers.ts`, `lib/utils/cookies.ts`, `sanity-cms/lib/{api/api,checkoutClient,deleteUtils,orders/index,orders/orderTypes}.ts`, `sanity-cms/schemaTypes/spotlightType.ts`. Orphan routes (no referrer; external callers **[U]**): `api/shipping/route.ts`, `api/shipping/rates/route.ts` (+ `packlink-rates.ts`), `api/address/autocomplete/route.ts` | Appendix A |
| G11 | `sanity-cms/utils` is tooling, not app code | see §1; prune audits: `_project/reports/prune-t2-audit.md` (writes prod Sanity, so UNSURE-HUMAN) | owner decision: delete the 58 zero-reference scripts (`repo-hygiene`); the other 11 stay |
| G12 | Outside code deep-imports a feature | `scripts/catalogue-integrity/{apply,lib}.mjs` import `features/product-filtering/__tests__/proofs/sanityRaw.mjs` (a shared Node helper living in a test folder). The filtering proofs and other scripts read `data/catalogue-index.json` directly (not `data/catalogue.ts`), so the catalogue move does not touch them | A4 note, §7 |
| G13 | In-flight branches touching hot areas | `fix/checkout-order-inventory-integrity` (createOrderFromPaymentIntent, payment page, api/checkout, tests/checkout/integration); `search-ux-visual-refresh` + `no-mistakes/…-v2/-v3` (based on the pre-reorg tree: `app/components/features` ×5, `app/(store)/search`, layout); `no-mistakes/feature/authentication` (sign-in, `lib/auth.ts`, `lib/email.ts`, `.no-mistakes.yaml`); `fix/restore-claude-md-regression` (CLAUDE.md). GitHub PR state **[U]**; local worktree branches (`accessories`, `audio-electronics`, `dep-audit`, …) scope **[U]** | `repo-hygiene` (owner decision: delete them) |
| G14 | Docs point at legacy paths | 11 docs reference `app/components/features/` (`docs/homepage-structure.md` ×4, `docs/design-system.md` ×6, checkout ×4, basket ×3, …) | each axis T4, A11 |
| G15 | Generated / frozen files | `sanity.types.ts`, `schema.json`, `data/catalogue-index.json` (written by `prebuild`): never hand-edited or moved. `app/actions/address/google-address-validator.frozen.ts`: move with `git mv` only, content identical | A3, A4 |
| G16 | Legacy barrel is bypassed | `app/components/features/products/index.ts` exists, yet routes deep-import e.g. `products/ProductGrid` | A7 |
| G17 | Lint sprawl | the same 3 jest paths are repeated in 3 blocks; the two feature names are hard-coded in 2 regexes, so every new feature edits one hot file | D-c, A0 |
| G18 | `lib/auth.ts` imports `lib/checkout/mergeGuestOrders` | infra depends on checkout code; resolved by moving the order writers into the data layer | D-e, A3 |

---

## 3. Decisions

### D-a. Server Actions live in the feature: `features/<name>/actions.ts`
- A third public entry (`@/features/<name>/actions`, `'use server'`, async exports only). The client-safe `index.ts` never re-exports it. The feature's own UI imports `./actions` relatively; outsiders use the entry.
- Actions stay thin: auth guard (`@/lib/auth/dal`), one call into `sanity-cms/lib/**` or `lib/**`, then `revalidate`. No inline GROQ or patches: the raw `backendClient.patch` code moves into `sanity-cms/lib/account/*` mutation modules.
- `actions.ts` is the only file in a feature allowed to import `sanity-cms/lib` (lint override). Every other feature file stays Sanity-free.
- `app/actions/` and route-local `actions.ts` files dissolve as their feature migrates. `searchProducts.ts` (an injected read action) stays as established; no new injected fetchers.
- **Rejected:** (1) keep `app/actions` and let features import it: that is an upward feature→app import and a folder cycle, since actions call feature code. (2) Inject actions through props: `WishlistButton` would need the action threaded page→grid→chunk→card.
- `.no-mistakes.yaml` declared `app/actions` as a product surface. A0 turn 3 replaces it once by the three explicit `features/{checkout,products,account}/actions.ts` paths (no later axis edits product_surface; glob support in the parser is **[U]**, so explicit paths are used).

### D-b. Shared-UI home and shell coupling
- Shared UI stays in `app/components/{ui,layout,analytics}` (Tailwind glob, review gate and CLAUDE.md are wired to it). No new root `components/` (`tsconfig` lists it but the directory does not exist [V]).
- `ui/` = primitives with no domain knowledge, or with ≥2 consuming features. A component with exactly one consuming feature moves into that feature.
- `layout/` = storefront chrome, the composition root. It may import feature entries. **Features never import `app/components/layout`** (lint).
- G1 is broken by extracting `NavActionItem` into `ui/NavActionItem.tsx`.
- `layout/carousel` → `ui/carousel` (used by homepage and catalogue nav). `common/` and `skeletons/` dissolve: `Loader` → basket, skeletons → products (which also removes the skeletons↔products cycle). `app/hooks/`: `useDrawer` → `layout/drawers`, `useSignOut` → `features/auth/ui`.
- Newsletter (one file, sole consumer Footer) moves to `layout/footer/`. It is never a feature.

### D-c. One generalized lint rule
Sketch in Appendix B: one entry regex `^(@/|(\.\.?/)+)features/[^/]+/(?!(server|actions)$).+` (anchored so it cannot match the legacy `app/components/features/<x>/…` imports); one Sanity ban over `features/**`; a `features/*/actions.ts` override; a ban on features importing `app/` other than `components/{ui,features}`; `import/no-cycle` on features and layout. Shared constants are defined once.
The DAG is documentation, not per-feature lint (that would recreate the regex sprawl). `import/no-cycle` catches the real failure mode. `eslint-plugin-import` is registered in the flat config with the TypeScript resolver (`eslint-config-next/dist/index.js`, `alwaysTryTypes`) [V]. `import/no-cycle` is scoped to `features/**` in A0 and extended to `app/components/layout/**` in A11, because the layout cycle (G1) is only fixed by A2.

### D-d. Naming
- Keep `product-filtering` and `product-search` (a rename churns lint, docs, CLAUDE.md and 2 merged PRs for no structural gain). No new `product-*` names.
- New features take the domain noun of their route: `catalogue`, `products`, `basket`, `checkout`, `homepage`, `auth`, `account`.
- `products` means product presentation (card, grid, PDP, wishlist heart). `product-*` means a capability over the catalogue.
- Folders are kebab-case, components PascalCase, modules camelCase.

### D-e. Where `lib/` leftovers go
`lib/` = cross-cutting infra adapters plus tiny generic utils. Anything with a domain owner moves to it. Order writers are Sanity writes, so they go to the data layer.

| Item | Destination |
|---|---|
| `auth.ts`, `auth-client.ts`, `auth/dal.ts`, `auth/providers.ts`, `email.ts`, `stripe.ts`, `dev/event-logger.ts`, `utils/{tailwind,formatting,price,sanityImageLoader}.ts`, `qrcode.d.ts` | **stay** (infra) |
| `session.ts` (CheckoutSession: basket/address/shipping) | `features/checkout/server.ts` (+ type in `domain/`) |
| `shipping/{parcel-calculator,countryDetector}` (client-safe, basket uses them) | `features/checkout/domain/` |
| `shipping/allekurier-rates`, `address/teryt-validator` | `features/checkout/server.ts` |
| `checkout/{createOrderFromPaymentIntent,mergeGuestOrders}` (+spec) | `sanity-cms/lib/orders/` (also fixes G18) |
| `catalogue/{pagination,seo}` (+specs) | `features/catalogue/domain/` |
| `wishlist.ts` (`getWishlistProductIds`) | `sanity-cms/lib/account/` (moved in A7, whose routes import it) |
| `utils/title-optimization.ts` (1 consumer, the PDP) | `features/products/domain/` |
| `sanity-cms/lib/image.ts` (`urlFor`, sole consumer `ProductInfo`) | `lib/utils/` beside `sanityImageLoader.ts`; internals **[U]** |
| dead: `dev/{integrity-monitor,logger}`, `utils/cookies`, `sanity/helpers`, `address/nominatim-validator` | delete |

### D-f. Test policy
1. **Unit and component specs (jsdom, no network):** colocated and flat, `<owner>/__tests__/<subject>.spec.ts(x)` (as both finished features do); default vitest lane. `.spec` is the suffix everywhere. Legacy `unit/` and `integration/` subfolders are flattened when their owner axis moves the specs. `docs/testing/TEST_LOCATION_CONVENTION.md` and `tests/AGENTS.md` are reconciled in A1.
2. **Live-service specs (real Sanity, dev server on :3000, real Stripe):** `tests/live/<owner>/<subject>.spec.ts(x)` (they import `sanity-cms` or need real services, which `features/**` may not do), run only by `vitest.integration.config.ts` through a new `npm run test:live`; the default lane excludes `**/live/**`. The three live specs known today (`getBasketProducts.test.ts`, `shipping-rates.integration.test.ts`, `store/__tests__/integration/searchRobustness.spec.ts`) keep running in the default lane until their owner axis moves them (that move is reviewed in the owner PR).
3. **Browser e2e (Playwright):** `tests/e2e/<journey>/<flow>.spec.ts` (performance specs already live in `tests/e2e/performance/`). A journey spec drives the whole app, so no single feature owns it, and keeping it out of `features/**` keeps Playwright and Sanity imports out of the feature lint and tsc scope (`shipping-visual-tracer.test.ts` imports `sanity-cms/env`). Default vitest excludes `**/e2e/**` (every existing Playwright spec already sits in an `e2e/` directory [V]). Each Playwright config points at its `tests/e2e/<journey>` directory; owner axes move their journey specs there (A3 checkout, A6 basket). Specs for an `app/api/<route>` sit in that route's `__tests__/` (routes are not features).
4. **Live-CMS proofs (Node `.mjs`, human-run):** `features/<f>/__tests__/{proofs,data}/`, as established.
5. **A spec importing ≥2 sibling features:** `tests/integration/`. Only `store/__tests__/integration/componentIntegrations.spec.tsx` qualifies today [V]. Note that `tsconfig` excludes `tests/`, so such specs are not type-checked.
- Config edits happen in A1. **Each owner axis relocates its own specs.**

### D-g. Feature dependency graph (no cycles)
Edges are verified from the import graph (details in §4). Layers:

```
L0  catalogue   product-filtering ✓   checkout   auth (UI only)
L1  basket (→ checkout)        account (→ auth, checkout)
L2  products (→ basket, product-filtering, catalogue)     homepage (→ basket)
L3  product-search ✓ (→ product-filtering, products, catalogue)
top  shell (app/components/layout) and routes: may import any feature entry; nothing imports them
infra lib/*, sanity-cms/lib/*: feature actions.ts/server.ts may import infra;
      sanity-cms/lib may import feature index/server (types, pure builders), never ui or actions
```

### D-h. Smaller calls
- `server.ts` and `config/domain/ui` are created only when non-empty. Of the new features, only `checkout` gets a `server.ts`.
- `auth` is a UI-only feature (the 5 forms, TwoFactorSection, `useSignOut`). Its infra stays in `lib/` (D-e), because `lib/auth*` is imported by routes, actions and api handlers of every feature.
- `wishlist` folds into `products` (the heart button and its actions have no other consumer [V]). A standalone wishlist feature would exist only to avoid a products↔account cycle, and putting `WishlistButton` in `products` and the wishlist *page* in the route avoids that cycle at zero cost.
- Client-only zustand store lives in `features/basket/ui/` (`domain/` stays pure).
- RSC-heavy feature (homepage): `index.ts` exports server components; "client-safe" means importable from the client graph, never `server-only`. Sections live in `ui/<section>/` with their PNG/JSON assets.

---

## 4. Dependency graph, evidence

| Edge | Evidence [V] |
|---|---|
| basket → checkout | `BasketSummary → CheckoutButton`; `BasketManager → lib/shipping/{countryDetector,parcel-calculator}` |
| products → basket | `ProductCard`, `ProductInfo` → `BasketControls` |
| products → product-filtering | `EmptyResults` → filtering index |
| products → catalogue | `Pagination` → `lib/catalogue/pagination` |
| homepage → basket | 4 cards → `BasketControls` |
| product-search → product-filtering | 4 imports (done, via entry) |
| product-search → products | `AutocompletePanel` → `ProductImage` (legacy deep import today) |
| product-search → catalogue | `SearchPagination` → `pagination.ts`; `searchScoring` → `data/catalogue-index.json` |
| account → auth | `AccountActions.client` → `TwoFactorSection`, `useSignOut` |
| account → checkout | `Address` type (`AddressesClient`, `actions`, `getUserAddresses`) |
| shell → catalogue, basket, auth, product-search | `DrawersManager`, `NavbarActions`, `ActionBar`, `SearchField` |

Cycles today: only G1 (file-level). Folder-level: skeletons↔products, `sanity-cms/lib/account` → `app/checkout`.

---

## 5. Rubric and scorecard

Six criteria, each 0–10. Area score = mean, rounded to 0.5. **9+ requires every criterion ≥ 8.**

- **C1 Cohesion:** one folder owns the concept (10 = UI+domain+actions+tests together; 5 = ≥2 stranded satellites; ≤3 = spread over ≥4 top-level dirs).
- **C2 Boundaries:** layers respected, no cycles, no inverted dependencies, features import features via entries.
- **C3 Server/client:** explicit entries; `'use client'`, `'use server'` and `server-only` used deliberately; no Sanity in the client graph except injected actions; RSC-safe barrels.
- **C4 Discoverability:** CLAUDE.md plus the folder name says where code lives; no misleading names (e.g. `get*.ts` type shims); no dev or dead files mixed into public route groups.
- **C5 Test placement:** existing tests sit where D-f says and run in the right lane; none dead. An area with no tests is not penalised (this roadmap creates none), baseline 8.
- **C6 Docs:** CLAUDE.md paragraph and docs pointers are accurate; no stale paths.

| Area | C1 | C2 | C3 | C4 | C5 | C6 | **Now** | Target | Key evidence |
|---|---|---|---|---|---|---|---|---|---|
| product-filtering ✓ | 9 | 8 | 9 | 9 | 9 | 9 | **9.0** | 9.0 | 2 scripts deep-import `proofs/sanityRaw.mjs` (G12); per-feature lint regex |
| product-search ✓ | 9 | 7 | 9 | 9 | 8 | 9 | **8.5** | 9.0 | imports legacy `ProductImage`; reads `catalogue-index.json` directly |
| Conventions / lint / CLAUDE.md | 6 | 5 | – | 6 | – | 6 | **6.0** | 9.0 | G17; legacy default sentence contradicts this roadmap |
| Tests and configs | 3 | 5 | 5 | 3 | 3 | 5 | **4.0** | 9.0 | G7; specs in 6 places |
| Checkout | 3 | 3 | 4 | 3 | 4 | 6 | **4.0** | 9.0 | 9 dirs; `checkout.types` imported by 5 outsiders; actions in `app/actions`; dead-path tests |
| Catalogue (VFS) | 3 | 5 | 7 | 3 | 6 | 6 | **5.0** | 9.0 | `data/catalogue.ts`, `lib/catalogue`, `layout/catalogue`, breadcrumbs in 4 places; JSON read directly by 2 consumers |
| Products | 6 | 4 | 5 | 5 | 5 | 5 | **5.0** | 9.0 | 7 types from `sanity-cms`; deep imports past the barrel; skeletons/heart/`QuantitySelector` stranded |
| Basket (UI + store) | 6 | 4 | 7 | 5 | 4 | 7 | **5.5** | 9.0 | G1; state in root `store/`; tests split over `__tests__` and `store/__tests__`; dead integration globs |
| Shell (layout/ui/common/skeletons/hooks) | 4 | 4 | 6 | 5 | 8 | 5 | **5.5** | 9.0 | G1; three concerns in `layout`; single-consumer `ui` files |
| Account | 5 | 4 | 5 | 5 | 8 | 5 | **5.5** | 9.0 | raw `backendClient.patch` in route actions; imports `app/checkout` types |
| Homepage | 7 | 4 | 6 | 5 | 7 | 7 | **6.0** | 9.0 | GROQ in components; type shims; 28 imports of `layout/carousel` |
| Auth | 5 | 6 | 8 | 4 | 7 | 8 | **6.5** | 9.0 | forms in routes, `TwoFactorSection` in legacy, `useSignOut` in `app/hooks` |
| Data layer (`sanity-cms/lib`, schemaTypes, `app/api`) | 7 | 6 | 8 | 7 | 6 | 5 | **6.5** | 9.0 | 5 dead files + dead schema; stale "basket reservation" comments; 3 orphan routes |
| `lib/` leftovers | 4 | 5 | 6 | 4 | 5 | 3 | **4.5** | 9.0 | domain code (`checkout`, `shipping`, `address`, `catalogue`, `wishlist`) next to infra |
| Dev / admin surfaces | 3 | 6 | 5 | 3 | 8 | 3 | **4.5** | human verdict | G9; not a migration target |
| `sanity-cms/utils` + `scripts` | – | – | – | – | – | – | not scored | never migrated | §7 |

Re-scoring protocol: after each axis merges, the architect updates its row and the "Now" column here.

---

## 6. Roadmap

### 6.1 Axis index

| ID | Slug | Turns | Score now → target | Prereqs (merged first) | Lane |
|---|---|---|---|---|---|
| H | `repo-hygiene` | 1 | branch and script clutter removed | none | Wave −1 |
| A0 | `boundary-conventions` | 3 | 6.0 → 9.0 | H | Foundation |
| A1 | `test-lanes` | 2 | 4.0 → 8.5 (9.0 after owner axes move specs) | A0 | T |
| A2 | `shell-carve-out` | 3 | 5.5 → 8.5 (9.0 at A11) | H | B |
| A3 | `checkout` | 4 | 4.0 → 9.0 | A0, H | A |
| A4 | `catalogue` | 3 | 5.0 → 9.0 | A0, A2 | B |
| A5 | `auth` | 2 | 6.5 → 9.0 | A0, A2, H | C |
| A6 | `basket` | 4 | 5.5 → 9.0 | A0, A2, A3, A1 | A |
| A7 | `products` | 4 | 5.0 → 9.0 | A0, A4, A6 | A |
| A8 | `homepage` | 4 | 6.0 → 9.0 | A0, A2, A4, A6 | A′ |
| A9 | `account` | 2 | 5.5 → 9.0 | A0, A3, A5 | C |
| A10 | `infra-closeout` | 1 | data 6.5 → 9.0, lib 4.5 → 9.0 | A3, A4, A5, A6, A7, A8, A9 (code turns) | Closeout |
| A11 | `legacy-retirement` | 3 | docs and conventions → 9.0 (closing facts feed the re-score) | everything | Closeout |

36 turns in total (83 phases). Critical path in phase units (38): H → A0.T1 → A3.T1–T2 → A6.T1–T2 → A7.T1–T2 → A8.T2–T3 → A10 → A11. With 3 terminals the whole plan finishes in the critical-path time; more than 4 terminals gives no further speed-up.

### 6.2 Parallel execution

Single source of truth: `_project/macro-refactor/parallel-plan.md` (prerequisite graph of all 36 turns, the certified rule for what may run at the same time, suggested terminal assignments, and the list of ordering constraints and why they exist). Phases inside a turn and turns inside an axis are strictly sequential (one branch, one PR per turn).

### 6.3 Shared hot files (resolved conflict map)

| File | Written by | Resolution |
|---|---|---|
| `eslint.config.mjs` | A0.T1, A11.T1 | sequential |
| `CLAUDE.md` | A0.T2 (conventions), A11.T2 (final feature map, adapters sentence, catalogue paragraph, data-layer bullet, architecture text) | no other turn edits it |
| `.no-mistakes.yaml` | A0.T3 (test instructions + the three actions surfaces), A6.T3 (one test-instructions sentence) | A6.T3 gates on A0.T3 |
| `tsconfig.json` | A0.T3, A6.T3 | A6.T3 gates on A0.T3 |
| `package.json`, `vitest.config.mts` | A1.T1 only | – |
| `vitest.integration.config.ts` | A1.T1, A6.T3 | A6 gates on A1.T1 |
| `playwright.checkout.config.ts` | A3.T3 only | – |
| `docs/homepage-structure.md` | A8.T4 only (carries the carousel, basket and products path updates too) | – |
| `layout/header/NavbarActions.tsx` | A2.T2, A5.T2, A6.T2 | A2.T2 → A5.T2 → A6.T2 (gates) |
| `layout/navigation/ActionBar.tsx` | A2.T2, A6.T1 | A6.T1 gates on A2.T2 |
| `layout/drawers/DrawersManager.tsx` | A2.T2, A4.T2 | A4.T2 gates on A2.T2 |
| `tests/integration/componentIntegrations.spec.tsx` | A6.T2 (creates), A7.T1, A7.T2, A8.T2, A8.T3 | A8.T2 gates on A7.T2 |
| `account/addresses/*`, `AccountActions.client.tsx` | A3.T1 / A5.T1–T2, then A9 | A9.T1 gates on A3.T1 and A5.T2 |
| `docs/post-homepage-product-discovery/catalogue-architecture.md` | A4.T3, A7.T4 | A7.T4 gates on A4.T3 |
| progress log | each axis writes its own `_project/macro-refactor/logs/<slug>.log` | no shared file |

### 6.4 Generic gates carried by every axis

- **G-move:** `git diff -M --stat` shows moves with high similarity, and pure-move turns edit no logic.
- **G-old:** `git grep` for every old import path returns 0, excluding `docs/` and `_project/`.
- **G-entries:** no bare `export *` in any `index.ts`, `server.ts` or `actions.ts`; `server.ts` starts with `import 'server-only'`; `actions.ts` starts with `'use server'`.
- **G-sanity:** `git grep -n "sanity-cms" features/<name>` is empty except `actions.ts`.
- **G-height** (CLAUDE.md review gate, mandatory for A7, A8 and any turn touching `features/**/ui/**` or `app/components/**`): the diff has no added or removed lines matching `h-full|min-h-|max-h-|aspect-` other than import lines.
- **G-live:** each card lists the one human live check on `localhost:3000`.

### 6.5 Axis cards

#### A0 · `boundary-conventions` · 3 turns
- **Scope:** `eslint.config.mjs`; `CLAUDE.md` (features paragraph rewritten to D-a..D-h, plus a "Feature map" table and the DAG; the legacy sentence becomes "legacy areas migrate per `_project/macro-refactor/roadmap.md`; new code never lands in `app/components/features/`"); `.no-mistakes.yaml` (keep `app/actions`, add `test.instructions` for `features/**`); `tsconfig.json` (drop the nonexistent `components/**`).
- **Why first:** without it, each of the 8 feature axes appends its name to two regexes in one file, and CLAUDE.md contradicts this roadmap.
- **Prereqs:** H (deletes `fix/restore-claude-md-regression`). **Conflicts:** none in code.
- **Turns:** T1 lint constants, generalized entry rule, Sanity ban over `features/**`, `actions.ts` override, `import/no-cycle` block. T2 CLAUDE.md rewrite (the only CLAUDE.md edit before A11). T3 `.no-mistakes.yaml` (test instructions and the three `features/*/actions.ts` surfaces, declared once) + tsconfig.
- **First-turn gates:** (1) Dry-run the new entry regex with `git grep -nP` (PCRE, needed for the lookahead) over `*.ts` and `*.tsx`: it must list only known offenders (expected 0). (2) Confirm `import` is in the `plugins` of `node_modules/eslint-config-next/dist/index.js` [V at planning]. (3) After T1, `git grep -n "product-filtering|product-search" eslint.config.mjs` is empty.
- **Deviations:** the DAG is not linted per feature. **Non-goals:** no code moves, no plugin installs, no new per-feature rules.
- **Live check:** none. The human may run `npm run lint` once on the PR to compare against the current baseline **[U]**.

#### A1 · `test-lanes` · 2 turns
- **Scope:** `vitest.config.mts` (exclude `**/e2e/**`, `**/live/**`); `vitest.integration.config.ts` (include `tests/live/**`, drop the 3 dead globs and `RESERVATION_TTL_SEC`); `playwright-ct.config.ts` (delete); `playwright.checkout.config.ts` (stale Redis comment); `package.json` scripts only (adds `test:live`); `tests/AGENTS.md` and `docs/testing/TEST_LOCATION_CONVENTION.md` (lane and location rows); `tests/config.ts` (deleted: zero importers [V]). `playwright.config.ts` is not touched (its `testDir` moves with the basket specs in A6).
- **Why:** these defects are independent of migration, and `npm test` is the one sanctioned runtime gate (`.no-mistakes.yaml commands.test`).
- **Prereqs:** A0. Human pastes the current `npm test` result before T1 (agents never run it) **[U]**. **Conflicts:** `package.json` and `dep-audit`; the basket include line is edited later by A6.
- **Turns:** T1 default and integration lanes + `npm run test:live`. T2 dead `playwright-ct.config.ts` and `tests/config.ts` removed, stale comment fixed, `tests/AGENTS.md` and `docs/testing/TEST_LOCATION_CONVENTION.md` reconciled.
- **Gates:** `ls` proves each remaining glob directory exists; every `@playwright/test` importer sits under an excluded dir; `git grep -n "guest-checkout-inventory-reservation|tests/basket/integration"` is empty.
- **Deviations:** introduces `tests/live/<owner>/` and `npm run test:live` (D-f). **Non-goals:** no test rewrites, no spec moves (owner axes), no coverage config, no `tsc` change for `tests/`.
- **Live check:** the human runs `npm test` after T1 and compares with the baseline.

#### A2 · `shell-carve-out` · 3 turns
- **Scope:** `layout/carousel/**` (7) → `ui/carousel/` (~8 homepage files + `CatalogueCarousel` import it); `NavActionItem` out of `NavbarActions.tsx` → `ui/NavActionItem.tsx` (one import line in legacy `basket/BasketButton.tsx`); `app/hooks/nuqs/useDrawer.ts` → `layout/drawers/useDrawer.ts`; `features/newsletter/NewsletterSignup.client.tsx` → `layout/footer/`; delete dead `ui/modal/Modal.tsx`. Not moved here: `useSignOut` (A5), `Loader` (A6), skeletons (A7), `Checkbox` (only when touched).
- **Why now:** kills the only file-level cycle (G1); unblocks A4, A5, A6, A8; no prerequisite.
- **Prereqs:** H (deletes `search-ux-visual-refresh*` [V: touches layout]). **Conflicts:** see §6.3 (homepage carousel importers are A8's later diff).
- **Turns:** T1 carousel. T2 cycle break + `useDrawer` + dead `Modal`. T3 newsletter + docs pointers + gates.
- **Gates:** `git grep -n "layout/carousel|hooks/nuqs"` empty; `BasketButton` no longer imports `NavbarActions`; G-height.
- **Deviations:** none. **Non-goals:** no className or CSS change, no header redesign, no carousel API change.
- **Live check:** home carousels (arrows, swipe), header cart badge, footer newsletter box, mobile drawer via `?drawer=`.

#### A3 · `checkout` · 4 turns
- **Scope (exact):** `app/checkout/**` client components (AddressForm+test, CheckoutStepper, PaymentForm.client, CheckoutSummary, ShippingPageClient, OrderDetails, RefreshButton, SuccessAnalytics.client) and `checkout.types.ts`; `app/actions/{checkout,address}/**`; `features/checkout/reservation/CheckoutButton.tsx`; `lib/{shipping,address,session,checkout}` per D-e; `tests/checkout/**` (7); api handlers `checkout/*`, `shipping/*`, `address/*`, `basket/shipping-rates`, `webhooks/stripe` (import edits only); `(test)/checkout-seed` and `app/dev/design-system/page.tsx` (import edits); `docs/checkout/**`. Pages, layout, loading and error files stay in `app/checkout/`.
- **Why priority:** lowest score, head of the longest chain (A3 → A6 → A7), most scattered area, and the source of the G2/G18 inversions.
- **Prereqs:** A0 (T1 may start once A0 T1 lands); H (deletes `fix/checkout-order-inventory-integrity` [V: same files]; its 2 unmerged commits are recorded by SHA in the H PR body).
- **Conflicts:** `lib/auth.ts` (1 line), account addresses (3 files; A9 gates on A3.T1), `BasketSummary`/`BasketManager` import lines (A6 gates on A3.T2).
- **Turns:** T1 domain: types, `parcel-calculator`, `countryDetector`, session type/getter, validators (frozen file via `git mv`, byte-identical), specs; delete dead `app/actions/{test,user}.ts` and `nominatim-validator`; fix `Address` importers. T2 UI move + `index.ts`. T3 `actions.ts` (thin), `server.ts` (courier rates, session, validators), order writers → `sanity-cms/lib/orders/`, api import edits, surface entry in `.no-mistakes.yaml`. T4 docs pointers (CHECKOUT-SYNOPSIS, courier criteria doc) and the final audit; CLAUDE.md is left to A11.
- **Gates:** old paths (`app/checkout/checkout.types`, `lib/shipping`, `lib/checkout`, `lib/address`, `lib/session`, `app/actions`) return 0 after T3; the frozen file shows a 100% rename; `git grep -l "use server" features/checkout` is `actions.ts` only; G-sanity holds (checkout needs no exception).
- **Deviations:** `actions.ts`, `server.ts`, client-safe `domain/` consumed by basket. **Non-goals:** no Stripe or courier logic edits, no edits inside the frozen validator, no route or URL renames, no reservation revival, no `stripe.ts`/`email.ts` moves.
- **Live check (mandatory):** full guest checkout on dev after T2, T3 and T4: basket → address validation → shipping rates → payment (Stripe test card) → success.
- **Orphans (no verdict yet, left untouched):** `api/shipping/route.ts`, `api/shipping/rates/route.ts` (+ `lib/shipping/packlink-rates.ts`, which stays where it is), `api/address/autocomplete/route.ts`. Only the import paths of modules that move are edited, so they keep compiling.

#### A4 · `catalogue` · 3 turns
- **Scope:** `data/catalogue.ts` → `features/catalogue/domain/catalogue.ts`; `lib/catalogue/{pagination,seo}.ts` (+3 specs); `layout/catalogue/**` (12 files) → `ui/`; `ui/breadcrumbs/CategoryBreadcrumbs.tsx`. Consumers re-pointed: `(store)/layout.tsx`, `products/page.tsx`, `products/[...slug]/page.tsx`, `search/page.tsx`, `DrawersManager`, `sanity-cms/lib/homepage/getHomepageData.ts`, `features/products/Pagination.tsx`, `features/product-search/ui/SearchPagination.tsx`. **Not moved or edited:** `data/catalogue-index.json` and the prebuild script (generated artifact); every `.mjs` proof or script (they read the JSON directly); `getCategoryMetadata.ts` and `searchScoring.ts` keep importing the JSON by alias.
- **Why:** leaf of the DAG, consumed by 3 features and the shell; a prerequisite for A7.
- **Prereqs:** A0, A2. **Conflicts:** `DrawersManager` (A2 first), the `products` pages (import lines; A7 rebases).
- **Turns:** T1 domain: tree accessors (server entry), pagination, seo, 3 specs. T2 navigation UI (12 files) + breadcrumbs, importers (gate: shell-carve-out T2 merged). T3 `catalogue-architecture.md` pointer and the final audit; CLAUDE.md is left to A11.
- **Gates:** `git grep -nE "@/data/catalogue'|lib/catalogue/|layout/catalogue|ui/breadcrumbs"` empty (excluding docs and `_project`); the tree accessors and `Breadcrumbs` are exported only from `server.ts` (keeps the JSON out of client bundles).
- **Deviations:** `server.ts` exposes a component (`Breadcrumbs`). **Non-goals:** no VFS logic change, no JSON or prebuild change, no nav UX change.
- **Live check:** nav drawer (desktop and phone width), `/products/<category>/…`, breadcrumbs, pagination, search pagination, home page.

#### A5 · `auth` · 2 turns
- **Scope:** `features/auth/TwoFactorSection.tsx`; the 5 route forms (`sign-in`, `sign-up`, `verify-email`, `forgot-password`, `reset-password`); `app/hooks/useSignOut.ts` → `features/auth/ui/`; pages stay thin. `lib/auth*` stays (D-e). The docs mentioning these paths (`docs/auth/**`, `docs/user-account/**`) are all dated audits or task briefs, so none is rewritten.
- **Why:** finishes the account-side leaf and frees A9.
- **Prereqs:** A0, A2, H (deletes `no-mistakes/feature/authentication` [V: sign-in, `lib/auth.ts`, `lib/email.ts`]). **Conflicts:** `NavbarActions` (merge after A6), `AccountActions.client` (A9 later).
- **Turns:** T1 six client components + `index.ts` + page and account imports. T2 `useSignOut` + its two importers and the final audit; CLAUDE.md is left to A11.
- **Gates:** old paths empty; `features/auth` has no `server.ts`, `actions.ts` or `sanity-cms` import.
- **Deviations:** UI-only feature. **Non-goals:** no better-auth config change, no `lib/auth*` moves, no email changes.
- **Live check:** sign-up → verify → sign-in → forgot/reset → account 2FA → sign-out.

#### A6 · `basket` · 4 turns
- **Scope:** `features/basket/**` (11), `store/**` (10), `common/Loader.tsx`, `(store)/basket/page.tsx`; import edits in homepage cards ×4, products ×2, `ActionBar`, `NavbarActions`; `vitest.integration.config.ts` include line, `playwright.config.ts` `testDir`, `tsconfig.json` (`store/**`), the store-tests sentence in `.no-mistakes.yaml`; live docs pointers (the three basket READMEs, search-ux, vertical-space-lg-touch).
- **Why:** hub of the commerce chain; homepage and products both depend on it.
- **Prereqs:** A0, A1, A2, A3. **Conflicts:** homepage/products import lines (done here, so A7/A8 rebase); `docs/basket`.
- **Turns:** T1 store → `features/basket/ui/basketStore.ts` + unit specs + `index.ts` (SSR-safe [V]). T2 UI move (8 files incl. `Loader`) + importers + all jsdom specs (basket specs → `features/basket/__tests__/`, cross-feature specs → `tests/integration/`). T3 live specs → `tests/live/`, Playwright specs → `tests/e2e/basket/`, config cleanup, `store/` removed. T4 docs pointers and the final audit; CLAUDE.md and docs/homepage-structure.md are left to A11 and A8.
- **Gates:** `git grep -n "store/basketStore|features/basket"` outside `features/basket` empty; G-height; G-sanity.
- **Deviations:** the zustand store lives in `ui/`. **Non-goals:** no persistence or store-API change, no shipping logic change.
- **Live check:** add to basket from card, PDP and homepage; basket page quantities and shipping estimate; reload keeps state; mobile action-bar count.

#### A7 · `products` · 4 turns
- **Scope:** `features/products/**` (19 incl. 2 specs and the old barrel, which is deleted), `features/wishlist/WishlistButton.tsx` + `account/wishlist/actions.ts` → `features/products/{ui,actions.ts}`; `skeletons/*` (2), `ui/QuantitySelector.tsx`, `gridLayout.ts` → `ui/`, `config/`; `lib/wishlist.ts` → `sanity-cms/lib/account/getWishlistProductIds.ts`; `lib/utils/title-optimization.ts` → `domain/titleOptimization.ts`; `sanity-cms/lib/image.ts` → `lib/utils/sanityImageUrl.ts`; product types inverted (`Product`, `ProductDetailData`, `RelatedProduct` now live in the feature, fetchers import them). Routes: `product/[slug]/*`, `products/**`, `search/SearchResults.tsx`, `account/wishlist/page.tsx`; `product-search/ui/AutocompletePanel.tsx` (`ProductImage` via entry); `tests/integration/*` import lines; two wishlist patch chains extracted to `sanity-cms/lib/account/{add,remove}WishlistItem.ts`.
- **Why:** completes the product-discovery cluster and removes the last product-search → legacy edge.
- **Prereqs:** A0, A4 (T2), A6 (T2). **Conflicts:** `products` route import lines (A4 rebased in), `tests/integration/componentIntegrations.spec.tsx` (A8.T2 gates on A7.T2).
- **Turns:** T1 type inversion + relocate wishlist read, title helpers, image helper. T2 UI + skeletons + layout config move, entry, importers, specs. T3 wishlist patches extracted, actions.ts + WishlistButton move, T4 docs (design-system, catalogue-architecture) and the final audit.
- **Gates:** G-height (mandatory); `git grep -n "sanity-cms" features/products` lists only `actions.ts`; `git grep -nE "components/features/products|components/skeletons|components/features/wishlist"` empty outside dated docs.
- **Deviations:** wishlist folded in (D-h); `ProductDetailData` alias imports in two fetchers keep their bodies unchanged. **Non-goals:** no card, grid, PDP or skeleton visual change; no filter or search change; no wishlist behaviour change (the validation guard stays in the action).
- **Live check:** `/products`, a category, PDP (gallery, related), `/search` grid, heart toggle, pagination, skeletons on slow navigation; account wishlist page.

#### A8 · `homepage` · 4 turns
- **Scope:** `features/homepage/**` (32 source files) → `features/homepage/{ui/<section>,config,domain}`; `sanity-cms/lib/homepage/getHomepageData.ts` (11 types move into the feature, the fetcher imports them); `iems-gallery/getIemProducts.ts` → GROQ to `sanity-cms/lib/homepage/getIemProductsBySlugs.ts`, `HOME_12` to `config/homeIems.ts`; `ui/ProductBadge.tsx` (two homepage consumers) → `ui/shared/`; `app/(store)/page.tsx`; `docs/homepage-structure.md`. Deleted as dead (each with a zero-reference proof): 3 type shims, `newest-release/types.ts`, local barrels, `spotlightTypes.ts`, `featured/types.ts`, the unused Sanity import in `Dacs.tsx`, and the 4 unreferenced asset files (2 `copy.json`, 2 `*_transparent.png`).
- **Prereqs:** A0, A2, A4, A6. **Conflicts:** `(store)/page.tsx` only; the dev pages `normalization` / `normalize-accessories-section` import homepage, so only their import paths are edited (the pages are otherwise deferred).
- **Turns:** T1 types inversion + IEM fetch to the data layer + shims/dead files removed. T2 UI half 1 (hero, trust bar, shared header, featured, 3 spotlights; gate: products-reorg turn 2 merged). T3 UI half 2 (IEM gallery, newest release, DACs, accessories, ProductBadge, badge helper). T4 `docs/homepage-structure.md` (the only edit of that file, incl. carousel/basket/products paths) and the final audit.
- **Gates:** G-height (mandatory; CLAUDE.md records a past sizing regression here); `git grep -n "sanity-cms" features/homepage` empty.
- **Deviations:** `index.ts` exports server components (async sections); sections in `ui/<section>/`. **Non-goals:** no copy, layout, spacing or query change; no section reordering.
- **Live check:** home page, every section, desktop and phone width.

#### A9 · `account` · 2 turns
- **Scope:** `app/(store)/account/**` except `wishlist/` (`AccountActions.client`, `AddressesClient`, the two action files) → `features/account/{ui,actions.ts}`; the five inline Sanity patch chains → `sanity-cms/lib/account/{setProfileName,setMarketingOptIn,addProfileAddress,replaceProfileAddress,removeProfileAddress}.ts`; the `Address` type already comes from `@/features/checkout`; pages stay thin. The input guards (UUID address key, non-empty checks, `requireSession`) stay in the action.
- **Prereqs:** A0, A3, A5. **Conflicts:** none once A7 owns `account/wishlist/`.
- **Turns:** T1 five data functions and merged `actions.ts`. T2 UI move, pages re-pointed, final audit; CLAUDE.md is left to A11.
- **Gates:** `git grep -n "backendClient" features/account` empty; the only `sanity-cms` imports in the feature are in `actions.ts`.
- **Deviations:** `actions.ts` sanity exception (first use with writes). **Non-goals:** no profile or address behaviour change; `api/account/export` stays a route.
- **Live check:** update name and preferences, address CRUD, orders list and detail, data export.

#### A10 · `infra-closeout` · 1 turn
- **Scope:** delete proven-dead `sanity-cms/lib/{api/api,checkoutClient,deleteUtils,orders/index,orders/orderTypes}.ts` and `lib/{dev/integrity-monitor,dev/logger,utils/cookies,sanity/helpers}.ts` (each re-proved by a repo-wide grep at execution time); fix the two stale "basket reservations" comments; add the Data layer bullet to CLAUDE.md. **Excluded (no owner verdict yet):** `schemaTypes/spotlightType.ts`, the three orphan API routes, `lib/shipping/packlink-rates.ts`, `sanity-cms/utils`, `scripts/`.
- **Prereqs:** A3, A7, A8, A9 (fetchers are stable). **Conflicts:** none.
- **Turns:** T1 dead-file prune (data layer, then lib), the two comment fixes, and the data-layer audit. The Data layer convention bullet is written by A11.
- **Gates:** each deleted file has a recorded zero-importer proof; nothing under `sanity-cms/schemaTypes` changes.
- **Non-goals:** no `schemaTypes` restructure, no `lib/auth*` move.
- **Live check:** home, `/products`, `/account`, `/checkout`, Studio loads.

#### A11 · `legacy-retirement` · 3 turns
- **Scope:** lint tightened (`NO_APP` loses the legacy allowance; `import/no-cycle` extended to `app/components/layout/**`; `sanity-cms/lib` barred from importing `features/*/actions`; severity flipped to error only when the owner confirms "LINT BASELINE CLEAN"); dead tailwind content globs (`pages`, `components`, `src`) removed; CLAUDE.md architecture text refreshed; living docs swept; measured closing facts appended to this file as section 10 (the architect re-scores from them).
- **Prereqs:** all code turns and all docs turns. **Turns:** T1 lint + tailwind. T2 CLAUDE.md (the only edit after A0: architecture text, adapters sentence, catalogue paragraph, final feature map, data-layer bullet) + living-docs sweep. T3 closing facts.
- **Non-goals:** no new features, no rename of existing ones.

---

## 7. Not doing / only when touched

| Item | Verdict | Reason |
|---|---|---|
| `sanity-cms/utils/**` (69 scripts, 302 PNGs) | **Never migrate.** The 58 zero-reference scripts are deleted by `repo-hygiene` (owner decision); the other 11 scripts and all PNGs stay | prune audit: `prune-t2-audit.md` |
| `scripts/**` | Never migrate | `build-catalogue-index.mjs` is the live prebuild; `catalogue-integrity` is an active campaign; `agent-ops` is referenced by AGENTS.md |
| `data/**` (sourcing `.md`, JSON reports) | Not code | only `catalogue.ts` moves (A4); `catalogue-index.json` stays |
| `sanity-cms/schemaTypes`, `env.ts`, `structure.ts`, `sanity.config.ts`, `(studio)` | Untouched | Studio depends on them; `sanity.types.ts` and `schema.json` are generated |
| `app/dev`, `app/design-system-test`, `(store)/normalization`, `(store)/normalize-accessories-section` | **Deferred completely** (owner, 2026-09-30) | no prune, no gate, no decision; only import-path edits when a moved module breaks them |
| `app/(admin)` (4 files, one is a 3-line stub) | Only when admin gets real code | too small to shape |
| `app/components/analytics` (2 files), static `(store)` pages, `ContentLayout` | Stay | already thin and correct |
| `middleware.ts`, sentry, instrumentation | Untouched | roots, no domain code |
| `lib/auth*`, `email.ts`, `stripe.ts`, `dev/event-logger.ts`, `utils/{tailwind,formatting,price,sanityImageLoader}` | Stay (infra) | D-e |
| `ui/Checkbox`, `ui/ProductBadge` (single-consumer) | Only when their consumer's axis touches them | no standalone value |
| `product-filtering` / `product-search` | Only the edges listed (A4, A7) | reference features; never renamed (D-d) |
| `docs/**`, `_project/**` prose; 3 finished `docs/devin-*-tasks.md` | Pointer edits only; deleting the 3 briefs is a human call | `stale-docs-audit.md` |
| `package.json` dependencies, `public/**` | Out of scope | `dep-audit` branch owns deps |

---

## 8. Start first

0. **H `repo-hygiene`** (1 turn, deletions only): removes the conflicting branches and dead scripts before anything else runs.
1. **A0 `boundary-conventions`.** Unblocks every feature axis and removes the eslint/CLAUDE.md hot files.
2. **A2 `shell-carve-out`.** Parallel to A0, no prerequisite, kills the only cycle and unblocks A4, A5, A6, A8.
3. **A3 `checkout`.** Start as soon as A0 T1 lands: lowest score and head of the critical path. Payments are the riskiest area, so T1 is pure moves and the human runs the full guest-checkout live check after each of T2, T3 and T4.

A1 `test-lanes` can run beside A3 as soon as A0 merges.

---

## 9. Human prerequisites and open items

| Item | Needed before |
|---|---|
| Paste the current `npm test` result | A1 T1 |
| Verdicts on the orphan routes (`api/shipping*`, `api/address/autocomplete`, `packlink-rates.ts`) and `spotlightType.ts`. No answer yet: every phase leaves them untouched | A10 |

Branch deletions and the dev pages are no longer human prerequisites: the first is executed by H, the second is deferred.

**Unverified [U]:**
- GitHub PR state and whether `origin/main` is ahead (the ref is local, not fetched).
- Whether `npm test` is red today (G7).
- `product_surface` glob support.
- `sanity-cms/lib/image.ts` internals.
- External callers of `api/address/autocomplete` and `api/shipping*`.
- Sitemap exposure of the dev pages.
- Whether `tsc` accepts the `tests/` re-inclusion (out of scope here).

---

## Appendix A · Dead code → owning axis (prune before moving)

| File(s) | Axis |
|---|---|
| `app/actions/{test,user}.ts`, `lib/address/nominatim-validator.ts` | A3 |
| `ui/modal/Modal.tsx` | A2 |
| `homepage/newest-release/types.ts` | A8 |
| `sanity-cms/lib/{api/api,checkoutClient,deleteUtils,orders/index,orders/orderTypes}.ts`, `schemaTypes/spotlightType.ts` (human), `lib/dev/{integrity-monitor,logger}.ts`, `lib/utils/cookies.ts`, `lib/sanity/helpers.ts` | A10 |
| Orphan routes `api/shipping/route.ts`, `api/shipping/rates/route.ts` (+ `lib/shipping/packlink-rates.ts`), `api/address/autocomplete/route.ts` | A3 verdict, A10 delete |

## Appendix B · Lint sketch (A0 T1; illustrative, verify with grep before landing)

```js
// defined once at the top of eslint.config.mjs
const JEST_PATHS = [ /* the existing three jest paths */ ];
const ENTRY_ONLY = {
  // anchored: matches "@/features/x/y" and "../features/x/y", never "@/app/components/features/x/y" (legacy)
  regex: "^(@/|(\\.\\.?/)+)features/[^/]+/(?!(server|actions)$).+",
  message: "Import from @/features/<feature>, /server or /actions. Deep imports are not allowed.",
};
const NO_SANITY = { regex: "(^|/)sanity-cms/", message: "Only features/<f>/actions.ts may import sanity-cms." };
const NO_APP = {
  regex: "(^|/)app/(?!components/(ui|features)/)",   // A11 drops the features/ allowance when the legacy folder is gone
  message: "Features never import routes, actions, hooks or the shell.",
};
// blocks (later blocks replace no-restricted-imports for matching files, so each repeats JEST_PATHS):
//  1. files **/*.{ts,tsx}                : patterns [ENTRY_ONLY]
//  2. files features/**/*.{ts,tsx}       : patterns [ENTRY_ONLY, NO_SANITY, NO_APP]
//  3. files features/*/actions.ts        : patterns [ENTRY_ONLY, NO_APP]        (override)
//  4. files features/**                  : 'import/no-cycle': ['warn', { maxDepth: 6 }]    (A11 adds app/components/layout/** and flips to error once the owner confirms a clean baseline)
```
