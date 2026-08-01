#!/usr/bin/env node

/**
 * Bulk update script for homepage accessories
 * Queries products by catalogueLocationKeys and updates homepageData with references
 * Usage: node scripts/update-homepage-accessories.mjs
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
    console.log("🔍 Fetching all accessory products by catalogue ID...\n");

    // Catalogue IDs from catalogue-index.json (not string paths)
    const CABLES_ID = "vnrj2n32p172vcje1tt3s4ls";
    const EARPADS_ID = "j2yu4yvtje69j6gie4spxutu";
    const STORAGE_ID = "j8ls622l90d6m4xetlajua4y";

    // Query all cables (by ID, not string path)
    const cables = await client.fetch(
      `*[_type == "product" && "${CABLES_ID}" in catalogueLocationKeys[]] { _id, name }`
    );

    // Query all earpads (by ID, not string path)
    const earpads = await client.fetch(
      `*[_type == "product" && "${EARPADS_ID}" in catalogueLocationKeys[]] { _id, name }`
    );

    // Query all storage (by ID, not string path)
    const storage = await client.fetch(
      `*[_type == "product" && "${STORAGE_ID}" in catalogueLocationKeys[]] { _id, name }`
    );

    console.log(`✓ Found ${cables.length} cables`);
    console.log(`✓ Found ${earpads.length} earpads`);
    console.log(`✓ Found ${storage.length} storage items\n`);

    // Get current homepageData
    const homepageData = await client.fetch(`*[_type == "homepageData"][0] { _id, _rev }`);

    if (!homepageData) {
      throw new Error("homepageData document not found!");
    }

    console.log("\n📝 Updating homepageData document...");

    // Create refs array
    const cableRefs = cables.map((c) => ({ _ref: c._id, _type: "reference" }));
    const earpadRefs = earpads.map((e) => ({ _ref: e._id, _type: "reference" }));
    const storageRefs = storage.map((s) => ({ _ref: s._id, _type: "reference" }));

    // Update document
    const result = await client
      .patch(homepageData._id)
      .set({
        accessoriesCables: cableRefs,
        accessoriesEarpads: earpadRefs,
        accessoriesStorage: storageRefs,
      })
      .commit();

    console.log("✅ SUCCESS!\n");
    console.log(`Updated homepageData (_id: ${result._id})`);
    console.log(`   Cables:  ${cableRefs.length} products`);
    console.log(`   Earpads: ${earpadRefs.length} products`);
    console.log(`   Storage: ${storageRefs.length} products`);
    console.log(
      `\nTotal: ${cableRefs.length + earpadRefs.length + storageRefs.length} products`
    );
  } catch (error) {
    console.error("❌ ERROR:", error.message || error);
    if (error.statusCode) {
      console.error(`Status: ${error.statusCode}`);
    }
    if (error.details?.description) {
      console.error("Details:", error.details.description);
    }
    process.exit(1);
  }
}

main();
