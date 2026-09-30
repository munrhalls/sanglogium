# Prune T2 Audit — One-off Scripts, Migrations, Image Dirs

Date: 2026-09-30. Branch: prune (off main e7e97c23). Read-only; only this report created. No script under `scripts/` or `sanity-cms/` was executed.
Inbound-ref method: `git grep -n "<name>"` across the repo, excluding the file itself and `package-lock.json`. Refs that only come from `_project/` plans/reports or doc artifacts (`.lavish/`) are quoted but do not count as live inbound refs.

## A. `scripts/` one-offs and folders

| Path | Tracked | Size | Last commit | Inbound refs (quoted) | Job | Verdict | Reason |
|---|---|---|---|---|---|---|---|
| `scripts/delete-two-products.mjs` | yes | 4K | 2026-08-01 "add sanity product update and verification scripts" | only `_project/reports/product-photography-fill-ratio-DEVIN-PLAN.md:101` (plan mention) | One-off: delete 2 products in **production** Sanity | UNSURE-HUMAN | 0 live inbound refs, one-off by name — but writes prod Sanity; deletion can't be proven complete without querying prod |
| `scripts/verify-deleted-two-products.mjs` | yes | 4K | 2026-08-01 same | none | Companion verification of the above | UNSURE-HUMAN | Follows the script it verifies |
| `scripts/update-hero-copy.mjs` | yes | 4K | 2026-08-16 "Key ASAP system-aligned fixes" | none | Header: "One-off: update the live Sanity `hero` document copy" | UNSURE-HUMAN | 0 inbound refs, one-off by header, writes prod Sanity, no completion proof |
| `scripts/update-homepage-accessories.mjs` | yes | 4K | 2026-08-01 same | self only (`Usage:` line) | Update homepage accessories data in Sanity | UNSURE-HUMAN | Prod-Sanity write, no completion proof |
| `scripts/update-homepage-accessories.ts` | yes | 4K | 2026-08-01 same | none | TS twin of the above (uses `sanity-cms/lib/backendClient`) | UNSURE-HUMAN | Same as above |
| `scripts/update-newest-release-copy.mjs` | yes | 4K | 2026-08-03 "newest-release promo copy maintenance scripts" | self only | One-off copy update, prod Sanity | UNSURE-HUMAN | Prod write, no completion proof |
| `scripts/update-newest-release-subtitle.mjs` | yes | 4K | 2026-08-03 same | self only | Same family | UNSURE-HUMAN | Prod write, no completion proof |
| `scripts/verify-and-fix-newest-release-copy.mjs` | yes | 8K | 2026-08-03 same | self only | Same family | UNSURE-HUMAN | Prod write, no completion proof |
| `scripts/fetch-hifi-rose-product-map.mjs` | yes | 4K | 2026-09-14 "source and sync additional accessory/headphone/audio-electronics specs" | none | Read-only Sanity fetch → product map (sourcing aid) | DELETE | 0 inbound refs, one-off by name, read-only (no prod-write risk) |
| `scripts/photography-fill-ratio-audit.mjs` | yes | 16K | 2026-08-06 "add product photography fill-ratio audit tool" | `_project/reports/product-photography-fill-ratio-DEVIN-PLAN.md:115,181` (plan only) | Fill-ratio measurement audit, writes to ignored `audit-out` | DELETE | 0 live inbound refs, one-off audit tool |
| `scripts/spotlight-ux-audit.cjs` | yes | 8K | 2026-08-16 "Key ASAP system-aligned fixes" | none | Playwright page-render audit of product-spotlight copy box | DELETE | 0 inbound refs, one-off UX audit |
| `scripts/spotlight-verify.cjs` | yes | 4K | 2026-08-16 same | none | Lean re-run of the same audit | DELETE | 0 inbound refs, one-off |
| `scripts/mobile-ux-measure.cjs` | yes | 8K | 2026-08-16 same | none | One-shot mobile measurement of homepage sections | DELETE | 0 inbound refs, one-off measurement |
| `scripts/fullpage.js` | yes | 0K (empty) | 2026-08-16 "mass commit - checked, failsafe" | none | Empty file | DELETE | 0 inbound refs, zero bytes |
| `scripts/cline-agent-helpers.ps1` | yes | 12K | 2026-08-16 same | self only | Cline-agent helper functions (PowerShell) | UNSURE-HUMAN | 0 inbound refs; agent tooling, not provably one-off; repo now on Linux |
| `scripts/dev.ps1` | yes | 4K | 2026-08-18 | none | Windows dev-launcher for "Sang-logium Dev.lnk" desktop shortcut | UNSURE-HUMAN | 0 repo refs but wired to a desktop shortcut outside the repo — human decision |
| `scripts/devctl.sh` | yes | 4K | 2026-09-29 "devctl script" | `.lavish/dev-server-wedge.html` doc artifact only (suggests shell aliases `dr`, `drc`, `drw`) | Dev-server restart/watch helper | UNSURE-HUMAN | Recent (yesterday); likely the human's live tooling despite no code refs |
| `scripts/agent-ops/` (build-lock, config, resource-health, services `.ps1`) | yes | 20K | 2026-08-18 "lean. deleting all fat." | `AGENTS.md:18` (`build-lock.ps1 acquire -Owner <name>`), `AGENTS.md:61` (`resource-health.ps1`) | Build-token lock + resource health tooling | KEEP | Referenced by live repo rules in AGENTS.md |
| `scripts/catalogue-integrity/` (7 `.mjs`) | yes | 44K | 2026-09-29 "Catalogue integrity: zero non-belonging products per slice, with proof" | `_project/catalogue-integrity/PROOF.md:46`; writes `_project/catalogue-integrity/*.json` | Active campaign tooling (audit/classify/apply/rollback/verify) | KEEP | Referenced by active `_project/catalogue-integrity/` campaign, committed yesterday |
| `scripts/commit.sh` | yes | 8K | 2026-09-18 | `package.json:30` `"commit": "bash scripts/commit.sh"` | Interactive commit protocol CLI | KEEP | Live `npm run commit` entry |
| `scripts/build-catalogue-index.mjs` | yes | 12K | 2026-06-19 | `package.json:11` `"prebuild": "node scripts/build-catalogue-index.mjs"` | Build-time catalogue VFS materialization | KEEP | Runs on every `next build` via `prebuild` |

## B. `sanity-cms/` migrations, update/, upload/

| Path | Tracked | Size | Last commit | Inbound refs (quoted) | Job | Verdict | Reason |
|---|---|---|---|---|---|---|---|
| `sanity-cms/utils/migrations/productCategoriesToCatalogueLocationKeys/` (11 files) | yes | 64K | 2026-05-08 "Add new CMS directory structure" | none | Migrate product categories → `catalogueLocationKeys` (header: mapping dict + `PRODUCTION_migratePhased.mjs`) | DELETE | Completion proven: `catalogueLocationKeys` is the live schema field (`sanity-cms/schemaTypes/productType.ts`) read by `app/(store)/product/[slug]/page.tsx:23` and all filter-sort queries; last commit ~5 months ago |
| `sanity-cms/utils/migrations/normalizeAccessoryImages/` (incl. `candidates/` 287 files) | yes | 156 MB | 2026-08-16 "mass commit - checked, failsafe" | none outside itself (imports `normalizeIemImages` helpers) | Phased prod-Sanity image normalization patch + `candidates/` normalized renders | UNSURE-HUMAN | Writes prod Sanity; no in-repo proof the patch ran (no completion report found). `candidates/` (287 files, ~156 MB) follows this verdict per rule |
| `sanity-cms/utils/migrations/normalizeIemImages/` (incl. `candidates/` 14 files, `contact-sheet.png`) | yes | 6.8 MB | 2026-08-16 same | referenced by `normalizeAccessoryImages/*` (sibling migration) only | Same pipeline for IEMs | UNSURE-HUMAN | Same as above — prod writer, completion unproven |
| `sanity-cms/utils/migrations/sliceFacetNormalization/` (`accessories.mjs`, `audioElectronics.mjs`, `getClient.mjs`) | yes | 28K | **2026-09-30 (today)** "applied headphones migrations, and CMS patch supervisor" | none (self-contained) | Normalize `filterAttributes` per slice in prod; backups to `sanity-cms/backups/` | UNSURE-HUMAN | Committed today — in-flight migration, headphones done but accessories may still be pending |
| `sanity-cms/update/` (`update.mjs`, `updateCategoriesOnly.mjs`, `updateCategoryPathsFromInsideScript.mjs`, `updateProducts.json`, `updateProducts_updated.json`) | yes | 236K | 2026-05-08 "Add new CMS directory structure" | none | Legacy product-update seed scripts + data JSON | DELETE | 0 inbound refs, one-off seed tooling superseded ~5 months ago |
| `sanity-cms/upload/` (`upload.mjs`, `transform.mjs`, `sanityProducts.json`) | yes | 332K | 2026-05-08 same | none | Legacy initial-upload scripts + `sanityProducts.json` | DELETE | 0 inbound refs, one-off initial-import tooling |

## C. `public/` image dirs and test helpers

| Path | Tracked | Size | Last commit | Inbound refs (quoted) | Job | Verdict | Reason |
|---|---|---|---|---|---|---|---|
| `public/normalize-accessories-images/` (200 files) | yes | 98 MB | 2026-08-16 | `app/(store)/normalize-accessories-section/page.tsx:27,40,63` — live route builds `/normalize-accessories-images/...` URLs and reads `flagged-map.json` | Original images for the dev-only normalization preview page | KEEP | Referenced by live code path (page degrades gracefully without the map, but the dir is its image source) |
| `public/normalization-main-images/` (32 files) | yes | 14 MB | 2026-08-16 | only from the migration scripts themselves (`generateCandidatesV4.mjs:62`, `fixPi7S2Only.mjs:16`, `generateManualFillRatios.mjs:52`, `measureCurrentFillRatios.mjs:11`) — "for live visual review" | IEM normalization candidates for visual review | DELETE | 0 live-code refs; review images no longer needed once migration verdict lands. 14 of 32 stems duplicated in `normalizeIemImages/candidates/` |
| `public/ui-test-helpers.js` | yes | 4K | 2026-04-08 | none (`window.uiTestHelpers`, manual console helper) | Manual test helpers for basket UI | DELETE | 0 inbound refs; no Playwright/vitest config or test loads it |
| `public/test-mock.js` | yes | 4K | 2026-04-08 | none (`window.mockValidateBasket`) | Manual checkout mock | DELETE | 0 inbound refs; nothing loads it |
| `public/scenario-happyPath.js` | yes | 4K | 2026-04-08 | none (`window.scenarioProducts`, scenario id `test-happyPath-1775540822382`) | Generated browser scenario fixture | DELETE | 0 inbound refs; auto-generated one-off |

### C. duplication detail
- `public/normalize-accessories-images` vs `normalizeAccessoryImages/candidates/`: 195 of 198 public stems also present in candidates (candidates are the `-normalized.png` renders of the same products; byte content differs).
- `public/normalization-main-images` vs `normalizeIemImages/candidates/`: all 14 candidate stems appear among the 32 public files (~14 MB total dir).

## Totals

| Verdict | Paths | Files (approx.) | Size |
|---|---|---|---|
| KEEP | 5 (`commit.sh`, `build-catalogue-index.mjs`, `agent-ops/`, `catalogue-integrity/`, `public/normalize-accessories-images/`) | ~212 | ~98 MB |
| DELETE | 12 (6 scripts, `productCategoriesToCatalogueLocationKeys/`, `sanity-cms/update/`, `sanity-cms/upload/`, `public/normalization-main-images/`, 3 `public/*.js`) | ~60 | ~14.7 MB |
| UNSURE-HUMAN | 14 (8 prod-Sanity copy/delete scripts, `cline-agent-helpers.ps1`, `dev.ps1`, `devctl.sh`, 3 migrations incl. `sliceFacetNormalization`) | ~315 (incl. 301 candidate images) | ~163 MB |

Notes for the human:
- The UNSURE-HUMAN bucket is dominated by `normalizeAccessoryImages/candidates/` (~156 MB tracked renders). If the accessories image migration is confirmed applied, that dir alone is most of the reclaimable space.
- `dev.ps1`/`devctl.sh`/`cline-agent-helpers.ps1` have zero repo refs but are dev-environment tooling (desktop shortcut, shell aliases) — your call.
- All eight homepage-copy/product-delete scripts write to production Sanity; repo evidence cannot prove the writes landed.

---

## Applied (2026-09-30, branch `prune`)

Deletions staged via `git rm`; re-grep before each confirmed no new live inbound refs.

| Path | Files | Freed (working tree) |
|---|---|---|
| `scripts/fetch-hifi-rose-product-map.mjs` | 1 | 4K |
| `scripts/photography-fill-ratio-audit.mjs` | 1 | 16K |
| `scripts/spotlight-ux-audit.cjs` | 1 | 8K |
| `scripts/spotlight-verify.cjs` | 1 | 4K |
| `scripts/mobile-ux-measure.cjs` | 1 | 8K |
| `scripts/fullpage.js` (empty) | 1 | 0K |
| `sanity-cms/utils/migrations/productCategoriesToCatalogueLocationKeys/` | 12 | 64K |
| `sanity-cms/update/` | 5 | 236K |
| `sanity-cms/upload/` | 3 | 332K |
| `public/normalization-main-images/` | 32 | 14.1 MB |
| `public/ui-test-helpers.js`, `test-mock.js`, `scenario-happyPath.js` | 3 | 12K |
| **Total** | **61** | **~14.8 MB** |

Dangling-ref check after deletion: `git grep` for every deleted name across `package.json`, `AGENTS.md`, `CLAUDE.md`, `tests/`, `app/`, `lib/`, `store/`, `next.config.ts`, `sanity.config.ts` → **0 matches**. Nothing restored.

Known soft note: the kept `normalizeIemImages` migration scripts still contain `OUTPUT_DIR = .../public/normalization-main-images` constants — dead output paths in UNSURE-HUMAN code, not live references; they recreate the dir if ever re-run.

## Skipped / UNSURE-HUMAN — one question each

1. `scripts/delete-two-products.mjs` + `verify-deleted-two-products.mjs` — were the two products actually deleted in prod, so both scripts can go?
2. `scripts/update-hero-copy.mjs` — did the hero copy update land in prod?
3. `scripts/update-homepage-accessories.mjs` + `.ts` twin — did the homepage accessories update land?
4. `scripts/update-newest-release-copy.mjs`, `-subtitle.mjs`, `verify-and-fix-newest-release-copy.mjs` — is the newest-release copy final in prod?
5. `scripts/cline-agent-helpers.ps1` — do you still source this in any Cline/agent setup?
6. `scripts/dev.ps1` — is the "Sang-logium Dev.lnk" Windows shortcut still in use (repo is on Linux now)?
7. `scripts/devctl.sh` — do you use the `dr`/`drc`/`drw` aliases from `.lavish/dev-server-wedge.html`?
8. `sanity-cms/utils/migrations/normalizeAccessoryImages/` (~156 MB incl. 287 `candidates/` renders) — did `PRODUCTION_patchPhased.mjs` finish applying to prod?
9. `sanity-cms/utils/migrations/normalizeIemImages/` (~6.8 MB) — did the IEM patch + `fixPi7S2Only` finish applying to prod?
10. `sanity-cms/utils/migrations/sliceFacetNormalization/` — committed today; is the accessories slice `--write` still pending?
