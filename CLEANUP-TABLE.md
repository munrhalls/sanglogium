# Repository Cleanup Table

**Audited:** 2026-08-14  
**Purpose:** A conservative, itemized to-do list of artifacts that look temporary, ephemeral, or transient and should be reviewed once the current work streams are finished.  
**Rule:** Do not delete, move, or modify anything until the related task is confirmed complete. The `Suggested disposition` column is a recommendation, not a command.

---

## 1. Root-level temporary scripts / one-off tools

| # | Item | Path | Git status | Why it needs cleanup | Suggested disposition |
|---|------|------|------------|----------------------|----------------------|
| 1 | `build-list.cjs` | `./build-list.cjs` | untracked | Builds product meta list for the batch image-normalization pipeline. Hardcodes `uniformizing-product-images-edge-to-content-dimensions`. | Delete after batch normalization is verified; or archive under `scripts/image-normalization/` if reused. |
| 2 | `force-patch.cjs` | `./force-patch.cjs` | untracked | Force-uploads a single normalized image for one product directory. | Delete after any re-patching is done; or merge into a reusable migration helper. |
| 3 | `normalize.cjs` | `./normalize.cjs` | untracked | Shared image-normalization logic (Sharp) used by `run.cjs`. Living at root as a helper. | Move to `lib/image/` or `scripts/image-normalization/` if needed long-term; otherwise delete. |
| 4 | `run.cjs` | `./run.cjs` | untracked | End-to-end batch pipeline: download → normalize → upload → patch. | Delete after the full batch is verified; or archive as a migration script. |
| 5 | `verify-patch.cjs` | `./verify-patch.cjs` | untracked | Verifies that patched product `image.asset` references match the local `meta.json` records. | Delete after QA pass; or keep as a one-off verification script. |
| 6 | `upload-pi7s2.js` | `./upload-pi7s2.js` | untracked | One-off upload of `image-task/normalized/pi7-s2-normalized.png` to the Pi7 S2 product. | Delete after the Pi7 S2 image is confirmed live in Sanity. |
| 7 | `screenshot-sections.cjs` | `./screenshot-sections.cjs` | untracked | Playwright script that captures homepage section screenshots into `_project/screenshots`. | Delete after visual QA; or move to `scripts/qa/`. |
| 8 | `search-image.cjs` | `./search-image.cjs` | tracked (orphaned) | Recursively greps `.ts`/`.tsx` files for `imageUrl`; not referenced anywhere. | Delete after migration analysis; or move to `scripts/qa` if still useful. |
| 9 | `git-author-stats.mjs` | `./git-author-stats.mjs` | tracked (orphaned) | Git author line/commit statistics; not referenced by scripts or docs. | Delete after analysis; or move to `.devin/reporting/` if retained. |
| 10 | `git-feature-stats.mjs` | `./git-feature-stats.mjs` | tracked (orphaned) | Git feature/author statistics; not referenced anywhere. | Delete after analysis; or move to `.devin/reporting/` if retained. |
| 11 | `watchdog-ls.ps1` | `./watchdog-ls.ps1` | tracked | Local PowerShell watchdog for Windsurf language server memory; not referenced by project code. | Keep outside repo, or move to `.devin/ide/`; delete from root if not team-shared. |

---

## 2. Root-level logs and runtime state files

| # | Item | Path | Git status | Why it needs cleanup | Suggested disposition |
|---|------|------|------------|----------------------|----------------------|
| 12 | `build.log` | `./build.log` | ignored (`build.log` in `.gitignore`) | Build log from a failed `npm run build` run. | Delete; it is ignored and reproducible. |
| 13 | `next-build.log` | `./next-build.log` | untracked | Build log from a `next build` run. | Delete; it is not tracked and reproducible. |
| 14 | `cookie_jar.txt` | `./cookie_jar.txt` | ignored (`cookie_jar.txt` in `.gitignore`) | Netscape cookie file containing a `checkout_session` value. | Delete once session/checkout testing is finished. |
| 15 | `better-auth.db` | `./better-auth.db` | ignored (`*.db` in `.gitignore`) | Local SQLite database for better-auth dev state. | Keep if local user accounts matter; otherwise delete and let it regenerate. |
| 16 | `tsconfig.tsbuildinfo` | `./tsconfig.tsbuildinfo` | ignored (`*.tsbuildinfo` in `.gitignore`) | TypeScript incremental build cache. | Delete; it regenerates on build and is already ignored. |
| 17 | `package.json.cache-poisoned` | `./package.json.cache-poisoned` | untracked, 0 bytes | Empty marker/debug artifact from cache-poisoning investigation. | Delete. |
| 18 | `.sync-test.txt` | `./.sync-test.txt` | untracked | One-line sync-test marker (`sync-test-17-30`). | Delete after the sync test is validated. |

---

## 3. Temporary test pages and public assets

| # | Item | Path | Git status | Why it needs cleanup | Suggested disposition |
|---|------|------|------------|----------------------|----------------------|
| 19 | `NormalizationPage` | `app/(store)/normalization/page.tsx` | untracked | Temporary visual QA route that overrides product images with local `public/normalization-main-images` and appends `?v=Date.now()`. | Delete after normalization QA; or move to `app/(test)/` if retained. |
| 20 | `scenario-happyPath.js` | `public/scenario-happyPath.js` | tracked (orphaned) | Auto-generated browser scenario helper for checkout happy-path testing; not imported anywhere. | Delete if the test scenario is no longer active; or move to `public/scenarios/`. |
| 21 | `public/normalization-main-images/` | `public/normalization-main-images/` | untracked | 17 PNG copies of product main images used only by `app/(store)/normalization`. | Delete after QA; or rename/move to `public/images/` if they are meant for production. |

---

## 4. Image-normalization work directories

| # | Item | Path | Git status | Why it needs cleanup | Suggested disposition |
|---|------|------|------------|----------------------|----------------------|
| 22 | `image-task/` | `./image-task/` | untracked | Empty `raw/` and `normalized/` directories; staging area for the one-off Pi7 S2 image upload. | Delete if empty and the task is complete. |
| 23 | `normalize-just-two-images/` | `./normalize-just-two-images/` | untracked | Prototype scripts and images for two products (Final Audio ZE8000, Sony WF-1000XM5) plus markdown prompts and a fill-ratio prompt. | Archive the algorithm/standard docs to `docs/` or `research/` if valuable; otherwise delete or move to `scripts/image-normalization/`. |
| 24 | `uniformizing-product-images-edge-to-content-dimensions/` | `./uniformizing-product-images-edge-to-content-dimensions/` | untracked | Large batch working directory: 16 `iems/` + 291 `accessories/` product subdirectories, each with `meta.json`, `original.png`, `normalized.png` (and `pi7-s2-original.png` at root). | Delete after all patches are verified and assets are live in Sanity; or compress-archive. |
| 25 | `temp-spotlight-images/` | `./temp-spotlight-images/` | ignored (`temp-spotlight-images/` in `.gitignore`) | 13 temporary spotlight/gallery images. | Delete; or move to `public/images/` if they are intended for production. |

---

## 5. Sanity backups and migration scripts

| # | Item | Path | Git status | Why it needs cleanup | Suggested disposition |
|---|------|------|------------|----------------------|----------------------|
| 26 | `asset_mapping_accessories_2026-08-12T21-01-37-079Z.json` | `sanity-cms/backups/asset_mapping_accessories_2026-08-12T21-01-37-079Z.json` | untracked | Asset-mapping backup generated during current normalization work. | Delete or archive after migration is complete. |
| 27 | `asset_mapping_iemsGallery_2026-08-12T19-23-21-567Z.json` | `sanity-cms/backups/asset_mapping_iemsGallery_2026-08-12T19-23-21-567Z.json` | untracked | Asset-mapping backup generated during current normalization work. | Delete or archive after migration is complete. |
| 28 | `asset_mapping_iemsGallery_2026-08-14T08-34-37-929Z.json` | `sanity-cms/backups/asset_mapping_iemsGallery_2026-08-14T08-34-37-929Z.json` | untracked | Asset-mapping backup generated during current normalization work. | Delete or archive after migration is complete. |
| 29 | `backup_iemsGallery_2026-08-14T08-34-37-929Z.json` | `sanity-cms/backups/backup_iemsGallery_2026-08-14T08-34-37-929Z.json` | untracked | iemsGallery backup generated during current normalization work. | Delete or archive after migration is complete. |
| 30 | `normalizeIemImages/` migration dir | `sanity-cms/utils/migrations/normalizeIemImages/` | untracked | Ad-hoc migration scripts and `candidates/` directory for IEM image normalization. | Delete or archive to `scripts/image-normalization/` after the migration is verified. |
| 31 | `normalizeAccessoryImages/` migration dir | `sanity-cms/utils/migrations/normalizeAccessoryImages/` | untracked | Ad-hoc migration scripts and `candidates/` directory for accessory image normalization. | Delete or archive to `scripts/image-normalization/` after the migration is verified. |

---

## 6. QA screenshots and planning outputs

| # | Item | Path | Git status | Why it needs cleanup | Suggested disposition |
|---|------|------|------------|----------------------|----------------------|
| 32 | `homepage-accessories-after-normalize.png` | `_project/screenshots/homepage-accessories-after-normalize.png` | untracked | Homepage accessories section QA screenshot produced by `screenshot-sections.cjs`. | Delete or archive after visual QA. |
| 33 | `homepage-after-normalize.png` | `_project/screenshots/homepage-after-normalize.png` | untracked | Full homepage QA screenshot produced by `screenshot-sections.cjs`. | Delete or archive after visual QA. |
| 34 | `homepage-iems-after-normalize.png` | `_project/screenshots/homepage-iems-after-normalize.png` | untracked | Homepage IEMs section QA screenshot produced by `screenshot-sections.cjs`. | Delete or archive after visual QA. |
| 35 | `_project/planning-docs/` | `_project/planning-docs/` | untracked | Contains 5 planning/code-record markdowns (`accessories-tasks.md`, `catalogue-code-record.md`, `design-system-page-execution.md`, `orchestration-plan.md`, `vibe-challenges-4-6-08.md`) that appear to have been moved from the root (git shows the old root copies as deleted and these as untracked). | Review each file; stage in git under `_project/`, move to `docs/`, or delete if stale. Note: `catalogue-code-record.md` is ~554 KB — consider whether it should be committed or archived externally. |

---

## 7. Standard generated / ignored directories (not task-specific, but present at root)

These are `.gitignored` and can be removed in bulk with `git clean -fdX` (or manually) if you want a clean root. They are not directly tied to the current temporary work.

| # | Item | Path | Git status | Why it needs cleanup | Suggested disposition |
|---|------|------|------------|----------------------|----------------------|
| A | Next.js build output | `.next/` | ignored | Auto-generated build cache. | Delete; regenerates on build. |
| B | Lighthouse CI artifacts | `.lighthouseci/` | ignored | Lighthouse CI output. | Delete. |
| C | Vercel local folder | `.vercel/` | ignored | Vercel CLI state. | Delete. |
| D | Clerk local config | `.clerk/` | ignored | Clerk local dev files. | Delete if not needed. |
| E | Claude local config | `.claude/` | ignored | Claude IDE settings. | Delete if not needed. |
| F | Windsurf local config | `.windsurf/` | ignored | Windsurf IDE settings. | Delete if not needed. |
| G | Node modules | `node_modules/` | ignored | Installed dependencies. | Delete; reinstall with `npm install` if needed. |
| H | Playwright test results | `test-results/` | ignored | Playwright test output. | Delete. |
| I | Playwright report | `playwright-report/` | ignored | Playwright HTML report. | Delete. |
| J | Empty `data/` directory | `data/` | ignored/empty | Build output directory (`.gitignore` covers `data/catalogue-index.json`). | Delete if it stays empty. |
| K | Empty `scripts/output/` | `scripts/output/` | ignored | Photography audit output dir; currently empty. | Delete if no longer used. |

---

## 8. Addendum — discovered after initial audit

| # | Item | Path | Git status | Why it needs cleanup | Suggested disposition |
|---|------|------|------------|----------------------|----------------------|
| 36 | `normalize-accessories-images/` | `./normalize-accessories-images/` | untracked | Additional image-normalization work dir with `fetchMainImages.mjs`, `probe.mjs`, `test.mjs`, `main-images/` (64 PNGs), and it writes 21 PNGs to `public/normalize-accessories-images/`. Overlaps with accessory normalization work. | Delete or merge into `scripts/image-normalization/` after the accessory normalization task is finished. |
| 37 | `public/normalize-accessories-images/` | `public/normalize-accessories-images/` | untracked | 21 PNG copies of accessory product images generated by `normalize-accessories-images/fetchMainImages.mjs`. | Delete after QA; or move to `public/images/` if intended for production. |

---

## Verification done before creating this table

- Listed root directory contents with `list_dir`.
- Ran `git status --short` to identify untracked and deleted files.
- Read the contents of each root-level `.cjs`/`.mjs`/`.js`/`.ps1` file to determine purpose.
- Listed subdirectories (`image-task/`, `normalize-just-two-images/`, `normalize-accessories-images/`, `uniformizing-product-images-edge-to-content-dimensions/`, `temp-spotlight-images/`, `app/(store)/normalization/`, `public/normalization-main-images/`, `public/normalize-accessories-images/`, `sanity-cms/backups/`, `sanity-cms/utils/migrations/`, `_project/planning-docs/`, `_project/screenshots/`).
- Verified `public/scenario-happyPath.js`, `watchdog-ls.ps1`, `git-author-stats.mjs`, `git-feature-stats.mjs`, and `search-image.cjs` have no call sites in the codebase.
- Checked `.gitignore` to confirm ignored items.
- **Did not delete, move, or modify any files.**
