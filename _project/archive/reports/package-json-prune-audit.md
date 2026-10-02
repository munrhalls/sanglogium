# package.json Prune Audit

Date: 2026-09-30. Branch: dep-audit. Read-only; no installs, no test/build runs.
Method: `git grep` per package across all tracked code/config (excluding package-lock, backups, .md), then implicit-use checks (peers via `package-lock.json`, scripts, config references, binary names).

## Dependencies

| Entry | Evidence | Implicit-use check | Verdict |
|---|---|---|---|
| `@googlemaps/addressvalidation` | 0 code matches; address validation calls `addressvalidation.googleapis.com` REST directly (`app/actions/address/google-address-validator.frozen.ts:140`) | no peers need it | REMOVE |
| `@hookform/resolvers` | 0 matches (`zodResolver` absent) | peer of nothing needed; react-hook-form itself unused | REMOVE |
| `@libsql/client` | 0 direct imports; `lib/auth.ts` uses `kysely-libsql`'s `LibsqlDialect` | IS a transitive dep of `kysely-libsql` (lock: deps `{@libsql/client: ^0.15.0}`), so removing the direct dep doesn't remove it from node_modules | REMOVE (redundant — stays installed transitively) |
| `@paralleldrive/cuid2` | 0 matches (`cuid2`/`createCuid` absent) | — | REMOVE |
| `@radix-ui/react-dialog` | 0 matches | — | REMOVE |
| `@radix-ui/react-popover` | 0 matches | — | REMOVE |
| `@radix-ui/react-slot` | 0 matches | — | REMOVE |
| `@sanity/types` | 0 matches | required peer of `@portabletext/*`, `@sanity/insert-menu`, `@sanity/visual-editing-types` | KEEP |
| `@upstash/redis` | 1 match: dead `lib/dev/redis-test.ts` (no importers) | — | REMOVE (with the dead file) |
| `class-variance-authority` | 0 matches (`cva` absent) | — | REMOVE |
| `cmdk` | 0 matches (`Command` component absent) | — | REMOVE |
| `groq-builder` | 0 matches. NOTE: code imports plain `groq` (`sanity-cms/lib/products/*.ts`, `app/checkout/payment/page.tsx`) — `groq` is a PHANTOM dep (transitive, undeclared) | — | REMOVE groq-builder; separately consider declaring `groq` |
| `lodash` | 0 matches (`from 'lodash'` absent) | — | REMOVE (with `@types/lodash`) |
| `next-safe-action` | 0 matches (`createSafeActionClient` absent) | — | REMOVE |
| `next-sanity-image` | 0 matches (`useNextSanityImage` absent) | — | REMOVE |
| `pino` | **0 matches anywhere** — no import/require in `app`, `lib`, `instrumentation*.ts`, `sentry*.ts`; `lib/logger*` don't exist as pino wrappers (`lib/dev/logger.ts` is a hand-rolled console wrapper, itself unused) | — | REMOVE |
| `pino-pretty` | 0 matches | — | REMOVE |
| `react-error-boundary` | 0 matches; error boundaries are hand-rolled (`app/(store)/search/error.tsx`, test class in `AddressForm.test.tsx`) | — | REMOVE |
| `react-hook-form` | 0 matches (`useForm`/`FormProvider` absent). README claims it — also false | — | REMOVE |
| `react-intersection-observer` | 0 matches (`useInView` absent) | — | REMOVE |
| `react-is` | 0 direct imports | required peer of `@sanity/ui`, `@sanity/insert-menu`, `@sanity/visual-editing` | KEEP |
| `react-payment-icons` | 0 matches (`PaymentIcon` absent) | — | REMOVE |
| `styled-components` | 0 direct imports | required peer of `sanity`, `next-sanity`, `@sanity/ui`, `@sanity/vision` | KEEP |
| `undici` | 0 matches in code or scripts | — | REMOVE |
| `use-debounce` | 0 matches (`useDebounce`/`useDebounced` absent) | — | REMOVE |
| `react-dom` | 0 direct imports | required by react/next; peer of many | KEEP |
| `critters` | only `next.config.ts` comment + `optimizeCss: false` (feature disabled) | Next bundles its own critters internally; direct dep only needed if importing it | REMOVE |
| `isomorphic-dompurify` | 0 imports; but listed in `next.config.ts` `serverExternalPackages` | entry suggests a transitive runtime dep needed it; can't confirm which | UNSURE-HUMAN |
| `jose` | `lib/utils/cookies.ts:2` `import { jwtVerify, errors } from "jose"`; also peer of `@better-auth/core` | real import | KEEP |
| `kysely-libsql` | `lib/auth.ts:4` `LibsqlDialect` | real import | KEEP |
| `@better-auth/kysely-adapter` | `lib/auth.ts:2` `kyselyAdapter` | real import | KEEP |
| `@sanity/vision` | `sanity.config.ts:5` `visionTool` | real import | KEEP |
| `@next/bundle-analyzer` | `next.config.ts:3` `withBundleAnalyzer`; `analyze` script | real import | KEEP |
| `postcss` | peer-required by `autoprefixer`, `cssnano` family; postcss.config.mjs toolchain | required | KEEP |
| `autoprefixer` | `postcss.config.mjs:4` plugin entry | config use | KEEP |
| `tailwindcss-animate` | `tailwind.config.ts:2` plugin import | config use | KEEP |
| `@tailwindcss/typography` | `tailwind.config.ts:3` plugin import | config use | KEEP |
| `tailwind-merge` | `lib/utils/tailwind.ts:2` | real import | KEEP |
| `clsx` | `lib/utils/tailwind.ts:1` | real import | KEEP |

## devDependencies

| Entry | Evidence | Implicit-use check | Verdict |
|---|---|---|---|
| `@axe-core/playwright` | 0 matches; no a11y spec exists (`tests/e2e/homepage/accessibility.spec.ts` missing) | no CI/script use | REMOVE |
| `@eslint/eslintrc` | 0 matches; `eslint.config.mjs` is flat config (no FlatCompat) | not a peer of eslint-config-next@16 | REMOVE |
| `@lhci/cli` | 0 matches; no `.lighthouserc*`, no script, no workflow use | — | REMOVE |
| `@playwright/experimental-ct-react` | 0 matches; `playwright-ct.config.ts` imports `@playwright/test` only | `tests/component/` dir missing entirely | REMOVE |
| `@svgr/webpack` | 0 matches; nothing in `next.config.ts` | — | REMOVE |
| `@testing-library/dom` | 0 direct imports | required peer of `@testing-library/react`, `@testing-library/user-event` | KEEP |
| `@types/babel__generator` | 0 matches | may satisfy transitive `.d.ts` resolution (all `@types` auto-included by tsc) | UNSURE-HUMAN |
| `@types/babel__template` | 0 matches | same | UNSURE-HUMAN |
| `@types/hast` | 0 matches | same (likely for a markdown/sanity transitive type chain) | UNSURE-HUMAN |
| `@types/json-schema` | 0 matches | same | UNSURE-HUMAN |
| `@types/trusted-types` | 0 matches | same | UNSURE-HUMAN |
| `@types/unist` | 0 matches | same | UNSURE-HUMAN |
| `@types/lodash` | lodash itself unused | REMOVE with lodash | REMOVE |
| `@types/node` | TS project, node APIs used | per rule | KEEP |
| `@types/qrcode` | `qrcode` imported (`TwoFactorSection.tsx:4`); qrcode ships no types | needed | KEEP |
| `@types/react`, `@types/react-dom` | React 19 TSX throughout | per rule + peer of many | KEEP |
| `@vitest/coverage-v8` | scripts `test:ci`/`test:coverage` use `--coverage`; peer of vitest | config/script use | KEEP |
| `concurrently` | script `dev:stripe` uses binary | script use | KEEP |
| `cross-env` | 0 matches; no script uses it | — | REMOVE |
| `cssnano` | 0 matches; not in `postcss.config.mjs` | — | REMOVE |
| `local-ssl-proxy` | 0 matches; no script uses it | — | REMOVE |
| `prettier-plugin-tailwindcss` | `.prettierrc:2` plugins array | config use | KEEP |
| `type-coverage` | 0 matches; no script, no `typeCoverage` config key | — | REMOVE |
| `vercel` | 0 script refs; `.github/workflows/vercel-deploy.yml` installs `vercel` globally itself | local devDep unused by repo scripts; may be used manually by human | UNSURE-HUMAN |

## Also checked (not in candidate list)

- `bullmq`, `ioredis` — absent from package.json entirely. Confirmed removed.
- `groq` — imported in ≥9 files but NOT declared (transitive phantom dep). Works today only because `next-sanity` pulls it; recommend adding explicitly. (Not a removal — noted for human.)
- `@libsql/client` vs `kysely-libsql` — only `kysely-libsql` is imported (`lib/auth.ts:4`); `@libsql/client` is its transitive dep → direct entry redundant.

## Scripts audit

| Script | Paths/config referenced | Exists? | Verdict |
|---|---|---|---|
| `dev`, `dev-no-turbo`, `build`, `start`, `prod` | next binary | yes | KEEP |
| `prebuild` | `scripts/build-catalogue-index.mjs` | yes | KEEP |
| `webhook` | `stripe` CLI (external, assumed installed) | n/a | KEEP |
| `dev:stripe` | `concurrently` | dep present | KEEP |
| `lint`, `lint-strict` | eslint | dep present | KEEP |
| `test:ci`, `test`, `test:watch`, `test:ui`, `test:coverage` | vitest | dep present | KEEP |
| `test:integration`, `test:integration:watch` | `vitest.integration.config.ts` | config exists BUT its include glob `tests/checkout/guest-checkout-inventory-reservation/**` does not exist | STALE (matches zero tests) |
| `test:homepage:unit` | `tests/unit/homepage/` | MISSING | STALE |
| `test:homepage:component` | `playwright-ct.config.ts` (exists) → testDir `./tests/component` MISSING | — | STALE |
| `test:e2e` | `playwright.config.ts` → testDir `app/components/features/basket/__tests__/e2e` (exists, 1 spec) | yes but narrow | KEEP (note: only runs basket e2e) |
| `test:performance` | `playwright.performance.config.ts` → `tests/e2e/performance` (3 specs) | yes | KEEP |
| `test:e2e:dev` / `test:e2e:android` / `test:e2e:iphone` / `test:e2e:api` | projects `desktop-chromium` / `android-pixel` / `iphone-legacy` / `api` | playwright.config.ts has only project `chromium` — all four MISSING | STALE |
| `test:checkout`, `test:checkout:all` | `tests/checkout/guest-checkout-inventory-reservation/` | MISSING | STALE |
| `test:checkout:quick` | `tests/checkout/quick-test.test.ts` + `playwright.checkout.config.ts` | test file MISSING | STALE |
| `test:checkout:fast` | `playwright.checkout.config.ts` → testDir `./tests/checkout` (exists) | yes | KEEP |
| `test:golden` | `tests/e2e/checkout/{guest,auth}/golden-path.spec.ts` | BOTH MISSING | STALE |
| `test:report` | `playwright show-report` | binary | KEEP |
| `test:homepage:regression` / `a11y` / `rwd` / `sections` | `tests/e2e/homepage/*.spec.ts` | ALL MISSING | STALE |
| `ts-check`, `ts-check:watch` | tsc | dep present | KEEP |
| `analyze` | `ANALYZE=true` + `@next/bundle-analyzer` in next.config | yes | KEEP |
| `typegen` | `sanity` CLI | dep present | KEEP |
| `commit` | `scripts/commit.sh` | exists | KEEP |

## Summary

- **REMOVE (deps, 20):** @googlemaps/addressvalidation, @hookform/resolvers, @libsql/client (transitive anyway), @paralleldrive/cuid2, @radix-ui/react-dialog, @radix-ui/react-popover, @radix-ui/react-slot, @upstash/redis, class-variance-authority, cmdk, groq-builder, lodash, next-safe-action, next-sanity-image, pino, pino-pretty, react-error-boundary, react-hook-form, react-intersection-observer, react-payment-icons, undici, use-debounce, critters. (23 incl. critters — recount: 23)
- **REMOVE (devDeps, 10):** @axe-core/playwright, @eslint/eslintrc, @lhci/cli, @playwright/experimental-ct-react, @svgr/webpack, @types/lodash, cross-env, cssnano, local-ssl-proxy, type-coverage.
- **UNSURE-HUMAN:** isomorphic-dompurify, vercel, @types/{babel__generator, babel__template, hast, json-schema, trusted-types, unist}.
- **STALE scripts (10):** test:integration(+watch), test:homepage:unit/component/regression/a11y/rwd/sections, test:e2e:dev/android/iphone/api, test:checkout(all/quick), test:golden.
- **README note:** "React Hook Form" in the stack list is false (zero imports) — consistent with it being a REMOVE.
- **Phantom dep:** `groq` imported but undeclared.

## Applied (Phase 2)

Removed from `package.json` dependencies: `@googlemaps/addressvalidation`, `@hookform/resolvers`, `@libsql/client`, `@paralleldrive/cuid2`, `@radix-ui/react-dialog`, `@radix-ui/react-popover`, `@radix-ui/react-slot`, `@upstash/redis`, `class-variance-authority`, `cmdk`, `critters`, `groq-builder`, `lodash`, `next-safe-action`, `next-sanity-image`, `pino`, `pino-pretty`, `react-error-boundary`, `react-hook-form`, `react-intersection-observer`, `react-payment-icons`, `undici`, `use-debounce`.

Removed from devDependencies: `@axe-core/playwright`, `@eslint/eslintrc`, `@lhci/cli`, `@playwright/experimental-ct-react`, `@svgr/webpack`, `@types/lodash`, `cross-env`, `cssnano`, `local-ssl-proxy`, `type-coverage`.

Removed stale scripts: `test:integration`, `test:integration:watch`, `test:homepage:unit`, `test:homepage:component`, `test:homepage:regression`, `test:homepage:a11y`, `test:homepage:rwd`, `test:homepage:sections`, `test:e2e:dev`, `test:e2e:android`, `test:e2e:iphone`, `test:e2e:api`, `test:checkout`, `test:checkout:all`, `test:checkout:quick`, `test:golden`. No script calls another removed script. `test:checkout:fast` kept (config + testDir exist).

Deleted: `lib/dev/redis-test.ts` (git rm) — zero importers (`git grep redis-test` → only the stale-docs audit report).

`README.md`: removed "React Hook Form" from State & Forms line (package removed, zero imports). Infrastructure line already correct on main (no Pino/Upstash).

## Skipped / UNSURE-HUMAN (untouched)

`isomorphic-dompurify`, `vercel`, `@types/babel__generator`, `@types/babel__template`, `@types/hast`, `@types/json-schema`, `@types/trusted-types`, `@types/unist` — see verdicts above. `vitest.integration.config.ts` and `playwright.checkout.config.ts` still exist but are now referenced by no script (integration config globs a deleted dir; checkout config is used by nothing after script removal except possibly CI) — flag for human.

## Human must do

1. `npm install` (or `npm install --package-lock-only`) to regenerate `package-lock.json` — it is now out of sync and would break `npm ci` on Vercel.
2. Then run a normal `tsc --noEmit` / `npm run build` / test pass locally — the absolute verification ban means this diff was never compiled.
3. Decide the UNSURE-HUMAN rows, decide whether to declare `groq` explicitly (currently a phantom transitive dep), and whether to delete `vitest.integration.config.ts` / `playwright.checkout.config.ts` / `playwright-ct.config.ts` alongside their now-removed scripts.
