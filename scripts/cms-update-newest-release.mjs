/**
 * CMS Copy Update — newestReleaseData within homepageData singleton
 * Target: _id = "homepageData" (hardcoded, no dynamic input accepted)
 * Mutates only: newestReleaseData.promoTitle, .promoSubtitle, .promoText
 *
 * Copy rationale:
 *   promoTitle   → single factual claim at display-1 size; no dramatic fragments
 *   promoSubtitle → two crisp facts; replaces verbose "Grammy-winning lineage" copy
 *   promoText     → body field (not yet rendered); factual, no hyperbole
 */
import { createClient } from "@sanity/client";
import dotenv from "dotenv";

dotenv.config();

const TARGET_ID = "homepageData"; // homepageData singleton — hardcoded, immutable

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-11-14";
const token = process.env.SANITY_STUDIO_READ_WRITE;

if (!projectId || !token) {
  console.error("[ABORT] Missing required env vars.");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token,
});

// ─── STEP 0: Dry-Run Fetch ──────────────────────────────────────────────
async function dryRun() {
  console.log("=== DRY-RUN: Fetching current newestReleaseData ===\n");
  const doc = await client.fetch(
    `*[_id == $id][0].newestReleaseData`,
    { id: TARGET_ID }
  );
  if (!doc) {
    console.error(`[ABORT] Document _id="${TARGET_ID}" not found.`);
    process.exit(1);
  }
  console.log("BEFORE STATE:");
  console.log(JSON.stringify(doc, null, 2));
  console.log("\n");
  return doc;
}

// ─── STEP 1-3: Patch + Verify ─────────────────────────────────────────
async function patchField(path, value, stepLabel) {
  console.log(`--- ${stepLabel} ---`);
  console.log(`Path: ${path}`);
  console.log(`Value: ${value.substring ? value.substring(0, 60) + (value.length > 60 ? "..." : "") : value}\n`);

  try {
    const result = await client
      .patch(TARGET_ID)
      .set({ [path]: value })
      .commit({ returnDocuments: true });

    console.log(`[COMMIT OK] _id: ${result._id}, _rev: ${result._rev}`);
  } catch (err) {
    console.error(`[COMMIT FAILED] ${err.message}`);
    process.exit(1);
  }

  // Immediate verification fetch
  try {
    const verified = await client.fetch(
      `*[_id == $id][0].newestReleaseData{"${path.split(".")[1]}": ${path.split(".")[1]}}`,
      { id: TARGET_ID }
    );
    const fetchedValue = verified?.[path.split(".")[1]];
    if (fetchedValue === value) {
      console.log(`[VERIFY OK] Field matches expected value.\n`);
    } else {
      console.error(`[VERIFY FAIL] Expected: "${value}" | Got: "${fetchedValue}"`);
      process.exit(1);
    }
  } catch (err) {
    console.error(`[VERIFY FETCH FAILED] ${err.message}`);
    process.exit(1);
  }
}

// ─── STEP 4: Final Read-Only Audit ──────────────────────────────────────
async function finalAudit() {
  console.log("=== FINAL AUDIT: Full newestReleaseData ===\n");
  const doc = await client.fetch(
    `*[_id == $id][0].newestReleaseData`,
    { id: TARGET_ID }
  );
  console.log(JSON.stringify(doc, null, 2));
  console.log("\n=== ALL STEPS COMPLETE ===");
}

// ─── ORCHESTRATION ──────────────────────────────────────────────────────
async function main() {
  await dryRun();

  await patchField(
    "newestReleaseData.promoTitle",
    "Mastering-Grade Precision.",
    "STEP 1: Headline (promoTitle)"
  );

  await patchField(
    "newestReleaseData.promoSubtitle",
    "Reference-grade conversion, engineered in Switzerland.",
    "STEP 2: Sub-headline (promoSubtitle)"
  );

  await patchField(
    "newestReleaseData.promoText",
    "Weiss Engineering has set the standard for professional mastering for decades. The DAC204 brings that same precision to the home environment — bit-perfect conversion, no compromise.",
    "STEP 3: Body Intro (promoText)"
  );

  await finalAudit();
}

main().catch((err) => {
  console.error("[FATAL]", err);
  process.exit(1);
});
