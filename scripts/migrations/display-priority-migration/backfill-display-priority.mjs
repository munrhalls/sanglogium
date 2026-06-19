#!/usr/bin/env node

/**
 * Backfill `displayPriority` on curated products (Phase 4 / T4.3).
 *
 * WHY
 * ----
 * The default catalogue order ("Featured") sorts by
 * `coalesce(displayPriority, 0) desc, _createdAt desc` (see
 * `lib/catalogue/filterParams.ts` -> FEATURED_ORDER). Products without a
 * `displayPriority` are treated as 0 and fall back to "newest first", so the
 * feature is fully correct BEFORE this script ever runs. This migration only
 * exists to *promote* a curated subset of products above the default tier.
 *
 * SAFETY (this script is SPECIFIED, not yet run)
 * ----------------------------------------------
 *  - DRY-RUN BY DEFAULT. It prints the planned patches and writes nothing.
 *    Pass `--commit` to actually persist changes to Sanity.
 *  - It only ever sets the single `displayPriority` field; no other field is
 *    touched, and unlisted products are never modified.
 *  - Writes use a single transaction so the backfill is atomic.
 *
 * INPUT
 * -----
 * A curation map at `curated-display-priority.json` (sibling of this file).
 * Copy `curated-display-priority.example.json` to that name and edit it.
 * Shape: { "<product-slug>": <integer priority>, ... } where a HIGHER value
 * appears earlier in the Featured listing.
 *
 * USAGE
 * -----
 *   # Preview (writes nothing):
 *   node scripts/migrations/display-priority-migration/backfill-display-priority.mjs
 *
 *   # Apply for real:
 *   node scripts/migrations/display-priority-migration/backfill-display-priority.mjs --commit
 *
 * ENV (read from .env.local)
 * --------------------------
 *   NEXT_PUBLIC_SANITY_PROJECT_ID
 *   NEXT_PUBLIC_SANITY_DATASET (defaults to "production")
 *   SANITY_STUDIO_READ_WRITE  (verified write/create token; see Sanity token memory)
 */

import { createClient } from "@sanity/client";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COMMIT = process.argv.includes("--commit");
const MAP_PATH = path.join(__dirname, "curated-display-priority.json");

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2023-01-01",
  useCdn: false,
  token: process.env.SANITY_STUDIO_READ_WRITE,
});

async function loadCurationMap() {
  try {
    const raw = await fs.readFile(MAP_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    // Drop any documentation keys (prefixed with "_").
    const entries = Object.entries(parsed).filter(([k]) => !k.startsWith("_"));
    return entries;
  } catch (err) {
    if (err.code === "ENOENT") {
      console.error(
        `No curation map found at ${MAP_PATH}.\n` +
          `Copy curated-display-priority.example.json -> curated-display-priority.json and edit it.`
      );
      process.exit(1);
    }
    throw err;
  }
}

function validateEntries(entries) {
  const problems = [];
  for (const [slug, priority] of entries) {
    if (typeof priority !== "number" || !Number.isFinite(priority)) {
      problems.push(`"${slug}": priority must be a finite number (got ${JSON.stringify(priority)})`);
    }
  }
  if (problems.length) {
    console.error("Invalid curation map:\n  " + problems.join("\n  "));
    process.exit(1);
  }
}

async function main() {
  console.log(`displayPriority backfill — ${COMMIT ? "COMMIT" : "DRY-RUN (no writes)"}`);

  const entries = await loadCurationMap();
  validateEntries(entries);

  if (entries.length === 0) {
    console.log("Curation map is empty — nothing to do. (Featured order already works with unset values.)");
    return;
  }

  const slugs = entries.map(([slug]) => slug);
  // Resolve slugs -> document ids so we patch by stable _id.
  const docs = await client.fetch(
    `*[_type == "product" && slug.current in $slugs]{ _id, "slug": slug.current }`,
    { slugs }
  );
  const idBySlug = new Map(docs.map((d) => [d.slug, d._id]));

  const planned = [];
  const missing = [];
  for (const [slug, priority] of entries) {
    const id = idBySlug.get(slug);
    if (!id) {
      missing.push(slug);
      continue;
    }
    planned.push({ id, slug, priority });
  }

  console.log(`Planned updates (${planned.length}):`);
  for (const { slug, priority, id } of planned) {
    console.log(`  ${slug} (${id}) -> displayPriority = ${priority}`);
  }
  if (missing.length) {
    console.log(`\nSlugs with no matching product (skipped): ${missing.join(", ")}`);
  }

  if (!COMMIT) {
    console.log("\nDRY-RUN complete. Re-run with --commit to apply.");
    return;
  }

  const tx = client.transaction();
  for (const { id, priority } of planned) {
    tx.patch(id, (p) => p.set({ displayPriority: priority }));
  }
  await tx.commit();
  console.log(`\nCommitted ${planned.length} updates.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
