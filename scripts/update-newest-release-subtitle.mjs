#!/usr/bin/env node

/**
 * One-off: shorten newestReleaseData.promoSubtitle on the PUBLISHED homepageData doc.
 * Usage: node scripts/update-newest-release-subtitle.mjs
 */

import { createClient } from "next-sanity";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_STUDIO_PROJECT_ID,
  dataset:
    process.env.NEXT_PUBLIC_SANITY_DATASET ||
    process.env.SANITY_STUDIO_DATASET ||
    (process.env.NODE_ENV === "test" ? "test" : "production"),
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-11-14",
  useCdn: false,
  perspective: "published",
  token: process.env.SANITY_STUDIO_READ_WRITE,
});

async function main() {
  try {
    const doc = await client.fetch(
      `*[_type == "homepageData" && !(_id in path("drafts.**"))][0]{_id, "promoSubtitle": newestReleaseData.promoSubtitle}`
    );
    if (!doc) throw new Error("Published homepageData doc not found!");

    console.log("BEFORE:", doc.promoSubtitle);

    await client
      .patch(doc._id)
      .set({ "newestReleaseData.promoSubtitle": "Studio-trusted D/A conversion" })
      .commit();

    const after = await client.fetch(
      `*[_type == "homepageData" && !(_id in path("drafts.**"))][0]{"promoSubtitle": newestReleaseData.promoSubtitle}`
    );
    console.log("AFTER: ", after.promoSubtitle);
    console.log("SUCCESS");
  } catch (error) {
    console.error("ERROR:", error.message || error);
    process.exit(1);
  }
}

main();
