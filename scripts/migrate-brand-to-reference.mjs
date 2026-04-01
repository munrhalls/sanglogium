/**
 * Migration Script: String Brand → Brand Reference
 * 
 * This script:
 * 1. Extracts unique brand names from existing products
 * 2. Creates brand documents for each unique name
 * 3. Updates products to reference the new brand documents
 * 
 * Run: node scripts/migrate-brand-to-reference.mjs [--dry-run]
 */

import { createClient } from "@sanity/client";
import dotenv from "dotenv";

// Load environment variables
if (process.env.NODE_ENV === "production") {
  dotenv.config({ path: ".env.production" });
} else {
  dotenv.config({ path: ".env.local" });
}

const dryRun = process.argv.includes("--dry-run");

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_TOKEN, // Need write token
  apiVersion: "2023-05-03",
  useCdn: false,
});

async function migrateBrandToReference() {
  console.log(`${dryRun ? "[DRY RUN] " : ""}Starting brand migration...\n`);

  try {
    // Step 1: Get all products with string brand values
    console.log("Step 1: Fetching products with string brand values...");
    const products = await client.fetch(`*[_type == "product" && defined(brand) && brand != ""]{ _id, brand }`);
    console.log(`  Found ${products.length} products with brand values\n`);

    if (products.length === 0) {
      console.log("No products with string brand values found. Migration not needed.");
      return;
    }

    // Step 2: Extract unique brand names
    console.log("Step 2: Extracting unique brand names...");
    const uniqueBrands = [...new Set(products.map(p => p.brand))];
    console.log(`  Found ${uniqueBrands.length} unique brands:`);
    uniqueBrands.forEach(brand => console.log(`    - ${brand}`));
    console.log();

    // Step 3: Check if brand documents already exist
    console.log("Step 3: Checking for existing brand documents...");
    const existingBrands = await client.fetch(`*[_type == "brand"]{ _id, name }`);
    const existingBrandNames = new Set(existingBrands.map(b => b.name.toLowerCase()));
    console.log(`  Found ${existingBrands.length} existing brand documents\n`);

    // Step 4: Create brand documents for new brands
    console.log("Step 4: Creating brand documents...");
    const brandIdMap = new Map(); // Maps brand name to document ID

    // Add existing brands to map
    for (const brand of existingBrands) {
      brandIdMap.set(brand.name.toLowerCase(), brand._id);
    }

    for (const brandName of uniqueBrands) {
      const brandKey = brandName.toLowerCase();
      
      if (existingBrandNames.has(brandKey)) {
        console.log(`  [SKIP] Brand "${brandName}" already exists`);
        continue;
      }

      const brandDoc = {
        _type: "brand",
        name: brandName,
        slug: {
          current: brandName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
        },
      };

      if (dryRun) {
        console.log(`  [DRY RUN] Would create brand: "${brandName}"`);
        brandIdMap.set(brandKey, `brand-${brandKey}-dry-run`);
      } else {
        const result = await client.create(brandDoc);
        console.log(`  [CREATED] Brand "${brandName}" -> ${result._id}`);
        brandIdMap.set(brandKey, result._id);
      }
    }
    console.log();

    // Step 5: Update products with brand references
    console.log("Step 5: Updating products with brand references...");
    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const product of products) {
      const brandKey = product.brand.toLowerCase();
      const brandRef = brandIdMap.get(brandKey);

      if (!brandRef) {
        console.log(`  [SKIP] No brand reference found for "${product.brand}" on product ${product._id}`);
        skippedCount++;
        continue;
      }

      if (dryRun) {
        console.log(`  [DRY RUN] Would update product ${product._id} with brand reference ${brandRef}`);
        updatedCount++;
      } else {
        try {
          await client
            .patch(product._id)
            .set({
              brand: {
                _type: "reference",
                _ref: brandRef,
              },
            })
            .commit();
          console.log(`  [UPDATED] Product ${product._id} -> brand ${product.brand}`);
          updatedCount++;
        } catch (error) {
          console.error(`  [ERROR] Failed to update product ${product._id}:`, error.message);
          errorCount++;
        }
      }
    }

    console.log(`\n${dryRun ? "[DRY RUN] " : ""}Migration Summary:`);
    console.log(`  Products to update: ${products.length}`);
    console.log(`  Successfully updated: ${updatedCount}`);
    console.log(`  Skipped: ${skippedCount}`);
    console.log(`  Errors: ${errorCount}`);

    if (dryRun) {
      console.log("\n[DRY RUN] No changes were made. Remove --dry-run to execute.");
    }

  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrateBrandToReference();
