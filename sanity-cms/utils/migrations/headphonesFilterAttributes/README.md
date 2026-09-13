# Headphones filterAttributes patch tooling

Shared by every `sang-logium-1xs.9.*` brand-sourcing issue. Built for
`sang-logium-1xs.9.2` (Sennheiser); every other brand issue reuses it
unchanged.

Writes go to the `production` Sanity dataset directly — there is no staging
dataset in this project. Always dry-run before `--write`.

## If you're a different agent working a different product/issue

1. Do not edit `engine.mjs` or `runPatch.mjs`. They're shared — a change here
   affects every other brand's in-flight patch.
2. Copy `products/_template.mjs` to `products/<your-product-slug>.mjs`.
3. Fill in `productId` (from your issue's PRODUCTS IN SCOPE list), and the
   `filterAttributes` / `sourcing` values from your own sourcing doc
   (`docs/filters-sort/sourced-headphones-<brand>.md`). Field names and
   vocab must match `sanity-cms/schemaTypes/productType.ts`.
4. From `sanity-cms/utils/migrations/headphonesFilterAttributes/`, run:
   ```bash
   node runPatch.mjs products/<your-product-slug>.mjs
   ```
   This is a dry run — no writes. It prints a field-by-field diff (current
   Sanity value → your new value) and a name-mismatch check against
   `productId`. Read it before doing anything else.
5. Once the diff looks right, run:
   ```bash
   node runPatch.mjs products/<your-product-slug>.mjs --write
   ```
   This backs up the product's prior `filterAttributes` to
   `sanity-cms/backups/backup_headphones_<productId>_<timestamp>.json`, then
   patches. `sourcing` entries merge by `field` name (a re-run replaces only
   the fields you're re-citing, not the whole array).
6. One product per file, one write per product. Don't batch multiple
   products into a single spec file, even if your issue covers several —
   run the CLI once per product so each has its own dry-run/patch/backup
   trail.

## Conventions this tooling assumes

- `docs/filters-sort/sourcing-protocol-headphones.md` (amended 2026-09-13):
  manufacturer-source conflicts resolve by recency (no flag-for-human
  needed); boolean "would-advertise-if-present" feature fields (microphone,
  foldable, etc.) read `false` on manufacturer silence, not `null`.
- No second independent-verification pass is required before patching (see
  the 2026-09-13 note on your brand issue) — sourcing and patching happen in
  one pass per product.
- Requires the project root `.env.local`'s `SANITY_API_READ_TOKEN` (dry run)
  and `SANITY_STUDIO_READ_WRITE` (`--write`) — loaded via this folder's own
  `getClient.mjs`, mirroring `normalizeIemImages/getClient.mjs`'s proven
  token split rather than the top-level `sanity-cms/utils/getClient.mjs`
  (which expects `SANITY_STUDIO_READ_WRITE_CREATE`, not set in this project).
