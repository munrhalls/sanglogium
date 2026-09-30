# Prune T3 Audit — reference graph & verdicts

_Read-only audit. No repo file other than this report was created or changed. The only execution was one throwaway plain-Node script (`/tmp/prune-audit/graph.js`, outside the repo). No build/lint/test/dev-server commands were run._

## 1. Method + script summary

- **Scope**: `git ls-files` filtered to tracked `*.ts/*.tsx/*.js/*.mjs/*.cjs` under `app/`, `lib/`, `store/`, `tests/`, plus root-level code files (`middleware.ts`, `instrumentation*.ts`, `sentry*.config.ts`, `sanity.*.ts`, configs). 391 files in scope.
- **Edges**: regex scan of each file for `import/export … from '…'`, bare side-effect `import '…'`, `require('…')`, and `import('…')`. Specifiers resolved for relative paths and the `@/` alias (`tsconfig.json` paths: `@/* → ./*`), with extension probing `.ts/.tsx/.js/.mjs/.cjs`, index files, and non-code dots in basenames (`.client.tsx`, `.types.ts`, `.frozen.ts`, `.test.ts`).
- **Config inbound**: basename matches inside `vitest.config.mts`, `vitest.integration.config.ts`, `playwright*.config.ts`, `next.config.ts`, `package.json`, `vercel.json`, `eslint.config.mjs`, `tailwind.config.ts`, `postcss.config.mjs`, `sanity.config.ts`, `sanity.cli.ts` counted as inbound references.
- **Entry points excluded from deadness**: App Router files (`page`, `layout`, `route`, `loading`, `error`, `global-error`, `not-found`, `robots`, …), `middleware.ts`, `instrumentation*.ts`, `sentry*.config.ts`, `next.config.ts`, `sanity*.ts`, `*.d.ts`, and test files matched by a runner include glob.
- **Runner includes actually configured**: `vitest.config.mts` → `**/*.spec.ts(x)`/`**/*.test.ts(x)`; `vitest.integration.config.ts` → `tests/basket/integration/**`, `app/components/features/basket/__tests__/integration/**`, `tests/checkout/guest-checkout-inventory-reservation/**`, `tests/checkout/integration/**`; `playwright.config.ts` testDir `app/components/features/basket/__tests__/e2e`; `playwright.checkout.config.ts` testDir `tests/checkout`, testMatch `**/*.test.ts`; `playwright-ct.config.ts` testDir `tests/component`; `playwright.performance.config.ts` testDir `tests/e2e/performance`.
- **Unresolved-import scan**: zero unresolved relative/`@/` specifiers across all 391 files — every test's imports resolve, so no import-resolution DEAD-TESTs.
- Result: 105 files with zero inbound edges before entry-point/runner filtering; ~36 real candidates after.

## 2. Verdict table

Legend: "inbound refs" = quoting specifiers/files found referencing the target (code edges + basename hits in non-code files, excluding `_project/`, `docs/`, `research/` prose).

### Files — DELETE (0 inbound, not entry points, not dynamically loaded)

| path | type | inbound refs | evidence | verdict | reason |
|---|---|---|---|---|---|
| `app/components/analytics/suppressImageWarnings.tsx` | file | none (basename grep: 0) | client util suppressing dev Image warnings; last touched 2026-04 | DELETE | unreferenced |
| `app/components/common/ErrorMessage.tsx` | file | none | 2025-10 "refactor summary page" | DELETE | unreferenced |
| `app/components/features/account/BackdropClose.tsx` | file | none | 2025-12 account composition refactor | DELETE | unreferenced; `account/page.tsx` does not import it |
| `app/components/features/account/ExitButton.tsx` | file | none | 2026-03 | DELETE | unreferenced |
| `app/components/features/basket/BasketUIMock.tsx` | file | none | mock component ("MockItem") | DELETE | mock, unreferenced |
| `app/components/features/checkout/CheckoutPanel.tsx` | file | none in code | 2026-05 "add checkout components folder" stub | DELETE | superseded by real `app/checkout/` flow |
| `app/components/features/homepage/accessories/getAccessoryProducts.ts` | file | none | pure type re-export shim (2026-08 data-layer consolidation) | DELETE | re-export leftover; nothing imports it |
| `app/components/features/homepage/newest-release/getNewestRelease.ts` | file | none | same shim pattern | DELETE | re-export leftover |
| `app/components/features/homepage/product-spotlight-2/getSpotlight2Data.ts` | file | none | same shim; `ProductSpotlight3.tsx` imports from `product-spotlight-1` path instead | DELETE | re-export leftover |
| `app/components/features/homepage/product-spotlight-3/getSpotlight3Data.ts` | file | none | same shim | DELETE | re-export leftover |
| `app/components/features/homepage/featured/card/Card.tsx` | file | none | imports only `./CardMedia`, `./CardDetails` | DELETE | orphaned card subtree root |
| `app/components/layout/carousel/CarouselMediaBox.tsx` | file | none | 2026-05 image-loading fix era | DELETE | MediaBox primitive no longer used |
| `app/components/layout/grid/GridMediaBox.tsx` | file | none | 2026-03 "specialized MediaBox primitives" | DELETE | unused |
| `app/components/layout/spotlight/Spotlight.tsx` | file | none (basename hits are `Spotlight1Data` types & spotlight-N dirs, different paths) | 2026-08 | DELETE | unused |
| `app/components/layout/spotlight/SpotlightMediaBox.tsx` | file | none | 2026-08 | DELETE | unused |
| `app/components/skeletons/ShopHeaderSkeleton.tsx` | file | none — live importers use `app/components/features/products/ShopHeaderSkeleton` (different file) | two same-named components exist | DELETE | stale duplicate |
| `app/components/ui/buttons/CTA.tsx` | file | none (all `CTA` grep hits are comments like "sticky CTA") | PortableText promo CTA, 2026-01 | DELETE | unreferenced; mislocated under `ui/buttons` |
| `app/components/ui/buttons/DrawerToggleButton.tsx` | file | none | 2026-02 | DELETE | unreferenced |
| `app/components/ui/icons/CategoryTitleIcon.tsx` | file | none | 2026-03 | DELETE | unreferenced |
| `app/components/ui/info-tool-tip/infoTooltip.tsx` | file | none | 2026-03 | DELETE | unreferenced |
| `app/components/ui/promotion-image/PromotionImage.tsx` | file | none | 2026-06 | DELETE | unreferenced |
| `app/components/ui/sanity-image/SanityImage.tsx` | file | none (Hero mentions it in types/comments only) | passthrough `next/image` wrapper, 2026-06 | DELETE | trivially superseded passthrough |
| `app/components/ui/segment-title/SegmentTitle.tsx` | file | none in code (only `docs/` prose) | 2026-03 | DELETE | unreferenced |
| `app/components/ui/smart-link/SmartLink.tsx` | file | none | 2026-06 | DELETE | unreferenced |
| `app/hooks/useOrderTotals.ts` | file | none | 2025-10; duplicated by live totals logic in checkout | DELETE | unreferenced |
| `app/lib/data/dataLoader.ts` | file | none | React `cache()` wrapper over `fetchHomepageDataBatched`; homepage calls the fetcher directly | DELETE | unreferenced |
| `lib/catalogue/semanticMatching.ts` | file | none | 2026-03 catalogue VFS era; imports `semanticConfig` | DELETE | unreferenced leftover |
| `lib/shipping/carrier-rates.ts` | file | none (only archived `research/` doc) | self-described "PORTFOLIO DEMONSTRATION … mock rates" | DELETE | mock module, unreferenced |
| `lib/shipping/de-rates.ts` | file | none | imports live `packlink-rates` but nothing imports it | DELETE | orphan per task rule |
| `lib/shipping/gb-rates.ts` | file | none | same | DELETE | orphan per task rule |
| `tests/setup/time-mock.ts` | file | none — `setupFiles` is `vitest.setup.ts`, not this | 2026-04 | DELETE | unreferenced helper |

### Files — KEEP

| path | inbound refs | reason |
|---|---|---|
| `app/actions/address/google-address-validator.frozen.ts` | none | header: "FROZEN … kept solely so it can be re-enabled" — intentionally retained dead code by design |
| `lib/qrcode.d.ts` | `qrcode` imported by `app/components/features/auth/TwoFactorSection.tsx` | type shim for live package import |
| `lib/wishlist.ts` | 4 store pages | live |
| `lib/shipping/{allekurier-rates,packlink-rates,countryDetector,parcel-calculator}.ts` | `api/basket/shipping-rates`, `api/shipping/rates`, `checkout/shipping/page.tsx`, `BasketManager.tsx` | live |
| `lib/dev/event-logger.ts` | 10+ importers | live dev-trace tooling |
| `lib/catalogue/__tests__/*-proof.mjs`, `tsExtLoader.mjs`, `lib/filter-sort/**/__tests__/*.mjs` | none (not runner-matched) | documented manual proof scripts — header gives exact `node --experimental-strip-types --loader ./tsExtLoader.mjs` invocation; deliberately outside vitest |
| all `*.spec.*`/`*.test.*` under `store/__tests__`, `lib/**/__tests__`, `app/**`, `tests/**` | matched by `vitest.config.mts` include `**/*.spec.*`/`**/*.test.*` | runner entry points; imports all resolve; no removed-feature (redis/bullmq/queue/inventory-reservation) targets found |
| `tests/config.ts`, `tests/helpers/{test-server,sanity-test-products}.ts`, `tests/checkout/test-data/test-addresses.ts` | vitest.setup chain / e2e specs | live test infra |
| `app/(store)/layout.tsx`, `app/(admin)/layout.tsx`, `app/(studio)/layout.tsx`, `app/(test)/layout.tsx`, `app/checkout/layout.tsx`, `app/global-error.tsx`, `app/robots.ts`, `app/sandbox/layout.tsx`, `app/design-system-test/**/layout.tsx`, `app/dev/layout.tsx` | entry points | App Router files |
| `middleware.ts`, `instrumentation*.ts`, `sentry*.config.ts`, `next.config.ts`, `sanity.config.ts`, `sanity.cli.ts`, `sanity.types.ts`, `tailwind.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `vitest.integration.config.ts`, `playwright*.config.ts` | entry points / generated | configs & generated types (`sanity.types.ts` also has code importers) |
| `app/suppress-warnings.ts` | `import "../suppress-warnings"` in `app/(store)/layout.tsx` | live side-effect import |

### Files — UNSURE-HUMAN

| path | evidence | why unsure |
|---|---|---|
| `lib/address/nominatim-validator.ts` | header: "SKELETON — … must read before full implementation" | intentionally parked pre-implementation, not dead by accident |
| `lib/utils/cookies.ts` | `jose` JWT verify w/ `CHECKOUT_JWT_SECRET`; zero inbound | security-adjacent helper; may be reserved for a cookie-gated flow |
| `lib/dev/integrity-monitor.ts` | dev-only monitor, zero inbound | dev tooling possibly run ad-hoc |
| `lib/dev/logger.ts` | "unified frontend logger", zero inbound; referenced by `research/LOGGING_PATTERNS_2026.md` | adopted-by-convention logger nobody imports yet |
| `tests/fixtures/catalogue-fixtures.ts` | header: "Used by Phase 0+ of filters-sorting-gap-closure-plan.md"; zero importers | fixture staged for an unfinished campaign |
| `store/__tests__/e2e/non-local-basket.spec.ts` | Playwright spec but lives outside every `testDir`; matched only by vitest `**/*.spec.ts` where it would run under jsdom and fail | misplaced file — relocate to a playwright `testDir` or exclude from vitest; human decides |
| `app/api/address/autocomplete/route.ts` | Photon autocomplete endpoint; zero callers in code/tests | fully implemented public endpoint — maybe intended for a client that doesn't exist yet |
| `app/api/shipping/route.ts` | POST → `submitShippingAction`; zero callers | possibly external/integration surface |
| `app/api/shipping/rates/route.ts` | packlink+allekurier+parcel-calculator aggregation; zero callers (`BasketManager` uses `/api/basket/shipping-rates`) | looks like the pre-refactor version of `api/basket/shipping-rates`; external callers can't be ruled out |

### Routes — verdicts

| route | inbound links | tests/docs | verdict | reason |
|---|---|---|---|---|
| `app/(test)/streaming-poc/` (page + `reveal.module.css` + `types.ts`) | none — only code comments in `ImageRevealScript.tsx`/`ChunkedProductGrid.tsx` crediting the mechanism | `_project/AI_LESSONS.md` prose | DELETE | proof-of-concept page; mechanism already adopted in product code; no inbound links, no test dependency |
| `app/sandbox/` (page + layout) | none (archived `research/` mentions only) | none | DELETE | sandbox/dev scratch page |
| `app/(test)/checkout-seed/route.ts` | fetched by `tests/checkout/e2e/address-flow{,-regression}.test.ts` | yes | KEEP | live test seed endpoint |
| `app/dev/design-system/` + `app/design-system-test/**` | none in code | `docs/design-system.md` references both | UNSURE-HUMAN | dev-only pages a doc says agents use |
| `app/(admin)/manager/` + `manager/performance` | none in code | `docs/performance/RUNBOOK.md`, audit docs | KEEP | documented admin surface |
| `app/(admin)/packer/` | none anywhere | none | UNSURE-HUMAN | admin route with zero evidence either way |
| `app/api/account/export`, `analytics/vitals`, `auth/[...all]`, `basket/products`, `basket/shipping-rates`, `checkout/payment-intent-session`, `checkout/return`, `newsletter/subscribe`, `trace` | live `fetch`/`sendBeacon`/`href` callers in app code | — | KEEP | product flow |
| `app/api/revalidate/route.ts` | `next.config.ts` rewrite + header rule | — | KEEP | Sanity webhook convention |
| `app/api/webhooks/stripe/route.ts` | external Stripe webhook | — | KEEP | external integration |
| `app/api/address/autocomplete`, `app/api/shipping`, `app/api/shipping/rates` | zero callers | — | UNSURE-HUMAN | see table above |

## 3. Needs package.json / config follow-up (not actioned — package.json untouched)

- `vitest.integration.config.ts` includes `tests/basket/integration/**` and `tests/checkout/guest-checkout-inventory-reservation/**` — **neither directory exists** (git ls-files: 0 hits). Stale include globs.
- `playwright-ct.config.ts` `testDir: './tests/component'` — **directory does not exist**, and no `package.json` script invokes this config. Effectively dead runner config.
- No `package.json` script invokes `vitest.integration.config.ts` either (scripts: `test`, `test:ci`, `test:coverage`, `test:e2e`, `test:performance`, `test:checkout:fast`, `test:report`). The integration suite is configured but unwired.
- No package.json script points at a deleted test path — nothing to remove there; the staleness is in the config files above.
- `store/__tests__/e2e/non-local-basket.spec.ts` is a Playwright spec swallowed by vitest's `**/*.spec.ts` include — see UNSURE-HUMAN row.

## 4. Not actioned (info only)

- Unused exports inside live files were out of scope per the task; observed while auditing: `de-rates`/`gb-rates` import live `packlink-rates` symbols (dropping those files shrinks its export surface), `getSpotlight2/3Data` shims re-export `Spotlight1Data` aliases, `CheckoutPanel` exports a props interface nothing consumes. Whole-file verdicts already cover these.
- `sanity.types.ts` is generated — regenerating rather than editing is the right maintenance path; left alone.
