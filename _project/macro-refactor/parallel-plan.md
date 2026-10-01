# Parallel execution plan (turn level)

Status: v1 · 2026-10-01 · generated from the phase specs after the plan was made parallel-safe. Companion of `roadmap.md`.

## 0. First moves

1. Terminal 1: `repo-hygiene` T1 (4 phases), alone. Its phases 1.1 and 1.2 delete the stale branches; phases 1.3 and 1.4 only touch `sanity-cms/utils`, so `shell-carve-out` T1 may already start in a second terminal once phase 1.2 has run (its gate only checks that the branches are gone).
2. After `repo-hygiene` is merged: `boundary-conventions` T1 and `shell-carve-out` T1 side by side.
3. Then, as soon as their PRs merge: `checkout-reorg` T1 (needs boundary-conventions T1), `catalogue-reorg` T1 (needs boundary-conventions T1 and shell-carve-out T1), `boundary-conventions` T2, `shell-carve-out` T2.
4. From there follow the "Start when merged" column of section 3.

## 1. The rule (certified)

**Two turns may run at the same time, in two terminals, if and only if neither is a (transitive) prerequisite of the other** in the graph of section 3. Everything not connected by a prerequisite path is independent: for every such pair the files each turn writes are disjoint (checked programmatically over all 36 turns: 0 unordered pairs share a file; a second, token-level cross-check over the phase text found only read-only mentions).

What can never run in parallel:
- **Phases inside a turn** (n.1, n.2, …): they share one branch and each builds on the files of the previous one. Feed them one after the other to the same executor.
- **Turns of one axis**: the next turn starts only after the previous turn's PR is merged (its first phase gates on that).
- So the unit you parallelize is **one turn = one terminal = one PR**.

A turn's **first phase** has a GATE that makes the executor stop if a prerequisite is not merged yet, so a mistake in ordering costs a stopped phase, not a conflict.

## 2. How the plan was made parallel-safe (changes to the phase files)

Shared files that would have forced serialization were removed from the turns:
- progress log: one file per axis (`_project/macro-refactor/logs/<slug>.log`) instead of one shared file;
- `CLAUDE.md`: edited only by boundary-conventions T2 (conventions) and legacy-retirement T2 (final feature map, adapters sentence, catalogue paragraph, data-layer bullet, architecture text); the feature-map row flips of seven axes were removed;
- `.no-mistakes.yaml`: the three `features/*/actions.ts` surfaces are declared once in boundary-conventions T3 (was: three axes each adding one entry next to each other);
- `docs/homepage-structure.md`: only homepage T4 edits it (it also carries the carousel, basket and products path updates; removed from shell, basket, products);
- `playwright.checkout.config.ts` comment fix moved from test-lanes to checkout T3; the `vitest.integration.config.ts` stale-glob cleanup moved from checkout T1 to basket T3;
- infra-closeout reduced to one turn (its CLAUDE.md turn moved to legacy-retirement).

## 3. Prerequisite graph and earliest start

Axis ids used in the notes: H = repo-hygiene, A0 = boundary-conventions, A1 = test-lanes, A2 = shell-carve-out, A3 = checkout-reorg, A4 = catalogue-reorg, A5 = auth-reorg, A6 = basket-reorg, A7 = products-reorg, A8 = homepage-reorg, A9 = account-reorg, A10 = infra-closeout, A11 = legacy-retirement; "A3.T2" means turn 2 of A3.

"Start when merged" lists direct prerequisites only (transitive ones follow). Write set = the files the turn changes (details in the phase files). Phases per turn in brackets.

| Turn (folder, turn) | Phases | Start when merged | Writes (main areas) | Earliest wave |
|---|---|---|---|---|
| `repo-hygiene` T1 | 4 | nothing | sanity-cms/utils (58 deletions); deletes 3 GitHub branches + 4 local refs | 0 |
| `boundary-conventions` T1 | 3 | `repo-hygiene` T1 (gate: H merged (dumpFeatured.mjs gone)) | eslint.config.mjs | 1 |
| `boundary-conventions` T2 | 2 | `boundary-conventions` T1 | CLAUDE.md | 2 |
| `boundary-conventions` T3 | 2 | `boundary-conventions` T2 | .no-mistakes.yaml, tsconfig.json | 3 |
| `test-lanes` T1 | 2 | `boundary-conventions` T2 (gate: CLAUDE.md has the Test lanes bullet (A0.T2)) | vitest.config.mts, vitest.integration.config.ts, package.json | 3 |
| `test-lanes` T2 | 2 | `test-lanes` T1 | tests/AGENTS.md, docs/testing/TEST_LOCATION_CONVENTION.md, 2 dead files | 4 |
| `shell-carve-out` T1 | 2 | `repo-hygiene` T1 (gate: stale branches deleted (H phase 1.2)) | layout/carousel → ui/carousel; 7 homepage + 4 catalogue-nav import lines | 1 |
| `shell-carve-out` T2 | 2 | `shell-carve-out` T1 | NavbarActions, NavActionItem, BasketButton, useDrawer, DrawersManager, ActionBar, ui/modal | 2 |
| `shell-carve-out` T3 | 2 | `shell-carve-out` T2 | newsletter → layout/footer | 3 |
| `checkout-reorg` T1 | 5 | `boundary-conventions` T1, `repo-hygiene` T1 (gates: ENTRY_ONLY lint rule (A0.T1), branch deleted (H)) | features/checkout core; app/actions; lib/{session,shipping,address}; ~15 importer files; account/addresses/* | 2 |
| `checkout-reorg` T2 | 3 | `checkout-reorg` T1 | app/checkout UI → features/checkout/ui; BasketSummary; app/dev design-system page | 3 |
| `checkout-reorg` T3 | 2 | `checkout-reorg` T2 | lib/checkout → sanity-cms/lib/orders; api return/webhook; lib/auth.ts; tests → tests/e2e/checkout; playwright.checkout.config.ts | 4 |
| `checkout-reorg` T4 | 2 | `checkout-reorg` T3 | docs/checkout/* | 5 |
| `catalogue-reorg` T1 | 3 | `boundary-conventions` T1, `shell-carve-out` T1 (gates: A0.T1, carousel in ui/ (A2.T1)) | data/catalogue.ts, lib/catalogue → features/catalogue; (store) pages; getHomepageData import; Pagination imports | 2 |
| `catalogue-reorg` T2 | 2 | `catalogue-reorg` T1, `shell-carve-out` T2 (A2.T2 first: both edit DrawersManager.tsx (adjacent import lines)) | layout/catalogue + breadcrumbs → features/catalogue/ui; (store)/layout; DrawersManager; [...slug]/page | 3 |
| `catalogue-reorg` T3 | 1 | `catalogue-reorg` T2 | catalogue-architecture.md | 4 |
| `auth-reorg` T1 | 2 | `boundary-conventions` T1, `repo-hygiene` T1, `shell-carve-out` T2 (gates: A0.T1, branch deleted, NavActionItem exists (A2.T2)) | features/auth; 5 route forms + pages; AccountActions.client | 3 |
| `auth-reorg` T2 | 2 | `auth-reorg` T1 | useSignOut; NavbarActions; AccountActions.client | 4 |
| `basket-reorg` T1 | 2 | `boundary-conventions` T1, `test-lanes` T1, `shell-carve-out` T2, `checkout-reorg` T2 (A3.T2 (BasketSummary, BasketManager), A2.T2 (ActionBar, NavActionItem), A1.T1 (tests/live glob), A0.T1) | store/ → features/basket/ui; ActionBar; basket UI imports; specs | 4 |
| `basket-reorg` T2 | 4 | `basket-reorg` T1, `auth-reorg` T2 (A5.T2 first: both edit NavbarActions.tsx import block) | basket UI + Loader move; NavbarActions; 4 homepage cards; ProductCard/ProductInfo imports; basket page; jsdom specs | 5 |
| `basket-reorg` T3 | 3 | `basket-reorg` T2, `boundary-conventions` T3 (A0.T3 first: both edit tsconfig.json and .no-mistakes.yaml) | live + e2e specs; vitest.integration.config.ts; playwright.config.ts; tsconfig.json; .no-mistakes.yaml (1 sentence) | 6 |
| `basket-reorg` T4 | 1 | `basket-reorg` T3 | 5 live docs (basket READMEs, search-ux, vertical-space) | 7 |
| `products-reorg` T1 | 3 | `boundary-conventions` T1, `catalogue-reorg` T2, `basket-reorg` T2 (A4.T2 (products pages) and A6.T2 (tests/integration spec, basket entry)) | types inversion; sanity-cms/lib/products fetchers; wishlist read, title helpers, urlFor; product routes; componentIntegrations mock | 6 |
| `products-reorg` T2 | 3 | `products-reorg` T1 | product UI/skeletons/QuantitySelector move; routes; AutocompletePanel; tests/integration specs | 7 |
| `products-reorg` T3 | 3 | `products-reorg` T2 | WishlistButton + actions; wishlist patch modules | 8 |
| `products-reorg` T4 | 1 | `products-reorg` T3, `catalogue-reorg` T3 (A4.T3 first: both edit catalogue-architecture.md) | design-system.md, catalogue-architecture.md | 9 |
| `homepage-reorg` T1 | 3 | `boundary-conventions` T1, `shell-carve-out` T1, `catalogue-reorg` T1, `basket-reorg` T2 (A2.T1 (carousel), A4.T1 (getHomepageData), A6.T2 (BasketControls imports)) | homepage types, IEM query, shims/dead files; getHomepageData; (store)/page; fetchHomepageData | 6 |
| `homepage-reorg` T2 | 2 | `homepage-reorg` T1, `products-reorg` T2 (A7.T2 first: both edit tests/integration/componentIntegrations.spec.tsx) | homepage UI part 1; (store)/page; componentIntegrations spec | 8 |
| `homepage-reorg` T3 | 2 | `homepage-reorg` T2 | homepage UI part 2; ProductBadge; (store)/page; dev pages (imports only); spec | 9 |
| `homepage-reorg` T4 | 1 | `homepage-reorg` T3 | docs/homepage-structure.md | 10 |
| `account-reorg` T1 | 3 | `boundary-conventions` T1, `checkout-reorg` T1, `auth-reorg` T2 (A3.T1 (account/addresses files, Address type) and A5.T2 (AccountActions.client, auth entry)) | 5 sanity-cms/lib/account modules; account actions merge; AccountActions/AddressesClient imports | 5 |
| `account-reorg` T2 | 2 | `account-reorg` T1 | account UI move; account + addresses pages | 6 |
| `infra-closeout` T1 | 2 | `checkout-reorg` T3, `catalogue-reorg` T2, `auth-reorg` T2, `basket-reorg` T3, `products-reorg` T3, `homepage-reorg` T3, `account-reorg` T2 (all code turns merged (the gate checks the legacy folders are empty)) | dead files in sanity-cms/lib and lib; 2 comments | 10 |
| `legacy-retirement` T1 | 2 | `infra-closeout` T1 | eslint.config.mjs, tailwind.config.ts | 11 |
| `legacy-retirement` T2 | 2 | `test-lanes` T2, `checkout-reorg` T4, `catalogue-reorg` T3, `basket-reorg` T4, `products-reorg` T4, `homepage-reorg` T4, `legacy-retirement` T1 (all docs turns merged (A1.T2, A3.T4, A4.T3, A6.T4, A7.T4, A8.T4) and A11.T1) | CLAUDE.md, living docs sweep | 12 |
| `legacy-retirement` T3 | 1 | `legacy-retirement` T2 | roadmap.md (appends section 10) | 13 |

Waves (earliest start if every PR is merged as soon as its turn ends). All turns in one wave are pairwise independent:

| Wave | Turns that can run side by side |
|---|---|
| 0 | `repo-hygiene` T1 |
| 1 | `boundary-conventions` T1; `shell-carve-out` T1 |
| 2 | `boundary-conventions` T2; `shell-carve-out` T2; `checkout-reorg` T1; `catalogue-reorg` T1 |
| 3 | `boundary-conventions` T3; `test-lanes` T1; `shell-carve-out` T3; `checkout-reorg` T2; `catalogue-reorg` T2; `auth-reorg` T1 |
| 4 | `test-lanes` T2; `checkout-reorg` T3; `catalogue-reorg` T3; `auth-reorg` T2; `basket-reorg` T1 |
| 5 | `checkout-reorg` T4; `basket-reorg` T2; `account-reorg` T1 |
| 6 | `basket-reorg` T3; `products-reorg` T1; `homepage-reorg` T1; `account-reorg` T2 |
| 7 | `basket-reorg` T4; `products-reorg` T2 |
| 8 | `products-reorg` T3; `homepage-reorg` T2 |
| 9 | `products-reorg` T4; `homepage-reorg` T3 |
| 10 | `homepage-reorg` T4; `infra-closeout` T1 |
| 11 | `legacy-retirement` T1 |
| 12 | `legacy-retirement` T2 |
| 13 | `legacy-retirement` T3 |

In practice turns end at different times: **do not wait for a whole wave**. Start any turn the moment its "Start when merged" PRs are merged.

## 4. Axis-level view (which axes can overlap)

● every turn pair of the two axes is independent; ◐ some pairs independent, the rest ordered by prerequisites; ○ every pair ordered (never overlap). H = repo-hygiene, A0 boundary-conventions, A1 test-lanes, A2 shell-carve-out, A3 checkout, A4 catalogue, A5 auth, A6 basket, A7 products, A8 homepage, A9 account, A10 infra-closeout, A11 legacy-retirement.

| | H | A0 | A1 | A2 | A3 | A4 | A5 | A6 | A7 | A8 | A9 | A10 | A11 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **H** | · | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ |
| **A0** | ○ | · | ◐ | ● | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | ○ | ○ |
| **A1** | ○ | ◐ | · | ● | ● | ● | ● | ◐ | ◐ | ◐ | ● | ◐ | ◐ |
| **A2** | ○ | ● | ● | · | ● | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ |
| **A3** | ○ | ◐ | ● | ● | · | ● | ● | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ |
| **A4** | ○ | ◐ | ● | ◐ | ● | · | ● | ● | ◐ | ◐ | ● | ◐ | ◐ |
| **A5** | ○ | ◐ | ● | ◐ | ● | ● | · | ◐ | ○ | ○ | ○ | ○ | ○ |
| **A6** | ○ | ◐ | ◐ | ◐ | ◐ | ● | ◐ | · | ◐ | ◐ | ● | ◐ | ◐ |
| **A7** | ○ | ◐ | ◐ | ◐ | ◐ | ◐ | ○ | ◐ | · | ◐ | ● | ◐ | ◐ |
| **A8** | ○ | ◐ | ◐ | ◐ | ◐ | ◐ | ○ | ◐ | ◐ | · | ● | ◐ | ◐ |
| **A9** | ○ | ◐ | ● | ◐ | ◐ | ● | ○ | ● | ● | ● | · | ○ | ○ |
| **A10** | ○ | ○ | ◐ | ◐ | ◐ | ◐ | ○ | ◐ | ◐ | ◐ | ○ | · | ○ |
| **A11** | ○ | ○ | ◐ | ◐ | ◐ | ◐ | ○ | ◐ | ◐ | ◐ | ○ | ○ | · |

Reading the matrix: ○ pairs never overlap because of prerequisite chains (for example A5 → A6 → A7); every other pair overlaps at least partly. The heaviest overlaps are **A1 ∥ A3 ∥ A4 ∥ A5** (right after the foundation), **A7 ∥ A8 ∥ A9** (the middle of the plan), and **A9 with almost everything else** (it is small and only needs A3 and A5).

## 5. Suggested terminal assignments

Critical path (phase units, every phase one unit): 38. The graph needs **3 terminals** to reach it; a 4th terminal only absorbs merge latency; more than 4 never helps.

Assignment with 4 terminals (greedy by longest remaining path; times assume instant merges, so treat each queue as an order of preference, not a fixed script, and always apply the "Start when merged" rule):

| Terminal | Queue |
|---|---|
| Terminal 1 | repo-hygiene T1 → boundary-conventions T1 → checkout-reorg T1 → checkout-reorg T2 → basket-reorg T1 → basket-reorg T2 → products-reorg T1 → products-reorg T2 → homepage-reorg T2 → homepage-reorg T3 → infra-closeout T1 → legacy-retirement T1 → legacy-retirement T2 → legacy-retirement T3 |
| Terminal 2 | shell-carve-out T1 → shell-carve-out T2 → auth-reorg T1 → auth-reorg T2 → account-reorg T1 → checkout-reorg T3 → checkout-reorg T4 → homepage-reorg T1 → basket-reorg T4 → products-reorg T3 → products-reorg T4 → homepage-reorg T4 |
| Terminal 3 | boundary-conventions T2 → test-lanes T1 → boundary-conventions T3 → catalogue-reorg T3 → shell-carve-out T3 → basket-reorg T3 |
| Terminal 4 | catalogue-reorg T1 → catalogue-reorg T2 → test-lanes T2 → account-reorg T2 |

Assignment with 3 terminals:

| Terminal | Queue |
|---|---|
| Terminal 1 | repo-hygiene T1 → boundary-conventions T1 → checkout-reorg T1 → checkout-reorg T2 → basket-reorg T1 → basket-reorg T2 → products-reorg T1 → products-reorg T2 → homepage-reorg T2 → homepage-reorg T3 → infra-closeout T1 → legacy-retirement T1 → legacy-retirement T2 → legacy-retirement T3 |
| Terminal 2 | shell-carve-out T1 → shell-carve-out T2 → auth-reorg T1 → auth-reorg T2 → boundary-conventions T3 → catalogue-reorg T2 → checkout-reorg T3 → test-lanes T2 → catalogue-reorg T3 → homepage-reorg T1 → basket-reorg T4 → products-reorg T3 → products-reorg T4 → homepage-reorg T4 |
| Terminal 3 | boundary-conventions T2 → test-lanes T1 → catalogue-reorg T1 → account-reorg T1 → account-reorg T2 → checkout-reorg T4 → basket-reorg T3 → shell-carve-out T3 |

## 6. Ordering constraints that are not obvious from the axis names

- shell-carve-out T2 before catalogue T2 (both edit `DrawersManager.tsx`, adjacent import lines).
- auth T2 before basket T2 (both edit the import block of `NavbarActions.tsx`); shell-carve-out T2 before both.
- checkout T2 before basket T1 (BasketSummary / BasketManager import lines; the checkout entry must export CheckoutButton).
- boundary-conventions T3 before basket T3 (`tsconfig.json` and `.no-mistakes.yaml`).
- catalogue T2 and basket T2 before products T1 (product route pages; `tests/integration` spec created by basket T2).
- products T2 before homepage T2 (both edit `tests/integration/componentIntegrations.spec.tsx`); homepage T1 can run beside products T1.
- catalogue T3 before products T4 (`catalogue-architecture.md`).
- checkout T1 and auth T2 before account T1 (`account/addresses/*`, `AccountActions.client.tsx`, the `Address` type and auth entries).
- all code turns before infra-closeout; all docs turns before legacy-retirement T2.
- repo-hygiene first: it deletes the branches the gates of shell-carve-out, checkout and auth check, and its merge unblocks boundary-conventions T1.

## 7. Folders (paste order inside a folder: turn by turn, phase by phase)

| Folder | Turns / phases |
|---|---|
| `_project/working-memory/repo-hygiene` | 1 / 4 |
| `_project/working-memory/boundary-conventions` | 3 / 7 |
| `_project/working-memory/test-lanes` | 2 / 4 |
| `_project/working-memory/shell-carve-out` | 3 / 6 |
| `_project/working-memory/checkout-reorg` | 4 / 12 |
| `_project/working-memory/catalogue-reorg` | 3 / 6 |
| `_project/working-memory/auth-reorg` | 2 / 4 |
| `_project/working-memory/basket-reorg` | 4 / 10 |
| `_project/working-memory/products-reorg` | 4 / 10 |
| `_project/working-memory/homepage-reorg` | 4 / 8 |
| `_project/working-memory/account-reorg` | 2 / 5 |
| `_project/working-memory/infra-closeout` | 1 / 2 |
| `_project/working-memory/legacy-retirement` | 3 / 5 |

## 8. Running notes

- Merge order between independent turns does not matter (disjoint files). Merge order along a prerequisite edge does.
- A turn whose gate fails stops at task 0 and reports which check failed: that is the signal that a prerequisite PR is not merged yet.
- Human live checks (dev server) are listed in each turn's last phase; with several PRs open at once, check each PR on its own branch.
