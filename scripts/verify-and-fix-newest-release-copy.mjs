#!/usr/bin/env node

/**
 * Diagnoses + fixes the "script succeeded but site still shows old copy" issue.
 * Root cause candidates:
 *   1. Draft vs published: default client perspective is "raw", so a previous
 *      script run may have patched drafts.<id> instead of the published doc
 *      that the site's read client (perspective:"published") actually serves.
 *   2. Sanity CDN cache lag (site read client uses useCdn:true).
 *
 * This script explicitly targets the PUBLISHED document only, reports whether
 * a stray draft exists (so you know to discard/publish it in Studio), and
 * re-applies the promo copy + product name fix directly to the published doc.
 *
 * Usage: node scripts/verify-and-fix-newest-release-copy.mjs
 */

import { createClient } from "next-sanity";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_STUDIO_PROJECT_ID;
const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET ||
  process.env.SANITY_STUDIO_DATASET ||
  (process.env.NODE_ENV === "test" ? "test" : "production");
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-11-14";

// Write client — force published perspective + no CDN so we see/write live data.
const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  perspective: "published",
  token: process.env.SANITY_STUDIO_READ_WRITE,
});

// Separate raw client just to detect stray drafts (diagnostic only).
const rawClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  perspective: "raw",
  token: process.env.SANITY_STUDIO_READ_WRITE,
});

async function main() {
  try {
    console.log(`Project: ${projectId}  Dataset: ${dataset}\n`);

    // 1. Find the PUBLISHED homepageData doc explicitly (exclude drafts.**).
    const published = await client.fetch(
      `*[_type == "homepageData" && !(_id in path("drafts.**"))][0]{
        _id,
        "promoTitle": newestReleaseData.promoTitle,
        "promoSubtitle": newestReleaseData.promoSubtitle,
        "productId": newestReleaseData.productRef->_id,
        "productName": newestReleaseData.productRef->name,
        "brandName": newestReleaseData.productRef->brand->name
      }`
    );

    if (!published) throw new Error("No PUBLISHED homepageData document found!");

    console.log("PUBLISHED doc currently reads:");
    console.log("  _id:          ", published._id);
    console.log("  promoTitle:   ", published.promoTitle);
    console.log("  promoSubtitle:", published.promoSubtitle);
    console.log("  product name: ", published.productName, "(brand:", published.brandName + ")");

    // 2. Check for a stray draft of the same doc (diagnostic).
    const draftId = "drafts." + published._id;
    const draft = await rawClient.fetch(`*[_id == $draftId][0]{_id, "promoTitle": newestReleaseData.promoTitle}`, { draftId });
    if (draft) {
      console.log("\n⚠ A DRAFT of this document exists:", draft._id);
      console.log("  draft promoTitle:", draft.promoTitle);
      console.log("  This is likely where the previous run's patch landed. It will NOT show on the live site until published in Studio (or discarded).");
    } else {
      console.log("\nNo draft found for this document — clean.");
    }

    // 3. Re-apply the fix directly to the PUBLISHED doc.
    await client
      .patch(published._id)
      .set({
        "newestReleaseData.promoTitle": "Converted Without Compromise",
        "newestReleaseData.promoSubtitle":
          "Studio-trusted D/A conversion, sized for your desk.",
      })
      .commit();
    console.log("\nRe-applied promo copy directly to PUBLISHED doc.");

    if (published.productId && published.productName?.startsWith(published.brandName + " ")) {
      const fixedName = published.productName.slice(published.brandName.length + 1);
      await client.patch(published.productId).set({ name: fixedName }).commit();
      console.log(`Fixed product name: "${published.productName}" -> "${fixedName}"`);
    }

    // 4. Verify against the PUBLISHED perspective again.
    const after = await client.fetch(
      `*[_type == "homepageData" && !(_id in path("drafts.**"))][0]{
        "promoTitle": newestReleaseData.promoTitle,
        "promoSubtitle": newestReleaseData.promoSubtitle,
        "productName": newestReleaseData.productRef->name
      }`
    );
    console.log("\nAFTER (published, what the live site reads):");
    console.log(JSON.stringify(after, null, 2));
    console.log("\nSUCCESS — if this still doesn't show in npm run dev, hard-refresh (site read client uses useCdn:true, can lag a few seconds).");
  } catch (error) {
    console.error("ERROR:", error.message || error);
    if (error.statusCode) console.error("Status:", error.statusCode);
    if (error.details?.description) console.error("Details:", error.details.description);
    process.exit(1);
  }
}

main();
