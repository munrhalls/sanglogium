/**
 * Migration Script: String Brand → Brand Reference
 * Uses SANITY_STUDIO_READ_WRITE_CREATE token for write permissions
 */

import { createClient } from "@sanity/client";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const dryRun = process.argv.includes("--dry-run");

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_STUDIO_READ_WRITE_CREATE,
  apiVersion: "2023-05-03",
  useCdn: false,
});

async function migrateBrandToReference() {
  console.log(`${dryRun ? "[DRY RUN] " : ""}Starting brand migration...\n`);

  try {
    const products = await client.fetch(`*[_type == "product" && defined(brand) && brand != ""]{ _id, brand }`);
    console.log(`Found ${products.length} products with string brand values\n`);

    if (products.length === 0) {
      console.log("No products with string brand values found. Migration not needed.");
      return;
    }

    const uniqueBrands = [...new Set(products.map(p => p.brand))];
    console.log(`Found ${uniqueBrands.length} unique brands`);

    const existingBrands = await client.fetch(`*[_type == "brand"]{ _id, name }`);
    const existingBrandNames = new Set(existingBrands.map(b => b.name.toLowerCase()));
    console.log(`Found ${existingBrands.length} existing brand documents\n`);

    const brandIdMap = new Map();
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
          console.log(`  [UPDATED] Product ${product._id.slice(-8)} -> brand "${product.brand}"`);
          updatedCount++;
        } catch (error) {
          console.error(`  [ERROR] Failed to update product ${product._id}:`, error.message);
          errorCount++;
        }
      }
    }

    console.log(`\nMigration Summary:`);
    console.log(`  Products to update: ${products.length}`);
    console.log(`  Successfully updated: ${updatedCount}`);
    console.log(`  Skipped: ${skippedCount}`);
    console.log(`  Errors: ${errorCount}`);

  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrateBrandToReference();
