Task: normalize the main image of every product in the homepage In-Ear Monitors section, then patch the result into Sanity — following the exact standard and method already established and validated on two test products (Final Audio ZE8000, Sony WF-1000XM5).

Scope — read carefully, do not expand or guess:
- In scope: only the `image` field (the main/primary product image) of every product listed in the homepage's `iemsGallery` array, as queried in `sanity-cms/lib/homepage/getHomepageData.ts` (`HOMEPAGE_DATA_QUERY`, the `iemsGallery` section).
- Not in scope: the `gallery` field, any other product field, any other homepage section (Best Sellers, spotlights, DACs, accessories), and the `isTemporarilyVisible` flag / `hidden` logic in `IemCard.tsx`. Do not modify `IemCard.tsx` or any component file. This task only ever touches image assets and the `image` field reference on product documents.
- Note for context, not for action: `IemCard.tsx` currently hides every IEM product except ZE8000 and WF-1000XM5 via that flag. Normalize every product in `iemsGallery` regardless of whether it's currently hidden — do not use current visibility as a filter.

Standard already established — do not re-derive or change these numbers:
- Target fill ratio: 83% of the source image canvas's limiting side (product's bounding box, measured on the full original asset, not a cropped derivative).
- Margin evenness: opposite margins (left vs. right, top vs. bottom) within 2 percentage points of canvas size of each other.
- Centering: bounding-box center within 2% of canvas width/height from exact canvas center.
- Pass band: fill ratio 81-85%, margin evenness ≤2pp difference, centering ≤2% offset. All three must pass.

Measurement method — use exactly this, per image:
1. Load the full original image asset (fetch via its Sanity asset URL, not a resized/cropped delivery URL).
2. Build a foreground mask: if the image has an alpha channel, any pixel with alpha > 10 is foreground. If it does not have an alpha channel, sample the four corners for the background color and treat any pixel within a small color-distance tolerance of that sampled color as background, everything else as foreground.
3. Compute the bounding box of the foreground mask.
4. Fill ratio = max(bbox width, bbox height) / canvas's matching side x 100.
5. Margins = empty space outside the bbox on each side, as a percentage of that side's canvas dimension.
6. Center offset = abs(bbox center - canvas center) / canvas dimension x 100, for x and y separately.

Phase 1 — dry run, no writes, this is the actual deliverable of this run:
1. Run the `iemsGallery` query against Sanity (read-only) to get every product's `_id`, `name`, and `image.asset._id` / `image.asset.url`.
2. For each product's main image: measure it with the method above (this is its "before" state).
3. Compute a uniform scale factor = 83 / current fill ratio. Resize the product region by that factor, preserving proportions — do not stretch or distort it.
4. Composite the resized product onto a new transparent (or original-background-matched, if no alpha) canvas at the source image's original dimensions, centered exactly.
5. Save each result locally as a candidate file — do not upload anything to Sanity in this phase.
6. Re-measure every candidate with the same method (its "after" state).
7. Print one plain table: product name, before fill ratio, after fill ratio, margin evenness pass/fail, centering pass/fail, overall pass/fail. State plainly if any product fails — do not round up or call it close enough.
8. Stop here. Do not proceed to Phase 2 in the same run. Phase 1's output is the report — nothing else happens until it's reviewed.

Phase 2 — writes, only run after the Phase 1 report has been explicitly reviewed and confirmed, and only for products that passed:
1. Before any write, save a fresh backup of the affected product documents (`_id`, current `image` field) to a timestamped JSON file, following this repository's existing backup convention (see `sanity-cms/backups/`).
2. For each passing product only: upload its normalized candidate image as a new Sanity asset, then patch that product document's `image` field to reference the new asset. Do not touch any other field on the document.
3. Log a mapping of old asset ID to new asset ID per product, for rollback if needed.
4. Skip any product that did not pass Phase 1 — do not write a partial or "close enough" result for it. Report it as skipped, with its measured numbers, so it can be handled separately.
5. After writing, re-fetch each patched product from Sanity and confirm the `image.asset._id` now matches the new asset — print a final confirmation table.

Constraints:
- Use Node.js with the `sharp` library, already a dependency of this repository. Do not install any new package.
- Use the existing `SANITY_API_TOKEN` (write) and `SANITY_API_READ_TOKEN` from `.env` — do not hardcode credentials, do not create new ones.
- Write this as standalone script file(s) under `sanity-cms/utils/`, following the existing pattern in `sanity-cms/utils/migrations/` (dry run script separate from the phased-write script, matching how `migrateDryRun.mjs` / `PRODUCTION_migratePhased.mjs` / `verifyFidelity.mjs` are split there). Do not use `$()` or backticks in any terminal command, per this repository's CLAUDE.md.
- Do not run `npm install`, `npm run build`, `npm run dev`, or any lint/typecheck command.
- Do not modify any file outside the new script(s) in `sanity-cms/utils/` and the local candidate image files this task produces.
- When Phase 1 finishes, report only: the script location, the full per-product pass/fail table, and a one-line count (e.g. "9 of 12 passed"). Do not proceed further and do not summarize with unwarranted confidence — if something is uncertain (e.g. an image with no alpha channel and an ambiguous background), say so plainly in the report rather than guessing.
