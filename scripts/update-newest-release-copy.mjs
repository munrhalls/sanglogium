#!/usr/bin/env node

/**
 * Updates NewestRelease promo copy + fixes duplicated "Weiss Weiss" product name.
 * Usage: node scripts/update-newest-release-copy.mjs
 */

import { createClient } from "next-sanity";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const client = createClient({
  projectId:
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
    process.env.SANITY_STUDIO_PROJECT_ID,
  dataset:
    process.env.NEXT_PUBLIC_SANITY_DATASET ||
    process.env.SANITY_STUDIO_DATASET ||
    (process.env.NODE_ENV === "test" ? "test" : "production"),
  apiVersion:
    process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-11-14",
  useCdn: false,
  token: process.env.SANITY_STUDIO_READ_WRITE,
});

async function main() {
  try {
    console.log("Fetching homepageData.newestReleaseData...\n");

    const doc = await client.fetch(
      `*[_type == "homepageData"][0]{
        _id,
        "promoTitle": newestReleaseData.promoTitle,
        "promoSubtitle": newestReleaseData.promoSubtitle,
        "productId": newestReleaseData.productRef->_id,
        "productName": newestReleaseData.productRef->name,
        "brandName": newestReleaseData.productRef->brand->name
      }`
    );

    if (!doc) throw new Error("homepageData document not found!");

    console.log("BEFORE:");
    console.log("  promoTitle:   ", doc.promoTitle);
    console.log("  promoSubtitle:", doc.promoSubtitle);
    console.log("  product name: ", doc.productName, "(brand:", doc.brandName + ")");
    console.log("");

    // 1. Update promo copy on homepageData
    await client
      .patch(doc._id)
      .set({
        "newestReleaseData.promoTitle": "Converted Without Compromise",
        "newestReleaseData.promoSubtitle":
          "Studio-trusted D/A conversion, sized for your desk.",
      })
      .commit();
    console.log("Updated homepageData promo copy.");

    // 2. Fix duplicated brand name in product name ("Weiss Weiss DAC204..." -> "DAC204...")
    if (doc.productId && doc.productName?.startsWith(doc.brandName + " ")) {
      const fixedName = doc.productName.slice(doc.brandName.length + 1);
      await client.patch(doc.productId).set({ name: fixedName }).commit();
      console.log(`Fixed product name: "${doc.productName}" -> "${fixedName}"`);
    } else {
      console.log("Product name did not match expected duplication pattern; left untouched.");
    }

    // Verify
    const after = await client.fetch(
      `*[_type == "homepageData"][0]{
        "promoTitle": newestReleaseData.promoTitle,
        "promoSubtitle": newestReleaseData.promoSubtitle,
        "productName": newestReleaseData.productRef->name,
        "brandName": newestReleaseData.productRef->brand->name
      }`
    );
    console.log("\nAFTER:");
    console.log("  promoTitle:   ", after.promoTitle);
    console.log("  promoSubtitle:", after.promoSubtitle);
    console.log("  product name: ", after.productName, "(brand:", after.brandName + ")");
    console.log("\nSUCCESS");
  } catch (error) {
    console.error("ERROR:", error.message || error);
    if (error.statusCode) console.error("Status:", error.statusCode);
    if (error.details?.description) console.error("Details:", error.details.description);
    process.exit(1);
  }
}

main();
